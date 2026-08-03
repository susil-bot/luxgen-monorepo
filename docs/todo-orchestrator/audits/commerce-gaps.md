# Commerce gaps — `T-E0-04`

> Source: `docs/TODO-Commerce Experience.md`  
> Focus: Products, Orders, Customers, Coupons, Bundles (+ route map)  
> Cross-link: [`docs/PAGE_FUNCTIONALITY_CHECKLIST.md`](../../PAGE_FUNCTIONALITY_CHECKLIST.md) § Commerce  
> Entity truth: [`docs/technical/COMMERCE_API.md`](../../technical/COMMERCE_API.md) — Product=`Course`, Order=`Enrollment`, Customer=`User STUDENT`  
> Date: 2026-08-03 · Product code: **none**

Status: `wired` · `partial` · `missing`

---

## Summary

| Area | Status | Notes |
| --- | --- | --- |
| Products | partial | Live CRUD via courses GraphQL; TODO `/commerce/products` → actual `/products`; many Phase-3 fields disabled |
| Orders | partial | List/detail/create via enrollments/`orderRows`; no `/commerce/orders` path |
| Customers | wired | Admin CRUD at `/admin/customers*`; staff+tenant gates (`T-COM-03`); segmentation live via `customersInSegment` |
| Bundles | partial | Learner storefront `/store/bundles` only — **no admin commerce bundles CRUD** |
| Coupons | missing | No coupon pages, schema, or db model found |

Checklist items for these routes are still **unchecked** in `PAGE_FUNCTIONALITY_CHECKLIST.md` (filters, Stripe sync, abandoned/drafts, segmentation).

---

## Route map (TODO → shipped)

| TODO route | Status | Actual |
| --- | --- | --- |
| `/commerce/products` | partial | `/products` |
| `/commerce/products/new` · `…/:id/edit` | partial | `/products/create` · `/products/[id]/edit` |
| `/commerce/bundles/new` | missing | Admin create missing; storefront `/store/bundles`, `/store/bundles/[id]` |
| `/commerce/orders` · `…/:orderId` | partial | `/orders` · `/orders/[id]` (+ `/create`, `/drafts`, `/abandoned`) |
| `/commerce/customers` · `…/:id` | partial | `/admin/customers` · `/admin/customers/[id]` · `…/edit` · `…/create` |
| `/commerce/customers/segments` | partial | `/admin/customers/segmentation` |
| `/commerce/coupons` | missing | — |
| `/commerce/payments/settings` · `/subscriptions` | missing* | Billing at `/organization/billing` (plan, not commerce payments UI) |
| `/commerce/revenue` · `/funnels` | missing* | Course analytics exists; no commerce revenue/funnel admin |
| `/commerce/products/:id/upsells` | missing* | — |

\*Out of AC focus but noted for `T-COM-06`–`09`.

Nav: `DefaultNavigation.tsx` — Products, Orders (drafts/abandoned), Customers — **no Coupons, no Bundles admin**.

---

## Products (§2, L21–417)

| Capability | Status | Evidence |
| --- | --- | --- |
| List + search/filter | partial | `apps/web/pages/products/index.tsx` + `GET_COURSES` |
| Create | wired | `create.tsx` → `CREATE_COURSE` / `UPDATE_COURSE` |
| Edit persist (title/desc/status/SEO) | wired | `[id]/edit.tsx` → `GET_COURSE` / `UPDATE_COURSE` (+ `commerce` on mutate) |
| List price/SKU/type | wired | `product-display.ts` reads `commerce` + meta blob |
| Media / variants / delivery / metafields | partial | UI present but **disabled** — Phase 3 (no API); collections now save via meta |
| Subscription product type | missing | Variants “Subscriptions — Phase 3” |
| Stripe price sync | missing | Checklist open |

**API:** `apps/web/graphql/queries/courses.ts` · `apps/api` course schema · model Course in `@luxgen/db`.

---

## Bundles (§3, L418–516)

| Capability | Status | Evidence |
| --- | --- | --- |
| Admin list/create/edit | missing | No `/products` bundle type admin; no `/commerce/bundles` |
| Storefront browse/subscribe | wired | `apps/web/pages/store/bundles/*` · `storefrontBundles` / `subscribeToBundle` |
| GraphQL admin mutations | missing | Storefront-only in `apps/api/src/schema/storefront/` |

