import { useEffect, useState } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { createTask, deleteTask, fetchTasks, updateTaskStatus } from './services/tasks';
import type { CreateTaskPayload, Task, TaskStatus } from './types';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError(null);

    try {
      setTasks(await fetchTasks());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(payload: CreateTaskPayload) {
    const task = await createTask(payload);
    setTasks((currentTasks) => [...currentTasks, task].sort(sortByDueDate));
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setError(null);

    try {
      const updatedTask = await updateTaskStatus(id, status);
      setTasks((currentTasks) => currentTasks.map((task) => (task.id === id ? updatedTask : task)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not update the task.');
    }
  }

  async function handleDeleteTask(id: string) {
    setError(null);

    try {
      await deleteTask(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not delete the task.');
    }
  }

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">HMCTS caseworker tools</p>
        <h1>Task manager</h1>
        <p>Track casework tasks, due dates and progress in one simple place.</p>
      </header>

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
          {loading ? <p>Loading tasks...</p> : <TaskList tasks={tasks} onStatusChange={handleStatusChange} onDeleteTask={handleDeleteTask} />}
        </div>
      </section>
    </main>
  );
}

function sortByDueDate(first: Task, second: Task): number {
  return new Date(first.dueDateTime).getTime() - new Date(second.dueDateTime).getTime();
}
