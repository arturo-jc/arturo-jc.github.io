// About, which opens the page: the name, as the page's heading, and two paragraphs.
import { P, bundle, cut, wire, f } from '../kit.js';

// Wide: the name upper left and the copy lower right. U1 sits level with the name's first line, so the
// accent net is one straight run. Three traces leave U1 on a long diagonal between the two blocks and go
// west under the name to U2; three leave its right side, below J1's bus, and go down the copy's right and under it.
const wide = {
  cols: 107, seats: { name: { x: 6, y: 6, size: 60 }, copy: { x: 54, y: 21, w: 36 } },
  build(m) {
    const a = f(m.name.cap);                    // the accent's row; U1 and what hangs off it are placed from it
    const vx = f(m.name.hx + 1.5);                 // the accent's via, just past the first line
    const wires = [], labels = [], parts = [];
    const u2 = { x0: 5.75, y0: a + 10, x1: 13.75, y1: a + 24 };
    const chips = [
      { id: 'U1', x0: 62, y0: a - 3, x1: 74, y1: a + 8, code: 'A0131', allPads: true },
      { id: 'U2', ...u2, code: 'C0412', pins: { l: [], r: [a + 12, a + 13, a + 14, a + 17, a + 20, a + 23], t: [], b: [] } },
      { id: 'J1', conn: true, x0: 90.2, y0: 3, x1: 95.8, y1: 4.5, pins: { b: [91, 92, 93, 94, 95] } },
    ];
    // the accent net: straight from U1 to the name
    wires.push(wire([[62, a], [vx, a]], { o: true, end: 'via' }));
    // J1 → U1, five wide
    wires.push(...bundle([[93, 4.5], [93, a + 1], [74, a + 1]], 5));
    // The long diagonal leaves U1's three lowest left pads, level with the rail on its right. It is the far half of a
    // six-wide bundle, centred on yc, so its traces land on those pads.
    const X = 49.5, yc = a + 7.5, Yd = a + 14.5, shoulder = 60;
    const rows = f(m.copy.bot + 5);
    // the rail: east from U1's right side, then down the copy's right and off the board's foot. Projects picks it
    // up at its top edge in the same columns and takes it into U3.
    const Xr = 94;
    wires.push(...bundle([[74, a + 6], [Xr, a + 6], [Xr, rows]], 3));
    // the diagonal, then west under the name → U2
    wires.push(...bundle([[62, yc], [X, yc], [X, Yd], [u2.x1, Yd]], 6, { 1: shoulder, 2: (Yd - yc) * P - shoulder }).slice(3));
    // U2 → three lamps → common return
    const lamps = [a + 17, a + 20, a + 23];
    wires.push(wire([[u2.x1, lamps[0]], [30, lamps[0]], [30, a + 25]], { legs: [0, 8, 0], end: 'via' }),
               wire([[u2.x1, lamps[1]], [30, lamps[1]]]), wire([[u2.x1, lamps[2]], [30, lamps[2]]]));
    lamps.forEach((r, i) => {
      parts.push({ kind: 'R', x: 19, y: r }, { kind: 'LED', x: 25.5, y: r, delay: [0, 1.3, 2.5][i] });
      labels.push({ k: 'ref', x: 19, y: r - 0.95, t: `R${i + 1}`, a: 'middle' }, { k: 'ref', x: 25.5, y: r - 1.05, t: `D${i + 1}`, a: 'middle' });
    });
    parts.push({ kind: 'R', x: 42, y: a });
    // ref = silkscreen designators · net = wire codes
    labels.push(
      { k: 'ref', x: 62, y: a - 4.1, t: 'U1' }, { k: 'ref', x: u2.x0, y: u2.y1 + 1.3, t: 'U2' }, { k: 'ref', x: 89.6, y: 4.75, t: 'J1', a: 'end' },
      { k: 'ref', x: 42, y: a - 0.95, t: 'R4', a: 'middle' },
      { k: 'net', x: vx + 0.9, y: a - 0.75, t: 'A0130', o: true },
      { k: 'net', x: 96.8, y: 8.3, t: 'D0 – D4' },
    );
    return { rows, chips, wires, parts, labels };
  },
};

// Narrow: J1 and U1 above the name, which is on three lines; the accent net comes down out of U1 and in
// along the name's first line; three traces run down the left of the name and the copy, turn under it and
// drop into Projects' U3.
const narrow = {
  cols: 32, seats: { name: { x: 6, y: 14, size: 50 }, copy: m => ({ x: 6, y: f(m.name.bot + 2.2), w: 24 }) },
  build(m) {
    const chips = [
      { id: 'J1', conn: true, x0: 1, y0: 1, x1: 10, y1: 2.5, pins: { b: [2, 3, 4, 5, 6, 7, 8, 9] } },
      { id: 'U1', x0: 18, y0: 3, x1: 27, y1: 10, code: 'A0131', allPads: true },
    ];
    const wires = [], labels = [];
    // J1 → U1, four wide
    wires.push(...bundle([[7.5, 2.5], [7.5, 6.5], [18, 6.5]], 4));
    // the accent net: down out of U1 and in along the name's first line, ending just past it
    const ay = f(m.name.cap), vx = f(m.name.hx + 1.5);
    wires.push(wire([[25, 10], [25, ay], [vx, ay]], { o: true, legs: [0, 10, 0], end: 'via' }));
    // J1 → down the left of the name and the copy → under the copy → down off the board's foot. Projects picks
    // the three up at its top edge in the same columns and takes them into U3's top pads.
    const under = f(m.copy.bot + 2);           // the row of the trace nearest the copy's last line
    const rows = under + 4;
    wires.push(...bundle([[3, 2.5], [3, under + 1], [24, under + 1], [24, rows]], 3));
    labels.push({ k: 'net', x: 6, y: under + 3.35, t: 'A0131 – A0133' });
    const parts = [
      { kind: 'R', x: 25, y: 13.2, dir: 'v' },
      { kind: 'R', x: 2, y: f(m.copy.top + 0.32 * m.copy.h), dir: 'v' }, { kind: 'C', x: 4, y: f(m.copy.top + 0.64 * m.copy.h), dir: 'v' },
    ];
    labels.push(
      { k: 'ref', x: 18, y: 1.9, t: 'U1' }, { k: 'ref', x: 10.6, y: 1.9, t: 'J1' },
      { k: 'ref', x: 26.1, y: 13.45, t: 'R4' },
      { k: 'net', x: 10.5, y: 9.75, t: 'D0 – D3' },
      { k: 'net', x: vx + 0.9, y: ay - 0.75, t: 'A0130', o: true },
    );
    return { rows, chips, wires, parts, labels };
  },
};

export default { wide, narrow };
