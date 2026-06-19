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

| Component | Path | Status |
|-----------|------|--------|
| `ProductEditLayout` | `components/products/edit/ProductEditLayout.tsx` | **Live** |
| `ProductEditSection` | `components/products/edit/ProductEditSection.tsx` | **Live** |
| `ProductEditHeader` | `components/products/edit/ProductEditHeader.tsx` | **Live** |
| `TitleDescriptionSection` | `components/products/edit/sections/TitleDescriptionSection.tsx` | **Live** |
| `MediaSection` | `components/products/edit/sections/MediaSection.tsx` | Partial (UI) |
| `CategorySection` | `components/products/edit/sections/CategorySection.tsx` | Partial |
| `PricingSection` | `components/products/edit/sections/PricingSection.tsx` | Partial |
| `InventorySection` | `components/products/edit/sections/InventorySection.tsx` | Partial |
| `DeliverySection` | `components/products/edit/sections/DeliverySection.tsx` | Partial |
| `VariantsSection` | `components/products/edit/sections/VariantsSection.tsx` | Planned shell |
| `MetafieldsSection` | `components/products/edit/sections/MetafieldsSection.tsx` | Partial |
| `SearchListingSection` | `components/products/edit/sections/SearchListingSection.tsx` | **Live** |
| `StatusSection` | `components/products/edit/sidebar/StatusSection.tsx` | **Live** |
| `PublishingSection` | `components/products/edit/sidebar/PublishingSection.tsx` | Partial |
| `SalesSection` | `components/products/edit/sidebar/SalesSection.tsx` | Partial |
| `OrganizationSection` | `components/products/edit/sidebar/OrganizationSection.tsx` | Partial |
| `ThemeTemplateSection` | `components/products/edit/sidebar/ThemeTemplateSection.tsx` | Partial |
| `ProductEditForm` | `components/products/edit/ProductEditForm.tsx` | **Live** |

---

## Data & API

| Field group | GraphQL / API today | Persistence plan |
|-------------|---------------------|------------------|
| Title, description, status | `UPDATE_COURSE` | **Live** |
| SEO (meta title, description, handle) | Embedded in `description` via `product-seo.ts` | **Live** |
| Extended meta (category, tags, price display) | `product-edit-meta.ts` in description JSON | Phase 3 |
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
- `apps/web/lib/product-seo.ts` — SEO serialization
- `apps/web/lib/product-edit-meta.ts` — extended form meta (Phase 3)

---

*Last updated: Shopify-style product edit layout (Phase 2.5).*
