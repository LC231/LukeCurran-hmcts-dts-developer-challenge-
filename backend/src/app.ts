import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import type { AppDatabase } from './db/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { TaskRepository } from './repositories/taskRepository.js';
import { createTaskRouter } from './routes/tasks.js';
import { TaskService } from './services/taskService.js';

export function createApp(db: AppDatabase): express.Express {
  const app = express();
  const taskService = new TaskService(new TaskRepository(db));

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/api/tasks', createTaskRouter(taskService));
  app.use(errorHandler);

  return app;
}
