// The page's entry point. One entry per section, keyed by the id of its .board in index.html.
import { mountBoard } from './board.js';
import about from './sections/about.js';

const sections = { about };

for (const [id, layouts] of Object.entries(sections)) mountBoard(document.getElementById(id), layouts);
