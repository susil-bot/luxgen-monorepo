# Per-Tenant JWT Signing Keys

This document describes the implementation of per-tenant JWT signing keys for enhanced security in multi-tenant applications.

## Overview

Each tenant has its own JWT signing key, providing:
- **Tenant Isolation**: Tokens from one tenant cannot be used in another
- **Key Rotation**: Individual tenant keys can be rotated without affecting others
- **Enhanced Security**: Compromise of one tenant's key doesn't affect others
- **Audit Trail**: Key usage can be tracked per tenant

## Architecture

### Key Management
```typescript
// Key store structure
const keyStore = {
  'tenantA': process.env.TENANT_A_KEY,
  'tenantB': process.env.TENANT_B_KEY,
  'default': process.env.JWT_SECRET  // Fallback key
}
```

### JWT Header with Key ID
```typescript
// JWT header includes key ID (kid)
{
  "alg": "HS256",
  "typ": "JWT", 
  "kid": "tenantA"  // Key ID for tenant identification
}
```

### Token Generation
```typescript
// Generate token with tenant-specific key
const token = generateToken(payload, tenantId);
```

### Token Verification
```typescript
// Verify token using tenant-specific key
const decoded = verifyToken(token);
// Automatically uses the correct key based on 'kid' in header
```

## Environment Variables

### Required Environment Variables
```bash
# Default fallback key
JWT_SECRET=your-default-jwt-secret

# Tenant-specific keys (pattern: TENANT_<TENANT_ID>_KEY)
TENANT_ACME_KEY=acme-tenant-specific-secret-key-here
TENANT_CORP_KEY=corp-tenant-specific-secret-key-here
TENANT_EDU_KEY=edu-tenant-specific-secret-key-here

# JWT expiration
JWT_EXPIRES_IN=7d
```

### Key Naming Convention
- **Pattern**: `TENANT_<TENANT_ID>_KEY`
- **Example**: `TENANT_ACME_KEY` for tenant with ID "acme"
- **Case**: Tenant IDs are converted to uppercase in environment variable names

## API Endpoints

### Authentication Endpoints
All existing auth endpoints now use tenant-specific keys:

- `POST /api/auth/login` - Uses tenant key from user's tenant
- `POST /api/auth/register` - Uses tenant key from registration tenant
- `GET /api/auth/me` - Validates token with tenant-specific key

### Admin Endpoints (Admin Only)

#### Get All Tenant Keys
```http
GET /api/admin/tenants/keys
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "tenantId": "acme",
        "hasKey": true,
        "keyExists": true
      }
    ],
    "totalTenants": 1
  }
}
```

#### Get Specific Tenant Key Info
```http
GET /api/admin/tenants/{tenantId}/keys
Authorization: Bearer <admin-token>
```

#### Generate New Key
```http
POST /api/admin/tenants/{tenantId}/keys/generate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "length": 64
}
```

#### Rotate Tenant Key
```http
POST /api/admin/tenants/{tenantId}/keys/rotate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "newKey": "new-secret-key-here"
}
```

#### Revoke All Keys (Emergency)
```http
DELETE /api/admin/tenants/{tenantId}/keys
Authorization: Bearer <admin-token>
```

#### Reload Keys from Environment
```http
POST /api/admin/keys/reload
Authorization: Bearer <admin-token>
```

## Implementation Details

### Key Manager (`tenantKeys.ts`)
```typescript
export class TenantKeyManager {
  // Load keys from environment variables
  private loadTenantKeys(): TenantKeyStore
  
  // Get tenant-specific key
  getTenantKey(tenantId: string): string
  
  // Get key as buffer for JWT operations
  getTenantKeyBuffer(tenantId: string): Uint8Array
  
  // Add/remove keys dynamically
  addTenantKey(tenantId: string, key: string): void
  removeTenantKey(tenantId: string): void
}
```

### JWT Utilities (`jwt.ts`)
```typescript
// Generate token with tenant key
export const generateToken = (payload: JwtPayload, tenantId?: string): string

// Verify token using key from header
export const verifyToken = (token: string): JwtPayload | null

// Get tenant ID from token header
export const getTenantFromToken = (token: string): string | null

// Verify with specific tenant key
export const verifyTokenWithTenant = (token: string, tenantId: string): JwtPayload | null
```

