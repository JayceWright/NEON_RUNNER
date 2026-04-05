/**
 * GameMode — Base class for game modes.
 * Provides the interface that all modes must implement.
 */
export class GameMode {
  /**
   * @param {string} name — Mode display name
   */
  constructor(name) {
    this.name = name;
  }

  /** Initialize the mode. */
  init() { throw new Error('GameMode.init() not implemented'); }

  /** Start gameplay. */
  start() { throw new Error('GameMode.start() not implemented'); }

  /** Called each frame. @param {number} dt */
  update(dt) { throw new Error('GameMode.update() not implemented'); }

  /** Handle player death. */
  onDeath() { throw new Error('GameMode.onDeath() not implemented'); }

  /** Reset the mode. */
  reset() { throw new Error('GameMode.reset() not implemented'); }

  /** Cleanup. */
  destroy() {}
}
