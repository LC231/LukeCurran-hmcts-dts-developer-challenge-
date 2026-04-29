import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatabase, type AppDatabase } from '../src/db/database.js';

describe('task API', () => {
  let db: AppDatabase;
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    db = await createDatabase(':memory:');
    app = createApp(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it('creates and lists tasks', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Review evidence bundle',
        description: 'Check the uploaded documents.',
        status: 'TODO',
        dueDateTime: '2026-05-01T09:30:00.000Z'
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      title: 'Review evidence bundle',
      description: 'Check the uploaded documents.',
      status: 'TODO',
      dueDateTime: '2026-05-01T09:30:00.000Z'
    });
    expect(createResponse.body.id).toEqual(expect.any(String));

    const listResponse = await request(app).get('/api/tasks').expect(200);

    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].id).toBe(createResponse.body.id);
  });

  it('retrieves a task by ID', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Prepare hearing notes',
        status: 'IN_PROGRESS',
        dueDateTime: '2026-05-02T10:00:00.000Z'
      });

    const getResponse = await request(app).get(`/api/tasks/${createResponse.body.id}`).expect(200);

    expect(getResponse.body.title).toBe('Prepare hearing notes');
  });

  it('updates task status', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Send directions order',
        status: 'TODO',
        dueDateTime: '2026-05-03T12:00:00.000Z'
      });

    const updateResponse = await request(app)
      .patch(`/api/tasks/${createResponse.body.id}/status`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(updateResponse.body.status).toBe('COMPLETED');
    expect(updateResponse.body.updatedAt).not.toBe(createResponse.body.updatedAt);
  });

  it('deletes a task', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Close case file',
        status: 'TODO',
        dueDateTime: '2026-05-04T16:00:00.000Z'
      });

    await request(app).delete(`/api/tasks/${createResponse.body.id}`).expect(204);
    await request(app).get(`/api/tasks/${createResponse.body.id}`).expect(404);
  });

  it('returns validation errors for invalid create requests', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: '',
        status: 'INVALID',
        dueDateTime: 'not-a-date'
      })
      .expect(400);

    expect(response.body.message).toBe('Validation failed.');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'title' }),
        expect.objectContaining({ field: 'status' }),
        expect.objectContaining({ field: 'dueDateTime' })
      ])
    );
  });

  it('returns not found for missing tasks', async () => {
    await request(app).get('/api/tasks/missing-id').expect(404);
    await request(app).patch('/api/tasks/missing-id/status').send({ status: 'COMPLETED' }).expect(404);
    await request(app).delete('/api/tasks/missing-id').expect(404);
  });
});
