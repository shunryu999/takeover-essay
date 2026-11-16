/* Loop forms
 *
 * A soup in which reactions branch out from one plentiful ingredient.
 * Substances are drawn as letters: the more letters, the more of that
 * substance. When a product far along one branch turns out to make something
 * near its root, that branch has become a loop.
 *
 * This is an illustration, not a simulation. The amounts shown in each state
 * come from the config; nothing is computed from reaction rates.
 *
 *   new LoopForms(figureElement, config)
 *
 * Needs figure-player.js loaded first. Inside the figure it looks for
 * [data-fig-stage] (required), plus the caption and buttons FigurePlayer handles.
 *
 * Config:
 *   species    [{ id: 'A', x: 135, y: 300 }, ...]   positions in a 640 x 640 drawing
 *   reactions  [{ from: 'A', to: 'B', bend: 14 }, ...]   bend curves the arrow, in px
 *   loop       ['A', 'C', 'G', 'J']   the substances that end up forming the loop,
 *              in order; each consecutive pair, and last-to-first, must be a reaction
 *   states     [{ counts: { A: 16 }, on: ['A>B'], closed: false, caption: '...', hold: ms }, ...]
 *              counts: how many letters of each substance; on: reactions under way
 *   label      one-line description of the figure for screen readers
 *   pace, hash as for FigurePlayer
 */
