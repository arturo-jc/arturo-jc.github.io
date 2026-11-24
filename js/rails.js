// The circuit, drawn as the page scrolls. Three kinds of run:
// - The main rail: every trace a layout marks with rail(to, …), from one chip into chip `to`, on one board or across
//   the seam into the next. It is drawn out of its source as the reader scrolls down, so that its tip reaches `to` as
//   `to` comes up to the reading line. Its drawn length is worked out from the scroll position alone.
// - A branch: marked rail(name, …, after), it leaves a chip on the main rail and stops short. It does not follow the
//   scroll, but grows by itself once the main rail reaches its chip, and draws back in, faster, if the reader scrolls
//   back above it.
// - A chip's accent net: everything marked `net: to`. It grows out of `to` like a branch, in blue, but in the same
//   time whatever its length, and turns orange once it reaches the content; it turns blue again and draws back in when `to` disconnects. Its parts, via and code
//   appear as the tip reaches them.
// A branch with `after: 'load'` grows as soon as the page loads, and one that reaches a chip connects it as the main
// rail does, so that a branch can grow out of the end of another. A branch's and a net's drawn length is kept by name,
// so a redraw never puts any of them out of step. On load the reading line sweeps down to its place, and everything
// follows it.
const READ = 0.7;                       // the reading line, as a fraction of the window's height down from its top
const SWEEP = 0.8;                      // the seconds the reading line takes to sweep down to its place on load
const GROW = 900;                       // a branch's growth, in drawing units a second
const RETRACT = 3600;                   // and how fast it draws back in, much faster
const NET = 0.5;                        // the seconds a net takes to draw, whatever its length, so each lights on the same beat
const LOAD = 0.8;                       // the seconds the runs drawn on load take, all of them, easing out like the sweep
const still = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (t, hi = 1) => Math.min(hi, Math.max(0, t));
const grown = new Map();                // by name: how much of a branch or net is drawn, 0 to 1
let runs = [], queued = 0, ticking = 0, then = 0, born = null, swept0 = null, reached = new Set(), live = new Set();

// A trace's point `at` units along it, in page coordinates. `x` is a trace as legsOf() keeps it, with its path `p`,
// the path's screen matrix `m`, and `k`, page px to a unit.
function point(x, at) {
  const { m } = x, pt = x.p.getPointAtLength(at);
  return { at, x: m.a * pt.x + m.c * pt.y + m.e, y: m.b * pt.x + m.d * pt.y + m.f + scrollY };
}
// A trace's points every STEP units, and its end. getPointAtLength() is slow, and a redraw samples every animated
// trace on the page, so the samples are coarse, and nearest() looks closer only where it needs to.
const STEP = 24;
function samples(x) {
  const out = [];
  for (let at = 0; ; at = Math.min(x.len, at + STEP)) {
    out.push(point(x, at));
    if (at === x.len) return out;
  }
}
const centre = el => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 + scrollY }; };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// The point on trace `x` nearest to `c` between `lo` and `hi` units along it, to within a unit, by golden-section
// search: the span is two samples' worth, short enough that the distance falls to one low point and rises again.
const GOLD = (Math.sqrt(5) - 1) / 2;
function closest(x, c, lo, hi) {
  const at = t => ({ at: t, d: dist(point(x, t), c) });
  let p = at(hi - GOLD * (hi - lo)), q = at(lo + GOLD * (hi - lo));
  while (hi - lo > 1)
    if (p.d < q.d) { hi = q.at; q = p; p = at(hi - GOLD * (hi - lo)); }
    else { lo = p.at; p = q; q = at(lo + GOLD * (hi - lo)); }
  return p.d < q.d ? p : q;
}
// The trace, and the point on it to about a unit, nearest to `c`; with `tips`, only the traces' ends are considered.
// The point nearest `c` is within STEP / 2 units of a sample, so that sample is within STEP / 2 units, in page px,
// of the nearest sample of all. Every sample that close which is nearer than the samples either side of it is
// looked at again, between those two.
function nearest(ps, c, tips) {
  if (tips) return ps.map(x => { const s = x.pts.at(-1); return { x, at: s.at, d: dist(s, c) }; }).reduce((a, b) => b.d < a.d ? b : a);
  const ds = ps.map(x => x.pts.map(s => dist(s, c)));
  const near = Math.min(...ds.flat());
  let best = null;
  ps.forEach((x, j) => ds[j].forEach((d, i) => {
    if (d > near + STEP / 2 * x.k || d > (ds[j][i - 1] ?? Infinity) || d > (ds[j][i + 1] ?? Infinity)) return;
    const s = closest(x, c, x.pts[Math.max(0, i - 1)].at, x.pts[Math.min(x.pts.length - 1, i + 1)].at);
    if (d < s.d) Object.assign(s, { at: x.pts[i].at, d });
    if (!best || s.d < best.d) best = { x, ...s };
  }));
  return best;
}

