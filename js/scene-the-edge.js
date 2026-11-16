/* The edge (replicators; not yet placed in the essay).
 * After Freitas and Merkle, Kinematic Self-Replicating Machines (2004), section 5.9.3.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('the-edge');
  if (!figure || !window.SpreadFigure) return;

  new window.SpreadFigure(figure, {
    label: 'A patch of copiers spreading across a surface of fixed size, with a chart of their number over time.',
    cols: 48, rows: 20, start: [10, 10], seed: 5,

    states: [
      { t: 0, caption: 'One copier on an empty surface. The surface is all the room there is.' },
      { t: 2, caption: 'At first every unit has open ground beside it, and the count multiplies.' },
      { t: 8, caption: 'Then the middle fills in. A unit with no open ground beside it has nowhere to put a copy. Only the dark ones on the edge are still copying.' },
      { t: 16, caption: 'The patch has reached the walls. From here the count rises only as fast as the edge can travel, however quickly a single unit copies.' },
      { t: 40, caption: 'On the chart, the curve has become a steady slope.' },
      { t: 'full', hold: 5000, caption: 'The surface is full. The count stops at what the surface can hold.' }
    ]
  });
});
