// lv.js – az app.js-ből lustán betöltött játékmodul (a közös segédeket onnan importálja)
import {$,AC,GID_FULL,GID_SPRITE,gidWheel,LOWFX,MASTER,NOISE,SIL_RAW,SOUND,ac,boom,brass,esc,gidFullSet,medveWrap,n0,snare,sndClink,sndPop,toast,walFt,walOpen} from './app.js';
/* ===================== TÜZÉR DERBY – fogadóiroda: PzH 2000, Gidrán és Rába futamok =====================
   A játékos nem hajt: kiválaszt egy indulót, megteszi a tétet (Tét vagy Hely), és végignézi a futamot.
   A tét és a nyeremény az „Összes pénzem” tárcából megy (app.js: walFt) – a Tüzér Kasszától független.
   8 induló fut egy futamban az istállóból; a futamot, a szorzókat és a gépi fogadókat a telefon számolja,
   a szervert a játék nem használja. Egységek: méter és másodperc; LV_L a leghosszabb jármű hossza. */
const LV={};
const LV_KEY='medve-lv1',LV_L=11.7,LV_V=16.7,LV_N=8;
const LV_TAKE={w:.15,p:.15};// totalizatőr-levonás
const LV_BIAS={w:.9,p:1.25};// a gépi fogadók torzítása: tétnél az esélytelent, helynél az esélyest fogadják túl
const LV_HCP=.55;// a málha a képességkülönbség ekkora részét egyenlíti ki
const LV_POOL=200000,LV_STAKES=[100,200,500,1000,2000,5000];
const LV_DIST=[
  {i:0,n:'Sprint',m:600,wM:1.25,wS:.4,cz:[[.3,.56]]},
  {i:1,n:'Mérföld',m:900,wM:1,wS:1,cz:[[.24,.5]]},
  {i:2,n:'Derby',m:1300,wM:.8,wS:1.6,cz:[[.14,.34],[.54,.74]]}];
const LV_GO=[{n:'száraz',f:1,c:['#4f8a34','#467c2e']},{n:'puha',f:.975,c:['#5b7a33','#52702d']},{n:'mély sár',f:.95,c:['#6a5a34','#5f502d']}];
const LV_STY={E:['Élen menő',.05],K:['Követő',0],H:['Hajrázó',-.05]};
const LV_COL=['#e63946','#f48c26','#ffd23a','#2a9d8f','#4fb3ff','#b388ff','#ff7ab6','#f1f1f1'];
// járműtípusok: len a hossz (m), ex a kipufogó magassága a jármű magasságához képest
const LV_TY={P:{n:'PzH 2000',len:11.7,ex:.6},G:{n:'Gidrán',len:7.4,ex:.3},R:{n:'Rába H14',len:8,ex:.5}};
const LV_NAMES=[['Vasparipa','P'],['Homoki Vihar','G'],['Dízel Csődör','R'],['Lánctalpas Táltos','P'],['Tábori Villám','G'],['Füstös Ráró','R'],['Borbála Büszkesége','P'],['Zsoldos Szellő','G'],['Hadtáp Hercege','R'],['Acél Kanca','P'],['Gyors Reagálás','G'],['Vezérlő Csillag','R'],
  ['Sárdagasztó','P'],['Bakonyi Betyár','G'],['Hortobágyi Hajrá','R'],['Mennydörgés','P'],['Tatai Tornádó','G'],['Málhás Pejkó','R'],['Csőre Töltött','P'],['Nehéz Lovas','P'],['Ágyúdörej','P'],['Lövegtalp Lajos','P'],['Röppálya','P'],['Tűzparancs','P']];
const LV_DRV=['Kovács őrm.','Szabó tőrm.','Tóth szkv.','Nagy ftőrm.','Varga őrv.','Molnár zls.','Balogh őrm.','Farkas tőrm.','Lakatos szkv.','Papp őrm.','Juhász tizedes','Simon ftőrm.'];
function lvRng(s){s=s>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
// az istálló: állandó adottságok (mo motor, va váltó, al állóképesség, mb megbízhatóság, gp kedvenc talaj, dp kedvenc táv)
// a típus is számít: a Gidrán jól rajtol és a száraz pályát szereti, a lánctalpas PzH a puha talajt és a sarat, a Rába szívós
const LV_STABLE=LV_NAMES.map(([n,ty],i)=>{const r=lvRng(7919*(i+3));r();r();const h={id:i,n,ty,mo:.2+r()*.7,va:.2+r()*.7,al:.2+r()*.7,mb:.6+r()*.38,gp:Math.floor(r()*3),dp:Math.floor(r()*3),sty:'EKH'[Math.floor(r()*3)],drv:LV_DRV[i%LV_DRV.length]};
  if(ty==='G'){h.gp=0}else if(ty==='P'){h.gp=1+(i%2)}else h.al=Math.min(.95,h.al+.2);return h});
const lvGauss=r=>{let u=0;for(let i=0;i<6;i++)u+=r();return (u-3)/.7071};// közel normális, szórás 1
const LV_DT=1/60,LV_ODT=1/20,LV_ACC=2;// LV_ODT: a szorzók becsléséhez futtatott sok ezer próbafutam lépésköze
const LV_PHOTO=.1;// ennél szorosabb (mp) várható befutónál filmes célfotó – kb. minden ötödik futam
// a szimuláció rögzített lépésköze (s) és a gyorsulás ideje álló helyzetből a teljes sebességig – mindenkinek ugyanannyi
/* Csalásmentes, kiszámíthatatlan sorsolás: a futam véletlenszámait a böngésző kriptográfiai generátora (crypto.getRandomValues) adja,
   mindig a tét rögzítése UTÁN. Ebből a 128 bites magból egy sfc32 generátor fut, így a teljes futam azonnal kiszámolható
   (a kifizetés elmentődik), a képernyőn pedig ugyanez a futam játszódik le – kilépéssel vagy az app bezárásával nem változtatható meg. */
function lvSeed(){const a=new Uint32Array(4);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<4;i++)a[i]=Math.floor(Math.random()*4294967296)}return [...a]}
function lvRngS(seed){let [a,b,c,d]=seed;const f=()=>{a|=0;b|=0;c|=0;d|=0;const t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;c=c<<21|c>>>11;c=c+t|0;return (t>>>0)/4294967296};for(let i=0;i<12;i++)f();return f}
function lvRunOut(R){let g=0;while(R.nfin<LV_N&&g++<20000)lvStep(R,LV_DT)}
const lvClamp=(v,a,b)=>v<a?a:v>b?b:v;
const lvNum=v=>(v>=100?Math.round(v).toString():v>=10?v.toFixed(1):v.toFixed(2)).replace('.',',');

/* ---------- mentett állás (csak a telefonon) ---------- */
function lvLoad(){let s={};try{s=JSON.parse(localStorage.getItem(LV_KEY)||'{}')||{}}catch(e){}
  LV.s={v:2,races:0,wins:0,net:0,best:0,form:s.form&&typeof s.form==='object'?s.form:{},pend:0};
  if(s.v===2){for(const k of ['races','wins','net','best'])LV.s[k]=Number(s[k])||0;LV.s.pend=Number(s.pend)>0?Number(s.pend):0}
  delete LV.s.form.me;
  // félbeszakadt futam: az eredmény már a rajtnál (a tét rögzítése után) kisorsolódott – most csak elszámoljuk, visszatérítés nincs
  const pd=s.v===2&&s.pend&&typeof s.pend==='object'?s.pend:null;LV.s.pend=0;
  if(pd&&Number.isFinite(pd.st)&&Number.isFinite(pd.win)){lvSettle(pd);setTimeout(()=>toast(pd.win?`Félbeszakadt futam: a szelvényed nyert, +${n0(pd.win)} Ft.`:`Félbeszakadt futam: a szelvényed nem nyert (${n0(pd.st)} Ft).`),500)}
  else if(s.v===2&&Number(s.pend)>0){walFt(Number(s.pend));lvStore();setTimeout(()=>toast('Megszakadt futam: a tétedet ('+n0(Number(s.pend))+' Ft) visszakaptad.'),500)}}
// a sorsolt eredmény elszámolása (egyszer): nyeremény a tárcába, statisztika, forma
function lvSettle(p){const s=LV.s;if(p.win>0)walFt(p.win);s.pend=0;s.races++;if(p.win)s.wins++;s.net+=p.win-p.st;if(p.win>s.best)s.best=p.win;for(const [id,pl] of p.form||[])s.form[id]=[...lvForm(id),pl].slice(-5);lvStore()}
function lvPay(R,b,o){const pl=o.slice(0,3).map(r=>r.e.idx);let d=0;if(b.t==='w'&&b.i===pl[0])d=lvDivW(R,b.i,b.st,R.fw);else if(b.t==='p'&&pl.includes(b.i))d=lvDivP(R,b.i,b.st,pl,R.fp);
  return {d,win:d?Math.floor(b.st*d):0,order:o.map(r=>r.e.idx),form:o.map((r,i)=>[r.e.h.id,i+1])}}
function lvStore(){try{localStorage.setItem(LV_KEY,JSON.stringify(LV.s))}catch(e){}}
const lvForm=id=>Array.isArray(LV.s.form[id])?LV.s.form[id]:[];

/* ---------- futam összeállítása ---------- */
function lvAbility(h,D,g){let a=1+.05*(h.mo-.5)*D.wM+.03*(h.al-.5)*D.wS;if(h.dp===D.i)a+=.008;
  if(h.gp===g)a+=.012;else if(Math.abs(h.gp-g)===2)a-=.012;
  const f=lvForm(h.id);if(f.length)a+=(4.5-f.reduce((t,x)=>t+x,0)/f.length)*.002;return a}
function lvNewRace(){const r=Math.random,x=r(),D=LV_DIST[x<.4?0:x<.75?1:2],y=r(),g=y<.55?0:y<.85?1:2;
  const pool=LV_STABLE.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const field=pool.slice(0,LV_N).map(h=>({h,ab:lvAbility(h,D,g)}));
  // kiegyenlítés (handikep): a képességek különbségét összenyomjuk, hogy a mezőny szoros legyen – a tömeg nem számít
  const mn=Math.min(...field.map(e=>e.ab)),mx=Math.max(...field.map(e=>e.ab));
  field.forEach((e,i)=>{e.idx=i;e.post=i;e.Vn=LV_V*LV_GO[g].f*(e.ab-LV_HCP*(e.ab-mn))});
  return {D:D.m,dist:D,g,cz:D.cz,field,no:LV.s.races+1}}

