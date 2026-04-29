# HMCTS DTS Task Manager

A small full-stack task-management application for HMCTS caseworkers. It provides a REST API backed by SQLite and a React frontend for creating, viewing, updating and deleting casework tasks.

## Tech Stack

- Backend: Node.js, TypeScript, Express, SQLite
- Frontend: React, TypeScript, Vite
- Testing: Vitest, Supertest, React Testing Library

## Features

- Create tasks with a title, optional description, status and due date/time.
- View all tasks ordered by due date.
- Retrieve a task by ID through the API.
- Update task status.
- Delete tasks.
- Validation and consistent error responses for invalid or missing data.
- SQLite persistence for local development.

## Prerequisites

- Node.js 22 or later
- npm 11 or later

## Setup

Install dependencies from the repository root:

```powershell
npm install
```

Optional environment files can be created from the examples:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

The backend defaults to:

- API port: `4000`
- SQLite database: `backend/data/tasks.sqlite`
- Frontend origin: `http://localhost:5173`

The frontend defaults to:

- Vite port: `5173`
- API base URL: `http://localhost:4000/api`

## Running the Application

Start the API:

```powershell
npm run dev:backend
```

In another terminal, start the frontend:

```powershell
npm run dev:frontend
```

Open the frontend at [http://localhost:5173](http://localhost:5173).

The API health check is available at [http://localhost:4000/health](http://localhost:4000/health).

## Testing and Validation

Run all tests:

```powershell
npm test
```

Run TypeScript checks:

```powershell
npm run lint
```

Build both applications:

```powershell
npm run build
```

## API Documentation

Base URL: `http://localhost:4000/api`

### Task Model

```json
{
  "id": "2f4f33a8-1c8b-4d50-a5fd-19fe3b975c5d",
  "title": "Review evidence bundle",
  "description": "Check uploaded documents before the hearing.",
  "status": "TODO",
  "dueDateTime": "2026-05-01T09:30:00.000Z",
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

Allowed statuses:

- `TODO`
- `IN_PROGRESS`
- `COMPLETED`

### Create a Task

`POST /tasks`

Request body:

```json
{
  "title": "Review evidence bundle",
  "description": "Check uploaded documents before the hearing.",
  "status": "TODO",
  "dueDateTime": "2026-05-01T09:30:00.000Z"
}
```

Responses:

- `201 Created` with the created task.
- `400 Bad Request` when validation fails.

### Retrieve All Tasks

`GET /tasks`

Responses:

- `200 OK` with an array of tasks ordered by due date/time.

### Retrieve a Task by ID

`GET /tasks/:id`

Responses:

- `200 OK` with the task.
- `404 Not Found` when the task does not exist.

### Update Task Status

`PATCH /tasks/:id/status`

Request body:

```json
{
  "status": "COMPLETED"
}
```

Responses:

- `200 OK` with the updated task.
- `400 Bad Request` when status is invalid.
- `404 Not Found` when the task does not exist.

### Delete a Task

`DELETE /tasks/:id`

Responses:

- `204 No Content` when deleted.
- `404 Not Found` when the task does not exist.

## Error Response Format

Validation errors:

```json
{
  "message": "Validation failed.",
  "details": [
    {
      "field": "title",
      "message": "Title is required."
    }
  ]
}
```

Not found errors:

```json
{
  "message": "Task not found."
}
```

## Project Structure

```text
backend/
  src/
    db/              SQLite connection and schema setup
    middleware/      Express error handling
    repositories/    Database access
    routes/          REST route definitions
    services/        Task business logic
    validation/      Request schemas
  tests/             API integration tests
frontend/
  src/
    components/      Task form and list UI
    services/        API client
    test/            Test setup
```