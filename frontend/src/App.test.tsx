import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { Task } from './types';

const sampleTask: Task = {
  id: 'task-1',
  title: 'Review case file',
  description: 'Check the uploaded evidence.',
  status: 'TODO',
  dueDateTime: '2026-05-01T09:30:00.000Z',
  createdAt: '2026-04-29T10:00:00.000Z',
  updatedAt: '2026-04-29T10:00:00.000Z'
};

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an empty state when there are no tasks', async () => {
    mockFetch(jsonResponse([]));

    render(<App />);

    expect(await screen.findByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Total tasks')).toBeInTheDocument();
  });

  it('creates and displays a task', async () => {
    const user = userEvent.setup();
    const createdTask = { ...sampleTask, title: 'Prepare hearing notes' };
    mockFetch(jsonResponse([]), jsonResponse(createdTask, 201));

    render(<App />);

    await screen.findByText('No tasks yet');
    await user.type(screen.getByLabelText('Title'), 'Prepare hearing notes');
    await user.type(screen.getByLabelText('Description'), 'Draft a concise summary.');
    await user.type(screen.getByLabelText('Due date/time'), '2026-05-01T09:30');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Prepare hearing notes')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Task "Prepare hearing notes" was created.');
    expect(fetch).toHaveBeenLastCalledWith(
      'http://localhost:4000/api/tasks',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('updates task status', async () => {
    const user = userEvent.setup();
    mockFetch(jsonResponse([sampleTask]), jsonResponse({ ...sampleTask, status: 'IN_PROGRESS' }));

    render(<App />);

    const taskCard = await screen.findByText('Review case file').then((title) => title.closest('article'));
    expect(taskCard).not.toBeNull();

    const statusSelect = within(taskCard as HTMLElement).getByLabelText('Status');
    await user.selectOptions(statusSelect, 'IN_PROGRESS');

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/tasks/task-1/status',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('deletes a task', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetch(jsonResponse([sampleTask]), emptyResponse(204));

    render(<App />);

    expect(await screen.findByText('Review case file')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('Review case file')).not.toBeInTheDocument();
    });
    expect(window.confirm).toHaveBeenCalledWith('Delete "Review case file"? This cannot be undone.');
  });
});

function mockFetch(...responses: Response[]) {
  const fetchMock = vi.fn();

  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce(response);
  });

  vi.stubGlobal('fetch', fetchMock);
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body)
  } as unknown as Response;
}

function emptyResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn()
  } as unknown as Response;
}
