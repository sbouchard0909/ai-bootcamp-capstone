import { getDatabase, initializeDatabase, closeDatabase } from '../src/utils/database';
import fs from 'fs';
import path from 'path';

describe('Database Connection', () => {
  const testDbPath = path.join(__dirname, '../test.db');

  afterEach(() => {
    // Clean up test database
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('getDatabase', () => {
    it('should return a database instance', () => {
      const db = getDatabase(testDbPath);
      expect(db).toBeDefined();
      expect(db.prepare).toBeInstanceOf(Function);
    });

    it('should return the same instance on multiple calls', () => {
      const db1 = getDatabase(testDbPath);
      const db2 = getDatabase(testDbPath);
      expect(db1).toBe(db2);
    });
  });

  describe('initializeDatabase', () => {
    it('should create database file if it does not exist', () => {
      expect(fs.existsSync(testDbPath)).toBe(false);
      initializeDatabase(testDbPath);
      expect(fs.existsSync(testDbPath)).toBe(true);
    });

    it('should initialize database schema', () => {
      initializeDatabase(testDbPath);
      const db = getDatabase(testDbPath);
      
      // Verify tables were created by checking sqlite_master
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).all();
      
      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
    });

    it('should be safe to call multiple times', () => {
      initializeDatabase(testDbPath);
      initializeDatabase(testDbPath);
      
      const db = getDatabase(testDbPath);
      expect(db).toBeDefined();
    });
  });

  describe('closeDatabase', () => {
    it('should close the database connection', () => {
      const db = getDatabase(testDbPath);
      expect(db).toBeDefined();
      
      closeDatabase();
      
      // After closing, getting database should return a new instance
      const db2 = getDatabase(testDbPath);
      expect(db2).not.toBe(db);
    });

    it('should be safe to call when no database is open', () => {
      expect(() => closeDatabase()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', () => {
      const db = getDatabase(testDbPath);
      
      // Try to execute invalid SQL
      expect(() => {
        db.prepare('INVALID SQL').run();
      }).toThrow();
    });
  });
});