(function (global) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SPREAD = 19.5;      // spacing between letters in a cluster
  var PAD = 17;           // clear space around a cluster
  var GOLDEN = 137.508;   // degrees; packs letters evenly around a centre

  // Outline of the pool, as points a smooth closed curve is drawn through.
  var POOL = [[58, 128], [196, 44], [420, 34], [586, 104], [616, 318], [590, 520],
              [404, 618], [186, 616], [42, 486], [24, 304]];

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG_NS, name);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) node.setAttribute(key, attrs[key]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  function f(n) { return n.toFixed(1); }

  function unit(dx, dy) {
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / len, dy / len];
  }

  // A smooth closed curve through a list of points (Catmull-Rom as Beziers).
  function smoothClosed(points) {
    var n = points.length;
    var d = 'M ' + f(points[0][0]) + ' ' + f(points[0][1]);
    for (var i = 0; i < n; i++) {
      var p0 = points[(i - 1 + n) % n], p1 = points[i];
      var p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
      d += ' C ' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) +
           ', ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) +
           ', ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d + ' Z';
  }

  // How far a cluster of n letters reaches from its centre.
  function reach(n) {
    return n <= 0 ? PAD : SPREAD * Math.sqrt(n - 1) + PAD;
  }

  // Where the i-th letter of a cluster sits, relative to the centre.
  function seat(i) {
    if (i === 0) return [0, 0];
    var r = SPREAD * Math.sqrt(i);
    var a = i * GOLDEN * Math.PI / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  }

  function rxId(rx) { return rx.from + '>' + rx.to; }

  function checkConfig(config) {
    function fail(msg) { throw new Error('LoopForms: ' + msg); }
    if (!config || !config.species || !config.species.length) fail('config.species must list at least one substance.');
    if (!config.states || !config.states.length) fail('config.states must list at least one state.');
    var known = {};
    config.species.forEach(function (s) {
      if (known[s.id]) fail('substance "' + s.id + '" is listed twice.');
      known[s.id] = true;
    });
    var rx = {};
    (config.reactions || []).forEach(function (r) {
      if (!known[r.from] || !known[r.to]) fail('reaction ' + rxId(r) + ' names an unknown substance.');
      rx[rxId(r)] = true;
    });
    var loop = config.loop || [];
    loop.forEach(function (id, i) {
      var next = loop[(i + 1) % loop.length];
      if (!rx[id + '>' + next]) fail('the loop needs a reaction ' + id + '>' + next + '.');
    });
    config.states.forEach(function (state, i) {
      Object.keys(state.counts || {}).forEach(function (id) {
        if (!known[id]) fail('state ' + i + ' counts an unknown substance "' + id + '".');
      });
      (state.on || []).forEach(function (id) {
        if (!rx[id]) fail('state ' + i + ' turns on an unknown reaction "' + id + '".');
      });
    });
  }

  function LoopForms(root, config) {
    checkConfig(config);
    if (!global.FigurePlayer) throw new Error('LoopForms: load figure-player.js first.');
    this.root = root;
    this.config = config;
    this.states = config.states;
    this.loop = config.loop || [];
    this.wasClosed = false;
    this.running = false;

    this.stage = root.querySelector('[data-fig-stage]');
    if (!this.stage) throw new Error('LoopForms: the figure needs a [data-fig-stage] element.');

    this.draw();

    var states = this.states;
    this.player = new global.FigurePlayer(root, {
      count: states.length,
      render: this.render.bind(this),
      caption: function (i) { return states[i].caption; },
      hold: function (i) { return states[i].hold; },
      pace: config.pace,
      hash: config.hash
    });
    this.player.start();
  }

  LoopForms.prototype.draw = function () {
    var self = this;
    var config = this.config;
    var svg = el('svg', { 'class': 'lf', viewBox: '0 0 640 640', role: 'img' });
    this.titleEl = el('title', {}, svg);

    el('path', { 'class': 'lf-pool', d: smoothClosed(POOL) }, svg);

    // The most letters each substance ever shows, so every letter can be made once.
    var most = {};
    this.states.forEach(function (state) {
      Object.keys(state.counts || {}).forEach(function (id) {
        most[id] = Math.max(most[id] || 0, state.counts[id]);
      });
    });

    this.species = {};
    config.species.forEach(function (s) {
      self.species[s.id] = { id: s.id, x: s.x, y: s.y, now: 0, inLoop: self.loop.indexOf(s.id) !== -1, glyphs: [] };
    });

    // Reactions go under the letters.
    var loopPairs = {};
    this.loop.forEach(function (id, i) { loopPairs[id + '>' + self.loop[(i + 1) % self.loop.length]] = true; });
    var rxLayer = el('g', {}, svg);
    this.reactions = (config.reactions || []).map(function (r) {
      var group = el('g', { 'class': 'lf-rx', 'data-state': 'off' }, rxLayer);
      var rx = {
        id: rxId(r), from: r.from, to: r.to, bend: r.bend || 0, inLoop: !!loopPairs[rxId(r)],
        group: group,
        line: el('path', { 'class': 'lf-rx-line' }, group),
        flow: el('path', { 'class': 'lf-rx-flow' }, group),
        head: el('polyline', { 'class': 'lf-rx-head' }, group)
      };
      self.place(rx, reach(most[r.from] || 1), reach(most[r.to] || 1));
      return rx;
    });

    // The letters.
    config.species.forEach(function (s) {
      var sp = self.species[s.id];
      sp.group = el('g', { 'class': 'lf-species', 'data-dim': 'false', transform: 'translate(' + s.x + ' ' + s.y + ')' }, svg);
      for (var i = 0; i < (most[s.id] || 0); i++) {
        var at = seat(i);
        var glyph = el('text', { 'class': 'lf-glyph', 'data-on': 'false', x: f(at[0]), y: f(at[1]) }, sp.group);
        glyph.textContent = s.label || s.id;
        glyph.setAttribute('style', '--tilt:' + (((i * 47 + 9) % 21) - 10) + 'deg;--delay:' + ((i % 6) * 0.06).toFixed(2) + 's');
        sp.glyphs.push(glyph);
      }
    });

    // The route the runner takes once the loop has closed: centre to centre.
    if (this.loop.length) {
      var first = this.species[this.loop[0]];
      var route = 'M ' + f(first.x) + ' ' + f(first.y);
      this.loop.forEach(function (id, i) {
        var next = self.loop[(i + 1) % self.loop.length];
        var rx = self.reactions.filter(function (r) { return r.id === id + '>' + next; })[0];
        var c = self.control(rx);
        var to = self.species[next];
        route += ' Q ' + f(c[0]) + ' ' + f(c[1]) + ', ' + f(to.x) + ' ' + f(to.y);
      });
      this.routeEl = el('path', { d: route, fill: 'none', stroke: 'none' }, svg);
      this.runnerEl = el('circle', { 'class': 'lf-runner', r: 7, cx: f(first.x), cy: f(first.y) }, svg);
    }

    while (this.stage.firstChild) this.stage.removeChild(this.stage.firstChild);
    this.stage.appendChild(svg);
    this.svg = svg;
  };

  // The point an arrow bows towards.
  LoopForms.prototype.control = function (rx) {
    var s = this.species[rx.from], t = this.species[rx.to];
    var u = unit(t.x - s.x, t.y - s.y);
    return [(s.x + t.x) / 2 - u[1] * rx.bend, (s.y + t.y) / 2 + u[0] * rx.bend];
  };

  // Draw an arrow from the edge of one cluster to the edge of the next.
  LoopForms.prototype.place = function (rx, fromReach, toReach) {
    var s = this.species[rx.from], t = this.species[rx.to];
    var c = this.control(rx);
    var out = unit(c[0] - s.x, c[1] - s.y);
    var back = unit(c[0] - t.x, c[1] - t.y);
    var start = [s.x + out[0] * fromReach, s.y + out[1] * fromReach];
    var end = [t.x + back[0] * toReach, t.y + back[1] * toReach];
    var d = 'M ' + f(start[0]) + ' ' + f(start[1]) + ' Q ' + f(c[0]) + ' ' + f(c[1]) + ', ' + f(end[0]) + ' ' + f(end[1]);
    rx.line.setAttribute('d', d);
    rx.flow.setAttribute('d', d);

    // Arrowhead: two short strokes folded back from the tip.
    var size = 10, fold = 0.5;
    var wings = [fold, -fold].map(function (a) {
      var x = back[0] * Math.cos(a) - back[1] * Math.sin(a);
      var y = back[0] * Math.sin(a) + back[1] * Math.cos(a);
      return f(end[0] + x * size) + ',' + f(end[1] + y * size);
    });
    rx.head.setAttribute('points', wings[0] + ' ' + f(end[0]) + ',' + f(end[1]) + ' ' + wings[1]);
  };

  // Show one state. FigurePlayer calls this; it handles timing and controls.
  LoopForms.prototype.render = function (index, how) {
    var self = this;
    var state = this.states[index];
    var counts = state.counts || {};
    var on = state.on || [];
    var closed = !!state.closed;

    Object.keys(this.species).forEach(function (id) {
      var sp = self.species[id];
      sp.now = counts[id] || 0;
      sp.glyphs.forEach(function (glyph, i) {
        glyph.setAttribute('data-on', i < sp.now ? 'true' : 'false');
      });
      sp.group.setAttribute('data-dim', closed && !sp.inLoop ? 'true' : 'false');
    });

    this.reactions.forEach(function (rx) {
      var live = on.indexOf(rx.id) !== -1;
      rx.group.setAttribute('data-state', !live ? 'off' : (closed && rx.inLoop ? 'loop' : 'on'));
      if (live) self.place(rx, reach(self.species[rx.from].now), reach(self.species[rx.to].now));
    });

    this.svg.setAttribute('data-closed', closed ? 'true' : 'false');
    // Alternating this restarts the travelling dots on each new state.
    this.svg.setAttribute('data-beat', String(index % 2));
    this.titleEl.textContent = (this.config.label ? this.config.label + ' ' : '') + (state.caption || '');

    if (this.runnerEl) {
      var still = how && how.snap;
      var calm = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!closed || still || calm) {
        this.park();
      } else if (!this.wasClosed) {
        this.lap();
      }
    }
    this.wasClosed = closed;
  };

  // Put the runner back at the start of the loop and stop it.
  LoopForms.prototype.park = function () {
    this.running = false;
    this.svg.setAttribute('data-running', 'false');
    global.clearTimeout(this.lapTimer);
    if (this.frame) global.cancelAnimationFrame(this.frame);
    var first = this.species[this.loop[0]];
    this.runnerEl.setAttribute('cx', f(first.x));
    this.runnerEl.setAttribute('cy', f(first.y));
  };

  // Send the runner twice round the loop, once the closing arrow has appeared.
  LoopForms.prototype.lap = function () {
    var self = this;
    var route = this.routeEl;
    var total = route.getTotalLength();
    var laps = 2, lapTime = 2600, began = null;
    this.park();
    this.running = true;
    this.svg.setAttribute('data-running', 'true');

    function step(now) {
      if (!self.running) return;
      if (began === null) began = now;
      var p = Math.min(1, (now - began) / (laps * lapTime));
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var at = route.getPointAtLength(p >= 1 ? 0 : (eased * laps * total) % total);
      self.runnerEl.setAttribute('cx', f(at.x));
      self.runnerEl.setAttribute('cy', f(at.y));
      if (p < 1) {
        self.frame = global.requestAnimationFrame(step);
      } else {
        self.running = false;
        self.svg.setAttribute('data-running', 'false');
      }
    }
    this.lapTimer = global.setTimeout(function () {
      if (self.running) self.frame = global.requestAnimationFrame(step);
    }, 800);
  };

  LoopForms.reach = reach;
  LoopForms.checkConfig = checkConfig;
  global.LoopForms = LoopForms;
})(typeof window !== 'undefined' ? window : this);
