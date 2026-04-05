/**
 * PlayerModel — GLB model loading, animation mixer, visual effects.
 * Handles: model loading, retarget animations, jump/run crossfades, flash effects.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { CONFIG } from '../config.js';

export class PlayerModel {
  /**
   * @param {THREE.Group} playerGroup — the player group to attach the model to.
   */
  constructor(playerGroup) {
    this.group = playerGroup;

    /** @type {THREE.Object3D|null} */
    this.model = null;

    /** @type {THREE.AnimationMixer|null} */
    this.mixer = null;

    /** @type {THREE.AnimationAction|null} */
    this.runAction = null;

    /** @type {THREE.AnimationAction|null} */
    this.jumpAction = null;

    this._allAnimations = [];
  }

  /**
   * Load the main rigged model + retarget animations.
   * @param {Function} onProgress — called with status text during loading.
   * @returns {Promise<void>}
   */
  async load(onProgress) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    if (onProgress) onProgress('LOADING MODEL...');

    // Load main rigged mesh
    const gltf = await this._loadGLTF(loader, CONFIG.ASSETS.MODEL_PATH);
    this.model = gltf.scene;

    // Scale and position
    const s = CONFIG.PLAYER.MODEL_SCALE;
    this.model.scale.set(s, s, s);
    this.model.rotation.y = Math.PI;
    this.model.position.set(0, CONFIG.PLAYER.MODEL_Y_OFFSET, 0);

    // Material setup: clone + emissive baseline
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(CONFIG.ANIMATION.EMISSIVE_BASELINE);
          child.material.emissiveIntensity = CONFIG.ANIMATION.EMISSIVE_BASELINE_INTENSITY;
        }
      }
    });

    // Remove temporary wireframe placeholder (first child of group)
    const placeholder = this.group.children.find(
      (c) => c.isMesh && c.material && c.material.wireframe
    );
    if (placeholder) {
      this.group.remove(placeholder);
      placeholder.geometry.dispose();
      placeholder.material.dispose();
    }

    this.group.add(this.model);
    this.mixer = new THREE.AnimationMixer(this.model);

    // Check if rigging file has embedded animations
    if (gltf.animations && gltf.animations.length > 0) {
      console.log('Rigging file has animations:', gltf.animations.length);
      gltf.animations.forEach((clip) => this.mixer.clipAction(clip).play());
      return;
    }

    // Load retarget animation files
    if (onProgress) onProgress('LOADING ANIMATIONS...');
    const retargetLoader = new GLTFLoader();
    const files = CONFIG.ASSETS.RETARGET_FILES;

    const loadPromises = files.map((file, index) =>
      this._loadGLTF(retargetLoader, file)
        .then((rGltf) => {
          console.log(file, '-> animations:', rGltf.animations.length);
          rGltf.animations.forEach((clip, ci) => {
            const action = this.mixer.clipAction(clip);

            // First file, first clip = Run animation
            if (index === 0 && ci === 0) {
              action.play();
              this.runAction = action;
            }

            // Second file, first clip = Jump animation
            if (index === 1 && ci === 0) {
              this.jumpAction = action;
              this.jumpAction.setLoop(THREE.LoopOnce, 1);
              this.jumpAction.clampWhenFinished = false;
              this.jumpAction.timeScale = CONFIG.ANIMATION.JUMP_TIMESCALE;
            }

            this._allAnimations.push({ name: file, clip, action });
          });
        })
        .catch((err) => {
          console.warn('Could not load', file, err.message);
        })
    );

    await Promise.all(loadPromises);
  }

  /**
   * Update the animation mixer.
   * @param {number} dt — delta time in seconds
   * @param {number} speed — current player speed
   */
  update(dt, speed) {
    if (this.mixer) {
      this.mixer.update(dt * (speed / 18));
    }
  }

  /**
   * Lock the model rotation to face forward.
   * Called from game loop when not jumping to prevent animation-driven rotation.
   */
  lockRotation() {
    if (this.model) {
      this.model.rotation.set(0, Math.PI / 2, 0);
    }
  }

  /**
   * Crossfade to jump animation, then back to run after delay.
   */
  playJump() {
    if (!this.jumpAction || !this.runAction) return;

    this.runAction.fadeOut(CONFIG.ANIMATION.JUMP_CROSSFADE_IN);
    this.jumpAction.reset().fadeIn(CONFIG.ANIMATION.JUMP_CROSSFADE_IN).play();

    setTimeout(() => {
      if (this.jumpAction && this.runAction) {
        this.jumpAction.fadeOut(CONFIG.ANIMATION.JUMP_CROSSFADE_OUT);
        this.runAction.reset().fadeIn(CONFIG.ANIMATION.JUMP_CROSSFADE_OUT).play();
      }
    }, CONFIG.ANIMATION.JUMP_TO_RUN_DELAY);
  }

  /**
   * Crossfade back to run on landing (without .reset() to avoid frame-0 snap).
   */
  playLand() {
    if (!this.jumpAction || !this.runAction) return;
    this.runAction.fadeIn(CONFIG.ANIMATION.LAND_CROSSFADE_IN).play();
    this.jumpAction.fadeOut(CONFIG.ANIMATION.LAND_CROSSFADE_OUT);
  }

  /**
   * Flash model bright white, then restore baseline.
   */
  flashJump() {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive !== undefined) {
        child.material.emissive.set(CONFIG.ANIMATION.FLASH_COLOR);
        child.material.emissiveIntensity = CONFIG.ANIMATION.FLASH_INTENSITY;
      }
    });

    setTimeout(() => {
      this._restoreBaseline();
    }, CONFIG.ANIMATION.FLASH_DURATION);
  }

  /**
   * Flash red on death.
   */
  flashDeath() {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive !== undefined) {
        child.material.emissive.set(CONFIG.ANIMATION.DEATH_COLOR);
        child.material.emissiveIntensity = CONFIG.ANIMATION.DEATH_INTENSITY;
      }
    });
  }

  /**
   * Set God Mode visual (green emissive).
   * @param {boolean} on
   */
  setGodModeVisual(on) {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive) {
        child.material.emissive.set(
          on ? CONFIG.ANIMATION.GOD_MODE_COLOR : CONFIG.ANIMATION.EMISSIVE_BASELINE
        );
      }
    });
  }

  /** Restore baseline emissive glow. */
  restoreBaseline() {
    this._restoreBaseline();
  }

  /** @private */
  _restoreBaseline() {
    if (!this.model) return;
    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive !== undefined) {
        child.material.emissive.set(CONFIG.ANIMATION.EMISSIVE_BASELINE);
        child.material.emissiveIntensity = CONFIG.ANIMATION.EMISSIVE_BASELINE_INTENSITY;
      }
    });
  }

  /** Get all loaded animations (for sandbox/labs). */
  get allAnimations() {
    return this._allAnimations;
  }

  /**
   * Load a GLTF file as a promise.
   * @private
   * @param {GLTFLoader} loader
   * @param {string} url
   * @returns {Promise<import('three/addons/loaders/GLTFLoader.js').GLTF>}
   */
  _loadGLTF(loader, url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }
}
