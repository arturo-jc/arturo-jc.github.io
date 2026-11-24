// The blog's index, at /blog/: only its heading is on a board. The posts follow as plain text in a column under
// it, outside the board (see .flow in styles.css), so a new post never moves the drawing.
import { FLAG, bundle, wire, rail, f } from '../kit.js';

// Wide: U101 in the left margin, level with the heading, its net coming in through an off-page flag before it:
// A0140, the same net that leaves About beside its link to the blog. J101 sits on the top edge at the right, and
// its bus runs across the top, over the heading, and down into U101's top. As on the home page, both grow out of
// U101 on load: the bus a branch into J101, the net U101's own.
const wide = {
  cols: 107,
  seats: { head: { x: 30, y: 10, size: 60 } },
  build(m) {
    const a = f(m.head.cap), tip = f(m.head.l - 0.8);
    const chips = [
      { id: 'U101', x0: 12, y0: f(a - 3), x1: 21, y1: f(a + 5), code: 'G0610', pins: { l: [], r: [a], t: [15, 16, 17, 18], b: [] } },
      { id: 'J101', conn: true, x0: 84.2, y0: 0, x1: 88.8, y1: 1.5, pins: { b: [85, 86, 87, 88] } },
    ];
    const wires = [
      wire([[21, a], [f(tip - FLAG), a]], { net: 'U101' }),
      ...rail('J101', bundle([[16.5, f(a - 3)], [16.5, 5.5], [86.5, 5.5], [86.5, 1.5]], 4), 'load'),
    ];
    const labels = [
      { k: 'ref', x: 12, y: f(a - 4.1), t: 'U101' }, { k: 'ref', x: 83.6, y: 1.25, t: 'J101', a: 'end' },
      { k: 'net', x: 90, y: 5.75, t: 'D0 – D3', rail: 'J101' },
    ];
    // the posts start 6 rows under the heading
    return { rows: f(m.head.bot + 6), chips, wires, parts: [], labels, flags: [{ tip, y: a, code: 'A0140', net: 'U101' }] };
  },
};

// Narrow: J101 top left feeds U101 top right, as J1 feeds U1 on the home page. U101's net comes down out of it
// and in along the heading's row into a flag pointing back at the heading. Both grow out of U101 on load.
const narrow = {
  cols: 32,
  seats: { head: { x: 6, y: 13, size: 50 } },
  build(m) {
    const a = f(m.head.cap), tip = f(m.head.hx + 0.8);
    const chips = [
      { id: 'U101', x0: 21, y0: 2, x1: 30, y1: 9, code: 'G0610', pins: { l: [4, 5, 6, 7], r: [], t: [], b: [25] } },
      { id: 'J101', conn: true, x0: 1, y0: 0, x1: 9, y1: 1.5, pins: { b: [2, 3, 4, 5, 6, 7, 8] } },
    ];
    const wires = [
      wire([[25, 9], [25, a], [f(tip + FLAG), a]], { legs: [0, 8, 0], net: 'U101' }),
      ...rail('J101', bundle([[21, 5.5], [5.5, 5.5], [5.5, 1.5]], 4), 'load'),
    ];
    const labels = [
      { k: 'ref', x: 20.4, y: 2.2, t: 'U101', a: 'end' }, { k: 'ref', x: 9.6, y: 1.1, t: 'J101' },
      { k: 'net', x: 9.5, y: 8.75, t: 'D0 – D3', rail: 'J101' },
    ];
    return { rows: f(m.head.bot + 3.5), chips, wires, parts: [], labels, flags: [{ tip, y: a, code: 'A0140', dir: -1, net: 'U101' }] };
  },
};

export default { wide, narrow };
