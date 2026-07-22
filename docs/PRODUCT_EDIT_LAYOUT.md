# Product Edit Layout — Shopify Admin → LuxGen

> Reference: [Shopify Admin — Edit product](https://help.shopify.com/en/manual/products/details/product-details-page)  
> LuxGen route: **`/products/[id]/edit`** · Data model: **`Course`**

This document maps every Shopify product-edit section to LuxGen components, APIs, and implementation status.

---

## Layout anatomy (matches Shopify)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ProductEditHeader — title breadcrumb · status badge · Duplicate · More ▾   │
├──────────────────────────────────────────────┬──────────────────────────────┤
│ MAIN COLUMN (~65%)                           │ SIDEBAR (~35%, sticky)       │
│                                              │                              │
│ ┌ TitleDescriptionSection ────────────────┐ │ ┌ StatusSection ──────────┐ │
│ │ Title input + Rich text description     │ │ │ Active / Draft select   │ │
│ └─────────────────────────────────────────┘ │ └─────────────────────────┘ │
│ ┌ MediaSection ───────────────────────────┐ │ ┌ PublishingSection ──────┐ │
│ │ Thumbnail grid + upload                 │ │ │ Sales channels          │ │
│ └─────────────────────────────────────────┘ │ └─────────────────────────┘ │
│ ┌ CategorySection ────────────────────────┐ │ ┌ SalesSection ───────────┐ │
│ └─────────────────────────────────────────┘ │ │ Enrollments / revenue   │ │
│ ┌ PricingSection ─────────────────────────┐ │ └─────────────────────────┘ │
│ └─────────────────────────────────────────┘ │ ┌ OrganizationSection ──────┐ │
│ ┌ InventorySection ───────────────────────┐ │ │ Type · Vendor · Groups  │ │
│ └─────────────────────────────────────────┘ │ └─────────────────────────┘ │
│ ┌ DeliverySection (Shopify: Shipping) ────┐ │ ┌ ThemeTemplateSection ───┐ │
│ └─────────────────────────────────────────┘ │ └─────────────────────────┘ │
│ ┌ VariantsSection ────────────────────────┐ │                              │
│ └─────────────────────────────────────────┘ │                              │
│ ┌ MetafieldsSection ──────────────────────┐ │                              │
│ └─────────────────────────────────────────┘ │                              │
│ ┌ SearchListingSection ───────────────────┐ │                              │
│ └─────────────────────────────────────────┘ │                              │
└──────────────────────────────────────────────┴──────────────────────────────┘
```

Mobile: single column — main sections first, sidebar stacks below (`@media max-width: 1024px`).

---

## Domain mapping

| Shopify section | Shopify purpose | LuxGen equivalent | Component |
|-----------------|-----------------|-------------------|-----------|
| Title | Product name | **Course title** | `TitleDescriptionSection` |
| Description | RTE body | **Course description** | `TitleDescriptionSection` + `SimpleRichTextEditor` |
| Media | Images / video | **Course thumbnail & assets** | `MediaSection` |
| Category | Shopify taxonomy | **Course category / subject** | `CategorySection` |
| Price | Selling price | **Plan price / free** | `PricingSection` → `/billing` |
| Compare-at price | Was/now | **List vs promo price** | `PricingSection` |
| Inventory | Stock by location | **Enrollment capacity & seats** | `InventorySection` |
| SKU / Barcode | Identifiers | **CRS-{id}** · external ID | `InventorySection` |
| Shipping | Physical package | **Digital delivery** (N/A ship) | `DeliverySection` |
| Variants | Size/color options | **Course tiers / bundles** | `VariantsSection` |
| Purchase options | Subscriptions | **Subscription / billing plan** | `VariantsSection` |
| Category metafields | Taxonomy extras | **Subject metafields** | `MetafieldsSection` |
| Product metafields | Custom fields | **Course custom fields** | `MetafieldsSection` |
| Variant metafields | Per-variant data | **Tier metafields** | `MetafieldsSection` |
| Search engine listing | SEO preview | **Catalog SEO** | `SearchListingSection` |
| Status | Active/Draft/Archived | **DRAFT / PUBLISHED / …** | `StatusSection` |
| Publishing | Sales channels | **Tenant channels & features** | `PublishingSection` |
| Sales (90 days) | Units sold | **Enrollments in period** | `SalesSection` |
| Product organization | Type, vendor, collections, tags | **Type, instructor, groups, tags** | `OrganizationSection` |
| Theme template | Online Store theme | **Learner page template** | `ThemeTemplateSection` |

---

## Component registry

Each component lives under `packages/ui/src/ProductEdit/` and follows the scalable UI structure:

```
ComponentName/
├── ComponentName.tsx
├── fetcher.ts          # Constants, options, data helpers
├── fixture.ts          # Story/test props
└── index.ts
```

Shell components also include `styles.ts`, `translations.ts`, and `README.md` at the `ProductEdit/` root.

| Component | Path | Status |
|-----------|------|--------|
| `ProductEditLayout` | `packages/ui/src/ProductEdit/ProductEditLayout.tsx` | **Live** |
| `ProductEditSection` | `packages/ui/src/ProductEdit/ProductEditSection.tsx` | **Live** |
| `ProductEditHeader` | `packages/ui/src/ProductEdit/ProductEditHeader.tsx` | **Live** |
| `TitleDescriptionSection` | `packages/ui/src/ProductEdit/sections/TitleDescriptionSection/` | **Live** |
| `MediaSection` | `packages/ui/src/ProductEdit/sections/MediaSection/` | Partial (UI) |
| `CategorySection` | `packages/ui/src/ProductEdit/sections/CategorySection/` | Partial |
| `PricingSection` | `packages/ui/src/ProductEdit/sections/PricingSection/` | Partial |
| `InventorySection` | `packages/ui/src/ProductEdit/sections/InventorySection/` | Partial |
| `DeliverySection` | `packages/ui/src/ProductEdit/sections/DeliverySection/` | Partial |
| `VariantsSection` | `packages/ui/src/ProductEdit/sections/VariantsSection/` | Planned shell |
| `MetafieldsSection` | `packages/ui/src/ProductEdit/sections/MetafieldsSection/` | Partial |
| `SearchListingSection` | `packages/ui/src/ProductEdit/sections/SearchListingSection/` | **Live** |
| `StatusSection` | `packages/ui/src/ProductEdit/sidebar/StatusSection/` | **Live** |
| `PublishingSection` | `packages/ui/src/ProductEdit/sidebar/PublishingSection/` | Partial |
| `SalesSection` | `packages/ui/src/ProductEdit/sidebar/SalesSection/` | Partial |
| `OrganizationSection` | `packages/ui/src/ProductEdit/sidebar/OrganizationSection/` | Partial |
| `ThemeTemplateSection` | `packages/ui/src/ProductEdit/sidebar/ThemeTemplateSection/` | Partial |
| `ProductEditForm` | `packages/ui/src/ProductEdit/ProductEditForm.tsx` | **Live** |

Import from `@luxgen/ui`. Page wiring: `apps/web/pages/products/[id]/edit.tsx`.

---

## Data & API

| Field group | GraphQL / API today | Persistence plan |
|-------------|---------------------|------------------|
| Title, description, status | `UPDATE_COURSE` | **Live** |
| SEO (meta title, description, handle) | `ProductEdit/fetcher.ts` — embedded in `description` | **Live** |
| Extended meta (category, tags, price display) | `ProductEdit/fetcher.ts` — description JSON footer | Phase 3 |
| Media | — | `POST /api/courses/:id/media` |
| Groups (collections) | `GET_GROUPS` + link mutation | Phase 3 |
| Pricing | `GET_TENANT_BILLING` / Stripe | `/billing` |
| Publishing channels | `GET /api/tenant/config` | Phase 3 |

---

## Shopify UX patterns preserved in LuxGen

1. **Stacked white cards** on gray page background — `.ios-card` on `var(--color-bg-primary)`.
2. **Right sidebar sticky** while scrolling main content.
3. **Section headers** with optional help link (Shopify `?` icon → LuxGen info tooltip text).
4. **Primary save** implied on blur / explicit Save in header (Shopify auto-save → LuxGen explicit save button in header).
5. **Status badge** next to title (green Active = `PUBLISHED`).

---

## Related docs

- `docs/PROFILE_SETTINGS_FEATURE_MAP.md` — products catalog overview
- `skills/ios-design/SKILL.md` — tokens and `.ios-card` rules
- `packages/ui/src/ProductEdit/README.md` — component usage
- `packages/ui/src/ProductEdit/fetcher.ts` — parse/serialize + course mapping
- `apps/web/lib/product-edit-meta.ts` — re-exports from `@luxgen/ui` (compat)

---

*Last updated: Shopify-style product edit layout (Phase 2.5).*
