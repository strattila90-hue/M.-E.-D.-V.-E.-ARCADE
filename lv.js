// lv.js – az app.js-ből lustán betöltött játékmodul (a közös segédeket onnan importálja)
import {$,AC,LOWFX,MASTER,SOUND,ac,boom,esc,medveWrap,snare,sndClink,sndPop,tkFmt,tkWallet,toast} from './app.js';
/* ===================== TÜZÉR DERBY – PzH 2000 lóverseny (galopp) =====================
   8 löveg fut egy futamban: 7 az istállóból (gép), 1 a játékosé. Futam előtt programfüzet és fogadás
   (Tét, Hely) totalizatőr-rendszerben a Tüzér Kassza zsebpénzéből; a futamban a játékos a saját lövegét hajtja.
   Minden a telefonon fut: a futam, a szorzók és a gépi fogadók is – a szervert a játék nem használja.
   Egységek: méter és másodperc. A löveg hossza LV_L, a névleges tempó LV_V. */
const LV={};
const LV_KEY='medve-lv1',LV_L=11.7,LV_V=16.7,LV_N=8;
const LV_TAKE={w:.15,p:.15};// totalizatőr-levonás
const LV_PUSH=1.042,LV_CRUISE=.955,LV_HEAT=.43;// hajtás / tempómenés sebessége a névlegeshez képest, hőtűrés
const LV_BIAS={w:.9,p:1.18};// a gépi fogadók torzítása: tétnél az esélytelent, helynél az esélyest fogadják túl
const LV_HCP=.55;// a málha a képességkülönbség ekkora részét egyenlíti ki
const LV_DIST=[
  {i:0,n:'Sprint',m:600,wM:1.25,wS:.4,cz:[[.3,.56]]},
  {i:1,n:'Mérföld',m:900,wM:1,wS:1,cz:[[.24,.5]]},
  {i:2,n:'Derby',m:1300,wM:.8,wS:1.6,cz:[[.14,.34],[.54,.74]]}];
