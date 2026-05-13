import request from 'supertest';
import express from 'express';
import { logger, requestLogger } from '../src/middleware/logger';

describe('Logging Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(requestLogger);
    
    app.get('/test', (req, res) => {
      res.status(200).json({ message: 'test' });
    });
  });

  describe('Logger Instance', () => {
    it('should export a winston logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeInstanceOf(Function);
      expect(logger.error).toBeInstanceOf(Function);
      expect(logger.warn).toBeInstanceOf(Function);
    });

    it('should log info messages', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      logger.info('Test message');
      expect(infoSpy).toHaveBeenCalledWith('Test message');
      infoSpy.mockRestore();
    });

    it('should log error messages with metadata', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      logger.error('Error message', { code: 500 });
      expect(errorSpy).toHaveBeenCalledWith('Error message', { code: 500 });
      errorSpy.mockRestore();
    });
  });

  describe('Request Logger Middleware', () => {
    it('should log incoming requests', async () => {
      const infoSpy = jest.spyOn(logger, 'info');
      
      await request(app).get('/test');
      
      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
    });

    it('should not interfere with request/response cycle', async () => {
      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'test' });
    });

    it('should log response status and duration', async () => {
      const infoSpy = jest.spyOn(logger, 'info');
      
      await request(app).get('/test');
      
      // Should log both request and response (2 calls)
      expect(infoSpy).toHaveBeenCalledTimes(2);
      
      // Check that logs contain expected strings
      const allCalls = infoSpy.mock.calls.map(call => String(call[0]));
      const hasGetAndPath = allCalls.some(log => log.includes('GET') && log.includes('/test'));
      
      expect(hasGetAndPath).toBe(true);
      infoSpy.mockRestore();
    });
  });
});
