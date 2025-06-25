import { Router } from 'express';
import { registerVisit, findVisits, discharge } from '../controllers/visitController';

const router = Router();
router.post('/', registerVisit);
router.get('/', findVisits);
router.patch('/:id', discharge);

export default router;