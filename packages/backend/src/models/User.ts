/**
 * User model and types
 */

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User data for creation (before hashing password)
 */
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

/**
 * User data without sensitive information
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * JWT token payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Convert User to UserResponse (remove password)
 */
export function sanitizeUser(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
