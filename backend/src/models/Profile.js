import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    draft: { type: mongoose.Schema.Types.Mixed, select:false },
    hero: {
      welcomeSentences: {
        type: [String],
        default: [
          'Welcome to the Hidden Leaf Village.',
          'Every corner holds a part of my story.',
          'Explore the village. Discover my journey.',
          'Find the gate. Your adventure begins there.',
        ],
      },
      greeting: {
        type: String,
        default: 'Hello, I’m Ashutosh.',
      },
      roleBadges: {
        type: [String],
        default: ['AI/ML Developer', 'Full-Stack Developer', 'Problem Solver'],
      },
      quote: {
        type: String,
        default: 'A shinobi of code, building things worth discovering.',
      },
      introBio: {
        type: String,
        default: 'Final-year student specializing in Artificial Intelligence & Machine Learning, building performant full-stack systems and 3D web applications.',
      },
    },
    about: {
      badge: {
        type: String,
        default: "HOKAGE'S OFFICE • PERSONAL DOSSIER",
      },
      title: {
        type: String,
        default: 'Ashutosh Kadam',
      },
      subtitle: {
        type: String,
        default: 'AI & ML Engineering Student • Full-Stack & 3D Web Developer',
      },
      photoUrl: {
        type: String,
        default: '/about/ashutosh-photo.jpg',
      },
      bioParagraphs: {
        type: [String],
        default: [
          "I'm an Artificial Intelligence & Data Engineering student who turns raw curiosity into performant digital experiences. My focus spans modern full-stack web applications, machine learning systems, and interactive 3D computing on the web.",
          "I approach software engineering with precision and persistent dedication — whether I'm architecting scalable React & Node platforms, training neural networks, or sculpting 60FPS Three.js worlds.",
          "When I'm off the keyboard, you'll find me on the football pitch, studying anime narratives, or brainstorming product architectures for upcoming hackathons.",
        ],
      },
      snapshotItems: [
        {
          label: { type: String, default: '' },
          title: { type: String, default: '' },
          desc: { type: String, default: '' },
        },
      ],
      interestItems: [
        {
          icon: { type: String, default: '⚽' },
          label: { type: String, default: '' },
          sub: { type: String, default: '' },
        },
      ],
      driveValues: [
        {
          num: { type: String, default: '01' },
          title: { type: String, default: '' },
          desc: { type: String, default: '' },
        },
      ],
      headline: {
        type: String,
        default: 'The shinobi behind the code.',
      },
      animeList: [
        {
          title: { type: String, default: '', maxlength: 80 },
          tags: { type: String, default: '', maxlength: 160 },
          imageUrl: { type: String, default: '', maxlength: 600 },
        },
      ],
      football: {
        title: { type: String, default: 'Football', maxlength: 80 },
        description: {
          type: String,
          default: 'More than a sport — it’s where I learn discipline, teamwork, and quick decision-making.',
          maxlength: 400,
        },
        position: { type: String, default: 'Centre Midfielder', maxlength: 80 },
        imageUrl: { type: String, default: '/about/football.jpg', maxlength: 600 },
      },
    },
    githubCalendar: {
      username: {
        type: String,
        default: 'ashutosh607',
        trim: true,
      },
      title: {
        type: String,
        default: 'My Coding Journey',
      },
      subtitle: {
        type: String,
        default: 'DEVELOPER ACTIVITY',
      },
      description: {
        type: String,
        default: 'A year of building, learning and shipping code.',
      },
      profileUrl: {
        type: String,
        default: 'https://github.com/ashutosh607',
      },
      enabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;

