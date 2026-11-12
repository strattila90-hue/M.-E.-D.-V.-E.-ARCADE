// M.E.D.V.E. Arcade – sr.js modul (az app.js tölti be lustán, amikor először kell). A közös segédeket az app.js-ből veszi át.
import {$,AC,AUTHREADY,DB,D_WHEELS,LOWFX,MASTER,MODE,NOISE,PBY,PCX,PK,PZH_FULL,PZH_SPRITE,S,SOUND,UID,USERDOC,V,ac,boom,esc,gameStart,ic,medveWrap,n0,pzhFullSet,snare,sndClink,sndFar,sndMega,sndPop,sndThud,st,toast} from './app.js';
/* ===================== SHOT&RUN – PzH 2000 tüzérpárbaj (körökre osztott) =====================
   Pálya és modell a DroneRunból. 1 világegység = 10 m. Szögek vonásban (6400 = teljes kör).
   Minden véletlen a lövő gépén dől el, az eredmény eseményként megy át a másik félhez (online mód). */
const SR={};
const SR_W=2600,SR_DX=3,SR_G=120,SR_K=.00007,SR_VS=.42,SR_MIL=6400/(2*Math.PI),SR_M=10,SR_FUEL=90,SR_TLIM=120;
const SR_AMMO=[
 {id:'dm121',r:'Rheinmetall · kb. 43,5 kg · csónakfarú (boat-tail) · L52 csőből kb. 30 km',n:'DM121 HE',d:'Repesz-romboló (Rheinmetall) – alaplőszer, közepes kráter',q:14,v:560,R:60,dmg:34,cr:26,kind:'he'},
 {id:'m2000',r:'Rheinmetall Denel · kb. 43–44 kg · cserélhető fenékrész: boat-tail kb. 30 km, base bleed kb. 40 km',n:'Assegai M2000 HE',d:'Repesz-romboló – nagyobb hatósugár, mélyebb kráter',q:12,v:568,R:68,dmg:38,cr:30,kind:'he'},
 {id:'pff',r:'Rheinmetall Denel · több ezer előre gyártott volfrám repesz · közelségi gyújtóval a cél fölött robban · 30/40 km',n:'Assegai M0603 PFF',d:'Előre repeszesített, a cél fölött robban – széles sáv, kevés kráter',q:8,v:560,R:115,dmg:24,cr:8,kind:'pff'},
 {id:'vlap',r:'Rheinmetall Denel · base bleed + rakétahajtómű · L52 csőből kb. 54 km (kísérleti rekord: 67 km)',n:'Assegai M2005 V-LAP',d:'Rakéta-póthajtás – laposabb, gyorsabb röppálya, kisebb töltet',q:6,v:588,R:48,dmg:28,cr:20,kind:'vlap'},
 {id:'smart',r:'GIWS (Rheinmetall/Diehl) · kb. 47 kg · 2 résztöltet ejtőernyőn, radar + infravörös szenzor, EFP páncéltörő mag felülről · L52: kb. 27,5 km',n:'DM702 SMArt 155',d:'Emelt, nyújtott röppálya; a csúcs után kilöki a 2 ejtőernyős résztöltetet, ezek radarral és infrával pásztáznak, befogás után felülről lőnek',q:4,v:560,R:0,dmg:26,cr:5,kind:'smart',search:115,gk:.8},
 {id:'exc',r:'Raytheon/BAE Bofors · kb. 48 kg · GPS/INS irányítás, sikló végfázis, néhány méteres szórás · PzH 2000-ből 9–48 km között tesztelve',n:'M982 Excalibur',d:'GPS-irányított – a végfázisban a célra korrigál (kb. ±700 m)',q:3,v:560,R:52,dmg:44,cr:22,kind:'gps',corr:70},
 {id:'vul',r:'Leonardo/Diehl · űrméret alatti, szárnystabilizált, leváló vezetőelemmel · GPS/INS · gyártói adat szerint kb. 70 km',n:'Vulcano 155 GLR',d:'Irányított, űrméret alatti – nagy korrekció (±1100 m), kis töltet',q:3,v:610,R:36,dmg:30,cr:14,kind:'gps',corr:110},
 {id:'pgk',r:'Northrop Grumman (Orbital ATK) · a hagyományos HE gránát orrába csavart GPS-es irányító gyújtó kormánylapátokkal · kb. 10 m-es szórás',n:'M1156 PGK HE',d:'Irányító gyújtós repesz-romboló – kis korrekció (±300 m) az alaplőszer erejével',q:4,v:560,R:60,dmg:34,cr:26,kind:'gps',corr:30},
 {id:'cph',r:'USA (Martin Marietta) · kb. 62 kg · féllaktív lézeres önirányítás: az előretolt megfigyelő lézerrel jelöli a célt, a lövedék a fénypontra vezérel · kumulatív (HEAT) páncéltörő töltet · kb. 16 km',n:'M712 Copperhead',d:'Lézerirányított páncéltörő – nagy korrekció (±1400 m), de csak ha él a rádió (megfigyelő) és a cél nincs ködben',q:2,v:540,R:30,dmg:50,cr:10,kind:'laser',corr:140},
 {id:'smk',r:'Rheinmetall · ködképző betétek a talajon égnek, néhány percig takarnak',n:'DM125 köd',d:'Ködfüggöny – a ködben álló löveg nem mérhető be és nem lát (3 kör)',q:2,v:560,R:0,dmg:0,cr:6,kind:'smoke'},
 {id:'ill',r:'Rheinmetall · a világítótest ejtőernyőn ereszkedik, kb. 1 percig világítja meg a terepet',n:'DM106 világító',d:'Ejtőernyős világítótest – 2 körig a tűzvezető mutatja a becsapódási pontot',q:2,v:560,R:0,dmg:0,cr:0,kind:'illum'}];
const SR_AM=Object.fromEntries(SR_AMMO.map(a=>[a.id,a]));
const SR_PARTS=[['trk','LÁNC'],['eng','MOTOR'],['tur','TORONY'],['opt','OPTIKA'],['brl','CSŐ'],['ldr','TÖLTŐ'],['rad','RÁDIÓ'],['gps','GPS']];
const SR_PN={trk:'lánctalp',eng:'motor',tur:'toronyhajtás',opt:'optika',brl:'lövegcső',ldr:'töltőautomata',rad:'rádió',gps:'GPS-vevő',crew:'kezelő'};
const SR_AI=[{n:'Újonc',r:300,l:45,k:.86},{n:'Tüzér',r:220,l:32,k:.78},{n:'Veterán',r:150,l:22,k:.7}];
const srClamp=(v,a,b)=>v<a?a:v>b?b:v;
function srRng(s){s=s>>>0;return()=>{s=s+0x6D2B79F5>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const srM=w=>n0(Math.round(w*SR_M/10)*10);// világegység → méter (10-re kerekítve)

/* ---------- terep ---------- */
function srGy(x){const h=SR.h;if(!h)return 640;const f=srClamp(x,0,SR_W)/SR_DX,i=Math.min(h.length-2,f|0),u=f-i;return h[i]*(1-u)+h[i+1]*u}
function srGen(seed){const r=srRng(seed),N=Math.floor(SR_W/SR_DX)+1,h=new Float32Array(N),p=[r()*6,r()*6,r()*6],a=[.7+r()*.6,.6+r()*.7];
  const hx=SR_W*(.4+r()*.2),hh=120+r()*130,hw=200+r()*150,h2x=SR_W*(.18+r()*.64),h2h=40+r()*80,h2w=110+r()*110;
  const xa=250+r()*130,xb=SR_W-250-r()*130;
  for(let i=0;i<N;i++){const x=i*SR_DX;h[i]=640-46*a[0]*Math.sin(x/330+p[0])-24*a[1]*Math.sin(x/140+p[1])-8*Math.sin(x/52+p[2])-hh*Math.exp(-(((x-hx)/hw)**2))-h2h*Math.exp(-(((x-h2x)/h2w)**2))}
  // állások kisimítása
  for(const sx of [xa,xb]){const y0=640-46*a[0]*Math.sin(sx/330+p[0])-24*a[1]*Math.sin(sx/140+p[1])-hh*Math.exp(-(((sx-hx)/hw)**2))-h2h*Math.exp(-(((sx-h2x)/h2w)**2));
    for(let i=0;i<N;i++){const d=Math.abs(i*SR_DX-sx);if(d<110){const w=d<55?1:1-(d-55)/55;h[i]=h[i]*(1-w)+y0*w}}}
  SR.h=h;SR.h0=Float32Array.from(h);SR.sc=new Float32Array(N);SR.trees=[];
  for(let x=70;x<SR_W-60;x+=38+r()*70){if(Math.abs(x-xa)<75||Math.abs(x-xb)<75){r();continue}SR.trees.push({x,s:.75+r()*.6,ok:1})}
  SR.zOff=Math.round((r()*2-1)*80);SR.wind={x:Math.round((r()*2-1)*20),z:Math.round((r()*2-1)*9)};
  return [xa,xb]}
function srCrater(x,r,d){const h=SR.h,sc=SR.sc,i0=Math.max(0,Math.floor((x-r*1.5)/SR_DX)),i1=Math.min(h.length-1,Math.ceil((x+r*1.5)/SR_DX));
  for(let i=i0;i<=i1;i++){const u=Math.abs(i*SR_DX-x)/r;if(u<1){h[i]=Math.min(SR.h0?SR.h0[i]+55:880,h[i]+d*(1-u*u));sc[i]=Math.min(1,sc[i]+.9*(1-u*.5))}else if(u<1.5){h[i]-=d*.13*Math.sin((u-1)*2*Math.PI);sc[i]=Math.min(1,sc[i]+.5*(1.5-u))}}
  for(const t of SR.trees)if(t.ok&&Math.abs(t.x-x)<r*1.6){t.ok=0;t.burn=5+Math.random()*4;for(let k=0;k<5;k++)SR.fx.push({k:'d',x:t.x,y:srGy(t.x)-20,vx:(Math.random()-.5)*160,vy:-90-Math.random()*120,rot:0,vr:(Math.random()-.5)*12,w:3+Math.random()*7,h:2,t:1.8,t0:1.8,c:'#3a2c1c'})}}

/* ---------- löveg ---------- */
function srNewVeh(i,x,name,ai){return {i,x,y:srGy(x)-13.5,a:0,vy:0,av:0,face:i?-1:1,name,ai:!!ai,hp:100,crew:5,burn:0,d:{trk:0,eng:0,tur:0,opt:0,brl:0,ldr:0,rad:0,gps:0},sys:{eng:false,rad:false,tur:false},
  load:0,loading:false,ammo:{},sel:'dm121',hpD:100,hpG:100,hpGT:0,hitF:0,elev:520,trav:0,fuel:SR_FUEL,rec:0,trk:0,dead:false,hurt:0,flare:0,smokeT:0}}
// A löveg merev lánctalpa a talaj kiálló pontjain fekszik fel: a futómű alatti talajpontok felső burkolójának
// az az éle tartja, amelyik a súlypont (a löveg közepe) alatt húzódik. Kráter fölött áthidal, púpon megbillen.
function srRest(v){const H=[];for(let d=-38;d<=38;d+=9.5){const p=[v.x+d,srGy(v.x+d)];while(H.length>1){const o=H[H.length-2],q=H[H.length-1];if((q[0]-o[0])*(p[1]-o[1])-(q[1]-o[1])*(p[0]-o[0])<=0)H.pop();else break}H.push(p)}
  let k=0;while(k<H.length-2&&H[k+1][0]<=v.x)k++;
  // ha a súlypont épp egy kiálló pont fölött van, a laposabb oldalra támaszkodik (nem billen bele a kráterbe)
  const sl=i=>Math.abs((H[i+1][1]-H[i][1])/(H[i+1][0]-H[i][0]));if(k>0&&v.x-H[k][0]<6&&sl(k-1)<sl(k))k--;else if(k<H.length-2&&H[k+1][0]-v.x<6&&sl(k+1)<sl(k))k++;
  const A=H[k],B=H[k+1],a=srClamp(Math.atan2(B[1]-A[1],B[0]-A[0]),-.62,.62);
  return {a,y:A[1]+(B[1]-A[1])*(v.x-A[0])/(B[0]-A[0])-13.5/Math.cos(a)}}
const srAmmoN=v=>SR_AMMO.reduce((s,a)=>s+(v.ammo[a.id]||0),0);
const srReady=v=>v.sys.eng&&v.sys.rad&&v.sys.tur&&v.load>=1;
function srLocal(v,lx,ly){const X=lx*SR_VS*v.face,Y=ly*SR_VS,c=Math.cos(v.a),s=Math.sin(v.a);return {x:v.x+X*c-Y*s,y:v.y+X*s+Y*c}}
function srMuzzle(v,e){const th=e/SR_MIL,L=199*SR_VS,p=srLocal(v,-8,-37.2);return {x:p.x+Math.cos(th)*L*v.face,y:p.y-Math.sin(th)*L}}
// felső szögcsoport (800 vonás fölött): a tűzvezető automatikusan csökkentett töltetet választ
const srChg=e=>e<=800?1:1-.3*(e-800)/350;
const srDisp=v=>1+(v.d.brl===1?1.2:v.d.brl===2?3:0)+(5-v.crew)*.15;
// lézeres célmegjelölés: kell a rádió (előretolt megfigyelő), és a cél nem lehet ködben
const srLaserOk=(sh,tg)=>!!(sh&&tg&&sh.sys.rad&&sh.d.rad<2&&!srInSmoke(tg));
const srInSmoke=v=>SR.smokes.some(s=>Math.abs(s.x-v.x)<170);
const srCtl=()=>SR.mode==='hot'?SR.v[SR.phase==='prep'?0:SR.turn]:SR.v[SR.me];
const srMyTurn=()=>SR.phase==='aim'&&!SR.v[SR.turn].ai&&(SR.mode!=='net'||SR.turn===SR.me);

/* ---------- ballisztika ---------- */
// két szakasz legkisebb távolsága (lövedék egy lépése ↔ lövegcső) – a vékony csövet a gyors lövedék sem „ugorja át”
function srSegD(ax,ay,bx,by,cx,cy,dx,dy){const ux=bx-ax,uy=by-ay,vx=dx-cx,vy=dy-cy,wx=ax-cx,wy=ay-cy,a=ux*ux+uy*uy,b=ux*vx+uy*vy,c=vx*vx+vy*vy,d=ux*wx+uy*wy,e=vx*wx+vy*wy,D=a*c-b*b;
  let sc=D<1e-9?0:srClamp((b*e-c*d)/D,0,1),tc=c<1e-9?0:(b*sc+e)/c;if(tc<0){tc=0;sc=a<1e-9?0:srClamp(-d/a,0,1)}else if(tc>1){tc=1;sc=a<1e-9?0:srClamp((b-d)/a,0,1)}
  const px=ax+ux*sc,py=ay+uy*sc,qx=cx+vx*tc,qy=cy+vy*tc;return {d:Math.hypot(px-qx,py-qy),x:px,y:py}}
function srSim(sh,tg,elev,trav,am,noise){const rnd=Math.random,gs=()=>(rnd()+rnd()+rnd()+rnd()-2)*.87;
  let e=elev,tr=trav,vk=1;
  if(noise){const d=srDisp(sh);e+=gs()*3*d;tr+=gs()*2*d+gs()*5*sh.d.tur;vk=1+gs()*.004*d-(sh.d.brl>1?.04:0)}
  e=srClamp(e,0,1150);const v0=am.v*srChg(e)*vk;
  const th=e/SR_MIL,m=srMuzzle(sh,e),tl=Math.tan(tr/SR_MIL),wc=SR.wind.z*sh.face,tgl=SR.zOff,dt=1/60,pts=[m.x,m.y];
  let x=m.x,y=m.y,vx=Math.cos(th)*v0*sh.face,vy=-Math.sin(th)*v0,t=0,lat=0,type=null,apex=0,top=y,brl=0;
  const B0=tg&&!tg.dead?srLocal(tg,-8,-37.2):null,B1=B0?srMuzzle(tg,tg.elev):null;
  for(let i=0;i<2400&&!type;i++){
    const rvx=vx-SR.wind.x,sp=Math.hypot(rvx,vy);let ax=-SR_K*sp*rvx,ay=SR_G*(am.gk||1)-SR_K*sp*vy;
    if(am.kind==='vlap'&&t>.45&&t<1.35){const s=Math.hypot(vx,vy)||1;ax+=vx/s*95;ay+=vy/s*95}
    const px=x,py=y;vx+=ax*dt;vy+=ay*dt;x+=vx*dt;y+=vy*dt;t+=dt;lat=tl*Math.abs(x-m.x)+.17*wc*t*t;
    if(y<top){top=y;apex=pts.length/2}
    if(y>1200){type='out';pts.push(x,y);break}
    const gy=srGy(x),hg=gy-y;
    if(B0&&t>.05&&Math.abs(lat-tgl)<7){const q=srSegD(px,py,x,y,B0.x,B0.y,B1.x,B1.y);if(q.d<4.2){x=q.x;y=q.y;type='hit';brl=1}}
    if(type){}
    else if(tg&&!tg.dead&&Math.abs(x-tg.x)<46&&y>tg.y-34&&y<tg.y+14&&Math.abs(lat-tgl)<7)type='hit';
    else if(hg<=0){type='ground';y=gy}
    else if(vy>0&&am.kind==='pff'&&hg<24)type='air';
    else if(vy>0&&am.kind==='smart'&&hg<520){type='disp';SR._dr=hg*vx/Math.max(40,Math.abs(vy))*.55}// a röppálya csúcsa után hamar, nagyon magasan lökődnek ki a résztöltetek
    else if(vy>0&&am.kind==='illum'&&hg<210)type='flare';
    pts.push(x,y)}
  if(!type)type='out';
  const gd=am.kind==='gps'?(sh.d.gps||0):0;
  if((am.kind==='gps'&&gd<2||am.kind==='laser'&&srLaserOk(sh,tg))&&type!=='out'&&tg&&!tg.dead){const n=pts.length/2,ex=x,ey=y,co=am.corr*(gd?.8:1),ge=gd&&noise?gs()*14:0,gl=gd&&noise?gs()*2.5:0,sx=srClamp(tg.x+ge-ex,-co,co),sl=srClamp(tgl+gl-lat,-co*.5,co*.5);
    x=ex+sx;lat+=sl;y=srGy(x);type='ground';brl=0;if(Math.abs(x-tg.x)<46&&Math.abs(lat-tgl)<7){y=tg.y-28;type='hit'}
    for(let i=apex;i<n;i++){const u=(i-apex)/Math.max(1,n-1-apex),s=u*u*(3-2*u);pts[i*2]+=sx*s;pts[i*2+1]+=(y-ey)*s}}
  return {pts,dt,tof:t,apex,top,m,end:{x,y,lat,type,brl,dr:type==='disp'?SR._dr:undefined},e,tr}}
// lőtábla: alsó szögcsoportú magassági szög adott távolságra (sík terep, szélcsend) – kiinduló érték az irányzáshoz
function srTable(am,R){const rng=e=>{const th=e/SR_MIL,dt=1/60;let x=0,y=0,vx=Math.cos(th)*am.v,vy=-Math.sin(th)*am.v,t=0;do{const sp=Math.hypot(vx,vy);let ax=-SR_K*sp*vx,ay=SR_G*(am.gk||1)-SR_K*sp*vy;if(am.kind==='vlap'&&t>.45&&t<1.35){ax+=vx/sp*95;ay+=vy/sp*95}vx+=ax*dt;vy+=ay*dt;x+=vx*dt;y+=vy*dt;t+=dt}while(y<0&&t<40);return x};
  if(rng(790)<R)return null;let lo=20,hi=790;for(let i=0;i<11;i++){const m=(lo+hi)/2;if(rng(m)<R)lo=m;else hi=m}return Math.round(hi)}
// felső szögcsoportú lőtábla (800 vonás fölött, csökkentett töltettel) – a SMArt-ot így lövik: magas, nyújtott, meredeken érkező röppálya
function srTableHi(am,R){const rng=e=>{const th=e/SR_MIL,dt=1/60,v=am.v*srChg(e);let x=0,y=0,vx=Math.cos(th)*v,vy=-Math.sin(th)*v,t=0;do{const sp=Math.hypot(vx,vy);vx+=-SR_K*sp*vx*dt;vy+=(SR_G*(am.gk||1)-SR_K*sp*vy)*dt;x+=vx*dt;y+=vy*dt;t+=dt}while(y<0&&t<40);return x};
  if(rng(800)<R)return null;let lo=800,hi=1150;if(rng(hi)>R)return null;for(let i=0;i<11;i++){const m=(lo+hi)/2;if(rng(m)>R)lo=m;else hi=m}return Math.round(lo)}
const srHiAm=am=>am&&am.kind==='smart';
// találati zónák szerinti részegység-sérülés
const SR_ZONE={barrel:['brl','brl','tur','opt'],front:['eng','eng','eng','trk','trk','opt','brl'],rear:['tur','tur','ldr','ldr','rad','gps','trk','crew','crew'],top:['tur','tur','opt','opt','rad','gps','gps','ldr','crew','crew','eng'],near:['trk','trk','trk','opt','opt','rad','rad','gps','brl','crew']};
function srHurt(st,dmg,zone,direct){const parts=[];dmg=Math.round(dmg);if(dmg<=0)return null;st.hp=Math.max(0,st.hp-dmg);
  const n=dmg>=28?3:dmg>=13?2:dmg>=5?1:0,L=SR_ZONE[zone];
  for(let i=0;i<n;i++){if(Math.random()>.75)continue;const p=L[Math.random()*L.length|0];
    if(p==='crew'){if(st.crew>0){st.crew--;parts.push('crew')}}else if((st.d[p]||0)<2){st.d[p]=Math.min(2,(st.d[p]||0)+(dmg>=28&&Math.random()<.5?2:1));if(!parts.includes(p))parts.push(p);if(p==='eng'&&Math.random()<.6)st.burn=Math.max(st.burn,3)}}
  let cook=false;if(direct&&zone==='rear'&&dmg>=36&&Math.random()<.12){cook=true;st.hp=0}
  if(st.crew<=0)st.hp=0;
  return {dmg,parts,cook}}
const srState=v=>({hp:v.hp,crew:v.crew,burn:v.burn,d:{...v.d}});
// a lövés teljes kimenetele (a lövő gépén): kráterek, sérülések, következő szél
function srResolve(si,sim,am){const sh=SR.v[si],tg=SR.v[1-si],E=sim.end,tgl=SR.zOff,st=[srState(SR.v[0]),srState(SR.v[1])];
  const ev={k:'shot',by:si,am:am.id,elev:sh.elev,trav:sh.trav,sx:Math.round(sh.x*10)/10,pts:sim.pts,dt:sim.dt,apex:sim.apex,end:{x:E.x,y:E.y,lat:E.lat,type:E.type,brl:E.brl?1:0},cr:[],hits:[],delay:0};
  const rngF=srClamp((E.x-sh.x)/((tg.x-sh.x)||1),0,1.2),off=Math.abs(E.lat-tgl*rngF),f=srClamp(1-off/90,.25,1);ev.f=f;
  const latOf=v=>v===tg?E.lat-tgl:E.lat,dist=v=>Math.hypot(Math.max(0,Math.abs(E.x-v.x)-34),latOf(v));
  const hit=(v,dmg,zone,direct)=>{const r=srHurt(st[v.i],dmg,zone,direct);if(r)ev.hits.push({who:v.i,...r})};
  const blast=(R,D,pw)=>{for(const v of SR.v){if(v.dead)continue;if(E.type==='hit'&&v===tg){if(E.brl){hit(v,D*(.75+Math.random()*.25),'barrel',true);const b=st[v.i];if(b.d.brl<2){b.d.brl++;const h=ev.hits[ev.hits.length-1];if(h&&!h.parts.includes('brl'))h.parts.push('brl')}}else hit(v,D*(1+Math.random()*.3),(E.x-v.x)*v.face>0?'front':'rear',true);continue}const d=dist(v);if(d<R)hit(v,D*.6*Math.pow(1-d/R,pw),'near',false)}};
  if(E.type==='out'){}
  else if(am.kind==='smoke'){ev.smoke={x:E.x,y:E.y};ev.cr.push([E.x,8,2])}
  else if(am.kind==='illum'){if(E.type==='flare')ev.flare={x:E.x,y:E.y};else ev.dud=1;if(E.type==='hit')hit(tg,4,'barrel',true)}
  else if(am.kind==='smart'&&E.type==='hit'){blast(am.R||40,am.dmg*.8,1.4);ev.cr.push([E.x,8,3])}
  else if(am.kind==='smart'){if(E.type==='disp'){ev.subs=[];ev.delay=7;for(const o of [-30,30]){const x=E.x+(E.dr!=null?E.dr:sh.face*46)+o,det=!tg.dead&&Math.abs(x-tg.x)<am.search&&Math.abs(E.lat-tgl)<am.search*.5;ev.subs.push({x,y:E.y,hit:det});if(det)hit(tg,am.dmg*(.85+Math.random()*.3),'top',true)}}else{ev.dud=1;ev.cr.push([E.x,6,2])}}
  else if(E.type==='air'){blast(am.R,am.dmg,1.2);ev.cr.push([E.x,am.R*.45,1.5*f])}
  else{blast(am.R,am.kind==='pff'?am.dmg*1.2:am.dmg,1.6);ev.cr.push([E.x,am.cr*(.6+.4*f),am.cr*.55*f])}
  if(am.kind==='laser')ev.lz=srLaserOk(sh,tg)?1:0;
  ev.after=st;const w=SR.wind;ev.wind={x:srClamp(Math.round(w.x+(Math.random()*2-1)*5),-22,22),z:srClamp(Math.round(w.z+(Math.random()*2-1)*3),-10,10)};
  return ev}

/* ---------- gépi ellenfél ---------- */
function srSolve(sh,tg,am){let best=null;const tryE=e=>{const s=srSim(sh,tg,e,0,am,false),err=s.end.type==='hit'?0:s.end.type==='out'?9999:Math.abs(s.end.x-tg.x);if(!best||err<best.err)best={e,err,s}};
  for(let e=srHiAm(am)?800:60;e<=1140;e+=20)tryE(e);const c=best.e;for(let e=c-18;e<=c+18;e+=3)tryE(srClamp(e,0,1150));
  const s=best.s,rng=Math.abs(s.end.x-s.m.x)||1,trav=Math.atan((SR.zOff-s.end.lat)/rng)*SR_MIL,s2=srSim(sh,tg,srClamp(best.e+10,0,1150),0,am,false);
  let slope=(s2.end.x-s.end.x)*sh.face/10;if(!isFinite(slope)||Math.abs(slope)<.25||s2.end.type==='out')slope=best.e>640?-1:1;
  return {elev:best.e,trav,slope,rng}}
function srAiPlan(){const me=SR.v[SR.turn],tg=SR.v[1-SR.turn],A=SR.ai,L=SR_AI[SR.lvl];
  for(const k of ['eng','rad','tur'])if(me.d[k]<2)me.sys[k]=true;
  if(Math.abs(tg.x-A.tx)>25){A.n=Math.max(0,A.n-2);A.tx=tg.x}
  const q=[],has=id=>(me.ammo[id]||0)>0;
  if(me.hurt>=12&&me.d.trk<2&&me.d.eng<2&&Math.random()<.7){const dir=Math.random()<.5?-1:1;q.push({k:'move',dx:dir*(35+Math.random()*50)});A.n=Math.max(0,A.n-1)}
  me.hurt=0;
  let id=has('dm121')?'dm121':has('m2000')?'m2000':null;
  if(A.n>=1&&has('cph')&&srLaserOk(me,tg)&&Math.random()<.4)id='cph';else if(A.n>=1&&has('pgk')&&(me.d.gps||0)<2&&Math.random()<.35)id='pgk';else if(A.n>=2&&has('exc')&&(me.d.gps||0)<2&&(tg.hp<=30||Math.random()<.45))id='exc';else if(A.n>=2&&has('smart')&&Math.random()<.35)id='smart';else if(A.n>=3&&has('vul')&&Math.random()<.3)id='vul';else if(A.n===0&&has('pff'))id='pff';else if(has('m2000')&&Math.random()<.4)id='m2000';
  if(!id)id=(SR_AMMO.find(a=>has(a.id)&&a.dmg>0)||SR_AMMO.find(a=>has(a.id))||{}).id;
  q.push({k:'aim',am:id},{k:'fire'});A.q=q;A.wait=1.1}
function srAiAim(me,tg,id){const A=SR.ai,L=SR_AI[SR.lvl],am=SR_AM[id],so=srSolve(me,tg,am),gs=()=>(Math.random()+Math.random()+Math.random()-1.5)*1.15;
  const blind=(srInSmoke(tg)||srInSmoke(me)?3:1)*(me.d.opt?1.6:1),sr=Math.max(16,L.r*Math.pow(L.k,A.n))*blind,sl=Math.max(4,L.l*Math.pow(L.k,A.n))*blind;
  me.sel=id;A.te=Math.round(srClamp(so.elev+gs()*sr/so.slope,20,1150));A.tt=Math.round(srClamp(so.trav+gs()*sl/so.rng*SR_MIL,-300,300));A.n++}

/* ---------- hangok ---------- */
// hangos események (lövés, becsapódás) közös busza: lágy telítés → kompresszor → erősítés, így torzítás nélkül szólhat sokkal hangosabban
let SR_DST=null;
function srOut(){if(SR.out&&SR.outAC===AC)return SR.out;const a=AC,sh=a.createWaveShaper(),cu=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cu[i]=Math.tanh(x*2.4)/Math.tanh(2.4)}sh.curve=cu;
  const cp=a.createDynamicsCompressor();cp.threshold.value=-12;cp.knee.value=8;cp.ratio.value=10;cp.attack.value=.002;cp.release.value=.35;const g=a.createGain();g.gain.value=2.1;sh.connect(cp).connect(g).connect(MASTER);SR.out=sh;SR.outAC=AC;return sh}
function srSub(t,f0,f1,dur,vol,ty){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur*.35);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(SR_DST||MASTER);o.start(t);o.stop(t+dur+.05)}
function srTone(type,f0,f1,t,dur,vol){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(SR_DST||MASTER);o.start(t);o.stop(t+dur+.02)}
function srNoise(t,dur,vol,type,f0,f1,q){const a=AC,n=a.createBufferSource(),b=a.createBiquadFilter(),g=a.createGain();n.buffer=NOISE;n.loop=true;b.type=type;b.frequency.setValueAtTime(f0,t);if(f1)b.frequency.exponentialRampToValueAtTime(f1,t+dur);if(q)b.Q.value=q;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);n.connect(b).connect(g).connect(SR_DST||MASTER);n.start(t,Math.random()*.5);n.stop(t+dur+.02)}
const srSnd=()=>SOUND&&ac();
// irányzék-kattanás: k=0 finom (1 vonás), 1 erősebb (10), 2 nehéz reteszelés (100)
function srClick(k){if(!srSnd())return;const t=AC.currentTime;if(t-(SR.clkT||0)<.014&&!k)return;SR.clkT=t;
  srNoise(t,k===2?.05:.02,k===2?.55:k?.4:.24,'bandpass',k===2?1100:k?2100:3300,null,4);srTone('square',k===2?520:k?1200:2300,k===2?260:k?700:1500,t,k===2?.03:.012,k===2?.16:k?.1:.05);
  if(k===2){srTone('triangle',180,90,t,.07,.25);try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}}
function srSwSnd(on){if(!srSnd())return;const t=AC.currentTime;srNoise(t,.03,.5,'bandpass',1500,null,3);srTone('square',on?700:420,on?380:240,t+.005,.03,.14);srNoise(t+.06,.02,.3,'bandpass',2600,null,4)}
/* ---- a löveg rendszereinek hangjai (szintetizálva) ---- */
// fémes csattanás: néhány nem harmonikus részhang gyors lecsengéssel (acél alkatrészek)
function srMetal(t,base,vol,dur){for(const [r,a] of [[1,1],[2.32,.6],[3.71,.42],[5.14,.25],[7.9,.12]]){const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=base*r*(1+(Math.random()-.5)*.02);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol*a,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur*(1.2-r*.08));o.connect(g).connect(SR_DST||MASTER);o.start(t);o.stop(t+dur+.05)}
  srNoise(t,.03,vol*1.6,'bandpass',base*4,null,2)}
function srThump(t,f,vol,dur){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(SR_DST||MASTER);o.start(t);o.stop(t+dur+.02)}
// dízel alapjárati hurok: V8, 750/perc → 50 gyújtás/mp; egyenetlen gyújtások, szelepzörgés, mechanikai zaj – egész számú gyújtásból, hézagmentesen ismételhető
/* ---------- élethű, mintánként kiszámolt (procedurális) hangok: egyszer készülnek el, utána gyorsítótárból szólnak ---------- */
const SRB={};
function srB(key,dur,fill){const c=SRB[key];if(c&&c.ac===AC)return c.b;const fs=22050,n=Math.round(dur*fs),b=AC.createBuffer(1,n,fs),d=b.getChannelData(0),R=Math.random;
  const H={fs,n,R,
    burst:(t0,f,a,tau,len)=>{const i0=Math.max(0,t0*fs|0),m=Math.min(n-i0,len*fs|0),w=2*Math.PI*f/fs;for(let i=0;i<m;i++)d[i0+i]+=a*Math.exp(-i/fs/tau)*Math.sin(w*i)},
    nb:(t0,a,tau,len,k)=>{const i0=Math.max(0,t0*fs|0),m=Math.min(n-i0,len*fs|0);let y=0;for(let i=0;i<m;i++){y+=(R()*2-1-y)*k;d[i0+i]+=a*Math.exp(-i/fs/tau)*y}},
    metal:(t0,base,a,modes)=>{for(const [r,g,tau] of modes)H.burst(t0,base*r*(1+(R()-.5)*.01),a*g,tau,tau*5)},
    rz:(f,bw)=>{const r=Math.exp(-Math.PI*bw/fs);let a1=2*r*Math.cos(2*Math.PI*f/fs),a2=-r*r,y1=0,y2=0;const F=x=>{const y=x*(1-r)+a1*y1+a2*y2;y2=y1;y1=y;return y};F.set=(f2,bw2)=>{const r2=Math.exp(-Math.PI*bw2/fs);a1=2*r2*Math.cos(2*Math.PI*f2/fs);a2=-r2*r2};return F}};
  fill(d,H);let m=0;for(let i=0;i<n;i++)m=Math.max(m,Math.abs(d[i]));if(m>0)for(let i=0;i<n;i++)d[i]*=.95/m;SRB[key]={b,ac:AC};return b}
function srPlayB(b,vol,dl,pan){const a=AC,t=a.currentTime+(dl||0)+.01,s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=vol;let o=s.connect(g);if(pan&&a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=pan;o=o.connect(p)}o.connect(MASTER);s.start(t);return {s,g,t}}
// MTU V12 dízel indítása: főkapcsoló-relé, üzemanyag-szivattyú, önindító-mágneskapcsoló és fogaskerék-kapcsolódás, áttekerés (a kompressziós ütemeknél
// az önindító lelassul), első gyújtások, beindulás, az önindító leválása és szabadonfutása, felpörgés turbósivítással, visszaállás alapjáratra
const SR_ENG_CATCH=2.02;
function srEngStartBuf(){return srB('engStart',3.45,(d,H)=>{const {fs,n,R,burst,nb}=H,tc=SR_ENG_CATCH;
  nb(0,.5,.002,.01,1);burst(0,1800,.25,.012,.05);burst(0,3100,.15,.008,.04);
  {let ph=0;for(let i=.05*fs|0;i<.6*fs;i++){const t=i/fs,u=(t-.05)/.55,env=Math.min(1,u*6)*Math.min(1,(1-u)*8);ph+=(150+60*Math.min(1,u*3))/fs;d[i]+=env*.06*(Math.sin(2*Math.PI*ph)+.5*Math.sin(4*Math.PI*ph)+.3*Math.sin(16*Math.PI*ph))}}
  burst(.6,85,.7,.05,.25);burst(.6,720,.25,.03,.12);burst(.6,1650,.12,.02,.08);nb(.6,.35,.03,.08,.5);
  let crk=0,stp=0,hp=0;
  for(let i=.63*fs|0;i<(tc+.06)*fs;i++){const t=i/fs,ramp=Math.min(1,(t-.63)/.18),rpm=(150+40*Math.min(1,(t-.63)/1.2))*ramp,prev=crk;crk+=rpm/60*6/fs;
    const L=Math.pow(Math.max(0,Math.sin(2*Math.PI*(crk%1))),3),f=ramp*(105-30*L)*(rpm/170+.2);stp+=f/fs;const sp=2*Math.PI*stp;
    let x=0;for(let h=1;h<=7;h++)x+=Math.sin(sp*h+h)/Math.pow(h,1.1);x=x*.16+Math.sin(sp*11)*.05;const z=R()*2-1;hp=.7*hp+.3*z;x+=(z-hp)*.05;
    d[i]+=x*(t>tc?Math.max(0,1-(t-tc)/.05):1)*(.55+.45*ramp);
    if(Math.floor(crk)!==Math.floor(prev)&&t<tc){burst(t,42+R()*8,.45,.045,.15);nb(t,.12,.03,.08,.15);
      if(t>1.62&&R()<(t-1.62)*1.6){burst(t+.01,70+R()*15,.9,.03,.12);nb(t+.01,.35,.012,.04,.35);burst(t+.012,600,.12,.006,.02)}}}
  {let ph=0;for(let i=tc*fs|0;i<(tc+.35)*fs;i++){const t=i/fs-tc;ph+=(180+500*Math.min(1,t/.06)*Math.exp(-t/.2))/fs;d[i]+=.12*Math.exp(-t/.12)*Math.sin(2*Math.PI*ph)*(1+.5*Math.sin(4*Math.PI*ph))}}
  {let fp=0,tp=0,ex=0;for(let i=tc*fs|0;i<n;i++){const t=i/fs-tc,F=t<.35?25+115*t/.35:50+90*Math.exp(-(t-.35)/.32),prev=fp;fp+=F/fs;
    if(Math.floor(fp)!==Math.floor(prev)){const k=Math.floor(fp),a=(.75+R()*.25)*(k%2?.85:1)*(k%12===5?.75:1)*(t<.12?1.25:1)*.8;burst(i/fs,78+R()*14,a,.0065,.04);burst(i/fs,620+R()*60,a*.22,.0016,.012);nb(i/fs+.004,a*.18,.0007,.005,1)}
    const rp=Math.min(1,F/140);tp+=(2300+2000*rp)/fs;d[i]+=.035*rp*rp*Math.sin(2*Math.PI*tp);ex+=(R()*2-1-ex)*.08;d[i]+=ex*.25*rp}}
  {let y=0;const k=.35;for(let i=tc*fs|0;i<n;i++){y+=(d[i]-y)*k;d[i]=y}}
  for(let i=(3.1*fs)|0;i<n;i++)d[i]*=Math.max(0,1-(i/fs-3.1)/.35)})}
