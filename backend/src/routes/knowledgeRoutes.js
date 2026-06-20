import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import {
  adminCreateArticle,
  adminCreateCategory,
  adminDeleteArticle,
  adminDeleteCategory,
  adminListArticles,
  adminListCategories,
  adminUpdateArticle,
  adminUpdateCategory,
  getArticleDetail,
  getArticles,
  getCategories
} from '../controllers/knowledgeController.js';

const publicRouter = Router();
publicRouter.get('/knowledge/categories', asyncHandler(getCategories));
publicRouter.get('/knowledge/articles', asyncHandler(getArticles));
publicRouter.get('/knowledge/articles/:id', asyncHandler(getArticleDetail));

const adminRouter = Router();
adminRouter.get('/knowledge/categories', asyncHandler(adminListCategories));
adminRouter.post('/knowledge/categories', asyncHandler(adminCreateCategory));
adminRouter.put('/knowledge/categories/:id', asyncHandler(adminUpdateCategory));
adminRouter.delete('/knowledge/categories/:id', asyncHandler(adminDeleteCategory));
adminRouter.get('/knowledge/articles', asyncHandler(adminListArticles));
adminRouter.post('/knowledge/articles', asyncHandler(adminCreateArticle));
adminRouter.put('/knowledge/articles/:id', asyncHandler(adminUpdateArticle));
adminRouter.delete('/knowledge/articles/:id', asyncHandler(adminDeleteArticle));

export { publicRouter as knowledgePublicRoutes, adminRouter as knowledgeAdminRoutes };
