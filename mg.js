// M.E.D.V.E. Arcade – mg.js modul: MEAT GRINDER (Húsdaráló).
// Az app.js tölti be lustán (lazyMod('mg')), a közös segédeket onnan veszi át.
// Részletes leírás, hangolási táblák és bővítési útmutató: docs/meat-grinder.md
import {$,AC,MASTER,NOISE,SOUND,LOWFX,ac,boom,snare,esc,n0,toast,medveWrap,rockStart,rockStop,playCount,gSave,gBoard,D_WHEELS,PK,PCX,PBY,drBodyImg,drBarrelImg} from './app.js';
import {monSprite} from './mgmon.js';

/* ============================================================================
   1. ALAPÁLLANDÓK
   1 m = 10 világegység. A képernyő y lefelé nő, a talaj magassága így negatív = magasabb.
   ============================================================================ */
const UM = 10;              // egység / méter
const STEP = 16;            // talaj-mintavétel (egység)
const GRAV = 300;           // gravitáció (egység/s²)
const SAVE_KEY = 'medve-mg-v1';
const VER = 2;

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }

/* ============================================================================
   2. FEJLESZTÉSEK – minden kategória szintenként: név, leírás, ár (kupak), feltétel (legnagyobb táv, m)
   és a hozzá tartozó számértékek (s: stat). Új szint = új elem a lv tömbben, ennyi.
   ============================================================================ */
const UPG = [
  {k: 'motor', n: 'Motor', ic: '⚙️', lv: [
    {n: 'MTU MT 881 (gyári)', d: 'Fáradt, 1000 LE-s dízel.', s: {f: 1, v: 150}},
    {n: 'Egyenes kipufogók', d: 'Levágott dobok, hangos és dühös. +18% erő.', c: 160, s: {f: 1.18, v: 172}},
    {n: 'Turbófeltöltő', d: 'Roncstelepi turbó, drótozva. +40% erő.', c: 520, r: 350, s: {f: 1.4, v: 200}},
    {n: 'Iker-turbó + intercooler', d: 'Két turbó, hűtőrács a tornyon.', c: 1500, r: 900, s: {f: 1.68, v: 235}},
    {n: 'Kompresszoros szörny', d: 'Tetőből kiálló feltöltő, ékszíjjal.', c: 4200, r: 2000, s: {f: 2.05, v: 280}}]},
  {k: 'futomu', n: 'Futómű', ic: '🛞', lv: [
    {n: 'Kopott lánctalp', d: 'Gyári felfüggesztés, csúszik.', s: {g: .85, cr: 0, tl: 1}},
    {n: 'Új lánctagok', d: 'Jobb tapadás emelkedőn.', c: 140, s: {g: 1, cr: .15, tl: 1.12}},
    {n: 'Tüskés lánctalp', d: 'Acéltüskék a tagokon. Nagy tapadás.', c: 480, r: 300, s: {g: 1.15, cr: .28, tl: 1.25}},
    {n: 'Megerősített torziós rudak', d: 'Bírja az ugratásokat.', c: 1300, r: 800, s: {g: 1.28, cr: .42, tl: 1.38}},
    {n: 'Versenyfutómű', d: 'Gázrugók, tökéletes levegő-irányítás.', c: 3600, r: 1800, s: {g: 1.42, cr: .55, tl: 1.55}}]},
  {k: 'tank', n: 'Üzemanyag', ic: '⛽', lv: [
    {n: 'Gyári tartály (maradék)', d: 'Alig valami lötyög benne.', s: {l: 60}},
    {n: '2 kanna a farokon', d: '+30 liter.', c: 120, s: {l: 90}},
    {n: 'Hordó + kannák', d: '+70 liter.', c: 420, r: 250, s: {l: 130}},
    {n: 'Tetőre szíjazott hordók', d: '+120 liter.', c: 1150, r: 700, s: {l: 180}},
    {n: 'Külső póttartály', d: 'Hegesztett, ronda, hatalmas. +190 liter.', c: 3200, r: 1600, s: {l: 250}}]},
  {k: 'pancel', n: 'Páncélzat', ic: '🛡️', lv: [
    {n: 'Gyári páncél (rozsdás)', d: '100 szerkezeti pont.', s: {hp: 100, dr: 0}},
    {n: 'Hegesztett lemezek', d: '150 pont, -10% sérülés.', c: 180, s: {hp: 150, dr: .1}},
    {n: 'Rácspáncél-ketrec', d: '210 pont, -20% sérülés.', c: 600, r: 400, s: {hp: 210, dr: .2}},
    {n: 'Sínacél + gumiköpeny', d: '280 pont, -30% sérülés.', c: 1700, r: 1000, s: {hp: 280, dr: .3}},
    {n: 'Guruló erőd', d: '360 pont, -40% sérülés, tetőtüskék.', c: 4600, r: 2200, s: {hp: 360, dr: .4}}]},
  {k: 'elol', n: 'Orr-előtét', ic: '🔪', lv: [
    {n: 'Csupasz orr', d: 'A test maga üt. Kicsi sebzés, nagy fékeződés.', s: {m: 1, dps: 0, sr: 0, ext: 0, fp: 0}},
    {n: 'Tolólap (dózer)', d: '×1,4 ütés, -25% lassulás.', c: 220, s: {m: 1.4, dps: 15, sr: .25, ext: 12, fp: .2}},
    {n: 'Tüskés eke', d: '×1,8 ütés, folyamatos szúrás.', c: 700, r: 450, s: {m: 1.8, dps: 55, sr: .38, ext: 16, fp: .3}},
    {n: 'Kombájn-tálca', d: '×2,4 ütés, forgó motolla – behúzza őket.', c: 1900, r: 1100, s: {m: 2.4, dps: 140, sr: .52, ext: 26, fp: .4}},
    {n: 'HÚSDARÁLÓ (iker-dob)', d: '×3 ütés, két fűrészdob. Ledarál mindent.', c: 5200, r: 2300, s: {m: 3, dps: 300, sr: .68, ext: 30, fp: .55}}]},
  {k: 'oldal', n: 'Oldalvédelem', ic: '🌵', lv: [
    {n: 'Nincs', d: 'A zombik könnyen felkapaszkodnak.', s: {dps: 0, gr: 0}},
    {n: 'Szögesdrót-tekercs', d: 'Sebzi a kapaszkodókat, -30% felmászás.', c: 150, s: {dps: 14, gr: .3}},
    {n: 'Oldaltüskék', d: 'Hegyes vasak a lánctalp-kötényen.', c: 560, r: 350, s: {dps: 42, gr: .5}},
    {n: 'Láncfűrész-sor', d: 'Körbefutó fűrészlánc. Senki nem marad rajta.', c: 1800, r: 1200, s: {dps: 110, gr: .75}}]},
  {k: 'agyu', n: 'Fő fegyver', ic: '💥', lv: [
    {n: '155 mm – lőszer nélkül', d: 'A cső be van dugva. Dísznek szép.', s: {am: 0, rl: 9, dm: 0, rad: 0}},
    {n: '2 db DM121 gránát', d: 'TŰZ gomb: hordákat tép szét.', c: 260, s: {am: 2, rl: 8, dm: 320, rad: 115}},
    {n: '3 gránát, kézi töltés', d: 'Gyorsabb töltés.', c: 800, r: 500, s: {am: 3, rl: 6.5, dm: 400, rad: 130}},
    {n: '5 gránát, automata töltő', d: 'Nagyobb robbanás.', c: 2100, r: 1200, s: {am: 5, rl: 5, dm: 480, rad: 150}},
    {n: '8 gránát, MRSI-sorozat', d: 'Szőnyeg-tűz a horda közepébe.', c: 5000, r: 2400, s: {am: 8, rl: 3.5, dm: 600, rad: 180}},
    {n: '20 gránát, forgótáras tár', d: 'Tartsd nyomva a TŰZ gombot: folyamatos sorozat (kb. 1 lövés / 1,4 mp).', c: 9000, r: 2500, s: {am: 20, rl: 1.4, dm: 650, rad: 190}},
    {n: '60 gránát – automata ágyú', d: '60 db gránát, kb. 2 lövés/mp sorozattűz. Hordaírtó.', c: 16000, r: 2800, s: {am: 60, rl: .5, dm: 720, rad: 200}}]},
  {k: 'gepp', n: 'Kiegészítő fegyver', ic: '🔫', lv: [
    {n: 'Nincs', d: 'A parancsnoki kupola üres.', s: {rt: 0, dm: 0, rg: 0}},
    {n: 'FN MAG géppuska', d: 'Automatikusan lő az elöl lévőkre.', c: 240, s: {rt: 7, dm: 7, rg: 480}},
    {n: 'Iker MAG', d: 'Két cső, dupla tűzgyorsaság.', c: 760, r: 450, s: {rt: 13, dm: 7, rg: 500}},
    {n: 'M2HB 12,7 mm', d: 'Nehézgéppuska, átüti a páncélosokat.', c: 2000, r: 1200, s: {rt: 8, dm: 17, rg: 620}},
    {n: 'Forgócsöves minigun', d: 'Fémeső.', c: 4800, r: 2200, s: {rt: 24, dm: 10, rg: 640}}]},
  {k: 'boost', n: 'Rakétahajtás', ic: '🚀', lv: [
    {n: 'Nincs', d: 'Csak a motor tol.', s: {cap: 0, th: 0}},
    {n: 'JATO rakéta', d: '3 mp tolóerő, ugratáshoz.', c: 380, r: 200, s: {cap: 3, th: 1}},
    {n: 'Iker rakéta', d: '5 mp, erősebb.', c: 1300, r: 800, s: {cap: 5, th: 1.25}},
    {n: 'Utánégető-köteg', d: '7,5 mp, repülés majdnem.', c: 3800, r: 1900, s: {cap: 7.5, th: 1.5}}]},
  {k: 'lang', n: 'Lángszóró', ic: '🔥', lv: [
    {n: 'Nincs', d: 'Nincs lángszóró.', s: {fl: 0, fr: 0, fd: 0}},
    {n: 'Gyújtó-lángszóró', d: 'Rövid lángcsóva az orr fölé (LÁNG gomb / G). A zombik égve rohangálnak és gyújtják egymást.', c: 700, r: 300, s: {fl: 6, fr: 150, fd: 55}},
    {n: 'Tartályos lángszóró', d: 'Nagyobb tartály, hosszabb láng.', c: 2000, r: 900, s: {fl: 10, fr: 210, fd: 95}},
    {n: 'Napalm-fúvóka', d: 'Ragadós, tovább égő láng. 15 mp tüzelés.', c: 4400, r: 1800, s: {fl: 15, fr: 270, fd: 150}},
    {n: 'Sárkánytorok', d: 'Hatalmas lángcsóva, ami él, az ég.', c: 7800, r: 2600, s: {fl: 22, fr: 340, fd: 230}}]},
  {k: 'lezer', n: 'Lézer', ic: '🔴', lv: [
    {n: 'Nincs', d: 'Nincs lézer.', s: {nb: 0, dps: 0, rg: 0, pi: 0}},
    {n: 'Diódás lézer', d: 'Automatikusan a legközelebbi ellenfelet égeti.', c: 900, r: 500, s: {nb: 1, dps: 60, rg: 330, pi: 0}},
    {n: 'Impulzus-lézer', d: 'Átvág a soron: a sugár útjában minden ellenfelet éget.', c: 2600, r: 1200, s: {nb: 1, dps: 115, rg: 420, pi: 1}},
    {n: 'Iker-lézer', d: 'Két sugár, két célpont.', c: 5400, r: 2000, s: {nb: 2, dps: 170, rg: 480, pi: 1}},
    {n: 'Plazma-lézer', d: 'Három átható sugár: a horda szétolvad.', c: 9000, r: 2700, s: {nb: 3, dps: 250, rg: 560, pi: 1}}]},
  {k: 'torony', n: 'Automata torony', ic: '🎯', lv: [
    {n: 'Nincs', d: 'Nincs torony.', s: {rt: 0, dm: 0, rg: 0, nb: 0}},
    {n: 'Tetőtorony – géppuska', d: 'Automata, 360°-ban lő: a rád mászókat is leszedi.', c: 800, r: 400, s: {rt: 6, dm: 8, rg: 360, nb: 1}},
    {n: 'Iker automata', d: 'Gyorsabb, két csővel.', c: 2200, r: 1000, s: {rt: 11, dm: 10, rg: 430, nb: 1}},
    {n: 'Gatling-torony', d: 'Forgócsöves, 20 lövés/mp.', c: 4800, r: 1800, s: {rt: 20, dm: 12, rg: 500, nb: 2}},
    {n: 'Páncéltörő iker-gatling', d: 'Két gatling, átüti a rohamzombik pajzsát is.', c: 8200, r: 2600, s: {rt: 30, dm: 15, rg: 580, nb: 2}}]}
];
const UPK = Object.fromEntries(UPG.map(u => [u.k, u]));

/* ============================================================================
   3. PÁLYÁK – hossz (m), mag, színek és ellenség-keverék. Az ellenség-súlyok a távval nőnek.
   ============================================================================ */
const STAGES = [
  {n: 'Kiürített külváros', s: 'A város széle. Csoszogók és futók.', len: 1200, seed: 1101, amp: [36, 16, 6],
    sky: ['#2b0d0a', '#7a2a12', '#d9772f', '#f2b45a'], far: '#3a1a14', mid: '#24130f', gr: ['#4a3a2a', '#2a2018'], road: '#2e2a26',
    feat: 1.0, horde: [320, 640, 950, 1120], hsz: [14, 22], mix: [['walker', 6], ['runner', 2], ['bloater', .6], ['spitter', .3], ['lurker', .9], ['hound', .8]], bonus: 400},
  {n: 'Rozsdaövezet', s: 'Gyárak, martalóc katonák, puffadtak.', len: 2000, seed: 2207, amp: [62, 24, 8],
    sky: ['#14110c', '#3b3a1c', '#8a7a34', '#c9b45e'], far: '#26261a', mid: '#18180f', gr: ['#47402e', '#25221a'], road: '#2a2924',
    feat: 1.3, horde: [300, 700, 1050, 1400, 1700, 1900], hsz: [18, 30], mix: [['walker', 5], ['runner', 3], ['bloater', 1.4], ['spitter', 1], ['soldier', 1.3], ['riot', .8], ['lurker', 1.2], ['hound', 1.4], ['spider', .8], ['snail', .6], ['cyborg', .6]], brute: [1500], bonus: 900},
  {n: 'Fertőzött laktanya', s: 'A menedék a laktanya mögött. Óriások.', len: 3000, seed: 3313, amp: [95, 34, 10],
    sky: ['#05060c', '#1c1630', '#5a2a4a', '#b8484a'], far: '#1a1424', mid: '#100c16', gr: ['#3a3434', '#1c1a1c'], road: '#262428',
    feat: 1.6, horde: [350, 800, 1200, 1600, 2000, 2350, 2700, 2900], hsz: [24, 40], mix: [['walker', 4], ['runner', 4], ['bloater', 1.6], ['spitter', 1.4], ['soldier', 1.6], ['riot', 1.4], ['brute', .25], ['lurker', 1.4], ['hound', 1.6], ['spider', 1.3], ['snail', 1], ['cyborg', 1.2], ['kraken', .5], ['twin', .6], ['tower', .12]], brute: [1300, 2200, 2800], bonus: 2000}
];

/* ============================================================================
   4. ELLENSÉGEK – hp: életerő, spd: sebesség (egység/s), m: tömeg (lassítás), h: magasság,
   dps: kapaszkodva sebzés/s, gb: felmászási hajlam, p: pont, c: kupak, bl: vér színe.
   ============================================================================ */
const ZT = {
  walker: {n: 'Csoszogó', hp: 62, spd: [12, 24], m: 70, h: 44, w: 14, dps: 2.4, gb: .35, p: 10, c: 4, bl: '#7a0606'},
  runner: {n: 'Futó', hp: 44, spd: [80, 115], m: 60, h: 42, w: 12, dps: 3.4, gb: .75, p: 15, c: 6, bl: '#8a0808', leap: 1},
  bloater: {n: 'Puffadt', hp: 120, spd: [8, 14], m: 150, h: 50, w: 26, dps: 0, gb: 0, p: 25, c: 10, bl: '#6f8a12', big: 1.5},
  spitter: {n: 'Köpködő', hp: 70, spd: [14, 22], m: 70, h: 46, w: 14, dps: 3, gb: .2, p: 22, c: 9, bl: '#5a7a08', rng: 'acid', stand: 1},
  soldier: {n: 'Martalóc katona', hp: 75, spd: [0, 0], m: 85, h: 46, w: 14, dps: 0, gb: 0, p: 30, c: 14, bl: '#8a0808', rng: 'gun', stand: 1},
  riot: {n: 'Rohamzombi', hp: 230, spd: [16, 26], m: 120, h: 48, w: 18, dps: 4, gb: .2, p: 40, c: 20, bl: '#6a0505', bar: 1},
  brute: {n: 'Óriás', hp: 800, spd: [18, 26], m: 700, h: 92, w: 40, dps: 0, gb: 0, p: 160, c: 80, bl: '#5a0404', wall: 1, big: 2.2, bar: 1},
  // az ALONE IN THE CORRIDOR: 1000 DAYS szörnyei (pixel-art sprite-ok: mgmon.js)
  lurker: {n: 'Nyurga', hp: 150, spd: [70, 100], m: 90, h: 68, w: 16, dps: 4, gb: .6, p: 36, c: 16, bl: '#7a0606', mon: 1},
  hound: {n: 'Bőrtelen Kopó', hp: 58, spd: [130, 185], m: 55, h: 30, w: 16, dps: 4.5, gb: .7, p: 18, c: 8, bl: '#8a0808', mon: 1, leap: 1},
  spider: {n: 'Pókanya', hp: 150, spd: [80, 115], m: 100, h: 52, w: 24, dps: 5, gb: .9, p: 40, c: 20, bl: '#4a1a0a', mon: 1, leap: 1},
  snail: {n: 'Csigaszörny', hp: 260, spd: [10, 18], m: 260, h: 50, w: 30, dps: 3, gb: 0, p: 46, c: 26, bl: '#5f8a17', mon: 1, rng: 'acid', big: 1.3, bar: 1},
  cyborg: {n: 'Kiborg-Bio', hp: 175, spd: [30, 46], m: 120, h: 64, w: 18, dps: 3, gb: .15, p: 48, c: 28, bl: '#8a0808', mon: 1, rng: 'gun', bar: 1},
  kraken: {n: 'Polip-Isten', hp: 380, spd: [14, 22], m: 300, h: 76, w: 34, dps: 0, gb: 0, p: 80, c: 45, bl: '#1f6b5a', mon: 1, rng: 'acid', big: 1.6, bar: 1},
  twin: {n: 'Sziámi Iker', hp: 240, spd: [24, 38], m: 160, h: 70, w: 24, dps: 4, gb: .25, p: 52, c: 30, bl: '#8a0808', mon: 1, big: 1.2, bar: 1, split: 1},
  tower: {n: 'Hústorony', hp: 1100, spd: [10, 16], m: 900, h: 124, w: 34, dps: 0, gb: 0, p: 200, c: 100, bl: '#5a0404', mon: 1, wall: 1, big: 2.4, bar: 1}
};

/* ============================================================================
   5. ÁLLAPOT, MENTÉS
   ============================================================================ */
const MG = {raf: 0, run: false};
function blankSave() { return {v: VER, cash: 0, up: Object.fromEntries(UPG.map(u => [u.k, 0])), best: [0, 0, 0], done: [0, 0, 0], unl: 1, tot: 0, runs: 0, kills: 0, stage: 0} }
function load() {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') } catch (e) {}
  const b = blankSave(); if (!s || typeof s !== 'object') return b;
  const o = Object.assign(b, s); o.up = Object.assign(blankSave().up, s.up || {});
  for (const u of UPG) o.up[u.k] = clamp(o.up[u.k] | 0, 0, u.lv.length - 1);
  o.cash = Math.max(0, Math.floor(+o.cash || 0)); o.unl = clamp(o.unl | 0, 1, STAGES.length); o.stage = clamp(o.stage | 0, 0, o.unl - 1);
  for (const k of ['best', 'done']) if (!Array.isArray(o[k])) o[k] = [0, 0, 0];
  return o;
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(MG.sv)) } catch (e) {} }
const ST = k => UPK[k].lv[MG.sv.up[k]].s;   // aktuális stat
const bestAll = () => Math.max(...MG.sv.best);

/* ============================================================================
   6. PÁLYAÉPÍTÉS: talaj, akadályok, ellenség-ütemterv
   ============================================================================ */
function buildStage(si) {
  const S = STAGES[si], R = mulberry(S.seed), L = S.len * UM + 1400, N = Math.ceil(L / STEP) + 4;
  const g = new Float32Array(N), P = [R() * 6, R() * 6, R() * 6];
  for (let i = 0; i < N; i++) {
    const x = i * STEP, k = clamp((x - 400) / 900, 0, 1);
    g[i] = -k * (S.amp[0] * Math.sin(x * .0011 + P[0]) + S.amp[1] * Math.sin(x * .0037 + P[1]) + S.amp[2] * Math.sin(x * .011 + P[2]));
  }
  const wrecks = [], props = [], spawns = [], deco = [];
  // domborzati elemek: rámpa, kráter, roncshalom, betonpad
  let x = 900;
  while (x < S.len * UM - 300) {
    const t = R(), i0 = Math.floor(x / STEP);
    if (t < .32) { // rámpa: lassú emelkedő, majd hirtelen leszakad
      const H = 40 + R() * 60 * S.feat, n = Math.max(14 + Math.floor(R() * 10), Math.ceil(H / (STEP * .42)));
      for (let k = 0; k <= n; k++) g[i0 + k] -= H * k / n;
      deco.push({k: 'ramp', x: (i0 + n) * STEP, h: H});
    } else if (t < .52) { // kráter
      const n = 14 + Math.floor(R() * 8), D = 22 + R() * 26 * S.feat;
      for (let k = 0; k <= n; k++) g[i0 + k] += D * Math.sin(Math.PI * k / n);
      deco.push({k: 'crater', x: x + n * STEP / 2});
    } else if (t < .78) { // roncsautó-halom: rá lehet hajtani
      const cars = 1 + Math.floor(R() * (si + 2)), w = 50 + cars * 16, n = Math.ceil(w / STEP) + 2, H = 16 + cars * 12;
      for (let k = 0; k <= n; k++) g[i0 + k] -= H * Math.pow(Math.sin(Math.PI * k / n), .6);
      wrecks.push({x: x + n * STEP / 2, w, cars, seed: Math.floor(R() * 1e6), c: ['#6a2f22', '#3d4a52', '#7a6a3a', '#4a4a44', '#5a1f1f'][Math.floor(R() * 5)]});
    } else { // barikád / hordók / kannák – nem domborzat, hanem tárgy
      const kk = R();
      props.push(kk < .45 ? {k: 'barr', x, hp: 120 + si * 90, w: 26, h: 34, kind: R() < .5 ? 'sand' : 'wood'} : kk < .75 ? {k: 'boom', x, w: 14, h: 20} : {k: 'fuel', x, w: 14, h: 18});
    }
    x += (900 + R() * 1300) / S.feat;
  }
  // kupakládák és kannák elszórva
  for (let m = 220; m < S.len; m += 160 + R() * 180) props.push(R() < .55 ? {k: 'fuel', x: m * UM, w: 14, h: 18} : {k: 'cash', x: m * UM, w: 16, h: 14, v: 20 + Math.floor(R() * 25) + si * 15});
  // ellenség-ütemterv
  const wsum = S.mix.reduce((a, b) => a + b[1], 0);
  const pickT = (dm) => { let r = R() * wsum; for (const [k, w] of S.mix) { const ww = (k === 'brute' || k === 'kraken') && dm < 900 || k === 'tower' && dm < 1400 ? 0 : w; if ((r -= ww) <= 0) return k } return 'walker' };
  for (let m = 45; m < S.len; m += 14 + R() * 26 / (1 + si * .25)) {
    const n = 1 + Math.floor(R() * (2 + si + m / 600));
    for (let j = 0; j < n; j++) spawns.push({x: m * UM + j * rnd(12, 30), t: pickT(m)});
  }
  for (const hm of S.horde) { // horda: sűrű tömeg, előtte figyelmeztetés
    const n = Math.floor(lerp(S.hsz[0], S.hsz[1], R())), w = n * 9;
    for (let j = 0; j < n; j++) spawns.push({x: hm * UM + R() * w, t: R() < .7 ? (R() < .6 ? 'walker' : 'runner') : pickT(hm), horde: 1});
    deco.push({k: 'warn', x: hm * UM - 650});
  }
  for (const bm of S.brute || []) spawns.push({x: bm * UM, t: 'brute'});
  // katonák barikád mögött
  if (si >= 1) for (let m = 500; m < S.len - 100; m += 380 + R() * 300) { props.push({k: 'barr', x: m * UM, hp: 260, w: 30, h: 38, kind: 'sand'}); spawns.push({x: m * UM + 40, t: 'soldier'}, {x: m * UM + 70, t: 'soldier'}) }
  for (let pass = 0; pass < 2; pass++) { let pv = g[0]; for (let i = 1; i < N - 1; i++) { const cur = g[i]; g[i] = (pv + 2 * cur + g[i + 1]) / 4; pv = cur } }
  spawns.sort((a, b) => a.x - b.x); props.sort((a, b) => a.x - b.x);
  // háttér: város-sziluett
  const sky = [], mids = [];
  for (let bx = -200; bx < L * .3 + 2000; bx += 30 + R() * 70) sky.push({x: bx, w: 30 + R() * 60, h: 60 + R() * 170, br: R() < .45 ? R() * .5 : 0, win: R() < .5});
  for (let bx = 0; bx < L * .6 + 2000; bx += 60 + R() * 160) mids.push({x: bx, k: R() < .45 ? 'tree' : R() < .6 ? 'pole' : 'house', h: 40 + R() * 70, s: R()});
  return {si, S, g, N, L, fin: S.len * UM + 200, wrecks, props, spawns, sp: 0, deco, sky, mids};
}
// Talaj: Catmull-Rom görbe a 16 egységes mintapontok között (nincs „törés” a csúcsokban, a meredekség is folytonos)
function gY(x) {
  const T = MG.trk, g = T.g, f = x / STEP, i = Math.floor(f);
  if (i < 1) return i < 0 ? g[0] : g[0] + (g[1] - g[0]) * f;
  if (i >= T.N - 2) return g[T.N - 1];
  const t = f - i, p0 = g[i - 1], p1 = g[i], p2 = g[i + 1], p3 = g[i + 2];
  return p1 + .5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)));
}
function gSl(x) {
  const T = MG.trk, g = T.g, f = x / STEP, i = Math.floor(f);
  if (i < 1) return i < 0 ? 0 : (g[1] - g[0]) / STEP;
  if (i >= T.N - 2) return 0;
  const t = f - i, p0 = g[i - 1], p1 = g[i], p2 = g[i + 1], p3 = g[i + 2];
  return .5 * (p2 - p0 + t * 2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) + t * t * 3 * (3 * (p1 - p2) + p3 - p0)) / STEP;
}

