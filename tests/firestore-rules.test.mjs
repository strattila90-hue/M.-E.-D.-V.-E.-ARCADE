// Firestore rules regression test. Run against the local emulator:
//   firebase emulators:start --only firestore --project demo-medve  (with firestore.rules configured)
//   node tests/firestore-rules.test.mjs
// A szerveridő-ellenőrzéseket (hónap, időbélyegek, befizetés-növekedés) is teszteli: a telefon órája nem számít.
const BASE = process.env.EMU || 'http://127.0.0.1:8080';
const P = 'demo-medve';
const DOCS = `${BASE}/v1/projects/${P}/databases/(default)/documents`;
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const userTok = uid => 'Bearer ' + `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: uid, user_id: uid, email: `${uid}@medve.invalid`, aud: P, iss: `https://securetoken.google.com/${P}`, iat: 1, exp: 9999999999 })}.`;
const ADMIN = 'Bearer owner';
const val = v => v instanceof Date ? { timestampValue: v.toISOString() } : typeof v === 'string' ? { stringValue: v } : Number.isInteger(v) && Math.abs(v) < 9e15 ? { integerValue: String(v) } : typeof v === 'number' ? { doubleValue: v } : typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(val) } } : v && typeof v === 'object' ? { mapValue: { fields: fields(v) } } : v;
const fields = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, val(v)]));
// írás a commit végponton: így szerveridő (REQUEST_TIME) is küldhető, mint az appban a serverTimestamp()
async function write(path, auth, data, { srvTs = [], del = [], create = false } = {}) {
  const w = { update: { name: `projects/${P}/databases/(default)/documents/${path}`, fields: fields(data) } };
  if (!create) w.updateMask = { fieldPaths: [...Object.keys(data), ...del] };
  if (srvTs.length) w.updateTransforms = srvTs.map(f => ({ fieldPath: f, setToServerValue: 'REQUEST_TIME' }));
  if (create) w.currentDocument = { exists: false };
  const r = await fetch(`${DOCS}:commit`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: auth }, body: JSON.stringify({ writes: [w] }) });
  return r.status;
}
const budMonth = t => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit' }).formatToParts(new Date(t)).map(x => [x.type, x.value])); return p.year + '-' + p.month; };
let fails = 0;
const expect = (name, got, want) => { const ok = (got < 300) === want; if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + ' -> ' + got); };
(async () => {
  const uid = 'u' + Date.now(), U = userTok(uid), doc = 'users/' + uid, now = Date.now(), cur = budMonth(now);
  expect('create profile', await write(doc, U, { name: 'Tesztelo', rank: 'Közlegény', nick: uid, createdAt: now }), true);
  // admin injects a legacy/bad value that the app itself never writes
  expect('admin seeds legacy bad harcN=1.5 (double)', await write(doc, ADMIN, { harcN: 1.5 }), true);
  // Tüzér Kassza: első szinkron szerveridővel
  expect('kassza first sync (server month, server tkSt)', await write(doc, U, { tkFt: 1000, tkUteg: '1. üteg', tkWk: cur, tkWg: 1000, tkAt: now }, { srvTs: ['tkSt'] }), true);
  expect('kassza sync again, higher tkFt', await write(doc, U, { tkFt: 2000, tkWk: cur, tkWg: 2000, tkAt: Date.now() }, { srvTs: ['tkSt'] }), true);
  expect('reject tkFt change without server tkSt', await write(doc, U, { tkFt: 3000, tkAt: Date.now() }), false);
  expect('reject client-chosen tkSt (fake clock)', await write(doc, U, { tkFt: 3000, tkSt: new Date(now - 864e5 * 30) }), false);
  expect('reject absurd jump (+1e15 in seconds)', await write(doc, U, { tkFt: 1e15, tkAt: Date.now() }, { srvTs: ['tkSt'] }), false);
  expect('accept plausible jump (+5e8 within rate)', await write(doc, U, { tkFt: 5e8, tkAt: Date.now() }, { srvTs: ['tkSt'] }), true);
  expect('reject tkFt decrease', await write(doc, U, { tkFt: 3 }, { srvTs: ['tkSt'] }), false);
  expect('reject deleting tkSt', await write(doc, U, {}, { del: ['tkSt'] }), false);
  // hónap: csak a szerver szerinti aktuális hónap
  expect('reject future month (phone calendar moved ahead)', await write(doc, U, { tkWk: '2099-01', tkWg: 0 }), false);
  expect('reject past month', await write(doc, U, { tkWk: '2020-01', tkWg: 0 }), false);
  expect('reject tkWg growing more than tkFt in the same write', await write(doc, U, { tkFt: 5e8 + 10, tkWg: 1e8, tkWk: cur, tkAt: Date.now() }, { srvTs: ['tkSt'] }), false);
  expect('reject tkWg decrease in same month', await write(doc, U, { tkWg: 1 }), false);
  // időbélyegek: nem lehetnek a szerver szerinti jövőben
  expect('reject tkAt in the future (+1 day)', await write(doc, U, { tkAt: now + 864e5 }), false);
  expect('reject harcAt in the future (+1 day)', await write(doc, U, { harcBest: 400, harcAt: now + 864e5 }), false);
  expect('reject invalid tkUteg', await write(doc, U, { tkUteg: 'Hacker' }), false);
  expect('reject non-whitelisted field (role)', await write(doc, U, { role: 'admin' }), false);
  expect('reject harcBest=0', await write(doc, U, { harcBest: 0 }), false);
  expect('reject harcBest over bound (200000)', await write(doc, U, { harcBest: 200000 }), false);
  expect('accept harcBest=500 with server-correct harcAt', await write(doc, U, { harcBest: 500, harcAt: Date.now() }), true);
  expect('reject harcN +2 jump', await write(doc, U, { harcN: 3 }), false);
  expect('reject harcN int after legacy double', await write(doc, U, { harcN: 1 }), false);
  // új játékos: az első befizetés sem lehet kitalált óriásszám
  const uid2 = 'v' + Date.now(), U2 = userTok(uid2);
  await write('users/' + uid2, U2, { name: 'Uj', rank: '', nick: uid2, createdAt: now });
  expect('reject new player first sync 1e14', await write('users/' + uid2, U2, { tkFt: 1e14, tkUteg: '2. üteg', tkWk: cur, tkWg: 1e14, tkAt: now }, { srvTs: ['tkSt'] }), false);
  expect('reject createdAt in the future', await write('users/w' + now, userTok('w' + now), { name: 'Jovo', rank: '', nick: 'w' + now, createdAt: now + 864e5 * 30 }), false);
  // havi lezárás (tkRes): csak elmúlt hónap, csak a szerveren álló összeg
  expect('reject archiving the current month', await write(`tkRes/${cur}_${uid}`, U, { m: cur, uid, name: 'Tesztelo', uteg: '1. üteg', g: 10, ts: now }, { create: true }), false);
  expect('admin seeds past-month standing', await write(doc, ADMIN, { tkWk: '2026-01', tkWg: 500 }), true);
  expect('reject archiving more than the server standing', await write(`tkRes/2026-01_${uid}`, U, { m: '2026-01', uid, name: 'Tesztelo', uteg: '1. üteg', g: 1e9, ts: now }, { create: true }), false);
  expect('accept archiving the real past-month standing', await write(`tkRes/2026-01_${uid}`, U, { m: '2026-01', uid, name: 'Tesztelo', uteg: '1. üteg', g: 500, ts: now }, { create: true }), true);
  // admin nullázás: amíg a fiók nem nyugtázta (lbSeen), nem tölthet fel semmit – a telefon régi állása nem jöhet vissza
  const R = Date.now();
  expect('admin resets season (lbReset, tkFt deleted)', await write(doc, ADMIN, { lbReset: R }, { del: ['tkFt', 'tkSt', 'tkWk', 'tkWg'] }), true);
  expect('reject re-upload before acknowledging reset', await write(doc, U, { harcBest: 900, harcAt: Date.now() }), false);
  expect('reject wrong acknowledgement', await write(doc, U, { lbSeen: R - 1 }), false);
  expect('accept acknowledgement (lbSeen = lbReset)', await write(doc, U, { lbSeen: R }), true);
  expect('reject huge stale Kassza total after reset (1.29e18)', await write(doc, U, { tkFt: 1.29e18, tkWk: cur, tkWg: 1.29e18, tkAt: Date.now() }, { srvTs: ['tkSt'] }), false);
  expect('accept fresh small Kassza total after reset', await write(doc, U, { tkFt: 500, tkWk: cur, tkWg: 500, tkAt: Date.now() }, { srvTs: ['tkSt'] }), true);
  // KAS-9086: teljesen kitöltött (régi) fióknál a szabály túllépte a Firestore 1000 kifejezéses korlátját, és minden mentést elutasított
  const uid3 = 'f' + Date.now(), U3 = userTok(uid3), doc3 = 'users/' + uid3, t0 = Date.now() - 864e5;
  await write(doc3, U3, { name: 'Teli', rank: 'Közlegény', nick: uid3, createdAt: t0 }, { create: true });
  expect('admin seeds a fully populated profile', await write(doc3, ADMIN, { harcBest: 50, harcAt: t0, droneBest: 500, droneAt: t0, gtBest: 30000, gtBestAt: t0, gkBest: 100, gkBestAt: t0, rkBest: 20, rkBestAt: t0, rkhBest: 1000, rkhBestAt: t0, sereBest: 100, sereBestAt: t0, harcN: 3, droneN: 3, gtN: 3, gkN: 3, rkN: 3, sereN: 3, tkN: 5, tkGive: 100, tkOwn: { a: 1 }, lastPlay: t0, tkFt: 9125, tkWk: cur, tkWg: 9125, tkUteg: '1. üteg', tkAt: Date.now() - 5e4 + 0.75, tkSt: new Date(Date.now() - 5e4), tkOwnF: {}, lbReset: 7, lbSeen: 7 }), true);
  expect('full profile: Kassza sync (KAS-9086 payload)', await write(doc3, U3, { tkFt: 16757, tkUteg: '1. üteg', tkOwnF: {}, tkWk: cur, tkWg: 16757, tkAt: Date.now() + 0.75 }, { srvTs: ['tkSt'] }), true);
  expect('full profile: single high score', await write(doc3, U3, { harcBest: 60, harcAt: Date.now() }), true);
  expect('full profile: play counter + lastPlay', await write(doc3, U3, { harcN: 4, lastPlay: Date.now() }), true);
  const t1 = Date.now();
  expect('full profile: all 7 records at once (record sync)', await write(doc3, U3, { harcBest: 70, harcAt: t1, droneBest: 600, droneAt: t1, gtBest: 20000, gtBestAt: t1, gkBest: 200, gkBestAt: t1, rkBest: 30, rkBestAt: t1, rkhBest: 2000, rkhBestAt: t1, sereBest: 200, sereBestAt: t1 }), true);
  expect('full profile: rank change', await write(doc3, U3, { rank: 'Őrvezető' }), true);
  expect('full profile: still rejects a lower record', await write(doc3, U3, { harcBest: 10, harcAt: Date.now() }), false);
  expect('full profile: still rejects absurd Kassza jump', await write(doc3, U3, { tkFt: 1e15, tkWk: cur, tkWg: 1e15, tkAt: Date.now() }, { srvTs: ['tkSt'] }), false);
  // új Kassza-játékos: ütegválasztás befizetés előtt (tkFt: 0) – az app ilyenkor is küldi a szerveridőt (tkSt), különben elutasítás
  const uid4 = 'n' + Date.now(), U4 = userTok(uid4), doc4 = 'users/' + uid4;
  await write(doc4, U4, { name: 'Ujonc', rank: '', nick: uid4, createdAt: Date.now() }, { create: true });
  expect('new player: play counter', await write(doc4, U4, { tkN: 1, lastPlay: Date.now() }), true);
  expect('new player: first Kassza sync with tkFt 0 and server tkSt', await write(doc4, U4, { tkFt: 0, tkUteg: '1. üteg', tkOwnF: {}, tkWk: cur, tkWg: 0, tkAt: Date.now() }, { srvTs: ['tkSt'] }), true);
  expect('new player: later deposit', await write(doc4, U4, { tkFt: 5000, tkWk: cur, tkWg: 5000, tkAt: Date.now() }, { srvTs: ['tkSt'] }), true);
  // Összes pénzem (zseton): csökkenés bármikor, növekedés csak szerveridővel arányosan
  expect('zseton: first upload ≤ 500 with server zsSt', await write(doc4, U4, { zs: 400 }, { srvTs: ['zsSt'] }), true);
  expect('zseton: reject without server zsSt', await write(doc4, U4, { zs: 390 }), false);
  expect('zseton: spend (decrease) always ok', await write(doc4, U4, { zs: 380 }, { srvTs: ['zsSt'] }), true);
  expect('zseton: small increase (+25) right away ok', await write(doc4, U4, { zs: 405 }, { srvTs: ['zsSt'] }), true);
  expect('zseton: reject big jump (+5000)', await write(doc4, U4, { zs: 5405 }, { srvTs: ['zsSt'] }), false);
  expect('zseton: reject negative', await write(doc4, U4, { zs: -1 }, { srvTs: ['zsSt'] }), false);
  expect('zseton: reject fraction', await write(doc4, U4, { zs: 10.5 }, { srvTs: ['zsSt'] }), false);
  expect('zseton: reject deleting zs', await write(doc4, U4, {}, { del: ['zs'], srvTs: ['zsSt'] }), false);
  const doc5 = 'users/' + uid + 'z', U5 = userTok(uid + 'z');
  expect('zseton: new profile', await write(doc5, U5, { name: 'Zs', rank: 'Közlegény', nick: uid + 'z', createdAt: Date.now() }), true);
  expect('zseton: reject first upload > 500', await write(doc5, U5, { zs: 900 }, { srvTs: ['zsSt'] }), false);
  // Terep-szellem: csak a saját, csak a fiókban rögzített rekordidővel, korlátozott mérettel
  const gh = Array.from({ length: 30 }, (_, i) => i * 10);
  expect('ghost: own, ms == gtBest', await write('gtGhost/' + uid3, U3, { v: 1, ms: 20000, d: gh, name: 'Teszt', ts: Date.now() }), true);
  expect('ghost: reject faster than recorded best', await write('gtGhost/' + uid3, U3, { v: 1, ms: 15000, d: gh, name: 'Teszt', ts: Date.now() }), false);
  expect('ghost: reject writing someone else\'s ghost', await write('gtGhost/' + uid3, U4, { v: 1, ms: 20000, d: gh, name: 'Teszt', ts: Date.now() }), false);
  expect('ghost: reject without a recorded best', await write('gtGhost/' + uid4, U4, { v: 1, ms: 20000, d: gh, name: 'Ujonc', ts: Date.now() }), false);
  expect('ghost: reject extra field', await write('gtGhost/' + uid3, U3, { v: 1, ms: 20000, d: gh, name: 'Teszt', ts: Date.now(), x: 1 }), false);
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(1); });
