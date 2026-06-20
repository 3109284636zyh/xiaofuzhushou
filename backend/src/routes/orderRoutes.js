import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { createOrder, deleteOrder, listOrders, updateOrder } from '../controllers/orderController.js';

const adminRouter = Router();
adminRouter.get('/orders', asyncHandler(listOrders));
adminRouter.post('/orders', asyncHandler(createOrder));
adminRouter.put('/orders/:id', asyncHandler(updateOrder));
adminRouter.delete('/orders/:id', asyncHandler(deleteOrder));

export default adminRouter;