/* ============================================================================
   7. JÁRMŰ – merev test, 6 futógörgő rugós-csillapított kontakttal, a test sarkai ütköznek.
   ============================================================================ */
// Az eredeti PzH 2000 modell (DroneRun / Shot&Run): img/sprite5 (test) + sprite6 (cső), 9 kerekes futómű.
// A két szélső kerék a feszítő- és hajtókerék (kisebb), a lánc ezeken is körbefut, így peremen sem „ül fel”.
const WHEELS = D_WHEELS.map(w => ({lx: w.lx, ly: 21, r: w.r, s: w.road ? 0 : 1}));
const NROAD = WHEELS.filter(w => !w.s).length;
const FRONT = 104;                       // az orr (teknő eleje) x-e a jármű saját koordinátáiban
const PIV = [(266 - PCX) * PK, 10 + (66 - PBY) * PK];   // a cső forgáspontja
const GUN_A = -.06, MUZ = [PIV[0] + Math.cos(GUN_A) * 472 * PK, PIV[1] + Math.sin(GUN_A) * 472 * PK];
const MGP = [-44, -60];                  // tetőgéppuska helye
const HULL = [[-120, -46], [-60, -54], [0, -52], [12, -24], [100, -18], [108, 4], [-122, 10]];
const HB = {x0: -124, x1: FRONT + 2, y0: -56, y1: 32};   // találati doboz
// Felfüggesztés: a 7 futógörgő egyenként rugózik (rugó + lengéscsillapító + ütközőgumi). Az 1. szint a kopott gyári
// torziós rúd; a futómű-fejlesztések nagyobb lengést, lágyabb-de-stabil rugót és erősebb csillapítást adnak.
const ENV = [-.78, -.42, 0, .42, .78];   // a kerék talaj-burkolója: 5 mintapont a kerék szélességében
const SUSV = lv => { const T = 11 + lv * 1.2; return {T, k: 107 / T * (1.15 + lv * .06), cs: 1.3 + lv * .2} };   // közepes keménység: kb. 35% beülés, csillapítási tényező ~0,5
function makeVeh() {
  const mo = ST('motor'), fu = ST('futomu'), pa = ST('pancel'), el = ST('elol'), ag = ST('agyu'), bo = ST('boost'), tk = ST('tank');
  const mass = 1 + MG.sv.up.pancel * .04 + MG.sv.up.elol * .03, su = SUSV(MG.sv.up.futomu);
  const V = {x: 220, y: gY(220) - 34, a: 0, vx: 0, vy: 0, w: 0, mass, I: 3900 * mass,
    F: 95 * mo.f, vmax: mo.v, grip: fu.g, cr: fu.cr, tilt: 3.4 * fu.tl, hp: pa.hp, hp0: pa.hp, dr: pa.dr,
    fm: el.m, fdps: el.dps, fsr: el.sr, fext: el.ext, fprot: el.fp, fuel: tk.l, fuel0: tk.l,
    ammo: ag.am, rl: 0, rl0: ag.rl, boost: bo.cap, boost0: bo.cap, bth: bo.th,
    track: 0, contact: 0, air: 0, flipT: 0, stuckT: 0, noFuelT: 0, grind: 0, mgA: 0, mgT: 0, mgCd: 0, boosting: 0, blood: [], lastLand: 0,
    flame: 0, flame0: 0, fHeat: 0, lz: null, lzOn: 0, tA: 0, tCd: 0, tF: 0, tAng: 0, tgt: null, susT: su.T, ks: su.k, cs: su.cs, sc: new Float32Array(WHEELS.length), sv: new Float32Array(WHEELS.length), sy: new Float32Array(WHEELS.length), sT: new Uint8Array(WHEELS.length), pitchRate: 0};
  for (let i = 0; i < WHEELS.length; i++) if (!WHEELS[i].s) { V.sc[i] = su.T * .35; V.sy[i] = su.T / 2 - V.sc[i] }
  const fl = ST('lang'); V.flame = V.flame0 = fl.fl; V.fr = fl.fr; V.fd = fl.fd; V.lz = ST('lezer'); V.tw = ST('torony');
  return V;
}
function vPt(V, lx, ly) { const c = Math.cos(V.a), s = Math.sin(V.a); return [V.x + lx * c - ly * s, V.y + lx * s + ly * c] }
function vLoc(V, x, y) { const c = Math.cos(V.a), s = Math.sin(V.a), dx = x - V.x, dy = y - V.y; return [dx * c + dy * s, -dx * s + dy * c] }
function vehStep(V, dt, inp) {
  let fx = 0, fy = GRAV * V.mass, tq = 0, nC = 0;
  const loadK = 1 - Math.min(.45, MG.grab.length * .05);  // a kapaszkodók lefogják
  const gas = inp.gas && V.fuel > 0, brk = inp.brk;
  const cA = Math.cos(V.a), sA = Math.sin(V.a), fwd = V.vx * cA + V.vy * sA, T = V.susT, cMax = Math.max(.3, cA);
  const sp0 = Math.hypot(V.vx, V.vy);
  for (let wi = 0; wi < WHEELS.length; wi++) {
    const W = WHEELS[wi];
    let px, py, nx, ny, tx, ty, Fn, vn, vt, rx, ry;   // érintkezési pont, talaj-normális/érintő, terhelés
    if (W.s) { // hajtó- és feszítőkerék: merev, csak ütőszerűen ér a talajhoz (kátyú-kiugrás, farol)
      [px, py] = vPt(V, W.lx, W.ly); const h = gY(px), d = py + W.r - h;
      if (d <= 0) continue;
      const sl = gSl(px), il = 1 / Math.hypot(1, sl); tx = il; ty = sl * il; nx = sl * il; ny = -il;
      rx = px - V.x; ry = py - V.y; const pvx = V.vx - V.w * ry, pvy = V.vy + V.w * rx; vn = pvx * nx + pvy * ny; vt = pvx * tx + pvy * ty;
      Fn = Math.max(0, 22 * d * V.mass - 2 * vn * V.mass);
      const lim0 = V.grip * Fn * .7; let Ft0 = clamp(-vt * .15 * V.mass, -lim0, lim0);
      fx += nx * Fn + tx * Ft0; fy += ny * Fn + ty * Ft0; tq += rx * (ny * Fn + ty * Ft0) - ry * (nx * Fn + tx * Ft0); nC++;
      continue;
    }
    // futógörgő: a kerékagy a teljesen kirugózott helyzetből (T/2 a névleges fölé) tolódik fölfelé a talaj miatt
    const [dx0, dy0] = vPt(V, W.lx, 21 + T / 2), cPrev = V.sc[wi], pxc = dx0 + sA * cPrev;
    let hc = 1e9; for (const e of ENV) { const o = e * W.r, hh = gY(pxc + o) - Math.sqrt(W.r * W.r - o * o); if (hh < hc) hc = hh }
    const creq = (dy0 - hc) / cMax, target = Math.min(creq, T);
    let cNew, touch;
    if (target >= cPrev) { cNew = Math.max(0, target); touch = creq > 0 }
    else { cNew = Math.max(Math.max(0, target), cPrev - 170 * dt); touch = creq > 0 && cNew <= Math.max(0, target) + .02 }   // kirugózás: véges sebességű
    V.sc[wi] = cNew; V.sT[wi] = touch ? 1 : 0; V.sy[wi] = T / 2 - cNew;
    if (!touch) { V.sv[wi] *= .9; continue }
    nC++;
    V.sv[wi] += ((cNew - cPrev) / dt - V.sv[wi]) * Math.min(1, dt * 45);
    const cv = V.sv[wi];
    let F = V.ks * cNew + V.cs * (cv > 0 ? cv : cv * 1.6);                 // rugó + lengéscsillapító (visszarugózáskor keményebb)
    if (creq > T) F += 38 * (creq - T) + 3 * Math.max(0, cv);              // ütközőgumi
    F = Math.max(0, F) * V.mass;
    const hx = dx0 + sA * cNew, hy = dy0 - cA * cNew;                        // kerékagy a világban
    px = hx; py = hy + W.r;
    const sl = gSl(px), il = 1 / Math.hypot(1, sl); tx = il; ty = sl * il; nx = sl * il; ny = -il;
    const ux = sA, uy = -cA;                                                 // a test „fölfelé” tengelye
    // a rugóerő a test fölfelé-tengelyén hat az agyon
    const hrx = hx - V.x, hry = hy - V.y;
    fx += ux * F; fy += uy * F; tq += hrx * uy * F - hry * ux * F;
    // vonóerő a talajnál, a normál-terheléssel korlátozva
    Fn = F * Math.max(.25, ux * nx + uy * ny); rx = px - V.x; ry = py - V.y;
    const pvx = V.vx - V.w * ry, pvy = V.vy + V.w * rx; vn = pvx * nx + pvy * ny; vt = pvx * tx + pvy * ty;
    if (-vn > 300 && MG.t - V.lastLand > .4) { V.lastLand = MG.t; const dmg = (-vn - 300) * .05 * (1 - V.cr); if (dmg > .5) hurt(dmg, 'land'); shakeOff(.35); MG.shake = Math.max(MG.shake, Math.min(1, -vn / 650)); dustBurst(px, py, Math.min(14, -vn / 40), vt) }
    let Ft = 0; const lim = V.grip * Fn;
    if (gas) { const k = clamp(1 - vt / V.vmax, 0, 1); Ft = Math.min(lim, V.F * V.mass * loadK / NROAD * Math.sqrt(k)) }
    else if (brk) { Ft = vt > 6 ? -Math.min(lim, 240 * V.mass / NROAD) : vt > -55 ? -Math.min(lim, 40 * V.mass / NROAD) : 0 }
    else Ft = clamp(-vt * .22 * V.mass / NROAD, -lim, lim);
    Ft = clamp(Ft - vt * .02 * V.mass, -lim, lim);                          // gördülési ellenállás
    const Fx = tx * Ft, Fy = ty * Ft;
    fx += Fx; fy += Fy; tq += rx * Fy - ry * Fx;
    // por a lánctalp alól
    if ((gas || brk) && sp0 > 40 && Math.random() < dt * 18 * Math.min(1, Math.abs(vt) / 120)) dustPuff(px - V.vx * .02, py - 2, vt, Fn)
  }
  V.contact = nC;
  // test-sarkok
  let hullHit = 0;
  for (const [lx, ly] of HULL) {
    const [px, py] = vPt(V, lx, ly), h = gY(px), d = py - h;
    if (d <= 0) continue;
    hullHit++;
    const sl = gSl(px), il = 1 / Math.hypot(1, sl), tx = il, ty = sl * il, nx = sl * il, ny = -il;
    const rx = px - V.x, ry = py - V.y, pvx = V.vx - V.w * ry, pvy = V.vy + V.w * rx, vn = pvx * nx + pvy * ny, vt = pvx * tx + pvy * ty;
    if (-vn > 140 && ly < 0) { hurt((-vn - 140) * .12 * (1 - V.cr), 'roof'); MG.shake = Math.max(MG.shake, .6); sparks(px, py, 8) }
    const Fn = Math.max(0, 70 * d * V.mass - 5 * vn * V.mass), Ft = clamp(-vt * 2 * V.mass, -.6 * Fn, .6 * Fn);
    const Fx = nx * Fn + tx * Ft, Fy = ny * Fn + ty * Ft;
    fx += Fx; fy += Fy; tq += rx * Fy - ry * Fx;
  }
  V.hullHit = hullHit;
  // levegő-irányítás (földön is billent egy kicsit)
  const tIn = (inp.tr ? 1 : 0) - (inp.tl ? 1 : 0);
  if (tIn) tq += tIn * V.tilt * V.I * (nC ? .3 : 1);
  if (!nC) { V.air += dt; tq -= V.w * V.I * .4 } else V.air = 0;
  // rakéta
  V.boosting = 0;
  if (inp.boost && V.boost > 0) { V.boost = Math.max(0, V.boost - dt); V.boosting = 1; fx += Math.cos(V.a) * 330 * V.bth * V.mass; fy += Math.sin(V.a) * 330 * V.bth * V.mass }
  // légellenállás
  const sp = Math.hypot(V.vx, V.vy), xd = sp > V.vmax * 1.3 ? (sp - V.vmax * 1.3) * 1.4 / sp : 0; fx -= V.vx * (sp * .0007 + xd) * V.mass; fy -= V.vy * (sp * .0007 + xd) * V.mass;
  V.vx += fx / V.mass * dt; V.vy += fy / V.mass * dt; V.w += tq / V.I * dt;
  V.w = clamp(V.w, -9, 9);
  V.x += V.vx * dt; V.y += V.vy * dt; V.a += V.w * dt;
  { const tgt = nC ? fwd : gas ? Math.min(180, (V.trkV || 0) + 260 * dt) : brk ? (V.trkV || 0) * Math.max(0, 1 - 6 * dt) : (V.trkV || 0) * Math.max(0, 1 - .5 * dt); V.trkV = (V.trkV || 0) + (tgt - (V.trkV || 0)) * Math.min(1, dt * (nC ? 25 : 6)); V.track += V.trkV * dt }
  // üzemanyag
  const burn = (gas ? 1.45 : .12) * (1 + MG.sv.up.motor * .07);
  V.fuel = Math.max(0, V.fuel - burn * dt);
}
// por: puha, táguló, elhalványuló foltok (külön lista, olcsó)
function dustPuff(x, y, vt, load) { if (MG.dust.length > (LOWFX ? 24 : 70)) MG.dust.shift(); MG.dust.push({x, y, vx: -vt * .12 + rnd(-14, 14), vy: -rnd(8, 34), r: rnd(3, 6), g: rnd(10, 22), life: rnd(.5, 1), l0: 1, a: Math.min(.5, .15 + load * .0002)}) }
function dustBurst(x, y, n, vt) { for (let i = 0; i < n; i++) { if (MG.dust.length > (LOWFX ? 24 : 90)) MG.dust.shift(); MG.dust.push({x: x + rnd(-14, 14), y: y - 1, vx: rnd(-90, 90) - vt * .1, vy: -rnd(10, 60), r: rnd(4, 8), g: rnd(14, 30), life: rnd(.6, 1.3), l0: 1, a: .5}) } }

/* ============================================================================
   8. JÁTÉKMENET
   ============================================================================ */
function newRun(si) {
  MG.trk = buildStage(si);
  MG.V = makeVeh();
  Object.assign(MG, {t: 0, z: [], grab: [], dust: [], flames: [], beams: [], parts: [], gibs: [], guts: [], dec: [], corpses: [], fx: [], shells: [], ebul: [], txt: [], tracers: [],
    kills: 0, kt: {}, hurtBy: {}, pts: 0, cash: 0, combo: 0, comboT: 0, bestCombo: 0, shake: 0, slow: 1, end: null, endT: 0, maxX: 220, hordeMsg: 0, sndT: {}});
  MG.cam = {x: MG.V.x - 200, y: MG.V.y - 260, s: 1};
  MG.inp = {gas: 0, brk: 0, tl: 0, tr: 0, boost: 0, fire: 0, fireH: 0, flame: 0};
  MG.trk.props.forEach(p => { p.y = gY(p.x); p.dead = 0 });
  for (let i = 0; i < 6; i++) driftDecal(rnd(300, 2000));
}
function driftDecal(x) { MG.dec.push({x, w: rnd(10, 28), c: '#3a0808', a: .5, g: 1, tw: 0}) }

function spawnZ(s) {
  const D = ZT[s.t], z = {t: s.t, D, x: s.x, y: gY(s.x), vx: 0, vy: 0, hp: D.hp * (1 + MG.trk.si * .15), st: 'walk', ph: Math.random() * 6, spd: rnd(D.spd[0], D.spd[1]),
    dir: -1, hitT: 0, hitCd: 0, cd: rnd(1, 3), armL: D.mon ? 0 : 1, armR: D.mon ? 0 : 1, head: D.mon ? 0 : 1, down: 0, bleed: 0, sc: rnd(.92, 1.1), sk: Math.floor(Math.random() * 4), horde: s.horde};
  z.hp0 = z.hp; MG.z.push(z);
}

function hurt(dmg, why) {
  const V = MG.V; if (MG.end) return;
  const d = dmg * (1 - V.dr); V.hp -= d;
  MG.hurtBy[why] = (MG.hurtBy[why] || 0) + d;
  MG.hurtT = Math.max(MG.hurtT || 0, Math.min(.35, .08 + d * .03));
  if (V.hp <= 0) { V.hp = 0; finish('dead', why) }
}
function addKill(z, how) {
  MG.kills++; MG.kt[z.t] = (MG.kt[z.t] || 0) + 1;
  MG.combo = MG.comboT > 0 ? MG.combo + 1 : 1; MG.comboT = 1.3; MG.bestCombo = Math.max(MG.bestCombo, MG.combo);
  const bonus = MG.combo > 2 ? MG.combo * 2 : 0;
  MG.pts += z.D.p + bonus; MG.cash += z.D.c;
  if (MG.combo >= 3 && MG.combo % 1 === 0) MG.comboShow = {n: MG.combo, t: 1.2};
  if (how) floatTxt(z.x, z.y - z.D.h * z.sc - 10, '+' + (z.D.p + bonus), '#ffd24a');
}

function killZ(z, vx, vy, how, power) {
  if (z.st === 'dead') return;
  z.st = 'dead';
  addKill(z, how);
  gore(z, vx, vy, power || 1, how);
  if (z.t === 'bloater') bloat(z);
  if (z.D.split) for (let i = 0; i < 2; i++) { const h = ZT.lurker; const nz = {t: 'lurker', D: h, x: z.x + (i ? 22 : -22), y: z.y, vx: i ? 90 : -90, vy: -170, hp: h.hp * .35, st: 'air', ph: Math.random() * 6, spd: rnd(h.spd[0], h.spd[1]), dir: -1, hitT: 0, hitCd: .4, cd: 2, armL: 0, armR: 0, head: 0, down: 0, bleed: .6, sc: .8, sk: 0, spin: i ? 5 : -5}; nz.hp0 = nz.hp; MG.z.push(nz) }
  sndSplat(power);
  try { if (power > 1.4 && navigator.vibrate) navigator.vibrate(18) } catch (e) {}
}

function damageZ(z, dmg, vx, vy, how) {
  if (z.st === 'dead') return false;
  z.hp -= dmg; z.hitT = .12; z.bleed = Math.min(1, z.bleed + dmg / z.hp0);
  // részleges szétesés: a kar leszakad, ha már sérült
  if (z.hp > 0 && z.hp < z.hp0 * .6 && Math.random() < .35 && !z.D.wall) {
    if (z.armR) { z.armR = 0; limbGib(z, 'arm', vx, vy) } else if (z.armL && z.hp < z.hp0 * .35) { z.armL = 0; limbGib(z, 'arm', vx, vy) }
  }
  if (dmg > 3) bloodBurst(z.x, z.y - z.D.h * z.sc * .6, vx * .3, vy * .3 - 40, Math.min(14, 3 + dmg / 8), z.D.bl);
  if (z.hp <= 0) { killZ(z, vx, vy, how, Math.min(2.4, .8 + dmg / 80)); return true }
  return false;
}

function bloat(z) { // puffadt: savas robbanás
  const y = z.y - 25;
  for (let i = 0; i < (LOWFX ? 25 : 55); i++) { const a = rnd(-Math.PI, 0), s = rnd(80, 420); part(z.x, y, Math.cos(a) * s, Math.sin(a) * s, rnd(.8, 1.8), rnd(2, 5), Math.random() < .7 ? '#9acd32' : '#c8e04a', 1) }
  for (let i = 0; i < 6; i++) MG.fx.push({k: 'puff', x: z.x + rnd(-20, 20), y: y + rnd(-20, 10), r: rnd(14, 26), t: 0, d: rnd(.6, 1.1), c: '154,205,50'});
  for (const o of MG.z) if (o !== z && o.st !== 'dead' && Math.abs(o.x - z.x) < 95) damageZ(o, 90, (o.x - z.x) * 3, -200, 'acid');
  const V = MG.V; if (Math.hypot(V.x - z.x, V.y - y) < 120) { hurt(4.5 * (1 - V.fprot * .6), 'bloat'); bloodOn(rnd(30, 100), rnd(-22, 10), rnd(5, 10), '#7f9a1c') }
  MG.dec.push({x: z.x, w: 4, tw: 46, c: '#6f8a12', a: .75, g: 1});
}

function shakeOff(chance) {
  for (let i = MG.grab.length - 1; i >= 0; i--) {
    if (Math.random() < chance) { const z = MG.grab[i]; MG.grab.splice(i, 1); const [x, y] = vPt(MG.V, z.gx, z.gy); z.x = x; z.y = y; z.st = 'air'; z.vx = MG.V.vx + rnd(-80, 80); z.vy = MG.V.vy - rnd(120, 220); z.spin = rnd(-6, 6); MG.z.push(z) }
  }
}

function finish(kind, why) {
  if (MG.end) return;
  MG.end = {kind, why}; MG.endT = kind === 'win' ? 3.2 : 2.4; MG.slow = .35;
  MG.inp.gas = MG.inp.brk = MG.inp.boost = 0;
  if (kind === 'win') { MG.shake = .4; toast('🏁 Elérted a menedéket!') }
  if (kind === 'dead') { const V = MG.V; boomFx(V.x, V.y - 20, 1.3); for (let i = 0; i < 26; i++) sparks(V.x + rnd(-50, 50), V.y + rnd(-40, 10), 1) }
}

function update(dt) {
  const V = MG.V, T = MG.trk, inp = MG.inp;
  MG.t += dt;
  // spawn a kamera előtt
  const camR = MG.cam.x + MG.viewW + 350;
  while (T.sp < T.spawns.length && T.spawns[T.sp].x < camR) { const s = T.spawns[T.sp++]; if (s.x > V.x - 100) spawnZ(s) }
  if (MG.z.length > (LOWFX ? 90 : 150)) MG.z.splice(0, MG.z.length - (LOWFX ? 90 : 150));
  // horda-figyelmeztetés
  for (const d of T.deco) if (d.k === 'warn' && !d.done && V.x > d.x) { d.done = 1; MG.hordeMsg = 2.2; sndHorde() }
  // jármű (al-lépésekben a merev rugók miatt)
  const sub = Math.max(2, Math.ceil(dt / (1 / 240)));
  for (let i = 0; i < sub; i++) vehStep(V, dt / sub, MG.end ? {} : inp);
  if (!Number.isFinite(V.x + V.y + V.a)) { V.x = MG.maxX; V.y = gY(V.x) - 60; V.vx = V.vy = V.w = 0; V.a = 0 }
  MG.maxX = Math.max(MG.maxX, V.x);
  // fő ágyú
  V.rl = Math.max(0, V.rl - dt);
  if (inp.fire && !MG.end) { inp.fire = 0; fireGun() } else if (inp.fireH && !MG.end && V.rl <= 0 && V.ammo > 0) fireGun();
  flameStep(dt); laserStep(dt); towerStep(dt);
  // géppuska
  mgStep(dt);
  // ellenségek
  zStep(dt);
  grabStep(dt);
  propStep(dt);
  shellStep(dt);
  ebulStep(dt);
  goreStep(dt);
  fxStep(dt);
  MG.comboT = Math.max(0, MG.comboT - dt); if (MG.comboShow) { MG.comboShow.t -= dt; if (MG.comboShow.t <= 0) MG.comboShow = null }
  MG.hordeMsg = Math.max(0, MG.hordeMsg - dt); MG.hurtT = Math.max(0, (MG.hurtT || 0) - dt);
  MG.shake = Math.max(0, MG.shake - dt * 1.8);
  // vége-feltételek
  if (!MG.end) {
    const sp = Math.hypot(V.vx, V.vy);
    if (V.x >= T.fin) finish('win');
    if (Math.cos(V.a) < -.25 && V.hullHit) { V.flipT += dt; if (V.flipT > 2.4) finish('flip') } else V.flipT = Math.max(0, V.flipT - dt);
    if (V.fuel <= 0) { if (sp < 6) V.noFuelT += dt; if (V.noFuelT > 1.6) finish('fuel') }
    if (sp < 5 && V.fuel > 0) { V.stuckT += dt; const lim = MG.grab.length || MG.z.some(z => z.st !== 'dead' && Math.abs(z.x - V.x) < 120) ? 9 : 6; if (V.stuckT > lim) finish('stuck') } else V.stuckT = Math.max(0, V.stuckT - dt * 2);
    if (V.y > 3000) finish('flip');
  } else { MG.endT -= dt / MG.slow; if (MG.endT <= 0 && !MG.endShown) { MG.endShown = 1; showResult() } }
}

