import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { listConfigs, updateConfig } from '../controllers/configController.js';

const adminRouter = Router();
adminRouter.get('/configs', asyncHandler(listConfigs));
adminRouter.put('/configs/:configKey', asyncHandler(updateConfig));

export default adminRouter;
