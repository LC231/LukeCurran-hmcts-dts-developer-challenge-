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
      <p className="form-help">Add the key action the caseworker needs to complete. You can update the status later from the task list.</p>
      {error && <p className="error" role="alert">{error}</p>}

      <label htmlFor="task-title">
        Title
      </label>
      <input
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={200}
        placeholder="e.g. Review evidence bundle"
      />

      <label htmlFor="task-description">
        Description
      </label>
      <textarea
        id="task-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={1000}
        placeholder="Optional notes, context or next steps"
      />
      <span className="field-hint">{description.length}/1000 characters</span>

      <label htmlFor="task-status">
        Status
      </label>
      <select id="task-status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
        {taskStatuses.map((taskStatus) => (
          <option key={taskStatus} value={taskStatus}>
            {statusLabels[taskStatus]}
          </option>
        ))}
      </select>

      <label htmlFor="task-due-date-time">
        Due date/time
      </label>
      <input
        id="task-due-date-time"
        type="datetime-local"
        value={dueDateTime}
        onChange={(event) => setDueDateTime(event.target.value)}
      />
      <span className="field-hint">Use the date and time the task should be completed by.</span>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create task'}
      </button>
    </form>
  );
}
