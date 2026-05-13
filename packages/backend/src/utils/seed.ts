import { findUserByEmail, createUser } from './userDb';
import { logger } from '../middleware/logger';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Seed test user for development environments only
 * Email: test@example.com
 * Password: password123
 */
export async function seedTestUser(): Promise<void> {
  // Only seed in non-production environments
  if (process.env.NODE_ENV === 'production') {
    logger.info('Skipping seed in production environment');
    return;
  }

  const testEmail = 'test@example.com';
  
  // Check if test user already exists
  const existingUser = findUserByEmail(testEmail);
  if (existingUser) {
    logger.info('Test user already exists, skipping seed');
    return;
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

    // Create test user
    const testUser = createUser({
      email: testEmail,
      password: hashedPassword,
      name: 'Test User',
    });

    logger.info(`✓ Seeded test user: ${testUser.email}`);
    logger.info('  Email: test@example.com');
    logger.info('  Password: password123');
  } catch (error) {
    logger.error('Failed to seed test user:', error);
  }
}
