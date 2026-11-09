import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    dishName: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Full-Stack',
    },
    frontPagePhoto: {
      type: String,
      default: '',
    },
    projectPhoto: {
      type: String,
      required: true,
    },
    screenshots: {
      type: [String],
      default: [],
    },
    demoVideoUrl: {
      type: String,
      default: '',
    },
    shortDesc: {
      type: String,
      required: true,
    },
    problemSolved: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: '',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    accent: {
      type: String,
      default: '#e68a2e',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
    featured: {
      type: Boolean,
      default: false,
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

// Virtual for ID compatibility with frontend
projectSchema.virtual('id').get(function () {
  return this.slug;
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;

