import { randomUUID } from 'node:crypto';
import Asset from '../models/Asset.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

function imageType(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (/^GIF8[79]a/.test(buffer.toString('ascii', 0, 6))) return 'image/gif';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
    return 'image/webp';
  if (/^ftyp(avis|avif)/.test(buffer.toString('ascii', 4, 12))) return 'image/avif';
}

async function upload(req, res, document) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Select a file.' });
  const valid = document
    ? file.buffer.toString('ascii', 0, 5) === '%PDF-'
    : imageType(file.buffer) === file.mimetype;
  if (!valid) return res.status(415).json({ message: 'File contents do not match the selected type.' });
  const resourceType = document ? 'raw' : 'image';
  const result = await uploadBufferToCloudinary(file.buffer, {
    resource_type: resourceType,
    folder: 'naruto-portfolio/' + (document ? 'documents' : 'images'),
    public_id: randomUUID() + (document ? '.pdf' : ''),
    overwrite: false,
    ...(document
      ? {}
      : { format: 'webp', transformation: [{ width: 1920, crop: 'limit' }, { quality: 'auto:good' }] }),
  });
  try {
    if (document) {
      const probe = await fetch(result.secure_url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (!probe.ok)
        throw Object.assign(
          new Error(
            'Public PDF delivery failed (HTTP ' +
              probe.status +
              '). Check PDF delivery in Cloudinary Security settings.',
          ),
          { status: 422 },
        );
    }
    const asset = await Asset.create({
      publicId: result.public_id,
      url: result.secure_url,
      name: file.originalname,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: document ? 'pdf' : result.format,
      resourceType,
    });
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    await deleteFromCloudinary(result.public_id, resourceType);
    throw error;
  }
}
export const uploadImageFile = (req, res) => upload(req, res, false);
export const uploadDocumentFile = (req, res) => upload(req, res, true);
