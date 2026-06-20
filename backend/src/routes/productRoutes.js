import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productController.js';

const adminRouter = Router();
adminRouter.get('/products', asyncHandler(listProducts));
adminRouter.post('/products', asyncHandler(createProduct));
adminRouter.put('/products/:id', asyncHandler(updateProduct));
adminRouter.delete('/products/:id', asyncHandler(deleteProduct));

export default adminRouter;
