const defaults = {
  organization: '', startDate: null, endDate: null, thumbnail: null,
  technologies: [], certificates: [], events: [], caseStudy: null, liveUrl: null, visible: true,
};

export const missions = [
  {
    id: 'ds-photography', type: 'freelance', category: 'Client mission', order: 1,
    title: 'Freelance Full-Stack Developer', organization: 'DS Photography & Films',
    thumbnail: '/missions/ds-photography.webp',
    status: 'Completed', liveUrl: 'https://www.dishantshelarphotography.in/',
    description: 'Developed and deployed a production-ready photography website for a Mumbai-based client, featuring a responsive portfolio, booking enquiries, admin dashboard, image management, and SEO optimisation.',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Cloudinary'],
    caseStudy: {
      requirements: ['Showcase photography across screen sizes', 'Accept booking enquiries', 'Manage portfolio images through an admin dashboard'],
      responsibilities: ['Full-stack development', 'Production deployment', 'SEO optimisation'],
      features: ['Responsive portfolio', 'Booking enquiries', 'Admin dashboard', 'Image management'],
      deployment: 'Deployed the client website and implemented SEO optimisation.',
      challenges: [],
      screenshots: [{ url: '/missions/ds-photography.webp', title: 'DS Photography & Films live homepage' }],
    },
  },
  {
    id: 'hackathon-participation', type: 'hackathon', category: 'Hackathons', order: 2,
    title: 'Hackathon Participation', status: 'Participated',
    description: 'Participated in three hackathons, including a 24-hour hackathon.',
    events: [
      { id: '24-hour', title: '', organiser: '', date: null, duration: '24 hours', team: '', project: '', technologies: [], achievement: '', certificates: [] },
    ],
  },
  {
    id: 'internship-availability', type: 'internship', category: 'Internship availability', order: 3,
    title: 'Open to Full-Stack & Web Development Internships', status: 'Seeking opportunities',
    availableFrom: '2026-12-15', description: 'Actively seeking opportunities to contribute to real-world frontend, backend, and full-stack projects.',
  },
].map(record => ({ ...defaults, ...record }));