function srSndEngine(){if(!srSnd())return;srPlayB(srEngStartBuf(),.42)}
// harctéri rádió (SINCGARS-szerű): forgókapcsoló reteszei, bekapcsoló relé, inverter-zúgás, önteszt-sípolás, frekvenciaugratásos szinkron-csipogás,
// zajzár nyit, formánsokkal szintetizált, sávszűrt, torzított beszéd („Rádiópróba, vétel”), nyugtázó sípszó, zajzár-csattanás
function srRadioBuf(){return srB('radio',2.35,(d,H)=>{const {fs,n,R,burst,nb,rz}=H;
  for(const t0 of [0,.07,.14]){nb(t0,.6,.0008,.004,1);burst(t0,2400,.25,.006,.02);burst(t0,4100,.15,.004,.015)}
  burst(.2,110,.35,.03,.1);nb(.2,.2,.004,.02,.6);
  {let ph=0;for(let i=.22*fs|0;i<.95*fs;i++){const t=i/fs,u=(t-.22)/.73,env=Math.min(1,u*5)*Math.pow(Math.max(0,1-u),1.5);ph+=(380+40*Math.min(1,u*4))/fs;d[i]+=env*.05*(Math.sin(2*Math.PI*ph)+.4*Math.sin(4*Math.PI*ph))}}
  for(let k=0;k<3;k++){const t0=.4+k*.11;let ph=0;for(let i=t0*fs|0;i<(t0+.06)*fs;i++){const t=i/fs-t0;ph+=1000/fs;d[i]+=.22*Math.min(1,t/.004)*Math.min(1,(.06-t)/.004)*Math.tanh(3*Math.sin(2*Math.PI*ph))}}
  // a rádiósávban szóló rész külön készül, aztán sávszűrve, torzítva kerül a többi mellé
  const v=new Float32Array(n);{let ph=0,f=1800;for(let i=.8*fs|0;i<1.02*fs;i++){if(i%176===0)f=[1200,1800,2400,1500][R()*4|0];ph+=f/fs;v[i]+=.35*Math.sin(2*Math.PI*ph)}}
  const FM={a:[800,1250,2600],i:[300,2200,2900],o:[450,850,2600],e:[480,1900,2600],u:[330,800,2400]};
  const SY=[['tr','a',.11],['st','i',.07],['','o',.12],['st','o',.11],['tr','o',.1],['st','a',.12],['pause','',.12],['fr','e',.12],['st','e',.08],['son','e',.1]];
  const F1=rz(800,90),F2=rz(1250,110),F3=rz(2600,160);let t=1.08,gp=0,ff=[800,1250,2600];
  for(const [c,vw,dur] of SY){const i0=t*fs|0;let cl=0;
    if(c==='pause'){t+=dur;continue}
    if(c==='st'){cl=.028*fs|0;for(let i=0;i<.008*fs;i++)v[i0+cl-(.008*fs|0)+i]+=(R()*2-1)*.5}
    if(c==='fr'){cl=.05*fs|0;let y=0;for(let i=0;i<cl;i++){y+=(R()*2-1-y)*.6;v[i0+i]+=y*.35}}
    const tgt=FM[vw],m=(dur*fs)|0;
    for(let i=0;i<m;i++){const u=i/m,tt=t+i/fs;for(let q=0;q<3;q++)ff[q]+=(tgt[q]-ff[q])*.004;F1.set(ff[0],90);F2.set(ff[1],110);F3.set(ff[2],160);
      const f0=(122-14*(tt-1.08))*(1+(R()-.5)*.03);gp+=f0/fs;const ph=gp%1,pulse=ph<.45?1-Math.cos(2*Math.PI*ph/.45):0;
      let am=Math.min(1,u*8)*Math.min(1,(1-u)*6);if(c==='tr'&&u<.3)am*=.5+.5*Math.sin(2*Math.PI*26*i/fs);if(c==='son'&&u<.35)am*=.5;
      const x=(pulse-.5)*am;v[i0+cl+i]+=F1(x)*1+F2(x)*.6+F3(x)*.3}
    t+=dur+(cl/fs)}
  {let ph=0;for(let i=1.98*fs|0;i<2.13*fs;i++){const tt=i/fs;ph+=(tt<2.05?1250:1650)/fs;v[i]+=.4*Math.sin(2*Math.PI*ph)}}
  // zajzár: nyitáskor és a végén hangos sistergés, közben halk vivő-zaj
  for(let i=1.02*fs|0;i<2.27*fs;i++){const tt=i/fs,lv=tt<1.07?.5:tt>2.14?.6:.06;v[i]+=(R()*2-1)*lv}
  {let h=0,l1=0,l2=0,m=0;const kh=.09,kl=.55;for(let i=0;i<n;i++){h+=(v[i]-h)*kh;const x=v[i]-h;l1+=(x-l1)*kl;l2+=(l1-l2)*kl;m=Math.max(m,Math.abs(l2))}
    h=0;l1=0;l2=0;for(let i=0;i<n;i++){h+=(v[i]-h)*kh;const x=v[i]-h;l1+=(x-l1)*kl;l2+=(l1-l2)*kl;d[i]+=.45*Math.tanh(3.2*l2/(m||1))}}})}
function srSndRadio(){if(!srSnd())return;srPlayB(srRadioBuf(),.34)}
// toronyhajtás: relé, a hidraulikaszivattyú villanymotorjának felfutása, 9 dugattyús szivattyú-lüktetés, nyomásmentesítő szelep sziszegése,
// a toronyretesz kioldása, fogaskoszorú-morgás holtjáték-kattogással, megálláskor koppanás, majd a szivattyú lecsendesedik
function srTurretBuf(){return srB('turret',1.95,(d,H)=>{const {fs,n,R,burst,nb,metal}=H;
  nb(0,.5,.001,.006,1);burst(0,1900,.2,.01,.04);
  let pm=0,hs=0,gr=0,tooth=0;
  for(let i=.02*fs|0;i<n;i++){const t=i/fs,slew=t>.8&&t<1.5,fm=48*(1-Math.exp(-(t-.02)/.18))*(slew?.92:1)*(t>1.6?Math.max(.15,1-(t-1.6)/.4):1);pm+=fm/fs;const P=2*Math.PI*pm,pr=Math.min(1,Math.max(0,(t-.1)/.4));
    let x=0;for(let h=1;h<=4;h++)x+=Math.sin(P*h)*.08/h;x+=Math.sin(P*6)*.04;x+=pr*(Math.sin(P*9)*.1+Math.sin(P*18)*.05+Math.sin(P*27)*.025)*(slew?1.3:1);
    if(t>.55&&t<.8){const z=R()*2-1;hs+=(z-hs)*.5;x+=(z-hs)*.14*Math.sin(Math.PI*(t-.55)/.25)}
    if(slew){const z=R()*2-1;gr+=(z-gr)*.05;const tp=tooth;tooth+=38/fs;x+=gr*.5*Math.abs(Math.sin(Math.PI*tooth));if(Math.floor(tooth)!==Math.floor(tp))burst(t,1700+R()*300,.035,.003,.012);if(R()<.0009)burst(t,2600,.08,.004,.02)}
    d[i]+=x*(t>1.75?Math.max(0,1-(t-1.75)/.2):1)}
  burst(.72,70,.5,.05,.2);metal(.72,520,.22,[[1,1,.15],[2.37,.55,.09],[4.25,.35,.05]]);nb(.72,.25,.006,.03,.7);
  burst(1.5,60,.4,.06,.2);metal(1.5,430,.14,[[1,1,.2],[2.6,.5,.1],[4.9,.3,.05]])})}
function srSndTurret(){if(!srSnd())return;srPlayB(srTurretBuf(),.36)}
// a töltőautomata gránátonként: a tárlánc léptetésének kattogása, az átadókar hidraulikus sivítása, a hüvely csúszása, döngölés acélos csengéssel,
// néha sűrített levegő kifúvása – négy változat, hogy ne legyen gépies az ismétlődés
function srLoadBuf(v){return srB('load'+v,.44,(d,H)=>{const {fs,R,burst,nb,metal}=H,sp=.02+v*.003;
  for(let k=0;k<7;k++){const t=k*sp;nb(t,.25,.0006,.004,1);burst(t,3100+R()*400,.1,.004,.015);burst(t,5200,.05,.003,.01);burst(t,180,.08,.01,.03)}
  {let ph=0;for(let i=.1*fs|0;i<.2*fs;i++){const u=(i/fs-.1)/.1;ph+=(600+350*u)/fs;d[i]+=.06*Math.sin(Math.PI*u)*(Math.sin(2*Math.PI*ph)+.4*Math.sin(6*Math.PI*ph))}}
  {let y=0;for(let i=.2*fs|0;i<.25*fs;i++){const z=R()*2-1;y+=(z-y)*.5;d[i]+=(z-y)*.15*Math.sin(Math.PI*(i/fs-.2)/.05)}}
  burst(.25,58,.9,.06,.2);metal(.25,410*(1+v*.04),.4,[[1,1,.25],[2.76,.55,.14],[5.39,.3,.08],[8.88,.18,.05]]);nb(.25,.4,.004,.02,.7);
  if(v%2){let y=0;for(let i=.3*fs|0;i<.44*fs;i++){const z=R()*2-1;y+=(z-y)*.4;d[i]+=(z-y)*.09*Math.min(1,(.44-i/fs)/.05)}}})}
function srLoadSnd(){if(!srSnd())return;srPlayB(srLoadBuf(Math.random()*4|0),.26,0,(Math.random()-.5)*.2)}
// a töltőautomata folyamatos búgása (pontosan 1 mp-es, hézagmentesen ismétlődő minta): villanymotor felharmonikusokkal, 9 dugattyús hidraulikaszivattyú,
// 100 Hz-es hálózati búgás, a kompresszor 4 Hz-es lüktetése és a sűrített levegő sziszegése
function srLoaderHumBuf(){return srB('ldrHum',1,(d,H)=>{const {fs,n,R}=H;let hs=0;
  for(let i=0;i<n;i++){const t=i/fs,P=2*Math.PI*40*t,ch=Math.pow(Math.max(0,Math.sin(2*Math.PI*4*t)),4);let x=0;for(let h=1;h<=4;h++)x+=Math.sin(P*h+h)*.07/h;
    x+=Math.sin(P*9)*.09+Math.sin(P*18)*.04+Math.sin(2*Math.PI*100*t)*.05+Math.sin(2*Math.PI*200*t)*.02+Math.sin(2*Math.PI*45*t)*ch*.25;
    const z=R()*2-1;hs+=(z-hs)*.45;x+=(z-hs)*(.05+.06*ch);d[i]=x}})}
function srDieselBuf(){if(SR.dzB&&SR.dzAC===AC)return SR.dzB;const sr=AC.sampleRate,F=50,N=60,len=Math.round(sr*N/F),b=AC.createBuffer(1,len,sr),d=b.getChannelData(0);
  const add=(t0,fn,dur)=>{const i0=Math.round(t0*sr),n=Math.round(dur*sr);for(let i=0;i<n;i++){d[(i0+i)%len]+=fn(i/sr)}};
  for(let k=0;k<N;k++){const t0=k/F+(Math.random()-.5)*.0012,a=(.72+Math.random()*.28)*(k%2?.82:1)*(k%8===3?.7:1),f=78+Math.random()*14;
    add(t0,t=>a*Math.exp(-t/.0065)*Math.sin(2*Math.PI*f*t),.04);
    add(t0,t=>a*.22*Math.exp(-t/.0016)*Math.sin(2*Math.PI*(610+Math.random()*60)*t),.012);
    add(t0+.004,t=>a*.18*Math.exp(-t/.0007)*(Math.random()*2-1),.005)}
  for(let i=0;i<len;i++)d[i]+=(Math.random()*2-1)*.025;let m=0;for(let i=0;i<len;i++)m=Math.max(m,Math.abs(d[i]));for(let i=0;i<len;i++)d[i]/=m*1.1;
  SR.dzB=b;SR.dzAC=AC;return b}

function srEngLoop(on,start){if(!on){if(SR.eng){const E=SR.eng;SR.eng=null;try{const t=AC.currentTime;E.g.gain.cancelScheduledValues(t);E.g.gain.setTargetAtTime(.0001,t,.18);E.src.playbackRate.setTargetAtTime(.35,t,.35);E.src.stop(t+1.4);E.tb.stop(t+1.4)}catch(e){}}return}
  if(SR.eng||!srSnd())return;const a=AC,t=a.currentTime,src=a.createBufferSource(),lp=a.createBiquadFilter(),g=a.createGain(),tb=a.createOscillator(),tg=a.createGain();
  src.buffer=srDieselBuf();src.loop=true;lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.7;
  tb.type='sine';tb.frequency.value=2600;tg.gain.value=.0001;tb.connect(tg).connect(MASTER);tb.start(t);
  src.connect(lp).connect(g).connect(MASTER);
  if(start==='xf'){src.playbackRate.value=1;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.32);tg.gain.setTargetAtTime(.0012,t,.3)}
  else if(start){src.playbackRate.setValueAtTime(.55,t);src.playbackRate.linearRampToValueAtTime(1.75,t+.45);src.playbackRate.setTargetAtTime(1,t+.6,.35);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2,t+.15);g.gain.setTargetAtTime(.14,t+.6,.4);
    lp.frequency.setValueAtTime(700,t);lp.frequency.linearRampToValueAtTime(2200,t+.45);lp.frequency.setTargetAtTime(900,t+.6,.4);tb.frequency.setValueAtTime(1800,t);tb.frequency.linearRampToValueAtTime(3600,t+.5);tb.frequency.setTargetAtTime(2600,t+.6,.5);tg.gain.setValueAtTime(.0001,t);tg.gain.exponentialRampToValueAtTime(.005,t+.45);tg.gain.setTargetAtTime(.0012,t+.7,.4)}
  else{src.playbackRate.value=1;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.6);tg.gain.setTargetAtTime(.0012,t,.3)}
  src.start(t,Math.random()*.5);SR.eng={src,g,lp,tb,tg}}
function srEngRev(k){const E=SR.eng;if(!E)return;const t=AC.currentTime;E.src.playbackRate.setTargetAtTime(1+k*.85,t,.22);E.g.gain.setTargetAtTime(.14+k*.1,t,.2);E.lp.frequency.setTargetAtTime(900+k*1500,t,.2);E.tb.frequency.setTargetAtTime(2600+k*1400,t,.3);E.tg.gain.setTargetAtTime(.0012+k*.004,t,.3)}


// 155 mm-es lövés: éles torkolati csattanás, lőporgáz-dübörgés, csőszájfék-sziszegés, visszhang a dombokról, majd a zár és a töltőautomata zaja
// gránáttípusonkénti hangprofil: lövés (k: töltet-hangerő, fm: mélység), röppálya (f0→f1 süvítés; rk rakéta, gl siklás, thin űrméret alatti, tb bukdácsoló), becsapódás (ik, ifm, cr: csattanás, rl: morajlás)
const SR_SP={dm121:{k:1,fm:1,f0:2100,f1:540,ik:1,ifm:1,cr:1,rl:1},m2000:{k:1,fm:.9,f0:1850,f1:460,ik:1.15,ifm:.8,cr:.9,rl:1.35},pff:{k:1,fm:1,f0:2300,f1:640,ik:1,ifm:1,cr:1,rl:1},
  vlap:{k:1.05,fm:1.05,f0:2700,f1:760,rk:1,ik:.9,ifm:1.15,cr:1.45,rl:.75},smart:{k:1,fm:1,f0:1900,f1:700,ik:1,ifm:1,cr:1,rl:1},pgk:{k:1,fm:1,f0:2050,f1:530,gl:1,ik:1,ifm:1,cr:1.1,rl:1},cph:{k:.95,fm:1,f0:1600,f1:470,gl:1,ik:.9,ifm:1.2,cr:1.7,rl:.8},exc:{k:1,fm:.95,f0:1500,f1:430,gl:1,ik:1.2,ifm:.9,cr:1.6,rl:1.15},
  vul:{k:1.1,fm:1.12,f0:3100,f1:980,thin:1,ik:.8,ifm:1.3,cr:1.3,rl:.7},smk:{k:.72,fm:1.1,f0:1700,f1:520,tb:1,ik:.5,ifm:1.2,cr:.6,rl:.5},ill:{k:.72,fm:1.1,f0:1800,f1:560,tb:1,ik:.4,ifm:1.3,cr:.6,rl:.4}};
const srSP=id=>SR_SP[id]||SR_SP.dm121;
function srSndFire(side,id){if(!srSnd())return;const t=AC.currentTime+.01,P=srSP(id),k=P.k,fm=P.fm;SR_DST=srOut();
  try{srNoise(t,.03,1.7*k,'highpass',500*fm);srNoise(t,.012,1.3*k,'bandpass',4200*fm,null,.6);
    srNoise(t+.004,1.9,1.35*k,'lowpass',4500*fm,70);srSub(t,115*fm,26,1.5,1.8*k);srSub(t+.01,64*fm,21,2,1.15*k,'triangle');
    srNoise(t+.02,.55,.4*k,'bandpass',2800*fm,850,1.2);
    for(const [d,v,f] of [[.45,.5,950],[1,.32,620],[1.75,.2,420]]){srNoise(t+d,1,v*k,'lowpass',f*fm,80);srSub(t+d,72*fm,28,.9,v*.75*k)}
    // V-LAP: a rakéta-póthajtómű begyújt (sistergő, recsegő dübörgés)
    if(P.rk){srNoise(t+.45,.95,.55,'bandpass',1100,420,.6);srNoise(t+.45,.95,.35,'lowpass',380,160);srSub(t+.45,58,40,.9,.4,'sawtooth');for(let i=0;i<10;i++)snare(t+.47+i*.085,.05+Math.random()*.05)}}
  finally{SR_DST=null}
  if(P.thin){srMetal(t+.18,640,.07,.3);srNoise(t+.2,.12,.18,'highpass',3600);srMetal(t+.26,820,.05,.22)}// leváló vezetőelem csörrenése
  if(P.gl){srMetal(t+.95,1100,.035,.12);srTone('sine',2200,3400,t+1.02,.09,.03);srTone('sine',3400,null,t+1.13,.05,.025)}// kormányszárnyak nyílnak, GPS-vétel
  if(P.thin)srTone('sine',2600,3600,t+1.05,.08,.025);
  srSndDepart(t+.05,side);
  srNoise(t+.8,.05,.45,'bandpass',2400,null,5);srTone('square',900,300,t+.8,.04,.08);srNoise(t+1.1,.08,.32,'bandpass',1300,null,4);srTone('triangle',220,110,t+1.1,.09,.18)}
// a távolodó lövedék süvítése az indítás után
function srSndDepart(t,side){const a=AC,e=t+1.5,out=a.createGain(),pn=a.createStereoPanner?a.createStereoPanner():null;out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(.32,t+.12);out.gain.exponentialRampToValueAtTime(.0001,e);
  if(pn){pn.pan.setValueAtTime(0,t);pn.pan.linearRampToValueAtTime(.7*(side||1),e);out.connect(pn).connect(MASTER)}else out.connect(MASTER);
  const n=a.createBufferSource(),bp=a.createBiquadFilter();n.buffer=NOISE;n.loop=true;bp.type='bandpass';bp.Q.value=4;bp.frequency.setValueAtTime(2600,t);bp.frequency.exponentialRampToValueAtTime(700,e);n.connect(bp).connect(out);n.start(t,Math.random()*.5);n.stop(e+.02);
  const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(1500,t);o.frequency.exponentialRampToValueAtTime(620,e);g.gain.value=.06;o.connect(g).connect(out);o.start(t);o.stop(e+.02)}
// érkező lövedék: lebegő, ereszkedő hangú sivítás + egyre erősödő légzúgás, a becsapódás pillanatában elvágva
function srSndWhistle(dur,side,id){if(!srSnd())return;const P=srSP(id),a=AC,t=a.currentTime+.01,e=t+dur,sd=side||1,out=a.createGain(),pn=a.createStereoPanner?a.createStereoPanner():null,F0=P.f0,F1=P.f1;
  out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(.07,t+dur*.4);out.gain.exponentialRampToValueAtTime(P.gl?.38:.55,e-.05);out.gain.linearRampToValueAtTime(.0001,e);
  if(P.tb){const tl=a.createOscillator(),tg=a.createGain();tl.frequency.value=7;tg.gain.value=.03;tl.connect(tg).connect(out.gain);tl.start(t);tl.stop(e+.03)}// bukdácsoló hordozógránát
  if(P.rk){const n=a.createBufferSource(),lp=a.createBiquadFilter(),g=a.createGain();n.buffer=NOISE;n.loop=true;lp.type='lowpass';lp.frequency.value=520;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,e-.05);n.connect(lp).connect(g).connect(out);n.start(t,Math.random()*.5);n.stop(e+.03)}
  if(P.thin){srNoise(e-.09,.03,.5,'highpass',2500);srTone('square',3000,1200,e-.09,.03,.05)}// hangsebesség feletti csattanás érkezés előtt
  if(pn){pn.pan.setValueAtTime(-.45*sd,t);pn.pan.linearRampToValueAtTime(.1*sd,e);out.connect(pn).connect(MASTER)}else out.connect(MASTER);
  const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.setValueAtTime(5,t);lfo.frequency.linearRampToValueAtTime(14,e);lg.gain.value=P.gl?9:P.thin?36:24;lfo.connect(lg);
  for(const [r,v,ty] of [[1,.32,'sine'],[1.007,.2,'sine'],[2.01,P.thin?.1:.05,'triangle']]){const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(F0*r,t);o.frequency.exponentialRampToValueAtTime(F1*r,e);lg.connect(o.frequency);g.gain.value=v*(P.gl?.6:1);o.connect(g).connect(out);o.start(t);o.stop(e+.03)}
  const n=a.createBufferSource(),bp=a.createBiquadFilter(),ng=a.createGain();n.buffer=NOISE;n.loop=true;bp.type='bandpass';bp.Q.value=P.gl?3:7;bp.frequency.setValueAtTime(F0*1.05,t);bp.frequency.exponentialRampToValueAtTime(F1*1.04,e);ng.gain.value=1.2;n.connect(bp).connect(ng).connect(out);
  const n2=a.createBufferSource(),lp=a.createBiquadFilter(),g2=a.createGain();n2.buffer=NOISE;n2.loop=true;lp.type='lowpass';lp.frequency.setValueAtTime(400,t);lp.frequency.exponentialRampToValueAtTime(3400,e);g2.gain.setValueAtTime(.04,t);g2.gain.exponentialRampToValueAtTime(.75,e);n2.connect(lp).connect(g2).connect(out);
  for(const x of [n,n2]){x.start(t,Math.random()*.5);x.stop(e+.03)}lfo.start(t);lfo.stop(e+.03);SR.whN=out}
// becsapódás: ütés-csattanás, hosszú mély dübörgés, morajlás és visszhang, majd lehulló föld és repeszek
function srSndImpact(S,far,id){if(!srSnd())return;const P=srSP(id),t=AC.currentTime+.005,k=Math.min(1.7,S*P.ik)*(far?.6:1),fm=P.ifm,cr=P.cr,rl=P.rl;SR_DST=srOut();
  try{srNoise(t,.05,2*k*cr,'highpass',380*fm);srNoise(t,.02,1.5*k*cr,'bandpass',3200*fm,null,.5);if(cr>1.2)srNoise(t,.008,1.4*k,'highpass',5000);
    srNoise(t+.003,2.7*rl,1.9*k,'lowpass',(far?1800:6500)*fm,55);srSub(t,150*fm,24,2.3*rl,2.3*k);srSub(t+.02,85*fm,19,2.9*rl,1.5*k,'triangle');srSub(t+.09,50*fm,17,2.3*rl,1.25*k);
    srNoise(t+.15,3.6*rl,.95*k,'lowpass',260*fm,55);
    for(const [d,v,f] of [[.5,.55,850],[1.15,.38,540],[2,.24,380]]){srNoise(t+d*rl,1.2*rl,v*k,'lowpass',f*fm,70);srSub(t+d*rl,62*fm,26,1*rl,v*.8*k)}}
  finally{SR_DST=null}
  if(!far)for(let i=0;i<14;i++){const d=t+.25+Math.random()*1.7;snare(d,.04+Math.random()*.11);if(i%3===0)srNoise(d,.12,.14,'bandpass',600+Math.random()*900,null,2)}}
function srSndAir(){if(!srSnd())return;const t=AC.currentTime+.01;SR_DST=srOut();try{srNoise(t,.04,1.6,'highpass',1200);srNoise(t,.9,1,'lowpass',3200,260);srSub(t,130,40,1.2,1.4);for(const [d,v] of [[.5,.35],[1.1,.2]])srNoise(t+d,.9,v,'lowpass',700,90)}finally{SR_DST=null}for(let i=0;i<14;i++)snare(t+.12+Math.random()*.5,.05+Math.random()*.12);for(let i=0;i<9;i++){const d=t+.05+Math.random()*.6,f=2400+Math.random()*2600;srTone('sine',f,f*.45,d,.12+Math.random()*.1,.025)}}// szétrepülő volfrámrepeszek süvítése
function srSndHiss(){if(!srSnd())return;const t=AC.currentTime+.01;srNoise(t,1.6,.3,'bandpass',3200,900,.7);boom(t,.3,80)}
function srSndEfp(){if(!srSnd())return;const t=AC.currentTime+.01;srNoise(t,.05,1,'highpass',3000);srTone('sawtooth',2400,200,t,.14,.2);boom(t+.02,.9,50);srNoise(t+.05,.5,.5,'lowpass',2000,200)}

/* ---------- effektek ---------- */
// részecske-költségvetés: az eszköz teljesítményéhez (magok, memória) és a mért képkockasebességhez igazítva
function srQBase(){if(LOWFX)return .5;const cr=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory||4;return srClamp(.85+(cr-4)*.09+(mem-4)*.05,.75,1.6)}
const srN=n=>Math.max(1,Math.round(n*(SR.q||(LOWFX?.5:1))));
// izzó repeszdarabok: fehéren izzva indulnak, kihűlve parázslanak a földön
function srShards(x,y,n,v0,up){for(let i=0;i<srN(n);i++){const a=up?-Math.PI/2+(Math.random()-.5)*2.6:Math.random()*Math.PI*2,v=v0*(.35+Math.random()*.9),t=1.6+Math.random()*3;SR.fx.push({k:'h',x,y:y-2,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(up?40:90),t,t0:t,sz:1+Math.random()*1.6,rot:Math.random()*6})}}
function srDust(x,S,n){for(let i=0;i<srN(n);i++){const d=i%2?1:-1,t=2.2+Math.random()*2.4;SR.fx.push({k:'g',x:x+d*Math.random()*14,vx:d*(50+Math.random()*150)*S+SR.wind.x*.8,r0:6*S,r1:(20+Math.random()*26)*S,h:2+Math.random()*10,t,t0:t,dl:Math.random()*.12})}}
// valósághű becsapódás fázisai: vakító villanás és lökéshullám → izzó, gomolygó tűzgömb, ami sötét füstté hűl →
// felcsapó földoszlopok (ejekta) → szétrepülő rögök, kövek, repeszek (a földre hullva porfelhőt vernek) → talaj menti porgyűrű → lassan sodródó füstoszlop
function srBoomHE(x,y,S,dep){const F=SR.fx,dy=srClamp((dep||0)*.22,-16,16),R=Math.random;y+=dy;
  F.push({k:'fl',x,y:y-6,R:60*S,t:.16,t0:.16});F.push({k:'lt',x,y:y-10,R:260*S,t:.7,t0:.7});
  F.push({k:'r',x,y,R:150*S,t:.55,t0:.55});F.push({k:'r',x,y:y-4,R:95*S,t:.32,t0:.32});
  srShards(x,y,26*S,450,true);srDust(x,S,26);F.push({k:'e',x,r:30*S,t:10,t0:10});
  // tűzgömb: egymásba gomolygó, felfelé szálló lángcsomók
  for(let i=0;i<srN(12);i++){const a=-Math.PI/2+(R()-.5)*2.2,v=(30+R()*80)*S;F.push({k:'fb',x:x+(R()-.5)*18*S,y:y-6-R()*10*S,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,R:(16+R()*20)*S,t:.9+R()*.8,t0:1.7,sd:R()*9})}
  // ejekta: sötét földoszlopok kúpban
  for(let i=0;i<srN(16);i++){const a=-Math.PI/2+(R()-.5)*1.25,v=(220+R()*300)*S;F.push({k:'ej',x:x+(R()-.5)*10,y:y-2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:(2.5+R()*3.5)*S,t:.9+R()*.6,t0:1.5,c:R()<.5?'52,38,24':'78,60,38'})}
  // földpermet
  for(let i=0;i<srN(80);i++){const a=-Math.PI/2+(R()-.5)*2.1,v=(140+R()*360)*S;F.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:440,t:.9+R()*1.4,t0:2.3,c:R()<.22?'255,170,60':R()<.5?'70,52,30':'104,84,56',sz:1.2+R()*3})}
  // törmelék: rögök, kövek, gyökér- és repeszdarabok – a földre hullva megpattannak és porfelhőt vernek
  const DC=['#2a2018','#3b2c1c','#4a3824','#5d4a33','#6b6458','#857d70','#1e1a14'];
  for(let i=0;i<srN(36);i++){const a=-Math.PI/2+(R()-.5)*2.3,v=(80+R()*300)*S,st=R()<.3,t=2.6+R()*3.4;F.push({k:'d',x:x+(R()-.5)*8,y:y-4,vx:Math.cos(a)*v,vy:Math.sin(a)*v,rot:R()*6,vr:(R()-.5)*16,w:(st?2.5:3)+R()*(st?5:8),h:(st?2.5:1.6)+R()*(st?4:3.5),t,t0:t,c:DC[st?4+(R()*2|0):R()*4|0],pf:1})}
  for(let i=0;i<srN(10);i++){const a=-Math.PI/2+(R()-.5)*1.6,v=(260+R()*260)*S;F.push({k:'d',x,y:y-6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,rot:R()*6,vr:(R()-.5)*24,w:4+R()*9,h:1.3+R()*1.6,t:3+R()*2,t0:5,c:'#3a2a1a',pf:1,hot:R()<.35?1:0})}
  // a robbanás utáni füstoszlop (a széllel sodródik) és a krátert kitöltő sötét füst
  for(let i=0;i<srN(12);i++)F.push({k:'s',x:x+(R()-.5)*18*S,y:y-8,vx:(R()-.5)*12,vy:-60-R()*45,r0:8*S,r1:(24+R()*22)*S,t:5+R()*4,t0:9,c:'34,30,28',al:.38,dl:.45+i*.2,w:1});
  for(let i=0;i<srN(20);i++)F.push({k:'s',x:x+(R()-.5)*46*S,y:y-R()*30*S,vx:(R()-.5)*30+SR.wind.x*.5,vy:-26-R()*52,r0:9*S,r1:(28+R()*30)*S,t:2.4+R()*3,t0:5.4,c:R()<.5?'44,38,32':'96,82,64',al:.42,w:1});
  // a később lehulló finom föld
  for(let i=0;i<srN(24);i++){const gx=x+(R()-.5)*120*S;F.push({k:'p',x:gx,y:y-120*S-R()*80*S,vx:(R()-.5)*20,vy:20+R()*30,g:160,t:1.4+R()*1,t0:2.4,c:'92,74,48',sz:1+R()*1.6,dl:.6+R()*.8})}}
/* SMArt 155 résztöltetek: a csúcs után a hordozógránát fenéklapja leválik, a 2 résztöltet kilökődik;
   előbb kis fékezőernyő (lassítás, stabilizálás), majd forgó (örvény-) ejtőernyőn kb. 30°-os ferde tengellyel pörögve ereszkednek,
   a milliméteres radar és az infravörös érzékelő spirál alakban pásztázza a talajt; befogáskor a robbanóan formált lövedék (EFP) felülről csap le. */
function srSmartEject(x,y,face){if(srSnd()){const t=AC.currentTime+.01;sndPop();srNoise(t,.35,.25,'bandpass',1800,500,1);srMetal(t+.05,520,.06,.25);srMetal(t+.12,700,.05,.2)}
  const F=SR.fx;F.push({k:'fl',x,y,R:18,t:.1,t0:.1});for(let i=0;i<srN(10);i++)F.push({k:'s',x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*6,vx:face*(20+Math.random()*40),vy:-6+Math.random()*12,r0:3,r1:12+Math.random()*10,t:1.6+Math.random(),t0:2.6,c:'190,184,172',al:.5,drag:1.5,w:1});
  F.push({k:'d',x,y,vx:face*60,vy:-20,rot:0,vr:9,w:6,h:2.2,t:4,t0:4,c:'#4a4f36'});F.push({k:'d',x,y,vx:face*110,vy:10,rot:0,vr:-5,w:9,h:3,t:4,t0:4,c:'#3a3f2a'});// leváló fenéklap és hüvelyrész
  for(let i=0;i<srN(8);i++){const a=Math.random()*7,v=60+Math.random()*90;F.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:200,t:.4,t0:.5,c:'255,210,140',sz:1.2})}}
