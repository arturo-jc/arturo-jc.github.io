// Putting a section on the page: measure its copy, draw its circuit, and redraw when either changes.
import { P, WEIGHT, f, tracePath, via, chip, part } from './kit.js';

// What a layout cannot know in advance about its copy, in cells: `h` is the copy's height, `hw` the width
// of the heading's word, and `cap` the distance from the copy's top to the middle of the heading's capitals.
function measureCopy(copy, u) {
  const top = copy.getBoundingClientRect().top;
  const h2 = copy.querySelector('h2'), word = document.createRange();
  word.selectNodeContents(h2);
  const hw = word.getBoundingClientRect().width;
  const probe = document.createElement('span');          // zero-size, so its bottom is the baseline
  probe.style.cssText = 'display:inline-block;width:0;height:0';
  h2.append(probe);
  const baseline = probe.getBoundingClientRect().bottom;
  probe.remove();
  const cv = document.createElement('canvas').getContext('2d');
  cv.font = `${getComputedStyle(h2).fontWeight} 1000px ${getComputedStyle(h2).fontFamily}`;
  const capHeight = cv.measureText('H').actualBoundingBoxAscent / 1000 * parseFloat(getComputedStyle(h2).fontSize);
  return {
    h: (copy.querySelector(':scope > :last-child').getBoundingClientRect().bottom - top) / u / P,
    hw: hw / u / P,
    cap: (baseline - capHeight / 2 - top) / u / P,
  };
}

// A section has two layouts, `wide` and `narrow`. Each gives the grid's width in `cols`, where the copy
// sits in `text`, and `build(m)`, which returns the circuit; `m` is the copy as measured by measureCopy.
// The width here must match the media query in styles.css.
const NARROW = matchMedia('(max-width: 1099px)');

// Draw a section's circuit into its .board and seat the copy in the space left for it.
function drawBoard(board, layouts) {
  const l = NARROW.matches ? layouts.narrow : layouts.wide;
  const W = l.cols * P;
  const copy = board.querySelector('.copy');
  board.querySelector('svg')?.remove();
  board.style.setProperty('--w', W);
  copy.style.left = `${100 * l.text.x / l.cols}%`;
  copy.style.width = `${100 * l.text.w / l.cols}%`;
  copy.style.top = `calc(${l.text.y * P} * var(--u))`;
  board.classList.add('drawn');

  const c = l.build(measureCopy(copy, board.getBoundingClientRect().width / W));
  const traces = [], ends = [];
  for (const w of c.wires) {
    traces.push(`<path class="t${w.o ? ' o' : ''}" d="${tracePath(w)}"/>`);
    const e = w.pts[w.pts.length - 1];
    if (w.end === 'via') ends.push(via(e[0] * P, e[1] * P, w.o));
  }
  const labels = c.labels.map(l =>
    `<text class="lb ${l.k}${l.o ? ' o' : ''}" x="${f(l.x * P)}" y="${f(l.y * P)}"${l.a ? ` text-anchor="${l.a}"` : ''}>${l.t}</text>`);
  board.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${W} ${f(c.rows * P)}" aria-hidden="true">
    <g stroke-width="${WEIGHT}" stroke-linecap="round" stroke-linejoin="round">${traces.join('')}</g>
    <g>${c.chips.map(chip).join('')}${c.parts.map(part).join('')}</g><g>${ends.join('')}</g><g>${labels.join('')}</g></svg>`);
}

// Draw a section, and again whenever its width changes or the fonts arrive: the copy wraps
// differently at another width or in another face, and the narrow layout is built round its height.
export function mountBoard(board, layouts) {
  let drawnAt = 0;
  const draw = () => { drawnAt = board.getBoundingClientRect().width; drawBoard(board, layouts); };
  draw();
  new ResizeObserver(() => { if (board.getBoundingClientRect().width !== drawnAt) draw(); }).observe(board);
  document.fonts.ready.then(draw);
}
