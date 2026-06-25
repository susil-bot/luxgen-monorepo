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

| Prop          | Type                  | Default      | Description                                    |
| ------------- | --------------------- | ------------ | ---------------------------------------------- |
| `items`       | `ToolkitItem[]`       | required     | Tool buttons                                   |
| `ariaLabel`   | `string`              | i18n default | `role="toolbar"` label (`ToolkitTranslations`) |
| `size`        | `'small' \| 'medium'` | `'medium'`   | Button density                                 |
| `className`   | `string`              | `''`         | Extra classes on root                          |
| `style`       | `CSSProperties`       | —            | Inline styles merged onto root element         |
| `id`          | `string`              | —            | HTML `id` on root element                      |
| `dataTestId`  | `string`              | —            | `data-testid` for testing                      |
| `tenantTheme` | `TenantTheme`         | defaultTheme | Theme token set; used by SSR style injection   |

### ToolkitItem

| Prop          | Type         | Description                             |
| ------------- | ------------ | --------------------------------------- |
| `id`          | `string`     | Unique key                              |
| `label`       | `string`     | Button text and aria-label              |
| `icon`        | `ReactNode`  | Optional leading icon                   |
| `onClick`     | `() => void` | Click handler                           |
| `disabled`    | `boolean`    | Prevents click and applies muted styles |
| `active`      | `boolean`    | Sets `aria-pressed` and active tone     |
| `destructive` | `boolean`    | Applies red/danger tone                 |

## Styling

- **Client:** `toolkitStyles` emotion classes are applied directly on the toolbar and buttons (`Toolkit.tsx`).
- **SSR:** `fetchToolkitSSR` returns semantic class names (`.toolkit`, `.toolkit-item`, …) with matching rules from `toolkitCssRules` / `getToolkitSSRStyles()` — plain CSS for server HTML without emotion hashes.

## Structure

Per `.cursor/.rules`: `Toolkit.tsx`, `fetcher.ts`, `fixture.ts`, `fixture.tsx`, `Toolkit.spec.tsx`, `styles.ts`, `translations.ts`, `index.ts`, `README.md`.
