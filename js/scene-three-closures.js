/* Three closures (replicators; not yet placed in the essay).
 * After Freitas and Merkle, Kinematic Self-Replicating Machines (2004),
 * sections 5.6 and 5.1.9 (A1, E4, J5).
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('three-closures');
  if (!figure || !window.ClosureFigure) return;

  new window.ClosureFigure(figure, {
    label: 'A machine with three bars for parts, power and instructions, three supply lines from outside, and the copy it makes.',

    needs: [
      { id: 'parts', name: 'Parts' },
      { id: 'power', name: 'Power' },
      { id: 'plans', name: 'Instructions' }
    ],

    states: [
      { own: { parts: 0, power: 0, plans: 0 },
        caption: 'This machine makes copies of itself, but everything it needs is handed to it: finished parts, power, and instructions for each step.' },
      { own: { parts: 0.6, power: 0, plans: 0 },
        caption: 'It begins to make some of its own parts out of raw material.' },
      { own: { parts: 0.9, power: 0, plans: 0 },
        caption: 'Soon it makes all but a few. Engineers call the parts still shipped in vitamins.' },
      { own: { parts: 0.9, power: 1, plans: 0 },
        caption: 'It gathers its own power.' },
      { own: { parts: 0.9, power: 1, plans: 1 },
        caption: 'It carries its own description instead of waiting to be told what to do.' },
      { own: { parts: 0.9, power: 1, plans: 1 }, cut: 'parts',
        caption: 'One thin line is still open. Whoever holds it decides whether a copy gets made. Cut it and copying stops.' },
      { own: { parts: 1, power: 1, plans: 1 }, hold: 5000,
        caption: 'Close that line and nobody outside has a say. The machine still takes in raw material and sunlight: closed does not mean sealed.' }
    ]
  });
});
