// Every page's entry point. It mounts each .board on the page with its section's layouts, from
// js/sections/<id>.js: the home page has about, projects and research, the blog's index has blog, a post has post,
// and the 404 page has notfound. The head has already preloaded those sections, from the `boards` in the page's
// front matter (_includes/scripts.html), so importing them here costs no extra round trip.
import { mountBoard } from './board.js';
import './rails.js';
import './fades.js';

// The page's boards, in page order, each with its layouts, all imported before any is mounted, so that they are
// drawn in the same turn, as js/rails.js expects.
const boards = await Promise.all([...document.querySelectorAll('.board')]
  .map(async board => [board, (await import(`./sections/${board.id}.js`)).default]));

// The modules have run, so the type will be shown as each board is drawn: cancel the head's fallback, which
// shows it anyway after three seconds (_includes/scripts.html).
clearTimeout(window.showAnyway);

for (const [board, layouts] of boards) mountBoard(board, layouts);

document.querySelector('.foot .year').textContent = new Date().getFullYear();
