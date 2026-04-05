/**
 * Environment — Portal, floor grid, ambient lighting.
 * Uses global THREE from CDN r128.
 */
import { CONFIG } from '../config.js';

const THREE = window.THREE;

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.portal = null;
    this.portalInner = null;
    this.portalDisk = null;
    this.floorGrid = null;

    this._createLighting();
    this._createPortal();
    this._createFloorGrid();
  }

  _createLighting() {
    const ambient = new THREE.AmbientLight(
      CONFIG.LIGHTING.AMBIENT_COLOR,
      CONFIG.LIGHTING.AMBIENT_INTENSITY
    );
    this.scene.add(ambient);
  }

  _createPortal() {
    const p = CONFIG.PORTAL;

    const torusGeo = new THREE.TorusGeometry(p.OUTER_RADIUS, p.OUTER_TUBE, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({ color: CONFIG.COLORS.CYAN, fog: false });
    this.portal = new THREE.Mesh(torusGeo, torusMat);
    this.portal.position.set(0, p.HEIGHT, -p.DISTANCE);
    this.scene.add(this.portal);

    const innerGeo = new THREE.TorusGeometry(p.INNER_RADIUS, p.INNER_TUBE, 16, 100);
    const innerMat = new THREE.MeshBasicMaterial({ color: CONFIG.COLORS.MAGENTA, fog: false });
    this.portalInner = new THREE.Mesh(innerGeo, innerMat);
    this.portalInner.position.copy(this.portal.position);
    this.scene.add(this.portalInner);

    const diskGeo = new THREE.CircleGeometry(p.DISK_RADIUS, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x002233,
      transparent: true,
      opacity: 0.7,
      fog: false,
    });
    this.portalDisk = new THREE.Mesh(diskGeo, diskMat);
    this.portalDisk.position.copy(this.portal.position);
    this.portalDisk.position.z += 0.1;
    this.scene.add(this.portalDisk);
  }

  _createFloorGrid() {
    const fg = CONFIG.FLOOR_GRID;
    this.floorGrid = new THREE.GridHelper(fg.SIZE, fg.DIVISIONS, fg.COLOR, fg.COLOR);
    this.floorGrid.position.set(0, fg.Y, fg.Z_OFFSET);
    this.scene.add(this.floorGrid);
  }

  update(playerZ) {
    const p = CONFIG.PORTAL;

    if (this.portal) {
      const pz = playerZ - p.DISTANCE;
      this.portal.position.z = pz;
      this.portalInner.position.z = pz;
      this.portalDisk.position.z = pz + 0.1;
      this.portal.rotation.z += p.ROTATION_OUTER;
      this.portalInner.rotation.z += p.ROTATION_INNER;
    }

    if (this.floorGrid) {
      const fg = CONFIG.FLOOR_GRID;
      this.floorGrid.position.z = playerZ - (playerZ % fg.SNAP_INTERVAL) + fg.Z_BEHIND;
    }
  }
}