const LV_GO=[{n:'száraz',f:1,c:['#4f8a34','#467c2e']},{n:'puha',f:.975,c:['#5b7a33','#52702d']},{n:'mély sár',f:.95,c:['#6a5a34','#5f502d']}];
const LV_STY={E:['Élen menő',.05],K:['Követő',0],H:['Hajrázó',-.05]};
const LV_COL=['#e63946','#f48c26','#ffd23a','#2a9d8f','#4fb3ff','#b388ff','#ff7ab6','#f1f1f1'];
const LV_NAMES=['Vasparipa','Lánctalpas Táltos','Borbála Büszkesége','Acél Kanca','Dízel Csődör','Füstös Ráró','Tábori Villám','Sárdagasztó','Homoki Vihar','Mennydörgés','Csőre Töltött','Nehéz Lovas','Hadtáp Hercege','Zsoldos Szellő','Ágyúdörej','Vezérlő Csillag','Bakonyi Betyár','Tatai Tornádó','Hortobágyi Hajrá','Lövegtalp Lajos','Irányzék','Gyors Reagálás','Röppálya','Tűzparancs'];
const LV_DRV=['Kovács őrm.','Szabó tőrm.','Tóth szkv.','Nagy ftőrm.','Varga őrv.','Molnár zls.','Balogh őrm.','Farkas tőrm.','Lakatos szkv.','Papp őrm.','Juhász tizedes','Simon ftőrm.'];
function lvRng(s){s=s>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
// az istálló: állandó adottságok (mo motor, va váltó, al állóképesség, mb megbízhatóság, gp kedvenc talaj, dp kedvenc táv)
const LV_STABLE=LV_NAMES.map((n,i)=>{const r=lvRng(7919*(i+3));r();r();return {id:i,n,mo:.2+r()*.7,va:.2+r()*.7,al:.2+r()*.7,mb:.6+r()*.38,gp:Math.floor(r()*3),dp:Math.floor(r()*3),sty:'EKH'[Math.floor(r()*3)],drv:LV_DRV[i%LV_DRV.length]}});
const LV_ME={id:'me',n:'A te löveged',mo:.55,va:.55,al:.55,mb:.97,gp:-1,dp:-1,sty:'K',drv:'Te hajtod',me:1};
const lvGauss=r=>{let u=0;for(let i=0;i<6;i++)u+=r();return (u-3)/.7071};// közel normális, szórás 1
const lvClamp=(v,a,b)=>v<a?a:v>b?b:v;
const lvNum=v=>(v>=100?Math.round(v).toString():v>=10?v.toFixed(1):v.toFixed(2)).replace('.',',');

/* ---------- mentett állás (csak a telefonon) ---------- */
function lvLoad(){let s={};try{s=JSON.parse(localStorage.getItem(LV_KEY)||'{}')||{}}catch(e){}
  LV.s={races:Number(s.races)||0,wins:Number(s.wins)||0,net:Number(s.net)||0,form:s.form&&typeof s.form==='object'?s.form:{}}}
function lvStore(){try{localStorage.setItem(LV_KEY,JSON.stringify(LV.s))}catch(e){}}
const lvForm=id=>Array.isArray(LV.s.form[id])?LV.s.form[id]:[];

/* ---------- futam összeállítása ---------- */
function lvAbility(h,D,g){let a=1+.05*(h.mo-.5)*D.wM+.03*(h.al-.5)*D.wS;if(h.dp===D.i)a+=.008;
  if(h.gp>=0){if(h.gp===g)a+=.012;else if(Math.abs(h.gp-g)===2)a-=.012}
  const f=lvForm(h.id);if(f.length)a+=(4.5-f.reduce((t,x)=>t+x,0)/f.length)*.002;return a}
function lvNewRace(){const r=Math.random,x=r(),D=LV_DIST[x<.4?0:x<.75?1:2],y=r(),g=y<.55?0:y<.85?1:2;
  const pool=LV_STABLE.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const hs=[...pool.slice(0,LV_N-1),LV_ME],posts=[0,1,2,3,4,5,6,7];for(let i=7;i>0;i--){const j=Math.floor(r()*(i+1));[posts[i],posts[j]]=[posts[j],posts[i]]}
  const field=hs.map((h,i)=>({h,post:posts[i],ab:lvAbility(h,D,g)}));
  // málha (súlyterhelés): a jobb löveg több gránátot visz – ez kiegyenlíti a mezőnyt
  const mn=Math.min(...field.map(e=>e.ab)),mx=Math.max(...field.map(e=>e.ab));
  field.forEach(e=>{e.shells=20+2*Math.round(20*(e.ab-mn)/Math.max(1e-6,mx-mn));e.Vn=LV_V*LV_GO[g].f*(e.ab-LV_HCP*(e.ab-mn))});
  field.sort((a,b)=>a.post-b.post);field.forEach((e,i)=>{e.idx=i});
  return {D:D.m,dist:D,g,cz:D.cz,field,no:LV.s.races+1}}

/* ---------- a futam szimulációja (a szorzók számításához és az élő futamhoz ugyanaz) ---------- */
function lvSim(R,rnd,live){R.t=0;R.nfin=0;
  R.rs=R.field.map(e=>{const h=e.h;return {e,me:!!h.me,x:0,v:0,ln:e.post,lf:e.post,lc:0,blk:0,
    Vn:e.Vn*(1+lvGauss(rnd)*(h.me?.006:.011))*(h.me&&!live?1.012:1),a:LV_STY[h.sty][1],
    react:.12+(1-h.va)*.25+rnd()*.15,tr:1.2+(1-h.va)*1.4,tk:1.5+rnd()*4,
    failAt:rnd()<(1-h.mb)*.25?.3+rnd()*.55:9,failT:0,fin:0,
    heat:0,cut:0,ab:0,nab:3,go:0,slip:0}})}
const lvCurve=(R,p)=>{for(const z of R.cz)if(p>=z[0]&&p<z[1])return true;return false};
function lvFree(R,r,l){if(l<0||l>=LV_N)return false;for(const o of R.rs){if(o===r)continue;if((Math.abs(o.ln-l)<.5||Math.abs(o.lf-l)<.8)&&Math.abs(o.x-r.x)<LV_L*1.35)return false}return true}
// a játékos lövege: gáz = hajtás (gyors, de melegszik), elengedve = tempómenés (lassabb, hűl)
function lvMeSpeed(R,r,dt,inp){const h=r.e.h,Tn=R.D/r.Vn,p=r.x/R.D;
  if(!r.go){if((inp.gas&&R.t>=(LV.jump?.9:0))||R.t>2.6){r.go=1;r.react=R.t;r.tr*=.9;if(!LV.jump&&R.t<.45){r.tr*=.75;lvMsg('TÖKÉLETES RAJT!','#7dff8a')}}else return 0}
  if(inp.boost){inp.boost=0;if(p>=.72&&r.nab>0&&r.ab<=0&&!r.fin){r.ab=1.6;r.nab--;r.heat+=.08;lvSnd('ab');lvHud()}else if(p<.72)lvMsg('Utánégető csak a célegyenesben!','#ffd23a')}
  if(inp.lane){const l=r.ln+inp.lane;inp.lane=0;if(r.lc<=0&&lvFree(R,r,l)){r.ln=l;r.lc=.35}else if(l>=0&&l<LV_N)lvMsg('Foglalt sáv!','#ff8a7a')}
  let base=inp.gas?LV_PUSH:LV_CRUISE;if(r.cut>0){r.cut-=dt;base=.7}if(r.ab>0){r.ab-=dt;base*=1.1}
  if(inp.gas&&r.cut<=0)r.heat+=dt/(Tn*(LV_HEAT+.2*h.al))*(r.slip?.45:1)*(r.ab>0?1.5:1);else r.heat=Math.max(0,r.heat-dt*.35/Tn*(r.slip?1.5:1));
  if(r.heat>=1&&r.cut<=0){r.cut=3;r.heat=.75;lvMsg('TÚLMELEGEDÉS!','#ff5a4e');lvSnd('hot')}
  return r.Vn*base*Math.min(1,(R.t-r.react)/r.tr)}
function lvStep(R,dt,inp){const D=R.D,rs=R.rs,G=LV_L*1.25;R.t+=dt;
  for(const r of rs){const p=r.x/D,ctl=r.me&&inp&&!r.fin;let vd;
    if(r.fin)vd=Math.max(r.Vn*.45,r.v-4*dt);
    else if(ctl)vd=lvMeSpeed(R,r,dt,inp);
    else{const tt=R.t-r.react;vd=tt<=0?0:r.Vn*(1+r.a*(1-2*Math.min(1,p)))*Math.min(1,tt/r.tr);if(p>=r.failAt&&r.failT<3.5){r.failT+=dt;vd*=.55}}
    if(lvCurve(R,p))vd*=1-.004*r.lf;// kanyarban a külső sáv hosszabb
    r.lc-=dt;let b=null,sl=0;
    for(const o of rs){if(o===r)continue;const dx=o.x-r.x;if(dx<=0||Math.abs(o.lf-r.lf)>=.7)continue;if(dx<G&&(!b||dx<b.x-r.x))b=o;if(dx<LV_L*3.4)sl=1}
    r.slip=sl;r.b=b;
    if(b&&b.v<vd&&!r.fin){if(!ctl&&r.lc<=0){if(lvFree(R,r,r.ln+1)){r.ln++;r.lc=.9}else if(lvFree(R,r,r.ln-1)){r.ln--;r.lc=.9}}
      vd=Math.min(vd,b.v);if(ctl&&!r.blk)lvMsg('BESZORULTÁL – válts sávot!','#ffd23a');r.blk=1}
    else{r.blk=0;if(!ctl&&!r.fin&&r.lc<=0&&r.ln>0&&R.t>r.tk&&lvFree(R,r,r.ln-1)){r.ln--;r.lc=1.3}}// a korlát felé húzódik
    r.lf+=lvClamp(r.ln-r.lf,-2.2*dt,2.2*dt);r.vd=vd}
  for(const r of rs){r.v+=(r.vd-r.v)*Math.min(1,dt*(r.me&&inp?3:4));let nx=r.x+r.v*dt;
    if(r.b&&!r.fin&&Math.abs(r.b.lf-r.lf)<.7&&nx>r.b.x-LV_L*1.02){nx=Math.max(r.x,r.b.x-LV_L*1.02);r.v=Math.min(r.v,r.b.v)}
    r.x=nx;if(!r.fin&&r.x>=D){r.fin=R.t-(r.x-D)/Math.max(1,r.v);R.nfin++}}}
const lvOrder=R=>R.rs.slice().sort((a,b)=>(a.fin||1e9)-(b.fin||1e9)||b.x-a.x);
// a szorzók alapja: a futamot sokszor lefuttatjuk (a játékos lövegét is a gép hajtja), ebből jön a nyerési és a dobogós esély
function lvOdds(R0,done){const N=LOWFX?140:240,w=new Array(LV_N).fill(0),pl=new Array(LV_N).fill(0);let k=0;const tok=LV.tok;
  const chunk=()=>{if(tok!==LV.tok)return;const t0=performance.now();
    while(k<N&&performance.now()-t0<22){const R={D:R0.D,cz:R0.cz,field:R0.field};lvSim(R,Math.random,false);let g=0;while(R.nfin<LV_N&&g++<2500)lvStep(R,.1,null);
      const o=lvOrder(R);w[o[0].e.idx]++;for(let j=0;j<3;j++)pl[o[j].e.idx]++;k++}
    if(k<N)setTimeout(chunk,0);else done(w.map(x=>(x+.5)/(N+4)),pl.map(x=>(x+1)/(N+8/3)))};chunk()}

/* ---------- totalizatőr ---------- */
// a gépi fogadók pénze: az esélyteleneket túlfogadják (valós megfigyelés), ezért az esélyes hosszú távon jobb vétel
function lvPools(R,pw,pp){const cap=Math.max(1000,LV.pocket*.1);R.P=cap*40;
  const mk=(pr,ex)=>{const a=pr.map(p=>Math.pow(p,ex)),s=a.reduce((t,x)=>t+x,0);return a.map(x=>x/s)};
  R.pw=pw;R.pp=pp;R.ww=mk(pw,LV_BIAS.w);R.wp=mk(pp,LV_BIAS.p)}
const lvStake=(t,i)=>LV.bets[t+i]||0;
const lvSum=t=>Object.keys(LV.bets).reduce((s,k)=>s+(t&&k[0]!==t?0:LV.bets[k]),0);
function lvDivW(R,i,ww){ww=ww||R.ww;return Math.max(1.05,(R.P+lvSum('w'))*(1-LV_TAKE.w)/(ww[i]*R.P+lvStake('w',i)))}
function lvDivP(R,i,pl,wp){wp=wp||R.wp;const B=j=>wp[j]*R.P+lvStake('p',j);
  if(!pl){pl=R.pp.map((p,j)=>[p,j]).filter(x=>x[1]!==i).sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>x[1]);pl.push(i)}
  const net=(R.P+lvSum('p'))*(1-LV_TAKE.p),bs=pl.reduce((t,j)=>t+B(j),0);return Math.max(1.05,1+(net-bs)/3/B(i))}

