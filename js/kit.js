// The drawing kit: what a layout is written with (bundle, cut, wire) and how a circuit becomes SVG (drawing, and
// the pieces it is drawn from: traces, chips, parts, flags, vias and labels). Nothing here touches the page.
// Geometry is in grid cells: 1 cell = P units = one trace pitch.
export const P = 12;
export const WEIGHT = 4;    // trace width, in units
const HOP = 7;              // bridge radius, in units

const left = ([dx, dy]) => [dy, -dx];
const dirOf = (a, b) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
export const f = n => +n.toFixed(2);
const pt = p => `${f(p[0])} ${f(p[1])}`;
const rng = (a, b) => Array.from({ length: Math.round(b - a) + 1 }, (_, i) => a + i);
// attributes, leaving out any with no value
const attrs = o => Object.entries(o).map(([k, v]) => v == null || v === false ? '' : ` ${k}="${v}"`).join('');
// what ties a piece to a run, so that js/rails.js shows it as the run reaches it
const marks = x => attrs({ 'data-net': x.net, 'data-rail-end': x.rail });

// n parallel traces round an orthogonal centreline, nested at every corner.
// `legs` is each corner's 45° cut, sized so the diagonals of neighbours stay one pitch apart.
// `big` = { cornerIndex: units } sets the size of that corner's cut, which makes a long 45° run. Two corners
// whose cuts add up to the length of the segment between them make one straight diagonal with no step in it.
export function bundle(center, n, big = {}) {
  const maxd = (n - 1) / 2;
  const std = 6 + 0.586 * maxd * P;
  const out = [];
  for (let k = 0; k < n; k++) {
    const d = maxd - k;                                     // k = 0 is leftmost of travel
    const pts = [], legs = [];
    center.forEach((v, i) => {
      const din = i > 0 ? dirOf(center[i - 1], v) : null;
      const dout = i < center.length - 1 ? dirOf(v, center[i + 1]) : null;
      const nin = din && left(din), nout = dout && left(dout);
      if (din && dout) {
        pts.push([v[0] + d * (nin[0] + nout[0]), v[1] + d * (nin[1] + nout[1])]);
        const cross = din[0] * dout[1] - din[1] * dout[0];  // > 0: right turn
        legs.push((big[i] ?? std) + (cross > 0 ? 1 : -1) * 0.586 * d * P);
      } else {
        const nn = nin || nout;
        pts.push([v[0] + d * nn[0], v[1] + d * nn[1]]);
        legs.push(0);
      }
    });
    out.push({ pts, legs });
  }
  return out;
}
// end a trace early, part-way along segment `seg`
export function cut(w, seg, at) {
  const a = w.pts[seg], b = w.pts[seg + 1];
  w.pts = [...w.pts.slice(0, seg + 1), a[1] === b[1] ? [at, a[1]] : [a[0], at]];
  w.legs = [...w.legs.slice(0, seg + 1), 0];
  return w;
}
// end each of traces `ws` early on a via, part-way along segment `seg`, at staggered stops
export const stagger = (ws, seg, stops) => ws.map((w, k) => Object.assign(cut(w, seg, stops[k]), { end: 'via' }));
// Take a trace on from where it ends another way: its last point is replaced by `pts`, and `legs` are the cuts at
// each of them but the last, as `bundle` takes them. For one trace of a bundle that leaves the others.
export function tail(w, pts, legs = []) {
  w.pts = [...w.pts.slice(0, -1), ...pts];
  w.legs = [...w.legs.slice(0, -1), ...legs, 0];
  return w;
}
// A single trace. `end: 'via'` ends it on a via, and `start: 'via'` starts it on one; `code` writes its wire code
// over it, just behind the via it ends on, as an accent net's is.
export const wire = (pts, extra = {}) => ({ pts, ...extra });
// Where an accent net's via goes: just past the end of a block's heading's first line.
export const past = b => f(b.hx + 1.5);
// Mark traces `ws` as a run that js/rails.js animates, `to` being the chip it runs into, or a branch's name. With
// `after`, the chip it leaves or 'load', it is a branch, which grows by itself; without, it follows the scroll.
// `from`, `dur` and `wait` time it further: see js/rails.js.
export const rail = (to, ws, timing = {}) => ws.map(w => Object.assign(w, { rail: to }, timing));
// A lamp on each of `rows`: a resistor at column `xr` and a lit LED at `xl`, numbered on from R`r` and D`d`, each
// blinking out of step with the one above. `marks` ties them to a run, as `{ rail: 'U5 lamps' }`.
export const lamps = (rows, xr, xl, { r, d, ...marks }) => rows.flatMap((y, i) => [
  { kind: 'R', x: xr, y, ref: `R${r + i}`, ...marks },
  { kind: 'LED', x: xl, y, ref: `D${d + i}`, delay: [0, 1.3, 2.5][i], ...marks },
]);

