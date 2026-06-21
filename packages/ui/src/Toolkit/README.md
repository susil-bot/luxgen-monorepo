# Toolkit

Horizontal toolbar of tool actions for page headers, editors, and panels. Complements `ActionMenu` (overflow ⋯) with always-visible primary actions.

## Usage

```tsx
import { Toolkit } from '@luxgen/ui';

<Toolkit
  ariaLabel="Tower editor tools"
  items={[
    { id: 'add', label: 'Add step', onClick: () => {} },
    { id: 'link', label: 'Connect', active: true },
    { id: 'remove', label: 'Remove', destructive: true, onClick: () => {} },
  ]}
/>;
```

## Props

| Prop        | Type                  | Default     | Description            |
| ----------- | --------------------- | ----------- | ---------------------- |
| `items`     | `ToolkitItem[]`       | required    | Tool buttons           |
| `ariaLabel` | `string`              | `'Toolkit'` | `role="toolbar"` label |
| `size`      | `'small' \| 'medium'` | `'medium'`  | Button density         |
| `className` | `string`              | `''`        | Extra classes on root  |

## Structure

Per `.cursor/.rules`: `Toolkit.tsx`, `fetcher.ts`, `fixture.ts`, `Toolkit.spec.ts`, `styles.ts`, `translations.ts`, `index.ts`, `README.md`.
