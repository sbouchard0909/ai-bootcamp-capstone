/**
 * Validation utilities for user input
 */

/**
 * Validate email format using regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (minimum 8 characters)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(fields: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${key} is required`;
    }
  }
  return null;
}
