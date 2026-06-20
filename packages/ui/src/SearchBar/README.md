# SearchBar

LuxGen UI component. See `SearchBar.tsx` for props and usage.

## Structure

| File                | Purpose                         |
| ------------------- | ------------------------------- |
| `SearchBar.tsx`     | Main component                  |
| `fetcher.ts`        | Data fetching / SSR helpers     |
| `fixture.ts`        | Test fixtures and mock data     |
| `SearchBar.spec.ts` | Unit tests                      |
| `styles.ts`         | Styled components and CSS-in-JS |
| `translations.ts`   | i18n strings                    |
| `index.ts`          | Public exports                  |

## Usage

```tsx
import { SearchBar } from '@luxgen/ui';

<SearchBar />;
```
