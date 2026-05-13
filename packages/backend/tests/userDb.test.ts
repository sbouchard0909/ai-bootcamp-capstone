import { createUser, findUserByEmail, findUserById, getAllUsers } from '../src/utils/userDb';
import { closeDatabase, initializeDatabase } from '../src/utils/database';
import { CreateUserInput } from '../src/models/User';
import fs from 'fs';
import path from 'path';

describe('User Database Operations', () => {
  const testDbPath = path.join(__dirname, '../test-users.db');

  beforeEach(() => {
    // Initialize fresh database for each test
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    initializeDatabase(testDbPath);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const userData: CreateUserInput = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
      };

      const user = createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should generate unique IDs for each user', () => {
      const userData1: CreateUserInput = {
        email: 'user1@example.com',
        password: 'hashedpassword123',
        name: 'User One',
      };

      const userData2: CreateUserInput = {
        email: 'user2@example.com',
        password: 'hashedpassword456',
        name: 'User Two',
      };

      const user1 = createUser(userData1);
      const user2 = createUser(userData2);

      expect(user1.id).not.toBe(user2.id);
    });

    it('should throw error for duplicate email', () => {
      const userData: CreateUserInput = {
        email: 'duplicate@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
      };

      createUser(userData);
      
      expect(() => createUser(userData)).toThrow('Email already exists');
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', () => {
      const userData: CreateUserInput = {
        email: 'findme@example.com',
        password: 'hashedpassword123',
        name: 'Find Me',
      };

      const createdUser = createUser(userData);
      const foundUser = findUserByEmail('findme@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent email', () => {
      const user = findUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('should be case-insensitive', () => {
      const userData: CreateUserInput = {
        email: 'CaseSensitive@Example.com',
        password: 'hashedpassword123',
        name: 'Case Test',
      };

      createUser(userData);
      const foundUser = findUserByEmail('casesensitive@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('CaseSensitive@Example.com');
    });
  });

  describe('findUserById', () => {
    it('should find user by ID', () => {
      const userData: CreateUserInput = {
        email: 'findbyid@example.com',
        password: 'hashedpassword123',
        name: 'Find By ID',
      };

      const createdUser = createUser(userData);
      const foundUser = findUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent ID', () => {
      const user = findUserById('nonexistent-id-123');
      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', () => {
      const user1: CreateUserInput = {
        email: 'user1@example.com',
        password: 'hashedpassword123',
        name: 'User One',
      };

      const user2: CreateUserInput = {
        email: 'user2@example.com',
        password: 'hashedpassword456',
        name: 'User Two',
      };

      createUser(user1);
      createUser(user2);

      const users = getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0].email).toBe('user1@example.com');
      expect(users[1].email).toBe('user2@example.com');
    });

    it('should return empty array when no users exist', () => {
      const users = getAllUsers();
      expect(users).toEqual([]);
    });
  });
});