function srDrawSub(c,s,t){const u=s.t/s.T,gy=srGy(s.tx),y1=gy-26,fall=u<.18?(u/.18)*.32:.32+.68*(u-.18)/.82,e=Math.min(1,u*3),ee=e*(2-e),
    x=s.x+(s.tx-s.x)*ee+(u>.18?Math.sin(t*2.6+s.ph)*3:0),y=s.y+(y1-s.y)*fall,spin=t*9+s.ph,tilt=Math.sin(spin)*.5,h=gy-y,lock=s.hit&&u>.8,tg=s.tg;s.cx=x;s.cy=y;
  // radar/IR pásztázás: a 30°-os ferde tengely körbefordul → a talajfolt oda-vissza söpör
  if(u>.25){const fx=lock&&tg&&!tg.dead?tg.x:x+Math.tan(.52)*h*Math.sin(spin),fy=lock&&tg?tg.y-24:srGy(fx),w=lock?3:Math.max(6,h*.12);
    c.fillStyle=lock?'rgba(255,40,30,.22)':'rgba(255,90,70,.1)';c.beginPath();c.moveTo(x,y+4);c.lineTo(fx-w,fy);c.lineTo(fx+w,fy);c.closePath();c.fill();
    c.strokeStyle=lock?(Math.sin(t*30)>0?'rgba(255,50,40,.95)':'rgba(255,200,180,.9)'):'rgba(255,70,60,.5)';c.lineWidth=lock?1.6:1;c.beginPath();c.moveTo(x,y+4);c.lineTo(fx,fy);c.stroke();
    c.fillStyle=lock?'rgba(255,60,40,.9)':'rgba(255,120,90,.5)';c.beginPath();c.ellipse(fx,fy,lock?5:w*.9,lock?5:2,0,0,7);c.fill();
    if(lock&&tg){c.strokeStyle='rgba(255,60,40,.9)';c.lineWidth=1.2;const r=10+Math.sin(t*12)*2;c.strokeRect(tg.x-r,tg.y-24-r,r*2,r*2)}
    // radarimpulzusok: táguló ívek
    const pq=(s.t*2.4+s.i*.5)%1;c.strokeStyle=`rgba(255,140,120,${.35*(1-pq)})`;c.lineWidth=1;c.beginPath();c.arc(x,y+4,6+pq*Math.min(90,h),Math.PI*.2,Math.PI*.8);c.stroke()}
  // ernyő: előbb kis fékezőszalag, aztán forgó örvényernyő csíkokkal
  if(u<.18){c.strokeStyle='rgba(230,226,214,.85)';c.lineWidth=.7;c.beginPath();c.moveTo(x,y-3);c.lineTo(x-3,y-14);c.moveTo(x,y-3);c.lineTo(x+3,y-14);c.stroke();c.fillStyle='#e8e2cc';c.fillRect(x-3.5,y-18,7,4)}
  else{const op=Math.min(1,(u-.18)/.06),R=8.5*op;c.strokeStyle='rgba(225,222,210,.8)';c.lineWidth=.6;c.beginPath();c.moveTo(x-R*.8,y-12);c.lineTo(x,y-1);c.lineTo(x+R*.8,y-12);c.stroke();
    c.fillStyle='#d9d2bd';c.beginPath();c.ellipse(x,y-13,R,R*.55,0,Math.PI,0);c.fill();c.fillStyle='#8a5a3c';for(let k=0;k<4;k++){const a=(spin*.6+k*Math.PI/2)%(Math.PI*2),sx=Math.cos(a);if(Math.sin(a)<0)continue;c.fillRect(x+sx*R*.8-1,y-13-R*.45,2,R*.42)}}
  // a résztöltet teste: ferdén lógó, pörgő henger, alján az érzékelőfejjel
  c.save();c.translate(x,y);c.rotate(tilt);c.fillStyle='#3d4230';c.fillRect(-2.6,-2,5.2,8);c.fillStyle='#22262a';c.fillRect(-2.6,5,5.2,1.6);c.fillStyle=lock?'#ff3b30':'#c9a227';c.fillRect(-1,6.2,2,1.2);c.restore()}
function srSndPing(lk){if(!srSnd())return;const t=AC.currentTime+.01;srTone('sine',lk?3200:2600,lk?3300:2500,t,.05,.03);srTone('sine',lk?3200:2600,null,t+.07,.03,.012)}
function srSndLock(){if(!srSnd())return;const t=AC.currentTime+.01;for(let i=0;i<3;i++)srTone('square',1600+i*400,null,t+i*.07,.05,.035)}
function srBoomAir(x,y,R){const F=SR.fx;F.push({k:'r',x,y,R:R*1.1,t:.4,t0:.4});
  for(let i=0;i<4;i++)F.push({k:'b',x:x+(Math.random()-.5)*14,y:y+(Math.random()-.5)*10,vx:0,vy:0,R:18+Math.random()*14,t:.3,t0:.3});
  for(let i=0;i<srN(10);i++)F.push({k:'s',x:x+(Math.random()-.5)*26,y:y+(Math.random()-.5)*18,vx:(Math.random()-.5)*30+SR.wind.x*.5,vy:-6-Math.random()*14,r0:9,r1:22+Math.random()*16,t:2.2+Math.random()*1.5,t0:3.7,c:'22,22,24',al:.75});
  for(let i=0;i<srN(54);i++){const a=Math.PI/2+(Math.random()-.5)*2.5,v=420+Math.random()*320;F.push({k:'l',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:.9,t0:.9})}}
function srBoomSmall(x,y,S){const F=SR.fx;for(let i=0;i<3;i++)F.push({k:'b',x,y:y-4,vx:0,vy:-20,R:(12+Math.random()*8)*S,t:.3,t0:.3});
  for(let i=0;i<srN(14);i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=80+Math.random()*160;F.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:400,t:.5+Math.random()*.5,t0:1,c:'90,70,45',sz:1.5+Math.random()*2})}
  for(let i=0;i<5;i++)F.push({k:'s',x,y:y-6,vx:(Math.random()-.5)*20,vy:-20-Math.random()*20,r0:5,r1:16*S,t:1.4,t0:1.4,c:'60,54,48',al:.5})}
function srSparks(x,y,n){srShards(x,y,n*.35,300,false);for(let i=0;i<srN(n);i++){const a=Math.random()*Math.PI*2,v=120+Math.random()*320;SR.fx.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,g:380,t:.3+Math.random()*.6,t0:.9,c:'255,225,140',sz:1+Math.random()*1.8})}}
function srSmokeBurst(x,y){const F=SR.fx;for(let i=0;i<srN(26);i++){const a=-Math.PI/2+(Math.random()-.5)*2.8,v=60+Math.random()*190;F.push({k:'s',x,y:y-4,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,r0:6,r1:30+Math.random()*30,t:2.5+Math.random()*2,t0:4.5,c:'226,226,220',al:.7,drag:1.6})}
  for(let i=0;i<srN(18);i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=160+Math.random()*200;F.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:300,t:1+Math.random()*.8,t0:1.8,c:'255,250,230',sz:1.6,tr:1})}}
function srKill(v){v.dead=true;v.burn=99;v.hitF=1.2;v.hpGT=.9;const F=SR.fx,x=v.x,y=v.y-18;sndMega();srSndImpact(1.6);SR.shake=1.1;SR.flash=.8;try{navigator.vibrate&&navigator.vibrate([120,60,220])}catch(e){}
  srBoomHE(x,y+18,1.7,0);srSparks(x,y,60);srShards(x,y,46,560,true);v.cook=7;srBailOut(v);srCineKill(v);
  for(let i=0;i<srN(40);i++){const a=-Math.PI/2+(Math.random()-.5)*.5,s=260+Math.random()*420;F.push({k:'j',x:x-v.face*18+(Math.random()-.5)*10,y:y-8,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:.7+Math.random()*1.3,t0:2,dl:Math.random()*1.4})}
  for(let i=0;i<srN(18);i++){const a=-Math.PI/2+(Math.random()-.5)*2,s=160+Math.random()*320;F.push({k:'d',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,rot:0,vr:(Math.random()-.5)*16,w:5+Math.random()*12,h:3+Math.random()*5,t:3+Math.random()*2,t0:5,c:'#1c1a16',hot:1})}}
function srFloat(v,txt,col){SR.float.push({x:v.x,y:v.y-52-SR.float.filter(f=>f.v===v).length*13,txt,col,t:2.6,v})}
// lőszer-figyelmeztetés a lövés után: elfogyott típus (automatikus átváltással), kevés lőszer, teljes kifogyás
function srAmmoNote(v,id){const am=SR_AM[id];if(!am||!SR.v)return;const n=v.ammo[id]||0,tot=srAmmoN(v),mine=!v.ai&&(SR.mode!=='net'||v.i===SR.me),who=SR.mode==='hot'?v.name+': ':'';
  if(!mine){if(tot===0)srAlert('📻 '+v.name+' kifogyott a lőszerből!','info');else if(tot<=3)srAlert('📻 '+v.name+': már csak '+tot+' gránátja van','info');return}
  if(tot===0){srAlert(who+'KIFOGYOTT A LŐSZER!'+(srAmmoN(SR.v[1-v.i])?' Amíg az ellenfélnek van, a köreid kimaradnak.':' Utánpótlás érkezik.'),'crit');srUI();return}
  if(n===0){const nx=SR_AMMO.find(a=>v.ammo[a.id]>0&&a.dmg>0)||SR_AMMO.find(a=>v.ammo[a.id]>0);if(nx)v.sel=nx.id;srAlert(who+am.n+' ELFOGYOTT'+(nx?' → váltás: '+nx.n:''),tot<=5?'crit':'warn')}
  else if(tot<=5)srAlert(who+'Kevés lőszer: '+tot+' gránát maradt','warn');
  else if(n<=2&&am.q>2)srAlert(who+am.n+': még '+n+' db','info');
  srUI()}
// jól látható, hanggal és rezgéssel kísért figyelmeztetés a harcmező tetején (fontosság szerint: info, warn, crit)
function srAlert(txt,lvl){const el=$('#srAlert');if(!el)return;lvl=lvl||'info';el.className='sralert '+lvl;el.textContent=txt;el.hidden=false;void el.offsetWidth;el.classList.add('in');clearTimeout(SR.alT);SR.alT=setTimeout(()=>{el.classList.remove('in');SR.alT=setTimeout(()=>{el.hidden=true},260)},lvl==='crit'?4600:3400);
  try{navigator.vibrate&&navigator.vibrate(lvl==='crit'?[90,60,90,60,160]:lvl==='warn'?[60,50,60]:25)}catch(e){}
  if(srSnd()){const t=AC.currentTime+.02,n=lvl==='crit'?3:lvl==='warn'?2:1;for(let i=0;i<n;i++){srTone('square',lvl==='info'?1320:980,null,t+i*.19,.11,.07);srTone('square',lvl==='info'?1760:740,null,t+i*.19+.09,.09,.06)}}}
function srMsg(txt,dur){const m=$('#srMsg');if(!m)return;m.textContent=txt;m.hidden=!txt;clearTimeout(SR.msgT);if(txt&&dur!==0)SR.msgT=setTimeout(()=>{m.hidden=true},dur||3200)}

/* ---------- játékmenet ---------- */
function srBegin(mode,o){o=o||{};SR.bail=[];setTimeout(()=>{try{if(AC){srEngStartBuf();srRadioBuf();srTurretBuf();srLoaderHumBuf();for(let k=0;k<4;k++)srLoadBuf(k)}}catch(e){}},250);/* a hangminták előre elkészülnek, így az első kapcsoláskor sem akad */SR.cine=null;SR.cineQ=[];SR.cineF=0;SR.tutS=null;SR.tutE=null;clearTimeout(SR.allT);{const h=$('#harc');h&&h.classList.remove('srm')}SR.opts={mode,o};SR.paused=null;srPzShow(false);if(mode!=='net')srSaveDel();const seed=o.seed||(1+Math.random()*2147483000|0);
  Object.assign(SR,{mode,lvl:o.lvl??1,me:o.me||0,seed,drop:0,crates:[],camT:0,fx:[],smokes:[],flares:[],float:[],subs:[],last:[null,null],rep:[null,null],turn:0,round:1,phase:'prep',shot:null,pend:null,t:0,ai:{n:0,tx:0,q:[],wait:0},camFree:false,ovw:false,prepT:0,bgx:[],trc:[],bgT:.6,war:[],warT:2.5,nk:null,nkF:0,nkT:55+Math.random()*95,col:null,shake:0,flash:0,mv:0,pred:null,predK:''});
  if(mode!=='net')SR.inbox=[];
  const [xa,xb]=srGen(seed),nm=o.names||(mode==='ai'?[srMyName(),'Gép · '+SR_AI[SR.lvl].n]:['1. löveg','2. löveg']);
  SR.v=[srNewVeh(0,xa,nm[0],false),srNewVeh(1,xb,nm[1],mode==='ai')];for(const v of SR.v){const R=srRest(v);v.y=R.y;v.a=R.a}SR.ai.tx=xa;
  const c=srCtl();SR.cam={x:c.x,y:c.y-30,z:SR.zb*1.25};
  $('#srStart').hidden=true;$('#srOver').hidden=true;$('#srPanel').classList.remove('off');SR.run=true;srUI();srDials();
  srMsg('Indítsd be a löveget: MOTOR · RÁDIÓ · TORONY · MÁLHÁZÁS',6000)}
const srMyName=()=>(typeof USERDOC!=='undefined'&&USERDOC&&USERDOC.name)||'Te';
function srLoadDone(v){v.loading=false;v.load=1;v.ammo={};for(const a of SR_AMMO)v.ammo[a.id]=a.q}
function srPrep(dt){SR.prepT+=dt;const ctl=srCtl();
  for(const v of SR.v){if(v!==ctl){if(SR.prepT>.7)v.sys.eng=true;if(SR.prepT>1.1)v.sys.rad=true;if(SR.prepT>1.5)v.sys.tur=true;if(SR.prepT>1.9&&v.load<1)v.loading=true}
    if(v===ctl&&v.loading)srLoaderHum(true);if(v.loading){const b=Math.floor(v.load*60);v.load=Math.min(1,v.load+dt/2.75);const n=Math.floor(v.load*60);if(v===ctl&&n!==b){if(n%4===0)srLoadSnd();srUI()}if(v.load>=1){srLoadDone(v);if(v===ctl){srLoaderHum(false);srUI()}}}}
  if(SR.v.every(srReady)){SR.phase='aim';SR.turn=0;srMsg('💥 TŰZPÁRBAJ! '+(srMyTurn()&&SR.mode!=='hot'?'Te kezdesz.':SR.v[0].name+' kezd.'),3500);srTurnStart(true)}}
// mindkét löveg kifogyott: ejtőernyős lőszerláda érkezik mindkét löveg mögé (egyszer); ha az is elfogy, az életerő dönt
const SR_DROP=4;
function srAirdrop(){SR.drop=1;SR.phase='drop';SR.t=4.6;SR.camFree=false;SR.ovw=false;SR.crates=SR.v.filter(v=>!v.dead).map(v=>{const x=srClamp(v.x-v.face*78,40,SR_W-40);return {v,x,y:srGy(x)-560,land:0,sw:Math.random()*6}});
  srMsg('Mindkét löveg kifogyott – lőszerutánpótlás érkezik ejtőernyővel!',4200);if(srSnd()){const t=AC.currentTime+.02;srNoise(t,3.2,.18,'lowpass',380,120);srTone('sawtooth',70,62,t,3,.04)}srUI()}
function srDropTick(dt){for(const c of SR.crates||[]){if(c.land)continue;const gy=srGy(c.x)-9;c.y+=72*dt;c.x+=SR.wind.x*.05*dt;if(c.y>=gy){c.y=gy;c.land=1;srDust(c.x,.5,8);sndThud();SR.shake=Math.max(SR.shake,.15)}}
  if((SR.t-=dt)<=0){for(const c of SR.crates||[]){const v=c.v;v.ammo.dm121=(v.ammo.dm121||0)+SR_DROP;srFloat(v,'+'+SR_DROP+' DM121 lőszer','#9dff9d')}try{sndClink()}catch(e){}
    srMsg('Utánpótlás: löveg­enként '+SR_DROP+' gránát. Ha ez is elfogy, a több életerő nyer.',4200);SR.phase='aim';srTurnStart(true)}}
function srDrawCrates(c,t){for(const k of SR.crates||[]){const sw=k.land?0:Math.sin(t*1.6+k.sw)*.12;c.save();c.translate(k.x,k.y);c.rotate(sw);
    if(!k.land){c.strokeStyle='rgba(230,230,220,.8)';c.lineWidth=.8;c.beginPath();c.moveTo(-9,-6);c.lineTo(-22,-46);c.moveTo(9,-6);c.lineTo(22,-46);c.moveTo(0,-6);c.lineTo(0,-50);c.stroke();
      c.fillStyle='#d9d2bd';c.beginPath();c.moveTo(-26,-44);c.quadraticCurveTo(0,-74,26,-44);c.closePath();c.fill();c.strokeStyle='#5a5446';c.lineWidth=1;c.stroke();c.fillStyle='#b8402e';c.fillRect(-4,-62,8,16)}
    c.fillStyle='#4a5a2a';c.fillRect(-10,-8,20,16);c.strokeStyle='#1d2410';c.lineWidth=1.4;c.strokeRect(-10,-8,20,16);c.beginPath();c.moveTo(-10,0);c.lineTo(10,0);c.stroke();c.fillStyle='#f3d77a';c.fillRect(-5,-5,10,3);c.restore()}}
// a töltőautomata búgása, amíg málháznak (a hangminta: srLoaderHumBuf); leálláskor nagy levegő-kifúvás
function srLoaderHum(on,quiet){if(!on){const L=SR.ldr;if(L){SR.ldr=null;try{const t=AC.currentTime;L.g.gain.setTargetAtTime(.0001,t,.09);for(const x of L.st)x.stop(t+.6)}catch(e){}
    if(!quiet&&srSnd()){const t=AC.currentTime;srNoise(t+.02,.45,.22,'bandpass',3000,700,.9);srMetal(t+.08,300,.1,.4);srThump(t+.08,70,.25,.15)}}return}// leálláskor nagy levegő-kifúvás
  if(SR.ldr||!srSnd())return;const a=AC,t=a.currentTime,g=a.createGain(),src=a.createBufferSource();src.buffer=srLoaderHumBuf();src.loop=true;src.playbackRate.setValueAtTime(.45,t);src.playbackRate.exponentialRampToValueAtTime(1,t+.4);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.3);src.connect(g).connect(MASTER);src.start(t);srNoise(t,.25,.18,'bandpass',4200,2200,1);SR.ldr={g,st:[src]}}
function srTurnStart(first){const v=SR.v[SR.turn],o=SR.v[1-SR.turn];if(SR.slowW){SR.slowW=0;srMsg('')}
  if(!first){SR.smokes=SR.smokes.filter(s=>--s.turns>0);SR.flares=SR.flares.filter(f=>--f.turns>0)}
  v.fuel=SR_FUEL*(v.d.trk===1?.5:1);SR.camFree=false;SR.ovw=false;SR.pred=null;SR.predK='';
  if(v.burn>0&&!v.dead){v.burn--;v.hp=Math.max(0,v.hp-4);v.hitF=.45;v.hpGT=.7;srFloat(v,'🔥 −4','#ff9a4a');if(v.hp<=0){srKill(v);SR.phase='dying';SR.t=SR.bail&&SR.bail.length?(srCineOn()?7:5.6):2.8;srUI();return}if(!v.burn)srFloat(v,'tűz eloltva','#bfe3ff')}
  if(srAmmoN(v)===0){if(srAmmoN(o)===0){if(!SR.drop){srAirdrop();return}SR.phase='dying';SR.t=.6;SR.noAmmo=true;return}srAlert(v.name+': nincs lőszer – a kör kimarad','warn');SR.turn=1-SR.turn;if(SR.turn===0)SR.round++;SR.phase='wait';SR.t=1.4;return}
  if(!(v.ammo[v.sel]>0))v.sel=(SR_AMMO.find(a=>v.ammo[a.id]>0)||{}).id;
  SR.phase='aim';SR.tlEnd=v.ai?0:Date.now()+SR_TLIM*1000;SR.tlS=999;if(v.ai)srAiPlan();srUI();srDials();srSave();
  if(!first)srMsg(srMyTurn()?(SR.mode==='hot'?'▶ '+v.name+' következik':'▶ Te jössz – irányozz és TŰZ!'):'⏳ '+v.name+' céloz…',2600)}
function srFireVeh(v){const am=SR_AM[v.sel],tg=SR.v[1-v.i],mis=(v.d.ldr===1?.2:v.d.ldr===2?.4:0)+(v.crew<=1?.15:0);let ev;
  if(Math.random()<mis)ev={k:'skip',by:v.i,sx:v.x,wind:SR.wind};
  else{v.ammo[v.sel]--;ev=srResolve(v.i,srSim(v,tg,v.elev,v.trav,am,true),am)}
  if(!v.ai){const fb=$('#srFire');if(fb){fb.classList.remove('boom');void fb.offsetWidth;fb.classList.add('boom')}}
  ev.amo={...v.ammo};if(SR.mode==='net')srNetSend(ev);srPlay(ev,true);if(ev.k==='shot')srAmmoNote(v,ev.am)}
function srFire(){if(!srMyTurn()||SR.paused)return;const v=srCtl();
  if(!v.sys.tur&&v.d.tur<2){toast('Kapcsold vissza a TORONY főkapcsolót!');return}
  if(!(v.ammo[v.sel]>0)){srAlert(srAmmoN(v)?'Ebből a lőszerből nincs több – válassz másikat!':'Kifogyott a lőszer!','warn');return}
  SR.mv=0;srFireVeh(v);if(SR.tutS==='fire')srTutDone()}
function srPlay(ev,local){const v=SR.v[ev.by];SR.turn=ev.by;const ff=!local&&SR.mode==='net'?srNetLat():0;
  if(!local){if(Math.abs(v.x-ev.sx)>6)srMsg('⚠ '+v.name+' állást váltott!');v.x=ev.sx;if(ev.k==='shot'){v.elev=ev.elev;v.trav=ev.trav;v.sel=ev.am;if(ev.amo)v.ammo={...ev.amo};else if(v.ammo[ev.am]>0)v.ammo[ev.am]--}else if(ev.amo)v.ammo={...ev.amo}}
  SR.camFree=false;SR.ovw=false;SR.pred=null;
  if(ev.k==='skip'){srMsg(ev.to?'⏱ '+v.name+': lejárt az idő – a kör kimarad!':'⚙ '+v.name+': töltési hiba – a lövés kimarad!');srFloat(v,ev.to?'lejárt az idő':'töltési hiba','#ffd24a');srSwSnd(false);SR.phase='wait';SR.t=1.6;SR.wind=ev.wind;SR.turn=1-ev.by;if(SR.turn===0)SR.round++;srUI();return}
  if(!local)srAmmoNote(v,ev.am);SR.shot={ev,t:0,wh:false,n:ev.pts.length/2,ts:1,ff};SR.phase='fly';v.rec=1;v.x=srClamp(v.x-v.face*1.6,60,SR_W-60);v.av-=v.face*(1.1+Math.sin(v.elev/SR_MIL)*.9);srSndFire(v.face,ev.am);SR.shake=Math.max(SR.shake,.35);srCineFire(v,ev);try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}
  const m=srMuzzle(v,v.elev),th=v.elev/SR_MIL,dx=Math.cos(th)*v.face,dy=-Math.sin(th);
  // torkolattűz és nagy, gomolygó lőporfüst: előre kilőtt füstcsóva, a csőszájfékből oldalra kicsapó gyűrű, a lökéshullám felverte por, majd lassan szétterülő felhő
  const R=Math.random,chg=srChg(v.elev),K=ev.am==='smk'||ev.am==='ill'?.8:1;
  SR.fx.push({k:'fl',x:m.x+dx*8,y:m.y+dy*8,R:46,t:.1,t0:.1});SR.fx.push({k:'lt',x:m.x,y:m.y,R:200,t:.35,t0:.35});
  for(let i=0;i<7;i++)SR.fx.push({k:'b',x:m.x+dx*i*8,y:m.y+dy*i*8,vx:dx*70,vy:dy*70,R:(26-i*2.6)*K,t:.24+i*.02,t0:.38});
  for(let i=0;i<srN(26);i++){const sp=40+R()*190*chg;SR.fx.push({k:'s',x:m.x+dx*10,y:m.y+dy*10,vx:dx*sp+(R()-.5)*40,vy:dy*sp-10-R()*12,r0:6,r1:(26+R()*36)*K,t:2.4+R()*2.4,t0:4.8,c:R()<.5?'150,142,128':'118,110,98',al:.55,drag:1.7,w:1})}
  for(const sd of [-1,1])for(let i=0;i<srN(10);i++)SR.fx.push({k:'s',x:m.x-dx*6,y:m.y-dy*6,vx:-dy*sd*(80+R()*110)-dx*30,vy:dx*sd*(80+R()*110)-dy*30,r0:4,r1:(18+R()*16)*K,t:1.2+R()*1.2,t0:2.4,c:'214,206,190',al:.5,drag:2.6,w:1});
  for(let i=0;i<srN(8);i++)SR.fx.push({k:'s',x:m.x+dx*(20+i*12),y:m.y+dy*(20+i*12),vx:dx*20,vy:-8-R()*8,r0:10,r1:40+R()*30,t:4+R()*3,t0:7,c:'170,164,150',al:.32,drag:.8,w:1,dl:.15+i*.06});
  for(let i=0;i<srN(18);i++){const a=Math.atan2(dy,dx)+(R()-.5)*.5,sp=300+R()*400;SR.fx.push({k:'p',x:m.x,y:m.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:240,t:.25+R()*.3,t0:.55,c:'255,200,110',sz:1+R()*1.4})}
  srDust(v.x+v.face*20,1.2,20);srDust(v.x-v.face*30,.8,10);v.smk=6;if(ev.am==='vul')for(let i=0;i<3;i++)SR.fx.push({k:'d',x:m.x+dx*14,y:m.y+dy*14,vx:dx*(150+Math.random()*80)+(Math.random()-.5)*90,vy:dy*150+(Math.random()-.5)*90,rot:0,vr:(Math.random()-.5)*20,w:5,h:1.6,t:1.6,t0:1.6,c:'#5a5f66'});
  srUI()}
function srShotPos(S,t){const ev=S.ev,f=Math.min(S.n-1,t/ev.dt),i=Math.min(S.n-2,f|0),u=f-i,p=ev.pts;return {x:p[i*2]*(1-u)+p[i*2+2]*u,y:p[i*2+1]*(1-u)+p[i*2+3]*u,dx:p[i*2+2]-p[i*2],dy:p[i*2+3]-p[i*2+1],i}}
function srImpact(ev){const E=ev.end,am=SR_AM[ev.am],sh=SR.v[ev.by],tg=SR.v[1-ev.by],dep=(E.lat-SR.zOff)*sh.face;
  SR.last[ev.by]={pts:ev.pts,apex:ev.apex,by:ev.by,base:sh.y};
  for(const [x,r,d] of ev.cr)srCrater(x,r,d);
  if(E.type==='out'){}
  else if(ev.smoke){srSmokeBurst(E.x,E.y);srSndHiss();SR.smokes.push({x:E.x,y:E.y,turns:6,age:0})}
  else if(ev.flare){SR.flares.push({x:E.x,y:E.y,by:ev.by,turns:5});sndPop();srSparks(E.x,E.y,14);if(srSnd()){const t=AC.currentTime+.05;srNoise(t,.25,.35,'highpass',2000);srNoise(t+.1,2.4,.12,'bandpass',4200,2400,.8)}}
  else if(ev.subs){srSmartEject(E.x,E.y,sh.face);ev.subs.forEach((s,i)=>SR.subs.push({x:E.x,y:E.y,tx:s.x,hit:s.hit,t:0,T:ev.delay,ph:Math.random()*6,tg,i,pk:.9+i*.17,lk:0}))}
  else if(ev.dud){srBoomSmall(E.x,E.y,.7);sndThud()}
  else if(E.type==='air'){srBoomAir(E.x,E.y,am.R);srSndAir();SR.shake=Math.max(SR.shake,.3);SR.flash=.25;
    for(let i=0;i<srN(16);i++){const gx=E.x+(Math.random()-.5)*am.R*2.1;SR.fx.push({k:'s',x:gx,y:srGy(gx)-2,vx:0,vy:-14,r0:3,r1:12,t:1.2,t0:1.2,c:'120,100,70',al:.5,dl:.12+Math.random()*.25})}}
  else{const S=(am.kind==='laser'?.75:am.kind==='gps'&&am.id==='vul'?.6:am.id==='m2000'?1.15:am.kind==='vlap'?.85:1)*(.55+.45*ev.f);srBoomHE(E.x,E.y,S,dep);srSndImpact(S*(ev.f>.6?1.2:.85),ev.f<=.6,am.id);if(ev.f>.6){SR.shake=Math.max(SR.shake,.75*S);SR.flash=.35*S}else SR.shake=Math.max(SR.shake,.3);
    if(E.type==='hit')srSparks(E.x,E.y,E.brl?60:40);try{navigator.vibrate&&navigator.vibrate(90)}catch(e){}}
  SR.pend={ev,t:ev.delay||0}}
function srApply(ev){const sh=SR.v[ev.by],tg=SR.v[1-ev.by],E=ev.end;
  if(ev.subs)for(const s of ev.subs){const sy=srGy(s.x)-26;if(s.hit){srSndEfp();srSparks(tg.x,tg.y-30,36);SR.fx.push({k:'efp',x:s.x,y:sy,x2:tg.x+(Math.random()-.5)*20,y2:tg.y-28,t:.3,t0:.3});SR.fx.push({k:'fl',x:s.x,y:sy,R:26,t:.12,t0:.12});srBoomSmall(tg.x,tg.y-26,1.2);SR.shake=.4}else{srBoomAir(s.x,sy,22);srSndAir()}}// nincs befogás: önmegsemmisítés a levegőben
  let direct=false;
  for(const h of ev.hits){const v=SR.v[h.who],a=ev.after[h.who],bd=v.d;if(h.who===tg.i&&(E.type==='hit'||ev.subs))direct=true;
    // a robbanás meglöki a löveget: kis felugrás + billenés a robbanással ellentétes irányba
    if(h.dmg>0){const sd=Math.sign(v.x-E.x)||1;v.vy=-Math.min(170,26+h.dmg*3.4);v.y-=1.2;v.av+=sd*Math.min(1.6,.18+h.dmg*.035)*(E.y<v.y-20?.5:1)}
    v.hp=a.hp;v.crew=a.crew;v.burn=Math.max(v.burn,a.burn);v.d={...a.d};v.hurt+=h.dmg;if(h.dmg>0){v.hitF=Math.min(1.2,.45+h.dmg/40);v.hpGT=1;v.dmgL={n:(v.dmgL&&v.dmgL.t>0?v.dmgL.n:0)+h.dmg,t:2.6}}
    for(const k of ['eng','rad','tur'])if(v.d[k]>bd[k])v.sys[k]=false;
    if(h.dmg>=6){const dl=(E.x-v.x)*v.face/SR_VS,dr=E.type==='hit'||ev.subs;(v.dec=v.dec||[]).push({lx:srClamp(dr?dl:dl*.4,-96,84)+(Math.random()-.5)*14,ly:ev.subs?-58+Math.random()*8:dr?-34+Math.random()*24:-8+Math.random()*14,r:3+Math.min(7,h.dmg/7),t:7});if(v.dec.length>12)v.dec.shift()}
    srFloat(v,'−'+h.dmg,'#ff5a4a');for(const p of h.parts)srFloat(v,'⚠ '+SR_PN[p]+(p==='crew'?' megsebesült':v.d[p]>=2?' megsemmisült':' sérült'),'#ffd24a');
    if(h.cook)srFloat(v,'💥 LŐSZERBEROBBANÁS','#fff');
    if(v.hp<=0&&!v.dead)srKill(v)}
  let rep;if(E.type==='out')rep='a lövedék elhagyta a harcmezőt';else if(direct&&E.brl)rep='🎯 TALÁLAT A LÖVEGCSÖVÖN!';else if(direct)rep='🎯 TALÁLAT A CÉLON!';
  else if(ev.smoke)rep='ködgránát célban';else if(ev.flare)rep='világítótest a cél fölött';
  else{const dr=(E.x-tg.x)*sh.face,dl=E.lat-SR.zOff;rep=`${srM(Math.abs(dr))} m ${dr>0?'HOSSZÚ':'RÖVID'} · ${srM(Math.abs(dl))} m ${dl>0?'JOBBRA':'BALRA'}`}
  SR.rep[ev.by]={txt:sh.sys.rad&&sh.d.rad<2?rep:'nincs rádió – nincs megfigyelői jelentés',lat:E.lat,rf:srClamp(Math.abs(E.x-sh.x)/Math.abs(tg.x-sh.x||1),0,1.3),ok:sh.sys.rad&&sh.d.rad<2};
  if(!sh.ai&&(SR.mode!=='net'||ev.by===SR.me))srMsg('📻 Megfigyelő: '+SR.rep[ev.by].txt,4200);
  srUI()}
function srAfterShot(ev){if(SR.v.some(v=>v.dead)){SR.phase='dying';SR.t=SR.bail&&SR.bail.length?(srCineOn()?7:5.6):2.8;return}
  SR.wind=ev.wind;SR.turn=1-ev.by;if(SR.turn===0)SR.round++;srTurnStart()}
function srEnd(){if(SR.mode!=='net')srSaveDel();SR.paused=null;srPzShow(false);SR.phase='over';SR.run=false;srEngLoop(false);const [a,b]=SR.v;let w=a.dead&&b.dead?-1:a.dead?1:b.dead?0:a.hp===b.hp?-1:a.hp>b.hp?0:1;
  const mine=SR.mode==='hot'?null:SR.me,o=$('#srOver');let h;
  if(w<0)h=`<h3>🤝 DÖNTETLEN</h3><p>${SR.noAmmo?'Elfogyott a lőszer, és egyforma az életerőtök.':'Mindkét löveg harcképtelen.'}</p>`;
  else if(mine==null)h=`<h3>🏆 ${esc(SR.v[w].name)} GYŐZÖTT</h3><p>${esc(SR.v[1-w].name)} lövege megsemmisült.</p>`;
  else if(w===mine)h=`<h3>🏆 GYŐZELEM!</h3><p>${esc(SR.v[1-w].name)} lövege ${SR.noAmmo?'több sérülést szenvedett':'megsemmisült'}.</p>`;
  else h=`<h3>💀 MEGHALTÁL</h3><p>${SR.noAmmo?'Elfogyott a lőszer, és a te löveged sérült jobban.':'A PzH 2000-ed kiégett. Egy életed volt.'}</p>`;
  SR.noAmmo=false;const used=v=>60-srAmmoN(v);
  o.innerHTML=h+`<div class="rkres"><div><span>${esc(a.name)}<small>${used(a)} lövés</small></span><b class="${a.dead?'neg':''}">${a.dead?'megsemmisült':Math.round(a.hp)+'%'}</b></div><div><span>${esc(b.name)}<small>${used(b)} lövés</small></span><b class="${b.dead?'neg':''}">${b.dead?'megsemmisült':Math.round(b.hp)+'%'}</b></div><div><span>Körök</span><b class="dim">${SR.round}</b></div></div>
   <button class="btn pri" id="srAgain">🔁 Új játék ugyanezzel az ellenféllel</button> <button class="btn line" id="srBack">Ellenfélválasztás</button>`;
  o.hidden=false;$('#srPanel').classList.add('off');
  $('#srAgain').onclick=()=>{if(SR.mode==='net'){if(!SR.net){toast('Az ellenfél kilépett.');return}const seed=1+Math.random()*2147483000|0;srNetSend({k:'re',seed});srBegin('net',{...SR.opts.o,seed})}else srBegin(SR.opts.mode,{...SR.opts.o,seed:0})};
  $('#srBack').onclick=()=>{srNetLeave();srMenu()}}
function srMove(v,dir,dt){const o=SR.v[1-v.i];if(!(v.sys.eng&&v.d.eng<2)){if(!v.ai&&!SR.mvW){SR.mvW=1;toast(v.d.eng>=2?'A motor megsemmisült – nem tudsz mozogni.':'Előbb indítsd be a MOTORT!')}return false}
  if(v.d.trk>=2){if(!v.ai&&!SR.mvW){SR.mvW=1;toast('Leszakadt a lánctalp – a löveg mozgásképtelen.')}return false}
  if(v.fuel<=0){if(!v.ai&&!SR.mvW){SR.mvW=1;toast('Ebben a körben nem mehetsz tovább.')}return false}
  const sl=(srGy(v.x+dir*16)-srGy(v.x))/16;if(sl<-1.1)return false;
  const st=Math.min(v.fuel,34*srClamp(1+sl*.6,.35,1.3)*(v.d.eng?.6:1)*dt),nx=srClamp(v.x+dir*st,60,SR_W-60);
  if(Math.abs(nx-o.x)<320&&Math.abs(nx-o.x)<Math.abs(v.x-o.x))return false;
  if(nx===v.x)return false;v.trk+=(nx-v.x)*v.face;v.fuel-=Math.abs(nx-v.x);v.x=nx;
  if(Math.random()<dt*20)SR.fx.push({k:'g',x:v.x-dir*(30+Math.random()*14),vx:-dir*(16+Math.random()*26),r0:3,r1:11+Math.random()*8,h:1+Math.random()*4,t:1.3,t0:1.3});
  if(Math.random()<dt*7)SR.fx.push({k:'p',x:v.x-dir*40,y:srGy(v.x-dir*40)-1,vx:-dir*(30+Math.random()*50),vy:-40-Math.random()*50,g:420,t:.6,t0:.6,c:'84,64,38',sz:1.4});
  return true}
