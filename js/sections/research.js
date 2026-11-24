// Research: the heading and four papers, newest first, each a title that links to the published article, the
// journal and a summary. The titles are long and wrap; `cap` and `hx` are their first line's.
import { bundle, stagger, tail, wire, past, rail, lamps } from '../kit.js';

// Wide: two columns, the right one dropped by about half a paper, so the papers read in a zigzag and leave a corner
// empty at each end. Projects' bus crosses the top into U5 in the top right-hand corner, which reaches the first
// paper across the gap, lights two lamps and sends a serpentine across the corner over the second paper. A chain of
// chips runs down the gap, one level with each title after it, and the last sends three traces under the bottom
// left-hand paper, stopping short.
const wide = {
  cols: 107,
  seats: {
    head: { x: 6, y: 4 }, r1: { x: 6, y: 12, w: 36 },
    r2: m => ({ x: 62, y: m.r1.cap + 32, w: 36 }),
    r3: m => ({ x: 6, y: m.r1.bot + 8, w: 36 }), r4: m => ({ x: 62, y: m.r2.bot + 8, w: 36 }),
  },
  build(m) {
    const [a1, a2, a3, a4] = ['r1', 'r2', 'r3', 'r4'].map(k => m[k].cap);
    const v1 = past(m.r1), v3 = past(m.r3);   // just past the left-hand titles' first lines
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
    wires.push(wire([[66, a1], [v1, a1]], { o: true, end: 'via', net: 'U5', code: 'E0511' }), wire([[55, a2], [60.5, a2]], { o: true, end: 'via', net: 'U6' }),
               wire([[47, a3], [v3, a3]], { o: true, end: 'via', net: 'U7', code: 'E0531' }), wire([[55, a4], [60.5, a4]], { o: true, end: 'via', net: 'U8' }));
    parts.push({ kind: 'R', x: 56, y: a1, ref: 'R7', net: 'U5' });
    // U5's right side → two lamps → a common return, stopping short: a branch, which grows once the main rail reaches U5
    const lit = [a1 + 1, a1 + 4];
    wires.push(...rail('U5 lamps', [wire([[78, lit[0]], [94, lit[0]], [94, lit[0] + 5]], { end: 'via' }), wire([[78, lit[1]], [94, lit[1]]])], { after: 'U5' }));
    parts.push(...lamps(lit, 83, 89, { r: 8, d: 4, rail: 'U5 lamps' }));
    // U5's bottom → a serpentine across the corner over the second paper, stopping short in its last run
    const y0 = a1 + 10, s = (a2 - 5 - y0) / 3, Y = [0, 1, 2, 3].map(i => y0 + i * s);
    wires.push(...stagger(rail('U5 serpentine', bundle([[74, a1 + 6], [74, Y[0]], [92, Y[0]], [92, Y[1]], [67, Y[1]], [67, Y[2]], [92, Y[2]], [92, Y[3]], [78, Y[3]]], 3), { after: 'U5' }), 7, [78, 80, 82]));
    // U5 → west → down the gap → U6 → U7 → U8
    wires.push(...rail('U6', bundle([[66, a1 + 4], [51, a1 + 4], [51, a2 - 3]], 3)), ...rail('U7', bundle([[50, a2 + 5], [50, a3 - 3]], 3)),
               ...rail('U8', bundle([[51, a3 + 5], [51, a4 - 3]], 3)));
    // U8 → down the gap → west under the third paper, stopping short
    const L = m.r3.bot + 4;
    const stops = [34, 26, 18];
    const west = stagger(rail('U8 west', bundle([[50, a4 + 5], [50, L], [6, L]], 3)), 1, stops);
    wires.push(...west);
    west.forEach((w, k) => labels.push({ k: 'net', x: stops[k] - 0.9, y: w.pts[2][1] + 0.25, t: `E054${k + 1}`, a: 'end', rail: 'U8 west' }));
    return { rows: Math.max(m.r4.bot, L + 1) + 5, chips, wires, parts, labels };
  },
};

// Narrow: Projects' bus comes down out of U4 and turns west into U5, above the heading. Three traces leave U5's left
// side and run down the left of the papers; the nearest is the accent net, which branches in to just before each
// title and ends by turning in to the last. The other two turn under the last paper into two lamps.
const narrow = {
  cols: 32,
  seats: {
    head: { x: 6, y: 13 }, r1: { x: 6, y: 18.5, w: 24 },
    r2: m => ({ x: 6, y: m.r1.bot + 4.5, w: 24 }), r3: m => ({ x: 6, y: m.r2.bot + 4.5, w: 24 }), r4: m => ({ x: 6, y: m.r3.bot + 4.5, w: 24 }),
  },
  build(m) {
    const [a1, a2, a3, a4] = ['r1', 'r2', 'r3', 'r4'].map(k => m[k].cap);
    const L = m.r4.bot + 3.5;                // the row of the first lamp, under the last paper's last line
    const chips = [{ id: 'U5', ref: 'left', x0: 9, y0: 2, x1: 18, y1: 9, code: 'E0510', allPads: true }];
    const wires = [], parts = [];
    // Projects' bus, picked up at the top edge in the same columns, west into U5's right-hand pads
    wires.push(...rail('U5', bundle([[26, 0], [26, 5], [18, 5]], 3)));
    // U5 → west → down the left of the papers. The rail's nearest trace, at column 3, is the accent net.
    const [acc, inner, outer] = bundle([[9, 7], [2, 7], [2, a4]], 3);
    wires.push(wire(tail(acc, [[3, a4], [4.5, a4]], [0.5]), { o: true, end: 'via', net: 'U5' }));
    [a1, a2, a3].forEach(a => wires.push(wire([[3, a], [4.5, a]], { o: true, end: 'via', net: 'U5' })));
    // the other two turn under the last paper, each into a resistor and a lamp, with a common return
    wires.push(wire(tail(inner, [[2, L], [20, L], [20, L + 6]], [0.75, 0.75]), { end: 'via' }), tail(outer, [[1, L + 3], [20, L + 3]], [0.75]));
    parts.push(...lamps([L, L + 3], 8, 14, { r: 8, d: 4 }), { kind: 'R', x: 3, y: m.r2.top + 0.5 * m.r2.h, dir: 'v', ref: 'R7', net: 'U5' }, { kind: 'C', x: 1, y: m.r3.top + 0.5 * m.r3.h, dir: 'v' });
    return { rows: L + 9, chips, wires, parts };
  },
};

export default { wide, narrow };
