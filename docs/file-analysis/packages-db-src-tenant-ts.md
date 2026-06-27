# tenant.ts — Deep Analysis (Hand-enriched)

## File Path

`packages/db/src/tenant.ts` (297 lines)

## Purpose

**Mongoose model for multi-tenant organizations** — the root isolation boundary in LuxGen. Every `User`, `Course`, `Automation`, etc. references a tenant by MongoDB `ObjectId`.

Stores:

- Identity: `name`, `subdomain`, optional custom `domain`
- Lifecycle: `status` (active | suspended | pending)
- Settings: branding, security, feature config, storefront, onboarding
- Metadata: `createdAt`, `lastActive`, `createdBy`

**Resolved by:** `tenantRoutingMiddleware` in API from subdomain/host header → attached to GraphQL context as `tenantId`.

## Exports

| Export | Kind |
|--------|------|
| `TenantBranding`, `TenantSecurity`, `TenantConfig`, `ITenant` | TypeScript interfaces |
| `Tenant` | Mongoose model |

## Design Pattern

**Document model with embedded configuration** — branding/security/config nested in `settings` rather than separate collections (read-heavy, update-as-whole).

---

## Schema highlights

### `subdomain` — Lines 107–114

```typescript
subdomain: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  match: [/^[a-z0-9-]+$/, ...],
}
```

- **Index:** line 292 `tenantSchema.index({ subdomain: 1 })`
- **Interview:** Why unique on subdomain? — URL routing key (`demo.localhost`)

### `status` — Lines 120–124

- `active` | `suspended` | `pending`
- Suspended tenants should fail closed in auth middleware

### Embedded `settings.branding` — Lines 126–149

- Hex color validation via regex on primary/secondary/accent
- Drives `TenantThemeBridge` + storefront theme

### Embedded `settings.security` — Lines 150–197

- `rateLimiting`, `sessionTimeout`, `passwordPolicy`, `corsOrigins`
- **Note:** Tenant-level policy vs global `@luxgen/config` — know which wins in middleware

### Embedded `settings.config.storefront` — Lines 249–268

- Public learn/store routes per tenant
- `Schema.Types.Mixed` for `content` and `theme` — flexible but weakly typed

---

## Model registration — Lines 295–296

```typescript
export const Tenant =
  (mongoose.models.Tenant as mongoose.Model<ITenant>) ||
  model<ITenant>('Tenant', tenantSchema);
```

### Why this pattern (senior must-know)

| Problem | Solution |
|---------|----------|
| Hot reload re-imports model | Reuse `mongoose.models.Tenant` |
| Stale `.js` + `.ts` double load | Delete compiled JS from `src/` |
| Next.js bundles `@luxgen/db` | `serverExternalPackages` + don't import in client |

**Error you fixed:** `OverwriteModelError: Cannot overwrite Tenant model once compiled`

---

## Indexes — Lines 291–294

| Index | Query pattern |
|-------|---------------|
| `{ subdomain: 1 }` | `Tenant.findOne({ subdomain })` — every request |
| `{ domain: 1 }` | Custom domain lookup |
| `{ status: 1 }` | Admin tenant lists, health checks |

**Interview:** Is `unique: true` on subdomain enough without explicit index?  
**Answer:** Mongoose creates unique index; explicit index documents intent for ops team.

---

## Embedding vs referencing

| Embedded in Tenant | Referenced by Tenant |
|--------------------|----------------------|
| branding, security defaults | Users (`tenantId`) |
| storefront routes | Courses, Automations |
| onboarding steps | Subscriptions |

**When to split:** If branding assets become large (S3 URLs only — already strings).

---

## Query examples (interview)

```javascript
// Resolve tenant on API request
await Tenant.findOne({ subdomain: 'demo', status: 'active' });

// Admin: list active tenants
await Tenant.find({ status: 'active' }).select('name subdomain').limit(100);
```

**Always filter `status`** for auth paths — don't authenticate against suspended tenant.

---

## Validation & bugs

| Risk | Mitigation |
|------|------------|
| Invalid hex color | Schema regex — fails save |
| Subdomain uppercase | `lowercase: true` |
| Mixed `content` shape | Validate at API layer with Zod |
| Cross-tenant leak | Never query Tenant without need; use `context.tenantId` on other models |

---

## JWT vs subdomain (critical interview topic)

| Field | Value | Use |
|-------|-------|-----|
| URL subdomain | `demo` | Routing, display |
| JWT `tenant` claim | Mongo ObjectId | **Authorization scope** |
| `SessionUser.tenant.id` | ObjectId | GraphQL variables |
| `SessionUser.tenant.subdomain` | `demo` | UI only |

**Never compare JWT tenant id to subdomain string.**

---

## Possible improvements

1. Extract `storefront` to subdocument schema with stricter types
2. TTL or job to update `metadata.lastActive`
3. Compound index `{ status: 1, subdomain: 1 }` if admin filters both
4. Move password policy defaults to `@luxgen/auth` single constant

## Interview questions

| Level | Question |
|-------|----------|
| Easy | What is multi-tenancy in this app? |
| Medium | Embed vs reference for tenant settings? |
| Hard | Migrate tenant config to Redis cache with invalidation |
| System | Shard tenants across Mongo clusters |

## Senior review

- **Enterprise:** Would add audit log on settings changes
- **Startup:** Current embedded config is correct for speed
- **Netflix:** Would version tenant config (`settingsVersion`) for optimistic concurrency

## Related

- [apps-api-src-app-ts.md](./apps-api-src-app-ts.md) — tenant middleware
- [apps-web-lib-session-ts.md](./apps-web-lib-session-ts.md) — `tenant.id` in session
- [interview-prep/06-mongodb.md](../interview-prep/06-mongodb.md)
- [interview-prep/08-system-design.md](../interview-prep/08-system-design.md)
