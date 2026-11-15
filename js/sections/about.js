// About, which opens the page: the name, as the page's heading, and two paragraphs.
import { P, bundle, cut, wire, f } from '../kit.js';

// Wide: the name upper left and the copy lower right. U1 sits level with the name's first line, so the
// accent net is one straight run. A six-wide bus leaves U1 on a long diagonal between the two blocks and
// splits at the bottom of it: three go west under the name to U2, three go down the copy's left and under it.
const wide = {
  cols: 107, name: { x: 6, y: 6, size: 60 }, text: { x: 58, y: 21, w: 36 },
  build(m) {
    const a = f(m.cap);                         // the accent's row; U1 and what hangs off it are placed from it
    const vx = f(m.hx + 1.5);                   // the accent's via, just past the first line
    const wires = [], labels = [], parts = [];
    const u2 = { x0: 5.75, y0: a + 10, x1: 13.75, y1: a + 24 };
    const chips = [
      { id: 'U1', x0: 62, y0: a - 3, x1: 74, y1: a + 8, code: 'A0131', allPads: true },
      { id: 'U2', ...u2, code: 'C0412', pins: { l: [], r: [a + 12, a + 13, a + 14, a + 17, a + 20, a + 23], t: [], b: [] } },
      { id: 'J1', conn: true, x0: 89.2, y0: 3, x1: 97.8, y1: 4.5, pins: { b: [90, 91, 92, 93, 94, 95, 96, 97] } },
    ];
    // the accent net: straight from U1 to the name
    wires.push(wire([[62, a], [vx, a]], { o: true, end: 'via' }));
    // J1 → U1, eight wide
    wires.push(...bundle([[93.5, 4.5], [93.5, a + 2.5], [74, a + 2.5]], 8));
    // The long diagonal: six traces leave U1 and turn 45° together. Both halves are sliced from one
    // six-wide bundle, so they nest; the halves differ only in where they go after the diagonal.
    const X = 49.5, yc = a + 4.5, Yd = yc + 10, shoulder = 96;
    const F = f(m.top + m.h + 2.2);             // the row of the trace nearest the copy's last line
    // … three go down the copy's left and under it, each stopping short on a via
    bundle([[62, yc], [X, yc], [X, F + 2.5], [86, F + 2.5]], 6, { 1: shoulder }).slice(0, 3).forEach((w, i) => {
      const stop = [66, 74, 82][i];
      cut(w, 2, stop).end = 'via';
      wires.push(w);
      labels.push({ k: 'net', x: stop + 0.9, y: w.pts[3][1] + 0.25, t: `A013${i + 1}` });
    });
    // … three carry on to the end of the diagonal and go west under the name → U2
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
      { k: 'ref', x: 62, y: a - 4.1, t: 'U1' }, { k: 'ref', x: u2.x0, y: u2.y1 + 1.3, t: 'U2' }, { k: 'ref', x: 88.6, y: 4.75, t: 'J1', a: 'end' },
      { k: 'ref', x: 42, y: a - 0.95, t: 'R4', a: 'middle' },
      { k: 'net', x: vx + 0.9, y: a - 0.75, t: 'A0130', o: true },
      { k: 'net', x: 98.8, y: 8.3, t: 'D0 – D7' },
    );
    return { rows: f(F + 5), chips, wires, parts, labels };
  },
};

// Narrow: J1 and U1 above the name, which is on three lines; the accent net comes down out of U1 and in
// along the name's first line; three traces run down the left of the name and the copy and turn under it.
const narrow = {
  cols: 32, name: { x: 6, y: 14, size: 50 }, text: { x: 6, under: 2.2, w: 24 },
  build(m) {
    const chips = [
      { id: 'J1', conn: true, x0: 1, y0: 1, x1: 10, y1: 2.5, pins: { b: [2, 3, 4, 5, 6, 7, 8, 9] } },
      { id: 'U1', x0: 18, y0: 3, x1: 27, y1: 10, code: 'A0131', allPads: true },
    ];
    const wires = [], labels = [];
    // J1 → U1, four wide
    wires.push(...bundle([[7.5, 2.5], [7.5, 6.5], [18, 6.5]], 4));
    // the accent net: down out of U1 and in along the name's first line, ending just past it
    const ay = f(m.cap), vx = f(m.hx + 1.5);
    wires.push(wire([[25, 10], [25, ay], [vx, ay]], { o: true, legs: [0, 10, 0], end: 'via' }));
    // J1 → down the left of the name and the copy → under the copy; each stops short on a via
    const under = f(m.top + m.h + 2);           // the row of the trace nearest the copy's last line
    bundle([[3, 2.5], [3, under + 1], [26, under + 1]], 3).forEach((w, i) => {
      const stop = [13, 19, 25][i];
      cut(w, 1, stop).end = 'via';
      wires.push(w);
      labels.push({ k: 'net', x: stop + 0.9, y: under + i + 0.25, t: `A013${i + 1}` });
    });

    const parts = [
      { kind: 'R', x: 25, y: 13.2, dir: 'v' },
      { kind: 'R', x: 2, y: f(m.top + 0.32 * m.h), dir: 'v' }, { kind: 'C', x: 4, y: f(m.top + 0.64 * m.h), dir: 'v' },
    ];
    labels.push(
      { k: 'ref', x: 18, y: 1.9, t: 'U1' }, { k: 'ref', x: 10.6, y: 1.9, t: 'J1' },
      { k: 'ref', x: 26.1, y: 13.45, t: 'R4' },
      { k: 'net', x: 10.5, y: 9.75, t: 'D0 – D3' },
      { k: 'net', x: vx + 0.9, y: ay - 0.75, t: 'A0130', o: true },
    );
    return { rows: under + 4, chips, wires, parts, labels };
  },
};

export default { wide, narrow };
