import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { TokenPayload } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'dev-jwt-secret';
}

export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const request = req as AuthenticatedRequest;
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication token is required', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & TokenPayload;
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (_error) {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function signAuthToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
}
