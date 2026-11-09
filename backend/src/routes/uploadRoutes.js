import express from 'express';
import rateLimit from 'express-rate-limit';
import { uploadImageFile, uploadDocumentFile } from '../controllers/uploadController.js';
import { uploadImage, uploadDocument } from '../middleware/upload.js';
import { protectAdmin } from '../middleware/auth.js';

import Asset from '../models/Asset.js';
import Project from '../models/Project.js';
import Profile from '../models/Profile.js';
import Contact from '../models/Contact.js';
import Mission from '../models/Mission.js';
import Dialogue from '../models/Dialogue.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Upload rate limiter: max 30 files per 15 minutes per IP
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload rate limit reached. Please wait before uploading more assets.',
  },
});

router.post('/image', protectAdmin, uploadLimiter, uploadImage.single('file'), uploadImageFile);
router.post('/document', protectAdmin, uploadLimiter, uploadDocument.single('file'), uploadDocumentFile);

router.get('/', protectAdmin, async (req, res) => {
  res.json({ data: await Asset.find().sort({ createdAt: -1 }) });
});

router.delete('/:id', protectAdmin, async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: 'File not found' });
  const refs = [
    [Project, ['frontPagePhoto', 'projectPhoto', 'screenshots', 'demoVideoUrl']],
    [Profile, ['about.photoUrl', 'draft.about.photoUrl', 'about.animeList.imageUrl', 'draft.about.animeList.imageUrl', 'about.football.imageUrl', 'draft.about.football.imageUrl']],
    [Contact, ['resume.activePdfUrl']],
    [Mission, ['thumbnail', 'certificates', 'caseStudy.screenshots', 'events.certificates']],
    [Dialogue, ['portrait']],
  ];
  const uses = await Promise.all(
    refs.map(([model, paths]) => model.exists({ $or: paths.map((path) => ({ [path]: asset.url })) })),
  );
  if (uses.some(Boolean))
    return res.status(409).json({ message: 'Replace references to this file before deleting it.' });
  const result = await deleteFromCloudinary(asset.publicId, asset.resourceType);
  if (!['ok', 'not found'].includes(result.result))
    return res.status(502).json({ message: 'Storage did not confirm deletion' });
  await asset.deleteOne();
  res.json({ success: true });
});

export default router;
