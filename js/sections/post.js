// A post's head: the way back to the blog, the title and the date. Only these are on a board; the post itself, its
// comments and the footer follow as plain text in a column under it (see .flow in styles.css), so the drawing
// depends on the title's length and nothing else.
import { FLAG, bundle, wire, f } from '../kit.js';

// Wide: U201 in the left margin, from the way back's row down past the title's first line. The way back leaves its
// left side into a flag pointing at "Blog" in the top left-hand corner; the accent net leaves its right side
// straight to the title, through R201. J201 sits on the top edge at the right, and its bus runs across the top,
// over the title, into U201's right side.
const wide = {
  cols: 107,
  seats: {
    back: { x: 6, y: 3 }, title: { x: 36, y: 11, w: 46, size: 34 },
    date: m => ({ x: 36, y: f(m.title.bot + 1) }),
  },
  build(m) {
    const a = f(m.title.cap), bc = f(m.back.cap), tip = f(m.back.hx + 0.8);
    const chips = [
      { id: 'U201', x0: 18, y0: f(bc - 1.5), x1: 28, y1: f(a + 3), code: 'H0710', pins: { l: [bc], r: [5, 6, 7, 8, a], t: [], b: [] } },
      { id: 'J201', conn: true, x0: 84.2, y0: 0, x1: 88.8, y1: 1.5, pins: { b: [85, 86, 87, 88] } },
    ];
    const wires = [
      wire([[f(tip + FLAG), bc], [18, bc]]),
      wire([[28, a], [34.5, a]], { o: true, end: 'via' }),
      ...bundle([[86.5, 1.5], [86.5, 6.5], [28, 6.5]], 4),
    ];
    const labels = [
      { k: 'ref', x: 18, y: f(bc - 2.6), t: 'U201' }, { k: 'ref', x: 31, y: f(a - 0.95), t: 'R201', a: 'middle' },
      { k: 'ref', x: 83.6, y: 1.25, t: 'J201', a: 'end' }, { k: 'net', x: 90, y: 6.75, t: 'D0 – D3' },
    ];
    const flags = [{ tip, y: bc, code: 'G0601', dir: -1, go: true }];
    // the post starts 3.5 rows under the date
    return { rows: f(m.date.bot + 3.5), chips, wires, parts: [{ kind: 'R', x: 31, y: a }], labels, flags };
  },
};

// Narrow: J201 on the top edge, its bus dropping straight into U201's top. The way back leaves U201's left side and
// steps up on a 45° run to the link's row; the accent net leaves lower down, runs west and down the left, and turns
// in to the title's first line.
const narrow = {
  cols: 32,
  seats: {
    back: { x: 6, y: 2 }, title: { x: 6, y: 11.5, w: 24, size: 26 },
    date: m => ({ x: 6, y: f(m.title.bot + 1) }),
  },
  build(m) {
    const a = f(m.title.cap), bc = f(m.back.cap), tip = f(m.back.hx + 0.8);
    const chips = [
      { id: 'J201', conn: true, x0: 22.2, y0: 0, x1: 26.8, y1: 1.5, pins: { b: [23, 24, 25, 26] } },
      { id: 'U201', x0: 20, y0: 4, x1: 29, y1: 10.5, code: 'H0710', pins: { l: [5.5, 8.5], r: [], t: [23, 24, 25, 26], b: [] } },
    ];
    const wires = [
      ...bundle([[24.5, 1.5], [24.5, 4]], 4),
      // the step's two ends are as far apart across as down, so it is a 45° run
      wire([[20, 5.5], [17.5, 5.5], [f(17.5 - (5.5 - bc)), bc], [f(tip + FLAG), bc]], { legs: [0, 0, 0, 0] }),
      wire([[20, 8.5], [3, 8.5], [3, f(a - 1.5)], [4.5, a]], { o: true, legs: [0, 8, 0, 0], end: 'via' }),
    ];
    const labels = [
      { k: 'ref', x: 27.4, y: 1.1, t: 'J201' }, { k: 'ref', x: 29.2, y: 3.5, t: 'U201', a: 'end' },
      { k: 'net', x: 21.6, y: 3.05, t: 'D0 – D3', a: 'end' },
    ];
    const flags = [{ tip, y: bc, code: 'G0601', dir: -1, go: true }];
    return { rows: f(m.date.bot + 3), chips, wires, parts: [], labels, flags };
  },
};

export default { wide, narrow };
