import { test, expect, Page } from '@playwright/test';

async function mockDashboardData(page: Page) {
  // Mock auth
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'test-token');
  });

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          user: {
            id: 'u1',
            email: 'dashboard-ui@example.com',
            name: 'Dashboard UI User',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  // Mock dashboard endpoint
  await page.route('**/api/v1/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          upcomingPlans: [
            {
              id: 'p1',
              userId: 'u1',
              name: 'Summer Vacation',
              destination: 'Hawaii',
              startDate: '2026-07-01',
              endDate: '2026-07-15',
              budget: 5000,
              status: 'upcoming',
              durationDays: 15,
              totalSpent: 1200,
              remainingBudget: 3800,
              budgetUtilization: 24,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'p2',
              userId: 'u1',
              name: 'Fall Adventure',
              destination: 'New York',
              startDate: '2026-10-01',
              endDate: '2026-10-07',
              budget: 3000,
              status: 'upcoming',
              durationDays: 7,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          activePlans: [
            {
              id: 'p3',
              userId: 'u1',
              name: 'Current Trip',
              destination: 'Paris',
              startDate: '2026-05-10',
              endDate: '2026-05-20',
              budget: 4000,
              status: 'active',
              durationDays: 11,
              totalSpent: 1500,
              remainingBudget: 2500,
              budgetUtilization: 37.5,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          completedPlans: [],
          statistics: {
            totalPlans: 3,
            totalBudget: 12000,
            totalSpent: 2700,
            plansByStatus: {
              upcoming: 2,
              active: 1,
            },
          },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });
}

async function mockEmptyDashboard(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'test-token');
  });

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          user: {
            id: 'u1',
            email: 'empty-dashboard@example.com',
            name: 'Empty User',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/v1/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          upcomingPlans: [],
          activePlans: [],
          completedPlans: [],
          statistics: {
            totalPlans: 0,
            totalBudget: 0,
            totalSpent: 0,
            plansByStatus: {},
          },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });
}

test('dashboard displays user upcoming trips', async ({ page }) => {
  await mockDashboardData(page);
  await page.goto('/dashboard');

  // Wait for dashboard to load
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Check welcome message
  await expect(page.getByText(/welcome.*dashboard ui user/i)).toBeVisible();

  // Check statistics cards
  await expect(page.getByText('3')).toBeVisible(); // Total plans
  await expect(page.getByText('$12,000')).toBeVisible(); // Total budget
  await expect(page.getByText('$2,700')).toBeVisible(); // Total spent

  // Check upcoming trips section
  await expect(page.getByText('Summer Vacation')).toBeVisible();
  await expect(page.getByText('Hawaii')).toBeVisible();
  await expect(page.getByText('Fall Adventure')).toBeVisible();
  await expect(page.getByText('New York')).toBeVisible();

  // Check active trip banner
  await expect(page.getByText('Current Trip')).toBeVisible();
  await expect(page.getByText('Paris')).toBeVisible();
  await expect(page.getByText('Active')).toBeVisible();
});

test('clicking trip card navigates to plan details', async ({ page }) => {
  await mockDashboardData(page);
  
  // Mock plan details endpoint
  await page.route('**/api/v1/plans/p1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          plan: {
            id: 'p1',
            userId: 'u1',
            name: 'Summer Vacation',
            destination: 'Hawaii',
            startDate: '2026-07-01',
            endDate: '2026-07-15',
            budget: 5000,
            status: 'upcoming',
            durationDays: 15,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  // Mock activities endpoint
  await page.route('**/api/v1/plans/p1/activities', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          activities: [],
          groupedByDate: {},
          totalCost: 0,
          remainingBudget: 5000,
          budgetUtilization: 0,
          costByCategory: {},
          warnings: [],
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  // Mock budget endpoint
  await page.route('**/api/v1/plans/p1/budget', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          budget: 5000,
          totalSpent: 1200,
          remainingBudget: 3800,
          budgetUtilization: 24,
          costByCategory: {},
          costByDate: {},
          warnings: [],
          mostExpensiveActivities: [],
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  await page.goto('/dashboard');
  
  // Wait for trip cards to load
  await expect(page.getByText('Summer Vacation')).toBeVisible();
  
  await page.getByRole('link', { name: /view plan summer vacation/i }).click();

  // Should navigate to plan details
  await expect(page).toHaveURL(/\/plans\/p1/);
  await expect(page.getByRole('heading', { name: 'Summer Vacation' })).toBeVisible();
});

test('create new plan button navigates to plan creation', async ({ page }) => {
  await mockDashboardData(page);
  await page.goto('/dashboard');

  const createButton = page.getByRole('button', { name: /create new plan/i });
  await expect(createButton).toBeVisible();
  await createButton.click();

  // Should navigate to plan creation form
  await expect(page).toHaveURL(/\/plans\/new/);
});

test('statistics cards display correct counts', async ({ page }) => {
  await mockDashboardData(page);
  await page.goto('/dashboard');

  // Verify all statistics
  await expect(page.getByText('Total Plans')).toBeVisible();
  await expect(page.getByText('Total Budget')).toBeVisible();
  await expect(page.getByText('Total Spent')).toBeVisible();
  await expect(page.getByText('Upcoming Trips')).toBeVisible();

  // Check the values
  await expect(page.getByText('3')).toBeVisible(); // Total plans
  await expect(page.getByText('2')).toBeVisible(); // Upcoming trips count
});

test('empty state shows for new user', async ({ page }) => {
  await mockEmptyDashboard(page);
  await page.goto('/dashboard');

  // Check empty state message
  await expect(page.getByText(/no vacation plans yet/i)).toBeVisible();
  
  // Check create first plan button
  const createButton = page.getByRole('button', { name: /create your first plan/i });
  await expect(createButton).toBeVisible();
  await createButton.click();

  // Should navigate to plan creation form
  await expect(page).toHaveURL(/\/plans\/new/);
});
