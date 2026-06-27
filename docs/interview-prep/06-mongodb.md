# 06 — MongoDB & Mongoose (packages/db)

## Connection

- `packages/db/src/connection.ts` — `connectDB()`
- Used by API bootstrap and Next API routes via `ensure-db.ts`

## Tenant model (`tenant.ts`)

### Schema highlights

- `subdomain` (unique), `domain`, `status`
- Nested: `branding`, `settings`, `storefront`, `metadata`
- **Indexes:** `subdomain`, `domain`, `status`

### Model registration (senior fix)

```typescript
export const Tenant =
  (mongoose.models.Tenant as mongoose.Model<ITenant>) ||
  model<ITenant>('Tenant', tenantSchema);
```

**Interview:** Explain `OverwriteModelError` when hot reload or duplicate `.js`/`.ts` loads the same model twice.

## User model (`user.ts`)

```typescript
export enum UserRole {
  SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, USER // legacy alias
}
```

- Multi-tenant: users belong to `tenantId`
- Permissions subdocument for fine-grained flags

## Embedding vs referencing

| Pattern | Example |
|---------|---------|
| **Reference** | User → tenantId ObjectId |
| **Embed** | Tenant.branding colors, logos |
| **Reference** | Enrollment → userId + courseId |

## Queries you'll discuss

### Tenant-scoped list

```javascript
Course.find({ tenantId }).sort({ createdAt: -1 }).limit(20)
```

### Compound index need

```javascript
{ tenantId: 1, email: 1 } // unique per tenant
```

## Aggregation (interview)

- Dashboard stats — likely `$match` by tenant + `$group`
- Analytics engagement — time-bucket `$group` on `createdAt`

## N+1 problem

- **Bad:** Load courses, then for each course query enrollments in resolver
- **Good:** DataLoader pattern or single aggregation / `orderRows`-style pre-joined API

## Transactions

- Use when: billing + enrollment + inventory must succeed or fail together
- Mongo 4+ multi-doc transactions require replica set

## Pagination strategies

| Strategy | When |
|----------|------|
| `skip/limit` | Small collections |
| Cursor (`_id > lastId`) | Large feeds |
| Keyset | Sorted stable pagination |

## TTL indexes

- Session tokens if stored in Mongo (this repo uses JWT client-side + optional signing keys collection)

## Performance checklist

1. Every query includes `tenantId` for tenant data
2. `explain("executionStats")` on slow queries
3. Avoid unbounded `find()` without limit
4. Project only needed fields in aggregations

## Models to skim before interview

`Tenant`, `User`, `Course`, `Enrollment`, `Automation`, `TenantSubscription`, `BusinessListing`

Per-file: [file-analysis INDEX](../file-analysis/INDEX.md) — filter `packages/db`
