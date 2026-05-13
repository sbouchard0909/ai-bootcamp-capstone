import { expect, Page, test } from '@playwright/test';

type PlanStatus = 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';

interface PlanRecord {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  status: PlanStatus;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
}

function durationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

async function installPlansApiMocks(page: Page, initialPlans: PlanRecord[]) {
  const plans = [...initialPlans];

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
            email: 'plans-ui@example.com',
            name: 'Plans UI User',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/v1/plans', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            plans,
          },
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON() as {
        name: string;
        destination: string;
        startDate: string;
        endDate: string;
        budget: number;
        description?: string;
        status?: PlanStatus;
      };

      const created: PlanRecord = {
        id: `p${plans.length + 1}`,
        userId: 'u1',
        name: payload.name,
        destination: payload.destination,
        startDate: payload.startDate,
        endDate: payload.endDate,
        budget: payload.budget,
        description: payload.description,
        status: payload.status ?? 'planning',
        durationDays: durationDays(payload.startDate, payload.endDate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      plans.unshift(created);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { plan: created },
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/plans/*/activities', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          activities: [],
          groupedByDate: {},
          totalCost: 0,
          remainingBudget: 0,
          budgetUtilization: 0,
          costByCategory: {},
          warnings: [],
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/v1/plans/*/budget', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    const urlParts = route.request().url().split('/');
    const planId = urlParts[urlParts.length - 2];
    const existing = plans.find((plan) => plan.id === planId);

    if (!existing) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Plan not found', status: 404 } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          budget: existing.budget,
          totalSpent: 0,
          remainingBudget: existing.budget,
          budgetUtilization: 0,
          costByCategory: {},
          costByDate: {},
          warnings: [],
          mostExpensiveActivities: [],
        },
        timestamp: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/v1/plans/*', async (route) => {
    const method = route.request().method();
    const id = route.request().url().split('/').pop() as string;
    const existing = plans.find((plan) => plan.id === id);

    if (method === 'GET') {
      if (!existing) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Plan not found', status: 404 } }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { plan: existing },
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    if (method === 'PUT') {
      if (!existing) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Plan not found', status: 404 } }),
        });
        return;
      }

      const payload = route.request().postDataJSON() as Partial<PlanRecord>;
      const updated = {
        ...existing,
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      const index = plans.findIndex((plan) => plan.id === id);
      plans[index] = updated;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { plan: updated },
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    if (method === 'DELETE') {
      const index = plans.findIndex((plan) => plan.id === id);
      if (index >= 0) {
        plans.splice(index, 1);
      }

      await route.fulfill({ status: 204, body: '' });
      return;
    }

    await route.fallback();
  });
}

test('create a new vacation plan with valid data', async ({ page }) => {
  await installPlansApiMocks(page, []);

  await page.goto('/plans');
  await page.getByRole('button', { name: 'Create Plan' }).click();

  await page.getByLabel('Name *').fill('Autumn Adventure');
  await page.getByLabel('Destination *').fill('Kyoto');
  await page.getByLabel('Start Date *').fill('2026-10-10');
  await page.getByLabel('End Date *').fill('2026-10-18');
  await page.getByLabel('Budget *').fill('4200');
  await page.getByLabel('Description').fill('Temples and nature walks');

  await page.getByRole('button', { name: 'Create Plan' }).click();

  await expect(page.getByText('Autumn Adventure')).toBeVisible();
  await expect(page.getByText('Kyoto')).toBeVisible();
});

test('view plan details from list', async ({ page }) => {
  await installPlansApiMocks(page, [
    {
      id: 'p1',
      userId: 'u1',
      name: 'Spring Break',
      destination: 'Lisbon',
      startDate: '2026-04-02',
      endDate: '2026-04-09',
      budget: 2300,
      status: 'upcoming',
      durationDays: 8,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  await page.goto('/plans');
  await page.getByLabel('View plan Spring Break').click();

  await expect(page.getByRole('heading', { name: 'Spring Break' })).toBeVisible();
  await expect(page.getByText('Lisbon')).toBeVisible();
});

test('edit existing plan and see updates', async ({ page }) => {
  await installPlansApiMocks(page, [
    {
      id: 'p1',
      userId: 'u1',
      name: 'City Tour',
      destination: 'Berlin',
      startDate: '2026-05-03',
      endDate: '2026-05-08',
      budget: 1900,
      status: 'planning',
      durationDays: 6,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  await page.goto('/plans');
  await page.getByRole('button', { name: 'Edit' }).click();

  await page.getByLabel('Name *').fill('City Tour Updated');
  await page.getByLabel('Budget *').fill('2600');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByRole('heading', { name: 'City Tour Updated' })).toBeVisible();
  await expect(page.getByText('$2,600').first()).toBeVisible();
});

test('delete plan with confirmation', async ({ page }) => {
  await installPlansApiMocks(page, [
    {
      id: 'p1',
      userId: 'u1',
      name: 'Delete Me',
      destination: 'Prague',
      startDate: '2026-07-01',
      endDate: '2026-07-04',
      budget: 1200,
      status: 'planning',
      durationDays: 4,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  await page.goto('/plans');
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByRole('dialog', { name: 'Delete confirmation' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm delete' }).click();

  await expect(page.getByText('You have no vacation plans yet.')).toBeVisible();
});

test('form validation displays errors for invalid data', async ({ page }) => {
  await installPlansApiMocks(page, []);

  await page.goto('/plans/new');

  await page.getByLabel('Name *').fill('Validation Trip');
  await page.getByLabel('Destination *').fill('Osaka');
  await page.getByLabel('Start Date *').fill('2026-11-15');
  await page.getByLabel('End Date *').fill('2026-11-10');
  await page.getByLabel('Budget *').fill('-5');

  await page.getByRole('button', { name: 'Create Plan' }).click();

  await expect(page.getByRole('alert')).toContainText('end date must be after start date');
});
