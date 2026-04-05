/**
 * ClassicMode — The standard endless runner gameplay.
 * Orchestrates the game loop update order: player → platforms → environment → camera → collision → score → render.
 */
import { GameMode } from './GameMode.js';
import { CONFIG } from '../config.js';

export class ClassicMode extends GameMode {
  /**
   * @param {object} deps — Dependency injection container
   * @param {import('../core/Engine.js').Engine} deps.engine
   * @param {import('../core/GameLoop.js').GameLoop} deps.loop
   * @param {import('../entities/Player.js').Player} deps.player
   * @param {import('../world/PlatformManager.js').PlatformManager} deps.platforms
   * @param {import('../world/Environment.js').Environment} deps.env
   * @param {import('../systems/CollisionSystem.js').CollisionSystem} deps.collision
   * @param {import('../systems/ScoreSystem.js').ScoreSystem} deps.score
   * @param {import('../ui/UIManager.js').UIManager} deps.ui
   * @param {import('../utils/EventBus.js').EventBus} deps.bus
   */
  constructor(deps) {
    super('Classic');
    this.engine = deps.engine;
    this.loop = deps.loop;
    this.player = deps.player;
    this.platforms = deps.platforms;
    this.env = deps.env;
    this.collision = deps.collision;
    this.scoreSystem = deps.score;
    this.ui = deps.ui;
    this.bus = deps.bus;

    this._active = false;
    this._updateBound = this.update.bind(this);

    // Wire up events
    this.bus.on('input:jump', () => this._onJump());
    this.bus.on('input:left', () => this._onLeft());
    this.bus.on('input:right', () => this._onRight());
    this.bus.on('input:pause', () => this._onPause());
    this.bus.on('input:restart', () => this._onRestart());
    this.bus.on('input:godmode', () => this._onGodMode());
    this.bus.on('input:start', () => this._onStart());
    this.bus.on('player:landed', () => this._onLanded());
    this.bus.on('player:died', () => this.onDeath());
  }

  /** @override */
  init() {
    // Nothing special needed for classic mode init
  }

  /** Start a new game. */
  start() {
    this._active = true;

    // Reset state
    this.player.reset();
    this.platforms.reset(this.player.speed);
    this.scoreSystem.reset();
    this.ui.startGame();

    // Register update in loop
    this.loop.removeSystem(this._updateBound);
    this.loop.addSystem(this._updateBound);
    this.loop.start();
  }

  /**
   * Main update called each frame by GameLoop.
   * @param {number} dt
   */
  update(dt) {
    if (!this._active) return;

    const p = this.player;

    // 1. Player physics + animation
    p.update(dt);

    // 2. Platform spawning, falling, cleanup
    this.platforms.update(dt, p.position.z, p.targetX, p.position.y, p.speed);

    // 3. Environment (portal follow, grid follow)
    this.env.update(p.position.z);

    // 4. Camera
    this._updateCamera();

    // 5. Collision detection
    this.collision.check(dt);

    // 6. Score
    this.scoreSystem.update(p.score, p.displaySpeed);

    // 7. Render
    this.engine.render();
  }

  /** @override */
  onDeath() {
    this._active = false;
    this.loop.stop();

    // Death animation
    this.player.model.flashDeath();
    this.scoreSystem.finalize();

    const group = this.player.group;
    const renderer = this.engine.renderer;
    const scene = this.engine.scene;
    const camera = this.engine.camera;

    let dropSpeed = CONFIG.DEATH.INITIAL_DROP_SPEED;

    const iv = setInterval(() => {
      dropSpeed += CONFIG.DEATH.DROP_ACCELERATION;
      group.position.y -= dropSpeed;
      group.rotation.x += CONFIG.DEATH.SPIN_X;
      group.rotation.y += CONFIG.DEATH.SPIN_Y;
      group.rotation.z += CONFIG.DEATH.SPIN_Z;
      group.scale.multiplyScalar(CONFIG.DEATH.SHRINK_FACTOR);

      renderer.render(scene, camera);

      if (group.position.y < CONFIG.DEATH.END_Y || group.scale.x < CONFIG.DEATH.END_SCALE) {
        clearInterval(iv);
        this.bus.emit('game:over', { score: this.scoreSystem.score });
      }
    }, CONFIG.DEATH.FRAME_MS);
  }

  /** @override */
  reset() {
    this._active = false;
    this.loop.stop();
  }

  // ─── Private Input Handlers ─────────────────────────────────────────────

  _onJump() {
    if (!this._active) return;
    if (!this.player.isJumping) {
      this.player.executeJump();
    } else {
      this.player.bufferJump();
    }
  }

  _onLeft() {
    if (!this._active) return;
    this.player.moveLeft();
  }

  _onRight() {
    if (!this._active) return;
    this.player.moveRight();
  }

  _onPause() {
    if (!this._active && !this.loop.isPaused) return;

    if (this._active && !this.loop.isPaused) {
      this._active = false;
      this.loop.pause();
      this.bus.emit('game:paused');
    } else if (this.loop.isPaused) {
      this._active = true;
      this.loop.resume();
      this.bus.emit('game:resumed');
    }
  }

  _onRestart() {
    // Allow restart from gameplay or game over
    if (this._active || this.ui.screens.isGameOverVisible) {
      this.start();
    }
  }

  _onGodMode() {
    if (!this._active) return;
    this.player.toggleGodMode();
  }

  _onStart() {
    // Handle Space/Enter on start or game over screen
    if (this.ui.screens.isStartVisible || this.ui.screens.isGameOverVisible) {
      this.start();
    }
  }

  _onLanded() {
    if (!this._active) return;
    const p = this.player;
    const standValid = this.platforms.checkGround(p.targetX, p.position.z, false);

    if (standValid) {
      // Check jump buffer
      if (performance.now() - p.jumpBufferTime < CONFIG.PLAYER.JUMP_BUFFER_MS) {
        p.executeJump();
      } else {
        // Smooth crossfade back to running animation
        p.model.playLand();
      }
    }
  }

  /** @private */
  _updateCamera() {
    const cam = this.engine.camera;
    const pos = this.player.position;
    const c = CONFIG.CAMERA;

    cam.position.x = pos.x * c.X_FOLLOW;
    cam.position.y = Math.max(pos.y * c.Y_FOLLOW + c.HEIGHT_OFFSET, c.MIN_HEIGHT);
    cam.position.z = pos.z + c.FOLLOW_Z;
    cam.lookAt(pos.x * c.X_LOOK, 0, pos.z - c.LOOK_AHEAD);
  }
}
