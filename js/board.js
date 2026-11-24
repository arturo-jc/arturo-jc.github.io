// Putting a section on the page: seat its type, measure it, draw its circuit, and redraw when either changes.
import { P, WEIGHT, f, tracePath, via, chip, part, flag } from './kit.js';

// The baseline of the line that `el` starts, in px.
function baselineOf(el) {
  const probe = document.createElement('span');          // zero-size, so its bottom is the baseline
  probe.style.cssText = 'display:inline-block;width:0;height:0';
  el.prepend(probe);
  const y = probe.getBoundingClientRect().bottom;
  probe.remove();
  return y;
}

// What a layout cannot know in advance about a seated block, in cells from the board's top left: `top`, `bot`
// and `h` are its box, and `l` its left edge. A block with a heading also has `cap`, the row of the middle of the
// capitals of the heading's first line, and `hx`, the column where that line's last letter ends, which for a
// heading that wraps, as Research's titles do, is not the right of its box. The heading is the block
// itself when it is an h1, an h2 or a link, and otherwise its h3; its first line is its first span when it is set
// on several lines, each in a span.
// The board's box is read here, beside the block's, rather than once before seating: seating changes the page's
// height, and when the page is scrolled to its foot the browser then pulls the scroll back, which moves every
// box on screen. A board's box read before that, against a block's read after it, puts the block rows off.
function measure(el, board, u) {
  const box = board.getBoundingClientRect(), cell = px => px / u / P, r = el.getBoundingClientRect();
  const m = { top: cell(r.top - box.top), bot: cell(r.bottom - box.top), h: cell(r.height), l: cell(r.left - box.left) };
  const heading = el.matches('h1, h2, a') ? el : el.querySelector('h3');
  if (!heading) return m;
  const line = heading.querySelector('span') ?? heading;
  const word = document.createRange();
  word.selectNodeContents(line);
  const cv = document.createElement('canvas').getContext('2d');
  cv.font = `${getComputedStyle(heading).fontWeight} 1000px ${getComputedStyle(heading).fontFamily}`;
  const capHeight = cv.measureText('H').actualBoundingBoxAscent / 1000 * parseFloat(getComputedStyle(heading).fontSize);
  m.cap = cell(baselineOf(line) - capHeight / 2 - box.top);
  const rects = [...word.getClientRects()].filter(r => r.width > 0);
  m.hx = cell(Math.max(...rects.filter(r => Math.abs(r.top - rects[0].top) < 2).map(r => r.right)) - box.left);
  return m;
}

// A section has two layouts, `wide` and `narrow`. Each gives the grid's width in `cols`, a seat for each
// block of type in `seats`, and `build(m)`, which returns the circuit. A seat is keyed by the block's
// data-seat and gives the cell where its top left sits (or, with `r` in place of `x`, the column its right
// edge sits on), its width `w` when it wraps, and its `size` in units
// when the layout sets it, as it does for the name. A seat can be a function of the blocks seated before it,
// so that one can sit under another. `m` is every block as measured by measure(), under the same keys.
// The width here must match the media query in styles.css.
const NARROW = matchMedia('(max-width: 1099px)');

// Draw a section's circuit into its .board and seat the type in the space left for it.
function drawBoard(board, layouts) {
  const l = NARROW.matches ? layouts.narrow : layouts.wide;
  const W = l.cols * P;
  board.style.setProperty('--w', W);
  board.classList.add('drawn');
  const u = board.getBoundingClientRect().width / W;
  // While DevTools or the device toolbar opens or closes, the viewport is briefly 0 wide; every
  // measurement would divide by 0. Keep the old drawing; the next resize draws the new one.
  if (!u) return;
  const m = {};
  for (const [key, seat] of Object.entries(l.seats)) {
    const el = board.querySelector(`[data-seat="${key}"]`), s = typeof seat === 'function' ? seat(m) : seat;
    if (s.size) el.style.setProperty('--fs', s.size);
    el.style.left = s.r === undefined ? `${100 * s.x / l.cols}%` : 'auto';
    el.style.right = s.r === undefined ? '' : `${100 * (l.cols - s.r) / l.cols}%`;
    el.style.width = s.w ? `${100 * s.w / l.cols}%` : '';
    el.style.top = `calc(${s.y * P} * var(--u))`;
    m[key] = measure(el, board, u);
  }

  const c = l.build(m);
  const traces = [], ends = [];
  for (const w of c.wires) {
    traces.push(`<path class="t${w.o ? ' o' : ''}" d="${tracePath(w)}"/>`);
    const e = w.pts[w.pts.length - 1];
    if (w.end === 'via') ends.push(via(e[0] * P, e[1] * P, w.o));
  }
  const labels = c.labels.map(l =>
    `<text class="lb ${l.k}${l.o ? ' o' : ''}" x="${f(l.x * P)}" y="${f(l.y * P)}"${l.a ? ` text-anchor="${l.a}"` : ''}>${l.t}</text>`);
  // The old drawing stays until the new one is in: without it the page is shorter, a scrollbar can go, and
  // the type would be measured at a width it is not shown at.
  const old = board.querySelector('svg');
  board.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${W} ${f(c.rows * P)}" aria-hidden="true">
    <g stroke-width="${WEIGHT}" stroke-linecap="round" stroke-linejoin="round">${traces.join('')}</g>
    <g>${c.chips.map(chip).join('')}${c.parts.map(part).join('')}${(c.flags ?? []).map(flag).join('')}</g><g>${ends.join('')}</g><g>${labels.join('')}</g></svg>`);
  old?.remove();
}

// Draw a section, and again whenever its width changes or the fonts arrive: the type wraps
// differently at another width or in another face, and the layouts are built round its measurements.
export function mountBoard(board, layouts) {
  let drawnAt = 0;
  const draw = () => { drawnAt = board.getBoundingClientRect().width; drawBoard(board, layouts); };
  draw();
  new ResizeObserver(() => { if (board.getBoundingClientRect().width !== drawnAt) draw(); }).observe(board);
  // Across the breakpoint the other layout's drawing goes first. Left in, it is stretched to the new width
  // for a frame, which can make the page tall enough to gain a scrollbar and fall back across the breakpoint.
  NARROW.addEventListener('change', () => { board.querySelector('svg')?.remove(); draw(); });
  document.fonts.ready.then(draw);
}
