import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { search } from '../controllers/searchController.js';

const router = Router();

router.get('/search', asyncHandler(search));

export default router;
