import fs from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../src/app';
import { closeDatabase, getDatabase, initializeDatabase } from '../src/utils/database';

function isoDateFromNow(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

describe('Activities API', () => {
  const testDbPath = path.join(__dirname, '../test-activities.db');
  let ownerToken: string;
  let otherToken: string;
  let ownerPlanId: string;
  let otherPlanId: string;
  let ownerPlanStartDate: string;
  let ownerPlanEndDate: string;

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    process.env.JWT_SECRET = 'test-secret-key';
    initializeDatabase(testDbPath);

    ownerPlanStartDate = isoDateFromNow(20);
    ownerPlanEndDate = isoDateFromNow(30);

    await request(app).post('/api/v1/auth/register').send({
      email: 'activity-owner@example.com',
      password: 'password123',
      name: 'Owner',
    });

    await request(app).post('/api/v1/auth/register').send({
      email: 'activity-other@example.com',
      password: 'password123',
      name: 'Other',
    });

    const ownerLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'activity-owner@example.com',
      password: 'password123',
    });

    const otherLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'activity-other@example.com',
      password: 'password123',
    });

    ownerToken = ownerLogin.body.data.token;
    otherToken = otherLogin.body.data.token;

    const ownerPlan = await request(app)
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Owner Plan',
        destination: 'Rome',
        startDate: ownerPlanStartDate,
        endDate: ownerPlanEndDate,
        budget: 3000,
      });

    ownerPlanId = ownerPlan.body.data.plan.id;

    const otherPlan = await request(app)
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        name: 'Other Plan',
        destination: 'Paris',
        startDate: ownerPlanStartDate,
        endDate: ownerPlanEndDate,
        budget: 3000,
      });

    otherPlanId = otherPlan.body.data.plan.id;
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('POST /api/v1/plans/:planId/activities', () => {
    it('creates activity with valid data and returns 201', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Museum Visit',
          date: isoDateFromNow(22),
          startTime: '10:00',
          endTime: '12:00',
          cost: 45,
          category: 'sightseeing',
          description: 'Vatican museum',
          location: 'Vatican City',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.activity).toHaveProperty('id');
      expect(response.body.data.activity).toHaveProperty('createdAt');
      expect(response.body.data.activity).toHaveProperty('updatedAt');
      expect(response.body.data.activity.planId).toBe(ownerPlanId);
      expect(response.body.data.activity.name).toBe('Museum Visit');
    });

    it('returns 400 for missing required fields', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          date: isoDateFromNow(22),
          cost: 45,
          category: 'sightseeing',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('name');
    });

    it('returns 400 for activity date outside plan range', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Outside Range',
          date: isoDateFromNow(40),
          cost: 10,
          category: 'other',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('within');
    });

    it('returns 400 for invalid time range', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Bad Times',
          date: isoDateFromNow(22),
          startTime: '14:00',
          endTime: '13:00',
          cost: 10,
          category: 'other',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('endTime');
    });

    it('returns 400 for negative cost', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Negative Cost',
          date: isoDateFromNow(22),
          cost: -1,
          category: 'other',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Cost');
    });

    it('returns 400 for invalid category', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Bad Category',
          date: isoDateFromNow(22),
          cost: 10,
          category: 'not-a-category',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('category');
    });

    it('returns 404 for non-existent plan', async () => {
      const response = await request(app)
        .post('/api/v1/plans/not-real/activities')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Missing Plan',
          date: isoDateFromNow(22),
          cost: 10,
          category: 'other',
        });

      expect(response.status).toBe(404);
    });

    it('returns 403 for another users plan', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${otherPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Forbidden',
          date: isoDateFromNow(22),
          cost: 10,
          category: 'other',
        });

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .send({
          name: 'No Auth',
          date: isoDateFromNow(22),
          cost: 10,
          category: 'other',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/plans/:planId/activities', () => {
    it('returns activities sorted by date and startTime', async () => {
      await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'B', date: isoDateFromNow(23), startTime: '11:00', cost: 20, category: 'other' });

      await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'A', date: isoDateFromNow(23), startTime: '09:00', cost: 20, category: 'other' });

      await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'C', date: isoDateFromNow(24), cost: 20, category: 'other' });

      const response = await request(app)
        .get(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activities).toHaveLength(3);
      expect(response.body.data.activities[0].name).toBe('A');
      expect(response.body.data.activities[1].name).toBe('B');
      expect(response.body.data.activities[2].name).toBe('C');
    });

    it('returns empty array if plan has no activities', async () => {
      const response = await request(app)
        .get(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activities).toEqual([]);
    });

    it('returns 403 for another users plan', async () => {
      const response = await request(app)
        .get(`/api/v1/plans/${otherPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app).get(`/api/v1/plans/${ownerPlanId}/activities`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/plans/:planId/activities/:id', () => {
    it('returns single activity details', async () => {
      const create = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Single', date: isoDateFromNow(22), cost: 20, category: 'other' });

      const activityId = create.body.data.activity.id;

      const response = await request(app)
        .get(`/api/v1/plans/${ownerPlanId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activity.id).toBe(activityId);
    });

    it('returns 404 when activity does not exist', async () => {
      const response = await request(app)
        .get(`/api/v1/plans/${ownerPlanId}/activities/not-real`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/plans/:planId/activities/:id', () => {
    it('updates activity and keeps id/planId immutable', async () => {
      const create = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Before', date: isoDateFromNow(22), cost: 20, category: 'other' });

      const activityId = create.body.data.activity.id;
      const previousUpdatedAt = create.body.data.activity.updatedAt;

      const response = await request(app)
        .put(`/api/v1/plans/${ownerPlanId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          id: 'new-id',
          planId: 'new-plan-id',
          name: 'After',
          date: isoDateFromNow(23),
          startTime: '09:00',
          endTime: '10:00',
          cost: 50,
          category: 'dining',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.activity.id).toBe(activityId);
      expect(response.body.data.activity.planId).toBe(ownerPlanId);
      expect(response.body.data.activity.name).toBe('After');
      expect(response.body.data.activity.updatedAt).not.toBe(previousUpdatedAt);
    });

    it('returns 400 for invalid update data', async () => {
      const create = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Before', date: isoDateFromNow(22), cost: 20, category: 'other' });

      const activityId = create.body.data.activity.id;

      const response = await request(app)
        .put(`/api/v1/plans/${ownerPlanId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ date: isoDateFromNow(100) });

      expect(response.status).toBe(400);
    });

    it('returns 404 when activity does not exist', async () => {
      const response = await request(app)
        .put(`/api/v1/plans/${ownerPlanId}/activities/not-real`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Nope' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/plans/:planId/activities/:id', () => {
    it('deletes activity and returns 204', async () => {
      const create = await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Delete Me', date: isoDateFromNow(22), cost: 20, category: 'other' });

      const activityId = create.body.data.activity.id;

      const response = await request(app)
        .delete(`/api/v1/plans/${ownerPlanId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(204);

      const getDeleted = await request(app)
        .get(`/api/v1/plans/${ownerPlanId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(getDeleted.status).toBe(404);
    });

    it('returns 403 for another users plan', async () => {
      const create = await request(app)
        .post(`/api/v1/plans/${otherPlanId}/activities`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Other Activity', date: isoDateFromNow(22), cost: 20, category: 'other' });

      const activityId = create.body.data.activity.id;

      const response = await request(app)
        .delete(`/api/v1/plans/${otherPlanId}/activities/${activityId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/v1/plans/${ownerPlanId}/activities/not-real`);

      expect(response.status).toBe(401);
    });
  });

  describe('Cascade delete', () => {
    it('deleting a plan also deletes associated activities', async () => {
      await request(app)
        .post(`/api/v1/plans/${ownerPlanId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Cascade Target', date: isoDateFromNow(22), cost: 20, category: 'other' });

      const beforeDeleteCount = getDatabase()
        .prepare('SELECT COUNT(*) as count FROM activities WHERE planId = ?')
        .get(ownerPlanId) as { count: number };

      expect(beforeDeleteCount.count).toBe(1);

      const deletePlan = await request(app)
        .delete(`/api/v1/plans/${ownerPlanId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(deletePlan.status).toBe(204);

      const afterDeleteCount = getDatabase()
        .prepare('SELECT COUNT(*) as count FROM activities WHERE planId = ?')
        .get(ownerPlanId) as { count: number };

      expect(afterDeleteCount.count).toBe(0);
    });
  });
});