/* ---------- a futam szimulációja (a szorzók számításához és az élő futamhoz ugyanaz) ---------- */
function lvSim(R,rnd){R.t=0;R.nfin=0;
  R.rs=R.field.map(e=>{const h=e.h;return {e,x:0,v:0,vd:0,ln:e.post,lf:e.post,lc:0,Vn:e.Vn*(1+lvGauss(rnd)*.011),a:LV_STY[h.sty][1],
    react:.2+rnd()*.1,tr:LV_ACC,tk:1.5+rnd()*4,failAt:rnd()<(1-h.mb)*.25?.3+rnd()*.55:9,failT:0,fin:0}})}
const lvCurve=(R,p)=>{for(const z of R.cz)if(p>=z[0]&&p<z[1])return true;return false};
function lvFree(R,r,l){if(l<0||l>=LV_N)return false;for(const o of R.rs){if(o===r)continue;if((Math.abs(o.ln-l)<.5||Math.abs(o.lf-l)<.8)&&Math.abs(o.x-r.x)<LV_L*1.35)return false}return true}
function lvStep(R,dt){const D=R.D,rs=R.rs,G=LV_L*1.25;R.t+=dt;
  for(const r of rs){const p=r.x/D;let vd;
    if(r.fin)vd=Math.max(r.Vn*.45,r.v-4*dt);
    else{const tt=R.t-r.react;vd=tt<=0?0:r.Vn*(1+r.a*(1-2*Math.min(1,p)))*Math.min(1,tt/r.tr);if(p>=r.failAt&&r.failT<3.5){r.failT+=dt;vd*=.55}}
    if(lvCurve(R,p))vd*=1-.004*r.lf;// kanyarban a külső sáv hosszabb
    r.lc-=dt;let b=null;
    for(const o of rs){if(o===r)continue;const dx=o.x-r.x;if(dx>0&&dx<G&&Math.abs(o.lf-r.lf)<.7&&(!b||dx<b.x-r.x))b=o}
    r.b=b;
    if(b&&b.v<vd&&!r.fin){if(r.lc<=0){if(lvFree(R,r,r.ln+1)){r.ln++;r.lc=.9}else if(lvFree(R,r,r.ln-1)){r.ln--;r.lc=.9}}vd=Math.min(vd,b.v)}
    else if(!r.fin&&r.lc<=0&&r.ln>0&&R.t>r.tk&&lvFree(R,r,r.ln-1)){r.ln--;r.lc=1.3}// a korlát felé húzódik
    r.lf+=lvClamp(r.ln-r.lf,-2.2*dt,2.2*dt);r.vd=vd}
  for(const r of rs){r.v+=(r.vd-r.v)*Math.min(1,dt*4);let nx=r.x+r.v*dt;
    if(r.b&&!r.fin&&Math.abs(r.b.lf-r.lf)<.7&&nx>r.b.x-LV_L*1.02){nx=Math.max(r.x,r.b.x-LV_L*1.02);r.v=Math.min(r.v,r.b.v)}
    r.x=nx;if(!r.fin&&r.x>=D){r.fin=R.t-(r.x-D)/Math.max(1,r.v);R.nfin++}}}
const lvOrder=R=>R.rs.slice().sort((a,b)=>(a.fin||1e9)-(b.fin||1e9)||b.x-a.x);
// a szorzók alapja: a futamot sokszor lefuttatjuk, ebből jön a nyerési és a dobogós esély
function lvOdds(R0,done){const N=LOWFX?140:240,w=new Array(LV_N).fill(0),pl=new Array(LV_N).fill(0);let k=0;const tok=LV.tok;
  const chunk=()=>{if(tok!==LV.tok)return;const t0=performance.now();
    while(k<N&&performance.now()-t0<22){const R={D:R0.D,cz:R0.cz,field:R0.field};lvSim(R,Math.random);let g=0;while(R.nfin<LV_N&&g++<5000)lvStep(R,LV_ODT);
      const o=lvOrder(R);w[o[0].e.idx]++;for(let j=0;j<3;j++)pl[o[j].e.idx]++;k++}
    if(k<N)setTimeout(chunk,0);else done(w.map(x=>(x+.5)/(N+4)),pl.map(x=>(x+1)/(N+8/3)))};chunk()}

/* ---------- totalizatőr ---------- */
function lvPools(R,pw,pp){R.P=LV_POOL;const mk=(pr,ex)=>{const a=pr.map(p=>Math.pow(p,ex)),s=a.reduce((t,x)=>t+x,0);return a.map(x=>x/s)};
  R.pw=pw;R.pp=pp;R.ww=mk(pw,LV_BIAS.w);R.wp=mk(pp,LV_BIAS.p)}
// st: a játékos tétje az i. indulón (a saját tét rontja a saját szorzót – ez a totalizatőr természete)
function lvDivW(R,i,st,ww){ww=ww||R.ww;return Math.max(1.05,(R.P+st)*(1-LV_TAKE.w)/(ww[i]*R.P+st))}
function lvDivP(R,i,st,pl,wp){wp=wp||R.wp;const B=j=>wp[j]*R.P+(j===i?st:0);
  if(!pl){pl=R.pp.map((p,j)=>[p,j]).filter(x=>x[1]!==i).sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>x[1]);pl.push(i)}
  const net=(R.P+st)*(1-LV_TAKE.p),bs=pl.reduce((t,j)=>t+B(j),0);return Math.max(1,1+(net-bs)/3/B(i))}

/* ---------- hangok ---------- */
function lvSnd(k){if(!SOUND||!ac())return;try{const t=AC.currentTime+.02;
  if(k==='bell'){sndClink();setTimeout(sndClink,130);setTimeout(sndClink,260)}
  else if(k==='call'){[[392,0,.16],[523.25,.2,.16],[659.25,.4,.16],[783.99,.6,.34],[659.25,1,.14],[783.99,1.18,.5]].forEach(([f,d,l])=>brass(t+d,f,l,.08))}
  else if(k==='win'){[[523.25,0],[659.25,.13],[783.99,.26],[1046.5,.4]].forEach(([f,d])=>brass(t+d,f,.22,.09));[523.25,659.25,783.99].forEach(f=>brass(t+.62,f,.7,.07));boom(t+.62,.4,65)}
  else if(k==='lose'){brass(t,196,.3,.07);brass(t+.28,174.6,.3,.07);brass(t+.56,146.8,.7,.08)}
  else if(k==='fin'){sndPop()}}catch(e){}}
// motorzúgás + közönségmoraj (a hajrában felerősödik)
function lvAmb(on){try{if(!on){if(LV.amb){const e=LV.amb;LV.amb=null;const t=AC.currentTime;e.g.gain.setTargetAtTime(0,t,.12);e.cg.gain.setTargetAtTime(0,t,.3);setTimeout(()=>{try{e.o.stop();e.o2.stop();e.n.stop()}catch(x){}},1200)}return}
  if(LV.amb||!SOUND||!ac())return;const a=AC,o=a.createOscillator(),o2=a.createOscillator(),lp=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o2.type='square';lp.type='lowpass';lp.frequency.value=300;g.gain.value=0;
  o.frequency.value=44;o2.frequency.value=29;o.connect(lp);o2.connect(lp);lp.connect(g).connect(MASTER);o.start();o2.start();
  const n=a.createBufferSource();n.buffer=NOISE;n.loop=true;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.6;const cg=a.createGain();cg.gain.value=0;n.connect(bp).connect(cg).connect(MASTER);n.start();
  LV.amb={o,o2,g,n,cg,bp}}catch(e){}}
function lvAmbSet(v,ex){const e=LV.amb;if(!e)return;try{const t=AC.currentTime,f=40+v*3;e.o.frequency.setTargetAtTime(f,t,.1);e.o2.frequency.setTargetAtTime(f*.66,t,.1);e.g.gain.setTargetAtTime(.05,t,.2);
  e.cg.gain.setTargetAtTime(.02+.11*ex,t,.25);e.bp.frequency.setTargetAtTime(800+900*ex,t,.3)}catch(x){}}

/* ---------- képernyők ---------- */
function lvMsg(s,col){LV.msg={s,col:col||'#fff',t:0}}
function lvSay(s){LV.com=s;LV.comT=0}
function lvOpen(){const el=$('#harc');el.hidden=false;el.classList.add('lv');document.body.classList.add('harcon');lvLoad();LV.ft=walFt(0);LV.tok=(LV.tok||0)+1;LV.run=false;LV.ph='menu';LV.R=null;LV.pt=[];LV.flash=0;LV.cheer=0;LV.fast=false;LV.bet=null;LV.staked=0;
  el.innerHTML=`<div class="hbar"><div class="htitle">Tüzér <b>Derby</b></div><div class="hstat"><button type="button" class="lvwal" id="lvWal" aria-label="Összes pénzem">💰 <b data-walft>${n0(LV.ft)} Ft</b></button></div><button class="hx" id="lvClose" aria-label="Bezárás">✕</button></div>
   <div class="lvwrap"><canvas id="lvCv"></canvas><button type="button" class="lvfast" id="lvFast" hidden>⏩ Gyorsítás</button><div class="lvpanel" id="lvPanel"></div></div>`;
  $('#lvClose').onclick=lvClose;$('#lvWal').onclick=()=>{if(LV.ph!=='race'&&LV.ph!=='gate')walOpen()};
  $('#lvFast').onclick=()=>{LV.fast=!LV.fast;$('#lvFast').classList.toggle('on',LV.fast)};
  const cv=$('#lvCv');LV.cv=cv;LV.fit=()=>{const dpr=LOWFX?1:Math.min(1.5,devicePixelRatio||1),r=cv.getBoundingClientRect();if(r.width<2)return;cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);LV.W=r.width;LV.H=r.height;LV.dpr=dpr};LV.fit();
  try{LV.ro=new ResizeObserver(()=>LV.fit());LV.ro.observe(cv)}catch(e){}
  lvSprites();
  LV.vis=()=>{if(document.hidden&&(LV.ph==='race'||LV.ph==='gate'))lvPause(true)};document.addEventListener('visibilitychange',LV.vis);
  // a tárca közben is változhat (Pénzem ablak): a menü és a programfüzet kövesse
  LV.walI=setInterval(()=>{const f=walFt(0);if(f!==LV.ft){LV.ft=f;if(LV.ph==='card')lvCardUpd();else if(LV.ph==='menu')lvMenu()}},700);
  lvMenu();LV.last=0;cancelAnimationFrame(LV.raf);LV.raf=requestAnimationFrame(lvLoop)}
