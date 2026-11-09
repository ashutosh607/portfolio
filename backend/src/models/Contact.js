import mongoose from 'mongoose';

const visitorMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: 'Shinobi Inquiry' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const contactSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: 'ashutoshkadam607@gmail.com',
    },
    githubUrl: {
      type: String,
      default: 'https://github.com/ashutosh607',
    },
    linkedinUrl: {
      type: String,
      default: 'https://www.linkedin.com/in/Ashutosh-kadam',
    },
    location: {
      type: String,
      default: 'Mumbai, India',
    },
    availabilityText: {
      type: String,
      default: 'Available for Opportunities',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    resume: {
      activePdfUrl: {
        type: String,
        default: '/Ashutosh_Kadam_Resume.pdf',
      },
      fileName: {
        type: String,
        default: 'Ashutosh_Kadam_Resume.pdf',
      },
      version: {
        type: String,
        default: '1.0',
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    messages: [visitorMessageSchema],
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;

