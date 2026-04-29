import type { Task, TaskStatus } from '../types';
import { taskStatuses } from '../types';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed'
};

export function TaskList({ tasks, onStatusChange, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Create a task to get started.</p>;
  }

  return (
    <section className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <article key={task.id} className="task-card">
          <div>
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
            <p className="due-date">Due {formatDateTime(task.dueDateTime)}</p>
          </div>

          <div className="task-actions">
            <label>
              Status
              <select
                value={task.status}
                onChange={(event) => void onStatusChange(task.id, event.target.value as TaskStatus)}
              >
                {taskStatuses.map((taskStatus) => (
                  <option key={taskStatus} value={taskStatus}>
                    {statusLabels[taskStatus]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="danger" onClick={() => void onDeleteTask(task.id)}>
              Delete
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
