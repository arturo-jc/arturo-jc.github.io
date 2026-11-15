// About: a heading and two paragraphs.
import { bundle, cut, wire, f } from '../kit.js';

const wide = (() => {
  const chips = [
    { id: 'U1', x0: 22, y0: 23, x1: 32, y1: 37, code: 'A0131', allPads: true },
    { id: 'U2', x0: 10, y0: 42, x1: 18, y1: 52, code: 'C0412', pins: { l: [45, 49], r: [44, 47, 50], t: [], b: [] } },
    { id: 'U3', x0: 91, y0: 25, x1: 99, y1: 33, code: 'B0220', pins: { l: [], r: [27, 29, 31], t: [93, 94, 95, 96, 97, 98], b: [96, 97] } },
    { id: 'J1', conn: true, x0: 4.2, y0: 2.5, x1: 14.8, y1: 4, pins: { b: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } },
  ];

  const wires = [];
  // J1 → U1, eight wide
  wires.push(...bundle([[10.5, 4], [10.5, 29.5], [22, 29.5]], 8));
  // J1 → U2
  wires.push(wire([[6, 4], [6, 45], [10, 45]], { legs: [0, 10, 0] }));
  wires.push(wire([[5, 4], [5, 49], [10, 49]], { legs: [0, 10, 0] }));
  // U1 → over the text, stepping down once past the heading → U3
  wires.push(...bundle([[32, 27], [40, 27], [40, 7], [72, 7], [72, 11], [95, 11], [95, 25]], 5));
  // U1 → under the text → U3; three of the five stop short, each on a via
  {
    const b = bundle([[32, 33], [40, 33], [40, 46], [95, 46], [95, 33]], 5);
    cut(b[0], 2, 61).end = 'via';
    cut(b[1], 2, 69).end = 'via';
    cut(b[2], 2, 77).end = 'via';
    wires.push(...b);
  }
  // the accent net: out of U1, through the fork between the two bundles, up to the heading
  wires.push(wire([[32, 30], [46, 30], [46, 15.35], [50, 15.35]], { o: true, legs: [0, 10, 10, 0], end: 'via' }));
  // serpentine above U1, ending on a test point
  wires.push(wire([[27, 23], [27, 21], [19, 21], [19, 19], [35, 19], [35, 17], [19, 17], [19, 15], [35, 15], [35, 13], [19, 13], [19, 11], [33, 11]], { end: 'via' }));
  // U1 → down across the three lamp lines → joins the return
  wires.push(wire([[24, 37], [24, 53], [30, 53]], { legs: [0, 10, 0], hops: [{ seg: 0, at: [44, 47, 50] }] }));
  // U2 → three lamps → common return
  wires.push(wire([[18, 44], [30, 44], [30, 55]], { legs: [0, 8, 0], end: 'via' }));
  wires.push(wire([[18, 47], [30, 47]]));
  wires.push(wire([[18, 50], [30, 50]]));
  // U3 → three outputs
  [27, 29, 31].forEach(r => wires.push(wire([[99, r], [105, r]], { end: 'via' })));
  // a sixth line peels off the upper bundle and drops across those outputs
  wires.push(wire([[98, 25], [98, 20], [102, 20], [102, 36]], { legs: [0, 12, 12, 0], end: 'via', hops: [{ seg: 2, at: [27, 29, 31] }] }));

  const parts = [
    { kind: 'R', x: 21, y: 44 }, { kind: 'R', x: 21, y: 47 }, { kind: 'R', x: 21, y: 50 },
    { kind: 'LED', x: 27.2, y: 44, delay: 0 }, { kind: 'LED', x: 27.2, y: 47, delay: 1.3 }, { kind: 'LED', x: 27.2, y: 50, delay: 2.5 },
    { kind: 'R', x: 46, y: 23.5, dir: 'v' },
    { kind: 'C', x: 24, y: 40.2, dir: 'v' },
  ];

  // ref = silkscreen designators · net = wire codes
  const labels = [
    { k: 'ref', x: 22, y: 22.2, t: 'U1' }, { k: 'ref', x: 10, y: 41.2, t: 'U2' }, { k: 'ref', x: 90.3, y: 26.3, t: 'U3', a: 'end' },
    { k: 'ref', x: 15.4, y: 3.6, t: 'J1' },
    { k: 'ref', x: 21, y: 43.05, t: 'R1', a: 'middle' }, { k: 'ref', x: 21, y: 46.05, t: 'R2', a: 'middle' }, { k: 'ref', x: 21, y: 49.05, t: 'R3', a: 'middle' },
    { k: 'ref', x: 27.2, y: 42.95, t: 'D1', a: 'middle' }, { k: 'ref', x: 27.2, y: 45.95, t: 'D2', a: 'middle' }, { k: 'ref', x: 27.2, y: 48.95, t: 'D3', a: 'middle' },
    { k: 'ref', x: 47.1, y: 23.75, t: 'R4' }, { k: 'ref', x: 25.1, y: 40.45, t: 'C1' },
    { k: 'net', x: 61.9, y: 44.25, t: 'A0131' }, { k: 'net', x: 69.9, y: 45.25, t: 'A0132' }, { k: 'net', x: 77.9, y: 46.25, t: 'A0133' },
    { k: 'net', x: 33.9, y: 11.25, t: 'TP1' }, { k: 'net', x: 102.9, y: 36.25, t: 'TP2' },
    { k: 'net', x: 44, y: 4.3, t: 'C0101 – C0105' },
    { k: 'net', x: 81, y: 49.4, t: 'A0134 – A0135' },
    { k: 'net', x: 15.6, y: 8.3, t: 'D0 – D7' },
    { k: 'net', x: 103.1, y: 26.5, t: 'E01' }, { k: 'net', x: 103.1, y: 28.5, t: 'E02' }, { k: 'net', x: 103.1, y: 30.5, t: 'E03' },
    { k: 'net', x: 46.7, y: 14.6, t: 'A0130', o: true },
  ];

  return { cols: 107, text: { x: 52, y: 14, w: 36 }, build: () => ({ rows: 57, chips, wires, parts, labels }) };
})();

