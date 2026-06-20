import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { recommendScript } from '../controllers/toolController.js';
import { createScript, deleteScript, listScripts, updateScript } from '../controllers/scriptController.js';

const publicRouter = Router();
publicRouter.post('/scripts/recommend', asyncHandler(recommendScript));

const adminRouter = Router();
adminRouter.get('/scripts', asyncHandler(listScripts));
adminRouter.post('/scripts', asyncHandler(createScript));
adminRouter.put('/scripts/:id', asyncHandler(updateScript));
adminRouter.delete('/scripts/:id', asyncHandler(deleteScript));

export { publicRouter as scriptPublicRoutes, adminRouter as scriptAdminRoutes };
