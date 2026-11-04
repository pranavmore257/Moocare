import { Router } from 'express';
import {
  getAllCattle,
  getCattleById,
  createCattle,
  updateCattle,
  deleteCattle,
} from '../controllers/cattleController.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createCattleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tagId: z.string().min(1, 'Tag ID is required'),
  breed: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  type: z.enum(['Dairy', 'Beef', 'Breeding']).optional(),
  sex: z.enum(['Female', 'Male']).optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
});

router.get('/', getAllCattle);
router.get('/:id', getCattleById);
router.post('/', validate(createCattleSchema), createCattle);
router.put('/:id', updateCattle);
router.delete('/:id', deleteCattle);

export default router;
