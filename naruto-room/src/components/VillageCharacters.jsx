import React, { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CHARACTERS_DATA } from '../config/dialogueData';
import { adjustCharacterPose } from '../utils/poseUtils';
import { sampleGroundY } from '../utils/terrainCollider';

// Single subtle ground marker geometry used ONLY beneath the currently selected target
const selectedTargetMarkerGeom = new THREE.RingGeometry(0.54, 0.63, 28);
const selectedTargetMarkerMat = new THREE.MeshBasicMaterial({
  color: '#A84434',
  transparent: true,
  opacity: 0.34,
  side: THREE.DoubleSide,
  depthWrite: false,
});

// Single character representation (memoized so it only re-renders when its selection or dialogue status changes)
const CharacterActor = React.memo(function CharacterActor({
  data,
  playerPosRef,
  terrainMesh,
  isSelectedTarget = false,
  isDialogueActive = false,
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
      {/* Subtle single ground marker shown ONLY beneath the currently selected target */}
      {isSelectedTarget && !isDialogueActive && (
        <mesh
          position={[0, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={selectedTargetMarkerGeom}
          material={selectedTargetMarkerMat}
        />
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
    </group>
  );
});

const VillageCharacters = React.memo(function VillageCharacters({
  terrainMesh,
  playerPosRef,
  selectedTargetUid = null,
  isDialogueActive = false,
  enableShadows = true,
}) {
  return (
    <group name="KonohaVillageCharacters">
      {CHARACTERS_DATA.map((char) => (
        <Suspense key={char.id} fallback={null}>
          <CharacterActor
            data={char}
            playerPosRef={playerPosRef}
            terrainMesh={terrainMesh}
            isSelectedTarget={selectedTargetUid === `npc:${char.id}`}
            isDialogueActive={isDialogueActive}
            enableShadows={enableShadows}
          />
        </Suspense>
      ))}
    </group>
  );
});

export default VillageCharacters;
