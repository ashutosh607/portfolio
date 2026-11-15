// Realistic 4-phase jump physics & kinematic pose helpers for Naruto's 3D controller.
// Pure functions with zero allocations so useFrame stays 0-GC at 60fps.

export const JUMP_TAKEOFF_DURATION = 0.095;
export const JUMP_SPRINT_TAKEOFF_DURATION = 0.045;
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
 * Standing jumps take a brief crouch preload; running/sprinting jumps plant and launch immediately.
 */
export function getTakeoffDuration(speedRatio = 0) {
  return lerp(JUMP_TAKEOFF_DURATION, JUMP_SPRINT_TAKEOFF_DURATION, clamp01(speedRatio));
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
 * Adapts torso pitch & hip dip to horizontal running speed (`speedRatio` in [0, 1]).
 * Writes directly into `out` to avoid per-frame allocations.
 */
export function evaluateJumpKinematics(
  {
    isGrounded,
    windup,
    takeoffDuration = JUMP_TAKEOFF_DURATION,
    velocityY,
    jumpVelocity,
    landingTime,
    impact,
    speedRatio = 0,
  },
  out
) {
  const speed = clamp01(speedRatio);
  const safeTakeoff = Math.max(0.01, takeoffDuration);
  const preload =
    windup > 0 ? Math.sin(Math.PI * clamp01(1 - windup / safeTakeoff)) : 0;

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
    out.speedRatio = speed;
    out.bodyPitch = (0.085 + 0.06 * speed) * compression;
    out.hipDip = -(0.13 - 0.03 * speed) * compression;
    return out;
  }

  // Normalized vertical velocity in [-1, 1]
  const vNorm = Math.max(-1.35, Math.min(1.0, velocityY / jumpVelocity));

  // Smoothly transition across ascent (vNorm > 0), apex (vNorm ~ 0), and descent (vNorm < 0)
  const ascentWeight = smoothstep01(vNorm * 1.45);
  const descentWeight = smoothstep01(-vNorm * 1.25);
  const apexWeight = Math.max(0, 1 - ascentWeight - descentWeight);

  // Running jumps lean into forward momentum on launch & apex, then level slightly to brace for landing
  const basePitch = lerp(lerp(-0.03, 0.075, ascentWeight), 0.055, descentWeight);
  const runLean = speed * (0.11 * ascentWeight + 0.08 * apexWeight + 0.03 * descentWeight);

  out.poseWeight = 1;
  out.airBlend = 1;
  out.ascentWeight = ascentWeight;
  out.apexWeight = apexWeight;
  out.descentWeight = descentWeight;
  out.compression = 0;
  out.speedRatio = speed;
  out.bodyPitch = basePitch + runLean;
  out.hipDip = 0;
  return out;
}

// Per-bone target angles [crouch, ascent, apex, descent, standingStride, runningSplit]
// Uses the same local bone axes as Naruto's walk rig (_axisZ for Arm/ForeArm, _axisX for legs/spine).
const JUMP_BONE_CURVES = {
  LeftUpLeg: [0.58, 0.24, 0.56, 0.26, 0.28, 0.54],
  RightUpLeg: [0.58, 0.24, 0.56, 0.26, -0.28, -0.54],
  LeftLeg: [-1.06, -0.52, -0.96, -0.44, -0.22, -0.42],
  RightLeg: [-1.06, -0.52, -0.96, -0.44, 0.22, 0.42],
  LeftFoot: [-0.32, 0.36, 0.16, -0.22, 0.1, 0.22],
  RightFoot: [-0.32, 0.36, 0.16, -0.22, -0.1, -0.22],
  Spine: [0.24, 0.08, 0.12, 0.16, 0, 0],
  LeftArm: [-0.42, 0.54, 0.42, 0.24, -0.22, -0.52],
  RightArm: [0.42, -0.54, -0.42, -0.24, -0.22, -0.52],
  LeftForeArm: [0.25, 0.58, 0.62, 0.38, 0.1, 0.24],
  RightForeArm: [-0.25, -0.58, -0.62, -0.38, -0.1, -0.24],
};

/**
 * Returns the target rotation angle (in radians) for a named bone during any jump phase.
 * Blends smoothly from symmetric vertical jump to athletic split-leg running jump based on `kin.speedRatio`.
 * Returns null if the bone is not driven by the jump pose.
 */
export function computeJumpBoneAngle(shortName, kin, strideAtLaunch) {
  const curve = JUMP_BONE_CURVES[shortName];
  if (!curve) return null;

  const [crouch, ascent, apex, descent, standingStride, runningSplit] = curve;
  const speed = kin.speedRatio || 0;
  const spineBoost = shortName === 'Spine' ? 0.16 * speed : 0;

  if (kin.airBlend <= 0) {
    return crouch + spineBoost * 0.5;
  }

  // Split stride is strongest through ascent & apex, then brings legs together on descent to land cleanly
  const splitWeight = 0.25 + 0.75 * kin.ascentWeight + 0.55 * kin.apexWeight;
  const strideAmp = lerp(standingStride, runningSplit, speed);

  const airAngle =
    ascent * kin.ascentWeight +
    apex * kin.apexWeight +
    descent * kin.descentWeight +
    spineBoost +
    strideAmp * strideAtLaunch * clamp01(splitWeight);

  return lerp(crouch, airAngle, kin.airBlend);
}