→ Task `T-COM-04` should mean **admin** bundles CRUD (not only storefront).

---

## Orders (§4, L517–653)

| Capability | Status | Evidence |
| --- | --- | --- |
| List + status tabs | wired | `orders/index.tsx` → `GET_ORDER_ROWS` + live payment/fulfillment/learning filters (`?tab=`) |
| Detail | wired | line items + payment + fulfillment + learning badges; totals from `commerce` |
| Create (manual) | wired | `orders/create.tsx` → `ENROLL_STUDENT` + `UPDATE_ORDER` |
| Drafts / abandoned | partial | `drafts.tsx`, `abandoned.tsx` — checklist still open vs paymentStatus |
| Notes update | wired | `updateOrderNotes` / `UPDATE_ORDER` |
| Refunds / invoicing / multi-line Shopify-like | missing | Enrollment-centric model |
| Real-time payment sync | missing | Checklist open |

**API:** `apps/web/graphql/queries/orders.ts`, `enrollment.ts` · `apps/api/src/schema/enrollment/` · `orderRowsService`.

---

## Customers (§5, L654–827)

| Capability | Status | Evidence |
| --- | --- | --- |
| List + search | wired | `admin/customers/index.tsx` → `GET_CUSTOMERS` (staff + scoped tenant) |
| Create | wired | `create.tsx` → `CREATE_USER` (STUDENT); `createUser` staff + `scopedTenantId` |
| Detail / edit | wired | `[id].tsx`, `[id]/edit.tsx` → `GET_USER` / `UPDATE_USER` / `UPDATE_CUSTOMER_NOTES` |
| Delete | wired | `DELETE_USER` — staff, tenant-scoped, STUDENT/USER only |
| Staff notes | wired | `updateCustomerNotes` staff + tenant filter (no cross-tenant write) |
| Segmentation | wired | `segmentation.tsx` → `customersInSegment` (staff-gated) |
| LTV / cohort widgets | missing | TODO analytics-heavy; not on list |

**API:** `apps/web/graphql/queries/users.ts` · `customers` / `createUser` / `updateUser` / `deleteUser` / `updateCustomerNotes`.

---

## Coupons (§6, L828–944)

| Capability | Status | Evidence |
| --- | --- | --- |
| Any admin UI | missing | No pages under `apps/web/pages` |
| GraphQL / DB | missing | No coupon schema/model hits in `apps/api/src/schema` or `packages/db/src` |
| Nav entry | missing | — |

→ `T-COM-05` is greenfield (model → GraphQL → UI).

---

## Cross-link: PAGE_FUNCTIONALITY_CHECKLIST (Commerce)

From checklist (still open as of audit):

| Checklist row | Maps to |
| --- | --- |
| `/products` filter/search, plan limits | Products partial |
| `/products/create` Stripe price sync | Products gap |
| `/orders` payment sync | Orders gap |
| `/orders/drafts` / `abandoned` paymentStatus | Orders partial |
| `/admin/customers/segmentation` automation targeting | Customers partial |
| `/store/bundles` | Bundles storefront wired; admin missing |

---

## Recommended enqueue (after this audit)

| Task | Why |
| --- | --- |
| `T-COM-01` | Close product disabled/Phase-3 fields that should save; stats optional follow-up |
| `T-COM-02` | Orders list/detail filters + abandoned/drafts AC vs paymentStatus |
| `T-COM-03` | Customers polish + segmentation truth |
| `T-COM-04` | **Admin** bundles CRUD (storefront already exists) |
| `T-COM-05` | Coupons greenfield — expect `L` split (schema PR then UI PR) |

Do **not** invent `/commerce/*` URL tree unless product decides to migrate; match existing `/products` `/orders` `/admin/customers` (TODO paths are aspirational).

---

## Acceptance check (`T-E0-04`)

- [x] Gap table for Products, Orders, Customers, Coupons, Bundles  
- [x] Cross-links `PAGE_FUNCTIONALITY_CHECKLIST.md`  
- [x] No product code changes  
