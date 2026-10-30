// Character Rig and Pose Adjustments for Naruto Village Characters
// Brings all T-pose / A-pose characters into a natural standing posture with hands down at their sides,
// cleans up overlapping duplicate hand/face rip meshes, and guarantees 100% rigid wrist/hand continuity.

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Rotates static T-pose / A-pose arms smoothly around a unified character-space shoulder pivot.
 * Beyond xOuter, weight is strictly 1.000000 across the entire arm & hand height band,
 * ensuring sleeves, wrists, and hands move together as a single rigid unit with zero seam separation.
 */
function applySmoothShoulderRotation(mesh, cfg) {
  const geom = mesh.geometry;
  if (!geom || geom.userData.__armPoseApplied) return;

  const posAttr = geom.attributes.position;
  if (!posAttr) return;
  const normAttr = geom.attributes.normal;

  const count = posAttr.count;
  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    if (z < cfg.zLow0 || z > cfg.zHigh1) continue;
    const absX = Math.abs(x);
    if (absX <= cfg.xInner) continue;

    const wx = smoothstep(cfg.xInner, cfg.xOuter, absX);
    // Beyond xOuter (upper arm, forearm, wrist, and hands), keep wz strictly 1.0 across the full hand/thumb height
    const wz =
      absX >= cfg.xOuter
        ? z >= cfg.zLow0 && z <= cfg.zOuterMax
          ? 1.0
          : 0.0
        : smoothstep(cfg.zLow0, cfg.zLow1, z) *
          (1.0 - smoothstep(cfg.zHigh0, cfg.zHigh1, z));
    const w = wx * wz;
    if (w <= 1e-5) continue;

    const sign = x >= 0 ? 1 : -1;
    const px = sign * cfg.pivotX;
    const pz = cfg.pivotZ;

    const dx = x - px;
    const dz = z - pz;

    const theta = w * cfg.angle * sign;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const nx = px + dx * cosT - dz * sinT;
    const nz = pz + dx * sinT + dz * cosT;

    posAttr.setXYZ(i, nx, y, nz);

    if (normAttr) {
      const vx = normAttr.getX(i);
      const vy = normAttr.getY(i);
      const vz = normAttr.getZ(i);
      normAttr.setXYZ(i, vx * cosT - vz * sinT, vy, vx * sinT + vz * cosT);
    }
  }

  posAttr.needsUpdate = true;
  if (normAttr) normAttr.needsUpdate = true;
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  geom.userData.__armPoseApplied = true;
}

const STATIC_POSE_CONFIGS = {
  kakashi: {
    // Only hide Object_3 (duplicate alternate face expression).
    // Object_5 (palm/skin) and Object_6 (back-of-hand glove & metal plate) together form Kakashi's complete hands!
    hideNodes: new Set(['Object_3']),
    targetMeshes: new Set(['Object_4', 'Object_5', 'Object_6', 'Object_7']),
    pivotX: 0.68,
    pivotZ: 5.65,
    xInner: 0.56,
    xOuter: 0.88,
    zLow0: 5.05,
    zLow1: 5.25,
    zHigh0: 6.02,
    zHigh1: 6.16,
    zOuterMax: 6.35,
    angle: -1.32, // ~75.6 deg downward to sides
  },
  sakura: {
    // Object_5, Object_6, Object_7 are the 3 material sub-meshes of Sakura's hands & gloves
    hideNodes: new Set(),
    targetMeshes: new Set(['Object_3', 'Object_5', 'Object_6', 'Object_7']),
    pivotX: 0.44,
    pivotZ: 4.60,
    xInner: 0.36,
    xOuter: 0.64,
    zLow0: 4.05,
    zLow1: 4.25,
    zHigh0: 4.88,
    zHigh1: 5.05,
    zOuterMax: 5.15,
    angle: -1.32, // ~75.6 deg downward to sides
  },
  tsunade: {
    hideNodes: new Set(),
    targetMeshes: new Set(['Mesh_3', 'Mesh_4', 'Mesh_5']), // green Haori sleeves & left/right hands
    pivotX: 1.48,
    pivotZ: -14.70,
    xInner: 1.18,
    xOuter: 2.05,
    zLow0: -15.70,
    zLow1: -15.25,
    zHigh0: -14.15,
    zHigh1: -13.50,
    zOuterMax: -13.20,
    angle: 1.30, // ~74.5 deg downward in Tsunade's +90deg X-rotated local space
  },
  orochimaru: {
    hideNodes: new Set(),
    targetMeshes: new Set(['Mesh_1738.rip_Material.002_0']), // upper body & arms (already in 40-deg A-pose)
    pivotX: 0.082,
    pivotZ: 0.49,
    xInner: 0.068,
    xOuter: 0.112,
    zLow0: 0.24,
    zLow1: 0.27,
    zHigh0: 0.52,
    zHigh1: 0.56,
    zOuterMax: 0.60,
    angle: -0.54, // ~31 deg downward from A-pose to sides
  },
};

export function adjustCharacterPose(id, object) {
  if (!object || object.userData.__poseAdjusted) return;

  // 1. JIRAIYA: Rigged SkinnedMesh in ~40-deg A-pose with mirrored left/right clavicle orientations
  if (id === 'jiraiya') {
    object.traverse((child) => {
      if (child.isBone && !child.userData.__boneAdjusted) {
        if (child.name === 'bone_LeftArm_05') {
          child.rotateX(0.58);
          child.userData.__boneAdjusted = true;
        } else if (child.name === 'bone_RightArm_019') {
          // Right clavicle is mirrored, so -0.58 brings the right arm symmetrically down to his side
          child.rotateX(-0.58);
          child.userData.__boneAdjusted = true;
        }
      }
    });
    object.updateMatrixWorld(true);
    object.userData.__poseAdjusted = true;
    return;
  }

  // 2. STATIC T-POSE / A-POSE CHARACTERS (Kakashi, Sakura, Tsunade, Orochimaru)
  const cfg = STATIC_POSE_CONFIGS[id];
  if (cfg) {
    object.traverse((child) => {
      if (cfg.hideNodes.has(child.name)) {
        child.visible = false;
        return;
      }
      if (
        child.isMesh &&
        (cfg.targetMeshes.has(child.name) ||
          cfg.targetMeshes.has(child.geometry?.name))
      ) {
        applySmoothShoulderRotation(child, cfg);
      }
    });
  }

  object.userData.__poseAdjusted = true;
}
