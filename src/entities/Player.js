/**
 * Player — Player entity: Group, physics, lane movement, jump logic.
 * Uses global THREE from CDN r128.
 */
import { CONFIG } from '../config.js';
import { PlayerModel } from './PlayerModel.js';

const THREE = window.THREE;

export class Player {
  constructor(scene, bus) {
    this.bus = bus;

    this.group = new THREE.Group();

    // Temp wireframe placeholder
    const tGeo = new THREE.BoxGeometry(1, 1.5, 1);
    const tMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const tMesh = new THREE.Mesh(tGeo, tMat);
    this.group.add(tMesh);

    // Character point lights (match original r128 values)
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

    this.model = new PlayerModel(this.group);

    // State
    this.speed = CONFIG.PLAYER.INITIAL_SPEED;
    this.lane = 0;
    this._targetX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.jumpBufferTime = 0;
    this.godMode = false;
  }

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

  async loadModel(onProgress) {
    await this.model.load(onProgress);
  }

  executeJump() {
    this.velocityY = CONFIG.PLAYER.JUMP_FORCE;
    this.isJumping = true;
    this.jumpBufferTime = 0;
    this.model.flashJump();
    this.model.playJump();
  }

  bufferJump() {
    this.jumpBufferTime = performance.now();
  }

  moveLeft() {
    if (this.lane > -1) this.lane--;
  }

  moveRight() {
    if (this.lane < 1) this.lane++;
  }

  update(dt) {
    this.group.position.z -= this.speed * dt;
    this.speed += dt * CONFIG.PLAYER.SPEED_INCREMENT;

    this._targetX = this.lane * CONFIG.PLAYER.LANE_WIDTH;
    this.group.position.x += (this._targetX - this.group.position.x) * CONFIG.PLAYER.LANE_LERP * dt;

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

    this.model.update(dt, this.speed);

    if (!this.isJumping) {
      this.model.lockRotation();
    }
  }

  toggleGodMode() {
    this.godMode = !this.godMode;
    this.model.setGodModeVisual(this.godMode);
  }

  get position() { return this.group.position; }
  get targetX() { return this._targetX; }
  get score() { return Math.floor(-this.group.position.z); }
  get displaySpeed() { return Math.floor(this.speed * CONFIG.PLAYER.SPEED_DISPLAY_MULT); }
}
