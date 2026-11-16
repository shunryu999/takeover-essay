/* The race (replicators; not yet placed in the essay).
 * After Freitas and Merkle, Kinematic Self-Replicating Machines (2004),
 * sections 5.1.1, 5.1.9 (J1, J2, L4) and 5.9.1.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('the-race');
  if (!figure || !window.RaceFigure) return;

  new window.RaceFigure(figure, {
    label: 'Five rows of dots, one row for each lineage of copiers, growing at different rates. A bar underneath shows each lineage’s share.',
    seed: 31,

    lanes: [
      { id: 'A', time: 2 },                 // the reference
      { id: 'B', time: 1 },                 // copies in half the time
      { id: 'C', time: 2, litter: 2 },      // two copies at a time
      { id: 'D', time: 2, life: 2 },        // fails after copying twice
      { id: 'E', time: 2, fidelity: 0.5 }   // half its copies come out wrong
    ],

    states: [
      { t: 0, caption: 'Five lineages of copiers start with one unit each. A is the reference. Each of the others differs from A in one way.' },
      { t: 1, caption: 'B copies in half the time A takes. It has two units before the others have moved.' },
      { t: 2, caption: 'Now the rest have copied. C makes two copies at a time where A makes one.' },
      { t: 4, caption: 'D’s units fail after copying twice, so its founder is gone. Half of E’s copies come out wrong. The hollow ones are no longer E.' },
      { t: 6, caption: 'The differences compound. B has 64 units to A’s 8.' },
      { t: 8, hold: 5000, caption: 'B and C now make up about nine-tenths of the true copies. Nothing picked them out except their own rates.' }
    ]
  });
});