function srUpdate(dt,now){const P=SR.phase;
  for(const v of SR.v){const R=srRest(v);
    {const hT=v.dead?0:v.hp;if(v.hpD==null)v.hpD=v.hpG=hT;v.hpD+=(hT-v.hpD)*Math.min(1,dt*7);if(Math.abs(hT-v.hpD)<.05)v.hpD=hT;
      if(v.hpG<v.hpD)v.hpG=v.hpD;else if((v.hpGT=(v.hpGT||0)-dt)<=0)v.hpG=Math.max(v.hpD,v.hpG-dt*38);v.hitF=Math.max(0,(v.hitF||0)-dt)}
    if(v.y<R.y-.6){v.vy+=380*dt;v.y+=v.vy*dt;if(v.y>=R.y){const imp=v.vy;v.y=R.y;v.vy=imp>150?-imp*.22:0;if(imp>150)v.y-=.8;if(imp>70){v.av+=(Math.random()-.5)*imp*.007;srDust(v.x,Math.min(1,imp/260),8);sndThud();SR.shake=Math.max(SR.shake,Math.min(.35,imp/700))}}}
    else{v.y+=(R.y-v.y)*Math.min(1,dt*14);v.vy=0}
    v.av+=((R.a-v.a)*(v.y<R.y-.6?18:110)-v.av*(v.y<R.y-.6?3:13))*dt;v.a+=v.av*dt;if(!isFinite(v.a)||Math.abs(v.a-R.a)>.9){v.a=R.a+srClamp(v.a-R.a,-.9,.9);v.av*=-.3}
    v.rec=Math.max(0,v.rec-dt*1.6);if(v.dmgL&&v.dmgL.t>0)v.dmgL.t-=dt;
    if(v.smk>0){v.smk-=dt;if(Math.random()<dt*26){const m=srMuzzle(v,v.elev);SR.fx.push({k:'s',x:m.x,y:m.y,vx:SR.wind.x*.4+v.face*6,vy:-14-Math.random()*10,r0:1.5,r1:7+Math.random()*5,t:1.4,t0:1.4,c:'170,164,152',al:.3*Math.min(1,v.smk),w:1})}}
    if(v.sys.eng&&!v.dead&&v.d.eng<2&&Math.random()<dt*(SR.mvNow===v?22:5)){const p=srLocal(v,36,-14);SR.fx.push({k:'s',x:p.x,y:p.y,vx:-v.face*8+SR.wind.x*.3,vy:-16-Math.random()*10,r0:1.5,r1:SR.mvNow===v?10:6,t:.9,t0:.9,c:v.d.eng?'30,28,26':'96,92,86',al:v.d.eng?.5:.22,w:1})}
    if(v.cook>0){v.cook-=dt;if(Math.random()<dt*1.6){srShards(v.x-v.face*14,v.y-26,10,380,true);srSparks(v.x-v.face*14,v.y-26,8);SR.fx.push({k:'b',x:v.x-v.face*14,y:v.y-28,vx:0,vy:-30,R:22,t:.3,t0:.3});sndPop();SR.shake=Math.max(SR.shake,.15)}}
    for(const d of v.dec||[])d.t-=dt;
    if(v.dead){if(Math.random()<dt*22)SR.fx.push({k:'j',x:v.x+(Math.random()-.5)*50,y:v.y-22,vx:(Math.random()-.5)*26+SR.wind.x*.6,vy:-50-Math.random()*60,t:1.1+Math.random(),t0:2.1})}
    else if(v.burn>0){if(Math.random()<dt*16)SR.fx.push({k:'j',x:v.x+v.face*(22+Math.random()*20),y:v.y-20,vx:(Math.random()-.5)*20+SR.wind.x*.6,vy:-40-Math.random()*40,t:.8+Math.random()*.7,t0:1.5})}
    else if(v.hp<55||v.d.eng){if(Math.random()<dt*(v.hp<30?9:4))SR.fx.push({k:'s',x:v.x+v.face*26,y:v.y-22,vx:SR.wind.x*.6+(Math.random()-.5)*8,vy:-26-Math.random()*20,r0:3,r1:13+Math.random()*8,t:1.6,t0:1.6,c:'40,36,34',al:.45})}}
  for(const tr of SR.trees)if(tr.burn>0){tr.burn-=dt;if(Math.random()<dt*9)SR.fx.push({k:'j',x:tr.x+(Math.random()-.5)*5,y:srGy(tr.x)-8-Math.random()*8,vx:SR.wind.x*.5,vy:-34-Math.random()*26,t:.6+Math.random()*.6,t0:1.2})}
  for(const f of SR.flares){const fl=srGy(f.x)-70;if(f.y<fl)f.y=Math.min(fl,f.y+9*dt);f.x+=SR.wind.x*.12*dt}
  for(const s of SR.smokes)s.age+=dt;
  SR.subs=SR.subs.filter(s=>{s.t+=dt;const u=s.t/s.T;if(u>.25&&(s.pk-=dt)<=0){s.pk=.42;srSndPing(s.hit&&u>.78)}if(s.hit&&u>.8&&!s.lk){s.lk=1;srSndLock()}return s.t<s.T});
  if(SR.pend&&(SR.pend.t-=dt)<=0){const ev=SR.pend.ev;SR.pend=null;srApply(ev)}
  let moving=false;
  if(P==='prep')srPrep(dt);
  else if(P==='aim'){const v=SR.v[SR.turn];
    if(v.ai){const A=SR.ai;if((A.wait-=dt)<=0&&A.q.length){const q=A.q[0];
        if(q.k==='move'){const dir=Math.sign(q.dx),x0=v.x;if(srMove(v,dir,dt)){q.dx-=v.x-x0;moving=true}if(!moving||q.dx*dir<=0){A.q.shift();A.wait=.4}}
        else if(q.k==='aim'){if(!q.set){q.set=1;srAiAim(v,SR.v[1-v.i],q.am);srUI()}const st=Math.max(1,Math.round(330*dt));let done=true;
          for(const [k,t] of [['elev',A.te],['trav',A.tt]]){if(v[k]!==t){done=false;const b=v[k];v[k]+=srClamp(t-v[k],-st,st);if((b/10|0)!==(v[k]/10|0))srClick(0)}}
          if(done){A.q.shift();A.wait=.5}}
        else{A.q.shift();srFireVeh(v)}}}
    else if(srMyTurn()&&SR.mv){moving=srMove(v,SR.mv,dt);if(moving&&!SR.camFree)SR.ovw=false}
    if(SR.tlEnd&&SR.phase==='aim'){const left=(SR.tlEnd-Date.now())/1000,s=Math.ceil(left);
      if(srMyTurn()){if(s>0&&s!==SR.tlS){SR.tlS=s;if(s===60||s===30)srAlert('⏱ Még '+s+' másodperc a lövésre','info');if(s<=10)srClick(s<=3?2:1);if(s===10)srAlert('⏱ 10 másodperc! Lőj, különben a kör kimarad','warn')}if(left<=0){SR.mv=0;const e={k:'skip',to:1,by:v.i,sx:v.x,wind:SR.wind};srNetSend(e);srPlay(e,true)}}
      else if(left<-40&&SR.net){if(navigator.onLine===false){if(!SR.offW){SR.offW=1;srMsg('📴 Nincs internet – várakozás a kapcsolatra…',0)}SR.tlEnd=Date.now()-20000}else if(left<-300){srMsg('Az ellenfél 5 perce nem válaszol.');srNetGone()}else if(!SR.slowW){SR.slowW=1;srMsg('📞 Az ellenfél nem válaszol – lehet, hogy telefonál. Várunk rá (legfeljebb 5 percig)…',0)}}
      else if(SR.offW&&navigator.onLine!==false){SR.offW=0;srMsg('')}}}
  else if(P==='fly'){const S=SR.shot,ev=S.ev,T=(S.n-1)*ev.dt,tg=SR.v[1-ev.by],near=ev.end.type==='hit'||Math.abs(ev.end.x-tg.x)<130;
    // lassítás a becsapódás előtti utolsó pillanatban, ha a cél közelébe érkezik
    S.ts=near&&T-S.t<.38?.32:1;S.t+=dt*S.ts;if(S.ff>0&&T-S.t>1.6){const x=Math.min(S.ff,dt*.9);S.t+=x;S.ff-=x}
    if(!S.wh&&S.t>.4&&T-S.t<2.3&&ev.end.type!=='out'){S.wh=true;if(T-S.t>.3){srSndWhistle(T-S.t,SR.v[ev.by].face,ev.am);if(srIsMine(SR.v[1-ev.by])&&ev.end.type!=='out')srSndIncoming(T-S.t)}}
    if(ev.am==='vlap'&&S.t>.45&&S.t<1.35){const p=srShotPos(S,S.t);for(let i=0;i<2;i++)SR.fx.push({k:'j',x:p.x,y:p.y,vx:-p.dx*20+(Math.random()-.5)*20,vy:-p.dy*20+(Math.random()-.5)*20,t:.5,t0:.5})}
    if(S.t>=T){srImpact(ev);SR.phase='boom';SR.t=(ev.delay||0)+2.3-Math.min(1,S.ff||0);S.ff=0}}
  else if(P==='boom'){if((SR.t-=dt)<=0)srAfterShot(SR.shot.ev)}
  else if(P==='wait'){if((SR.t-=dt)<=0)srTurnStart()}
  else if(P==='dying'){if((SR.t-=dt)<=0)srEnd()}
  else if(P==='drop')srDropTick(dt);
  srEngRev(moving?1:0);SR.mvNow=moving?SR.v[SR.turn]:null;if(!SR.mv)SR.mvW=0;
  // kamera
  const cam=SR.cam,W=SR.W,H=SR.H;let tx=cam.x,ty=cam.y,tz=cam.z;
  if(!SR.camFree){
    if(SR.ovw){const [a,b]=SR.v;tx=(a.x+b.x)/2;tz=Math.min(SR.zb,W/(Math.abs(b.x-a.x)+260));ty=Math.min(a.y,b.y)-H*.12/tz}
    else if(P==='fly'){const S=SR.shot,ev=S.ev,T=(S.n-1)*ev.dt,p=srShotPos(S,S.t),left=T-S.t;
      if(left>1.4){const pr=srClamp(S.t/Math.max(.1,T-1.4),0,1);tx=p.x;ty=p.y+H*.05/SR.zb;tz=SR.zb*(srCineOn()?1.05+.3*Math.sin(Math.PI*pr):.82)}
      else{// a végfázisban a lövedék, a becsapódási pont és (ha közel van) a cél együtt kerül a képbe – a kép közepére
        const E=ev.end,tg=SR.v[1-ev.by],pts=[[p.x,p.y],[E.x,E.y],[E.x,E.y-60]];if(Math.abs(tg.x-E.x)<520)pts.push([tg.x-50,tg.y-50],[tg.x+50,tg.y+20]);
        const F=srFrame(pts,SR.zb*1.35),u=srClamp((1.4-left)/1.1,0,1),e=u*u*(3-2*u),f0=[p.x,p.y+H*.05/SR.zb,SR.zb*(srCineOn()?1.05:.82)];tx=f0[0]+(F[0]-f0[0])*e;ty=f0[1]+(F[1]-f0[1])*e;tz=f0[2]+(F[2]-f0[2])*e}}
    else if(P==='boom'||P==='dying'||P==='over'){const d=SR.v.filter(v=>v.dead),pts=[];
      if(SR.subs.length){// SMArt: a kamera az ereszkedő résztölteteket és a célt követi közelről
        const tg=SR.v[1-SR.shot.ev.by];for(const s of SR.subs)if(s.cx!=null)pts.push([s.cx-40,s.cy-30],[s.cx+40,s.cy+20],[s.cx,srGy(s.cx)]);pts.push([tg.x-50,tg.y-40],[tg.x+50,tg.y+16])}
      else if(SR.shot){const E=SR.shot.ev.end,tg=SR.v[1-SR.shot.ev.by];pts.push([E.x,E.y],[E.x,E.y-70]);if(Math.abs(tg.x-E.x)<520)pts.push([tg.x-55,tg.y-55],[tg.x+55,tg.y+22])}
      for(const v of d)pts.push([v.x-60,v.y-70],[v.x+60,v.y+24]);if(!pts.length)pts.push([SR.v[0].x,SR.v[0].y],[SR.v[1].x,SR.v[1].y]);
      // lassú ráközelítés (filmszerű „push-in”)
      const F=srFrame(pts,SR.zb*1.3),pin=1+Math.min(.12,(SR.camT=(SR.camT||0)+dt)*.04);tx=F[0];ty=F[1];tz=F[2]*pin}
    else if(P==='drop'){const [a,b]=SR.v,pts=[[a.x-60,a.y-40],[b.x+60,b.y-40]];for(const c of SR.crates||[])pts.push([c.x,c.y-30]);const F=srFrame(pts,SR.zb);tx=F[0];ty=F[1];tz=F[2]}
    else{const v=P==='prep'?srCtl():SR.v[SR.turn];tx=v.x+v.face*W*.2/SR.zb*(P==='prep'?-.6:1);ty=v.y-34;tz=SR.zb*(P==='prep'?1.3:1)}}
  if(SR.cine&&SR.cine.f){const F=SR.cine.f(SR.cine);if(F){tx=F[0];ty=F[1];tz=F[2]}}
  if(P!=='boom'&&P!=='dying'&&P!=='over')SR.camT=0;
  const fin=P==='fly'&&SR.shot&&(SR.shot.n-1)*SR.shot.ev.dt-SR.shot.t<1.4,k=Math.min(1,dt*(SR.cine&&SR.cine.f?SR.cine.ck||4:P==='fly'?(fin?5:9):P==='boom'||P==='dying'?2.4:3.2));cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;cam.z+=(tz-cam.z)*Math.min(1,dt*(fin?3.6:2.6))}
// a megadott világpontokat a kép közepére keretezi: [cam.x, cam.y, zoom] (a nézet a képernyő 62%-ánál horgonyzott)
function srFrame(pts,zmax){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const W=SR.W,H=SR.H,z=srClamp(Math.min(zmax,W*.7/Math.max(60,x1-x0),H*.46/Math.max(40,y1-y0)),SR.zb*.35,zmax);return [(x0+x1)/2,(y0+y1)/2+H*.14/z,z]}

