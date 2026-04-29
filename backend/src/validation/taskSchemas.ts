import { z } from 'zod';
import { taskStatuses } from '../types.js';

const isoDateTime = z
  .string()
  .datetime({ offset: true, message: 'Due date/time must be a valid ISO 8601 date-time.' })
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Due date/time must be a valid date-time.'
  });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title must be 200 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or fewer.')
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  status: z.enum(taskStatuses),
  dueDateTime: isoDateTime
});

export const updateStatusSchema = z.object({
  status: z.enum(taskStatuses)
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateStatusRequest = z.infer<typeof updateStatusSchema>;
