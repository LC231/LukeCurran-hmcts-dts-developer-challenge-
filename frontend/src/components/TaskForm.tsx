import { FormEvent, useState } from 'react';
import type { CreateTaskPayload, TaskStatus } from '../types';
import { taskStatuses } from '../types';

interface TaskFormProps {
  onCreateTask: (payload: CreateTaskPayload) => Promise<void>;
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed'
};

export function TaskForm({ onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDateTime, setDueDateTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    if (!dueDateTime) {
      setError('Please choose a due date and time.');
      return;
    }

    setSubmitting(true);

    try {
      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        dueDateTime: new Date(dueDateTime).toISOString()
      });
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setDueDateTime('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create the task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>Create task</h2>
      {error && <p className="error" role="alert">{error}</p>}

      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} />
      </label>

      <label>
        Description
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} />
      </label>

      <label>
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
          {taskStatuses.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>
              {statusLabels[taskStatus]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Due date/time
        <input type="datetime-local" value={dueDateTime} onChange={(event) => setDueDateTime(event.target.value)} />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create task'}
      </button>
    </form>
  );
}
