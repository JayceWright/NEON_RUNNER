/**
 * PlatformManager — Platform generation, falling, ground-checking, cleanup.
 * Uses global THREE from CDN r128.
 */
import { CONFIG } from '../config.js';

const THREE = window.THREE;

export class PlatformManager {
  constructor(scene, resources) {
    this.scene = scene;
    this.resources = resources;
    this.platforms = [];
    this.spawnZ = 4;
  }

  createRow(forceNoHole, playerSpeed = 20) {
    const w = CONFIG.WORLD;
    const holeChance = forceNoHole ? -1 : w.HOLE_BASE_CHANCE + (playerSpeed / w.HOLE_SPEED_FACTOR);
    const gapLane = Math.random() < holeChance ? Math.floor(Math.random() * 3) - 1 : 99;

    for (let lane = -1; lane <= 1; lane++) {
      if (lane === gapLane) continue;

      const isMagenta = Math.random() > 0.5;
      const edgeColor = isMagenta ? CONFIG.COLORS.MAGENTA : CONFIG.COLORS.CYAN;
      const sharedMat = isMagenta ? this.resources.matMagenta : this.resources.matCyan;

      const mesh = new THREE.Mesh(this.resources.platformGeo, sharedMat);
      mesh.position.set(lane * CONFIG.PLAYER.LANE_WIDTH, -0.75, this.spawnZ);

      const line = new THREE.LineSegments(
        new THREE.EdgesGeometry(this.resources.platformGeo),
        new THREE.LineBasicMaterial({ color: edgeColor })
      );
      line.name = 'wireframe';
      mesh.add(line);

      mesh.userData = { isFalling: false, passed: false, isBuilding: false };
      this.scene.add(mesh);
      this.platforms.push(mesh);
    }

    this._spawnBuilding();
    this.spawnZ -= w.PLATFORM_DEPTH;
  }

  _spawnBuilding() {
    const b = CONFIG.BUILDING;
    if (Math.random() > CONFIG.WORLD.BUILDING_SPAWN_CHANCE) return;

    const sideDir = Math.random() > 0.5 ? 1 : -1;
    const sideX = sideDir * (CONFIG.WORLD.BUILDING_MIN_DIST + Math.random() * CONFIG.WORLD.BUILDING_RANGE);
    const height = b.MIN_HEIGHT + Math.random() * b.HEIGHT_RANGE;
    const width = b.MIN_WIDTH + Math.random() * b.WIDTH_RANGE;

    const isM = Math.random() > 0.5;
    const bMat = new THREE.MeshStandardMaterial({
      color: b.COLOR,
      roughness: b.ROUGHNESS,
      emissive: isM ? b.EMISSIVE_MAGENTA : b.EMISSIVE_CYAN,
      emissiveIntensity: b.EMISSIVE_INTENSITY,
    });

    const bMesh = new THREE.Mesh(this.resources.buildingGeo, bMat);
    bMesh.scale.set(width, height, CONFIG.WORLD.PLATFORM_DEPTH * 2);
    bMesh.position.set(sideX, height / 2 - 5, this.spawnZ);

    const edgeOpacity = Math.random() > 0.5 ? b.EDGE_OPACITY_LOW : b.EDGE_OPACITY_HIGH;
    const bEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(this.resources.buildingGeo),
      new THREE.LineBasicMaterial({
        color: isM ? CONFIG.COLORS.MAGENTA : CONFIG.COLORS.CYAN,
        transparent: true,
        opacity: edgeOpacity,
      })
    );
    bMesh.add(bEdges);

    bMesh.userData = { isBuilding: true };
    this.scene.add(bMesh);
    this.platforms.push(bMesh);
  }

  update(dt, playerZ, targetX, playerY, playerSpeed) {
    if (playerZ - CONFIG.WORLD.SPAWN_BUFFER < this.spawnZ) {
      this.createRow(false, playerSpeed);
    }

    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const p = this.platforms[i];

      if (
        !p.userData.isBuilding &&
        (p.position.z > playerZ + 1 ||
          (Math.abs(p.position.z - playerZ) < this._zMargin &&
            Math.abs(targetX - p.position.x) < 0.1 &&
            playerY <= 0))
      ) {
        p.userData.isFalling = true;
      }

      if (p.userData.isFalling && !p.userData.isBuilding) {
        p.position.y -= CONFIG.WORLD.FALL_SPEED * dt;
        const wire = p.children.find((c) => c.name === 'wireframe');
        if (wire) wire.material.color.setHex(0xffffff);
      }

      if (p.position.y < -15 || p.position.z > playerZ + CONFIG.WORLD.CLEANUP_BEHIND) {
        this.scene.remove(p);
        this.platforms.splice(i, 1);
      }
    }
  }

  checkGround(targetX, playerZ, isJumping) {
    if (isJumping) return true;

    for (const p of this.platforms) {
      if (
        !p.userData.isBuilding &&
        Math.abs(targetX - p.position.x) < 0.1 &&
        Math.abs(playerZ - p.position.z) <= this._zMargin
      ) {
        return true;
      }
    }
    return false;
  }

  reset(playerSpeed) {
    for (const p of this.platforms) {
      this.scene.remove(p);
    }
    this.platforms = [];
    this.spawnZ = 4;

    for (let i = 0; i < CONFIG.WORLD.INITIAL_PLATFORMS; i++) {
      this.createRow(i < CONFIG.WORLD.SAFE_PLATFORMS, playerSpeed);
    }
  }

  get _zMargin() {
    return CONFIG.WORLD.PLATFORM_DEPTH / 2 + 0.5;
  }
}
