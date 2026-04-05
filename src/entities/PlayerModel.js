/**
 * PlayerModel — GLB model loading, animation mixer, visual effects.
 * Uses global THREE and THREE.GLTFLoader from CDN r128.
 */
import { CONFIG } from '../config.js';

const THREE = window.THREE;

export class PlayerModel {
  constructor(playerGroup) {
    this.group = playerGroup;
    this.model = null;
    this.mixer = null;
    this.runAction = null;
    this.jumpAction = null;
    this._allAnimations = [];
  }

  async load(onProgress) {
    const loader = new THREE.GLTFLoader();
    if (typeof MeshoptDecoder !== 'undefined') {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }

    if (onProgress) onProgress('LOADING MODEL...');

    const gltf = await this._loadGLTF(loader, CONFIG.ASSETS.MODEL_PATH);
    this.model = gltf.scene;

    const s = CONFIG.PLAYER.MODEL_SCALE;
    this.model.scale.set(s, s, s);
    this.model.rotation.y = Math.PI;
    this.model.position.set(0, CONFIG.PLAYER.MODEL_Y_OFFSET, 0);

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

    // Remove temp wireframe placeholder
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

    if (gltf.animations && gltf.animations.length > 0) {
      gltf.animations.forEach((clip) => this.mixer.clipAction(clip).play());
      return;
    }

    if (onProgress) onProgress('LOADING ANIMATIONS...');
    const files = CONFIG.ASSETS.RETARGET_FILES;

    const loadPromises = files.map((file, index) =>
      this._loadGLTF(new THREE.GLTFLoader(), file)
        .then((rGltf) => {
          rGltf.animations.forEach((clip, ci) => {
            const action = this.mixer.clipAction(clip);

            if (index === 0 && ci === 0) {
              action.play();
              this.runAction = action;
            }

            if (index === 1 && ci === 0) {
              this.jumpAction = action;
              this.jumpAction.setLoop(THREE.LoopOnce, 1);
              this.jumpAction.clampWhenFinished = false;
              this.jumpAction.timeScale = CONFIG.ANIMATION.JUMP_TIMESCALE;
            }

            this._allAnimations.push({ name: file, clip, action });
          });
        })
        .catch((err) => console.warn('Could not load', file, err.message))
    );

    await Promise.all(loadPromises);
  }

  update(dt, speed) {
    if (this.mixer) {
      this.mixer.update(dt * (speed / 18));
    }
  }

  lockRotation() {
    if (this.model) {
      this.model.rotation.set(0, Math.PI / 2, 0);
    }
  }

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

  playLand() {
    if (!this.jumpAction || !this.runAction) return;
    // No .reset() to avoid frame-0 snap on landing
    this.runAction.fadeIn(CONFIG.ANIMATION.LAND_CROSSFADE_IN).play();
    this.jumpAction.fadeOut(CONFIG.ANIMATION.LAND_CROSSFADE_OUT);
  }

  flashJump() {
    if (!this.model) return;
    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive !== undefined) {
        child.material.emissive.set(CONFIG.ANIMATION.FLASH_COLOR);
        child.material.emissiveIntensity = CONFIG.ANIMATION.FLASH_INTENSITY;
      }
    });
    setTimeout(() => this._restoreBaseline(), CONFIG.ANIMATION.FLASH_DURATION);
  }

  flashDeath() {
    if (!this.model) return;
    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive !== undefined) {
        child.material.emissive.set(CONFIG.ANIMATION.DEATH_COLOR);
        child.material.emissiveIntensity = CONFIG.ANIMATION.DEATH_INTENSITY;
      }
    });
  }

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

  restoreBaseline() {
    this._restoreBaseline();
  }

  _restoreBaseline() {
    if (!this.model) return;
    this.model.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive !== undefined) {
        child.material.emissive.set(CONFIG.ANIMATION.EMISSIVE_BASELINE);
        child.material.emissiveIntensity = CONFIG.ANIMATION.EMISSIVE_BASELINE_INTENSITY;
      }
    });
  }

  get allAnimations() { return this._allAnimations; }

  _loadGLTF(loader, url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }
}
