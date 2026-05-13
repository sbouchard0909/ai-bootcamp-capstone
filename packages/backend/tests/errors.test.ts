import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, notFoundHandler } from '../src/middleware/errorHandler';

describe('Error Handling Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('AppError Class', () => {
    it('should create an error with message and status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should default to status 500 if not provided', () => {
      const error = new AppError('Test error');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('Error Handler Middleware', () => {
    it('should return properly formatted error response', async () => {
      app.get('/test-error', (req: Request, res: Response, next: NextFunction) => {
        next(new AppError('Test error message', 400));
      });
      app.use(errorHandler);

      const response = await request(app).get('/test-error');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Test error message');
      expect(response.body.error).toHaveProperty('status', 400);
      expect(response.body.error).toHaveProperty('timestamp');
    });

    it('should handle errors with status 500', async () => {
      app.get('/test-500', (req: Request, res: Response, next: NextFunction) => {
        next(new AppError('Internal server error', 500));
      });
      app.use(errorHandler);

      const response = await request(app).get('/test-500');

      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe('Internal server error');
    });

    it('should handle non-AppError instances', async () => {
      app.get('/test-generic', (req: Request, res: Response, next: NextFunction) => {
        next(new Error('Generic error'));
      });
      app.use(errorHandler);

      const response = await request(app).get('/test-generic');

      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe('Generic error');
    });

    it('should handle invalid JSON with 400 error', async () => {
      app.post('/test-json', (req: Request, res: Response) => {
        res.json({ received: req.body });
      });
      app.use(errorHandler);

      const response = await request(app)
        .post('/test-json')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  describe('404 Not Found Handler', () => {
    it('should return 404 for undefined routes', async () => {
      app.use(notFoundHandler);
      app.use(errorHandler);

      const response = await request(app).get('/nonexistent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Route not found');
      expect(response.body.error.status).toBe(404);
    });

    it('should include the requested path in error message', async () => {
      app.use(notFoundHandler);
      app.use(errorHandler);

      const response = await request(app).get('/some/unknown/path');

      expect(response.body.error.message).toContain('/some/unknown/path');
    });
  });
});
