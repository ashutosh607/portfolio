import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import mongoose from 'mongoose';
import Asset from '../models/Asset.js';
import cloudinary, { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

function imageType(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (/^GIF8[79]a/.test(buffer.toString('ascii', 0, 6))) return 'image/gif';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
    return 'image/webp';
  if (/^ftyp(avis|avif)/.test(buffer.toString('ascii', 4, 12))) return 'image/avif';
}

function getDocumentsBucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'documents' });
}

function getBackendOrigin(req) {
  const explicit = process.env.PUBLIC_BACKEND_URL || process.env.RENDER_EXTERNAL_URL;
  if (explicit) return explicit.trim().replace(/\/+$/, '');
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol || 'http';
  const host = req.get('x-forwarded-host')?.split(',')[0]?.trim() || req.get('host');
  return `${proto}://${host}`;
}

function storeBufferInGridFs(buffer, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = getDocumentsBucket().openUploadStream(filename || 'document.pdf', {
      contentType: 'application/pdf',
    });
    uploadStream.once('error', reject);
    uploadStream.once('finish', () => resolve(uploadStream.id));
    uploadStream.end(buffer);
  });
}

export async function deleteAssetStorage(asset) {
  if (asset.storage === 'gridfs' && asset.gridfsId) {
    try {
      await getDocumentsBucket().delete(asset.gridfsId);
    } catch (error) {
      if (!String(error?.message || '').includes('FileNotFound')) throw error;
    }
    return { result: 'ok' };
  }
  return deleteFromCloudinary(asset.publicId, asset.resourceType);
}

async function uploadImageAsset(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Select a file.' });
  const normalizedMime = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
  if (imageType(file.buffer) !== normalizedMime) {
    return res.status(415).json({ message: 'File contents do not match the selected type.' });
  }
  const result = await uploadBufferToCloudinary(file.buffer, {
    resource_type: 'image',
    folder: 'naruto-portfolio/images',
    public_id: randomUUID(),
    overwrite: false,
    format: 'webp',
    transformation: [{ width: 1920, crop: 'limit' }, { quality: 'auto:good' }],
  });
  try {
    const asset = await Asset.create({
      publicId: result.public_id,
      url: result.secure_url,
      name: file.originalname,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: 'image',
      storage: 'cloudinary',
    });
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    await deleteFromCloudinary(result.public_id, 'image').catch(() => {});
    throw error;
  }
}

async function uploadDocumentAsset(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Select a file.' });
  if (!file.buffer.subarray(0, 16).toString('latin1').includes('%PDF-')) {
    return res.status(415).json({ message: 'File contents do not match the selected type.' });
  }

  const assetId = new mongoose.Types.ObjectId();
  const proxyUrl = `${getBackendOrigin(req)}/api/upload/documents/${assetId.toString()}.pdf`;

  let storage = null;
  let publicId = null;
  let url = null;
  let bytes = file.size || file.buffer.length;
  let gridfsId = null;

  // Try Cloudinary first (public CDN when enabled, then signed private_download_url proxy).
  try {
    const result = await uploadBufferToCloudinary(file.buffer, {
      resource_type: 'raw',
      folder: 'naruto-portfolio/documents',
      public_id: randomUUID() + '.pdf',
      overwrite: false,
    });

    const probe = await fetch(result.secure_url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);

    if (probe?.ok) {
      storage = 'cloudinary';
      publicId = result.public_id;
      url = result.secure_url;
      bytes = result.bytes ?? bytes;
    } else {
      const signedUrl = cloudinary.utils.private_download_url(result.public_id, '', {
        resource_type: 'raw',
        attachment: false,
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });
      const signedProbe = await fetch(signedUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-4' },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);
      await signedProbe?.body?.cancel?.().catch(() => {});

      if (signedProbe && (signedProbe.ok || signedProbe.status === 206)) {
        storage = 'cloudinary-proxy';
        publicId = result.public_id;
        url = proxyUrl;
        bytes = result.bytes ?? bytes;
      } else {
        await deleteFromCloudinary(result.public_id, 'raw').catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Cloudinary raw PDF upload failed; falling back to MongoDB GridFS:', err?.message);
  }

  // Fallback to MongoDB GridFS so PDFs always work even when Cloudinary blocks PDF delivery (HTTP 401).
  if (!url) {
    gridfsId = await storeBufferInGridFs(file.buffer, file.originalname || 'document.pdf');
    storage = 'gridfs';
    publicId = 'gridfs/' + gridfsId.toString();
    url = proxyUrl;
  }

  try {
    const asset = await Asset.create({
      _id: assetId,
      publicId,
      url,
      name: file.originalname,
      bytes,
      format: 'pdf',
      resourceType: 'raw',
      storage,
      gridfsId,
    });
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    await deleteAssetStorage({ storage, gridfsId, publicId, resourceType: 'raw' }).catch(() => {});
    throw error;
  }
}

export async function serveDocumentFile(req, res) {
  const id = String(req.params.file || '').replace(/\.pdf$/i, '');
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Document not found' });
  }
  const asset = await Asset.findById(id);
  if (!asset || asset.resourceType !== 'raw') {
    return res.status(404).json({ message: 'Document not found' });
  }

  const cleanBase = (asset.name || 'document.pdf')
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .replace(/\.+$/, '');
  const fileName = cleanBase.toLowerCase().endsWith('.pdf') ? cleanBase : `${cleanBase}.pdf`;
  const extraClients = (process.env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter((u) => /^https?:\/\//i.test(u))
    .join(' ');

  res.removeHeader('X-Frame-Options');
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self' 'unsafe-inline' blob: data:; object-src 'self' blob: data:; frame-ancestors 'self' http://localhost:5173 http://localhost:5174 http://localhost:4173 http://localhost:3000 https://*.vercel.app https://*.onrender.com${extraClients ? ' ' + extraClients : ''}`,
  );
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (asset.storage === 'gridfs' && asset.gridfsId) {
    const stream = getDocumentsBucket().openDownloadStream(asset.gridfsId);
    stream.on('error', (err) => {
      if (!res.headersSent) res.status(404).json({ message: 'Document data not found' });
      else res.destroy(err);
    });
    return stream.pipe(res);
  }

  if (asset.storage === 'cloudinary-proxy') {
    const signedUrl = cloudinary.utils.private_download_url(asset.publicId, '', {
      resource_type: 'raw',
      attachment: false,
      expires_at: Math.floor(Date.now() / 1000) + 300,
    });
    const upstream = await fetch(signedUrl, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: 'Unable to retrieve PDF document.' });
    }
    const stream = Readable.fromWeb(upstream.body);
    stream.on('error', (err) => {
      if (!res.headersSent) res.status(502).json({ message: 'Error streaming PDF.' });
      else res.destroy(err);
    });
    return stream.pipe(res);
  }

  return res.redirect(asset.url);
}

export const uploadImageFile = uploadImageAsset;
export const uploadDocumentFile = uploadDocumentAsset;
