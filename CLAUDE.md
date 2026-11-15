# Circuitboard portfolio

A redesign of the portfolio at `~/Code/personal-website`, which it will replace.

## The guiding principle

**The circuit creates the space for the content.** A section is not a rectangular card laid over a decorative background. The circuitry itself establishes where a section begins and ends, and the copy sits in the room the circuit leaves for it.

The circuit also has a job: text reads best in a narrow column, and a narrow column floating in empty space looks silly. The circuit balances the column. Too little circuitry and it cannot do that; too much and it competes with the text. One line guiding the eye (as on kashifnazir.com) is a different idea and is too little.

## This is a blank slate

`~/Code/evangelion-portfolio` was an earlier attempt under a different principle ("looks like something out of Evangelion"). **The only thing carried over from it is the idea above.** Do not port its code, layout, fonts, palette or conventions, and do not treat anything else about it as a precedent.

`~/Code/personal-website` is the source for content only: `_includes/`, `_data/projects.yml`, `_data/articles.yml`, `_posts/`, `assets/`.

## How design questions get settled

Open questions are settled one at a time with a **study**: a single page in `studies/` showing several options along one dimension, one after the other, with everything else held fixed so the choice is not biased by a font or a colour that happened to differ. The user picks; the pick is recorded below and built into `index.html`.

- Name studies `NN-question.html`. A study is self-contained and does not share code with `index.html`.
- Show only the part of the page the question is about. No header or navigation unless that is the question.
- Do not settle an open question by quietly building it into `index.html`. If the work needs an answer, say which question it is.

## Decided

**Idiom: a board, annotated** (`studies/01-board-vs-schematic.html`, option 2). The drawing is a flat top-down view of a physical board, with two cues borrowed from schematics:

- From the board: traces with weight that turn at 45°, chip footprints with pad rows, two-pad parts, vias at trace ends, silkscreen designators (`U1`, `R4`), and lamps that are lit and pulse slowly.
- From the schematic: semicircular bridges where one trace crosses another, and wire codes (`A0131`).

**Palette:** a dark blue ground, light blue traces, an orange accent. The mood board is https://ca.pinterest.com/arturojaviercastellanos/circuitboard-portfolio-mood-board/ and its US map is the main colour reference. Orange is for the one net that leads to the content, and for lit lamps.

## Open

- **Amount of detail:** how far toward skeuomorphism, or toward abstraction, the board goes. The current drawing is flat and not skeuomorphic; that is a placeholder, not a decision.
- **Density:** how much circuitry surrounds a section. The current amount is one middling guess.
- **Fonts:** IBM Plex Sans and Mono are placeholders.
- **The rest of the palette:** the off-white text and the pale blue of pads and labels were assumed, not chosen.
- **Narrow screens:** the drawing has one fixed layout and scales as a whole, copy included. Nothing has been designed for a phone.
- Everything not listed under Decided: page layout, header, the other sections, stack, deployment.

## The code

`index.html` is the whole site: no build step, open the file. It holds the About section only.

- **Units.** Geometry is in grid cells; one cell is one trace pitch (`P` units). A section's drawing is a `cols` × `rows` grid.
- **A section** is a `.board` element containing its `.copy`. `drawBoard()` draws the circuit into it as an SVG and seats the copy at the circuit's `text` cell rectangle. The copy is real HTML sized in `--u` (one drawing unit), so it scales with the drawing. Without the script the copy is an ordinary column.
- **`bundle(centreline, n)`** returns `n` parallel traces that nest correctly round every corner. Write the centreline with right-angle turns; the 45° cuts are computed. `cut()` ends a trace early. `wire()` is a single trace; `hops` marks where it bridges.

Rules the drawing follows:

- **Every wire ends on something:** a pad, a via or another trace. Nothing runs off the canvas or stops bare.
- **Do not close a frame round the copy.** Traces that wrap the text must not read as a border, which would be the card this design exists to avoid. Break the perimeter: a step in a bundle, traces that stop short at staggered lengths, a chip in the run. Right-angle turns make a wrapping bundle read as concentric rectangles; the 45° turns are part of what prevents that.
- **Bridges need room.** Bridge only where the crossed traces are at least two cells apart. At trace weight, bridges over a tight bundle merge into a wavy lump.
- **Line the drawing up with the type by measuring.** The accent trace ends level with the middle of the heading's capitals; if the heading's size or font changes, measure and move it.

## Judging the work

Render the page and look at it; a description of the code is not evidence. Zoom into bridges, labels and trace ends, where collisions hide. The user notices misalignment and uneven spacing, so measure before reporting.

## Facts and decoration

Codes, designators and part values are texture and can be invented. Names, places, jobs, dates, projects and links must come from `~/Code/personal-website` or from the user. The surname is hyphenated: Javier-Castellanos.

## Committing

The repo has no remote and no gitleaks hook. Commit when a task is finished, do not push, and say the commit was not scanned.
