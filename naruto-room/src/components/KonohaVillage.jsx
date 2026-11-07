import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFBX, useTexture } from '@react-three/drei';
import { KONOHA_OFFSET } from '../utils/constants';
import { KONOHA_LOCATIONS } from '../config/locations';
import { buildTerrainCollider, sampleGroundY } from '../utils/terrainCollider';

// Preload Konoha assets
useFBX.preload('/models/konoha/source/untitled.fbx');
useTexture.preload('/models/konoha/textures/Picsart_26-05-30_22-38-46-674.png');

// Shared geometries and materials for clean, proper straight-standing destination boards
const postGeom = new THREE.CylinderGeometry(0.08, 0.09, 2.25, 12);
const postCapGeom = new THREE.ConeGeometry(0.12, 0.12, 4);
const topFrameGeom = new THREE.BoxGeometry(1.36, 0.10, 0.12);
const bottomFrameGeom = new THREE.BoxGeometry(1.36, 0.08, 0.10);
const signBoardGeom = new THREE.BoxGeometry(1.24, 0.52, 0.05);
const selectedGateMarkerGeom = new THREE.RingGeometry(0.72, 0.82, 28);
const selectedGateMarkerMat = new THREE.MeshBasicMaterial({
  color: '#A84434',
  transparent: true,
  opacity: 0.32,
  side: THREE.DoubleSide,
  depthWrite: false,
});

// Hanging Japanese Chōchin (提灯) paper lantern geometries for destination gates
const hangerArmGeom = new THREE.BoxGeometry(0.04, 0.04, 0.26);
const chochinBodyGeom = new THREE.SphereGeometry(0.115, 12, 10);
const chochinCapGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.032, 10);
const chochinHaloGeom = new THREE.SphereGeometry(0.28, 12, 10);
const lanternPoolGeom = new THREE.CircleGeometry(2.8, 24);

// Traditional Standing Japanese Wooden Street Lanterns (行灯 Andon / 燈籠 Tōrō)
const streetPostGeom = new THREE.CylinderGeometry(0.065, 0.085, 2.15, 8);
const streetBaseGeom = new THREE.BoxGeometry(0.34, 0.12, 0.34);
const streetChamberGeom = new THREE.BoxGeometry(0.28, 0.38, 0.28);
const streetRoofGeom = new THREE.ConeGeometry(0.32, 0.20, 4);
const streetHaloGeom = new THREE.SphereGeometry(0.55, 12, 10);

const postMat = new THREE.MeshLambertMaterial({ color: '#2c1a11' });
const frameMat = new THREE.MeshLambertMaterial({ color: '#8b261b' });
const capMat = new THREE.MeshLambertMaterial({ color: '#1a1412' });

