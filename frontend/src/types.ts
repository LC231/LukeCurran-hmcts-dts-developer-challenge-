export const taskStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDateTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDateTime: string;
}