/* ---------- ellenségek ---------- */
function zStep(dt) {
  const V = MG.V, fext = FRONT + V.fext, cA = Math.cos(V.a), sA = Math.sin(V.a);
  const fwd = V.vx * cA + V.vy * sA;
  let grinding = 0;
  for (const z of MG.z) {
    if (z.st === 'dead') continue;
    z.hitT = Math.max(0, z.hitT - dt); z.hitCd = Math.max(0, z.hitCd - dt);
    if (z.bleed > .15 && Math.random() < z.bleed * dt * 6) part(z.x + rnd(-4, 4), z.y - z.D.h * z.sc * .5, rnd(-20, 20), rnd(-10, 20), 1.2, 1.6, z.D.bl, 0);
    const dx = V.x - z.x, ad = Math.abs(dx);
    if (z.st === 'air') {
      z.vy += GRAV * 1.4 * dt; z.x += z.vx * dt; z.y += z.vy * dt; z.rot = (z.rot || 0) + (z.spin || 0) * dt;
      const h = gY(z.x);
      if (z.y >= h) {
        z.y = h;
        if (z.vy > 300) { if (damageZ(z, (z.vy - 300) * .35, z.vx, -z.vy * .3, 'fall')) continue }
        if (z.vy > 120) { bloodBurst(z.x, z.y - 4, z.vx * .2, -60, 5, z.D.bl); splatDecal(z.x, 18, z.D.bl) }
        z.vy = 0; z.vx *= .4; z.st = 'down'; z.down = rnd(.8, 1.6); z.rot = Math.sign(z.vx || 1) * Math.PI / 2;
      }
      continue;
    }
    if (z.st === 'down') { z.down -= dt; z.x += z.vx * dt; z.vx *= Math.pow(.05, dt); z.y = gY(z.x); if (z.down <= 0) { z.st = 'walk'; z.rot = 0 } }
    else {
      // mozgás a jármű felé (aki mögötte van, utána fut)
      z.dir = dx < 0 ? -1 : 1;
      let v = ad < 900 ? z.spd : z.spd * .3;
      if (z.D.stand) v = ad > 500 ? z.spd : 0;
      if (z.D.leap && ad < 110 && ad > 30 && dx < 0 && Math.random() < dt * 3 && z.cd <= 0) { z.st = 'leap'; z.vx = -z.spd * 1.3 + (V.vx * .6); z.vy = -rnd(160, 230); z.cd = 2 }
      z.x += z.dir * v * dt; z.y = gY(z.x); z.ph += dt * (2 + v * .07);
      z.cd -= dt;
      if (z.D.rng === 'gun' && z.cd <= 0 && dx < 0 && ad < 650 && ad > 60) { z.cd = rnd(1.6, 2.6); const tx = V.x + rnd(-70, 70), ty = V.y - 20 + rnd(-60, 30), sx = z.x - 10, sy = z.y - 34, L = Math.hypot(tx - sx, ty - sy); MG.ebul.push({x: sx, y: sy, vx: (tx - sx) / L * 950, vy: (ty - sy) / L * 950, t: 1.2, k: 'b'}); MG.fx.push({k: 'flash', x: sx - 6, y: sy, t: 0, d: .06}); sndShot(.03) }
      if (z.D.rng === 'acid' && z.cd <= 0 && dx < 0 && ad < 480 && ad > 70) { z.cd = rnd(3.2, 4.6); const tt = rnd(.8, 1.1), sx = z.x - 4, sy = z.y - 40; MG.ebul.push({x: sx, y: sy, vx: (V.x + V.vx * tt * rnd(.6, 1.1) + rnd(-50, 50) - sx) / tt, vy: ((V.y - 30) - sy) / tt - GRAV * .5 * tt, t: 2, k: 'acid', g: 1}) }
      if (z.D.wall && ad < 90 && z.cd <= 0) { z.cd = 1.4; z.punch = .3; hurt(9 * (1 - V.fprot), 'brute'); V.vx += -dx > 0 ? -60 : 60; MG.shake = Math.max(MG.shake, .5); sndThud(.4) }
      z.punch = Math.max(0, (z.punch || 0) - dt);
    }
    if (z.st === 'leap') { z.vy += GRAV * 1.4 * dt; z.x += z.vx * dt; z.y += z.vy * dt; if (z.y >= gY(z.x)) { z.y = gY(z.x); z.st = 'walk' } }
    // ütközés a járművel: 3 pont a zombi testén, a jármű saját koordinátáiban
    if (z.hitCd > 0) continue;
    const H = z.D.h * z.sc * (z.st === 'down' ? .3 : 1);
    let hit = null;
    for (const fy of [.15, .55, .9]) {
      const [lx, ly] = vLoc(V, z.x, z.y - H * fy);
      if (lx > HB.x0 && lx < fext + z.D.w * .5 && ly > HB.y0 - 4 && ly < HB.y1) { if (!hit || lx > hit[0]) hit = [lx, ly] }
    }
    if (!hit) continue;
    const [lx, ly] = hit, zv = z.st === 'air' || z.st === 'leap' ? z.vx * cA + z.vy * sA : z.dir * (z.st === 'walk' ? z.spd : 0);
    const vrel = fwd - zv;
    if (z.st === 'down') { // a földön fekvőt a lánctalp eltapossa
      damageZ(z, 26 + Math.abs(fwd) * .35 + Math.max(0, V.vy) * .4, V.vx, -90, 'crush'); z.hitCd = .22;
      if (Math.abs(fwd) > 20) { V.vy -= 14; V.w += (Math.random() - .5) * .3 }
      if (z.st !== 'dead') { z.down = Math.max(z.down, .6); z.x -= 4 }
    } else if (lx > fext - 22 && ly > -46) { // ELÖL: ütés / darálás
      grinding = 1;
      const impact = vrel > 15 ? Math.pow(vrel / 10, 1.35) * 2.4 * V.fm : 0;
      let dmg = impact + V.fdps * dt;
      if (z.t === 'riot' && vrel < 190) dmg *= .45;
      if (V.fdps > 0 && Math.random() < dt * 8) grindSpray(z, V);
      const died = damageZ(z, dmg, V.vx * 1.1, -Math.abs(vrel) * .6 - 80, V.fdps > 0 && impact < 20 ? 'grind' : 'hit');
      const mr = z.D.m / (z.D.m + 2200 * V.mass);
      if (died) { V.vx -= cA * vrel * mr * (1 - V.fsr) * 1.2; V.vy -= sA * vrel * mr * (1 - V.fsr) * 1.2 }
      else if (z.D.wall && vrel > 150 * (z.D.big > 2.3 ? 1.5 : 1)) { // nagy sebességnél az óriás is elesik
        z.st = 'down'; z.down = 1.8; z.rot = Math.PI / 2; z.x += 40; z.hitCd = 1; damageZ(z, 60, V.vx, -60, 'hit');
        V.vx -= cA * vrel * .45 * (1 - V.fsr * .5); V.vy -= sA * vrel * .45 * (1 - V.fsr * .5); hurt(8 * (1 - V.fprot), 'brute'); MG.shake = Math.max(MG.shake, .9); sndThud(.7);
      } else if (z.D.wall) { // óriás: falnak ütközöl
        const bk = Math.max(0, fwd) * (1 - V.fsr * .5);
        V.vx -= cA * (bk + 40); V.vy -= sA * (bk + 40); z.x += 10; z.hitCd = .35; hurt((6 + vrel * .05) * (1 - V.fprot), 'brute'); MG.shake = Math.max(MG.shake, .7); sndThud(.6); sparks(...vPt(V, fext, -6), 6);
      } else if (vrel > 55) { // feldobja
        z.st = 'air'; z.vx = fwd * cA * 1.15 + rnd(0, 40); z.vy = -rnd(140, 240) - vrel * .4; z.spin = rnd(-12, -4); z.hitCd = .35;
        V.vx -= cA * vrel * mr * (1 - V.fsr) * 2; V.vy -= sA * vrel * mr * (1 - V.fsr) * 2;
      } else { // nekifeszül: lassít, és talán felmászik
        z.x = Math.max(z.x, vPt(V, fext + z.D.w * .5, 0)[0]); z.hitCd = .12;
        const push = (1 - V.fsr) * z.D.m / 70; V.vx -= cA * push * 26 * dt * 10; V.vy -= sA * push * 26 * dt * 10;
        if (z.D.gb && Math.random() < z.D.gb * (1 - ST('oldal').gr) * .3) grabOn(z, rnd(40, 92), rnd(-20, -4));
        else if (!z.D.wall && Math.random() < (z.t === 'riot' ? .06 : .22) * (1 + V.fm * .3)) { z.st = 'down'; z.down = 1.4; z.rot = Math.PI / 2; z.vx = Math.max(0, fwd) * .5 }
      }
    } else if (ly > 8) { // ALUL: a lánctalp eltapossa
      damageZ(z, 30 + Math.abs(V.vy) * .5 + Math.abs(fwd) * .3, V.vx, -120, 'crush'); z.hitCd = .2;
      if (z.st !== 'dead') { z.st = 'down'; z.down = 1.5; z.rot = Math.PI / 2 }
    } else if (ly < -30) { // TETŐN landolt
      if (z.D.gb) grabOn(z, clamp(lx, -112, -6), -53); else { z.st = 'air'; z.vx = V.vx - 60; z.vy = -120; z.hitCd = .3 }
    } else { // OLDALT: rákapaszkodik vagy lecsúszik
      if (z.D.gb && Math.random() < z.D.gb * (1 - ST('oldal').gr)) grabOn(z, clamp(lx, -112, 90), clamp(ly, -22, -2));
      else { z.st = 'down'; z.down = 1; z.rot = -Math.PI / 2; z.x -= 20; z.hitCd = .3; damageZ(z, 8 + ST('oldal').dps * .2, V.vx, -40, 'side') }
    }
  }
  V.grind = grinding ? Math.min(1, V.grind + dt * 6) : Math.max(0, V.grind - dt * 3);
  MG.z = MG.z.filter(z => z.st !== 'dead' && z.st !== 'grab' && z.x > V.x - 1100 && z.y < 4000);
}
function grabOn(z, gx, gy) {
  if (MG.grab.length >= 6) { z.st = 'down'; z.down = 1; z.hitCd = .5; return }
  z.st = 'grab'; z.gx = gx; z.gy = gy; z.ph = Math.random() * 6; MG.grab.push(z); z.hitCd = 0;
  floatTxt(z.x, z.y - 50, 'FELMÁSZOTT!', '#ff6b5e');
}
function grabStep(dt) {
  const V = MG.V, side = ST('oldal'), roofSp = MG.sv.up.pancel >= 4 ? 30 : 0;
  for (let i = MG.grab.length - 1; i >= 0; i--) {
    const z = MG.grab[i]; z.ph += dt * 5; z.hitT = Math.max(0, z.hitT - dt);
    hurt(z.D.dps * dt, 'grab');
    const d = (side.dps + (z.gy < -45 ? roofSp : 0)) * dt;
    if (d > 0) { z.hp -= d; z.bleed = 1; z.hitT = .05; if (Math.random() < dt * 10) { const [x, y] = vPt(V, z.gx, z.gy); bloodBurst(x, y, V.vx * .5, -40, 2, z.D.bl) } }
    if (z.hp <= 0) { MG.grab.splice(i, 1); const [x, y] = vPt(V, z.gx, z.gy); z.x = x; z.y = y + 20; killZ(z, V.vx, -100, 'side', 1.1); continue }
    if (Math.abs(V.w) > 2.2 && Math.random() < dt * 4) shakeOff(.5);
  }
}

/* ============================================================================
   9b. ÚJ FEGYVEREK: lángszóró, lézer, automata torony
   ============================================================================ */
