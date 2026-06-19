# Timeline Architecture

> Shopify-style append-only activity log for **Product**, **Order**, and **Customer** admin surfaces.

---

## Overview

LuxGen mirrors Shopify's **Event** model with a single `ActivityEvent` store and a shared `TimelineView` in `@luxgen/ui`. Events are **read-only** once written (append-only). Staff comments are the primary writable surface — same role as Shopify's `commentEvent`.

| Shopify | LuxGen |
|---------|--------|
| `order.events` | `activityEvents(subjectType: ORDER, subjectId: courseId:studentId)` |
| `customer.events` | `activityEvents(subjectType: CUSTOMER, subjectId: userId)` |
| Product resource events | `activityEvents(subjectType: PRODUCT, subjectId: courseId)` |
| Staff comment | `addActivityComment` mutation |
| Order notes (audit workaround) | `Order.notes` field (Phase 2 — writable via GraphQL) |

---

## Data model (`packages/db/src/activity-event.ts`)

| Field | Purpose |
|-------|---------|
| `tenant` | Multi-tenant scope |
| `subjectType` | `PRODUCT` \| `ORDER` \| `CUSTOMER` |
| `subjectId` | `courseId` \| `courseId:studentId` \| `userId` |
| `kind` | `SYSTEM` \| `STAFF_COMMENT` \| `APP` \| `FIELD_CHANGE` |
| `eventType` | Machine-readable slug (e.g. `order.created`) |
| `message` | Human-readable line (Shopify `message`) |
| `actorType` / `actorName` | `SYSTEM` \| `STAFF` \| `APP` attribution |
| `field` / `oldValue` / `newValue` | Field-change badges (Shopify metafield/history style) |
| `metadata` | JSON — order links, course ids, automation refs |

**Indexes:** `{ tenant, subjectType, subjectId, createdAt DESC }`

---

## Event catalog

### Product (`PRODUCT` / course id)

| eventType | kind | Trigger | Message example |
|-----------|------|---------|-----------------|
| `product.created` | SYSTEM | `createCourse` | Product "React 101" was created |
| `product.updated` | SYSTEM | `updateCourse` (non-status) | Product details updated |
| `product.status_changed` | FIELD_CHANGE | `updateCourse` status change | Status changed from DRAFT to PUBLISHED |
| `staff.comment` | STAFF_COMMENT | `addActivityComment` | (comment body) |

**Phase 2:** `product.published`, `product.inventory_changed`, `product.media_added`

### Order (`ORDER` / `courseId:studentId`)

| eventType | kind | Trigger | Message example |
|-----------|------|---------|-----------------|
| `order.created` | SYSTEM/APP | `enrollStudent` | Order created — enrolled in React 101 |
| `order.enrollment_confirmed` | SYSTEM | synthesize / future | Enrollment confirmed for user@email |
| `order.payment_confirmed` | SYSTEM | Phase 2 Stripe webhook | Payment marked paid |
| `order.fulfillment_updated` | FIELD_CHANGE | Phase 2 status | Fulfillment set to fulfilled |
| `order.note_added` | SYSTEM | Phase 2 notes mutation | Note added to order |
| `staff.comment` | STAFF_COMMENT | `addActivityComment` | (comment body) |

### Customer (`CUSTOMER` / student user id)

| eventType | kind | Trigger | Message example |
|-----------|------|---------|-----------------|
| `customer.created` | APP/SYSTEM | `createUser` (STUDENT) | Customer account created (email) |
| `customer.order_placed` | APP | `enrollStudent` (cross-log) | Placed order for React 101 |
| `customer.updated` | SYSTEM | Phase 2 `updateUser` | Customer profile updated |
| `customer.note_added` | SYSTEM | Phase 2 notes | Note added |
| `staff.comment` | STAFF_COMMENT | `addActivityComment` | (comment body) |

---

## GraphQL API

```graphql
query {
  activityEvents(
    tenantId: "..."
    subjectType: ORDER
    subjectId: "courseId:studentId"
    first: 50
  ) {
    id message createdAt kind eventType actorName field oldValue newValue
  }
}

mutation {
  addActivityComment(input: {
    tenantId: "..."
    subjectType: CUSTOMER
    subjectId: "userId"
    message: "VIP — handle with care"
  }) { id message createdAt }
}
```

---

## UI (`packages/ui/src/Timeline/`)

| Export | Role |
|--------|------|
| `TimelineView` | Shopify-style feed: date groups, comment composer, field badges |
| `TimelineActivityProps` | Shared props for Product / Order / Customer pages |
| `groupTimelineByDate` | Groups events under Today / Yesterday / date headers |

**Wired surfaces:**
- `ProductEditForm` → `ProductTimelineSection`
- `OrderDetailView` → `TimelineSection`
- `CustomerDetailView` → `CustomerHistorySection`

**Web hook:** `apps/web/lib/use-activity-timeline.ts` — fetches events + posts comments.

---

## Legacy data (synthesize)

When no MongoDB events exist, `activityEventService.list()` **synthesizes** read-only events from Course/User documents so existing tenants see a baseline timeline until new actions append real events.

---

## Implementation checklist

### Phase 1 — Foundation (this PR)

- [x] `ActivityEvent` Mongoose model
- [x] `activityEventService` (record, list, comment, synthesize)
- [x] GraphQL `activityEvents` + `addActivityComment`
- [x] Emit events on `createCourse`, `updateCourse`, `enrollStudent`, `createUser` (STUDENT)
- [x] Shared `TimelineView` component
- [x] Wire Product edit, Order detail, Customer detail pages
- [x] `useActivityTimeline` React hook

### Phase 2 — Writable audit surfaces

- [ ] Persist **order notes** via GraphQL; emit `order.note_added`
- [ ] Persist **customer notes**; emit `customer.note_added`
- [ ] `updateUser` → `customer.updated` events
- [ ] `unenrollStudent` → `order.cancelled` / `order.refunded`
- [ ] Stripe webhook → `order.payment_confirmed`

### Phase 3 — Automation & apps

- [ ] Automation engine → `APP` events (`actorName: automation name`)
- [ ] Agent Studio actions → structured `metadata` on events
- [ ] Email notification log cross-link (`order.email_sent`)

### Phase 4 — Polish

- [ ] Pagination (`after` cursor) on `activityEvents`
- [ ] Real-time subscription for new timeline entries
- [ ] Rich comment editor (@mention, attachments)
- [ ] Critical alert flag (`criticalAlert` like Shopify)
- [ ] Remove synthesize once backfill migration runs

---

## Files

| Layer | Path |
|-------|------|
| DB | `packages/db/src/activity-event.ts` |
| API service | `apps/api/src/services/activityEventService.ts` |
| GraphQL | `apps/api/src/schema/activityEvent/` |
| UI | `packages/ui/src/Timeline/` |
| Web queries | `apps/web/graphql/queries/activity-events.ts` |
| Web hook | `apps/web/lib/use-activity-timeline.ts` |

---

## Test plan

1. Create product → Timeline shows `product.created`
2. Publish product (status change) → `product.status_changed` with badges
3. Add customer → Customer history shows `customer.created`
4. Create order (enroll) → Order timeline + customer `customer.order_placed`
5. Post staff comment on each surface → `STAFF_COMMENT` with expandable body
6. Legacy course with no events → synthesize shows created/status rows