/* ---------- hangok ---------- */
function lvSnd(k){if(!SOUND||!ac())return;try{const t=AC.currentTime+.01;
  if(k==='bell'){sndClink();setTimeout(sndClink,130);setTimeout(sndClink,260)}
  else if(k==='ab'){boom(t,.5,90);snare(t,.2)}
  else if(k==='hot'){snare(t,.35);snare(t+.12,.3)}
  else if(k==='fin'){sndPop()}}catch(e){}}
function lvEng(on){try{if(!on){if(LV.eng){const e=LV.eng;LV.eng=null;e.g.gain.setTargetAtTime(0,AC.currentTime,.08);setTimeout(()=>{try{e.o.stop();e.o2.stop()}catch(x){}},400)}return}
  if(LV.eng||!SOUND||!ac())return;const a=AC,o=a.createOscillator(),o2=a.createOscillator(),lp=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o2.type='square';lp.type='lowpass';lp.frequency.value=260;g.gain.value=0;
  o.frequency.value=36;o2.frequency.value=18;o.connect(lp);o2.connect(lp);lp.connect(g).connect(MASTER);o.start();o2.start();LV.eng={o,o2,g,lp}}catch(e){}}
function lvEngSet(v,gas){const e=LV.eng;if(!e)return;try{const t=AC.currentTime,f=34+v*3.4;e.o.frequency.setTargetAtTime(f,t,.08);e.o2.frequency.setTargetAtTime(f/2,t,.08);e.lp.frequency.setTargetAtTime(gas?420:260,t,.1);e.g.gain.setTargetAtTime(gas?.075:.045,t,.1)}catch(x){}}

