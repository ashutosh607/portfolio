import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_CONFIG } from '../utils/constants';
import { KONOHA_LOCATIONS } from '../config/locations';

const CameraController = React.memo(function CameraController({
  playerPosRef,
  cameraAngleRef,
  fastTravelTarget,
}) {
  const { camera, gl } = useThree();

  const orbitRef = useRef({
    yaw: 0, // 0 means camera is behind Naruto looking down -Z (main street)
    pitch: CAMERA_CONFIG.defaultPitch,
    distance: CAMERA_CONFIG.defaultDistance,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Reusable pre-allocated vectors (zero GC allocations per frame)
  const smoothLookTarget = useRef(new THREE.Vector3(-16.31, -0.07 + CAMERA_CONFIG.targetHeight, -6.8));
  const smoothCamPos = useRef(new THREE.Vector3(-16.31, -0.07 + 1.8, -6.8 + CAMERA_CONFIG.defaultDistance));
  const desiredTarget = useRef(new THREE.Vector3());
  const desiredCamPos = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  // Fast-travel instant camera orientation straight behind player
  useEffect(() => {
    if (fastTravelTarget) {
      const tx = fastTravelTarget[0];
      const ty = fastTravelTarget[1] || 0;
      const tz = fastTravelTarget[2];
      const matchedLoc = KONOHA_LOCATIONS.find(
        (l) => Math.hypot(l.position[0] - tx, l.position[2] - tz) < 1.5
      );
      const targetYaw = matchedLoc?.cameraYaw !== undefined ? matchedLoc.cameraYaw : 0;
      orbitRef.current.yaw = targetYaw;
      if (cameraAngleRef) {
        cameraAngleRef.current = targetYaw;
      }
      const dist = orbitRef.current.distance;
      const pitch = orbitRef.current.pitch;
      const targetH = CAMERA_CONFIG.targetHeight;
      smoothLookTarget.current.set(tx, ty + targetH, tz);
      smoothCamPos.current.set(
        tx + Math.sin(targetYaw) * Math.cos(pitch) * dist,
        ty + targetH + Math.sin(pitch) * dist,
        tz + Math.cos(targetYaw) * Math.cos(pitch) * dist
      );
    }
  }, [fastTravelTarget, cameraAngleRef]);

  // Sync external ref so Naruto movement can align with camera yaw
  useEffect(() => {
    if (cameraAngleRef) {
      cameraAngleRef.current = orbitRef.current.yaw;
    }
  }, [cameraAngleRef]);

  // Pointer and Wheel listeners on the Canvas DOM element
  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = (e) => {
      if (e.button === 0 || e.pointerType === 'touch') {
        orbitRef.current.isDragging = true;
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
      }
    };

    const handlePointerMove = (e) => {
      if (!orbitRef.current.isDragging) return;

      const deltaX = e.clientX - orbitRef.current.lastX;
      const deltaY = e.clientY - orbitRef.current.lastY;

      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;

      const sensitivity = 0.0055;
      orbitRef.current.yaw -= deltaX * sensitivity;
      orbitRef.current.pitch += deltaY * sensitivity;

      orbitRef.current.pitch = Math.max(
        CAMERA_CONFIG.minPitch,
        Math.min(CAMERA_CONFIG.maxPitch, orbitRef.current.pitch)
      );

      if (orbitRef.current.yaw > Math.PI) orbitRef.current.yaw -= Math.PI * 2;
      if (orbitRef.current.yaw < -Math.PI) orbitRef.current.yaw += Math.PI * 2;

      if (cameraAngleRef) {
        cameraAngleRef.current = orbitRef.current.yaw;
      }
    };

    const handlePointerUp = () => {
      orbitRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.0025;
      orbitRef.current.distance += e.deltaY * zoomSpeed;
      orbitRef.current.distance = Math.max(
        CAMERA_CONFIG.minDistance,
        Math.min(CAMERA_CONFIG.maxDistance, orbitRef.current.distance)
      );
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl, cameraAngleRef]);

  useFrame((_, delta) => {
    const { yaw, pitch, distance } = orbitRef.current;
    const dt = Math.min(delta, 0.05);

    const pos = playerPosRef?.current || [-16.31, -0.07, -6.8];
    const targetX = pos[0];
    const targetY = pos[1] + CAMERA_CONFIG.targetHeight;
    const targetZ = pos[2];

    desiredTarget.current.set(targetX, targetY, targetZ);
    smoothLookTarget.current.lerp(desiredTarget.current, Math.min(1, dt * 12));

    const cosPitch = Math.cos(pitch);
    const camX = smoothLookTarget.current.x + distance * Math.sin(yaw) * cosPitch;
    let camY = smoothLookTarget.current.y + distance * Math.sin(pitch);
    const camZ = smoothLookTarget.current.z + distance * Math.cos(yaw) * cosPitch;

    const minCamY = smoothLookTarget.current.y - CAMERA_CONFIG.targetHeight + 0.35;
    camY = Math.max(minCamY, camY);

    desiredCamPos.current.set(camX, camY, camZ);
    smoothCamPos.current.lerp(desiredCamPos.current, Math.min(1, dt * 10));

    camera.position.copy(smoothCamPos.current);

    lookTarget.current.copy(smoothLookTarget.current);
    if (pitch < 0) {
      lookTarget.current.y += -pitch * (distance * 1.4 + 3.0);
    }
    camera.lookAt(lookTarget.current);
  });

  return null;
});

export default CameraController;
