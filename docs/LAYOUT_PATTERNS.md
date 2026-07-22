# Layout Patterns — Global Split Page Layout

LuxGen admin pages repeat a small set of column layouts. **`SplitPageLayout`** in `@luxgen/ui` is the single source of truth — do not copy grid CSS per feature.

---

## Layer stack

```
AppLayout                    ← app shell (nav sidebar + top bar)
  └── SplitPageLayout        ← page-level columns (this doc)
        └── SplitPageSection ← white .ios-card blocks
```

`AppLayout` is always the outer wrapper. `SplitPageLayout` only handles the content area inside `AppLayout`.

---

## Variants

| Variant | Grid | Shopify reference | LuxGen pages |
|---------|------|-------------------|--------------|
| **`main-aside`** | `1fr` + `320px` sticky | Product edit, Order detail | `/products/[id]/edit`, `/orders/[id]` |
| **`nav-main`** | `240px` + `1fr` | Settings with left nav | `/settings/*` via `SettingsShell` |
| **`triple`** | `320px` + `1fr` + `320px` | — | `/developer` AI Studio |

Single-column list pages (products index, orders index, users) use `max-w-[1400px] mx-auto` without `SplitPageLayout`.

---

## When to use what

| Pattern | Component |
|---------|-----------|
| Shopify detail (form left, meta right) | `SplitPageLayout variant="main-aside"` |
| Settings / nested nav | `SplitPageLayout variant="nav-main"` |
| Dev tools 3-panel | `SplitPageLayout variant="triple"` |
| Card block inside a column | `SplitPageSection` |
| Full app chrome | `AppLayout` |

---

## Example — product / order detail

```tsx
import { SplitPageLayout, SplitPageSection } from '@luxgen/ui';

<SplitPageLayout
  variant="main-aside"
  header={<ProductEditHeader … />}
  main={
    <>
      <SplitPageSection title="Title">…</SplitPageSection>
      <SplitPageSection title="Pricing">…</SplitPageSection>
    </>
  }
  aside={
    <>
      <SplitPageSection title="Status">…</SplitPageSection>
      <SplitPageSection title="Organization">…</SplitPageSection>
    </>
  }
/>
```

---

## Example — settings

```tsx
<SplitPageLayout
  variant="nav-main"
  header={…}
  leading={<SettingsNav />}
  main={<SettingsForm />}
/>
```

---

## Migration map

| Before | After |
|--------|-------|
| `ProductEditLayout` | `SplitPageLayout variant="main-aside"` (wrapper kept for compat) |
| `OrderDetailLayout` | same |
| `ProductEditSection` / `OrderDetailSection` | `SplitPageSection` |
| `SettingsShell` inline grid | `SplitPageLayout variant="nav-main"` |
| `lux-dev-layout` in globals.css | `SplitPageLayout variant="triple"` (Phase 2) |

---

## Files

- `packages/ui/src/SplitPageLayout/` — layout + section + presets
- `docs/PRODUCT_EDIT_LAYOUT.md` — product-specific section registry
- `docs/ORDER_LAYOUT.md` — order-specific section registry