function lvPause(on){LV.paused=!!on;let o=$('#lvPz');if(on){lvAmb(false);if(!o){o=document.createElement('div');o.id='lvPz';o.className='gpov';o.innerHTML='<b>⏸ SZÜNET</b><span>Koppints a folytatáshoz</span>';o.onclick=()=>lvPause(false);$('#harc .lvwrap').appendChild(o)}}
  else{if(o)o.remove();if(LV.ph==='race')lvAmb(true)}}
function lvClose(){const mid=LV.ph==='race'||LV.ph==='gate';if(mid&&!confirm('Kilépsz? A futam eredménye már eldőlt – a szelvényedet így is elszámoljuk.'))return;
  if(mid&&LV.s.pend){const p=LV.s.pend;lvSettle(p);toast(p.win?`A szelvényed nyert: +${n0(p.win)} Ft.`:`A szelvényed nem nyert (−${n0(p.st)} Ft).`)}LV.staked=0;
  LV.tok++;LV.run=false;LV.ph=null;LV.R=null;lvAmb(false);cancelAnimationFrame(LV.raf);clearInterval(LV.walI);try{LV.ro&&LV.ro.disconnect()}catch(e){}
  document.removeEventListener('visibilitychange',LV.vis);LV.cv=null;
  const el=$('#harc');el.hidden=true;el.innerHTML='';el.classList.remove('lv');document.body.classList.remove('harcon')}
function lvPanel(html,cls){const p=$('#lvPanel');if(!p)return null;p.className='lvpanel'+(cls?' '+cls:'');p.innerHTML=html;p.hidden=!html;p.scrollTop=0;p.onclick=null;return p}
function lvMenu(){LV.ph='menu';LV.run=false;$('#lvFast').hidden=true;const s=LV.s;LV.ft=walFt(0);
  lvPanel(`<div class="hstart lvstart"><img src="${lvModel().toDataURL()}" alt="" data-st="width:100%;height:auto"><h3>TÜZÉR DERBY</h3>
   <p>Fogadóiroda a lövészárok szélén: <b>PzH 2000</b>, <b>Gidrán</b> és <b>Rába</b> futamok. Válassz indulót, tedd meg a tétet, és szurkolj!</p>
   <div class="lvstats"><span>Futam <b>${s.races}</b></span><span>Nyert szelvény <b>${s.wins}</b></span><span>Mérleg <b class="${s.net<0?'neg':'pos'}">${s.net<0?'−':'+'}${n0(Math.abs(s.net))} Ft</b></span></div>
   <div class="lvwalrow">💰 Pénzed: <b>${n0(LV.ft)} Ft</b></div>
   <button class="btn pri" id="lvGoCard">▶ Programfüzet</button> <button class="btn line" id="lvWalB">💰 Pénzem</button>
   <details class="lvhelp"><summary>Szabályok</summary>
    <p><b>Egy futam – egy szelvény.</b> Válassz egy indulót és a fogadás fajtáját: <b>Tét</b> – nyer; <b>Hely</b> – az első háromban végez. A legkisebb tét <b>100 Ft</b>, a legnagyobb 5 000 Ft.</p>
    <p><b>Totalizatőr:</b> a nyeremény a közös kasszából jön, 15% levonás után. A kiírt szorzó becslés – a végső osztalék a fogadás zárása után alakul ki.</p>
    <p><b>Pénz:</b> az „Összes pénzem” tárcából fogadsz (1 érme = 100 Ft). Pénzt a többi játékkal szerzel: minden aktívan játszott perc 100 Ft; az érmeverőn 100 koppintás 10 érme; a Tüzér Kasszából naponta legfeljebb 10 000 Ft vehető ki. A Derbybe a belépés ingyenes.</p>
    <p><b>Programfüzet:</b> a forma az utolsó futamok helyezése; MOT – végsebesség, ÁLL – állóképesség, MEGB – megbízhatóság (műszaki hiba esélye). Minden induló egyformán gyorsul, a tömeg nem számít. A Gidrán a száraz pályát szereti, a lánctalpas PzH a puha talajt és a sarat, a Rába szívós a hosszú távon. Az 1-es rajthely van a korlátnál – kanyarban ez rövidebb út.</p></details></div>`);
  $('#lvGoCard').onclick=lvCard;$('#lvWalB').onclick=()=>walOpen()}
const lvBar=v=>`<i><u data-st="width:${Math.round(lvClamp(v,0,1)*100)}%"></u></i>`;
function lvCard(){LV.ph='card';LV.ft=walFt(0);LV.bet=null;LV.stk=LV.stk||100;$('#lvFast').hidden=true;const R=LV.R=lvNewRace();LV.tok++;LV.odds=false;
  const rows=R.field.map((e,i)=>{const h=e.h,f=lvForm(h.id);
    return `<div class="lvrow" data-row="${i}"><i class="lvno" data-st="background:${LV_COL[i]}">${i+1}</i>
     <div class="lvinf"><b>${esc(h.n)}</b><small><em class="lvty t${h.ty}">${LV_TY[h.ty].n}</em> ${LV_STY[h.sty][0]} · ${esc(h.drv)}</small>
      <small>Forma: ${f.length?f.join('-'):'új'} · kedveli: ${LV_GO[h.gp].n}, ${LV_DIST[h.dp].n}</small>
      <div class="lvbars"><span>MOT${lvBar(h.mo)}</span><span>ÁLL${lvBar(h.al)}</span><span>MEGB${lvBar((h.mb-.55)/.45)}</span></div></div>
     <div class="lvod"><button type="button" data-bet="w${i}" disabled><small>TÉT</small><b>…</b></button><button type="button" data-bet="p${i}" disabled><small>HELY</small><b>…</b></button></div></div>`}).join('');
  const p=lvPanel(`<div class="lvcard"><div class="lvhd"><b>${R.no}. FUTAM</b><span>${R.dist.n} · ${R.D} m</span><span class="lvgo g${R.g}">Talaj: ${LV_GO[R.g].n}</span></div>
    <div class="lvtip" id="lvTip">Szorzók számítása…</div><div class="lvrows">${rows}</div>
    <div class="lvfoot"><div class="lvstk" id="lvStk"></div><div class="lvsum" id="lvSumL"></div><div class="lvbtns"><button class="btn line" id="lvBack">Vissza</button><button class="btn pri" id="lvGo" disabled>🔔 Fogadok – rajt!</button></div></div></div>`,'full');
  p.onclick=e=>{const b=e.target.closest('[data-bet]'),u=e.target.closest('[data-stk]');
    if(b&&LV.odds){const k=b.dataset.bet;LV.bet=LV.bet&&LV.bet.k===k?null:{k,t:k[0],i:+k.slice(1)};lvCardUpd()}
    else if(u){const d=+u.dataset.stk,ix=LV_STAKES.indexOf(LV.stk)+d;if(ix>=0&&ix<LV_STAKES.length&&LV_STAKES[ix]<=Math.max(100,LV.ft)){LV.stk=LV_STAKES[ix];lvCardUpd()}}
    else if(e.target.closest('[data-walopen]'))walOpen()};
  $('#lvBack').onclick=lvMenu;$('#lvGo').onclick=lvGate;lvCardUpd();
  lvOdds(R,(pw,pp)=>{if(LV.R!==R||LV.ph!=='card')return;lvPools(R,pw,pp);LV.odds=true;
    const o=pw.map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]),k=Math.random()<.65?o[0][1]:o[1+Math.floor(Math.random()*2)][1];
    $('#lvTip').innerHTML=`🎖️ <b>Öreg Zászlós tippje:</b> „${['Az én tippem ma','Én arra tennék:','Nálam a befutó:'][Math.floor(Math.random()*3)]} ${k===0||k===4?'az':'a'} ${lvTag(k)} ${esc(R.field[k].h.n)}.”`;
    lvCardUpd()})}
function lvCardUpd(){const R=LV.R;if(!R||LV.ph!=='card')return;while(LV.stk>100&&LV.stk>LV.ft)LV.stk=LV_STAKES[LV_STAKES.indexOf(LV.stk)-1];const b0=LV.bet,poor=LV.ft<100;
  document.querySelectorAll('#lvPanel [data-bet]').forEach(b=>{const k=b.dataset.bet,i=+k.slice(1),on=!!b0&&b0.k===k;b.disabled=!LV.odds;b.classList.toggle('on',on);
    if(LV.odds)b.querySelector('b').textContent='×'+lvNum(k[0]==='w'?lvDivW(R,i,on?LV.stk:0):lvDivP(R,i,on?LV.stk:0))});
  document.querySelectorAll('#lvPanel [data-row]').forEach(r=>r.classList.toggle('me',!!b0&&+r.dataset.row===b0.i));
  $('#lvStk').innerHTML=poor?`<span>Nincs elég pénzed – egy futam legalább 100 Ft (1 érme).</span><button type="button" data-walopen>💰 Pénzem</button>`
    :`<span>Tét:</span><button type="button" data-stk="-1" aria-label="Kisebb tét">−</button><b class="lvstkv">${n0(LV.stk)} Ft</b><button type="button" data-stk="1" aria-label="Nagyobb tét">+</button><em>Pénzed: ${n0(LV.ft)} Ft</em>`;
  const d=b0&&LV.odds?(b0.t==='w'?lvDivW(R,b0.i,LV.stk):lvDivP(R,b0.i,LV.stk)):0;
  $('#lvSumL').innerHTML=b0?`Szelvény: <b>${b0.t==='w'?'Tét':'Hely'}</b> a <b>${b0.i+1}. ${esc(R.field[b0.i].h.n)}</b> indulóra · várható nyeremény kb. <b>${n0(Math.floor(LV.stk*d))} Ft</b>`:'Koppints egy szorzóra: TÉT – nyer, HELY – dobogón végez.';
  $('#lvGo').disabled=!LV.odds||!b0||poor}
