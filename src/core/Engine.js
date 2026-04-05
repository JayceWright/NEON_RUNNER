/**
 * Engine — Three.js initialization: scene, camera, renderer, fog, resize.
 * Uses global THREE from CDN (r128).
 */
import { CONFIG } from '../config.js';

const THREE = window.THREE;

export class Engine {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(CONFIG.FOG.COLOR, CONFIG.FOG.DENSITY);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
