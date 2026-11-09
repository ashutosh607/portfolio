import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
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
    japaneseTitle: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'frontend',
    },
    summary: {
      type: String,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    relatedProjects: {
      type: [String], // Array of project slugs
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

skillSchema.virtual('id').get(function () {
  return this.slug;
});

skillSchema.set('toJSON', { virtuals: true });
skillSchema.set('toObject', { virtuals: true });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;