// A run's traces, as legs in page order, one per board it crosses. A trace that starts on another, as a net's
// branch does on its trunk, waits for the trunk's tip to reach it: `off` is how far along the trunk that is.
function legsOf(paths) {
  return [...new Set(paths.map(p => p.ownerSVGElement))].map(svg => {
    const ps = paths.filter(p => p.ownerSVGElement === svg).map(p => {
      const m = p.getScreenCTM(), x = { p, m, k: Math.hypot(m.a, m.b), len: p.getTotalLength(), off: 0 };
      return Object.assign(x, { pts: samples(x) });
    });
    const trunk = ps.reduce((a, b) => b.len > a.len ? b : a);
    for (const x of ps) {
      if (x === trunk) continue;
      const n = nearest([trunk], x.pts[0]);
      if (n.d < 3) x.off = n.at;
    }
    for (const { p, len } of ps) p.style.strokeDasharray = `${len} ${len + 1}`;
    return { ps, len: Math.max(...ps.map(x => x.off + x.len)) };
  });
}

function run(key, paths, more) {
  const legs = legsOf(paths), last = legs.at(-1).ps.reduce((a, b) => b.pts.at(-1).y > a.pts.at(-1).y ? b : a);
  return { key, legs, len: legs.reduce((s, l) => s + l.len, 0), y0: legs[0].ps[0].pts[0].y, y1: last.pts.at(-1).y, goal: 0, lit: null, ...more };
}

// A run drawn on load can set how long its chain takes, `dur`, and how long it waits before it starts, `wait`.
const timing = p => ({ dur: p.dataset.dur ? +p.dataset.dur : null, wait: p.dataset.wait ? +p.dataset.wait : null });

// Every run on the page.
function collect() {
  const group = attr => {
    const by = new Map();
    for (const p of document.querySelectorAll(`path[data-${attr}]`)) {
      const k = p.getAttribute(`data-${attr}`);
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(p);
    }
    return [...by];
  };
  runs = [
    // The main rail and the branches. What waits at the end of one that stops short, its vias, their codes and a
    // flag, is shown when the nearest trace end is reached, and a part sitting on one, with its designator, when the
    // tip reaches the part.
    ...group('rail').map(([to, paths]) => {
      const r = run(to, paths, { after: paths[0].dataset.after, ...timing(paths[0]), from: paths[0].dataset.from });
      const ps = r.legs.flatMap(l => l.ps);
      r.reveal = [...document.querySelectorAll(`[data-rail-end="${to}"]`)].map(el => ({ ...nearest(ps, centre(el), !el.matches('[transform], .ref')), el }));
      return r;
    }),
    // the accent nets. Their parts, vias and codes are shown when the tip reaches the point nearest them.
    ...group('net').map(([to, paths]) => {
      const r = run(`net ${to}`, paths, { after: to, net: true, ...timing(paths[0]) });
      const ps = r.legs[0].ps, els = [...document.querySelectorAll(`[data-net="${to}"]:not(path)`)];
      r.reveal = els.map(el => ({ ...nearest(ps, centre(el)), el }));
      r.nets = [...document.querySelectorAll(`[data-net="${to}"]`)];
      r.inks = r.nets.flatMap(el => [el, ...el.querySelectorAll('*')]);    // what is coloured: a via's disc is in its group
      return r;
    }),
  ];
  chains();
}

// The runs drawn on load: those after 'load', the net of a chip no run leads into, and every branch after one of
// them. Each chain of them shares one clock, easing out, so that every chain finishes at once however long it is:
// `lead` is how far along its chain a run starts, and its head's `chain` is the chain's length. A chain takes LOAD
// seconds, or its head's `dur`; one that takes less waits to start, so that it finishes with the others, unless its
// head sets its own `wait`.
function chains() {
  const keyed = new Map(runs.map(r => [r.key, r]));
  for (const r of runs)
    if (r.after === 'load' || (r.net && !keyed.has(r.after))) {
      const dur = r.dur ?? LOAD;
      Object.assign(r, { load: true, lead: 0, head: r, chain: 0, dur, wait: r.wait ?? LOAD - dur });
    }
  for (let more = true; more;) {
    more = false;
    for (const r of runs) {
      const p = keyed.get(r.after);
      if (!r.load && !r.net && p?.load) { Object.assign(r, { load: true, lead: p.lead + p.len, head: p.head }); more = true; }
    }
  }
  for (const r of runs) if (r.load) r.head.chain = Math.max(r.head.chain, r.lead + r.len);
}

// Draw fraction `t` of a run. Every trace is drawn at the same speed, so traces that stop short at staggered
// lengths finish one by one, and a branch starts when the trunk's tip reaches it.
function paint(r, t) {
  let along = t * r.len;
  for (const leg of r.legs) {
    for (const x of leg.ps) {
      x.d = clamp(along - x.off, x.len);
      x.p.style.strokeDashoffset = x.len - x.d;
      x.p.style.visibility = x.d > 0 ? '' : 'hidden';
    }
    along -= leg.len;
  }
  r.reveal.forEach(({ el, x, at }) => el.style.visibility = x.d >= at - 0.5 ? '' : 'hidden');
}