// rajt: a tét levonása, a végső (kései pénzzel módosult) kassza rögzítése, beállás a startgépbe
function lvGate(){const R=LV.R,b=LV.bet;if(!R||!LV.odds||!b||LV.ft<LV.stk)return;b.st=LV.stk;
  // kései pénz (a végső osztalékot módosítja) és a futam sorsolása: csak most, a tét rögzítése után, kriptográfiai véletlenből
  const lr=lvRngS(lvSeed()),late=a=>{const x=a.map(v=>v*Math.exp(lvGauss(lr)*.1)),t=x.reduce((q,v)=>q+v,0);return x.map(v=>v/t)};R.fw=late(R.ww);R.fp=late(R.wp);
  R.seed=lvSeed();const Q={D:R.D,cz:R.cz,field:R.field};lvSim(Q,lvRngS(R.seed));lvRunOut(Q);LV.res=lvPay(R,b,lvOrder(Q));
  LV.ft=walFt(-b.st);LV.staked=b.st;LV.s.pend={st:b.st,win:LV.res.win,form:LV.res.form};lvStore();
  lvSim(R,lvRngS(R.seed));LV.acc=0;LV.cine=null;LV.cineDone=0;LV.ph='gate';LV.run=true;LV.belled=false;LV.gateT=0;LV.bellAt=3.2+Math.random()*1.2;LV.msg=null;LV.cam=-30;LV.pt=[];LV.flash=0;LV.cheer=0;LV.over=0;LV.lead=-1;LV.leadT=0;LV.sayT=0;LV.fl={};LV.fast=false;
  const f=$('#lvFast');f.hidden=false;f.classList.remove('on');lvPanel('');LV.fit();lvSnd('call');lvSay('Az indulók beállnak a startgépbe…');lvMsg(R.no+'. FUTAM','#ffd23a')}
function lvFinish(){const R=LV.R,b=LV.bet,res=LV.res;lvRunOut(R);
  // a képernyőn lefutott futam ugyanaz, mint a rajtnál kisorsolt (azonos mag, rögzített lépésköz); az elszámolás a sorsolt eredményből megy
  if(lvOrder(R).some((r,i)=>r.e.idx!==res.order[i]))console.warn('DERBY: a lejátszott sorrend eltér a sorsolttól',res.order);
  const o=res.order.map(i=>R.rs[i]);o.forEach((r,i)=>{r.pl=i+1});const d=res.d,win=res.win,net=win-b.st;LV.staked=0;
  if(LV.s.pend)lvSettle(LV.s.pend);LV.ft=walFt(0);
  LV.ph='done';LV.run=false;lvAmb(false);$('#lvFast').hidden=true;lvSnd(win?'win':'lose');
  const w=o[0],mine=o.find(r=>r.e.idx===b.i),gap=(r,q)=>{if(!r.fin||!q.fin)return '–';const l=(r.fin-q.fin)*w.Vn/LV_L;return l<.12?'orrhosszal':l<.3?'nyakhosszal':l<.75?'fél hosszal':l<1.25?'egy hosszal':lvNum(l)+' hosszal'};
  const list=o.map((r,i)=>`<div class="${r===mine?'me':''}"><span><i class="lvno" data-st="background:${LV_COL[r.e.idx]}">${r.e.idx+1}</i>${i+1}. ${esc(r.e.h.n)} <small>${LV_TY[r.e.h.ty].n}</small></span><b>${i?gap(r,o[i-1]):(r.fin||0).toFixed(2).replace('.',',')+' mp'}</b></div>`).join('');
  lvPanel(`<div class="hover lvres"><h3>${win?'💰 NYERTÉL!':'NEM JÖTT BE'}</h3>
    <div class="hboard lvbets"><div class="lbl">Szelvény</div><div class="${win?'ok':'no'}"><span>${b.t==='w'?'Tét':'Hely'} · ${b.i+1}. ${esc(R.field[b.i].h.n)} (${mine.pl}. hely) · ${n0(b.st)} Ft</span><b>${win?'+'+n0(win)+' Ft (×'+lvNum(d)+')':'elveszett'}</b></div></div>
    <div class="hboard lvord"><div class="lbl">Befutó</div>${list}</div>
    <p class="lvnet ${net<0?'neg':'pos'}">Futam mérlege: <b>${net<0?'−':'+'}${n0(Math.abs(net))} Ft</b><br><small>Pénzed: ${n0(LV.ft)} Ft</small></p>
    <button class="btn pri" id="lvNext">▶ Következő futam</button> <button class="btn line" id="lvMenuB">Menü</button></div>`);
  $('#lvNext').onclick=lvCard;$('#lvMenuB').onclick=lvMenu}

/* ---------- a löveg modellje: egyszínű szürkészöld PzH 2000 oldalnézetben (jobbra néz) ----------
   A koordináták a referencia-tervrajz arányait követik (kb. 75 egység = 1 m, a rajzon balra néz); tükrözve rajzoljuk. */
