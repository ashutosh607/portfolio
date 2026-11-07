import { missions } from './missions';

export async function listMissions() {
  return missions.filter(mission => mission.visible).sort((a, b) => a.order - b.order);
}

export function certificatesFor(mission) {
  return [...mission.certificates, ...mission.events.flatMap(event => event.certificates || [])];
}
