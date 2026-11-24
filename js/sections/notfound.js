// The 404 page: a big "404", a line of copy and the way home, on one board. The drawing is a cut trace: the accent
// net leaves its chip orange and stops on a via short of the heading, and past a gap it picks up again on another
// via and runs on to the heading in blue, because nothing reaches it. The rest of the board works, and the way home
// is the end of a net that leaves the board through an off-page flag.
import { FLAG, bundle, wire, past } from '../kit.js';

const drop = (x, y0, y1) => wire([[x, y0], [x, y1]], { end: 'via' });

// Wide: the column at cells 36 to 72. U301 sits at the right, level with the heading, fed by J301's bus across the
// top; the accent net runs west from it along the heading's row, cut four cells wide. Out of U301's foot, the way
// home turns west under the copy, through R301, into the flag beside the link, and two traces stop past it. J301's
// other three pins drop down the left margin and stop at staggered heights beside the link.
const wide = {
  cols: 107,
  seats: {
    head: { x: 36, y: 11, size: 96 },
    copy: m => ({ x: 36, y: m.head.bot + 2, w: 36 }),
    home: m => ({ x: 36, y: m.copy.bot + 3 }),
  },
  build(m) {
    const a = m.head.cap, hc = m.home.cap, tip = m.home.hx + 0.8, end = past(m.head);
    const y0 = a - 3, y1 = a + 8;
    const chips = [
      { id: 'J301', conn: true, x0: 20.2, y0: 0, x1: 28.8, y1: 1.5, nudge: [0, 0.15], pins: { b: [21, 22, 23, 25, 26, 27, 28] } },
      { id: 'U301', x0: 80, y0, x1: 89, y1, code: 'E0404', pins: { l: [a], r: [], t: [83, 84, 85, 86], b: [86, 87, 88] } },
    ];
    const wires = [
      ...bundle([[26.5, 1.5], [26.5, 5.5], [84.5, 5.5], [84.5, y0]], 4),
      drop(21, 1.5, hc + 2), drop(22, 1.5, hc), drop(23, 1.5, hc - 2),
      // the cut: orange as far as it, blue past it
      wire([[80, a], [70, a]], { o: true, end: 'via' }),
      wire([[66, a], [end, a]], { start: 'via', end: 'via' }),
      wire([[86, y1], [86, hc], [tip + FLAG, hc]]),
      drop(87, y1, hc + 2), drop(88, y1, hc + 4),
    ];
    const r = (86 + tip + FLAG) / 2;
    const labels = [
      { k: 'net', x: 87.6, y: 10, t: 'D0 – D3' },
      { k: 'net', x: 75, y: a - 0.75, t: 'A0404', a: 'middle', o: true },
      { k: 'net', x: (66 + end) / 2, y: a - 0.75, t: 'A0404', a: 'middle' },
      { k: 'net', x: 20.2, y: hc + 2.3, t: 'H0601 – H0603', a: 'end' }, { k: 'net', x: 88.9, y: hc + 4.3, t: 'H0611' },
    ];
    const flags = [{ tip, y: hc, code: 'A0001', dir: -1, go: true }];
    return { rows: Math.max(m.home.bot + 6, hc + 6), chips, wires, parts: [{ kind: 'R', x: r, y: hc, ref: 'R301' }], labels, flags };
  },
};

// Narrow: the column at cells 2 to 26, the rail on the right. J301 top left feeds U301 top right; the accent net
// comes down out of U301 and west along the heading's row, and the cut is on that run. Three traces drop down the
// right of the copy: the nearest turns under it into the flag beside the link, the other two stop past it.
const narrow = {
  cols: 32,
  seats: {
    head: { x: 2, y: 13, size: 72 },
    copy: m => ({ x: 2, y: m.head.bot + 2, w: 24 }),
    home: m => ({ x: 2, y: m.copy.bot + 3 }),
  },
  build(m) {
    const a = m.head.cap, hc = m.home.cap, tip = m.home.hx + 0.8, end = past(m.head);
    const chips = [
      { id: 'J301', conn: true, x0: 1.2, y0: 0, x1: 7.8, y1: 1.5, pins: { b: [2, 3, 4, 5, 6, 7] } },
      { id: 'U301', ref: 'left', x0: 22, y0: 2, x1: 31, y1: 9.5, code: 'E0404', pins: { l: [4, 5, 6, 7], r: [], t: [], b: [25, 28, 29, 30] } },
    ];
    // the cut's far side, at least 3.5 cells past the heading's end
    const cut = Math.max(end + 3.5, 18.5);
    const wires = [
      ...bundle([[4.5, 1.5], [4.5, 5.5], [22, 5.5]], 4),
      wire([[25, 9.5], [25, a], [cut + 3.5, a]], { o: true, end: 'via' }),
      wire([[cut, a], [end, a]], { start: 'via', end: 'via' }),
      wire([[28, 9.5], [28, hc], [tip + FLAG, hc]]),
      drop(29, 9.5, hc + 1.5), drop(30, 9.5, hc + 3),
    ];
    const labels = [
      { k: 'net', x: 9.5, y: 8.75, t: 'D0 – D3' },
      { k: 'net', x: cut + 1.75, y: a - 0.75, t: 'A0404', a: 'middle', o: true },
    ];
    const flags = [{ tip, y: hc, code: 'A0001', dir: -1, go: true }];
    return { rows: hc + 5.5, chips, wires, labels, flags };
  },
};

export default { wide, narrow };
