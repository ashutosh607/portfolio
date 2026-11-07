import projectMedia from './projectMedia.json';
import { getPortfolioProjects } from '../config/locations';

// Normalise both the original portfolio records and the future editor's fields.
export function loadProjectMenu() {
  return getPortfolioProjects().map((project, index) => {
    const media = projectMedia[project.id] || {};
    const legacyPhoto = project.projectPhoto || project.previewImage || project.screenshot || project.image;
    const screenshots = project.screenshots ?? (legacyPhoto ? [legacyPhoto] : media.screenshots || []);
    return {
      ...project,
      liveUrl: project.liveUrl?.startsWith('#') ? media.liveUrl || project.liveUrl : project.liveUrl,
      githubUrl: project.githubUrl === 'https://github.com/ashutosh' ? media.githubUrl : project.githubUrl,
      villageEntry: project.liveUrl === '#main-street',
      order: project.order ?? index + 1,
      featured: project.featured ?? false,
      thumbnail: project.thumbnail || project.frontPagePhoto || project.thumbnailImage || project.image || screenshots[0],
      screenshots,
      description: project.description ?? project.shortDesc,
      technologies: project.technologies ?? project.techStack ?? [],
      features: project.features ?? [],
    };
  }).filter(project => project.visible !== false).sort((a, b) => a.order - b.order);
}