// A net is orange once it is drawn to the end and its chip is connected. A redraw's nets are new, and take their
// colour at once; after that they fade from one to the other.
function light(r, g) {
  const lit = g >= 1 && r.goal === 1;
  if (!r.net || lit === r.lit) return;
  const first = r.lit === null;
  if (first) r.inks.forEach(el => el.style.transition = 'none');
  r.nets.forEach(el => el.classList.toggle('off', !lit));
  if (first) { void document.body.offsetHeight; r.inks.forEach(el => el.style.transition = ''); }
  r.lit = lit;
}

function update() {
  queued = 0;
  // On load the reading line sweeps down from the top of the page to its place, easing out, so that the main rail
  // grows to where the scroll puts it instead of starting half drawn. It sweeps a fraction of the way there, so it
  // takes the same time however far down the page opens, and a scroll during it moves where it is heading.
  // A main rail marked `from` a chip that is drawn to on load, as J1 is in About's narrow layout, holds the sweep back
  // until that chip connects.
  const now = performance.now();
  born ??= now;
  if (swept0 === null && runs.every(r => r.after || !r.from || live.has(r.from))) swept0 = now;
  const swept = still.matches ? 1 : swept0 === null ? 0 : clamp((now - swept0) / 1000 / SWEEP);
  const line = (1 - (1 - swept) ** 3) * (scrollY + READ * innerHeight);
  if (swept < 1) later();
  // a rail that ends too low for the reading line to reach at the foot of the page finishes at the foot
  const lowest = document.documentElement.scrollHeight - (1 - READ) * innerHeight - 1;
  reached = new Set();
  for (const r of runs) {
    if (r.after) continue;
    const y1 = Math.min(r.y1, lowest), y0 = Math.min(r.y0, y1 - 40);
    const t = still.matches ? 1 : clamp((line - y0) / (y1 - y0));
    paint(r, t);
    if (t >= 1) reached.add(r.key);
  }
  aim();
  for (const r of runs) {
    if (!r.after) continue;
    const g = grown.get(r.key) ?? 0;
    paint(r, g);
    light(r, g);
  }
  if (!ticking) { then = performance.now(); grow(); }
}

// The branches and nets: each heads for drawn while its chip is connected, and for gone while it is not. A chip is
// connected when the main rail or a branch has reached it, and from the start when no run leads into it, as U1 has
// none; the page counts as `load`.
function aim() {
  const on = live = new Set(['load', ...reached]);
  for (const r of runs) if (r.net && !runs.some(q => q.key === r.after)) on.add(r.after);
  for (const r of runs) if (r.after && !r.net && (grown.get(r.key) ?? 0) >= 1) on.add(r.key);
  for (const r of runs) if (r.after) r.goal = r.load || on.has(r.after) ? 1 : 0;
}

// One frame of the branches' and nets' growth; it carries on each frame until every one has reached its goal.
function grow() {
  const now = performance.now(), dt = (now - then) / 1000;
  then = now;
  ticking = 0;
  aim();
  let moving = false;
  for (const r of runs) {
    if (!r.after) continue;
    let g = grown.get(r.key) ?? 0;
    if (r.load) {
      // a run drawn on load: its share of its chain, on the chain's clock, which starts `wait` seconds after load
      const { dur, wait } = r.head, s = still.matches ? 1 : clamp(((now - born) / 1000 - wait) / dur);
      g = clamp(((1 - (1 - s) ** 3) * r.head.chain - r.lead) / r.len);
    } else {
      // a branch grows at a steady speed, and a net in a steady time, retracting as much faster as a branch does
      const up = r.net ? dt / NET : dt * GROW / r.len, down = up * RETRACT / GROW;
      g = still.matches ? r.goal : g < r.goal ? Math.min(r.goal, g + up) : Math.max(r.goal, g - down);
    }
    grown.set(r.key, g);
    paint(r, g);
    light(r, g);
    if (g !== r.goal) moving = true;
  }
  // a branch that has just arrived can set another off
  aim();
  if (runs.some(r => r.after && (grown.get(r.key) ?? 0) !== r.goal)) moving = true;
  if (moving) ticking = requestAnimationFrame(grow);
}

const later = () => { queued ||= requestAnimationFrame(update); };
// A board's drawing is new after every redraw, and the runs' places on the page move with it. A new drawing is
// fully drawn until update() has run, so it runs in the same turn as the redraw, before the browser can paint it:
// once, in a microtask, however many boards were redrawn together.
let fresh = false;
document.addEventListener('boarddrawn', () => {
  if (fresh) return;
  fresh = true;
  queueMicrotask(() => {
    fresh = false;
    cancelAnimationFrame(queued);
    queued = 0;
    collect();
    update();
  });
});
addEventListener('scroll', later, { passive: true });
addEventListener('resize', later);
still.addEventListener('change', later);
