import request from 'supertest';
import { app } from '../app';

// Stub Mongoose models so tenantRoutingMiddleware and authMiddleware don't
// throw when Mongoose is not connected in the test environment.
// Returns query-like objects (with .lean() / .populate()) to match the real API.
jest.mock('@luxgen/db', () => {
  const queryStub = () => ({
    lean: jest.fn().mockResolvedValue(null),
    populate: jest.fn().mockResolvedValue(null),
    exec: jest.fn().mockResolvedValue(null),
  });
  return {
    Tenant: {
      findOne: jest.fn(queryStub),
      findById: jest.fn(queryStub),
      findByIdAndUpdate: jest.fn().mockResolvedValue(null),
    },
    User: {
      findOne: jest.fn(queryStub),
      findById: jest.fn(queryStub),
    },
    UserRole: { USER: 'user', ADMIN: 'admin', INSTRUCTOR: 'instructor' },
    UserStatus: { ACTIVE: 'active', PENDING: 'pending', SUSPENDED: 'suspended', INACTIVE: 'inactive' },
  };
});

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should return validation error for missing email', async () => {
      const response = await request(app).post('/api/auth/login').send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.email).toBeDefined();
    });

    it('should return validation error for missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: 'user@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.password).toBeDefined();
    });

    it('should return validation error for invalid email format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.email).toBeDefined();
    });

    it('should return validation error for short password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'user@example.com',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.password).toBeDefined();
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return validation error for missing required fields', async () => {
      const response = await request(app).post('/api/auth/register').send({ email: 'user@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.firstName).toBeDefined();
      expect(response.body.errors.lastName).toBeDefined();
      expect(response.body.errors.password).toBeDefined();
    });

    it('should return validation error for invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.email).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 for missing token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
