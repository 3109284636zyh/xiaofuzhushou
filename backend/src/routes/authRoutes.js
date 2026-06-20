import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { login } from '../controllers/authController.js';

const router = Router();

router.post('/login', asyncHandler(login));

export default router;
