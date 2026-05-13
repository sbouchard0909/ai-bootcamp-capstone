import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { closeDatabase, initializeDatabase } from '../src/utils/database';

function isoDateFromNow(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

describe('Vacation Plans API', () => {
  const testDbPath = path.join(__dirname, '../test-plans.db');
  let token: string;
  let otherUserToken: string;

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    process.env.JWT_SECRET = 'test-secret-key';
    initializeDatabase(testDbPath);

    await request(app).post('/api/v1/auth/register').send({
      email: 'plans-owner@example.com',
      password: 'password123',
      name: 'Plans Owner',
    });

    await request(app).post('/api/v1/auth/register').send({
      email: 'plans-other@example.com',
      password: 'password123',
      name: 'Other User',
    });

    const ownerLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'plans-owner@example.com',
      password: 'password123',
    });

    const otherLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'plans-other@example.com',
      password: 'password123',
    });

    token = ownerLogin.body.data.token;
    otherUserToken = otherLogin.body.data.token;
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('POST /api/v1/plans', () => {
    it('creates plan with valid data and returns 201', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Summer Trip',
          destination: 'Tokyo',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(37),
          budget: 2500,
          description: 'Visit museums and cafes',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.plan).toHaveProperty('id');
      expect(response.body.data.plan).toHaveProperty('createdAt');
      expect(response.body.data.plan).toHaveProperty('updatedAt');
      expect(response.body.data.plan.name).toBe('Summer Trip');
      expect(response.body.data.plan.userId).toBeDefined();
      expect(response.body.data.plan.status).toBe('planning');
    });

    it('returns 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: 'Tokyo',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(37),
          budget: 2500,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('name');
    });

    it('returns 400 for invalid date range', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Broken Dates',
          destination: 'Tokyo',
          startDate: isoDateFromNow(40),
          endDate: isoDateFromNow(30),
          budget: 2500,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('endDate');
    });

    it('returns 400 for negative budget', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bad Budget',
          destination: 'Tokyo',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(37),
          budget: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Budget');
    });

    it('returns 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Status Test',
          destination: 'Tokyo',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(37),
          budget: 2500,
          status: 'invalid-status',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('status');
    });

    it('returns 400 when start date is in the past', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Past Trip',
          destination: 'Tokyo',
          startDate: isoDateFromNow(-1),
          endDate: isoDateFromNow(3),
          budget: 2500,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('past');
    });

    it('returns 400 for name longer than 200 characters', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'a'.repeat(201),
          destination: 'Tokyo',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(37),
          budget: 2500,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Name');
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).post('/api/v1/plans').send({
        name: 'No Auth',
        destination: 'Tokyo',
        startDate: isoDateFromNow(30),
        endDate: isoDateFromNow(37),
        budget: 2500,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/plans', () => {
    it('returns only authenticated user plans sorted by startDate descending', async () => {
      const ownerOlder = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Owner Older',
          destination: 'Paris',
          startDate: isoDateFromNow(20),
          endDate: isoDateFromNow(27),
          budget: 3000,
        });

      const ownerNewer = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Owner Newer',
          destination: 'Rome',
          startDate: isoDateFromNow(40),
          endDate: isoDateFromNow(45),
          budget: 3000,
        });

      await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other User Plan',
          destination: 'Berlin',
          startDate: isoDateFromNow(50),
          endDate: isoDateFromNow(55),
          budget: 3000,
        });

      expect(ownerOlder.status).toBe(201);
      expect(ownerNewer.status).toBe(201);

      const response = await request(app)
        .get('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.plans).toHaveLength(2);
      expect(response.body.data.plans[0].name).toBe('Owner Newer');
      expect(response.body.data.plans[1].name).toBe('Owner Older');
    });

    it('returns empty array when user has no plans', async () => {
      const freshDbPath = path.join(__dirname, '../test-plans-empty.db');

      closeDatabase();
      if (fs.existsSync(freshDbPath)) {
        fs.unlinkSync(freshDbPath);
      }

      initializeDatabase(freshDbPath);

      await request(app).post('/api/v1/auth/register').send({
        email: 'empty@example.com',
        password: 'password123',
        name: 'Empty User',
      });

      const login = await request(app).post('/api/v1/auth/login').send({
        email: 'empty@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .get('/api/v1/plans')
        .set('Authorization', `Bearer ${login.body.data.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.plans).toEqual([]);

      closeDatabase();
      if (fs.existsSync(freshDbPath)) {
        fs.unlinkSync(freshDbPath);
      }
      initializeDatabase(testDbPath);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/v1/plans');
      expect(response.status).toBe(401);
    });

    it('includes budget summary for each plan', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Budget List Plan',
          destination: 'Montreal',
          startDate: isoDateFromNow(15),
          endDate: isoDateFromNow(18),
          budget: 1000,
        });

      const planId = create.body.data.plan.id;

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lunch', date: isoDateFromNow(16), cost: 200, category: 'dining' });

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Taxi', date: isoDateFromNow(16), cost: 50, category: 'transport' });

      const response = await request(app)
        .get('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const plan = response.body.data.plans.find((item: { id: string }) => item.id === planId);
      expect(plan).toBeDefined();
      expect(plan.totalSpent).toBe(250);
      expect(plan.remainingBudget).toBe(750);
      expect(plan.budgetUtilization).toBe(25);
      expect(plan.costByCategory).toEqual({ dining: 200, transport: 50 });
      expect(plan.warnings).toEqual([]);
    });
  });

  describe('GET /api/v1/plans/:id', () => {
    it('returns plan details for owner', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Detail Trip',
          destination: 'Madrid',
          startDate: isoDateFromNow(10),
          endDate: isoDateFromNow(12),
          budget: 1200,
        });

      const planId = create.body.data.plan.id;

      const response = await request(app)
        .get(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.plan.id).toBe(planId);
    });

    it('returns 404 when plan does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/plans/not-a-real-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('returns 403 when plan belongs to another user', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other Detail Trip',
          destination: 'Madrid',
          startDate: isoDateFromNow(10),
          endDate: isoDateFromNow(12),
          budget: 1200,
        });

      const planId = create.body.data.plan.id;

      const response = await request(app)
        .get(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/v1/plans/some-id');
      expect(response.status).toBe(401);
    });

    it('includes budget calculations and warnings', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Budget Detail Plan',
          destination: 'Boston',
          startDate: isoDateFromNow(10),
          endDate: isoDateFromNow(13),
          budget: 1000,
        });

      const planId = create.body.data.plan.id;

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hotel', date: isoDateFromNow(11), cost: 600, category: 'accommodation' });

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Dinner', date: isoDateFromNow(11), cost: 300, category: 'dining' });

      const response = await request(app)
        .get(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.plan.totalSpent).toBe(900);
      expect(response.body.data.plan.remainingBudget).toBe(100);
      expect(response.body.data.plan.budgetUtilization).toBe(90);
      expect(response.body.data.plan.costByCategory).toEqual({ accommodation: 600, dining: 300 });
      expect(response.body.data.plan.warnings).toContain('Budget usage has reached 80% or more');
    });
  });

  describe('GET /api/v1/plans/:id/budget', () => {
    it('returns detailed budget breakdown', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Budget Breakdown Plan',
          destination: 'Toronto',
          startDate: isoDateFromNow(21),
          endDate: isoDateFromNow(25),
          budget: 500,
        });

      const planId = create.body.data.plan.id;

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Museum', date: isoDateFromNow(22), cost: 150, category: 'sightseeing' });

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Dinner', date: isoDateFromNow(23), cost: 200, category: 'dining' });

      await request(app)
        .post(`/api/v1/plans/${planId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Train', date: isoDateFromNow(23), cost: 175, category: 'transport' });

      const response = await request(app)
        .get(`/api/v1/plans/${planId}/budget`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.budget).toBe(500);
      expect(response.body.data.totalSpent).toBe(525);
      expect(response.body.data.remainingBudget).toBe(-25);
      expect(response.body.data.budgetUtilization).toBe(105);
      expect(response.body.data.costByCategory).toEqual({
        sightseeing: 150,
        dining: 200,
        transport: 175,
      });
      expect(response.body.data.costByDate).toEqual({
        [isoDateFromNow(22)]: 150,
        [isoDateFromNow(23)]: 375,
      });
      expect(response.body.data.warnings).toContain('Budget usage has reached 80% or more');
      expect(response.body.data.warnings).toContain('Plan is over budget');
      expect(response.body.data.mostExpensiveActivities[0].name).toBe('Dinner');
    });

    it('returns 404 for non-existent plan', async () => {
      const response = await request(app)
        .get('/api/v1/plans/not-a-real-id/budget')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('returns 403 when plan belongs to another user', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other User Budget Plan',
          destination: 'Vancouver',
          startDate: isoDateFromNow(15),
          endDate: isoDateFromNow(20),
          budget: 1200,
        });

      const response = await request(app)
        .get(`/api/v1/plans/${create.body.data.plan.id}/budget`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/v1/plans/some-id/budget');
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/plans/:id', () => {
    it('updates allowed fields and updates updatedAt', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Trip',
          destination: 'Lisbon',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(35),
          budget: 1800,
        });

      const planId = create.body.data.plan.id;
      const oldUpdatedAt = create.body.data.plan.updatedAt;

      const response = await request(app)
        .put(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Trip Name',
          destination: 'Porto',
          startDate: isoDateFromNow(31),
          endDate: isoDateFromNow(36),
          budget: 2200,
          description: 'Updated notes',
          status: 'upcoming',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.plan.name).toBe('Updated Trip Name');
      expect(response.body.data.plan.destination).toBe('Porto');
      expect(response.body.data.plan.budget).toBe(2200);
      expect(response.body.data.plan.description).toBe('Updated notes');
      expect(response.body.data.plan.status).toBe('upcoming');
      expect(response.body.data.plan.updatedAt).not.toBe(oldUpdatedAt);
    });

    it('does not allow updating id or userId', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Immutable Fields Trip',
          destination: 'Lisbon',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(35),
          budget: 1800,
        });

      const planId = create.body.data.plan.id;
      const originalUserId = create.body.data.plan.userId;

      const response = await request(app)
        .put(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: 'new-id',
          userId: 'new-user-id',
          name: 'Still Valid Update',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.plan.id).toBe(planId);
      expect(response.body.data.plan.userId).toBe(originalUserId);
      expect(response.body.data.plan.name).toBe('Still Valid Update');
    });

    it('returns 400 for invalid updates', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Validation Trip',
          destination: 'Lisbon',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(35),
          budget: 1800,
        });

      const planId = create.body.data.plan.id;

      const response = await request(app)
        .put(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          budget: 0,
        });

      expect(response.status).toBe(400);
    });

    it('returns 404 when updating non-existent plan', async () => {
      const response = await request(app)
        .put('/api/v1/plans/not-a-real-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'No Plan' });

      expect(response.status).toBe(404);
    });

    it('returns 403 when updating another users plan', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other User Update Trip',
          destination: 'Lisbon',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(35),
          budget: 1800,
        });

      const planId = create.body.data.plan.id;

      const response = await request(app)
        .put(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Should Not Work' });

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).put('/api/v1/plans/some-id').send({
        name: 'No Auth Update',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/plans/:id', () => {
    it('deletes a plan and returns 204', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Trip',
          destination: 'Athens',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(35),
          budget: 900,
        });

      const planId = create.body.data.plan.id;

      const response = await request(app)
        .delete(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const getDeleted = await request(app)
        .get(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getDeleted.status).toBe(404);
    });

    it('returns 404 when deleting non-existent plan', async () => {
      const response = await request(app)
        .delete('/api/v1/plans/not-a-real-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('returns 403 when deleting another users plan', async () => {
      const create = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other User Delete Trip',
          destination: 'Athens',
          startDate: isoDateFromNow(30),
          endDate: isoDateFromNow(35),
          budget: 900,
        });

      const planId = create.body.data.plan.id;

      const response = await request(app)
        .delete(`/api/v1/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).delete('/api/v1/plans/some-id');
      expect(response.status).toBe(401);
    });
  });
});
