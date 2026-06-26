import { Router } from 'express';
import {
  getFavoriteLocations, addFavoriteLocation, deleteFavoriteLocation,
  getFavoriteObjects, addFavoriteObject, deleteFavoriteObject,
} from '../controllers/favoritesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/locations', getFavoriteLocations);
router.post('/locations', addFavoriteLocation);
router.delete('/locations/:id', deleteFavoriteLocation);
router.get('/objects', getFavoriteObjects);
router.post('/objects', addFavoriteObject);
router.delete('/objects/:id', deleteFavoriteObject);
export default router;
