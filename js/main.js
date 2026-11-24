// Every page's entry point. One entry per board, keyed by the id of its .board: the home page has about, projects
// and research, the blog's index has blog, a post has post, and the 404 page has notfound. Each page mounts the boards it has.
import { mountBoard } from './board.js';
import './rails.js';
import './fades.js';
import about from './sections/about.js';
import projects from './sections/projects.js';
import research from './sections/research.js';
import blog from './sections/blog.js';
import post from './sections/post.js';
import notfound from './sections/notfound.js';

const sections = { about, projects, research, blog, post, notfound };

// The modules have run, so the type will be shown as each board is drawn: cancel the head's fallback, which
// shows it anyway after three seconds (_includes/scripts.html).
clearTimeout(window.showAnyway);

for (const [id, layouts] of Object.entries(sections)) {
  const board = document.getElementById(id);
  if (board) mountBoard(board, layouts);
}

document.querySelector('.foot .year').textContent = new Date().getFullYear();
