// M.E.D.V.E. Arcade – mgmon.js: az „ALONE IN THE CORRIDOR: 1000 DAYS” szörnyei pixel-art sprite-ként a Meat Grinderhez.
// A rajzoló kód az eredeti játékból származik (ugyanaz a pixel-toll és paletta), itt csak a kiválasztott fajok vannak benne.
// Használat: monSprite(típus, képkocka 0..3) → vászon (balra néz); monDef(típus) → méretek. A sprite-ek lustán, egyszer készülnek el.
const cache = new Map();
const PAL = {
  K: '#12040a', bone: '#e8dcc0', boneD: '#a8977a', flesh: '#b8705e', fleshL: '#e0a48c', fleshD: '#6e2f2b',
  meat: '#8e1b24', meatL: '#c8434a', pale: '#cfc3b2', paleD: '#8a7e70', vein: '#4a0d1a', bile: '#8fd12b',
  gum: '#d46a7a', teeth: '#f2ead2', eyeY: '#fff35c', eyeR: '#ff2a2a', eyeW: '#f4f1e6', metal: '#8a8f94', metalD: '#4b5057', chitin: '#3a2a20'
};


function makePen(w, h) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d', { willReadFrequently: true }); // v15: CPU-oldali vászon – a getImageData nem akasztja meg a GPU-t
  const K = PAL.K;
  const pen = {
    cv, c, eyes: [],
    R(x, y, ww, hh, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(ww)), Math.max(1, Math.round(hh))); },
    P(x, y, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); },
    L(x1, y1, x2, y2, t, col, outline = true) {
      const n = Math.max(1, Math.round(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
      const passes = outline ? [[t + 2, K], [t, col]] : [[t, col]];
      for (const [tt, cc] of passes) for (let i = 0; i <= n; i++) pen.R(x1 + (x2 - x1) * i / n - tt / 2, y1 + (y2 - y1) * i / n - tt / 2, tt, tt, cc);
    },
    // több szegmensű, elvékonyodó végtag: előbb a teljes körvonal, utána a kitöltés (nincs csúnya ízület-vonal)
    chain(pts, t1, t2, col) {
      const segs = pts.length - 1;
      for (const [o, cc] of [[2, K], [0, col]]) for (let s = 0; s < segs; s++) {
        const [x1, y1] = pts[s], [x2, y2] = pts[s + 1];
        const ta = t1 + (t2 - t1) * s / segs, tb = t1 + (t2 - t1) * (s + 1) / segs;
        const n = Math.max(1, Math.round(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
        for (let i = 0; i <= n; i++) { const tt = ta + (tb - ta) * i / n + o; pen.R(x1 + (x2 - x1) * i / n - tt / 2, y1 + (y2 - y1) * i / n - tt / 2, tt, tt, cc); }
      }
    },
    E(cx, cy, rx, ry, col, outline = true) {
      const passes = outline ? [[1, K], [0, col]] : [[0, col]];
      for (const [o, cc] of passes) {
        const RX = rx + o, RY = ry + o;
        c.fillStyle = cc;
        for (let yy = -Math.floor(RY); yy <= Math.floor(RY); yy++) {
          const hw = RX * Math.sqrt(Math.max(0, 1 - (yy * yy) / (RY * RY)));
          if (hw < 0.5) continue;
          c.fillRect(Math.round(cx - hw), Math.round(cy + yy), Math.max(1, Math.round(hw * 2)), 1);
        }
      }
    },
    eye(x, y, col, s = 1) { pen.R(x, y, s, s, col); pen.eyes.push([Math.round(x) + s / 2, Math.round(y) + s / 2, col, s]); }
  };
  return pen;
}


function finishSprite(small, sc) {
  const w = small.width, h = small.height, sctx = small.getContext('2d');
  const img = sctx.getImageData(0, 0, w, h), d = img.data, s0 = new Uint8ClampedArray(d);
  const isOut = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return true; const i = (y * w + x) * 4; return s0[i + 3] < 40 || (s0[i] < 30 && s0[i + 1] < 14 && s0[i + 2] < 24); };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (isOut(x, y)) continue;
    let k = 1, spec = false;
    if (isOut(x - 1, y) || isOut(x, y - 1)) { k = 1.32; spec = ((x * 5 + y * 3) % 7) === 0; }
    else if (isOut(x + 1, y) || isOut(x, y + 1)) k = 0.58;
    else if (((x * 7 + y * 13) % 5) === 0) k = 0.8;
    else if (((x * 3 + y * 11) % 9) === 0) k = 1.16;
    if (spec) { d[i] = 255; d[i + 1] = 214; d[i + 2] = 220; }
    else { d[i] = Math.min(255, s0[i] * k); d[i + 1] = Math.min(255, s0[i + 1] * k); d[i + 2] = Math.min(255, s0[i + 2] * k); }
  }
  sctx.putImageData(img, 0, 0);
  const out = document.createElement('canvas'); out.width = w * sc; out.height = h * sc;
  const o = out.getContext('2d'); o.imageSmoothingEnabled = false; o.drawImage(small, 0, 0, w * sc, h * sc);
  // húscafat-darabok: a sprite négyzetrácsos felvágása (a Meat Grinder ezeket szórja szét)
  const n = out.width > 100 ? 5 : 4, cw = Math.ceil(out.width / n), chh = Math.ceil(out.height / n), ch = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    let cnt = 0;
    for (let y = Math.floor(j * chh / sc); y < Math.min(h, Math.ceil((j + 1) * chh / sc)); y++) for (let x = Math.floor(i * cw / sc); x < Math.min(w, Math.ceil((i + 1) * cw / sc)); x++) if (s0[(y * w + x) * 4 + 3] > 40) cnt++;
    if (cnt > 3) ch.push([i * cw, j * chh, Math.min(cw, out.width - i * cw), Math.min(chh, out.height - j * chh)]);
  }
  out._chunks = ch;
  return out;
}

