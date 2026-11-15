/* Scene 10: the circle closes.
 * Content for the closing-circle figure in Part 1 (genetic takeover).
 * After Cairns-Smith, Genetic Takeover (1982), pp. 124, 410-411, 414.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('closing-circle');
  if (!figure || !window.ClosingCircle) return;

  new window.ClosingCircle(figure, {
    steps: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],

    // No step is taken over because of its place in the ring. The order is
    // whatever happened to pay off first.
    order: [2, 5, 0, 7, 3, 1, 6, 4],

    label: 'A ring of eight stones, each one a step in making an organism’s parts, held up from outside by supports.',

    captions: {
      start: 'Each stone is one step in making an organism’s parts. The first system runs all eight.',
      foothold: 'One step gains a second way of being done. It is cruder, but it works where the first way struggles.',
      first: 'The newcomer improves until the old way of doing that step is no longer needed.',
      another: 'Another step changes hands.',
      more: {
        2: 'A second step changes hands. The first system still does everything else.',
        3: 'Each change pays for itself at once. None is aimed at what comes next.',
        4: 'Half the steps have changed hands. Both systems are still needed.',
        5: 'The second system now does more of the work than the first.',
        6: 'Two steps remain. Wherever a step has changed, its support stands idle.',
        7: 'One step is left. Until it changes, the whole ring still depends on the first system.'
      },
      closed: 'The circle closes. The second system now makes everything it is made of.',
      dropped: 'The supports fall away. Nothing left standing shows they were ever there.'
    }
  });
});
