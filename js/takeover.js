/* The takeover
 *
 * A first kind of gene builds a box of useful things around itself. A second
 * kind of gene begins inside that box, as one of its products. Both shape the
 * box for a time; then the second kind shapes all of it and the first is gone.
 *
 * After A. G. Cairns-Smith, Genetic Takeover (1982), figure 4.1 and
 * pp. 121-124. Redrawn, not reproduced.
 *
 *   new TakeoverFigure(figureElement, config)
 *
 * Needs figure-player.js. The box has twelve corners, numbered clockwise from
 * the top. A gene "shapes" a corner; the edge after that corner takes its colour.
 *
 * Config:
 *   states  [{
 *     size:     how big the box is (0 hides it; 200 fills the drawing)
 *     shape:    0 = the outline the first genes built, 1 = reshaped for the second
 *     first:    [corners shaped by the first genes]
 *     second:   [corners shaped by the second genes]
 *     g1:       { x, y, scale, show }   the first gene; x and y are offsets from the centre
 *     g2:       { x, y, scale, show, gene }   gene: false draws it as a mere product
 *     products: 1 to show other products in the box, 0 to hide them
 *     caption:  '...'
 *   }, ...]
 *   label   one-line description for screen readers
 */
(function (global) {
  'use strict';

  var CX = 320, CY = 285, CORNERS = 12;
  // Fixed irregularities, so the box looks rough but is the same on every run.
  var LEAN = [4, -6, 5, -3, 7, -5, 2, -7, 6, -2, 5, -6];
  var OUTLINE_A = [1.00, 0.84, 1.08, 0.90, 1.04, 0.82, 1.10, 0.88, 1.02, 0.86, 1.06, 0.92];
  var OUTLINE_B = [0.92, 1.06, 0.88, 1.10, 0.86, 1.04, 0.90, 1.08, 0.84, 1.02, 0.94, 1.00];
  var PRODUCTS = [[-72, -62], [82, 72]];

  function f(n) { return n.toFixed(1); }

  // Everything that moves smoothly between states, as one list of numbers.
  function numbers(state) {
    var g1 = state.g1 || {}, g2 = state.g2 || {};
    return [
      state.size || 0, state.shape || 0,
      g1.x || 0, g1.y || 0, g1.scale || 1, g1.show ? 1 : 0,
      g2.x || 0, g2.y || 0, g2.scale || 1, g2.show ? 1 : 0,
      state.products ? 1 : 0
    ];
  }

  function TakeoverFigure(root, config) {
    var P = global.FigurePlayer;
    if (!P) throw new Error('TakeoverFigure: load figure-player.js first.');
    if (!config || !config.states || !config.states.length) throw new Error('TakeoverFigure: config.states is empty.');
    config.states.forEach(function (state, i) {
      (state.first || []).concat(state.second || []).forEach(function (k) {
        if (k !== Math.floor(k) || k < 0 || k >= CORNERS) {
          throw new Error('TakeoverFigure: state ' + i + ' names corner ' + k + '; corners run 0 to ' + (CORNERS - 1) + '.');
        }
      });
    });
    this.root = root;
    this.config = config;
    this.states = config.states;
    this.now = numbers(this.states[0]);
    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('TakeoverFigure: the figure needs a [data-fig-stage] element.');

    this.draw();

    var states = this.states;
    this.player = new P(root, {
      count: states.length,
      render: this.render.bind(this),
      caption: function (i) { return states[i].caption; },
      hold: function (i) { return states[i].hold; },
      pace: config.pace || 3400,
      hash: config.hash
    });
    this.player.start();
  }

  // A short string of beads: an organic polymer.
  function chain(P, parent, beads) {
    var g = P.svg('g', { 'class': 'tk-chain', 'data-gene': 'false' }, parent);
    var points = [];
    for (var i = 0; i < beads; i++) points.push([(i - (beads - 1) / 2) * 12, i % 2 ? 4 : -4]);
    P.svg('polyline', { 'class': 'tk-link', points: points.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') }, g);
    points.forEach(function (p) { P.svg('circle', { 'class': 'tk-bead', cx: p[0], cy: p[1], r: 6.5 }, g); });
    return g;
  }

  TakeoverFigure.prototype.draw = function () {
    var P = global.FigurePlayer;
    var svg = P.svg('svg', { 'class': 'tk', viewBox: '0 0 640 570', role: 'img' });
    var k;
    this.titleEl = P.svg('title', {}, svg);

    this.boxEl = P.svg('path', { 'class': 'tk-box' }, svg);
    this.edgeEls = [];
    for (k = 0; k < CORNERS; k++) this.edgeEls.push(P.svg('line', { 'class': 'tk-edge', 'data-by': '0' }, svg));
    this.arrowEls = { 1: [], 2: [] };
    for (k = 0; k < CORNERS; k++) {
      this.arrowEls[1].push(P.svg('path', { 'class': 'tk-arrow', 'data-gene': '1', 'data-on': 'false' }, svg));
      this.arrowEls[2].push(P.svg('path', { 'class': 'tk-arrow', 'data-gene': '2', 'data-on': 'false' }, svg));
    }

    this.productsEl = P.svg('g', {}, svg);
    for (k = 0; k < PRODUCTS.length; k++) {
      chain(P, this.productsEl, 3).setAttribute('transform', 'translate(' + (CX + PRODUCTS[k][0]) + ' ' + (CY + PRODUCTS[k][1]) + ')');
    }

    // The first gene: a small layered crystal.
    this.g1El = P.svg('g', { 'class': 'tk-g1' }, svg);
    for (k = 0; k < 4; k++) {
      var y = -17 + k * 9;
      P.svg('path', { 'class': 'tk-plate', d: 'M -21 ' + y + ' H 13 L 21 ' + (y + 7) + ' H -13 Z' }, this.g1El);
    }
    // The second gene: a string of beads.
    this.g2El = chain(P, svg, 5);

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
  };

  // Redraw everything that moves, from one list of numbers.
  TakeoverFigure.prototype.paint = function (v) {
    var size = v[0], shape = v[1], k;
    var genes = { 1: { x: CX + v[2], y: CY + v[3], scale: v[4] }, 2: { x: CX + v[6], y: CY + v[7], scale: v[8] } };
    var corners = [];
    for (k = 0; k < CORNERS; k++) {
      var a = (k * 360 / CORNERS + LEAN[k] - 90) * Math.PI / 180;
      var r = size * (OUTLINE_A[k] + (OUTLINE_B[k] - OUTLINE_A[k]) * shape);
      corners.push([CX + r * Math.cos(a), CY + r * Math.sin(a)]);
    }

    this.boxEl.setAttribute('d', 'M ' + corners.map(function (c) { return f(c[0]) + ' ' + f(c[1]); }).join(' L ') + ' Z');
    var seen = size > 8 ? 1 : 0;
    this.boxEl.setAttribute('opacity', seen);
    for (k = 0; k < CORNERS; k++) {
      var p = corners[k], q = corners[(k + 1) % CORNERS];
      var edge = this.edgeEls[k];
      edge.setAttribute('x1', f(p[0])); edge.setAttribute('y1', f(p[1]));
      edge.setAttribute('x2', f(q[0])); edge.setAttribute('y2', f(q[1]));
      edge.setAttribute('opacity', seen);

      for (var which = 1; which <= 2; which++) {
        var g = genes[which];
        var dx = p[0] - g.x, dy = p[1] - g.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        var d = '';
        if (len > 52) {
          var ux = dx / len, uy = dy / len;
          var sx = g.x + ux * 31 * g.scale, sy = g.y + uy * 31 * g.scale;
          var ex = p[0] - ux * 11, ey = p[1] - uy * 11;
          d = 'M ' + f(sx) + ' ' + f(sy) + ' L ' + f(ex) + ' ' + f(ey);
          // Arrowhead: two short strokes folded back from the tip.
          [0.5, -0.5].forEach(function (turn) {
            var wx = -(ux * Math.cos(turn) - uy * Math.sin(turn)) * 9;
            var wy = -(ux * Math.sin(turn) + uy * Math.cos(turn)) * 9;
            d += ' M ' + f(ex + wx) + ' ' + f(ey + wy) + ' L ' + f(ex) + ' ' + f(ey);
          });
        }
        this.arrowEls[which][k].setAttribute('d', d);
      }
    }

    this.g1El.setAttribute('transform', 'translate(' + f(genes[1].x) + ' ' + f(genes[1].y) + ') scale(' + v[4].toFixed(3) + ')');
    this.g1El.setAttribute('opacity', v[5].toFixed(3));
    this.g2El.setAttribute('transform', 'translate(' + f(genes[2].x) + ' ' + f(genes[2].y) + ') scale(' + v[8].toFixed(3) + ')');
    this.g2El.setAttribute('opacity', v[9].toFixed(3));
    this.productsEl.setAttribute('opacity', v[10].toFixed(3));
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  TakeoverFigure.prototype.render = function (index, how) {
    var self = this;
    var P = global.FigurePlayer;
    var state = this.states[index];
    var first = state.first || [], second = state.second || [];

    for (var k = 0; k < CORNERS; k++) {
      var by = second.indexOf(k) !== -1 ? 2 : (first.indexOf(k) !== -1 ? 1 : 0);
      this.edgeEls[k].setAttribute('data-by', String(by));
      this.arrowEls[1][k].setAttribute('data-on', by === 1 ? 'true' : 'false');
      this.arrowEls[2][k].setAttribute('data-on', by === 2 ? 'true' : 'false');
    }
    this.g2El.setAttribute('data-gene', state.g2 && state.g2.gene ? 'true' : 'false');
    this.svg.setAttribute('data-first', String(first.length));
    this.svg.setAttribute('data-second', String(second.length));

    var from = this.now.slice();
    var to = numbers(state);
    // A gene that is not on show yet starts where it will appear, not at the centre.
    if (from[5] === 0) { from[2] = to[2]; from[3] = to[3]; from[4] = to[4]; }
    if (from[9] === 0) { from[6] = to[6]; from[7] = to[7]; from[8] = to[8]; }
    // One that is leaving fades where it stands.
    if (to[5] === 0) { to[2] = from[2]; to[3] = from[3]; to[4] = from[4]; }
    if (to[9] === 0) { to[6] = from[6]; to[7] = from[7]; to[8] = from[8]; }

    if (this.stop) this.stop();
    this.stop = P.tween(how && how.snap ? 0 : 1200, function (p) {
      self.now = from.map(function (a, i) { return a + (to[i] - a) * p; });
      self.paint(self.now);
    });

    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');
  };

  global.TakeoverFigure = TakeoverFigure;
})(typeof window !== 'undefined' ? window : this);
