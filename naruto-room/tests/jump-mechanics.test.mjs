import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JUMP_TAKEOFF_DURATION,
  JUMP_LANDING_DURATION,
  computeGravityScale,
  evaluateJumpKinematics,
  computeJumpBoneAngle,
} from '../src/features/village/systems/jumpMechanics.js';

test('computeGravityScale produces heavier descent and variable jump cut when released early', () => {
  const heldAscent = computeGravityScale(5.0, true);
  const earlyRelease = computeGravityScale(5.0, false);
  const apex = computeGravityScale(0.8, true);
  const descent = computeGravityScale(-5.0, true);

  assert.equal(heldAscent, 1.0);
  assert.ok(earlyRelease > heldAscent, 'early jump release should increase upward deceleration');
  assert.ok(apex < heldAscent, 'apex hang should lighten gravity near peak');
  assert.ok(descent > heldAscent, 'falling should feel snappier and heavier than ascent');
});

test('evaluateJumpKinematics maintains full poseWeight across takeoff, apex, and descent without snapping to zero', () => {
  const out = {};

  // Takeoff (high positive velocity)
  evaluateJumpKinematics(
    { isGrounded: false, windup: 0, velocityY: 7.8, jumpVelocity: 7.8, landingTime: 0, impact: 0 },
    out
  );
  assert.equal(out.poseWeight, 1);
  assert.ok(out.ascentWeight > 0.9);
  assert.equal(out.descentWeight, 0);

  // Apex (zero vertical velocity)
  evaluateJumpKinematics(
    { isGrounded: false, windup: 0, velocityY: 0, jumpVelocity: 7.8, landingTime: 0, impact: 0 },
    out
  );
  assert.equal(out.poseWeight, 1);
  assert.equal(out.apexWeight, 1);

  // Descent (negative velocity)
  evaluateJumpKinematics(
    { isGrounded: false, windup: 0, velocityY: -7.8, jumpVelocity: 7.8, landingTime: 0, impact: 0 },
    out
  );
  assert.equal(out.poseWeight, 1);
  assert.ok(out.descentWeight > 0.9);
});

test('evaluateJumpKinematics computes crouch preload and landing absorption hip dip', () => {
  const out = {};

  evaluateJumpKinematics(
    {
      isGrounded: true,
      windup: JUMP_TAKEOFF_DURATION * 0.5,
      velocityY: 0,
      jumpVelocity: 7.8,
      landingTime: 0,
      impact: 0,
    },
    out
  );
  assert.ok(out.compression > 0.9);
  assert.ok(out.hipDip < -0.1);
  assert.ok(out.bodyPitch > 0);

  evaluateJumpKinematics(
    {
      isGrounded: true,
      windup: 0,
      velocityY: 0,
      jumpVelocity: 7.8,
      landingTime: JUMP_LANDING_DURATION * 0.67,
      impact: 1.0,
    },
    out
  );
  assert.ok(out.compression > 0.9);
  assert.ok(out.hipDip < -0.1);

  const kneeAngle = computeJumpBoneAngle('LeftLeg', out, 0);
  assert.ok(kneeAngle < -0.9, 'knees should flex during crouch and landing absorption');
});
