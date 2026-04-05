/**
 * GameLoop — requestAnimationFrame loop with delta time clamping.
 * Register update functions via addSystem(). They receive (dt) each frame.
 */
export class GameLoop {
  constructor() {
    /** @type {Array<Function>} */
    this._systems = [];
    this._lastTime = 0;
    this._running = false;
    this._paused = false;
    this._boundTick = this._tick.bind(this);
    this._rafId = null;
  }

  /**
   * Register an update function to be called every frame.
   * @param {Function} fn — receives (dt: number) where dt is clamped delta in seconds
   */
  addSystem(fn) {
    this._systems.push(fn);
  }

  /**
   * Remove a previously registered system.
   * @param {Function} fn
   */
  removeSystem(fn) {
    const idx = this._systems.indexOf(fn);
    if (idx !== -1) this._systems.splice(idx, 1);
  }

  /** Start the loop. */
  start() {
    this._running = true;
    this._paused = false;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._boundTick);
  }

  /** Completely stop the loop. */
  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** Pause (keeps rAF alive but skips updates). */
  pause() {
    this._paused = true;
  }

  /** Resume from pause. */
  resume() {
    this._paused = false;
    this._lastTime = performance.now();
  }

  get isRunning() { return this._running; }
  get isPaused() { return this._paused; }

  /** @private */
  _tick(time) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(this._boundTick);

    if (this._paused) return;

    const dt = (time - this._lastTime) / 1000;
    this._lastTime = time;
    const safeDt = Math.min(dt, 0.1); // Clamp to prevent physics explosions

    for (const system of this._systems) {
      system(safeDt);
    }
  }
}
