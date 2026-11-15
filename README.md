# Takeover

Working draft of a visual essay on genetic takeover, after A. G. Cairns-Smith.

Nothing here is published. The page carries a `noindex` tag; remove it at launch.

## What is here

| File | What it is |
| --- | --- |
| `index.html` | Scene 10 of Part 1, "The circle closes", with placeholder text |
| `js/closing-circle.js` | The animation. It knows nothing about clay or genes |
| `js/scene-10.js` | The content for scene 10: step labels, takeover order, captions |
| `css/essay.css` | Type, colour, and how the figure looks in each state |
| `fonts/` | STIX Two Text, self-hosted under the SIL Open Font License (`fonts/OFL.txt`) |

## Run it

Open `index.html` in a browser. There is no build step and nothing to install.

Add `#step=N` to the address to open the figure at a given state, for example `index.html#step=9`.

## What the figure shows

A ring of eight stones. Each stone is one step in making an organism's parts. Supports from an outer frame hold each stone up.

| State | What has happened |
| --- | --- |
| 0 | The first system runs every step |
| 1 | One step is shared: a crude second way of doing it appears inside the first |
| 2 to 8 | One more step changes hands in each state. Its support stays up but goes idle |
| 9 | The last step changes hands. The circle is closed and a runner laps the loop |
| 10 | The supports fall away |

The closure meter under the figure counts the steps the second system runs.

## Reusing the figure

The same piece is meant to serve Part 2 with different content. A scene supplies a config:

```js
new ClosingCircle(document.getElementById('some-figure'), {
  steps: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],   // labels, clockwise from the top
  order: [2, 5, 0, 7, 3, 1, 6, 4],                   // which step changes hands first, second...
  label: 'One line describing the figure for screen readers.',
  captions: {
    start: '...', foothold: '...', first: '...',
    another: '...',                  // used when no specific caption is given
    more: { 2: '...', 7: '...' },    // captions for particular counts
    closed: '...', dropped: '...'
  }
});
```

The figure element needs a `[data-cc-stage]` child. Caption, meter, readout and buttons are optional and are found by their `data-cc-*` attributes; see `index.html`.

## Colour

Two colours carry the argument, and Part 2 should reuse them unchanged.

- Mineral, `#cad5d6` with `#6f858c` lines: the first system
- Carbon, `#17212a`: the second system
- Signal, `#f0b429`: used once, for the runner when the circle closes

## Sources

A. G. Cairns-Smith, *Genetic Takeover and the Mineral Origins of Life* (Cambridge University Press, 1982), pp. 124, 410-411 and 414.

The scene list and page references for the rest of Part 1 are in the outline doc, "Genetic Takeover: Part 1 outline".
