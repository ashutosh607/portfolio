import { KONOHA_LOCATIONS } from '../config/locations';

const directory = [
  ['main-street', 'The central avenue of the Hidden Leaf Village and the starting point of this interactive portfolio.'],
  ['ichiraku-ramen', 'Explore my development projects through an interactive ramen-inspired menu.'],
  ['hokage-office', 'Discover my background, interests, education, and development journey.'],
  ['training-grounds', 'Explore the technologies, frameworks, and tools I use to build projects.'],
  ['mission-board', 'Explore my freelance work, technical projects, and hackathon experiences.'],
  ['hokage-monument', 'Find my contact information, professional profiles, and ways to connect.'],
];

export const entryDestinations = directory.map(([id, description], index) => {
  const location = KONOHA_LOCATIONS.find(item => item.id === id);
  return {
    id, description, number: location.number, title: location.name,
    subtitle: id === 'training-grounds' ? 'Technical Skills & Jutsu' : location.role,
    sectionId: location.modalKey, teleportLocationId: id, icon: id, color: location.color,
    image: '/entry-gate/' + id + '.webp', order: index + 1, visible: true,
  };
});
