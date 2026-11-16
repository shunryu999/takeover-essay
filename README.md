# Takeover

Working draft of a visual essay on genetic takeover, after A. G. Cairns-Smith.

Nothing here is finished. Each page carries a `noindex` tag; remove it at launch. All text on every page is placeholder draft copy.

## Pages

| Page | Scene | What the figure shows |
| --- | --- | --- |
| `index.html` | | Contents: the figures drafted so far, in essay order |
| `the-arch.html` | Part 1, scenes 2 and 4 | A heap built stone by stone, stones taken away to leave an arch, then a second arch built over the first |
| `the-rope.html` | Part 1, scene 5 | A rope of overlapping fibres that changes material along its length without breaking |
| `the-takeover.html` | Part 1, scene 9 | Cairns-Smith's scheme: a second gene begins inside the box of the first and ends up running it |
| `the-circle-closes.html` | Part 1, scene 10 | An existing loop taken over step by step until the new system makes all its own parts |
| `a-loop-forms.html` | Not yet placed | A self-feeding loop arising in a mixture. Parked until the autocatalysis reading is done |

## Run it

Open any HTML file in a browser. There is no build step and nothing to install.

Add `#step=N` to the address to open a figure at a given state, for example `the-takeover.html#step=4`.

## Code

| File | What it is |
| --- | --- |
| `js/figure-player.js` | Shared by every figure: play, step, start over, captions, `#step=N`, and a few drawing helpers |
| `js/arch.js`, `js/rope.js`, `js/takeover.js`, `js/closing-circle.js`, `js/loop-forms.js` | One file per figure. The options each accepts are listed at the top of the file |
| `js/scene-*.js` | One file per page: the content for that figure (states, labels, captions) |
| `css/essay.css` | Type, colour, and how each figure looks in each state |
| `fonts/` | STIX Two Text, self-hosted under the SIL Open Font License (`fonts/OFL.txt`) |

No figure knows anything about clay, genes or machines. A scene passes in its content, so Part 2 can reuse the same figures with different content.

A figure element needs a `[data-fig-stage]` child. The caption and the three buttons are optional and are found by their `data-fig-*` attributes. Load `js/figure-player.js` before the figure's own script.

## The figures, state by state

### The arch

| State | What has happened |
| --- | --- |
| 0 | The arch to be built, in outline |
| 1 | Built from the feet up, the third stone on each side falls |
| 2 | A heap instead: every stone rests on something |
| 3 | A last layer is laid over the heap and meets at the top |
| 4 | Those outer stones now hold each other |
| 5 | The heap is taken away. The arch stands |
| 6 | Pull one stone and the rest come down: no way back |
| 7 | More stones piled over and around the arch |
| 8 | A new outer layer meets and holds |
| 9 | Everything beneath is removed, the first arch included |

### The rope

| State | What has happened |
| --- | --- |
| 0 | From far off: a single thread |
| 1 | Closer: many overlapping fibres |
| 2 | Followed along: fibres end and begin, none runs the whole length |
| 3 | Fibres of a second kind join in |
| 4 | More of the new kind begin as the old end |
| 5 | The far end is all new material |
| 6 | From far off again: one thread, two materials |

### The takeover

Cairns-Smith's stages A to E are noted in `js/scene-the-takeover.js`.

| State | His stage | What has happened |
| --- | --- | --- |
| 0 | A | A first gene with nothing around it |
| 1 to 2 | B | A box of useful things builds up, and makes new materials |
| 3 to 4 | C | One material is copied directly: a second gene, inside the first gene's box. Both shape it |
| 5 to 6 | D | Corner by corner the box passes to the second genes and changes to suit them |
| 7 | E | The first genes are gone |

### The circle closes

A ring of eight stones, each one step in making an organism's parts, held up by supports from an outer frame.

| State | What has happened |
| --- | --- |
| 0 | The first system runs every step |
| 1 | One step is shared: a crude second way of doing it appears inside the first |
| 2 to 8 | One more step changes hands in each state. Its support stays up but goes idle |
| 9 | The last step changes hands. The circle is closed and a runner laps the loop |
| 10 | The supports fall away |

### A loop forms

A pool of letters, where more letters means more of a substance. A makes B and C; they build up and make D to G; branching continues; J turns out to make A, and the chain A, C, G, J becomes a loop whose members multiply.

This one is an illustration, not a simulation: the amounts are written in `js/scene-a-loop-forms.js`. It also sits outside Cairns-Smith's account. He treats a loop that merely reproduces as unable to evolve, because a changed version is not copied (*Genetic Takeover*, pp. 71-74). How it relates to the rest is still to be worked out.

## Colour

Two colours carry the argument, and Part 2 should reuse them unchanged.

- Mineral, `#cad5d6` with `#6f858c` lines: the first system, and anything held up by something else
- Carbon, `#17212a`: the second system, and anything that holds itself up
- Signal, `#f0b429`: used once per figure at most, for the runner when a loop closes

## Sources

- A. G. Cairns-Smith, *Genetic Takeover and the Mineral Origins of Life* (Cambridge University Press, 1982): pp. 5, 71-74, 95-99 (figures 3.3 and 3.4), 105-106, 120-124 (figure 4.1), 410-411, 414.
- A. G. Cairns-Smith, *Seven Clues to the Origin of Life* (Cambridge University Press, 1985): pp. 59-62, 107-112.
- S. A. Kauffman, "Autocatalytic sets of proteins", *Journal of Theoretical Biology* 119 (1986), 1-24.

The figures are redrawn, not reproduced. The scene list and page references for the rest of Part 1 are in the outline doc, "Genetic Takeover: Part 1 outline".

## Replicator figures (not yet placed)

Three figures drawn from Freitas and Merkle, *Kinematic Self-Replicating Machines* (2004). They sit between Part 1 and the machine part of the essay.

| Page | Code | What it shows | Source sections |
| --- | --- | --- | --- |
| `the-race.html` | `js/race.js`, `js/scene-the-race.js` | Five lineages on one clock, differing in copy time, copies per round, lifespan and accuracy; a bar shows each one's share of the true copies | 5.1.1, 5.1.9 (J1, J2, L4), 5.9.1 |
| `the-edge.html` | `js/spread.js`, `js/scene-the-edge.js` | Copiers filling a surface of fixed size: multiplying, then growing only at the edge, then full | 5.9.3 |
| `three-closures.html` | `js/closure.js`, `js/scene-three-closures.js` | Parts, power and instructions supplied from outside or by the machine itself; an open line that is cut stops copying | 5.6, 5.1.9 (A1, E4, J5) |

The race and the edge are worked out from their settings when the page loads (`seed` fixes the random choices), so changing a lineage's numbers or the size of the surface changes the figure. Captions that quote counts must be checked after any such change.
