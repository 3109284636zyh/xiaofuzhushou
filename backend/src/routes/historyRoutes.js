import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { createFavorite, createHistory, listFavorites, listHistory } from '../controllers/historyController.js';

const router = Router();

router.post('/favorites', asyncHandler(createFavorite));
router.get('/favorites', asyncHandler(listFavorites));
router.post('/history', asyncHandler(createHistory));
router.get('/history', asyncHandler(listHistory));

export default router;
