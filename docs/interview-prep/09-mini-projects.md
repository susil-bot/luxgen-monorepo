# 09 — Mini Projects (Interview Labs)

Each lab reinforces patterns from LuxGen. Build in a fresh Vite+React or Next sandbox.

## 1. Custom `useFetch` (mirrors Apollo patterns)

**Goal:** loading / error / data states like `useQuery`.

```typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
```

**Interview:** cleanup flag vs AbortController.

## 2. JWT session (like `session.ts`)

- `persistSession(token, user)`
- `clearStoredSession()`
- Custom event `auth-change` for cross-tab

## 3. Role-based sidebar

- Copy `ROLE_RANK` from `user-roles.ts`
- Filter nav items by `hasRoleAtLeast`

## 4. Plan gate component

- Props: `plan`, `requiredFeature`
- Render children or upgrade CTA

## 5. Virtualized list

- Use `@tanstack/react-virtual`
- 10k rows, measure performance

## 6. GraphQL orders page

- Backend: single `orderRows` query
- Frontend: compare 3-query join vs 1-query

## 7. Theme switcher

- `data-theme` on `document.documentElement`
- `localStorage` persistence (see `theme.tsx`)

## 8. Infinite scroll

- Cursor pagination `?after=id`
- IntersectionObserver sentinel

## 9. Debounced search

- 300ms debounce on input
- Navigate to `/search?q=` like `useAppLayoutHeader`

## 10. Mongoose safe model

```typescript
export const Widget = mongoose.models.Widget || mongoose.model('Widget', schema);
```

## Extensions (senior)

- Add React Query instead of raw useFetch
- Add integration test with mongodb-memory-server
- Add Storybook for `PlanGate` states
