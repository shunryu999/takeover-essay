/* The edge
 *
 * Copiers spreading over a surface of fixed size. At first every unit has
 * open ground beside it. Soon the units in the middle are hemmed in and only
 * those on the edge can still copy, so growth goes at the pace of the edge.
 * When the surface is full the count stops.
 *
 * After Freitas and Merkle, Kinematic Self-Replicating Machines (2004),
 * section 5.9.3.
 *
 *   new SpreadFigure(figureElement, config)
 *
 * Needs figure-player.js.
 *
 * Config:
 *   cols, rows  size of the surface in cells (default 48 by 20)
 *   start       [col, row] of the first unit
 *   chance      chance per tick that an edge unit fills a given empty neighbour (default 0.5)
 *   seed        number; fixes the shape the patch takes
 *   states      [{ t: 0, caption: '...' }, ...]   t is the clock reading; 'full' means the last tick
 *   label       one-line description for screen readers
 */
(function (global) {
  'use strict';

  var CELL = 12, LEFT = 32, TOP = 12, CHART_H = 70, GAP = 30;

  function SpreadFigure(root, config) {
    var P = global.FigurePlayer;
    if (!P) throw new Error('SpreadFigure: load figure-player.js first.');
    if (!config || !config.states || !config.states.length) throw new Error('SpreadFigure: config.states is empty.');
    this.root = root;
    this.config = config;
    this.cols = config.cols || 48;
    this.rows = config.rows || 20;
    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('SpreadFigure: the figure needs a [data-fig-stage] element.');

    this.grow();
    var last = this.last;
    this.states = config.states.map(function (s) {
      return { t: s.t === 'full' ? last : Math.min(s.t, last), caption: s.caption, hold: s.hold };
    });
    this.now = this.states[0].t;
    this.draw();

    var states = this.states;
    this.player = new P(root, {
      count: states.length,
      render: this.render.bind(this),
      caption: function (i) { return states[i].caption; },
      hold: function (i) { return states[i].hold; },
      pace: config.pace || 4200,
      hash: config.hash
    });
    this.player.start();
  }

  SpreadFigure.prototype.near = function (i) {
    var c = i % this.cols, r = Math.floor(i / this.cols), out = [];
    if (c > 0) out.push(i - 1);
    if (c < this.cols - 1) out.push(i + 1);
    if (r > 0) out.push(i - this.cols);
    if (r < this.rows - 1) out.push(i + this.cols);
    return out;
  };

  // Work out, once, the tick at which each cell fills and the tick at which it is hemmed in.
  SpreadFigure.prototype.grow = function () {
    var self = this;
    var n = this.cols * this.rows;
    var dice = global.FigurePlayer.dice(this.config.seed || 5);
    var chance = this.config.chance || 0.5;
    var start = this.config.start || [Math.floor(this.cols / 2), Math.floor(this.rows / 2)];
    var filled = new Array(n).fill(Infinity);
    filled[start[1] * this.cols + start[0]] = 0;
    var count = 1, t = 0;
    this.counts = [1];
    while (count < n && t < 2000) {
      t++;
      var add = [];
      for (var i = 0; i < n; i++) {
        if (filled[i] >= t) continue;
        this.near(i).forEach(function (j) {
          if (filled[j] === Infinity && dice() < chance) add.push(j);
        });
      }
      add.forEach(function (j) { if (filled[j] === Infinity) { filled[j] = t; count++; } });
      this.counts.push(count);
    }
    this.last = t;
    this.filled = filled;
    // A unit is hemmed in from the tick its last neighbour fills.
    this.shut = filled.map(function (f, i) {
      return Math.max.apply(null, self.near(i).map(function (j) { return filled[j]; }));
    });
  };

  SpreadFigure.prototype.draw = function () {
    var P = global.FigurePlayer;
    var w = this.cols * CELL, h = this.rows * CELL;
    var chartTop = TOP + h + GAP;
    var svg = P.svg('svg', { 'class': 'spread', viewBox: '0 0 640 ' + (chartTop + CHART_H + 30), role: 'img' });
    this.titleEl = P.svg('title', {}, svg);
    P.svg('rect', { 'class': 'spread-ground', x: LEFT - 4, y: TOP - 4, width: w + 8, height: h + 8, rx: 6 }, svg);

    this.cells = [];
    for (var i = 0; i < this.cols * this.rows; i++) {
      this.cells.push(P.svg('rect', {
        'class': 'spread-cell', 'data-is': 'empty',
        x: LEFT + (i % this.cols) * CELL + 1, y: TOP + Math.floor(i / this.cols) * CELL + 1,
        width: CELL - 2, height: CELL - 2, rx: 2
      }, svg));
    }
    this.shown = this.cells.map(function () { return 'empty'; });

    // The count over time, with the ceiling marked.
    var self = this, total = this.cols * this.rows;
    this.chart = { x: LEFT, y: chartTop, w: w, h: CHART_H };
    P.svg('path', { 'class': 'spread-ceiling', d: 'M ' + LEFT + ' ' + chartTop + ' H ' + (LEFT + w) }, svg);
    P.svg('path', { 'class': 'spread-axis', d: 'M ' + LEFT + ' ' + (chartTop + CHART_H) + ' H ' + (LEFT + w) }, svg);
    P.svg('text', { 'class': 'spread-note', x: LEFT + w, y: chartTop - 7, 'text-anchor': 'end' }, svg).textContent = 'full';
    P.svg('text', { 'class': 'spread-note', x: LEFT, y: chartTop + CHART_H + 20 }, svg).textContent = 'units over time';
    this.pointAt = function (t) {
      var a = Math.floor(t), b = Math.min(self.last, a + 1), f = t - a;
      var c = self.counts[a] + (self.counts[b] - self.counts[a]) * f;
      return [LEFT + w * t / self.last, chartTop + CHART_H * (1 - c / total)];
    };
    this.curve = P.svg('path', { 'class': 'spread-curve' }, svg);
    this.marker = P.svg('circle', { 'class': 'spread-marker', r: 4.5 }, svg);

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
  };

  // Draw the surface and the chart as they stand at clock reading t.
  SpreadFigure.prototype.paint = function (t) {
    var tick = Math.floor(t + 1e-6);
    for (var i = 0; i < this.cells.length; i++) {
      var is = this.filled[i] > tick ? 'empty' : (this.shut[i] > tick ? 'edge' : 'inside');
      if (is !== this.shown[i]) { this.cells[i].setAttribute('data-is', is); this.shown[i] = is; }
    }
    var d = '';
    for (var k = 0; k <= tick; k++) {
      var p = this.pointAt(k);
      d += (d ? ' L ' : 'M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }
    var end = this.pointAt(t);
    d += ' L ' + end[0].toFixed(1) + ' ' + end[1].toFixed(1);
    this.curve.setAttribute('d', d);
    this.marker.setAttribute('cx', end[0].toFixed(1));
    this.marker.setAttribute('cy', end[1].toFixed(1));
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  SpreadFigure.prototype.render = function (index, how) {
    var self = this;
    var P = global.FigurePlayer;
    var state = this.states[index];
    var from = this.now, to = state.t;
    if (this.stop) this.stop();
    var ms = how && how.snap ? 0 : Math.min(3200, 500 + 130 * Math.abs(to - from));
    this.stop = P.tween(ms, function (p) {
      self.now = from + (to - from) * p;
      self.paint(self.now);
    });
    this.svg.setAttribute('data-t', String(to));
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');
  };

  global.SpreadFigure = SpreadFigure;
})(typeof window !== 'undefined' ? window : this);
