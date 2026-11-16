/* The takeover (Part 1, scene 9).
 * After Cairns-Smith, Genetic Takeover (1982), figure 4.1 and pp. 121-124;
 * Seven Clues to the Origin of Life, pp. 107-112.
 * His stages A to E are marked beside the states below.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('the-takeover');
  if (!figure || !window.TakeoverFigure) return;

  // The order in which corners of the box pass to the second genes.
  var order = [1, 10, 4, 2, 11, 5, 0, 6, 9, 3, 8, 7];
  function second(n) { return order.slice(0, n); }
  function rest(n) { return order.slice(n); }

  new window.TakeoverFigure(figure, {
    label: 'A gene at the centre of a rough twelve-cornered box, with arrows from the gene to the corners it shapes.',

    states: [
      { // A: naked genes
        size: 0,
        g1: { x: 0, y: 0, scale: 1.15, show: 1 },
        caption: 'A first gene with nothing around it. Whatever its own form does is all it has to survive by.'
      },
      { // B
        size: 78, first: [0, 3, 6, 9],
        g1: { x: 0, y: 0, scale: 1, show: 1 },
        caption: 'Lines of such genes that shape their surroundings do better. A box of useful things builds up around them.'
      },
      { // B, later
        size: 150, first: [0, 2, 3, 5, 6, 8, 9, 11], products: 1,
        g1: { x: 0, y: 0, scale: 1, show: 1 },
        g2: { x: 66, y: -78, scale: 0.75, show: 1, gene: false },
        caption: 'The box grows more elaborate. Among the things it makes are new materials, kept because they are useful.'
      },
      { // C
        size: 200, first: rest(1), second: second(1), products: 1,
        g1: { x: 0, y: 0, scale: 1, show: 1 },
        g2: { x: 66, y: -78, scale: 0.85, show: 1, gene: true },
        caption: 'One of those materials turns out to be copied directly, piece from piece. A second kind of gene has begun, inside the box of the first.'
      },
      { // C, later
        size: 200, first: rest(4), second: second(4), products: 1,
        g1: { x: -34, y: 22, scale: 1, show: 1 },
        g2: { x: 36, y: -40, scale: 1, show: 1, gene: true },
        caption: 'Both kinds now shape the same box. Each gains from what the other makes.'
      },
      { // D
        size: 200, shape: 0.5, first: rest(8), second: second(8), products: 1,
        g1: { x: -70, y: 58, scale: 0.8, show: 1 },
        g2: { x: 8, y: -8, scale: 1.15, show: 1, gene: true },
        caption: 'The newer kind does the work better. One part of the box after another comes under its control, and the box changes to suit.'
      },
      { // D, later
        size: 200, shape: 0.85, first: rest(11), second: second(11), products: 1,
        g1: { x: -104, y: 98, scale: 0.55, show: 1 },
        g2: { x: 0, y: 0, scale: 1.3, show: 1, gene: true },
        caption: 'The first genes are left with almost nothing to do.'
      },
      { // E
        size: 200, shape: 1, first: [], second: second(12), products: 1,
        g1: { show: 0 },
        g2: { x: 0, y: 0, scale: 1.3, show: 1, gene: true },
        caption: 'Then they are gone. The box is run entirely by genes that could never have started without it.'
      }
    ]
  });
});
