import multer from 'multer';

// Use in-memory storage so buffers can be streamed to Cloudinary
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max image size
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPG, PNG, WEBP, AVIF, and GIF are allowed.'));
    }
  },
});

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max PDF size
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document type. Only PDF files are allowed.'));
    }
  },
});

