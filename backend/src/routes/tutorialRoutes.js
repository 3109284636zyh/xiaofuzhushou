import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import { createTutorial, deleteTutorial, listTutorials, updateTutorial } from '../controllers/tutorialController.js';

const adminRouter = Router();
adminRouter.get('/tutorials', asyncHandler(listTutorials));
adminRouter.post('/tutorials', asyncHandler(createTutorial));
adminRouter.put('/tutorials/:id', asyncHandler(updateTutorial));
adminRouter.delete('/tutorials/:id', asyncHandler(deleteTutorial));

export default adminRouter;
