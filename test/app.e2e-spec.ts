import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { TestHelper, createTestApp } from '@test/helpers/test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let helper: TestHelper;

  beforeAll(async () => {
    const testApp = await createTestApp(AppModule);
    app = testApp.app;
    helper = testApp.helper;
  });

  afterAll(async () => {
    await helper.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await helper.cleanDatabase();
  });

  describe('/ (GET)', () => {
    it('should return Hello World', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Hello World!');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/');
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.services).toBeDefined();
      expect(response.body.data.services.database).toBeDefined();
    });
  });

  describe('/stats (GET)', () => {
    it('should return database statistics', async () => {
      // Create some test data
      await helper.createTestUser();
      await helper.createTestVault();

      const response = await request(app.getHttpServer())
        .get('/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tables).toBeDefined();
      expect(response.body.data.connections).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/non-existent-endpoint');
    });

    it('should handle validation errors', async () => {
      // This will be useful when we have endpoints that require validation
      const response = await request(app.getHttpServer())
        .post('/api/vaults')
        .send({
          invalidData: 'test',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array.from({ length: 105 }, () =>
        request(app.getHttpServer()).get('/'),
      );

      const responses = await Promise.all(requests);
      
      // Check that some requests were rate limited
      const rateLimitedResponses = responses.filter(
        (response) => response.status === 429,
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout for this test
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app.getHttpServer())
        .options('/')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
