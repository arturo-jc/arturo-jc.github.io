// A post's head: the way back to the blog, the title and the date. Only these are on a board; the post itself, its
// comments and the footer follow as plain text in a column under it (see .flow in styles.css), so the drawing
// depends on the title's length and nothing else.
import { FLAG, bundle, wire, rail } from '../kit.js';

// Wide: U201 in the left margin, from the way back's row down past the title's first line. The way back leaves its
// left side into a flag pointing at "Blog" in the top left-hand corner; the accent net leaves its right side
// straight to the title, through R201. J201 sits on the top edge at the right, and its bus runs across the top,
// over the title, into U201's right side. As on the home page, all three grow out of U201 on load: the bus and the
// way back as branches, the accent net as U201's own.
const wide = {
  cols: 107,
  seats: {
    back: { x: 6, y: 3 }, title: { x: 30, y: 11, w: 54, size: 34 },
    date: m => ({ x: 30, y: m.title.bot + 1 }),
  },
  build(m) {
    const a = m.title.cap, bc = m.back.cap, tip = m.back.hx + 0.8;
    const chips = [
      { id: 'U201', x0: 17.5, y0: bc - 1.5, x1: 23, y1: a + 3, code: 'H0710', pins: { l: [bc], r: [5, 6, 7, 8, a], t: [], b: [] } },
      { id: 'J201', conn: true, ref: 'pins-left', x0: 84.2, y0: 0, x1: 88.8, y1: 1.5, pins: { b: [85, 86, 87, 88] } },
    ];
    const wires = [
      ...rail('U201 back', [wire([[17.5, bc], [tip + FLAG, bc]])], { after: 'load' }),
      wire([[23, a], [28.5, a]], { o: true, end: 'via', net: 'U201' }),
      ...rail('J201', bundle([[23, 6.5], [86.5, 6.5], [86.5, 1.5]], 4), { after: 'load' }),
    ];
    const labels = [
      { k: 'net', x: 90, y: 6.75, t: 'D0 – D3', rail: 'J201' },
    ];
    const flags = [{ tip, y: bc, code: 'G0601', dir: -1, go: true, rail: 'U201 back' }];
    // the post starts 3.5 rows under the date
    return { rows: m.date.bot + 3.5, chips, wires, parts: [{ kind: 'R', x: 25.75, y: a, ref: 'R201', net: 'U201' }], labels, flags };
  },
};

// Narrow: J201 on the top edge, its bus dropping straight into U201's top. The way back leaves U201's left side and
// steps up on a 45° run to the link's row; the accent net leaves lower down, runs west and down the left, and turns
// in to the title's first line. All three grow out of U201 on load, as in the wide layout.
const narrow = {
  cols: 32,
  seats: {
    back: { x: 6, y: 2 }, title: { x: 6, y: 11.5, w: 24, size: 26 },
    date: m => ({ x: 6, y: m.title.bot + 1 }),
  },
  build(m) {
    const a = m.title.cap, bc = m.back.cap, tip = m.back.hx + 0.8;
    const chips = [
      { id: 'J201', conn: true, x0: 22.2, y0: 0, x1: 26.8, y1: 1.5, pins: { b: [23, 24, 25, 26] } },
      { id: 'U201', ref: 'right', x0: 20, y0: 4, x1: 29, y1: 10.5, code: 'H0710', pins: { l: [5.5, 8.5], r: [], t: [23, 24, 25, 26], b: [] } },
    ];
    const wires = [
      ...rail('J201', bundle([[24.5, 4], [24.5, 1.5]], 4), { after: 'load' }),
      // the step's two ends are as far apart across as down, so it is a 45° run
      ...rail('U201 back', [wire([[20, 5.5], [17.5, 5.5], [17.5 - (5.5 - bc), bc], [tip + FLAG, bc]], { legs: [0, 0, 0, 0] })], { after: 'load' }),
      wire([[20, 8.5], [3, 8.5], [3, a - 1.5], [4.5, a]], { o: true, legs: [0, 8, 0, 0], end: 'via', net: 'U201' }),
    ];
    const labels = [
      { k: 'net', x: 21.6, y: 3.05, t: 'D0 – D3', a: 'end', rail: 'J201' },
    ];
    const flags = [{ tip, y: bc, code: 'G0601', dir: -1, go: true, rail: 'U201 back' }];
    return { rows: m.date.bot + 3, chips, wires, labels, flags };
  },
};

export default { wide, narrow };
