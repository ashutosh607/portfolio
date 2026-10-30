import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFBX, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { KONOHA_OFFSET } from '../utils/constants';
import { KONOHA_LOCATIONS } from '../config/locations';
import { buildTerrainCollider, sampleGroundY } from '../utils/terrainCollider';

// Preload Konoha assets
useFBX.preload('/models/konoha/source/untitled.fbx');
useTexture.preload('/models/konoha/textures/Picsart_26-05-30_22-38-46-674.png');

// Shared geometries and materials for destination shrines & directional signs
const postGeom = new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8);
const beamGeom = new THREE.BoxGeometry(1.7, 0.14, 0.14);
const subBeamGeom = new THREE.BoxGeometry(1.35, 0.09, 0.1);
const signBoardGeom = new THREE.BoxGeometry(1.24, 0.44, 0.05);
const ringGeom = new THREE.RingGeometry(1.15, 1.45, 24);
const innerDiscGeom = new THREE.CircleGeometry(1.15, 24);

const postMat = new THREE.MeshLambertMaterial({ color: '#2c1a11' });
const beamMat = new THREE.MeshLambertMaterial({ color: '#c42b1c' });

// Procedural high-resolution canvas texture for the physical 3D wooden sign plaque
function createSignboardTexture(loc) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background - Aged warm wood & parchment
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#faf5eb');
  bgGrad.addColorStop(0.5, '#ede0ca');
  bgGrad.addColorStop(1, '#dfceb0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Outer dark wood border
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#2b1810';
  ctx.strokeRect(8, 8, 1008, 496);

  // Inner decorative border with destination theme color
  ctx.lineWidth = 6;
  ctx.strokeStyle = loc.color || '#a93226';
  ctx.strokeRect(28, 28, 968, 456);

  // Top Badge: [ 01 • INTRO ]
  ctx.fillStyle = loc.color || '#a93226';
  ctx.fillRect(362, 44, 300, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${loc.number} • ${loc.badge}`, 512, 68);

  // Japanese Kanji Title
  ctx.fillStyle = '#1c1611';
  ctx.font = 'bold 88px "Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif';
  ctx.fillText(loc.japaneseName || '', 512, 190);

  // English Title
  ctx.fillStyle = '#2b1810';
  ctx.font = 'bold 50px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(loc.name, 512, 305);

  // Divider line
  ctx.strokeStyle = '#c4a77d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 355);
  ctx.lineTo(774, 355);
  ctx.stroke();

  // Role / Category Subtitle
  ctx.fillStyle = '#6e4a2d';
  ctx.font = '600 32px "Segoe UI", Arial, sans-serif';
  ctx.fillText(loc.role || '', 512, 405);

  // Action hint
  ctx.fillStyle = loc.color || '#a93226';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText('▼ [E] PRESS OR CLICK TO OPEN ▼', 512, 465);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const KonohaVillage = React.memo(function KonohaVillage({
  onTerrainReady,
  playerPosRef,
  onOpenModal,
  onNearbyLocationChange,
  isInteractionBlocked = false,
  enableShadows = true,
}) {
  const groupRef = useRef();
  const offsetGroupRef = useRef();
  const colliderBuiltRef = useRef(false);
  const colliderRef = useRef(null);
  const markerRefs = useRef({});
  const lastCheckRef = useRef(0);
  const prevNearIdRef = useRef(null);

  const [nearbyLocId, setNearbyLocId] = useState(null);

  // Load actual Konoha FBX model & texture atlas
  const fbx = useFBX('/models/konoha/source/untitled.fbx');
  const texture = useTexture('/models/konoha/textures/Picsart_26-05-30_22-38-46-674.png');

  // Single shared Lambert material for the entire village mesh hierarchy
  const villageMaterial = useMemo(() => {
    if (!texture) return null;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;

    return new THREE.MeshLambertMaterial({
      map: texture,
    });
  }, [texture]);

  // Pre-generate procedural high-res signboard materials for every destination
  const signboardMaterials = useMemo(() => {
    const map = {};
    KONOHA_LOCATIONS.forEach((loc) => {
      const tex = createSignboardTexture(loc);
      map[loc.id] = new THREE.MeshLambertMaterial({
        map: tex,
        color: '#ffffff',
      });
    });
    return map;
  }, []);

  useEffect(() => {
    if (!fbx || !offsetGroupRef.current) return;

    offsetGroupRef.current.position.set(
      KONOHA_OFFSET[0],
      KONOHA_OFFSET[1],
      KONOHA_OFFSET[2]
    );
    offsetGroupRef.current.updateMatrixWorld(true);

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = enableShadows;
        child.frustumCulled = true;

        if (villageMaterial) {
          child.material = villageMaterial;
        }
      }
      child.updateMatrix();
      child.matrixAutoUpdate = false;
    });

    offsetGroupRef.current.matrixAutoUpdate = false;

    if (!colliderBuiltRef.current) {
      colliderBuiltRef.current = true;
      const spatialCollider = buildTerrainCollider(offsetGroupRef.current, 2.5);
      colliderRef.current = spatialCollider;
      onTerrainReady?.(spatialCollider);

      // Snap all 6 destination markers accurately to the street/ground surface (cap maxAllowedY at 2.2m so it never snaps to roofs)
      KONOHA_LOCATIONS.forEach((loc) => {
        const el = markerRefs.current[loc.id];
        if (el) {
          const sPos = loc.shrinePosition || loc.position;
          const gy = sampleGroundY(spatialCollider, sPos[0], sPos[2], 2.2, -1.5);
          if (gy !== null) {
            el.position.y = gy;
          }
        }
      });
    }
  }, [fbx, villageMaterial, onTerrainReady, enableShadows]);

  // Throttled 10Hz check for nearby destination shrines & directional sign visibility
  useFrame((state) => {
    const now = state.clock.getElapsedTime();
    if (now - lastCheckRef.current < 0.12) return;
    lastCheckRef.current = now;

    const p = playerPosRef?.current;
    if (!p) return;

    let closestLoc = null;
    let minD = Infinity;

    for (let i = 0; i < KONOHA_LOCATIONS.length; i++) {
      const loc = KONOHA_LOCATIONS[i];
      const sPos = loc.shrinePosition || loc.position;
      const distShrine = Math.hypot(p[0] - sPos[0], p[2] - sPos[2]);
      const distSpawn = Math.hypot(p[0] - loc.position[0], p[2] - loc.position[2]);
      const dist = Math.min(distShrine, distSpawn);

      if (dist <= 4.2 && dist < minD) {
        minD = dist;
        closestLoc = loc;
      }
    }

    const nextId = closestLoc?.id || null;
    if (nextId !== prevNearIdRef.current) {
      prevNearIdRef.current = nextId;
      setNearbyLocId(nextId);
      onNearbyLocationChange?.(closestLoc);
    }
  });

  // Global 'KeyE' listener for destination shrines when no dialogue/modal is blocking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearbyLocId && !isInteractionBlocked) {
        const loc = KONOHA_LOCATIONS.find((l) => l.id === nearbyLocId);
        if (loc && loc.modalKey) {
          e.preventDefault();
          onOpenModal?.(loc.modalKey);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyLocId, isInteractionBlocked, onOpenModal]);

  return (
    <group ref={groupRef} name="KonohaWorld">
      {/* ================= NATURAL DAYLIGHT LIGHTING ================= */}
      <hemisphereLight
        skyColor="#7cb5ea"
        groundColor="#9e8568"
        intensity={0.85}
      />

      {/* Main Directional Sunlight */}
      <directionalLight
        position={[50, 80, 35]}
        color="#fff5e4"
        intensity={2.0}
        castShadow={enableShadows}
        shadow-mapSize={[512, 512]}
        shadow-camera-near={15}
        shadow-camera-far={180}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0005}
      />

      {/* Soft Ambient Fill for deep building shadows */}
      <ambientLight color="#d6e8fa" intensity={0.6} />

      {/* ================= ACTUAL KONOHA FBX MODEL ================= */}
      <group ref={offsetGroupRef} position={KONOHA_OFFSET}>
        <primitive object={fbx} />
      </group>

      {/* ================= 6 INTERACTIVE DESTINATION SHRINES & DIRECTIONAL SIGNS ================= */}
      {KONOHA_LOCATIONS.map((loc) => {
        const sPos = loc.shrinePosition || loc.position;
        const isNearby = nearbyLocId === loc.id;

        return (
          <group
            key={loc.id}
            ref={(el) => {
              if (el) markerRefs.current[loc.id] = el;
            }}
            position={[sPos[0], sPos[1] || 0, sPos[2]]}
            rotation={[0, loc.shrineRotation || 0, 0]}
          >
            {/* Left & Right Torii Shrine Pillars */}
            <mesh position={[-0.58, 1.1, 0]} geometry={postGeom} material={postMat} />
            <mesh position={[0.58, 1.1, 0]} geometry={postGeom} material={postMat} />
            {/* Top Crimson Kasagi Crossbeam */}
            <mesh position={[0, 2.15, 0]} geometry={beamGeom} material={beamMat} />
            {/* Lower Nuki Crossbeam */}
            <mesh position={[0, 1.78, 0]} geometry={subBeamGeom} material={postMat} />
            {/* Physical 3D Wooden Sign Plaque with procedural burnt-in typography */}
            <mesh
              position={[0, 1.96, 0.05]}
              geometry={signBoardGeom}
              material={signboardMaterials[loc.id] || beamMat}
            />

            {/* Glowing Interactive Ground Ring */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.04, 0]}
              geometry={ringGeom}
            >
              <meshBasicMaterial
                color={loc.color}
                transparent
                opacity={isNearby ? 0.85 : 0.45}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            {/* Soft Ground Aura Disc */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.03, 0]}
              geometry={innerDiscGeom}
            >
              <meshBasicMaterial
                color={loc.color}
                transparent
                opacity={isNearby ? 0.28 : 0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

export default KonohaVillage;
