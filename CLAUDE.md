# Circuitboard portfolio

A redesign of the portfolio at `~/Code/personal-website`, which it will replace. That repo is the source for content: `_includes/`, `_data/projects.yml`, `_data/articles.yml`, `_posts/`, `assets/`.

## The guiding principle

**The circuit creates the space for the content.** A section is not a rectangular card laid over a decorative background. The circuitry itself establishes where a section begins and ends, and the copy sits in the room the circuit leaves for it.

The circuit also has a job: text reads best in a narrow column, and a narrow column floating in empty space looks silly. The circuit balances the column. Too little circuitry and it cannot do that; too much and it competes with the text. A single line guiding the eye is a different idea, and too little.

## The look

The drawing is a flat top-down view of a physical board, with two cues borrowed from schematics:

- From the board: traces with weight that turn at 45°, chip footprints with pad rows, two-pad parts, vias at trace ends, silkscreen designators (`U1`, `R4`), and lamps that are lit and pulse slowly.
- From the schematic: semicircular bridges where one trace crosses another, and wire codes (`A0131`).

The palette is a dark blue ground, light blue traces and an orange accent; the tokens are in `:root` in `styles.css`. Orange is for the one net that leads to the content, and for lit lamps. The mood board is https://ca.pinterest.com/arturojaviercastellanos/circuitboard-portfolio-mood-board/, and its US map is the main reference.

## Narrow screens

Every section has two drawings: a wide one, and a narrow one for phones. Draw both when building a section, without being asked. The narrow one is a first proposal: render it at 390px and show it.

On a phone the copy fills the screen, so there is no floating column for the circuit to balance. What is left of its job is to mark where the section begins and ends and to keep the copy company, and the amount of circuit shrinks to match. The user's preference is for a narrow drawing that is **light, and still runs alongside the copy**: a few traces down one side of it, rather than bands of circuit stacked above and below a full-width column, and rather than a heavier drawing of either kind.

### What every narrow layout keeps

- **The scale.** 32 cells wide, at the same pitch, trace weight and type sizes as the wide layout, so that at 390px one unit is about one pixel and body text about 16.8px. It is never the wide drawing shrunk.
- **Room for the copy.** The copy keeps at least 24 of the 32 cells. Circuit beside it goes on one side only, three traces at most.
- **A short top.** 12 to 14 rows above the heading, so the heading and the first lines of copy are on the first screen.
- **The same circuit, pared down.** It is a reduction of the section's wide drawing, not a new one: the main chip, the accent net, and the same designators and codes. Most of the bundles and the outlying chips go.
- **The accent net** still ends on a via beside the heading, level with the middle of its capitals.
- **A beginning and an end.** Something sits above the heading and something past the last line.
- **The rules the drawing follows,** unchanged. A top band, a rail and a tail make three sides of a frame; staggered stops and an open fourth side keep it from reading as one.

### What changes from one section to the next

Sections stack on a phone, so one layout repeated down the page reads as a template. About's narrow layout is an example, not the pattern: J1 and U1 above, three traces down the left of the name and the copy that turn under the copy and stop at staggered lengths, the accent net coming down out of U1 and in from the right along the name's first line. The choices that are free:

- **The rail's side:** left or right.
- **Where the rail starts and ends:** from a connector or from a chip; ending by turning under the copy, by stopping short at staggered heights, or by running into a small part.
- **What sits above the heading:** a connector, a bundle and a chip; a chip alone; a chip with a serpentine.
- **Where the accent net comes in from:** along the heading's row from the right or the left, or down from above.
- **What closes the section:** a staggered tail, lamps, a small chip.

Before drawing a narrow layout, look at the narrow layouts of the sections directly above and below it, and differ from each on at least two of these, starting with the rail's side. Keep the variation modest: enough to break the monotony, within the rules above, not a new idiom per section.

**Decorative parts are optional.** Lamps, a serpentine or a bridge go in where the routing leads to them naturally. Do not bend a layout to fit one in; a narrow layout with no lamps is fine.

