import { Router } from 'express';
import {
  getAllScans,
  getScanById,
  createScan,
  uploadAndAnalyzeAudio,
} from '../controllers/scanController.js';
import { uploadAudio } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createScanSchema = z.object({
  cattleId: z.string().min(1, 'cattleId is required'),
  duration: z.union([z.number(), z.string()]).optional(),
  manualStatus: z.enum(['healthy', 'review', 'concern', 'critical']).optional(),
  manualConfidence: z.union([z.number(), z.string()]).optional(),
  features: z
    .object({
      meanPitchHz: z.number().optional(),
      peakFrequencyHz: z.number().optional(),
      harmonicToNoiseRatio: z.number().optional(),
      jitterPct: z.number().optional(),
      shimmerPct: z.number().optional(),
      spectralCentroid: z.number().optional(),
      decibels: z.number().optional(),
    })
    .optional(),
});

router.get('/', getAllScans);
router.get('/:id', getScanById);
router.post('/', validate(createScanSchema), createScan);
router.post('/upload', uploadAudio.single('audio'), uploadAndAnalyzeAudio);
router.post('/audio-scan', uploadAudio.single('audio'), uploadAndAnalyzeAudio);

export default router;
