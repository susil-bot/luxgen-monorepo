# Order

Shopify Admin–style orders list and order detail for LuxGen enrollments.

## Usage

```tsx
import { OrderListView, OrderDetailView, buildOrdersFromEnrollments, findOrderDetail } from '@luxgen/ui';
```

## Structure

```
Order/
├── OrderListView.tsx         # Orders index
├── OrderDetailView.tsx       # Order detail orchestrator
├── fetcher.ts                # Enrollment → order mapping
├── list/                     # List page sections
└── detail/                   # Detail page sections (main + sidebar)
```

See `docs/ORDER_LAYOUT.md` for Shopify → LuxGen mapping.