### Key Rotation (`keyRotation.ts`)
```typescript
// Rotate keys for a tenant
export const rotateTenantKey = (tenantId: string, newKey: string): KeyRotationResult

// Generate new random key
export const generateNewTenantKey = (length: number): string

// Validate key strength
export const validateTenantKey = (key: string): boolean

// Revoke all keys for a tenant
export const revokeTenantKeys = (tenantId: string): KeyRotationResult
```

## Security Features

### 1. Key Isolation
- Each tenant has a unique signing key
- Tokens cannot be cross-validated between tenants
- Compromise of one key doesn't affect others

### 2. Key Rotation
- Keys can be rotated per tenant
- Old keys are kept for grace period during rotation
- New keys are immediately active

### 3. Key Validation
- Minimum key length requirements (32+ characters)
- Key strength validation
- Secure key generation

### 4. Audit Trail
- Key usage can be tracked per tenant
- Key rotation events are logged
- Admin actions are authenticated

## Usage Examples

### Basic Token Generation
```typescript
// Login with tenant-specific key
const token = generateToken({
  id: user._id.toString(),
  email: user.email,
  tenant: user.tenant._id.toString(),
  role: user.role,
}, user.tenant._id.toString());
```

### Token Verification
```typescript
// Automatic key selection based on token header
const decoded = verifyToken(token);
if (decoded) {
  // Token is valid and decoded
  console.log('User:', decoded.email);
  console.log('Tenant:', decoded.tenant);
}
```

### Key Management
```typescript
// Add new tenant key
tenantKeyManager.addTenantKey('newTenant', 'new-secret-key');

// Rotate existing key
const result = await rotateTenantKey('tenantA', 'new-rotated-key');

// Generate secure key
const newKey = generateNewTenantKey(64);
```

## Migration Guide

### From Single Key to Per-Tenant Keys

1. **Set up environment variables**:
   ```bash
   # Add tenant-specific keys
   TENANT_ACME_KEY=acme-secret-key
   TENANT_CORP_KEY=corp-secret-key
   ```

2. **Update token generation**:
   ```typescript
   // Old way
   const token = generateToken(payload);
   
   // New way
   const token = generateToken(payload, tenantId);
   ```

3. **Update token verification**:
   ```typescript
   // Old way
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
   // New way (automatic key selection)
   const decoded = verifyToken(token);
   ```

## Testing

### Test Token Generation
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@acme.com",
    "password": "password123"
  }'
```

### Test Admin Key Management
```bash
# Get all tenant keys
curl -X GET http://localhost:4000/api/admin/tenants/keys \
  -H "Authorization: Bearer <admin-token>"

# Generate new key for tenant
curl -X POST http://localhost:4000/api/admin/tenants/acme/keys/generate \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"length": 64}'
```

## Best Practices

1. **Key Security**:
   - Use strong, randomly generated keys (64+ characters)
   - Store keys securely in environment variables
   - Rotate keys regularly

2. **Key Rotation**:
   - Plan key rotation during low-traffic periods
   - Keep old keys for grace period (24-48 hours)
   - Monitor for failed token validations

3. **Monitoring**:
   - Log key rotation events
   - Monitor token validation failures
   - Track key usage per tenant

4. **Backup**:
   - Keep secure backups of all tenant keys
   - Document key rotation procedures
   - Test key recovery procedures

## Troubleshooting

### Common Issues

1. **"No signing key found for tenant"**
   - Check environment variable naming: `TENANT_<TENANT_ID>_KEY`
   - Verify tenant ID matches environment variable
   - Check for typos in tenant ID

2. **Token validation fails after key rotation**
   - Ensure grace period for old keys
   - Check that new key is properly loaded
   - Verify token header contains correct `kid`

3. **Cross-tenant token usage**
   - Verify tenant isolation is working
   - Check that tokens include correct `kid` in header
   - Ensure middleware validates tenant matching

### Debug Commands

```typescript
// Check available tenants
console.log(tenantKeyManager.getAvailableTenants());

// Check if tenant has key
console.log(tenantKeyManager.hasTenantKey('tenantId'));

// Get tenant from token
console.log(getTenantFromToken(token));

// Test token with specific tenant
console.log(verifyTokenWithTenant(token, 'tenantId'));
```
