import { Router } from 'express';
import {
  getAllAlerts,
  resolveAlert,
  createAlert,
  deleteAlert,
} from '../controllers/alertController.js';

const router = Router();

router.get('/', getAllAlerts);
router.post('/', createAlert);
router.put('/:id/resolve', resolveAlert);
router.delete('/:id', deleteAlert);

export default router;