const NZ = [114, -34];                 // a lángszóró-fúvóka helye (jármű-koordináta)
const LZP = [-8, -68];                 // a lézer-fej helye
const TWP = [-104, -60];               // az automata torony forgáspontja (hátul a tetőn)
const BEAMC = ['', '255,60,50', '255,120,40', '255,70,210', '110,230,255'];
function burnDmg(z, d) { z.hp -= d; z.bleed = Math.min(1, z.bleed + d / z.hp0 * .5); if (z.hp <= 0 && z.st !== 'dead' && z.st !== 'grab') killZ(z, rnd(-40, 40), -120, 'fire', .9) }
function flameStep(dt) {
  const V = MG.V; V.fOn = 0;
  // égő ellenfelek: folyamatos sebzés, továbbadják a tüzet, lángnyelvek
  for (const arr of [MG.z, MG.grab]) for (const z of arr) {
    if (!(z.burn > 0) || z.st === 'dead') continue;
    z.burn -= dt; burnDmg(z, z.bd * dt);
    if (Math.random() < dt * 14 && MG.flames.length < (LOWFX ? 70 : 170)) { const [fx, fy] = z.st === 'grab' ? vPt(V, z.gx, z.gy - 12) : [z.x + rnd(-5, 5), z.y - z.D.h * z.sc * rnd(.3, .9)]; MG.flames.push({x: fx, y: fy, vx: rnd(-20, 20), vy: -rnd(40, 90), life: rnd(.25, .45), l0: .45, r: rnd(2.5, 4.5)}) }
    if (z.st !== 'grab' && Math.random() < dt * 1.8) for (const o of MG.z) if (o !== z && o.st !== 'dead' && !(o.burn > 0) && Math.abs(o.x - z.x) < 24) { o.burn = 2.4; o.bd = z.bd * .8; break }
  }
  if (!V.flame0 || MG.end) return;
  if (MG.inp.flame && V.flame > 0) {
    V.fOn = 1; V.flame = Math.max(0, V.flame - dt);
    const a = V.a + .02, [x, y] = vPt(V, NZ[0], NZ[1]), ca = Math.cos(a), sa = Math.sin(a), R = V.fr;
    for (let i = 0, n = LOWFX ? 2 : 4; i < n; i++) { const sp = R * rnd(1.5, 2.2), aa = a + rnd(-.1, .1); if (MG.flames.length > (LOWFX ? 70 : 170)) MG.flames.shift(); MG.flames.push({x, y, vx: V.vx * .8 + Math.cos(aa) * sp, vy: V.vy * .6 + Math.sin(aa) * sp - 8, life: rnd(.3, .5), l0: .5, r: rnd(4, 7)}) }
    const hitCone = (z, zx, zy) => { const rx = zx - x, ry = zy - y, al = rx * ca + ry * sa, pe = Math.abs(rx * sa - ry * ca); return al > -14 && al < R && pe < 12 + Math.max(0, al) * .24 ? al : -1 };
    for (const z of MG.z) if (z.st !== 'dead') { const al = hitCone(z, z.x, z.y - z.D.h * z.sc * .5); if (al >= 0) { z.burn = Math.max(z.burn || 0, 3.2); z.bd = V.fd * .5; burnDmg(z, V.fd * dt * (1 - al / R * .45) * (z.t === 'riot' ? .6 : 1)); z.hitT = Math.max(z.hitT, 0) } }
    for (const z of MG.grab) { const [gx, gy] = vPt(V, z.gx, z.gy - 12), al = hitCone(z, gx, gy); if (al >= 0) { z.burn = Math.max(z.burn || 0, 3.2); z.bd = V.fd * .5; burnDmg(z, V.fd * dt) } }
    for (const p of MG.trk.props) if (!p.dead && p.k === 'boom') { const al = hitCone(null, p.x, p.y - 8); if (al >= 0) { p.dead = 1; setTimeout(() => { if (MG.trk) explode(p.x, p.y - 10, 120, 220, 'barrel') }, 80) } }
    if (thr('flame', 85) && sOk()) { try { noiseHit(rnd(500, 900), .5, .11, .24, 'lowpass') } catch (e) {} }
  } else V.flame = Math.min(V.flame0, V.flame + dt * .28);
}
function laserHit(z, d, x, y) {
  z.hp -= d; z.hitT = Math.max(z.hitT, .03); z.bleed = Math.min(1, z.bleed + d / z.hp0 * .3);
  if (Math.random() < .35) part(x, y, rnd(-80, 80), -rnd(40, 160), rnd(.3, .6), rnd(1, 2), '#ffb04a', 0);
  if (z.hp <= 0 && z.st !== 'dead' && z.st !== 'grab') killZ(z, rnd(-60, 60), -150, 'laser', 1.1);
}
function laserStep(dt) {
  const V = MG.V, L = V.lz; MG.beams.length = 0; V.lzOn = 0;
  if (!L || !L.nb || MG.end) return;
  const [ox, oy] = vPt(V, LZP[0] + 9, LZP[1] + 4), cand = [];
  for (const z of MG.z) { if (z.st === 'dead' || z.x < V.x - 40) continue; const zy = z.y - z.D.h * z.sc * .55, d = Math.hypot(z.x - ox, zy - oy); if (d < L.rg) cand.push({z, x: z.x, y: zy, d}) }
  for (const z of MG.grab) { const [gx, gy] = vPt(V, z.gx, z.gy - 10); cand.push({z, x: gx, y: gy, d: Math.hypot(gx - ox, gy - oy)}) }
  cand.sort((a, b) => a.d - b.d);
  const n = Math.min(L.nb, cand.length), lvl = MG.sv.up.lezer;
  for (let i = 0; i < n; i++) {
    const t = cand[i]; V.lzOn = 1;
    const sx = ox, sy = oy - (i - (n - 1) / 2) * 5, ang = Math.atan2(t.y - sy, t.x - sx), len = L.pi ? Math.min(L.rg, t.d + 70) : t.d, ca = Math.cos(ang), sa = Math.sin(ang);
    MG.beams.push({x0: sx, y0: sy, x1: sx + ca * len, y1: sy + sa * len, c: BEAMC[lvl], w: 1 + lvl * .35});
    laserHit(t.z, L.dps * dt, t.x, t.y);
    if (L.pi) for (const o of cand) { if (o === t) continue; const rx = o.x - sx, ry = o.y - sy, al = rx * ca + ry * sa; if (al > 0 && al < len && Math.abs(rx * sa - ry * ca) < 13) laserHit(o.z, L.dps * dt * .8, o.x, o.y) }
  }
  if (V.lzOn && thr('lz', 380) && sOk()) { try { const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(260, t + .2); g.gain.setValueAtTime(.025, t); g.gain.exponentialRampToValueAtTime(.001, t + .22); o.connect(g).connect(MASTER); o.start(t); o.stop(t + .24) } catch (e) {} }
}
function towerStep(dt) {
  const V = MG.V, g = V.tw; V.tF = Math.max(0, V.tF - dt * 14);
  if (!g || !g.rt || MG.end) return;
  V.tCd -= dt;
  const [mx, my] = vPt(V, TWP[0], TWP[1] - 4);
  let tg = null, bd = 1e9;
  for (const z of MG.grab) { const [gx, gy] = vPt(V, z.gx, z.gy - 10), d = Math.hypot(gx - mx, gy - my); if (d < bd) { bd = d; tg = {z, x: gx, y: gy, g: 1} } }   // a rádmászókat előbb leszedi
  if (!tg) for (const z of MG.z) { if (z.st === 'dead') continue; const zy = z.y - z.D.h * z.sc * .55, d = Math.hypot(z.x - mx, zy - my); if (d < g.rg && d < bd) { bd = d; tg = {z, x: z.x, y: zy, g: 0} } }
  if (!tg) { V.tA += (Math.PI * .1 - V.tA) * Math.min(1, dt * 2); return }
  let df = Math.atan2(tg.y - my, tg.x - mx) - V.a - V.tA; df = ((df + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  V.tA += df * Math.min(1, dt * 13);
  if (V.tCd <= 0 && Math.abs(df) < .3) {
    V.tCd = 1 / g.rt; V.tF = 1;
    const aa = V.tA + V.a + rnd(-.04, .04), L = 18 + MG.sv.up.torony * 2, bx = mx + Math.cos(aa) * L, by = my + Math.sin(aa) * L;
    MG.tracers.push({x0: bx, y0: by, x1: tg.x + rnd(-4, 4), y1: tg.y + rnd(-4, 4), t: .05});
    MG.fx.push({k: 'flash', x: bx, y: by, t: 0, d: .04});
    if (Math.random() < .88) {
      let d = g.dm; if (tg.z.t === 'riot' && MG.sv.up.torony < 4) d *= .4;
      if (tg.g) { tg.z.hp -= d; tg.z.hitT = .05; tg.z.bleed = 1; if (Math.random() < .5) bloodBurst(tg.x, tg.y, 0, -40, 2, tg.z.D.bl) } else damageZ(tg.z, d, Math.cos(aa) * 160, -60, 'mg');
    }
    if (Math.random() < .35) MG.gibs.push({x: mx, y: my, vx: V.vx + rnd(-60, 60), vy: -rnd(60, 130), a: 0, w: 14, k: 'brass', s: 2.4, life: 1.2, c: '#d4a64a'});
    sndShot(.02);
  }
}
const FSPR = [];
function flameSpr(i) { // lágy lángfoltok: forró mag / narancs / vörös füst
  let c = FSPR[i]; if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d'), g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
  const st = [['rgba(255,252,220,1)', 'rgba(255,210,90,.8)', 'rgba(255,120,30,0)'], ['rgba(255,190,70,.95)', 'rgba(255,100,20,.7)', 'rgba(200,40,10,0)'], ['rgba(120,30,10,.7)', 'rgba(50,20,14,.45)', 'rgba(20,10,8,0)']][i];
  g.addColorStop(0, st[0]); g.addColorStop(.45, st[1]); g.addColorStop(1, st[2]); x.fillStyle = g; x.fillRect(0, 0, 48, 48); return FSPR[i] = c;
}
function drawFlames(c) {
  if (MG.flames.length) {
    c.globalCompositeOperation = 'lighter';
    for (const f of MG.flames) { const k = 1 - f.life / f.l0, r = f.r * (1 + k * 2.2), i = k < .3 ? 0 : 1; c.globalAlpha = Math.min(1, f.life / f.l0 * 1.6); const sp = flameSpr(i); c.drawImage(sp, f.x - r, f.y - r, r * 2, r * 2) }
    c.globalCompositeOperation = 'source-over';
    for (const f of MG.flames) { const k = 1 - f.life / f.l0; if (k < .6) continue; const r = f.r * (1 + k * 2.6); c.globalAlpha = (1 - k) * 1.8 * .5; c.drawImage(flameSpr(2), f.x - r, f.y - r - 6, r * 2, r * 2) }
    c.globalAlpha = 1;
  }
  if (MG.beams.length) {
    c.lineCap = 'round'; c.globalCompositeOperation = 'lighter';
    for (const b of MG.beams) {
      c.strokeStyle = `rgba(${b.c},.22)`; c.lineWidth = 9 * b.w; c.beginPath(); c.moveTo(b.x0, b.y0); c.lineTo(b.x1, b.y1); c.stroke();
      c.strokeStyle = `rgba(${b.c},.8)`; c.lineWidth = 3.2 * b.w; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.2 * b.w; c.stroke();
      const g = flameSpr(0); c.globalAlpha = .9; c.drawImage(g, b.x1 - 13, b.y1 - 13, 26, 26); c.globalAlpha = 1;
    }
    c.globalCompositeOperation = 'source-over';
  }
}
function drawBurn(c, z, now) {
  const H = z.D.h * z.sc, t = now / 70; c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const fx = Math.sin(t + i * 2.1) * H * .14, fy = -H * (.2 + i * .22) - Math.abs(Math.sin(t * 1.3 + i)) * 5, r = H * (.2 - i * .02); c.globalAlpha = .75; c.drawImage(flameSpr(i % 2), fx - r, fy - r, r * 2, r * 2) }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}

/* ---------- akadályok ---------- */
function propStep(dt) {
  const V = MG.V, cA = Math.cos(V.a), sA = Math.sin(V.a), fwd = V.vx * cA + V.vy * sA, fext = FRONT + V.fext;
  for (const p of MG.trk.props) {
    if (p.dead || p.x < V.x - 200) continue; if (p.x > V.x + 300) break;
    const [lx, ly] = vLoc(V, p.x, p.y - p.h * .5);
    if (lx < HB.x0 || lx > fext + p.w * .5 || ly < HB.y0 - 8 || ly > HB.y1 + 4) continue;
    if (p.k === 'fuel') { p.dead = 1; V.fuel = Math.min(V.fuel0, V.fuel + V.fuel0 * .18 + 6); floatTxt(p.x, p.y - 30, '+ÜZEMANYAG', '#ffd24a'); sndPick(); continue }
    if (p.k === 'cash') { p.dead = 1; MG.cash += p.v; floatTxt(p.x, p.y - 30, '+' + p.v + ' kupak', '#9dff7a'); sndPick(); continue }
    if (p.k === 'boom') { p.dead = 1; explode(p.x, p.y - 10, 120, 220, 'barrel'); hurt(7 * (1 - V.fprot), 'barrel'); V.vy -= 120; V.w -= .6; continue }
    if (p.k === 'barr') {
      const e = Math.max(0, fwd) * V.fm * (1 + V.fprot);
      if (e > p.hp) { p.dead = 1; V.vx -= cA * fwd * .22 * (1 - V.fsr * .5); debris(p); hurt(3 * (1 - V.fprot), 'barr'); MG.shake = Math.max(MG.shake, .4); MG.pts += 15; sndThud(.5) }
      else { p.hp -= e * .5 + V.fdps * dt; if (p.hp <= 0) { p.dead = 1; debris(p); continue } const bk = Math.max(0, fwd); V.vx -= cA * (bk * 1.3 + 10); V.vy -= sA * (bk * 1.3 + 10); if (bk > 80) { hurt(bk * .04, 'barr'); MG.shake = .5; sndThud(.5) } }
    }
  }
}
function debris(p) {
  const wood = p.kind === 'wood';
  for (let i = 0; i < (LOWFX ? 8 : 16); i++) MG.gibs.push({x: p.x + rnd(-10, 10), y: p.y - rnd(5, p.h), vx: MG.V.vx * rnd(.6, 1.3) + rnd(-50, 80), vy: -rnd(80, 280), a: rnd(0, 6), w: rnd(-12, 12), k: wood ? 'plank' : 'sand', s: rnd(4, 9), life: rnd(3, 5), c: wood ? '#7a5a34' : '#a8956a'});
  for (let i = 0; i < 5; i++) MG.fx.push({k: 'puff', x: p.x + rnd(-14, 14), y: p.y - rnd(4, 30), r: rnd(10, 22), t: 0, d: rnd(.5, 1), c: wood ? '120,100,80' : '170,150,110'});
}

/* ---------- fegyverek ---------- */
function fireGun() {
  const V = MG.V;
  if (V.ammo <= 0) { if (MG.sv.up.agyu === 0) toast('A cső be van dugva – a Műhelyben vehetsz lőszert.'); return }
  if (V.rl > 0) return;
  V.ammo--; V.rl = V.rl0;
  const ea = V.a + GUN_A, [x, y] = vPt(V, MUZ[0], MUZ[1]), sp = 950;
  MG.shells.push({x, y, vx: V.vx + Math.cos(ea) * sp, vy: V.vy + Math.sin(ea) * sp, t: 3});
  const rk = Math.min(1, V.rl0 / 2.5); V.vx -= Math.cos(V.a) * 30 * rk; V.w -= .35 * rk;
  for (let i = 0; i < 8; i++) MG.fx.push({k: 'puff', x: x + rnd(0, 30), y: y + rnd(-8, 8), r: rnd(8, 18), t: 0, d: rnd(.4, .9), c: '200,190,170'});
  MG.fx.push({k: 'flash', x, y, t: 0, d: .09, big: 1});
  MG.shake = Math.max(MG.shake, .6 * rk + .1); sndGun();
}
function shellStep(dt) {
  for (const s of MG.shells) {
    s.vy += GRAV * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
    let hit = s.y >= gY(s.x) || s.t <= 0;
    if (!hit) for (const z of MG.z) if (z.st !== 'dead' && Math.abs(z.x - s.x) < z.D.w && s.y > z.y - z.D.h * z.sc && s.y < z.y + 4) { hit = true; break }
    if (hit) { s.dead = 1; const ag = ST('agyu'); explode(s.x, Math.min(s.y, gY(s.x)), ag.rad, ag.dm, 'shell') }
  }
  MG.shells = MG.shells.filter(s => !s.dead);
}
function explode(x, y, R, dm, how) {
  boomFx(x, y, R / 110);
  for (const z of MG.z) {
    if (z.st === 'dead') continue; const d = Math.hypot(z.x - x, z.y - 20 - y); if (d > R) continue;
    const k = 1 - d / R, dir = Math.sign(z.x - x) || 1;
    if (!damageZ(z, dm * (.35 + .65 * k), dir * 420 * k, -380 * k - 100, 'boom')) { z.st = 'air'; z.vx = dir * (200 + 300 * k); z.vy = -200 - 300 * k; z.spin = dir * rnd(4, 12) }
  }
  for (const p of MG.trk.props) if (!p.dead && Math.abs(p.x - x) < R) { if (p.k === 'barr') { p.dead = 1; debris(p) } else if (p.k === 'boom') { p.dead = 1; setTimeout(() => { if (MG.trk) explode(p.x, p.y - 10, 120, 220, 'barrel') }, 120) } }
  MG.dec.push({x, w: 6, tw: R * .45, c: '#1a1410', a: .8, g: 1});
  const V = MG.V, vd = Math.hypot(V.x - x, V.y - y); if (vd < R * .9) { const k = 1 - vd / R; V.vy -= 260 * k; V.vx += Math.sign(V.x - x) * 140 * k }
  MG.shake = Math.max(MG.shake, Math.min(1.2, R / 140)); sndBoom(R / 120);
}
function mgStep(dt) {
  const V = MG.V, g = ST('gepp'); if (!g.rt || MG.end) { V.mgF = 0; return }
  V.mgCd -= dt;
  const [mx, my] = vPt(V, MGP[0], MGP[1] - 4);
  let tg = null, bd = 1e9;
  for (const z of MG.z) { if (z.st === 'dead' || z.x < V.x + 10) continue; const d = Math.hypot(z.x - mx, z.y - 25 - my); if (d < g.rg && d < bd) { bd = d; tg = z } }
  V.mgF = 0;
  if (!tg) { V.mgA += (-V.a * 0 - V.mgA) * dt * 3; return }
  const ta = Math.atan2(tg.y - tg.D.h * tg.sc * .6 - my, tg.x - mx) - V.a;
  V.mgA += (ta - V.mgA) * Math.min(1, dt * 10);
  if (V.mgCd <= 0) {
    V.mgCd = 1 / g.rt; V.mgF = 1;
    const aa = V.mgA + V.a + rnd(-.03, .03), ex = mx + Math.cos(aa) * bd, ey = my + Math.sin(aa) * bd;
    MG.tracers.push({x0: mx + Math.cos(aa) * 14, y0: my + Math.sin(aa) * 14, x1: ex, y1: ey, t: .06});
    if (Math.random() < .85) { let d = g.dm; if (tg.t === 'riot' && MG.sv.up.gepp < 3) d *= .4; damageZ(tg, d, Math.cos(aa) * 160, -60, 'mg') }
    MG.fx.push({k: 'flash', x: mx + Math.cos(aa) * 16, y: my + Math.sin(aa) * 16, t: 0, d: .04});
    if (Math.random() < .5) MG.gibs.push({x: mx, y: my, vx: -40 + V.vx, vy: -rnd(60, 120), a: 0, w: 14, k: 'brass', s: 2.4, life: 1.4, c: '#d4a64a'});
    sndShot(.022);
  }
}
function ebulStep(dt) {
  const V = MG.V;
  for (const b of MG.ebul) {
    if (b.g) b.vy += GRAV * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.t -= dt;
    const [lx, ly] = vLoc(V, b.x, b.y);
    if (lx > HB.x0 && lx < HB.x1 && ly > HB.y0 && ly < HB.y1) { b.t = 0; if (b.k === 'acid') { hurt(3.5, 'acid'); for (let i = 0; i < 10; i++) part(b.x, b.y, rnd(-100, 100), rnd(-160, 0), 1, rnd(2, 3.5), '#a8d02a', 1); bloodOn(lx, ly, rnd(4, 8), '#7f9a1c') } else { hurt(2.6, 'shot'); sparks(b.x, b.y, 3) } }
    else if (b.y > gY(b.x)) { b.t = 0; if (b.k === 'acid') MG.dec.push({x: b.x, w: 3, tw: 16, c: '#7f9a1c', a: .7, g: 1}) }
  }
  MG.ebul = MG.ebul.filter(b => b.t > 0);
}

/* ============================================================================
   9. VÉR, BÉL, HÚSCAFAT, NYÁLKA
   ============================================================================ */
const PMAX = () => LOWFX ? 260 : 650;
function part(x, y, vx, vy, life, s, c, slime) { if (MG.parts.length > PMAX()) MG.parts.shift(); MG.parts.push({x, y, vx, vy, life, l0: life, s, c, sl: slime ? 1 : 0}) }
function bloodBurst(x, y, vx, vy, n, c) { n = LOWFX ? Math.ceil(n / 2) : n; for (let i = 0; i < n; i++) part(x, y, vx + rnd(-130, 130), vy + rnd(-170, 40), rnd(.6, 1.4), rnd(1.4, 3.6), c || '#8a0808', 0) }
function splatDecal(x, w, c) { MG.dec.push({x: x + rnd(-6, 6), w: 3, tw: w * rnd(.7, 1.3), c, a: rnd(.55, .85), g: 1}); if (MG.dec.length > (LOWFX ? 120 : 260)) MG.dec.shift() }
function limbGib(z, k, vx, vy) { const H = z.D.h * z.sc; MG.gibs.push({x: z.x, y: z.y - H * .7, vx: vx * .5 + rnd(-60, 60), vy: -rnd(120, 260), a: rnd(0, 6), w: rnd(-14, 14), k, s: H / 44, life: rnd(6, 9), c: skin(z), bl: z.D.bl}); bloodBurst(z.x, z.y - H * .7, vx * .2, -60, 10, z.D.bl) }
function gore(z, vx, vy, pw, how) {
  const H = z.D.h * z.sc, cx = z.x, cy = z.y - H * .55, big = z.D.big || 1, n = (LOWFX ? 14 : 34) * big * pw, bl = z.D.bl;
  // vérsugár
  for (let i = 0; i < n; i++) part(cx + rnd(-6, 6), cy + rnd(-H * .3, H * .3), vx * rnd(.3, 1) + rnd(-160, 160), Math.min(vy, -40) * rnd(.4, 1.1) + rnd(-200, 40), rnd(.7, 1.8), rnd(1.6, 4.4), Math.random() < .2 ? '#4a0000' : bl, z.t === 'bloater' || z.t === 'spitter' ? 1 : 0);
  // vérköd
  for (let i = 0; i < (LOWFX ? 2 : 5) * big; i++) MG.fx.push({k: 'puff', x: cx + rnd(-10, 10), y: cy + rnd(-12, 12), r: rnd(8, 18) * big, t: 0, d: rnd(.35, .7), c: z.t === 'bloater' ? '130,170,40' : '120,8,8'});
  // húscafatok + csont
  const ng = Math.round((LOWFX ? 4 : 8) * big * Math.min(1.6, pw));
  for (let i = 0; i < ng; i++) MG.gibs.push({x: cx + rnd(-8, 8), y: cy + rnd(-H * .3, H * .3), vx: vx * rnd(.4, 1.2) + rnd(-140, 140), vy: Math.min(vy, -60) * rnd(.5, 1.3) - rnd(40, 160), a: rnd(0, 6), w: rnd(-16, 16), k: Math.random() < .2 ? 'bone' : 'meat', s: rnd(3, 7) * Math.sqrt(big), life: rnd(5, 9), c: Math.random() < .5 ? '#9a2020' : '#c0505a', bl, pts: Array.from({length: 6}, () => rnd(.6, 1.2))});
  if (z.D.mon) { const sp = monSprite(z.t, 0), ch = sp._chunks || [], kk = H / sp.height; for (let i = 0; i < ch.length; i++) { if (Math.random() < (LOWFX ? .45 : .8)) { const r = ch[i]; MG.gibs.push({x: cx + (r[0] + r[2] / 2 - sp.width / 2) * kk * (z.dir < 0 ? 1 : -1), y: z.y - H + (r[1] + r[3] / 2) * kk, vx: vx * rnd(.3, 1.1) + rnd(-170, 170), vy: Math.min(vy, -60) * rnd(.4, 1.1) - rnd(60, 240), a: rnd(0, 6), w: rnd(-12, 12), k: 'chunk', img: sp, r, s: kk, fl: z.dir < 0 ? 1 : -1, life: rnd(5, 9), c: '#900', bl}) } } }
  if (z.head && Math.random() < .55) MG.gibs.push({x: cx, y: z.y - H * .92, vx: vx * .8 + rnd(-60, 60), vy: -rnd(180, 340), a: 0, w: rnd(-14, 14), k: 'head', s: H / 44, life: 8, c: skin(z), bl, hel: z.t === 'soldier' || z.t === 'riot'});
  if (z.armL) limbGib(z, 'arm', vx, vy); if (z.armR && Math.random() < .6) limbGib(z, 'arm', vx, vy);
  if (Math.random() < .7) MG.gibs.push({x: cx, y: z.y - H * .3, vx: vx * .5 + rnd(-40, 40), vy: -rnd(100, 200), a: rnd(0, 6), w: rnd(-10, 10), k: 'leg', s: H / 44, life: 8, c: z.t === 'soldier' ? '#4a5434' : '#3a3a4a', bl});
  // belek: verlet-lánc
  const ngu = (LOWFX ? 1 : 2) * (big > 1 ? 2 : 1) * (pw > 1.2 ? 1.5 : 1);
  for (let j = 0; j < ngu; j++) { const n2 = 7 + Math.floor(Math.random() * 5), gx = vx * rnd(.3, .9) + rnd(-80, 80), gy = -rnd(140, 300); const P = []; for (let i = 0; i < n2; i++) { const x = cx + i * 2, y = cy; P.push({x, y, px: x - gx / 60, py: y - gy / 60}) } MG.guts.push({P, life: rnd(8, 12), w: rnd(3.2, 4.6) * Math.sqrt(big), c: Math.random() < .5 ? '#c86a72' : '#b45560'}) }
  if (MG.guts.length > (LOWFX ? 10 : 26)) MG.guts.splice(0, MG.guts.length - (LOWFX ? 10 : 26));
  if (MG.gibs.length > (LOWFX ? 90 : 220)) MG.gibs.splice(0, MG.gibs.length - (LOWFX ? 90 : 220));
  // tetem és vértócsa
  splatDecal(z.x + vx * .08, 22 * big, bl);
  if (Math.random() < .45) { MG.corpses.push({x: z.x + vx * .12 + rnd(0, 30), t: z.t, s: z.sc * (z.D.h / 44), c: skin(z), sk: z.sk, f: Math.random() < .5 ? 1 : -1}); if (MG.corpses.length > (LOWFX ? 30 : 70)) MG.corpses.shift() }
  // a jármű orra véres lesz
  if (how === 'hit' || how === 'grind' || how === 'crush') { const nb = 2 + (MG.V.fdps > 0 ? 1 : 0) + (MG.V.fdps > 100 ? 1 : 0) + Math.round(((z.D.big || 1) - 1) * 2); for (let i = 0; i < nb; i++) bloodOn(FRONT - 14 + MG.V.fext * rnd(.3, 1) + rnd(-6, 8), rnd(-26, 20), rnd(3, 8) * Math.sqrt(z.D.big || 1), Math.random() < .5 ? bl : '#5a0000') }
  if (how === 'grind') grindSpray(z, MG.V, 3);
}
function grindSpray(z, V, mult) { // a dob felfelé-előre köpi a darált húst
  const [x, y] = vPt(V, FRONT + V.fext, -4), n = (LOWFX ? 3 : 7) * (mult || 1);
  for (let i = 0; i < n; i++) part(x + rnd(-4, 4), y + rnd(-12, 12), V.vx + rnd(20, 180), -rnd(120, 330), rnd(.6, 1.3), rnd(1.8, 3.6), Math.random() < .3 ? '#c0505a' : z.D.bl, 0);
  if (Math.random() < .5) MG.gibs.push({x, y, vx: V.vx + rnd(30, 150), vy: -rnd(160, 320), a: 0, w: rnd(-20, 20), k: 'meat', s: rnd(2, 4), life: 4, c: '#a83040', bl: z.D.bl, pts: Array.from({length: 6}, () => rnd(.6, 1.2))});
}
function sparks(x, y, n) { for (let i = 0; i < n; i++) part(x, y, rnd(-220, 220), rnd(-260, 20), rnd(.2, .5), rnd(1, 2), '#ffd27a', 0) }
function goreStep(dt) {
  const V = MG.V;
  // folyadék-cseppek: gravitáció, a földön tócsát hagynak
  for (const p of MG.parts) {
    p.vy += GRAV * 1.6 * dt; p.vx *= 1 - dt * .4; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    const h = gY(p.x);
    if (p.y >= h) { p.life = 0; if (Math.random() < (p.sl ? .5 : .28)) splatDecal(p.x, p.s * (p.sl ? 4 : 3), p.c) }
  }
  MG.parts = MG.parts.filter(p => p.life > 0);
  // húscafatok: pattognak, gurulnak, vércsíkot húznak
  for (const g of MG.gibs) {
    g.vy += GRAV * 1.5 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.a += g.w * dt; g.life -= dt;
    const h = gY(g.x);
    if (g.y > h - g.s * .5) { g.y = h - g.s * .5; if (g.vy > 60 && g.bl) { splatDecal(g.x, g.s * 2.4, g.bl); if (g.vy > 200) bloodBurst(g.x, g.y, g.vx * .2, -40, 2, g.bl) } g.vy *= -.32; g.vx *= .7; g.w *= .6; if (Math.abs(g.vy) < 20) g.vy = 0 }
    if (g.bl && g.k !== 'brass' && Math.random() < dt * 4 && Math.abs(g.vx) + Math.abs(g.vy) > 60) part(g.x, g.y, 0, 0, .8, 1.4, g.bl, 0);
  }
  MG.gibs = MG.gibs.filter(g => g.life > 0 && g.x > V.x - 1200);
  // belek: verlet + távolság-kényszer
  for (const G of MG.guts) {
    G.life -= dt;
    for (const p of G.P) { const vx = (p.x - p.px) * .985, vy = (p.y - p.py) * .985; p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + GRAV * 1.3 * dt * dt; const h = gY(p.x); if (p.y > h - 1.5) { p.y = h - 1.5; p.px = p.x - vx * .5 } }
    for (let it = 0; it < 3; it++) for (let i = 1; i < G.P.length; i++) { const a = G.P[i - 1], b = G.P[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, k = (d - 6) / d * .5; a.x += dx * k; a.y += dy * k; b.x -= dx * k; b.y -= dy * k }
  }
  MG.guts = MG.guts.filter(G => G.life > 0);
  // tócsák szétterülnek
  for (const d of MG.dec) if (d.tw && d.w < d.tw) d.w = Math.min(d.tw, d.w + dt * 40);
  if (MG.dec.length && MG.dec[0].x < V.x - 1400) MG.dec.shift();
  bloodStep(dt);
}
function fxStep(dt) {
  for (const f of MG.flames) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy -= 120 * dt; f.vx *= 1 - dt * 1.6 }
  MG.flames = MG.flames.filter(f => f.life > 0);
  for (const d of MG.dust) { d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 1 - dt * 1.4; d.vy *= 1 - dt * 1.1; d.r += d.g * dt }
  MG.dust = MG.dust.filter(d => d.life > 0);
  for (const f of MG.fx) f.t += dt; MG.fx = MG.fx.filter(f => f.t < f.d);
  for (const t of MG.tracers) t.t -= dt; MG.tracers = MG.tracers.filter(t => t.t > 0);
  for (const t of MG.txt) { t.t -= dt; t.y -= 40 * dt } MG.txt = MG.txt.filter(t => t.t > 0);
  if (MG.txt.length > 20) MG.txt.shift();
}
function floatTxt(x, y, s, c) { MG.txt.push({x, y, s, c, t: 1}) }
function boomFx(x, y, k) {
  MG.fx.push({k: 'ball', x, y, r: 60 * k, t: 0, d: .5});
  for (let i = 0; i < 10 * k; i++) MG.fx.push({k: 'puff', x: x + rnd(-40, 40) * k, y: y - rnd(0, 50) * k, r: rnd(16, 34) * k, t: 0, d: rnd(.8, 1.8), c: '60,50,45'});
  for (let i = 0; i < 14 * k; i++) MG.gibs.push({x, y: y - 6, vx: rnd(-300, 300) * k, vy: -rnd(150, 420) * k, a: 0, w: rnd(-10, 10), k: 'rock', s: rnd(2, 5), life: rnd(1.5, 3), c: '#3a3028'});
  sparks(x, y, 14);
}

/* ============================================================================
   10. RAJZOLÁS
   ============================================================================ */
const SKINS = ['#7d9a6a', '#8a9a7a', '#6f8a6a', '#9aa27e'];
function skin(z) { return z.t === 'bloater' ? '#8aa05a' : z.t === 'brute' ? '#7a8a6a' : z.t === 'soldier' ? '#c9a27e' : SKINS[z.sk] }
const SHIRT = ['#5a3a3a', '#3a4a5a', '#6a5a3a', '#4a4a4a'];

function draw(now) {
  const c = MG.ctx, W = MG.W, H = MG.H, T = MG.trk, V = MG.V, S = T.S;
  // kamera: a jármű bal harmadban, sebességgel előre néz és kizoomol
  const sp = Math.hypot(V.vx, V.vy);
  const s0 = clamp(Math.min(W / (W < H ? 420 : 520), H / 320), .6, 2.6) * (1 - Math.min(.12, sp / 2400));
  const fd = MG.fdt || .016, kc = 1 - Math.exp(-fd * 3), kx = 1 - Math.exp(-fd * 8), ky = 1 - Math.exp(-fd * 6);
  MG.cam.s += (s0 - MG.cam.s) * kc;
  const sc = MG.cam.s; MG.viewW = W / sc;
  const tx = V.x - W / sc * .36 + clamp(V.vx, -100, 320) * .32, ty = V.y - H / sc * .62 + clamp(V.vy, -320, 320) * .14;
  MG.cam.x += (tx - MG.cam.x) * kx; MG.cam.y += (ty - MG.cam.y) * ky;
  const sh = MG.shake * 9, ox = (Math.random() - .5) * sh, oy = (Math.random() - .5) * sh;
  c.setTransform(MG.dpr, 0, 0, MG.dpr, 0, 0);
  // ég
  if (!MG.skyC || MG.skyC.si !== T.si || MG.skyC.W !== W || MG.skyC.H !== H || MG.skyC.d !== MG.dpr) {
    const cv = document.createElement('canvas'); cv.width = Math.max(1, W * MG.dpr | 0); cv.height = Math.max(1, H * MG.dpr | 0); const x = cv.getContext('2d'); x.scale(MG.dpr, MG.dpr);
    const sg = x.createLinearGradient(0, 0, 0, H); S.sky.forEach((col, i) => sg.addColorStop(i / (S.sky.length - 1), col)); x.fillStyle = sg; x.fillRect(0, 0, W, H);
    const sr = Math.min(W, H) * .5, sgl = x.createRadialGradient(W * .72, H * .3, 0, W * .72, H * .3, sr); sgl.addColorStop(0, 'rgba(255,240,200,.95)'); sgl.addColorStop(.07, 'rgba(255,225,160,.75)'); sgl.addColorStop(.3, 'rgba(255,170,90,.22)'); sgl.addColorStop(1, 'rgba(255,120,60,0)'); x.fillStyle = sgl; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${(.15 + (i * 7 % 10) / 22).toFixed(2)})`; if (T.si === 2) x.fillRect((i * 97.3) % W, (i * 53.1) % (H * .45), 1.4, 1.4) }
    cv.si = T.si; cv.W = W; cv.H = H; cv.d = MG.dpr; MG.skyC = cv;
  }
  c.drawImage(MG.skyC, 0, 0, W, H);
  // távoli rom-város (parallax)
  const px1 = MG.cam.x * .15, hor = H * .62 - (MG.cam.y + 300) * sc * .08;
  c.fillStyle = S.far;
  for (const b of T.sky) { const x = (b.x - px1) * sc * .8; if (x < -100 || x > W + 100) continue; const w = b.w * sc * .8, h = b.h * sc * .8; c.beginPath(); c.moveTo(x, hor); c.lineTo(x, hor - h); if (b.br) { c.lineTo(x + w * .3, hor - h * (1 - b.br * .4)); c.lineTo(x + w * .55, hor - h * .8); c.lineTo(x + w * .7, hor - h * (1 - b.br)); } c.lineTo(x + w, hor - h * (b.br ? .6 : 1)); c.lineTo(x + w, hor); c.fill() }
  c.fillRect(0, hor, W, H - hor);
  { const hz = c.createLinearGradient(0, hor - 90 * sc, 0, hor + 10); hz.addColorStop(0, 'rgba(255,170,100,0)'); hz.addColorStop(1, 'rgba(255,170,100,.16)'); c.fillStyle = hz; c.fillRect(0, hor - 90 * sc, W, 100 * sc); c.fillStyle = S.far }
  // füstoszlopok
  c.fillStyle = 'rgba(20,10,8,.25)'; for (let i = 0; i < 3; i++) { const x = ((i * 700 + 300 - px1 * .6) % 2100 + 2100) % 2100 * sc * .8 - 100; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + k * 14 * sc + Math.sin(now / 900 + k) * 6, hor - k * 26 * sc, (14 + k * 7) * sc, 0, 7); c.fill() } }
  // közeli réteg
  const px2 = MG.cam.x * .45, hor2 = H * .74 - (MG.cam.y + 300) * sc * .25;
  c.fillStyle = S.mid;
  for (const m of T.mids) { const x = (m.x - px2) * sc, h = m.h * sc; if (x < -80 || x > W + 80) continue;
    if (m.k === 'tree') { c.fillRect(x - 2 * sc, hor2 - h, 4 * sc, h); c.strokeStyle = S.mid; c.lineWidth = 2 * sc; c.beginPath(); c.moveTo(x, hor2 - h * .7); c.lineTo(x - 14 * sc, hor2 - h * .95); c.moveTo(x, hor2 - h * .55); c.lineTo(x + 16 * sc, hor2 - h * .8); c.stroke() }
    else if (m.k === 'pole') { c.fillRect(x - 1.5 * sc, hor2 - h * 1.2, 3 * sc, h * 1.2); c.fillRect(x - 12 * sc, hor2 - h * 1.15, 24 * sc, 2.5 * sc); c.strokeStyle = S.mid; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 12 * sc, hor2 - h * 1.13); c.quadraticCurveTo(x + 60 * sc, hor2 - h, x + 140 * sc, hor2 - h * 1.13); c.stroke() }
    else { c.fillRect(x, hor2 - h * .7, 60 * sc, h * .7); c.beginPath(); c.moveTo(x - 4 * sc, hor2 - h * .7); c.lineTo(x + 30 * sc, hor2 - h); c.lineTo(x + 50 * sc, hor2 - h * .82); c.lineTo(x + 64 * sc, hor2 - h * .7); c.fill() } }
  c.fillRect(0, hor2, W, H - hor2);
  { const hz = c.createLinearGradient(0, hor2 - 70 * sc, 0, hor2 + 6); hz.addColorStop(0, 'rgba(60,30,20,0)'); hz.addColorStop(1, 'rgba(60,30,20,.2)'); c.fillStyle = hz; c.fillRect(0, hor2 - 70 * sc, W, 76 * sc) }
  // világ-transzformáció
  c.setTransform(MG.dpr * sc, 0, 0, MG.dpr * sc, (-MG.cam.x * sc + ox) * MG.dpr, (-MG.cam.y * sc + oy) * MG.dpr);
  const x0 = MG.cam.x - 60, x1 = MG.cam.x + W / sc + 60, yB = MG.cam.y + H / sc + 60;
  // célkapu
  if (T.fin > x0 - 200 && T.fin < x1 + 200) drawFinish(c, T.fin, gY(T.fin), now);
  // talaj
  const i0 = Math.max(0, Math.floor(x0 / STEP)), i1 = Math.min(T.N - 1, Math.ceil(x1 / STEP));
  const gg = c.createLinearGradient(0, MG.cam.y, 0, yB); gg.addColorStop(0, S.gr[0]); gg.addColorStop(1, S.gr[1]);
  c.fillStyle = gg; c.beginPath(); c.moveTo(i0 * STEP, yB);
  for (let xx = i0 * STEP; xx <= i1 * STEP; xx += STEP / 2) c.lineTo(xx, gY(xx));
  c.lineTo(i1 * STEP, yB); c.closePath(); c.fill();
  c.strokeStyle = S.road; c.lineWidth = 7; c.beginPath(); for (let xx = i0 * STEP; xx <= i1 * STEP; xx += STEP / 2) { if (xx === i0 * STEP) c.moveTo(xx, gY(xx) + 3); else c.lineTo(xx, gY(xx) + 3) } c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = 'rgba(255,200,140,.16)'; c.lineWidth = 1.2; c.beginPath(); for (let xx = i0 * STEP; xx <= i1 * STEP; xx += STEP) { if (xx === i0 * STEP) c.moveTo(xx, gY(xx) - .6); else c.lineTo(xx, gY(xx) - .6) } c.stroke();
  // kavicsok
  c.fillStyle = 'rgba(0,0,0,.25)'; for (let i = i0; i <= i1; i += 2) { const h = (i * 7919) % 13; c.fillRect(i * STEP + h, T.g[i] + 10 + h, 3, 2) }
  // tócsák (vér, sav, korom)
  for (const d of MG.dec) { if (d.x < x0 || d.x > x1) continue; const y = gY(d.x), sl = gSl(d.x); c.save(); c.translate(d.x, y + 1); c.rotate(Math.atan(sl)); c.globalAlpha = d.a; c.fillStyle = d.c; c.beginPath(); c.ellipse(0, 0, d.w, Math.max(1.2, d.w * .16), 0, 0, 7); c.fill(); c.restore() }
  c.globalAlpha = 1;
  // tetemek
  for (const k of MG.corpses) if (k.x > x0 && k.x < x1) drawCorpse(c, k);
  // roncsok, figyelmeztető táblák
  for (const w of T.wrecks) if (w.x > x0 - 100 && w.x < x1 + 100) drawWreck(c, w);
  for (const d of T.deco) if (d.k === 'warn' && d.x > x0 - 40 && d.x < x1 + 40) drawSign(c, d.x, gY(d.x));
  for (const p of T.props) if (!p.dead && p.x > x0 - 40 && p.x < x1 + 40) drawProp(c, p, now);
  // ellenségek
  for (const z of MG.z) if (z.x > x0 - 60 && z.x < x1 + 60) drawZ(c, z, now);
  // por és lánctalp-árnyék
  { const gy = gY(V.x); if (Math.abs(gy - V.y) < 120) { c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(V.x, gy + 2, 135, 5, Math.atan(gSl(V.x)), 0, 7); c.fill() } }
  for (const d of MG.dust) { if (d.x < x0 || d.x > x1) continue; const k = d.life / d.l0; c.globalAlpha = Math.min(1, k) * d.a; c.fillStyle = S.gr[0]; c.beginPath(); c.arc(d.x, d.y, d.r, 0, 7); c.fill() }
  c.globalAlpha = 1;
  // jármű + kapaszkodók
  drawVeh(c, V, now, MG.sv.up, true);
  c.save(); c.translate(V.x, V.y); c.rotate(V.a); for (const z of MG.grab) drawZLocal(c, z, now, z.gx, z.gy); c.restore();
  // lövedékek
  c.fillStyle = '#2a2a2a'; for (const s of MG.shells) { c.save(); c.translate(s.x, s.y); c.rotate(Math.atan2(s.vy, s.vx)); c.fillRect(-8, -2.5, 16, 5); c.restore(); c.fillStyle = 'rgba(220,210,190,.35)'; c.beginPath(); c.arc(s.x - s.vx * .02, s.y - s.vy * .02, 4, 0, 7); c.fill(); c.fillStyle = '#2a2a2a' }
  for (const b of MG.ebul) { if (b.k === 'acid') { c.fillStyle = '#a8d02a'; c.beginPath(); c.arc(b.x, b.y, 4, 0, 7); c.fill() } else { c.strokeStyle = 'rgba(255,220,120,.9)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - b.vx * .02, b.y - b.vy * .02); c.stroke() } }
  c.strokeStyle = 'rgba(255,230,140,.85)'; c.lineWidth = 1.4; c.beginPath(); for (const t of MG.tracers) { c.moveTo(t.x0, t.y0); c.lineTo(t.x1, t.y1) } c.stroke();
  // belek
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const G of MG.guts) { c.globalAlpha = Math.min(1, G.life / 2); c.strokeStyle = '#5a1a1e'; c.lineWidth = G.w + 2; c.beginPath(); G.P.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.stroke(); c.strokeStyle = G.c; c.lineWidth = G.w; c.stroke(); c.strokeStyle = 'rgba(255,200,200,.35)'; c.lineWidth = 1; c.stroke() }
  c.globalAlpha = 1;
  // húscafatok
  for (const g of MG.gibs) if (g.x > x0 && g.x < x1) drawGib(c, g);
  // cseppek (folyadék: sebesség irányába nyúlnak)
  for (const p of MG.parts) { if (p.x < x0 || p.x > x1) continue; c.globalAlpha = Math.min(1, p.life / p.l0 * 2); c.fillStyle = p.c; const v = Math.hypot(p.vx, p.vy), st = Math.min(3.2, 1 + v / 260); c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(p.vy, p.vx)); c.beginPath(); c.ellipse(0, 0, p.s * st, p.s * (p.sl ? .9 : .7), 0, 0, 7); c.fill(); c.restore() }
  c.globalAlpha = 1;
  // effektek
  for (const f of MG.fx) { const k = f.t / f.d;
    if (f.k === 'puff') { c.fillStyle = `rgba(${f.c},${(1 - k) * .55})`; c.beginPath(); c.arc(f.x, f.y - k * 16, f.r * (.6 + k * .8), 0, 7); c.fill() }
    else if (f.k === 'flash') { c.fillStyle = `rgba(255,220,120,${1 - k})`; c.beginPath(); c.arc(f.x, f.y, f.big ? 22 : 6, 0, 7); c.fill() }
    else if (f.k === 'ball') { c.globalCompositeOperation = 'lighter'; const r = f.r * (.4 + k); const gr = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, r); gr.addColorStop(0, `rgba(255,250,200,${1 - k})`); gr.addColorStop(.4, `rgba(255,150,40,${(1 - k) * .9})`); gr.addColorStop(1, 'rgba(120,30,10,0)'); c.fillStyle = gr; c.beginPath(); c.arc(f.x, f.y, r, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over' } }
  drawFlames(c);
  c.font = 'bold 15px sans-serif'; c.textAlign = 'center';
  for (const t of MG.txt) { c.globalAlpha = Math.min(1, t.t * 2); c.fillStyle = '#000'; c.fillText(t.s, t.x + 1, t.y + 1); c.fillStyle = t.c; c.fillText(t.s, t.x, t.y) }
  c.globalAlpha = 1;
  // képernyő-rétegek
  c.setTransform(MG.dpr, 0, 0, MG.dpr, 0, 0);
  if (!MG.vigC || MG.vigC.W !== W || MG.vigC.H !== H) { const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .42, W / 2, H / 2, Math.max(W, H) * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,4,2,.5)'); MG.vigC = {g, W, H} }
  c.fillStyle = MG.vigC.g; c.fillRect(0, 0, W, H);
  if (MG.hurtT > 0) { const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7); vg.addColorStop(0, 'rgba(160,0,0,0)'); vg.addColorStop(1, `rgba(160,0,0,${MG.hurtT * 1.4})`); c.fillStyle = vg; c.fillRect(0, 0, W, H) }
  if (V.hp / V.hp0 < .25 && !MG.end) { c.fillStyle = `rgba(200,0,0,${.08 + .06 * Math.sin(now / 120)})`; c.fillRect(0, 0, W, H) }
  if (MG.comboShow) { const k = MG.comboShow.t; c.save(); c.translate(W / 2, H * .3); const s = 1 + Math.max(0, k - 1) * 2; c.scale(s, s); c.font = `900 ${Math.min(42, 22 + MG.comboShow.n)}px Anton, Impact, sans-serif`; c.textAlign = 'center'; c.globalAlpha = Math.min(1, k * 2); c.fillStyle = '#000'; c.fillText(`×${MG.comboShow.n} ${MG.comboShow.n >= 12 ? 'HÚSDARÁLÓ!' : MG.comboShow.n >= 7 ? 'VÉRFÜRDŐ!' : 'KOMBÓ!'}`, 2, 2); c.fillStyle = MG.comboShow.n >= 12 ? '#ff3b30' : '#ffd24a'; c.fillText(`×${MG.comboShow.n} ${MG.comboShow.n >= 12 ? 'HÚSDARÁLÓ!' : MG.comboShow.n >= 7 ? 'VÉRFÜRDŐ!' : 'KOMBÓ!'}`, 0, 0); c.restore() }
  if (MG.hordeMsg > 0 && Math.sin(now / 110) > -.3) { c.font = '900 26px Anton, Impact, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText('⚠ HORDA ELŐTTED ⚠', W / 2 + 2, H * .2 + 2); c.fillStyle = '#ff5a3a'; c.fillText('⚠ HORDA ELŐTTED ⚠', W / 2, H * .2) }
  if (V.flipT > .3 && !MG.end) { c.font = '900 20px Anton, Impact, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ffd24a'; c.fillText('FELBORULTÁL! BILLENTS VISSZA! ' + Math.max(0, 2.4 - V.flipT).toFixed(1), W / 2, H * .42) }
}

function drawFinish(c, x, y, now) {
  c.fillStyle = '#3a3a34'; c.fillRect(x - 6, y - 150, 12, 150); c.fillRect(x + 150, y - 150, 12, 150);
  c.fillStyle = '#5a4a2a'; c.fillRect(x - 10, y - 160, 176, 22);
  c.fillStyle = '#ffd24a'; c.font = 'bold 16px sans-serif'; c.textAlign = 'center'; c.fillText('MENEDÉK', x + 78, y - 143);
  for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#111' : '#eee'; c.fillRect(x - 6 + i * 21, y - 138, 21, 8) }
  c.fillStyle = '#c0392b'; c.beginPath(); const fw = Math.sin(now / 200) * 4; c.moveTo(x, y - 200); c.lineTo(x + 34, y - 192 + fw); c.lineTo(x, y - 180); c.fill(); c.fillStyle = '#222'; c.fillRect(x - 1.5, y - 202, 3, 50);
  // szögesdrót-fal
  c.strokeStyle = '#777'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 20; i++) { c.moveTo(x + 170 + i * 10, y - 40); c.arc(x + 170 + i * 10, y - 40, 6, 0, 7) } c.stroke();
  c.fillStyle = '#4a4a3a'; c.fillRect(x + 170, y - 34, 220, 34);
}
function drawSign(c, x, y) { c.fillStyle = '#3a2a1a'; c.fillRect(x - 2, y - 46, 4, 46); c.fillStyle = '#e8b21a'; c.beginPath(); c.moveTo(x, y - 74); c.lineTo(x + 20, y - 42); c.lineTo(x - 20, y - 42); c.closePath(); c.fill(); c.fillStyle = '#111'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.fillText('!', x, y - 47); c.font = 'bold 9px sans-serif'; c.fillStyle = '#e8b21a'; c.fillText('HORDA', x, y - 30) }
function drawWreck(c, w) {
  const R = mulberry(w.seed);
  for (let i = 0; i < w.cars; i++) {
    const cx = w.x + (R() - .5) * w.w * .5, y = gY(cx) + 4 - i * 2, a = (R() - .5) * .5, up = R() < .25;
    c.save(); c.translate(cx, y - 8 - (w.cars - 1 - i) * 0); c.rotate(a + (up ? Math.PI : 0) * 0);
    const L = 46, H = 14; c.fillStyle = i % 2 ? '#3a2a22' : w.c; c.fillRect(-L / 2, -H, L, H);
    c.beginPath(); c.moveTo(-L * .3, -H); c.lineTo(-L * .18, -H - 10); c.lineTo(L * .2, -H - 10); c.lineTo(L * .32, -H); c.fill();
    c.fillStyle = '#111'; c.fillRect(-L * .14, -H - 8, L * .14, 7); c.fillRect(L * .03, -H - 8, L * .14, 7);
    c.fillStyle = '#6a3a1a'; c.fillRect(-L / 2 + 4, -H + 3, 8, 4); c.fillRect(L * .1, -H + 5, 10, 3);
    c.fillStyle = '#181818'; c.beginPath(); c.arc(-L * .3, 0, 5, 0, 7); c.arc(L * .3, 0, 5, 0, 7); c.fill();
    c.restore();
  }
}
function drawProp(c, p, now) {
  const x = p.x, y = p.y;
  if (p.k === 'barr') {
    if (p.kind === 'wood') { c.fillStyle = '#6a4a2a'; for (let i = 0; i < 4; i++) c.fillRect(x - p.w / 2, y - p.h + i * 9, p.w, 6); c.fillStyle = '#3a2a1a'; c.fillRect(x - p.w / 2 + 3, y - p.h, 4, p.h); c.fillRect(x + p.w / 2 - 7, y - p.h, 4, p.h); c.strokeStyle = '#8a8a8a'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(x - p.w / 2 + i * 8, y - p.h - 4); c.arc(x - p.w / 2 + i * 8, y - p.h - 4, 4, 0, 7) } c.stroke() }
    else { for (let r = 0; r < 4; r++) for (let i = 0; i < 3 - (r > 2 ? 1 : 0); i++) { c.fillStyle = (r + i) % 2 ? '#8a7a52' : '#9a8a60'; c.beginPath(); c.ellipse(x - p.w / 2 + 6 + i * 10 + (r % 2) * 4, y - 5 - r * 9, 6.5, 5, 0, 0, 7); c.fill() } }
  } else if (p.k === 'boom') { c.fillStyle = '#a01e14'; c.fillRect(x - 7, y - 20, 14, 20); c.fillStyle = '#5a0e08'; c.fillRect(x - 7, y - 15, 14, 2); c.fillRect(x - 7, y - 7, 14, 2); c.fillStyle = '#ffd24a'; c.font = 'bold 8px sans-serif'; c.textAlign = 'center'; c.fillText('☢', x, y - 9) }
  else if (p.k === 'fuel') { const b = Math.sin(now / 250 + x) * 2; c.fillStyle = '#c0392b'; c.fillRect(x - 7, y - 18 + b, 14, 18); c.fillStyle = '#7a1e14'; c.fillRect(x - 3, y - 22 + b, 6, 4); c.strokeStyle = '#ffd24a'; c.lineWidth = 1; c.strokeRect(x - 7, y - 18 + b, 14, 18); c.fillStyle = 'rgba(255,210,74,.25)'; c.beginPath(); c.arc(x, y - 10 + b, 16, 0, 7); c.fill() }
  else if (p.k === 'cash') { const b = Math.sin(now / 250 + x) * 2; c.fillStyle = '#5a4a2a'; c.fillRect(x - 8, y - 14 + b, 16, 14); c.fillStyle = '#c9a227'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x - 5 + i * 3.5, y - 15 + b, 2.4, 0, 7); c.fill() } c.fillStyle = 'rgba(157,255,122,.2)'; c.beginPath(); c.arc(x, y - 8 + b, 16, 0, 7); c.fill() }
}
function drawCorpse(c, k) {
  if (ZT[k.t].mon) { const sp = monSprite(k.t, 0), y = gY(k.x), kk = ZT[k.t].h * k.s / (ZT[k.t].h / 44) / sp.height * .9; c.save(); c.translate(k.x, y - 2); c.rotate(Math.atan(gSl(k.x))); c.scale(k.f, 1); c.rotate(Math.PI / 2 * .93); c.imageSmoothingEnabled = false; c.globalAlpha = .9; c.drawImage(sp, -sp.width * kk / 2, -sp.height * kk * .12, sp.width * kk, sp.height * kk); c.fillStyle = 'rgba(70,0,0,.45)'; c.fillRect(-sp.width * kk / 2, -sp.height * kk * .12, sp.width * kk, sp.height * kk); c.restore(); return }
  const y = gY(k.x); c.save(); c.translate(k.x, y - 3); c.rotate(Math.atan(gSl(k.x))); c.scale(k.f * k.s, k.s);
  c.fillStyle = '#4a0505'; c.beginPath(); c.ellipse(0, 3, 20, 3, 0, 0, 7); c.fill();
  c.fillStyle = k.t === 'soldier' ? '#4a5434' : SHIRT[k.sk]; c.fillRect(-12, -5, 16, 7);
  c.fillStyle = k.c; c.beginPath(); c.arc(9, -2, 4.5, 0, 7); c.fill();
  c.fillStyle = '#8a1a1a'; c.beginPath(); c.arc(-12, -1, 3.5, 0, 7); c.fill();
  c.restore();
}
function drawGib(c, g) {
  c.save(); c.translate(g.x, g.y); c.rotate(g.a); c.globalAlpha = Math.min(1, g.life);
  if (g.k === 'meat') { c.fillStyle = g.c; c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, r = g.s * (g.pts ? g.pts[i] : 1); i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r) } c.fill(); c.fillStyle = 'rgba(255,190,190,.4)'; c.fillRect(-g.s * .3, -g.s * .3, g.s * .4, g.s * .3) }
  else if (g.k === 'chunk') { c.scale(g.s * g.fl, g.s); c.imageSmoothingEnabled = false; c.drawImage(g.img, g.r[0], g.r[1], g.r[2], g.r[3], -g.r[2] / 2, -g.r[3] / 2, g.r[2], g.r[3]); c.fillStyle = 'rgba(120,0,0,.35)'; c.fillRect(-g.r[2] / 2, g.r[3] * .15, g.r[2], g.r[3] * .35) }
  else if (g.k === 'bone') { c.fillStyle = '#eee6d0'; c.fillRect(-g.s, -1.2, g.s * 2, 2.4); c.beginPath(); c.arc(-g.s, 0, 2, 0, 7); c.arc(g.s, 0, 2, 0, 7); c.fill() }
  else if (g.k === 'head') { c.scale(g.s, g.s); c.fillStyle = g.c; c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill(); c.fillStyle = '#2a0000'; c.fillRect(-3.5, -1.5, 2.5, 2); c.fillRect(1, -1.5, 2.5, 2); c.fillStyle = '#8a0808'; c.fillRect(-3, 5, 6, 2.5); if (g.hel) { c.fillStyle = '#3a4228'; c.beginPath(); c.arc(0, -1, 6.8, Math.PI, 0); c.fill() } }
  else if (g.k === 'arm' || g.k === 'leg') { c.scale(g.s, g.s); c.strokeStyle = g.c; c.lineWidth = g.k === 'leg' ? 5 : 3.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.stroke(); c.fillStyle = '#9a1010'; c.beginPath(); c.arc(-8, 0, 2.6, 0, 7); c.fill(); c.fillStyle = '#eee6d0'; c.fillRect(-10, -.8, 3, 1.6) }
  else if (g.k === 'plank') { c.fillStyle = g.c; c.fillRect(-g.s, -1.5, g.s * 2, 3) }
  else if (g.k === 'brass') { c.fillStyle = g.c; c.fillRect(-1.5, -.8, 3, 1.6) }
  else { c.fillStyle = g.c; c.fillRect(-g.s / 2, -g.s / 2, g.s, g.s) }
  c.restore();
}

/* ---------- zombik ---------- */
function drawZ(c, z, now) {
  c.save(); c.translate(z.x, z.y);
  if (z.rot) { c.translate(0, -z.D.h * z.sc * .25); c.rotate(z.rot); c.translate(0, z.D.h * z.sc * .25) }
  zBody(c, z, now); if (z.burn > 0) drawBurn(c, z, now); c.restore();
}
function drawZLocal(c, z, now, gx, gy) { c.save(); c.translate(gx, gy); c.rotate(-.2 + Math.sin(z.ph) * .1); zBody(c, z, now, 1); if (z.burn > 0) drawBurn(c, z, now); c.restore() }
// Zombik: emberi arányú, görnyedt alakok; a rajz a lábfejnél (0,0) kezdődik, 44 egység magas, balra néz.
// Vázlat: két lába (comb + sípcsont, lendítéskor behajló térd), görnyedt törzs, előre lógó fej nyitott állkapoccsal,
// két előrenyújtott kar (felkar: ruha, alkar: bőr), típusonként eltérő ruházat és tartozék.
function zlimb(c, pts, w, col) {
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#150b0b'; c.lineWidth = w + 1.6; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
}
const ZPANT = ['#2c3040', '#3a3226', '#262a30', '#4a3a38'];
function zBody(c, z, now, clinging) {
  if (z.D.mon) { zMon(c, z, clinging); return }
  const D = z.D, t = z.t, s = z.sc * (D.h / 44), hit = z.hitT > 0, p = z.ph, OL = '#150b0b';
  c.scale(s * (z.dir < 0 ? 1 : -1), s);
  const sk = hit ? '#fff' : skin(z), skD = hit ? '#fff' : shade(skin(z).length === 7 ? skin(z) : '#7d9a6a', .72);
  const shirt = hit ? '#fff' : t === 'soldier' ? '#4f5a38' : t === 'riot' ? '#262a32' : SHIRT[z.sk];
  const pant = hit ? '#fff' : t === 'soldier' ? '#3a4228' : t === 'riot' ? '#14161a' : ZPANT[z.sk];
  const walk = (z.st === 'walk' && z.spd > 0) || clinging, air = z.st === 'leap' || z.st === 'air';
  const lean = t === 'runner' ? .55 : t === 'brute' ? .24 : t === 'bloater' ? .12 : t === 'soldier' || t === 'riot' ? .07 : .32 + (z.sk === 1 ? .12 : 0);
  const fat = t === 'bloater' ? 1.9 : t === 'brute' ? 1.65 : t === 'riot' ? 1.25 : 1, lw = t === 'brute' ? 6 : t === 'bloater' ? 5 : 3.8, aw = t === 'brute' ? 5.4 : 2.9;
  const hipY = t === 'bloater' ? -17 : -20, LL = t === 'bloater' ? 8.2 : 9.6, spd = t === 'runner' ? 1.1 : 1;
  c.lineCap = 'round';
  // ---- lábak ----
  const leg = (ph) => {
    if (air) return [[0, hipY], [-5, hipY + 6], [ph ? -8 : -1, hipY + 12]];
    let th, lift = 0;
    if (walk) { th = Math.sin(p * spd + ph) * (t === 'runner' ? .95 : .62); lift = Math.max(0, Math.cos(p * spd + ph)) }
    else th = (ph ? .3 : -.3) * (t === 'soldier' || t === 'riot' ? 1.1 : .55);
    if (walk && z.sk === 3 && ph) return [[0, hipY], [2, hipY + 5], [8, hipY + 9.5 + (hipY === -20 ? 9 : 5)]];   // húzott, béna láb
    const kx = -Math.sin(th) * LL, ky = hipY + Math.cos(th) * LL, fi = th * .25 - lift * 1.05;
    return [[0, hipY], [kx, ky], [kx - Math.sin(fi) * LL, ky + Math.cos(fi) * LL]];
  };
  for (const ph of [Math.PI, 0]) {
    const L = leg(ph), f = L[2]; zlimb(c, L, lw, ph ? shade(pant.length === 7 ? pant : '#2c3040', .8) : pant);
    c.fillStyle = hit ? '#fff' : '#1c1612'; c.beginPath(); c.ellipse(f[0] - 1.8, f[1] + .5, 3.2, 1.7, 0, 0, 7); c.fill();   // cipő
  }
  // ---- törzs ----
  c.save(); c.translate(0, hipY); c.rotate(-lean);
  const arm = (far) => {
    const have = far ? z.armL : z.armR, sy = -15.2 - (far ? .6 : 0), sx = -2.2 + (far ? 1.6 : 0); if (!have) { c.fillStyle = '#8a0808'; c.beginPath(); c.arc(sx, sy, 2.2, 0, 7); c.fill(); return }
    const k = t === 'brute' ? 1.35 : 1, o = far ? 1.3 : 0, pu = z.punch ? -7 : 0;
    let ex = sx - 6.4 * k + Math.sin(p + o) * 1.1 + pu * .5, ey = sy + 2 + Math.sin(p * 1.2 + o) * 1.4, hx = ex - 6 * k + Math.sin(p + 1 + o) * 1.5 + pu, hy = ey + 1 + Math.sin(p * 1.3 + o) * 2.4;
    if (air) { ex = sx - 7; ey = sy - 2; hx = sx - 14; hy = sy - 6 }
    if (t === 'soldier') { ex = sx - 4; ey = sy + 5; hx = sx - 11; hy = sy + 3 }
    if (t === 'riot') { ex = sx - 5; ey = sy + 3; hx = sx - 11; hy = sy + 1 }
    const dark = far ? .8 : 1;
    zlimb(c, [[sx, sy], [ex, ey]], aw + .6, far ? shade(shirt.length === 7 ? shirt : '#555555', dark) : shirt);
    zlimb(c, [[ex, ey], [hx, hy]], aw, far ? skD : sk);
    c.strokeStyle = OL; c.lineWidth = .8; c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(hx, hy); c.lineTo(hx - 2.6, hy + i * 1.6 + 1) } c.stroke();   // karmok
    if (t === 'soldier') { c.strokeStyle = '#17171a'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(sx + 5, sy + 7); c.lineTo(sx - 18, sy + 3.5); c.stroke(); c.fillStyle = '#4a3a28'; c.fillRect(sx + 2, sy + 4.5, 6, 3.4) }
  };
  arm(true);                                                                      // távolabbi kar a törzs mögött
  c.beginPath();
  if (t === 'bloater') c.ellipse(-.5, -8, 10.5, 9.5, 0, 0, 7);
  else { c.moveTo(-3.4 * fat, 0); c.lineTo(-4.3 * fat, -7); c.quadraticCurveTo(-5.5 * fat, -12, -3.6 * fat, -16.6); c.lineTo(1.6 * fat, -17.6); c.quadraticCurveTo(6 * fat, -14.5, 4.7 * fat, -8); c.lineTo(3.9 * fat, 0); c.closePath() }
  c.fillStyle = t === 'bloater' ? sk : shirt; c.fill(); c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke();
  // ruha-részletek
  if (t === 'bloater') { c.fillStyle = hit ? '#fff' : '#b9cf4e'; for (const [a, b2] of [[-6, -12], [3, -5], [-1, -2], [5, -13], [-7, -4]]) { c.beginPath(); c.arc(a, b2, 1.9, 0, 7); c.fill() } c.strokeStyle = 'rgba(70,90,20,.8)'; c.lineWidth = .8; c.beginPath(); c.moveTo(-8, -6); c.quadraticCurveTo(-2, -11, 3, -17); c.stroke() }
  else if (t === 'soldier') { c.fillStyle = hit ? '#fff' : '#6b7448'; c.fillRect(-4.6, -14, 8.8, 7); c.fillStyle = hit ? '#fff' : '#2a2c20'; c.fillRect(-4, -7.8, 2.6, 3); c.fillRect(-.6, -7.8, 2.6, 3) }
  else if (t === 'riot') { c.fillStyle = hit ? '#fff' : '#3a3f48'; c.fillRect(-5.4, -15, 10.4, 8.5); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(-5.4, -15, 10.4, 1.6) }
  else if (z.sk === 3) { c.fillStyle = hit ? '#fff' : sk; c.fillRect(-3.2, -15, 7.4, 13); c.strokeStyle = 'rgba(40,10,10,.55)'; c.lineWidth = .7; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-3, -13 + i * 2.6); c.lineTo(3.4, -12.4 + i * 2.6); c.stroke() } }   // mezítelen, kilátszó bordák
  else { c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = .7; c.beginPath(); c.moveTo(-1.6, -15); c.lineTo(-1, -4); c.stroke(); c.fillStyle = hit ? '#fff' : sk; c.beginPath(); c.moveTo(-3.8, -1); c.lineTo(-1.4, -3.2); c.lineTo(.4, -1); c.lineTo(2.4, -3.4); c.lineTo(4, -1); c.lineTo(4, 0); c.lineTo(-3.8, 0); c.fill() }   // szakadt ruhaszél
  c.fillStyle = hit ? '#fff' : '#1a1410'; if (t !== 'bloater') c.fillRect(-3.6 * fat, -1.2, 7.4 * fat, 1.6);   // öv
  if (z.bleed > .2) { c.fillStyle = 'rgba(125,4,4,.7)'; c.beginPath(); c.ellipse(-.5, -9, 2.4 + z.bleed * 2.6, 3 + z.bleed * 3.4, .3, 0, 7); c.fill() }
  if (z.hp < z.hp0 * .45 && t !== 'bloater') { c.strokeStyle = 'rgba(235,225,200,.85)'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-1.4, -12.4 + i * 2.7, 3.4, -.4, .9); c.stroke() } }      // kilátszó bordák
  // ---- fej: előre lógó, lehajtott ----
  const hr = t === 'brute' ? 4.4 : t === 'bloater' ? 4.2 : 4.8;
  c.save(); c.translate(t === 'runner' ? -6.8 : -5.2, -21.4 + (t === 'runner' ? 1.5 : 0)); c.rotate(.3 + Math.sin(p * .7) * .07);
  zlimb(c, [[4.4, 4.5], [3.2, 7]], 3.3, skD);                                   // nyak
  const open = 1.1 + (walk ? Math.sin(p * 1.9) * .7 : .3);
  c.fillStyle = sk; c.beginPath(); c.ellipse(0, 0, hr, hr * 1.06, 0, 0, 7); c.fill(); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke();   // koponya
  c.fillStyle = hit ? '#fff' : skD; c.beginPath(); c.ellipse(1.3, -.4, hr * .5, hr * .55, 0, 0, 7); c.fill();                    // árnyékolás
  c.fillStyle = '#240606'; c.beginPath(); c.moveTo(-hr + .6, hr * .38); c.lineTo(-hr * .2, hr * .22); c.lineTo(-hr * .2, hr * .22 + open); c.lineTo(-hr + .9, hr * .52 + open); c.closePath(); c.fill();   // nyitott száj
  c.fillStyle = hit ? '#fff' : sk; c.beginPath(); c.moveTo(-hr + .7, hr * .6 + open); c.quadraticCurveTo(-hr * .4, hr * 1.5 + open, hr * .3, hr * .9 + open * .4); c.lineTo(hr * .3, hr * .5); c.fill();       // lógó alsó állkapocs
  c.fillStyle = '#efe6cf'; c.fillRect(-hr + 1, hr * .38, 1.1, 1.2); c.fillRect(-hr + 3, hr * .26, 1.1, 1.2);                                              // fogak
  const ey = -hr * .22; c.fillStyle = '#120404'; c.beginPath(); c.arc(-hr * .45, ey, 1.55, 0, 7); c.fill();
  c.fillStyle = t === 'spitter' ? '#c8ff3a' : '#ff3a22'; c.beginPath(); c.arc(-hr * .5, ey, .95, 0, 7); c.fill();                                          // izzó szem
  if (!hit) { c.globalCompositeOperation = 'lighter'; c.fillStyle = t === 'spitter' ? 'rgba(180,255,50,.35)' : 'rgba(255,60,30,.38)'; c.beginPath(); c.arc(-hr * .5, ey, 2.7, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over' }
  if (t === 'soldier') { c.fillStyle = hit ? '#fff' : '#3d4630'; c.beginPath(); c.arc(0, -.8, hr + 1.4, Math.PI * .97, Math.PI * 2.03); c.fill(); c.fillRect(-hr - 1.4, -1.4, hr * 2 + 2.6, 1.6); c.lineWidth = 1; c.strokeStyle = OL; c.stroke() }
  else if (t === 'riot') { c.fillStyle = hit ? '#fff' : '#1d2026'; c.beginPath(); c.arc(0, -.6, hr + 1.5, Math.PI * .9, Math.PI * 2.1); c.fill(); c.fillStyle = 'rgba(130,170,210,.55)'; c.fillRect(-hr - .9, -2.4, 3.8, 5.2); c.lineWidth = 1; c.strokeStyle = OL; c.stroke() }
  else if (z.sk === 0) { c.strokeStyle = hit ? '#fff' : '#2a1d16'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-hr * .5, -hr + .4); c.quadraticCurveTo(0, -hr - 2.2, hr * .9, -hr * .2); c.moveTo(hr * .1, -hr + .3); c.lineTo(hr * .6, -hr - 1.6); c.stroke() }   // kócos haj
  else if (z.sk === 1) { c.fillStyle = '#7a0a0a'; c.beginPath(); c.ellipse(1.6, -hr * .62, 2.1, 1.5, .5, 0, 7); c.fill(); c.fillStyle = '#e8dcc0'; c.fillRect(1, -hr * .68, 1.2, .8) }   // koponyasebesülés
  else if (z.sk === 2 && t !== 'brute') { c.strokeStyle = hit ? '#fff' : '#3a3a3a'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(hr * .5, -hr * .9); c.lineTo(hr * .9, -hr - 1.8); c.moveTo(hr * .1, -hr); c.lineTo(hr * .2, -hr - 2.2); c.stroke() }
  if (t === 'spitter') { const pu = 4 + Math.sin(now / 170) * .8; c.fillStyle = hit ? '#fff' : '#a9d02e'; c.beginPath(); c.ellipse(-2.6, hr + 2.4, pu, pu * .8, 0, 0, 7); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); c.fillStyle = 'rgba(255,255,200,.5)'; c.beginPath(); c.arc(-3.8, hr + 1.4, 1.2, 0, 7); c.fill() }
  c.restore();
  arm(false);                                                                       // közelebbi kar elöl
  if (t === 'riot') { c.fillStyle = 'rgba(150,185,215,.5)'; c.fillRect(-16.5, -22, 5, 25); c.strokeStyle = '#1a1e24'; c.lineWidth = 1.2; c.strokeRect(-16.5, -22, 5, 25); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-15.6, -20, 1.3, 10) }
  c.restore();
  // életerő-csík (erős ellenfeleknél)
  if (D.bar && z.hp < z.hp0) { c.scale(z.dir < 0 ? 1 : -1, 1); c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(-14, -D.h - 10, 28, 3.5); c.fillStyle = '#ff3b30'; c.fillRect(-14, -D.h - 10, 28 * Math.max(0, z.hp) / z.hp0, 3.5) }
}

const SIL = new Map();
function silOf(sp) { let w = SIL.get(sp); if (!w) { w = document.createElement('canvas'); w.width = sp.width; w.height = sp.height; const x = w.getContext('2d'); x.drawImage(sp, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#fff'; x.fillRect(0, 0, w.width, w.height); SIL.set(sp, w) } return w }
function zMon(c, z, clinging) {
  const D = z.D, walk = (z.st === 'walk' && z.spd > 0) || clinging, fr = walk ? Math.floor(z.ph * 1.15) & 3 : 0, sp = monSprite(z.t, fr);
  const kk = D.h * z.sc / sp.height, w = sp.width * kk, h = sp.height * kk, hop = walk && z.t === 'hound' ? -Math.abs(Math.sin(z.ph * 1.4)) * 4 : 0;
  c.scale(z.dir < 0 ? 1 : -1, 1); c.imageSmoothingEnabled = false;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, -1, w * .38, 3, 0, 0, 7); c.fill();
  c.drawImage(sp, -w / 2, -h + hop + 3, w, h);
  if (z.hitT > 0) { c.globalAlpha = .75; c.drawImage(silOf(sp), -w / 2, -h + hop + 3, w, h); c.globalAlpha = 1 }
  if (z.bleed > .2) { c.fillStyle = 'rgba(120,0,0,.55)'; c.fillRect(-w * .18, -h * .55, w * .22, h * .22 * z.bleed) }
  if (z.D.bar && z.hp < z.hp0) { c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(-14, -h - 8, 28, 3.5); c.fillStyle = '#ff3b30'; c.fillRect(-14, -h - 8, 28 * Math.max(0, z.hp) / z.hp0, 3.5) }
}

/* ---------- jármű: PzH 2000, „Mad Max” fejlesztésekkel ---------- */

/* ---------- fém-megjelenés: tompa, csiszolt acél (Mad Max roncs-barkács), árnyékolással ----------
   A lemezek egyszer, kétszeres felbontásban egy gyorsítótárba készülnek (színátmenet, csiszolási szálak, szemcse, pereme-fény,
   rozsda, szegecs, hegesztési varrat); rajzoláskor csak kirakjuk őket + lágy érintkezési árnyék kerül alájuk. */
const MT = new Map(), MV = new Map();
function shade(h, f) { const n = parseInt(h.slice(1), 16); const r = Math.min(255, ((n >> 16) & 255) * f | 0), g = Math.min(255, ((n >> 8) & 255) * f | 0), b = Math.min(255, (n & 255) * f | 0); return `rgb(${r},${g},${b})` }
function metalTile(w, h, base, o) {
  o = o || {}; w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
  const key = base + '|' + w + '|' + h + '|' + (o.rust ? 1 : 0) + (o.rv ? 1 : 0) + (o.hz ? 1 : 0) + (o.weld ? 1 : 0);
  let t = MT.get(key); if (t) return t;
  const S = 2, cv = document.createElement('canvas'); cv.width = w * S; cv.height = h * S;
  const x = cv.getContext('2d'); x.scale(S, S);
  let sd = (w * 73 + h * 31 + parseInt(base.slice(1), 16)) | 0; const rn = () => { sd = (sd * 1664525 + 1013904223) | 0; return ((sd >>> 8) & 0xffff) / 65536 };
  const g = o.hz ? x.createLinearGradient(0, 0, w, 0) : x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, shade(base, 1.22)); g.addColorStop(.14, shade(base, 1.08)); g.addColorStop(.5, shade(base, .88)); g.addColorStop(.86, shade(base, .68)); g.addColorStop(1, shade(base, .5));
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  // lágy, tompa fényfolt (nem tükör: szatén csillogás)
  const sp = o.hz ? x.createLinearGradient(0, 0, w, 0) : x.createLinearGradient(0, 0, 0, h);
  sp.addColorStop(.1, 'rgba(255,255,255,0)'); sp.addColorStop(.24, 'rgba(255,255,240,.13)'); sp.addColorStop(.4, 'rgba(255,255,255,0)'); x.fillStyle = sp; x.fillRect(0, 0, w, h);
  // csiszolási szálak
  for (let yy = .6; yy < h; yy += 1.25) { x.fillStyle = rn() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)'; const l = w * (.3 + rn() * .7); x.fillRect(rn() * (w - l), yy, l, .45) }
  // szemcse
  for (let i = 0, n = w * h / 5 | 0; i < n; i++) { x.fillStyle = rn() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.1)'; x.fillRect(rn() * w, rn() * h, .7, .7) }
  // kopás: világosabb karcok a peremeken
  for (let i = 0, n = Math.max(2, w * h / 90 | 0); i < n; i++) { const px = rn() * w, py = rn() * h; x.strokeStyle = 'rgba(225,225,210,.3)'; x.lineWidth = .4; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 2 + rn() * 5, py + (rn() - .5) * 2); x.stroke() }
  if (o.rust) { // rozsda-foltok és csíkok (a lemezen belül marad)
    for (let i = 0, n = Math.max(2, w * h / 150 | 0); i < n; i++) { const px = rn() * w, py = rn() * h, r = 1.5 + rn() * Math.min(7, h * .4); const rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, 'rgba(140,72,30,.5)'); rg.addColorStop(1, 'rgba(140,72,30,0)'); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2) }
    for (let i = 0, n = Math.max(1, w / 14 | 0); i < n; i++) { const px = rn() * w; x.fillStyle = 'rgba(90,46,20,.3)'; x.fillRect(px, 0, .8, h * (.3 + rn() * .6)) }
  }
  // lekerekített perem: fény fent/balra, árnyék lent/jobbra
  x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(0, 0, w, .8); x.fillRect(0, 0, .8, h);
  x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, h - .9, w, .9); x.fillRect(w - .9, 0, .9, h);
  if (o.weld) { x.fillStyle = 'rgba(210,200,170,.35)'; for (let px = 1.5; px < w; px += 2.2) x.fillRect(px, 1.4, 1.2, .8); x.fillStyle = 'rgba(0,0,0,.25)'; for (let px = 1.5; px < w; px += 2.2) x.fillRect(px, 2.2, 1.2, .5) }
  if (o.rv && h > 6) for (let px = 3.5; px < w - 2; px += 7) for (const py of [3, h - 3]) { x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.arc(px, py, 1.25, 0, 7); x.fill(); x.fillStyle = 'rgba(235,235,220,.55)'; x.beginPath(); x.arc(px - .35, py - .4, .55, 0, 7); x.fill() }
  MT.set(key, cv); return cv;
}
function mt(c, x, y, w, h, base, o) { // lemez árnyékkal (érintkezési árnyék a test felé)
  if (!o || o.sh !== 0) { c.fillStyle = 'rgba(0,0,0,.34)'; c.fillRect(x + 1.2, y + 1.8, w, h); c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(x + 2.4, y + 3.4, w, h) }
  c.drawImage(metalTile(w, h, base, o), x, y, w, h);
}
function vg(c, base, y0, y1) { const k = base + y0 + '|' + y1; let g = MV.get(k); if (!g) { g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, shade(base, 1.2)); g.addColorStop(.2, shade(base, 1.06)); g.addColorStop(.55, shade(base, .84)); g.addColorStop(1, shade(base, .52)); MV.set(k, g) } return g }
function mpoly(c, pts, base, y0, y1, noShadow) { // sokszög-lemez: színátmenet + szálak (a körvonalra maszkolva) + perem
  const path = () => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath() };
  if (!noShadow) { c.save(); c.translate(1.3, 1.9); path(); c.fillStyle = 'rgba(0,0,0,.34)'; c.fill(); c.restore() }
  path(); c.fillStyle = vg(c, base, y0, y1); c.fill();
  c.save(); path(); c.clip(); c.fillStyle = 'rgba(255,255,255,.06)'; for (let yy = y0; yy < y1; yy += 2.4) c.fillRect(-200, yy, 600, .55); c.fillStyle = 'rgba(0,0,0,.09)'; for (let yy = y0 + 1.2; yy < y1; yy += 2.4) c.fillRect(-200, yy, 600, .5); c.restore();
  path(); c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.1; c.stroke();
}
function spike(c, bx, by, bw, hgt, base) { // kétszínű (élszerű) tüske – bal oldala fénylik, jobb sötét
  const tx = bx + bw / 2, ty = by - hgt;
  c.fillStyle = shade(base, 1.18); c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.lineTo(tx, by); c.fill();
  c.fillStyle = shade(base, .6); c.beginPath(); c.moveTo(tx, by); c.lineTo(tx, ty); c.lineTo(bx + bw, by); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = .7; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.lineTo(bx + bw, by); c.stroke();
}
function spikeH(c, bx, by, len, wid, base) { // vízszintes (előre álló) tüske
  const ty = by + wid / 2;
  c.fillStyle = shade(base, 1.18); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + len, ty); c.lineTo(bx, ty); c.fill();
  c.fillStyle = shade(base, .6); c.beginPath(); c.moveTo(bx, ty); c.lineTo(bx + len, ty); c.lineTo(bx, by + wid); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = .7; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + len, ty); c.lineTo(bx, by + wid); c.stroke();
}
function pipe(c, x1, y1, x2, y2, w, base) { // cső: sötét körvonal, színes mag, keskeny matt fénycsík
  c.lineCap = 'round';
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, o = -w * .2;
  c.strokeStyle = '#14130f'; c.lineWidth = w + 1.6; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = shade(base, .85); c.lineWidth = w; c.stroke();
  c.strokeStyle = shade(base, 1.35); c.lineWidth = Math.max(.8, w * .32); c.beginPath(); c.moveTo(x1 + nx * o, y1 + ny * o); c.lineTo(x2 + nx * o, y2 + ny * o); c.stroke();
}
function disc(c, cx, cy, r, base) { // gömbölyű alkatrész (turbó, tárcsa): excentrikus sugaras színátmenet
  const k = base + 'd' + r; let g = MV.get(k); if (!g) { g = c.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r); g.addColorStop(0, shade(base, 1.35)); g.addColorStop(.55, shade(base, .9)); g.addColorStop(1, shade(base, .45)); MV.set(k, g) }
  c.save(); c.translate(cx, cy); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(1.2, 1.6, r, 0, 7); c.fill(); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = .9; c.stroke(); c.restore();
}

/* ---------- lánctalp: a kerekek köré feszülő lánc, a talaj fölött átfekszik a kisebb egyenetlenségeken ---------- */
const TR_N = 5;   // egy futófelület-szakasz mintapontjai
function trackPath(V, ws, live) {
  const pts = [], T = 2.6, n = ws.length, P = (x, y) => pts.push(x, y);
  const A = ws[0], Z = ws[n - 1];
  // hátsó kerék körül: felülről hátra, lefelé
  for (let u = 0; u <= 6; u++) { const th = -Math.PI / 2 - u / 6 * Math.PI, r = A.r + T; P(A.cx + Math.cos(th) * r, A.cy + Math.sin(th) * r) }
  // alsó ág: kerékpáronként külső érintő, a talajra „ráfekvő” közbenső pontokkal
  for (let i = 0; i < n - 1; i++) {
    const a = ws[i], b = ws[i + 1], dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy), phi = Math.atan2(dy, dx), be = Math.asin(clamp((a.r - b.r) / L, -.5, .5)), th = phi + Math.PI / 2 - be, nx = Math.cos(th), ny = Math.sin(th);
    const x1 = a.cx + nx * (a.r + T), y1 = a.cy + ny * (a.r + T), x2 = b.cx + nx * (b.r + T), y2 = b.cy + ny * (b.r + T);
    for (let k = 0; k < TR_N; k++) {
      const f = k / TR_N; let x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f;
      if (live && k > 0 && !a.s && !b.s) { const [wx, wy] = vPt(V, x, y), gl = vLoc(V, wx, gY(wx))[1] - .6; if (gl < y) y = Math.max(gl, y - 9) }   // a láncot a kiemelkedő talaj fölfelé tolja
      P(x, y);
    }
  }
  // elülső kerék körül: alulról előre, fölfelé
  for (let u = 0; u <= 6; u++) { const th = Math.PI / 2 - u / 6 * Math.PI, r = Z.r + T; P(Z.cx + Math.cos(th) * r, Z.cy + Math.sin(th) * r) }
  // felső ág: lehajló, két támgörgő között megülő lánc
  const x1 = Z.cx, y1 = Z.cy - Z.r - T, x2 = A.cx, y2 = A.cy - A.r - T;
  for (let k = 1; k < 12; k++) { const f = k / 12; P(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f + Math.sin(f * Math.PI) * 3.2) }
  return pts;
}
function drawTrack(c, V, ws, tr, up, live) {
  const pts = trackPath(V, ws, live), N = pts.length / 2;
  const path = () => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 1; i < N; i++) c.lineTo(pts[i * 2], pts[i * 2 + 1]); c.closePath() };
  c.lineJoin = 'round'; c.lineCap = 'butt';
  path(); c.setLineDash([]); c.lineWidth = 7.6; c.strokeStyle = '#12110e'; c.stroke();
  c.setLineDash([5.2, 1.8]); c.lineDashOffset = tr;                    // a láncszemek: az alsó ág hátrafelé fut, ha a jármű előre megy
  path(); c.lineWidth = 6; c.strokeStyle = '#3f3b32'; c.stroke();
  c.lineWidth = 2.4; c.strokeStyle = 'rgba(190,185,160,.3)'; c.stroke();   // szatén fény a szemek közepén
  c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,.55)'; c.setLineDash([.9, 6.1]); c.lineDashOffset = tr - 2.6; c.stroke();   // csapszegek
  if (up.futomu >= 1) { c.setLineDash([1.5, 5.5]); c.lineDashOffset = tr + .6; path(); c.lineWidth = up.futomu >= 2 ? 9.4 : 8.2; c.strokeStyle = up.futomu >= 2 ? '#9b9a8d' : '#5d5a50'; c.stroke() }   // tüskék / bordák a lánc külsején
  c.setLineDash([]);
  // külső él: a lánc felső síkja enyhén világít (lent a talajnál sötétebb)
  path(); c.lineWidth = .8; c.strokeStyle = 'rgba(255,240,210,.14)'; c.stroke();
  // kerekek
  for (const w of ws) {
    const rot = tr / w.r;
    c.save(); c.translate(w.cx, w.cy);
    c.fillStyle = '#1d1c19'; c.beginPath(); c.arc(0, 0, w.r, 0, 7); c.fill();                    // gumiabroncs
    c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, w.r - .7, -2.6, -.5); c.stroke();
    c.rotate(rot);
    if (w.s) { // hajtó- / feszítőkerék: fogaskerék
      c.fillStyle = '#3a3935'; for (let i = 0; i < 9; i++) { c.rotate(Math.PI * 2 / 9); c.beginPath(); c.moveTo(w.r - 1, -2.2); c.lineTo(w.r + 2, -1.1); c.lineTo(w.r + 2, 1.1); c.lineTo(w.r - 1, 2.2); c.fill() }
    }
    c.fillStyle = shade(up.futomu >= 3 ? '#8a8a78' : '#6d6b60', .9); c.beginPath(); c.arc(0, 0, w.r * .66, 0, 7); c.fill();       // acél tárcsa
    const g = MV.get('w' + w.r) || (() => { const q = c.createRadialGradient(-w.r * .25, -w.r * .3, 0, 0, 0, w.r * .7); q.addColorStop(0, 'rgba(255,255,240,.28)'); q.addColorStop(.6, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(0,0,0,.45)'); MV.set('w' + w.r, q); return q })();
    c.rotate(-rot); c.fillStyle = g; c.beginPath(); c.arc(0, 0, w.r * .66, 0, 7); c.fill(); c.rotate(rot);
    c.fillStyle = '#26251f'; for (let i = 0; i < 5; i++) { c.rotate(Math.PI * 2 / 5); c.beginPath(); c.arc(w.r * .42, 0, 1, 0, 7); c.fill() }   // csavarok
    c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = .8; c.beginPath(); c.arc(0, 0, w.r * .66, 0, 7); c.stroke();
    c.fillStyle = '#2d2c27'; c.beginPath(); c.arc(0, 0, w.r * .2, 0, 7); c.fill();
    c.restore();
  }
}

/* ---------- vér a járművön: kifröccsen, majd lefolyik a lemezeken (gravitáció + menetszél), csöpög, megszárad ---------- */
function bloodOn(lx, ly, r, c) {
  const B = MG.V.blood; B.push({lx, ly, r, c, col: c, age: 0, wet: 1, P: [lx, ly], hx: lx, hy: ly, run: 0, mx: r * rnd(7, 12) + rnd(24, 60), cT: 0, tail: 0});
  const cap = LOWFX ? 24 : 54; if (B.length > cap) B.shift();
}
function mixHex(a, b, t) { if (a.length !== 7) return a; const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const m = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return `rgb(${m(16)},${m(8)},${m(0)})` }
function bloodStep(dt) {
  const V = MG.V, B = V.blood; if (!B.length) return;
  const cA = Math.cos(V.a), sA = Math.sin(V.a), fwd = V.vx * cA + V.vy * sA, wind = clamp(fwd / 150, -.3, 1.6);
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i]; b.age += dt;
    if (b.age > 30 || b.r < .9 || b.P.length < 4) { B.splice(i, 1); continue }
    if ((b.cT -= dt) <= 0) { b.cT = .4; b.col = mixHex(b.c, '#2c0505', Math.min(.6, b.age / 30)) }
    // a vér folyik: a fej előre halad (gravitáció + menetszél), a farok követi – a folt nem „ragad”, hanem lecsorog a gépről
    let dx = sA - wind * 1.1, dy = cA; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const sp = (16 + b.r * 4.5) * (1 + Math.abs(wind) * .9) * dt;
    if (!b.done) {
      b.hx += dx * sp; b.hy += dy * sp; b.run += sp; b.r = Math.max(0, b.r - sp * .022);
      const n = b.P.length; if (Math.hypot(b.hx - b.P[n - 2], b.hy - b.P[n - 1]) > 2.6 && n < 44) b.P.push(b.hx, b.hy);
      if (b.run >= b.mx || b.hy > 40 || b.hx < -135 || b.hx > 150) b.done = 1;
    }
    if (b.run > 7 || b.done) { b.tail = (b.tail || 0) + sp * (b.done ? 1.6 : .85); while (b.tail > 2.6 && b.P.length >= 4) { b.tail -= 2.6; b.P.splice(0, 2); b.lx = b.P[0]; b.ly = b.P[1]; b.r = Math.max(0, b.r - .06) } }
    // csöpögés a csík végéről; ahogy fogy a vér, úgy ritkul
    const rate = (b.run > 4 ? 2.4 : .5) * (b.hy > 8 ? 1.8 : 1) * (.3 + b.r * .14);
    if (Math.random() < dt * rate) { const [x, y] = vPt(V, b.hx, b.hy + 1); part(x, y, V.vx * .92 + rnd(-8, 8), V.vy * .92 + rnd(0, 24), rnd(.7, 1.2), rnd(1.3, 2.4), b.c.length === 7 ? b.c : '#8a0808', 0) }
  }
}
function drawBlood(c, V) {
  const B = V.blood; if (!B || !B.length) return;
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const b of B) {
    const a = b.age > 24 ? 1 - (b.age - 24) / 6 : 1; if (a <= 0) continue;
    c.globalAlpha = .88 * a; c.fillStyle = c.strokeStyle = b.col;
    if (b.P.length >= 4) {
      c.lineWidth = Math.max(1.3, b.r * .7); c.beginPath(); c.moveTo(b.P[0], b.P[1]); for (let i = 2; i < b.P.length; i += 2) c.lineTo(b.P[i], b.P[i + 1]); c.lineTo(b.hx, b.hy); c.stroke();
      c.beginPath(); c.arc(b.hx, b.hy, Math.max(1.1, b.r * .5) * (b.done ? .8 : 1.15), 0, 7); c.fill();   // a csík végén vastagabb csepp
      if (b.age < 12) { c.globalAlpha = .4 * (1 - b.age / 12) * a; c.strokeStyle = '#ffd6cc'; c.lineWidth = .7; c.beginPath(); c.moveTo(b.P[0] - .7, b.P[1]); for (let i = 2; i < b.P.length; i += 2) c.lineTo(b.P[i] - .7, b.P[i + 1]); c.stroke() }   // nedves fény
    }
    c.globalAlpha = .9 * a; c.fillStyle = b.col; c.beginPath(); c.arc(b.lx, b.ly, b.r, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
}
function drawVeh(c, V, now, up, live) {
  c.save(); c.translate(V.x, V.y); c.rotate(V.a);
  const k = PK, tr = V.track || 0, gas = live && MG.inp && MG.inp.gas && V.fuel > 0;
  // rakéták (hátul)
  if (up.boost) {
    for (let i = 0; i < Math.min(3, up.boost); i++) { const y = -44 + i * 10; mt(c, -150, y, 30, 8, '#7a7b75', {rv: 1}); mt(c, -126, y, 4, 8, '#a8352b', {sh: 0}); mt(c, -154, y + 1, 4, 6, '#3c3c39', {sh: 0});
      if (V.boosting) { const L = 34 + Math.random() * 34; const fg = c.createLinearGradient(-154, 0, -154 - L, 0); fg.addColorStop(0, 'rgba(255,255,220,1)'); fg.addColorStop(.4, 'rgba(255,160,40,.9)'); fg.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = fg; c.beginPath(); c.moveTo(-154, y); c.lineTo(-154 - L, y + 4); c.lineTo(-154, y + 8); c.fill() } }
  }
  // kannák a farokon
  if (up.tank >= 1) { mt(c, -133, -22, 11, 15, '#5e6d3e', {rust: 1}); mt(c, -133, -5, 11, 14, '#5e6d3e', {rust: 1}); mt(c, -131, -25, 6, 3, '#3a4426', {sh: 0}) }
  // lánctalp + kerekek (az eredeti rajzolás szerint)
  const ws = WHEELS.map((w, i) => ({...w, cx: w.lx, cy: w.ly + (V.sy && !w.s ? V.sy[i] : 0)}));
  // lengőkarok + lengéscsillapítók (a kerekek mögött, a lánctalp alatt)
  for (const w of ws) if (!w.s) { c.strokeStyle = '#26241f'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(w.cx - 13, 9); c.lineTo(w.cx, w.cy); c.stroke(); c.strokeStyle = '#8a8a7e'; c.lineWidth = 1.7; c.beginPath(); c.moveTo(w.cx + 5, 8); c.lineTo(w.cx + 1, w.cy - 2); c.stroke(); c.strokeStyle = '#c9a227'; c.lineWidth = 2.3; c.beginPath(); c.moveTo(w.cx + 5, 8); c.lineTo(w.cx + 3, 8 + Math.max(2, (w.cy - 10) * .5)); c.stroke() }
  drawTrack(c, V, ws, tr, up, live);
  // 155 mm cső (eredeti kép), majd a test
  const BI = drBarrelImg(), BO = drBodyImg();
  c.save(); c.translate(PIV[0], PIV[1]); c.rotate(GUN_A); if (BI.complete && BI.naturalWidth) c.drawImage(BI, 6 * k, -28 * k, 466 * k, 61 * k);
  if (!up.agyu) { c.fillStyle = '#b22'; c.fillRect(470 * k, -6 * k, 4, 12 * k) } c.restore();
  if (BO.complete && BO.naturalWidth) c.drawImage(BO, -PCX * k, 10 - PBY * k, 738 * k, 180 * k);
  else { c.fillStyle = '#5b6136'; c.fillRect(-118, -50, 118, 40); c.fillRect(-118, -18, 220, 26) }
  // német felségjel lefedése (mint a DroneRunban)
  c.fillStyle = '#3d4a2c'; c.beginPath(); c.ellipse((196 - PCX) * k, 10 + (95 - PBY) * k, 17 * k, 17 * k, 0, 0, 7); c.fill();
  c.fillStyle = '#4a3c28'; c.beginPath(); c.ellipse((192 - PCX) * k, 10 + (99 - PBY) * k, 9 * k, 7 * k, .4, 0, 7); c.fill();
  // rozsda
  c.fillStyle = '#7a4a2a'; c.globalAlpha = .35; c.beginPath(); c.arc(-90, -4, 7, 0, 7); c.arc(40, -6, 5, 0, 7); c.arc(-30, -40, 5, 0, 7); c.fill(); c.globalAlpha = 1;
  // páncélzat
  if (up.pancel >= 1) { mt(c, -100, -14, 40, 16, '#7b6a52', {rust: 1, rv: 1, weld: 1}); mt(c, -40, -14, 46, 16, '#6f5e47', {rust: 1, rv: 1, weld: 1}); mt(c, 30, -12, 40, 14, '#7d6d55', {rust: 1, rv: 1, weld: 1}) }
  if (up.pancel >= 2) { c.lineCap = 'butt'; for (const [lw, col, off] of [[3.4, '#14130f', 0], [2, '#555650', 0], [.7, 'rgba(225,225,210,.4)', -.5]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (let i = -114; i <= 0; i += 7) { c.moveTo(i + off, -50); c.lineTo(i + off, -18) } c.moveTo(-116, -48 + off); c.lineTo(2, -48 + off); c.moveTo(-116, -20 + off); c.lineTo(2, -20 + off); c.stroke() } }
  if (up.pancel >= 3) { mpoly(c, [[70, -20], [108, -10], [110, 8], [102, 8], [100, -4], [68, -13]], '#62635e', -20, 8); for (let i = 0; i < 6; i++) disc(c, -96 + i * 36, 9, 4, '#33332e') }
  if (up.pancel >= 4) { for (let i = -112; i < -4; i += 9) spike(c, i, -52, 7, 11, '#b8b9af'); disc(c, 92, -8, 5, '#d9d6c6'); c.fillStyle = '#111'; c.fillRect(89.5, -9, 1.6, 1.6); c.fillRect(92.5, -9, 1.6, 1.6) }
  // tartályok
  if (up.tank >= 2) { mt(c, -115, -66, 22, 12, '#84442b', {rust: 1}); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-111, -66, 1.3, 12); c.fillRect(-97, -66, 1.3, 12); mt(c, -106, -70, 5, 4, '#a89d70', {sh: 0}) }
  if (up.tank >= 3) { mt(c, 16, -34, 30, 13, '#4b6a86', {rv: 1}); c.fillStyle = 'rgba(18,30,42,.8)'; c.fillRect(16, -29, 30, 2); c.strokeStyle = '#14130f'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(24, -34); c.lineTo(24, -21); c.moveTo(38, -34); c.lineTo(38, -21); c.stroke() }
  if (up.tank >= 4) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(-58.8, 1.8, 26, 7, 0, 0, 7); c.fill(); c.save(); c.beginPath(); c.ellipse(-60, 0, 26, 7, 0, 0, 7); c.clip(); c.drawImage(metalTile(52, 14, '#8e9089', {}), -86, -7, 52, 14); c.restore(); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1; c.beginPath(); c.ellipse(-60, 0, 26, 7, 0, 0, 7); c.stroke(); mt(c, -66, -3, 4, 4, '#c9a227', {sh: 0}) }
  // oldalvédelem a lánctalp fölött
  if (up.oldal === 1) { for (const [lw, col] of [[2.4, '#17160f'], [1, '#a9aaa1']]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (let i = -110; i < 98; i += 7) { c.moveTo(i + 4, 6); c.arc(i, 6, 4, 0, 7) } c.stroke() } }
  if (up.oldal >= 2) { for (let i = -112; i < 98; i += 9) spike(c, i, 10, 8, 12, '#b6b7ad') }
  if (up.oldal >= 3) { mt(c, -112, 32, 214, 5, '#64655f', {rv: 1}); for (let i = 0; i < 28; i++) { const xx = -112 + ((i * 7.6 + tr * 2) % 214 + 214) % 214; spike(c, xx, 37, 6, -4, '#d2d3c8') } }
  // kipufogók (a motortér a teknő elején van)
  const exN = [0, 2, 2, 3, 3][up.motor] || 0;
  for (let i = 0; i < exN; i++) { const ex = 50 + i * 7; pipe(c, ex, -20, ex, -54 - i * 4, 3.8, '#58534b'); mt(c, ex - 2.8, -28, 5.6, 3, '#8c8c82', {sh: 0}); c.fillStyle = '#1a1814'; c.beginPath(); c.ellipse(ex, -54 - i * 4, 2.3, 1.1, 0, 0, 7); c.fill(); if (gas && Math.random() < .6) { c.fillStyle = Math.random() < .3 ? 'rgba(255,140,40,.9)' : 'rgba(40,36,30,.6)'; c.beginPath(); c.arc(ex + rnd(-2, 2), -58 - i * 4 - rnd(0, 6), rnd(2, 4), 0, 7); c.fill() } }
  if (up.motor >= 4) { mt(c, 20, -42, 20, 18, '#92948c', {rv: 1}); mt(c, 18, -46, 24, 5, '#a8392b', {sh: 0}); c.strokeStyle = 'rgba(10,10,8,.7)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(24 + i * 4, -42); c.lineTo(24 + i * 4, -26); c.stroke() } }
  else if (up.motor >= 3) { disc(c, 28, -28, 6, '#7f8079'); disc(c, 40, -28, 6, '#7f8079'); c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(28, -28, 2, 0, 7); c.arc(40, -28, 2, 0, 7); c.fill() }
  // kiegészítő géppuska a tornyon
  if (up.gepp) { c.save(); c.translate(MGP[0], MGP[1]); c.fillStyle = '#2a2a26'; c.fillRect(-4, 0, 8, 6); c.rotate(V.mgA || 0); c.fillStyle = '#1a1a18'; c.fillRect(-4, -3, 14, 5); c.fillRect(8, -1.5, up.gepp >= 3 ? 20 : 15, 2.4); if (up.gepp === 2 || up.gepp === 4) c.fillRect(8, -4.5, up.gepp === 4 ? 17 : 15, 2.4); c.fillStyle = '#4a4a3a'; c.fillRect(-2, -8, 6, 6); if (V.mgF) { c.fillStyle = 'rgba(255,220,120,.9)'; c.beginPath(); c.arc(30, -1, 4, 0, 7); c.fill() } c.restore() }
  // új fegyverek: automata torony, lézer, lángszóró
  if (up.torony) { const tl = up.torony, ta = V.tA || 0;
    mt(c, TWP[0] - 11, TWP[1] + 1, 22, 6, '#6c6d67', {rv: 1});
    c.save(); c.translate(TWP[0], TWP[1] - 2); c.rotate(ta);
    mt(c, -7, -6, 14, 9, '#5d5f57', {rv: 1}); mt(c, -12, -3, 6, 7, '#575a40', {sh: 0});
    const L = 16 + tl * 2; pipe(c, 4, tl >= 3 ? -3.4 : -1, 4 + L, tl >= 3 ? -3.4 : -1, tl >= 3 ? 2.6 : 2.2, '#2e2e2b'); if (tl >= 2) pipe(c, 4, 2.6, 4 + L, 2.6, tl >= 3 ? 2.6 : 2.2, '#2e2e2b');
    if (tl >= 3) { mt(c, 8, -5.5, 5, 11, '#8a8c84', {sh: 0}); mt(c, L - 2, -5.5, 4, 11, '#8a8c84', {sh: 0}) }
    if (tl >= 4) pipe(c, 4, 6, 4 + L, 6, 2.4, '#2e2e2b');
    if (V.tF > 0.2) { c.fillStyle = 'rgba(255,225,130,.95)'; c.beginPath(); c.arc(6 + L, 0, 4 + tl, 0, 7); c.fill() }
    c.restore() }
  if (up.lezer) { const lz = up.lezer, on = V.lzOn;
    mt(c, LZP[0] - 8, LZP[1] - 2, 18 + lz * 2, 9, '#66727b', {rv: 1});
    for (let i = 0; i < Math.min(3, Math.ceil(lz / 1.5)); i++) { disc(c, LZP[0] + 10 + i * 6, LZP[1] + 2.4, 2.6, on ? '#ff5a4a' : '#7a2a26'); if (on) { c.globalCompositeOperation = 'lighter'; c.drawImage(flameSpr(1), LZP[0] + 10 + i * 6 - 9, LZP[1] + 2.4 - 9, 18, 18); c.globalCompositeOperation = 'source-over' } }
    pipe(c, LZP[0] + 2, LZP[1] + 7, LZP[0] + 2, LZP[1] + 14, 2.4, '#3a3a36') }
  if (up.lang) { const lg = up.lang;
    mt(c, 74, -34, 3, 14, '#3a3a36', {sh: 0}); mt(c, 90, -34, 3, 13, '#3a3a36', {sh: 0});
    mt(c, 70, -43 - (lg >= 3 ? 3 : 0), 26 + lg * 1.5, 9 + (lg >= 3 ? 3 : 0), lg >= 3 ? '#6b7a44' : '#93402a', {rust: 1, rv: 1});
    if (lg >= 2) mt(c, 70, -52 - (lg >= 3 ? 3 : 0), 26 + lg * 1.5, 9, '#93402a', {rust: 1});
    c.fillStyle = '#d9ab2c'; c.fillRect(80, -42 - (lg >= 3 ? 3 : 0), 3, 8);
    pipe(c, 96 + lg, -38, NZ[0] - 2, NZ[1] + 1, 3.6, '#5a554c'); mt(c, NZ[0] - 4, NZ[1] - 3, lg >= 4 ? 8 : 6, lg >= 4 ? 8 : 6, '#9a9a90', {sh: 0});
    const fl = 3 + Math.sin(now / 70) * 1.5; c.globalCompositeOperation = 'lighter'; c.drawImage(flameSpr(0), NZ[0] + 2 - fl, NZ[1] - fl, fl * 2.2, fl * 2.2); c.globalCompositeOperation = 'source-over' }
  // orr-előtét
  drawFront(c, up.elol, now, V);
  // vérfoltok a járművön
  drawBlood(c, V);
  c.globalAlpha = 1;
  c.restore();
}
function drawFront(c, lv, now, V) {
  c.save(); c.translate(FRONT - 66, 4); drawFront0(c, lv, now, V); c.restore();
}
function drawFront0(c, lv, now, V) {
  const sp = (V.grind || 0) * 20 + 4, t = now / 1000;
  if (lv === 1) { // tolólap: ívelt, hegesztett acéllemez
    mpoly(c, [[64, -26], [76, -14], [80, 0], [76, 14], [74, 26], [66, 26], [70, 14], [72, 0], [68, -12], [60, -20]], '#7e7f78', -26, 26);
    mt(c, 56, -6, 12, 4, '#4a4b46', {sh: 0}); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(58, -2, 10, 1.4);
  } else if (lv === 2) { // tüskés eke
    mpoly(c, [[62, -28], [80, -8], [80, 24], [66, 24], [66, -10]], '#6c6d67', -28, 24);
    for (let y = -20; y < 24; y += 7) spikeH(c, 80, y, 12, 6, '#d2d3c8');
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(66, -9, 14, 1.4);
  } else if (lv === 3) { // kombájn-tálca: forgó motolla
    mt(c, 62, 14, 34, 10, '#8b7836', {rv: 1, weld: 1}); mt(c, 62, 14, 34, 3, '#c9a22a', {sh: 0});
    pipe(c, 60, -14, 84, -4, 3.2, '#5c5d56'); pipe(c, 60, 8, 84, -4, 3.2, '#5c5d56');
    c.save(); c.translate(84, -4); c.rotate(t * sp); for (let i = 0; i < 5; i++) { c.rotate(Math.PI * 2 / 5); pipe(c, 0, 0, 20, 0, 2.4, '#8f9089'); mt(c, 18, -4, 3, 8, '#d3d4c9', {sh: 0}) } disc(c, 0, 0, 4.5, '#3a3a36'); c.restore();
    for (let x = 66; x < 96; x += 5) spike(c, x, 24, 5, -4, '#d4d5cb');
  } else if (lv >= 4) { // húsdaráló: két fogas dob
    mpoly(c, [[60, -32], [86, -30], [98, -18], [66, -18]], '#5a5b56', -32, -18); mt(c, 60, -18, 8, 44, '#53544f', {rv: 1});
    for (const [cy, dir] of [[-6, 1], [16, -1]]) {
      c.save(); c.translate(84, cy); c.rotate(t * sp * dir);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(1.2, 1.6, 12, 0, 7); c.fill();
      c.fillStyle = '#6d6e67'; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill();
      for (let i = 0; i < 10; i++) { c.rotate(Math.PI / 5); spikeH(c, 10, -3.2, 7, 6.4, '#d8d9ce') }
      const gg = c.createRadialGradient(-3, -3, 1, 0, 0, 12); gg.addColorStop(0, 'rgba(255,255,240,.22)'); gg.addColorStop(.6, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = gg; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill();
      c.fillStyle = '#7a1010'; c.globalAlpha = Math.min(.8, (V.blood || []).length / 20); c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.globalAlpha = 1;
      disc(c, 0, 0, 3.4, '#2c2c29'); c.restore();
    }
    mt(c, 62, -31, 4, 3, '#a8352b', {sh: 0}); mt(c, 70, -30, 10, 2, '#d9ab2c', {sh: 0});
  }
}
/* ============================================================================
   11. HANG – saját motorzúgás + darálás, a közös hangszórón (MASTER)
   ============================================================================ */
function sOk() { return SOUND && ac() && AC && MASTER }
function thr(k, ms) { const n = performance.now(); if ((MG.sndT[k] || 0) > n) return false; MG.sndT[k] = n + ms; return true }
function engStart() {
  if (!sOk() || MG.eng) return;
  try {
    const a = AC, out = a.createGain(); out.gain.value = 0; out.connect(MASTER);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.connect(out);
    const o1 = a.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 40; const g1 = a.createGain(); g1.gain.value = .5; o1.connect(g1).connect(lp);
    const o2 = a.createOscillator(); o2.type = 'square'; o2.frequency.value = 20; const g2 = a.createGain(); g2.gain.value = .3; o2.connect(g2).connect(lp);
    const nz = a.createBufferSource(); nz.buffer = NOISE; nz.loop = true; const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = .8; const gn = a.createGain(); gn.gain.value = 0; nz.connect(bp).connect(gn).connect(MASTER);
    o1.start(); o2.start(); nz.start();
    MG.eng = {out, lp, o1, o2, nz, gn};
  } catch (e) { MG.eng = null }
}
function engUpd() {
  const E = MG.eng; if (!E || !AC) return; const V = MG.V, t = AC.currentTime, sp = Math.hypot(V.vx, V.vy) / V.vmax;
  const on = MG.run && !MG.paused && MG.phase === 'play' && V.fuel > 0;
  const rpm = (MG.inp.gas ? .45 : .15) + sp * .6 + (V.boosting ? .3 : 0);
  E.o1.frequency.setTargetAtTime(32 + rpm * 70, t, .08); E.o2.frequency.setTargetAtTime(16 + rpm * 35, t, .08); E.lp.frequency.setTargetAtTime(300 + rpm * 900, t, .1);
  E.out.gain.setTargetAtTime(on ? .05 + rpm * .05 : 0, t, .1);
  E.gn.gain.setTargetAtTime(on ? V.grind * (V.fdps ? .16 : .06) : 0, t, .05);
}
function engStop() { const E = MG.eng; if (!E) return; MG.eng = null; try { E.out.gain.setTargetAtTime(0, AC.currentTime, .05); E.gn.gain.setTargetAtTime(0, AC.currentTime, .05); setTimeout(() => { try { E.o1.stop(); E.o2.stop(); E.nz.stop() } catch (e) {} }, 300) } catch (e) {} }
function noiseHit(f, q, vol, dur, type) { const a = AC, t = a.currentTime, n = a.createBufferSource(); n.buffer = NOISE; const b = a.createBiquadFilter(); b.type = type || 'bandpass'; b.frequency.value = f; b.Q.value = q; const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); n.connect(b).connect(g).connect(MASTER); n.start(t, Math.random() * .5); n.stop(t + dur + .05) }
function sndSplat(p) { if (!sOk() || !thr('splat', 45)) return; try { noiseHit(rnd(280, 520), 1.4, .22 * Math.min(1.5, p || 1), .16); boom(AC.currentTime, .12, 60) } catch (e) {} }
function sndThud(v) { if (!sOk() || !thr('thud', 80)) return; try { boom(AC.currentTime, v || .3, 45) } catch (e) {} }
function sndShot(v) { if (!sOk() || !thr('shot', 55)) return; try { snare(AC.currentTime, v || .03) } catch (e) {} }
function sndGun() { if (!sOk()) return; try { const t = AC.currentTime; boom(t, .9, 38); boom(t + .05, .5, 70); noiseHit(1200, .5, .3, .35, 'lowpass') } catch (e) {} }
function sndBoom(k) { if (!sOk() || !thr('boom', 90)) return; try { boom(AC.currentTime, .6 * Math.min(1.4, k), 40); noiseHit(600, .4, .25 * k, .6, 'lowpass') } catch (e) {} }
function sndPick() { if (!sOk()) return; try { const a = AC, t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(990, t + .07); g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g).connect(MASTER); o.start(t); o.stop(t + .22) } catch (e) {} }
function sndHorde() { if (!sOk()) return; try { const a = AC, t = a.currentTime; for (let i = 0; i < 3; i++) { const o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110 + i * 7, t); o.frequency.linearRampToValueAtTime(70, t + 1.2); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05, t + .3); g.gain.exponentialRampToValueAtTime(.001, t + 1.4); o.connect(g).connect(MASTER); o.start(t); o.stop(t + 1.5) } } catch (e) {} }

/* ============================================================================
   12. FELÜLET: kezdőlap, műhely, eredmény, HUD, irányítás
   ============================================================================ */
const BTN = [['mgBrk', 'brk', '◀', 'FÉK'], ['mgTl', 'tl', '↺', 'BILLENT'], ['mgTr', 'tr', '↻', 'BILLENT'], ['mgGas', 'gas', '▶', 'GÁZ'], ['mgBoost', 'boost', '🚀', 'RAKÉTA'], ['mgFlame', 'flame', '🔥', 'LÁNG']];
function mgOpen() {
  const el = $('#harc'); el.hidden = false; el.classList.add('mgon'); document.body.classList.add('harcon');
  MG.sv = load();
  el.innerHTML = `<div class="hbar mgbar"><div class="htitle">MEAT <b>GRINDER</b></div><div class="hstat"><span>🪙 Kupak <b id="mgCash">0</b></span><span class="mgdst">Táv <b id="mgDst">0</b> m</span></div><button type="button" class="hx mgp" id="mgPause" aria-label="Szünet" hidden>❚❚</button><button type="button" class="hx" id="mgClose" aria-label="Bezárás">✕</button></div>
  <div class="mgwrap" id="mgWrap"><canvas id="mgCv" aria-label="Meat Grinder játéktér"></canvas>
   <div class="mghud" id="mgHud" hidden>
    <div class="mgprog"><i id="mgProg"></i><em id="mgBestM"></em><span>🏁</span></div>
    <div class="mggau"><div><small>⛽ ÜZEMANYAG</small><div class="mgbarr fuel"><i id="mgFuel"></i></div></div><div><small>🛡️ PÁNCÉL</small><div class="mgbarr hp"><i id="mgHp"></i></div></div><div id="mgBoW"><small>🚀 RAKÉTA</small><div class="mgbarr bo"><i id="mgBo"></i></div></div><div id="mgFlW"><small>🔥 LÁNG</small><div class="mgbarr fl"><i id="mgFl"></i></div></div></div>
    <div class="mginfo"><span><b id="mgKmh">0</b> km/h</span><span>☠ <b id="mgKills">0</b></span><span>🪙 <b id="mgRunCash">0</b></span><span id="mgAmmoW">💥 <b id="mgAmmo">0</b></span><span id="mgGrab" class="mggrab" hidden></span></div>
   </div>
   <div class="mgctl" id="mgCtl" hidden>
    ${BTN.map(([id, k, ic, lb]) => `<button type="button" class="mgb mg-${k}" id="${id}" data-k="${k}"><b>${ic}</b><small>${lb}</small></button>`).join('')}
    <button type="button" class="mgb mg-fire" id="mgFire"><b>💥</b><small>TŰZ</small><i id="mgRl"></i></button>
   </div>
   <div class="mgscr" id="mgScr"></div>
  </div>`;
  $('#mgClose').onclick = mgClose; $('#mgPause').onclick = () => pause(!MG.paused);
  const cv = $('#mgCv'); MG.cv = cv; MG.ctx = cv.getContext('2d');
  fit(); MG.onRes = () => fit(); addEventListener('resize', MG.onRes);
  for (const [id, k] of BTN) hold($('#' + id), k);
  const fb = $('#mgFire'); fb.addEventListener('pointerdown', e => { e.preventDefault(); try { fb.setPointerCapture(e.pointerId) } catch (x) {} MG.inp.fire = 1; MG.inp.fireH = 1 }); for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) fb.addEventListener(ev, () => { MG.inp.fireH = 0 });
  MG.key = e => keys(e); addEventListener('keydown', MG.key); addEventListener('keyup', MG.key);
  MG.vis = () => { if (document.hidden && MG.phase === 'play') pause(true) }; document.addEventListener('visibilitychange', MG.vis);
  $('#mgScr').addEventListener('click', onScr);
  MG.run = true; MG.phase = 'menu'; MG.paused = false; MG.last = performance.now();
  newRun(MG.sv.stage); // háttérnek
  showTitle();
  cancelAnimationFrame(MG.raf); MG.raf = requestAnimationFrame(loop);
}
function mgClose() {
  MG.run = false; cancelAnimationFrame(MG.raf); engStop(); try { rockStop(.3) } catch (e) {}
  if (MG.key) { removeEventListener('keydown', MG.key); removeEventListener('keyup', MG.key); MG.key = null }
  if (MG.onRes) removeEventListener('resize', MG.onRes); if (MG.vis) document.removeEventListener('visibilitychange', MG.vis);
  if (MG.sv) save();
  const el = $('#harc'); el.hidden = true; el.innerHTML = ''; el.classList.remove('mgon'); document.body.classList.remove('harcon');
  MG.trk = null;
}
// Felbontás: a képpont-arány alapból a készülék értéke (max 2,5), a „minőség-szabályzó” (lásd loop) lassú gépen csökkenti,
// ha a gép bírja, újra emeli – így nincs szaggatás, és erős gépen éles a kép (nagyobb felbontás, mint korábban).
function fit() { const cv = MG.cv; if (!cv) return; const r = cv.getBoundingClientRect(), dpr = LOWFX ? 1 : clamp((devicePixelRatio || 1) * (MG.q || 1), .75, 2.5); cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr)); MG.W = r.width || 1; MG.H = r.height || 1; MG.dpr = dpr; MG.viewW = MG.W; MG.skyC = null }
function hold(b, k) {
  if (!b) return;
  const on = e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId) } catch (x) {} MG.inp[k] = 1; b.classList.add('on'); ac() }, off = () => { MG.inp[k] = 0; b.classList.remove('on') };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  b.addEventListener('contextmenu', e => e.preventDefault());
}
function keys(e) {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const d = e.type === 'keydown' ? 1 : 0, k = e.key;
  const map = {ArrowRight: 'gas', d: 'gas', D: 'gas', ArrowLeft: 'brk', a: 'brk', A: 'brk', ArrowUp: 'tl', w: 'tl', W: 'tl', ArrowDown: 'tr', s: 'tr', S: 'tr', Shift: 'boost', g: 'flame', G: 'flame'};
  if (map[k]) { MG.inp[map[k]] = d; e.preventDefault(); return }
  if (k === ' ' || k === 'f' || k === 'F') { if (d) MG.inp.fire = 1; MG.inp.fireH = d; e.preventDefault() }
  if ((k === 'p' || k === 'P' || k === 'Escape') && d && MG.phase === 'play') pause(!MG.paused);
}
function pause(on) {
  MG.paused = !!on && MG.phase === 'play';
  const scr = $('#mgScr'); if (!scr) return;
  if (MG.paused) { scr.innerHTML = `<div class="mgcard mgpause"><h3>⏸ SZÜNET</h3><p>Táv: <b>${n0(Math.floor((MG.V.x - 220) / UM))} m</b> · ☠ ${MG.kills}</p><button type="button" class="btn pri" data-act="resume">▶ Folytatás</button> <button type="button" class="btn line" data-act="giveup">🏳 Feladom</button></div>`; scr.hidden = false }
  else if (MG.phase === 'play') { scr.innerHTML = ''; scr.hidden = true; MG.last = performance.now() }
  for (const [, k] of BTN) MG.inp[k] = 0;
}
function onScr(e) {
  const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; ac();
  if (a === 'shop') showShop();
  else if (a === 'title') showTitle();
  else if (a === 'go') startRun();
  else if (a === 'resume') pause(false);
  else if (a === 'giveup') { pause(false); finish('quit') }
  else if (a === 'quit') mgClose();
  else if (a === 'stage') { const i = +b.dataset.i; if (i < MG.sv.unl) { MG.sv.stage = i; save(); newRun(i); showShop() } }
  else if (a === 'buy') buy(b.dataset.k);
  else if (a === 'reset') { if (confirm('Biztosan törlöd a mentést? Minden fejlesztés és kupak elvész.')) { MG.sv = blankSave(); save(); newRun(0); showShop() } }
}
function setPhase(p) {
  MG.phase = p; const play = p === 'play' || p === 'end';
  $('#mgHud').hidden = !play; $('#mgCtl').hidden = p !== 'play'; $('#mgPause').hidden = p !== 'play';
  const scr = $('#mgScr'); scr.hidden = play; if (play) scr.innerHTML = '';
  $('#harc').classList.toggle('mgplay', play);
}
function showTitle() {
  setPhase('menu'); const sv = MG.sv;
  $('#mgScr').innerHTML = `<div class="mgcard mgtitle">
   <div class="mglogo"><span>MEAT</span><b>GRINDER</b><small>HÚSDARÁLÓ · PzH 2000 a zombi-apokalipszisben</small></div>
   <p>Juss el a <b>pálya végén lévő menedékig</b>! A PzH 2000-esed gyárilag egy rozsdás roncs – minden menet után a megtett távért és a ledarált zombikért <b>kupakot</b> kapsz, ebből a <b>Műhelyben</b> barkácsolsz rá motort, lánctalpat, páncélt, tartályt, ekét, kombájn-tálcát, húsdarálót, tüskéket, ágyúlőszert és géppuskát.</p>
   <ul class="mghelp"><li><b>▶ GÁZ / ◀ FÉK</b> – gyorsítás, fék, tolatás</li><li><b>↺ ↻ BILLENT</b> – a levegőben forgatod a járművet (ugratásnál!)</li><li><b>💥 TŰZ</b> – 155 mm-es gránát a horda közepébe</li><li><b>🚀 RAKÉTA</b> – tolóerő, ha megvan a fejlesztés</li><li>Billentyűzet: ←/→, ↑/↓, Space, Shift, P</li></ul>
   <div class="mgstats"><span>Legjobb táv<b>${n0(bestAll())} m</b></span><span>Ledarálva<b>${n0(sv.kills)}</b></span><span>Menetek<b>${n0(sv.runs)}</b></span></div>
   <button type="button" class="btn pri mgbig" data-act="shop">🔧 MŰHELY ÉS INDULÁS</button>
   <button type="button" class="btn line rkstart" data-rank="drone">🏆 Rekordjaim</button>
   ${gBoard('droneBest', false, v => n0(v) + ' p')}
  </div>`;
}
function statRow(lb, v, mx) { return `<div class="mgst"><span>${lb}</span><div><i data-st="width:${clamp(v / mx * 100, 2, 100).toFixed(0)}%"></i></div></div>` }
function showShop() {
  setPhase('menu'); const sv = MG.sv, b = bestAll();
  const mo = ST('motor'), fu = ST('futomu'), pa = ST('pancel'), tk = ST('tank'), el = ST('elol'), ag = ST('agyu'), gp = ST('gepp'), od = ST('oldal');
  const cards = UPG.map(u => {
    const L = sv.up[u.k], cur = u.lv[L], nx = u.lv[L + 1], max = !nx, lock = nx && nx.r && b < nx.r, poor = nx && sv.cash < nx.c;
    return `<div class="mgup${max ? ' max' : ''}${lock ? ' lock' : ''}"><div class="mguh"><span class="mgic">${u.ic}</span><div><small>${esc(u.n)}</small><b>${esc(cur.n)}</b></div></div>
     <div class="mgpips">${u.lv.slice(1).map((_, i) => `<i class="${i < L ? 'on' : ''}"></i>`).join('')}</div>
     ${max ? '<div class="mgnx">✔ Maximális szint</div>' : `<div class="mgnx"><b>${esc(nx.n)}</b><span>${esc(nx.d)}</span></div>
     ${lock ? `<button type="button" class="mgbuy" disabled>🔒 ${n0(nx.r)} m után</button>` : `<button type="button" class="mgbuy${poor ? ' poor' : ''}" data-act="buy" data-k="${u.k}">🪙 ${n0(nx.c)}</button>`}`}</div>`;
  }).join('');
  const stg = STAGES.map((s, i) => { const lk = i >= sv.unl, on = i === sv.stage, pct = clamp(sv.best[i] / s.len * 100, 0, 100);
    return `<button type="button" class="mgstg${on ? ' on' : ''}${lk ? ' lock' : ''}" data-act="stage" data-i="${i}" ${lk ? 'disabled' : ''}><small>${i + 1}. PÁLYA · ${n0(s.len)} m</small><b>${lk ? '🔒 ' : ''}${esc(s.n)}</b><span>${esc(s.s)}</span><div class="mgsp"><i data-st="width:${pct.toFixed(0)}%"></i></div><em>${sv.done[i] ? '🏁 Teljesítve' : 'Legjobb: ' + n0(sv.best[i]) + ' m'}</em></button>` }).join('');
  $('#mgScr').innerHTML = `<div class="mgcard mgshop">
   <div class="mgshh"><h3>🔧 MŰHELY</h3><div class="mgcash">🪙 <b>${n0(sv.cash)}</b> kupak</div></div>
   <canvas class="mgprev" id="mgPrev" aria-label="A jármű a fejlesztésekkel"></canvas>
   <div class="mgsts">${statRow('Végsebesség', mo.v, 280)}${statRow('Húzóerő', mo.f * fu.g, 2.05 * 1.42)}${statRow('Üzemanyag', tk.l, 250)}${statRow('Páncél', pa.hp * (1 + pa.dr), 360 * 1.4)}${statRow('Darálás', el.m * 40 + el.dps / 3 + od.dps / 4, 3 * 40 + 100 + 28)}${statRow('Tűzerő', firePower(sv.up), firePower(Object.fromEntries(UPG.map(u => [u.k, u.lv.length - 1]))))}</div>
   <div class="mglbl">PÁLYA</div><div class="mgstgs">${stg}</div>
   <button type="button" class="btn pri mgbig" data-act="go">▶ INDULÁS – ${esc(STAGES[sv.stage].n)}</button>
   <div class="mglbl">FEJLESZTÉSEK <small>– a feltételek a legnagyobb megtett távhoz kötöttek</small></div>
   <div class="mgups">${cards}</div>
   <div class="mgfoot"><button type="button" class="btn line" data-act="title">◀ Vissza</button> <button type="button" class="btn line" data-act="quit">Kilépés</button> <button type="button" class="btn line mgrst" data-act="reset">Mentés törlése</button></div>
  </div>`;
  $('#mgCash').textContent = n0(sv.cash);
  const pc = $('#mgPrev'); if (pc) { const r = pc.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); pc.width = r.width * d; pc.height = r.height * d; MG.prev = {c: pc.getContext('2d'), W: r.width, H: r.height, d} }
}
// a „Tűzerő” csík: a főágyú, a géppuska, a lángszóró, a lézer és az automata torony együttes képessége
function firePower(up) {
  const g = (k) => UPK[k].lv[up[k]].s, ag = g('agyu'), gp = g('gepp'), fl = g('lang'), lz = g('lezer'), tw = g('torony');
  return Math.sqrt(ag.am || 0) * (ag.dm || 0) / ((ag.rl || 9) * 10) + gp.rt * gp.dm / 3 + fl.fd * fl.fr / 800 + lz.nb * lz.dps / 12 + tw.rt * tw.dm * tw.nb / 8;
}
function buy(k) {
  const u = UPK[k], sv = MG.sv, nx = u.lv[sv.up[k] + 1]; if (!nx) return;
  if (nx.r && bestAll() < nx.r) { toast(`🔒 Ehhez legalább ${n0(nx.r)} m-t kell megtenned egy menetben.`); return }
  if (sv.cash < nx.c) { toast(`🪙 Ehhez ${n0(nx.c)} kupak kell – most ${n0(sv.cash)} van.`); return }
  sv.cash -= nx.c; sv.up[k]++; save(); sndPick(); try { if (sOk()) boom(AC.currentTime, .25, 90) } catch (e) {}
  const sc = $('#mgScr .mgshop'), top = sc ? sc.scrollTop : 0; showShop(); const s2 = $('#mgScr .mgshop'); if (s2) s2.scrollTop = top;
  toast(`${u.ic} ${nx.n} felszerelve!`);
}
function startRun() {
  const si = MG.sv.stage; newRun(si); setPhase('play'); MG.paused = false; MG.endShown = 0; MG.last = performance.now();
  $('#mgBoW').hidden = !MG.V.boost0; $('#mgAmmoW').hidden = !MG.V.ammo; $('#mgFire').hidden = !MG.V.ammo; $('#mgBoost').hidden = !MG.V.boost0; $('#mgFlW').hidden = !MG.V.flame0; $('#mgFlame').hidden = !MG.V.flame0;
  const bm = MG.sv.best[si] / STAGES[si].len; const be = $('#mgBestM'); if (be) { be.hidden = !(bm > 0 && bm < 1); be.style.left = (clamp(bm, 0, 1) * 100).toFixed(1) + '%' }
  engStart(); try { rockStart('grinder') } catch (e) {}
  playCount('drone');
}
function showResult() {
  const V = MG.V, T = MG.trk, si = T.si, S = T.S, sv = MG.sv, E = MG.end;
  const dist = Math.max(0, Math.floor((Math.min(MG.maxX, T.fin) - 220) / UM)), win = E.kind === 'win';
  const distCash = Math.floor(dist * .55), winCash = win ? S.bonus : 0, total = MG.cash + distCash + winCash;
  const score = dist + MG.pts + (win ? 1000 * (si + 1) : 0);
  sv.cash += total; sv.runs++; sv.kills += MG.kills; sv.tot += dist;
  const newBest = dist > sv.best[si]; if (newBest) sv.best[si] = dist;
  let unlocked = false; if (win) { if (!sv.done[si]) sv.done[si] = 1; if (si + 1 < STAGES.length && sv.unl < si + 2) { sv.unl = si + 2; unlocked = true } }
  save();
  let rec = {best: score, rec: false}; try { rec = gSave('droneBest', score, 'medve-drone-best') } catch (e) {}
  setPhase('menu'); engStop(); try { rockStop(1.5) } catch (e) {}
  const why = {win: '🏁 ELÉRTED A MENEDÉKET!', dead: '💥 SZÉTSZEDTÉK A PzH-T', flip: '🙃 FELBORULTÁL', fuel: '⛽ KIFOGYOTT AZ ÜZEMANYAG', stuck: '🧟 ELAKADTÁL A HORDÁBAN', quit: '🏳 FELADTAD'}[E.kind] || 'VÉGE';
  const kl = Object.entries(MG.kt).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<span>${esc(ZT[k].n)} <b>×${n}</b></span>`).join('');
  $('#mgScr').innerHTML = `<div class="mgcard mgres${win ? ' win' : ''}"><h3>${why}</h3>
   <div class="mgrd"><div class="mgprog sm"><i data-st="width:${clamp(dist / S.len * 100, 0, 100).toFixed(1)}%"></i><span>🏁</span></div><b>${n0(dist)} m</b> / ${n0(S.len)} m ${newBest ? '<em class="hrec">ÚJ TÁVREKORD!</em>' : ''}</div>
   <div class="mgkl">${kl || '<span>Egy zombit sem daráltál le.</span>'}</div>
   <table class="mgtab"><tr><td>Megtett táv (${n0(dist)} m)</td><td>+${n0(distCash)}</td></tr><tr><td>Zombik, ládák (${MG.kills} ☠)</td><td>+${n0(MG.cash)}</td></tr>${win ? `<tr><td>Menedék-jutalom</td><td>+${n0(winCash)}</td></tr>` : ''}<tr class="tot"><td>Kupak összesen</td><td>🪙 +${n0(total)}</td></tr></table>
   <p class="mgsc">Pontszám: <b class="hred">${n0(score)}</b> ${rec.rec ? '<b class="hrec">🏆 ÚJ REKORD!</b>' : '· Rekord: <b>' + n0(rec.best) + '</b>'}<br><small>táv + zombik pontja${MG.bestCombo > 2 ? ' + kombó (legjobb ×' + MG.bestCombo + ')' : ''}${win ? ' + menedék-bónusz' : ''}</small></p>
   ${unlocked ? `<p class="mgunl">🔓 Új pálya nyílt: <b>${esc(STAGES[si + 1].n)}</b></p>` : ''}
   <button type="button" class="btn pri mgbig" data-act="shop">🔧 MŰHELY</button> <button type="button" class="btn line" data-act="go">↻ Újra</button> <button type="button" class="btn line" data-act="quit">Kilépés</button>
  </div>`;
  $('#mgCash').textContent = n0(sv.cash);
}
function hudUpd() {
  const V = MG.V, T = MG.trk, dist = Math.max(0, Math.floor((V.x - 220) / UM));
  const q = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== String(v)) e.textContent = v };
  const w = (id, p) => { const e = document.getElementById(id); if (e) e.style.width = clamp(p * 100, 0, 100).toFixed(1) + '%' };
  q('mgDst', n0(dist)); q('mgKmh', Math.round(Math.hypot(V.vx, V.vy) / UM * 3.6)); q('mgKills', MG.kills); q('mgRunCash', n0(MG.cash)); q('mgAmmo', V.ammo);
  w('mgProg', (V.x - 220) / (T.fin - 220)); w('mgFuel', V.fuel / V.fuel0); w('mgHp', V.hp / V.hp0); w('mgBo', V.boost0 ? V.boost / V.boost0 : 0); w('mgRl', V.rl0 ? V.rl / V.rl0 : 0); w('mgFl', V.flame0 ? V.flame / V.flame0 : 0);
  const fe = $('#mgFuel'); if (fe) fe.parentNode.classList.toggle('low', V.fuel / V.fuel0 < .2);
  const he = $('#mgHp'); if (he) he.parentNode.classList.toggle('low', V.hp / V.hp0 < .3);
  const gr = $('#mgGrab'); if (gr) { gr.hidden = !MG.grab.length; if (MG.grab.length) gr.textContent = `🧟 ${MG.grab.length} rajtad!` }
  const fb = $('#mgFire'); if (fb) fb.classList.toggle('cd', V.rl > 0 || V.ammo <= 0);
}

