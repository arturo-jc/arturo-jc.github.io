// Research: the heading and four papers, newest first, each a title that links to the published article, the
// journal and a summary. The titles are long and wrap; `cap` and `hx` are their first line's.
import { bundle, cut, wire, rail, f } from '../kit.js';

// two lamps out of a chip's side, each a resistor and a lamp, with a common return
function lamps(x, rows, n0, d0, wires, parts, labels) {
  wires.push(wire([[x, rows[0]], [x + 16, rows[0]], [x + 16, rows[0] + 5]], { legs: [0, 8, 0], end: 'via' }), wire([[x, rows[1]], [x + 16, rows[1]]]));
  rows.forEach((r, i) => {
    parts.push({ kind: 'R', x: x + 5, y: r }, { kind: 'LED', x: x + 11, y: r, delay: [0, 1.3][i] });
    labels.push({ k: 'ref', x: x + 5, y: r - 0.95, t: `R${n0 + i}`, a: 'middle' }, { k: 'ref', x: x + 11, y: r - 1.05, t: `D${d0 + i}`, a: 'middle' });
  });
}

// Wide: two columns, the right one dropped by about half a paper, so the papers read in a zigzag and leave a corner
// empty at each end. Projects' bus crosses the top into U5 in the top right-hand corner, which reaches the first
// paper across the gap, lights two lamps and sends a serpentine across the corner over the second paper. A chain of chips runs down the gap, one level with each title after it,
// and the last sends three traces under the bottom left-hand paper, stopping short.
const wide = {
  cols: 107,
  seats: {
    head: { x: 6, y: 4 }, r1: { x: 6, y: 12, w: 36 },
    r2: m => ({ x: 62, y: f(m.r1.cap + 32), w: 36 }),
    r3: m => ({ x: 6, y: f(m.r1.bot + 8), w: 36 }), r4: m => ({ x: 62, y: f(m.r2.bot + 8), w: 36 }),
  },
  build(m) {
    const [a1, a2, a3, a4] = ['r1', 'r2', 'r3', 'r4'].map(k => f(m[k].cap));
    const v1 = f(m.r1.hx + 1.5), v3 = f(m.r3.hx + 1.5);   // just past the left-hand titles' first lines
    const wires = [], labels = [], parts = [];
    const chips = [
      { id: 'U5', x0: 66, y0: a1 - 3, x1: 78, y1: a1 + 6, code: 'E0510', allPads: true },
      { id: 'U6', x0: 45, y0: a2 - 3, x1: 55, y1: a2 + 5, code: 'E0520', allPads: true },
      { id: 'U7', x0: 47, y0: a3 - 3, x1: 57, y1: a3 + 5, code: 'E0530', allPads: true },
      { id: 'U8', x0: 45, y0: a4 - 3, x1: 55, y1: a4 + 5, code: 'E0540', allPads: true },
    ];
    // Projects' bus, picked up at the top edge in the same columns, across the top into U5
    wires.push(...rail('U5', bundle([[49, 0], [49, 5.5], [72, 5.5], [72, a1 - 3]], 3)));
    // the accent net: U5 across the gap to the first paper; each chip in the gap to the paper level with it, ending
    // just past the title on the left and just before it on the right
    wires.push(wire([[66, a1], [v1, a1]], { o: true, end: 'via', net: 'U5' }), wire([[55, a2], [60.5, a2]], { o: true, end: 'via', net: 'U6' }),
               wire([[47, a3], [v3, a3]], { o: true, end: 'via', net: 'U7' }), wire([[55, a4], [60.5, a4]], { o: true, end: 'via', net: 'U8' }));
    parts.push({ kind: 'R', x: 56, y: a1 });
    lamps(78, [a1 + 1, a1 + 4], 8, 4, wires, parts, labels);
    // U5's bottom → a serpentine across the corner over the second paper, stopping short in its last run
    const y0 = f(a1 + 10), s = f((a2 - 5 - y0) / 3), Y = [0, 1, 2, 3].map(i => f(y0 + i * s));
    rail('U5 serpentine', bundle([[74, a1 + 6], [74, Y[0]], [92, Y[0]], [92, Y[1]], [67, Y[1]], [67, Y[2]], [92, Y[2]], [92, Y[3]], [78, Y[3]]], 3), 'U5').forEach((w, k) => {
      cut(w, 7, [78, 80, 82][k]).end = 'via';
      wires.push(w);
    });
    // U5 → west → down the gap → U6 → U7 → U8
    wires.push(...rail('U6', bundle([[66, a1 + 4], [51, a1 + 4], [51, a2 - 3]], 3)), ...rail('U7', bundle([[50, a2 + 5], [50, a3 - 3]], 3)),
               ...rail('U8', bundle([[51, a3 + 5], [51, a4 - 3]], 3)));
    // U8 → down the gap → west under the third paper, stopping short
    const L = f(m.r3.bot + 4);
    rail('U8 west', bundle([[50, a4 + 5], [50, L], [6, L]], 3)).forEach((w, k) => {
      const stop = [34, 26, 18][k];
      cut(w, 1, stop).end = 'via';
      wires.push(w);
      labels.push({ k: 'net', x: stop - 0.9, y: w.pts[2][1] + 0.25, t: `E054${k + 1}`, a: 'end', rail: 'U8 west' });
    });
    // ref = silkscreen designators · net = wire codes
    labels.push(
      { k: 'ref', x: 66, y: a1 - 4.1, t: 'U5' }, { k: 'ref', x: 45, y: a2 - 4.1, t: 'U6' },
      { k: 'ref', x: 47, y: a3 - 4.1, t: 'U7' }, { k: 'ref', x: 45, y: a4 - 4.1, t: 'U8' },
      { k: 'ref', x: 56, y: a1 - 0.95, t: 'R7', a: 'middle' },
      { k: 'net', x: v1 + 0.9, y: a1 - 0.75, t: 'E0511', o: true, net: 'U5' }, { k: 'net', x: v3 + 0.9, y: a3 - 0.75, t: 'E0531', o: true, net: 'U7' },
    );
    return { rows: f(Math.max(m.r4.bot, L + 1) + 5), chips, wires, parts, labels };
  },
};