// a trace as a path: 45° corners, and a semicircular bridge at every hop
function tracePath(w) {
  const pts = w.pts.map(p => [p[0] * P, p[1] * P]);
  const n = pts.length;
  const L = pts.map((_, i) => (i > 0 && i < n - 1) ? (w.legs ? w.legs[i] : 8) : 0);
  for (let i = 0; i < n - 1; i++) {
    const s = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (L[i] + L[i + 1] > s) { const k = s / (L[i] + L[i + 1]); L[i] *= k; L[i + 1] *= k; }
  }
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const ux = Math.sign(b[0] - a[0]), uy = Math.sign(b[1] - a[1]), s = ux || uy;
    if (i > 0) d += `L${pt([a[0] + ux * L[i], a[1] + uy * L[i]])}`;
    const hop = (w.hops || []).find(h => h.seg === i);
    if (hop) {
      const on = v => ux ? [v, a[1]] : [a[0], v];
      // bridges rise north over a horizontal run and east over a vertical one
      for (const h of hop.at.map(c => c * P).sort((p, q) => s * (p - q)))
        d += `L${pt(on(h - s * HOP))}A${HOP} ${HOP} 0 0 ${s > 0 ? 1 : 0} ${pt(on(h + s * HOP))}`;
    }
    d += `L${pt([b[0] - ux * L[i + 1], b[1] - uy * L[i + 1]])}`;
  }
  return d;
}

// A trace, with what js/rails.js needs to animate it: the run it belongs to, and how that run is timed.
const trace = w => `<path class="t${w.o ? ' o' : ''}"${attrs({ 'data-rail': w.rail, 'data-after': w.after, 'data-dur': w.dur, 'data-wait': w.wait, 'data-from': w.from, 'data-net': w.net })} d="${tracePath(w)}"/>`;

const via = (x, y, o) => `<circle class="f${o ? ' o' : ''}" cx="${f(x)}" cy="${f(y)}" r="5.4"/><circle class="hole" cx="${f(x)}" cy="${f(y)}" r="2.1"/>`;
// the via a trace with `end: 'via'` ends on
const end = w => { const [x, y] = w.pts.at(-1); return `<g${marks(w)}>${via(x * P, y * P, w.o)}</g>`; };

// A label: `k` is `ref` for a silkscreen designator, `net` for a wire code; `a` its text-anchor.
const label = l => `<text class="lb ${l.k}${l.o ? ' o' : ''}"${marks(l)} x="${f(l.x * P)}" y="${f(l.y * P)}"${attrs({ 'text-anchor': l.a })}>${l.t}</text>`;

// A chip may sit on fractional cells, so that one of its pads lands on a measured row.
function chip(c) {
  const x0 = c.x0 * P, y0 = c.y0 * P, x1 = c.x1 * P, y1 = c.y1 * P, w = x1 - x0, h = y1 - y0;
  const s = [];
  if (c.conn) {             // a pin header: through-hole pads in a silkscreen outline
    c.pins.b.forEach((col, i) => {
      const x = col * P;
      s.push(i === 0 ? `<rect class="pad" x="${f(x - 4.8)}" y="${f(y1 - 4.8)}" width="9.6" height="9.6" rx="1"/>`
                     : `<circle class="pad" cx="${f(x)}" cy="${f(y1)}" r="4.9"/>`,
             `<circle class="hole" cx="${f(x)}" cy="${f(y1)}" r="1.9"/>`);
    });
    s.push(`<rect class="silk" x="${f(x0)}" y="${f(y1 - 13)}" width="${f(w)}" height="26" rx="2"/>`);
    return s.join('');
  }
  const rows = rng(c.y0 + 1, c.y1 - 1), cols = rng(c.x0 + 1, c.x1 - 1);
  (c.allPads ? rows : c.pins.l).forEach(r => s.push(`<rect class="pad" x="${f(x0 - 11)}" y="${f(r * P - 3.5)}" width="15" height="7" rx="1"/>`));
  (c.allPads ? rows : c.pins.r).forEach(r => s.push(`<rect class="pad" x="${f(x1 - 4)}" y="${f(r * P - 3.5)}" width="15" height="7" rx="1"/>`));
  (c.allPads ? cols : c.pins.t).forEach(q => s.push(`<rect class="pad" x="${f(q * P - 3.5)}" y="${f(y0 - 11)}" width="7" height="15" rx="1"/>`));
  (c.allPads ? cols : c.pins.b).forEach(q => s.push(`<rect class="pad" x="${f(q * P - 3.5)}" y="${f(y1 - 4)}" width="7" height="15" rx="1"/>`));
  s.push(`<rect class="body" x="${f(x0 + 3)}" y="${f(y0 + 3)}" width="${f(w - 6)}" height="${f(h - 6)}" rx="2.5"/>`,
         `<circle cx="${f(x0 + 13)}" cy="${f(y0 + 13)}" r="2.6" fill="var(--trace-dim)"/>`,
         `<text class="lb mark" x="${f(x0 + w / 2)}" y="${f(y0 + h / 2 + 3)}" text-anchor="middle">${c.code}</text>`);
  return s.join('');
}

