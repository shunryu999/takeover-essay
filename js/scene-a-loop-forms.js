/* A loop forms.
 * Content for the loop-forms figure: a soup of A in which reactions branch
 * on every front until one branch closes back on A.
 *
 * The amounts are chosen to show the sequence. They are not computed.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('loop-forms');
  if (!figure || !window.LoopForms) return;

  var first = ['A>B', 'A>C'];
  var second = first.concat(['B>D', 'B>E', 'C>F', 'C>G']);
  var third = second.concat(['D>H', 'E>I', 'G>J']);
  var all = third.concat(['J>A']);

  new window.LoopForms(figure, {
    label: 'A pool of letters. Each letter is one unit of a substance, and arrows show one substance turning into another.',

    species: [
      { id: 'A', x: 135, y: 300 },
      { id: 'B', x: 245, y: 455 },
      { id: 'C', x: 262, y: 150 },
      { id: 'D', x: 112, y: 500 },
      { id: 'E', x: 400, y: 465 },
      { id: 'F', x: 360, y: 262 },
      { id: 'G', x: 440, y: 145 },
      { id: 'H', x: 212, y: 568 },
      { id: 'I', x: 535, y: 470 },
      { id: 'J', x: 528, y: 300 }
    ],

    reactions: [
      { from: 'A', to: 'B', bend: 10 },
      { from: 'A', to: 'C', bend: -16 },
      { from: 'B', to: 'D', bend: -8 },
      { from: 'B', to: 'E', bend: 10 },
      { from: 'C', to: 'F', bend: 8 },
      { from: 'C', to: 'G', bend: -14 },
      { from: 'D', to: 'H', bend: 8 },
      { from: 'E', to: 'I', bend: -8 },
      { from: 'G', to: 'J', bend: -16 },
      { from: 'J', to: 'A', bend: -62 }
    ],

    // Which branch closes is not special in advance. It is the one that happened to.
    loop: ['A', 'C', 'G', 'J'],

    states: [
      {
        counts: { A: 16 },
        on: [],
        caption: 'A soup with one plentiful ingredient, A.'
      },
      {
        counts: { A: 12, B: 2, C: 2 },
        on: first,
        caption: 'Left to itself, some A turns into B and some into C. Nothing directs it.'
      },
      {
        counts: { A: 8, B: 4, C: 4 },
        on: first,
        caption: 'B and C build up.'
      },
      {
        counts: { A: 7, B: 3, C: 3, D: 1, E: 1, F: 1, G: 1 },
        on: second,
        caption: 'With enough B and C about, they react in their turn: D and E from B, F and G from C.'
      },
      {
        counts: { A: 4, B: 2, C: 2, D: 1, E: 2, F: 2, G: 2, H: 1, I: 1, J: 1 },
        on: third,
        caption: 'The branching goes on at every tip at once. No step leads and none waits for another.'
      },
      {
        counts: { A: 5, B: 2, C: 2, D: 1, E: 2, F: 2, G: 2, H: 1, I: 1, J: 2 },
        on: all,
        closed: true,
        hold: 7200,
        caption: 'Then one product, J, turns out to make A. A chain has become a loop.'
      },
      {
        counts: { A: 12, B: 2, C: 8, D: 1, E: 1, F: 2, G: 7, H: 1, I: 1, J: 6 },
        on: all,
        closed: true,
        caption: 'The loop now feeds itself. Each lap draws on the soup and leaves more of its own members. The side branches are left behind.'
      }
    ]
  });
});
