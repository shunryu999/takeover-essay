/* The arch (Part 1, scenes 2 and 4).
 * After Cairns-Smith, Genetic Takeover (1982), pp. 95-99 and figures 3.3-3.4;
 * Seven Clues to the Origin of Life, pp. 59-60.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var figure = document.getElementById('the-arch');
  if (!figure || !window.ArchFigure) return;

  new window.ArchFigure(figure, {
    label: 'Rough stones on level ground, placed and removed one at a time.',

    states: [
      {
        stones: {},
        ghost: true,
        caption: 'An arch of stones. How could it be built with one hand, one stone at a time?'
      },
      {
        stones: { arch1: 'feet', fallen: 'yes' },
        ghost: true,
        caption: 'Start at the feet and the next stones lean on nothing. They fall.'
      },
      {
        stones: { fallen: 'gone', inner: 'yes' },
        ghost: true,
        caption: 'So build what can be built: a heap. Every stone rests on the ground or on stones already there.'
      },
      {
        stones: { inner: 'yes', arch1: 'yes' },
        caption: 'Keep adding. The last stones laid lie over the heap and meet at the top.'
      },
      {
        stones: { inner: 'yes', arch1: 'yes' },
        locked: ['arch1'],
        caption: 'Those outer stones now lean on each other. The heap beneath them is no longer needed.'
      },
      {
        stones: { inner: 'gone', arch1: 'yes' },
        locked: ['arch1'],
        caption: 'Take the heap away, one stone at a time. The arch stays up.'
      },
      {
        stones: { inner: 'gone', arch1: 'yes' },
        locked: ['arch1'],
        tug: true,
        caption: 'Now try to simplify further. Pull out any one stone and the rest come down. There is no way back.'
      },
      {
        stones: { arch1: 'yes', outer: 'yes' },
        locked: ['arch1'],
        caption: 'Adding is still possible. Pile more stones over and around it.'
      },
      {
        stones: { arch1: 'yes', outer: 'yes', arch2: 'yes' },
        locked: ['arch1', 'arch2'],
        caption: 'Again the outermost stones meet and lean on each other.'
      },
      {
        stones: { arch1: 'gone', outer: 'gone', arch2: 'yes' },
        locked: ['arch1', 'arch2'],
        caption: 'Now everything beneath can go, the first arch included. An arch can be taken down, but only through a new one built over it.'
      }
    ]
  });
});
