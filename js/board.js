// Putting a section on the page: seat its type, measure it, draw its circuit, and redraw when either changes.
import { P, WEIGHT, f, tracePath, via, chip, part } from './kit.js';

// The baseline of the line that `el` starts, in px.
function baselineOf(el) {
  const probe = document.createElement('span');          // zero-size, so its bottom is the baseline
  probe.style.cssText = 'display:inline-block;width:0;height:0';
  el.prepend(probe);
  const y = probe.getBoundingClientRect().bottom;
  probe.remove();
  return y;
}

// What a layout cannot know in advance about its type, in cells from the board's top left: `top` is the
// copy's top and `h` its height; `cap` is the row of the middle of the capitals of the heading's first line,
// and `hx` the column where that line's last letter ends. The heading is the section's h1 or h2, and its
// first line is its first span when it is set on several lines, each in a span.
function measure(board, u) {
  const box = board.getBoundingClientRect();
  const copy = board.querySelector('.copy').getBoundingClientRect();
  const heading = board.querySelector('h1, h2'), line = heading.querySelector('span') ?? heading;
  const word = document.createRange();
  word.selectNodeContents(line);
  const cv = document.createElement('canvas').getContext('2d');
  cv.font = `${getComputedStyle(heading).fontWeight} 1000px ${getComputedStyle(heading).fontFamily}`;
  const capHeight = cv.measureText('H').actualBoundingBoxAscent / 1000 * parseFloat(getComputedStyle(heading).fontSize);
  return {
    top: (copy.top - box.top) / u / P,
    h: (board.querySelector('.copy > :last-child').getBoundingClientRect().bottom - copy.top) / u / P,
    cap: (baselineOf(line) - capHeight / 2 - box.top) / u / P,
    hx: (word.getBoundingClientRect().right - box.left) / u / P,
  };
}

// A section has two layouts, `wide` and `narrow`. Each gives the grid's width in `cols`, where the copy
// sits in `text`, and `build(m)`, which returns the circuit; `m` is the type as measured by measure().
// A section whose heading is set apart from its copy, as the name is, also gives the heading's seat and
// size in `name`. The width here must match the media query in styles.css.
const NARROW = matchMedia('(max-width: 1099px)');

// Draw a section's circuit into its .board and seat the type in the space left for it.
function drawBoard(board, layouts) {
  const l = NARROW.matches ? layouts.narrow : layouts.wide;
  const W = l.cols * P;
  const copy = board.querySelector('.copy'), name = board.querySelector('.name');
  board.style.setProperty('--w', W);
  board.classList.add('drawn');
  const u = board.getBoundingClientRect().width / W;
  // While DevTools or the device toolbar opens or closes, the viewport is briefly 0 wide; every
  // measurement would divide by 0. Keep the old drawing; the next resize draws the new one.
  if (!u) return;
  if (l.name) {
    name.style.setProperty('--fs', l.name.size);
    name.style.left = `${100 * l.name.x / l.cols}%`;
    name.style.top = `calc(${l.name.y * P} * var(--u))`;
  }
  // the copy's top is a row, or a number of rows under the name
  const top = l.text.y ?? f((name.getBoundingClientRect().bottom - board.getBoundingClientRect().top) / u / P + l.text.under);
  copy.style.left = `${100 * l.text.x / l.cols}%`;
  copy.style.width = `${100 * l.text.w / l.cols}%`;
  copy.style.top = `calc(${top * P} * var(--u))`;

  const c = l.build(measure(board, u));
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
    <g>${c.chips.map(chip).join('')}${c.parts.map(part).join('')}</g><g>${ends.join('')}</g><g>${labels.join('')}</g></svg>`);
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
