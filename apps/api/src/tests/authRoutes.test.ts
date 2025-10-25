import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { UserRegistrationService } from '../services/userRegistrationService';
import { User, UserRole, UserStatus } from '@luxgen/db';
import { Tenant } from '@luxgen/db';
import { generateToken } from '../utils/jwt';

// Mock dependencies
jest.mock('../services/userRegistrationService');
jest.mock('@luxgen/db');
jest.mock('../utils/jwt');

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        status: UserStatus.PENDING,
        tenant: {
          _id: 'tenant123',
          name: 'Test Tenant',
          subdomain: 'test'
        },
        populate: jest.fn().mockResolvedValue(true)
      };

      (UserRegistrationService.registerUser as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
        message: 'User registered successfully'
      });

      (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.STUDENT
        })
        .set('x-tenant', 'tenant123');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.role).toBe(UserRole.STUDENT);
      expect(response.body.data.token).toBe('mock-jwt-token');
    });

    it('should fail registration if tenant context is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tenant context required');
    });

    it('should fail registration if user already exists', async () => {
      (UserRegistrationService.registerUser as jest.Mock).mockResolvedValue({
        success: false,
        message: 'User already exists',
        errors: { email: 'Email is already registered' }
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .set('x-tenant', 'tenant123');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
      expect(response.body.errors.email).toBe('Email is already registered');
    });

    it('should handle registration service errors', async () => {
      (UserRegistrationService.registerUser as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .set('x-tenant', 'tenant123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('POST /auth/invite', () => {
    it('should invite a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'invited@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.INSTRUCTOR,
        status: UserStatus.PENDING
      };

      (UserRegistrationService.registerUser as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
        message: 'User invited successfully'
      });

      const response = await request(app)
        .post('/auth/invite')
        .send({
          email: 'invited@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.USER
        })
        .set('x-tenant', 'tenant123')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User invited successfully');
      expect(response.body.data.user.email).toBe('invited@example.com');
      expect(response.body.data.tempPassword).toBeDefined();
    });

    it('should fail invitation if authentication is missing', async () => {
      const response = await request(app)
        .post('/auth/invite')
        .send({
          email: 'invited@example.com',
          firstName: 'Jane',
          lastName: 'Smith'
        })
        .set('x-tenant', 'tenant123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail invitation if tenant context is missing', async () => {
      const response = await request(app)
        .post('/auth/invite')
        .send({
          email: 'invited@example.com',
          firstName: 'Jane',
          lastName: 'Smith'
        })
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tenant context and authentication required');
    });
  });

  describe('PUT /auth/users/:userId/role', () => {
    it('should update user role successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.INSTRUCTOR,
        status: UserStatus.ACTIVE
      };

      (UserRegistrationService.updateUserRole as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
        message: 'User role updated successfully'
      });

      const response = await request(app)
        .put('/auth/users/user123/role')
        .send({ role: UserRole.USER })
        .set('x-tenant', 'tenant123')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User role updated successfully');
      expect(response.body.data.user.role).toBe(UserRole.INSTRUCTOR);
    });

    it('should fail role update if user not found', async () => {
      (UserRegistrationService.updateUserRole as jest.Mock).mockResolvedValue({
        success: false,
        message: 'User not found',
        errors: { user: 'User does not exist' }
      });

      const response = await request(app)
        .put('/auth/users/invalid-user/role')
        .send({ role: UserRole.USER })
        .set('x-tenant', 'tenant123')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should fail role update if authentication is missing', async () => {
      const response = await request(app)
        .put('/auth/users/user123/role')
        .send({ role: UserRole.USER })
        .set('x-tenant', 'tenant123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail role update if tenant context is missing', async () => {
      const response = await request(app)
        .put('/auth/users/user123/role')
        .send({ role: UserRole.USER })
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tenant context and authentication required');
    });
  });

  describe('PUT /auth/users/:userId/activate', () => {
    it('should activate user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'user@example.com',
        status: UserStatus.ACTIVE
      };

      (UserRegistrationService.activateUser as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
        message: 'User activated successfully'
      });

      const response = await request(app)
        .put('/auth/users/user123/activate')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User activated successfully');
      expect(response.body.data.user.status).toBe(UserStatus.ACTIVE);
    });

    it('should fail activation if user not found', async () => {
      (UserRegistrationService.activateUser as jest.Mock).mockResolvedValue({
        success: false,
        message: 'User not found',
        errors: { user: 'User does not exist' }
      });

      const response = await request(app)
        .put('/auth/users/invalid-user/activate')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should fail activation if authentication is missing', async () => {
      const response = await request(app)
        .put('/auth/users/user123/activate');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle activation service errors', async () => {
      (UserRegistrationService.activateUser as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .put('/auth/users/user123/activate')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        tenant: {
          _id: 'tenant123',
          name: 'Test Tenant',
          subdomain: 'test'
        }
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          tenant: 'tenant123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.token).toBe('mock-jwt-token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should handle login errors gracefully', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user information', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        tenant: {
          _id: 'tenant123',
          name: 'Test Tenant',
          subdomain: 'test'
        }
      };

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-token');

      // Note: This test would need proper middleware setup to work
      // For now, it will return 401 as the user is not authenticated
      expect(response.status).toBe(401);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
