/**
 * NEON_RUNNER — Global Configuration
 * All magic numbers consolidated in one place.
 */

export const CONFIG = {
  PLAYER: {
    INITIAL_SPEED: 20,
    SPEED_INCREMENT: 0.4,    // acceleration per second
    SPEED_DISPLAY_MULT: 7,   // multiplier for KM/H display
    LANE_WIDTH: 3,
    LANE_LERP: 15,           // lane switching smoothness
    JUMP_FORCE: 22,
    GRAVITY: -70,
    JUMP_BUFFER_MS: 250,     // ms window to buffer a jump before landing
    MODEL_SCALE: 3.5,
    MODEL_Y_OFFSET: -0.75,   // feet on platform
  },

  WORLD: {
    PLATFORM_DEPTH: 4,
    INITIAL_PLATFORMS: 60,
    SAFE_PLATFORMS: 10,       // first N rows have no holes
    SPAWN_BUFFER: 240,        // how far ahead to spawn platforms
    CLEANUP_BEHIND: 20,       // remove platforms this far behind player
    FALL_SPEED: 25,           // how fast passed platforms fall
    BUILDING_MIN_DIST: 25,
    BUILDING_RANGE: 20,
    BUILDING_SPAWN_CHANCE: 0.8, // 80% chance to spawn a building per row
    HOLE_BASE_CHANCE: 0.4,
    HOLE_SPEED_FACTOR: 100,
  },

  CAMERA: {
    HEIGHT_OFFSET: 7,
    MIN_HEIGHT: 6,
    Y_FOLLOW: 0.5,           // how much camera follows player Y
    X_FOLLOW: 0.5,           // how much camera follows player X
    X_LOOK: 0.3,             // how much camera look-at follows X
    FOLLOW_Z: 11,            // camera distance behind player
    LOOK_AHEAD: 15,          // camera look-at distance ahead
  },

  FOG: {
    COLOR: 0x0a0a0c,
    DENSITY: 0.015,
  },

  PORTAL: {
    DISTANCE: 1200,
    HEIGHT: 28,
    OUTER_RADIUS: 55,
    OUTER_TUBE: 3,
    INNER_RADIUS: 38,
    INNER_TUBE: 1.5,
    DISK_RADIUS: 36,
    ROTATION_OUTER: 0.003,
    ROTATION_INNER: -0.005,
  },

  COLORS: {
    MAGENTA: 0xff0055,
    CYAN: 0x00f3ff,
    DARK_BG: 0x0a0a0c,
  },

  ASSETS: {
    MODEL_PATH: 'assets/models/tripo_rigging_df631e0e-4b3e-484b-8408-c58b35caa963_meshopt.glb',
    RETARGET_FILES: [
      'assets/models/tripo_retarget_d92c8157-c67a-416f-90e5-5a791d58aa2c.glb',
      'assets/models/tripo_retarget_b420ba5a-af77-45a8-a029-3e35c73d054e.glb',
      'assets/models/tripo_retarget_bb9b64f8-3b22-447a-978c-0155ff61b026.glb',
      'assets/models/tripo_retarget_9c2b3a83-75d2-4a81-8427-b3c33f275094.glb',
      'assets/models/tripo_retarget_03ecbc1e-6142-4ecb-8326-81bf2c940550.glb',
    ],
  },

  LIGHTING: {
    AMBIENT_COLOR: 0xddeeff,
    AMBIENT_INTENSITY: 2.2,
    // r170 uses physically-correct lights (candela). Old r128 used arbitrary units.
    // Multiply by ~20x to get comparable brightness.
    CHAR_GLOW_COLOR: 0xaaccff,
    CHAR_GLOW_INTENSITY: 20,
    CHAR_GLOW_DISTANCE: 18,
    HEAD_GLOW_COLOR: 0xffffff,
    HEAD_GLOW_INTENSITY: 8,
    HEAD_GLOW_DISTANCE: 8,
  },

  DEATH: {
    INITIAL_DROP_SPEED: 0.5,
    DROP_ACCELERATION: 0.2,
    SPIN_X: 0.15,
    SPIN_Y: 0.3,
    SPIN_Z: 0.2,
    SHRINK_FACTOR: 0.92,
    END_Y: -40,
    END_SCALE: 0.01,
    FRAME_MS: 16,
  },

  ANIMATION: {
    JUMP_TIMESCALE: 3.0,
    JUMP_CROSSFADE_IN: 0.1,
    JUMP_CROSSFADE_OUT: 0.15,
    JUMP_TO_RUN_DELAY: 250,   // ms before switching back to run in air
    LAND_CROSSFADE_IN: 0.2,
    LAND_CROSSFADE_OUT: 0.2,
    RUN_CROSSFADE_IN: 0.1,
    EMISSIVE_BASELINE: 0x333333,
    EMISSIVE_BASELINE_INTENSITY: 1.0,
    FLASH_COLOR: 0xffffff,
    FLASH_INTENSITY: 1.5,
    FLASH_DURATION: 200,
    GOD_MODE_COLOR: 0x00ff00,
    DEATH_COLOR: 0xff0000,
    DEATH_INTENSITY: 4.0,
  },

  TOUCH: {
    SWIPE_THRESHOLD: 25,
  },

  FLOOR_GRID: {
    SIZE: 600,
    DIVISIONS: 120,
    COLOR: 0x001122,
    Y: -20,
    Z_OFFSET: -200,
    SNAP_INTERVAL: 50,
    Z_BEHIND: -500,
  },

  PLATFORM_MATERIAL: {
    COLOR: 0x111122,
    EMISSIVE_INTENSITY: 0.25,
    ROUGHNESS: 0.1,
    METALNESS: 0.8,
    CLEARCOAT: 1.0,
    CLEARCOAT_ROUGHNESS: 0.1,
    OPACITY: 0.95,
  },

  BUILDING: {
    COLOR: 0x050505,
    ROUGHNESS: 1.0,
    EMISSIVE_MAGENTA: 0x0a0018,
    EMISSIVE_CYAN: 0x000a18,
    EMISSIVE_INTENSITY: 0.8,
    MIN_HEIGHT: 10,
    HEIGHT_RANGE: 50,
    MIN_WIDTH: 5,
    WIDTH_RANGE: 10,
    EDGE_OPACITY_LOW: 0.3,
    EDGE_OPACITY_HIGH: 0.7,
  },
};
