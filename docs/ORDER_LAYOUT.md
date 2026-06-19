# Order Layout — Shopify Admin → LuxGen

> Reference: [Shopify Admin — Orders](https://help.shopify.com/en/manual/orders)  
> LuxGen routes: **`/orders`** · **`/orders/[id]`** · Data model: **enrollment as order**

---

## Layout anatomy

### Orders index (Shopify orders list)

- Header: title, Export, Create order
- Search + filter tabs: All · Unpaid · Unfulfilled · Open · Archived
- Table: Order · Date · Customer · Course · Payment · Fulfillment · Total

### Order detail (Shopify order page)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OrderDetailHeader — #1042 · date · Paid · Fulfilled · Refund · Edit · More  │
├──────────────────────────────────────────────┬──────────────────────────────┤
│ MAIN COLUMN                                  │ SIDEBAR (sticky)             │
│ ┌ FulfillmentSection ──────────────────────┐ │ ┌ CustomerSection ─────────┐ │
│ │ Line items (courses)                     │ │ └──────────────────────────┘ │
│ └──────────────────────────────────────────┘ │ ┌ ContactSection ──────────┐ │
│ ┌ PaymentSummarySection ───────────────────┐ │ └──────────────────────────┘ │
│ └──────────────────────────────────────────┘ │ ┌ AccessSection ───────────┐ │
│ ┌ TimelineSection ─────────────────────────┐ │ │ (replaces Shipping)      │ │
│ └──────────────────────────────────────────┘ │ └──────────────────────────┘ │
│ ┌ NotesSection ────────────────────────────┐ │ ┌ BillingSection ──────────┐ │
│ └──────────────────────────────────────────┘ │ ┌ TagsSection ─────────────┐ │
│                                              │ ┌ ConversionSection ───────┐ │
└──────────────────────────────────────────────┴──────────────────────────────┘
```

---

## Shopify → LuxGen mapping

| Shopify | LuxGen |
|---------|--------|
| Order | Course enrollment |
| Line item | Enrolled course |
| Customer | Learner |
| Payment status | Billing / enrollment paid state |
| Fulfillment | Access granted / in progress |
| Shipping address | **Digital access** (`AccessSection`) |
| Timeline | Enrollment events |
| Conversion summary | Enrollment source |

---

## Component registry

All under `packages/ui/src/Order/` with `ComponentName.tsx`, `fetcher.ts`, `fixture.ts`, `index.ts`.

| Component | Path | Status |
|-----------|------|--------|
| `OrderListView` | `Order/OrderListView.tsx` | **Live** |
| `OrderListHeader` | `Order/list/OrderListHeader/` | **Live** |
| `OrderListTabs` | `Order/list/OrderListTabs/` | **Live** |
| `OrderListTable` | `Order/list/OrderListTable/` | **Live** |
| `OrderDetailView` | `Order/OrderDetailView.tsx` | **Live** |
| `FulfillmentSection` | `Order/detail/FulfillmentSection/` | **Live** |
| `PaymentSummarySection` | `Order/detail/PaymentSummarySection/` | Partial |
| `TimelineSection` | `Order/detail/TimelineSection/` | **Live** |
| `NotesSection` | `Order/detail/NotesSection/` | Phase 3 persist |
| `CustomerSection` | `Order/detail/CustomerSection/` | **Live** |
| `AccessSection` | `Order/detail/AccessSection/` | **Live** |

Data: `buildOrdersFromEnrollments(courses, users)` in `Order/fetcher.ts` — derived from `GET_COURSES` + `GET_USERS`.

---

*Last updated: initial Shopify-style orders implementation.*
