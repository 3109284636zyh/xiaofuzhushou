import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import {
  analyzeCustomerController,
  chat,
  generatePlanController,
  generateQuoteController
} from '../controllers/aiController.js';

const router = Router();

router.post('/ai/chat', asyncHandler(chat));
router.post('/quote/generate', asyncHandler(generateQuoteController));
router.post('/plan/generate', asyncHandler(generatePlanController));
router.post('/customer/analyze', asyncHandler(analyzeCustomerController));

export default router;
