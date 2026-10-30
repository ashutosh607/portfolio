import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Shared geometries & materials for clouds and birds (eliminates ~90 duplicate GPU geometries & shaders)
const puffCenterGeom = new THREE.SphereGeometry(7, 7, 5);
const puffLeftGeom = new THREE.SphereGeometry(5.2, 6, 5);
const puffRightGeom = new THREE.SphereGeometry(5.5, 6, 5);
const puffTopGeom = new THREE.SphereGeometry(4.2, 6, 5);

const cloudMaterial = new THREE.MeshLambertMaterial({
  color: '#ffffff',
  emissive: '#dcebf7',
  emissiveIntensity: 0.35,
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
 * Procedural stylized clouds, circling ninja birds, and swirling leaf particles
 * optimized with shared geometries, lightweight unlit/Lambert materials, and low draw calls.
 */
const Atmosphere = React.memo(function Atmosphere({ isLiteMode = false }) {
  const cloudsGroupRef = useRef();
  const leavesRef = useRef();

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

  // ================= 3. SWIRLING KONOHA LEAF PARTICLES =================
  const leafCount = isLiteMode ? 28 : 50;
  const leafData = useMemo(() => {
    const pos = new Float32Array(leafCount * 3);
    const vel = [];
    for (let i = 0; i < leafCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = 1.0 + Math.random() * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;

      vel.push({
        fallSpeed: 0.6 + Math.random() * 0.9,
        offset: Math.random() * 10,
      });
    }
    return { pos, vel };
  }, [leafCount]);

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

    // 3. Animate drifting Konoha leaves
    if (leavesRef.current) {
      const positions = leavesRef.current.geometry.attributes.position.array;
      const vel = leafData.vel;
      for (let i = 0; i < leafCount; i++) {
        const v = vel[i];
        const i3 = i * 3;
        positions[i3] += Math.sin(time * 1.2 + v.offset) * 0.04 + 0.02;
        positions[i3 + 1] -= v.fallSpeed * dt;
        positions[i3 + 2] += Math.cos(time * 1.1 + v.offset) * 0.03 + 0.01;

        if (positions[i3 + 1] < 0.2) {
          positions[i3] = (Math.random() - 0.5) * 70;
          positions[i3 + 1] = 12 + Math.random() * 6;
          positions[i3 + 2] = (Math.random() - 0.5) * 80;
        }
      }
      leavesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group name="AtmosphereLayer">
      {/* ================= 1. DRIFTING CLOUDS ================= */}
      <group ref={cloudsGroupRef}>
        {cloudData.map((c) => (
          <group
            key={`cloud-${c.id}`}
            position={[c.x, c.y, c.z]}
            scale={[c.scale, c.scale * 0.6, c.scale]}
          >
            <mesh position={[0, 0, 0]} geometry={puffCenterGeom} material={cloudMaterial} />
            <mesh position={[-4.5, -0.6, 1.5]} geometry={puffLeftGeom} material={cloudMaterial} />
            <mesh position={[4.8, -0.4, -1]} geometry={puffRightGeom} material={cloudMaterial} />
            <mesh position={[1.5, 1.5, -2]} geometry={puffTopGeom} material={cloudMaterial} />
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

      {/* ================= 3. SWIRLING LEAF PARTICLES ================= */}
      <points ref={leavesRef} key={`leaves-${leafCount}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[leafData.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.24}
          color="#3c7a45"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
});

export default Atmosphere;