/* ---------- rajzolás ---------- */
// PzH 2000 HU: a magyar álcafestésű (zöld – sötét kékesszürke – homok) modellképek
// A modell három méretben, kész képfájlként (atlasz): test, cső, kiégett test, kiégett cső egymás alatt.
// Szándékosan nincs memóriában tartott rajzvászon: azt a telefon háttérbe tételkor kiürítheti, és a modell eltűnne.
const SR_ATL=[['img/sprite9.webp',1],['img/sprite10.webp',.5],['img/sprite11.webp',.25]].map(([src,s])=>({src,s,img:null}));
function srAtlas(eff){const want=eff<.3?2:eff<.6?1:0;for(const i of [want,1,0,2]){const A=SR_ATL[i];if(!A.img){A.img=new Image();A.img.src=A.src}if(A.img.complete&&A.img.naturalWidth>0)return A}return null}
function srDrawVeh(c,v){const k=PK,eff=SR.cam.z*SR.dpr*SR_VS*PK,AT=srAtlas(eff),as=AT?AT.s:1,dy=v.dead?248:0;
  {const gy=srGy(v.x);c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(v.x,gy+1,52,5,v.a,0,7);c.fill()}
  const rk=Math.sin(Math.min(1,v.rec*1.4)*Math.PI),sw=rk*9+Math.sin(v.trk*.5)*1.5;
  c.save();c.translate(v.x-v.face*rk*1.6,v.y);c.rotate(v.a);c.scale(SR_VS*v.face,SR_VS);
  // futómű
  const broke=v.d.trk>=2||v.dead;c.lineJoin='round';c.lineCap='round';
  c.beginPath();if(broke){c.moveTo(-20,32);c.lineTo(92,32);c.lineTo(102,14);c.lineTo(-10,12)}else{c.moveTo(-100,12);c.lineTo(-99,24);c.lineTo(-88,32);c.lineTo(88,32);c.lineTo(99,24);c.lineTo(100,12);c.closePath()}
  c.lineWidth=9;c.strokeStyle='#161412';c.stroke();c.setLineDash([4,2]);c.lineDashOffset=-v.trk/SR_VS*1.1;c.lineWidth=5;c.strokeStyle='#3d3a34';c.stroke();c.setLineDash([]);
  if(broke){c.lineWidth=6;c.strokeStyle='#1d1b18';c.setLineDash([3,3]);c.beginPath();c.moveTo(-150,33);c.lineTo(-30,33);c.stroke();c.setLineDash([])}
  for(const w of D_WHEELS){c.fillStyle='#2b2a26';c.beginPath();c.arc(w.lx,22,w.r,0,7);c.fill();c.fillStyle=v.dead?'#2e2c28':'#55534a';c.beginPath();c.arc(w.lx,22,w.r*.62,0,7);c.fill();
    c.save();c.translate(w.lx,22);c.rotate(v.trk/SR_VS/w.r);c.fillStyle='#1f1e1a';for(let i=0;i<5;i++){c.rotate(Math.PI*2/5);c.fillRect(-1,w.r*.2,2,w.r*.35)}c.restore()}
  // cső: a magassági szög a vízszinteshez mért (a tűzvezető kiegyenlíti a dőlést)
  const th=(v.dead?-40:v.elev)/SR_MIL,wx=Math.cos(th)*v.face,wy=-Math.sin(th),ca=Math.cos(-v.a),sa=Math.sin(-v.a),lx=(wx*ca-wy*sa)*v.face,ly=wx*sa+wy*ca;
  c.save();c.translate(-8,-37.2);c.rotate(Math.atan2(ly,lx));c.translate(-Math.sin(Math.min(1,v.rec*1.4)*Math.PI)*34,0);if(AT)c.drawImage(AT.img,0,(184+dy)*as,466*as,61*as,6*k,-28*k,466*k,61*k);else{c.fillStyle=v.dead?'#191714':'#546644';c.fillRect(0,-5,196,9);c.fillRect(184,-7,14,13)}
  if(v.d.brl&&!v.dead){c.fillStyle='rgba(15,12,10,.6)';c.fillRect(90,-9,v.d.brl>1?46:22,9)}c.restore();
  if(AT)c.drawImage(AT.img,0,dy*as,738*as,180*as,-PCX*k,10-PBY*k,738*k,180*k);else{c.fillStyle=v.dead?'#191714':'#546644';c.beginPath();c.moveTo(-112,12);c.lineTo(-112,-18);c.lineTo(-114,-66);c.lineTo(-2,-66);c.lineTo(8,-22);c.lineTo(86,-18);c.lineTo(102,-2);c.lineTo(100,12);c.closePath();c.fill()}
  if(!v.dead){// magyar hadijel: kis piros–fehér–zöld ék a torony oldalán, csúcsával előre
    c.save();c.translate(-37.5,-25);const tri=(s,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(-s,-s*.8);c.lineTo(s*1.1,0);c.lineTo(-s,s*.8);c.closePath();c.fill()};tri(6,'#f4f1e6');tri(5,'#c8102e');c.save();c.translate(-1.1,0);tri(3.3,'#f4f1e6');c.restore();c.save();c.translate(-2,0);tri(1.8,'#3d7a4a');c.restore();c.restore();
    // rendszámtábla (H–7xxxx), menetlámpa
    c.fillStyle='#e9e6d8';c.fillRect(80,-6,13,5);c.fillStyle='#22241c';c.fillRect(82,-4.4,9,1.8);if(v.sys.eng){c.fillStyle='rgba(255,236,170,.9)';c.beginPath();c.arc(97,-9,2.2,0,7);c.fill()}
    // rádióantennák (menet és lövés közben kilengenek)
    c.strokeStyle='#15170f';c.lineWidth=1.3;c.lineCap='round';for(const ax of [-96,-22]){c.beginPath();c.moveTo(ax,-52);c.quadraticCurveTo(ax-sw*.4,-86,ax-sw*1.5,-118);c.stroke()}
    // korom- és repesznyomok a sérülés arányában
    const n=Math.floor((100-v.hp)/9);c.fillStyle='rgba(12,10,8,.5)';for(let i=0;i<n;i++){const h=Math.abs(Math.sin((i+1)*37.7+v.i*5)*1e4%1),h2=Math.abs(Math.sin((i+1)*91.3+v.i)*1e4%1),tur=i%3===0;c.beginPath();c.ellipse(tur?-98+h*90:-80+h*150,tur?-52+h2*26:-10+h2*14,5+h2*7,3+h*3,h*3,0,7);c.fill()}
    // friss találatok: izzó peremű átütések, amelyek kihűlve kormos lyukká válnak
    for(const d of v.dec||[]){const hot=Math.max(0,d.t/7);c.fillStyle='rgba(8,7,6,.85)';c.beginPath();c.arc(d.lx,d.ly,d.r,0,7);c.fill();c.fillStyle='rgba(10,9,8,.4)';c.beginPath();c.ellipse(d.lx,d.ly-d.r,d.r*1.5,d.r*2.2,0,0,7);c.fill();
      if(hot>0){c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(255,${120+hot*120|0},${30+hot*90|0},${hot})`;c.lineWidth=1.6+hot*1.6;c.beginPath();c.arc(d.lx,d.ly,d.r,0,7);c.stroke();c.globalCompositeOperation='source-over'}}
    if(v.d.opt){c.fillStyle='#0c0b0a';c.fillRect(-36,-76,10,6)}if(v.d.tur){c.fillStyle='rgba(10,9,8,.55)';c.beginPath();c.ellipse(-12,-40,9,16,.2,0,7);c.fill()}
    const mine=v.i===SR.me&&SR.mode!=='hot'||SR.mode==='hot'&&v.i===0;c.fillStyle=mine?'#4fd17a':'#ff5a4a';c.fillRect(-96-sw*1.5,-118,12,7)}
  c.restore()}
function srDrawSoldier(c,x,y,dir,ph,carry){c.save();c.translate(x,y);c.scale(dir*1.25,1.25);const s=Math.sin(ph)*3;
  c.strokeStyle='#2e3620';c.lineWidth=1.5;c.lineCap='round';c.beginPath();c.moveTo(0,-6);c.lineTo(s,0);c.moveTo(0,-6);c.lineTo(-s,0);c.stroke();
  c.fillStyle='#55683a';c.fillRect(-1.7,-12,3.4,6.6);c.fillStyle='#c99b76';c.beginPath();c.arc(0,-13.6,1.7,0,7);c.fill();c.fillStyle='#39432a';c.beginPath();c.arc(0,-14,2,Math.PI,0);c.fill();
  c.strokeStyle='#55683a';c.lineWidth=1.3;c.beginPath();c.moveTo(0,-11);c.lineTo(carry?2.6:s*.5,carry?-9:-7);c.stroke();
  if(carry){c.fillStyle='#3E4A1E';c.fillRect(1,-10.6,6.4,2.4);c.beginPath();c.arc(7.4,-9.4,1.2,-1.6,1.6);c.fill();c.fillStyle='#E8C547';c.fillRect(3,-10.6,1,2.4)}c.restore()}
function srDrawCrew(c,v,now){if(v.load>=1&&!v.loading)return;const px=v.x-v.face*108,hx=v.x-v.face*54,py=srGy(px),left=Math.round(12*(1-v.load));
  c.fillStyle='#6b4a2a';c.fillRect(px-12,py-3,24,3);c.fillStyle='#3E4A1E';for(let i=0;i<left;i++){const col=i%4,row=i/4|0;c.fillRect(px-11+col*5.6,py-6-row*3.3,5,2.6);c.fillStyle=i%2?'#3E4A1E':'#46542a'}
  for(let i=0;i<5;i++){if(!v.loading){const x=px+v.face*(8+i*7)-v.face*30;srDrawSoldier(c,x,srGy(x),v.face,0,false);continue}
    const u=(now/1000*1.7+i/5)%1,go=u<.5,p=go?u*2:1-(u-.5)*2,x=px+(hx-px)*p;srDrawSoldier(c,x,srGy(x),go?v.face:-v.face,now/70+i*2,go)}}
/* ---------- háttér: tájkép, háborús jelenetek, távoli atomcsapás ---------- */
// arányosítás: a háttér elemei a távolságuknak (parallaxis) és a kamera nagyításának megfelelő méretben látszanak
const srBgS=()=>srClamp(.62+.38*SR.cam.z/(SR.zb||1),.55,1.3);
const srHash=k=>Math.abs(Math.sin(k*91.7+3.1)*1e4%1);
// hegygerinc egy parallaxis-rétegen: a domborzat a kamera világkoordinátájához kötött, így lassabban úszik, mint az előtér
function srRidgeY(x,z,pf,amp,ph,hz){const wx=(x/z+SR.cam.x)*pf;return hz+10-amp*(.6+.4*Math.sin(wx/230+ph))*(.6+.4*Math.sin(wx/97+ph))*(.9+.1*Math.sin(wx/31+ph*3))}
function srRidge(c,W,H,hz,z,pf,amp,ph,c1,c2,trees){const g=c.createLinearGradient(0,hz-amp,0,hz+14);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W+6;x+=6)c.lineTo(x,srRidgeY(x,z,pf,amp,ph,hz));c.lineTo(W,H);c.fill();
  if(trees&&!LOWFX){const es=srBgS(),st=Math.max(3,4*es);c.fillStyle=c2;c.beginPath();for(let x=-4;x<=W+6;x+=st){const wx=(x/z+SR.cam.x)*pf,n=Math.sin(wx/61+ph)+Math.sin(wx/23);if(n<.15)continue;const y=srRidgeY(x,z,pf,amp,ph,hz),r=(1.6+1.4*Math.abs(Math.sin(wx*1.7)))*es;c.moveTo(x+r,y);c.arc(x,y-r*.4,r,0,7);c.moveTo(x+1,y-r*1.2);c.lineTo(x,y-r*2.6);c.lineTo(x-1,y-r*1.2)}c.fill()}}
// síkság a horizont előtt: légköri távlat, szántóföld-csíkok
function srPlain(c,W,H,hz){const y0=hz+8,g=c.createLinearGradient(0,y0,0,Math.max(y0+40,H));g.addColorStop(0,'#5a3c2e');g.addColorStop(.25,'#45302a');g.addColorStop(1,'#2a1c16');c.fillStyle=g;c.fillRect(0,y0,W,H);
  if(LOWFX)return;for(let i=1;i<7;i++){const y=y0+i*i*2.2;c.fillStyle=`rgba(${i%2?'120,86,52':'20,12,8'},${.1-i*.008})`;c.fillRect(0,y,W,1+i*.5)}}
// egy ház sziluettje (ép, romos vagy égő)
function srHouse(c,x,y,w,h,kind,t,k){c.fillStyle='#24171a';if(kind===2){c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h*.7);c.lineTo(x+w*.3,y-h*.45);c.lineTo(x+w*.55,y-h);c.lineTo(x+w*.7,y-h*.5);c.lineTo(x+w,y-h*.6);c.lineTo(x+w,y);c.fill();return}
  c.fillRect(x,y-h,w,h);c.beginPath();c.moveTo(x-1,y-h);c.lineTo(x+w/2,y-h-h*.6);c.lineTo(x+w+1,y-h);c.fill();
  const lit=srHash(k*3.7)>.55;if(lit){c.fillStyle=`rgba(255,196,110,${.55+.25*Math.sin(t*2+k)})`;c.fillRect(x+w*.2,y-h*.65,w*.18,h*.28);c.fillRect(x+w*.6,y-h*.65,w*.18,h*.28)}}
// távoli harctér a síkságon: falvak templomtoronnyal, villanyoszlopsor, égő roncsok füstoszlopa – mind parallaxissal és távolsággal arányos méretben
function srBgFar(c,W,H,hz,t){const es=srBgS(),z=SR.cam.z,pf=.4,off=SR.cam.x*pf*z,sp=150*es;
  // villanyoszlopsor vezetékkel
  if(!LOWFX){const ps=120*es,o2=SR.cam.x*.3*z,k0=Math.floor(o2/ps)-1,k1=Math.floor((o2+W)/ps)+1;let px=null,py=0;c.strokeStyle='#22161a';c.lineWidth=1;
    for(let k=k0;k<=k1;k++){if(srHash(k*.37+11)<.12){px=null;continue}const x=k*ps-o2,y=hz+3,h=26*es;c.beginPath();c.moveTo(x,y);c.lineTo(x-3*es,y-h);c.moveTo(x,y);c.lineTo(x+3*es,y-h);c.moveTo(x-6*es,y-h+3*es);c.lineTo(x+6*es,y-h+3*es);c.stroke();
      if(px!=null){c.beginPath();c.moveTo(px-6*es,py);c.quadraticCurveTo((px+x)/2,py+7*es,x-6*es,y-h+3*es);c.moveTo(px+6*es,py);c.quadraticCurveTo((px+x)/2,py+7*es,x+6*es,y-h+3*es);c.stroke()}px=x;py=y-h+3*es}}
  for(let k=Math.floor(off/sp)-1;k<=Math.floor((off+W)/sp)+1;k++){const h=srHash(k),x=k*sp-off+h*110*es,y=hz-4+h*14;
    if(h<.35){// falu: néhány ház, néha templom; egyes házak romosak vagy égnek
      if(h<.2){const n=3+(h*20|0)%3;for(let i=0;i<n;i++){const hh=srHash(k*7+i),kind=hh<.18?2:hh>.85?1:0,hx=x+i*13*es,hy=y+4+hh*3;srHouse(c,hx,hy,10*es,(7+hh*4)*es,kind,t,k+i);
          if(kind===1){const fl=.6+.4*Math.sin(t*9+i+k);c.fillStyle=`rgba(255,${120+fl*70|0},30,${.8*fl})`;c.beginPath();c.arc(hx+5*es,hy-11*es,(3+fl*3)*es,0,7);c.fill();
            for(let j=0;j<(LOWFX?3:6);j++){const q=(t*.1+j/6+hh)%1;c.fillStyle=`rgba(34,24,24,${.3*(1-q)})`;c.beginPath();c.arc(hx+5*es+q*q*40*es+SR.wind.x*q,hy-14*es-q*120*es,(4+q*22)*es,0,7);c.fill()}}}
        if(h<.09){const cx=x+n*13*es+4*es,cy=y+6;c.fillStyle='#24171a';c.fillRect(cx,cy-24*es,6*es,24*es);c.beginPath();c.moveTo(cx-1,cy-24*es);c.lineTo(cx+3*es,cy-38*es);c.lineTo(cx+6*es+1,cy-24*es);c.fill();c.fillRect(cx+2.6*es,cy-44*es,.8*es,6*es);c.fillRect(cx+1.4*es,cy-42*es,3.2*es,.8*es)}}
      continue}
    // égő roncs füstoszloppal
    for(let i=0;i<(LOWFX?4:7);i++){const q=(t*.11+i/7+h)%1;c.fillStyle=`rgba(28,20,22,${.34*(1-q)})`;c.beginPath();c.arc(x+q*q*70*es+SR.wind.x*q*2+Math.sin(q*5+k)*8*es,y-12*es-q*190*es,(6+q*32)*es,0,7);c.fill()}
    c.fillStyle='#1e1416';c.fillRect(x-15*es,y-8*es,30*es,8*es);c.fillRect(x-6*es,y-14*es,13*es,6*es);c.fillRect(x+5*es,y-12*es,14*es,2*es);
    if(h>.6){const fl=.6+.4*Math.sin(t*11+k*3);c.fillStyle=`rgba(255,${110+fl*80|0},30,${.85*fl})`;c.beginPath();c.arc(x,y-15*es,(4+fl*4)*es,0,7);c.fill()}}}
// harckocsioszlop a távoli úton (porfelhővel) – lassan halad, a képből kiérve újra feltűnik
function srColumn(c,W,H,hz,dt,t){const es=srBgS(),C=SR.col||(SR.col={x:Math.random()*W,d:Math.random()<.5?1:-1});C.x+=C.d*7*es*dt;const L=6*34*es;if(C.d>0&&C.x-L>W+60)C.x=-60;if(C.d<0&&C.x+L<-60)C.x=W+60;
  const y=hz+11,par=-(SR.cam.x*.5*SR.cam.z)%(W+400);for(let i=0;i<6;i++){let x=C.x-C.d*i*34*es+par;x=((x+200)%(W+400)+W+400)%(W+400)-200;if(x<-40||x>W+40)continue;
    if(!LOWFX)for(let j=0;j<3;j++){const q=(t*.5+j/3+i*.3)%1;c.fillStyle=`rgba(110,84,60,${.22*(1-q)})`;c.beginPath();c.arc(x-C.d*(8+q*26)*es,y-2*es-q*8*es,(3+q*9)*es,0,7);c.fill()}
    c.fillStyle='#1c1214';c.fillRect(x-8*es,y-4*es,16*es,4*es);c.fillRect(x-4*es,y-7*es,8*es,3*es);c.fillRect(x+C.d*3*es,y-6.4*es,C.d*9*es,1.2*es)}}
// mozgó háborús jelenetek az égen és a horizonton: helikopterek, vadászgépek, rakéta-sorozatvető, világítórakéta
function srWarSpawn(W,H,hz){const r=Math.random(),es=srBgS(),L=Math.random()<.5,list=SR.war||(SR.war=[]);if(list.length>(LOWFX?2:5))return;
  if(r<.32)list.push({k:'heli',x:L?-50:W+50,y:hz*(.5+Math.random()*.3),vx:(L?1:-1)*(38+Math.random()*26)*es,t:0,fire:1.5+Math.random()*3});
  else if(r<.55){list.push({k:'jet',x:L?-80:W+80,y:hz*(.14+Math.random()*.28),vx:(L?1:-1)*(300+Math.random()*120)*es,t:0,tr:[]});srSndJet(L?-1:1)}
  else if(r<.82){const x0=W*(.1+Math.random()*.8),d=x0<W/2?1:-1,n=LOWFX?5:8+(Math.random()*5|0),rs=[];for(let i=0;i<n;i++)rs.push({x:x0+(Math.random()-.5)*6,y:hz+4,vx:d*(150+Math.random()*60)*es,vy:-(200+Math.random()*50)*es,dl:i*.16,tr:[],on:0});list.push({k:'mlrs',rs,t:0,snd:0})}
  else list.push({k:'flare',x:W*(.15+Math.random()*.7),y:hz*(.25+Math.random()*.2),t:0,T:14})}
function srWar(c,W,H,hz,dt,t){const es=srBgS();SR.warT=(SR.warT??2.5)-dt;if(SR.warT<=0){SR.warT=(LOWFX?8:3.5)+Math.random()*5;srWarSpawn(W,H,hz)}
  const add=[];SR.war=(SR.war||[]).filter(e=>{e.t+=dt;
    if(e.k==='heli'){e.x+=e.vx*dt;e.y+=Math.sin(e.t*1.3)*4*dt;const d=Math.sign(e.vx),s=es;c.save();c.translate(e.x,e.y);c.scale(d*s,s);c.rotate(.12);c.fillStyle='#1a1216';
      c.beginPath();c.ellipse(0,0,11,4.2,0,0,7);c.fill();c.fillRect(-26,-1.6,18,2.6);c.fillRect(-27,-5,2.4,6);c.fillRect(-2,-6,4,3);c.fillRect(-6,4,14,1.2);
      c.globalAlpha=.55;c.fillRect(-20*Math.abs(Math.cos(t*38)),-6.6,40*Math.abs(Math.cos(t*38))+.6,1.1);c.globalAlpha=1;c.restore();
      if((e.fire-=dt)<=0){e.fire=2.5+Math.random()*4;for(let i=0;i<2;i++)add.push({k:'rk',x:e.x,y:e.y+3,vx:e.vx*.4+d*(170+Math.random()*40)*es,vy:(70+Math.random()*30)*es,t:0,dl:i*.2})}
      return e.x>-80&&e.x<W+80}
    if(e.k==='rk'){if(e.dl>0){e.dl-=dt;return true}e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=25*dt;c.strokeStyle='rgba(255,230,160,.9)';c.lineWidth=1.6;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x-e.vx*.06,e.y-e.vy*.06);c.stroke();c.strokeStyle='rgba(200,190,180,.25)';c.lineWidth=2.5;c.beginPath();c.moveTo(e.x-e.vx*.06,e.y-e.vy*.06);c.lineTo(e.x-e.vx*.3,e.y-e.vy*.3);c.stroke();
      if(e.y>=hz+4){SR.bgx.push({x:e.x,y:hz+2+Math.random()*8,t:0,s:.45*es});return false}return e.t<6}
    if(e.k==='jet'){e.x+=e.vx*dt;const d=Math.sign(e.vx),s=es;e.tr.push(e.x-d*14*s,e.y);if(e.tr.length>60)e.tr.splice(0,2);
      c.strokeStyle='rgba(230,220,220,.16)';c.lineWidth=2*s;c.beginPath();for(let i=0;i<e.tr.length;i+=2)i?c.lineTo(e.tr[i],e.tr[i+1]-Math.sin(i)*.3):c.moveTo(e.tr[i],e.tr[i+1]);c.stroke();
      c.save();c.translate(e.x,e.y);c.scale(d*s,s);c.fillStyle='#160f13';c.beginPath();c.moveTo(14,0);c.lineTo(-10,-2);c.lineTo(-13,-6);c.lineTo(-15,-6);c.lineTo(-13,0);c.lineTo(-15,2);c.lineTo(-10,1.6);c.closePath();c.fill();c.beginPath();c.moveTo(2,0);c.lineTo(-6,7);c.lineTo(-8,7);c.lineTo(-5,0);c.fill();
      c.globalCompositeOperation='lighter';c.fillStyle=`rgba(255,${150+Math.random()*60|0},70,.85)`;c.beginPath();c.ellipse(-16,0,3+Math.random()*1.5,1.3,0,0,7);c.fill();c.globalCompositeOperation='source-over';c.restore();
      return e.x>-140&&e.x<W+140}
    if(e.k==='mlrs'){let alive=false;for(const r of e.rs){if(r.dl>0){r.dl-=dt;alive=true;continue}if(r.done)continue;alive=true;if(!r.on){r.on=1;SR.bgx.push({x:r.x,y:hz+3,t:.55,s:.25*es});if(!e.snd){e.snd=1;srSndSalvo(e.rs.length)}}
        r.vy+=70*es*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.tr.push(r.x,r.y);if(r.tr.length>44)r.tr.splice(0,2);
        c.strokeStyle='rgba(205,195,185,.22)';c.lineWidth=2.4*es;c.beginPath();for(let i=0;i<r.tr.length;i+=2)i?c.lineTo(r.tr[i],r.tr[i+1]):c.moveTo(r.tr[i],r.tr[i+1]);c.stroke();
        c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,236,170,.95)';c.beginPath();c.arc(r.x,r.y,1.8*es,0,7);c.fill();c.fillStyle='rgba(255,170,60,.35)';c.beginPath();c.arc(r.x,r.y,5*es,0,7);c.fill();c.globalCompositeOperation='source-over';
        if(r.y>=hz+3&&r.vy>0){r.done=1;SR.bgx.push({x:r.x,y:hz+2+Math.random()*10,t:0,s:.5*es})}}return alive&&e.t<20}
    if(e.k==='flare'){e.y+=5*dt;e.x+=SR.wind.x*.1*dt;const a=Math.min(1,e.t/.5)*Math.min(1,(e.T-e.t)/2),fl=.85+.15*Math.sin(t*23);c.globalCompositeOperation='lighter';const R=(90+40*fl)*es,g=c.createRadialGradient(e.x,e.y,0,e.x,e.y,R);g.addColorStop(0,`rgba(255,250,220,${.9*a})`);g.addColorStop(.08,`rgba(255,235,170,${.4*a})`);g.addColorStop(1,'rgba(255,220,140,0)');c.fillStyle=g;c.fillRect(e.x-R,e.y-R,R*2,R*2);c.globalCompositeOperation='source-over';
      c.strokeStyle=`rgba(200,200,190,${.5*a})`;c.lineWidth=.6;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x,e.y-12*es);c.stroke();c.fillStyle=`rgba(210,200,180,${.6*a})`;c.beginPath();c.arc(e.x,e.y-12*es,4*es,Math.PI,0);c.fill();
      if(!LOWFX&&Math.random()<dt*10)add.push({k:'sm',x:e.x,y:e.y,t:0});return e.t<e.T}
    if(e.k==='sm'){const q=e.t/4;c.fillStyle=`rgba(200,190,180,${.12*(1-q)})`;c.beginPath();c.arc(e.x+q*10,e.y-q*14,2+q*10,0,7);c.fill();return q<1}
    return false}).concat(add)}
function srSndJet(side){if(!srSnd())return;const a=AC,t=a.currentTime+.4,pn=a.createStereoPanner?a.createStereoPanner():null,n=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();n.buffer=NOISE;n.loop=true;bp.type='bandpass';bp.Q.value=.7;bp.frequency.setValueAtTime(2600,t);bp.frequency.exponentialRampToValueAtTime(380,t+3.4);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+1.2);g.gain.exponentialRampToValueAtTime(.0001,t+3.6);n.connect(bp).connect(g);if(pn){pn.pan.setValueAtTime(-.8*side,t);pn.pan.linearRampToValueAtTime(.8*side,t+3.4);g.connect(pn).connect(MASTER)}else g.connect(MASTER);n.start(t,Math.random()*.5);n.stop(t+3.7)}
function srSndSalvo(n){if(!srSnd())return;const t=AC.currentTime+.25;for(let i=0;i<n;i++){srNoise(t+i*.16,.5,.05,'bandpass',900+Math.random()*500,300,.8);boom(t+i*.16,.05,40)}}
/* Távoli nukleáris csapás a horizonton: villanás, felszálló tűzgömb, kondenzációs gyűrű, a horizonton végigfutó lökéshullám,
   gombafelhő (törzs + gomolygó kalap), a talajról felvert porszoknya – a hang a távolság miatt késve érkezik; a felhő a széllel sodródik, szétterül és végül eltűnik. */
function srNukeTick(dt,W,hz){if(!SR.run||SR.phase==='prep'||SR.phase==='over')return;if(SR.nk){SR.nk.t+=dt;if(SR.nk.t>78)SR.nk=null;return}
  SR.nkT=(SR.nkT??(55+Math.random()*95))-dt;if(SR.nkT>0)return;SR.nkT=300+Math.random()*300;
  SR.nk={t:0,fx:Math.random()<.5?.12+Math.random()*.18:.58+Math.random()*.14,// a kép közepén lévő feliratoktól oldalra
    cx:SR.cam.x,snd:0,sh:0,sd:Math.random()*9};setTimeout(()=>{if(SR.nk)srAlert('☢ Nukleáris detonáció a láthatáron, kb. 90 km – minket nem érint, folytassátok a tüzet!','info')},900)}
function srNuke(c,W,H,hz,dt,t){const N=SR.nk;if(!N)return;const T=N.t,U=Math.min(Math.max(W,H)*.4,H*.5,Math.max(70,(hz-64)/1.05)),X=N.fx*W-(SR.cam.x-N.cx)*.02*SR.cam.z+SR.wind.x*.1*T,A=T<34?1:Math.max(0,1-(T-34)/40),hot=Math.max(0,1-T/14),sd=N.sd;
  if(T>5.2&&!N.snd){N.snd=1;srSndNuke()}if(T>5.6&&!N.sh){N.sh=1;SR.shake=Math.max(SR.shake,.6)}
  // az ég felizzása
  {const g=c.createRadialGradient(X,hz,0,X,hz,W*.9),k=Math.max(0,1-T/22)*A;g.addColorStop(0,`rgba(255,210,150,${.55*k})`);g.addColorStop(.4,`rgba(255,140,70,${.22*k})`);g.addColorStop(1,'rgba(255,100,50,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
  const rise=1-Math.exp(-T/7),r=U*.16*Math.min(1,Math.sqrt(T/1.6))*(1+Math.min(.5,T*.012)),spread=1+Math.max(0,T-18)*.018,cy=Math.max(64+r*.9,hz-U*.15-U*1.15*rise);// a kalap mindig a képben marad
  // porszoknya a talajon
  {const w=U*Math.min(1.25,.1+T*.11)*spread,h=U*.06*Math.min(1,T/4);c.fillStyle=`rgba(120,92,76,${.5*A})`;c.beginPath();c.ellipse(X,hz+4,w,h,0,Math.PI,0);c.fill()}
  // törzs
  const top=cy+r*.55,n=LOWFX?7:12;for(let i=0;i<n;i++){const u=i/(n-1),y=hz-(hz-top)*u,w=U*(.075-.03*u+.02*Math.sin(u*9+sd+T*.3))*(T<2?T/2:1)*Math.min(1,spread*.9),col=hot*u>.05?`rgba(${150+hot*100|0},${80+hot*60|0},${50},${.85*A})`:`rgba(${112-u*20|0},${92-u*16|0},${84-u*12|0},${.8*A})`;
    c.fillStyle=col;c.beginPath();c.ellipse(X+Math.sin(u*5+T*.2)*U*.012,y,w,w*.9,0,0,7);c.fill()}
  // kalap: gomolygó tórusz – alul sötét, felül a lemenő nap felé világos
  const cw=r*(1.5+Math.min(.7,T*.05))*spread,ch=r*.82,m=LOWFX?12:22;
  for(let i=0;i<m;i++){const a=i/m*Math.PI*2+T*.25,px=X+Math.cos(a)*cw*.78,py=cy+Math.sin(a)*ch*.42-ch*.1,pr=r*(.42+.12*Math.sin(i*2.3+sd)),lit=.5-.5*Math.sin(a);
    c.fillStyle=`rgba(${(96+lit*80)*(1-hot)+255*hot|0},${(78+lit*60)*(1-hot)+150*hot|0},${(74+lit*40)*(1-hot)+60*hot|0},${.88*A})`;c.beginPath();c.arc(px,py,pr,0,7);c.fill()}
  {const g=c.createRadialGradient(X,cy-ch*.2,0,X,cy,cw*1.05);g.addColorStop(0,`rgba(${210*(1-hot)+255*hot|0},${170*(1-hot)+235*hot|0},${150*(1-hot)+170*hot|0},${.95*A})`);g.addColorStop(.6,`rgba(${130*(1-hot)+255*hot|0},${104*(1-hot)+130*hot|0},${96*(1-hot)+50*hot|0},${.9*A})`);g.addColorStop(1,'rgba(90,70,66,0)');c.fillStyle=g;c.beginPath();c.ellipse(X,cy-ch*.15,cw,ch*.78,0,0,7);c.fill()}
  if(hot>0){c.globalCompositeOperation='lighter';const g=c.createRadialGradient(X,cy,0,X,cy,r*1.4);g.addColorStop(0,`rgba(255,250,230,${hot})`);g.addColorStop(.5,`rgba(255,170,70,${.6*hot})`);g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.beginPath();c.arc(X,cy,r*1.4,0,7);c.fill();c.globalCompositeOperation='source-over'}
  // kondenzációs (Wilson-) gyűrű
  if(T>1.2&&T<6){const k=Math.sin((T-1.2)/4.8*Math.PI);c.strokeStyle=`rgba(240,236,232,${.45*k})`;c.lineWidth=U*.03;c.beginPath();c.ellipse(X,cy+r*.2,r*(1.6+(T-1.2)*.35),r*.38,0,0,7);c.stroke()}
  // lökéshullám a horizonton
  if(T<6){const d=W*T/3.2,k=1-T/6;c.strokeStyle=`rgba(255,230,190,${.55*k})`;c.lineWidth=2;c.beginPath();c.moveTo(X-d,hz+6);c.quadraticCurveTo(X,hz-6-U*.05*k,X+d,hz+6);c.stroke()}
  SR.nkF=T<.7?Math.pow(1-T/.7,2):0}
function srSndNuke(){if(!srSnd())return;const t=AC.currentTime+.02;SR_DST=srOut();try{srSub(t,46,16,7.5,1.3);srSub(t+.2,30,14,8.5,.9,'triangle');srNoise(t,8,.75,'lowpass',420,40);srNoise(t,.6,.5,'lowpass',1600,200);for(const [d,v] of [[1.2,.45],[2.6,.32],[4.4,.22]]){srNoise(t+d,2.4,v,'lowpass',300,50);srSub(t+d,40,18,2,v)}}finally{SR_DST=null}
  try{navigator.vibrate&&navigator.vibrate([200,80,400])}catch(e){}}
// távoli robbanások és nyomjelzők (a régi háttéranimáció, a távolsággal arányos mérettel)
function srBg(c,W,H,hz,dt,now){const t=now/1000;srBgFar(c,W,H,hz,t);srColumn(c,W,H,hz,dt,t);
  SR.bgT-=dt;if(SR.bgT<=0){SR.bgT=.9+Math.random()*2.2;SR.bgx.push({x:Math.random()*W,y:hz-2+Math.random()*18,t:0,s:(.5+Math.random()*.8)*srBgS()});if(SR.run&&SR.phase==='aim')sndFar(.03+Math.random()*.05)}
  SR.bgx=SR.bgx.filter(e=>{e.t+=dt;const k=e.t,R=e.s;
    if(k<.3){const g=c.createRadialGradient(e.x,e.y,0,e.x,e.y,150*R);g.addColorStop(0,`rgba(255,210,130,${.5*(1-k/.3)})`);g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.fillRect(e.x-150*R,e.y-150*R,300*R,300*R)}
    if(k<.8){c.fillStyle=`rgba(255,${170-k*160|0},40,${1-k/.8})`;c.beginPath();c.arc(e.x,e.y-k*34*R,(7+k*42)*R,0,7);c.fill()}
    c.fillStyle=`rgba(40,30,28,${Math.max(0,.4-k*.14)})`;c.beginPath();c.arc(e.x+k*12,e.y-18*R-k*40*R,(7+k*14)*R,0,7);c.fill();return k<3});
  if(Math.random()<dt*.9){const l=Math.random()<.5;SR.trc.push({x:l?Math.random()*W*.4:W*.6+Math.random()*W*.4,y:hz,vx:(l?1:-1)*(120+Math.random()*160),vy:-170-Math.random()*120,t:0,red:Math.random()<.5})}
  SR.trc=SR.trc.filter(r=>{r.t+=dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.vy+=110*dt;c.strokeStyle=r.red?'rgba(255,80,60,.8)':'rgba(255,230,140,.8)';c.lineWidth=2;c.beginPath();c.moveTo(r.x,r.y);c.lineTo(r.x-r.vx*.05,r.y-r.vy*.05);c.stroke();return r.t<2.6&&r.y<hz+10})}
function srDrawFx(c,dt){const F0=SR.fx;SR.fx=[];// a rajzolás közben keletkező részecskék az új tömbbe kerülnek (korábban elvesztek)
  const kept=F0.filter(f=>{if(f.dl>0){f.dl-=dt;return true}f.t-=dt;if(f.t<=0)return false;const a=Math.min(1,f.t/f.t0),q=1-a;
    if(f.k==='b'){f.x+=f.vx*dt;f.y+=f.vy*dt;const r=f.R*(.3+.9*Math.sqrt(q)),g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(255,246,214,${a})`);g.addColorStop(.35,`rgba(255,165,45,${a*.95})`);g.addColorStop(.75,`rgba(150,50,15,${a*.6})`);g.addColorStop(1,'rgba(40,20,10,0)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,r,0,7);c.fill()}
    else if(f.k==='p'){f.vy+=f.g*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>srGy(f.x)){if(f.tr)return false;f.y=srGy(f.x);f.vx*=.4;f.vy*=-.2}c.fillStyle=`rgba(${f.c},${Math.min(1,a*1.6)})`;c.fillRect(f.x-f.sz/2,f.y-f.sz/2,f.sz,f.sz);
      if(f.tr&&Math.random()<.5)SR.fx.push({k:'s',x:f.x,y:f.y,vx:0,vy:-4,r0:2,r1:9,t:1.4,t0:1.4,c:'232,232,226',al:.5})}
    else if(f.k==='s'){const dr=Math.exp(-(f.drag||.5)*dt);f.vx*=dr;f.vy*=dr;if(f.w)f.vx+=SR.wind.x*.9*q*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;c.fillStyle=`rgba(${f.c},${f.al*a*Math.min(1,q*8)})`;c.beginPath();c.arc(f.x,f.y,f.r0+(f.r1-f.r0)*Math.sqrt(q),0,7);c.fill()}
    else if(f.k==='r'){c.strokeStyle=`rgba(255,220,170,${a*.7})`;c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y,f.R*q,f.R*q*.45,0,0,7);c.stroke()}
    else if(f.k==='fl'){c.globalCompositeOperation='lighter';const r=f.R*(.6+.6*q),g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,r);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(.4,`rgba(255,244,210,${a*.8})`);g.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,r,0,7);c.fill();c.globalCompositeOperation='source-over'}
    else if(f.k==='lt'){c.globalCompositeOperation='lighter';const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.R);g.addColorStop(0,`rgba(255,190,110,${.42*a*a})`);g.addColorStop(.5,`rgba(255,140,60,${.16*a*a})`);g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.fillRect(f.x-f.R,f.y-f.R,f.R*2,f.R*2);c.globalCompositeOperation='source-over'}
    else if(f.k==='fb'){const dr=Math.exp(-2.2*dt);f.vx*=dr;f.vy=f.vy*dr-34*dt;f.x+=f.vx*dt+SR.wind.x*.25*q*dt;f.y+=f.vy*dt;const r=f.R*(.35+1.05*Math.sqrt(q)),T=1-q;
      if(q<.62){c.globalCompositeOperation='lighter';const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,r),hot=srClamp(T*1.5-.4,0,1);g.addColorStop(0,hot>.6?`rgba(255,250,232,${T})`:`rgba(255,${200+hot*50|0},${90+hot*120|0},${T})`);g.addColorStop(.45,`rgba(255,${120+hot*80|0},${30+hot*30|0},${T*.85})`);g.addColorStop(.85,`rgba(150,46,14,${T*.45})`);g.addColorStop(1,'rgba(60,20,8,0)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,r,0,7);c.fill();c.globalCompositeOperation='source-over'}
      if(q>.35){const k=srClamp((q-.35)/.4,0,1);c.fillStyle=`rgba(${46-k*12|0},${36-k*8|0},${30-k*6|0},${.42*k*Math.min(1,a*2.2)})`;c.beginPath();c.arc(f.x+Math.sin(f.sd+q*4)*2,f.y,r*(.95+.15*Math.sin(f.sd)),0,7);c.fill()}
      if(f.t<=dt*1.5)SR.fx.push({k:'s',x:f.x,y:f.y,vx:f.vx*.4,vy:-18,r0:r*.8,r1:r*1.7,t:3,t0:3,c:'40,34,30',al:.5,w:1})}
    else if(f.k==='ej'){f.vy+=380*dt;const dr=Math.exp(-.9*dt);f.vx*=dr;f.x+=f.vx*dt;f.y+=f.vy*dt;const L=.06,gy=srGy(f.x);if(f.y>gy&&f.vy>0){SR.fx.push({k:'s',x:f.x,y:gy-2,vx:f.vx*.1,vy:-8,r0:3,r1:12+f.w*2,t:1.4,t0:1.4,c:'110,90,62',al:.45});return false}
      c.strokeStyle=`rgba(${f.c},${Math.min(1,a*1.4)})`;c.lineCap='round';c.lineWidth=f.w*(.6+q);c.beginPath();c.moveTo(f.x-f.vx*L,f.y-f.vy*L);c.lineTo(f.x,f.y);c.stroke();
      if(Math.random()<dt*24)SR.fx.push({k:'s',x:f.x,y:f.y,vx:f.vx*.05,vy:f.vy*.05,r0:f.w,r1:f.w*3.2,t:.9,t0:.9,c:'96,78,54',al:.35})}
    else if(f.k==='d'){f.vy+=560*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;const gy=srGy(f.x);if(f.y>gy){if(f.pf&&f.vy>140){f.pf=0;SR.fx.push({k:'s',x:f.x,y:gy-2,vx:f.vx*.08,vy:-10,r0:2,r1:6+f.w*.9,t:.9,t0:.9,c:'120,100,70',al:.45})}f.y=gy;f.vy*=-.3;f.vx*=.55;f.vr*=.5}c.save();c.translate(f.x,f.y);c.rotate(f.rot);c.globalAlpha=Math.min(1,a*3);c.fillStyle=f.c;c.fillRect(-f.w/2,-f.h/2,f.w,f.h);if(f.hot){c.fillStyle=`rgba(255,120,30,${a})`;c.fillRect(-f.w/2,-f.h/2,f.w*.35,f.h)}c.restore();
      if(f.hot&&a>.5&&Math.random()<.4)SR.fx.push({k:'s',x:f.x,y:f.y,vx:0,vy:-12,r0:2,r1:8,t:.6,t0:.6,c:'50,44,40',al:.5})}
    else if(f.k==='l'){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>srGy(f.x)){SR.fx.push({k:'s',x:f.x,y:srGy(f.x)-1,vx:0,vy:-10,r0:2,r1:7,t:.7,t0:.7,c:'130,108,76',al:.5});if(Math.random()<.3)SR.fx.push({k:'h',x:f.x,y:srGy(f.x)-.5,px:f.x,py:f.y,vx:0,vy:0,gr:1,t:1.5+Math.random()*2,t0:3.5,sz:1.2});return false}c.strokeStyle=`rgba(255,235,190,${a*.8})`;c.lineWidth=1;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x-f.vx*.03,f.y-f.vy*.03);c.stroke()}
    else if(f.k==='j'){f.vy-=70*dt;const dr=Math.exp(-1.2*dt);f.vx*=dr;f.vy*=dr;f.x+=f.vx*dt;f.y+=f.vy*dt;const r=3+q*20;
      if(q<.5){c.globalCompositeOperation='lighter';c.fillStyle=q<.18?`rgba(255,250,220,${.9*a})`:`rgba(255,${200-q*220|0},40,${.85*a})`;c.beginPath();c.arc(f.x,f.y,r,0,7);c.fill();c.globalCompositeOperation='source-over'}
      else{c.fillStyle=`rgba(45,38,35,${.55*a})`;c.beginPath();c.arc(f.x,f.y,r*1.3,0,7);c.fill()}}
    else if(f.k==='h'){f.px=f.x;f.py=f.y;if(!f.gr){f.vy+=520*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;const gy=srGy(f.x);if(f.y>=gy){f.y=gy-.5;if(Math.abs(f.vy)>150&&!f.b){f.b=1;f.vy*=-.3;f.vx*=.5}else f.gr=1}}
      const hot=Math.min(1,a*1.5),col=hot>.75?'255,246,214':hot>.45?`255,${150+hot*110|0},50`:`${150+hot*200|0},${30+hot*90|0},18`;c.globalCompositeOperation='lighter';
      if(!f.gr){c.strokeStyle=`rgba(${col},${hot*.8})`;c.lineWidth=f.sz;c.beginPath();c.moveTo(f.px-f.vx*.012,f.py-f.vy*.012);c.lineTo(f.x,f.y);c.stroke()}
      const gl=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.sz*4);gl.addColorStop(0,`rgba(${col},${hot*.55})`);gl.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=gl;c.fillRect(f.x-f.sz*4,f.y-f.sz*4,f.sz*8,f.sz*8);c.globalCompositeOperation='source-over';
      c.fillStyle=`rgba(${col},${Math.min(1,.35+hot)})`;c.fillRect(f.x-f.sz/2,f.y-f.sz/2,f.sz,f.sz);
      if(f.gr&&hot>.3&&Math.random()<dt*2.5)SR.fx.push({k:'s',x:f.x,y:f.y-1,vx:SR.wind.x*.2,vy:-9,r0:1,r1:5,t:1,t0:1,c:'70,62,56',al:.35})}
    else if(f.k==='g'){f.vx*=Math.exp(-1.5*dt);f.x+=f.vx*dt;const r=f.r0+(f.r1-f.r0)*Math.sqrt(q);c.fillStyle=`rgba(150,126,88,${.34*a*Math.min(1,q*10)})`;c.beginPath();c.arc(f.x,srGy(f.x)-f.h-r*.45,r,0,7);c.fill()}
    else if(f.k==='e'){const gy=srGy(f.x),fl=.7+.3*Math.sin(f.t*17+f.x);c.globalCompositeOperation='lighter';const g=c.createRadialGradient(f.x,gy,0,f.x,gy,f.r);g.addColorStop(0,`rgba(255,150,50,${.5*a*fl})`);g.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=g;c.beginPath();c.ellipse(f.x,gy,f.r,f.r*.4,0,0,7);c.fill();c.globalCompositeOperation='source-over';
      if(Math.random()<dt*5*a)SR.fx.push({k:'s',x:f.x+(Math.random()-.5)*f.r,y:gy-2,vx:0,vy:-16-Math.random()*14,r0:2,r1:9+Math.random()*8,t:2.4,t0:2.4,c:'46,40,36',al:.4,w:1})}
    else if(f.k==='efp'){c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(255,240,200,${a})`;c.lineWidth=4*a+1;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x2,f.y2);c.stroke();c.globalCompositeOperation='source-over'}
    return true});SR.fx=kept.concat(SR.fx);const mx=Math.round(1400*(SR.q||1));if(SR.fx.length>mx)SR.fx.splice(0,SR.fx.length-mx)}
function srDrawShell(c,p,id){const am=SR_AM[id];c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.dy,p.dx));
  const g=c.createRadialGradient(0,0,0,0,0,16);g.addColorStop(0,'rgba(255,220,150,.55)');g.addColorStop(1,'rgba(255,160,60,0)');c.fillStyle=g;c.fillRect(-16,-16,32,32);
  c.fillStyle=am.kind==='smoke'?'#8fb7a2':am.kind==='illum'?'#e9e2c8':am.kind==='gps'||am.kind==='laser'?'#3f4a56':am.kind==='smart'?'#4a4f36':'#3E4A1E';c.beginPath();c.moveTo(-6,-2.2);c.lineTo(3,-2.2);c.quadraticCurveTo(7,-1.6,9,0);c.quadraticCurveTo(7,1.6,3,2.2);c.lineTo(-6,2.2);c.closePath();c.fill();
  c.fillStyle='#E8C547';c.fillRect(-2,-2.2,1.6,4.4);c.fillStyle='#b9772f';c.fillRect(-6,-2.2,1.2,4.4);
  if(am.kind==='gps'||am.kind==='laser'){c.fillStyle='#22282e';c.fillRect(-6.5,-4.6,2.6,9.2);c.fillRect(3,-3.6,1.6,7.2)}if(am.kind==='laser'){c.fillStyle='#ff3b30';c.beginPath();c.arc(8.4,0,1.2,0,7);c.fill()}c.restore()}
function srDrawArc(c,L,col,al){const p=L.pts,n=p.length/2;c.strokeStyle=col;c.globalAlpha=al;c.lineWidth=1.4;c.setLineDash([5,5]);c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<n;i+=2)c.lineTo(p[i*2],p[i*2+1]);c.lineTo(p[n*2-2],p[n*2-1]);c.stroke();c.setLineDash([]);
  const ai=Math.min(n-1,L.apex),ax=p[ai*2],ay=p[ai*2+1];c.fillStyle=col;c.font='700 9px system-ui';c.textAlign='center';c.fillText('▲ '+srM(Math.max(0,L.base-ay))+' m',ax,ay-6);c.globalAlpha=1}
function srDraw(now,dt){const c=SR.c,W=SR.W,H=SR.H,cam=SR.cam,z=cam.z,t=now/1000;
  c.setTransform(SR.dpr,0,0,SR.dpr,0,0);
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  const hz=srClamp(H*.6+(600-cam.y)*z*.3,H*.12,H*1.3);
  const sky=c.createLinearGradient(0,0,0,Math.max(H,hz));sky.addColorStop(0,'#150f1e');sky.addColorStop(.35,'#3a2134');sky.addColorStop(.7,'#9a4f2e');sky.addColorStop(1,'#d98a42');c.fillStyle=sky;c.fillRect(0,0,W,H);
  // csillagok fent, lemenő nap fénye a horizonton, felhősávok
  if(!LOWFX){c.fillStyle='rgba(255,244,220,.7)';for(let i=0;i<26;i++){const hx=Math.abs(Math.sin(i*127.1)*43758.5%1),hy=Math.abs(Math.sin(i*311.7)*43758.5%1),sy=hy*hz*.5;c.globalAlpha=.25+.5*Math.abs(Math.sin(t*.7+i))*(1-sy/(hz*.55+1));c.fillRect(((hx*W*1.4-cam.x*.01)%W+W)%W,sy,1.2,1.2)}c.globalAlpha=1}
  {const sx=W*.72-cam.x*.015,g=c.createRadialGradient(sx,hz,0,sx,hz,W*.75);g.addColorStop(0,'rgba(255,214,150,.55)');g.addColorStop(.25,'rgba(255,160,80,.22)');g.addColorStop(1,'rgba(255,120,60,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
  if(!LOWFX)for(let i=0;i<6;i++){const h1=Math.abs(Math.sin(i*53.3)*1e4%1),cw=W*(.35+h1*.4),cx=((h1*W*2+i*W*.37-cam.x*.03+t*(2+h1*3))%(W+cw*2)+W+cw*2)%(W+cw*2)-cw,cy=hz*(.18+.11*i);const g=c.createLinearGradient(0,cy-9,0,cy+9);g.addColorStop(0,'rgba(60,34,50,0)');g.addColorStop(.5,`rgba(${70+i*22},${40+i*9},${52},.3)`);g.addColorStop(1,'rgba(255,170,100,0)');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,cw,7+h1*6,0,0,7);c.fill()}
  // távoli atomcsapás (a legtávolabbi hegyek mögött), majd három hegyréteg légköri távlattal: kékes, párás csúcsok → erdős dombhátak
  srNukeTick(dt,W,hz);
  srRidge(c,W,H,hz,z,.12,128,4.1,'#7d6576','#5f4c5c',false);srNuke(c,W,H,hz,dt,t);
  {const g=c.createLinearGradient(0,hz-60,0,hz+10);g.addColorStop(0,'rgba(220,140,110,0)');g.addColorStop(1,'rgba(220,140,110,.18)');c.fillStyle=g;c.fillRect(0,hz-60,W,70)}
  srRidge(c,W,H,hz,z,.25,90,0,'#6a5560','#4c3c46',false);
  srWar(c,W,H,hz,dt,t);
  srRidge(c,W,H,hz,z,.5,60,1.7,'#54423f','#3a2c2a',true);
  {const g=c.createLinearGradient(0,hz-26,0,hz+12);g.addColorStop(0,'rgba(255,170,110,0)');g.addColorStop(1,'rgba(255,170,110,.22)');c.fillStyle=g;c.fillRect(0,hz-26,W,38)}
  srPlain(c,W,H,hz);srBg(c,W,H,hz,dt,now);
  SR.shake=Math.max(0,SR.shake-dt);const shk=SR.shake*14;
  c.save();if(shk)c.translate((Math.random()-.5)*shk,(Math.random()-.5)*shk);c.translate(W/2,H*.62);c.scale(z,z);c.translate(-cam.x,-cam.y);
  const vx0=cam.x-W/2/z-20,vx1=cam.x+W/2/z+20,x0=srClamp(vx0+8,0,SR_W),x1=srClamp(vx1-8,0,SR_W),yb=cam.y+H/z,xl=Math.min(x0,vx0)-30,xr=Math.max(x1,vx1)+30;
  // talaj
  c.beginPath();c.moveTo(xl,yb);c.lineTo(xl,srGy(x0));for(let x=x0;x<=x1;x+=SR_DX)c.lineTo(x,srGy(x));c.lineTo(xr,srGy(x1));c.lineTo(xr,yb);c.closePath();
  const gg=c.createLinearGradient(0,380,0,900);gg.addColorStop(0,'#77632f');gg.addColorStop(.45,'#55401f');gg.addColorStop(1,'#2a1c0c');c.fillStyle=gg;c.fill();
  // talajrétegek és kövek a felszín alatt
  for(const [off,al,lw] of [[9,.2,3],[22,.16,4],[40,.13,6],[64,.1,8]]){c.strokeStyle=`rgba(30,20,10,${al})`;c.lineWidth=lw;c.beginPath();for(let x=x0;x<=x1;x+=SR_DX*2){const y=srGy(x)+off+Math.sin(x*.045+off)*2.5;x===x0?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
  if(!LOWFX)for(let k=Math.floor(x0/23);k*23<x1;k++){const h1=Math.abs(Math.sin(k*91.17)*43758.5%1),h2=Math.abs(Math.sin(k*17.3)*43758.5%1),x=k*23+h1*18,y=srGy(x)+8+h2*46;c.fillStyle=h2>.5?'rgba(150,130,96,.35)':'rgba(24,16,8,.35)';c.beginPath();c.ellipse(x,y,1.5+h1*3,1+h2*1.8,h1*3,0,7);c.fill()}
  c.lineJoin='round';c.lineWidth=5.5;c.strokeStyle='#4f6a26';c.beginPath();c.moveTo(xl,srGy(x0));for(let x=x0;x<=x1;x+=SR_DX)c.lineTo(x,srGy(x));c.lineTo(xr,srGy(x1));c.stroke();
  c.lineWidth=1.6;c.strokeStyle='#8fae4a';c.beginPath();c.moveTo(xl,srGy(x0)-2);for(let x=x0;x<=x1;x+=SR_DX)c.lineTo(x,srGy(x)-2);c.lineTo(xr,srGy(x1)-2);c.stroke();
  // fűcsomók (a felperzselt talajon nincs)
  if(!LOWFX){c.lineWidth=1;c.lineCap='round';for(let k=Math.floor(x0/7);k*7<x1;k++){const h1=Math.abs(Math.sin(k*12.9898)*43758.5%1);if(h1<.5)continue;const x=k*7+h1*5,ii=Math.min(SR.sc.length-1,Math.max(0,Math.round(x/SR_DX)));if(SR.sc[ii]>.2)continue;const y=srGy(x)-2,hh=1.4+h1*2.6;c.strokeStyle=h1>.8?'#86a646':'#5f7f2e';c.beginPath();c.moveTo(x-1.4,y);c.lineTo(x-2.2,y-hh*.7);c.moveTo(x,y);c.lineTo(x+.4,y-hh);c.moveTo(x+1.4,y);c.lineTo(x+2.6,y-hh*.75);c.stroke()}}
  c.lineWidth=6;for(let i=Math.floor(x0/SR_DX),i1=Math.min(SR.h.length-2,Math.ceil(x1/SR_DX));i<=i1;i++){const s=SR.sc[i];if(s>.12){c.strokeStyle=`rgba(26,20,16,${s})`;c.beginPath();c.moveTo(i*SR_DX-.5,SR.h[i]);c.lineTo((i+1)*SR_DX+.5,SR.h[i+1]);c.stroke()}}
  for(const tr of SR.trees){if(tr.x<x0-30||tr.x>x1+30)continue;const gy=srGy(tr.x),s=tr.s;if(tr.ok){c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(tr.x+4*s,gy+1,15*s,2.6*s,0,0,7);c.fill();
      c.fillStyle='#33261a';c.fillRect(tr.x-2.2*s,gy-30*s,4.4*s,30*s);c.fillStyle='#57412a';c.fillRect(tr.x-2.2*s,gy-30*s,1.5*s,30*s);
      const bl=(dx,dy,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(tr.x+dx*s,gy+dy*s,r*s,0,7);c.fill()};bl(2,-33,15,'#2f4a1c');bl(-8,-36,11,'#3d5c22');bl(8,-38,10,'#3d5c22');bl(0,-40,13,'#4f7028');bl(-5,-44,8,'#64883a');bl(4,-46,5.5,'#7da048')}
    else{c.fillStyle='#1a1410';c.fillRect(tr.x-2*s,gy-11*s,4*s,11*s);c.beginPath();c.moveTo(tr.x-2*s,gy-11*s);c.lineTo(tr.x+1*s,gy-19*s);c.lineTo(tr.x+2*s,gy-11*s);c.fill()}}
  for(let m=Math.ceil(x0/100)*100;m<x1;m+=100){const gy=srGy(m);c.fillStyle='#ddd';c.fillRect(m-1,gy-18,2,18);c.fillStyle='#B0121E';c.fillRect(m-1,gy-18,2,4);c.fillStyle='rgba(255,255,255,.85)';c.font='bold 8px sans-serif';c.textAlign='center';c.fillText(m/100+' km',m,gy-21)}
  for(let i=0;i<2;i++)if(SR.last[i]&&!(SR.phase==='fly'&&SR.shot.ev.by===i))srDrawArc(c,SR.last[i],i===srCtl().i?'#9dff9d':'#ff9a8a',.4);
  // tűzvezető előrejelzés (világítógránát után)
  if(SR.pred){const p=SR.pred.pts,n=p.length/2;c.strokeStyle='rgba(255,240,170,.75)';c.lineWidth=1.3;c.setLineDash([2,6]);c.beginPath();c.moveTo(p[0],p[1]);for(let i=3;i<n;i+=3)c.lineTo(p[i*2],p[i*2+1]);c.stroke();c.setLineDash([]);const e=SR.pred.end;c.strokeStyle='#ffe98a';c.lineWidth=2;c.beginPath();c.moveTo(e.x-7,e.y-7);c.lineTo(e.x+7,e.y+7);c.moveTo(e.x+7,e.y-7);c.lineTo(e.x-7,e.y+7);c.stroke()}
  if(SR.phase==='prep')for(const v of SR.v)srDrawCrew(c,v,now);
  for(const v of SR.v)srDrawVeh(c,v);srDrawCrates(c,t);srBailTick(c,dt,t);
  for(const v of SR.v)if(v.dead||v.burn>0){const fl=.75+.25*Math.sin(t*19+v.i*3),R=(v.dead?120:70)*fl;c.globalCompositeOperation='lighter';const g=c.createRadialGradient(v.x,v.y-18,0,v.x,v.y-18,R);g.addColorStop(0,'rgba(255,150,50,.38)');g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.fillRect(v.x-R,v.y-18-R,R*2,R*2);c.globalCompositeOperation='source-over'}
  if(SR.phase==='aim'){const v=SR.v[SR.turn],b=Math.sin(t*6)*2;c.fillStyle='#ffd24a';c.beginPath();c.moveTo(v.x-6,v.y-66+b);c.lineTo(v.x+6,v.y-66+b);c.lineTo(v.x,v.y-57+b);c.fill()}
  // résztöltetek (SMArt)
  for(const s of SR.subs)srDrawSub(c,s,t);
  // lézeres célmegjelölés (Copperhead): villogó fénypont a célon a röppálya végén
  if(SR.phase==='fly'&&SR.shot.ev.lz){const S=SR.shot,T=(S.n-1)*S.ev.dt,tg=SR.v[1-S.ev.by];if(T-S.t<2.4&&!tg.dead&&Math.sin(t*28)>-.3){c.globalCompositeOperation='lighter';const g=c.createRadialGradient(tg.x,tg.y-24,0,tg.x,tg.y-24,14);g.addColorStop(0,'rgba(255,60,40,.95)');g.addColorStop(1,'rgba(255,0,0,0)');c.fillStyle=g;c.fillRect(tg.x-14,tg.y-38,28,28);c.globalCompositeOperation='source-over'}}
  // lövedék és röppálya
  if(SR.phase==='fly'){const S=SR.shot,p=srShotPos(S,S.t),P=S.ev.pts,n=p.i+1;
    c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1.2;c.beginPath();c.moveTo(P[0],P[1]);for(let i=1;i<=n;i++)c.lineTo(P[i*2],P[i*2+1]);c.lineTo(p.x,p.y);c.stroke();
    const k0=Math.max(0,n-26);for(let i=k0;i<n;i++){const a=(i-k0)/26;c.strokeStyle=`rgba(255,${190+a*50|0},${110+a*90|0},${a*.85})`;c.lineWidth=1+a*2.6;c.beginPath();c.moveTo(P[i*2],P[i*2+1]);c.lineTo(P[i*2+2],P[i*2+3]);c.stroke()}
    srDrawShell(c,p,S.ev.am)}
  // köd
  for(const s of SR.smokes){const a=Math.min(1,s.age/1.5)*Math.min(1,s.turns/2);for(let i=0;i<(LOWFX?9:16);i++){const h=Math.abs(Math.sin(i*12.9898)*43758.5453%1),h2=Math.abs(Math.sin(i*78.233)*43758.5453%1),x=s.x+(h-.5)*290+Math.sin(t*.4+i)*12,y=srGy(x)-12-h2*78+Math.sin(t*.6+i*2)*5;c.fillStyle=`rgba(${218+h*22|0},${218+h*22|0},${212+h*20|0},${.22*a})`;c.beginPath();c.arc(x,y,30+h2*26,0,7);c.fill()}}
  srDrawFx(c,dt);
  // világítótestek
  for(const f of SR.flares){c.strokeStyle='#ccc';c.lineWidth=.6;c.beginPath();c.moveTo(f.x-9,f.y-22);c.lineTo(f.x,f.y);c.lineTo(f.x+9,f.y-22);c.stroke();c.fillStyle='#e6dfca';c.beginPath();c.arc(f.x,f.y-22,9.5,Math.PI,0);c.fill();
    c.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(t*23),R=260*fl,g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,R);g.addColorStop(0,'rgba(255,250,215,.95)');g.addColorStop(.06,'rgba(255,235,160,.55)');g.addColorStop(.4,'rgba(255,220,130,.14)');g.addColorStop(1,'rgba(255,210,120,0)');c.fillStyle=g;c.fillRect(f.x-R,f.y-R,R*2,R*2);c.globalCompositeOperation='source-over'}
  SR.float=SR.float.filter(f=>{f.t-=dt;f.y-=9*dt;c.globalAlpha=Math.min(1,f.t);c.font='900 11px system-ui';c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.75)';c.strokeText(f.txt,f.x,f.y);c.fillStyle=f.col;c.fillText(f.txt,f.x,f.y);c.globalAlpha=1;return f.t>0});
  c.restore();
  // a lövegek fölötti életerő-sáv képernyő-térben: állandó méret, nem rázkódik a kamerával, a kép szélén belül marad
  for(const v of SR.v)if(!v.dead){const w=60,h=7,rx=(v.x-cam.x)*z+W/2;if(rx<-20||rx>W+20){v.hbx=null;continue}const sx=srClamp(rx,w/2+4,W-w/2-4),sy=srClamp((v.y-74-cam.y)*z+H*.62-h,58,H-16);v.hbx=v.hbx==null?sx:v.hbx+(sx-v.hbx)*.5;v.hby=v.hby==null?sy:v.hby+(sy-v.hby)*.5;srHpBar(c,Math.round(v.hbx-w/2),Math.round(v.hby),w,h,v,t,false,false)}
  if(!LOWFX){if(!SR.vg||SR.vgK!==W+'x'+H){SR.vgK=W+'x'+H;const g=c.createRadialGradient(W/2,H*.5,Math.min(W,H)*.45,W/2,H*.5,Math.max(W,H)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.42)');SR.vg=g}c.fillStyle=SR.vg;c.fillRect(0,0,W,H)}
  if(SR.flash>0){SR.flash-=dt;c.fillStyle=`rgba(255,200,130,${Math.max(0,SR.flash)*.8})`;c.fillRect(0,0,W,H)}
  if(SR.nkF>0){c.fillStyle=`rgba(255,250,236,${SR.nkF*.6})`;c.fillRect(0,0,W,H)}
  srHud(c,W,H,t);srCineDraw(c,W,H,t)}
function srRR(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
// életerő-sáv: színátmenetes (zöld→sárga→piros), 10%-os osztásokkal; a friss sebzés fehéren villan, majd pirosan „lefolyik”; alacsony életerőnél pirosan lüktet
function srHpBar(c,x,y,w,h,v,t,rtl,big){const p=srClamp((v.hpD??v.hp)/100,0,1),g=srClamp((v.hpG??v.hp)/100,0,1),hf=v.hitF||0,low=!v.dead&&v.hp<=30,hue=Math.round(p*120),r=Math.min(h/2,5),fresh=(v.hpGT||0)>0;
  c.save();if(low){const pu=.5+.5*Math.sin(t*(v.hp<=15?5:3));c.shadowColor=`rgba(255,40,30,${.6+.25*pu})`;c.shadowBlur=(big?8:5)+pu*(big?4:2)}
  c.fillStyle='rgba(16,8,6,.88)';srRR(c,x-1.5,y-1.5,w+3,h+3,r+1.5);c.fill();c.shadowBlur=0;c.shadowColor='transparent';
  srRR(c,x,y,w,h,r);c.clip();c.fillStyle='#1d0f0b';c.fillRect(x,y,w,h);
  const X=(a,b)=>rtl?[x+w*(1-b),w*(b-a)]:[x+w*a,w*(b-a)];
  if(g>p){const [gx,gw]=X(p,g);c.fillStyle=fresh?'rgba(255,238,200,.95)':'rgba(230,50,35,.9)';c.fillRect(gx,y,gw,h)}
  if(p>0){const [fx,fw]=X(0,p),gr=c.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,`hsl(${hue},100%,72%)`);gr.addColorStop(.45,`hsl(${hue},90%,48%)`);gr.addColorStop(1,`hsl(${hue},85%,28%)`);c.fillStyle=gr;c.fillRect(fx,y,fw,h);
    if(big&&!LOWFX){const sx=x+((t*.55)%1.7-.35)*w,sg=c.createLinearGradient(sx-20,0,sx+20,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.28)');sg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sg;c.fillRect(fx,y,fw,h)}
    c.fillStyle='rgba(255,255,255,.2)';c.fillRect(fx,y+1,fw,h*.3)}
  c.fillStyle='rgba(0,0,0,.4)';for(let i=1;i<10;i++){const tx=x+w*i/10,full=i===5;c.fillRect(tx-.5,full?y:y+h*.45,1,full?h:h*.55)}
  if(hf>0){c.fillStyle=`rgba(255,255,255,${Math.min(.3,hf*.4)})`;c.fillRect(x,y,w,h)}
  c.restore();c.strokeStyle=hf>0?'rgba(255,90,70,1)':low?'rgba(255,90,70,.9)':'rgba(255,255,255,.4)';c.lineWidth=1;srRR(c,x-.5,y-.5,w+1,h+1,r+.5);c.stroke()}
const SR_SYS=[['eng','MOT'],['tur','TOR'],['trk','LÁN'],['opt','OPT'],['brl','CSŐ'],['ldr','TÖL'],['rad','RÁD'],['gps','GPS']];
function srHud(c,W,H,t){const ctl=srCtl(),tg=SR.v[1-ctl.i],bw=Math.min(176,W*.4);c.textBaseline='alphabetic';
  SR.v.forEach((v,i)=>{const hf=v.hitF||0,x=i?W-8-bw:8,y0=5,p=srClamp(v.hpD/100,0,1),turn=SR.turn===i&&SR.phase!=='prep';// a panel nem rázkódik: az életerő mindig nyugodtan leolvasható
    c.fillStyle='rgba(0,0,0,.55)';srRR(c,x-5,y0,bw+10,48,8);c.fill();
    if(hf>0||(!v.dead&&v.hp<=30)){c.fillStyle=`rgba(255,40,30,${hf>0?Math.min(.4,hf*.35):.14+.05*Math.sin(t*3)})`;srRR(c,x-5,y0,bw+10,48,8);c.fill()}
    if(turn){c.strokeStyle=Math.sin(t*6)>0?'rgba(255,210,74,.9)':'rgba(255,210,74,.35)';c.lineWidth=1.5;srRR(c,x-4.25,y0+.75,bw+8.5,46.5,7.5);c.stroke()}
    c.font='800 10.5px system-ui';c.textAlign=i?'right':'left';c.fillStyle=turn&&Math.sin(t*6)>0?'#ffd24a':'#fff';c.fillText((turn?'▶ ':'')+v.name.slice(0,18),i?x+bw:x,y0+12,bw-44);
    c.font='900 13px system-ui';c.textAlign=i?'left':'right';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.7)';const ht=v.dead?'KILŐVE':Math.round(v.hpD)+'%';c.strokeText(ht,i?x:x+bw,y0+13);c.fillStyle=v.dead?'#ff5a4a':`hsl(${Math.round(p*120)},95%,64%)`;c.fillText(ht,i?x:x+bw,y0+13);
    if(v.dmgL&&v.dmgL.t>0){const tw=c.measureText(ht).width,dl='−'+v.dmgL.n;c.font='900 11px system-ui';c.globalAlpha=Math.min(1,v.dmgL.t);c.strokeText(dl,i?x+tw+5:x+bw-tw-5,y0+13);c.fillStyle='#ff6b5b';c.fillText(dl,i?x+tw+5:x+bw-tw-5,y0+13);c.globalAlpha=1;c.textAlign=i?'left':'right'}
    srHpBar(c,x,y0+17,bw,12,v,t,i===1,true);
    if(v.load>=1&&!v.dead){c.font='800 8px system-ui';c.textAlign='center';c.lineWidth=2.5;c.strokeStyle='rgba(0,0,0,.75)';const an=srAmmoN(v),at=an?an+' lőszer':'NINCS LŐSZER';c.strokeText(at,x+bw/2,y0+26.5);c.fillStyle=an===0?'#ff6b5b':an<=5?(Math.sin(t*5)>0?'#ff9a4a':'#ffd24a'):an<=12?'#ffd24a':'#fff';c.fillText(at,x+bw/2,y0+26.5)}
    // állapotsor: kezelők, tűz, rendszerek
    const ry=y0+34;let cx=x;for(let k=0;k<5;k++){const ok=k<v.crew&&!v.dead;c.fillStyle=ok?'#efe8d2':'rgba(255,80,60,.55)';c.beginPath();c.arc(cx+2.5,ry+2,1.9,0,7);c.fill();c.fillRect(cx+.8,ry+4.4,3.4,4.4);cx+=6}
    cx+=2;if(v.burn>0&&!v.dead){c.font='9px system-ui';c.textAlign='left';c.globalAlpha=.65+.35*Math.sin(t*12);c.fillText('🔥',cx-1,ry+8.5);c.globalAlpha=1;cx+=11}
    const pw=(x+bw-cx)/SR_SYS.length;c.font='800 6.8px system-ui';c.textAlign='center';
    SR_SYS.forEach(([k,l],j)=>{const d=v.dead?2:v.d[k],px=cx+j*pw;c.fillStyle=d>=2?'rgba(255,59,48,.85)':d?'rgba(244,192,78,.85)':'rgba(79,209,122,.22)';srRR(c,px+.5,ry,pw-1.5,9,2.5);c.fill();
      c.fillStyle=d>=2?'#fff':d?'#2a1a00':'#a8ecbc';c.fillText(l,px+pw/2-.5,ry+6.8,pw-2.5);if(d>=2){c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=.8;c.beginPath();c.moveTo(px+2,ry+7.5);c.lineTo(px+pw-3,ry+1.5);c.stroke()}})});
  if(SR.phase==='prep'||SR.phase==='over')return;
  // köridő: fogyó sáv a kép tetején (120 mp), 30 mp alatt sárga, 10 mp alatt piros
  if(SR.phase==='aim'&&SR.tlEnd){const left=Math.max(0,(SR.paused?SR.paused.left:SR.tlEnd-Date.now())/1000),f=srClamp(left/SR_TLIM,0,1),pw=Math.min(150,W*.36),px=W/2-pw/2,py=58,crit=left<=10,col=crit?'#ff5a4a':left<=30?'#ffd24a':'#9dff9d',sec=Math.ceil(left),txt='⏱ '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
    c.fillStyle='rgba(0,0,0,.6)';srRR(c,px-6,py-2,pw+12,22,8);c.fill();if(crit){c.strokeStyle=`rgba(255,90,70,${.55+.45*Math.sin(t*10)})`;c.lineWidth=1.5;srRR(c,px-6,py-2,pw+12,22,8);c.stroke()}
    c.fillStyle='rgba(255,255,255,.12)';srRR(c,px,py+13,pw,4,2);c.fill();c.fillStyle=col;srRR(c,px,py+13,pw*f,4,2);c.fill();
    c.font='800 11px system-ui';c.textAlign='center';c.fillStyle=col;c.fillText(txt+(srMyTurn()?'':' · ellenfél'),W/2,py+10)}
  const lines=[],radio=ctl.sys.rad&&ctl.d.rad<2,blind=srInSmoke(ctl)||srInSmoke(tg);
  if(radio){const w=SR.wind,wl=w.x*ctl.face,wc=w.z*ctl.face;lines.push(['METEO    '+(Math.abs(w.x)<1?'szélcsend':(wl>0?'hátszél ':'szembeszél ')+Math.round(Math.abs(w.x)/2)+' m/s')+' · oldal '+(Math.abs(w.z)<1?'0':(wc>0?'→ ':'← ')+Math.round(Math.abs(w.z)/2)+' m/s'),'#bfe3ff'])}
  else lines.push(['METEO    nincs rádió','#ff9a8a']);
  if(ctl.d.opt>=2)lines.push(['TÁVMÉRŐ  optika megsemmisült','#ff9a8a']);else if(blind)lines.push(['TÁVMÉRŐ  köd – nincs mérés','#ff9a8a']);
  else{const dx=Math.abs(tg.x-ctl.x),brg=Math.atan(SR.zOff/dx)*SR_MIL,co=ctl.d.opt===1,r=co?Math.round(dx*SR_M/500)*500:Math.round(dx*SR_M/10)*10,b=co?Math.round(brg/20)*20:Math.round(brg),dh=Math.round((ctl.y-tg.y)*SR_M/10)*10;
    lines.push([`TÁVMÉRŐ  ${n0(r)} m · irány ${b>0?'jobbra ':b<0?'balra ':''}${String(Math.abs(b)).padStart(4,'0')} · szint ${dh>=0?'+':'−'}${Math.abs(dh)} m${co?' (sérült optika)':''}`,'#9dff9d']);
    const tk=ctl.sel+'|'+r,ta=SR_AM[ctl.sel],hiA=srHiAm(ta);if(SR.tblK!==tk){SR.tblK=tk;SR.tbl=ta?(hiA?srTableHi(ta,r/SR_M):srTable(ta,r/SR_M)):null}
    lines.push(['LŐTÁBLA  '+(SR.tbl?String(SR.tbl).padStart(4,'0')+' von '+(hiA?'(felső szögcsoport · SMArt)':'(sík terep, szélcsend)'):hiA?'felső szögcsoporttal nem érhető el':'lőtávon kívül – felső szögcsoport'),'#cfd6c0'])}
  {const sa=SR_AM[ctl.sel],g=ctl.d.gps||0;if(sa&&sa.kind==='gps'&&g)lines.push([g>=2?'GPS      kiesett – a gránát irányítás nélkül repül':'GPS      sérült – pontatlan, gyengébb irányítás',g>=2?'#ff9a8a':'#ffd24a'])}
  const R=SR.rep[ctl.i];if(R)lines.push(['ELTÉRÉS  '+R.txt,'#ffe08a']);
  if(SR.flares.some(f=>f.by===ctl.i))lines.push(['CÉL      megvilágítva – becsapódás-előrejelzés aktív','#fff3b0']);
  if(srFold().d){c.font='400 13px '+SR_CFONT;c.textAlign='left';const tw=c.measureText('▸ ADATOK').width+16,ty=H-30;c.fillStyle='rgba(0,0,0,.6)';srRR(c,4,ty,tw,24,8);c.fill();c.strokeStyle='rgba(243,215,122,.6)';c.lineWidth=1.2;srRR(c,4.5,ty+.5,tw-1,23,8);c.stroke();c.fillStyle='#ffd23a';c.fillText('▸ ADATOK',12,ty+17);SR.hitD=[4,ty,tw,24]}
  else{c.font='700 10.5px ui-monospace,Menlo,monospace';c.textAlign='left';let y=H-8-(lines.length-1)*14;const mw=Math.max(...lines.map(l=>c.measureText(l[0]).width)),bw=Math.min(W-8,mw+26);c.fillStyle='rgba(0,0,0,.5)';c.fillRect(4,y-13,bw,lines.length*14+5);SR.hitD=[4,y-13,bw,lines.length*14+5];
  c.fillStyle='rgba(255,210,58,.85)';c.fillText('▾',4+bw-13,y);
  for(const [s,col] of lines){c.fillStyle=col;c.fillText(s,9,y,bw-26);y+=14}}
  // felülnézet: oldalirány, szél, utolsó becsapódás
  srRadar(c,W,ctl,tg,R,radio,blind,t)}
// a kis kijelző üvege: sérült rádiónál egy repedés és képhiba-csíkok, megsemmisültnél pókhálósan szétrepedt, kialvó, villódzó kép
function srCrackGlass(c,v,lvl,ix,iy,iw,ih,t){const K='k'+v.i+'_'+lvl+'_'+iw;SR.crk=SR.crk||{};let G=SR.crk[K];
  if(!G){const r=srRng(SR.seed*7+v.i*131+lvl*17),cx=ix+iw*(lvl>=2?.35+r()*.3:.72+r()*.15),cy=iy+ih*(lvl>=2?.35+r()*.3:.2+r()*.2),n=lvl>=2?11:5,rays=[],L=Math.hypot(iw,ih);
    for(let k=0;k<n;k++){const a=k/n*Math.PI*2+r()*.5,len=L*(lvl>=2?.5+r()*.6:.15+r()*.3),p=[[cx,cy]];let x=cx,y=cy;const seg=5+(r()*4|0);for(let j=1;j<=seg;j++){const d=len/seg,aa=a+(r()-.5)*.6;x+=Math.cos(aa)*d;y+=Math.sin(aa)*d;p.push([x,y])}rays.push(p)}
    const rings=[];if(lvl>=2)for(const f of [.25,.5,.8])for(let k=0;k<n;k++){if(r()<.3)continue;const A=rays[k],B=rays[(k+1)%n],ia=Math.min(A.length-1,Math.round(f*(A.length-1))),ib=Math.min(B.length-1,Math.round(f*(B.length-1)));rings.push([A[ia],B[ib]])}
    const shards=[];if(lvl>=2)for(let k=0;k<n;k++)if(r()<.45){const A=rays[k],B=rays[(k+1)%n],m=Math.min(A.length,B.length)-1,j=1+(r()*(m-1)|0);shards.push([A[j],A[j+1]||A[j],B[j+1]||B[j],B[j]])}
    G=SR.crk[K]={cx,cy,rays,rings,shards}}
  if(lvl>=2){// kialvó, villódzó kép
    const fl=Math.sin(t*23)*Math.sin(t*7.3)>.55;c.fillStyle=`rgba(0,0,0,${fl?.45:.78})`;c.fillRect(ix,iy,iw,ih);
    if(Math.random()<.35){const y=iy+Math.random()*ih;c.fillStyle='rgba(120,255,150,.18)';c.fillRect(ix,y,iw,1+Math.random()*4)}
    c.fillStyle='rgba(255,255,255,.07)';for(const q of G.shards){c.beginPath();c.moveTo(q[0][0],q[0][1]);for(const p of q)c.lineTo(p[0],p[1]);c.closePath();c.fill()}}
  else if(Math.random()<.06){const y=iy+Math.random()*ih;c.fillStyle='rgba(0,0,0,.5)';c.fillRect(ix,y,iw,2+Math.random()*5)}// sérült: időnként képhiba
  const line=(w,col,o)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();for(const p of G.rays){c.moveTo(p[0][0]+o,p[0][1]+o);for(const q of p)c.lineTo(q[0]+o,q[1]+o)}for(const [a,b] of G.rings){c.moveTo(a[0]+o,a[1]+o);c.lineTo(b[0]+o,b[1]+o)}c.stroke()};
  c.lineJoin='round';line(1.8,'rgba(0,0,0,.75)',0);line(.8,'rgba(235,255,240,.6)',-.6);
  c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(G.cx,G.cy,lvl>=2?2.6:1.6,0,7);c.fill()}
// összecsukható kiegészítő kijelzők (felülnézet, adatdoboz) – az állapot megmarad
const SR_CFONT=getComputedStyle(document.documentElement).getPropertyValue('--f-comic').trim()||'system-ui';
function srFold(){if(!SR.fold){try{SR.fold=JSON.parse(localStorage.getItem('srFold')||'{}')||{}}catch(e){SR.fold={}}}return SR.fold}
function srFoldTap(x,y){const F=srFold(),inR=r=>r&&x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];let k=inR(SR.hitM)?'m':inR(SR.hitD)?'d':null;if(!k)return false;
  F[k]=!F[k];try{localStorage.setItem('srFold',JSON.stringify(F))}catch(e){}srClick(1);try{navigator.vibrate&&navigator.vibrate(7)}catch(e){}return true}
// tűzvezető kis kijelzője (felülnézet): foszforzöld radarképernyő – rács, távgyűrűk, pásztázó sugár, a cső iránya, a cél, az utolsó becsapódás és a szél
function srRadar(c,W,ctl,tg,R,radio,blind,t){const rdR=ctl.d.rad||0,rdG=ctl.d.gps||0,rd=Math.max(rdR,rdG),big=W>=520,sm=W<360,iw=big?104:sm?78:86,ix=W-iw-6,iy=60;
  if(srFold().m){c.save();c.fillStyle='rgba(4,16,8,.85)';srRR(c,ix,iy,iw,18,7);c.fill();c.strokeStyle='#111';c.lineWidth=2.5;srRR(c,ix,iy,iw,18,7);c.stroke();c.strokeStyle=rd>=2?'rgba(255,120,100,.6)':'rgba(120,255,150,.55)';c.lineWidth=1;srRR(c,ix+2.5,iy+2.5,iw-5,13,5);c.stroke();
    c.font=`800 ${big?8.5:7.5}px system-ui`;c.textAlign='center';c.fillStyle=rd>=2?'#ff9a8a':'#9dff9d';c.fillText('▸ FELÜLNÉZET',ix+iw/2,iy+12);c.restore();SR.hitM=[ix,iy,iw,18];return}
  SR.hitM=null;const ih=big?132:sm?102:112,cx=ix+iw/2,sc=.3*iw/74,top=iy+17,by=iy+ih-14,ty=top+12,rng=Math.abs(tg.x-ctl.x),see=ctl.d.opt<2&&!blind,dead=ctl.d.opt>=2;
  c.save();
  // keret és háttér
  c.fillStyle='rgba(0,0,0,.45)';srRR(c,ix+2,iy+3,iw,ih,9);c.fill();
  const g=c.createRadialGradient(cx,by,4,cx,by,ih*1.05);g.addColorStop(0,'#123a1c');g.addColorStop(.7,'#071a0c');g.addColorStop(1,'#030a05');c.fillStyle=g;srRR(c,ix,iy,iw,ih,9);c.fill();
  c.save();srRR(c,ix,iy,iw,ih,9);c.clip();
  // rács
  c.strokeStyle='rgba(120,255,150,.08)';c.lineWidth=1;c.beginPath();for(let x=ix+(iw/2%12);x<ix+iw;x+=12){c.moveTo(x+.5,top);c.lineTo(x+.5,iy+ih)}for(let y=by;y>top;y-=12){c.moveTo(ix,y+.5);c.lineTo(ix+iw,y+.5)}c.stroke();
  // távgyűrűk a saját löveg körül
  c.strokeStyle='rgba(120,255,150,.2)';c.setLineDash([2,3]);for(const k of [.33,.66,1]){c.beginPath();c.arc(cx,by,(by-ty)*k,Math.PI*1.08,Math.PI*1.92);c.stroke()}c.setLineDash([]);
  // pásztázó sugár (radar nélkül nem forog)
  if(radio&&!dead&&rd<2){const a0=-Math.PI/2+Math.sin(t*1.3)*.95,Rr=(by-ty)*1.08;for(let k=0;k<6;k++){const a=a0-Math.cos(t*1.3)*k*.035;c.fillStyle=`rgba(120,255,150,${.13-k*.02})`;c.beginPath();c.moveTo(cx,by);c.arc(cx,by,Rr,a-.05,a+.05);c.fill()}}
  // cső iránya (oldalirányzás) – dupla vonal = izzás
  const lx=srClamp(Math.tan(ctl.trav/SR_MIL)*rng*sc,-iw/2+5,iw/2-5),ax=cx+lx;
  c.lineCap='round';c.strokeStyle='rgba(157,255,157,.25)';c.lineWidth=4;c.beginPath();c.moveTo(cx,by);c.lineTo(ax,ty);c.stroke();
  c.strokeStyle='#9dff9d';c.lineWidth=1.3;c.setLineDash([4,3]);c.lineDashOffset=-t*14;c.beginPath();c.moveTo(cx,by);c.lineTo(ax,ty);c.stroke();c.setLineDash([]);
  c.beginPath();c.arc(ax,ty,3.5,0,7);c.moveTo(ax-6,ty);c.lineTo(ax+6,ty);c.moveTo(ax,ty-6);c.lineTo(ax,ty+6);c.stroke();
  // cél
  if(see){const tx=cx+srClamp(SR.zOff*sc,-iw/2+5,iw/2-5),p=(t*1.4)%1;c.strokeStyle=`rgba(255,90,74,${1-p})`;c.lineWidth=1.2;c.beginPath();c.arc(tx,ty,3+p*9,0,7);c.stroke();
    const bl=.6+.4*Math.sin(t*7);c.fillStyle=`rgba(255,90,74,${bl})`;c.beginPath();c.moveTo(tx,ty-4.5);c.lineTo(tx+4.5,ty);c.lineTo(tx,ty+4.5);c.lineTo(tx-4.5,ty);c.closePath();c.fill()}
  else{c.font='800 11px system-ui';c.textAlign='center';c.fillStyle='#ff9a8a';c.fillText('?',cx+srClamp(SR.zOff*sc,-iw/2+8,iw/2-8),ty+4)}
  // utolsó becsapódás
  if(R&&R.ok){const px=cx+srClamp(R.lat*sc,-iw/2+4,iw/2-4),py=by+(ty-by)*srClamp(R.rf,0,1.15);c.strokeStyle='rgba(255,224,138,.35)';c.lineWidth=1;c.beginPath();c.arc(px,py,6,0,7);c.stroke();c.strokeStyle='#ffe08a';c.lineWidth=1.6;c.beginPath();c.moveTo(px-3,py-3);c.lineTo(px+3,py+3);c.moveTo(px+3,py-3);c.lineTo(px-3,py+3);c.stroke()}
  // saját löveg: nyílhegy
  c.fillStyle='#9dff9d';c.strokeStyle='#04210c';c.lineWidth=1.5;c.beginPath();c.moveTo(cx,by-6);c.lineTo(cx+5,by+4);c.lineTo(cx,by+1.5);c.lineTo(cx-5,by+4);c.closePath();c.stroke();c.fill();
  // szél
  if(radio&&Math.abs(SR.wind.z)>=1){const d=Math.sign(SR.wind.z*ctl.face),wy=by-(by-ty)*.42,wx=cx-d*iw*.3,o=(t*18)%10;c.strokeStyle='#bfe3ff';c.lineWidth=1.5;
    for(let k=0;k<2;k++){const sx=wx+d*(k*7+o*.5);c.globalAlpha=k?.5:.95;c.beginPath();c.moveTo(sx-d*4,wy-4);c.lineTo(sx,wy);c.lineTo(sx-d*4,wy+4);c.stroke()}c.globalAlpha=1}
  // képcső-csíkok és sérült optika zaja
  c.fillStyle='rgba(0,0,0,.18)';for(let y=iy+(t*20%3);y<iy+ih;y+=3)c.fillRect(ix,y,iw,1);
  if(dead||blind){c.fillStyle='rgba(180,200,180,.10)';for(let k=0;k<40;k++)c.fillRect(ix+Math.random()*iw,iy+Math.random()*ih,1.5,1.5)}
  if(rd>=1)srCrackGlass(c,ctl,rd,ix,iy,iw,ih,t);
  // fejléc és alsó adatsor
  c.fillStyle='rgba(0,0,0,.55)';c.fillRect(ix,iy,iw,top-iy);c.fillRect(ix,iy+ih-11,iw,11);
  c.restore();
  c.font=`800 ${big?8.5:7.5}px system-ui`;c.textAlign='center';c.fillStyle=rd>=2?'#ff9a8a':'#9dff9d';c.fillText('▾ '+(rd>=2?'FELÜLNÉZET – HIBA':'FELÜLNÉZET'),cx,iy+11);SR.hitM=[ix,iy,iw,ih];
  c.font=`700 ${big?8.5:7.5}px ui-monospace,Menlo,monospace`;c.textAlign='center';c.fillStyle=see&&rd<2?'#cfffcf':'#ff9a8a';
  c.fillText(rd>=2?(rdR>=2&&rdG>=2?'RÁDIÓ+GPS KIESETT':rdR>=2?'RÁDIÓ KIESETT':'GPS KIESETT'):dead?'OPTIKA KIESETT':blind?'KÖD – NINCS KÉP':(rng*SR_M/1000).toFixed(1).replace('.',',')+' km · '+(ctl.trav>0?'J':ctl.trav<0?'B':'')+String(Math.abs(ctl.trav)).padStart(3,'0'),cx,iy+ih-3);
  // keret, sarokjelek
  c.strokeStyle='#111';c.lineWidth=2.5;srRR(c,ix,iy,iw,ih,9);c.stroke();c.strokeStyle='rgba(120,255,150,.55)';c.lineWidth=1;srRR(c,ix+2.5,iy+2.5,iw-5,ih-5,7);c.stroke();
  c.restore()}
function srLoop(now){const cv=SR.cv;if(!cv||!cv.isConnected)return;const raw=(now-SR.lastT)/1000;let dt=Math.min(.05,raw);SR.lastT=now;if(!(dt>0))dt=0;
  // adaptív minőség: akadozáskor előbb a részecskék, aztán a felbontás csökken; ha bőven van tartalék, visszaemelkedik (a készülék erejét kihasználva)
  if(raw>0&&raw<.25&&!document.hidden&&!LOWFX){const F=SR.fa||(SR.fa={n:0,s:0});F.n++;F.s+=raw;if(F.s>2){const fps=F.n/F.s,qb=SR.qb||1;SR.fa=null;
    if(fps<46){if(SR.q>.6)SR.q=Math.max(.55,SR.q-.2);else if(SR.dpr>1.25){SR.qcap=SR.dpr>2?2:SR.dpr>1.5?1.5:1.25;SR._fps=null;srFit()}}
    else if(fps>56&&SR.q<qb)SR.q=Math.min(qb,SR.q+.1)}}
  srNetPoll();
  if(SR.v&&SR.paused){if(SR.tlEnd)SR.tlEnd=Date.now()+SR.paused.left;if(now-(SR.pzDT||0)>80){SR.pzDT=now;srDraw(now,0);srHudDom()}}
  else if(SR.v){dt*=srCineTick(dt);srUpdate(dt,now);
    const ctl=srCtl();if(SR.phase==='aim'&&srMyTurn()&&SR.flares.some(f=>f.by===ctl.i)){const key=[ctl.x|0,ctl.elev,ctl.trav,ctl.sel].join();if(key!==SR.predK){SR.predK=key;SR.pred=srSim(ctl,SR.v[1-ctl.i],ctl.elev,ctl.trav,SR_AM[ctl.sel],false)}}else if(SR.phase==='aim')SR.pred=null;
    srDraw(now,dt);srHudDom()}
  else if(SR.bgK!==SR.W+'x'+SR.H+'@'+SR.dpr){SR.bgK=SR.W+'x'+SR.H+'@'+SR.dpr;const c=SR.c;c.setTransform(SR.dpr,0,0,SR.dpr,0,0);const sky=c.createLinearGradient(0,0,0,SR.H);sky.addColorStop(0,'#241826');sky.addColorStop(.55,'#8e4a2c');sky.addColorStop(1,'#4a2418');c.fillStyle=sky;c.fillRect(0,0,SR.W,SR.H)}
  SR.raf=requestAnimationFrame(srLoop)}

/* ---------- kezelőpanel ---------- */
function srTapeDraw(cv,val,trav){const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.round(r.width),h=Math.round(r.height);if(!w)return;if(cv.width!==w*dpr||cv.height!==h*dpr){cv.width=w*dpr;cv.height=h*dpr}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0e120b');g.addColorStop(.5,'#2a3320');g.addColorStop(1,'#0e120b');c.fillStyle=g;c.fillRect(0,0,w,h);
  const pp=5,m0=Math.floor(val-w/2/pp)-1,m1=Math.ceil(val+w/2/pp)+1,lo=trav?-300:0,hi=trav?300:1150;c.textAlign='center';c.font='700 9.5px ui-monospace,Menlo,monospace';
  for(let m=m0;m<=m1;m++){if(m<lo||m>hi)continue;const x=w/2+(m-val)*pp,big=m%50===0,mid=m%10===0;c.fillStyle=big?'#f3ecd4':mid?'#b9c29a':'#6f7a58';c.fillRect(x-.5,h-(big?17:mid?11:6),big?1.6:1,big?17:mid?11:6);
    if(big&&Math.abs(x-w/2)>15&&x>13&&x<w-13)c.fillText(trav?(m>0?'J':m<0?'B':'')+Math.abs(m):String(m),x,h-21)}
  c.fillStyle='#ff5a4a';c.fillRect(w/2-.75,0,1.5,h);c.beginPath();c.moveTo(w/2-5,0);c.lineTo(w/2+5,0);c.lineTo(w/2,7);c.fill()}
function srDials(){if(!SR.v||!$('#srEv'))return;const v=srCtl();{const f=srChg(v.elev);$('#srEv').textContent=String(v.elev).padStart(4,'0')+' von · '+(v.elev/SR_MIL*180/Math.PI).toFixed(1).replace('.',',')+'° · töltet '+(f>=.97?6:f>=.9?5:f>=.82?4:f>=.75?3:2)}
  $('#srTv').textContent=(v.trav>0?'J ':v.trav<0?'B ':'')+String(Math.abs(v.trav)).padStart(4,'0')+' von';srTapeDraw($('#srTE'),v.elev,false);srTapeDraw($('#srTT'),v.trav,true)}
function srDial(key,d){if(!SR.v||!(srMyTurn()||SR.phase==='prep'))return;const v=srCtl(),lo=key==='trav'?-300:0,hi=key==='trav'?300:1150,b=v[key],n=srClamp(b+d,lo,hi);if(n===b)return;v[key]=n;
  srClick(Math.floor(b/100)!==Math.floor(n/100)?2:Math.floor(b/10)!==Math.floor(n/10)?1:0);srDials()}
function srTapeBind(cv,key){let px=0,pt=0,acc=0,id=null;
  cv.addEventListener('pointerdown',e=>{e.preventDefault();ac();id=e.pointerId;try{cv.setPointerCapture(id)}catch(x){}px=e.clientX;pt=e.timeStamp;acc=0});
  cv.addEventListener('pointermove',e=>{if(e.pointerId!==id||!SR.v)return;const dx=e.clientX-px,dtm=Math.max(4,e.timeStamp-pt);px=e.clientX;pt=e.timeStamp;const v=srCtl(),pw=v.sys.tur&&v.d.tur<2;
    if(!pw&&!SR.manW){SR.manW=1;srMsg('Torony áram nélkül – kézi hajtás (lassú)')}acc+=-dx/5*(pw?1+srClamp((Math.abs(dx)/dtm*1000-260)/140,0,10):.4);const st=acc<0?Math.ceil(acc):Math.floor(acc);if(st){acc-=st;srDial(key,st)}});
  const up=e=>{if(e.pointerId===id)id=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
function srNudgeBind(b){const key=b.dataset.nudge[0]==='e'?'elev':'trav',d=b.dataset.nudge[1]==='+'?1:-1;let tm=null,n=0;
  const stop=()=>{clearTimeout(tm);tm=null;b.classList.remove('on')},rep=()=>{n++;srDial(key,d*(n>34?5:1));tm=setTimeout(rep,Math.max(22,150-n*9))};
  b.addEventListener('pointerdown',e=>{e.preventDefault();ac();try{b.setPointerCapture(e.pointerId)}catch(x){}b.classList.add('on');n=0;srDial(key,d);tm=setTimeout(rep,340)});
  for(const k of ['pointerup','pointercancel','pointerleave'])b.addEventListener(k,stop)}
function srSwitch(k){if(!SR.v)return;const v=srCtl();if(!(SR.phase==='prep'||srMyTurn()))return;ac();
  if(k==='load'){if(v.load>=1){toast('A lőszer már bent van: '+srAmmoN(v)+'/60');return}if(!v.loading){v.loading=true;srSwSnd(true);srMsg('A kezelők málházzák a lőszert…',3000);srCineVeh('load',v)}srUI();return}
  if(v.d[k]>=2){toast('A '+SR_PN[k]+' megsemmisült – nem kapcsolható vissza.');srSwSnd(false);return}
  v.sys[k]=!v.sys[k];srSwSnd(v.sys[k]);if(v.sys[k]&&(k==='eng'||k==='tur'))srCineVeh(k,v);if(v.sys[k]){if(k==='eng'){srSndEngine();setTimeout(()=>{if(SR.v&&SR.run&&srCtl().sys.eng)srEngLoop(true,'xf')},3050)}else if(k==='rad')srSndRadio();else srSndTurret()}else if(k==='eng'&&!SR.v.some(x=>!x.ai&&x.sys.eng))srEngLoop(false);
  SR.manW=0;srUI()}
function srUI(){const P=$('#srPanel');if(!P||!SR.v)return;const v=srCtl();
  P.querySelectorAll('[data-sw]').forEach(b=>{const k=b.dataset.sw,on=k==='load'?v.load>=1:v.sys[k],dead=k!=='load'&&v.d[k]>=2;b.classList.toggle('on',on&&!dead);b.classList.toggle('dead',dead);b.classList.toggle('need',!on&&!dead&&!(k==='load'&&v.loading));b.classList.toggle('busy',k==='load'&&v.loading)});
  const n=v.load>=1?srAmmoN(v):Math.floor(v.load*60),ce=$('#srCnt');ce.textContent=String(n);const cb=ce.parentElement;cb.classList.toggle('low',v.load>=1&&n<=12&&n>5);cb.classList.toggle('crit',v.load>=1&&n<=5);
  const sel=$('#srAmmo'),key=v.i+'|'+SR_AMMO.map(a=>v.ammo[a.id]||0).join()+'|'+v.sel;if(sel.dataset.k!==key){sel.dataset.k=key;sel.innerHTML=v.load>=1?SR_AMMO.map(a=>`<option value="${a.id}"${v.ammo[a.id]>0?'':' disabled'}${a.id===v.sel?' selected':''}>${a.n} · ${v.ammo[a.id]||0} db</option>`).join(''):'<option>– nincs bemálházva –</option>';sel.disabled=v.load<1}
  $('#srAmI').textContent=v.load>=1&&SR_AM[v.sel]?SR_AM[v.sel].d+' · Valós: '+SR_AM[v.sel].r:'Málházd be a 60 db 155 mm-es gránátot.';
  $('#srDmg').innerHTML=SR_PARTS.map(([k,l])=>`<span class="l${v.d[k]}">${l}</span>`).join('')+`<span class="l${v.crew>=5?0:v.crew>=3?1:2}">KEZELŐK ${v.crew}/5</span>`+(v.burn>0?'<span class="l2">🔥 TŰZ</span>':'');
  $('#srBk').innerHTML=v.face>0?'◀ HÁTRA':'◀ ELŐRE';$('#srFw').innerHTML=v.face>0?'ELŐRE ▶':'HÁTRA ▶'}
/* ---------- FILMES MÓD: a fontos pillanatokban szélesvásznú sávok, közeli kamera, felirat, lassítás (gép elleni és kétfős módban), filmes hangok.
   Koppintásra átugorható; a menüben kikapcsolható. Online csak a kamera és a sávok – a játék ideje nem lassul, a köridő a jelenet alatt áll. ---------- */
function srCineOn(){try{return localStorage.getItem('srCine')!=='0'}catch(e){return true}}
const srIsMine=v=>!!v&&!v.ai&&(SR.mode!=='net'||v.i===SR.me);
function srCine(o){if(!srCineOn()||!SR.v)return;o.t=0;o.slowNow=1;if(SR.cine){if((o.pri||1)>(SR.cine.pri||1)){SR.cine=o}else{SR.cineQ=(SR.cineQ||[]).filter(q=>q.kind!==o.kind);SR.cineQ.push(o)}return}SR.cine=o;o.start&&o.start(o)}
function srCineTick(rdt){const C=SR.cine;{const on=!!C,h=SR.cv&&SR.cv.closest('#harc');if(h&&h.classList.contains('srcine')!==on)h.classList.toggle('srcine',on)}if(!C){SR.cineF=Math.max(0,(SR.cineF||0)-rdt*2.5);return 1}
  SR.cineF=Math.min(1,(SR.cineF||0)+rdt*3);C.t+=rdt;if(C.tick)C.tick(C,rdt);
  if(SR.tlEnd&&SR.phase==='aim')SR.tlEnd+=rdt*1000;// a köridő áll a jelenet alatt
  const sl=C.slow?C.slow(C):1;C.slowNow=sl;
  if(C.t>=C.T){SR.cine=null;const nx=(SR.cineQ||[]).shift();if(nx&&(!nx.ok||nx.ok())){SR.cine=nx;nx.t=0;nx.start&&nx.start(nx)}}
  return SR.mode==='net'?1:sl}
function srCineVeh(k,v){if(!srIsMine(v)||(v.cine=v.cine||{})[k])return;v.cine[k]=1;
  const L={eng:['MOTORINDÍTÁS','MTU 881 Ka-500 · 1000 LE dízel',2.6],tur:['TORONY · HIDRAULIKA','pneumatikus-hidraulikus toronyhajtás',2],load:['MÁLHÁZÁS','60 × 155 mm gránát · töltőautomata',2.6]}[k];
  srCine({kind:k,pri:1,T:L[2],cap:L[0],sub:L[1],ck:3.2,ok:()=>SR.v&&!v.dead,
    f:()=>{const p=k==='eng'?srLocal(v,30,-14):k==='tur'?srLocal(v,-8,-34):{x:v.x-v.face*84,y:srGy(v.x-v.face*84)-14};return [p.x+v.face*8,p.y-4+SR.H*.08/(SR.zb*2.4),SR.zb*(k==='load'?2.1:2.5)]},
    start:()=>{if(k==='eng')srSndBraam(.5,1.8);if(k==='tur')srSndHiss()},
    tick:(C,dt)=>{if(Math.random()<dt*(k==='eng'?30:k==='tur'?14:0)){const p=k==='eng'?srLocal(v,36,-14):srLocal(v,-8+(Math.random()-.5)*30,-30);
      SR.fx.push(k==='eng'?{k:'s',x:p.x,y:p.y,vx:-v.face*20+(Math.random()-.5)*10,vy:-30-Math.random()*20,r0:2,r1:14+Math.random()*10,t:1.6,t0:1.6,c:C.t<.9?'22,20,18':'80,76,70',al:.6,w:1}
       :{k:'s',x:p.x,y:p.y,vx:(Math.random()-.5)*40,vy:-10-Math.random()*16,r0:1,r1:7,t:.7,t0:.7,c:'235,238,240',al:.5,w:1})}
      if(k==='eng'&&C.t<1.2)SR.shake=Math.max(SR.shake,.08)}})}
function srCineFire(v,ev){if(!srCineOn())return;const mine=srIsMine(v),first=!SR.cineFire;SR.cineFire=1;const am=SR_AM[ev.am];
  if(first)srSndBraam(.7,2.4);
  srCine({kind:'fire',pri:2,T:mine?1.25:.9,cap:'TŰZ!',sub:(am?am.n:'')+(mine?'':' · '+v.name),ck:6,hot:1,
    f:()=>{const m=srMuzzle(v,v.elev);return [m.x-v.face*30,m.y+SR.H*.05/(SR.zb*2.3),SR.zb*2.3]},
    slow:C=>C.t<.55?.28:C.t<1?.28+(C.t-.55)/.45*.72:1})}
function srCineKill(v){if(!srCineOn())return;srSndBraam(1,3.6);srSndHeart();SR.sec=[{t:1.3,v},{t:2.6,v},{t:3.9,v}];
  srCine({kind:'kill',pri:3,T:6.4,cap:'KILŐVE!',sub:v.name,ck:2.2,red:1,skip:true,
    f:C=>{const u=srClamp((C.t-1.6)/4.8,0,1),e=u*u*(3-2*u),pts=[[v.x-60,v.y-60],[v.x+60,v.y+20]];for(const m of SR.bail||[])if(m.dl<=0)pts.push([m.x,m.y-10]);const F=srFrame(pts,SR.zb*2.2);return [F[0],F[1],F[2]*(1.18-.5*e)]},
    slow:C=>C.t<1.7?.25:C.t<2.6?.25+(C.t-1.7)/.9*.75:1,
    tick:(C,dt)=>{for(const q of SR.sec||[]){if(q.done||C.t<q.t)continue;q.done=1;const x=q.v.x+(Math.random()-.5)*30,y=q.v.y-20;srBoomHE(x,y+16,1.1+Math.random()*.4,0);srSparks(x,y,30);srShards(x,y,24,420,true);sndMega();SR.shake=Math.max(SR.shake,.6);SR.flash=Math.max(SR.flash,.35)}}})}
function srCineDraw(c,W,H,t){const f=SR.cineF||0;if(f<=0)return;const C=SR.cine,e=f*f*(3-2*f),bh=Math.round(Math.min(H*.12,64)*e);
  c.save();c.setTransform(SR.dpr,0,0,SR.dpr,0,0);c.fillStyle='#000';c.fillRect(0,0,W,bh);c.fillRect(0,H-bh,W,bh);
  if(C&&bh>8){const a=srClamp(Math.min(C.t*3,(C.T-C.t)*3),0,1);c.globalAlpha=a;c.textAlign='center';c.textBaseline='middle';
    const big=Math.min(bh*.62,C.kind==='kill'?40:30);c.font=`400 ${big|0}px ${SR_CFONT}`;c.lineWidth=Math.max(3,big*.14);c.strokeStyle='#000';c.lineJoin='round';
    const col=C.red?'#ff4a3a':C.hot?'#ffd23a':'#f3ecd4',ty=H-bh/2+(C.kind==='kill'?Math.sin(t*30)*(C.t<.6?3:0):0);c.strokeText(C.cap,W/2,ty);c.fillStyle=col;c.fillText(C.cap,W/2,ty);
    if(C.sub){c.font=`700 ${Math.max(10,bh*.26)|0}px system-ui`;c.fillStyle='rgba(243,236,212,.85)';c.fillText(C.sub,W/2,bh/2)}
    if(C.slowNow<.9&&SR.mode!=='net'){c.font='800 10px ui-monospace,monospace';c.textAlign='right';c.fillStyle='rgba(255,210,58,.8)';c.fillText('◉ LASSÍTÁS',W-10,bh/2)}
    c.font='700 9px system-ui';c.textAlign='left';c.fillStyle='rgba(255,255,255,.35)';if(C.skip!==false)c.fillText('koppints: tovább',10,bh/2)}
  c.restore()}
// filmes hangok: mély „braam” (elhangolt fűrészfogak zúgó szűrővel), szívdobogás, a saját löveg felé zuhanó gránát vészjósló süvítése, hörgés
function srSndBraam(vol,dur){if(!srSnd())return;try{const a=AC,t=a.currentTime+.02,lp=a.createBiquadFilter(),g=a.createGain();lp.type='lowpass';lp.Q.value=6;lp.frequency.setValueAtTime(160,t);lp.frequency.exponentialRampToValueAtTime(1300,t+.35);lp.frequency.exponentialRampToValueAtTime(220,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32*vol,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+dur);lp.connect(g).connect(MASTER);
  for(const [f,d] of [[49,0],[49.7,0],[73.4,0],[98.6,0]]){const o=a.createOscillator();o.type='sawtooth';o.frequency.value=f+d;o.connect(lp);o.start(t);o.stop(t+dur+.05)}
  srSub(t,60,32,dur*.8,.9*vol);srNoise(t,dur*.6,.08*vol,'lowpass',900,120)}catch(e){}}
function srSndHeart(){if(!srSnd())return;const t=AC.currentTime+.05;for(let i=0;i<5;i++){const b=t+i*.95;srThump(b,52,.6,.16);srThump(b+.26,46,.42,.14)}}
function srSndIncoming(dur){if(!srSnd())return;try{const a=AC,t=a.currentTime+.02,e=t+dur,g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,e-.15);g.gain.exponentialRampToValueAtTime(.0001,e);g.connect(MASTER);
  for(const d of [0,7]){const o=a.createOscillator();o.type='sine';o.frequency.setValueAtTime(2600+d,t);o.frequency.exponentialRampToValueAtTime(560+d*3,e);o.connect(g);o.start(t);o.stop(e+.02)}
  const tr=a.createOscillator(),tg=a.createGain();tr.frequency.value=11;tg.gain.value=.04;tr.connect(tg).connect(g.gain);tr.start(t);tr.stop(e)}catch(e){}}
function srSndGroan(m){if(!srSnd())return;try{const a=AC,t=a.currentTime+.02,d=.9+Math.random()*.8,f=95+Math.random()*45,o=a.createOscillator(),fm=a.createBiquadFilter(),fm2=a.createBiquadFilter(),g=a.createGain(),pn=a.createStereoPanner?a.createStereoPanner():null,
    vol=.3*srClamp(1.4-Math.abs(m.x-SR.cam.x)/900,.25,1),jit=a.createOscillator(),jg=a.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(f*1.15,t);o.frequency.exponentialRampToValueAtTime(f*.8,t+d);jit.type='square';jit.frequency.value=23+Math.random()*9;jg.gain.value=f*.08;jit.connect(jg).connect(o.frequency);// érdes, recsegő torokhang
  fm.type='bandpass';fm.frequency.value=480+Math.random()*120;fm.Q.value=4;fm2.type='bandpass';fm2.frequency.value=900;fm2.Q.value=5;o.connect(fm).connect(g);o.connect(fm2).connect(g);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.18);g.gain.setValueAtTime(vol*.8,t+d*.6);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  if(pn){pn.pan.value=srClamp((m.x-SR.cam.x)*SR.cam.z/(SR.W/2||200),-1,1);g.connect(pn).connect(MASTER)}else g.connect(MASTER);
  o.start(t);jit.start(t);o.stop(t+d+.05);jit.stop(t+d+.05);srNoise(t,d*.9,.03,'bandpass',700,400,1.5)}catch(e){}}
/* ---------- végzetes találat: a túlélő kezelők kiugranak a lövegből – lángolva futnak, a földön gurulva oltják magukat, kúsznak, sikoltoznak ---------- */
function srBailOut(v){const n=Math.max(2,Math.min(5,v.crew||0));SR.bail=SR.bail||[];
  for(let i=0;i<n;i++){const hatch=i===0?{x:v.x+v.face*28,y:v.y-20}:{x:v.x-v.face*(4+Math.random()*14),y:v.y-34},dir=Math.random()<.72?-v.face:v.face,burn=Math.random()<.7;
    SR.bail.push({x:hatch.x,y:hatch.y,vx:dir*(35+Math.random()*60),vy:-(95+Math.random()*70),dir,st:'air',dl:.15+i*.32+Math.random()*.2,t:0,ph:Math.random()*6,
      fire:burn?3.5+Math.random()*3:0,char:0,sc:.1+Math.random()*.6,smk:0,roll:Math.random()<.6,hurt:Math.random()<.5})}}
function srBailTick(c,dt,t){const B=SR.bail;if(!B||!B.length)return;
  for(const m of B){if(m.dl>0){m.dl-=dt;continue}m.t+=dt;m.ph+=dt*(m.st==='run'?16:m.st==='crawl'?6:m.st==='air'?20:0);
    if(m.fire>0){m.fire-=dt*(m.st==='roll'?3.2:1);m.char=Math.min(1,m.char+dt*.25);if((m.smk-=dt)<=0){m.smk=.07;SR.fx.push({k:'s',x:m.x+(Math.random()-.5)*4,y:m.y-14,vx:(Math.random()-.5)*8,vy:-26-Math.random()*16,r0:2,r1:10+Math.random()*8,t:1.4,t0:1.4,c:'58,52,46',al:.55,w:1})}}
    if((m.sc-=dt)<=0&&!m.still){if(m.st==='crawl'||m.st==='lie'||m.st==='fall'){m.sc=1.6+Math.random()*2.4;srSndGroan(m);if(m.st==='lie'&&(m.gr=(m.gr||0)+1)>=2)m.still=1}else{m.sc=m.fire>0?1.1+Math.random()*1.2:2.5+Math.random()*3;srSndScream(m)}}
    const gy=srGy(m.x);
    if(m.st==='air'){m.vy+=420*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;if(m.y>=gy&&m.vy>0){m.y=gy;srDust(m.x,.18,2);m.st=m.fire>0||!m.hurt?'run':'crawl';m.t=0}}
    else if(m.st==='run'){const zig=m.fire>0?Math.sin(m.t*7+m.ph)*.6:0;m.x+=m.dir*(m.fire>0?52:40)*(1+zig*.4)*dt;m.y=srGy(m.x);if(m.fire>0&&Math.random()<dt*1.5)m.dir=-m.dir*(Math.random()<.3?1:-1);
      if(m.t>(m.fire>0?1.3:.9)){m.st=m.fire>0&&!m.roll?'fall':m.fire>0?'roll':'crawl';m.t=0}}
    else if(m.st==='fall'){m.x+=m.dir*18*(1-Math.min(1,m.t/.5))*dt;m.y=srGy(m.x);if(m.t>.55){m.st='lie';m.t=0;srDust(m.x,.15,2);m.sc=Math.min(m.sc,.3)}}
    else if(m.st==='roll'){m.x+=m.dir*14*dt;m.y=srGy(m.x);if(m.t>1.5){m.fire=m.fire>0&&Math.random()<.35?Math.min(m.fire,1.2):0;m.st='crawl';m.t=0}}
    else if(m.st==='crawl'){m.x+=m.dir*(m.hurt?6:10)*dt;m.y=srGy(m.x);if(m.t>5+m.ph%3&&m.fire<=0){m.st='lie';m.t=0}}
    else m.y=gy;
    m.x=srClamp(m.x,6,SR_W-6);srDrawBail(c,m,t)}}
function srDrawBail(c,m,t){if(m.dl>0)return;srDrawBail1(c,m,t,true);srDrawBail1(c,m,t,false)}
// két menet: előbb vastag fekete tuskontúr, rá a színes alak – így az alkonyati talajon is jól látszik
function srDrawBail1(c,m,t,ink){const s=1.75,ph=m.ph,uni=ink?'#111':m.char>.5?'#4a4a38':'#6f8a48',skin=ink?'#111':m.char>.6?'#6a4a36':'#e0b48c',boot=ink?'#111':'#3a4428',hel=ink?'#111':'#4a5636';
  c.save();c.translate(m.x,m.y);c.scale(m.dir*s,s);c.lineCap='round';c.lineJoin='round';
  const limb=(x0,y0,x1,y1,col,w)=>{c.strokeStyle=col;c.lineWidth=w+(ink?1.3:0);c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke()};
  const box=(x,y,w,h,col)=>{c.fillStyle=col;ink?c.fillRect(x-.65,y-.65,w+1.3,h+1.3):c.fillRect(x,y,w,h)},dot=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r+(ink?.65:0),0,7);c.fill()};
  if(m.st==='fall'){c.rotate(Math.min(1.45,m.t/.5*1.45))}
  if(m.st==='air'||m.st==='run'||m.st==='fall'){const a=m.st==='air',sw=Math.sin(ph)*(a?2.5:3.4),up=m.fire>0||a;
    limb(0,-6,sw,0,boot,1.6);limb(0,-6,-sw,0,boot,1.6);c.save();c.rotate(a?-.25:.18);box(-1.8,-12.2,3.6,6.8,uni);
    limb(0,-11,up?2+Math.sin(ph*1.3)*2:sw*.6,up?-16-Math.cos(ph)*1.5:-7,uni,1.4);limb(0,-11,up?-2+Math.cos(ph*1.1)*2:-sw*.6,up?-15.5-Math.sin(ph)*1.5:-7,uni,1.4);
    dot(0,-13.8,1.8,skin);if(m.char<.8&&!ink){c.fillStyle=hel;c.beginPath();c.arc(0,-14.2,2,Math.PI,0);c.fill()}
    if(!ink&&(m.fire>0||a)){c.fillStyle='#111';c.beginPath();c.ellipse(.9,-13.4,.55,.75,0,0,7);c.fill()}c.restore()}// tátott szájjal sikolt
  else if(m.st==='roll'){c.translate(0,-2.4);c.rotate(m.t*11);box(-3.4,-1.8,6.8,3.6,uni);limb(-3,0,-6.5,Math.sin(ph)*1.2,boot,1.5);dot(4.6,0,1.8,skin)}
  else{const cr=m.st==='crawl',k=cr?Math.sin(ph):0;// hason kúszik / fekszik
    limb(-3,-1.2,-8,-1+k*1.4,boot,1.6);limb(-3,-1.2,-7.6,-.2-k*1.4,boot,1.6);box(-3.5,-3,7,2.6,uni);
    limb(2.4,-2.2,5+k*1.6,-.2,uni,1.4);limb(2.4,-2.2,4.2-k*1.6,-.1,uni,1.4);dot(5.2,-3.2,1.7,skin);if(m.char<.8&&!ink){c.fillStyle=hel;c.beginPath();c.arc(5.4,-3.6,1.9,Math.PI*1.1,Math.PI*2.1);c.fill()}}
  c.restore();if(ink)return;
  if(m.fire>0){const prone=m.st==='crawl'||m.st==='lie'||m.st==='roll'||m.st==='fall',fx=m.x,fy=m.y-(prone?4:12),hgt=prone?10:18,wid=prone?14:7;c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<5;i++){const f=Math.sin(t*23+i*1.9+m.ph),ox=(i-2)*wid*.28+f*1.2,h=hgt*(.6+.4*Math.abs(Math.sin(t*17+i))),g=c.createRadialGradient(fx+ox,fy,0,fx+ox,fy-h*.4,h*.75);
      g.addColorStop(0,'rgba(255,240,170,.9)');g.addColorStop(.45,'rgba(255,140,30,.65)');g.addColorStop(1,'rgba(200,40,0,0)');c.fillStyle=g;c.beginPath();c.moveTo(fx+ox-wid*.35,fy+3);c.quadraticCurveTo(fx+ox-wid*.4,fy-h*.5,fx+ox+f*2,fy-h);c.quadraticCurveTo(fx+ox+wid*.4,fy-h*.5,fx+ox+wid*.35,fy+3);c.fill()}
    c.restore()}}
// sikoltás: torokhang (fűrészfog + két formáns szűrő), remegő, felcsapó majd elhaló hangmagasság, a kezelő helye szerint balra/jobbra
function srSndScream(m){if(!srSnd())return;try{const a=AC,t=a.currentTime+.02,hot=m.fire>0,d=(hot?1.1:.8)+Math.random()*.8,f=(hot?520:410)*(1+Math.random()*.35),
    o=a.createOscillator(),lfo=a.createOscillator(),lg=a.createGain(),f1=a.createBiquadFilter(),f2=a.createBiquadFilter(),g2=a.createGain(),out=a.createGain(),pn=a.createStereoPanner?a.createStereoPanner():null,
    vol=.22*srClamp(1.4-Math.abs(m.x-SR.cam.x)/900,.25,1);
  o.type='sawtooth';o.frequency.setValueAtTime(f*.75,t);o.frequency.exponentialRampToValueAtTime(f*1.4,t+.16);o.frequency.exponentialRampToValueAtTime(f*1.15,t+d*.6);o.frequency.exponentialRampToValueAtTime(f*.55,t+d);
  lfo.frequency.value=5.5+Math.random()*3.5;lg.gain.value=f*.06;lfo.connect(lg).connect(o.frequency);
  f1.type='bandpass';f1.frequency.value=800+Math.random()*150;f1.Q.value=5;f2.type='bandpass';f2.frequency.value=1250+Math.random()*350;f2.Q.value=7;g2.gain.value=.75;
  o.connect(f1).connect(out);o.connect(f2).connect(g2).connect(out);
  out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(vol,t+.07);out.gain.setValueAtTime(vol*.85,t+d*.7);out.gain.exponentialRampToValueAtTime(.0001,t+d);
  if(pn){pn.pan.value=srClamp((m.x-SR.cam.x)*SR.cam.z/(SR.W/2||200),-1,1);out.connect(pn).connect(MASTER)}else out.connect(MASTER);
  o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);srNoise(t,d*.8,.025,'bandpass',1900,1100,2)}catch(e){}}
/* ---------- az üzenetek (középső üzenet, figyelmeztetés) oda kerülnek, ahol nem takarják a lövegeket és a fölöttük lévő sávokat ---------- */
function srMsgPlace(){const now=performance.now();if(now-(SR.mpT||0)<(SR.cine?60:120))return;SR.mpT=now;if(!SR.cv||!SR.v)return;
  const els=[$('#srMsg'),$('#srAlert')].filter(e=>e&&!e.hidden);if(!els.length)return;
  const z=SR.cam.z,W=SR.W,H=SR.H,sx=x=>(x-SR.cam.x)*z+W/2,sy=y=>(y-SR.cam.y)*z+H*.62,obs=[];
  for(const v of SR.v)obs.push([sx(v.x-62),sy(v.y-80),sx(v.x+62),sy(v.y+14)]);
  for(const m of SR.bail||[])if(m.dl<=0)obs.push([sx(m.x-14),sy(m.y-26),sx(m.x+14),sy(m.y+4)]);
  if(SR.cine){const bh=Math.min(H*.12,64);obs.push([0,0,W,bh],[0,H-bh,W,H])}
  const base=SR.mBase||(SR.mBase={});
  for(const el of els){const id=el.id;if(base[id]==null){el.style.top='';base[id]=parseFloat(getComputedStyle(el).top)||60}
    const w=el.offsetWidth,h=el.offsetHeight,L=W/2-w/2,R=W/2+w/2,maxY=Math.max(base[id],H-h-(srFold().d?38:SR.H<420?60:76)-(SR.cine?Math.min(H*.12,64):0));let best=null;
    for(let y=base[id];y<=maxY;y+=12){let ov=0;for(const o of obs){const ix=Math.max(0,Math.min(R,o[2])-Math.max(L,o[0])),iy=Math.max(0,Math.min(y+h,o[3])-Math.max(y,o[1]));ov+=ix*iy}
      if(!best||ov<best.ov)best={y,ov};if(ov===0)break}
    const ny=Math.round(best.y)+'px';if(el.style.top!==ny)el.style.top=ny;obs.push([L,best.y-4,R,best.y+h+4])}}
/* ---------- „Mindent be” gomb: a 4 rendszer egymás után, a megszokott hangokkal ---------- */
function srNeedSw(v){return ['eng','rad','tur'].filter(k=>!v.sys[k]&&v.d[k]<2).concat(v.load<1&&!v.loading?['load']:[])}
function srAllOn(){if(!SR.v||!(SR.phase==='prep'||srMyTurn()))return;const v=srCtl(),ks=srNeedSw(v);if(!ks.length)return;clearTimeout(SR.allT);
  let i=0;const step=()=>{if(!SR.v||srCtl()!==v||!(SR.phase==='prep'||srMyTurn()))return;const k=ks[i++];const on=k==='load'?v.load>=1||v.loading:v.sys[k];if(!on)srSwitch(k);if(i<ks.length)SR.allT=setTimeout(step,k==='eng'?650:420)};step()}
/* ---------- bevezető az első játékhoz: mindig a következő teendőre mutat (kihagyható, csak egyszer) ---------- */
const SR_TUT='srTut1',SR_TUTX={eng:['1/6 · MOTOR','Indítsd be a motort. Tipp: a ⚡ MINDENT BE egy gombbal mindent bekapcsol.'],
 rad:['2/6 · RÁDIÓ','Rádió be: tőle jön az időjárás (METEO) és a lőtábla.'],tur:['3/6 · TORONY','Torony be – enélkül nem lehet irányozni és lőni.'],
 load:['4/6 · MÁLHÁZÁS','Töltsd be a 60 gránátot.'],wait:['Töltés…','Mindjárt kezdődik a párbaj.'],
 elev:['5/6 · MAGASSÁG','Húzd a skálát vagy nyomd a −/+ gombot. A kép alján lévő LŐTÁBLA érték jó kiindulópont.',1],
 fire:['6/6 · TŰZ!','Lőj! Utána az ELTÉRÉS sor és a FELÜLNÉZET mutatja, mennyit tévedtél.']};
function srTutOn(){try{return !localStorage.getItem(SR_TUT)}catch(e){return false}}
function srTutDone(){SR.tutS='done';try{localStorage.setItem(SR_TUT,'1')}catch(e){}const el=$('#srTut');if(el)el.hidden=true;srTutHl(null);const h=$('#harc');h&&h.classList.remove('srtutsw')}
function srTutHl(t){if(SR.tutHl&&SR.tutHl!==t)SR.tutHl.classList.remove('srhl');SR.tutHl=t;if(t)t.classList.add('srhl')}
function srTutTick(){const el=$('#srTut'),all=$('#srAll');if(!el)return;const now=performance.now();if(now-(SR.tutT||0)<180)return;SR.tutT=now;
  const v=SR.v&&srCtl(),act=!!v&&!SR.paused&&(SR.phase==='prep'||srMyTurn());
  if(all){const sh=act&&srNeedSw(v).length>0;if(all.hidden===sh)all.hidden=!sh}
  if(SR.tutS==='done'||(SR.tutS==null&&!srTutOn())){SR.tutS='done';if(!el.hidden)el.hidden=true;srTutHl(null);return}
  let k=null;if(act){const n=srNeedSw(v);k=n[0]||(v.loading?'wait':null);
    if(!k&&srMyTurn()){if(SR.tutE==null)SR.tutE=v.elev;k=v.elev!==SR.tutE||SR.tutS==='fire'?'fire':'elev'}}
  if(!k){if(!el.hidden)el.hidden=true;srTutHl(null);$('#harc').classList.remove('srtutsw');return}
  SR.tutS=k;$('#harc').classList.toggle('srtutsw',k!=='elev'&&k!=='fire');const tg=k==='wait'?null:k==='elev'?$('#srTE'):k==='fire'?$('#srFire'):$(`#srPanel [data-sw="${k}"]`),[h,b,below]=SR_TUTX[k];
  if(el.dataset.k!==k){el.dataset.k=k;el.querySelector('b').textContent=h;el.querySelector('span').textContent=b;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
  el.hidden=false;srTutHl(tg);
  // a buborék a kiemelt elem fölé kerül, a nyíl rá mutat
  const H=$('#harc').getBoundingClientRect(),bw=el.offsetWidth,bh=el.offsetHeight;let x=H.width/2-bw/2,y=H.height*.3,ax=null;
  if(tg){const r=tg.getBoundingClientRect(),cx=r.left+r.width/2-H.left;x=srClamp(cx-bw/2,8,H.width-bw-8);y=below?Math.min(H.height-bh-8,r.bottom-H.top+14):Math.max(8,r.top-H.top-bh-14);ax=srClamp(cx-x,16,bw-16)}
  el.style.left=x+'px';el.style.top=y+'px';el.classList.toggle('noarr',ax==null);el.classList.toggle('below',!!below);if(ax!=null)el.style.setProperty('--ax',ax+'px')}
function srHudDom(){const P=SR.phase,my=srMyTurn(),tl=P==='aim'&&SR.tlEnd?Math.max(0,Math.ceil((SR.tlEnd-Date.now())/1000)):null,t=P==='prep'?'Előkészítés':P==='aim'?(my?(SR.mode==='hot'?SR.v[SR.turn].name:'Te jössz'):'Ellenfél céloz')+(tl!=null?' · '+tl+' s':''):P==='fly'?'Lövés úton':P==='over'?'Vége':P==='drop'?'Utánpótlás':'Becsapódás',e=$('#srTurn');
  if(e&&e.textContent!==t)e.textContent=t;if(e)e.classList.toggle('low',tl!=null&&tl<=10&&my);const r=$('#srRound');if(r&&r.textContent!==String(SR.round))r.textContent=SR.round;
  const pn=$('#srPanel'),off=!(my||P==='prep');if(pn&&pn.classList.contains('wait')!==off)pn.classList.toggle('wait',off);
  const f=$('#srFuel'),v=srCtl();if(f)f.style.width=Math.round(v.fuel/SR_FUEL*100)+'%';const fb=$('#srFire');if(fb){const an=srAmmoN(v),tur=v.sys.tur||v.d.tur>=2,rdy=my&&v.ammo[v.sel]>0&&tur;if(fb.classList.contains('rdy')!==rdy)fb.classList.toggle('rdy',rdy);
    // a TŰZ gomb mindig megmondja, miért nem lehet lőni, vagy mit fog kilőni
    const sub=P==='prep'?'előkészítés':!my?(P==='fly'?'lövés úton':P==='aim'?'várj a körödre':'várj'):an===0?'nincs lőszer':!(v.ammo[v.sel]>0)?'válassz lőszert':!tur?'torony kikapcsolva':(SR_AM[v.sel].n.split(' ')[0]+' · '+v.ammo[v.sel]+' db');
    if(fb.dataset.k!==sub){fb.dataset.k=sub;fb.innerHTML='TŰZ!<small>'+esc(sub)+'</small>'}}
  const pb=$('#srPzB');if(pb){const sh=P!=='over'&&(SR.mode!=='net'||P!=='prep');if(pb.hidden===sh)pb.hidden=!sh;const dim=!SR.paused&&!srPzCan();if(pb.classList.contains('dim')!==dim)pb.classList.toggle('dim',dim)}
  if(Date.now()-(SR.pgT||0)>1000){SR.pgT=Date.now();const pg=$('#srPing'),N=SR.net,net=SR.mode==='net'&&!!N,stall=net&&(navigator.onLine===false||N.pend>0&&Date.now()-N.wT>4000),on=net&&(!!N.rtt||stall);if(pg){pg.hidden=!on;if(on){if(stall){pg.textContent='⚠ kapcsolódás…';pg.className='srping bad'}else{const r=Math.round(N.rtt);pg.textContent=r+' ms';pg.className='srping '+(r<200?'ok':r<450?'mid':'bad')}}}
    if(SR.mode==='net'&&SR.net&&P==='aim'&&Date.now()-(SR.net.pingT||0)>20000){SR.net.pingT=Date.now();srNetPing()}}
  if(SR.uiI!==v.i){SR.uiI=v.i;srUI();srDials()}
  if((SR.rdN=(SR.rdN||0)+1)%90===0)srDials();srTutTick();srMsgPlace()}// a skálák időnként újrarajzolódnak (háttérből visszatérve a telefon kiürítheti a vásznat)
function srFit(){const cv=SR.cv;if(!cv)return;const r=cv.getBoundingClientRect(),dpr=LOWFX?1:Math.min(SR.qcap||3,devicePixelRatio||1,((SR.qb||1)>=1.2?2600:1900)/Math.max(r.width,r.height));if(!r.width)return;cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);Object.assign(SR,{W:r.width,H:r.height,dpr,zb:srClamp(r.width/430,.78,1.5),mBase:null});srDials()}

