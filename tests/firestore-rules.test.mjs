// Firestore rules regression test. Run against the local emulator:
//   firebase emulators:start --only firestore --project demo-medve  (with firestore.rules configured)
//   node tests/firestore-rules.test.mjs
const BASE = process.env.EMU || 'http://127.0.0.1:8080';
const P = 'demo-medve';
const docUrl = (uid, mask = []) => `${BASE}/v1/projects/${P}/databases/(default)/documents/users/${uid}` + (mask.length ? '?' + mask.map(m => 'updateMask.fieldPaths=' + m).join('&') : '');
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const userTok = uid => `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: uid, user_id: uid, email: `${uid}@medve.invalid`, aud: P, iss: `https://securetoken.google.com/${P}`, iat: 1, exp: 9999999999 })}.`;
const ADMIN = 'Bearer owner';
const val = v => typeof v === 'string' ? { stringValue: v } : Number.isInteger(v) ? { integerValue: String(v) } : typeof v === 'number' ? { doubleValue: v } : typeof v === 'boolean' ? { booleanValue: v } : v;
const fields = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, val(v)]));
async function write(uid, auth, data, mask) {
  const r = await fetch(docUrl(uid, mask ? Object.keys(data) : []), { method: 'PATCH', headers: { 'content-type': 'application/json', authorization: auth }, body: JSON.stringify({ fields: fields(data) }) });
  return r.status;
}
let fails = 0;
const expect = (name, got, want) => { const ok = (got < 300) === want; if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + ' -> ' + got); };
(async () => {
  const uid = 'u' + Date.now();
  // setup: user creates own profile (allowed by create rule)
  expect('create profile', await (async () => { const r = await fetch(docUrl(uid), { method: 'PATCH', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + userTok(uid) }, body: JSON.stringify({ fields: fields({ name: 'Tesztelo', rank: 'Közlegény', nick: uid, createdAt: 1 }) }) }); return r.status; })(), true);
  // admin injects a legacy/bad value that the app itself never writes
  expect('admin seeds legacy bad harcN=1.5 (double)', await write(uid, ADMIN, { harcN: 1.5 }, true), true);
  const U = 'Bearer ' + userTok(uid);
  // THE REPORTED CASE: Kassza sync writes only tk* fields, while legacy field is present
  expect('kassza sync tkFt/tkUteg/tkWk/tkWg/tkAt (legacy field present)', await write(uid, U, { tkFt: 10, tkUteg: '1. üteg', tkWk: '2026-W45', tkWg: 5, tkAt: 1700000000000 }, true), true);
  expect('kassza sync again, higher tkFt', await write(uid, U, { tkFt: 20 }, true), true);
  // negatives: must still be rejected
  expect('reject tkFt decrease', await write(uid, U, { tkFt: 3 }, true), false);
  expect('reject invalid tkUteg', await write(uid, U, { tkUteg: 'Hacker' }, true), false);
  expect('reject tkWg decrease in same week', await write(uid, U, { tkWg: 1 }, true), false);
  expect('reject non-whitelisted field (role)', await write(uid, U, { role: 'admin' }, true), false);
  expect('reject harcBest=0', await write(uid, U, { harcBest: 0 }, true), false);
  expect('reject harcBest over bound (200000)', await write(uid, U, { harcBest: 200000 }, true), false);
  expect('accept harcBest=500', await write(uid, U, { harcBest: 500 }, true), true);
  expect('reject harcN +2 jump', await write(uid, U, { harcN: 3 }, true), false);
  expect('accept harcN +1 (from legacy 1.5 => 1? must be int; expect reject because prev is double)', await write(uid, U, { harcN: 1 }, true), false);
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERR', e); process.exit(1); });
