import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    publicId: { type: String, unique: true, required: true },
    url: { type: String, required: true },
    name: String,
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    resourceType: { type: String, enum: ['raw', 'image'], required: true },
  },
  { timestamps: true },
);
export default mongoose.model('Asset', schema);
