// Realistic 4-phase jump physics & kinematic pose helpers for Naruto's 3D controller.
// Pure functions with zero allocations so useFrame stays 0-GC at 60fps.

export const JUMP_TAKEOFF_DURATION = 0.095;
export const JUMP_LANDING_DURATION = 0.26;
export const JUMP_COYOTE_TIME = 0.1;
export const JUMP_BUFFER_TIME = 0.12;

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep01(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Computes effective gravity multiplier for realistic asymmetric jump arcs:
 * - Slightly lighter near apex for natural hang-time when jump is held
 * - Stronger when falling so landings feel weighty and grounded
 * - Stronger upward deceleration if jump is released early (variable jump height)
 */
export function computeGravityScale(velocityY, jumpHeld) {
  if (velocityY > 0) {
    if (!jumpHeld) return 1.65;
    if (velocityY < 1.6) return 0.8;
    return 1.0;
  }
  if (velocityY > -1.6) {
    return 0.88;
  }
  return 1.32;
}

/**
 * Computes continuous phase weights and center-of-mass compression for
 * crouch -> ascent -> apex -> descent -> landing absorption.
 * Writes directly into `out` to avoid per-frame allocations.
 */
export function evaluateJumpKinematics(
  {
    isGrounded,
    windup,
    velocityY,
    jumpVelocity,
    landingTime,
    impact,
  },
  out
) {
  const preload =
    windup > 0 ? Math.sin(Math.PI * clamp01(1 - windup / JUMP_TAKEOFF_DURATION)) : 0;

  let absorption = 0;
  if (landingTime > 0) {
    const u = clamp01(1 - landingTime / JUMP_LANDING_DURATION);
    // Fast initial compression peak around u ≈ 0.33, smooth elastic recovery to 0
    absorption = clamp01(impact * 6.75 * u * (1 - u) * (1 - u));
  }

  const compression = Math.max(preload, absorption);

  if (isGrounded) {
    out.poseWeight = clamp01(compression);
    out.airBlend = 0;
    out.ascentWeight = 0;
    out.apexWeight = 0;
    out.descentWeight = 0;
    out.compression = compression;
    out.bodyPitch = 0.085 * compression;
    out.hipDip = -0.13 * compression;
    return out;
  }

  // Normalized vertical velocity in [-1, 1]
  const vNorm = Math.max(-1.35, Math.min(1.0, velocityY / jumpVelocity));

  // Smoothly transition across ascent (vNorm > 0), apex (vNorm ~ 0), and descent (vNorm < 0)
  const ascentWeight = smoothstep01(vNorm * 1.45);
  const descentWeight = smoothstep01(-vNorm * 1.25);
  const apexWeight = Math.max(0, 1 - ascentWeight - descentWeight);

  out.poseWeight = 1;
  out.airBlend = 1;
  out.ascentWeight = ascentWeight;
  out.apexWeight = apexWeight;
  out.descentWeight = descentWeight;
  out.compression = 0;
  out.bodyPitch = lerp(lerp(-0.03, 0.075, ascentWeight), 0.055, descentWeight);
  out.hipDip = 0;
  return out;
}

// Per-bone target angles [crouch, ascent, apex, descent, strideInfluence]
// Uses the same local bone axes as Naruto's walk rig (_axisZ for Arm/ForeArm, _axisX for legs/spine).
const JUMP_BONE_CURVES = {
  LeftUpLeg: [0.58, 0.24, 0.56, 0.26, 0.32],
  RightUpLeg: [0.58, 0.24, 0.56, 0.26, -0.32],
  LeftLeg: [-1.06, -0.52, -0.96, -0.44, -0.26],
  RightLeg: [-1.06, -0.52, -0.96, -0.44, 0.26],
  LeftFoot: [-0.32, 0.36, 0.16, -0.22, 0.1],
  RightFoot: [-0.32, 0.36, 0.16, -0.22, -0.1],
  Spine: [0.24, 0.08, 0.12, 0.16, 0],
  LeftArm: [-0.42, 0.54, 0.42, 0.24, -0.24],
  RightArm: [0.42, -0.54, -0.42, -0.24, -0.24],
  LeftForeArm: [0.25, 0.58, 0.62, 0.38, 0.1],
  RightForeArm: [-0.25, -0.58, -0.62, -0.38, -0.1],
};

/**
 * Returns the target rotation angle (in radians) for a named bone during any jump phase.
 * Returns null if the bone is not driven by the jump pose.
 */
export function computeJumpBoneAngle(shortName, kin, strideAtLaunch) {
  const curve = JUMP_BONE_CURVES[shortName];
  if (!curve) return null;

  const [crouch, ascent, apex, descent, strideFactor] = curve;
  if (kin.airBlend <= 0) {
    return crouch;
  }

  const airAngle =
    ascent * kin.ascentWeight +
    apex * kin.apexWeight +
    descent * kin.descentWeight +
    strideFactor * strideAtLaunch * (0.45 + 0.55 * kin.ascentWeight);

  return lerp(crouch, airAngle, kin.airBlend);
}
