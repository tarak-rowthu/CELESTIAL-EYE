import { Router } from 'express';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '../controllers/historyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/', getSearchHistory);
router.post('/', addSearchHistory);
router.delete('/', clearSearchHistory);
export default router;
