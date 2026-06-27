# AIStudio

LuxGen UI component. See `AIStudio.tsx` for props and usage.

## Structure

| File               | Purpose                         |
| ------------------ | ------------------------------- |
| `AIStudio.tsx`     | Main component                  |
| `fetcher.ts`       | Data fetching / SSR helpers     |
| `fixture.ts`       | Test fixtures and mock data     |
| `AIStudio.spec.ts` | Unit tests                      |
| `styles.ts`        | Styled components and CSS-in-JS |
| `translations.ts`  | i18n strings                    |
| `index.ts`         | Public exports                  |

## Usage

```tsx
import { AIStudio } from '@luxgen/ui';

<AIStudio />;
```