/* ---------- online szoba (meghívókód) ---------- */
/* ---------- szünet és mentett állás („innen folytatjuk”) ---------- */
const SR_SAVE='srSave1';
function srSaveGet(){try{const d=JSON.parse(localStorage.getItem(SR_SAVE)||'null');if(d&&d.v&&Date.now()-d.ts<14*864e5)return d}catch(e){}return null}
function srSaveDel(){try{localStorage.removeItem(SR_SAVE)}catch(e){}}
function srSaveDesc(d){const m=d.mode==='ai'?'Gép ellen · '+((SR_AI[d.lvl]||{}).n||''):'Ketten egy telefonon',hp=v=>v.dead?'kilőve':Math.round(v.hp)+'%';return `${m} · ${d.round}. kör · ${d.v[0].name} ${hp(d.v[0])} – ${d.v[1].name} ${hp(d.v[1])}`}
// a kör elején (és szünetkor, kilépéskor) mentünk; csak célzás közbeni állapot kerül mentésre, így visszatöltve tiszta helyzetből folytatódik
function srSave(){if(!SR.v||SR.mode==='net'||SR.phase!=='aim'||SR.v.some(v=>v.dead))return;
  const r1=x=>Math.round(x*10)/10,veh=v=>{const o={};for(const k in v)if(k!=='dec')o[k]=v[k];return o},arc=a=>a&&{...a,pts:Array.from(a.pts,r1)};
  const d={ts:Date.now(),mode:SR.mode,o:SR.opts.o,lvl:SR.lvl,seed:SR.seed,drop:SR.drop||0,turn:SR.turn,round:SR.round,wind:SR.wind,zOff:SR.zOff,ai:{n:SR.ai.n,tx:SR.ai.tx},
    h:Array.from(SR.h,r1),sc:Array.from(SR.sc,x=>Math.round(x*100)/100),trees:SR.trees,smokes:SR.smokes,flares:SR.flares,last:SR.last.map(arc),rep:SR.rep,v:SR.v.map(veh)};
  try{localStorage.setItem(SR_SAVE,JSON.stringify(d))}catch(e){try{d.last=[null,null];localStorage.setItem(SR_SAVE,JSON.stringify(d))}catch(x){}}}
