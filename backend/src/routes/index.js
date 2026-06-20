import { Router } from 'express';
import authRoutes from './authRoutes.js';
import appRoutes from './appRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminProductRoutes from './productRoutes.js';
import { knowledgeAdminRoutes, knowledgePublicRoutes } from './knowledgeRoutes.js';
import adminTutorialRoutes from './tutorialRoutes.js';
import { scriptAdminRoutes, scriptPublicRoutes } from './scriptRoutes.js';
import adminOrderRoutes from './orderRoutes.js';
import toolRoutes from './toolRoutes.js';
import searchRoutes from './searchRoutes.js';
import adminConfigRoutes from './configRoutes.js';
import historyRoutes from './historyRoutes.js';
import authRequired from '../middleware/auth.js';
import { asyncHandler } from '../utils/response.js';
import { getAdminDashboard } from '../services/statsService.js';
import { success } from '../utils/response.js';

const router = Router();
const adminRouter = Router();

adminRouter.use(authRequired);
adminRouter.get('/dashboard', asyncHandler(async (req, res) => {
  const data = await getAdminDashboard();
  return success(res, data);
}));
adminRouter.use(adminProductRoutes);
adminRouter.use(knowledgeAdminRoutes);
adminRouter.use(adminTutorialRoutes);
adminRouter.use(scriptAdminRoutes);
adminRouter.use(adminOrderRoutes);
adminRouter.use(adminConfigRoutes);

router.use('/auth', authRoutes);
router.use(appRoutes);
router.use(aiRoutes);
router.use(knowledgePublicRoutes);
router.use(scriptPublicRoutes);
router.use(toolRoutes);
router.use(searchRoutes);
router.use(historyRoutes);
router.use('/admin', adminRouter);

export default router;
