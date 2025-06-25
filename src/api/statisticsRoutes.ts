import { Router } from 'express';
import { getStats } from '../controllers/statisticsController';

const router = Router();
router.get('/', getStats);

export default router;