import { uploadBufferToCloudinary } from '../config/cloudinary.js';

/**
 * Upload single image to Cloudinary
 * Automatically converts to WebP and applies quality optimization
 */
export const uploadImageFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary credentials are not configured in backend/.env yet. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
    }

    const folder = req.body.folder || 'naruto-portfolio/images';

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
      format: 'webp',
      transformation: [
        { width: 1920, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Resume PDF to Cloudinary
 */
export const uploadDocumentFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document uploaded.' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary credentials are not configured in backend/.env yet.',
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'naruto-portfolio/documents',
      resource_type: 'raw',
      public_id: `Ashutosh_Kadam_Resume_${Date.now()}`,
    });

    res.json({
      success: true,
      message: 'Resume PDF uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    next(error);
  }
};

