import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../middleware/logger';
import { initializeUsersTable } from './userDb';

let db: Database.Database | null = null;

export function getDatabase(dbPath?: string): Database.Database {
  if (!db) {
    const databasePath = dbPath || path.join(__dirname, '../../data/app.db');
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    logger.info(`Connecting to database at: ${databasePath}`);
    db = new Database(databasePath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initializeDatabase(dbPath?: string): void {
  const database = getDatabase(dbPath);

  logger.info('Initializing database schema...');
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  initializeUsersTable();
  logger.info('Database schema initialized');
}

export function closeDatabase(): void {
  if (db) {
    logger.info('Closing database connection');
    db.close();
    db = null;
  }
}

process.on('exit', () => {
  closeDatabase();
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
