import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Shared geometries & materials for clouds and birds (eliminates ~90 duplicate GPU geometries & shaders)
const puffCenterGeom = new THREE.SphereGeometry(7, 7, 5);
const puffLeftGeom = new THREE.SphereGeometry(5.2, 6, 5);
const puffRightGeom = new THREE.SphereGeometry(5.5, 6, 5);
const puffTopGeom = new THREE.SphereGeometry(4.2, 6, 5);

const dayCloudMaterial = new THREE.MeshLambertMaterial({
  color: '#ffffff',
  emissive: '#dcebf7',
  emissiveIntensity: 0.35,
});

const nightCloudMaterial = new THREE.MeshLambertMaterial({
  color: '#1f2e4d',
  emissive: '#101a30',
  emissiveIntensity: 0.4,
});

// Moon geometries & materials for Japanese Night Sky
const moonCoreGeom = new THREE.SphereGeometry(8.2, 24, 24);
const moonInnerHaloGeom = new THREE.SphereGeometry(13.5, 24, 24);
const moonOuterHaloGeom = new THREE.SphereGeometry(24.0, 24, 24);

const moonCoreMat = new THREE.MeshBasicMaterial({
  color: '#fff6de',
  fog: false,
});

const moonInnerHaloMat = new THREE.MeshBasicMaterial({
  color: '#ffba6b',
  transparent: true,
  opacity: 0.24,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});

const moonOuterHaloMat = new THREE.MeshBasicMaterial({
  color: '#5c84d6',
  transparent: true,
  opacity: 0.14,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});

const birdBodyGeom = new THREE.ConeGeometry(0.2, 0.9, 4);
birdBodyGeom.rotateX(Math.PI / 2);

const birdBeakGeom = new THREE.ConeGeometry(0.1, 0.3, 4);
birdBeakGeom.rotateX(-Math.PI / 2);

const birdWingGeom = new THREE.BoxGeometry(1.2, 0.04, 0.36);

const birdBodyMat = new THREE.MeshBasicMaterial({ color: '#22201d' });
const birdBeakMat = new THREE.MeshBasicMaterial({ color: '#d4a037' });
const birdWingMat = new THREE.MeshBasicMaterial({ color: '#2c2a26' });

/**
 * Procedural stylized clouds, circling ninja birds, swirling leaf/firefly particles,
 * and Japanese night sky (full moon, halo, starfield) optimized with shared geometries.
 */