function srResume(){const d=srSaveGet();if(!d){srMenu();return}
  try{srBegin(d.mode,{...(d.o||{}),seed:d.seed});
    Object.assign(SR,{drop:d.drop||0,turn:d.turn,round:d.round,wind:d.wind,zOff:d.zOff,trees:d.trees,smokes:d.smokes||[],flares:d.flares||[],last:d.last||[null,null],rep:d.rep||[null,null],prepT:99});
    SR.ai.n=d.ai.n;SR.ai.tx=d.ai.tx;SR.h=Float32Array.from(d.h);SR.sc=Float32Array.from(d.sc);
    SR.v=d.v.map(o=>Object.assign(o,{dec:[],rec:0,vy:0,av:0,loading:false,smk:0,cook:0}));for(const v of SR.v){const R=srRest(v);v.y=R.y;v.a=R.a}
    const c=srCtl();SR.cam={x:c.x,y:c.y-30,z:SR.zb*1.25};SR.phase='aim';SR.tlEnd=SR.v[SR.turn].ai?0:Date.now()+SR_TLIM*1000;SR.tlS=999;if(SR.v[SR.turn].ai)srAiPlan();
    srUI();srDials();if(SR.v.some(v=>!v.ai&&v.sys.eng))srEngLoop(true);srSave();
    srMsg('▶ Folytatjuk – '+SR.round+'. kör · '+(srMyTurn()?(SR.mode==='hot'?SR.v[SR.turn].name+' következik':'te jössz'):SR.v[SR.turn].name+' céloz'),3200)}
  catch(e){console.warn('srResume',e);srSaveDel();toast('A mentett állás nem tölthető be.');srMenu()}}