These rules come from About, which is the name and two paragraphs. A section whose content is a list, such as projects or articles, may need something they do not cover. Propose it rather than forcing the list into About's shape.

## How design questions get settled

When the user asks to settle a design question, build a **study**: a single page in `studies/` showing several options along one dimension, one after the other, with everything else held fixed so the choice is not biased by a font or a colour that happened to differ. The user picks, and the pick is built into the site.

- Name studies `NN-question.html`. A study is self-contained: one file, with its own copy of whatever it needs from `styles.css` and `js/`, and nothing imported from them.
- Show only the part of the page the question is about. No header or navigation unless that is the question.
- Building the options from one set of switches makes a "mix your own" panel at the bottom nearly free, and lets the user test a combination that is not among the options.

Studies double as a parts bin of working code:

- `studies/01-board-vs-schematic.html` holds the other idioms: plain blocks, schematic symbols, right-angle routing, via crossings.
- `studies/02-mobile-about.html` holds narrow-layout pieces that About does not use: a heavier top with a serpentine and outputs, a lamp cluster as a foot, a trace that turns down and bridges the lamp lines, and a full-width copy with no rail.
- `studies/03-name-and-about.html` holds the two wide layouts for the name and About that the site does not use, both with the name on three lines: Riser, where a bus climbs between the name and the copy, crosses over the copy into a chip and comes back down its right and under it; and Cradle, where the chip sits under the gap with lamps hanging below it and only the accent net between the two blocks. It also holds a copy whose top is found by levelling its first baseline with the name's.

## The code

The site is static files with no build step. It holds one section, About, which opens the page: the name, which is the page's `h1`, and the About copy.

| File | What is in it |
|---|---|
| `index.html` | The markup: each section's `.board` and its `.copy`, in page order. About's board also holds the `.name`. |
| `styles.css` | All the styles: the tokens, the page frame, the name's and the copy's type, the drawing's classes. |
| `js/kit.js` | What a layout is written with (`bundle`, `cut`, `wire`), and how a trace, chip, part or via becomes SVG. It does not touch the page. |
| `js/board.js` | `mountBoard()`: seats and measures the type, draws the layout, and redraws when the width changes. |
| `js/sections/<id>.js` | One section's two layouts, exported as `{ wide, narrow }`. |
| `js/main.js` | The list of sections. It mounts each one on the `.board` with its id. |

### Adding a section

1. In `index.html`, add a `<section class="board" id="projects">` holding a `<div class="copy">` with the content. The copy needs an `h2`, which `measure()` measures.
2. Create `js/sections/projects.js`. It imports what it needs from `../kit.js` and ends with `export default { wide, narrow }`. `js/sections/about.js` is the model.
3. In `js/main.js`, import it and add it to `sections`, under the section's id.
4. Add to `styles.css` only what the content needs that `.copy` does not style yet. A new kind of part goes in `js/kit.js`, beside `chip()` and `part()`.

### How a section is drawn

