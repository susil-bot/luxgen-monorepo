# 10 — Coding Problems

## React / JavaScript

### Easy

1. Reverse a string (`split/reverse/join`)
2. FizzBuzz
3. Sum array with `reduce`
4. Remove duplicates from array (Set)
5. Check palindrome

### Medium

1. Implement `debounce(fn, delay)`
2. Implement `deepClone` for plain objects
3. Flatten nested array one level
4. Group array of users by `role`
5. Parse query string `?a=1&b=2` to object

### Hard

1. Implement Promise.all from scratch
2. LRU cache with Map
3. Serialize/deserialize binary tree
4. Task scheduler with concurrency limit
5. Diff two objects (shallow) for form dirty state

## Node / API

### Easy

1. Express route returning JSON health
2. Middleware logging request duration
3. Validate email with regex

### Medium

1. JWT sign/verify with jsonwebtoken
2. Rate limiter in-memory Map per IP
3. Paginate Mongo results with cursor

### Hard

1. GraphQL DataLoader for User by id
2. Idempotent Stripe webhook handler
3. Multi-tenant query wrapper enforcing tenantId

## MongoDB

### Easy

1. Find all users with role ADMIN in a tenant
2. Create compound index `{ tenantId: 1, email: 1 }`

### Medium

1. Aggregation: count enrollments per course
2. Explain why `skip(10000)` is slow

### Hard

1. Design schema for audit log with TTL
2. Migration script adding field with default

## Expected complexity discipline

Always state **time** and **space** for medium/hard solutions.

Example: `debounce` — O(1) per call, O(1) space (one timer id).