/* ---------- képernyők ---------- */
function lvMsg(s,col){LV.msg={s,col:col||'#fff',t:0}}
function lvOpen(){const el=$('#harc');el.hidden=false;el.classList.add('lv');document.body.classList.add('harcon');lvLoad();LV.pocket=tkWallet(0);LV.tok=(LV.tok||0)+1;LV.run=false;LV.ph='menu';LV.R=null;LV.inp={gas:0,lane:0,boost:0};
  el.innerHTML=`<div class="hbar"><div class="htitle">Tüzér <b>Derby</b></div><div class="hstat"><span>💰 <b id="lvPk">0</b> Ft</span><span id="lvPos"></span></div><button class="hx" id="lvClose" aria-label="Bezárás">✕</button></div>
   <div class="lvwrap"><canvas id="lvCv"></canvas>
    <div class="lvctl" id="lvCtl" hidden><div class="lvlanes"><button type="button" id="lvUp" aria-label="Sáv befelé">▲<small>KORLÁT</small></button><button type="button" id="lvDn" aria-label="Sáv kifelé">▼<small>KÜLSŐ</small></button></div>
     <button type="button" class="lvab" id="lvAb">UTÁNÉGETŐ<b id="lvAbN">×3</b></button><button type="button" class="dpedal gas" id="lvGas">GÁZ<small>hajtás</small></button></div>
    <div class="lvpanel" id="lvPanel"></div></div>`;
  $('#lvClose').onclick=lvClose;
  const cv=$('#lvCv');LV.cv=cv;LV.fit=()=>{const dpr=LOWFX?1:Math.min(1.5,devicePixelRatio||1),r=cv.getBoundingClientRect();if(r.width<2)return;cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);LV.W=r.width;LV.H=r.height;LV.dpr=dpr};LV.fit();
  try{LV.ro=new ResizeObserver(()=>LV.fit());LV.ro.observe(cv)}catch(e){}
  const gas=$('#lvGas'),on=v=>e=>{e.preventDefault();LV.inp.gas=v;gas.classList.toggle('on',!!v);if(v&&LV.ph==='gate'&&!LV.belled)LV.jump=1};
  gas.addEventListener('pointerdown',e=>{try{gas.setPointerCapture(e.pointerId)}catch(x){}on(1)(e)});for(const n of ['pointerup','pointercancel','lostpointercapture'])gas.addEventListener(n,on(0));
  const tap=(id,f)=>$(id).addEventListener('pointerdown',e=>{e.preventDefault();f()});
  tap('#lvUp',()=>{LV.inp.lane=-1});tap('#lvDn',()=>{LV.inp.lane=1});tap('#lvAb',()=>{LV.inp.boost=1});
  LV.key=e=>{const d=e.type==='keydown';if(LV.ph!=='race'&&LV.ph!=='gate')return;
    if(e.key===' '||e.key==='ArrowRight'){if(d&&LV.ph==='gate'&&!LV.belled&&!LV.inp.gas)LV.jump=1;LV.inp.gas=d?1:0;gas.classList.toggle('on',d)}
    else if(d&&e.key==='ArrowUp')LV.inp.lane=-1;else if(d&&e.key==='ArrowDown')LV.inp.lane=1;else if(d&&(e.key==='Shift'||e.key==='x'||e.key==='X'))LV.inp.boost=1;else return;e.preventDefault()};
  addEventListener('keydown',LV.key);addEventListener('keyup',LV.key);
  LV.vis=()=>{if(document.hidden&&(LV.ph==='race'||LV.ph==='gate'))lvPause(true)};document.addEventListener('visibilitychange',LV.vis);
  lvHud();lvMenu();LV.last=0;cancelAnimationFrame(LV.raf);LV.raf=requestAnimationFrame(lvLoop)}
function lvPause(on){LV.paused=!!on;let o=$('#lvPz');if(on){LV.inp.gas=0;$('#lvGas')&&$('#lvGas').classList.remove('on');lvEng(false);if(!o){o=document.createElement('div');o.id='lvPz';o.className='gpov';o.innerHTML='<b>⏸ SZÜNET</b><span>Koppints a folytatáshoz</span>';o.onclick=()=>lvPause(false);$('#harc .lvwrap').appendChild(o)}}
  else{if(o)o.remove();if(LV.ph==='race')lvEng(true)}}
function lvClose(){if((LV.ph==='race'||LV.ph==='gate')&&!confirm('Kilépsz a futamból? A tétjeidet visszakapod.'))return;
  if((LV.ph==='race'||LV.ph==='gate')&&LV.staked>0){tkWallet(LV.staked);LV.staked=0}
  LV.tok++;LV.run=false;LV.ph=null;LV.R=null;lvEng(false);cancelAnimationFrame(LV.raf);clearTimeout(LV.endT);try{LV.ro&&LV.ro.disconnect()}catch(e){}
  if(LV.key){removeEventListener('keydown',LV.key);removeEventListener('keyup',LV.key)}document.removeEventListener('visibilitychange',LV.vis);LV.cv=null;
  const el=$('#harc');el.hidden=true;el.innerHTML='';el.classList.remove('lv');document.body.classList.remove('harcon')}
function lvHud(){const a=$('#lvPk');if(a)a.textContent=tkFmt(LV.pocket);const R=LV.R,p=$('#lvPos'),n=$('#lvAbN');
  if(p){if(R&&R.rs&&(LV.ph==='race'||LV.ph==='gate')){const me=R.rs.find(r=>r.me),pos=1+R.rs.filter(r=>r!==me&&(r.fin&&(!me.fin||r.fin<me.fin)||(!r.fin&&!me.fin&&r.x>me.x))).length;p.innerHTML=`<b>${pos}.</b> hely · <b>${Math.max(0,Math.round(R.D-me.x))}</b> m`;if(n)n.textContent='×'+me.nab}else p.textContent=''}}
