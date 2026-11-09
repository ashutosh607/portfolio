import { published } from './published';
import { missions } from './missions';

export async function listMissions() {
  if (published) return published.missions.map(m => {
    const asset = url => ({url,title:m.title});
    return {...m,id:m.slug,certificates:m.certificates.map(asset),
      caseStudy:m.caseStudy && {...m.caseStudy,screenshots:m.caseStudy.screenshots.map(asset)},
      events:m.events.filter(e=>e.visible!==false).sort((a,b)=>a.order-b.order).map(e=>({...e,certificates:e.certificates.map(asset)}))};
  });
  return missions.filter(mission => mission.visible).sort((a, b) => a.order - b.order);
}

export function certificatesFor(mission) {
  return [...mission.certificates, ...mission.events.flatMap(event => event.certificates || [])];
}
