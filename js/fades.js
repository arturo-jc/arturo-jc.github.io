// The type fades in: About's copy and its link to the blog as the page loads, and every block below About as it
// comes up the window. The name does not fade. A block that fades has a data-fade, `load` for About's; it is
// hidden by styles.css only while <html> has the class `fades`, which the home page's head sets before the first paint
// (_includes/scripts.html), so a page without the scripts, or with reduced motion, shows everything, and one
// whose modules fail to load shows it after three seconds.
const AT = 0.85;                        // a block fades in once its top is this far down the window

const blocks = document.querySelectorAll('[data-fade]');
const seen = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); }
}, { rootMargin: `0px 0px ${-100 * (1 - AT)}% 0px` });

for (const el of blocks) {
  if (el.dataset.fade === 'load') requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  else seen.observe(el);
}
