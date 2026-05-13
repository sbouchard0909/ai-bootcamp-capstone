import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { initializeDatabase, closeDatabase } from '../src/utils/database';
import { createUser } from '../src/utils/userDb';
import { createVacationPlan } from '../src/utils/planDb';
import { createActivity } from '../src/utils/activityDb';
import { signAuthToken } from '../src/middleware/auth';

describe('Dashboard API', () => {
  const testDbPath = path.join(__dirname, '../test-dashboard.db');
  let authToken: string;
  let userId: string;
  let otherUserId: string;

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    process.env.JWT_SECRET = 'test-secret-key';
    initializeDatabase(testDbPath);

    // Create test users
    const user = createUser({
      email: 'dashboard@example.com',
      password: 'hashedpassword',
      name: 'Dashboard User',
    });
    userId = user.id;
    authToken = signAuthToken({ userId: user.id, email: user.email });

    const otherUser = createUser({
      email: 'other@example.com',
      password: 'hashedpassword',
      name: 'Other User',
    });
    otherUserId = otherUser.id;
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return dashboard data with 200 for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('upcomingPlans');
      expect(response.body.data).toHaveProperty('activePlans');
      expect(response.body.data).toHaveProperty('completedPlans');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app).get('/api/v1/dashboard').expect(401);
    });

    it('should only return authenticated user plans', async () => {
      // Create plans for the authenticated user
      createVacationPlan({
        userId,
        name: 'My Trip',
        destination: 'Paris',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        budget: 3000,
        status: 'upcoming',
      });

      // Create plans for another user
      createVacationPlan({
        userId: otherUserId,
        name: 'Other Trip',
        destination: 'London',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        budget: 2000,
        status: 'upcoming',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const allPlans = [
        ...response.body.data.upcomingPlans,
        ...response.body.data.activePlans,
        ...response.body.data.completedPlans,
      ];

      expect(allPlans).toHaveLength(1);
      expect(allPlans[0].name).toBe('My Trip');
    });

    it('should group plans into upcoming, active, and completed', async () => {
      // Create upcoming plan
      createVacationPlan({
        userId,
        name: 'Future Trip',
        destination: 'Tokyo',
        startDate: '2026-12-01',
        endDate: '2026-12-10',
        budget: 5000,
        status: 'upcoming',
      });

      // Create active plan (started but not ended)
      createVacationPlan({
        userId,
        name: 'Current Trip',
        destination: 'Rome',
        startDate: '2026-05-10',
        endDate: '2026-05-20',
        budget: 3000,
        status: 'active',
      });

      // Create completed plan
      createVacationPlan({
        userId,
        name: 'Past Trip',
        destination: 'Berlin',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        budget: 2000,
        status: 'completed',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.upcomingPlans).toHaveLength(1);
      expect(response.body.data.upcomingPlans[0].name).toBe('Future Trip');

      expect(response.body.data.activePlans).toHaveLength(1);
      expect(response.body.data.activePlans[0].name).toBe('Current Trip');

      expect(response.body.data.completedPlans).toHaveLength(1);
      expect(response.body.data.completedPlans[0].name).toBe('Past Trip');
    });

    it('should sort upcoming plans by start date ascending', async () => {
      createVacationPlan({
        userId,
        name: 'Trip C',
        destination: 'Paris',
        startDate: '2026-12-01',
        endDate: '2026-12-10',
        budget: 3000,
        status: 'upcoming',
      });

      createVacationPlan({
        userId,
        name: 'Trip A',
        destination: 'London',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        budget: 2000,
        status: 'upcoming',
      });

      createVacationPlan({
        userId,
        name: 'Trip B',
        destination: 'Rome',
        startDate: '2026-10-01',
        endDate: '2026-10-10',
        budget: 2500,
        status: 'upcoming',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { upcomingPlans } = response.body.data;
      expect(upcomingPlans).toHaveLength(3);
      expect(upcomingPlans[0].name).toBe('Trip A'); // 2026-08-01
      expect(upcomingPlans[1].name).toBe('Trip B'); // 2026-10-01
      expect(upcomingPlans[2].name).toBe('Trip C'); // 2026-12-01
    });

    it('should sort active plans by end date ascending', async () => {
      createVacationPlan({
        userId,
        name: 'Ending Last',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-20',
        budget: 3000,
        status: 'active',
      });

      createVacationPlan({
        userId,
        name: 'Ending Soon',
        destination: 'London',
        startDate: '2026-05-10',
        endDate: '2026-05-15',
        budget: 2000,
        status: 'active',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { activePlans } = response.body.data;
      expect(activePlans).toHaveLength(2);
      expect(activePlans[0].name).toBe('Ending Soon'); // 2026-05-15
      expect(activePlans[1].name).toBe('Ending Last'); // 2026-05-20
    });

    it('should sort completed plans by end date descending (most recent first)', async () => {
      createVacationPlan({
        userId,
        name: 'Oldest Trip',
        destination: 'Paris',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        budget: 3000,
        status: 'completed',
      });

      createVacationPlan({
        userId,
        name: 'Recent Trip',
        destination: 'London',
        startDate: '2026-04-01',
        endDate: '2026-04-10',
        budget: 2000,
        status: 'completed',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { completedPlans } = response.body.data;
      expect(completedPlans).toHaveLength(2);
      expect(completedPlans[0].name).toBe('Recent Trip'); // 2026-04-10
      expect(completedPlans[1].name).toBe('Oldest Trip'); // 2026-01-10
    });

    it('should include statistics with correct counts', async () => {
      createVacationPlan({
        userId,
        name: 'Upcoming 1',
        destination: 'Paris',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        budget: 3000,
        status: 'upcoming',
      });

      createVacationPlan({
        userId,
        name: 'Upcoming 2',
        destination: 'London',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        budget: 2000,
        status: 'upcoming',
      });

      createVacationPlan({
        userId,
        name: 'Active',
        destination: 'Rome',
        startDate: '2026-05-10',
        endDate: '2026-05-20',
        budget: 2500,
        status: 'active',
      });

      createVacationPlan({
        userId,
        name: 'Completed',
        destination: 'Berlin',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        budget: 1500,
        status: 'completed',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { statistics } = response.body.data;
      expect(statistics.totalPlans).toBe(4);
      expect(statistics.plansByStatus).toEqual({
        upcoming: 2,
        active: 1,
        completed: 1,
      });
    });

    it('should calculate total budget across all plans', async () => {
      createVacationPlan({
        userId,
        name: 'Trip 1',
        destination: 'Paris',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        budget: 3000,
        status: 'upcoming',
      });

      createVacationPlan({
        userId,
        name: 'Trip 2',
        destination: 'London',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        budget: 2500,
        status: 'upcoming',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { statistics } = response.body.data;
      expect(statistics.totalBudget).toBe(5500);
    });

    it('should calculate total spent across all activities', async () => {
      const plan1 = createVacationPlan({
        userId,
        name: 'Trip 1',
        destination: 'Paris',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        budget: 3000,
        status: 'upcoming',
      });

      const plan2 = createVacationPlan({
        userId,
        name: 'Trip 2',
        destination: 'London',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        budget: 2500,
        status: 'upcoming',
      });

      // Add activities to plans
      createActivity({
        planId: plan1.id,
        name: 'Hotel',
        category: 'accommodation',
        date: '2026-08-01',
        cost: 1000,
      });

      createActivity({
        planId: plan1.id,
        name: 'Flight',
        category: 'transport',
        date: '2026-08-01',
        cost: 500,
      });

      createActivity({
        planId: plan2.id,
        name: 'Museum',
        category: 'entertainment',
        date: '2026-09-02',
        cost: 50,
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { statistics } = response.body.data;
      expect(statistics.totalSpent).toBe(1550);
    });

    it('should auto-update plan status from upcoming to active when start date reached', async () => {
      // Create a plan that should be active (started today)
      createVacationPlan({
        userId,
        name: 'Should Be Active',
        destination: 'Paris',
        startDate: '2026-05-13', // Today's date
        endDate: '2026-05-20',
        budget: 3000,
        status: 'upcoming', // Still marked as upcoming
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should appear in activePlans after auto-update
      expect(response.body.data.activePlans).toHaveLength(1);
      expect(response.body.data.activePlans[0].name).toBe('Should Be Active');
      expect(response.body.data.activePlans[0].status).toBe('active');
      expect(response.body.data.upcomingPlans).toHaveLength(0);
    });

    it('should auto-update plan status from active to completed when end date passed', async () => {
      // Create a plan that should be completed (ended yesterday)
      createVacationPlan({
        userId,
        name: 'Should Be Completed',
        destination: 'London',
        startDate: '2026-05-01',
        endDate: '2026-05-12', // Yesterday
        budget: 2000,
        status: 'active', // Still marked as active
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should appear in completedPlans after auto-update
      expect(response.body.data.completedPlans).toHaveLength(1);
      expect(response.body.data.completedPlans[0].name).toBe('Should Be Completed');
      expect(response.body.data.completedPlans[0].status).toBe('completed');
      expect(response.body.data.activePlans).toHaveLength(0);
    });

    it('should not auto-update cancelled plans', async () => {
      // Create a cancelled plan that would normally be active
      createVacationPlan({
        userId,
        name: 'Cancelled Trip',
        destination: 'Rome',
        startDate: '2026-05-13', // Today
        endDate: '2026-05-20',
        budget: 2500,
        status: 'cancelled',
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Cancelled plans should not be in any category
      expect(response.body.data.upcomingPlans).toHaveLength(0);
      expect(response.body.data.activePlans).toHaveLength(0);
      expect(response.body.data.completedPlans).toHaveLength(0);

      // But should be counted in statistics
      expect(response.body.data.statistics.plansByStatus.cancelled).toBe(1);
    });

    it('should include budget information in plan objects', async () => {
      const plan = createVacationPlan({
        userId,
        name: 'Trip with Activities',
        destination: 'Paris',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        budget: 3000,
        status: 'upcoming',
      });

      createActivity({
        planId: plan.id,
        name: 'Hotel',
        category: 'accommodation',
        date: '2026-08-01',
        cost: 1500,
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const upcomingPlan = response.body.data.upcomingPlans[0];
      expect(upcomingPlan).toHaveProperty('durationDays');
      expect(upcomingPlan).toHaveProperty('totalSpent');
      expect(upcomingPlan).toHaveProperty('remainingBudget');
      expect(upcomingPlan).toHaveProperty('budgetUtilization');
      expect(upcomingPlan.totalSpent).toBe(1500);
      expect(upcomingPlan.remainingBudget).toBe(1500);
    });

    it('should return empty arrays when user has no plans', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.upcomingPlans).toEqual([]);
      expect(response.body.data.activePlans).toEqual([]);
      expect(response.body.data.completedPlans).toEqual([]);
      expect(response.body.data.statistics.totalPlans).toBe(0);
      expect(response.body.data.statistics.totalBudget).toBe(0);
      expect(response.body.data.statistics.totalSpent).toBe(0);
    });
  });
});
