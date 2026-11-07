// Opening pose: Main Street, facing the visitor with the monument behind Naruto.
export const INITIAL_SPAWN = {
  position: [-23.59, -0.17, 9.79],
  facing: 0,
  cameraYaw: 0,
  cameraPitch: -0.12,
};

// Konoha Village environment and movement physics constants

export const VILLAGE_BOUNDS = {
  minX: -58.0,
  maxX: 58.0,
  minZ: -75.0,
  maxZ: 58.0,
};

// Offset used to center the Konoha FBX main street at (0, 0, 0)
export const KONOHA_OFFSET = [-159.4, 9.284, 322.6];

// Movement speeds (meters per second)
export const WALK_SPEED = 5.2;
export const SPRINT_SPEED = 9.6;
export const JUMP_VELOCITY = 7.8;
export const GRAVITY = -22.0;

// Maximum step-up height for terrain stairs and gentle curbs (above this is considered a solid wall)
export const MAX_STEP_HEIGHT = 0.85;

// Camera configuration for third-person follow in the village
export const CAMERA_CONFIG = {
  defaultDistance: 3.5,
  minDistance: 1.8,
  maxDistance: 9.0,
  defaultPitch: 0.12,
  minPitch: -0.75, // allows tilting camera upwards to look at the sky and clouds
  maxPitch: 0.95,
  targetHeight: 1.25, // focus on Naruto's chest level
};