const srPzCan=()=>!!SR.v&&SR.phase!=='over'&&(SR.mode!=='net'||SR.phase==='aim'&&srMyTurn());
// online: szünetet csak a soron lévő játékos kérhet (célzás közben) – így a szobában mindig csak egy fél ír
// bg: az app háttérbe került (telefonhívás, appváltás) – online is azonnal megáll, bárki köre is van
function srPause(on,remote,bg){if(!SR.v)return;
  if(on){if(SR.paused)return;if(!remote&&!bg&&!srPzCan()){toast(SR.mode==='net'?'Online szünetet a saját körödben, célzás közben tarthatsz.':'Most nem lehet megállítani.');return}
    SR.paused={by:remote?'opp':'me',bg:!!bg,left:SR.tlEnd?Math.max(SR.tlEnd-Date.now(),bg?0:-1e9):0};SR.slowW=0;SR.mv=0;srEngLoop(false);srLoaderHum(false,true);try{SR.whN&&SR.whN.disconnect()}catch(e){}
    if(SR.mode==='net'&&!remote)srNetSend({k:'pause',bg:bg?1:0});srSave();srPzShow(true)}
  else{const P=SR.paused;if(!P||SR.mode==='net'&&P.by==='opp'&&!remote||remote&&P.by==='me')return;/* a saját szünetünket az ellenfél nem oldhatja fel */SR.paused=null;if(SR.tlEnd)SR.tlEnd=Date.now()+P.left;
    if(SR.mode==='net'&&!remote)srNetSend({k:'resume'});srPzShow(false);SR.lastT=performance.now();if(SR.v.some(v=>!v.ai&&!v.dead&&v.sys.eng))srEngLoop(true)}}
function srPzShow(on){const el=$('#srPz'),pn=$('#srPanel');if(pn)pn.classList.toggle('pz',!!on);if(!el)return;el.hidden=!on;if(!on){el.innerHTML='';return}
  const P=SR.paused,net=SR.mode==='net',opp=P&&P.by==='opp',bg=P&&P.bg;
  el.innerHTML=`<div class="srpzbox"><h3>${ic('pause')}SZÜNET</h3><p>${opp&&bg?'📞 '+esc(SR.v[1-SR.me].name)+' telefonhívást kapott vagy háttérbe tette az appot. A párbaj áll, az órád nem fogy – amint visszajön és folytatja, megy tovább.':opp?esc(SR.v[1-SR.me].name)+' szünetet tart. Amint folytatja, megy tovább a párbaj – az órád addig áll.':bg&&net?'📞 Háttérbe került az app (pl. telefonhívás), ezért a párbaj azonnal megállt – az ellenfeled is vár, a köridő áll. Ha készen állsz, folytasd.':bg?'📞 Háttérbe került az app (pl. telefonhívás), ezért a játék megállt, az állást elmentettük.':net?'Az ellenfeled is látja, hogy szünetet tartasz. A köridő áll.':'A játék áll, az állást elmentettük.<br>Ha most kilépsz, a menüből <b>innen folytathatod</b>.'}</p>
   ${opp?'<i class="srwait"><span class="srspin"></span>Várakozás az ellenfélre…</i>':`<button type="button" class="srbig pri" id="srPzGo">${ic('play')}Folytatás</button>`}
   ${net?'':`<button type="button" class="srbig" id="srPzMenu"><span>${ic('save')}Kilépés a menübe</span><small>az állás mentve – később innen folytatod</small></button><button type="button" class="srbig" id="srPzNew">${ic('again')}Új játék</button>`}
   <button type="button" class="srbig warn" id="srPzQuit">${net?ic('flag')+'Feladás és kilépés':ic('exit')+'Kilépés a játékból'}</button></div>`;
  const b=(id,f)=>{const e=$(id);if(e)e.onclick=f};
  b('#srPzGo',()=>{ac();srPause(false)});
  b('#srPzMenu',()=>{srSave();SR.paused=null;srMenu();toast('Állás elmentve – a menüben a „Folytatás innen” kártyával folytathatod.')});
  b('#srPzNew',()=>{if(!confirm('Új játékot kezdesz? A mostani állás elvész.'))return;srSaveDel();SR.paused=null;srPzShow(false);srBegin(SR.opts.mode,{...SR.opts.o,seed:0})});
  b('#srPzQuit',()=>{if(net){if(!confirm('Feladod a párbajt? Az ellenfeled nyer.'))return;srNetLeave();SR.paused=null;srMenu()}else{srSave();SR.paused=null;srClose()}})}
// telefonhívás, appváltás, képernyőzár: azonnali szünet minden módban (online is, hogy a párbaj ne vesszen el); az ellenfél órája is megáll
function srBgPause(){if(!SR.cv||!SR.v||SR.paused||SR.phase==='over'||SR.phase==='prep'&&SR.mode!=='net')return;if(SR.mode==='net'&&!SR.net)return;srPause(true,false,true)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)srBgPause()});
addEventListener('pagehide',srBgPause);
const srNetOk=()=>MODE==='fb'&&!!UID&&!!DB&&navigator.onLine!==false;
const srNetRef=()=>DB.collection('srRooms').doc(SR.net.code);
function srNetErr(e){console.warn('Shot&Run net',e);toast(e&&e.code==='permission-denied'?'A szerver elutasította (a Firestore-szabályokat frissíteni kell).':'Hálózati hiba – próbáld újra.')}
function srNetListen(){setTimeout(srNetPing,400);setTimeout(srNetPing,2500);SR.net.unsub=srNetRef().onSnapshot(s=>{const N=SR.net;if(!N)return;const d=s.data();if(!d){if(!s.metadata||!s.metadata.fromCache)srNetGone();return}
    if(N.role===0&&!N.started&&d.guest){N.started=true;srBegin('net',{me:0,seed:d.seed,names:[d.hostName,d.guestName||'Vendég']})}
    if(d.ev&&d.ev!==N.last){N.last=d.ev;srNetRecv(N,d.ev)}},srNetErr)}
/* Megbízható eseménycsere egyetlen dokumentummezőn (a Firestore-szabályok változtatása nélkül):
   mindkét fél a saját, sorszámozott, még nem nyugtázott eseményeit és a másiktól utoljára kapott sorszámot (nyugta) írja.
   Ha a két fél írása felülírja egymást, a nyugtázatlan esemény újraküldődik; a fogadó a sorszám alapján szűr, így semmi sem vész el és semmi sem fut le kétszer. */
function srNetN(code,role,started){return {code,role,last:'',started,seq:0,q:[],rs:0,ack:0,wT:0,pend:0,okT:Date.now()}}
function srNetEnv(N){let q=N.q,s=JSON.stringify({v:2,u:UID,a:N.rs,q});while(s.length>29000&&q.length>1){q=q.slice(1);s=JSON.stringify({v:2,u:UID,a:N.rs,q})}return s}
function srNetFlush(N){if(!N||SR.net!==N)return;clearTimeout(N.ackT);N.ackT=0;const s=srNetEnv(N),t0=performance.now();N.wT=Date.now();N.last=s;N.pend++;
  srNetRef().update({ev:s,ts:Date.now()}).then(()=>{srNetRtt(N,performance.now()-t0);N.fail=0;N.okT=Date.now()}).catch(e=>{N.fail=(N.fail||0)+1;if(e&&e.code==='permission-denied'||N.fail===3)srNetErr(e)}).finally(()=>{N.pend=Math.max(0,N.pend-1)})}
function srNetAckSoon(N){if(!N.ackT)N.ackT=setTimeout(()=>{N.ackT=0;srNetFlush(N)},120)}
function srNetRecv(N,str){let o=null;try{o=JSON.parse(str)}catch(e){}if(!o||o.u===UID)return;
  if(o.v!==2){SR.inbox.push(o);return}// régebbi verziójú ellenfél
  if(o.a>N.ack){N.ack=o.a;N.q=N.q.filter(e=>e.n>o.a)}
  let dup=false;for(const e of (o.q||[]).slice().sort((a,b)=>a.n-b.n)){if(e.n===N.rs+1){N.rs=e.n;SR.inbox.push(e)}else if(e.n<=N.rs)dup=true}
  if(o.q&&o.q.length||dup)srNetAckSoon(N)}
// újraküldés, ha a nyugta 1,5 mp-en belül nem jött meg (pl. a két írás felülírta egymást, vagy átmenetileg nem volt net)
function srNetKeep(){const N=SR.net;if(!N||!N.q.length||navigator.onLine===false)return;if(Date.now()-N.wT>1500)srNetFlush(N)}
addEventListener('online',()=>{const N=SR.net;if(N){N.wT=0;srNetFlush(N);setTimeout(srNetPing,300)}});
async function srNetHost(){if(!srNetOk()){toast('Ehhez be kell jelentkezned (online mód).');return}const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';for(let i=0;i<5;i++)code+=A[Math.random()*A.length|0];
  srNetLeave();const seed=1+Math.random()*2147483000|0;
  try{await DB.collection('srRooms').doc(code).set({host:UID,hostName:srMyName(),guest:null,guestName:'',seed,ev:'',ts:Date.now()})}catch(e){srNetErr(e);return}
  SR.net=srNetN(code,0,false);SR.inbox=[];const st=$('#srStart'),link=srInvLink(code),cp=(t,m)=>{try{navigator.clipboard.writeText(t).then(()=>toast(m),()=>toast(t))}catch(e){toast(t)}};
  if(st){st.innerHTML=`<h3>MEGHÍVÓ KÉSZ!</h3><p class="srlead">Küldd el a barátodnak. Amint belép, <b>azonnal indul</b> a párbaj.</p>
    <div class="srroom"><small>Meghívókód</small><b>${code}</b><i class="srwait"><span class="srspin"></span>Várakozás a barátodra…</i></div>
    <div class="srbtns"><button type="button" class="btn pri" id="srShare">${ic('share')}Meghívó küldése</button><div class="srrow2"><button type="button" class="btn line" id="srCopyL">${ic('link')}Link</button><button type="button" class="btn line" id="srCopy">${ic('paste')}Kód</button></div><button type="button" class="btn line" id="srCancel">Mégse</button></div>`;
    $('#srShare').onclick=async()=>{const d={title:'Shot&Run párbaj',text:'Gyere egy Shot&Run tüzérpárbajra! Koppints a linkre, vagy írd be a kódot: '+code,url:link};if(navigator.share){try{await navigator.share(d)}catch(e){}}else cp(d.text+' '+link,'Meghívó kimásolva – illeszd be egy üzenetbe!')};
    $('#srCopyL').onclick=()=>cp(link,'Link kimásolva');$('#srCopy').onclick=()=>cp(code,'Kód kimásolva: '+code);$('#srCancel').onclick=()=>srNetMenu()}
  srNetListen()}
async function srNetJoin(){if(!srNetOk()){toast('Ehhez be kell jelentkezned (online mód).');return}if(SR.joining)return;SR.joining=1;try{await srNetJoin2()}finally{SR.joining=0}}
async function srNetJoin2(){const code=($('#srCode')?.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==5){toast('Az 5 jegyű meghívókódot írd be!');return}
  srNetLeave();let d;try{const ref=DB.collection('srRooms').doc(code),s=await ref.get();if(!s.exists){toast('Nincs ilyen szoba: '+code);return}d=s.data();
    if(d.host===UID){toast('Ez a saját szobád – a kódot a társadnak küldd el.');return}if(d.guest&&d.guest!==UID){toast('Ez a szoba már megtelt.');return}if(d.guest===UID){toast('Ez a párbaj már elindult – kérj új meghívókódot.');return}
    if(Date.now()-d.ts>3600000&&!d.guest){toast('Ez a meghívó lejárt – kérj újat.');return}
    if(!d.guest)await ref.update({guest:UID,guestName:srMyName(),ts:Date.now()})}catch(e){srNetErr(e);return}
  SR.net=srNetN(code,1,true);SR.net.last=d.ev||'';SR.inbox=[];srNetListen();srBegin('net',{me:1,seed:d.seed,names:[d.hostName,srMyName()]})}
function srNetSend(ev){const N=SR.net;if(!N)return;const o={...ev,u:UID,ts:Date.now(),n:++N.seq};
  if(ev.pts){const p=ev.pts,n=p.length/2,q=[];for(let i=0;i<n;i+=3)q.push(Math.round(p[i*2]*10)/10,Math.round(p[i*2+1]*10)/10);if((n-1)%3)q.push(Math.round(p[n*2-2]*10)/10,Math.round(p[n*2-1]*10)/10);o.pts=q;o.dt=ev.dt*3;o.apex=Math.round(ev.apex/3)}
  N.q.push(o);srNetFlush(N)}
// oda-vissza idő (a szerver nyugtázásáig) – ebből becsüljük, mennyivel később látja a másik fél az eseményt
function srNetRtt(N,ms){if(!N||!(ms>0)||ms>8000)return;N.rtt=N.rtt?N.rtt*.7+ms*.3:ms}
function srNetPing(){const N=SR.net;if(!N)return;const t0=performance.now();srNetRef().update({ts:Date.now()}).then(()=>srNetRtt(N,performance.now()-t0)).catch(()=>{})}
const srNetLat=()=>{const r=SR.net&&SR.net.rtt;return r?srClamp((r*.6+60)/1000,.04,1.5):.25};
function srNetLeave(){const N=SR.net;if(!N)return;SR.net=null;try{N.unsub&&N.unsub()}catch(e){}
  try{const ref=DB.collection('srRooms').doc(N.code);if(N.role===0&&!N.started)ref.delete().catch(()=>{});else{N.q.push({k:'left',u:UID,ts:Date.now(),n:++N.seq});ref.update({ev:srNetEnv(N),ts:Date.now()}).catch(()=>{})}}catch(e){}}
function srNetGone(){const N=SR.net;if(!N)return;SR.net=null;try{N.unsub&&N.unsub()}catch(e){}
  if(SR.mode==='net'&&SR.v&&SR.phase!=='over'){SR.phase='over';SR.run=false;srEngLoop(false);const o=$('#srOver');o.innerHTML='<h3>🏳 AZ ELLENFÉL KILÉPETT</h3><p>A párbaj véget ért – a harcmező a tiéd.</p><button class="btn pri" id="srBack">Ellenfélválasztás</button>';o.hidden=false;$('#srPanel').classList.add('off');$('#srBack').onclick=srMenu}
  else toast('Az ellenfél kilépett a szobából.')}
function srNetPoll(){srNetKeep();if(SR.mode!=='net'||!SR.inbox||!SR.inbox.length)return;const e=SR.inbox[0];
  if(e.k==='pause'||e.k==='resume'){SR.inbox.shift();srPause(e.k==='pause',true,!!e.bg);return}
  if(e.k==='left'){SR.inbox.shift();SR.paused=null;srPzShow(false);srNetGone()}
  else if(e.k==='re'){SR.inbox.shift();if(e.seed!==SR.seed)srBegin('net',{...SR.opts.o,seed:e.seed})}
  else if(SR.phase==='aim'&&SR.turn!==SR.me){if(SR.paused)srPause(false,true);srPlay(SR.inbox.shift(),false)}}

/* ---------- megnyitás, menü ---------- */
function srMenu(){srLoaderHum(false,true);SR.v=null;SR.bgK=null;{const h=$('#harc');h&&h.classList.add('srm')}SR.run=false;SR.mode=null;SR.paused=null;srPzShow(false);srEngLoop(false);const s=$('#srStart');if(!s)return;{const b=$('#srPzB');if(b)b.hidden=true;const t=$('#srTurn');if(t)t.textContent='–';const r=$('#srRound');if(r)r.textContent='1'}$('#srOver').hidden=true;$('#srPanel').classList.add('off');srMsg('');
  const sv=srSaveGet(),lvD=['kezdőknek – sokat téved','közepes – pár lövésből belövi magát','profi – gyorsan és pontosan lő'];
  s.innerHTML=`<img class="pzhfull" src="${PZH_FULL||PZH_SPRITE}" alt="" data-st="width:100%;height:auto"><h3>SHOT&amp;RUN</h3>
   <p class="srlead">Két <b>PzH 2000</b> tüzérpárbaja. Felváltva lőtök: mérd be a célt, irányozz, <b>TŰZ</b> – aztán válts állást!</p>
   <div class="srcards">
    ${sv?`<div class="srcard res"><button type="button" class="srcbtn" id="srResB"><i class="ib-green">${ic('play')}</i><span><b>Folytatás innen</b><small>${esc(srSaveDesc(sv))}</small></span></button><button type="button" class="srdel" id="srResDel" aria-label="Mentett állás törlése">${ic('x')}</button></div>`:''}
    <div class="srcard"><button type="button" class="srcbtn" id="srCAi" aria-expanded="false"><i class="ib-gold">${ic('robot')}</i><span><b>Gép ellen</b><small>Gyakorolj a számítógép ellen</small></span></button>
     <div class="srsub" id="srLv" hidden>${SR_AI.map((a,i)=>`<button type="button" class="srlvb${i===1?' pri':''}" data-lvl="${i}"><b>${a.n}</b><small>${lvD[i]}</small></button>`).join('')}</div></div>
    <div class="srcard"><button type="button" class="srcbtn" id="srCNet"><i class="ib-blue">${ic('globe')}</i><span><b>Barát ellen – online</b><small>Küldj neki meghívót, ő egy koppintással belép</small></span></button></div>
    <div class="srcard"><button type="button" class="srcbtn" id="srHotB"><i class="ib-red">${ic('phone')}</i><span><b>Ketten egy telefonon</b><small>Felváltva lőtök ugyanazon a készüléken</small></span></button></div>
   </div>
   <button type="button" class="srrot cb c-dark" id="srRot">${ic('rotate')}Fekvő mód</button><button type="button" class="srcineb cb c-dark" id="srCineB">🎬 Filmes mód: ${srCineOn()?'BE':'KI'}</button>
   <details class="srhelp"><summary>📖 Kezelés és lőszerek</summary><div class="dinfo"><b>Kezelés</b><span>Indítás</span><i>MOTOR · RÁDIÓ · TORONY · MÁLHÁZÁS</i><span>Irányzék</span><i>húzd a skálát, a ± gomb 1 vonás</i><span>Rádió</span><i>szél (METEO) + megfigyelő jelentése</i><span>GPS</span><i>a GPS-es gránátok (Excalibur, Vulcano, PGK) irányítása – sérülten pontatlan, kiesve irányítás nélkül repülnek</i><span>Mozgás</span><i>körönként korlátozott táv</i><span>Köridő</span><i>120 mp – lejártakor a kör kimarad</i><span>Sérülés</span><i>a kiesett rendszert kapcsold vissza</i>
   <b data-st="margin-top:6px">155 mm-es gránátok (60 db)</b>${SR_AMMO.map(a=>`<span>${a.n}<br><em>${a.q} db</em></span><i>${a.d}<small>${a.r}</small></i>`).join('')}</div><p class="srhint">A valós adatok nyilvános gyártói és sajtóforrásokból származnak, tájékoztató jellegűek. A játékbeli lőtáv a pályához van arányítva.</p></details>`;
  s.hidden=false;s.scrollTop=0;
  $('#srCAi').onclick=()=>{const l=$('#srLv'),o=l.hidden;l.hidden=!o;$('#srCAi').setAttribute('aria-expanded',o)};
  s.querySelectorAll('[data-lvl]').forEach(b=>b.onclick=()=>{ac();srBegin('ai',{lvl:+b.dataset.lvl})});
  $('#srHotB').onclick=()=>{ac();srNetLeave();srBegin('hot',{})};const rb=$('#srRot');if(rb)rb.onclick=srLandscape;{const cb=$('#srCineB');if(cb)cb.onclick=()=>{const on=!srCineOn();try{localStorage.setItem('srCine',on?'1':'0')}catch(e){}cb.textContent='🎬 Filmes mód: '+(on?'BE':'KI');srClick(1)}}$('#srCNet').onclick=()=>srNetMenu();
  if(sv){$('#srResB').onclick=()=>{ac();srResume()};$('#srResDel').onclick=()=>{if(confirm('Törlöd a mentett állást?')){srSaveDel();srMenu()}}}
  pzhFullSet()}
// online párbaj: két nagy választás – meghívót küldök / kaptam kódot
function srNetMenu(pre){const s=$('#srStart');if(!s)return;srNetLeave();const net=srNetOk(),offl=navigator.onLine===false;
  s.innerHTML=`<button type="button" class="srback" id="srNB">${ic('left')}VISSZA</button><h3>PÁRBAJ ONLINE</h3>
   <ol class="srsteps"><li><b>1</b>Egyikőtök meghívót küld</li><li><b>2</b>A másik a linkre koppint vagy beírja a kódot</li><li><b>3</b>Indul a párbaj!</li></ol>
   ${net?`<div class="srcards">
    <div class="srcard"><button type="button" class="srcbtn" id="srHostB"><i class="ib-gold">${ic('mail')}</i><span><b>Meghívót küldök</b><small>Kapsz egy linket és egy kódot a barátodnak</small></span></button></div>
    <div class="srcard"><div class="srcbtn nob"><i class="ib-blue">${ic('key')}</i><span><b>Kaptam kódot</b><small>Írd be az 5 jelű meghívókódot</small></span></div>
     <div class="srsub"><input id="srCode" class="srcodein" maxlength="5" placeholder="KÓD" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-label="Meghívókód">
      <div class="srrow2"><button type="button" class="btn line" id="srPaste">${ic('paste')}Beillesztés</button><button type="button" class="btn pri" id="srJoinB">Belépés${ic('play')}</button></div></div></div></div>`
   :`<p class="srwarn">${offl?'📴 Nincs internet – az online párbajhoz kapcsolat kell. Addig játszhatsz gép ellen vagy ketten egy telefonon.':'🔒 Az online párbajhoz jelentkezz be a főoldalon (internet kell hozzá).'}</p>`}`;
  s.hidden=false;s.scrollTop=0;$('#srNB').onclick=srMenu;
  if(!net)return;
  $('#srHostB').onclick=()=>{ac();srNetHost()};$('#srJoinB').onclick=()=>{ac();srNetJoin()};
  const inp=$('#srCode');inp.addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);if(e.target.value.length===5)$('#srJoinB').focus()});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){ac();srNetJoin()}});
  $('#srPaste').onclick=async()=>{try{const t=await navigator.clipboard.readText(),m=(t||'').toUpperCase().match(/SR=([A-Z0-9]{5})/)||(t||'').toUpperCase().match(/\b([A-Z0-9]{5})\b/);if(m){inp.value=m[1];$('#srJoinB').focus()}else toast('A vágólapon nincs meghívókód.')}catch(e){toast('Nem érem el a vágólapot – írd be kézzel a kódot.');inp.focus()}};
  if(pre){inp.value=pre;ac();srNetJoin()}}
// fekvő mód: ahol lehet (Android), teljes képernyő + fekvő zárolás; máshol elég elfordítani a telefont
async function srLandscape(){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen({navigationUI:'hide'});SR.fs=1}await screen.orientation.lock('landscape')}catch(e){toast('Fordítsd el a telefont – a Shot&Run fekvőben is játszható.')}}
// játék közben a kijelző nem alszik el (Screen Wake Lock); háttérből visszatérve újra kérjük
async function srWake(on){try{if(!on){const w=SR.wl;SR.wl=null;w&&w.release&&w.release().catch(()=>{});return}if(SR.wl||!navigator.wakeLock||document.hidden)return;SR.wl=await navigator.wakeLock.request('screen');SR.wl.addEventListener&&SR.wl.addEventListener('release',()=>{SR.wl=null})}catch(e){SR.wl=null}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&SR.cv)srWake(true)});
const srInvLink=code=>location.origin+location.pathname+'?sr='+code;
function srOpen(){const el=$('#harc');el.hidden=false;el.classList.add('rk','sr');document.body.classList.add('harcon');
  el.innerHTML=`<div class="hbar"><div class="htitle">Shot<b>&amp;Run</b></div><div class="hstat"><span class="srping" id="srPing" hidden></span><span><b id="srTurn">–</b></span><span>Kör <b id="srRound">1</b></span></div><button class="hx srpzb" id="srPzB" aria-label="Szünet" hidden>${ic('pause')}</button><button class="hx" id="srClose" aria-label="Bezárás">✕</button></div>
   <div class="srwrap"><div class="srview"><canvas id="srCv"></canvas><button type="button" class="srcam" id="srCam" aria-label="Kamera: áttekintés / saját löveg">🔭</button><div class="srmsg" id="srMsg" hidden></div><button type="button" class="srall" id="srAll" hidden>⚡ Mindent be</button><div class="sralert" id="srAlert" hidden role="alert"></div></div>
   <div class="srpanel off" id="srPanel">
    <div class="srrow srsws"><button type="button" data-sw="eng"><i></i>MOTOR</button><button type="button" data-sw="rad"><i></i>RÁDIÓ</button><button type="button" data-sw="tur"><i></i>TORONY</button><button type="button" data-sw="load"><i></i>MÁLHÁZÁS</button><div class="srcnt"><b id="srCnt">0/60</b><small>lőszer</small></div></div>
    <div class="srrow sram"><select id="srAmmo" aria-label="Lőszertípus"></select></div><div class="srami" id="srAmI"></div>
    <div class="srdmg" id="srDmg"></div>
    <div class="srdial"><label>MAGASSÁG <b id="srEv"></b></label><div class="srtrow"><button type="button" data-nudge="e-">−</button><canvas class="srtape" id="srTE"></canvas><button type="button" data-nudge="e+">+</button></div></div>
    <div class="srdial"><label>OLDAL <b id="srTv"></b></label><div class="srtrow"><button type="button" data-nudge="t-">◀</button><canvas class="srtape" id="srTT"></canvas><button type="button" data-nudge="t+">▶</button></div></div>
    <div class="srrow sract"><button type="button" class="srmv" id="srBk">◀ HÁTRA</button><div class="srfuel"><i id="srFuel"></i><small>menet / kör</small></div><button type="button" class="srmv" id="srFw">ELŐRE ▶</button><button type="button" class="srfire" id="srFire">TŰZ!</button></div>
   </div></div>
   <div class="hstart" id="srStart"></div><div class="hover" id="srOver" hidden></div><div class="srpz" id="srPz" hidden></div><div class="srtut" id="srTut" hidden role="status"><b></b><span></span><button type="button" class="srtutx">Kihagyom</button></div>`;
  for(const e of [1,.5,.2])srAtlas(e);// a modell képei már a menüben betöltődnek (offline a gyorsítótárból)
  const cv=$('#srCv');SR.cv=cv;SR.c=cv.getContext('2d',{alpha:false})||cv.getContext('2d');SR.qb=srQBase();SR.q=SR.qb;srWake(true);SR.v=null;SR.inbox=[];SR.net=null;srFit();
  try{SR.ro=new ResizeObserver(srFit);SR.ro.observe(cv)}catch(e){}
  $('#srClose').onclick=srClose;$('#srAll').onclick=()=>{ac();srAllOn()};$('#srTut').querySelector('.srtutx').onclick=()=>srTutDone();$('#srPzB').onclick=()=>{ac();SR.paused?srPause(false):srPause(true)};$('#srFire').onclick=()=>{ac();srFire()};
  $('#srPanel').addEventListener('click',e=>{const b=e.target.closest('button');if(b)b.blur()});
  // tapintható visszajelzés minden gombnyomásra (rövid rezgés), és látható lenyomás
  $('#srPanel').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;try{navigator.vibrate&&navigator.vibrate(b.id==='srFire'?18:7)}catch(x){}b.classList.add('tap');setTimeout(()=>b.classList.remove('tap'),160)});
  for(const el of [$('#srPanel'),cv])el.addEventListener('contextmenu',e=>e.preventDefault());// Android: hosszú nyomásra ne jöjjön fel menü
  $('#srPanel').querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>srSwitch(b.dataset.sw));
  $('#srPanel').querySelectorAll('[data-nudge]').forEach(srNudgeBind);srTapeBind($('#srTE'),'elev');srTapeBind($('#srTT'),'trav');
  $('#srAmmo').onchange=e=>{const v=srCtl();if(SR.v&&v.ammo[e.target.value]>0){v.sel=e.target.value;srSwSnd(true);
    // SMArt: a tűzvezető felső szögcsoportra áll (emelt, nyújtott röppálya – a résztöltetek a csúcs után, magasan válnak le)
    const am=SR_AM[v.sel];if(srHiAm(am)&&v.elev<800&&srMyTurn()){const tg=SR.v[1-v.i],ok=v.d.opt<2&&!srInSmoke(v)&&!srInSmoke(tg),e2=ok?srTableHi(am,Math.abs(tg.x-v.x)):null;v.elev=e2||960;srClick(2);srDials();srMsg('🎯 SMArt: felső szögcsoport – '+String(v.elev).padStart(4,'0')+' vonás'+(ok?'':' (becsült)'),3200)}
    srUI()}};
  const hold=(id,dir)=>{const b=$(id),on=e=>{e.preventDefault();ac();try{b.setPointerCapture(e.pointerId)}catch(x){}SR.mv=dir;b.classList.add('on')},off=()=>{if(SR.mv===dir)SR.mv=0;b.classList.remove('on')};b.addEventListener('pointerdown',on);for(const k of ['pointerup','pointercancel','pointerleave'])b.addEventListener(k,off)};
  hold('#srBk',-1);hold('#srFw',1);
  $('#srCam').onclick=()=>{if(SR.camFree||SR.ovw){SR.camFree=false;SR.ovw=false}else SR.ovw=true};
  let pid=null,lx=0,ly=0,mv=0;cv.addEventListener('pointerdown',e=>{pid=e.pointerId;lx=e.clientX;ly=e.clientY;mv=0;try{cv.setPointerCapture(pid)}catch(x){}});
  cv.addEventListener('pointermove',e=>{if(e.pointerId!==pid||!SR.v||SR.phase==='fly')return;const dx=e.clientX-lx,dy=e.clientY-ly;mv+=Math.abs(dx)+Math.abs(dy);if(mv<8)return;lx=e.clientX;ly=e.clientY;SR.camFree=true;SR.ovw=false;SR.cam.x=srClamp(SR.cam.x-dx/SR.cam.z,0,SR_W);SR.cam.y=srClamp(SR.cam.y-dy/SR.cam.z,0,760)});
  const up=e=>{if(e.pointerId!==pid)return;pid=null;if(mv<8&&e.type==='pointerup'&&SR.cine&&SR.cine.skip!==false){SR.cine.t=SR.cine.T;return}if(mv<8&&e.type==='pointerup'&&SR.v){const r=cv.getBoundingClientRect();srFoldTap(e.clientX-r.left,e.clientY-r.top)}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  SR.key=e=>{if(!SR.v||e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;const d=e.type==='keydown',s=e.shiftKey?10:1;
    if(SR.paused&&e.key!=='Escape'&&e.key!=='p'&&e.key!=='P')return;
    if(e.key==='a'||e.key==='A'){SR.mv=d?-1:SR.mv===-1?0:SR.mv;return}if(e.key==='d'||e.key==='D'){SR.mv=d?1:SR.mv===1?0:SR.mv;return}if(!d)return;
    if(e.key==='Escape'||e.key==='p'||e.key==='P'){SR.paused?srPause(false):srPause(true);e.preventDefault();return}if(SR.paused)return;
    if(e.key==='ArrowUp')srDial('elev',s);else if(e.key==='ArrowDown')srDial('elev',-s);else if(e.key==='ArrowRight')srDial('trav',s);else if(e.key==='ArrowLeft')srDial('trav',-s);else if(e.key===' '||e.key==='Enter')srFire();else return;e.preventDefault()};
  addEventListener('keydown',SR.key);addEventListener('keyup',SR.key);
  srMenu();SR.lastT=performance.now();cancelAnimationFrame(SR.raf);SR.raf=requestAnimationFrame(srLoop)}
function srClose(){if(SR.mode==='net'&&SR.v&&SR.phase!=='over'&&SR.net&&!confirm('Kilépsz a párbajból? Az ellenfeled nyer.'))return;
  try{SR.whN&&SR.whN.disconnect()}catch(e){}SR.whN=null;
  srLoaderHum(false,true);if(SR.fs){SR.fs=0;try{document.fullscreenElement&&document.exitFullscreen().catch(()=>{})}catch(e){}}
  if(SR.v&&SR.mode!=='net')srSave();SR.paused=null;srNetLeave();SR.run=false;SR.v=null;srEngLoop(false);cancelAnimationFrame(SR.raf);srWake(false);try{SR.ro&&SR.ro.disconnect()}catch(e){}if(SR.key){removeEventListener('keydown',SR.key);removeEventListener('keyup',SR.key)}clearTimeout(SR.msgT);SR.cv=null;
  const el=$('#harc');el.hidden=true;el.innerHTML='';el.classList.remove('rk','sr','srm');document.body.classList.remove('harcon')}
srLoop=medveWrap(srLoop,SR,'SHOTRUN');
// meghívó link: …/?sr=KÓD – betöltés (és bejelentkezés) után automatikusan belép a párbajba
const SR_INV={code:(()=>{try{return (new URLSearchParams(location.search).get('sr')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)}catch(e){return ''}})(),n:0,w:0};
function srInvTick(){const I=SR_INV;if(I.code.length!==5||++I.n>600)return;
  if(!AUTHREADY){setTimeout(srInvTick,500);return}
  if(!srNetOk()){if(!I.w){I.w=1;toast('Shot&Run meghívó: jelentkezz be, utána automatikusan belépsz a párbajba.')}setTimeout(srInvTick,1000);return}
  const code=I.code;I.code='';try{const u=new URL(location.href);u.searchParams.delete('sr');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}
  gameStart('shotrun');setTimeout(()=>{if(SR.cv&&!SR.v)srNetMenu(code)},250)}
setTimeout(srInvTick,600);

export {SR,srOpen};
