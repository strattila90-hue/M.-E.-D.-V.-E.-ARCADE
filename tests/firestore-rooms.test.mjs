// Shot&Run room rules test. Run against the local emulator (see firestore-rules.test.mjs):
//   node tests/firestore-rooms.test.mjs
const BASE='http://127.0.0.1:8080',P='demo-medve';
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const tok=uid=>'Bearer '+`${b64({alg:'none',typ:'JWT'})}.${b64({sub:uid,user_id:uid,email:`${uid}@medve.invalid`,aud:P,iss:`https://securetoken.google.com/${P}`,iat:1,exp:9999999999})}.`;
const val=v=>v===null?{nullValue:null}:typeof v==='string'?{stringValue:v}:Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};
const F=o=>({fields:Object.fromEntries(Object.entries(o).map(([k,v])=>[k,val(v)]))});
const url=(code,mask)=>`${BASE}/v1/projects/${P}/databases/(default)/documents/srRooms/${code}`+(mask?'?'+mask.map(m=>'updateMask.fieldPaths='+m).join('&'):'');
const req=async(m,u,auth,body)=>(await fetch(u,{method:m,headers:{'content-type':'application/json',authorization:auth},body:body&&JSON.stringify(body)})).status;
let fails=0;const ex=(n,got,want)=>{const ok=(got<300)===want;if(!ok)fails++;console.log((ok?'PASS ':'FAIL ')+n+' -> '+got)};
const A=tok('alice'),B=tok('bob'),C=tok('carl'),c='AB'+String(Date.now()).slice(-3),now=Date.now();
const room={host:'alice',hostName:'Alice',guest:null,guestName:'',seed:12345,ev:'',ts:now};
ex('unauth read denied',await req('GET',url(c),''),false);
ex('host creates room',await req('PATCH',url(c),A,F(room)),true);
ex('create with foreign host denied',await req('PATCH',url('ZZ999'),B,F(room)),false);
ex('create with bad code denied',await req('PATCH',url('ab-1'),A,F(room)),false);
ex('guest reads room',await req('GET',url(c),B),true);
ex('host cannot join own room',await req('PATCH',url(c,['guest','guestName','ts']),A,F({guest:'alice',guestName:'A',ts:now})),false);
ex('guest cannot set someone else as guest',await req('PATCH',url(c,['guest','guestName','ts']),B,F({guest:'carl',guestName:'C',ts:now})),false);
ex('guest joins',await req('PATCH',url(c,['guest','guestName','ts']),B,F({guest:'bob',guestName:'Bob',ts:now})),true);
ex('third player cannot take the seat',await req('PATCH',url(c,['guest','guestName','ts']),C,F({guest:'carl',guestName:'C',ts:now})),false);
ex('host sends shot',await req('PATCH',url(c,['ev','ts']),A,F({ev:'{"k":"shot"}',ts:now+1})),true);
ex('guest sends shot',await req('PATCH',url(c,['ev','ts']),B,F({ev:'{"k":"skip"}',ts:now+2})),true);
ex('outsider cannot send',await req('PATCH',url(c,['ev','ts']),C,F({ev:'x',ts:now})),false);
ex('player cannot change seed',await req('PATCH',url(c,['seed','ts']),B,F({seed:1,ts:now})),false);
ex('oversized event denied',await req('PATCH',url(c,['ev','ts']),A,F({ev:'x'.repeat(30001),ts:now})),false);
ex('guest cannot delete',await req('DELETE',url(c),B),false);
ex('host deletes',await req('DELETE',url(c),A),true);
console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0);
