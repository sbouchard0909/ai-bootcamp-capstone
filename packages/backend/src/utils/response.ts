import { Response } from 'express';

/**
 * Standard success response format
 */
export interface SuccessResponse<T = unknown> {
  data: T;
  timestamp: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: {
    message: string;
    status: number;
    timestamp: string;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response {
  const response: SuccessResponse<T> = {
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

/**
 * Send error response (used by error middleware, but can be called directly)
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500
): Response {
  const response: ErrorResponse = {
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
}
