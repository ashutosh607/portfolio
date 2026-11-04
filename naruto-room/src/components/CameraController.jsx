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

  // Pointer and Wheel listeners on the Canvas DOM element with robust multi-touch isolation
  useEffect(() => {
    const domElement = gl.domElement;
    if (!domElement) return;

    // Ensure browser never interferes with touch navigation on canvas
    domElement.style.touchAction = 'none';

    const activePointers = new Map();
    let cameraPointerId = null;
    let pinchStartDist = null;
    let pinchStartCamDist = null;

    const isInteractiveUI = (target) => {
      if (!target || !target.closest) return false;
      return Boolean(
        target.closest(
          'button, a, input, select, textarea, [role="button"], [role="dialog"], .shinobi-mobile-touchpad, .touch-dpad, .touch-action-pad, .shinobi-context-prompt, .shinobi-coords-widget, .shinobi-settings-popover, .shinobi-destinations-drawer, .portfolio-modal-scroll'
        )
      );
    };

    const handlePointerDown = (e) => {
      if (isInteractiveUI(e.target)) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1) {
        cameraPointerId = e.pointerId;
        orbitRef.current.isDragging = true;
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
      } else if (activePointers.size === 2) {
        // Switch to pinch-to-zoom mode
        orbitRef.current.isDragging = false;
        const pts = Array.from(activePointers.values());
        pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchStartCamDist = orbitRef.current.distance;
      }
    };

    const handlePointerMove = (e) => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size >= 2 && pinchStartDist && pinchStartCamDist) {
        const pts = Array.from(activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (currentDist > 8) {
          const factor = pinchStartDist / currentDist;
          orbitRef.current.distance = Math.max(
            CAMERA_CONFIG.minDistance,
            Math.min(CAMERA_CONFIG.maxDistance, pinchStartCamDist * factor)
          );
        }
        return;
      }

      if (orbitRef.current.isDragging && e.pointerId === cameraPointerId) {
        const deltaX = e.clientX - orbitRef.current.lastX;
        const deltaY = e.clientY - orbitRef.current.lastY;

        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;

        const isTouch = e.pointerType === 'touch';
        const sensitivity = isTouch ? 0.0068 : 0.0055;

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
      }
    };

    const handlePointerEnd = (e) => {
      activePointers.delete(e.pointerId);

      if (activePointers.size < 2) {
        pinchStartDist = null;
        pinchStartCamDist = null;
      }

      if (e.pointerId === cameraPointerId) {
        if (activePointers.size === 1) {
          // Promote remaining touch to be camera pointer
          const [remainingId, pt] = activePointers.entries().next().value;
          cameraPointerId = remainingId;
          orbitRef.current.lastX = pt.x;
          orbitRef.current.lastY = pt.y;
          orbitRef.current.isDragging = true;
        } else {
          cameraPointerId = null;
          orbitRef.current.isDragging = false;
        }
      }
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
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
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
