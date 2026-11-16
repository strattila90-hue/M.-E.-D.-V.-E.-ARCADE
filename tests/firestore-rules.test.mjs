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
const val = v => v instanceof Date ? { timestampValue: v.toISOString() } : typeof v === 'string' ? { stringValue: v } : Number.isInteger(v) && Math.abs(v) < 9e15 ? { integerValue: String(v) } : typeof v === 'number' ? { doubleValue: v } : typeof v === 'boolean' ? { booleanValue: v } : v;
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
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(1); });
