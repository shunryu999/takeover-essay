# Takeover

Working draft of a visual essay on genetic takeover, after A. G. Cairns-Smith.

Nothing here is finished. Each page carries a `noindex` tag; remove it at launch.

## What is here

| File | What it is |
| --- | --- |
| `a-loop-forms.html` | "A loop forms": a loop emerging from a soup. Not yet placed in the scene order |
| `index.html` | Scene 10 of Part 1, "The circle closes": an existing loop taken over step by step |
| `js/figure-player.js` | Controls shared by every figure: play, step, start over, captions, `#step=N` |
| `js/loop-forms.js` | The loop-forms figure |
| `js/scene-a-loop-forms.js` | Its content: substances, reactions, the amounts in each state, captions |
| `js/closing-circle.js` | The closing-circle figure |
| `js/scene-10.js` | Its content: step labels, takeover order, captions |
| `css/essay.css` | Type, colour, and how each figure looks in each state |
| `fonts/` | STIX Two Text, self-hosted under the SIL Open Font License (`fonts/OFL.txt`) |

All text on both pages is placeholder draft copy.

## Run it

Open either HTML file in a browser. There is no build step and nothing to install.

Add `#step=N` to the address to open a figure at a given state, for example `a-loop-forms.html#step=5`.

## A loop forms

A pool of letters. Each letter is one unit of a substance, so more letters means more of it. Arrows show one substance turning into another.

| State | What has happened |
| --- | --- |
| 0 | A soup with one plentiful ingredient, A |
| 1 | Some A turns into B and some into C |
| 2 | B and C build up |
| 3 | With enough B and C, they react too: D and E from B, F and G from C |
| 4 | Three more tips at once: H, I and J |
| 5 | J turns out to make A. The chain A, C, G, J is now a loop, and a runner laps it |
| 6 | The loop members multiply. The side branches do not |

This figure is an illustration, not a simulation. The amounts in each state are written in `js/scene-a-loop-forms.js`; nothing is computed from reaction rates.

### Open question: where is this soup?

Cairns-Smith argued against a loop of this kind starting in an open primordial soup. His first organisms were crystal genes, and the varied chemistry came later, inside them. There are two ways to place this figure:

- As the general picture of how a loop closes, before any history is told.
- As what happens inside the first system, whose products are the soup from which the second system's loop forms (*Genetic Takeover*, pp. 122-124, 131).

The captions are written so that either reading works.

## The circle closes

A ring of eight stones. Each stone is one step in making an organism's parts. Supports from an outer frame hold each stone up.

| State | What has happened |
| --- | --- |
| 0 | The first system runs every step |
| 1 | One step is shared: a crude second way of doing it appears inside the first |
| 2 to 8 | One more step changes hands in each state. Its support stays up but goes idle |
| 9 | The last step changes hands. The circle is closed and a runner laps the loop |
| 10 | The supports fall away |

The closure meter under the figure counts the steps the second system runs.

## Reusing the figures

Neither figure knows anything about clay, genes or machines. A scene passes in its content as a config, so Part 2 can reuse both with different content. The options for each are listed at the top of `js/loop-forms.js` and `js/closing-circle.js`.

A figure element needs a `[data-fig-stage]` child. The caption and the three buttons are optional and are found by their `data-fig-*` attributes; see either HTML file. Load `js/figure-player.js` before the figure's own script.

## Colour

Two colours carry the argument, and Part 2 should reuse them unchanged.

- Mineral, `#cad5d6` with `#6f858c` lines: the first system, and anything not part of a loop
- Carbon, `#17212a`: the second system, and the loop
- Signal, `#f0b429`: used once per figure, for the runner when a loop closes

## Sources

- A. G. Cairns-Smith, *Genetic Takeover and the Mineral Origins of Life* (Cambridge University Press, 1982), pp. 122-124, 131, 410-411 and 414.
- S. A. Kauffman, "Autocatalytic sets of proteins", *Journal of Theoretical Biology* 119 (1986), 1-24.

The scene list and page references for the rest of Part 1 are in the outline doc, "Genetic Takeover: Part 1 outline".
