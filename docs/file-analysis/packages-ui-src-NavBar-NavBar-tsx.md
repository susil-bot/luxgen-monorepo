# NavBar.tsx — Deep Analysis (Hand-enriched)

## File Path

`packages/ui/src/NavBar/NavBar.tsx` (401 lines)

## Purpose

**Primary application chrome** for authenticated and guest users. Renders:

- Logo + optional super-admin tenant switcher
- Global search (`SearchBar`)
- Theme toggle (light/dark)
- AI Studio trigger
- Notifications bell
- **User menu** OR **Login + Sign Up** (guest)

**Critical auth rule:** When `user` prop is `undefined`, show guest auth buttons — never fabricate a default user.

## Exports

| Export | Type |
|--------|------|
| `UserMenu` | Interface |
| `NavTenantSwitchProps` | Interface |
| `NavBarProps` | Interface |
| `NavBar` | Component (wrapped with `withSSR`) |

## Design Pattern

**Controlled shell component** — all actions delegated via callbacks (`onUserAction`, `onSearch`, `onThemeToggle`).

---

## State & Re-render Triggers

| State | Line | Trigger |
|-------|------|---------|
| `isMobileMenuOpen` | 72 | User menu dropdown |
| `isTenantMenuOpen` | 73 | Super-admin tenant picker |
| `mobileSearchOpen` | 74 | Mobile search overlay |

**Re-renders when:** Any state changes; parent passes new `user`, `notificationCount`, `isDarkMode`.

**No `useMemo`/`useCallback`** — acceptable for top bar; optimize only if profiling shows cost.

---

## Key Functions

### `isSuperAdminRole` — Line 48

```typescript
const isSuperAdminRole = (role?: string) => (role ?? '').toUpperCase() === 'SUPER_ADMIN';
```

- **Pure:** O(1)
- **Shows tenant switcher** only when role is SUPER_ADMIN and `tenantSwitch.tenants.length > 0`

---

### `handleAIStudioClick` — Lines 80–86

1. Prefer `onAIStudioClick` prop if provided
2. Else `aiStudio?.toggle()` from `useAIStudioOptional()`

**Pattern:** Optional context + override prop — app can customize behavior.

---

### `useEffect` click-outside — Lines 88–99

- Closes mobile menu and tenant menu on `mousedown` outside refs
- **Cleanup:** removes listener
- **Interview:** Why `mousedown` not `click`? — Fires before blur; standard dropdown pattern

---

### Guest vs authenticated branch — Lines 318–393

```tsx
{user ? (
  // Dropdown: Profile, Settings, Log out → onUserAction
) : (
  // Login + Sign Up links
)}
```

| Branch | UX |
|--------|-----|
| `user` truthy | Avatar + dropdown |
| `user` undefined | Login + Sign Up visible |

**Red flag in code review:** `user = getDefaultUser()` default param — **never do this** (hides Login).

---

## Props wiring from `apps/web`

Typically via `useAppLayoutHeader()`:

| Prop | Source |
|------|--------|
| `showSearch` | `true` |
| `onSearch` | Navigate to `/search` or client filter |
| `showThemeToggle` | `useTheme().toggleTheme` |
| `showNotifications` | When `sessionOk` |
| `notificationCount` | `useNotificationCount()` |
| `onUserAction` | `createHandleUserAction(router)` — logout confirms in user-actions |

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| `<nav aria-label="Main navigation">` | Line 107 |
| Tenant button `aria-expanded` | Line 149 |
| Theme toggle `aria-label` | Line 231 |
| Guest group `role="group"` | Line 382 |
| Focus rings on Login/Sign Up | `focus-visible:ring` |

---

## Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| `sm:` and up | Full search bar inline; Login + Sign Up both visible |
| Mobile | Search icon toggles overlay; Sign Up only (compact) |

---

## Performance

- Fixed position (`zIndex: 50`) — paint on scroll
- SearchBar may debounce internally
- Notification polling in parent (`useNotificationCount`) — not NavBar's job

---

## Interview questions

| Level | Question |
|-------|----------|
| Easy | Controlled vs uncontrolled — is NavBar controlled? |
| Medium | How do you show Login for guests without flashing user name on SSR? |
| Hard | Design NavBar for micro-frontends (federated modules) |
| Behavioral | "Tell me about an auth UI bug you fixed" |

**Strong answer:** Default user param caused Login to disappear; fixed by `user={undefined}` + session helpers.

---

## Possible improvements

1. Extract `UserMenuDropdown` subcomponent
2. Use `useCallback` for menu handlers if passed to memoized children
3. Keyboard nav for tenant dropdown (Arrow keys)
4. Logout confirmation in NavBar vs `user-actions` — currently in `createHandleUserAction`

## Refactor sketch

```tsx
// NavBarGuestActions.tsx + NavBarUserMenu.tsx — smaller test units
```

## Related

- [apps-web-lib-session-ts.md](./apps-web-lib-session-ts.md)
- [apps-web-lib-user-actions-ts.md](./apps-web-lib-user-actions-ts.md)
- [interview-prep/03-react.md](../interview-prep/03-react.md)
- `.cursor/rules/auth-session.mdc`
