import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>;

const defaultDatabasePath = './data/tasks.sqlite';

export async function createDatabase(databasePath = process.env.DATABASE_PATH ?? defaultDatabasePath): Promise<AppDatabase> {
  if (databasePath !== ':memory:') {
    await mkdir(path.dirname(databasePath), { recursive: true });
  }

  const db = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  await runMigrations(db);

  return db;
}

async function runMigrations(db: AppDatabase): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
      due_date_time TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_due_date_time
      ON tasks (due_date_time);
  `);
}
