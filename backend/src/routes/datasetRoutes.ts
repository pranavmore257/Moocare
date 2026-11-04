import { Router } from 'express';
import {
  uploadDatasetFile,
  importJsonPayload,
  getDatasetStats,
  getDatasetSamples,
  clearDataset,
} from '../controllers/datasetController.js';
import { uploadDataset } from '../middleware/upload.js';

const router = Router();

router.get('/stats', getDatasetStats);
router.get('/samples', getDatasetSamples);
router.post('/upload', uploadDataset.single('dataset'), uploadDatasetFile);
router.post('/import-json', importJsonPayload);
router.delete('/:datasetName', clearDataset);

export default router;
