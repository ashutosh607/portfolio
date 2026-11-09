import { published } from './published';
import projectMedia from './projectMedia.json';
import { getPortfolioProjects } from '../config/locations';

const oldArtwork = {travelflow:'travelflow-ai',wastewise:'wastewise',callkavach:'callkavach',racket:'racket-intel',konoha:'konoha-3d-portfolio'};
export function resolveArtwork(path) {
  const match=path?.match(/^\/ramen-menu\/(\w+)-(?:menu|project)\.webp$/);
  return match && oldArtwork[match[1]] ? '/ichiraku/projects/'+oldArtwork[match[1]]+'.webp' : path;
}

// Normalise both the original portfolio records and the future editor's fields.
export function loadProjectMenu() {
  return (published?.projects ?? getPortfolioProjects()).map((project, index) => {
    const media = projectMedia[project.slug || project.id] || {};
    const placeholder=project.liveUrl===project.githubUrl && project.liveUrl==='https://github.com/ashutosh607';
    const legacyPhoto = project.projectPhoto || project.previewImage || project.screenshot || project.image;
    const screenshots = project.screenshots ?? (legacyPhoto ? [legacyPhoto] : media.screenshots || []);
    return {
      ...project,
      id: project.slug || project.id,
      liveUrl: placeholder ? media.liveUrl || '' : project.liveUrl?.startsWith('#') ? media.liveUrl || project.liveUrl : project.liveUrl,
      githubUrl: placeholder ? media.githubUrl || project.githubUrl : project.githubUrl === 'https://github.com/ashutosh' ? media.githubUrl : project.githubUrl,
      villageEntry: project.liveUrl === '#main-street',
      order: project.order ?? index + 1,
      featured: project.featured ?? false,
      thumbnail: resolveArtwork(project.thumbnail || project.frontPagePhoto || project.thumbnailImage || project.image || screenshots[0]),
      screenshots: [...new Set([legacyPhoto,...screenshots].filter(Boolean).map(resolveArtwork))],
      description: project.description ?? project.shortDesc,
      technologies: project.technologies ?? project.techStack ?? [],
      features: project.features ?? [],
    };
  }).filter(project => project.visible !== false).sort((a, b) => a.order - b.order);
}
