# Circuitboard portfolio

A redesign of the portfolio at `~/Code/personal-website`, which it will replace. That repo is the source for content: `_includes/`, `_data/projects.yml`, `_data/articles.yml`, `_posts/`, `assets/`.

## The guiding principle

**The circuit creates the space for the content.** A section is not a rectangular card laid over a decorative background. The circuitry itself establishes where a section begins and ends, and the copy sits in the room the circuit leaves for it.

The circuit also has a job: text reads best in a narrow column, and a narrow column floating in empty space looks silly. The circuit balances the column. Too little circuitry and it cannot do that; too much and it competes with the text. A single line guiding the eye is a different idea, and too little.

## The look

The drawing is a flat top-down view of a physical board, with two cues borrowed from schematics:

- From the board: traces with weight that turn at 45°, chip footprints with pad rows, two-pad parts, vias at trace ends, silkscreen designators (`U1`, `R4`), and lamps that are lit and pulse slowly.
- From the schematic: semicircular bridges where one trace crosses another, and wire codes (`A0131`).

The palette is a dark blue ground, light blue traces and an orange accent; the tokens are in `:root` in `index.html`. Orange is for the one net that leads to the content, and for lit lamps. The mood board is https://ca.pinterest.com/arturojaviercastellanos/circuitboard-portfolio-mood-board/, and its US map is the main reference.

## How design questions get settled

When the user asks to settle a design question, build a **study**: a single page in `studies/` showing several options along one dimension, one after the other, with everything else held fixed so the choice is not biased by a font or a colour that happened to differ. The user picks, and the pick is built into `index.html`.

- Name studies `NN-question.html`. A study is self-contained and does not share code with `index.html`.
- Show only the part of the page the question is about. No header or navigation unless that is the question.
- Building the options from one set of switches makes a "mix your own" panel at the bottom nearly free, and lets the user test a combination that is not among the options.

`studies/01-board-vs-schematic.html` still holds the other idioms (plain blocks, schematic symbols, right-angle routing, via crossings) as working code.

## The code

`index.html` is the whole site, with no build step. It holds the About section only.

- **Units.** Geometry is in grid cells; one cell is one trace pitch (`P` units). A section's drawing is a `cols` × `rows` grid.
- **A section** is a `.board` element containing its `.copy`. `drawBoard()` draws the circuit into it as an SVG and seats the copy at the circuit's `text` cell rectangle. Without the script the copy is an ordinary column.
- **`bundle(centreline, n)`** returns `n` parallel traces that nest correctly round every corner. Write the centreline with right-angle turns; the 45° cuts are computed. `cut()` ends a trace early. `wire()` is a single trace; `hops` marks where it bridges.
- **The drawing has one fixed layout** and scales as a whole, copy included. There is no narrow-screen layout.

### Rules the drawing follows

- **Every wire ends on something:** a pad, a via or another trace. Nothing runs off the canvas or stops bare.
- **Do not close a frame round the copy.** Traces that wrap the text must not read as a border, which would be the card this design exists to avoid. Break the perimeter: a step in a bundle, traces that stop short at staggered lengths, a chip in the run. With right-angle turns a wrapping bundle reads as concentric rectangles; the 45° turns are part of what prevents that.
- **Bridges need room.** Bridge only where the crossed traces are at least two cells apart. At trace weight, bridges over a tight bundle merge into a wavy lump. A bridge is 7 units in radius, so a trace that bridges also needs more than half a cell clear on the side it rises toward (north over a horizontal run, east over a vertical one).

### Footguns

- **The circuit does not know how tall the copy is.** `text` gives the copy's left, top and width; everything below and beside it is placed by hand. Change the copy, its font or its size and the lower traces no longer sit where they should. Measure the copy's height in drawing units (its pixel height ÷ (SVG pixel width ÷ SVG viewBox width)) and move the traces. About's copy is 335 units tall, and the lower bundle's nearest trace is at row 44.
- **Line the drawing up with the type by measuring, not by arithmetic.** The accent trace ends level with the middle of the heading's capitals. Working that out from font size and line height put it below the baseline. To measure: a zero-size inline-block appended to the heading gives the baseline (its `bottom`), and canvas `measureText().actualBoundingBoxAscent` gives the cap height. Wait for `document.fonts.ready` first.
- **A bundle needs length between two corners.** Each corner's 45° cut is up to `6 + 0.586 × (n − 1) / 2 × P` units deep, and two corners share the segment between them. Give a 5-wide bundle at least 4 cells between turns and an 8-wide one at least 6. Shorter than that, the cuts are scaled down and the diagonals stop being parallel.
- **An even-width bundle's centreline sits on half cells** (`10.5`), so that its traces land on whole cells and meet the pads. The first trace returned is the leftmost in the direction of travel.
- **Parts and via holes are painted in the ground colour.** A resistor or lamp hides the trace under it with a `--bg` rectangle, and a via's hole is a `--bg` disc. Both break if the ground stops being one flat colour, and a part must sit on a straight run with nothing else passing under it.
- **Labels collide silently.** A label character is about half a cell wide, and nothing checks a label against traces, parts or the copy. After adding or moving one, zoom in on the render.
- **`--u` is defined on `.copy`, not `.board`.** It is built from a container-query unit, which resolves against an ancestor container, and `.board` is the container.
- **The lamp halo's blur is in CSS pixels,** so unlike everything else it does not scale with the drawing.

### Looking at the page

Render the page and look at it; a description of the code is not evidence. The user notices misalignment and uneven spacing, so measure before reporting.

- **The Chrome tools cannot open `file://` URLs.** Serve the directory and stop the server afterwards:
  `python3 -m http.server 8741 --bind 127.0.0.1` and `pkill -f "[h]ttp.server 8741"`. The brackets matter: without them `pkill -f` also matches the shell running it, and the rest of the command never runs.
- **A section is taller than the screenshot.** Set `document.body.style.zoom` to fit it for an overview, then use the zoom action on bridges, labels and trace ends, where the problems are. Take measurements at zoom 1.
- **Mood board images:** navigating a tab straight to an `i.pinimg.com` image hangs the screenshot tool, and `/originals/` URLs fail. Stay on the board page, read the pin image URLs from the DOM, swap `/236x/` for `/736x/`, and show the image in an element injected into that page.

## Facts and decoration

Codes, designators and part values are texture and can be invented. Names, places, jobs, dates, projects and links must come from `~/Code/personal-website` or from the user. The surname is hyphenated: Javier-Castellanos.

## Committing

Commit without being asked after a significant batch of work: a section built, a study finished, a pick built into `index.html`.

Do not commit small adjustments made so the user can see how something looks, such as a font size, a colour or a spacing nudge. When the wording is exploratory ("let's try…", "what if…"), or the request is a vague tweak of the kind someone makes before they have made up their mind, leave it uncommitted. It goes into the next significant commit, or gets committed when the user says they are happy with it. When unsure which case applies, leave it uncommitted and say so.

The repo has no remote and no gitleaks hook: do not push, and say the commit was not scanned.
