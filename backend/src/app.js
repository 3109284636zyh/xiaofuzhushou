import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import router from './routes/index.js';
import { getHealth } from './controllers/appController.js';
import { asyncHandler } from './utils/response.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigin.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    }
  }));
  app.use(express.json());

  app.get('/api/health', asyncHandler(getHealth));
  app.use('/api', router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
