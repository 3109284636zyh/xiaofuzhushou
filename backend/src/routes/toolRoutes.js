import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { runToolController } from '../controllers/toolController.js';

const router = Router();

router.post('/tools/:toolKey/check', asyncHandler(runToolController));

export default router;
