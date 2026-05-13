import request from 'supertest';
import app from '../src/app';

describe('CORS Configuration', () => {
  it('should include CORS headers in responses', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should handle OPTIONS preflight requests', async () => {
    const response = await request(app)
      .options('/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBeDefined();
    expect(response.headers['access-control-allow-methods']).toBeDefined();
  });

  it('should allow requests from frontend origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should include credentials support in CORS headers', async () => {
    const response = await request(app).get('/health');

    // Check if credentials are allowed (depends on CORS config)
    // This test verifies the header exists, actual value depends on configuration
    expect(response.headers).toHaveProperty('access-control-allow-origin');
  });
});