function lvPanel(html,cls){const p=$('#lvPanel');if(!p)return null;p.className='lvpanel'+(cls?' '+cls:'');p.innerHTML=html;p.hidden=!html;p.scrollTop=0;return p}
function lvMenu(){LV.ph='menu';LV.run=false;$('#lvCtl').hidden=true;const s=LV.s;
  lvPanel(`<div class="hstart lvstart"><img src="${lvModel().toDataURL()}" alt="" data-st="width:100%;height:auto"><h3>TÜZÉR DERBY</h3>
   <p>Galoppfutam <b>PzH 2000</b> lövegekkel. Nézd át a programfüzetet, fogadj a <b>Kassza zsebpénzéből</b>, aztán hajtsd a saját lövegedet!</p>
   <div class="lvstats"><span>Futam <b>${s.races}</b></span><span>Győzelem <b>${s.wins}</b></span><span>Mérleg <b class="${s.net<0?'neg':'pos'}">${s.net<0?'−':'+'}${tkFmt(Math.abs(s.net))} Ft</b></span></div>
   <button class="btn pri" id="lvGoCard">▶ Programfüzet</button>
   <details class="lvhelp"><summary>Szabályok</summary>
    <p><b>Hajtás:</b> a <b>GÁZ</b>-t nyomva tartva a löveg gyorsabb, de melegszik a motor; elengedve tempót megy és hűl. Túlmelegedésnél 3 mp-re leesik a teljesítmény.</p>
    <p><b>Rajt:</b> a csengő után nyomd a gázt. Aki előbb nyomja (kiugrás), késve indul; a gyors reakció jobb rajtot ad.</p>
    <p><b>Sávok:</b> ▲ a korlát felé, ▼ kifelé. Kanyarban a belső sáv rövidebb. Más löveg mögött <b>szélárnyékban</b> kevésbé melegszel, de be is szorulhatsz mögé.</p>
    <p><b>Utánégető:</b> futamonként 3, csak a célegyenesben (az utolsó negyedben).</p>
    <p><b>Fogadás:</b> <b>Tét</b> – a löveg nyer; <b>Hely</b> – az első háromban végez. Totalizatőr: a nyeremény a közös kasszából jön, 15% levonás után; a végső osztalék a fogadás zárása után alakul ki, a kiírt szorzó csak becslés. Egy futamra legfeljebb a zsebed 10%-át teheted fel, a saját lövegedre 2%-át.</p>
    <p><b>Díjazás:</b> a saját löveged 1–3. helyéért a zsebed 1 / 0,5 / 0,25%-a jár (legalább 5 000 / 2 500 / 1 000 Ft).</p>
    <p><b>Programfüzet:</b> a málha a súlyterhelés – a jobb löveg több gránátot visz. A forma az utolsó futamok helyezése. A rajthely a sáv: az 1-es van a korlátnál.</p></details></div>`);
  $('#lvGoCard').onclick=lvCard}
const lvBar=v=>`<i><u data-st="width:${Math.round(lvClamp(v,0,1)*100)}%"></u></i>`;
function lvCard(){LV.ph='card';LV.pocket=tkWallet(0);lvHud();LV.bets={};LV.unit=LV.unit||1;const R=LV.R=lvNewRace();LV.tok++;LV.odds=false;
  const rows=R.field.map((e,i)=>{const h=e.h,f=lvForm(h.id),fav=[h.gp>=0?LV_GO[h.gp].n:'',h.dp>=0?LV_DIST[h.dp].n:''].filter(Boolean).join(', ');
    return `<div class="lvrow${h.me?' me':''}"><i class="lvno" data-st="background:${LV_COL[i]}">${i+1}</i>
     <div class="lvinf"><b>${esc(h.n)}</b><small>${LV_STY[h.sty][0]} · ${esc(h.drv)} · málha ${e.shells} db</small>
      <small>Forma: ${f.length?f.join('-'):'új'}${fav?' · kedveli: '+fav:''}</small>
      <div class="lvbars"><span>MOT${lvBar(h.mo)}</span><span>VÁL${lvBar(h.va)}</span><span>ÁLL${lvBar(h.al)}</span><span>MEGB${lvBar((h.mb-.55)/.45)}</span></div></div>
     <div class="lvod"><button type="button" data-bet="w${i}" disabled><small>TÉT</small><b>…</b></button><button type="button" data-bet="p${i}" disabled><small>HELY</small><b>…</b></button></div></div>`}).join('');
  const p=lvPanel(`<div class="lvcard"><div class="lvhd"><b>${R.no}. FUTAM</b><span>${R.dist.n} · ${R.D} m</span><span class="lvgo g${R.g}">Talaj: ${LV_GO[R.g].n}</span></div>
    <div class="lvtip" id="lvTip">Szorzók számítása…</div><div class="lvrows">${rows}</div>
    <div class="lvfoot"><div class="lvstk" id="lvStk"></div><div class="lvsum" id="lvSumL"></div><div class="lvbtns"><button class="btn line" id="lvBack">Vissza</button><button class="btn pri" id="lvGo" disabled>🔔 Rajthoz!</button></div></div></div>`,'full');
  p.onclick=e=>{const b=e.target.closest('[data-bet]'),u=e.target.closest('[data-unit]');if(b)lvBet(b.dataset.bet);else if(u){LV.unit=+u.dataset.unit;lvCardUpd()}};
  $('#lvBack').onclick=lvMenu;$('#lvGo').onclick=lvGate;lvCardUpd();
  lvOdds(R,(pw,pp)=>{if(LV.R!==R||LV.ph!=='card')return;lvPools(R,pw,pp);LV.odds=true;
    const o=pw.map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]),k=Math.random()<.65?o[0][1]:o[1+Math.floor(Math.random()*2)][1],h=R.field[k].h;
    $('#lvTip').innerHTML=`🎖️ <b>Öreg Zászlós tippje:</b> „${['Én a','Ma a','Fogadjunk, hogy a'][Math.floor(Math.random()*3)]} ${k+1}-es${h.me?' – a tiéd –':''} ${['viszi el.','lesz elöl a végén.','a nyerő.'][Math.floor(Math.random()*3)]}”`;
    lvCardUpd()})}
function lvCap(me){return Math.floor(LV.pocket*(me?.02:.1))}
function lvBet(k){const R=LV.R;if(!LV.odds)return;const i=+k.slice(1),me=!!R.field[i].h.me;
  if(LV.bets[k]){delete LV.bets[k];lvCardUpd();return}
  if(LV.pocket<1000){toast('A fogadáshoz legalább 1 000 Ft kell a zsebben – a díjazásból szerezhetsz.');return}
  let st=Math.max(100,Math.floor(LV.pocket*LV.unit/100));
  if(me){const left=lvCap(true)-lvStake('w',i)-lvStake('p',i);if(left<100){toast('A saját lövegedre legfeljebb a zsebed 2%-át teheted.');return}st=Math.min(st,left)}
  const left=lvCap(false)-lvSum();if(left<100){toast('Egy futamra legfeljebb a zsebed 10%-át teheted fel.');return}
  LV.bets[k]=Math.min(st,left);lvCardUpd()}
