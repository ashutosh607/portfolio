import mongoose from 'mongoose';

const hackathonEventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  organiser: { type: String, default: '' },
  date: { type: String, default: '' },
  duration: { type: String, default: '' },
  team: { type: String, default: '' },
  project: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  achievement: { type: String, default: '' },
  certificates: { type: [String], default: [] },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const caseStudySchema = new mongoose.Schema({
  requirements: { type: [String], default: [] },
  responsibilities: { type: [String], default: [] },
  features: { type: [String], default: [] },
  deployment: { type: String, default: '' },
  challenges: { type: [String], default: [] },
  screenshots: { type: [String], default: [] },
});

const missionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['freelance', 'hackathon', 'internship', 'leadership'],
      required: true,
    },
    category: {
      type: String,
      default: 'Missions',
    },
    title: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Completed',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    startDate: String,
    endDate: String,
    availableFrom: {
      type: String,
      validate: value=>!value || Number.isFinite(Date.parse(value)),
      default: null,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    certificates: {
      type: [String],
      default: [],
    },
    caseStudy: {
      type: caseStudySchema,
      default: null,
    },
    events: {
      type: [hackathonEventSchema],
      default: [],
    },
    visible: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

missionSchema.virtual('id').get(function () {
  return this.slug;
});

missionSchema.set('toJSON', { virtuals: true });
missionSchema.set('toObject', { virtuals: true });

export function publicMission(document) {
  const mission=document.toJSON();
  mission.events=mission.events.filter(event=>event.visible!==false);
  return mission;
}

const Mission = mongoose.model('Mission', missionSchema);
export default Mission;