- **Units.** Geometry is in grid cells; one cell is one trace pitch (`P` units). A section's drawing is a `cols` × `rows` grid.
- **A section** is a `.board` element containing its `.copy`, mounted with `mountBoard(board, { wide, narrow })`. Without the scripts the copy is an ordinary column.
- **About's heading is the name,** an `h1.name` beside the copy rather than an `h2` inside it, so that a layout can seat the two apart. Each of its three words is a span. `styles.css` sets it on two lines on a wide screen (Arturo / Javier-Castellanos) and on three on a narrow one, in the same media query that picks the layout.
- **A layout** is `{ cols, text, build(m) }`, with a `name` as well in About. `text` is the cell where the copy's top left sits and the copy's width; in place of `y` it can give `under`, a number of rows below the name. `name` is the cell where the name's top left sits and its `size` in units. `drawBoard()` seats the type, measures it, and passes the measurements to `build(m)`, which returns the circuit and its `rows`. `m` is in cells from the board's top left: `m.top` is the copy's top and `m.h` its height, `m.cap` the row of the middle of the capitals of the heading's first line, `m.hx` the column where that line's last letter ends.
- **About's layouts are built from `m`:** everything beside and below the copy hangs off `m.top` and `m.h`, and the accent net's row is `m.cap`. Build new layouts this way. In the wide layout U1 is placed from `m.cap` too, so that the accent net leaves its pad in a straight line; U1, and U2 and the bus that hang off it, therefore sit on fractional rows.
- **`bundle(centreline, n)`** returns `n` parallel traces that nest correctly round every corner. Write the centreline with right-angle turns; the 45° cuts are computed. `cut()` ends a trace early. `wire()` is a single trace; `hops` marks where it bridges. A third argument, `{ cornerIndex: units }`, sets the size of a corner's cut and makes a long 45° run; two corners whose cuts add up to the length of the segment between them make one straight diagonal. To split a bus, build two bundles of the full width whose centrelines share their first corners and `slice()` a different half from each. About's wide diagonal is one such half, `slice(3)` of a six-wide bundle.
- **Each layout is fixed** and scales as a whole, copy included. The narrow one is drawn below 1100px, grows with the screen up to 448px wide, and is centred beyond that, so a tablet gets the phone drawing with margins.
- **The breakpoint is written twice** and the two must match: the `max-width: 1099px` media query in `styles.css`, which also sets the name's line breaks, and `NARROW` in `js/board.js`.
- **`mountBoard()` redraws** when the board's width changes, when the page crosses the breakpoint and when the fonts arrive, because the copy wraps differently at another width or in another face. `build(m)` therefore runs many times: build fresh wires in it, or build them once outside it and never `cut()` them inside.

### Rules the drawing follows

- **Every wire ends on something:** a pad, a via or another trace. Nothing runs off the canvas or stops bare.
- **Do not close a frame round the copy.** Traces that wrap the text must not read as a border, which would be the card this design exists to avoid. Break the perimeter: a step in a bundle, traces that stop short at staggered lengths, a chip in the run. With right-angle turns a wrapping bundle reads as concentric rectangles; the 45° turns are part of what prevents that.
- **Bridges need room.** Bridge only where the crossed traces are at least two cells apart. At trace weight, bridges over a tight bundle merge into a wavy lump. A bridge is 7 units in radius, so a trace that bridges also needs more than half a cell clear on the side it rises toward (north over a horizontal run, east over a vertical one).

### Footguns

