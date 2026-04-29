import { randomUUID } from 'node:crypto';
import type { AppDatabase } from '../db/database.js';
import type { CreateTaskInput, Task, TaskStatus } from '../types.js';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date_time: string;
  created_at: string;
  updated_at: string;
}

export class TaskRepository {
  constructor(private readonly db: AppDatabase) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status,
      dueDateTime: input.dueDateTime,
      createdAt: now,
      updatedAt: now
    };

    await this.db.run(
      `
        INSERT INTO tasks (id, title, description, status, due_date_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      task.id,
      task.title,
      task.description ?? null,
      task.status,
      task.dueDateTime,
      task.createdAt,
      task.updatedAt
    );

    return task;
  }

  async findAll(): Promise<Task[]> {
    const rows = await this.db.all<TaskRow[]>('SELECT * FROM tasks ORDER BY due_date_time ASC, created_at ASC');
    return rows.map(mapTaskRow);
  }

  async findById(id: string): Promise<Task | undefined> {
    const row = await this.db.get<TaskRow>('SELECT * FROM tasks WHERE id = ?', id);
    return row ? mapTaskRow(row) : undefined;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | undefined> {
    const updatedAt = new Date().toISOString();

    const result = await this.db.run('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?', status, updatedAt, id);

    if (!result.changes) {
      return undefined;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM tasks WHERE id = ?', id);
    return Boolean(result.changes);
  }
}

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    dueDateTime: row.due_date_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
