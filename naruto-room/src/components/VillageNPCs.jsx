import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export default function VillageNPCs({ playerPosition = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/naruto/source/untitled.glb');

  // Clone 1: Outside Ichiraku Ramen
  const cloneIchiraku = useMemo(() => {
    const cloned = skeletonClone(scene);
    cloned.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.depthWrite = true;
          c.material.alphaTest = 0.25;
        }
      }
      // Pose arms down
      if (c.isBone && (c.name.includes('LeftArm') || c.name.includes('RightArm'))) {
        c.quaternion.multiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.25)
        );
      }
    });
    return cloned;
  }, [scene]);

  // Clone 2: Training Grounds
  const cloneTraining = useMemo(() => {
    const cloned = skeletonClone(scene);
    cloned.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.depthWrite = true;
          c.material.alphaTest = 0.25;
        }
      }
      // Training ready pose: one arm forward, one down
      if (c.isBone && c.name.includes('LeftArm')) {
        c.quaternion.multiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.25)
        );
      }
      if (c.isBone && c.name.includes('RightArm')) {
        c.quaternion.multiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.7)
        );
      }
    });
    return cloned;
  }, [scene]);

  // Clone 3: Rooftop Scout overlooking Main Street
  const cloneRooftop = useMemo(() => {
    const cloned = skeletonClone(scene);
    cloned.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.depthWrite = true;
          c.material.alphaTest = 0.25;
        }
      }
      if (c.isBone && (c.name.includes('LeftArm') || c.name.includes('RightArm'))) {
        c.quaternion.multiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.25)
        );
      }
    });
    return cloned;
  }, [scene]);

  const guardRef = useRef();

  // Subtle breathing animations for NPC characters
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (guardRef.current) {
      guardRef.current.position.y = Math.sin(t * 2.2) * 0.012;
    }
  });

  // Calculate distance from player to each character for interactive dialogue
  const distIchiraku = Math.hypot(
    playerPosition[0] - 12.0,
    playerPosition[2] - (-18.0)
  );
  const distTraining = Math.hypot(
    playerPosition[0] - 25.0,
    playerPosition[2] - 13.0
  );
  const distRooftop = Math.hypot(
    playerPosition[0] - (-7.5),
    playerPosition[2] - (-14.0)
  );
  const distGuard = Math.hypot(
    playerPosition[0] - (-4.0),
    playerPosition[2] - 18.0
  );

  return (
    <group name="VillageNPCsGroup">
      {/* ================= 1. SHADOW CLONE: ICHIRAKU RAMEN ================= */}
      <group position={[12.0, 0, -18.0]} rotation={[0, -Math.PI * 0.35, 0]}>
        <primitive object={cloneIchiraku} />
        {/* Chakra smoke puff base aura */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.9, 16]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
        </mesh>

        {distIchiraku < 6.5 && (
          <Html position={[0, 2.3, 0]} center distanceFactor={14}>
            <div className="npc-speech-bubble">
              <span className="npc-name">NARUTO (CLONE #1)</span>
              <p className="npc-dialogue">"Teuchi-san is prepping the broth! Miso pork ramen coming up! 🍜"</p>
            </div>
          </Html>
        )}
      </group>

      {/* ================= 2. SHADOW CLONE: TRAINING GROUNDS ================= */}
      <group position={[25.0, 0.4, 13.0]} rotation={[0, Math.PI * 0.6, 0]}>
        <primitive object={cloneTraining} />
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.9, 16]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
        </mesh>

        {distTraining < 6.5 && (
          <Html position={[0, 2.3, 0]} center distanceFactor={14}>
            <div className="npc-speech-bubble">
              <span className="npc-name">NARUTO (CLONE #2)</span>
              <p className="npc-dialogue">"998... 999... 1000 punches! Gotta master this new jutsu! 💪"</p>
            </div>
          </Html>
        )}
      </group>

      {/* ================= 3. SHADOW CLONE: ROOFTOP LOOKOUT ================= */}
      <group position={[-7.5, 5.8, -14.0]} rotation={[0, Math.PI * 0.85, 0]}>
        <primitive object={cloneRooftop} />
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.9, 16]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.25} />
        </mesh>

        {distRooftop < 9.0 && (
          <Html position={[0, 2.3, 0]} center distanceFactor={16}>
            <div className="npc-speech-bubble">
              <span className="npc-name">NARUTO (ROOFTOP SENTRY)</span>
              <p className="npc-dialogue">"Main street is peaceful! Watching over the village from up high! 🥷"</p>
            </div>
          </Html>
        )}
      </group>

      {/* ================= 4. KONOHA JONIN GATE GUARD ================= */}
      <group position={[-4.0, 0, 18.0]} rotation={[0, 0, 0]}>
        <group ref={guardRef}>
          {/* Navy blue shinobi boots/pants */}
          <mesh position={[-0.14, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.1, 0.9, 10]} />
            <meshStandardMaterial color="#1a2536" roughness={0.7} />
          </mesh>
          <mesh position={[0.14, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.1, 0.9, 10]} />
            <meshStandardMaterial color="#1a2536" roughness={0.7} />
          </mesh>
          {/* White calf bandage wrap */}
          <mesh position={[-0.14, 0.35, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.3, 10]} />
            <meshStandardMaterial color="#e8e2d5" roughness={0.8} />
          </mesh>
          <mesh position={[0.14, 0.35, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.3, 10]} />
            <meshStandardMaterial color="#e8e2d5" roughness={0.8} />
          </mesh>

          {/* Torso: Green Chunin/Jonin Flak Jacket */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[0.52, 0.65, 0.3]} />
            <meshStandardMaterial color="#2c5737" roughness={0.6} />
          </mesh>
          {/* Flak jacket high protective collar */}
          <mesh position={[0, 1.62, -0.02]} castShadow>
            <cylinderGeometry args={[0.16, 0.18, 0.18, 12]} />
            <meshStandardMaterial color="#24472d" roughness={0.6} />
          </mesh>
          {/* Red Uzushiogashira swirl patch on back of flak jacket */}
          <mesh position={[0, 1.3, -0.16]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.1, 16]} />
            <meshStandardMaterial color="#c42b1c" roughness={0.5} />
          </mesh>

          {/* Arms with navy sleeves */}
          <mesh position={[-0.34, 1.2, 0]} rotation={[0, 0, 0.15]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.65, 8]} />
            <meshStandardMaterial color="#1a2536" roughness={0.7} />
          </mesh>
          <mesh position={[0.34, 1.2, 0]} rotation={[0, 0, -0.15]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.65, 8]} />
            <meshStandardMaterial color="#1a2536" roughness={0.7} />
          </mesh>

          {/* Katana sword sheathed across back */}
          <group position={[0, 1.35, -0.22]} rotation={[0, 0, Math.PI / 4]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
              <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
              <meshStandardMaterial color="#8b0000" roughness={0.6} />
            </mesh>
          </group>

          {/* Head & Konoha Forehead Protector (Hitai-ate) */}
          <mesh position={[0, 1.82, 0]} castShadow>
            <sphereGeometry args={[0.14, 16, 14]} />
            <meshStandardMaterial color="#e8c29b" roughness={0.5} />
          </mesh>
          {/* Blue Headband Cloth */}
          <mesh position={[0, 1.86, 0]}>
            <cylinderGeometry args={[0.145, 0.145, 0.06, 16]} />
            <meshStandardMaterial color="#1a2536" roughness={0.7} />
          </mesh>
          {/* Metal plate with Konoha crest */}
          <mesh position={[0, 1.86, 0.14]}>
            <boxGeometry args={[0.14, 0.05, 0.015]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Dark hair */}
          <mesh position={[0, 1.95, -0.02]}>
            <sphereGeometry args={[0.145, 12, 10]} />
            <meshStandardMaterial color="#1b1c1e" roughness={0.8} />
          </mesh>
        </group>

        {distGuard < 6.5 && (
          <Html position={[0, 2.3, 0]} center distanceFactor={14}>
            <div className="npc-speech-bubble guard">
              <span className="npc-name">KONOHA JONIN GUARD</span>
              <p className="npc-dialogue">"Halt, shinobi! Welcome to the Hidden Leaf Village. Have your mission scroll ready. 📜"</p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
