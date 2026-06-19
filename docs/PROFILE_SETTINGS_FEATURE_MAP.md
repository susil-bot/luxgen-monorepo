# Profile, Settings & Products — Shopify Feature Map

> Reference: Shopify Admin product + store settings spec → LuxGen LMS equivalents.  
> Status: **Live** · **Partial** · **Planned**

---

## Domain mapping

| Shopify concept | LuxGen equivalent |
|-----------------|-------------------|
| Product | **Course** (`/products`, `/courses`) |
| Collection | **Group** |
| Customer | **Learner** (`/customers`) |
| Staff | **Users** (`/users`, `/settings/staff`) |
| Online Store | **Tenant subdomain** (`demo.localhost`) |
| Sales channel | **Tenant plan + features** |
| Gift card | Not yet |
| POS | N/A |

---

## 1. Products (implemented Phase 1)

| Shopify feature | LuxGen | Status | Route / API |
|-----------------|--------|--------|-------------|
| Product listing | Course catalog table | **Live** | `/products` · `GET_COURSES` |
| Search | Title, vendor, SKU | **Live** | Client filter |
| Filter status | DRAFT / PUBLISHED / … | **Live** | Client filter |
| Filter type | Course | **Live** | Client filter |
| Sort | Title, updated, inventory | **Live** | Client sort |
| Bulk select | Checkbox + action bar | **Partial** | UI only |
| Table columns | Image, title, status, inventory, type, vendor, SKU, price, updated | **Live** | `product-display.ts` |
| Create product | Create course | **Live** | `/products/create` · `CREATE_COURSE` |
| Edit product | Edit course | **Live** | `/products/[id]/edit` · see `docs/PRODUCT_EDIT_LAYOUT.md` |
| Variants | — | Planned | Metafields phase |
| Pricing | Billing plans | **Partial** | `/billing` |
| Inventory | Enrollment count | **Live** | `students.length` |
| SEO | — | Planned | |
| Publishing channels | Tenant features | **Partial** | `tenant.settings.config` |
| Analytics | Course analytics | **Partial** | `/courses/analytics` |
| Collections | Groups | **Partial** | `/groups` |

---

## 2. Profile (implemented)

| Feature | Status | Route |
|---------|--------|-------|
| View name, email, role | **Live** | `/profile` |
| Edit first / last name | **Live** | `UPDATE_USER` + session sync |
| Workspace / tenant info | **Live** | Session |
| Avatar | **Partial** | Initials only |
| Password change | Planned | `/login` reset flow |
| 2FA | Planned | `/settings/security` |

---

## 3. Store settings hub (implemented shell)

| Shopify section | LuxGen page | Status |
|-----------------|-------------|--------|
| General | `/settings/general` | Partial (form UI) |
| Staff | `/settings/staff` → `/users` | Partial |
| Payments | `/billing` | Partial (Stripe) |
| Plan & billing | `/billing` | Live |
| Branding | `/settings/branding` | Partial |
| Notifications | `/settings/notifications` | Planned list |
| Security | `/settings/security` | Planned list |
| Checkout | — | Planned |
| Shipping | — | N/A (digital LMS) |
| Taxes | — | Planned |
| Domains | — | Planned (subdomain routing exists) |
| Customer accounts | `/customers` | Partial |
| Policies | — | Planned |
| Languages | — | Planned |
| Apps | `/developer` | Partial |

Hub: **`/settings`** — grouped iOS cards with Live / Partial / Planned badges.

---

## 4. Implementation phases (recommended)

### Phase 1 ✅ (this PR)
- `/profile`, `/settings/*`, `/products`
- Auth routes for new paths
- Sidebar **Products** link
- Feature map (this doc)

### Phase 2
- Persist general + branding via `PATCH /api/tenant/*`
- Bulk product actions (`UPDATE_COURSE` status)
- Product edit wizard (media, SEO, pricing placeholders)
- Email notification templates

### Phase 3
- Variants / metafields
- Automated collections (group rules)
- Markets / multi-currency
- Shopify Flow → LuxGen Automations (already `/automations`)

---

## 5. Module count (LuxGen vs Shopify spec)

| Module | Shopify spec | LuxGen live | LuxGen partial | Planned |
|--------|--------------|-------------|----------------|---------|
| Products | 40+ | 8 | 6 | 26+ |
| Settings | 50+ | 4 | 8 | 38+ |
| Profile | — | 4 | 2 | 4 |
| Inventory | 20+ | 2 | 1 | 17+ |
| Payments | 15+ | 2 | 4 | 9+ |

**Total Shopify-like surface: ~250 features → LuxGen ~20 live, ~25 partial, remainder on roadmap.**

---

*Last updated: Phase 1 profile/settings/products shell.*
