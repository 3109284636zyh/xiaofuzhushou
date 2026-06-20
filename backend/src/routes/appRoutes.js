import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import {
  getHomeSummaryController,
  getHotProducts,
  getLatestTutorials,
  getRecentUsage
} from '../controllers/appController.js';

const router = Router();

router.get('/app/home/summary', asyncHandler(getHomeSummaryController));
router.get('/products/hot', asyncHandler(getHotProducts));
router.get('/tutorials/latest', asyncHandler(getLatestTutorials));
router.get('/usage/recent', asyncHandler(getRecentUsage));

export default router;
