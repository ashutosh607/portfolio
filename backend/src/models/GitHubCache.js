import mongoose from 'mongoose';

const contributionDaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
    level: { type: Number, default: 0, min: 0, max: 4 },
  },
  { _id: false }
);

const gitHubCacheSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    totalContributions: {
      type: Number,
      default: 0,
    },
    contributions: [contributionDaySchema],
    cachedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      default: 'jogruber-api',
    },
  },
  { timestamps: true }
);

const GitHubCache = mongoose.model('GitHubCache', gitHubCacheSchema);
export default GitHubCache;