const chochinDayMat = new THREE.MeshLambertMaterial({
  color: '#c42b1c',
  emissive: '#59120b',
  emissiveIntensity: 0.2,
});
const chochinNightMat = new THREE.MeshBasicMaterial({ color: '#ff8533' });
const chochinHaloMat = new THREE.MeshBasicMaterial({
  color: '#ff7315',
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const shojiDayMat = new THREE.MeshLambertMaterial({
  color: '#f5ead6',
  emissive: '#d9b382',
  emissiveIntensity: 0.15,
});
const shojiNightMat = new THREE.MeshBasicMaterial({ color: '#ffbe6b' });
const streetHaloMat = new THREE.MeshBasicMaterial({
  color: '#ff9436',
  transparent: true,
  opacity: 0.26,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const lanternPoolMat = new THREE.MeshBasicMaterial({
  color: '#ff8c38',
  transparent: true,
  opacity: 0.16,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// Curated Japanese street lantern positions along Konoha's main avenues & pathways
const STREET_LANTERN_POSITIONS = [
  [-19.5, 0.0, 2.2],   // Main Street East
  [-26.2, 0.0, 2.2],   // Main Street West
  [-20.2, 0.0, -6.5],  // Central Avenue East
  [-26.6, 0.0, -6.5],  // Path to Ichiraku Ramen
  [-26.0, 0.0, -16.8], // North of Ichiraku Ramen
  [-13.8, 0.0, -11.5], // Crossroad toward Mission Gate
  [-6.2, 0.0, -7.2],   // West of Mission Gate
  [2.2, 0.0, -7.2],    // East of Mission Gate
  [-16.8, 0.0, -23.5], // Avenue toward Hokage's Office
  [-23.2, 0.0, -28.5], // Courtyard West of Hokage's Office
  [9.5, 0.0, -17.5],   // Lower road toward Hokage Monument
  [21.5, 0.0, -27.0],  // Upper road toward Hokage Monument
  [17.5, 0.0, 14.5],   // Path toward Training Grounds
  [33.5, 0.0, 31.5],   // Approach to Training Grounds
];

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

  // Subtle traditional Konoha crest caption
  ctx.fillStyle = '#8b5a36';
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('木ノ葉隠れの里 • KONOHA LANDMARK', 512, 462);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const KonohaVillage = React.memo(function KonohaVillage({
  onTerrainReady,
  selectedTargetUid = null,
  isInteractionBlocked = false,
  enableShadows = true,
  isNightMode = false,
}) {
  const groupRef = useRef();
  const offsetGroupRef = useRef();
  const colliderBuiltRef = useRef(false);
  const colliderRef = useRef(null);
  const markerRefs = useRef({});
  const streetLanternRefs = useRef([]);

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
        emissiveMap: tex,
        emissive: new THREE.Color('#ffdfb8'),
        emissiveIntensity: 0,
        color: '#ffffff',
      });
    });
    return map;
  }, []);

  // Warmly illuminate signboard plaques at night as if lit by their hanging Chōchin lanterns
  useEffect(() => {
    Object.values(signboardMaterials).forEach((mat) => {
      if (mat) {
        mat.emissiveIntensity = isNightMode ? 0.44 : 0.0;
        mat.needsUpdate = true;
      }
    });
  }, [isNightMode, signboardMaterials]);

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

      // Solid collision for Mission Gate, Team 7, Main Street Board, Hokage Office Gate, and Jiraiya Training Grounds
      spatialCollider.obstacles = [
        { x: -2.84, z: -7.92, radiusSq: 0.06, minY: 0.0, maxY: 3.0 }, // Mission Gate Left Post
        { x: -1.68, z: -7.92, radiusSq: 0.06, minY: 0.0, maxY: 3.0 }, // Mission Gate Right Post
        { x: -3.66, z: -7.85, radiusSq: 0.16, minY: 0.0, maxY: 2.2 }, // Sasuke
        { x: -0.86, z: -7.85, radiusSq: 0.16, minY: 0.0, maxY: 2.2 }, // Sakura
        { x: -23.37, z: 7.10, radiusSq: 0.05, minY: 0.0, maxY: 3.0 }, // Main Street Board Left Post
        { x: -22.21, z: 7.10, radiusSq: 0.05, minY: 0.0, maxY: 3.0 }, // Main Street Board Right Post
        { x: 31.49, z: -35.27, radiusSq: 0.05, minY: 2.0, maxY: 6.0 }, // Hokage Office Gate Left Post
        { x: 32.65, z: -35.27, radiusSq: 0.05, minY: 2.0, maxY: 6.0 }, // Hokage Office Gate Right Post
        { x: 33.45, z: -35.27, radiusSq: 0.16, minY: 2.0, maxY: 5.5 }, // Lady Tsunade
        { x: -0.58, z: -61.00, radiusSq: 0.05, minY: -1.0, maxY: 3.0 }, // Hokage Monument Board Left Post
        { x: 0.58, z: -61.00, radiusSq: 0.05, minY: -1.0, maxY: 3.0 }, // Hokage Monument Board Right Post
        { x: 42.82, z: 46.89, radiusSq: 0.05, minY: -1.0, maxY: 3.0 }, // Training Grounds Board Left Post
        { x: 43.98, z: 46.89, radiusSq: 0.05, minY: -1.0, maxY: 3.0 }, // Training Grounds Board Right Post
        { x: 44.84, z: 46.89, radiusSq: 0.20, minY: -1.0, maxY: 3.0 }, // Master Jiraiya
      ];

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

      // Snap Japanese street lanterns accurately to the ground surface
      STREET_LANTERN_POSITIONS.forEach((lPos, idx) => {
        const el = streetLanternRefs.current[idx];
        if (el) {
          const gy = sampleGroundY(spatialCollider, lPos[0], lPos[2], 2.2, -1.5);
          if (gy !== null) {
            el.position.y = gy;
          }
        }
      });
    }
  }, [fbx, villageMaterial, onTerrainReady, enableShadows]);

  const activeChochinMat = isNightMode ? chochinNightMat : chochinDayMat;
  const activeShojiMat = isNightMode ? shojiNightMat : shojiDayMat;

  return (
    <group ref={groupRef} name="KonohaWorld">
      {/* ================= DYNAMIC DAYLIGHT / JAPANESE NIGHT LIGHTING ================= */}
      <hemisphereLight
        skyColor={isNightMode ? '#5c84cc' : '#7cb5ea'}
        groundColor={isNightMode ? '#4a3222' : '#9e8568'}
        intensity={isNightMode ? 1.05 : 0.85}
      />

      {/* Main Directional Light (Warm Sunlight by Day / Silver-Blue Moonlight by Night) */}
      <directionalLight
        position={isNightMode ? [22, 76, -55] : [50, 80, 35]}
        color={isNightMode ? '#a8c7f7' : '#fff5e4'}
        intensity={isNightMode ? 1.38 : 2.0}
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

      {/* Soft Ambient Fill so architecture & textures remain clear and never pitch-black */}
      <ambientLight
        color={isNightMode ? '#364b70' : '#d6e8fa'}
        intensity={isNightMode ? 0.68 : 0.6}
      />

      {/* Warm Japanese Lantern Rim Light & Ichiraku Shop Glow at Night */}
      {isNightMode && (
        <>
          <directionalLight
            position={[-38, 26, 42]}
            color="#ff9844"
            intensity={0.44}
          />
          {/* Cozy warm counter glow inside Ichiraku Ramen stall */}
          <pointLight
            position={[-24.8, 2.5, -13.2]}
            color="#ff8524"
            intensity={4.2}
            distance={24}
            decay={1.5}
          />
        </>
      )}

      {/* ================= ACTUAL KONOHA FBX MODEL ================= */}
      <group ref={offsetGroupRef} position={KONOHA_OFFSET}>
        <primitive object={fbx} />
      </group>

      {/* ================= 6 INTERACTIVE DESTINATION SHRINES & HANGING CHŌCHIN LANTERNS ================= */}
      {KONOHA_LOCATIONS.map((loc) => {
        const sPos = loc.shrinePosition || loc.position;
        const isSelected = selectedTargetUid === `loc:${loc.id}` && !isInteractionBlocked;

        return (
          <group
            key={loc.id}
            ref={(el) => {
              if (el) markerRefs.current[loc.id] = el;
            }}
            position={[sPos[0], sPos[1] || 0, sPos[2]]}
            rotation={[0, loc.shrineRotation || 0, 0]}
          >
            {/* Left & Right Vertical Standing Posts */}
            <mesh position={[-0.58, 1.12, 0]} geometry={postGeom} material={postMat} />
            <mesh position={[0.58, 1.12, 0]} geometry={postGeom} material={postMat} />
            {/* Post Finials / Caps */}
            <mesh position={[-0.58, 2.28, 0]} rotation={[0, Math.PI / 4, 0]} geometry={postCapGeom} material={capMat} />
            <mesh position={[0.58, 2.28, 0]} rotation={[0, Math.PI / 4, 0]} geometry={postCapGeom} material={capMat} />
            {/* Clean Straight Top Frame */}
            <mesh position={[0, 2.18, 0]} geometry={topFrameGeom} material={frameMat} />
            {/* Clean Straight Bottom Frame */}
            <mesh position={[0, 1.62, 0]} geometry={bottomFrameGeom} material={postMat} />
            {/* Physical 3D Wooden Sign Plaque with procedural burnt-in typography */}
            <mesh
              position={[0, 1.90, 0.04]}
              geometry={signBoardGeom}
              material={signboardMaterials[loc.id] || frameMat}
            />

            {/* Left & Right Wooden Lantern Hanger Arms */}
            <mesh position={[-0.58, 2.08, 0.14]} geometry={hangerArmGeom} material={postMat} />
            <mesh position={[0.58, 2.08, 0.14]} geometry={hangerArmGeom} material={postMat} />

            {/* Left Hanging Chōchin Paper Lantern (提灯) */}
            <group position={[-0.58, 1.85, 0.24]}>
              <mesh position={[0, 0.15, 0]} geometry={chochinCapGeom} material={capMat} />
              <mesh scale={[1, 1.35, 1]} geometry={chochinBodyGeom} material={activeChochinMat} />
              <mesh position={[0, -0.15, 0]} geometry={chochinCapGeom} material={capMat} />
              {isNightMode && <mesh geometry={chochinHaloGeom} material={chochinHaloMat} />}
            </group>

            {/* Right Hanging Chōchin Paper Lantern (提灯) */}
            <group position={[0.58, 1.85, 0.24]}>
              <mesh position={[0, 0.15, 0]} geometry={chochinCapGeom} material={capMat} />
              <mesh scale={[1, 1.35, 1]} geometry={chochinBodyGeom} material={activeChochinMat} />
              <mesh position={[0, -0.15, 0]} geometry={chochinCapGeom} material={capMat} />
              {isNightMode && <mesh geometry={chochinHaloGeom} material={chochinHaloMat} />}
            </group>

            {/* Night Mode Warm Lantern Point Light & Ground Pool */}
            {isNightMode && (
              <>
                <pointLight
                  position={[0, 2.3, 0.65]}
                  color="#ff9238"
                  intensity={3.2}
                  distance={19}
                  decay={1.6}
                />
                <mesh
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, 0.02, 0.2]}
                  geometry={lanternPoolGeom}
                  material={lanternPoolMat}
                />
              </>
            )}

            {/* Subtle single ground marker shown ONLY beneath the currently selected target */}
            {isSelected && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.03, 0]}
                geometry={selectedGateMarkerGeom}
                material={selectedGateMarkerMat}
              />
            )}
          </group>
        );
      })}

      {/* ================= TRADITIONAL JAPANESE WOODEN STREET LANTERNS (行灯 / 燈籠) ================= */}
      {STREET_LANTERN_POSITIONS.map((lPos, idx) => (
        <group
          key={`street-lantern-${idx}`}
          ref={(el) => {
            if (el) streetLanternRefs.current[idx] = el;
          }}
          position={[lPos[0], lPos[1] || 0, lPos[2]]}
        >
          <mesh position={[0, 0.06, 0]} geometry={streetBaseGeom} material={capMat} />
          <mesh position={[0, 1.12, 0]} geometry={streetPostGeom} material={postMat} />
          <mesh position={[0, 2.28, 0]} geometry={streetChamberGeom} material={activeShojiMat} />
          <mesh
            position={[0, 2.54, 0]}
            rotation={[0, Math.PI / 4, 0]}
            geometry={streetRoofGeom}
            material={capMat}
          />
          {isNightMode && (
            <>
              <mesh position={[0, 2.28, 0]} geometry={streetHaloGeom} material={streetHaloMat} />
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.025, 0]}
                geometry={lanternPoolGeom}
                material={lanternPoolMat}
              />
            </>
          )}
        </group>
      ))}
    </group>
  );
});

export default KonohaVillage;
