/* The arch
 *
 * Stones are placed one at a time. A heap can be built that way. An arch
 * cannot, unless stones are taken away as well as added. And once an arch
 * stands, the only way to take it down is to build another over it.
 *
 * After A. G. Cairns-Smith, Genetic Takeover (1982), figures 3.3 and 3.4,
 * and Seven Clues to the Origin of Life, pp. 59-60. Redrawn, not reproduced.
 *
 *   new ArchFigure(figureElement, config)
 *
 * Needs figure-player.js. The stones come in named groups, from the inside out:
 *   fallen  two stones lying on the ground (a failed first try)
 *   inner   the first heap
 *   arch1   the layer over it, which becomes the first arch
 *   outer   a second heap piled over the first arch
 *   arch2   the layer over that, which becomes the second arch
 *
 * Config:
 *   states  [{ stones: { inner: 'yes', arch1: 'feet', ... }, locked: ['arch1'],
 *              ghost: true, tug: true, caption: '...' }, ...]
 *           each group is 'no' (not yet placed), 'yes', 'gone', or 'feet'
 *           (only the two lowest stones on each side). Groups left out are 'no'.
 *           locked: groups whose stones now hold each other up.
 *           ghost: show the outline of the arch still to be built.
 *           tug: show one stone of the first arch being pulled out.
 *   label   one-line description for screen readers
 */
(function (global) {
  'use strict';

  var CX = 320, GROUND = 292, STONE = 20.5;
  var RINGS = [
    { group: 'inner', r: 34, n: 3 },
    { group: 'inner', r: 72, n: 6 },
    { group: 'arch1', r: 110, n: 9 },
    { group: 'outer', r: 150, n: 12 },
    { group: 'arch2', r: 190, n: 15 }
  ];
  var GROUPS = ['fallen', 'inner', 'arch1', 'outer', 'arch2'];

  function ArchFigure(root, config) {
    var P = global.FigurePlayer;
    if (!P) throw new Error('ArchFigure: load figure-player.js first.');
    if (!config || !config.states || !config.states.length) throw new Error('ArchFigure: config.states is empty.');
    config.states.forEach(function (state, i) {
      Object.keys(state.stones || {}).concat(state.locked || []).forEach(function (g) {
        if (GROUPS.indexOf(g) === -1) throw new Error('ArchFigure: state ' + i + ' names an unknown group "' + g + '".');
      });
    });
    this.root = root;
    this.config = config;
    this.states = config.states;
    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('ArchFigure: the figure needs a [data-fig-stage] element.');

    this.draw();

    var states = this.states;
    this.player = new P(root, {
      count: states.length,
      render: this.render.bind(this),
      caption: function (i) { return states[i].caption; },
      hold: function (i) { return states[i].hold; },
      pace: config.pace || 3000,
      hash: config.hash
    });
    this.player.start();
  }

  // A rough, rounded stone: a few points around a centre, joined smoothly.
  function stonePath(P, x, y, roll) {
    var points = [];
    for (var k = 0; k < 9; k++) {
      var a = (k + (roll() - 0.5) * 0.5) * Math.PI * 2 / 9;
      var r = STONE * (0.86 + 0.2 * roll());
      points.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
    }
    return P.smoothClosed(points);
  }

  ArchFigure.prototype.draw = function () {
    var P = global.FigurePlayer;
    var svg = P.svg('svg', { 'class': 'arch', viewBox: '0 0 640 330', role: 'img' });
    this.titleEl = P.svg('title', {}, svg);
    P.svg('line', { 'class': 'arch-ground', x1: 70, y1: GROUND + 1, x2: 570, y2: GROUND + 1 }, svg);

    var roll = P.dice(7);
    var stones = [];
    var ghosts = P.svg('g', {}, svg);
    var layer = P.svg('g', {}, svg);

    function add(group, x, y, height, index, count, ux, uy) {
      var d = stonePath(P, x, y, roll);
      if (group === 'arch1') P.svg('path', { 'class': 'arch-ghost', d: d }, ghosts);
      var node = P.svg('path', { 'class': 'arch-stone', d: d, 'data-here': 'no' }, layer);
      node.style.setProperty('--ux', (ux * 30).toFixed(1) + 'px');
      node.style.setProperty('--uy', (uy * 30).toFixed(1) + 'px');
      stones.push({ group: group, node: node, height: height, index: index, count: count, here: 'no' });
    }

    RINGS.forEach(function (ring) {
      for (var i = 0; i < ring.n; i++) {
        var a = (i + 0.5) * Math.PI / ring.n;
        add(ring.group, CX - ring.r * Math.cos(a), GROUND - ring.r * Math.sin(a),
            ring.r * Math.sin(a), i, ring.n, -Math.cos(a), -Math.sin(a));
      }
    });
    // Two stones that fell when the arch was tried directly.
    add('fallen', CX - 58, GROUND - 17, 0, 0, 2, 0, 0);
    add('fallen', CX + 61, GROUND - 16, 0, 1, 2, 0, 0);

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
    this.stones = stones;
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  ArchFigure.prototype.render = function (index) {
    var state = this.states[index];
    var want = state.stones || {};
    var locked = state.locked || [];
    var changed = [];

    this.stones.forEach(function (s) {
      var here = want[s.group] || 'no';
      if (here === 'feet') here = (s.index < 2 || s.index >= s.count - 2) ? 'yes' : 'no';
      // One stone of the first arch is pulled out; the two above it start to drop.
      var tug = !!state.tug && s.group === 'arch1';
      if (tug && s.index === 6) here = 'tug';
      s.node.setAttribute('data-sag', tug && (s.index === 4 || s.index === 5) ? 'true' : 'false');
      s.node.setAttribute('data-locked', locked.indexOf(s.group) !== -1 ? 'true' : 'false');
      if (here !== s.here) changed.push(s);
      s.next = here;
    });

    // One stone at a time: lowest first going up, highest first coming down.
    changed.sort(function (a, b) {
      var ga = GROUPS.indexOf(a.group), gb = GROUPS.indexOf(b.group);
      if (ga !== gb) return ga - gb;
      return a.next === 'gone' ? b.height - a.height : a.height - b.height;
    });
    changed.forEach(function (s, rank) {
      s.node.style.setProperty('--delay', (rank * 0.06).toFixed(2) + 's');
    });
    this.stones.forEach(function (s) {
      s.here = s.next;
      s.node.setAttribute('data-here', s.here);
    });

    this.svg.setAttribute('data-ghost', state.ghost ? 'true' : 'false');
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');
  };

  global.ArchFigure = ArchFigure;
})(typeof window !== 'undefined' ? window : this);
