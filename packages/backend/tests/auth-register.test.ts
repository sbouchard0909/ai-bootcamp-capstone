import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, closeDatabase } from '../src/utils/database';
import { findUserByEmail } from '../src/utils/userDb';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

describe('POST /api/v1/auth/register', () => {
  const testDbPath = path.join(__dirname, '../test-auth.db');

  beforeEach(() => {
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

  describe('Successful Registration', () => {
    it('should register a new user and return 201 with user object', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user.name).toBe('New User');
      expect(response.body.data.user).toHaveProperty('createdAt');
      expect(response.body.data.user).toHaveProperty('updatedAt');
    });

    it('should not include password in response', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should hash password before storing in database', async () => {
      const plainPassword = 'password123';
      
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'hashtest@example.com',
          password: plainPassword,
          name: 'Hash Test',
        });

      const user = findUserByEmail('hashtest@example.com');
      expect(user).toBeDefined();
      expect(user?.password).not.toBe(plainPassword);
      
      // Verify password was hashed with bcrypt
      const isValidHash = await bcrypt.compare(plainPassword, user!.password);
      expect(isValidHash).toBe(true);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('email');
    });

    it('should return 400 for weak password (less than 8 chars)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('password');
      expect(response.body.error.message).toContain('8');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('email');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('password');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('name');
    });
  });

  describe('Duplicate Email', () => {
    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'First User',
        });

      // Attempt to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'differentpass',
          name: 'Second User',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toContain('already');
    });

    it('should be case-insensitive for duplicate email check', async () => {
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'CaseSensitive@Example.com',
          password: 'password123',
          name: 'First User',
        });

      // Attempt to register with lowercase version
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'casesensitive@example.com',
          password: 'password123',
          name: 'Second User',
        });

      expect(response.status).toBe(409);
    });
  });
});
