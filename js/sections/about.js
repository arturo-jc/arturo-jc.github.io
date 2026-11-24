// About, which opens the page: the name, as the page's heading, two paragraphs, and a link to the blog.
import { FLAG, bundle, tail, wire, past, rail, lamps } from '../kit.js';

// Wide: the name upper left and the copy lower right. U1 sits level with the name's first line, so the
// accent net is one straight run. Three traces leave U1 on a long diagonal between the two blocks and go
// west under the name to U2; three leave its right side, below J1's bus, and go down the copy's right and under it.
// U2 lights three lamps, and their common return carries on down and east into an off-page flag before the link
// to the blog, which sits in the pocket under the lamps, left of the copy.
const wide = {
  cols: 107,
  seats: { name: { x: 6, y: 6, size: 60 }, copy: { x: 54, y: 21, w: 36 }, blog: m => ({ x: 40, y: m.copy.bot + 0.4 }) },
  build(m) {
    const a = m.name.cap;                    // the accent's row; U1 and what hangs off it are placed from it
    const vx = past(m.name);                    // the accent's via, just past the first line
    const wires = [], labels = [], parts = [];
    const u2 = { x0: 5.75, y0: a + 10, x1: 13.75, y1: a + 24 };
    const chips = [
      { id: 'U1', x0: 62, y0: a - 3, x1: 74, y1: a + 8, code: 'A0131', allPads: true },
      { id: 'U2', ...u2, ref: 'below', code: 'C0412', pins: { l: [], r: [a + 12, a + 13, a + 14, a + 17, a + 20, a + 23], t: [], b: [] } },
      { id: 'J1', conn: true, x0: 90.2, y0: 3, x1: 95.8, y1: 4.5, ref: 'pins-left', pins: { b: [91, 92, 93, 94, 95] } },
    ];
    // the accent net: straight from U1 to the name
    wires.push(wire([[62, a], [vx, a]], { o: true, end: 'via', net: 'U1', code: 'A0130' }));
    // U1 → J1, five wide: a branch drawn out of U1 on load
    wires.push(...rail('J1', bundle([[74, a + 1], [93, a + 1], [93, 4.5]], 5), { after: 'load' }));
    // The long diagonal leaves U1's three lowest left pads, level with the rail on its right. It is the far half of a
    // six-wide bundle, centred on yc, so its traces land on those pads.
    const X = 49.5, yc = a + 7.5, Yd = a + 14.5, shoulder = 5;
    const rows = Math.max(m.copy.bot + 5, m.blog.bot + 4);
    // the rail: east from U1's right side, then down the copy's right and off the board's foot. Projects picks it
    // up at its top edge in the same columns and takes it into U3.
    const Xr = 94;
    wires.push(...rail('U3', bundle([[74, a + 6], [Xr, a + 6], [Xr, rows]], 3)));
    // the diagonal, then west under the name → U2: a branch drawn out of U1 on load
    wires.push(...rail('U2', bundle([[62, yc], [X, yc], [X, Yd], [u2.x1, Yd]], 6, { 1: shoulder, 2: Yd - yc - shoulder }).slice(3), { after: 'load' }));
    // U2 → three lamps → common return → down and east, along the middle of the word's capitals, into the flag,
    // whose point stops just short of the word: a branch drawn out of U2 once the diagonal reaches it
    const lit = [a + 17, a + 20, a + 23];
    const by = m.blog.cap, tip = m.blog.l - 0.8;
    wires.push(...rail('U2 lamps', [wire([[u2.x1, lit[0]], [30, lit[0]], [30, by], [tip - FLAG, by]]),
               wire([[u2.x1, lit[1]], [30, lit[1]]]), wire([[u2.x1, lit[2]], [30, lit[2]]])], { after: 'U2' }));
    const flags = [{ tip, y: by, code: 'A0140', go: true, rail: 'U2 lamps' }];
    parts.push(...lamps(lit, 19, 25.5, { r: 1, d: 1, rail: 'U2 lamps' }), { kind: 'R', x: 42, y: a, ref: 'R4', net: 'U1' });
    labels.push({ k: 'net', x: 96.8, y: 8.3, t: 'D0 – D4', rail: 'J1' });
    return { rows, chips, wires, parts, labels, flags };
  },
};

