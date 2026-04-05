/**
 * Engine — Three.js initialization: scene, camera, renderer, fog, resize.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Engine {
  /**
   * @param {HTMLElement} container — DOM element to attach the renderer canvas to.
   */
  constructor(container) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(CONFIG.FOG.COLOR, CONFIG.FOG.DENSITY);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Match Three.js r128 rendering pipeline:
    // r170 defaults to sRGB which makes everything brighter/washed out
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    container.appendChild(this.renderer.domElement);

    // Bind resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  /** Render a single frame. */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /** Handle window resize. */
  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /** Cleanup. */
  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