function lvCardUpd(){const R=LV.R;if(!R||LV.ph!=='card')return;
  document.querySelectorAll('#lvPanel [data-bet]').forEach(b=>{const k=b.dataset.bet,i=+k.slice(1),st=LV.bets[k]||0;b.disabled=!LV.odds;b.classList.toggle('on',st>0);
    if(LV.odds)b.querySelector('b').textContent='×'+lvNum(k[0]==='w'?lvDivW(R,i):lvDivP(R,i));
    let em=b.querySelector('em');if(st){if(!em){em=document.createElement('em');b.appendChild(em)}em.textContent=tkFmt(st)+' Ft'}else if(em)em.remove()});
  $('#lvStk').innerHTML='<span>Tét nagysága:</span>'+[1,2,5].map(u=>`<button type="button" data-unit="${u}" class="${LV.unit===u?'on':''}">${u}%<small>${tkFmt(Math.max(100,Math.floor(LV.pocket*u/100)))} Ft</small></button>`).join('');
  const n=Object.keys(LV.bets).length;$('#lvSumL').innerHTML=n?`Szelvény: <b>${n}</b> fogadás · <b>${tkFmt(lvSum())} Ft</b> <small>(legfeljebb ${tkFmt(lvCap(false))} Ft)</small>`:'Koppints egy szorzóra a fogadáshoz – vagy indulj fogadás nélkül.';
  $('#lvGo').disabled=!LV.odds}
// rajt: a tétek levonása, a végső (kései pénzzel módosult) kassza rögzítése, beállás a startgépbe
function lvGate(){const R=LV.R;if(!R||!LV.odds)return;const tot=lvSum();LV.staked=tot;if(tot>0)LV.pocket=tkWallet(-tot);LV.purseBase=LV.pocket+tot;
  const late=a=>{const b=a.map(x=>x*Math.exp(lvGauss(Math.random)*.1)),s=b.reduce((t,x)=>t+x,0);return b.map(x=>x/s)};R.fw=late(R.ww);R.fp=late(R.wp);
  lvSim(R,Math.random,true);LV.ph='gate';LV.run=true;LV.jump=0;LV.belled=false;LV.gateT=0;LV.bellAt=2.2+Math.random()*1.8;LV.msg=null;LV.cam=0;LV.dust=[];LV.endT=0;LV.over=0;LV.inp.gas=0;LV.inp.lane=0;LV.inp.boost=0;
  lvPanel('');$('#lvCtl').hidden=false;LV.fit();lvHud();lvMsg('KÉSZÜLJ…','#fff')}
