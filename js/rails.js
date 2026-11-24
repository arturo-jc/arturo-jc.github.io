// The rails, drawn as the page scrolls. A rail is every trace a layout marks with rail(to, …): the traces that leave
// one chip and run into chip `to`, on one board or across the seam into the next. The main rail, chip to chip down the
// page, is drawn out of its source as the reader scrolls down, so that its tip reaches `to` as `to` comes up to the
// reading line. The accent nets that leave `to`, marked `net: to`, are blue until then, and turn orange once it
// arrives. A branch, marked `after`, leaves a chip on the main rail and stops short: it does not follow the scroll,
// but grows by itself once the main rail reaches its chip, and draws back in, faster, if the reader scrolls back
// above it.
// The main rail's drawn length is worked out from the scroll position alone, and a branch's is kept by name, so a
// redraw never puts either out of step.
const READ = 0.7;                       // the reading line, as a fraction of the window's height down from its top
const GROW = 900;                       // a branch's growth, in drawing units a second
const RETRACT = 3600;                   // and how fast it draws back in, much faster
const still = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = t => Math.min(1, Math.max(0, t));
const grown = new Map();                // by name: how much of a branch is drawn, 0 to 1
let rails = [], queued = 0, ticking = 0, then = 0;

// The page position of a point `at` along a path.
function pageAt(p, at) {
  const pt = p.getPointAtLength(at), m = p.getScreenCTM();
  return [m.a * pt.x + m.c * pt.y + m.e, m.b * pt.x + m.d * pt.y + m.f + scrollY];
}
const pageY = (p, at) => pageAt(p, at)[1];

// Every rail on the page, as legs in page order, one per board it crosses, each leg its traces and their lengths.
function collect() {
  const by = new Map();
  for (const p of document.querySelectorAll('path[data-rail]')) {
    if (!by.has(p.dataset.rail)) by.set(p.dataset.rail, []);
    by.get(p.dataset.rail).push(p);
  }
  rails = [...by].map(([to, paths]) => {
    const legs = [...new Set(paths.map(p => p.ownerSVGElement))].map(svg => {
      const ps = paths.filter(p => p.ownerSVGElement === svg).map(p => ({ p, len: p.getTotalLength() }));
      for (const { p, len } of ps) p.style.strokeDasharray = `${len} ${len + 1}`;
      return { ps, len: Math.max(...ps.map(x => x.len)) };
    });
    const first = legs[0].ps[0], last = legs.at(-1).ps.reduce((a, b) => pageY(b.p, b.len) > pageY(a.p, a.len) ? b : a);
    // What waits at the end of a rail that stops short: its vias and their codes, each shown when the nearest
    // trace end is reached.
    const tips = legs.at(-1).ps.map(x => ({ x, at: pageAt(x.p, x.len) }));
    const ends = [...document.querySelectorAll(`[data-rail-end="${to}"]`)].map(el => {
      const b = el.getBoundingClientRect(), c = [b.left + b.width / 2, b.top + b.height / 2 + scrollY];
      const near = tips.reduce((a, t) => Math.hypot(t.at[0] - c[0], t.at[1] - c[1]) < Math.hypot(a.at[0] - c[0], a.at[1] - c[1]) ? t : a);
      return { el, x: near.x };
    });
    // the accent nets out of `to`, and what is coloured in them: a via's disc is inside its group
    const nets = [...document.querySelectorAll(`[data-net="${to}"]`)];
    const inks = nets.flatMap(el => [el, ...el.querySelectorAll('*')]);
    return { to, after: paths[0].dataset.after, legs, nets, inks, ends, done: null, goal: 0,
             len: legs.reduce((s, l) => s + l.len, 0), y0: pageY(first.p, 0), y1: pageY(last.p, last.len) };
  });
}

// Draw fraction `t` of a rail. Every trace is drawn at the same speed, so traces that stop short at staggered
// lengths finish one by one.
function paint(r, t) {
  let along = t * r.len;
  for (const leg of r.legs) {
    for (const x of leg.ps) {
      x.q = clamp(along / x.len);
      x.p.style.strokeDashoffset = x.len * (1 - x.q);
      x.p.style.visibility = x.q > 0 ? '' : 'hidden';
    }
    along -= leg.len;
  }
  r.ends.forEach(({ el, x }) => el.style.visibility = x.q >= 1 ? '' : 'hidden');
}

function update() {
  queued = 0;
  const line = scrollY + READ * innerHeight;
  // a rail that ends too low for the reading line to reach at the foot of the page finishes at the foot
  const lowest = document.documentElement.scrollHeight - (1 - READ) * innerHeight - 1;
  const arrived = new Set();
  for (const r of rails) {
    if (r.after) continue;
    const y1 = Math.min(r.y1, lowest), y0 = Math.min(r.y0, y1 - 40);
    const t = still.matches ? 1 : clamp((line - y0) / (y1 - y0));
    paint(r, t);
    const done = t >= 1;
    if (done) arrived.add(r.to);
    if (done === r.done) continue;
    // A redraw's nets are new, and take their colour at once; after that they fade from one to the other.
    const first = r.done === null;
    if (first) r.inks.forEach(el => el.style.transition = 'none');
    r.nets.forEach(el => el.classList.toggle('off', !done));
    if (first) { void document.body.offsetHeight; r.inks.forEach(el => el.style.transition = ''); }
    r.done = done;
  }
  // the branches: each heads for drawn while its chip is connected, and for gone while it is not
  for (const r of rails) {
    if (!r.after) continue;
    r.goal = arrived.has(r.after) ? 1 : 0;
    paint(r, grown.get(r.to) ?? 0);
  }
  if (!ticking) { then = performance.now(); grow(); }
}

// One frame of the branches' growth; it carries on each frame until every branch has reached its goal.
function grow() {
  const now = performance.now(), dt = (now - then) / 1000;
  then = now;
  ticking = 0;
  let moving = false;
  for (const r of rails) {
    if (!r.after) continue;
    let g = grown.get(r.to) ?? 0;
    g = still.matches ? r.goal : g < r.goal ? Math.min(r.goal, g + dt * GROW / r.len) : Math.max(r.goal, g - dt * RETRACT / r.len);
    grown.set(r.to, g);
    paint(r, g);
    if (g !== r.goal) moving = true;
  }
  if (moving) ticking = requestAnimationFrame(grow);
}

const later = () => { queued ||= requestAnimationFrame(update); };
// A board's drawing is new after every redraw, and the rails' places on the page move with it.
document.addEventListener('boarddrawn', () => {
  cancelAnimationFrame(queued);
  queued = requestAnimationFrame(() => { collect(); update(); });
});
addEventListener('scroll', later, { passive: true });
addEventListener('resize', later);
still.addEventListener('change', later);
