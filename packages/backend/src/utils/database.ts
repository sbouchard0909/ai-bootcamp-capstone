import Database from 'better-sqlite3';
import path from 'path';
import { logger } from '../middleware/logger';
import { initializeUsersTable } from './userDb';

let db: Database.Database | null = null;

/**
 * Get database instance (singleton pattern)
 */
export function getDatabase(dbPath?: string): Database.Database {
  if (!db) {
    const databasePath = dbPath || path.join(__dirname, '../../data/app.db');
    logger.info(`Connecting to database at: ${databasePath}`);
    db = new Database(databasePath);
    db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better performance
  }
  return db;
}

/**
 * Initialize database schema
 */
export function initializeDatabase(dbPath?: string): void {
  const database = getDatabase(dbPath);
  
  logger.info('Initializing database schema...');
  
  // Create migrations table
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Initialize users table
  initializeUsersTable();
  
  logger.info('Database schema initialized');
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    logger.info('Closing database connection');
    db.close();
    db = null;
  }
}

// Handle cleanup on process exit
process.on('exit', () => {
  closeDatabase();
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
