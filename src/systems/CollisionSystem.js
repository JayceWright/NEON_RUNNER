/**
 * CollisionSystem — Checks if player stands on valid ground, triggers death.
 */
import { CONFIG } from '../config.js';

export class CollisionSystem {
  /**
   * @param {import('../entities/Player.js').Player} player
   * @param {import('../world/PlatformManager.js').PlatformManager} platformManager
   * @param {import('../utils/EventBus.js').EventBus} bus
   */
  constructor(player, platformManager, bus) {
    this.player = player;
    this.platforms = platformManager;
    this.bus = bus;
  }

  /**
   * Called each frame after player and platform updates.
   * @param {number} dt
   * @returns {{ standValid: boolean, justLanded: boolean }}
   */
  check(dt) {
    const p = this.player;
    const standValid = this.platforms.checkGround(p.targetX, p.position.z, p.isJumping);

    // Death: on ground, y=0, no platform below
    if (!p.isJumping && p.position.y === 0 && !standValid) {
      if (!p.godMode) {
        this.bus.emit('player:died');
      }
    }

    return standValid;
  }
}
