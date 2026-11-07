import { CHARACTERS_DATA } from '../config/dialogueData';
import { KONOHA_LOCATIONS } from '../config/locations';

// Clean, concise display names for the single-target pill and multi-target dock
const NPC_SHORT_NAMES = {
  sasuke: 'Sasuke',
  sakura: 'Sakura',
  tsunade: 'Tsunade',
  jiraiya: 'Jiraiya',
  orochimaru: 'Orochimaru',
};

const LOCATION_SHORT_NAMES = {
  'main-street': 'Main Street Gate',
  'ichiraku-ramen': 'Ichiraku Ramen',
  'hokage-office': "Hokage's Office",
  'training-grounds': 'Training Grounds',
  'mission-board': 'Mission Board',
  'hokage-monument': 'Hokage Monument',
};

/**
 * Builds the unified registry of all interactable NPCs and Village Locations.
 * Preserves existing NPC positions, 3D models, and location modal keys.
 */
export function buildInteractableRegistry() {
  const npcs = CHARACTERS_DATA.map((char, idx) => {
    const shortName = NPC_SHORT_NAMES[char.id] || char.name.split(' ')[0];
    return {
      uid: `npc:${char.id}`,
      id: char.id,
      type: 'npc',
      shortLabel: shortName,
      singlePrompt: `Talk to ${shortName}`,
      position: char.position,
      enterRadius: Math.max(char.interactionDistance || 3.8, 4.35),
      exitRadius: Math.max(char.interactionDistance || 3.8, 4.35) + 0.65,
      priority: 10,
      sortOrder: idx + 1,
      data: char,
    };
  });

  // Ensure Sakura is ordered first and Sasuke second at the Mission Gate dock to match [1 Sakura, 2 Sasuke, 3 Mission Board]
  npcs.forEach((item) => {
    if (item.id === 'sakura') item.sortOrder = 1;
    if (item.id === 'sasuke') item.sortOrder = 2;
  });

  const locations = KONOHA_LOCATIONS.map((loc, idx) => {
    const shortName = LOCATION_SHORT_NAMES[loc.id] || loc.shortName || loc.name;
    const shrinePos = loc.shrinePosition || loc.position;
    return {
      uid: `loc:${loc.id}`,
      id: loc.id,
      type: 'location',
      shortLabel: shortName,
      singlePrompt: `Open ${shortName}`,
      position: shrinePos,
      spawnPosition: loc.position,
      enterRadius: loc.id === 'mission-board' ? 4.9 : 4.6,
      exitRadius: (loc.id === 'mission-board' ? 4.9 : 4.6) + 0.65,
      priority: 9,
      sortOrder: 10 + idx,
      data: loc,
    };
  });

  return [...npcs, ...locations].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Computes all nearby interactable targets using:
 * - Distance (with hysteresis so targets never flicker in/out at boundary)
 * - Player facing direction
 * - Interaction priority
 */
export function detectNearbyTargets(registry, playerPos, previouslyNearbySet) {
  if (!playerPos || playerPos.length < 3) return [];

  const px = playerPos[0];
  const pz = playerPos[2];
  const playerYaw = typeof playerPos[3] === 'number' ? playerPos[3] : 0;
  const forwardX = Math.sin(playerYaw);
  const forwardZ = Math.cos(playerYaw);

  const detected = [];

  for (let i = 0; i < registry.length; i++) {
    const item = registry[i];
    const wasNearby = previouslyNearbySet?.has(item.uid);
    const radius = wasNearby ? item.exitRadius : item.enterRadius;

    const dx = item.position[0] - px;
    const dz = item.position[2] - pz;
    let dist = Math.hypot(dx, dz);

    // For locations, also check proximity to the arrival/counter position if closer
    if (item.type === 'location' && item.spawnPosition) {
      const distSpawn = Math.hypot(item.spawnPosition[0] - px, item.spawnPosition[2] - pz);
      dist = Math.min(dist, distSpawn * 0.92);
    }

    if (dist <= radius) {
      // Facing alignment in [-1, 1]
      let facingAlignment = 0;
      if (dist > 0.05) {
        facingAlignment = (dx / dist) * forwardX + (dz / dist) * forwardZ;
      }

      // Smart score: lower is better (distance weighted with facing direction & priority)
      const score = dist - facingAlignment * 0.65 - item.priority * 0.05;

      detected.push({
        ...item,
        distance: dist,
        facingAlignment,
        score,
      });
    }
  }

  // Keep a deterministic display order in the dock so [1, 2, 3] rows never jump around as the player moves slightly
  detected.sort((a, b) => a.sortOrder - b.sortOrder);

  return detected;
}

/**
 * Chooses the best initial target when entering interaction range or when previous target leaves range.
 */
export function pickBestTargetUid(nearbyList, currentSelectedUid) {
  if (!nearbyList || nearbyList.length === 0) return null;

  // Preserve current selection if it is still within range (stable target selection)
  if (
    currentSelectedUid &&
    nearbyList.some((item) => item.uid === currentSelectedUid)
  ) {
    return currentSelectedUid;
  }

  // Otherwise pick the highest-scoring target (closest + best aligned with player facing direction)
  let bestItem = nearbyList[0];
  for (let i = 1; i < nearbyList.length; i++) {
    if (nearbyList[i].score < bestItem.score) {
      bestItem = nearbyList[i];
    }
  }
  return bestItem.uid;
}

