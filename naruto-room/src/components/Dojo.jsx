import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  getCalligraphyScrollTexture,
  getTatamiTexture,
  getWoodPlankTexture,
} from '../utils/textures';
import { ROOM_SIZE, HALF_ROOM } from '../utils/constants';

export default function Dojo() {
  const lanternLight1 = useRef();
  const lanternLight2 = useRef();
  const lanternLight3 = useRef();
  const lanternLight4 = useRef();
  const particlesRef = useRef();

  // Procedural textures
  const woodTexture = useMemo(() => getWoodPlankTexture(), []);
  const tatamiTexture = useMemo(() => getTatamiTexture(), []);
  const calligraphyTexture = useMemo(() => getCalligraphyScrollTexture(), []);

  // Floating dust motes in sunbeams
  const particleCount = 60;
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * (ROOM_SIZE - 2);
      pos[i * 3 + 1] = 0.5 + Math.random() * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * (ROOM_SIZE - 2);
    }
    return pos;
  }, []);

  // Animate subtle lantern flicker and dust particles
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Subtle natural candlelight flicker
    const flicker1 = 12 + Math.sin(time * 7.1) * 0.8 + Math.cos(time * 13.3) * 0.5;
    const flicker2 = 12 + Math.sin(time * 6.3 + 1) * 0.8 + Math.cos(time * 11.9) * 0.5;
    const flicker3 = 12 + Math.sin(time * 8.0 + 2) * 0.8 + Math.cos(time * 14.1) * 0.5;
    const flicker4 = 12 + Math.sin(time * 5.9 + 3) * 0.8 + Math.cos(time * 12.5) * 0.5;

    if (lanternLight1.current) lanternLight1.current.intensity = flicker1;
    if (lanternLight2.current) lanternLight2.current.intensity = flicker2;
    if (lanternLight3.current) lanternLight3.current.intensity = flicker3;
    if (lanternLight4.current) lanternLight4.current.intensity = flicker4;

    // Dust particles slow drift
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.002;
        if (positions[i * 3 + 1] > 4.0) positions[i * 3 + 1] = 0.5;
        if (positions[i * 3 + 1] < 0.5) positions[i * 3 + 1] = 4.0;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const wallHeight = 4.5;
  const darkWood = '#2e190e';
  const mediumWood = '#4a2c1a';
  const paperColor = '#f5efe1';

  return (
    <group name="DojoEnvironment">
      {/* ================= LIGHTING ================= */}
      {/* Warm Ambient Japanese Interior Light */}
      <ambientLight color="#fff3e0" intensity={0.65} />

      {/* Directional Sunlight Streaming in through Shoji Screen */}
      <directionalLight
        position={[6, 9, -4]}
        color="#ffe2b8"
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />

      {/* Soft Fill / Bounce light from floor */}
      <directionalLight position={[-4, -2, 4]} color="#7a4e2d" intensity={0.3} />

      {/* ================= FLOOR ================= */}
      {/* Perimeter Polished Cedar Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.35}
          metalness={0.08}
          color="#8a532d"
        />
      </mesh>

      {/* Central Tatami Mat Field (8m x 8m, raised slightly) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8.4, 8.4]} />
        <meshStandardMaterial
          map={tatamiTexture}
          roughness={0.7}
          metalness={0.02}
        />
      </mesh>

      {/* Raised Floor Trim / Skirting */}
      <mesh position={[0, 0.05, -HALF_ROOM + 0.1]}>
        <boxGeometry args={[ROOM_SIZE, 0.1, 0.2]} />
        <meshStandardMaterial color={darkWood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.05, HALF_ROOM - 0.1]}>
        <boxGeometry args={[ROOM_SIZE, 0.1, 0.2]} />
        <meshStandardMaterial color={darkWood} roughness={0.5} />
      </mesh>
      <mesh position={[-HALF_ROOM + 0.1, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, ROOM_SIZE]} />
        <meshStandardMaterial color={darkWood} roughness={0.5} />
      </mesh>
      <mesh position={[HALF_ROOM - 0.1, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, ROOM_SIZE]} />
        <meshStandardMaterial color={darkWood} roughness={0.5} />
      </mesh>

      {/* ================= CEILING & EXPOSED RAFTER BEAMS ================= */}
      {/* Ceiling Plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]}>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color="#22150f" roughness={0.9} />
      </mesh>

      {/* Ceiling Exposed Hinoki Cedar Beams */}
      {[-4.5, -1.5, 1.5, 4.5].map((zPos, idx) => (
        <mesh key={`beam-x-${idx}`} position={[0, wallHeight - 0.15, zPos]} castShadow>
          <boxGeometry args={[ROOM_SIZE - 0.2, 0.3, 0.25]} />
          <meshStandardMaterial color={darkWood} roughness={0.4} />
        </mesh>
      ))}
      {[-4.5, -1.5, 1.5, 4.5].map((xPos, idx) => (
        <mesh key={`beam-z-${idx}`} position={[xPos, wallHeight - 0.35, 0]} castShadow>
          <boxGeometry args={[0.25, 0.2, ROOM_SIZE - 0.2]} />
          <meshStandardMaterial color={mediumWood} roughness={0.4} />
        </mesh>
      ))}

      {/* ================= CORNER PILLARS ================= */}
      {[
        [-HALF_ROOM + 0.2, -HALF_ROOM + 0.2],
        [HALF_ROOM - 0.2, -HALF_ROOM + 0.2],
        [-HALF_ROOM + 0.2, HALF_ROOM - 0.2],
        [HALF_ROOM - 0.2, HALF_ROOM - 0.2],
        // Mid pillars
        [-HALF_ROOM + 0.2, 0],
        [HALF_ROOM - 0.2, 0],
      ].map(([px, pz], idx) => (
        <mesh key={`pillar-${idx}`} position={[px, wallHeight / 2, pz]} castShadow receiveShadow>
          <boxGeometry args={[0.4, wallHeight, 0.4]} />
          <meshStandardMaterial color={darkWood} roughness={0.4} />
        </mesh>
      ))}

      {/* ================= WALLS & SHOJI SCREENS ================= */}
      {/* North Wall (Back): Tokonoma Alcove in center + Shoji side panels */}
      <group position={[0, 0, -HALF_ROOM + 0.05]}>
        {/* Upper Wall Beam / Header */}
        <mesh position={[0, wallHeight - 0.3, 0]} castShadow>
          <boxGeometry args={[ROOM_SIZE, 0.6, 0.3]} />
          <meshStandardMaterial color={darkWood} roughness={0.5} />
        </mesh>

        {/* Outer backing wall */}
        <mesh position={[0, wallHeight / 2, -0.05]}>
          <planeGeometry args={[ROOM_SIZE, wallHeight]} />
          <meshStandardMaterial color="#362217" roughness={0.8} />
        </mesh>

        {/* Shoji Paper Panels on left & right of Tokonoma */}
        {[-4.8, 4.8].map((xPos, i) => (
          <group key={`shoji-n-${i}`} position={[xPos, wallHeight / 2 - 0.3, 0]}>
            {/* Paper backing */}
            <mesh receiveShadow>
              <planeGeometry args={[3.6, wallHeight - 0.8]} />
              <meshStandardMaterial
                color={paperColor}
                emissive="#fffae6"
                emissiveIntensity={0.15}
                roughness={0.9}
              />
            </mesh>
            {/* Kumiko Wooden Lattice Ribs (Horizontal) */}
            {[-1.4, -0.9, -0.4, 0.1, 0.6, 1.1].map((yRib, rIdx) => (
              <mesh key={`n-rib-h-${rIdx}`} position={[0, yRib, 0.02]} castShadow>
                <boxGeometry args={[3.6, 0.04, 0.03]} />
                <meshStandardMaterial color={darkWood} />
              </mesh>
            ))}
            {/* Kumiko Wooden Lattice Ribs (Vertical) */}
            {[-1.2, -0.4, 0.4, 1.2].map((xRib, rIdx) => (
              <mesh key={`n-rib-v-${rIdx}`} position={[xRib, 0, 0.02]} castShadow>
                <boxGeometry args={[0.04, wallHeight - 0.8, 0.03]} />
                <meshStandardMaterial color={darkWood} />
              </mesh>
            ))}
            {/* Lower Wooden Wainscot (Koshishoji) */}
            <mesh position={[0, -(wallHeight - 0.8) / 2 + 0.4, 0.03]} castShadow>
              <boxGeometry args={[3.65, 0.8, 0.04]} />
              <meshStandardMaterial color={mediumWood} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* South Wall (Front Entrance): Shoji screens with Sliding Door motif */}
      <group position={[0, 0, HALF_ROOM - 0.05]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, wallHeight - 0.3, 0]} castShadow>
          <boxGeometry args={[ROOM_SIZE, 0.6, 0.3]} />
          <meshStandardMaterial color={darkWood} roughness={0.5} />
        </mesh>
        <mesh position={[0, wallHeight / 2, -0.05]}>
          <planeGeometry args={[ROOM_SIZE, wallHeight]} />
          <meshStandardMaterial color="#362217" roughness={0.8} />
        </mesh>

        {[-4.5, -1.5, 1.5, 4.5].map((xPos, i) => (
          <group key={`shoji-s-${i}`} position={[xPos, wallHeight / 2 - 0.3, 0]}>
            <mesh receiveShadow>
              <planeGeometry args={[2.8, wallHeight - 0.8]} />
              <meshStandardMaterial
                color={paperColor}
                emissive="#ffecd0"
                emissiveIntensity={0.25}
                roughness={0.9}
              />
            </mesh>
            {[-1.4, -0.9, -0.4, 0.1, 0.6, 1.1].map((yRib, rIdx) => (
              <mesh key={`s-rib-h-${rIdx}`} position={[0, yRib, 0.02]}>
                <boxGeometry args={[2.8, 0.04, 0.03]} />
                <meshStandardMaterial color={darkWood} />
              </mesh>
            ))}
            {[-0.9, 0, 0.9].map((xRib, rIdx) => (
              <mesh key={`s-rib-v-${rIdx}`} position={[xRib, 0, 0.02]}>
                <boxGeometry args={[0.04, wallHeight - 0.8, 0.03]} />
                <meshStandardMaterial color={darkWood} />
              </mesh>
            ))}
            <mesh position={[0, -(wallHeight - 0.8) / 2 + 0.4, 0.03]}>
              <boxGeometry args={[2.85, 0.8, 0.04]} />
              <meshStandardMaterial color={mediumWood} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* East Wall & West Wall: Authentic Japanese Shoji Screen Walls */}
      {[-HALF_ROOM + 0.05, HALF_ROOM - 0.05].map((xPos, wIdx) => {
        const isWest = wIdx === 0;
        return (
          <group
            key={`wall-${wIdx}`}
            position={[xPos, 0, 0]}
            rotation={[0, isWest ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            {/* Top beam */}
            <mesh position={[0, wallHeight - 0.3, 0]} castShadow>
              <boxGeometry args={[ROOM_SIZE, 0.6, 0.3]} />
              <meshStandardMaterial color={darkWood} roughness={0.5} />
            </mesh>
            {/* Wall back plane */}
            <mesh position={[0, wallHeight / 2, -0.05]}>
              <planeGeometry args={[ROOM_SIZE, wallHeight]} />
              <meshStandardMaterial color="#362217" roughness={0.8} />
            </mesh>

            {/* Shoji Panels across length */}
            {[-4.8, -1.6, 1.6, 4.8].map((panelZ, pIdx) => (
              <group key={`shoji-side-${pIdx}`} position={[panelZ, wallHeight / 2 - 0.3, 0]}>
                <mesh receiveShadow>
                  <planeGeometry args={[3.0, wallHeight - 0.8]} />
                  <meshStandardMaterial
                    color={paperColor}
                    emissive="#fff2dc"
                    emissiveIntensity={isWest ? 0.3 : 0.15}
                    roughness={0.9}
                  />
                </mesh>
                {/* Horizontal lattice */}
                {[-1.4, -0.9, -0.4, 0.1, 0.6, 1.1].map((yRib, rIdx) => (
                  <mesh key={`side-rib-h-${rIdx}`} position={[0, yRib, 0.02]}>
                    <boxGeometry args={[3.0, 0.04, 0.03]} />
                    <meshStandardMaterial color={darkWood} />
                  </mesh>
                ))}
                {/* Vertical lattice */}
                {[-1.0, 0, 1.0].map((xRib, rIdx) => (
                  <mesh key={`side-rib-v-${rIdx}`} position={[xRib, 0, 0.02]}>
                    <boxGeometry args={[0.04, wallHeight - 0.8, 0.03]} />
                    <meshStandardMaterial color={darkWood} />
                  </mesh>
                ))}
                {/* Lower wood kickplate */}
                <mesh position={[0, -(wallHeight - 0.8) / 2 + 0.4, 0.03]}>
                  <boxGeometry args={[3.05, 0.8, 0.04]} />
                  <meshStandardMaterial color={mediumWood} roughness={0.4} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* ================= TOKONOMA (DOJO SHRINE ALCOVE) ================= */}
      {/* Located at north wall center: X around 0, Z around -6.0 */}
      <group position={[0, 0, -HALF_ROOM + 1.1]}>
        {/* Raised Dark Wood Platform */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.8, 0.3, 1.8]} />
          <meshStandardMaterial color="#1a0f0a" roughness={0.25} metalness={0.1} />
        </mesh>

        {/* Alcove Backing Wall panel */}
        <mesh position={[0, 2.3, -0.85]}>
          <planeGeometry args={[5.6, 4.0]} />
          <meshStandardMaterial color="#503522" roughness={0.7} />
        </mesh>

        {/* Tokonoma framing columns */}
        <mesh position={[-2.8, 2.2, 0]} castShadow>
          <boxGeometry args={[0.2, 4.0, 0.2]} />
          <meshStandardMaterial color="#1f120c" />
        </mesh>
        <mesh position={[2.8, 2.2, 0]} castShadow>
          <boxGeometry args={[0.2, 4.0, 0.2]} />
          <meshStandardMaterial color="#1f120c" />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[5.8, 0.2, 0.2]} />
          <meshStandardMaterial color="#1f120c" />
        </mesh>

        {/* Giant Japanese Hanging Calligraphy Scroll ("忍" Shinobi & Konoha) */}
        <mesh position={[0, 2.35, -0.78]} castShadow receiveShadow>
          <planeGeometry args={[1.5, 3.0]} />
          <meshStandardMaterial
            map={calligraphyTexture}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>

        {/* Katana Stand (Katanakake) with Dual Swords */}
        <group position={[0, 0.3, -0.2]}>
          {/* Black lacquered wooden stand */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.1, 0.05, 0.25]} />
            <meshStandardMaterial color="#111113" roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[-0.35, 0.45, 0]} castShadow>
            <boxGeometry args={[0.06, 0.4, 0.12]} />
            <meshStandardMaterial color="#111113" roughness={0.2} />
          </mesh>
          <mesh position={[0.35, 0.45, 0]} castShadow>
            <boxGeometry args={[0.06, 0.4, 0.12]} />
            <meshStandardMaterial color="#111113" roughness={0.2} />
          </mesh>

          {/* Top Katana: Black saya with gold accents */}
          <group position={[0, 0.6, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.4, 16]} />
              <meshStandardMaterial color="#18181a" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Katana Guard (Tsuba) */}
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Katana Handle (Tsuka) with wrapped cord */}
            <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 0.38, 16]} />
              <meshStandardMaterial color="#a83232" roughness={0.7} />
            </mesh>
          </group>

          {/* Lower Wakizashi Sword */}
          <group position={[0, 0.42, 0.02]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 1.05, 16]} />
              <meshStandardMaterial color="#18181a" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.012, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.28, 16]} />
              <meshStandardMaterial color="#2d4263" roughness={0.7} />
            </mesh>
          </group>
        </group>

        {/* Bonsai Tree on Tokonoma Side */}
        <group position={[-1.7, 0.3, -0.2]}>
          {/* Ceramic shallow planter dish */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.22, 0.16, 16]} />
            <meshStandardMaterial color="#303b42" roughness={0.4} />
          </mesh>
          {/* Bonsai Soil */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
            <meshStandardMaterial color="#241a12" roughness={0.9} />
          </mesh>
          {/* Twisted Bonsai Trunk & Branches */}
          <mesh position={[0, 0.45, 0]} rotation={[0.2, 0.1, 0.25]} castShadow>
            <cylinderGeometry args={[0.04, 0.08, 0.55, 8]} />
            <meshStandardMaterial color="#3e2a1d" roughness={0.8} />
          </mesh>
          <mesh position={[0.12, 0.7, 0.05]} rotation={[-0.3, 0.2, -0.4]} castShadow>
            <cylinderGeometry args={[0.025, 0.045, 0.45, 8]} />
            <meshStandardMaterial color="#3e2a1d" roughness={0.8} />
          </mesh>
          {/* Bonsai Pine Foliage Clouds */}
          <mesh position={[0.2, 0.9, 0.08]} castShadow>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial color="#214d2e" roughness={0.7} />
          </mesh>
          <mesh position={[-0.08, 0.75, -0.05]} castShadow>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial color="#1b4226" roughness={0.7} />
          </mesh>
          <mesh position={[0.08, 0.98, -0.02]} castShadow>
            <sphereGeometry args={[0.15, 12, 10]} />
            <meshStandardMaterial color="#2c633a" roughness={0.7} />
          </mesh>
        </group>

        {/* Incense Burner on the other side */}
        <group position={[1.7, 0.3, -0.2]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color="#8c7853" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.04, 0.12, 0.1, 16]} />
            <meshStandardMaterial color="#8c7853" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ================= 4 STANDING ANDON LANTERNS ================= */}
      {[
        { pos: [-HALF_ROOM + 1.2, 0, -HALF_ROOM + 1.2], lightRef: lanternLight1 },
        { pos: [HALF_ROOM - 1.2, 0, -HALF_ROOM + 1.2], lightRef: lanternLight2 },
        { pos: [-HALF_ROOM + 1.2, 0, HALF_ROOM - 1.2], lightRef: lanternLight3 },
        { pos: [HALF_ROOM - 1.2, 0, HALF_ROOM - 1.2], lightRef: lanternLight4 },
      ].map((lantern, idx) => (
        <group key={`andon-${idx}`} position={lantern.pos}>
          {/* Lantern base pedestal */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.65, 0.2, 0.65]} />
            <meshStandardMaterial color={darkWood} roughness={0.5} />
          </mesh>
          {/* Slender legs */}
          {[-0.22, 0.22].map((lx, lxi) =>
            [-0.22, 0.22].map((lz, lzi) => (
              <mesh key={`leg-${lxi}-${lzi}`} position={[lx, 0.5, lz]} castShadow>
                <boxGeometry args={[0.05, 0.8, 0.05]} />
                <meshStandardMaterial color={darkWood} />
              </mesh>
            ))
          )}
          {/* Washi Paper Shade */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.5, 0.7, 0.5]} />
            <meshStandardMaterial
              color="#fff6e0"
              emissive="#ffaa33"
              emissiveIntensity={0.8}
              roughness={0.6}
            />
          </mesh>
          {/* Lantern Wooden Lattice Frame */}
          {[-0.26, 0.26].map((fx, fxi) =>
            [-0.26, 0.26].map((fz, fzi) => (
              <mesh key={`frame-${fxi}-${fzi}`} position={[fx, 1.2, fz]}>
                <boxGeometry args={[0.04, 0.72, 0.04]} />
                <meshStandardMaterial color={darkWood} />
              </mesh>
            ))
          )}
          {/* Wooden Cap / Pyramidal Roof */}
          <mesh position={[0, 1.62, 0]} castShadow>
            <coneGeometry args={[0.45, 0.2, 4]} rotation={[0, Math.PI / 4, 0]} />
            <meshStandardMaterial color={darkWood} roughness={0.4} />
          </mesh>

          {/* Warm Point Light casting ambient room glow */}
          <pointLight
            ref={lantern.lightRef}
            position={[0, 1.2, 0]}
            color="#ff9933"
            intensity={12}
            distance={7.5}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.002}
          />
        </group>
      ))}

      {/* ================= PROPS: MAKIWARA TRAINING POST (West Wall) ================= */}
      <group position={[-HALF_ROOM + 1.2, 0, 0]}>
        {/* Solid Wooden Base */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.3, 1.2]} />
          <meshStandardMaterial color={darkWood} roughness={0.6} />
        </mesh>
        {/* Main Post Trunk */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.2, 1.8, 16]} />
          <meshStandardMaterial color="#614126" roughness={0.7} />
        </mesh>
        {/* Straw / Hemp Rope Wrapping (Strike target) */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.65, 16]} />
          <meshStandardMaterial color="#c2a66e" roughness={0.9} />
        </mesh>
        {/* Wing Chun / Makiwara Strike Arms */}
        <mesh position={[0.25, 1.45, 0.15]} rotation={[0, 0.4, 0.1]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.6, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.5} />
        </mesh>
        <mesh position={[0.25, 1.45, -0.15]} rotation={[0, -0.4, 0.1]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.6, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.5} />
        </mesh>
        <mesh position={[0.28, 1.05, 0]} rotation={[0, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.65, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.5} />
        </mesh>
      </group>

      {/* ================= PROPS: WEAPON RACK & SCROLL CHEST (East Wall) ================= */}
      <group position={[HALF_ROOM - 1.2, 0, 0]}>
        {/* Wooden Chest Table */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.7, 1.8]} />
          <meshStandardMaterial color={mediumWood} roughness={0.4} />
        </mesh>
        {/* Iron Chest Corner Fittings */}
        <mesh position={[0.39, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.68, 1.78]} />
          <meshStandardMaterial color="#1a1c20" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Practice Wooden Swords (Bokken) standing in rack */}
        <group position={[-0.1, 0.7, -0.4]}>
          <mesh rotation={[0.1, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 1.2, 8]} />
            <meshStandardMaterial color="#c49a62" roughness={0.6} />
          </mesh>
          <mesh position={[0.1, 0, 0.15]} rotation={[-0.08, 0, 0.12]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 1.15, 8]} />
            <meshStandardMaterial color="#a67c48" roughness={0.6} />
          </mesh>
        </group>

        {/* Ninja Makimono Scrolls on chest */}
        <group position={[0.05, 0.75, 0.3]}>
          {/* Blue scroll */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.45, 12]} />
            <meshStandardMaterial color="#1a5276" roughness={0.5} />
          </mesh>
          <mesh position={[-0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial color="#1a0f0a" />
          </mesh>
          <mesh position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial color="#1a0f0a" />
          </mesh>

          {/* Red scroll beside it */}
          <mesh position={[0, 0, 0.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.42, 12]} />
            <meshStandardMaterial color="#922b21" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ================= MEDITATION CUSHIONS (ZABUTON) ================= */}
      {[-1.5, 1.5].map((xOffset, idx) => (
        <mesh
          key={`zabuton-${idx}`}
          position={[xOffset, 0.06, -3.2]}
          rotation={[0, idx * 0.1, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#1f3044" roughness={0.8} />
        </mesh>
      ))}

      {/* ================= ATMOSPHERIC FLOATING PARTICLES ================= */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffebaa"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
