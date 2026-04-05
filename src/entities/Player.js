/**
 * Player — Player entity: Group, physics, lane movement, jump logic.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { PlayerModel } from './PlayerModel.js';

export class Player {
  /**
   * @param {THREE.Scene} scene
   * @param {import('../utils/EventBus.js').EventBus} bus
   */
  constructor(scene, bus) {
    this.bus = bus;

    // Three.js group
    this.group = new THREE.Group();

    // Temp wireframe placeholder (shown during loading)
    const tGeo = new THREE.BoxGeometry(1, 1.5, 1);
    const tMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const tMesh = new THREE.Mesh(tGeo, tMat);
    this.group.add(tMesh);

    // Self-illuminating lights on the character
    const charGlow = new THREE.PointLight(
      CONFIG.LIGHTING.CHAR_GLOW_COLOR,
      CONFIG.LIGHTING.CHAR_GLOW_INTENSITY,
      CONFIG.LIGHTING.CHAR_GLOW_DISTANCE
    );
    charGlow.position.set(0, 1, 0);
    this.group.add(charGlow);

    const headGlow = new THREE.PointLight(
      CONFIG.LIGHTING.HEAD_GLOW_COLOR,
      CONFIG.LIGHTING.HEAD_GLOW_INTENSITY,
      CONFIG.LIGHTING.HEAD_GLOW_DISTANCE
    );
    headGlow.position.set(0, 4, 0);
    this.group.add(headGlow);

    scene.add(this.group);

    // Model
    this.model = new PlayerModel(this.group);

    // State
    this.speed = CONFIG.PLAYER.INITIAL_SPEED;
    this.lane = 0;       // -1, 0, 1
    this._targetX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.jumpBufferTime = 0;
    this.godMode = false;
  }

  /** Reset to initial state for new game. */
  reset() {
    this.speed = CONFIG.PLAYER.INITIAL_SPEED;
    this.lane = 0;
    this._targetX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.jumpBufferTime = 0;
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.model.restoreBaseline();
  }

  /**
   * Load the 3D model.
   * @param {Function} onProgress
   * @returns {Promise<void>}
   */
  async loadModel(onProgress) {
    await this.model.load(onProgress);
  }

  /**
   * Execute a jump (called when grounded or from buffer).
   */
  executeJump() {
    this.velocityY = CONFIG.PLAYER.JUMP_FORCE;
    this.isJumping = true;
    this.jumpBufferTime = 0;
    this.model.flashJump();
    this.model.playJump();
  }

  /**
   * Buffer a jump input for when we land.
   */
  bufferJump() {
    this.jumpBufferTime = performance.now();
  }

  /**
   * Move to left lane.
   */
  moveLeft() {
    if (this.lane > -1) this.lane--;
  }

  /**
   * Move to right lane.
   */
  moveRight() {
    if (this.lane < 1) this.lane++;
  }

  /**
   * Update player physics and animation each frame.
   * @param {number} dt — clamped delta time
   */
  update(dt) {
    // Forward movement
    this.group.position.z -= this.speed * dt;
    this.speed += dt * CONFIG.PLAYER.SPEED_INCREMENT;

    // Lane lerp
    this._targetX = this.lane * CONFIG.PLAYER.LANE_WIDTH;
    this.group.position.x += (this._targetX - this.group.position.x) * CONFIG.PLAYER.LANE_LERP * dt;

    // Jump physics
    if (this.isJumping) {
      this.group.position.y += this.velocityY * dt;
      this.velocityY += CONFIG.PLAYER.GRAVITY * dt;

      if (this.group.position.y <= 0) {
        this.group.position.y = 0;
        this.isJumping = false;
        this.velocityY = 0;
        this.bus.emit('player:landed');
      }
    }

    // Animation
    this.model.update(dt, this.speed);

    // Lock rotation when running (not jumping) to prevent animation-driven spin
    if (!this.isJumping) {
      this.model.lockRotation();
    }
  }

  /** Toggle God Mode. */
  toggleGodMode() {
    this.godMode = !this.godMode;
    this.model.setGodModeVisual(this.godMode);
  }

  // --- Accessors ---

  get position() { return this.group.position; }
  get targetX() { return this._targetX; }

  /** Current score based on distance. */
  get score() { return Math.floor(-this.group.position.z); }

  /** Speed for display (km/h). */
  get displaySpeed() { return Math.floor(this.speed * CONFIG.PLAYER.SPEED_DISPLAY_MULT); }
}