// An off-page connector: the flag a schematic draws where a net leaves the sheet and carries on elsewhere. It
// points east, or west when `dir` is -1, its point at column `tip` and its tail FLAG cells back, where the trace
// that feeds it ends. The net's code is written inside it. `go` marks the flag in front of a link, which warms
// when the link is hovered. Marked `rail` or `net` with a run's name, it appears as that run reaches it.
export const FLAG = 4;
function flag({ tip, y, code, dir = 1, go, rail, net }) {
  const X = c => f((tip - dir * c) * P), Y = r => f(y * P + r), h = 6.6;
  return `<g${marks({ net, rail })}><path class="flag${go ? ' go' : ''}" d="M${X(FLAG)} ${Y(-h)}L${X(0.7)} ${Y(-h)}L${X(0)} ${Y(0)}L${X(0.7)} ${Y(h)}L${X(FLAG)} ${Y(h)}Z"/>`
       + `<text class="lb o" x="${f((tip - dir * (FLAG + 0.7) / 2) * P)}" y="${Y(3)}" text-anchor="middle">${code}</text></g>`;
}

// two-pad parts sitting on a trace; each knocks out the stretch of trace under it
function part(p) {
  const g = p.kind === 'LED'
    ? `<rect class="ko" x="-12" y="-6" width="24" height="12"/><rect class="pad" x="-12" y="-5" width="7" height="10" rx="1"/><rect class="pad" x="5" y="-5" width="7" height="10" rx="1"/>`
      + `<g class="pulse" style="animation-delay:${-(p.delay || 0)}s"><circle class="halo" r="9"/><rect class="lit" x="-5" y="-4.5" width="10" height="9" rx="1"/></g>`
    : `<rect class="ko" x="-13" y="-6" width="26" height="12"/><rect class="pad" x="-13" y="-5.5" width="9" height="11" rx="1"/><rect class="pad" x="4" y="-5.5" width="9" height="11" rx="1"/>`
      + `<rect x="-4.5" y="-4.5" width="9" height="9" fill="${p.kind === 'C' ? 'var(--trace-dim)' : 'var(--chip)'}"/>`;
  return `<g${marks(p)} transform="translate(${f(p.x * P)} ${f(p.y * P)})${p.dir === 'v' ? ' rotate(90)' : ''}">${g}</g>`;
}

// an accent net's wire code, over its last run just behind the via it ends on
const codeOf = w => { const [x, y] = w.pts.at(-1), s = Math.sign(w.pts.at(-2)[0] - x); return { k: 'net', t: w.code, o: w.o, net: w.net, rail: w.rail, x: f(x + s * 0.9), y: f(y - 0.75), a: s < 0 ? 'end' : undefined }; };

// Designators. A chip's is its `id`, placed beside its box by `ref`, one of the places below: `top` by default, or
// `right` for a connector. A part's is its `ref`, over it when it lies across and beside it when it stands
// (`dir: 'v'`), and it carries the part's marks, so it appears with the part. Either can be moved by `nudge`, [dx, dy].
const REF = {
  top: c => [c.x0, c.y0 - 1.1],                       // over the top left-hand corner
  'top-end': c => [c.x1, c.y0 - 1.1, 'end'],           // over the top right-hand corner
  left: c => [c.x0 - 0.6, c.y0 + 0.2, 'end'],          // beside the top of the left side
  below: c => [c.x0, c.y1 + 1.3],                      // under the bottom left-hand corner
  corner: c => [c.x1 + 0.6, c.y1 + 1.1],               // off the bottom right-hand corner
  right: c => [c.x1 + 0.6, c.y1 - 0.4],                // a connector's: past the end of its row of pins
  'pins-left': c => [c.x0 - 0.6, c.y1 - 0.25, 'end'],  // and before the start of it
};
const nudged = ([x, y, a], [dx, dy] = [0, 0]) => ({ x: f(x + dx), y: f(y + dy), a });
const chipRef = c => ({ k: 'ref', t: c.id, ...nudged(REF[c.ref ?? (c.conn ? 'right' : 'top')](c), c.nudge) });
const partRef = p => ({
  k: 'ref', t: p.ref, net: p.net, rail: p.rail,
  ...nudged(p.dir === 'v' ? [p.x + 1.1, p.y + 0.25] : [p.x, p.y - (p.kind === 'LED' ? 1.05 : 0.95), 'middle'], p.nudge),
});

// A circuit, as build() returns it, drawn on a grid `cols` cells wide. Only `rows` and `wires` are required.
export function drawing(c, cols) {
  const { wires, chips = [], parts = [], flags = [] } = c;
  const labels = [...chips.map(chipRef), ...parts.filter(p => p.ref).map(partRef), ...wires.filter(w => w.code).map(codeOf), ...(c.labels ?? [])];
  const vias = [...wires.filter(w => w.start === 'via').map(w => end({ ...w, pts: [w.pts[0]] })), ...wires.filter(w => w.end === 'via').map(end)];
  return `<svg viewBox="0 0 ${cols * P} ${f(c.rows * P)}" aria-hidden="true">
    <g stroke-width="${WEIGHT}" stroke-linecap="round" stroke-linejoin="round">${wires.map(trace).join('')}</g>
    <g>${chips.map(chip).join('')}${parts.map(part).join('')}${flags.map(flag).join('')}</g><g>${vias.join('')}</g><g>${labels.map(label).join('')}</g></svg>`;
}
