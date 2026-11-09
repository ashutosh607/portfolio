import express from 'express';
import { uploadImageFile, uploadDocumentFile } from '../controllers/uploadController.js';
import { uploadImage, uploadDocument } from '../middleware/upload.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/image', protectAdmin, uploadImage.single('file'), uploadImageFile);
router.post('/document', protectAdmin, uploadDocument.single('file'), uploadDocumentFile);

export default router;

