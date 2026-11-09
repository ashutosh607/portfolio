import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  INITIAL_SPAWN,
  VILLAGE_BOUNDS,
  WALK_SPEED,
  SPRINT_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
  MAX_STEP_HEIGHT,
} from '../utils/constants';
import { KONOHA_LOCATIONS } from '../config/locations';
import { sampleGroundY, isWallBlocking } from '../utils/terrainCollider';

// Preload the Naruto model
useGLTF.preload('/models/naruto/source/untitled.glb');

const shadowDiscGeom = new THREE.CircleGeometry(0.42, 16);
const shadowDiscMat = new THREE.MeshBasicMaterial({
  color: '#120d0a',
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
});

// Pre-allocated scratch math objects for 0-GC skeletal walk/sprint blending in useFrame
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _tmpQuat = new THREE.Quaternion();
const _tmpQuat2 = new THREE.Quaternion();
const _walkQuat = new THREE.Quaternion();

const Naruto = React.memo(function Naruto({
  terrainMesh,
  cameraAngleRef,
  playerPosRef,
  onPositionUpdate,
  onStateChange,
  onKeysChange,
  resetSignal,
  isMovementPaused = false,
  fastTravelTarget = null,
  enableShadows = true,
  touchInputRef = null,
}) {
  const group = useRef();
  const innerModel = useRef();
  const { invalidate } = useThree();

  // Load the Naruto GLTF
  const { scene, animations } = useGLTF('/models/naruto/source/untitled.glb');
  const { actions } = useAnimations(animations, group);

  // Character physical state
  const physics = useRef({
    x: INITIAL_SPAWN.position[0],
    y: INITIAL_SPAWN.position[1],
    z: INITIAL_SPAWN.position[2],
    groundY: INITIAL_SPAWN.position[1],
    velocityY: 0,
    isGrounded: true,
    rotation: INITIAL_SPAWN.facing, // face the visitor on initial arrival
    chakra: 100,
    speed: 0, // for smooth acceleration
  });

  // Throttler ref to prevent flooding React state on every single animation frame
  const lastReportRef = useRef({
    x: INITIAL_SPAWN.position[0],
    y: INITIAL_SPAWN.position[1],
    z: INITIAL_SPAWN.position[2],
    state: 'idle',
    chakra: 100,
    lastPosTime: 0,
    lastStateTime: 0,
  });

  // Track keyboard inputs
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  });

  // Keep track of active key codes for HUD display
  const activeKeyMap = useRef({});

  // Bones cache, upright walk cycle phase, and smooth blend weights (idle <-> walk <-> ninja sprint)
  const boneDataRef = useRef([]);
  const animBlendRef = useRef(0);
  const sprintBlendRef = useRef(0);
  const walkPhaseRef = useRef(0);
  const idleLockedRef = useRef(false);

  // Reset character position if requested
  useEffect(() => {
    if (resetSignal) {
      physics.current.x = INITIAL_SPAWN.position[0];
      physics.current.y = INITIAL_SPAWN.position[1];
      physics.current.z = INITIAL_SPAWN.position[2];
      physics.current.groundY = INITIAL_SPAWN.position[1];
      physics.current.velocityY = 0;
      physics.current.isGrounded = true;
      physics.current.rotation = INITIAL_SPAWN.facing;
      physics.current.speed = 0;
      if (group.current) {
        group.current.position.set(...INITIAL_SPAWN.position);
        group.current.rotation.y = INITIAL_SPAWN.facing;
      }
      if (playerPosRef) {
        playerPosRef.current[0] = INITIAL_SPAWN.position[0];
        playerPosRef.current[1] = INITIAL_SPAWN.position[1];
        playerPosRef.current[2] = INITIAL_SPAWN.position[2];
      }
      onPositionUpdate?.([...INITIAL_SPAWN.position]);
    }
  }, [resetSignal, onPositionUpdate, playerPosRef]);

  // Snap initial spawn position to street ground level once spatial collider is ready
  useEffect(() => {
    if (terrainMesh?.isSpatialCollider) {
      const p = physics.current;
      const gy = sampleGroundY(terrainMesh, p.x, p.z, 2.2, -1.5);
      if (gy !== null) {
        p.y = gy;
        p.groundY = gy;
        if (group.current) {
          group.current.position.y = gy;
        }
      }
    }
  }, [terrainMesh]);

  // Fast travel to target landmark (always snapped to street/ground level, never roof level)
  useEffect(() => {
    if (fastTravelTarget) {
      const tx = fastTravelTarget[0];
      const tz = fastTravelTarget[2];
      const detectedY =
        terrainMesh?.isSpatialCollider
          ? sampleGroundY(terrainMesh, tx, tz, 2.2, -1.5)
          : null;
      const ty = detectedY !== null ? detectedY : fastTravelTarget[1] || 0;

      // Orient Naruto toward the destination's straight arrival facing angle
      const matchedLoc = KONOHA_LOCATIONS.find(
        (l) => Math.hypot(l.position[0] - tx, l.position[2] - tz) < 1.5
      );
      let nextRot = physics.current.rotation;
      if (matchedLoc?.arrivalFacing !== undefined) {
        nextRot = matchedLoc.arrivalFacing;
      } else if (matchedLoc?.shrinePosition) {
        const dx = matchedLoc.shrinePosition[0] - tx;
        const dz = matchedLoc.shrinePosition[2] - tz;
        if (Math.hypot(dx, dz) > 0.1) {
          nextRot = Math.atan2(dx, dz);
        }
      }

      physics.current.x = tx;
      physics.current.y = ty;
      physics.current.z = tz;
      physics.current.groundY = ty;
      physics.current.velocityY = 0;
      physics.current.isGrounded = true;
      physics.current.speed = 0;
      physics.current.rotation = nextRot;
      if (group.current) {
        group.current.position.set(tx, ty, tz);
        group.current.rotation.y = nextRot;
      }
      if (playerPosRef) {
        playerPosRef.current[0] = tx;
        playerPosRef.current[1] = ty;
        playerPosRef.current[2] = tz;
        playerPosRef.current[3] = nextRot;
      }
      onPositionUpdate?.([tx, ty, tz]);
      invalidate();
    }
  }, [fastTravelTarget, onPositionUpdate, playerPosRef, terrainMesh, invalidate]);

  // Clear keys when movement is paused (e.g. dialogue or portfolio modal open)
  useEffect(() => {
    if (isMovementPaused) {
      keys.current.forward = false;
      keys.current.backward = false;
      keys.current.left = false;
      keys.current.right = false;
      keys.current.sprint = false;
      keys.current.jump = false;
      if (touchInputRef?.current) {
        touchInputRef.current.forward = false;
        touchInputRef.current.backward = false;
        touchInputRef.current.left = false;
        touchInputRef.current.right = false;
        touchInputRef.current.sprint = false;
        touchInputRef.current.jump = false;
      }
      if (Object.keys(activeKeyMap.current).length > 0) {
        activeKeyMap.current = {};
        onKeysChange?.({});
      }
    }
  }, [isMovementPaused, onKeysChange, touchInputRef]);

  // Configure model materials & immediately apply natural hands-down standing pose to skeleton
  useEffect(() => {
    const bonesList = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = enableShadows;
        child.receiveShadow = false;
        child.frustumCulled = true;

        if (child.material) {
          child.material.depthWrite = true;
          child.material.alphaTest = 0.25;
          child.material.roughness = Math.max(0.4, child.material.roughness || 0.5);
          child.material.needsUpdate = true;
        }
      }

      if (child.isBone) {
        // Cache true unrotated bind pose once on userData so re-renders never double-rotate
        if (!child.userData.__baseQuat) {
          child.userData.__baseQuat = child.quaternion.clone();
          child.userData.__basePos = child.position.clone();

          const idleQuat = child.userData.__baseQuat.clone();
          // Rotate arms down by +1.35 rad (~77.3 deg) along local X so hands rest naturally at sides
          if (child.name === 'mixamorigLeftArm' || child.name === 'mixamorig:LeftArm') {
            idleQuat.multiply(
              new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.35)
            );
          } else if (child.name === 'mixamorigRightArm' || child.name === 'mixamorig:RightArm') {
            idleQuat.multiply(
              new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.35)
            );
          }
          child.userData.__idleQuat = idleQuat;

          // Apply immediately on mount so PropertyMixer caches the hands-down pose instead of T-pose
          child.quaternion.copy(idleQuat);
        }

        const shortName = child.name.replace(/^mixamorig:?/, '');
        bonesList.push({
          bone: child,
          name: child.name,
          shortName,
          baseQuat: child.userData.__baseQuat,
          basePos: child.userData.__basePos,
          idleQuat: child.userData.__idleQuat,
        });
      }
    });

    boneDataRef.current = bonesList;
    idleLockedRef.current = false;
    scene.updateMatrixWorld(true);
  }, [scene, enableShadows]);

  // Keyboard Event Listeners (with e.repeat guard to eliminate 30Hz React re-render storms)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.repeat || isMovementPaused) return;

      // DEV ONLY: press P to show Naruto's exact world coordinates (for placing objects)
      if (import.meta.env.DEV && e.code === 'KeyP') {
        const ph = physics.current;
        const msg = `Naruto position: [${ph.x.toFixed(2)}, ${ph.y.toFixed(2)}, ${ph.z.toFixed(2)}]  rotation: ${ph.rotation.toFixed(2)}`;
        console.log(msg);
        window.alert(msg);
        return;
      }

      if (!activeKeyMap.current[e.code]) {
        activeKeyMap.current[e.code] = true;
        onKeysChange?.({ ...activeKeyMap.current });
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = true;
      if (e.code === 'Space') keys.current.jump = true;
    };

    const handleKeyUp = (e) => {
      if (activeKeyMap.current[e.code]) {
        delete activeKeyMap.current[e.code];
        onKeysChange?.({ ...activeKeyMap.current });
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = false;
      if (e.code === 'Space') keys.current.jump = false;
    };

    const handleBlur = () => {
      keys.current.forward = false;
      keys.current.backward = false;
      keys.current.left = false;
      keys.current.right = false;
      keys.current.sprint = false;
      keys.current.jump = false;
      if (Object.keys(activeKeyMap.current).length > 0) {
        activeKeyMap.current = {};
        onKeysChange?.({});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onKeysChange, isMovementPaused]);

  // Main physics, O(1) spatial collision & glitch-free skeletal animation loop
  useFrame((state, delta) => {
    if (!group.current) return;

    const dt = Math.min(delta, 0.05);
    const p = physics.current;
    const k = keys.current;

    // Camera yaw angle for camera-relative steering
    const camAngle = cameraAngleRef?.current ?? 0;

    // Movement input vector (disabled when isMovementPaused is true)
    let forwardInput = 0;
    let rightInput = 0;
    const tInput = touchInputRef?.current;
    if (!isMovementPaused) {
      if (k.forward || tInput?.forward) forwardInput += 1;
      if (k.backward || tInput?.backward) forwardInput -= 1;
      if (k.left || tInput?.left) rightInput -= 1;
      if (k.right || tInput?.right) rightInput += 1;
    }

    const isMoving = forwardInput !== 0 || rightInput !== 0;

    let moveDirX = 0;
    let moveDirZ = 0;

    if (isMoving) {
      const forwardX = -Math.sin(camAngle);
      const forwardZ = -Math.cos(camAngle);
      const rightX = Math.cos(camAngle);
      const rightZ = -Math.sin(camAngle);

      moveDirX = forwardX * forwardInput + rightX * rightInput;
      moveDirZ = forwardZ * forwardInput + rightZ * rightInput;

      const len = Math.hypot(moveDirX, moveDirZ);
      if (len > 0.0001) {
        moveDirX /= len;
        moveDirZ /= len;
      }
    }

    // Sprinting logic with chakra/stamina drain
    let isSprinting = false;
    if (isMoving && (k.sprint || tInput?.sprint) && p.chakra > 5) {
      isSprinting = true;
      p.chakra = Math.max(0, p.chakra - dt * 16);
    } else {
      p.chakra = Math.min(100, p.chakra + dt * 14);
    }

    // Smooth acceleration / deceleration
    const targetSpeed = isMoving ? (isSprinting ? SPRINT_SPEED : WALK_SPEED) : 0;
    p.speed += (targetSpeed - p.speed) * Math.min(1, dt * 14);

    // Jumping physics
    if ((k.jump || tInput?.jump) && p.isGrounded && p.chakra >= 8 && !isMovementPaused) {
      p.velocityY = JUMP_VELOCITY;
      p.isGrounded = false;
      p.chakra = Math.max(0, p.chakra - 6);
    }

    // Prospective new position
    const movedHorizontally = p.speed > 0.02 && isMoving;
    let newX = p.x + (movedHorizontally ? moveDirX * p.speed * dt : 0);
    let newZ = p.z + (movedHorizontally ? moveDirZ * p.speed * dt : 0);

    // ================= O(1) SPATIAL GRID TERRAIN & WALL COLLISION =================
    if (terrainMesh && terrainMesh.isSpatialCollider) {
      if (movedHorizontally) {
        const blocked = isWallBlocking(
          terrainMesh,
          p.x,
          p.y + 0.75,
          p.z,
          moveDirX,
          moveDirZ,
          0.6
        );
        if (blocked) {
          newX = p.x;
          newZ = p.z;
        }
      }

      if (movedHorizontally || !p.isGrounded) {
        const detectedGroundY = sampleGroundY(
          terrainMesh,
          newX,
          newZ,
          p.y + MAX_STEP_HEIGHT + 0.2,
          -2.5
        );

        if (detectedGroundY !== null) {
          if (detectedGroundY - p.groundY > MAX_STEP_HEIGHT && p.isGrounded) {
            newX = p.x;
            newZ = p.z;
          } else {
            p.groundY = detectedGroundY;
          }
        }
      }
    }

    // Vertical physics & ground snapping
    if (!p.isGrounded) {
      p.velocityY += GRAVITY * dt;
      p.y += p.velocityY * dt;
      if (p.y <= p.groundY) {
        p.y = p.groundY;
        p.velocityY = 0;
        p.isGrounded = true;
      }
    } else if (Math.abs(p.groundY - p.y) > 0.0005) {
      p.y += (p.groundY - p.y) * Math.min(1, dt * 20);
    }

    // Clamp inside village perimeter boundaries
    newX = Math.max(VILLAGE_BOUNDS.minX, Math.min(VILLAGE_BOUNDS.maxX, newX));
    newZ = Math.max(VILLAGE_BOUNDS.minZ, Math.min(VILLAGE_BOUNDS.maxZ, newZ));

    p.x = newX;
    p.z = newZ;

    // Smooth rotation facing movement direction
    if (isMoving && p.speed > 0.5) {
      const targetAngle = Math.atan2(moveDirX, moveDirZ);
      const diff = Math.atan2(
        Math.sin(targetAngle - p.rotation),
        Math.cos(targetAngle - p.rotation)
      );
      p.rotation += diff * Math.min(1, dt * 15);
    }

    // Apply transformation to character group
    group.current.position.set(p.x, p.y, p.z);
    group.current.rotation.y = p.rotation;

    // ================= GLITCH-FREE ANIMATION: IDLE <-> NORMAL WALK <-> NINJA SPRINT =================
    const runClip = actions['Armature|mixamo.com|Layer0'];

    let stateStr = 'idle';
    if (!p.isGrounded) {
      stateStr = 'jumping';
    } else if (p.speed > 0.4) {
      stateStr = isSprinting ? 'sprinting' : 'walking';
    }

    // 1. Overall locomotion blend: 0 = standing idle, 1 = moving (walking or sprinting)
    const wantsMove = p.speed > 0.4 || !p.isGrounded;
    const targetMoveBlend = wantsMove ? 1.0 : 0.0;
    animBlendRef.current += (targetMoveBlend - animBlendRef.current) * Math.min(1, dt * 11);
    const moveBlend = animBlendRef.current;

    // 2. Sprint posture blend: 0 = upright normal walk, 1 = leaning ninja sprint clip
    const wantsSprintPose = (wantsMove && isSprinting) || !p.isGrounded;
    const targetSprintBlend = wantsSprintPose ? 1.0 : 0.0;
    sprintBlendRef.current += (targetSprintBlend - sprintBlendRef.current) * Math.min(1, dt * 9);
    const sprintBlend = sprintBlendRef.current;

    const bones = boneDataRef.current;

    if (moveBlend > 0.008 && bones.length > 0) {
      idleLockedRef.current = false;

      // Advance upright walk cycle phase proportional to movement speed
      const stepRate = Math.max(2.2, Math.min(p.speed, WALK_SPEED * 1.15)) * 1.48;
      walkPhaseRef.current = (walkPhaseRef.current + dt * stepRate) % (Math.PI * 2);
      const phase = walkPhaseRef.current;

      // Sine wave gait signals for alternating left/right stride & counter-swing
      const leftSwing = Math.sin(phase);
      const rightSwing = -leftSwing;
      const leftKneeLift = Math.max(0, Math.cos(phase - 0.32));
      const rightKneeLift = Math.max(0, -Math.cos(phase - 0.32));

      // Only drive the Mixamo ninja-run clip when sprinting (or blending out of sprint / jumping)
      if (runClip) {
        if (sprintBlend > 0.008) {
          if (!runClip.isRunning()) {
            runClip.reset();
            runClip.setEffectiveWeight(1.0);
            runClip.play();
          }
          runClip.timeScale = !p.isGrounded ? 0.35 : 1.45;
        } else if (runClip.isRunning()) {
          runClip.stop();
        }
      }

      const walkWeightFromIdle = 1.0 - moveBlend;
      const walkWeightFromSprint = 1.0 - sprintBlend;

      for (let i = 0, len = bones.length; i < len; i++) {
        const b = bones[i];
        _walkQuat.copy(b.idleQuat);

        // Construct natural upright human walking pose per bone
        switch (b.shortName) {
          case 'LeftUpLeg':
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisX, leftSwing * 0.48));
            break;
          case 'RightUpLeg':
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisX, rightSwing * 0.48));
            break;
          case 'LeftLeg':
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisX, -(0.06 + 0.54 * leftKneeLift)));
            break;
          case 'RightLeg':
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisX, -(0.06 + 0.54 * rightKneeLift)));
            break;
          case 'LeftFoot':
            _walkQuat.multiply(
              _tmpQuat.setFromAxisAngle(_axisX, -0.14 * leftKneeLift + 0.12 * leftSwing)
            );
            break;
          case 'RightFoot':
            _walkQuat.multiply(
              _tmpQuat.setFromAxisAngle(_axisX, -0.14 * rightKneeLift + 0.12 * rightSwing)
            );
            break;
          case 'LeftArm':
            // Natural arm counter-swing at sides (opposite to left leg)
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisZ, -leftSwing * 0.34));
            break;
          case 'RightArm':
            // Same signed local Z angle swings right arm opposite to left arm in world space
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisZ, -leftSwing * 0.34));
            break;
          case 'LeftForeArm':
            _walkQuat.multiply(
              _tmpQuat.setFromAxisAngle(_axisZ, 0.2 + 0.16 * Math.max(0, -leftSwing))
            );
            break;
          case 'RightForeArm':
            _walkQuat.multiply(
              _tmpQuat.setFromAxisAngle(_axisZ, -(0.2 + 0.16 * Math.max(0, leftSwing)))
            );
            break;
          case 'Spine':
            _walkQuat
              .multiply(_tmpQuat.setFromAxisAngle(_axisX, 0.035))
              .multiply(_tmpQuat2.setFromAxisAngle(_axisY, -leftSwing * 0.055));
            break;
          case 'Spine1':
            _walkQuat.multiply(_tmpQuat.setFromAxisAngle(_axisY, -leftSwing * 0.045));
            break;
          default:
            break;
        }

        // Smooth fade between standing idle and upright walk
        if (walkWeightFromIdle > 0.005) {
          _walkQuat.slerp(b.idleQuat, walkWeightFromIdle);
        }

        // Blend between upright normal walk (sprintBlend = 0) and ninja sprint clip (sprintBlend = 1)
        if (sprintBlend > 0.008 && runClip) {
          if (walkWeightFromSprint > 0.005) {
            b.bone.quaternion.slerp(_walkQuat, walkWeightFromSprint);
            b.bone.position.lerp(b.basePos, walkWeightFromSprint);
          }
        } else {
          b.bone.quaternion.copy(_walkQuat);
          b.bone.position.copy(b.basePos);
        }
      }
    } else {
      if (runClip && runClip.isRunning()) {
        runClip.stop();
        idleLockedRef.current = false;
      }
      // Lock skeleton cleanly into hands-down standing pose on the exact frame movement stops
      if (!idleLockedRef.current && bones.length > 0) {
        for (let i = 0, len = bones.length; i < len; i++) {
          const b = bones[i];
          b.bone.quaternion.copy(b.idleQuat);
          b.bone.position.copy(b.basePos);
        }
        idleLockedRef.current = true;
      }
    }

    // Subtle vertical cadence bob during normal walking & gentle breathing when idle
    if (innerModel.current) {
      if (p.speed <= 0.4 && p.isGrounded) {
        const breathTime = state.clock.getElapsedTime();
        innerModel.current.position.y = Math.sin(breathTime * 2.5) * 0.008;
      } else if (p.isGrounded && sprintBlend < 0.99) {
        const walkBob =
          Math.abs(Math.sin(walkPhaseRef.current)) * 0.024 * moveBlend * (1.0 - sprintBlend);
        innerModel.current.position.y = walkBob;
      } else {
        innerModel.current.position.y = 0;
      }
    }

    // Update direct reference for 60fps smooth camera & proximity tracking without React re-renders
    if (playerPosRef) {
      playerPosRef.current[0] = p.x;
      playerPosRef.current[1] = p.y;
      playerPosRef.current[2] = p.z;
      playerPosRef.current[3] = p.rotation;
    }

    // Throttled parent state updates for HUD landmark pill (only when moved > 1.2m)
    const now = state.clock.getElapsedTime();
    const rep = lastReportRef.current;
    const dx = p.x - rep.x;
    const dz = p.z - rep.z;
    const distMoved = Math.hypot(dx, dz);

    if (distMoved > 1.2 && now - rep.lastPosTime > 0.4) {
      rep.x = p.x;
      rep.y = p.y;
      rep.z = p.z;
      rep.lastPosTime = now;
      onPositionUpdate?.([p.x, p.y, p.z]);
    }

    // Only update chakra and state when actually changed
    const roundedChakra = Math.round(p.chakra);
    const stateChanged = stateStr !== rep.state;
    const chakraChanged = Math.abs(roundedChakra - rep.chakra) >= 4;

    if (stateChanged || (chakraChanged && now - rep.lastStateTime > 0.25)) {
      rep.state = stateStr;
      rep.chakra = roundedChakra;
      rep.lastStateTime = now;
      onStateChange?.(stateStr, roundedChakra);
    }
  });

  return (
    <group ref={group} dispose={null}>
      {/* Ground contact shadow disc (always keeps character grounded even in Lite/No-Shadow mode) */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={shadowDiscGeom}
        material={shadowDiscMat}
      />
      <group ref={innerModel}>
        <primitive object={scene} />
      </group>
    </group>
  );
});

export default Naruto;