// Narrow: J1 and U1 above the name, which is on three lines; the accent net comes down out of U1 and in
// along the name's first line; three traces run down the left of the name and the copy, turn under it and turn
// down. The one nearest the copy turns east again after a short 45° step, into an off-page flag before the link to
// the blog; the other two drop into Projects' U3.
const narrow = {
  cols: 32,
  seats: {
    name: { x: 6, y: 14, size: 50 }, copy: m => ({ x: 6, y: m.name.bot + 2.2, w: 24 }),
    // the link 3 rows under the rail's turn, its flag's tail a couple of cells past the end of the step
    blog: m => ({ x: 23.3, y: m.copy.bot + 5.5 }),
  },
  build(m) {
    const chips = [
      { id: 'J1', conn: true, x0: 1, y0: 1, x1: 10, y1: 2.5, pins: { b: [2, 3, 4, 5, 6, 7, 8, 9] } },
      { id: 'U1', x0: 18, y0: 3, x1: 27, y1: 10, code: 'A0131', allPads: true },
    ];
    const wires = [], labels = [];
    // U1 → J1, four wide: a branch drawn out of U1 on load, at once and in `dur` seconds. The rail out of J1 waits
    // for it, then follows the reading line's sweep (SWEEP in rails.js, 0.8 seconds) down the left of the copy.
    wires.push(...rail('J1', bundle([[18, 6.5], [7.5, 6.5], [7.5, 2.5]], 4), { after: 'load', dur: 0.35, wait: 0 }));
    // the accent net: down out of U1 and in along the name's first line, ending just past it. It is much shorter
    // than the way round through J1, so it starts a moment after the bus and finishes with the rail's sweep, at 1.15s.
    const ay = m.name.cap, vx = past(m.name);
    wires.push(wire([[25, 10], [25, ay], [vx, ay]], { o: true, legs: [0, 1, 0], end: 'via', net: 'U1', code: 'A0130', wait: 0.15, dur: 1 }));
    // J1 → down the left of the name and the copy → under the copy → down. The two outer traces carry on down off
    // the board's foot, and Projects picks them up at its top edge in the same columns and takes them into U3's two
    // top left-hand pads. The one nearest the copy turns down with them, then east again `step` rows lower, along the
    // middle of the link's capitals, into the flag. Its two cuts add up to the step, so the turn is one straight 45°
    // run, and the first is the bundle's own, so the run stays nested with the other two.
    const step = 3, by = m.blog.cap;
    const under = by - step;                // the row of the trace nearest the copy's last line
    const rows = Math.max(under + 4, m.blog.bot + 2);
    const tip = m.blog.l - 0.8;
    const [toFlag, ...down] = bundle([[3, 2.5], [3, under + 1], [14, under + 1], [14, rows]], 3);
    tail(toFlag, [[15, by], [tip - FLAG, by]], [step - toFlag.legs[2]]);
    wires.push(...rail('U3', [toFlag, ...down], { from: 'J1' }));
    labels.push({ k: 'net', x: 4, y: under + 3.35, t: 'A0131 – A0133', rail: 'U3' });
    const flags = [{ tip, y: by, code: 'A0140', go: true, rail: 'U3' }];
    const parts = [
      { kind: 'R', x: 25, y: 13.2, dir: 'v', ref: 'R4', net: 'U1' },
      { kind: 'R', x: 2, y: m.copy.top + 0.32 * m.copy.h, dir: 'v', rail: 'U3' }, { kind: 'C', x: 4, y: m.copy.top + 0.64 * m.copy.h, dir: 'v', rail: 'U3' },
    ];
    labels.push({ k: 'net', x: 10.5, y: 9.75, t: 'D0 – D3', rail: 'J1' });
    return { rows, chips, wires, parts, labels, flags };
  },
};

export default { wide, narrow };
