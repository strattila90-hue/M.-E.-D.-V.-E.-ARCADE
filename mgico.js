// M.E.D.V.E. Arcade – mgico.js: a Meat Grinder saját rajzolt piktogramjai (nem emoji-készlet).
// Stílus: katonai sablon (stencil) – vastag, 45°-ban levágott sarkok, két tónus (fő szín + sárga/narancs kiemelés),
// sötét kivágások, szegecsek. Minden ikon 32×32-es; a színt a `color`, a kiemelést a `--ic2`, a kivágást a `--ic0` CSS-változó adja.
const D = '#1a0f0b';                                   // kivágás (a panel sötétje)
const pts = (n, r1, r2, cx = 16, cy = 16, rot = -Math.PI / 2) => Array.from({length: n * 2}, (_, i) => { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; return (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1) }).join(' ');
const a2 = 'var(--ic2,#f2b21c)', d0 = 'var(--ic0,' + D + ')';
const rivet = (x, y) => `<circle cx="${x}" cy="${y}" r="1" fill="${d0}"/>`;
// név → [fő szín, kiemelés, tartalom]; szín nélküli (null) ikon a szülő színét örökli
const ICONS = {
  motor: ['#b8bbae', '#f2b21c', `<path d="M5 14l3-3h18l2 3v11l-2 2H7l-2-2z"/><path d="M8 6h4v5H8zM14 6h4v5h-4zM20 6h4v5h-4z"/><path d="M28 17h3.4v4H28z"/><circle cx="12" cy="20" r="4.6" fill="${d0}"/><circle cx="12" cy="20" r="2.3" fill="${a2}"/><path d="M19 15h6v2h-6zM19 19h6v2h-6zM19 23h6v1.6h-6z" fill="${d0}"/>`],
  track: ['#b8bbae', '#f2b21c', `<g transform="translate(16 12)"><path d="M-2 -11h4v22h-4z"/><path d="M-2 -11h4v22h-4z" transform="rotate(45)"/><path d="M-2 -11h4v22h-4z" transform="rotate(90)"/><path d="M-2 -11h4v22h-4z" transform="rotate(135)"/><circle r="7.6"/><circle r="4.2" fill="${d0}"/><circle r="1.8" fill="${a2}"/></g><path d="M2 22.5h28l-1.6 6.5H3.6z"/><path d="M7 22.5v6.5M12 22.5v6.5M17 22.5v6.5M22 22.5v6.5M27 22.5v6.5" stroke="${d0}" stroke-width="1.5" fill="none"/>`],
  fuel: ['#e0a91c', '#1a0f0b', `<path d="M6 12l3-3h14l3 3v16H6z"/><path d="M8 4h9l2 3v2H8z"/><path d="M10 6h5v1.6h-5z" fill="${d0}"/><path d="M20 4h5l2 3v3h-7z"/><path d="M10.5 15.5l11 9M21.5 15.5l-11 9" stroke="${d0}" stroke-width="2" fill="none"/><path d="M7 11.5h18" stroke="${d0}" stroke-width="1"/>`],
  shield: ['#aab09a', '#f2b21c', `<path d="M16 2.5l11.5 4V17L16 29.5 4.5 17V6.5z"/><path d="M16 8l7 2.4v5.8L16 24l-7-7.8v-5.8z" fill="${d0}"/><path d="M16 11.2l4 1.4v3.2l-4 4.6-4-4.6v-3.2z" fill="${a2}"/>${rivet(8, 9)}${rivet(24, 9)}`],
  plow: ['#b9bcae', '#f2b21c', `<path d="M3 5h9l10 6.5V26H10L3 19z"/><path d="M12 11l8 5.2v6.8" stroke="${d0}" stroke-width="1.6" fill="none"/><path d="M22 7l8 3.4-8 3.4zM22 14.8l8 3.4-8 3.4zM22 22.6l7 3.1-7 2.9z" fill="${a2}"/>${rivet(7, 9)}${rivet(7, 15)}`],
  spikes: ['#c7c9bd', '#f2b21c', `<path d="M2 26l5.6-17.5L13 26zM11.5 26L17.5 3.5 23.5 26zM22 26l4-14 5 14z"/><path d="M2 26h28v3.6H2z" fill="${a2}"/><path d="M2 18.5q7 5.5 14 0t14 .5" stroke="${a2}" stroke-width="1.6" fill="none"/><path d="M9 20.5l3-3M12 20.5l-3-3M21 20.5l3-3M24 20.5l-3-3" stroke="${d0}" stroke-width="1.3" fill="none"/>`],
  cannon: ['#b8bbae', '#ff7a1e', `<path d="M2 19h11l3 4v6H2z"/><g transform="rotate(-26 9 17)"><path d="M8 14.2h19v5.2H8z"/><path d="M25 12.4h5v8.8h-5z"/></g><path d="M5 22.4h4v2.6H5z" fill="${d0}"/><polygon points="${pts(7, 6, 2.6, 27, 6)}" fill="${a2}"/>`],
  mg: ['#b8bbae', '#f2b21c', `<path d="M1.5 11.4h18v3.2h-18z"/><path d="M4 9.4h2.4v2H4zM9 9.4h2.4v2H9z"/><path d="M13.5 10l2-2h9l2 2v9h-13z"/><path d="M17 19l-1 8.6h5l1.4-8.6z" fill="${a2}"/><path d="M26.5 12h4v6.6h-4z"/><path d="M16.5 12.5h8" stroke="${d0}" stroke-width="1.4"/><path d="M8 14.6v2.4h3v-2.4" stroke="${d0}" stroke-width="1" fill="none"/>`],
  rocket: ['#c9ccbf', '#ff7a1e', `<path d="M16 1.5c5.4 5 5.8 12 4.8 19.5H11.2C10.2 13.5 10.6 6.5 16 1.5z"/><path d="M11.4 15.4L4.6 23.4h6.4zM20.6 15.4l6.8 8h-6.4z"/><circle cx="16" cy="11" r="2.8" fill="${d0}"/><path d="M12.5 21.4L16 30.5l3.5-9.1z" fill="${a2}"/><path d="M11.2 17h9.6" stroke="${d0}" stroke-width="1.3"/>`],
  flame: ['#ff6a1a', '#ffd24a', `<path d="M16 1.5c1.6 5.6 10 9 10 17.6C26 25.4 21.6 30 16 30S6 25.4 6 19.1c0-4.6 3.6-6.6 4.6-11.4 2 1.4 3.2 2.6 3.4 4.8C15.6 9.6 15.6 5.4 16 1.5z"/><path d="M16 14.6c1.8 3 5.2 4.2 5.2 8 0 2.9-2.4 5-5.2 5s-5.2-2.1-5.2-5c0-3.2 3.2-4.6 5.2-8z" fill="${a2}"/><path d="M16 21.6c.9 1.6 2.4 2.2 2.4 3.8 0 1.2-1.1 2-2.4 2s-2.4-.8-2.4-2c0-1.6 1.5-2.2 2.4-3.8z" fill="${d0}" opacity=".55"/>`],
  laser: ['#9fb0bb', '#ff4a3a', `<path d="M2 9l2-2h8l2 2v14l-2 2H4l-2-2z"/><circle cx="8" cy="16" r="3.6" fill="${d0}"/><circle cx="8" cy="16" r="1.8" fill="${a2}"/><path d="M14 14.2h13v3.6H14z" fill="${a2}"/><path d="M14 15.2h13v1.6H14z" fill="#fff" opacity=".85"/><path d="M27 10l3.4 6-3.4 6M29 4l-2 4M29 28l-2-4M30.6 16h1.2" stroke="${a2}" stroke-width="1.6" fill="none"/>`],
  turret: ['#aab09a', '#f2b21c', `<path d="M5 28l3-6h16l3 6z"/><path d="M9 22v-4.5C9 13 23 13 23 17.5V22z"/><path d="M19 12.6h11.4v2.8H19zM19 17.2h11.4V20H19z"/><path d="M11 19h10" stroke="${d0}" stroke-width="1.4"/><circle cx="16" cy="9" r="5" fill="none" stroke="${a2}" stroke-width="1.8"/><path d="M16 2.4v3M16 12.6v-1M9.4 9h3M19.6 9h3" stroke="${a2}" stroke-width="1.6"/>`],
  coin: ['#c9a227', '#7a5a10', `<polygon points="${pts(13, 14.2, 12, 16, 16, -Math.PI / 2)}"/><circle cx="16" cy="16" r="9.4" fill="${d0}" opacity=".5"/><circle cx="16" cy="16" r="8.4" fill="#e0bd4a"/><polygon points="${pts(5, 5.2, 2.2, 16, 16.4)}" fill="#7a5a10"/>`],
  wrench: ['#b8bbae', '#f2b21c', `<circle cx="22.4" cy="9.6" r="7.4"/><path d="M23.6 1.5l4.6 4.6-3.6 3.6-4.6-4.6z" fill="${d0}"/><path d="M19 12.6L5.2 26.4a2.8 2.8 0 0 0 4 4l13.8-13.8z"/><circle cx="7.2" cy="28.4" r="1.2" fill="${d0}"/>`],
  flag: ['#e8e8e0', '#1a0f0b', `<path d="M5 2h2.8v28H5z" fill="#b8bbae"/>${Array.from({length: 12}, (_, i) => { const x = i % 4, y = (i / 4) | 0; return (x + y) % 2 ? '' : `<rect x="${7.8 + x * 5.2}" y="${3 + y * 4.4}" width="5.2" height="4.4" fill="#1a0f0b" stroke="#e8e8e0" stroke-width=".6"/>` }).join('')}<path d="M7.8 3h20.8v13.2H7.8z" fill="none" stroke="#e8e8e0" stroke-width="1.4"/>`],
  lock: ['#b8bbae', '#f2b21c', `<path d="M6 14l2-2h16l2 2v14H6z"/><path d="M9.6 12V9.4a6.4 6.4 0 0 1 12.8 0V12H19V9.4a3 3 0 0 0-6 0V12z"/><circle cx="16" cy="19.4" r="2.6" fill="${d0}"/><path d="M14.8 20.4h2.4l.6 4.4h-3.6z" fill="${d0}"/>`],
  unlock: ['#b8bbae', '#7cdc5a', `<path d="M6 14l2-2h16l2 2v14H6z"/><path d="M9.6 12V8.4a6.4 6.4 0 0 1 12-3l-3.2 1.4A3 3 0 0 0 13 8.4V12z"/><circle cx="16" cy="19.4" r="2.6" fill="${d0}"/><path d="M14.8 20.4h2.4l.6 4.4h-3.6z" fill="${d0}"/>`],
  check: ['#7cdc5a', '#1a0f0b', `<path d="M3.5 17.4l4.6-4.6 5 5L24 5.6l4.5 4.5L13.1 27z"/>`],
  skull: ['#e8dcc0', '#c0392b', `<path d="M16 2.5C9.4 2.5 5 7.4 5 13.4c0 3.8 1.8 6 4 7.6V27h4v-3.6h2.4V27h1.2v-3.6H19V27h4v-6c2.2-1.6 4-3.8 4-7.6C27 7.4 22.6 2.5 16 2.5z"/><path d="M8.6 12h5.4v5H8.6zM18 12h5.4v5H18z" fill="${d0}"/><path d="M16 18l-2.2 3.4h4.4z" fill="${d0}"/>`],
  trophy: ['#e0b83a', '#7a5a10', `<path d="M8.6 3.6h14.8v8.6c0 5-3.2 8.6-7.4 8.6s-7.4-3.6-7.4-8.6z"/><path d="M8.6 6H3.4v3.6c0 3.4 2.2 5.4 5.4 5.6v-2.6c-1.6-.3-2.6-1.4-2.6-3V8.4h2.4zM23.4 6h5.2v3.6c0 3.4-2.2 5.4-5.4 5.6v-2.6c1.6-.3 2.6-1.4 2.6-3V8.4h-2.4z"/><path d="M13.8 20.6h4.4V25h-4.4z"/><path d="M9.6 25h12.8l1.6 3.8H8z"/><path d="M12 6.8h2v6.6h-2z" fill="#fff" opacity=".5"/>`],
  pause: [null, null, `<path d="M7 5l1-1h5l1 1v22l-1 1H8l-1-1zM18 5l1-1h5l1 1v22l-1 1h-5l-1-1z"/>`],
  close: [null, null, `<path d="M5.4 9.6L9.6 5.4 16 11.8l6.4-6.4 4.2 4.2L20.2 16l6.4 6.4-4.2 4.2L16 20.2l-6.4 6.4-4.2-4.2L11.8 16z"/>`],
  left: [null, null, `<path d="M3 16L15.6 4.6V11.6H29v8.8H15.6v7z"/>`],
  right: [null, null, `<path d="M29 16L16.4 4.6V11.6H3v8.8h13.4v7z"/>`],
  play: [null, null, `<path d="M8 4.4L28 16 8 27.6z"/>`],
  rotl: [null, null, `<path d="M16 5.2a10.8 10.8 0 1 1-9.4 5.4" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linejoin="miter"/><path d="M1.2 8.2L10.6 3l.8 10.2z"/>`],
  rotr: [null, null, `<g transform="translate(32 0) scale(-1 1)"><path d="M16 5.2a10.8 10.8 0 1 1-9.4 5.4" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linejoin="miter"/><path d="M1.2 8.2L10.6 3l.8 10.2z"/></g>`],
  warn: ['#f2b21c', '#1a0f0b', `<path d="M16 2.6l14.4 25.4H1.6z"/><path d="M14.4 11h3.2l-.6 9h-2z" fill="${d0}"/><path d="M14.4 21.6h3.2v3h-3.2z" fill="${d0}"/>`],
  zombie: ['#8fae72', '#8a0808', `<path d="M5.5 29V15.5L7.8 7h2.8l.4 7V4.6h3L14.4 14V2.6h3L17.8 14V4.8h3l.2 9.4 3.2-6.2h2.8L25 19c0 5.6-3.2 10-8 10z"/><path d="M5.5 25h19.8v4H5.5z" fill="${a2}"/><path d="M8 22.4l3 2.2M13 20.6l2 3.4" stroke="${d0}" stroke-width="1.3" fill="none"/>`],
  boom: ['#ffb02a', '#d9261c', `<polygon points="${pts(10, 15, 7.6)}"/><polygon points="${pts(8, 9.4, 4.6, 16, 16, -1.2)}" fill="${a2}"/><polygon points="${pts(6, 4.2, 2, 16, 16, -.7)}" fill="#fff6c8"/>`],
  white: ['#e8e8e0', '#b8bbae', `<path d="M5 2h2.8v28H5z" fill="#b8bbae"/><path d="M7.8 4c4-2.4 7 2.4 11 0s6-1.4 8.4-.6v13c-2.4-.8-4.4-2.2-8.4.6s-7-2-11 .4z"/>`],
  gas: ['#7cdc5a', '#1a0f0b', `<path d="M2 16l12-11.4V11.6h14v8.8H14v7z" transform="scale(-1 1) translate(-32 0)"/>`],
  mine: ['#8a8c80', '#ff3b30', `<ellipse cx="16" cy="22" rx="13" ry="6"/><path d="M6 21l2-6h16l2 6z"/><path d="M13 15v-3h6v3z" fill="${a2}"/><path d="M14.4 9h3.2v3h-3.2z"/><polygon points="${pts(8, 4.4, 2, 16, 20)}" fill="${d0}"/><path d="M4 26l2-2M28 26l-2-2M16 29v-3" stroke="${a2}" stroke-width="1.8" fill="none"/>`],
  sat: ['#f2b21c', '#1a0f0b', `<circle cx="16" cy="16" r="13"/>`]
};
// ico('coin') → beágyazható SVG; cls: extra osztály. A kitöltés a CSS-ből jön: `.mgi{fill:currentColor}`.
function ico(name, cls) {
  const I = ICONS[name] || ICONS.sat, st = I[0] ? ` style="color:${I[0]};--ic2:${I[1]}"` : '';
  return `<svg class="mgi mgi-${name}${cls ? ' ' + cls : ''}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"${st}>${I[2]}</svg>`;
}
export {ico, ICONS};
