import { Router } from 'express';
import type { TaskService } from '../services/taskService.js';
import { createTaskSchema, updateStatusSchema } from '../validation/taskSchemas.js';

export function createTaskRouter(taskService: TaskService): Router {
  const router = Router();

  router.post('/', async (request, response, next) => {
    try {
      const input = createTaskSchema.parse(request.body);
      const task = await taskService.createTask(input);

      response.status(201).json(task);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (_request, response, next) => {
    try {
      response.json(await taskService.listTasks());
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (request, response, next) => {
    try {
      response.json(await taskService.getTask(request.params.id));
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/status', async (request, response, next) => {
    try {
      const { status } = updateStatusSchema.parse(request.body);
      response.json(await taskService.updateTaskStatus(request.params.id, status));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (request, response, next) => {
    try {
      await taskService.deleteTask(request.params.id);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