/* ============================================================================
   13. FŐ CIKLUS
   ============================================================================ */
let loop = function (now) {
  if (!MG.run) return;
  MG.raf = requestAnimationFrame(loop);
  const raw = (now - MG.last) / 1000 || 0; let dt = Math.min(.05, raw); MG.last = now; MG.fdt = dt;
  qualityGov(raw, now);
  if (MG.phase === 'play' || MG.phase === 'end') {
    if (!MG.paused) { update(dt * MG.slow); if (MG.end) MG.slow = Math.min(1, MG.slow + dt * .25) }
    draw(now);
    MG.hudT = (MG.hudT || 0) - dt; if (MG.hudT <= 0) { MG.hudT = .1; hudUpd() }
    engUpd();
  } else {
    // menüben: a háttér a jármű körül lassan él, a műhely előnézete forog
    if (MG.trk) { for (let i = 0; i < 4; i++) vehStep(MG.V, dt / 4, {}); MG.t += dt; draw(now) }
    if (MG.prev && document.getElementById('mgPrev')) drawPrev(now); else MG.prev = null;
  }
};
loop = medveWrap(loop, MG, 'GRINDER');
// minőség-szabályzó: a képkocka-idő mozgóátlaga alapján állítja a render-felbontást (MG.q), hogy ne legyen lag
function qualityGov(raw, now) {
  if (LOWFX || raw <= 0 || raw > .5 || MG.paused) return;
  MG.ft = MG.ft ? MG.ft + (raw - MG.ft) * .06 : raw;
  if (now - (MG.qT || 0) < 2500) return;
  const q = MG.q || 1;
  if (MG.ft > .022 && q > .55) { MG.q = Math.max(.55, q * .82); MG.qT = now; MG.qDown = now; fit() }
  else if (MG.ft < .0185 && q < 1.5 && now - (MG.qDown || 0) > 12000 && MG.dpr < 2.5) { MG.q = Math.min(1.5, q * 1.15); MG.qT = now; fit() }
}
function drawPrev(now) {
  const P = MG.prev, c = P.c; c.setTransform(P.d, 0, 0, P.d, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, P.H); g.addColorStop(0, '#2a1a12'); g.addColorStop(1, '#0e0806'); c.fillStyle = g; c.fillRect(0, 0, P.W, P.H);
  c.fillStyle = 'rgba(255,190,90,.12)'; c.beginPath(); c.moveTo(P.W * .3, 0); c.lineTo(P.W * .7, 0); c.lineTo(P.W * .85, P.H); c.lineTo(P.W * .15, P.H); c.fill();
  c.fillStyle = '#1a120c'; c.fillRect(0, P.H * .8, P.W, P.H * .2);
  const s = Math.min(P.W / 380, P.H / 120);
  c.save(); c.translate(P.W / 2 - 30 * s, P.H * .8 - 31 * s); c.scale(s, s);
  const fake = {x: 0, y: 0, a: Math.sin(now / 1400) * .015, track: now / 40, mgA: Math.sin(now / 900) * .3, blood: [], grind: .4, fuel: 1, boosting: 0};
  drawVeh(c, fake, now, MG.sv.up, false);
  c.restore();
}

export {MG, mgOpen, mgClose, UPG, STAGES, ZT};
