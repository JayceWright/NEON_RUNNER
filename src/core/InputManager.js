/**
 * InputManager — Keyboard + Touch input, emitting events via EventBus.
 *
 * Events emitted:
 *   'input:jump'      — Space / W / ArrowUp / swipe-up
 *   'input:left'      — A / ArrowLeft / swipe-left
 *   'input:right'     — D / ArrowRight / swipe-right
 *   'input:pause'     — Escape / P
 *   'input:restart'   — R
 *   'input:godmode'   — G
 *   'input:start'     — Space / Enter (when on start/gameover screen)
 */
import { CONFIG } from '../config.js';

export class InputManager {
  /**
   * @param {import('../utils/EventBus.js').EventBus} bus
   */
  constructor(bus) {
    this.bus = bus;
    this.enabled = true;

    // Touch state
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._touchActive = false;

    // Bind handlers
    this._onKey = this._onKey.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    // Attach
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd, { passive: false });
  }

  /** @private */
  _onKey(e) {
    if (!this.enabled) return;

    // Pause
    if (e.code === 'Escape' || e.code === 'KeyP') {
      this.bus.emit('input:pause');
      return;
    }

    // Start / menu actions (always available)
    if (e.code === 'Space' || e.code === 'Enter') {
      this.bus.emit('input:start');
    }

    // Restart
    if (e.code === 'KeyR') {
      this.bus.emit('input:restart');
      return;
    }

    // God Mode
    if (e.code === 'KeyG') {
      this.bus.emit('input:godmode');
      return;
    }

    // Movement
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.bus.emit('input:left');
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.bus.emit('input:right');
    } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.bus.emit('input:jump');
    }
  }

  /** @private */
  _onTouchStart(e) {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
    this._touchActive = true;
  }

  /** @private */
  _onTouchMove(e) {
    if (!this.enabled || !this._touchActive) return;

    const dx = e.touches[0].clientX - this._touchStartX;
    const dy = e.touches[0].clientY - this._touchStartY;
    const threshold = CONFIG.TOUCH.SWIPE_THRESHOLD;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > threshold) {
          this.bus.emit('input:right');
          this._touchActive = false;
        } else if (dx < -threshold) {
          this.bus.emit('input:left');
          this._touchActive = false;
        }
      } else {
        // Vertical swipe (up)
        if (dy < -threshold) {
          this.bus.emit('input:jump');
          this._touchActive = false;
        }
      }
    }

    if (e.cancelable) e.preventDefault();
  }

  /** @private */
  _onTouchEnd() {
    this._touchActive = false;
  }

  /** Cleanup all listeners. */
  destroy() {
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
  }
}
