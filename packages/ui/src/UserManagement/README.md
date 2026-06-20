# UserManagement

LuxGen UI component. See `UserManagement.tsx` for props and usage.

## Structure

| File                     | Purpose                         |
| ------------------------ | ------------------------------- |
| `UserManagement.tsx`     | Main component                  |
| `fetcher.ts`             | Data fetching / SSR helpers     |
| `fixture.ts`             | Test fixtures and mock data     |
| `UserManagement.spec.ts` | Unit tests                      |
| `styles.ts`              | Styled components and CSS-in-JS |
| `translations.ts`        | i18n strings                    |
| `index.ts`               | Public exports                  |

## Usage

```tsx
import { UserManagement } from '@luxgen/ui';

<UserManagement />;
```