// Narrow: J1, U1 and the accent net above the copy; three traces down its left that turn under it.
const narrow = {
  cols: 32, text: { x: 6, y: 13, w: 24 },
  build(m) {
    const T = this.text.y;
    const chips = [
      { id: 'J1', conn: true, x0: 1, y0: 1, x1: 10, y1: 2.5, pins: { b: [2, 3, 4, 5, 6, 7, 8, 9] } },
      { id: 'U1', x0: 18, y0: 4, x1: 27, y1: 11, code: 'A0131', allPads: true },
    ];
    const wires = [], labels = [];
    // J1 → U1, four wide
    wires.push(...bundle([[7.5, 2.5], [7.5, 7.5], [18, 7.5]], 4));
    // the accent net: out of U1 and in along the heading's row, ending just past its word
    const ay = f(T + m.cap), vx = f(this.text.x + m.hw + 1.5);
    wires.push(wire([[24, 11], [24, ay], [vx, ay]], { o: true, legs: [0, 10, 0], end: 'via' }));
    // J1 → down the left of the copy → under it; each stops short on a via
    const under = f(T + m.h + 2);              // the row of the trace nearest the copy's last line
    bundle([[3, 2.5], [3, under + 1], [26, under + 1]], 3).forEach((w, i) => {
      const stop = [13, 19, 25][i];
      cut(w, 1, stop).end = 'via';
      wires.push(w);
      labels.push({ k: 'net', x: stop + 0.9, y: under + i + 0.25, t: `A013${i + 1}` });
    });

    const parts = [
      { kind: 'R', x: 20, y: ay },
      { kind: 'R', x: 2, y: f(T + 0.32 * m.h), dir: 'v' }, { kind: 'C', x: 4, y: f(T + 0.64 * m.h), dir: 'v' },
    ];
    labels.push(
      { k: 'ref', x: 18, y: 3.2, t: 'U1' }, { k: 'ref', x: 10.6, y: 2.1, t: 'J1' },
      { k: 'ref', x: 20, y: ay - 0.95, t: 'R4', a: 'middle' },
      { k: 'net', x: 9.8, y: 5, t: 'D0 – D3' },
      { k: 'net', x: vx + 0.9, y: ay - 0.75, t: 'A0130', o: true },
    );
    return { rows: under + 4, chips, wires, parts, labels };
  },
};

export default { wide, narrow };
