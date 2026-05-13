import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, closeDatabase } from '../src/utils/database';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

describe('Authentication Middleware', () => {
  const testDbPath = path.join(__dirname, '../test-auth-middleware.db');
  let validToken: string;

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    process.env.JWT_SECRET = 'test-secret-key';
    initializeDatabase(testDbPath);

    await request(app).post('/api/v1/auth/register').send({
      email: 'middleware@example.com',
      password: 'password123',
      name: 'Middleware User',
    });

    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'middleware@example.com',
      password: 'password123',
    });

    validToken = login.body.data.token;
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('allows access with valid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('middleware@example.com');
  });

  it('returns 401 for missing token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain('token');
  });

  it('returns 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain('token');
  });

  it('returns 401 for expired token', async () => {
    const expiredToken = jwt.sign(
      { userId: '123', email: 'expired@example.com' },
      process.env.JWT_SECRET as string,
      { expiresIn: '-1h' }
    );

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain('token');
  });
});
