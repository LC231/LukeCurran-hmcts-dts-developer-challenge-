import { ApiError } from '../errors.js';
import type { TaskRepository } from '../repositories/taskRepository.js';
import type { CreateTaskInput, Task, TaskStatus } from '../types.js';

export class TaskService {
  constructor(private readonly tasks: TaskRepository) {}

  createTask(input: CreateTaskInput): Promise<Task> {
    return this.tasks.create(input);
  }

  listTasks(): Promise<Task[]> {
    return this.tasks.findAll();
  }

  async getTask(id: string): Promise<Task> {
    const task = await this.tasks.findById(id);

    if (!task) {
      throw new ApiError(404, 'Task not found.');
    }

    return task;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.tasks.updateStatus(id, status);

    if (!task) {
      throw new ApiError(404, 'Task not found.');
    }

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await this.tasks.delete(id);

    if (!deleted) {
      throw new ApiError(404, 'Task not found.');
    }
  }
}
