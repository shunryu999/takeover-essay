/* Closing circle
 *
 * A ring of steps, each run by a first system, taken over one at a time by a
 * second system. When the second system runs every step the circle is closed,
 * and the supports the first system provided fall away.
 *
 * The drawing knows nothing about clay, genes or machines. Everything specific
 * to a scene (step labels, the order of takeover, the captions) comes from the
 * config, so the same piece can be reused with different content.
 *
 *   new ClosingCircle(figureElement, config)
 *
 * Inside the figure, the component looks for:
 *   [data-cc-stage]     where the drawing goes (required)
 *   [data-cc-caption]   caption for the current state
 *   [data-cc-meter]     closure meter
 *   [data-cc-readout]   text readout, e.g. "3 of 8"
 *   [data-cc-play] [data-cc-next] [data-cc-reset]   buttons
 *
 * Config:
 *   steps     array of short labels, one per step, clockwise from the top
 *   order     the order in which steps are taken over (indexes into steps)
 *   captions  { start, foothold, first, another, more: {k: text}, closed, dropped }
 *   label     one-line description of the figure for screen readers
 *   pace      milliseconds each state is held during Play (default 2400)
 *   hash      set false to stop the figure writing #step=N to the address bar
 */
(function (global) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var CX = 320, CY = 320;          // centre of a 640 x 640 drawing
  var R_IN = 150, R_OUT = 216;     // the ring of stones
  var R_TRACK = 124;               // the loop drawn inside the ring
  var R_FRAME = 292;               // the outer frame the supports hang from
  var GAP = 2.4;                   // joint between stones, in degrees

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG_NS, name);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) node.setAttribute(key, attrs[key]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  // Angles run clockwise from the top, in degrees.
  function polar(r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }

  function pt(p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }

  function arc(r, a0, a1) {
    return 'M ' + pt(polar(r, a0)) + ' A ' + r + ' ' + r + ' 0 0 1 ' + pt(polar(r, a1));
  }

  function sector(r1, r2, a0, a1) {
    return 'M ' + pt(polar(r2, a0)) +
      ' A ' + r2 + ' ' + r2 + ' 0 0 1 ' + pt(polar(r2, a1)) +
      ' L ' + pt(polar(r1, a1)) +
      ' A ' + r1 + ' ' + r1 + ' 0 0 0 ' + pt(polar(r1, a0)) + ' Z';
  }

  /* The sequence of states the figure moves through:
   *   0        every step run by the first system
   *   1        the first step to change is shared by both systems (overlap)
   *   2..n+1   one more step taken over in each state; the last closes the circle
   *   n+2      the supports have fallen away
   */
  function buildStates(config) {
    var n = config.steps.length;
    var order = config.order;
    var c = config.captions || {};
    var states = [];

    states.push({ taken: [], overlap: null, caption: c.start });
    states.push({ taken: [], overlap: order[0], caption: c.foothold, hold: 3600 });
    for (var k = 1; k <= n; k++) {
      var state = { taken: order.slice(0, k), overlap: null };
      if (k === n) {
        state.caption = c.closed;
        state.closed = true;
        state.hold = 6600;
      } else if (k === 1) {
        state.caption = c.first;
      } else {
        state.caption = (c.more && c.more[k]) || c.another;
      }
      states.push(state);
    }
    states.push({ taken: order.slice(), overlap: null, closed: true, dropped: true, caption: c.dropped });
    return states;
  }

  function checkConfig(config) {
    if (!config || !config.steps || !config.steps.length) {
      throw new Error('ClosingCircle: config.steps must list at least one step.');
    }
    var n = config.steps.length;
    var seen = {};
    var ok = config.order && config.order.length === n && config.order.every(function (i) {
      var fresh = i >= 0 && i < n && i === Math.floor(i) && !seen[i];
      seen[i] = true;
      return fresh;
    });
    if (!ok) {
      throw new Error('ClosingCircle: config.order must name each of the ' + n + ' steps exactly once.');
    }
  }

  function ClosingCircle(root, config) {
    checkConfig(config);
    this.root = root;
    this.config = config;
    this.n = config.steps.length;
    this.states = buildStates(config);
    this.index = 0;
    this.playing = false;
    this.timer = null;

    this.stage = root.querySelector('[data-cc-stage]');
    this.captionEl = root.querySelector('[data-cc-caption]');
    this.meterEl = root.querySelector('[data-cc-meter]');
    this.readoutEl = root.querySelector('[data-cc-readout]');
    this.playBtn = root.querySelector('[data-cc-play]');
    this.nextBtn = root.querySelector('[data-cc-next]');
    this.resetBtn = root.querySelector('[data-cc-reset]');
    if (!this.stage) throw new Error('ClosingCircle: the figure needs a [data-cc-stage] element.');

    this.draw();
    this.bind();

    var match = /step=(\d+)/.exec(global.location ? global.location.hash : '');
    this.go(match ? parseInt(match[1], 10) : 0, { snap: true, silent: true });
  }

  ClosingCircle.prototype.draw = function () {
    var n = this.n;
    var span = 360 / n;
    var i, k;

    var svg = el('svg', { 'class': 'cc', viewBox: '0 0 640 640', role: 'img' });
    this.titleEl = el('title', {}, svg);

    // Outer frame and supports: what the first system provides.
    var scaffold = el('g', { 'class': 'cc-scaffold' }, svg);
    this.supportEls = [];
    for (i = 0; i < n; i++) {
      var from = polar(R_FRAME, i * span);
      var to = polar(R_FRAME, (i + 1) * span);
      var beam = el('line', {
        'class': 'cc-beam',
        x1: from[0].toFixed(2), y1: from[1].toFixed(2),
        x2: to[0].toFixed(2), y2: to[1].toFixed(2)
      }, scaffold);
      beam.setAttribute('style', fall(i * 2 + 1));
    }
    for (i = 0; i < n; i++) {
      var c = i * span;
      var support = el('g', { 'class': 'cc-support', 'data-slack': 'false' }, scaffold);
      var top = polar(R_FRAME, c);
      var foot = polar(R_OUT + 6, c);
      var padA = polar(R_OUT + 6, c - 4.5);
      var padB = polar(R_OUT + 6, c + 4.5);
      el('line', { x1: top[0].toFixed(2), y1: top[1].toFixed(2), x2: foot[0].toFixed(2), y2: foot[1].toFixed(2) }, support);
      el('line', { x1: padA[0].toFixed(2), y1: padA[1].toFixed(2), x2: padB[0].toFixed(2), y2: padB[1].toFixed(2) }, support);
      support.setAttribute('style', fall(i * 2));
      this.supportEls.push(support);
    }

    // The loop inside the ring, with its direction of travel.
    el('circle', { 'class': 'cc-track', cx: CX, cy: CY, r: R_TRACK }, svg);
    for (i = 0; i < n; i++) {
      var joint = (i + 0.5) * span;
      el('polyline', {
        'class': 'cc-arrow',
        points: [polar(R_TRACK - 6, joint - 2.6), polar(R_TRACK, joint + 1.2), polar(R_TRACK + 6, joint - 2.6)]
          .map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ')
      }, svg);
    }
    var runner = el('g', { 'class': 'cc-runner' }, svg);
    var start = polar(R_TRACK, 0);
    el('circle', { cx: start[0].toFixed(2), cy: start[1].toFixed(2), r: 7 }, runner);

    // The steps, drawn as the stones of a ring.
    this.stepEls = [];
    for (i = 0; i < n; i++) {
      var mid = i * span;
      var a0 = mid - span / 2 + GAP / 2;
      var a1 = mid + span / 2 - GAP / 2;
      var step = el('g', { 'class': 'cc-step', 'data-status': 'first' }, svg);
      el('path', { 'class': 'cc-stone', d: sector(R_IN, R_OUT, a0, a1) }, step);
      var layers = el('g', { 'class': 'cc-layers' }, step);
      for (k = 1; k <= 4; k++) {
        el('path', { d: arc(R_IN + k * (R_OUT - R_IN) / 5, a0, a1) }, layers);
      }
      el('path', { 'class': 'cc-core', d: sector(R_IN, R_OUT, a0, a1) }, step);
      var at = polar((R_IN + R_OUT) / 2, mid);
      var letter = el('text', { 'class': 'cc-letter', x: at[0].toFixed(2), y: at[1].toFixed(2) }, step);
      letter.textContent = this.config.steps[i];
      this.stepEls.push(step);
    }

    this.countEl = el('text', { 'class': 'cc-count', x: CX, y: CY }, svg);

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;

    if (this.meterEl) {
      while (this.meterEl.firstChild) this.meterEl.removeChild(this.meterEl.firstChild);
      this.meterEl.setAttribute('role', 'meter');
      this.meterEl.setAttribute('aria-valuemin', '0');
      this.meterEl.setAttribute('aria-valuemax', String(n));
      this.cellEls = [];
      for (i = 0; i < n; i++) {
        var cell = document.createElement('span');
        cell.className = 'meter__cell';
        this.meterEl.appendChild(cell);
        this.cellEls.push(cell);
      }
    }
  };

  // Each piece of scaffolding falls a little differently. Fixed, not random,
  // so the figure looks the same every time it runs.
  function fall(seed) {
    var dx = ((seed * 37) % 41) - 20;
    var rot = ((seed * 53) % 37) - 18;
    var delay = ((seed * 5) % 16) * 0.04;
    return '--dx:' + dx + 'px;--rot:' + rot + 'deg;--delay:' + delay.toFixed(2) + 's';
  }

  ClosingCircle.prototype.bind = function () {
    var self = this;
    if (this.playBtn) this.playBtn.addEventListener('click', function () {
      if (self.playing) self.pause(); else self.play();
    });
    if (this.nextBtn) this.nextBtn.addEventListener('click', function () {
      self.pause();
      self.go(self.index + 1);
    });
    if (this.resetBtn) this.resetBtn.addEventListener('click', function () {
      self.pause();
      self.go(0, { snap: true });
    });
  };

  ClosingCircle.prototype.go = function (index, opts) {
    opts = opts || {};
    var self = this;
    var last = this.states.length - 1;
    index = Math.max(0, Math.min(last, index));
    var state = this.states[index];
    var done = state.taken.length;
    this.index = index;

    if (opts.snap) this.root.classList.add('is-snapping');

    this.stepEls.forEach(function (step, i) {
      var status = state.taken.indexOf(i) !== -1 ? 'second' : (state.overlap === i ? 'overlap' : 'first');
      step.setAttribute('data-status', status);
      self.supportEls[i].setAttribute('data-slack', status === 'second' ? 'true' : 'false');
    });
    this.svg.setAttribute('data-closed', state.closed ? 'true' : 'false');
    this.svg.setAttribute('data-dropped', state.dropped ? 'true' : 'false');

    var readout = done + ' of ' + this.n;
    this.countEl.textContent = readout;
    if (this.readoutEl) this.readoutEl.textContent = readout;
    if (this.meterEl) {
      this.meterEl.setAttribute('aria-valuenow', String(done));
      this.meterEl.setAttribute('aria-valuetext', readout);
      this.cellEls.forEach(function (cell, i) {
        cell.setAttribute('data-on', i < done ? 'true' : 'false');
      });
    }
    if (this.captionEl) this.captionEl.textContent = state.caption || '';
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') +
      readout + ' steps have changed hands. ' + (state.caption || '');

    this.syncButtons();

    if (!opts.silent && this.config.hash !== false && global.history && global.history.replaceState) {
      // Some embedded previews refuse address-bar changes. The figure works without them.
      try { global.history.replaceState(null, '', '#step=' + index); } catch (e) { /* ignore */ }
    }

    if (opts.snap) {
      void this.svg.getBoundingClientRect();
      global.requestAnimationFrame(function () {
        global.requestAnimationFrame(function () {
          self.root.classList.remove('is-snapping');
        });
      });
    }
  };

  ClosingCircle.prototype.syncButtons = function () {
    var last = this.states.length - 1;
    if (this.playBtn) {
      this.playBtn.textContent = this.playing ? 'Pause' : (this.index >= last ? 'Play again' : 'Play');
    }
    if (this.nextBtn) this.nextBtn.disabled = this.index >= last;
    if (this.resetBtn) this.resetBtn.disabled = this.index === 0;
  };

  ClosingCircle.prototype.play = function () {
    var last = this.states.length - 1;
    var wait = 0;
    if (this.index >= last) {
      this.go(0, { snap: true });
      wait = 600;
    }
    this.playing = true;
    this.syncButtons();
    this.tick(wait);
  };

  ClosingCircle.prototype.pause = function () {
    this.playing = false;
    global.clearTimeout(this.timer);
    this.syncButtons();
  };

  ClosingCircle.prototype.tick = function (delay) {
    var self = this;
    var last = this.states.length - 1;
    global.clearTimeout(this.timer);
    this.timer = global.setTimeout(function () {
      if (!self.playing) return;
      self.go(self.index + 1);
      if (self.index >= last) {
        self.pause();
        return;
      }
      self.tick(self.states[self.index].hold || self.config.pace || 2400);
    }, delay);
  };

  ClosingCircle.buildStates = buildStates;
  global.ClosingCircle = ClosingCircle;
})(typeof window !== 'undefined' ? window : this);
