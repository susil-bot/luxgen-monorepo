# Authentication API Documentation

## Base URL
```
http://localhost:4000/api/auth
```

## Endpoints

### 1. Login
**POST** `/login`

Authenticates a user and returns a JWT token.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenant": "optional-tenant-id"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "tenant": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Acme Corp",
        "subdomain": "acme"
      }
    },
    "expiresIn": "7d"
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email format is invalid",
    "password": "Password must be at least 6 characters"
  }
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": {
    "email": "Invalid email or password",
    "password": "Invalid email or password"
  }
}
```

### 2. Register
**POST** `/register`

Creates a new user account and returns a JWT token.

#### Request Body
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "tenant": "64f1a2b3c4d5e6f7g8h9i0j2",
  "role": "STUDENT"
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "STUDENT",
      "tenant": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Acme Corp",
        "subdomain": "acme"
      }
    },
    "expiresIn": "7d"
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email format is invalid",
    "password": "Password must be at least 6 characters",
    "firstName": "First name is required",
    "lastName": "Last name is required"
  }
}
```

**409 Conflict - User Already Exists**
```json
{
  "success": false,
  "message": "User already exists",
  "errors": {
    "email": "Email is already registered"
  }
}
```

### 3. Get Current User
**GET** `/me`

Returns the current authenticated user's information.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "tenant": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Acme Corp",
      "subdomain": "acme"
    }
  }
}
```

#### Error Responses

**401 Unauthorized - No Token**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found - User Not Found**
```json
{
  "success": false,
  "message": "User not found"
}
```

### 4. Logout
**POST** `/logout`

Logs out the current user (client-side token removal).

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Authentication Flow

1. **Login/Register**: User provides credentials
2. **Token Generation**: Server generates JWT token with user info
3. **Token Storage**: Client stores token (localStorage, sessionStorage, etc.)
4. **API Requests**: Client includes token in Authorization header
5. **Token Validation**: Server validates token on protected routes
6. **Logout**: Client removes token from storage

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Secure error messages without sensitive data
- **CORS Protection**: Configured for specific origins
- **Helmet Security**: Security headers for protection

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Validation Error |
| 401  | Unauthorized - Authentication Required |
| 404  | Not Found |
| 409  | Conflict - Resource Already Exists |
| 500  | Internal Server Error |
