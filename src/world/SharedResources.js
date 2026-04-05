/**
 * SharedResources — Pre-created geometries and materials for performance.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class SharedResources {
  constructor() {
    const pm = CONFIG.PLATFORM_MATERIAL;

    // Platform geometry (reused for all platforms)
    this.platformGeo = new THREE.BoxGeometry(
      CONFIG.PLAYER.LANE_WIDTH - 0.2,
      0.5,
      CONFIG.WORLD.PLATFORM_DEPTH
    );

    // Shared platform materials
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

    // Building geometry (scaled per-instance)
    this.buildingGeo = new THREE.BoxGeometry(1, 1, 1);
  }

  /** Cleanup. */
  dispose() {
    this.platformGeo.dispose();
    this.matMagenta.dispose();
    this.matCyan.dispose();
    this.buildingGeo.dispose();
  }
}