- **About's wide layout does not know how wide the name is or where U1 ends.** The diagonal leaves U1's three lowest left pads about 6 cells past the end of the name's second line and passes about 6 from the copy's top left corner, and the copy's top is a fixed row, about 3 below U1's pads. The rail on the copy's right is at a fixed column, `Xr`, about 4 cells past its longest line, with its outer trace in line with J1's last pin, and takes U1's three lowest right-hand pads, so J1's bus is five wide. Its run under the copy is set from `m.top + m.h` so that it sits as far below the last line as its top run sits above the copy. Change the name's size or position and check all three; `X`, `yc`, `Yd` and `shoulder` in `about.js` move the diagonal; `shoulder` plus the lower corner's cut must equal `(Yd - yc) × P`.
- **Do not simplify how `drawBoard()` swaps the drawing.** It leaves the old `svg` in until the new one is built, because without it the page is shorter, a scrollbar can go, and the type is then measured at a width it is not shown at. Across the breakpoint it does the opposite and removes the old one first, because the other layout's drawing stretched to the new width can make the page tall enough to gain a scrollbar and fall back across the breakpoint.
- **Line the drawing up with the type by measuring, not by arithmetic.** The accent trace ends level with the middle of the heading's capitals, and working that out from font size and line height puts it in the wrong place. `measure()` does the measuring and returns it as `m.cap`: a zero-size inline-block at the start of the heading's first line gives the baseline, and canvas `measureText('H').actualBoundingBoxAscent` gives the cap height. It measures the cap height at 1000px and scales it down, because at text size the canvas reports whole pixels. A measurement taken before the fonts arrive is of the fallback face.
- **A bundle needs length between two corners.** Each corner's 45° cut is up to `6 + 0.586 × (n − 1) / 2 × P` units deep, and two corners share the segment between them. Give a 5-wide bundle at least 4 cells between turns and an 8-wide one at least 6. Shorter than that, the cuts are scaled down and the diagonals stop being parallel.
- **An even-width bundle's centreline sits on half cells** (`10.5`), so that its traces land on whole cells and meet the pads. The first trace returned is the leftmost in the direction of travel.
- **Parts and via holes are painted in the ground colour.** A resistor or lamp hides the trace under it with a `--bg` rectangle, and a via's hole is a `--bg` disc. Both break if the ground stops being one flat colour, and a part must sit on a straight run with nothing else passing under it.
- **Near the copy's edge, align exactly or miss by a clear cell.** On the narrow grid most things sit close to the copy's left or right edge, and a 2px miss reads as a mistake. A chip's body is drawn 3 units inside its box and a connector's outline exactly on it, so a chip whose body should line up with copy at cell 2 has `x0: 1.75`.
- **Labels collide silently.** A label character is about half a cell wide, and nothing checks a label against traces, parts or the copy. After adding or moving one, zoom in on the render.
- **`--u` is defined on `.name` and `.copy`, not `.board`.** It is built from a container-query unit, which resolves against an ancestor container, and `.board` is the container.
- **The lamp halo's blur is in CSS pixels,** so unlike everything else it does not scale with the drawing.

### Looking at the page

Render the page and look at it; a description of the code is not evidence. The user notices misalignment and uneven spacing, so measure before reporting.

- **The page has to be served.** The scripts are ES modules, which do not load from `file://`: opened that way, the page shows the copy and no drawing. The Chrome tools cannot open `file://` URLs either. Serve the directory and stop the server afterwards:
  `python3 -m http.server 8741 --bind 127.0.0.1` and `pkill -f "[h]ttp.server 8741"`. The brackets matter: without them `pkill -f` also matches the shell running it, and the rest of the command never runs.
- **A section is taller than the screenshot.** Set `document.body.style.zoom` to fit it for an overview, then use the zoom action on bridges, labels and trace ends, where the problems are. Take measurements at zoom 1.
- **Look at the narrow layout in iframes,** several widths side by side. On the served page, hide `main` and inject same-origin iframes of the page at 320, 390, 430 and 768px wide; media queries inside an iframe follow the iframe's width, and its `contentDocument` can be measured from outside. Give each iframe `box-sizing: content-box` and more height than the page, or its border and a scrollbar come out of the width. Check at each width that there is no horizontal scroll, that the accent via is level with the heading's cap middle, and that the gap under the copy's last line is the same. Then change one iframe's width across 1100px in both directions and check the drawing swaps.
- **Mood board images:** navigating a tab straight to an `i.pinimg.com` image hangs the screenshot tool, and `/originals/` URLs fail. Stay on the board page, read the pin image URLs from the DOM, swap `/236x/` for `/736x/`, and show the image in an element injected into that page.

## Facts and decoration

Codes, designators and part values are texture and can be invented. Names, places, jobs, dates, projects and links must come from `~/Code/personal-website` or from the user. The surname is hyphenated: Javier-Castellanos.

## Committing

Commit without being asked after a significant batch of work: a section built, a study finished, a pick built into the site.

Do not commit small adjustments made so the user can see how something looks, such as a font size, a colour or a spacing nudge. When the wording is exploratory ("let's try…", "what if…"), or the request is a vague tweak of the kind someone makes before they have made up their mind, leave it uncommitted. It goes into the next significant commit, or gets committed when the user says they are happy with it. When unsure which case applies, leave it uncommitted and say so.

The repo has no remote and no gitleaks hook: do not push, and say the commit was not scanned.
