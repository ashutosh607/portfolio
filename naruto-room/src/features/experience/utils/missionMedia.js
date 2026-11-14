export function isDocumentUrl(url = '') {
  return (
    /\.pdf(?:$|[?#])/i.test(url) ||
    /\/upload\/documents\//i.test(url) ||
    /\/raw\/upload\//i.test(url) ||
    /drive\.google\.com\/file\//i.test(url)
  );
}

function unwrapUrl(entry) {
  if (!entry) return '';
  return typeof entry === 'string' ? entry.trim() : String(entry.url || '').trim();
}

export function missionPreviewMedia(mission) {
  if (!mission) return { imageUrl: '', documentUrl: '' };
  const candidates = [
    mission.thumbnail,
    ...(mission.caseStudy?.screenshots || []),
    ...(mission.certificates || []),
    ...(mission.events || []).flatMap((e) => e.certificates || []),
  ]
    .map(unwrapUrl)
    .filter(Boolean);

  return {
    imageUrl: candidates.find((url) => !isDocumentUrl(url)) || '',
    documentUrl: candidates.find((url) => isDocumentUrl(url)) || '',
  };
}

