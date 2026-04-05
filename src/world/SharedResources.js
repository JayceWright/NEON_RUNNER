/**
 * SharedResources — Pre-created geometries and materials for performance.
 * Uses global THREE from CDN r128.
 */
import { CONFIG } from '../config.js';

const THREE = window.THREE;

export class SharedResources {
  constructor() {
    const pm = CONFIG.PLATFORM_MATERIAL;

    this.platformGeo = new THREE.BoxGeometry(
      CONFIG.PLAYER.LANE_WIDTH - 0.2,
      0.5,
      CONFIG.WORLD.PLATFORM_DEPTH
    );

    const matConfig = {
      color: pm.COLOR,
      emissiveIntensity: pm.EMISSIVE_INTENSITY,
      roughness: pm.ROUGHNESS,
      metalness: pm.METALNESS,
      clearcoat: pm.CLEARCOAT,
      clearcoatRoughness: pm.CLEARCOAT_ROUGHNESS,
      transparent: true,
      opacity: pm.OPACITY,
    };

    this.matMagenta = new THREE.MeshPhysicalMaterial({
      ...matConfig,
      emissive: CONFIG.COLORS.MAGENTA,
    });

    this.matCyan = new THREE.MeshPhysicalMaterial({
      ...matConfig,
      emissive: CONFIG.COLORS.CYAN,
    });

    this.buildingGeo = new THREE.BoxGeometry(1, 1, 1);
  }

  dispose() {
    this.platformGeo.dispose();
    this.matMagenta.dispose();
    this.matCyan.dispose();
    this.buildingGeo.dispose();
  }
}
