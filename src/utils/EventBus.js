/**
 * EventBus — Simple pub/sub for decoupled inter-module communication.
 *
 * Usage:
 *   bus.on('player:died', (data) => { ... });
 *   bus.emit('player:died', { score: 1234 });
 *   bus.off('player:died', handler);
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);

    // Return unsubscribe function for convenience
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event, but only fire once.
   * @param {string} event
   * @param {Function} callback
   */
  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this._listeners.delete(event);
    }
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const set = this._listeners.get(event);
    if (set) {
      for (const fn of set) {
        try {
          fn(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      }
    }
  }

  /** Remove all listeners. */
  clear() {
    this._listeners.clear();
  }
}
