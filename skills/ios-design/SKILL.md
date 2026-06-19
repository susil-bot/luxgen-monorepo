# Skill: iOS/macOS Design System

**Domain:** Any UI work — new pages, components, colours, typography, spacing, dark mode.  
**Primary reference:** `apps/web/styles/globals.css`  
**Full spec:** `CODEBASE.md` § iOS Design System

---

## Token Cheat-Sheet

```css
/* Backgrounds */
var(--color-bg-primary)      /* page background   — #F2F2F7 light / #000 dark */
var(--color-bg-secondary)    /* card surface       — #FFF light / #1C1C1E dark */
var(--color-bg-tertiary)     /* raised surface     — #EFEFF4 light / #2C2C2E dark */

/* Text */
var(--color-label-primary)   /* body text */
var(--color-label-secondary) /* captions, meta */
var(--color-label-tertiary)  /* placeholder, disabled */

/* Accent colours */
var(--color-blue)            /* #007AFF light / #0A84FF dark */
var(--color-green)           /* #34C759 light / #30D158 dark */
var(--color-red)             /* #FF3B30 light / #FF453A dark */
var(--color-orange)          /* #FF9500 / #FF9F0A */
var(--color-yellow)          /* #FFCC00 / #FFD60A */
var(--color-purple)          /* #AF52DE / #BF5AF2 */

/* Separators & fills */
var(--color-separator)       /* divider lines */
var(--color-fill-tertiary)   /* subtle tint background */
var(--color-fill-quaternary) /* very subtle tint */

/* Radius */
var(--radius-sm)   /* 6px  — small chips */
var(--radius-md)   /* 10px — inputs, small cards */
var(--radius-lg)   /* 14px — modals */
var(--radius-xl)   /* 20px — page cards */
var(--radius-full) /* 9999px — pills, toggles */

/* Shadows */
var(--shadow-sm)   /* card resting */
var(--shadow-md)   /* card hover */
var(--shadow-lg)   /* dropdowns */

/* Transitions */
var(--transition-fast)   /* 120ms */
var(--transition-base)   /* 200ms */
var(--transition-spring) /* 400ms cubic spring */
```

---

## Utility Classes (all in globals.css)

| Class | Use |
|---|---|
| `.ios-large-title` | 34px/700 section heading |
| `.ios-card` | card surface with `--radius-xl` and shadow |
| `.ios-btn-primary` | filled blue pill button |
| `.ios-btn-secondary` | blue-tint outline button |
| `.ios-btn-plain` | text-only blue link-button |
| `.ios-avatar` + `.ios-avatar-{sm/md/lg/xl}` | circular avatar |
| `.ios-metric-tile` | KPI value+label tile |
| `.ios-empty-state` | centered empty placeholder |
| `.ios-spinner` | loading spinner |
| `.ios-form-group` | label+input pair |
| `.badge` | neutral pill label |
| `.badge-blue/green/red/orange` | coloured pill |
| `.surface` | frosted glass card |

---

## Mandatory Rules

1. **No raw hex values in JSX** — always use `var(--color-*)`.
2. **No Tailwind colour utilities** — `bg-white`, `text-gray-*`, `border-gray-*` are banned.
3. Layout Tailwind is fine: `flex`, `grid`, `gap-*`, `p-*`, `overflow-*`.
4. Cards use `.ios-card` or `background: var(--color-bg-secondary); border-radius: var(--radius-xl)`.
5. Dark mode is automatic — every `--color-*` token has both light and dark values in `:root` / `html.dark`.
6. **Mobile first** — grids collapse to 1-column at `max-width: 640px`.

---

## Page Shell (copy exactly)

```tsx
import Head from 'next/head';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';

export default function MyPage({ tenant }: { tenant: string }) {
  return (
    <>
      <Head><title>Page Title — {tenant}</title></Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
        onUserAction={() => {}}
        showSearch showNotifications notificationCount={0}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 className="ios-large-title">Page Title</h1>
          {/* content */}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: any) => ({
  props: { tenant: ctx.query.tenant || 'demo' }
});
```

---

## LuxGen-Specific Classes (prefix `lux-`)

These are defined in `globals.css` under the "Persona Page Classes" block:

- **Customer:** `.lux-learner-hero`, `.lux-course-progress-card`, `.lux-progress-bar`, `.lux-enrolled-grid`, `.lux-cert-card`
- **Analytics:** `.lux-kpi-tile`, `.lux-kpi-value`, `.lux-filter-bar`, `.lux-chart-card`, `.lux-data-table`, `.lux-heat-cell`
- **AI Studio:** `.lux-model-panel`, `.lux-tool-tile`, `.lux-agent-chat`, `.lux-msg-user`, `.lux-msg-agent`, `.lux-trace-panel`
- **Automations:** `.lux-automation-card`, `.lux-trigger-chip`, `.lux-action-chip`, `.lux-step-builder-modal`
- **Sidebar:** `.lux-sidebar`, `.lux-nav-item`, `.lux-subnav`, `.lux-search`, `.lux-tooltip`

Full class inventory: `docs/PERSONA_PAGES.md` § 7 and `packages/ui/src/Sidebar/sidebar.css`.
