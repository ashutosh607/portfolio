import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {Object} options - Upload options (folder, resource_type, transformation, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'naruto-portfolio',
        resource_type: options.resource_type || 'auto',
        format: options.format,
        transformation: options.transformation,
        public_id: options.public_id,
        overwrite: options.overwrite ?? true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an asset by public ID
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;