function lvFinish(){const R=LV.R;let g=0;while(R.nfin<LV_N&&g++<3000)lvStep(R,.1,null);
  const o=lvOrder(R);o.forEach((r,i)=>{r.pl=i+1});const pl=o.slice(0,3).map(r=>r.e.idx),me=o.find(r=>r.me);
  const res=[];let pay=0;for(const k of Object.keys(LV.bets)){const t=k[0],i=+k.slice(1),st=LV.bets[k];let d=0;
    if(t==='w'&&i===pl[0])d=lvDivW(R,i,R.fw);else if(t==='p'&&pl.includes(i))d=lvDivP(R,i,pl,R.fp);
    const win=d?Math.floor(st*d):0;pay+=win;res.push({t,i,st,d,win})}
  const pb=LV.purseBase,purse=me.pl===1?Math.max(5000,pb*.01):me.pl===2?Math.max(2500,pb*.005):me.pl===3?Math.max(1000,pb*.0025):0,pr=Math.floor(purse);
  const net=pay+pr-LV.staked;LV.staked=0;if(pay+pr>0)LV.pocket=tkWallet(pay+pr);
  const s=LV.s;s.races++;if(me.pl===1)s.wins++;s.net+=net;for(const r of o){const id=r.e.h.id;s.form[id]=[...lvForm(id),r.pl].slice(-5)}lvStore();
  LV.ph='done';LV.run=false;lvEng(false);$('#lvCtl').hidden=true;lvHud();
  const w=o[0],gap=(r,q)=>{const l=(r.fin-q.fin)*w.Vn/LV_L;return l<.12?'csőszájfékkel':l<.45?'fél csőhosszal':l<.85?'egy csőhosszal':lvNum(l)+' löveghosszal'};
  const list=o.map((r,i)=>`<div class="${r.me?'me':''}"><span><i class="lvno" data-st="background:${LV_COL[r.e.idx]}">${r.e.idx+1}</i>${i+1}. ${esc(r.e.h.n)}</span><b>${i?gap(r,o[i-1]):(r.fin).toFixed(2).replace('.',',')+' mp'}</b></div>`).join('');
  const bets=res.length?res.map(b=>`<div class="${b.win?'ok':'no'}"><span>${b.t==='w'?'Tét':'Hely'} · ${b.i+1}. ${esc(R.field[b.i].h.n)} · ${tkFmt(b.st)} Ft</span><b>${b.win?'+'+tkFmt(b.win)+' Ft (×'+lvNum(b.d)+')':'nem nyert'}</b></div>`).join(''):'<div><span>Nem fogadtál erre a futamra.</span></div>';
  lvPanel(`<div class="hover lvres"><h3>${me.pl===1?'🏆 GYŐZELEM!':me.pl<=3?'🥉 DOBOGÓ!':me.pl+'. HELY'}</h3>
    <div class="hboard lvord"><div class="lbl">Befutó</div>${list}</div>
    <div class="hboard lvbets"><div class="lbl">Szelvény</div>${bets}${pr?`<div class="ok"><span>Díjazás (${me.pl}. hely)</span><b>+${tkFmt(pr)} Ft</b></div>`:''}</div>
    <p class="lvnet ${net<0?'neg':'pos'}">Futam mérlege: <b>${net<0?'−':'+'}${tkFmt(Math.abs(net))} Ft</b><br><small>Zseb: ${tkFmt(LV.pocket)} Ft</small></p>
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

/* ---------- rajzolás ---------- */
function lvGeom(){const W=LV.W,H=LV.H,mm=34,top=mm+Math.max(64,H*.15),ctl=170,lh=lvClamp((H-top-ctl)/LV_N,22,46),sw=lh*3.8,s=sw/LV_L;return {W,H,mm,top,lh,bot:top+lh*LV_N,sw,sh:sw*LV_MH/LV_MW,s}}
function lvDraw(dt){const cv=LV.cv;if(!cv||!LV.W)return;const c=cv.getContext('2d'),G=lvGeom(),{W,H,mm,top,lh,bot,sw,sh,s}=G,R=LV.R,live=R&&R.rs&&(LV.ph==='gate'||LV.ph==='race'||LV.ph==='done');
  c.setTransform(LV.dpr,0,0,LV.dpr,0,0);
  const me=live?R.rs.find(r=>r.me):null,D=R?R.D:600,g=R?R.g:0;
  if(me){const tx=me.x-(W*.36)/s;LV.cam+=(tx-LV.cam)*Math.min(1,dt*6)}else LV.cam=(LV.cam||0)+dt*6;
  const cam=LV.cam,X=x=>(x-cam)*s;
  // ég, lelátó
  const sk=c.createLinearGradient(0,0,0,top);sk.addColorStop(0,'#6fb7ea');sk.addColorStop(1,'#d8efff');c.fillStyle=sk;c.fillRect(0,0,W,top);
  const px=-((cam*s*.45)%220);for(let x=px-220;x<W+220;x+=220){c.fillStyle='#2f5a2a';c.beginPath();c.arc(x+40,top-6,26,Math.PI,0);c.arc(x+84,top-6,34,Math.PI,0);c.fill();
    c.fillStyle='#e9e4d4';c.fillRect(x+120,top-34,84,34);c.fillStyle='#b23a2e';c.beginPath();c.moveTo(x+114,top-34);c.lineTo(x+162,top-52);c.lineTo(x+210,top-34);c.fill();
    c.fillStyle='rgba(40,30,30,.55)';for(let k=0;k<9;k++)c.fillRect(x+124+k*9,top-14-(k*7%5),5,12)}
  // pálya
  for(let i=0;i<LV_N;i++){c.fillStyle=LV_GO[g].c[i%2];c.fillRect(0,top+i*lh,W,lh)}
  c.fillStyle='#3a3020';c.fillRect(0,bot,W,H-bot);
  if(R){for(const z of R.cz){const a=X(z[0]*D),b=X(z[1]*D);if(b<0||a>W)continue;c.fillStyle='rgba(255,220,90,.13)';c.fillRect(a,top,b-a,bot-top);c.fillStyle='rgba(255,230,120,.9)';c.font='700 11px system-ui';c.textAlign='left';for(let x=Math.max(a,a+((cam*s)%1));x<b;x+=150){if(x>-80&&x<W)c.fillText('↻ KANYAR',x+8,bot+14)}}
    c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1;for(let i=1;i<LV_N;i++){c.beginPath();c.moveTo(0,top+i*lh);c.lineTo(W,top+i*lh);c.stroke()}
    c.font='700 10px system-ui';c.textAlign='center';for(let m=Math.max(0,Math.ceil(cam/50)*50);m<cam+W/s&&m<D;m+=50){const x=X(m);c.fillStyle='rgba(255,255,255,.28)';c.fillRect(x,top,1.5,bot-top);if(m%100===0){c.fillStyle='rgba(255,255,255,.75)';c.fillText((D-m)+' m',x,bot+26)}}
    const hs=X(D*.72);if(hs>-4&&hs<W){c.fillStyle='rgba(255,90,78,.85)';c.fillRect(hs,top,3,bot-top);c.fillStyle='#ffb0a8';c.textAlign='left';c.fillText('CÉLEGYENES',hs+6,top+10)}
    const fx=X(D);if(fx>-30&&fx<W+30){const q=lh/4;for(let y=top,k=0;y<bot;y+=q,k++)for(let j=0;j<2;j++){c.fillStyle=(k+j)%2?'#fff':'#111';c.fillRect(fx+j*q,y,q,q)}c.fillStyle='#fff';c.fillRect(fx-2,top-40,3,40);c.fillStyle='#e63946';c.fillRect(fx+1,top-40,26,16);c.fillStyle='#fff';c.font='900 11px system-ui';c.textAlign='left';c.fillText('CÉL',fx+3,top-28)}}
  // korlát
  c.fillStyle='#fff';c.fillRect(0,top-3,W,3);for(let x=-((cam*s)%40);x<W;x+=40)c.fillRect(x,top-3,3,9);
  if(live){// startgép
    const gx=X(.8),open=LV.ph==='gate'&&!LV.belled?0:Math.min(1,(R.t||0)/.35);if(gx>-60&&gx<W+60){c.fillStyle='#8a8f96';c.fillRect(gx-2,top-16,5,bot-top+18);for(let i=0;i<LV_N;i++){c.fillStyle='#5b6068';c.fillRect(gx-sw*.08,top+i*lh,sw*.08,3);if(open<1){c.fillStyle='rgba(230,57,70,.9)';c.fillRect(gx,top+i*lh+3,4,(lh-6)*(1-open))}}}
    // por
    if(!LOWFX){for(const r of R.rs){if(r.v>3&&Math.random()<dt*r.v*.9)LV.dust.push({x:r.x-LV_L*.45,y:top+(r.lf+.78)*lh,t:0,r:3+Math.random()*4})}
      c.fillStyle=g===2?'rgba(70,52,30,.5)':'rgba(214,196,150,.45)';LV.dust=LV.dust.filter(d=>{d.t+=dt;if(d.t>.7)return false;const x=X(d.x);if(x>-20&&x<W+20){c.globalAlpha=1-d.t/.7;c.beginPath();c.arc(x,d.y-d.t*10,d.r+d.t*12,0,7);c.fill()}return true});c.globalAlpha=1;if(LV.dust.length>160)LV.dust.splice(0,LV.dust.length-160)}
    // lövegek (a felső sáv van hátul)
    for(const r of R.rs.slice().sort((a,b)=>a.lf-b.lf)){const x=X(r.x),y=top+(r.lf+.9)*lh,i=r.e.idx;if(x<-sw*1.2||x>W+sw*.3)continue;
      const bob=r.v>1?Math.sin(R.t*22+i)*1.1:0,x0=x-sw,y0=y-sh+bob;
      c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x-sw*.55,y+1,sw*.38,lh*.09,0,0,7);c.fill();
      c.drawImage(lvModel(),x0,y0,sw,sh);
      const cw=Math.max(15,sw*.12),ch=Math.max(13,sh*.36);c.fillStyle=LV_COL[i];c.strokeStyle='#111';c.lineWidth=1.5;c.beginPath();c.rect(x0+sw*.035,y0+sh*.15,cw,ch);c.fill();c.stroke();
      c.fillStyle='#111';c.font=`900 ${Math.round(ch*.82)}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText(i+1,x0+sw*.035+cw/2,y0+sh*.15+ch/2+.5);c.textBaseline='alphabetic';
      if(r.me){c.fillStyle='#ffd23a';c.strokeStyle='#111';c.lineWidth=3;c.font='900 12px system-ui';c.strokeText('▼ TE',x0+sw*.2,y0-3);c.fillText('▼ TE',x0+sw*.2,y0-3);
        if(r.ab>0){c.fillStyle='#ff8a1e';c.beginPath();c.moveTo(x0+4,y0+sh*.5);c.lineTo(x0-18-Math.random()*14,y0+sh*.56);c.lineTo(x0+4,y0+sh*.66);c.fill()}}
      if((r.failT>0&&r.failT<3.5)||(r.me&&r.cut>0)){c.fillStyle='rgba(30,30,30,.55)';for(let k=0;k<3;k++){c.beginPath();c.arc(x0+sw*.2-k*9,y0-4-k*8-(R.t*30%8),6+k*3,0,7);c.fill()}}}
    // mini-térkép
    c.fillStyle='rgba(10,20,12,.82)';c.fillRect(0,0,W,mm);const mx=x=>14+(W-28)*lvClamp(x/D,0,1.02);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(14,15,W-28,4);
    for(const z of R.cz){c.fillStyle='rgba(255,220,90,.45)';c.fillRect(mx(z[0]*D),15,mx(z[1]*D)-mx(z[0]*D),4)}c.fillStyle='#fff';c.fillRect(mx(D)-1,6,2,22);
    for(const r of R.rs.slice().sort((a,b)=>(a.me?1:0)-(b.me?1:0))){const x=mx(r.x),rr=r.me?8:6;c.fillStyle=LV_COL[r.e.idx];c.strokeStyle=r.me?'#fff':'#111';c.lineWidth=r.me?2:1;c.beginPath();c.arc(x,17,rr,0,7);c.fill();c.stroke();c.fillStyle='#111';c.font=`900 ${r.me?10:8}px system-ui`;c.textAlign='center';c.fillText(r.e.idx+1,x,r.me?20.5:20)}
    // motorhő, sebesség
    if(me&&LV.ph!=='done'){const bx=14,by=bot+38,bw=W-28;c.fillStyle='rgba(0,0,0,.5)';c.fillRect(bx,by,bw,12);const hh=lvClamp(me.heat,0,1);c.fillStyle=me.cut>0?'#ff3b30':hh>.8?'#ff7a1e':hh>.55?'#ffd23a':'#3ccf6a';c.fillRect(bx,by,bw*hh,12);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1;c.strokeRect(bx,by,bw,12);
      c.fillStyle='#fff';c.font='800 11px system-ui';c.textAlign='left';c.fillText(me.cut>0?'MOTORHŐ – TÚLMELEGEDETT!':'MOTORHŐ',bx,by-4);c.textAlign='right';c.fillText(Math.round(me.v*3.6)+' km/h'+(me.slip?' · SZÉLÁRNYÉK':''),bx+bw,by-4)}}
  // üzenet
  const m=LV.msg;if(m){m.t+=dt;if(m.t>1.6)LV.msg=null;else{c.save();c.globalAlpha=Math.min(1,(1.6-m.t)*3);c.font='400 30px Bangers, Impact, sans-serif';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#111';c.lineJoin='round';const y=top+lh*.2+Math.max(0,.25-m.t)*40;let fs=30;while(fs>14&&c.measureText(m.s).width>W-20){fs-=2;c.font=`400 ${fs}px Bangers, Impact, sans-serif`}c.strokeText(m.s,W/2,y);c.fillStyle=m.col;c.fillText(m.s,W/2,y);c.restore()}}}

/* ---------- főciklus ---------- */
function lvLoop(now){LV.raf=requestAnimationFrame(lvLoop);if(!LV.cv)return;let dt=Math.min(.05,(now-(LV.last||now))/1000);LV.last=now;if(LV.paused)dt=0;
  const R=LV.R;
  if(LV.ph==='gate'&&dt>0){LV.gateT+=dt;if(!LV.belled&&LV.gateT>=LV.bellAt){LV.belled=true;LV.ph='race';R.t=0;lvSnd('bell');lvEng(true);if(LV.jump)lvMsg('KIUGRÁS! Késve indulsz.','#ff5a4e');else lvMsg('RAJT!','#7dff8a')}}
  if(LV.ph==='race'&&dt>0){lvStep(R,dt,LV.inp);const me=R.rs.find(r=>r.me);lvEngSet(me.v,LV.inp.gas&&!me.fin);LV.hudT=(LV.hudT||0)+dt;if(LV.hudT>.2){LV.hudT=0;lvHud()}
    if(me.fin&&!LV.over){LV.over=R.t;lvSnd('fin');const o=lvOrder(R);if(o[1]&&o[1].fin&&o[1].fin-o[0].fin<.12)lvMsg('CÉLFOTÓ!','#fff');else lvMsg('CÉLBAN!','#ffd23a')}
    if((LV.over&&R.t>LV.over+1.8)||R.t>R.D/LV_V*1.9)lvFinish()}
  lvDraw(dt)}
lvLoop=medveWrap(lvLoop,LV,'DERBY');
export {LV,lvOpen};
