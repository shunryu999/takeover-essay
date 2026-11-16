/* Three closures
 *
 * A machine that copies itself needs three things: parts, power and
 * instructions. Each can come from outside or be made by the machine. The
 * share it supplies for itself is its closure in that respect. While any
 * supply line stays open, a copy is made only if that line delivers.
 *
 * After Freitas and Merkle, Kinematic Self-Replicating Machines (2004),
 * sections 5.6 and 5.1.9 (A1, E4, J5).
 *
 *   new ClosureFigure(figureElement, config)
 *
 * Needs figure-player.js.
 *
 * Config:
 *   needs   [{ id: 'parts', name: 'Parts' }, ...]   drawn top to bottom
 *   states  [{ own: { parts: 0..1, ... }, cut: 'parts' or nothing, caption: '...' }, ...]
 *           own is the share of each need the machine supplies for itself;
 *           cut names a supply line that has been severed
 *   label   one-line description for screen readers
 */
(function (global) {
  'use strict';

  var ROW0 = 78, ROW = 62;
  var SUP = { x: 18, w: 118, h: 38 };
  var BOX = { x: 236, w: 196 };
  var BAR = { x: 254, w: 160, h: 16 };
  var COPY = { x: 512, w: 110 };

  function ClosureFigure(root, config) {
    var P = global.FigurePlayer;
    if (!P) throw new Error('ClosureFigure: load figure-player.js first.');
    if (!config || !config.needs || !config.needs.length) throw new Error('ClosureFigure: config.needs is empty.');
    if (!config.states || !config.states.length) throw new Error('ClosureFigure: config.states is empty.');
    this.root = root;
    this.config = config;
    this.states = config.states;
    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('ClosureFigure: the figure needs a [data-fig-stage] element.');

    var first = this.states[0].own;
    this.now = {};
    config.needs.forEach(function (need) { this.now[need.id] = first[need.id] || 0; }, this);
    this.draw();

    var states = this.states;
    this.player = new P(root, {
      count: states.length,
      render: this.render.bind(this),
      caption: function (i) { return states[i].caption; },
      hold: function (i) { return states[i].hold; },
      pace: config.pace || 4000,
      hash: config.hash
    });
    this.player.start();
  }

  ClosureFigure.prototype.draw = function () {
    var P = global.FigurePlayer;
    var needs = this.config.needs;
    var bottom = ROW0 + (needs.length - 1) * ROW + 44;
    var svg = P.svg('svg', { 'class': 'clo', viewBox: '0 0 640 ' + (bottom + 62), role: 'img' });
    this.titleEl = P.svg('title', {}, svg);

    P.svg('text', { 'class': 'clo-head', x: SUP.x, y: 24 }, svg).textContent = 'from outside';
    P.svg('text', { 'class': 'clo-head', x: BOX.x, y: 24 }, svg).textContent = 'the machine';
    P.svg('text', { 'class': 'clo-head', x: COPY.x, y: 24 }, svg).textContent = 'its copy';

    P.svg('rect', { 'class': 'clo-box', x: BOX.x, y: 38, width: BOX.w, height: bottom - 38, rx: 8 }, svg);
    this.copy = P.svg('g', { 'class': 'clo-copy' }, svg);
    P.svg('rect', { 'class': 'clo-box', x: COPY.x, y: 62, width: COPY.w, height: bottom - 86, rx: 6 }, this.copy);
    this.arrow = P.svg('path', {
      'class': 'clo-make',
      d: 'M ' + (BOX.x + BOX.w + 12) + ' ' + (ROW0 + ROW) + ' H ' + (COPY.x - 14) +
         ' m -9 -6 l 9 6 l -9 6'
    }, svg);

    // What no machine makes for itself: raw material and energy from its surroundings.
    var mid = BOX.x + BOX.w / 2;
    P.svg('path', { 'class': 'clo-raw', d: 'M ' + mid + ' ' + (bottom + 34) + ' V ' + (bottom + 8) + ' m -6 9 l 6 -9 l 6 9' }, svg);
    P.svg('text', { 'class': 'clo-note', x: mid, y: bottom + 54, 'text-anchor': 'middle' }, svg).textContent = 'raw material, sunlight';

    this.rows = needs.map(function (need, i) {
      var y = ROW0 + i * ROW;
      var row = { id: need.id };
      row.line = P.svg('path', { 'class': 'clo-line', d: 'M ' + (SUP.x + SUP.w) + ' ' + y + ' H ' + (BAR.x - 6) }, svg);
      row.snip = P.svg('path', { 'class': 'clo-snip', d: 'M 176 ' + (y - 13) + ' l 18 26 M 194 ' + (y - 13) + ' l -18 26' }, svg);
      row.supplier = P.svg('g', { 'class': 'clo-supplier' }, svg);
      P.svg('rect', { x: SUP.x, y: y - SUP.h / 2, width: SUP.w, height: SUP.h, rx: 5 }, row.supplier);
      P.svg('text', { x: SUP.x + SUP.w / 2, y: y + 6.5, 'text-anchor': 'middle' }, row.supplier).textContent = need.name;
      P.svg('rect', { 'class': 'clo-bar', x: BAR.x, y: y - BAR.h / 2, width: BAR.w, height: BAR.h, rx: 3 }, svg);
      row.own = P.svg('rect', { 'class': 'clo-own', y: y - BAR.h / 2, height: BAR.h, rx: 3 }, svg);
      // The copy carries the same three bars, smaller.
      var cy = 96 + i * ((bottom - 86 - 68) / Math.max(1, needs.length - 1));
      P.svg('rect', { 'class': 'clo-bar', x: COPY.x + 16, y: cy, width: COPY.w - 32, height: 10, rx: 2 }, this.copy);
      row.copyOwn = P.svg('rect', { 'class': 'clo-own', y: cy, height: 10, rx: 2 }, this.copy);
      return row;
    }, this);

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
  };

  // Draw the bars and supply lines for the shares in this.now.
  ClosureFigure.prototype.paint = function () {
    this.rows.forEach(function (row) {
      var own = Math.max(0, Math.min(1, this.now[row.id]));
      var w = BAR.w * own, cw = (COPY.w - 32) * own;
      row.own.setAttribute('x', (BAR.x + BAR.w - w).toFixed(1));
      row.own.setAttribute('width', w.toFixed(1));
      row.copyOwn.setAttribute('x', (COPY.x + COPY.w - 16 - cw).toFixed(1));
      row.copyOwn.setAttribute('width', cw.toFixed(1));
      row.line.setAttribute('stroke-width', (1.5 + 8.5 * (1 - own)).toFixed(2));
      var open = own < 0.999;
      row.line.setAttribute('opacity', open ? '1' : '0');
      row.supplier.setAttribute('opacity', open ? '1' : '0.28');
    }, this);
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  ClosureFigure.prototype.render = function (index, how) {
    var self = this;
    var P = global.FigurePlayer;
    var state = this.states[index];
    var from = {}, to = {};
    this.rows.forEach(function (row) {
      from[row.id] = self.now[row.id];
      to[row.id] = state.own[row.id] || 0;
      row.line.setAttribute('data-cut', state.cut === row.id ? 'true' : 'false');
      row.snip.setAttribute('data-cut', state.cut === row.id ? 'true' : 'false');
    });
    if (this.stop) this.stop();
    this.stop = P.tween(how && how.snap ? 0 : 1100, function (p) {
      self.rows.forEach(function (row) { self.now[row.id] = from[row.id] + (to[row.id] - from[row.id]) * p; });
      self.paint();
    });
    // A copy is made only if every open line delivers.
    this.svg.setAttribute('data-copies', state.cut ? 'false' : 'true');
    var closed = this.rows.every(function (row) { return to[row.id] >= 0.999; });
    this.svg.setAttribute('data-closed', closed ? 'true' : 'false');
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');
  };

  global.ClosureFigure = ClosureFigure;
})(typeof window !== 'undefined' ? window : this);
