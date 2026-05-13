import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, closeDatabase } from '../src/utils/database';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../src/models/User';
import fs from 'fs';
import path from 'path';

describe('POST /api/v1/auth/login', () => {
  const testDbPath = path.join(__dirname, '../test-auth-login.db');

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    initializeDatabase(testDbPath);

    // Register a test user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login Test',
      });
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Successful Login', () => {
    it('should login with valid credentials and return 200 with token and user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return valid JWT token with user ID and email in payload', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      const token = response.body.data.token;
      expect(token).toBeDefined();

      // Decode token (without verification for testing)
      const decoded = jwt.decode(token) as TokenPayload;
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded.email).toBe('login@example.com');
    });
  });

  describe('Invalid Credentials', () => {
    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toContain('Invalid credentials');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('email');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('password');
    });
  });
});
