// The rails, drawn as the page scrolls. A rail is every trace a layout marks with rail(to, …): the traces that leave
// one chip and run into chip `to`, on one board or across the seam into the next. Each is drawn out of its source as
// the reader scrolls down, so that its tip reaches `to` as `to` comes up to the reading line. The accent nets
// that leave `to`, marked `net: to`, are blue until then, and turn orange once it arrives.
// The drawn length is worked out from the scroll position alone, so a redraw never puts it out of step.
const READ = 0.7;                       // the reading line, as a fraction of the window's height down from its top
const still = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = t => Math.min(1, Math.max(0, t));
let rails = [], queued = 0;

// The page y of a point `at` along a path.
function pageY(p, at) {
  const pt = p.getPointAtLength(at), m = p.getScreenCTM();
  return m.b * pt.x + m.d * pt.y + m.f + scrollY;
}

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
    const first = legs[0].ps[0], last = legs.at(-1).ps[0];
    // the accent nets out of `to`, and what is coloured in them: a via's disc is inside its group
    const nets = [...document.querySelectorAll(`[data-net="${to}"]`)];
    const inks = nets.flatMap(el => [el, ...el.querySelectorAll('*')]);
    return { to, legs, nets, inks, done: null, len: legs.reduce((s, l) => s + l.len, 0), y0: pageY(first.p, 0), y1: pageY(last.p, last.len) };
  });
}

function update() {
  queued = 0;
  const line = scrollY + READ * innerHeight;
  // a rail that ends too low for the reading line to reach at the foot of the page finishes at the foot
  const lowest = document.documentElement.scrollHeight - (1 - READ) * innerHeight - 1;
  for (const r of rails) {
    const y1 = Math.min(r.y1, lowest), y0 = Math.min(r.y0, y1 - 40);
    const t = still.matches ? 1 : clamp((line - y0) / (y1 - y0));
    let along = t * r.len;
    for (const leg of r.legs) {
      const q = clamp(along / leg.len);
      along -= leg.len;
      for (const { p, len } of leg.ps) {
        p.style.strokeDashoffset = len * (1 - q);
        p.style.visibility = q > 0 ? '' : 'hidden';
      }
    }
    const done = t >= 1;
    if (done === r.done) continue;
    // A redraw's nets are new, and take their colour at once; after that they fade from one to the other.
    const first = r.done === null;
    if (first) r.inks.forEach(el => el.style.transition = 'none');
    r.nets.forEach(el => el.classList.toggle('off', !done));
    if (first) { void document.body.offsetHeight; r.inks.forEach(el => el.style.transition = ''); }
    r.done = done;
  }
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