const Atmosphere = React.memo(function Atmosphere({
  isLiteMode = false,
  isNightMode = false,
}) {
  const cloudsGroupRef = useRef();
  const leavesRef = useRef();
  const activeCloudMat = isNightMode ? nightCloudMaterial : dayCloudMaterial;

  // ================= 1. PROCEDURAL ANIME CLOUDS =================
  const cloudData = useMemo(() => {
    const clouds = [];
    const count = isLiteMode ? 6 : 10;
    for (let i = 0; i < count; i++) {
      clouds.push({
        id: i,
        x: (Math.random() - 0.5) * 220,
        y: 42 + Math.random() * 28,
        z: (Math.random() - 0.5) * 240,
        scale: 0.8 + Math.random() * 1.6,
        speed: 0.8 + Math.random() * 1.2,
      });
    }
    return clouds;
  }, [isLiteMode]);

  // ================= 2. CIRCLING NINJA BIRDS FLOCK =================
  const birdData = useMemo(() => {
    const birds = [];
    const count = isLiteMode ? 4 : 7;
    for (let i = 0; i < count; i++) {
      birds.push({
        id: i,
        radiusX: 38 + (i % 3) * 12 + Math.random() * 6,
        radiusZ: 44 + (i % 3) * 14 + Math.random() * 8,
        height: 32 + (i % 4) * 4 + Math.random() * 3,
        speed: 0.35 + i * 0.04,
        phase: (i / count) * Math.PI * 2,
        wingPhase: Math.random() * Math.PI * 2,
        scale: 0.75 + Math.random() * 0.3,
      });
    }
    return birds;
  }, [isLiteMode]);

  const leftWings = useRef([]);
  const rightWings = useRef([]);
  const birdMeshes = useRef([]);

  // ================= 3. SWIRLING KONOHA LEAF / FIREFLY PARTICLES =================
  const leafCount = isLiteMode ? 36 : 64;
  const leafData = useMemo(() => {
    const pos = new Float32Array(leafCount * 3);
    const vel = [];
    for (let i = 0; i < leafCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 76;
      pos[i * 3 + 1] = 0.8 + Math.random() * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 84;

      vel.push({
        fallSpeed: 0.55 + Math.random() * 0.85,
        offset: Math.random() * 10,
      });
    }
    return { pos, vel };
  }, [leafCount]);

  // ================= 4. JAPANESE NIGHT SKY STARFIELD =================
  const starCount = isLiteMode ? 140 : 280;
  const starPositions = useMemo(() => {
    const arr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.18 + Math.random() * 0.82); // Upper hemisphere
      const r = 165 + Math.random() * 25;
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [starCount]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // 1. Drift clouds across the village sky
    if (cloudsGroupRef.current) {
      const children = cloudsGroupRef.current.children;
      for (let idx = 0, len = children.length; idx < len; idx++) {
        const cloud = children[idx];
        const data = cloudData[idx];
        if (data) {
          cloud.position.x += data.speed * dt * 2.5;
          if (cloud.position.x > 140) cloud.position.x = -140;
        }
      }
    }

    // 2. Animate circling birds & flapping wings
    for (let idx = 0, len = birdData.length; idx < len; idx++) {
      const bird = birdData[idx];
      const birdGroup = birdMeshes.current[idx];
      const leftWing = leftWings.current[idx];
      const rightWing = rightWings.current[idx];

      if (birdGroup) {
        const angle = time * bird.speed + bird.phase;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        const x = sinA * bird.radiusX;
        const z = cosA * bird.radiusZ - 10;
        const y = bird.height + Math.sin(time * 0.8 + bird.phase) * 2.5;

        birdGroup.position.set(x, y, z);
        birdGroup.rotation.y = Math.atan2(cosA * bird.radiusX, -sinA * bird.radiusZ);

        const flap = Math.sin(time * 9.0 + bird.wingPhase) * 0.55;
        if (leftWing) leftWing.rotation.z = flap;
        if (rightWing) rightWing.rotation.z = -flap;
      }
    }

    // 3. Animate drifting Konoha leaves (Day) or floating Hotaru fireflies (Night)
    if (leavesRef.current) {
      const positions = leavesRef.current.geometry.attributes.position.array;
      const vel = leafData.vel;
      for (let i = 0; i < leafCount; i++) {
        const v = vel[i];
        const i3 = i * 3;
        if (isNightMode) {
          // Gentle firefly floating & bobbing motion
          positions[i3] += Math.sin(time * 0.9 + v.offset) * 0.025;
          positions[i3 + 1] += Math.cos(time * 1.3 + v.offset) * 0.018;
          positions[i3 + 2] += Math.cos(time * 0.8 + v.offset) * 0.025;
          if (positions[i3 + 1] < 0.5) positions[i3 + 1] = 0.6;
          if (positions[i3 + 1] > 14.0) positions[i3 + 1] = 13.8;
        } else {
          positions[i3] += Math.sin(time * 1.2 + v.offset) * 0.04 + 0.02;
          positions[i3 + 1] -= v.fallSpeed * dt;
          positions[i3 + 2] += Math.cos(time * 1.1 + v.offset) * 0.03 + 0.01;

          if (positions[i3 + 1] < 0.2) {
            positions[i3] = (Math.random() - 0.5) * 76;
            positions[i3 + 1] = 12 + Math.random() * 6;
            positions[i3 + 2] = (Math.random() - 0.5) * 84;
          }
        }
      }
      leavesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group name="AtmosphereLayer">
      {/* ================= NIGHT SKY: FULL MOON & STARFIELD ================= */}
      {isNightMode && (
        <>
          <group position={[22, 72, -142]}>
            <mesh geometry={moonCoreGeom} material={moonCoreMat} />
            <mesh geometry={moonInnerHaloGeom} material={moonInnerHaloMat} />
            <mesh geometry={moonOuterHaloGeom} material={moonOuterHaloMat} />
          </group>

          <points key={`stars-${starCount}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[starPositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.75}
              color="#e8f0ff"
              transparent
              opacity={0.85}
              sizeAttenuation
              depthWrite={false}
              fog={false}
            />
          </points>
        </>
      )}

      {/* ================= 1. DRIFTING CLOUDS ================= */}
      <group ref={cloudsGroupRef}>
        {cloudData.map((c) => (
          <group
            key={`cloud-${c.id}`}
            position={[c.x, c.y, c.z]}
            scale={[c.scale, c.scale * 0.6, c.scale]}
          >
            <mesh position={[0, 0, 0]} geometry={puffCenterGeom} material={activeCloudMat} />
            <mesh position={[-4.5, -0.6, 1.5]} geometry={puffLeftGeom} material={activeCloudMat} />
            <mesh position={[4.8, -0.4, -1]} geometry={puffRightGeom} material={activeCloudMat} />
            <mesh position={[1.5, 1.5, -2]} geometry={puffTopGeom} material={activeCloudMat} />
          </group>
        ))}
      </group>

      {/* ================= 2. CIRCLING NINJA BIRDS ================= */}
      <group>
        {birdData.map((bird, idx) => (
          <group
            key={`bird-${bird.id}`}
            ref={(el) => (birdMeshes.current[idx] = el)}
            scale={[bird.scale, bird.scale, bird.scale]}
          >
            <mesh geometry={birdBodyGeom} material={birdBodyMat} />
            <mesh position={[0, 0.08, 0.5]} geometry={birdBeakGeom} material={birdBeakMat} />
            <group
              ref={(el) => (leftWings.current[idx] = el)}
              position={[-0.15, 0.05, 0.1]}
            >
              <mesh
                position={[-0.6, 0, 0]}
                rotation={[0, 0.2, 0]}
                geometry={birdWingGeom}
                material={birdWingMat}
              />
            </group>
            <group
              ref={(el) => (rightWings.current[idx] = el)}
              position={[0.15, 0.05, 0.1]}
            >
              <mesh
                position={[0.6, 0, 0]}
                rotation={[0, -0.2, 0]}
                geometry={birdWingGeom}
                material={birdWingMat}
              />
            </group>
          </group>
        ))}
      </group>

      {/* ================= 3. SWIRLING LEAVES (DAY) / GLOWING FIREFLIES (NIGHT) ================= */}
      <points ref={leavesRef} key={`leaves-${leafCount}-${isNightMode ? 'night' : 'day'}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[leafData.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isNightMode ? 0.32 : 0.24}
          color={isNightMode ? '#ffca4b' : '#3c7a45'}
          transparent
          opacity={isNightMode ? 0.92 : 0.85}
          blending={isNightMode ? THREE.AdditiveBlending : THREE.NormalBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
});

export default Atmosphere;
