import { test, expect } from '@playwright/test';

function randomEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

async function registerUser(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register');
  await page.getByLabel('Name').fill('Playwright User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

test('user can register with valid credentials', async ({ page }) => {
  const email = randomEmail();
  await registerUser(page, email);
});

test('user can login with valid credentials', async ({ page }) => {
  const email = randomEmail();
  await registerUser(page, email);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('user can logout successfully', async ({ page }) => {
  const email = randomEmail();
  await registerUser(page, email);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('invalid login shows error message', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('does-not-exist@example.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('alert')).toContainText('Invalid credentials');
});

test('protected route redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});
