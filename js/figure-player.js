/* Figure player
 *
 * The controls every stepped figure shares: Play / Pause, Next step,
 * Start over, a caption that follows the current state, and a #step=N
 * address so a figure can be opened at a given state.
 *
 * A figure owns its drawing and tells the player how many states it has and
 * how to show each one:
 *
 *   var player = new FigurePlayer(figureElement, {
 *     count:   number of states,
 *     render:  function (index, { snap }) { ...update the drawing... },
 *     caption: function (index) { return 'text for this state'; },
 *     hold:    function (index) { return milliseconds, or nothing for the default },
 *     pace:    default milliseconds per state during Play (2400),
 *     hash:    false to stop the figure writing #step=N to the address bar
 *   });
 *   player.start();
 *
 * Inside the figure, the player looks for:
 *   [data-fig-caption]  [data-fig-play]  [data-fig-next]  [data-fig-reset]
 * All are optional.
 */
(function (global) {
  'use strict';

  function FigurePlayer(root, opts) {
    this.root = root;
    this.opts = opts;
    this.count = opts.count;
    this.index = 0;
    this.playing = false;
    this.timer = null;

    this.captionEl = root.querySelector('[data-fig-caption]');
    this.playBtn = root.querySelector('[data-fig-play]');
    this.nextBtn = root.querySelector('[data-fig-next]');
    this.resetBtn = root.querySelector('[data-fig-reset]');

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
  }

  // Show the first state, or the one named in the address (#step=N).
  FigurePlayer.prototype.start = function () {
    var match = /step=(\d+)/.exec(global.location ? global.location.hash : '');
    this.go(match ? parseInt(match[1], 10) : 0, { snap: true, silent: true });
  };

  // snap: jump without animating. silent: leave the address bar alone.
  FigurePlayer.prototype.go = function (index, how) {
    how = how || {};
    var self = this;
    index = Math.max(0, Math.min(this.count - 1, index));
    this.index = index;

    if (how.snap) this.root.classList.add('is-snapping');

    this.opts.render(index, { snap: !!how.snap });
    if (this.captionEl && this.opts.caption) this.captionEl.textContent = this.opts.caption(index) || '';
    this.syncButtons();

    if (!how.silent && this.opts.hash !== false && global.history && global.history.replaceState) {
      // Some embedded previews refuse address-bar changes. The figure works without them.
      try { global.history.replaceState(null, '', '#step=' + index); } catch (e) { /* ignore */ }
    }

    if (how.snap) {
      void this.root.getBoundingClientRect();
      global.requestAnimationFrame(function () {
        global.requestAnimationFrame(function () {
          self.root.classList.remove('is-snapping');
        });
      });
    }
  };

  FigurePlayer.prototype.syncButtons = function () {
    var last = this.count - 1;
    if (this.playBtn) {
      this.playBtn.textContent = this.playing ? 'Pause' : (this.index >= last ? 'Play again' : 'Play');
    }
    if (this.nextBtn) this.nextBtn.disabled = this.index >= last;
    if (this.resetBtn) this.resetBtn.disabled = this.index === 0;
  };

  FigurePlayer.prototype.play = function () {
    var wait = 0;
    if (this.index >= this.count - 1) {
      this.go(0, { snap: true });
      wait = 600;
    }
    this.playing = true;
    this.syncButtons();
    this.tick(wait);
  };

  FigurePlayer.prototype.pause = function () {
    this.playing = false;
    global.clearTimeout(this.timer);
    this.syncButtons();
  };

  FigurePlayer.prototype.tick = function (delay) {
    var self = this;
    var last = this.count - 1;
    global.clearTimeout(this.timer);
    this.timer = global.setTimeout(function () {
      if (!self.playing) return;
      self.go(self.index + 1);
      if (self.index >= last) {
        self.pause();
        return;
      }
      var hold = self.opts.hold ? self.opts.hold(self.index) : 0;
      self.tick(hold || self.opts.pace || 2400);
    }, delay);
  };

  global.FigurePlayer = FigurePlayer;
})(typeof window !== 'undefined' ? window : this);
