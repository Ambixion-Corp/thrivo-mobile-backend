import { Router } from 'express';
import { getFeed, likeFeedItem } from '../controllers/feedController';

const router = Router();

router.get('/', getFeed);
router.post('/:id/like', likeFeedItem);

export default router;
