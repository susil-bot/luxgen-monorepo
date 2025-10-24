# 🚀 LuxGen Monorepo - Developer Knowledge Base

## 📋 Table of Contents
- [Quick Start Commands](#quick-start-commands)
- [Docker Development](#docker-development)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [GraphQL Development](#graphql-development)
- [Authentication & Security](#authentication--security)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Import Statements](#import-statements)
- [Environment Variables](#environment-variables)
- [Git Workflow](#git-workflow)

---

## 🚀 Quick Start Commands

### **Start Development Environment**
```bash
# Start all services
make dev
# OR
./scripts/dev.sh start

# Start with rebuild
make dev-build
# OR
./scripts/dev.sh build

# Start specific services
npm run dev:api      # API only
npm run dev:web      # Web only
npm run dev:docker   # Docker services
```

### **Stop Development Environment**
```bash
# Stop all services
make stop
# OR
./scripts/dev.sh stop

# Stop and clean volumes
make clean
# OR
./scripts/dev.sh clean
```

### **Check Status**
```bash
# Check all services
make status
# OR
./scripts/dev.sh status

# View logs
make logs
# OR
./scripts/dev.sh logs
```

---

## 🐳 Docker Development

### **Docker Compose Commands**
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Start with rebuild
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs

# View specific service logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs api
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs web
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs mongodb
```

### **Docker Service Management**
```bash
# Restart specific service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart api

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --scale api=2

# Execute commands in running containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec api bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh
```

### **Docker Troubleshooting**
```bash
# Clean up Docker resources
docker system prune -f
docker volume prune -f
docker network prune -f

# Remove all containers and images
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --rmi all

# Check container health
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# View container logs
docker logs luxgen-api
docker logs luxgen-web
docker logs luxgen-mongodb
```

---

## 🗄️ Database Management

### **✅ Verified MongoDB Credentials**
- **Username**: `admin`
- **Password**: `password123`
- **Authentication Database**: `admin`
- **Application Database**: `luxgen_dev`

### **🔍 Credential Verification**
```bash
# Test MongoDB connection
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Expected output: { ok: 1 }

# Test database access
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin luxgen_dev --eval "show collections"

# Expected output: courses, tenants, users
```

### **MongoDB Commands**
```bash
# Connect to MongoDB shell
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Switch to application database
use luxgen_dev

# View all databases
show dbs

# View collections
show collections

# Count documents
db.users.countDocuments()
db.tenants.countDocuments()
db.courses.countDocuments()

# Find documents
db.users.find()
db.users.findOne({email: "test@example.com"})

# Insert test data
db.users.insertOne({
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "user"
})

# Update documents
db.users.updateOne(
  {email: "test@example.com"},
  {$set: {firstName: "Updated"}}
)

# Delete documents
db.users.deleteOne({email: "test@example.com"})
```

### **Database Admin Interfaces**
```bash
# Mongo Express (MongoDB Web Interface)
# URL: http://localhost:8081
# Username: admin
# Password: admin123

# Redis Commander (Redis Web Interface)
# URL: http://localhost:8082
```

### **Database Backup & Restore**
```bash
# Backup database
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongodump -u admin -p password123 --authenticationDatabase admin --db luxgen_dev --out /backup

# Restore database
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongorestore -u admin -p password123 --authenticationDatabase admin --db luxgen_dev /backup/luxgen_dev
```

---

## 🔧 API Development

### **API Server Commands**
```bash
# Start API server
npm run dev:api

# Start API with debugging
npm run dev:api -- --inspect

# Build API
npm run build --filter=@luxgen/api

# Test API
npm run test --filter=@luxgen/api
```

### **API Testing with cURL**
```bash
# Health check
curl http://localhost:4000/health

# Authentication endpoints
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "tenant-123"
  }'

# Get current user
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Admin endpoints
curl -X GET http://localhost:4000/api/admin/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **GraphQL Testing**
```bash
# GraphQL Playground
# URL: http://localhost:4000/graphql

# GraphQL with cURL
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { users { id email firstName lastName } }"
  }'

# GraphQL Login Mutation
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { token user { id email } } }",
    "variables": {
      "input": {
        "email": "test@example.com",
        "password": "password123"
      }
    }
  }'
```

---

## 🎨 Frontend Development

### **Web Application Commands**
```bash
# Start web server
npm run dev:web

# Build web application
npm run build --filter=@luxgen/web

# Start web with debugging
npm run dev:web -- --inspect

# Test web application
npm run test --filter=@luxgen/web
```

### **Frontend Testing**
```bash
# Test GraphQL connection
# URL: http://localhost:3000/graphql-test

# Test authentication
# URL: http://localhost:3000/login
# URL: http://localhost:3000/register
```

---

## 🔗 GraphQL Development

### **GraphQL Queries & Mutations**
```graphql
# User Queries
query GetUsers {
  users {
    id
    email
    firstName
    lastName
    role
    tenant {
      id
      name
    }
  }
}

query GetCurrentUser {
  currentUser {
    id
    email
    firstName
    lastName
    role
    tenant {
      id
      name
    }
  }
}

# Authentication Mutations
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      role
      tenant {
        id
        name
      }
    }
  }
}

mutation Register($input: CreateUserInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      role
      tenant {
        id
        name
      }
    }
  }
}

# Tenant Queries
query GetTenants {
  tenants {
    id
    name
    domain
    settings
  }
}
```

### **GraphQL Testing Tools**
```bash
# GraphQL Playground
# URL: http://localhost:4000/graphql

# Apollo Studio (if configured)
# URL: https://studio.apollographql.com

# GraphQL introspection
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query IntrospectionQuery { __schema { types { name } } }"}'
```

---

## 🔐 Authentication & Security

### **JWT Token Management**
```bash
# Generate tenant keys
curl -X POST http://localhost:4000/api/admin/keys/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "tenant-123"}'

# List tenant keys
curl -X GET http://localhost:4000/api/admin/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Rotate tenant keys
curl -X POST http://localhost:4000/api/admin/keys/rotate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "tenant-123"}'
```

### **Authentication Testing**
```bash
# Test JWT token
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test tenant-specific authentication
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tenant1.com",
    "password": "password123"
  }'
```

---

## 🧪 Testing

### **API Testing**
```bash
# Run all tests
npm run test

# Run API tests
npm run test --filter=@luxgen/api

# Run tests with coverage
npm run test --filter=@luxgen/api -- --coverage

# Run tests in watch mode
npm run test:watch --filter=@luxgen/api

# Run specific test file
npm run test --filter=@luxgen/api -- src/tests/auth.test.ts
```

### **Test Database Setup**
```bash
# Create test database
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "use luxgen_test"

# Seed test data
npm run test:seed --filter=@luxgen/api
```

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3000
lsof -i :4000
lsof -i :27017

# Kill process
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:4000)
kill -9 $(lsof -t -i:27017)
```

#### **Docker Issues**
```bash
# Reset Docker environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker system prune -f
docker volume prune -f

# Rebuild from scratch
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build --force-recreate
```

#### **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs mongodb

# Restart MongoDB
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart mongodb
```

#### **MongoDB Compass Authentication Issues**
```bash
# Verify credentials are correct
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Test connection string format
# Use this exact connection string in MongoDB Compass:
# mongodb://admin:password123@localhost:27017/luxgen_dev?authSource=admin

# Alternative: Use Mongo Express web interface
# URL: http://localhost:8081
# Username: admin
# Password: admin123
```

#### **API Server Issues**
```bash
# Check API logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs api

# Restart API service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart api

# Check API health
curl http://localhost:4000/health
```

#### **Web Application Issues**
```bash
# Check web logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs web

# Restart web service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart web

# Check web health
curl http://localhost:3000/api/health
```

#### **GraphQL Issues**
```bash
# Check GraphQL schema
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query IntrospectionQuery { __schema { types { name } } }"}'

# Test GraphQL connection
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'
```

#### **Memory Issues**
```bash
# Check Docker memory usage
docker stats

# Clean up Docker resources
docker system prune -f
docker volume prune -f
docker network prune -f
```

---

## 📦 Import Statements

### **Backend (API) Imports**
```typescript
// Express & Server
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';

// Database
import { connectDB } from '@luxgen/db';
import { User, Tenant, Course } from '@luxgen/db';

// Authentication
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

// GraphQL
import { typeDefs } from './schema';
import { resolvers } from './schema';
import { context } from './context';

// Utilities
import { validateLogin, validateRegister } from '../middleware/validation';
import { getTenantKeys, rotateTenantKey } from '../utils/tenantKeys';
```

### **Frontend (Web) Imports**
```typescript
// React & Next.js
import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Apollo Client
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { gql } from '@apollo/client';

// GraphQL Queries
import { LOGIN_MUTATION, REGISTER_MUTATION, CURRENT_USER_QUERY } from '../graphql/queries/auth';

// Hooks
import { useAuth } from '../lib/useAuth';
import { useQuery, useMutation } from '@apollo/client';

// UI Components
import { Button } from '@luxgen/ui';
import { TextField } from '@luxgen/ui';
import { Card } from '@luxgen/ui';
```

### **Database Models**
```typescript
// User Model
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  tenant: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Tenant Model
export interface ITenant extends Document {
  name: string;
  domain: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### **GraphQL Schema**
```typescript
// Type Definitions
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    tenant: Tenant!
    createdAt: Date!
    updatedAt: Date!
  }

  type Tenant {
    id: ID!
    name: String!
    domain: String!
    settings: JSON
    createdAt: Date!
    updatedAt: Date!
  }
`;
```

---

## 🌍 Environment Variables

### **Required Environment Variables**
```bash
# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/luxgen_dev?authSource=admin
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Apollo
APOLLO_INTROSPECTION=true

# Tenant Keys (for per-tenant JWT signing)
TENANT_DEFAULT_KEY=your-default-tenant-key
TENANT_TENANT1_KEY=your-tenant1-specific-key
TENANT_TENANT2_KEY=your-tenant2-specific-key
```

### **Development Environment Variables**
```bash
# API
NODE_ENV=development
PORT=4000
DEBUG=api:*

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

---

## 🔄 Git Workflow

### **Branch Management**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/your-bug-description

# Create hotfix branch
git checkout -b hotfix/your-hotfix-description
```

### **Commit Messages**
```bash
# Feature commits
git commit -m "feat: Add user authentication system"
git commit -m "feat: Implement GraphQL login mutations"

# Bug fixes
git commit -m "fix: Resolve MongoDB connection timeout"
git commit -m "fix: Fix JWT token validation"

# Documentation
git commit -m "docs: Add comprehensive developer knowledge base"
git commit -m "docs: Update API documentation"

# Refactoring
git commit -m "refactor: Optimize database queries"
git commit -m "refactor: Improve error handling"

# Testing
git commit -m "test: Add authentication unit tests"
git commit -m "test: Add GraphQL integration tests"
```

### **Pull Request Workflow**
```bash
# Push feature branch
git push origin feature/your-feature-name

# Create pull request
# - Use descriptive title
# - Add detailed description
# - Link related issues
# - Request code review
```

---

## 🚀 Performance Optimization

### **Database Optimization**
```bash
# Create indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ tenant: 1 })
db.tenants.createIndex({ domain: 1 })

# Analyze query performance
db.users.explain("executionStats").find({ email: "test@example.com" })
```

### **Docker Optimization**
```bash
# Use multi-stage builds
# Optimize layer caching
# Use .dockerignore
# Minimize image size
```

### **API Optimization**
```bash
# Enable compression
# Use connection pooling
# Implement caching
# Add rate limiting
```

---

## 📊 Monitoring & Debugging

### **Logging**
```bash
# View all logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs

# View specific service logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs api
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs web
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs mongodb

# Follow logs in real-time
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f api
```

### **Health Checks**
```bash
# API health
curl http://localhost:4000/health

# Web health
curl http://localhost:3000/api/health

# Database health
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### **Debugging**
```bash
# Enable debug mode
DEBUG=api:* npm run dev:api

# Use Node.js inspector
npm run dev:api -- --inspect

# Connect debugger
# Chrome: chrome://inspect
# VS Code: Attach to Node process
```

---

## 🎯 Quick Reference

### **Most Used Commands**
```bash
# Start development
make dev

# Check status
make status

# View logs
make logs

# Stop everything
make stop

# Clean restart
make clean
```

### **Emergency Commands**
```bash
# Nuclear option - reset everything
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker system prune -f
docker volume prune -f
make dev-build
```

### **Useful URLs**
- **Web App**: http://localhost:3000
- **API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Mongo Express**: http://localhost:8081
- **Redis Commander**: http://localhost:8082
- **GraphQL Test Page**: http://localhost:3000/graphql-test

---

## 📚 Additional Resources

### **Documentation**
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Next.js Documentation](https://nextjs.org/docs)
- [GraphQL Documentation](https://graphql.org/learn/)

### **Tools**
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [GraphQL Playground](https://github.com/graphql/graphql-playground)

---

**🎉 Happy Coding! This knowledge base should cover all your development needs!**
