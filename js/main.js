// Every page's entry point. One entry per board, keyed by the id of its .board: the home page has about, projects
// and research, the blog's index has blog, and a post has post. Each page mounts the boards it has.
import { mountBoard } from './board.js';
import './rails.js';
import about from './sections/about.js';
import projects from './sections/projects.js';
import research from './sections/research.js';
import blog from './sections/blog.js';
import post from './sections/post.js';

const sections = { about, projects, research, blog, post };

for (const [id, layouts] of Object.entries(sections)) {
  const board = document.getElementById(id);
  if (board) mountBoard(board, layouts);
}

document.querySelector('.foot .year').textContent = new Date().getFullYear();