// Narrow: Projects' bus comes down out of U4 and turns west into U5, above the heading. Three traces leave U5's left
// side and run down the left of the papers; the nearest is the accent net, which branches in to just before each
// title and ends by turning in to the last. The other two turn under the last paper into two lamps.
const narrow = {
  cols: 32,
  seats: {
    head: { x: 6, y: 13 }, r1: { x: 6, y: 18.5, w: 24 },
    r2: m => ({ x: 6, y: f(m.r1.bot + 4.5), w: 24 }), r3: m => ({ x: 6, y: f(m.r2.bot + 4.5), w: 24 }), r4: m => ({ x: 6, y: f(m.r3.bot + 4.5), w: 24 }),
  },
  build(m) {
    const [a1, a2, a3, a4] = ['r1', 'r2', 'r3', 'r4'].map(k => f(m[k].cap));
    const L = f(m.r4.bot + 3.5);                // the row of the first lamp, under the last paper's last line
    const chips = [{ id: 'U5', x0: 9, y0: 2, x1: 18, y1: 9, code: 'E0510', allPads: true }];
    const wires = [], labels = [], parts = [];
    // Projects' bus, picked up at the top edge in the same columns, west into U5's right-hand pads
    wires.push(...rail('U5', bundle([[26, 0], [26, 5], [18, 5]], 3)));
    // U5 → west → down the left of the papers. The rail's nearest trace, at column 3, is the accent net.
    const [acc, inner, outer] = bundle([[9, 7], [2, 7], [2, a4]], 3);
    acc.pts.push([4.5, a4]); acc.legs.splice(-1, 1, 6, 0);
    wires.push({ ...acc, o: true, end: 'via', net: 'U5' });
    [a1, a2, a3].forEach(a => wires.push(wire([[3, a], [4.5, a]], { o: true, end: 'via', net: 'U5' })));
    // the other two turn under the last paper, each into a resistor and a lamp, with a common return
    inner.pts.splice(-1, 1, [2, L], [20, L], [20, L + 6]); inner.legs.splice(-1, 1, 8, 8, 0);
    outer.pts.splice(-1, 1, [1, L + 3], [20, L + 3]); outer.legs.splice(-1, 1, 8, 0);
    wires.push({ ...inner, end: 'via' }, outer);
    [L, L + 3].forEach((r, i) => {
      parts.push({ kind: 'R', x: 8, y: r }, { kind: 'LED', x: 14, y: r, delay: [0, 1.3][i] });
      labels.push({ k: 'ref', x: 8, y: r - 0.95, t: `R${8 + i}`, a: 'middle' }, { k: 'ref', x: 14, y: r - 1.05, t: `D${4 + i}`, a: 'middle' });
    });
    parts.push({ kind: 'R', x: 3, y: f(m.r2.top + 0.5 * m.r2.h), dir: 'v' }, { kind: 'C', x: 1, y: f(m.r3.top + 0.5 * m.r3.h), dir: 'v' });
    labels.push({ k: 'ref', x: 8.4, y: 2.2, t: 'U5', a: 'end' }, { k: 'ref', x: 3.9, y: f(m.r2.top + 0.5 * m.r2.h + 0.25), t: 'R7' });
    return { rows: f(L + 9), chips, wires, parts, labels };
  },
};

export default { wide, narrow };
