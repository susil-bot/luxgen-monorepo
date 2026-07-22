# SplitPageLayout

Global admin page layout for LuxGen’s recurring multi-column patterns (Shopify-style).

## Variants

| Variant      | Columns                     | Used by                    |
| ------------ | --------------------------- | -------------------------- |
| `main-aside` | Main + sticky right sidebar | Product edit, Order detail |
| `nav-main`   | Left nav + main             | Settings (`SettingsShell`) |
| `triple`     | Left + main + right         | Developer AI Studio        |

## Usage

```tsx
import { SplitPageLayout, SplitPageSection } from '@luxgen/ui';

<SplitPageLayout
  variant="main-aside"
  header={<OrderDetailHeader order={order} />}
  main={
    <>
      <SplitPageSection title="Fulfillment">…</SplitPageSection>
      <SplitPageSection title="Payment">…</SplitPageSection>
    </>
  }
  aside={
    <>
      <SplitPageSection title="Customer">…</SplitPageSection>
    </>
  }
/>;
```

## Related components

- `AppLayout` — app chrome (sidebar + navbar)
- `SplitPageSection` — `.ios-card` section block (replaces per-feature section wrappers)
