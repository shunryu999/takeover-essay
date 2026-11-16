/* The race
 *
 * Several lineages of copiers run on one clock. Each differs from the
 * reference in one respect: how long a copy takes, how many copies are made
 * at a time, how many times a unit can copy before it fails, or how often a
 * copy comes out true. A bar underneath shows each lineage's share of all
 * true-to-type units.
 *
 * After Freitas and Merkle, Kinematic Self-Replicating Machines (2004),
 * sections 5.1.1, 5.1.9 (J1, J2, L4) and 5.9.1.
 *
 *   new RaceFigure(figureElement, config)
 *
 * Needs figure-player.js.
 *
 * Config:
 *   lanes   [{ id: 'A', time: 2, litter: 1, life: Infinity, fidelity: 1 }, ...]
 *           time      ticks between copies
 *           litter    copies made each time
 *           life      number of times a unit copies before it fails
 *           fidelity  chance that a copy comes out true (0..1)
 *   states  [{ t: 0, caption: '...' }, ...]   t is the clock reading
 *   seed    number; fixes which copies come out wrong
 *   label   one-line description for screen readers
 */
(function (global) {
  'use strict';

  var LEFT = 46, TOP = 34, PITCH = 9, ROWS = 5, LANE = 58, RIGHT = 622, BAR_H = 16;

  // Run one lineage and return, for every tick, the list of units alive (true = to type).
  function simulate(lane, ticks, dice) {
    var time = lane.time || 1, litter = lane.litter || 1;
    var life = lane.life || Infinity, fidelity = lane.fidelity === undefined ? 1 : lane.fidelity;
    var units = [{ born: 0, copies: 0, ok: true }];
    var history = [units.map(function (u) { return u.ok; })];
    for (var t = 1; t <= ticks; t++) {
      var born = [];
      units.forEach(function (u) {
        if ((t - u.born) % time !== 0) return;
        for (var k = 0; k < litter; k++) born.push({ born: t, copies: 0, ok: u.ok && dice() < fidelity });
        u.copies++;
      });
      units = units.filter(function (u) { return u.copies < life; }).concat(born);
      history.push(units.map(function (u) { return u.ok; }));
    }
    return history;
  }

  function RaceFigure(root, config) {
    var P = global.FigurePlayer;
    if (!P) throw new Error('RaceFigure: load figure-player.js first.');
    if (!config || !config.lanes || !config.lanes.length) throw new Error('RaceFigure: config.lanes is empty.');
    if (!config.states || !config.states.length) throw new Error('RaceFigure: config.states is empty.');
    this.root = root;
    this.config = config;
    this.states = config.states;
    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('RaceFigure: the figure needs a [data-fig-stage] element.');

    var ticks = Math.max.apply(null, this.states.map(function (s) { return s.t; }));
    var dice = P.dice(config.seed || 7);
    this.history = config.lanes.map(function (lane) { return simulate(lane, ticks, dice); });
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

  // Counts for one lineage at one tick: { all, ok }.
  RaceFigure.prototype.count = function (lane, t) {
    var list = this.history[lane][t];
    return { all: list.length, ok: list.filter(Boolean).length };
  };

  RaceFigure.prototype.draw = function () {
    var P = global.FigurePlayer;
    var lanes = this.config.lanes, history = this.history;
    var height = TOP + lanes.length * LANE + 46;
    var svg = P.svg('svg', { 'class': 'race', viewBox: '0 0 640 ' + height, role: 'img' });
    this.titleEl = P.svg('title', {}, svg);
    this.clockEl = P.svg('text', { 'class': 'race-clock', x: RIGHT, y: 20, 'text-anchor': 'end' }, svg);

    this.rows = lanes.map(function (lane, i) {
      var y = TOP + i * LANE;
      var most = Math.max.apply(null, history[i].map(function (list) { return list.length; }));
      P.svg('text', { 'class': 'race-name', x: 14, y: y + 30 }, svg).textContent = lane.id;
      var dots = [];
      for (var k = 0; k < most; k++) {
        dots.push(P.svg('circle', {
          'class': 'race-dot', r: 3.2,
          cx: LEFT + 5 + Math.floor(k / ROWS) * PITCH,
          cy: y + 5 + (k % ROWS) * PITCH
        }, svg));
      }
      return {
        dots: dots,
        total: P.svg('text', { 'class': 'race-total', x: RIGHT, y: y + 30, 'text-anchor': 'end' }, svg)
      };
    });

    // Share bar: one segment and one letter per lineage.
    var barY = TOP + lanes.length * LANE + 22;
    this.barY = barY;
    this.segments = lanes.map(function (lane) {
      return {
        rect: P.svg('rect', { 'class': 'race-share', y: barY, height: BAR_H }, svg),
        text: P.svg('text', { 'class': 'race-share-name', y: barY - 6, 'text-anchor': 'middle' }, svg),
        id: lane.id
      };
    });

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  RaceFigure.prototype.render = function (index) {
    var self = this;
    var state = this.states[index], t = state.t;
    var totals = [], sum = 0;

    this.rows.forEach(function (row, i) {
      var list = self.history[i][t];
      row.dots.forEach(function (dot, k) {
        dot.setAttribute('data-on', k < list.length ? 'true' : 'false');
        dot.setAttribute('data-true', k < list.length && !list[k] ? 'false' : 'true');
      });
      var c = self.count(i, t);
      row.total.textContent = String(c.all);
      totals.push(c.ok);
      sum += c.ok;
    });

    // Shares are of true-to-type units only: a copy that came out wrong is not this lineage.
    var x = LEFT, width = RIGHT - LEFT;
    this.segments.forEach(function (seg, i) {
      var w = sum ? width * totals[i] / sum : 0;
      seg.rect.setAttribute('x', x.toFixed(1));
      seg.rect.setAttribute('width', Math.max(0, w - 2).toFixed(1));
      seg.text.setAttribute('x', (x + w / 2).toFixed(1));
      seg.text.textContent = w >= 16 ? seg.id : '';
      x += w;
    });

    this.clockEl.textContent = 'time ' + t;
    this.svg.setAttribute('data-t', String(t));
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');
  };

  global.RaceFigure = RaceFigure;
})(typeof window !== 'undefined' ? window : this);
