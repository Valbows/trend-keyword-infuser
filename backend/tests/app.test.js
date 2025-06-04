const request = require('supertest');
const app = require('../src/app'); // We will create this next

describe('App Health Check', () => {
  it('should return 200 OK and a health message from /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('message', 'Server is healthy');
  });
});
