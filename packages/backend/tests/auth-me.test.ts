import request from 'supertest';
import app from '../src/app';
import { initializeDatabase, closeDatabase } from '../src/utils/database';
import fs from 'fs';
import path from 'path';

describe('GET /api/v1/auth/me', () => {
  const testDbPath = path.join(__dirname, '../test-auth-me.db');
  let token: string;

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    process.env.JWT_SECRET = 'test-secret-key';
    initializeDatabase(testDbPath);

    await request(app).post('/api/v1/auth/register').send({
      email: 'me@example.com',
      password: 'password123',
      name: 'Me User',
    });

    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'me@example.com',
      password: 'password123',
    });

    token = login.body.data.token;
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('returns current user for authenticated request', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('me@example.com');
    expect(response.body.data.user.name).toBe('Me User');
    expect(response.body.data.user).toHaveProperty('id');
  });

  it('does not include password in response', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('returns 401 for unauthenticated request', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
  });
});
