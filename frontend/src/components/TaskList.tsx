import type { Task, TaskStatus } from '../types';
import { taskStatuses } from '../types';

interface TaskListProps {
  tasks: Task[];
  busyTaskId: string | null;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed'
};

export function TaskList({ tasks, busyTaskId, onStatusChange, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>No tasks yet</h3>
        <p>Create the first casework task using the form. New tasks will appear here ordered by due date.</p>
      </div>
    );
  }

  return (
    <section className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <article key={task.id} className="task-card">
          <div className="task-main">
            <div className="task-title-row">
              <h3>{task.title}</h3>
              <span className={`status-badge ${task.status.toLowerCase().replace('_', '-')}`}>
                {statusLabels[task.status]}
              </span>
            </div>
            {task.description && <p>{task.description}</p>}
            <p className={`due-date ${getDueDateState(task)}`}>{getDueDateLabel(task)}</p>
          </div>

          <div className="task-actions">
            <label>
              Status
              <select
                value={task.status}
                disabled={busyTaskId === task.id}
                onChange={(event) => void onStatusChange(task.id, event.target.value as TaskStatus)}
              >
                {taskStatuses.map((taskStatus) => (
                  <option key={taskStatus} value={taskStatus}>
                    {statusLabels[taskStatus]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="danger"
              disabled={busyTaskId === task.id}
              onClick={() => {
                if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
                  void onDeleteTask(task.id);
                }
              }}
            >
              {busyTaskId === task.id ? 'Working...' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getDueDateLabel(task: Task): string {
  const state = getDueDateState(task);
  const formattedDate = formatDateTime(task.dueDateTime);

  if (task.status === 'COMPLETED') {
    return `Completed - was due ${formattedDate}`;
  }

  if (state === 'overdue') {
    return `Overdue - was due ${formattedDate}`;
  }

  if (state === 'due-soon') {
    return `Due soon - ${formattedDate}`;
  }

  return `Due ${formattedDate}`;
}

function getDueDateState(task: Task): 'complete' | 'due-soon' | 'overdue' | 'scheduled' {
  if (task.status === 'COMPLETED') {
    return 'complete';
  }

  const now = Date.now();
  const dueTime = new Date(task.dueDateTime).getTime();
  const nextDay = now + 24 * 60 * 60 * 1000;

  if (dueTime < now) {
    return 'overdue';
  }

  if (dueTime <= nextDay) {
    return 'due-soon';
  }

  return 'scheduled';
}
