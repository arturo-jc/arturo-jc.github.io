// Projects: the heading and two projects, each a name that links to its repo, a stack and a paragraph.
import { P, bundle, stagger, wire, past, rail } from '../kit.js';

// Wide: a row each, on alternate sides. Each project has its own chip beside it, level with its name, so each
// accent run is straight. A bus drops out of U3 and crosses to U4 on a long diagonal between the rows,
// parallel to About's. A bus leaves U3's right side, drops under About's rail, comes back on a diagonal and drops
// into a pin header over the second project. Three traces leave U4 and stop down the left margin, and three
// more leave its right side and drop off the board's foot into Research.
const wide = {
  cols: 107,
  seats: { head: { x: 6, y: 4 }, p1: { x: 6, y: 12, w: 36 }, p2: m => ({ x: 54, y: m.p1.bot + 7, w: 36 }) },
  build(m) {
    const a1 = m.p1.cap, a2 = m.p2.cap;   // each accent's row; each chip is placed from its own
    const vx = past(m.p1);                      // the first accent's via, just past the name
    const rows = m.p2.bot + 4;
    const wires = [], labels = [], parts = [];
    const chips = [
      { id: 'U3', x0: 62, y0: a1 - 3, x1: 76, y1: a1 + 8, code: 'B0220', allPads: true },
      { id: 'U4', ref: 'corner', x0: 20, y0: a2 - 5, x1: 32, y1: a2 + 7, code: 'C0412', allPads: true },
    ];
    // the accent net: straight from each chip to its project's name, ending just past the first and just before the second
    wires.push(wire([[62, a1], [vx, a1]], { o: true, end: 'via', net: 'U3', code: 'B0221' }), wire([[32, a2], [52.5, a2]], { o: true, end: 'via', net: 'U4' }));
    // U3 → down → the long diagonal between the rows → west into U4
    const drop = 5;                             // rows the bus runs straight down before the diagonal starts
    wires.push(...rail('U4', bundle([[64, a1 + 8], [64, a2 - 3], [32, a2 - 3]], 3, { 1: (a2 - a1 - 11 - drop) * P })));
    // About's rail, picked up at the top edge in the same columns, into U3's top right pads
    wires.push(...rail('U3', bundle([[94, 0], [94, a1 - 1], [74, a1 - 1]], 3)));
    // U3's five lowest right-hand pads → east → down under About's rail, its outer trace in line with the rail's →
    // back west on one diagonal → down into a pin header over the second project
    const ym = (a1 + a2) / 2, J = a2 - 5;
    wires.push(...rail('J2', bundle([[76, a1 + 5], [93, a1 + 5], [93, ym], [80, ym], [80, J]], 5, { 2: 6.5 * P, 3: 6.5 * P }), { after: 'U3' }));
    chips.push({ id: 'J2', conn: true, x0: 77, y0: J - 1, x1: 83, y1: J, pins: { b: [78, 79, 80, 81, 82] } });
    labels.push({ k: 'net', x: 83.2, y: J - 3, t: 'B0231 – B0235', rail: 'J2' });
    // U4 → west → down the left margin; each stops at a different height
    const stops = [10, 15, 20].map(d => a2 + d);
    const west = stagger(rail('U4 west', bundle([[20, a2 + 1], [10, a2 + 1], [10, a2 + 20]], 3), { after: 'U4' }), 1, stops);
    wires.push(...west);
    west.forEach((w, k) => labels.push({ k: 'net', x: w.pts[2][0] + 0.9, y: stops[k] + 0.25, t: `C041${k + 3}`, rail: 'U4 west' }));
    // U4 → east → down off the board's foot. Research picks the three up at its top edge in the same columns.
    const bus = 49;
    wires.push(...rail('U5', bundle([[32, a2 + 5], [bus, a2 + 5], [bus, rows]], 3)));
    labels.push({ k: 'net', x: bus - 2, y: rows - 3, t: 'E0501 – E0503', a: 'end', rail: 'U5' });
    parts.push({ kind: 'R', x: 46, y: a1, ref: 'R5', net: 'U3' }, { kind: 'R', x: 42, y: a2, ref: 'R6', net: 'U4' });
    // the second accent's code sits over its via rather than behind it
    labels.push({ k: 'net', x: 52.5, y: a2 - 0.95, t: 'C0411', o: true, a: 'end', net: 'U4' });
    return { rows, chips, wires, parts, labels };
  },
};

// Narrow: U3 above the heading, fed from its left by two traces of About's rail; three traces come down out of U3 on the right of the
// projects. The nearest is the accent net: it branches in along the first name's row and ends by turning in
// along the second's. The other two carry on down to U4, under the last project, which closes the section and
// sends three traces off the board's foot into Research.
const narrow = {
  cols: 32,
  seats: { head: { x: 2, y: 12 }, p1: { x: 2, y: 17.5, w: 24 }, p2: m => ({ x: 2, y: m.p1.bot + 4.5, w: 24 }) },
  build(m) {
    const a1 = m.p1.cap, a2 = m.p2.cap;
    const v1 = past(m.p1), v2 = past(m.p2);
    const F = m.p2.bot + 2.5;                // U4's top
    const chips = [
      { id: 'U3', ref: 'top-end', x0: 22, y0: 3, x1: 31, y1: 10, code: 'B0220', allPads: true },
      { id: 'U4', ref: 'left', x0: 22, y0: F, x1: 31, y1: F + 6, code: 'C0412', pins: { l: [F + 2, F + 4], r: [], t: [29, 30], b: [25, 26, 27] } },
    ];
    const wires = [], labels = [];
    // the accent net: down out of U3, a branch in along the first name's row, and in along the second's
    wires.push(wire([[28, 10], [28, a2], [v2, a2]], { o: true, legs: [0, 10, 0], end: 'via', net: 'U3', code: 'C0411' }),
               wire([[28, a1], [v1, a1]], { o: true, end: 'via', net: 'U3', code: 'B0221' }));
    // U3 → down the right of both projects → U4
    wires.push(...rail('U4', [wire([[29, 10], [29, F]]), wire([[30, 10], [30, F]])]));
    // About's rail, its two outer traces picked up at the top edge in the same columns, east into U3's two top
    // left-hand pads
    wires.push(...rail('U3', bundle([[13.5, 0], [13.5, 4.5], [22, 4.5]], 2)));
    // U4 → down off the board's foot. Research picks the three up at its top edge in the same columns.
    wires.push(...rail('U5', bundle([[26, F + 6], [26, F + 9]], 3)));
    // U4 → two traces west, stopping short on vias: a branch, which grows once Projects' rail reaches U4
    [[F + 2, 14], [F + 4, 8]].forEach(([r, stop], i) => {
      wires.push(...rail('U4 west', [wire([[22, r], [stop, r]], { end: 'via' })], { after: 'U4' }));
      labels.push({ k: 'net', x: stop - 0.9, y: r + 0.25, t: `C041${i + 3}`, a: 'end', rail: 'U4 west' });
    });
    const parts = [
      { kind: 'R', x: 30, y: m.p1.top + 0.55 * m.p1.h, dir: 'v', rail: 'U4' }, { kind: 'C', x: 29, y: m.p2.top + 0.6 * m.p2.h, dir: 'v', rail: 'U4' },
    ];
    return { rows: F + 9, chips, wires, parts, labels };
  },
};

export default { wide, narrow };
