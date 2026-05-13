/**
 * API Response Types
 * These match the backend response format
 */

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  timestamp: string;
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    status: number;
    timestamp: string;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

/**
 * Generic API error
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public response?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
