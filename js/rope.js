/* The rope
 *
 * A line of descent drawn as a rope. Time runs left to right. No fibre runs
 * the whole length, so the rope can end up made of a different material from
 * the one it started with, without ever breaking.
 *
 * After A. G. Cairns-Smith, Genetic Takeover (1982), pp. 5 and 105-106, and
 * Seven Clues to the Origin of Life, pp. 61-62.
 *
 *   new RopeFigure(figureElement, config)
 *
 * Needs figure-player.js.
 *
 * Config:
 *   fibres  [{ from: 30, to: 205, kind: 1 }, ...]   positions along a 640-wide drawing;
 *           kind 1 is the first material, kind 2 the second
 *   states  [{ spread: 0..1, reveal: x, caption: '...' }, ...]
 *           spread near 0 draws the rope as a single thread, 1 separates the fibres;
 *           reveal is how far along the rope has been followed
 *   label   one-line description for screen readers
 */
(function (global) {
  'use strict';

  var AXIS = 112, AMP = 26, WAVE = 150, STEP = 6;

  function RopeFigure(root, config) {
    var P = global.FigurePlayer;
    if (!P) throw new Error('RopeFigure: load figure-player.js first.');
    if (!config || !config.fibres || !config.fibres.length) throw new Error('RopeFigure: config.fibres is empty.');
    if (!config.states || !config.states.length) throw new Error('RopeFigure: config.states is empty.');
    this.root = root;
    this.config = config;
    this.states = config.states;
    this.now = { spread: this.states[0].spread, reveal: this.states[0].reveal };
    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('RopeFigure: the figure needs a [data-fig-stage] element.');

    this.draw();

    var states = this.states;
    this.player = new P(root, {
      count: states.length,
      render: this.render.bind(this),
      caption: function (i) { return states[i].caption; },
      hold: function (i) { return states[i].hold; },
      pace: config.pace || 3200,
      hash: config.hash
    });
    this.player.start();
  }

  RopeFigure.prototype.draw = function () {
    var P = global.FigurePlayer;
    var svg = P.svg('svg', { 'class': 'rope', viewBox: '0 0 640 210', role: 'img' });
    this.titleEl = P.svg('title', {}, svg);

    // Time's arrow under the rope.
    P.svg('path', { 'class': 'rope-axis', d: 'M 30 186 H 606 M 597 180 L 607 186 L 597 192' }, svg);

    this.fibres = this.config.fibres.map(function (fibre, i) {
      return {
        from: fibre.from, to: fibre.to,
        phase: i * 2.4,
        amp: AMP * (0.7 + 0.3 * ((i * 7) % 4) / 3),
        casing: P.svg('path', { 'class': 'rope-casing' }, svg),
        thread: P.svg('path', { 'class': 'rope-thread', 'data-kind': String(fibre.kind) }, svg)
      };
    });

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
  };

  // Redraw every fibre for a given spread and a given distance followed.
  RopeFigure.prototype.paint = function (spread, reveal) {
    this.fibres.forEach(function (fibre) {
      var end = Math.min(fibre.to, reveal);
      var d = '';
      if (end > fibre.from) {
        for (var x = fibre.from; ; x += STEP) {
          if (x > end) x = end;
          var y = AXIS + spread * fibre.amp * Math.sin(2 * Math.PI * x / WAVE + fibre.phase);
          d += (d ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1);
          if (x >= end) break;
        }
      }
      fibre.casing.setAttribute('d', d);
      fibre.casing.setAttribute('opacity', Math.min(1, spread * 1.6).toFixed(2));
      fibre.thread.setAttribute('d', d);
    });
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  RopeFigure.prototype.render = function (index, how) {
    var self = this;
    var P = global.FigurePlayer;
    var state = this.states[index];
    var from = { spread: this.now.spread, reveal: this.now.reveal };
    var to = { spread: state.spread, reveal: state.reveal };

    if (this.stop) this.stop();
    this.stop = P.tween(how && how.snap ? 0 : 1300, function (p) {
      self.now.spread = from.spread + (to.spread - from.spread) * p;
      self.now.reveal = from.reveal + (to.reveal - from.reveal) * p;
      self.paint(self.now.spread, self.now.reveal);
    });

    this.svg.setAttribute('data-spread', String(state.spread));
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');
  };

  global.RopeFigure = RopeFigure;
})(typeof window !== 'undefined' ? window : this);
