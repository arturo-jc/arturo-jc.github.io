// Projects: the heading and two projects, each a name that links to its repo, a stack and a paragraph.
import { P, bundle, cut, wire, f } from '../kit.js';

// Wide: a row each, on alternate sides. Each project has its own chip beside it, level with its name, so each
// accent run is straight. A bus drops out of U3 and crosses to U4 on a long diagonal between the rows,
// parallel to About's. Two lamps hang under U3; three traces leave U4 and stop down the left margin.
const wide = {
  cols: 107,
  seats: { head: { x: 6, y: 4 }, p1: { x: 6, y: 12, w: 36 }, p2: m => ({ x: 54, y: f(m.p1.bot + 7), w: 36 }) },
  build(m) {
    const a1 = f(m.p1.cap), a2 = f(m.p2.cap);   // each accent's row; each chip is placed from its own
    const vx = f(m.p1.hx + 1.5);                // the first accent's via, just past the name
    const wires = [], labels = [], parts = [];
    const chips = [
      { id: 'U3', x0: 62, y0: a1 - 3, x1: 76, y1: a1 + 8, code: 'B0220', allPads: true },
      { id: 'U4', x0: 20, y0: a2 - 5, x1: 32, y1: a2 + 7, code: 'C0412', allPads: true },
    ];
    // the accent net: straight from each chip to its project's name, ending just past the first and just before the second
    wires.push(wire([[62, a1], [vx, a1]], { o: true, end: 'via' }), wire([[32, a2], [52.5, a2]], { o: true, end: 'via' }));
    // U3 → down → the long diagonal between the rows → west into U4
    const drop = 5;                             // rows the bus runs straight down before the diagonal starts
    wires.push(...bundle([[64, a1 + 8], [64, a2 - 3], [32, a2 - 3]], 3, { 1: (a2 - a1 - 11 - drop) * P }));
    // About's rail, picked up at the top edge in the same columns, into U3's top right pads
    wires.push(...bundle([[94, 0], [94, a1 - 1], [74, a1 - 1]], 3));
    // U3 → two lamps hanging under it → common return
    const ly = a1 + 8;
    wires.push(wire([[69, ly], [69, ly + 10], [79, ly + 10]], { legs: [0, 8, 0], end: 'via' }), wire([[73, ly], [73, ly + 10]]));
    [69, 73].forEach((c, i) => {
      parts.push({ kind: 'R', x: c, y: ly + 3, dir: 'v' }, { kind: 'LED', x: c, y: ly + 6.8, dir: 'v', delay: [0, 1.3][i] });
      labels.push({ k: 'ref', x: c + 1.1, y: ly + 3.25, t: `R${7 + i}` }, { k: 'ref', x: c + 1.2, y: ly + 7.05, t: `D${4 + i}` });
    });
    // U4 → west → down the left margin; each stops at a different height
    bundle([[20, a2 + 1], [10, a2 + 1], [10, a2 + 20]], 3).forEach((w, k) => {
      const stop = a2 + [10, 15, 20][k];
      cut(w, 1, stop).end = 'via';
      wires.push(w);
      labels.push({ k: 'net', x: w.pts[2][0] + 0.9, y: stop + 0.25, t: `C041${k + 3}` });
    });
    parts.push({ kind: 'R', x: 46, y: a1 }, { kind: 'R', x: 42, y: a2 });
    // ref = silkscreen designators · net = wire codes
    labels.push(
      { k: 'ref', x: 62, y: a1 - 4.1, t: 'U3' }, { k: 'ref', x: 32.6, y: a2 + 8.1, t: 'U4' },
      { k: 'ref', x: 46, y: a1 - 0.95, t: 'R5', a: 'middle' }, { k: 'ref', x: 42, y: a2 - 0.95, t: 'R6', a: 'middle' },
      { k: 'net', x: vx + 0.9, y: a1 - 0.75, t: 'B0221', o: true }, { k: 'net', x: 52.5, y: a2 - 0.95, t: 'C0411', o: true, a: 'end' },
    );
    return { rows: f(m.p2.bot + 4), chips, wires, parts, labels };
  },
};

// Narrow: U3 and its two lamps above the heading; three traces come down out of U3 on the right of the
// projects. The nearest is the accent net: it branches in along the first name's row and ends by turning in
// along the second's. The other two carry on down to U4, under the last project, which closes the section.
const narrow = {
  cols: 32,
  seats: { head: { x: 2, y: 14 }, p1: { x: 2, y: 19.5, w: 24 }, p2: m => ({ x: 2, y: f(m.p1.bot + 4.5), w: 24 }) },
  build(m) {
    const a1 = f(m.p1.cap), a2 = f(m.p2.cap);
    const v1 = f(m.p1.hx + 1.5), v2 = f(m.p2.hx + 1.5);
    const F = f(m.p2.bot + 2.5);                // U4's top
    const chips = [
      { id: 'U3', x0: 22, y0: 3, x1: 31, y1: 10, code: 'B0220', allPads: true },
      { id: 'U4', x0: 22, y0: F, x1: 31, y1: F + 6, code: 'C0412', pins: { l: [F + 2, F + 4], r: [], t: [29, 30], b: [] } },
    ];
    const wires = [], labels = [];
    // the accent net: down out of U3, a branch in along the first name's row, and in along the second's
    wires.push(wire([[28, 10], [28, a2], [v2, a2]], { o: true, legs: [0, 10, 0], end: 'via' }),
               wire([[28, a1], [v1, a1]], { o: true, end: 'via' }));
    // U3 → down the right of both projects → U4
    wires.push(wire([[29, 10], [29, F]]), wire([[30, 10], [30, F]]));
    // U3 → two lamps → common return
    wires.push(wire([[22, 5], [7, 5], [7, 9.5]], { legs: [0, 8, 0], end: 'via' }), wire([[22, 8], [7, 8]]));
    // U4 → two traces west, stopping short on vias
    [[F + 2, 14], [F + 4, 8]].forEach(([r, stop], i) => {
      wires.push(wire([[22, r], [stop, r]], { end: 'via' }));
      labels.push({ k: 'net', x: stop - 0.9, y: r + 0.25, t: `C041${i + 3}`, a: 'end' });
    });
    const parts = [
      { kind: 'R', x: 17, y: 5 }, { kind: 'LED', x: 12, y: 5 }, { kind: 'R', x: 17, y: 8 }, { kind: 'LED', x: 12, y: 8, delay: 1.3 },
      { kind: 'R', x: 30, y: f(m.p1.top + 0.55 * m.p1.h), dir: 'v' }, { kind: 'C', x: 29, y: f(m.p2.top + 0.6 * m.p2.h), dir: 'v' },
    ];
    labels.push(
      { k: 'ref', x: 22, y: 1.9, t: 'U3' }, { k: 'ref', x: 21.4, y: F + 0.9, t: 'U4', a: 'end' },
      { k: 'ref', x: 17, y: 4.05, t: 'R7', a: 'middle' }, { k: 'ref', x: 12, y: 3.95, t: 'D4', a: 'middle' },
      { k: 'ref', x: 17, y: 7.05, t: 'R8', a: 'middle' }, { k: 'ref', x: 12, y: 6.95, t: 'D5', a: 'middle' },
      { k: 'net', x: v1 + 0.9, y: a1 - 0.75, t: 'B0221', o: true }, { k: 'net', x: v2 + 0.9, y: a2 - 0.75, t: 'C0411', o: true },
    );
    return { rows: F + 9, chips, wires, parts, labels };
  },
};

export default { wide, narrow };
