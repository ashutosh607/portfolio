import React, { useRef, useEffect, useState, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CHARACTERS_DATA } from '../config/dialogueData';
import { adjustCharacterPose } from '../utils/poseUtils';
import { sampleGroundY } from '../utils/terrainCollider';

// Shared ring geometries across all village characters
const innerRingGeom = new THREE.RingGeometry(0.55, 0.85, 20);
const outerRingGeom = new THREE.RingGeometry(0.9, 1.05, 20);

// Single character representation (memoized so it only re-renders when its own isNearby or dialogue status changes)
const CharacterActor = React.memo(function CharacterActor({
  data,
  playerPosRef,
  terrainMesh,
  onInteract,
  isNearby,
  isDialogueActive,
  enableShadows = true,
}) {
  const { scene } = useGLTF(data.modelPath);
  const rootRef = useRef();
  const innerRef = useRef();

  // Configure shadows, natural standing pose adjustments, and material optimizations
  useEffect(() => {
    if (!scene) return;

    // 1. Standing pose correction (brings arms/hands down naturally at the sides & hides duplicate rip meshes)
    adjustCharacterPose(data.id, scene);

    // 2. Traversal for frustum culling, shadow capping, and material cleanup
    scene.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = true;

        // High-density optimization: models with >15,000 vertices (e.g. Sasuke with 937k vertices)
        // skip dynamic shadow-map passes & PCF shadow lookups, preventing GPU bottleneck
        const vertCount = child.geometry?.attributes?.position?.count || 0;
        const isLowPoly = vertCount < 15000;
        child.castShadow = enableShadows && isLowPoly;
        child.receiveShadow = enableShadows && isLowPoly;

        const optimizeMat = (mat) => {
          if (!mat) return;
          mat.depthWrite = true;
          mat.alphaTest = 0.2;
          if (vertCount > 25000) {
            mat.side = THREE.FrontSide;
          }
          mat.needsUpdate = true;
        };

        if (Array.isArray(child.material)) {
          child.material.forEach(optimizeMat);
        } else if (child.material) {
          optimizeMat(child.material);
        }
      }
    });
  }, [scene, data.id, enableShadows]);

  // O(1) snap character standing position precisely on the terrain surface
  useEffect(() => {
    if (!terrainMesh || !rootRef.current) return;
    if (terrainMesh.isSpatialCollider) {
      const groundY = sampleGroundY(
        terrainMesh,
        data.position[0],
        data.position[2],
        2.2,
        -1.5
      );
      if (groundY !== null) {
        rootRef.current.position.y = groundY + (data.feetOffset || 0.01);
      }
    }
  }, [terrainMesh, data.position, data.feetOffset]);

  // Distance-culled visibility & proximity-gated breathing animation
  useFrame((state) => {
    if (!innerRef.current) return;

    const p = playerPosRef?.current;
    if (p) {
      const dx = p[0] - data.position[0];
      const dz = p[2] - data.position[2];
      const distSq = dx * dx + dz * dz;

      // Hide ultra-dense character models only when player is very far across the village (>78m)
      const shouldBeVisible = distSq <= 6084; // 78^2
      if (innerRef.current.visible !== shouldBeVisible) {
        innerRef.current.visible = shouldBeVisible;
      }

      // Only compute idle breathing sine wave when player is within 22m
      if (shouldBeVisible && distSq <= 484) {
        const t = state.clock.getElapsedTime() + data.position[0];
        innerRef.current.position.y = Math.sin(t * 1.8) * 0.008;
      }
    }
  });

  return (
    <group
      ref={rootRef}
      position={data.position}
      rotation={data.rotation}
      name={`Character-${data.id}`}
    >
      {/* Ground ninja beacon / aura */}
      <mesh
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={innerRingGeom}
      >
        <meshBasicMaterial
          color={data.themeColor || '#e67e22'}
          transparent
          opacity={isNearby ? 0.65 : 0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer pulsing ring when nearby */}
      {isNearby && (
        <mesh
          position={[0, 0.045, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={outerRingGeom}
        >
          <meshBasicMaterial
            color={data.accentColor || '#f39c12'}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main 3D Model with orientation adjustments */}
      <group ref={innerRef}>
        <group
          rotation={data.modelRotation || [0, 0, 0]}
          scale={data.scale || 1}
          position={data.modelOffset || [0, 0, 0]}
        >
          <primitive object={scene} />
        </group>
      </group>

      {/* Floating 3D Interaction Prompt overhead */}
      {isNearby && !isDialogueActive && (
        <Html
          position={[0, 2.25, 0]}
          center
          distanceFactor={13}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="ninja-interaction-badge"
            onClick={() => onInteract(data)}
            role="button"
            tabIndex={0}
            title={`Talk to ${data.name}`}
          >
            <div className="prompt-key-badge">E</div>
            <div className="prompt-text-block">
              <span className="prompt-action">TALK TO</span>
              <strong className="prompt-name">{data.name.toUpperCase()}</strong>
            </div>
            <div className="prompt-arrow">▼</div>
          </div>
        </Html>
      )}
    </group>
  );
});

const VillageCharacters = React.memo(function VillageCharacters({
  terrainMesh,
  playerPosRef,
  onStartDialogue,
  isDialogueActive = false,
  onNearbyCharacterChange,
  enableShadows = true,
}) {
  const [nearbyChar, setNearbyChar] = useState(null);
  const prevClosestIdRef = useRef(null);
  const lastCheckTimeRef = useRef(0);

  // Check nearest character using mutable playerPosRef at 10Hz without triggering React re-renders on walk
  useFrame((state) => {
    const now = state.clock.getElapsedTime();
    if (now - lastCheckTimeRef.current < 0.1) return;
    lastCheckTimeRef.current = now;

    const p = playerPosRef?.current;
    if (!p) return;

    let closest = null;
    let minD = Infinity;

    for (let i = 0, len = CHARACTERS_DATA.length; i < len; i++) {
      const char = CHARACTERS_DATA[i];
      const dx = p[0] - char.position[0];
      const dz = p[2] - char.position[2];
      const maxDist = char.interactionDistance || 3.5;
      const distSq = dx * dx + dz * dz;
      if (distSq <= maxDist * maxDist) {
        const dist = Math.sqrt(distSq);
        if (dist < minD) {
          minD = dist;
          closest = char;
        }
      }
    }

    const newId = closest?.id || null;
    if (newId !== prevClosestIdRef.current) {
      prevClosestIdRef.current = newId;
      setNearbyChar(closest);
      onNearbyCharacterChange?.(
        closest ? { character: closest, distance: minD } : null
      );
    }
  });

  // Global 'KeyE' listener to trigger interaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearbyChar && !isDialogueActive) {
        e.preventDefault();
        onStartDialogue(nearbyChar);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nearbyChar, isDialogueActive, onStartDialogue]);

  return (
    <group name="KonohaVillageCharacters">
      {CHARACTERS_DATA.map((char) => (
        <Suspense key={char.id} fallback={null}>
          <CharacterActor
            data={char}
            playerPosRef={playerPosRef}
            terrainMesh={terrainMesh}
            onInteract={onStartDialogue}
            isNearby={nearbyChar?.id === char.id}
            isDialogueActive={isDialogueActive}
            enableShadows={enableShadows}
          />
        </Suspense>
      ))}
    </group>
  );
});

export default VillageCharacters;
