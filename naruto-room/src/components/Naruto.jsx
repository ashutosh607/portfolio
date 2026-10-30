import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
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

  // Load the Naruto GLTF
  const { scene, animations } = useGLTF('/models/naruto/source/untitled.glb');
  const { actions } = useAnimations(animations, group);

  // Character physical state
  const physics = useRef({
    x: -19.4,
    y: 1.62,
    z: 5.0,
    groundY: 1.62,
    velocityY: 0,
    isGrounded: true,
    rotation: Math.PI, // start facing forward down the main street towards Hokage Monument (-Z)
    chakra: 100,
    speed: 0, // for smooth acceleration
  });

  // Throttler ref to prevent flooding React state on every single animation frame
  const lastReportRef = useRef({
    x: -19.4,
    y: 1.62,
    z: 5.0,
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

  // Bones cache and custom idle pose blend state (0 = hands-down standing idle, 1 = running clip)
  const boneDataRef = useRef([]);
  const animBlendRef = useRef(0);
  const idleLockedRef = useRef(false);

  // Reset character position if requested
  useEffect(() => {
    if (resetSignal) {
      physics.current.x = -19.4;
      physics.current.y = 1.62;
      physics.current.z = 5.0;
      physics.current.groundY = 1.62;
      physics.current.velocityY = 0;
      physics.current.isGrounded = true;
      physics.current.rotation = Math.PI;
      physics.current.speed = 0;
      if (group.current) {
        group.current.position.set(-19.4, 1.62, 5.0);
        group.current.rotation.y = Math.PI;
      }
      if (playerPosRef) {
        playerPosRef.current[0] = -19.4;
        playerPosRef.current[1] = 1.62;
        playerPosRef.current[2] = 5.0;
      }
      onPositionUpdate?.([-19.4, 1.62, 5.0]);
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
      }
      onPositionUpdate?.([tx, ty, tz]);
    }
  }, [fastTravelTarget, onPositionUpdate, playerPosRef, terrainMesh]);

  // Clear keys when movement is paused (e.g. dialogue or portfolio modal open)
  useEffect(() => {
    if (isMovementPaused) {
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
    }
  }, [isMovementPaused, onKeysChange]);

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

        bonesList.push({
          bone: child,
          name: child.name,
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

    // ================= GLITCH-FREE ANIMATION & STANDING HANDS-DOWN POSE =================
    const runClip = actions['Armature|mixamo.com|Layer0'];

    let stateStr = 'idle';
    if (!p.isGrounded) {
      stateStr = 'jumping';
    } else if (p.speed > 0.4) {
      stateStr = isSprinting ? 'sprinting' : 'walking';
    }

    // Smoothly ramp animation blend weight between 0 (standing hands-down) and 1 (running)
    const wantsRun = p.speed > 0.4;
    const targetBlend = wantsRun ? 1.0 : 0.0;
    animBlendRef.current += (targetBlend - animBlendRef.current) * Math.min(1, dt * 11);
    const blend = animBlendRef.current;
    const bones = boneDataRef.current;

    if (runClip) {
      if (blend > 0.01) {
        idleLockedRef.current = false;
        if (!runClip.isRunning()) {
          runClip.reset();
          runClip.setEffectiveWeight(1.0);
          runClip.play();
        }
        runClip.timeScale = !p.isGrounded ? 0.35 : isSprinting ? 1.45 : 1.0;

        // Blend animated bone transforms directly with hands-down idleQuat (avoids PropertyMixer T-pose fade glitches)
        const idleWeight = 1.0 - blend;
        if (idleWeight > 0.005 && bones.length > 0) {
          for (let i = 0, len = bones.length; i < len; i++) {
            const b = bones[i];
            b.bone.quaternion.slerp(b.idleQuat, idleWeight);
            b.bone.position.lerp(b.basePos, idleWeight);
          }
        }
      } else {
        if (runClip.isRunning()) {
          runClip.stop();
          idleLockedRef.current = false;
        }
        // Lock skeleton cleanly into hands-down standing pose on the exact frame runClip stops
        if (!idleLockedRef.current && bones.length > 0) {
          for (let i = 0, len = bones.length; i < len; i++) {
            const b = bones[i];
            b.bone.quaternion.copy(b.idleQuat);
            b.bone.position.copy(b.basePos);
          }
          idleLockedRef.current = true;
        }
      }
    }

    // Gentle breathing motion when idle on the ground
    if (p.speed <= 0.4 && p.isGrounded && innerModel.current) {
      const breathTime = state.clock.getElapsedTime();
      innerModel.current.position.y = Math.sin(breathTime * 2.5) * 0.008;
    } else if (innerModel.current) {
      innerModel.current.position.y = 0;
    }

    // Update direct reference for 60fps smooth camera & proximity tracking without React re-renders
    if (playerPosRef) {
      playerPosRef.current[0] = p.x;
      playerPosRef.current[1] = p.y;
      playerPosRef.current[2] = p.z;
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
