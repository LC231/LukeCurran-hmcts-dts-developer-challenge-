import { useEffect, useState } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { createTask, deleteTask, fetchTasks, updateTaskStatus } from './services/tasks';
import type { CreateTaskPayload, Task, TaskStatus } from './types';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  useEffect(() => {
    void loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError(null);

    try {
      setTasks(await fetchTasks());
      setNotice(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(payload: CreateTaskPayload) {
    const task = await createTask(payload);
    setTasks((currentTasks) => [...currentTasks, task].sort(sortByDueDate));
    setNotice(`Task "${task.title}" was created.`);
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setError(null);
    setNotice(null);
    setBusyTaskId(id);

    try {
      const updatedTask = await updateTaskStatus(id, status);
      setTasks((currentTasks) => currentTasks.map((task) => (task.id === id ? updatedTask : task)));
      setNotice(`Task "${updatedTask.title}" is now ${statusLabels[updatedTask.status].toLowerCase()}.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not update the task.');
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDeleteTask(id: string) {
    setError(null);
    setNotice(null);
    setBusyTaskId(id);
    const taskToDelete = tasks.find((task) => task.id === id);

    try {
      await deleteTask(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
      setNotice(taskToDelete ? `Task "${taskToDelete.title}" was deleted.` : 'Task was deleted.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not delete the task.');
    } finally {
      setBusyTaskId(null);
    }
  }

  const taskSummary = getTaskSummary(tasks);

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">HMCTS caseworker tools</p>
        <h1>Task manager</h1>
        <p>Track casework tasks, due dates and progress in one simple place. Urgent work is highlighted so it is easier to prioritise the day.</p>
      </header>

      <section className="summary-grid" aria-label="Task summary">
        <div className="summary-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="summary-card">
          <span>In progress</span>
          <strong>{taskSummary.inProgress}</strong>
        </div>
        <div className="summary-card warning">
          <span>Due soon</span>
          <strong>{taskSummary.dueSoon}</strong>
        </div>
        <div className="summary-card danger">
          <span>Overdue</span>
          <strong>{taskSummary.overdue}</strong>
        </div>
      </section>

      <section className="layout">
        <TaskForm onCreateTask={handleCreateTask} />

        <div className="tasks-panel">
          <div className="panel-header">
            <h2>Tasks</h2>
            <button type="button" onClick={() => void loadTasks()}>
              Refresh
            </button>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="success" role="status">{notice}</p>}
          {loading ? (
            <p className="loading-message">Loading tasks...</p>
          ) : (
            <TaskList
              tasks={tasks}
              busyTaskId={busyTaskId}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function sortByDueDate(first: Task, second: Task): number {
  return new Date(first.dueDateTime).getTime() - new Date(second.dueDateTime).getTime();
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed'
};

function getTaskSummary(tasks: Task[]) {
  const now = Date.now();
  const nextDay = now + 24 * 60 * 60 * 1000;

  return tasks.reduce(
    (summary, task) => {
      const dueTime = new Date(task.dueDateTime).getTime();

      if (task.status === 'IN_PROGRESS') {
        summary.inProgress += 1;
      }

      if (task.status !== 'COMPLETED' && dueTime < now) {
        summary.overdue += 1;
      }

      if (task.status !== 'COMPLETED' && dueTime >= now && dueTime <= nextDay) {
        summary.dueSoon += 1;
      }

      return summary;
    },
    { dueSoon: 0, inProgress: 0, overdue: 0 }
  );
}