const LV_MW=1090,LV_MH=313;let LV_MDL=null;
function lvModel(){if(LV_MDL)return LV_MDL;const k=(LOWFX?34:46)/75,cv=document.createElement('canvas');cv.width=Math.round(LV_MW*k);cv.height=Math.round(LV_MH*k);const c=cv.getContext('2d');
  c.setTransform(-k,0,0,k,965*k,-165*k);c.lineJoin='round';
  const INK='#23251d',Dk='#6b705c',Sl='#3b3e33';
  const path=p=>{p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()};
  const poly=(p,f,st,w)=>{c.beginPath();path(p);if(f){c.fillStyle=f;c.fill()}if(st){c.strokeStyle=st;c.lineWidth=w||2.4;c.stroke()}};
  const grad=(y0,y1,a,b)=>{const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const slats=(x0,x1,y0,y1,n)=>{c.fillStyle=Sl;c.fillRect(x0,y0,x1-x0,y1-y0);c.fillStyle='#878c76';for(let i=1;i<n;i++)c.fillRect(x0+(x1-x0)*i/n-1,y0+1.5,2,y1-y0-3)};
  const HULL=[[195,372],[212,345],[262,335],[300,318],[480,313],[915,313],[915,385],[240,392],[203,388]];
  const TUR=[[545,302],[522,268],[528,228],[572,206],[640,198],[950,198],[956,206],[956,302]];
  // lánctalp, láncmeghajtó és feszítőkerék, 7 futógörgő
  poly([[203,398],[232,382],[880,382],[902,404],[870,442],[818,464],[292,464],[236,440]],'#2b2b26',INK);
  c.strokeStyle='#55584a';c.lineWidth=1.5;for(let x=300;x<815;x+=13){c.beginPath();c.moveTo(x,459);c.lineTo(x,464);c.stroke()}
  c.strokeStyle=INK;c.lineWidth=2;for(const x of [240,860]){c.beginPath();c.arc(x,408,21,0,7);c.fillStyle=Dk;c.fill();c.stroke();c.beginPath();c.arc(x,408,8,0,7);c.fillStyle=Sl;c.fill()}
  for(let i=0;i<7;i++){const x=305+77.5*i;c.beginPath();c.arc(x,429,32,0,7);c.fillStyle='#7b806a';c.fill();c.stroke();c.beginPath();c.arc(x,429,21,0,7);c.strokeStyle='#5d6150';c.stroke();c.strokeStyle=INK;c.beginPath();c.arc(x,429,10,0,7);c.fillStyle='#5d6150';c.fill();c.stroke();c.beginPath();c.arc(x,429,3.5,0,7);c.fillStyle=Sl;c.fill()}
  // 155 mm L/52 löveg, enyhén megemelve; csőszájfék, csőrögzítő
  c.strokeStyle=INK;c.lineWidth=2.4;c.beginPath();c.moveTo(398,312);c.lineTo(398,258);c.stroke();
  c.save();c.translate(505,244);c.rotate(.044);c.lineWidth=2;c.fillStyle=grad(-12,12,'#9a9f87','#70755f');
  c.beginPath();c.rect(-585,-7,585,14);c.fill();c.stroke();c.beginPath();c.rect(-150,-11,150,22);c.fill();c.stroke();c.beginPath();c.rect(-330,-9,46,18);c.fill();c.stroke();
  c.fillStyle='#5e6352';c.beginPath();c.rect(-628,-12,46,24);c.fill();c.stroke();c.fillStyle=INK;for(const x of [-620,-609,-598,-587])c.fillRect(x,-7,4,14);c.restore();
  // páncéltest
  poly(HULL,grad(313,392,'#9da28a','#787d67'),INK);
  slats(318,478,319,345,14);slats(600,735,326,340,12);
  c.strokeStyle='rgba(30,32,24,.6)';c.lineWidth=1.6;c.beginPath();c.moveTo(214,349);c.lineTo(915,349);c.stroke();c.strokeRect(770,322,70,20);c.strokeRect(500,320,80,22);
  c.fillStyle='rgba(30,32,24,.7)';for(let x=250;x<905;x+=46){c.beginPath();c.arc(x,356,1.8,0,7);c.fill()}
  c.fillStyle='#70755f';c.strokeStyle=INK;c.lineWidth=1.6;for(let x=240;x<905;x+=83){c.beginPath();c.moveTo(x,381);c.lineTo(x+83,381);c.lineTo(x+76,394);c.lineTo(x+7,394);c.closePath();c.fill();c.stroke()}
  // torony
  poly(TUR,grad(198,302,'#a6ab93','#80856e'),INK);
  c.beginPath();c.ellipse(528,246,22,30,0,0,7);c.fillStyle='#868b74';c.fill();c.strokeStyle=INK;c.lineWidth=2.2;c.stroke();
  c.save();c.translate(600,272);c.rotate(-.12);slats(-32,32,-17,17,7);c.restore();
  c.strokeStyle='rgba(30,32,24,.6)';c.lineWidth=1.6;c.beginPath();c.moveTo(660,206);c.lineTo(660,300);c.moveTo(572,208);c.lineTo(560,300);c.moveTo(640,222);c.lineTo(950,222);c.stroke();c.strokeRect(700,246,34,14);c.strokeRect(930,214,22,80);
  // parancsnoki kupola, géppuska, antenna
  c.fillStyle='#6f7460';c.strokeStyle=INK;c.lineWidth=1.8;c.beginPath();c.rect(690,186,56,13);c.fill();c.stroke();c.fillStyle='#33342a';c.fillRect(700,174,34,12);c.fillRect(672,177,60,4);c.fillRect(736,178,26,3);c.fillRect(948,150,2.5,50);c.fillRect(820,190,40,9);
  return LV_MDL=cv}

/* ---------- Rába H14 (4×4 katonai teherautó, ponyvás plató) oldalnézetben, jobbra néz; 75 egység = 1 m, hossz kb. 7,3 m ---------- */
const LV_RW=560,LV_RH=250,LV_RWH=[[160,198],[455,198]];let LV_RBA=null;
function lvRaba(){if(LV_RBA)return LV_RBA;const k=(LOWFX?34:46)/75,cv=document.createElement('canvas');cv.width=Math.round(LV_RW*k);cv.height=Math.round(LV_RH*k);const c=cv.getContext('2d');c.scale(k,k);c.lineJoin='round';
  const INK='#1f2416',G1='#74834a',G2='#56633a',Dk='#3d4728',Bk='#22241d';
  const poly=(p,f,st,w)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(f){c.fillStyle=f;c.fill()}if(st){c.strokeStyle=st;c.lineWidth=w||2.4;c.stroke()}};
  const grad=(y0,y1,a,b)=>{const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const box=(x,y,w,h,f)=>{c.fillStyle=f;c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.rect(x,y,w,h);c.fill();c.stroke()};
  // alváz, a tengelyek közti ládák és tank, hátsó aláfutásgátló
  box(30,168,500,14,'#2f3524');box(206,182,86,30,G2);box(292,182,52,30,G2);box(352,176,34,26,Bk);c.fillStyle='#2f3524';c.fillRect(22,186,26,6);c.fillRect(196,212,160,5);
  // plató: alacsony oldalfal kötözőzsinórral, fölötte világosabb ponyva kis ablakkal
  box(34,140,330,28,grad(140,168,G1,G2));
  c.beginPath();c.moveTo(32,140);c.lineTo(32,44);c.quadraticCurveTo(34,30,50,29);c.lineTo(330,24);c.quadraticCurveTo(352,24,358,40);c.lineTo(366,140);c.closePath();c.fillStyle=grad(24,140,'#9aa27c','#727b56');c.fill();c.strokeStyle=INK;c.lineWidth=2.4;c.stroke();
  c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.moveTo(50,30);c.lineTo(330,25);c.quadraticCurveTo(350,25,356,40);c.lineTo(46,44);c.closePath();c.fill();
  c.strokeStyle='rgba(31,36,22,.35)';c.lineWidth=1.5;c.beginPath();for(const x of [88,146,204,262,318]){c.moveTo(x,31);c.quadraticCurveTo(x+3,84,x,139)}c.stroke();
  box(196,70,26,22,'#55606a');c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.5;c.beginPath();c.moveTo(200,88);c.lineTo(214,74);c.moveTo(208,88);c.lineTo(218,78);c.stroke();
  c.strokeStyle='#2b301f';c.lineWidth=1.4;c.beginPath();c.moveTo(38,146);for(let x=38;x<360;x+=14){c.lineTo(x+7,136);c.lineTo(x+14,146)}c.stroke();c.fillStyle=Dk;for(let x=45;x<360;x+=28)c.fillRect(x-1.5,146,3,20);
  // bordás felszerelésláda a fülke mögött
  box(368,88,34,80,grad(88,168,G1,G2));c.strokeStyle='rgba(31,36,22,.55)';c.lineWidth=1.4;c.beginPath();for(const x of [375,382,389,396]){c.moveTo(x,92);c.lineTo(x,164)}c.stroke();box(372,70,26,18,G2);
  // szögletes bulldogfülke: nagy oldalablak, ajtó, tükör, tetőnyílás
  poly([[402,176],[402,70],[408,60],[420,52],[512,52],[524,62],[530,74],[534,176]],grad(52,176,'#7f8f52',G2),INK);
  poly([[414,60],[516,60],[520,66],[414,66]],'rgba(255,255,255,.1)');
  poly([[416,72],[476,72],[476,112],[416,112]],grad(72,112,'#8fa3a8','#3d4f55'),INK,2);poly([[484,72],[520,72],[526,112],[484,112]],grad(72,112,'#a3b6ba','#4a5c62'),INK,2);
  c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=1.5;c.beginPath();c.moveTo(424,106);c.lineTo(446,78);c.moveTo(436,106);c.lineTo(452,86);c.stroke();
  c.strokeStyle='rgba(31,36,22,.6)';c.lineWidth=1.6;c.beginPath();c.moveTo(412,68);c.lineTo(412,172);c.lineTo(480,172);c.lineTo(480,68);c.stroke();c.strokeRect(420,122,22,34);c.fillStyle=INK;c.fillRect(462,126,12,3);
  c.fillStyle=Bk;c.fillRect(528,70,4,26);c.fillRect(531,58,7,34);c.fillRect(440,44,46,8);c.fillRect(498,46,10,6);
  // homlok: hűtőrács, irányjelző, fényszóró, lökhárító, fellépő
  c.fillStyle=Bk;for(let y=124;y<150;y+=6)c.fillRect(522,y,10,3);box(524,152,9,14,'#f08a1e');
  poly([[500,176],[546,176],[550,198],[540,206],[498,206]],G2,INK,2);box(536,180,10,12,'#f1f0dc');box(504,196,22,5,Dk);box(420,180,24,5,Dk);box(424,192,18,5,Dk);
  // fekete sárvédőívek, terepgumik zöld tárcsával és csavarokkal
  for(const [x,y] of LV_RWH){c.beginPath();c.arc(x,y-2,53,Math.PI*1.02,-Math.PI*.02);c.arc(x,y-2,45,-Math.PI*.02,Math.PI*1.02,true);c.closePath();c.fillStyle=Bk;c.fill();
    c.beginPath();c.arc(x,y,42,0,7);c.fillStyle='#1b1c18';c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();
    c.strokeStyle='#33352d';c.lineWidth=2;for(let q=0;q<18;q++){const a=q/18*Math.PI*2;c.beginPath();c.moveTo(x+Math.cos(a)*33,y+Math.sin(a)*33);c.lineTo(x+Math.cos(a+.12)*41,y+Math.sin(a+.12)*41);c.stroke()}
    c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.arc(x,y,23,0,7);c.fillStyle=G1;c.fill();c.stroke();c.beginPath();c.arc(x,y,8,0,7);c.fillStyle=G2;c.fill();c.stroke()}
  return LV_RBA=cv}

/* ---------- részecskék: por, sár, kipufogófüst, láng, konfetti ---------- */
const LV_PUFF={},LV_PCOL={dust:'216,198,152',dust1:'170,152,108',mud:'96,74,46',smoke:'168,170,168',black:'30,30,30',fire:'255,176,64'};
function lvPuff(k){if(LV_PUFF[k])return LV_PUFF[k];const col=LV_PCOL[k],cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,2,32,32,32);
  g.addColorStop(0,`rgba(${col},.95)`);g.addColorStop(.45,`rgba(${col},.5)`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(0,0,64,64);return LV_PUFF[k]=cv}
// x: világ (m), y: képernyő (px); vx m/s, vy px/s; r0→r1 sugár; a: kezdő átlátszatlanság; gr: nehézkedés (px/s²)
function lvPt(k,x,y,vx,vy,life,r0,r1,a,gr,col){// a füst- és porfelhő lassul (közegellenállás), a rög és a konfetti esik
  const P=LV.pt;if(P.length>=(LOWFX?130:520))P.shift();P.push({k,x,y,vx,vy,life,t:0,r0,r1,a,gr:gr||0,col})}
function lvPtDraw(c,dt,X,W,front){const P=LV.pt;for(let i=P.length-1;i>=0;i--){const p=P[i],fr=p.k==='clod'||p.k==='smoke'||p.k==='black'||p.k==='fire'||p.k==='conf';if(fr!==front)continue;
    p.t+=dt;if(p.t>=p.life){P.splice(i,1);continue}if(!p.gr){const d=Math.exp(-dt*2.2);p.vx*=d;p.vy*=Math.exp(-dt*.9)}p.x+=p.vx*dt;p.vy+=p.gr*dt;p.y+=p.vy*dt;const x=X(p.x),u=p.t/p.life;if(x<-60||x>W+60)continue;
    if(p.k==='clod'){c.globalAlpha=p.a*(1-u*u);c.fillStyle='#3d2c18';c.beginPath();c.arc(x,p.y,p.r0,0,7);c.fill()}
    else if(p.k==='conf'){c.globalAlpha=1-u*u;c.fillStyle=p.col;c.save();c.translate(x,p.y);c.rotate(p.t*9+p.r0);c.fillRect(-3,-2,6,4);c.restore()}
    else{const r=p.r0+(p.r1-p.r0)*Math.sqrt(u);c.globalAlpha=p.a*(1-u)*(u<.12?u/.12:1);if(p.k==='fire')c.globalCompositeOperation='lighter';c.drawImage(lvPuff(p.k),x-r,p.y-r,r*2,r*2);if(p.k==='fire')c.globalCompositeOperation='source-over'}}
  c.globalAlpha=1}

function lvBurst(R,G,n){for(const r of R.rs){const by=G.top+(r.lf+.9)*G.lh,T=LV_TY[r.e.h.ty];for(let i=0;i<n;i++)lvPt('black',r.x-T.len*(.86+Math.random()*.1),by-G.sh*T.ex,-1-Math.random()*4,-(30+Math.random()*60),1.4+Math.random()*.8,G.lh*.14,G.lh*(.8+Math.random()*.7),.9)}}
function lvEmit(R,G,dt,X){const {W,top,lh,sh,sw}=G,g=R.g,q=LOWFX?.35:1,rn=Math.random,some=n=>{const k=Math.floor(n);return k+(rn()<n-k?1:0)};
  for(const r of R.rs){const sx=X(r.x);if(sx<-sw*2.5||sx>W+sw*1.2)continue;
    const T=LV_TY[r.e.h.ty],by=top+(r.lf+.9)*lh,sp=r.v/LV_V,ex=r.x-T.len*.9,ey=by-sh*T.ex,bad=r.failT>0&&r.failT<3.5,hard=r.vd>r.v+.3||(LV.cheer&&!r.fin);
    // kipufogó: alapjáraton vékony, gyorsításnál és a hajrában sűrű, hibánál fekete
    for(let n=some((bad?34:hard?20:r.v>.4?9:4)*q*dt);n>0;n--)lvPt(bad?'black':'smoke',ex+rn()*.4,ey,r.v*.55-1-rn()*2,-(26+rn()*34),bad?1.7:1+rn()*.6,lh*.1,lh*(bad?1:hard?.7:.5)*(.7+rn()*.6),bad?.9:hard?.7:.5);
    if(r.v<.4)continue;
    // por a lánctalp és a kerekek alól (száraz pályán sok, sárban kevés)
    for(let n=some(sp*(g===0?26:g===1?15:8)*q*dt);n>0;n--)lvPt(g===2?'mud':g===1?'dust1':'dust',r.x-T.len*(.45+rn()*.5),by-rn()*lh*.16,r.v*.4-rn()*2.5,-(8+rn()*24),1+rn()*.9,lh*.16,lh*(.6+rn()*.55)*(g===0?1.35:1),g===0?.85:.7);
    // felvert sár és rögök
    if(g)for(let n=some(sp*(g===2?26:9)*q*dt);n>0;n--)lvPt('clod',r.x-T.len*(.45+rn()*.5),by-2,-2-rn()*6,-(50+rn()*(g===2?130:80)),.75+rn()*.3,1+rn()*(g===2?2.4:1.4),0,.95,430)}}

/* ---------- rajzolás ---------- */
const lvHash=n=>{n=Math.imul(n^(n>>>15),0x2c1b3c6d);n=Math.imul(n^(n>>>12),0x297a2d39);return ((n^(n>>>15))>>>0)/4294967296};
const LV_CROWD=['#e63946','#f1faee','#457b9d','#ffd23a','#2a9d8f','#f4a261','#b388ff','#222'];
function lvBack(c,G,cam,s,now){const {W,mm,top}=G,sk=c.createLinearGradient(0,mm,0,top);sk.addColorStop(0,'#4fa3e3');sk.addColorStop(1,'#cfeaff');c.fillStyle=sk;c.fillRect(0,0,W,top);
  // felhők, távoli dombok
  c.fillStyle='rgba(255,255,255,.85)';const cx=-((cam*s*.06+now*4)%300);for(let x=cx-300;x<W+300;x+=300){for(const [dx,dy,r] of [[40,mm+18,12],[56,mm+13,15],[74,mm+18,12],[190,mm+30,9],[203,mm+26,11],[216,mm+30,9]]){c.beginPath();c.arc(x+dx,dy,r,0,7);c.fill()}}
  c.fillStyle='#7fae7a';c.beginPath();c.moveTo(0,top);const hx=cam*s*.18;for(let x=0;x<=W+20;x+=20)c.lineTo(x,top-22-Math.sin((x+hx)*.011)*10-Math.sin((x+hx)*.027)*5);c.lineTo(W,top);c.fill();
  // lelátó közönséggel, zászlók, fák
  const P=360,px=-((cam*s*.45)%P),i0=Math.floor(cam*s*.45/P);for(let x=px-P,k=i0-1;x<W+P;x+=P,k++){
    c.fillStyle='#2f5a2a';for(const [dx,r] of [[20,20],[48,27],[300,24],[332,18]]){c.beginPath();c.arc(x+dx,top-8,r,Math.PI,0);c.fill()}c.fillStyle='#4a3524';c.fillRect(x+46,top-10,4,10);c.fillRect(x+298,top-10,4,10);
    c.fillStyle='#d9d3c0';c.fillRect(x+92,top-46,176,46);c.fillStyle='#8c8778';for(let r=0;r<4;r++)c.fillRect(x+92,top-46+r*11,176,1.5);
    c.fillStyle='#a83228';c.beginPath();c.moveTo(x+84,top-46);c.lineTo(x+100,top-60);c.lineTo(x+260,top-60);c.lineTo(x+276,top-46);c.fill();c.fillStyle='#6b6b6b';for(const dx of [96,180,264])c.fillRect(x+dx-1.5,top-46,3,46);
    for(let r=0;r<4;r++)for(let j=0;j<21;j++){const h=lvHash(k*977+r*31+j);if(h<.14)continue;c.fillStyle=LV_CROWD[Math.floor(h*8)];c.fillRect(x+97+j*8,top-43+r*11-(LV.cheer?Math.abs(Math.sin(now*7+h*20))*3:0),5,7)}
    for(const [dx,col] of [[100,'#c8102e'],[180,'#fff'],[260,'#2e7d32']]){c.fillStyle='#555';c.fillRect(x+dx,top-78,1.5,18);c.fillStyle=col;c.beginPath();const w=Math.sin(now*5+dx)*2;c.moveTo(x+dx+1.5,top-78);c.lineTo(x+dx+15,top-75+w);c.lineTo(x+dx+1.5,top-70);c.fill()}}
  c.fillStyle='#2d5a26';c.fillRect(0,top-7,W,7)}
function lvSprites(){LV.imgG=new Image();LV.imgG.src=GID_FULL||GID_SPRITE;LV.gFull=!!GID_FULL;try{gidFullSet()}catch(e){}
  LV.imgR=lvRaba()}function lvGeom(){const W=LV.W,H=LV.H,mm=34,top=mm+Math.max(70,H*.16),ui=150,lh=lvClamp((H-top-ui)/LV_N,20,50),sw=Math.min(lh*3,W*.36),s=sw/LV_L;return {W,H,mm,top,lh,bot:top+lh*LV_N,sw,sh:sw*LV_MH/LV_MW,s}}
function lvDraw(dt,rdt){rdt=rdt??dt;const cv=LV.cv;if(!cv||!LV.W)return;const c=cv.getContext('2d'),G=lvGeom(),{W,H,mm,top,lh,bot,sw,sh,s}=G,R=LV.R,live=R&&R.rs&&(LV.ph==='gate'||LV.ph==='race'||LV.ph==='done'),now=performance.now()/1000;
  c.setTransform(LV.dpr,0,0,LV.dpr,0,0);c.globalAlpha=1;
  const pick=live&&LV.bet?R.rs[LV.bet.i]:null,D=R?R.D:600,g=R&&LV.ph!=='menu'?R.g:0;
  const C=live?LV.cine:null;if(C){const lx=Math.max(...C.who.map(r=>r.x)),tx=Math.min(lx-(W*.52)/s,D-(W*.62)/s);LV.cam+=(tx-LV.cam)*Math.min(1,rdt*4)}else if(pick){const tx=pick.x-(LV.ph==='gate'?Math.max(W*.5,sw*1.15):W*.56)/s;LV.cam+=(tx-LV.cam)*Math.min(1,rdt*(LV.ph==='gate'?2.5:5))}else LV.cam=(LV.cam||0)+rdt*5;
  const cam=LV.cam,X=x=>(x-cam)*s;
  // célfotó: ráközelítés a célvonalra a két esélyes sávjánál
  const zk=C?Math.min(1,(C.out?Math.max(0,1-C.out/.6):1)*Math.min(1,C.t/.6)):0,ez=zk*zk*(3-2*zk);c.save();
  if(ez>0){const yy=C.who.reduce((t,r)=>t+top+(r.lf+.5)*lh,0)/C.who.length,px=X(Math.min(D,Math.max(...C.who.map(r=>r.x)))),z=1+.6*ez;c.translate(px,yy);c.scale(z,z);c.translate(-px,-yy)}
  lvBack(c,G,cam,s,now);
  // gyep: sávok, nyírási csíkok, sárban tócsák
  for(let i=0;i<LV_N;i++){c.fillStyle=LV_GO[g].c[i%2];c.fillRect(0,top+i*lh,W,lh)}
  for(let m=Math.floor(cam/20)*20;m<cam+W/s;m+=20){if((m/20)&1){c.fillStyle=g?'rgba(0,0,0,.07)':'rgba(255,255,255,.06)';c.fillRect(X(m),top,20*s,bot-top)}}
  if(g&&!LOWFX)for(let m=Math.floor(cam/9)*9-9;m<cam+W/s+9;m+=9)for(let i=0;i<LV_N;i++){const h=lvHash(m*13+i*7+R.no);if(h>(g===2?.42:.16))continue;const x=X(m+h*20),y=top+(i+.3+h)*lh;c.fillStyle='rgba(40,28,14,.45)';c.beginPath();c.ellipse(x,y,lh*(.5+h*2),lh*.16,0,0,7);c.fill();c.fillStyle='rgba(190,210,225,.2)';c.beginPath();c.ellipse(x-lh*.1,y-lh*.03,lh*(.25+h),lh*.06,0,0,7);c.fill()}
  c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=1;for(let i=1;i<LV_N;i++){c.beginPath();c.moveTo(0,top+i*lh);c.lineTo(W,top+i*lh);c.stroke()}
  const sg=c.createLinearGradient(0,top,0,top+lh*.7);sg.addColorStop(0,'rgba(0,0,0,.28)');sg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sg;c.fillRect(0,top,W,lh*.7);
  if(R&&LV.ph!=='menu'){c.textAlign='center';
    for(const z of R.cz){const a=X(z[0]*D),b=X(z[1]*D);if(b<0||a>W)continue;c.fillStyle='rgba(255,220,90,.12)';c.fillRect(a,top,b-a,bot-top);
      for(let x=a+40;x<b;x+=170){if(x<-30||x>W+30)continue;c.fillStyle='#ffd23a';c.strokeStyle='#111';c.lineWidth=1.5;c.beginPath();c.rect(x-26,top-24,52,15);c.fill();c.stroke();c.fillStyle='#111';c.font='900 9px system-ui';c.fillText('KANYAR »',x,top-13)}}
    for(let m=Math.max(0,Math.ceil(cam/50)*50);m<cam+W/s&&m<D;m+=50){const x=X(m);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(x,top,1.5,bot-top);if(m%100===0&&D-m>0){c.fillStyle='#fff';c.strokeStyle='#111';c.lineWidth=1.5;c.beginPath();c.rect(x-17,top-24,34,15);c.fill();c.stroke();c.fillStyle='#111';c.font='900 10px system-ui';c.fillText(D-m,x,top-12.5)}}
    const hs=X(D*.72);if(hs>-40&&hs<W+40){c.fillStyle='rgba(255,90,78,.8)';c.fillRect(hs,top,3,bot-top);c.fillStyle='#e63946';c.strokeStyle='#111';c.lineWidth=1.5;c.beginPath();c.rect(hs-34,top-26,68,17);c.fill();c.stroke();c.fillStyle='#fff';c.font='900 9px system-ui';c.fillText('CÉLEGYENES',hs,top-14)}
    const fx=X(D);if(fx>-40&&fx<W+40){const q=lh/4;for(let y=top,k=0;y<bot;y+=q,k++)for(let j=0;j<2;j++){c.fillStyle=(k+j)%2?'#fff':'#111';c.fillRect(fx+j*q,y,q,q)}
      c.fillStyle='#ddd';c.fillRect(fx-2,top-52,4,52);c.fillStyle='#e63946';c.beginPath();c.arc(fx,top-56,9,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(fx,top-56,5,0,7);c.fill()}}
  // távoli korlát
  c.fillStyle='#f4f4f4';c.fillRect(0,top-4,W,3);for(let x=-((((cam*s)%44)+44)%44);x<W;x+=44)c.fillRect(x,top-4,3,8);
  if(live){
    // startgép
    const gx=X(.9),open=LV.ph==='gate'?0:Math.min(1,(R.t||0)/.3);if(gx>-80&&gx<W+80){c.fillStyle='#7d838b';c.fillRect(gx-3,top-20,6,bot-top+24);c.fillRect(gx-sw*.5,top-20,sw*.5,5);
      for(let i=0;i<LV_N;i++){c.fillStyle='#5b6068';c.fillRect(gx-sw*.5,top+i*lh,sw*.5,2.5);c.fillStyle=LV_COL[i];c.fillRect(gx-13,top+i*lh+3,10,9);if(open<1){c.fillStyle='rgba(230,57,70,.92)';c.fillRect(gx+3,top+i*lh+4,5,(lh-8)*(1-open))}}}
    if(dt>0&&LV.ph!=='done')lvEmit(R,G,dt,X);
    const rs=R.rs.slice().sort((a,b)=>a.lf-b.lf);
    // nyomvályú
    for(const r of rs){const x=X(r.x),y=top+(r.lf+.9)*lh;if(x<-sw||x>W+sw*3.5||r.v<1)continue;const tg=c.createLinearGradient(x-sw*3.2,0,x-sw*.9,0);tg.addColorStop(0,'rgba(0,0,0,0)');tg.addColorStop(1,g?'rgba(30,20,8,.34)':'rgba(40,50,20,.26)');c.fillStyle=tg;c.fillRect(x-sw*3.2,y-2.5,sw*2.3,3);c.fillRect(x-sw*3.2,y-lh*.16,sw*2.3,2.5)}
    lvPtDraw(c,dt,X,W,false);
    // járművek (a felső sáv van hátul)
    const det=sw>40;
    for(const r of rs){const x=X(r.x),y=top+(r.lf+.9)*lh,i=r.e.idx,ty=r.e.h.ty,w=sw*LV_TY[ty].len/LV_L;if(x<-sw*.3||x>W+sw*1.3)continue;
      const img=ty==='P'?lvModel():ty==='G'?LV.imgG:LV.imgR,ok=ty!=='G'?!!img:img.complete&&img.naturalWidth>0,h=ty==='P'?w*LV_MH/LV_MW:!ok?w*.42:ty==='G'?w*img.naturalHeight/img.naturalWidth:w*img.height/img.width;
      const pitch=lvClamp((r.v-(r.vd||0))/LV_V*.5,-.035,.035),bob=r.v>1?Math.sin(R.t*24+i*1.7)*lh*.022:(LV.ph==='gate'?Math.sin(now*38+i)*.5:0);
      c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x-w*.52,y+1.5,w*.4,lh*.1,0,0,7);c.fill();
      c.save();c.translate(x-w*.6,y);c.rotate(pitch);const x0=-w*.4,y0=-h+bob;
      if(ok){if(LV_FLIP[ty]){c.save();c.translate(x0+w,y0);c.scale(-1,1);c.drawImage(img,0,0,w,h);c.restore()}else c.drawImage(img,x0,y0,w,h)}else{c.fillStyle='#59603f';c.fillRect(x0,y0+h*.3,w,h*.7)}
      if(det&&ty==='P'&&r.v>.5){// forgó futógörgők, futó lánctalp
        c.strokeStyle='rgba(30,32,24,.75)';c.lineWidth=1;const wy=y0+(429-165)/LV_MH*h,rr=21/LV_MW*w,an=r.x/.43;c.beginPath();for(let k=0;k<7;k++){const wx=x0+(965-(305+77.5*k))/LV_MW*w;for(let q=0;q<2;q++){const a=an+q*Math.PI/2,dx=Math.cos(a)*rr,dy=Math.sin(a)*rr;c.moveTo(wx-dx,wy-dy);c.lineTo(wx+dx,wy+dy)}}c.stroke();
        c.fillStyle='rgba(150,150,130,.55)';const t0=x0+(965-818)/LV_MW*w,t1=x0+(965-292)/LV_MW*w,ty2=y0+(461-165)/LV_MH*h,st=w*.03,off=st-((r.x*s)%st);for(let tx=t0+off;tx<t1;tx+=st)c.fillRect(tx,ty2,st*.4,1.6)}
      if(det&&ty==='R'&&r.v>.5){c.fillStyle='rgba(30,32,24,.85)';const rr=15/LV_RW*w,an=r.x/.55;for(const [px,py] of LV_RWH){const wx=x0+px/LV_RW*w,wy=y0+py/LV_RH*h;for(let q=0;q<5;q++){const a=an+q*Math.PI*2/5;c.beginPath();c.arc(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr,Math.max(.8,w*.007),0,7);c.fill()}}}
      if(ty==='G'&&ok&&LV.gFull){const gk=w/LV_GW,an=r.x/.72;for(const lx of [-36.5,36.5]){c.save();c.translate(x0+(lx-LV_GX0)*gk,y0-LV_GY0*gk);c.scale(gk,gk);gidWheel(c,0,0,13.2,an,R.g*.25);c.restore()}}
      const cw=Math.max(15,sw*.12),ch=Math.max(13,sh*.36),nx=x0+w*(ty==='P'?.035:ty==='R'?.28:.3),ny=y0+h*(ty==='P'?.15:ty==='R'?.2:.32);c.fillStyle=LV_COL[i];c.strokeStyle='#111';c.lineWidth=1.5;c.beginPath();c.rect(nx,ny,cw,ch);c.fill();c.stroke();
      c.fillStyle='#111';c.font=`900 ${Math.round(ch*.82)}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText(i+1,nx+cw/2,ny+ch/2+.5);c.textBaseline='alphabetic';
      c.restore();
      if(r===pick){c.fillStyle='#ffd23a';c.strokeStyle='#111';c.lineWidth=3;c.font='900 12px system-ui';c.textAlign='center';c.strokeText('▼ TIPPED',x-w*.6,y-h-5);c.fillText('▼ TIPPED',x-w*.6,y-h-5)}}
    lvPtDraw(c,dt,X,W,true)}
  if(C&&C.shot&&C.hold<LV_HOLD){// kimerevített célfotó: fekete-fehér, enyhe szépia, piros célvonal
    c.globalCompositeOperation='saturation';c.fillStyle='#808080';c.fillRect(-W,0,W*3,bot+20);c.globalCompositeOperation='source-over';c.fillStyle='rgba(120,90,40,.18)';c.fillRect(-W,0,W*3,bot+20);
    c.fillStyle='#ff2a2a';c.fillRect(X(D)-1.5,top-60,3,bot-top+60)}
  c.restore();
  // előtér: föld, közeli korlát
  c.fillStyle='#2a2318';c.fillRect(0,bot,W,H-bot);c.fillStyle='#f4f4f4';c.fillRect(0,bot+2,W,4);c.fillStyle='#cfcfcf';for(let x=-((((cam*s*1.04)%52)+52)%52);x<W;x+=52)c.fillRect(x,bot+6,4,9);
  if(live){
    // mini-térkép
    c.fillStyle='rgba(10,20,12,.9)';c.fillRect(0,0,W,mm);const mx=x=>14+(W-28)*lvClamp(x/D,0,1.02);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(14,15,W-28,4);
    for(const z of R.cz){c.fillStyle='rgba(255,220,90,.5)';c.fillRect(mx(z[0]*D),15,mx(z[1]*D)-mx(z[0]*D),4)}c.fillStyle='rgba(255,90,78,.8)';c.fillRect(mx(D*.72),15,mx(D)-mx(D*.72),4);c.fillStyle='#fff';c.fillRect(mx(D)-1,6,2,22);
    for(const r of R.rs.slice().sort((a,b)=>(a===pick?1:0)-(b===pick?1:0)||a.x-b.x)){const x=mx(r.x),me=r===pick,rr=me?8:6;c.fillStyle=LV_COL[r.e.idx];c.strokeStyle=me?'#fff':'#111';c.lineWidth=me?2:1;c.beginPath();c.arc(x,17,rr,0,7);c.fill();c.stroke();c.fillStyle='#111';c.font=`900 ${me?10:8}px system-ui`;c.textAlign='center';c.fillText(r.e.idx+1,x,me?20.5:20)}
    // eredményjelző: pillanatnyi sorrend, szelvény, kommentár
    const o=lvOrder(R),y0=bot+22,cw=Math.min(30,(W-70)/LV_N-4);c.font='800 10px system-ui';c.textAlign='left';c.fillStyle='#ffd23a';c.fillText('ÁLLÁS',12,y0+cw*.62);
    o.forEach((r,k)=>{const x=58+k*(cw+4),me=r===pick;c.fillStyle=LV_COL[r.e.idx];c.strokeStyle=me?'#ffd23a':'#111';c.lineWidth=me?3:1.5;c.beginPath();c.rect(x,y0,cw,cw);c.fill();c.stroke();c.fillStyle='#111';c.font=`900 ${Math.round(cw*.6)}px system-ui`;c.textAlign='center';c.fillText(r.e.idx+1,x+cw/2,y0+cw*.72);
      c.fillStyle='rgba(255,255,255,.6)';c.font='700 8px system-ui';c.fillText((k+1)+'.',x+cw/2,y0+cw+10)});
    const b=LV.bet;if(b&&pick){const k=o.indexOf(pick)+1,good=b.t==='w'?k===1:k<=3;c.textAlign='left';c.font='800 12px system-ui';c.fillStyle='#fff';const ty=y0+cw+30;
      let t=`Szelvény: ${b.t==='w'?'TÉT':'HELY'} · ${b.i+1}. ${R.field[b.i].h.n} · ${n0(b.st)} Ft`;while(t.length>8&&c.measureText(t).width>W-86)t=t.slice(0,-2);c.fillText(t,12,ty);
      c.textAlign='right';c.fillStyle=good?'#7dff8a':'#ff8a7a';c.fillText('most '+k+'.',W-12,ty)}
    if(LV.com){LV.comT+=dt;const ty=y0+cw+52;c.fillStyle='rgba(0,0,0,.45)';c.fillRect(8,ty-15,W-16,40);c.fillStyle='#ffe9a8';c.font='italic 700 13px system-ui';c.textAlign='left';
      const ws=('🎙 '+LV.com).split(' ');let ln='',yy=ty;for(const wd of ws){if(c.measureText(ln+wd).width>W-32&&ln){c.fillText(ln,16,yy);ln='';yy+=16;if(yy>ty+16)break}ln+=wd+' '}if(yy<=ty+16)c.fillText(ln,16,yy)}}
  if(C){const k=C.out?Math.max(0,1-C.out/.6):Math.min(1,C.t/.4),bh=Math.round(lh*.9*k);if(bh>0){c.fillStyle='#000';c.fillRect(0,mm,W,bh);c.fillRect(0,bot-bh,W,bh);
    c.globalAlpha=k;c.textBaseline='middle';c.font='400 20px Bangers, Impact, sans-serif';c.textAlign='left';c.fillStyle='#ffd23a';c.fillText('CÉLFOTÓ',14,mm+bh/2);
    c.textAlign='right';c.font='800 12px system-ui';c.fillStyle=C.shot?'#fff':'#ff4d4d';c.fillText(C.shot?'📸 KIMEREVÍTVE':(Math.sin(performance.now()/180)>0?'● ':'')+'LASSÍTÁS ×'+String(LV_SLOW).replace('.',','),W-14,mm+bh/2);
    if(C.shot&&C.txt){c.textAlign='center';c.font='400 19px Bangers, Impact, sans-serif';c.fillStyle='#fff';c.fillText(C.txt.toUpperCase(),W/2,bot-bh/2)}
    c.globalAlpha=1;c.textBaseline='alphabetic'}}
  if(LV.flash>0){c.fillStyle=`rgba(255,255,255,${Math.min(1,LV.flash)})`;c.fillRect(0,0,W,H);LV.flash-=rdt*2.5}
  // nagy felirat
  const m=LV.msg;if(m){m.t+=rdt;if(m.t>1.6)LV.msg=null;else{c.save();c.globalAlpha=Math.min(1,(1.6-m.t)*3);let fs=34;c.font='400 34px Bangers, Impact, sans-serif';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#111';c.lineJoin='round';while(fs>14&&c.measureText(m.s).width>W-20){fs-=2;c.font=`400 ${fs}px Bangers, Impact, sans-serif`}const y=mm+34+Math.max(0,.25-m.t)*40;c.strokeText(m.s,W/2,y);c.fillStyle=m.col;c.fillText(m.s,W/2,y);c.restore()}}}

/* ---------- kommentár, a futam vége ---------- */
const LV_SUF=['es','es','as','es','ös','os','es','as'],lvTag=i=>(i+1)+'-'+LV_SUF[i],lvThe=r=>(r.e.idx===0||r.e.idx===4?'az ':'a ')+lvTag(r.e.idx),lvPl=k=>(k===1||k===5?'az ':'a ')+k+'. helyen';
function lvTalk(R,dt){const o=lvOrder(R),ld=o[0],D=R.D,p=ld.x/D,nm=r=>lvThe(r)+' '+r.e.h.n,pick=R.rs[LV.bet.i],k=o.indexOf(pick)+1;LV.sayT+=dt;LV.leadT+=dt;
  lvAmbSet(ld.v,R.nfin?1:lvClamp((p-.55)/.3,0,1));LV.cheer=p>.72?1:0;
  for(const r of R.rs)if(r.failT>0&&!r.said){r.said=1;lvSay(`Füstöl ${nm(r)} – műszaki hiba!`);LV.sayT=0}
  if(!R.nfin){
    if(ld.e.idx!==LV.lead){if(LV.lead>=0&&R.t>3&&LV.leadT>2){lvSay(`Az élre áll ${nm(ld)}!`);LV.sayT=0}LV.lead=ld.e.idx;LV.leadT=0}
    if(!LV.fl.s&&p>=.72){LV.fl.s=1;lvMsg('CÉLEGYENES!','#ff8a7a');lvSay(`Célegyenes! Elöl ${nm(ld)}${pick===ld?' – ő a tipped!':' – a tipped '+lvPl(k)+'.'}`);LV.sayT=0}
    else if(!LV.fl.c&&R.t>2&&lvCurve(R,p)){LV.fl.c=1;lvSay('Kanyarba ér az élboly – a belső íven rövidebb az út.');LV.sayT=0}
    else if(LV.sayT>4.5){LV.sayT=0;lvSay([`Elöl ${nm(ld)}, mögötte ${lvThe(o[1])} és ${lvThe(o[2])}.`,`Támad a második helyről ${nm(o[1])}!`,`Hátul ${nm(o[LV_N-1])} – van még mit behozni.`,`A tipped, ${nm(pick)} ${lvPl(k)} halad.`][Math.floor(Math.random()*4)])}}
  else if(!LV.over){LV.over=R.t;lvSnd('fin');const n2=o[1],t2=n2.fin||R.t+(D-n2.x)/Math.max(1,n2.v);
    if(LV.cine||LV.cineDone){}else if(t2-ld.fin<.12){lvMsg('CÉLFOTÓ!','#fff');LV.flash=.9}else lvMsg('CÉLBAN!','#ffd23a');lvSay(`Célban ${nm(ld)}!`);
    if(ld===pick&&!LOWFX){const G=lvGeom();for(let i=0;i<70;i++)lvPt('conf',ld.x-LV_L*Math.random()*1.5,G.top+Math.random()*G.lh*2,(Math.random()-.3)*9+ld.v*.6,-(60+Math.random()*160),1.6+Math.random(),Math.random()*6,0,1,260,LV_COL[i%8])}}
  if((LV.over&&R.nfin>=3&&R.t>LV.over+2.6&&(pick.fin||R.t>LV.over+7))||R.t>D/LV_V*1.9)lvFinish()}

/* ---------- célfotó: szoros befutónál filmes lassítás – fekete sávok, ráközelítés a célvonalra, kimerevített fekete-fehér fotó ---------- */
const LV_SLOW=.22,LV_HOLD=2.2;
function lvCineCheck(R){if(LV.cine||LV.cineDone)return;const D=R.D,eta=r=>r.fin||R.t+(D-r.x)/Math.max(1,r.v),o=R.rs.slice().sort((a,b)=>eta(a)-eta(b));
  if(o[0].fin||D-o[0].x>38)return;const b=LV.bet,pk=R.rs[b.i];let who=null;
  if(eta(o[1])-eta(o[0])<LV_PHOTO)who=[o[0],o[1]];else if(b.t==='p'&&(pk===o[2]||pk===o[3])&&eta(o[3])-eta(o[2])<LV_PHOTO)who=[o[2],o[3]];
  if(!who)return;LV.cine={t:0,who,shot:0,hold:0,out:0,hb:-1};LV.fast=false;const f=$('#lvFast');if(f){f.hidden=true;f.classList.remove('on')}LV.msg=null;
  lvSay(`Fej fej mellett ${lvThe(who[0])} és ${lvThe(who[1])}! Célfotó lesz…`)}
function lvCineScale(dt){const C=LV.cine;if(!C)return 1;C.t+=dt;
  if(C.out){C.out+=dt;const k=Math.min(1,C.out/.6);if(k>=1){LV.cine=null;LV.cineDone=1;const f=$('#lvFast');if(f&&LV.ph==='race')f.hidden=false;return 1}return LV_SLOW+(1-LV_SLOW)*k}
  if(C.shot){C.hold+=dt;if(C.hold>=LV_HOLD)C.out=1e-6;return 0}
  if(SOUND&&C.t-C.hb>.8&&ac()){C.hb=C.t;try{const t=AC.currentTime+.01;boom(t,.55,46);boom(t+.17,.35,42)}catch(e){}}
  return 1-(1-LV_SLOW)*Math.min(1,C.t/.5)}
// a fotó abban a pillanatban készül, amikor az első átér a célvonalon (mint a valódi célfotó); a különbség a másik orra és a vonal távolsága
function lvCineShot(R){const C=LV.cine;if(!C||C.shot||!C.who.some(r=>r.fin))return;C.shot=1;C.hold=0;LV.flash=1;LV.acc=0;
  const a=C.who.find(r=>r.fin&&(!C.who.find(q=>q!==r&&q.fin)||r.fin<=C.who.find(q=>q!==r).fin)),b=C.who.find(r=>r!==a),l=(b.fin?(b.fin-a.fin)*a.Vn:Math.max(0,R.D-b.x))/LV_L;C.txt=`${lvTag(a.e.idx)} ${l<.12?'orrhosszal':l<.3?'nyakhosszal':'fél hosszal'} a ${lvTag(b.e.idx)} előtt`;
  if(SOUND&&ac()){try{snare(AC.currentTime+.01,.5);sndClink()}catch(e){}}}

/* ---------- főciklus ---------- */
const LV_FLIP={G:false,R:false};
// a Gidrán képének kerékpontjai (app.js gidFullSet: a 639 képpont széles rajz 136/639 léptékben, 2 egység margóval)
const LV_GK=136/639,LV_GX0=-346*LV_GK-2,LV_GW=(639-346)*LV_GK+2-LV_GX0,LV_GY0=-297*LV_GK-2;
function lvLoop(now){LV.raf=requestAnimationFrame(lvLoop);if(!LV.cv)return;let dt=Math.min(.05,(now-(LV.last||now))/1000);LV.last=now;if(LV.paused)dt=0;
  if(!LV.gFull&&GID_FULL){LV.gFull=true;LV.imgG.src=GID_FULL}
  const R=LV.R,sdt=dt*(LV.fast?2.5:1);
  if(LV.ph==='gate'&&dt>0){LV.gateT+=sdt;if(LV.gateT>=LV.bellAt){LV.belled=true;LV.ph='race';R.t=0;lvSnd('bell');lvAmb(true);lvBurst(R,lvGeom(),LOWFX?4:10);lvMsg('RAJT!','#7dff8a');lvSay('Elrajtoltak!')}}
  if(LV.ph==='race'&&dt>0){lvCineCheck(R);const cs=lvCineScale(dt);LV.ws=cs;LV.acc+=sdt*cs;let n=0;while(LV.acc>=LV_DT&&LV.ph==='race'&&n++<30){lvStep(R,LV_DT);lvTalk(R,LV_DT);LV.acc-=LV_DT;lvCineShot(R)}}else LV.ws=1;
  lvDraw(sdt*(LV.ws??1),dt)}
lvLoop=medveWrap(lvLoop,LV,'DERBY');
export {LV,lvOpen};
