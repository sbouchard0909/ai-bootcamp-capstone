import { describe, it, expect, beforeEach } from 'vitest';
import { api, setAuthToken, clearAuthToken } from '../src/services/api';

describe('API Service', () => {
  beforeEach(() => {
    // Clear auth token before each test
    clearAuthToken();
  });

  describe('API Instance', () => {
    it('should be configured with base URL', () => {
      expect(api.defaults.baseURL).toBeDefined();
      expect(typeof api.defaults.baseURL).toBe('string');
    });

    it('should have timeout configured', () => {
      expect(api.defaults.timeout).toBe(10000);
    });

    it('should have headers configured', () => {
      expect(api.defaults.headers).toBeDefined();
    });
  });

  describe('setAuthToken', () => {
    it('should set authorization header when token provided', () => {
      const token = 'test-token-123';
      setAuthToken(token);
      
      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should remove auth header when empty token provided', () => {
      // First set a token
      setAuthToken('test-token');
      expect(api.defaults.headers.common['Authorization']).toBeDefined();
      
      // Then set empty token
      setAuthToken('');
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('clearAuthToken', () => {
    it('should remove authorization header', () => {
      // First set a token
      setAuthToken('test-token');
      expect(api.defaults.headers.common['Authorization']).toBeDefined();
      
      // Then clear it
      clearAuthToken();
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should be safe to call when no token is set', () => {
      expect(() => clearAuthToken()).not.toThrow();
    });
  });

  describe('Interceptors', () => {
    it('should have request interceptor configured', () => {
      expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
    });

    it('should have response interceptor configured', () => {
      expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });
});
