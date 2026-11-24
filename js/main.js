// Every page's entry point. One entry per board, keyed by the id of its .board: the home page has about, projects
// and research, the blog's index has blog, a post has post, and the 404 page has notfound. Each page imports and
// mounts only the sections it has boards for; the head has already preloaded them, from the `boards` in the page's
// front matter (_includes/scripts.html), so importing them here costs no extra round trip.
import { mountBoard } from './board.js';
import './rails.js';
import './fades.js';

const sections = {
  about: () => import('./sections/about.js'),
  projects: () => import('./sections/projects.js'),
  research: () => import('./sections/research.js'),
  blog: () => import('./sections/blog.js'),
  post: () => import('./sections/post.js'),
  notfound: () => import('./sections/notfound.js'),
};

// The page's boards, in page order, each with its layouts, all imported before any is mounted, so that they are
// drawn in the same turn, as js/rails.js expects.
const boards = await Promise.all(Object.entries(sections)
  .map(([id, load]) => [document.getElementById(id), load])
  .filter(([board]) => board)
  .map(async ([board, load]) => [board, (await load()).default]));

// The modules have run, so the type will be shown as each board is drawn: cancel the head's fallback, which
// shows it anyway after three seconds (_includes/scripts.html).
clearTimeout(window.showAnyway);

for (const [board, layouts] of boards) mountBoard(board, layouts);

document.querySelector('.foot .year').textContent = new Date().getFullYear();
