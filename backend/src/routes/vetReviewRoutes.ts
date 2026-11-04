import { Router } from 'express';
import {
  getAllVetReviews,
  createVetReview,
  updateVetReview,
} from '../controllers/vetReviewController.js';

const router = Router();

router.get('/', getAllVetReviews);
router.post('/', createVetReview);
router.put('/:id', updateVetReview);

export default router;
