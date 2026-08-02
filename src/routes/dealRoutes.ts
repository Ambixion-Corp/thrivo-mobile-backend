import { Router } from 'express';
import { getDeals, requestIntro } from '../controllers/dealController';

const router = Router();

router.get('/', getDeals);
router.post('/:id/intro', requestIntro);

export default router;
