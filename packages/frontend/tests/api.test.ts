import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, setAuthToken, clearAuthToken, setUnauthorizedHandler } from '../src/services/api';

describe('API Service', () => {
  beforeEach(() => {
    clearAuthToken();
    setUnauthorizedHandler(() => undefined);
    vi.clearAllMocks();
  });

  it('creates API instance with base URL and timeout', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.timeout).toBe(10000);
  });

  it('sets and clears auth token header', () => {
    setAuthToken('test-token');
    expect(api.defaults.headers.common.Authorization).toBe('Bearer test-token');

    clearAuthToken();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
  });

  it('has request and response interceptors configured', () => {
    expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  it('triggers unauthorized handler on 401 responses', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    const interceptor = api.interceptors.response.handlers[0];
    if (!interceptor || typeof interceptor.rejected !== 'function') {
      throw new Error('response interceptor missing');
    }

    const mockError = {
      response: { status: 401, data: { error: { message: 'unauthorized' } } },
      message: 'Request failed',
    };

    await expect(interceptor.rejected(mockError)).rejects.toBeDefined();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
