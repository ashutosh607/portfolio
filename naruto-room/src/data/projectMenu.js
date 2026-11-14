import { published } from './published.js';
import projectMedia from './projectMedia.json' with { type: 'json' };
import { getPortfolioProjects } from '../config/locations.js';

const oldArtwork = {travelflow:'travelflow-ai',wastewise:'wastewise',callkavach:'callkavach',racket:'racket-intel',konoha:'konoha-3d-portfolio'};
export function resolveArtwork(path) {
  const match=path?.match(/^\/ramen-menu\/(\w+)-(?:menu|project)\.webp$/);
  return match && oldArtwork[match[1]] ? '/ichiraku/projects/'+oldArtwork[match[1]]+'.webp' : path;
}

function isLegacyDefaultPhoto(url = '') {
  return /^\/(?:ramen-menu|ichiraku\/projects)\//i.test(String(url || '').trim());
}

export function projectDetailPhoto(project) {
  const front = project.frontPagePhoto?.trim() || project.thumbnail?.trim() || '';
  const detail =
    project.projectPhoto?.trim() || project.previewImage || project.screenshot || project.image || '';
  const screenshots = project.screenshots ?? projectMedia[project.slug || project.id]?.screenshots ?? [];

  let chosen = '';
  if (front && !isLegacyDefaultPhoto(front)) {
    chosen = front;
  } else if (detail && !isLegacyDefaultPhoto(detail)) {
    chosen = detail;
  } else {
    chosen = front || detail || screenshots.find((url) => url?.trim())?.trim() || '';
  }
  return resolveArtwork(chosen);
}

// Normalise both the original portfolio records and the future editor's fields.
export function loadProjectMenu() {
  return (published?.projects ?? getPortfolioProjects()).map((project, index) => {
    const media = projectMedia[project.slug || project.id] || {};
    const placeholder=project.liveUrl===project.githubUrl && project.liveUrl==='https://github.com/ashutosh607';
    const sharedPhoto =
      projectDetailPhoto(project) ||
      resolveArtwork(project.thumbnailImage || media.thumbnail || '');
    return {
      ...project,
      id: project.slug || project.id,
      liveUrl: placeholder ? media.liveUrl || '' : project.liveUrl?.startsWith('#') ? media.liveUrl || project.liveUrl : project.liveUrl,
      githubUrl: placeholder ? media.githubUrl || project.githubUrl : project.githubUrl === 'https://github.com/ashutosh' ? media.githubUrl : project.githubUrl,
      villageEntry: project.liveUrl === '#main-street',
      order: project.order ?? index + 1,
      featured: project.featured ?? false,
      thumbnail: sharedPhoto,
      projectPhoto: sharedPhoto,
      description: project.description ?? project.shortDesc,
      technologies: project.technologies ?? project.techStack ?? [],
      features: project.features ?? [],
    };
  }).filter(project => project.visible !== false).sort((a, b) => a.order - b.order);
}