// [rácsszélesség, rácsmagasság, nagyítás]
const GRID = {lurker: [22, 44, 3], snail: [34, 22, 3], cyborg: [26, 32, 3], kraken: [34, 32, 3], hound: [30, 18, 3], spider: [36, 26, 3], twin: [30, 34, 3], tower: [26, 48, 3]};
const CFG = {lurker: ['#b08a7a', '#e6c9b8'], snail: ['#6b8e23', '#c3e06c'], cyborg: ['#9a3b3b', '#fca5a5'], kraken: ['#2e7d6e', '#7fe3c2'], hound: ['#9a2a30', '#e8dcc0'], spider: ['#4a3226', '#c4222f'], twin: ['#b8705e', '#e0a48c'], tower: ['#8e1b24', '#d46a7a']};

function build(typeKey, frame) {
  const [GW, GH, sc] = GRID[typeKey];
  const pen = makePen(GW, GH); const { R, P, L, E } = pen;
  const cfg = CFG[typeKey], K = PAL.K, F = cfg[0], H = cfg[1];
  const f = frame % 4, ph = f * Math.PI / 2, s = Math.sin(ph), c = Math.cos(ph), a = f % 2;
  const B = PAL.bone, Bd = PAL.boneD, M = PAL.meat, Ml = PAL.meatL, V = PAL.vein, Pa = PAL.pale, Pd = PAL.paleD, G = PAL.gum, TE = PAL.teeth;
  const eye = pen.eye;
  const claw = (x, y, d = -1) => { P(x + d, y, B); P(x + d * 2, y + 1, B); P(x, y + 1, B); P(x + d, y + 2, B); };
  const ribsV = (x, y, w, h) => { R(x - 1, y - 1, w + 2, h + 2, K); R(x, y, w, h, M); for (let i = 0; i < h; i += 2) R(x, y + i, w, 1, B); R(x + Math.floor(w / 2), y, 1, h, V); };
  const brainAt = (cx, cy, rx, ry) => {
    E(cx, cy, rx, ry, G); E(cx - rx * 0.3, cy - ry * 0.35, rx * 0.4, ry * 0.3, '#f2b8c6', false);
    for (let i = -Math.floor(rx) + 1; i < rx; i += 2) P(cx + i, cy + ((i % 4 === 0) ? 0 : 1), '#a24a68');
    R(cx, cy - ry + 1, 1, ry * 2 - 1, '#a24a68');
  };
  switch (typeKey) {

          case 'lurker': {
            const st = s * 4;
            pen.chain([[12, 26], [14 - st * 0.4, 34], [15 - st, 43]], 2, 1, Pd);
            pen.chain([[12, 14], [16, 22], [17 - s, 32]], 1, 1, Pd);
            L(11, 26, 11, 14, 3, Pa); for (let i = 0; i < 4; i++) R(10, 16 + i * 2, 3, 1, Pd); P(11, 24, M);
            pen.chain([[11, 26], [8 + st * 0.4, 34], [7 + st, 43]], 2, 1, Pa);
            pen.chain([[10, 14], [5, 23], [3 + s, 33]], 1, 1, Pa);
            for (let k = 0; k < 3; k++) L(3 + s, 33, 1 + s + k, 37, 1, Pa, false);
            L(11, 14, 9, 9, 1, Pa);
            E(8, 6, 3, 3.5, Pa); R(6, 5, 2, 2, K); R(9, 5, 2, 2, K); eye(6, 5, PAL.eyeW); eye(10, 6, PAL.eyeW);
            R(5, 8, 7, 1, K); R(6, 8, 5, 1, TE); P(5, 7, K); P(11, 7, K);
            L(10, 3, 13, 10, 1, '#1a120e', false); L(9, 2, 12, 12, 1, '#1a120e', false);
            break;
          }

          case 'snail': {
            R(0, 20, 34, 2, 'rgba(143,209,43,.6)');
            for (let x = 4; x < 32; x++) { const yy = 17 + Math.round(Math.sin(x * 0.6 + ph) * 0.8); R(x, yy - 3, 1, 5, K); }
            for (let x = 5; x < 31; x++) { const yy = 17 + Math.round(Math.sin(x * 0.6 + ph) * 0.8); R(x, yy - 2, 1, 3, '#6b7a3a'); P(x, yy - 2, '#8a9a4a'); }
            E(21, 9, 8.5, 7, '#8a5a3a'); E(21, 9, 5.5, 4.5, '#6a3f26', false); E(21, 9, 3, 2.5, '#8a5a3a', false); P(21, 9, '#c8a070');
            E(24, 6, 2.5, 2.2, B); R(23, 5, 1, 1, K); R(25, 5, 1, 1, K); R(23, 8, 3, 1, K);
            E(17, 12, 2, 1.8, B); P(16, 11, K); P(18, 11, K);
            P(13, 6, Ml); P(28, 12, Ml); L(14, 4, 12, 2, 1, B, false);
            pen.chain([[9, 17], [7, 12], [6, 9]], 3, 3, '#7a8a4a');
            E(5, 9, 3, 3.5, Pa); R(3, 8, 1, 1, K); R(6, 8, 1, 1, K); R(3, 11, 4, 1, M); P(4, 12, PAL.bile);
            pen.chain([[4, 6], [2, 1 + a]], 1, 1, '#7a8a4a'); pen.chain([[7, 6], [8, 2 - a]], 1, 1, '#7a8a4a');
            eye(2, 1 + a, PAL.eyeY); eye(8, 2 - a, PAL.eyeY);
            break;
          }

          case 'cyborg': {
            const MT = PAL.metal, MD = PAL.metalD, CB = '#2a2d31';
            pen.chain([[15, 22], [17, 27], [16 - s, 31]], 2, 2, PAL.fleshD);
            pen.chain([[17, 13], [21, 18], [20 + c, 23]], 2, 1, F); claw(20 + c, 22, 1);
            R(9, 11, 10, 12, K); R(10, 12, 8, 10, M); for (let i = 0; i < 4; i++) L(14, 13 + i * 2, 17, 13 + i * 2, 1, Ml, false);
            R(10, 12, 4, 10, MD); P(11, 13, MT); P(11, 20, MT); R(13, 16, 1, 2, '#ff2a2a');
            L(17, 12, 20, 21, 1, CB, false); L(16, 12, 19, 22, 1, '#1a1c1f', false);
            pen.chain([[12, 22], [10, 27], [11 + s, 31]], 2, 2, MT); R(9 + s, 30, 4, 2, MD);
            pen.chain([[11, 13], [7, 16]], 3, 3, MT); R(1, 14, 7, 3, K); R(2, 15, 6, 1, MD); R(0, 15, 2, 1, K); eye(1, 15, PAL.eyeR);
            E(13, 7, 4, 4.5, Pa); R(9, 3, 5, 9, K); R(9, 4, 4, 7, MT); R(9, 4, 4, 1, '#b0b5ba');
            eye(10, 6, PAL.eyeR); R(11, 6, 1, 1, '#ff8a8a');
            eye(15, 6, PAL.eyeY); R(12, 10, 5, 2, K); R(12, 10, 2, 2, MD); P(14, 10, TE); P(16, 10, TE);
            L(16, 9, 19, 13, 1, CB, false);
            break;
          }

          case 'kraken': {
            for (let i = 0; i < 8; i++) {
              const pts = [], x0 = 11 + i * 1.7, dir = i < 4 ? -1 : 1;
              for (let k = 0; k <= 5; k++) pts.push([x0 + dir * k * (0.6 + (i % 2) * 0.4) + Math.sin(ph + i * 1.3 + k * 0.9) * k * 0.5, 15 + k * 3]);
              pen.chain(pts, 3, 1, i % 2 ? '#256b5e' : F);
              P(pts[2][0], pts[2][1], G); P(pts[3][0], pts[3][1], G);
            }
            E(18, 9, 9, 8, F); E(15, 6, 5, 3, H, false);
            L(9, 6, 2, 2 + a, 2, H); L(27, 6, 33, 3 - a, 2, H);
            [[13, 8], [17, 7], [21, 8], [15, 11], [20, 11]].forEach(([x, y], i) => { R(x - 1, y - 1, 3, 2, K); eye(x, y - 1, i % 2 ? PAL.eyeR : PAL.eyeY); });
            R(16, 13, 4, 3, K); P(17, 14, B); P(18, 15, B);
            break;
          }

          case 'hound': { // Bőrtelen Kopó: nyúzott, csupa-izom négylábú, csontpofa
            const MU = '#9a2a30', MD = '#5e1218';
            pen.chain([[22, 9], [25 + s, 13], [24 + s * 2, 17]], 2, 1, MD);
            pen.chain([[10, 9], [8 - c, 13], [6 - c * 2, 17]], 2, 1, MD);
            pen.chain([[23, 7], [27, 5], [29, 3 + a]], 2, 1, MD);
            E(16, 8, 8, 3.5, MU); E(15, 7, 5, 1.5, '#c8434a', false);
            for (let i = 0; i < 5; i++) L(11 + i * 2.5, 6, 11.5 + i * 2.5, 10, 1, B, false);
            R(19, 7, 4, 1, Ml); P(14, 11, V); P(20, 10, V);
            pen.chain([[21, 10], [23 - s, 13], [21 - s * 2, 17]], 2, 1, MU);
            pen.chain([[11, 10], [9 + c, 13], [8 + c * 2, 17]], 2, 1, MU);
            L(10, 7, 6, 6, 3, MU);
            E(4, 6, 4, 2.5, B); R(0, 7, 6, 2 + a, K); for (let i = 0; i < 3; i++) P(1 + i * 2, 7, TE); P(2, 8 + a, TE); P(4, 8 + a, TE);
            R(3, 4, 2, 2, K); eye(3, 4, PAL.eyeR); R(6, 4, 1, 1, K);
            break;
          }

          case 'spider': { // Pókanya: emberi felsőtest nyolc pókláb fölött, vörös homokóra a potrohon
            const CH = '#3a2a20', CL = '#5a4232';
            for (let i = 0; i < 4; i++) {
              const o = (i + f) % 2 ? 1 : -1, x = 14 + i * 4;
              pen.chain([[x, 15], [x - 5 + o, 7 + i], [x - 8 + o, 25]], 1, 1, i % 2 ? CH : CL);
              pen.chain([[x + 2, 15], [x + 8 - o, 7 + i], [x + 11 - o, 25]], 1, 1, i % 2 ? CL : CH);
            }
            E(23, 15, 8, 6, F); E(21, 13, 4, 2.5, '#6a4a36', false);
            R(23, 13, 2, 1, '#c4222f'); R(22, 14, 4, 1, '#c4222f'); R(23, 15, 2, 1, '#c4222f'); R(22, 16, 4, 1, '#c4222f');
            L(15, 15, 12, 8, 3, Pa); for (let i = 0; i < 3; i++) R(11, 9 + i * 2, 3, 1, Pd); P(13, 14, M);
            pen.chain([[12, 9], [7, 11 + s], [4, 7 + s]], 1, 1, Pa); claw(4, 6 + s);
            pen.chain([[13, 9], [9, 13 - s], [7, 16 - s]], 1, 1, Pd); claw(7, 15 - s);
            E(11, 4, 3, 3.5, Pa); R(8, 3, 6, 2, K);
            eye(8, 3, PAL.eyeR); eye(10, 2, PAL.eyeR); eye(12, 3, PAL.eyeR); eye(10, 4, PAL.eyeY);
            R(9, 6, 4, 1, K); P(9, 7, TE); P(12, 7, TE);
            L(12, 1, 15, 0, 1, '#1a120e', false); L(11, 1, 13, -1, 1, '#1a120e', false);
            break;
          }

          case 'twin': { // Sziámi Iker: két fej, egy összeforrt test, három kar – halálakor kettéválik
            pen.chain([[17, 24], [19, 29], [18 - s, 33]], 2, 2, Pd);
            pen.chain([[12, 24], [10, 29], [11 + s, 33]], 2, 2, F);
            E(15, 17, 7, 8, F); E(13, 15, 4, 4, H, false); L(15, 10, 15, 25, 1, '#6e2f2b', false);
            for (let i = 0; i < 4; i++) { P(14, 12 + i * 3, B); P(16, 13 + i * 3, B); }
            ribsV(16, 15, 4, 5);
            pen.chain([[21, 13], [25, 17 + c], [24, 22 + c]], 2, 1, Pd); claw(24, 21 + c, 1);
            pen.chain([[9, 13], [4, 17 + s], [2, 13 + s]], 2, 1, F); claw(2, 12 + s);
            pen.chain([[15, 20], [11, 22 - s], [7, 21 - s]], 1, 1, H); claw(7, 20 - s);
            L(11, 10, 9, 7, 2, F); L(19, 10, 21, 7, 2, F);
            E(8, 5, 3.5, 4, Pa); R(5, 4, 2, 2, K); R(8, 4, 2, 2, K); eye(5, 4, PAL.eyeR); eye(9, 4, PAL.eyeR); R(6, 8, 4, 1, K); P(7, 8, TE);
            E(22, 4, 3.5, 4, Pd); R(20, 3, 2, 2, K); R(23, 3, 2, 2, K); eye(20, 3, PAL.eyeW); eye(24, 3, PAL.eyeW); R(20, 7, 5, 2 + a, K); P(21, 7, TE); P(23, 7, TE);
            break;
          }

          case 'tower': { // Hústorony: egymásra nőtt arcok oszlopa csápokkal – gyógyítja a környező szörnyeket
            for (let y = 6; y < 44; y++) { const w2 = 5 + (y > 30 ? (y - 30) * 0.35 : 0) + Math.sin(y * 0.45 + ph) * 0.6; R(13 - w2 - 1, y, w2 * 2 + 2, 1, K); R(13 - w2, y, w2 * 2, 1, y % 4 === 0 ? M : F); }
            for (let k = 0; k < 4; k++) { const yy = 10 + k * 8; E(13, yy, 3.5, 3, Pa); R(11, yy - 1, 1, 1, K); R(14, yy - 1, 1, 1, K); eye(11, yy - 1, k % 2 ? PAL.eyeY : PAL.eyeR); eye(14, yy - 1, k % 2 ? PAL.eyeY : PAL.eyeR); R(12, yy + 1, 3, 1 + ((k + f) % 2), K); }
            for (let i = 0; i < 3; i++) {
              const y0 = 14 + i * 9;
              pen.chain([[8, y0], [3, y0 + 2 + Math.sin(ph + i) * 2], [1, y0 + 6 + Math.sin(ph + i) * 2]], 2, 1, H);
              pen.chain([[18, y0 + 3], [23, y0 + 1 - Math.sin(ph + i) * 2], [25, y0 + 6 - Math.sin(ph + i) * 2]], 2, 1, F);
            }
            brainAt(13, 3, 5, 3);
            for (let i = 0; i < 5; i++) R(6 + i * 3, 44, 2, 3 + ((i + f) % 2), F);
            P(10, 20, V); P(16, 27, V); P(9, 35, V);
            break;
          }

  }
  const fin = finishSprite(pen.cv, sc);
  fin.eyes = pen.eyes.map(([x, y, col, sz]) => [x * sc, y * sc, col, Math.max(2, sz * sc * 0.75)]);
  return fin;
}

function monSprite(type, frame) {
  const key = type + (frame & 3);
  let s = cache.get(key);
  if (!s) { s = build(type, frame & 3); cache.set(key, s) }
  return s;
}
const MON_TYPES = Object.keys(GRID);
export {monSprite, MON_TYPES};
