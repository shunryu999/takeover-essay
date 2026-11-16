/* The rope (Part 1, scene 5).
 * After Cairns-Smith, Genetic Takeover (1982), pp. 5 and 105-106;
 * Seven Clues to the Origin of Life, pp. 61-62.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('the-rope');
  if (!figure || !window.RopeFigure) return;

  new window.RopeFigure(figure, {
    label: 'A rope drawn left to right, made of short overlapping fibres of two kinds.',

    // No fibre runs the whole length. At every point several overlap.
    fibres: [
      { from: 30, to: 205, kind: 1 },
      { from: 30, to: 270, kind: 1 },
      { from: 30, to: 150, kind: 1 },
      { from: 30, to: 330, kind: 1 },
      { from: 95, to: 385, kind: 1 },
      { from: 160, to: 440, kind: 1 },
      { from: 230, to: 480, kind: 1 },
      { from: 290, to: 520, kind: 1 },
      { from: 300, to: 500, kind: 2 },
      { from: 345, to: 610, kind: 2 },
      { from: 395, to: 610, kind: 2 },
      { from: 440, to: 610, kind: 2 },
      { from: 480, to: 610, kind: 2 },
      { from: 530, to: 610, kind: 2 }
    ],

    states: [
      {
        spread: 0.14, reveal: 190,
        caption: 'From far off, a line of descent looks like a single thread.'
      },
      {
        spread: 1, reveal: 190,
        caption: 'Closer, it is a rope of many fibres. Each is something handed down: a gene, or a part the genes make.'
      },
      {
        spread: 1, reveal: 295,
        caption: 'Follow it along. Fibres end and others begin. None runs the whole length, and still the rope holds.'
      },
      {
        spread: 1, reveal: 385,
        caption: 'Then fibres of another kind join in. The rope does not depend on what its fibres are made of.'
      },
      {
        spread: 1, reveal: 500,
        caption: 'More of the new kind begin as the old ones end.'
      },
      {
        spread: 1, reveal: 610,
        caption: 'By this end the rope is all new material. It never broke, and no one place marks the change.'
      },
      {
        spread: 0.14, reveal: 610,
        caption: 'From far off again it is one thread: one stuff at one end, another at the other.'
      }
    ]
  });
});
