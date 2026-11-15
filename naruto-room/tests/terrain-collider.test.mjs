import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  buildTerrainCollider,
  sampleGroundY,
} from '../src/features/village/systems/terrainCollider.js';

function createFlatQuadMesh(y, size = 10) {
  const half = size / 2;
  const geom = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -half, y, -half,
    -half, y, half,
    half, y, half,
    -half, y, -half,
    half, y, half,
    half, y, -half,
  ]);
  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

test('buildTerrainCollider and sampleGroundY support lower-elevation village roads down to -6.0', () => {
  const lowerRoad = createFlatQuadMesh(-2.85, 12);
  const collider = buildTerrainCollider(lowerRoad);

  const sampledDefault = sampleGroundY(collider, 0, 0);
  assert.ok(sampledDefault !== null, 'lower road at y=-2.85 should not return null');
  assert.ok(Math.abs(sampledDefault - (-2.85)) < 1e-4);

  const deepRoad = createFlatQuadMesh(-4.35, 12);
  const deepCollider = buildTerrainCollider(deepRoad);
  const sampledDeep = sampleGroundY(deepCollider, 0, 0, 2.0);
  assert.ok(sampledDeep !== null, 'deep road at y=-4.35 should not return null');
  assert.ok(Math.abs(sampledDeep - (-4.35)) < 1e-4);
});
