import { getDatabase } from './database';
import { User, CreateUserInput } from '../models/User';
import { randomUUID } from 'crypto';

/**
 * Initialize users table
 */
export function initializeUsersTable(): void {
  const db = getDatabase();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email COLLATE NOCASE);
  `);
}

/**
 * Create a new user
 */
export function createUser(userData: CreateUserInput): User {
  const db = getDatabase();
  
  // Check if email already exists
  const existing = findUserByEmail(userData.email);
  if (existing) {
    throw new Error('Email already exists');
  }
  
  const user: User = {
    id: randomUUID(),
    email: userData.email,
    password: userData.password,
    name: userData.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, name, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(user.id, user.email, user.password, user.name, user.createdAt, user.updatedAt);
  
  return user;
}

/**
 * Find user by email (case-insensitive)
 */
export function findUserByEmail(email: string): User | null {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM users WHERE LOWER(email) = LOWER(?)
  `);
  
  const row = stmt.get(email) as User | undefined;
  return row || null;
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | null {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `);
  
  const row = stmt.get(id) as User | undefined;
  return row || null;
}

/**
 * Get all users
 */
export function getAllUsers(): User[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT *
    FROM users
    ORDER BY rowid ASC
  `);
  
  return stmt.all() as User[];
}
