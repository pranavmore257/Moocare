import { Router } from 'express';
import {
  getFarmProfile,
  updateFarmProfile,
  getHerdDashboardStats,
} from '../controllers/farmController.js';

const router = Router();

router.get('/profile', getFarmProfile);
router.put('/profile', updateFarmProfile);
router.get('/dashboard-stats', getHerdDashboardStats);

export default router;
