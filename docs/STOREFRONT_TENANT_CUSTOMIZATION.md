# Storefront landing — per-tenant content, style & slug

> **Audience:** Architects, full-stack developers extending the public trainer/mentor landing.  
> **Related:** [TENANT_LAYER_SUPERADMIN.md](./TENANT_LAYER_SUPERADMIN.md), `apps/api/src/config/tenants/*`, `apps/web/lib/storefront-profile.ts`

---

## 1. Current state (before this design)

| Concern                        | Supported today?   | Where                                                                       |
| ------------------------------ | ------------------ | --------------------------------------------------------------------------- |
| **Enable/disable landing**     | Yes                | `settings.config.storefront.landingEnabled`                                 |
| **Nav route paths**            | Yes                | `settings.config.storefront.routes.*` (Settings → Storefront)               |
| **Accent color (partial)**     | Partial            | `settings.branding` → `applyLearnTenantTheme` (accent only)                 |
| **Logo / favicon**             | Partial            | `settings.branding` exists; landing uses text logo from tenant name         |
| **Landing URL slug**           | Partial            | Full path via `routes.landing` (e.g. `/store/mentors`); no first-class slug |
| **Hero copy, section titles**  | No                 | Hardcoded in `StorefrontLanding.tsx`                                        |
| **Categories, testimonials**   | No                 | Hardcoded in `storefront-landing-data.ts`                                   |
| **Landing-specific theme**     | No                 | `StorefrontLanding.module.css` uses fixed `--sf-accent: #28b485`            |
| **Static tenant preset files** | Exists but unwired | `apps/api/src/config/tenants/*/brand-identity` (messaging, assets)          |

**Conclusion:** The platform has **multi-tenant routing and branding primitives**, but the landing page is still a **single LuxGen template** with dynamic course/product data only. Brand-identity files are used at tenant bootstrap, not merged at runtime for the storefront.

---

## 2. Target architecture — layered profile resolution

Each tenant gets a **Storefront Profile** resolved at render time:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4 — Runtime branding (Mongo settings.branding)       │
│  logo, primaryColor, accentColor, fontFamily                │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Tenant DB overrides (settings.config.storefront) │
│  slug, content.*, theme.*, routes.*                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Static tenant preset (code, per subdomain)       │
│  apps/web/lib/tenant-storefront-presets/{subdomain}.ts      │
│  apps/api/src/config/tenants/{subdomain}/storefront/        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Platform defaults                                │
│  apps/web/lib/storefront-profile.ts (DEFAULT_STOREFRONT_*)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              resolveStorefrontProfile(subdomain, settings)
                              │
                              ▼
              StorefrontLanding (content + CSS variables)
```

Later layers override earlier ones. String fields support `{{tenantName}}` interpolation.

### 2.1 Slug vs route

| Field            | Example    | Resolves to                 |
| ---------------- | ---------- | --------------------------- |
| `slug`           | `mentors`  | `/store/mentors`            |
| `slug`           | `coaching` | `/store/coaching`           |
| `routes.landing` | `/academy` | Exact path (wins over slug) |

**Rule:** If `routes.landing` is explicitly stored in Mongo, it wins. Otherwise `landing = /store/{slug}`.

### 2.2 Content model

```typescript
storefront.content = {
  hero: { headline, subheadline, searchPlaceholder, ratingBadge },
  sections: { programs, categories, mentors, community, testimonials, cta },
  nav: [{ label, href }],
  categories: [{ id, label }],
  testimonials: [{ id, quote, name, role }],
  stats: { trainers, programs, learners, community },
  cta: { title, lead, buttonLabel },
  footer: { tagline, contactEmail, newsletter },
};
```

### 2.3 Theme model

```typescript
storefront.theme = {
  accentColor?,      // overrides CSS --sf-accent
  warmAccentColor?,  // --sf-warm (secondary highlight)
  heroImage?,        // optional hero background
  layout?: 'classic' | 'split',  // future layout variants
}
```

Branding from `settings.branding` fills gaps when theme fields are omitted.

### 2.4 Static preset files (tenant defaults)

Mirrors existing brand-identity pattern:

```
apps/api/src/config/tenants/
  demo/
    brand-identity/index.ts   # existing
    storefront/index.ts     # NEW — seed defaults for demo
  idea-vibes/
    storefront/index.ts     # NEW — creative positioning

apps/web/lib/tenant-storefront-presets/
  demo.ts
  idea-vibes.ts
  index.ts                  # TENANT_STOREFRONT_PRESETS registry
```

On **tenant initialize**, API merges `storefront` preset into Mongo. On **page render**, web resolver merges preset + DB again (DB wins).

---

## 3. API surface

`PATCH /api/tenant/storefront` accepts:

| Field            | Type           | Notes                                                          |
| ---------------- | -------------- | -------------------------------------------------------------- |
| `landingEnabled` | boolean        |                                                                |
| `slug`           | string         | `[a-z0-9-]+`, sets landing path when routes.landing not custom |
| `routes`         | object         | Existing nav paths                                             |
| `content`        | partial object | Hero, sections, categories, testimonials                       |
| `theme`          | partial object | Landing-specific colors/assets                                 |

Validation lives in `apps/api/src/middleware/validation.ts` → `validateStorefrontPatchBody`.

---

## 4. Settings UI (phased)

| Phase           | Scope                                               |
| --------------- | --------------------------------------------------- |
| **A (this PR)** | Slug, hero headline/subheadline, preview link       |
| **B**           | Full content editor, theme picker, testimonial CRUD |
| **C**           | WYSIWYG preview, layout template selector           |

---

## 5. Implementation map

| File                                                   | Role                                          |
| ------------------------------------------------------ | --------------------------------------------- |
| `apps/web/lib/storefront-profile.ts`                   | Types, defaults, `resolveStorefrontProfile()` |
| `apps/web/lib/tenant-storefront-presets/*`             | Per-subdomain static content                  |
| `apps/web/lib/storefront-settings.ts`                  | Routes + slug resolution                      |
| `apps/web/components/storefront/StorefrontLanding.tsx` | Consumes profile                              |
| `packages/db/src/tenant.ts`                            | Schema extension                              |
| `apps/api/src/middleware/validation.ts`                | PATCH validation                              |
| `apps/api/src/config/tenants/*/storefront/`            | Bootstrap presets                             |
| `scripts/init-mongo.js`                                | Demo seed                                     |

---

## 6. Future extensions

- **GraphQL** `storefrontProfile(tenantId)` for mobile / headless consumers
- **CMS blocks** — store section order and visibility in DB
- **A/B variants** — `content.variant` keyed by experiment
- **i18n** — `content.locales.en`, `content.locales.es`
- **Custom domains** — slug independent of subdomain when `customDomain` set
