# LuxGen Persona Pages — Class, Component & Functionality Reference

> **Purpose:** Authoritative design specification for four persona-specific sections of LuxGen LMS.  
> **Audience:** AI agents, developers, and architects building or modifying these pages.  
> **Stack:** Next.js 14 Pages Router · TypeScript · Tailwind CSS · iOS/macOS design tokens (`--lux-*`, `--color-*`)  
> **Pattern source:** `docs/SIDEBAR_REDESIGN.md` (sidebar), [technical/development/CODEBASE.md](./technical/development/CODEBASE.md) (full repo map)

---

## 0. Shared Conventions

### Page skeleton (copy-paste template)

```tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';

interface Props {
  tenant: string;
}

export default function PersonaPage({ tenant }: Props) {
  return (
    <>
      <Head>
        <title>Page Title — {tenant}</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser(tenant)}
        logo={getDefaultLogo(tenant)}
        onUserAction={(a) => {}}
        showSearch
        showNotifications
        notificationCount={0}
      >
        {/* page content */}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: any) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
```

### iOS utility classes (all defined in `apps/web/styles/globals.css`)

| Class                                       | Purpose                                               |
| ------------------------------------------- | ----------------------------------------------------- |
| `.ios-large-title`                          | 34px/700 section heading                              |
| `.ios-card`                                 | `--color-bg-secondary` surface, `--radius-xl` corners |
| `.ios-btn-primary`                          | `--color-blue` fill, pill shape                       |
| `.ios-btn-secondary`                        | Blue tint background                                  |
| `.ios-btn-plain`                            | Text-only blue button                                 |
| `.ios-avatar` + `.ios-avatar-{sm/md/lg/xl}` | Circular avatar with initials fallback                |
| `.ios-metric-tile`                          | KPI tile: value + label pair                          |
| `.ios-empty-state`                          | Centered empty placeholder                            |
| `.badge .badge-{blue/green/red/orange}`     | Status pill labels                                    |
| `.surface`                                  | Semi-transparent frosted card                         |

### LuxGen design tokens used in all persona pages

```css
var(--color-bg-primary)       /* page background */
var(--color-bg-secondary)     /* card/surface background */
var(--color-label-primary)    /* main text */
var(--color-label-secondary)  /* secondary text */
var(--color-blue)             /* primary action color */
var(--color-green)            /* success/progress */
var(--color-separator)        /* divider lines */
var(--radius-xl)              /* card corners */
var(--shadow-sm)              /* card elevation */
var(--transition-base)        /* hover transitions */
```

---

## 1. Customers Page — `/customers`

> **Who:** Learners, students — people consuming content in the LMS.  
> **Goal:** See progress, continue learning, find new courses, earn certificates.

### Route

`apps/web/pages/customers/index.tsx`

### Navigation item

```ts
{ id: 'customers', label: 'My Learning', href: '/customers', icon: <BookOpenIcon /> }
```

### Sections & CSS classes

#### 1.1 Hero / Progress Banner

```
.lux-learner-hero
  Gradient surface, large greeting, streak counter, today's goal.
  Children: .lux-streak-badge, .lux-goal-ring
```

| Property      | Value                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Background    | `linear-gradient(135deg, var(--color-blue) 0%, var(--color-indigo) 100%)` |
| Text color    | `#FFFFFF`                                                                 |
| Border radius | `var(--radius-xl)`                                                        |
| Padding       | `32px`                                                                    |
| Min height    | `160px`                                                                   |

#### 1.2 Continue Learning Strip

```
.lux-continue-strip
  Horizontal scroll row of in-progress course cards.
  Each card: .lux-course-progress-card
```

| Sub-class                   | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `.lux-course-progress-card` | 280×160px card — thumbnail, title, progress bar, resume CTA |
| `.lux-progress-bar`         | Full-width `8px` bar: `background: var(--color-green)`      |
| `.lux-progress-label`       | `"72% complete"` — `--color-label-secondary`, 13px          |
| `.lux-resume-btn`           | `.ios-btn-primary` — `"Resume"` label                       |

#### 1.3 Enrolled Courses Grid

```
.lux-enrolled-grid
  3-column CSS grid (1-col mobile, 2-col tablet, 3-col desktop).
  Each card: .lux-enrolled-card (extends .ios-card)
```

| Sub-class                   | Purpose                                                                      |
| --------------------------- | ---------------------------------------------------------------------------- |
| `.lux-enrolled-card`        | Full course card with thumbnail, title, instructor, progress, badge          |
| `.lux-course-thumbnail`     | `aspect-ratio: 16/9`, `object-fit: cover`, `border-radius: var(--radius-md)` |
| `.lux-course-meta`          | Instructor name + duration row, 13px secondary                               |
| `.lux-course-progress-ring` | SVG ring showing % complete — 48px diameter                                  |

#### 1.4 Certificates Row

```
.lux-cert-row
  Horizontal scroll, each item: .lux-cert-card
```

| Sub-class            | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `.lux-cert-card`     | Gold-border card: course name, date, download CTA |
| `.lux-cert-icon`     | Trophy SVG, `var(--color-yellow)`, 32px           |
| `.lux-cert-download` | `.ios-btn-plain` — `"Download PDF"`               |

#### 1.5 Recommended Courses

```
.lux-recommended-grid
  Same grid as enrolled, filtered by user preferences.
  Item: .lux-recommend-card — no progress ring, shows rating + enroll CTA.
```

### State shape

```ts
interface CustomerState {
  streak: number;
  enrolledCourses: EnrolledCourse[];
  certificates: Certificate[];
  recommended: Course[];
  goalMinutesToday: number;
  minutesDoneToday: number;
}
interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number; // 0–100
  duration: string;
  lastAccessedAt: string;
}
interface Certificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
  pdfUrl: string;
}
```

### Functional requirements

| #   | Behaviour                                                  |
| --- | ---------------------------------------------------------- |
| C1  | Continue Learning strip is sorted by `lastAccessedAt` desc |
| C2  | Progress bar animates on mount (CSS transition, 500ms)     |
| C3  | Certificate download opens new tab with PDF URL            |
| C4  | Recommended section hidden when all courses enrolled       |
| C5  | Streak counter resets to 0 if no activity for 24h          |
| C6  | Goal ring shows green when `minutesDone >= goalMinutes`    |

---

## 2. Analytics Page — `/analytics`

> **Who:** Admins, org owners, data-conscious instructors.  
> **Goal:** Track KPIs, understand learner behaviour, export reports.

### Route

`apps/web/pages/analytics/index.tsx`

### Navigation item

```ts
{ id: 'analytics', label: 'Analytics', href: '/analytics', icon: <ChartBarIcon /> }
```

### Sections & CSS classes

#### 2.1 KPI Metric Row

```
.lux-kpi-row
  Horizontal 4-column grid (2-col mobile, 4-col desktop).
  Each tile: .lux-kpi-tile (extends .ios-metric-tile)
```

| Sub-class        | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `.lux-kpi-tile`  | White card: large number, label, delta % badge                         |
| `.lux-kpi-value` | `font-size: 32px; font-weight: 700; color: var(--color-label-primary)` |
| `.lux-kpi-label` | `font-size: 13px; color: var(--color-label-secondary)`                 |
| `.lux-kpi-delta` | `+12%` — green if positive, red if negative                            |
| `.lux-kpi-icon`  | 40×40 tinted SVG icon, top-right corner                                |

KPI tiles: **Total Learners**, **Active This Month**, **Avg Completion Rate**, **Certificates Issued**

#### 2.2 Filter Bar

```
.lux-filter-bar
  Sticky below page header. Contains date range, group filter, export button.
```

| Sub-class            | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `.lux-date-range`    | Two `<input type="date">` fields — From / To      |
| `.lux-filter-select` | `<select>` for Group / Course filters             |
| `.lux-export-btn`    | `.ios-btn-secondary` — `"Export CSV"`             |
| `.lux-filter-reset`  | `.ios-btn-plain` — `"Reset"` — clears all filters |

#### 2.3 Enrollment Trend Chart

```
.lux-chart-card  (extends .ios-card)
  Wrapper: title bar + .lux-chart-wrapper (SVG/Canvas area, height 280px)
  No chart library required — render as placeholder rect with mock data points.
```

#### 2.4 Completion Rate Chart

```
.lux-donut-card  (extends .ios-card)
  SVG donut: completed (green) vs in-progress (blue) vs not-started (gray).
  Legend: .lux-donut-legend list.
```

#### 2.5 Top Courses Table

```
.lux-data-table-card  (extends .ios-card)
  Header row + sortable .lux-data-table rows.
  Columns: Rank, Course Name, Enrollments, Avg Progress, Completion Rate, Rating
```

| Sub-class                        | Purpose                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| `.lux-data-table`                | Full-width table, alternating row tint                        |
| `.lux-data-table thead`          | `background: var(--color-bg-tertiary)`, 11px uppercase labels |
| `.lux-data-table tbody tr:hover` | `background: var(--color-fill-tertiary)`                      |
| `.lux-sort-btn`                  | Inline sort chevron, toggles asc/desc                         |
| `.lux-table-pagination`          | Prev/Next + page indicator — same pattern as users.tsx        |

#### 2.6 Learner Activity Heatmap

```
.lux-heatmap-card  (extends .ios-card)
  7×52 grid of colored cells representing daily logins over the year.
  Cell: .lux-heat-cell — 12×12px, border-radius 3px
  Intensity levels: --color-fill-quaternary (0) → --color-green (5+)
```

### State shape

```ts
interface AnalyticsState {
  kpis: KPI[];
  dateRange: { from: string; to: string };
  groupFilter: string | null;
  enrollmentTrend: { date: string; count: number }[];
  completionBreakdown: { completed: number; inProgress: number; notStarted: number };
  topCourses: CourseRow[];
  heatmapData: { date: string; count: number }[];
  sortColumn: string;
  sortDir: 'asc' | 'desc';
}
```

### Functional requirements

| #   | Behaviour                                                        |
| --- | ---------------------------------------------------------------- |
| A1  | KPI delta compares current period vs previous same-length period |
| A2  | Filter bar changes apply to all charts simultaneously            |
| A3  | Export CSV downloads all currently-filtered data                 |
| A4  | Table supports multi-column sort (shift+click secondary)         |
| A5  | Date range defaults to last 30 days                              |
| A6  | Heatmap tooltip shows count + date on hover                      |
| A7  | Charts re-render when filter changes (no full-page reload)       |

---

## 3. Developer Agent AI Page — `/developer`

> **Who:** Technical admins, AI power users, builders configuring Ollama-backed agents.  
> **Goal:** Configure AI models, manage tools, run agent sessions, inspect reasoning traces.

### Route

`apps/web/pages/developer/index.tsx`
(Enhances / replaces `apps/web/pages/agent.tsx` — agent.tsx is kept for backwards compat)

### Navigation item

```ts
{ id: 'developer', label: 'AI Studio', href: '/developer', icon: <CpuChipIcon /> }
```

### Sections & CSS classes

#### 3.1 Model Configuration Panel

```
.lux-model-panel  (extends .ios-card)
  Left column (320px) — model selector, temperature, max tokens, system prompt.
```

| Sub-class                | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `.lux-model-selector`    | `<select>` listing available Ollama models      |
| `.lux-model-badge`       | Small pill: model name + size label             |
| `.lux-param-row`         | Label + range slider + numeric input pair       |
| `.lux-system-prompt`     | `<textarea>` — monospace font, 8-row min-height |
| `.lux-prompt-char-count` | Character count below textarea, secondary color |

#### 3.2 Tool Registry

```
.lux-tool-registry  (extends .ios-card)
  Grid of .lux-tool-tile — each available tool shown as a toggleable card.
```

| Sub-class          | Purpose                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| `.lux-tool-tile`   | 160×80px card: tool name, description, enable toggle                     |
| `.lux-tool-name`   | `font-size: 14px; font-weight: 600`                                      |
| `.lux-tool-desc`   | `font-size: 12px; color: var(--color-label-secondary)`                   |
| `.lux-tool-toggle` | iOS-style toggle switch — uses `<input type="checkbox">` styled with CSS |
| `.lux-tool-status` | `.badge .badge-green` when enabled, `.badge` (gray) when off             |

Available tools: `read_file`, `list_files`, `write_file`, `search_code`  
(source: `apps/web/lib/agent.ts`)

#### 3.3 Chat Interface

```
.lux-agent-chat
  Flex-column, fills remaining vertical space.
  .lux-chat-messages — scrollable message list
  .lux-chat-input-row — sticky bottom input bar
```

| Sub-class            | Purpose                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `.lux-chat-messages` | `flex: 1; overflow-y: auto; padding: 16px`                        |
| `.lux-msg-user`      | Right-aligned bubble, `background: var(--color-blue)`, white text |
| `.lux-msg-agent`     | Left-aligned, `.ios-card` surface                                 |
| `.lux-msg-tool-call` | Collapsible block: tool name + args + result — monospace          |
| `.lux-msg-thinking`  | Italic gray text inside `.lux-msg-agent`, shown during stream     |
| `.lux-chat-input`    | Full-width textarea, auto-grows, max 5 rows                       |
| `.lux-send-btn`      | `.ios-btn-primary` — `"Send"` — disabled while streaming          |

#### 3.4 Reasoning Trace Panel

```
.lux-trace-panel  (extends .ios-card)
  Collapsible right panel (320px) — step-by-step reasoning log.
  Each step: .lux-trace-step
```

| Sub-class              | Purpose                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| `.lux-trace-step`      | Numbered row: step type badge + content                                           |
| `.lux-trace-step-type` | `.badge .badge-blue` (thought) / `.badge-orange` (tool) / `.badge-green` (result) |
| `.lux-trace-content`   | Monospace pre block, capped at 200px, scrollable                                  |
| `.lux-trace-duration`  | `"142ms"` — `--color-label-tertiary`, 11px, right-aligned                         |

#### 3.5 Session History Drawer

```
.lux-session-history
  Bottom sheet (collapsed by default) listing past sessions.
  Each row: .lux-session-row
```

| Sub-class             | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `.lux-session-row`    | Session ID, first message preview, timestamp, message count        |
| `.lux-session-active` | `.lux-session-row` with `border-left: 3px solid var(--color-blue)` |

### State shape

```ts
interface DeveloperState {
  model: string;
  temperature: number; // 0.0 – 2.0
  maxTokens: number; // 256 – 4096
  systemPrompt: string;
  enabledTools: Set<string>;
  sessionId: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  trace: TraceStep[];
  sessions: SessionSummary[];
  traceOpen: boolean;
  historyOpen: boolean;
}
```

### Functional requirements

| #   | Behaviour                                                                                       |
| --- | ----------------------------------------------------------------------------------------------- |
| D1  | Model list populated from `GET /api/models` (proxied to `http://localhost:11434/api/tags`)      |
| D2  | System prompt pre-filled from `docs/technical/development/CODEBASE.md` first-action instruction |
| D3  | Tool toggle disabled state blocks tool from being sent in API request                           |
| D4  | Streaming response uses `ReadableStream` + `TextDecoder` (existing pattern in agent.tsx)        |
| D5  | Tool call blocks collapsed by default, expand on click                                          |
| D6  | Trace panel updates live during streaming                                                       |
| D7  | Session ID generated client-side in `useEffect` (fixes SSR hydration bug — see agent.tsx)       |
| D8  | Session history persisted in `localStorage` keyed by tenant + session ID                        |

---

## 4. Automation Creator Page — `/automations`

> **Who:** Operations admins, course managers, power users.  
> **Goal:** Create trigger-action workflows without writing code. E.g., "When a user completes a course → send certificate email + add to group."

### Route

`apps/web/pages/automations/index.tsx`

### Navigation item

```ts
{ id: 'automations', label: 'Automations', href: '/automations', icon: <BoltIcon /> }
```

### Sections & CSS classes

#### 4.1 Automation List Header

```
.lux-automations-header
  Page title, description, + "Create Automation" primary button.
  Same pattern as groups/index.tsx header row.
```

#### 4.2 Automation Status Tabs

```
.lux-tab-bar
  Three tabs: All | Active | Paused
  Active tab: border-bottom 2px solid var(--color-blue), --color-label-primary text
  Inactive tab: --color-label-secondary text
```

| Sub-class                        | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `.lux-tab`                       | `button` element, 14px/500, padding 8px 16px |
| `.lux-tab[aria-selected="true"]` | Active state styling                         |
| `.lux-tab-count`                 | `.badge .badge-blue` showing count           |

#### 4.3 Automation Cards Grid

```
.lux-automation-grid
  2-column grid (1-col mobile), gap 16px.
  Each card: .lux-automation-card (extends .ios-card)
```

| Sub-class                    | Purpose                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `.lux-automation-card`       | Automation name, trigger+action summary, toggle, run count  |
| `.lux-automation-header-row` | Name + enabled toggle (top of card)                         |
| `.lux-automation-name`       | `font-size: 16px; font-weight: 600`                         |
| `.lux-automation-toggle`     | iOS-style toggle, changes card's `.lux-automation-status`   |
| `.lux-automation-flow`       | Horizontal chips: `[Trigger]` → `[Action 1]` → `[Action 2]` |
| `.lux-trigger-chip`          | `.badge .badge-orange` — trigger label                      |
| `.lux-action-chip`           | `.badge .badge-blue` — action label                         |
| `.lux-flow-arrow`            | `→` separator, `--color-label-tertiary`                     |
| `.lux-automation-meta`       | Last run time + total run count — secondary text, 13px      |
| `.lux-automation-status`     | `.badge .badge-green` (active) / `.badge` (paused)          |
| `.lux-automation-actions`    | Edit + Duplicate + Delete icon buttons                      |

#### 4.4 Step Builder (Create / Edit Modal)

```
.lux-step-builder-modal
  Full-screen overlay (or slide-in drawer) for creating/editing an automation.
  Sections: Trigger Selection → Actions List → Save
```

| Sub-class                  | Purpose                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| `.lux-step-builder-modal`  | `position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.5)`        |
| `.lux-step-builder-sheet`  | `max-width: 640px; margin: auto; background: var(--color-bg-secondary)`      |
| `.lux-trigger-selector`    | Grid of trigger type cards: `.lux-trigger-option`                            |
| `.lux-trigger-option`      | Selectable card: icon + label + description — selected state has blue border |
| `.lux-action-list`         | Ordered list of `.lux-action-block` items                                    |
| `.lux-action-block`        | Numbered block: action type selector + parameter inputs                      |
| `.lux-action-add-btn`      | `+ Add Action` — `.ios-btn-secondary`, dashed border                         |
| `.lux-action-remove-btn`   | `×` icon button, top-right of `.lux-action-block`                            |
| `.lux-step-builder-footer` | `Cancel` + `Save Automation` buttons                                         |

#### 4.5 Run History Panel

```
.lux-run-history  (extends .ios-card)
  Below the grid. Table of recent automation executions.
  Columns: Automation Name, Triggered At, Status, Duration, Details
```

| Sub-class             | Purpose                             |
| --------------------- | ----------------------------------- |
| `.lux-run-success`    | `--color-green` status indicator    |
| `.lux-run-error`      | `--color-red` status indicator      |
| `.lux-run-detail-btn` | `.ios-btn-plain` — opens log drawer |

### Available Triggers

| ID                   | Label              | Description                            |
| -------------------- | ------------------ | -------------------------------------- |
| `course_completed`   | Course Completed   | Fires when a learner finishes a course |
| `user_enrolled`      | User Enrolled      | Fires when a user joins a course       |
| `group_joined`       | Group Joined       | Fires when a user joins a group        |
| `certificate_issued` | Certificate Issued | Fires when a certificate is generated  |
| `schedule`           | Scheduled          | Fires on a cron schedule               |
| `webhook`            | Webhook            | Fired by external HTTP POST            |

### Available Actions

| ID                  | Label             | Description                           |
| ------------------- | ----------------- | ------------------------------------- |
| `send_email`        | Send Email        | Email to learner or admin             |
| `add_to_group`      | Add to Group      | Add user to a LuxGen group            |
| `remove_from_group` | Remove from Group | Remove user from a group              |
| `enroll_in_course`  | Enroll in Course  | Auto-enroll user in next course       |
| `issue_certificate` | Issue Certificate | Generate & email certificate          |
| `call_webhook`      | Call Webhook      | POST data to an external URL          |
| `notify_slack`      | Notify Slack      | Post to a configured Slack channel    |
| `tag_user`          | Tag User          | Add a metadata tag to the user record |

### State shape

```ts
interface AutomationsState {
  automations: Automation[];
  activeTab: 'all' | 'active' | 'paused';
  builderOpen: boolean;
  editingId: string | null;
  runHistory: AutomationRun[];
}
interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { type: TriggerType; config: Record<string, string> };
  actions: { type: ActionType; config: Record<string, string> }[];
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
}
interface AutomationRun {
  id: string;
  automationId: string;
  automationName: string;
  triggeredAt: string;
  status: 'success' | 'error' | 'running';
  durationMs: number;
  error?: string;
}
```

### Functional requirements

| #   | Behaviour                                                                         |
| --- | --------------------------------------------------------------------------------- |
| AU1 | Tab filter is client-side — no refetch                                            |
| AU2 | Toggle switches automation.enabled — optimistic UI update                         |
| AU3 | Step builder validates: exactly one trigger, at least one action                  |
| AU4 | Action blocks can be reordered by drag (future phase — use index buttons for now) |
| AU5 | Run history shows last 50 executions, newest first                                |
| AU6 | Duplicate creates a copy with `name + " (copy)"`, enabled: false                  |
| AU7 | Delete shows confirmation dialog before removal                                   |

---

## 5. Navigation Data Model

Update `DefaultNavigation.tsx` (or `getDefaultSidebarSections()`) to include these four entries:

```ts
const MAIN_NAV: NavSection[] = [
  {
    id: 'learn',
    items: [
      { id: 'dashboard',   label: 'Dashboard',   href: '/dashboard',   icon: <SquaresIcon /> },
      { id: 'customers',   label: 'My Learning',  href: '/customers',   icon: <BookOpenIcon /> },
      { id: 'courses',     label: 'Courses',      href: '/courses',     icon: <AcademicCapIcon /> },
      { id: 'groups',      label: 'Groups',       href: '/groups',      icon: <UserGroupIcon /> },
      { id: 'users',       label: 'Users',        href: '/users',       icon: <UsersIcon /> },
    ]
  },
  {
    id: 'data',
    title: 'Insights',
    showTitle: true,
    separator: true,
    items: [
      { id: 'analytics',   label: 'Analytics',    href: '/analytics',   icon: <ChartBarIcon /> },
    ]
  },
  {
    id: 'build',
    title: 'Build',
    showTitle: true,
    separator: true,
    items: [
      { id: 'developer',   label: 'AI Studio',    href: '/developer',   icon: <CpuChipIcon /> },
      { id: 'automations', label: 'Automations',  href: '/automations', icon: <BoltIcon /> },
    ]
  }
];
```

---

## 6. File Change Table

| File                                     | Status                               | Phase   |
| ---------------------------------------- | ------------------------------------ | ------- |
| `apps/web/pages/customers/index.tsx`     | **CREATE**                           | Phase 2 |
| `apps/web/pages/analytics/index.tsx`     | **CREATE**                           | Phase 2 |
| `apps/web/pages/developer/index.tsx`     | **CREATE**                           | Phase 2 |
| `apps/web/pages/automations/index.tsx`   | **CREATE**                           | Phase 2 |
| `apps/web/styles/globals.css`            | **UPDATE** — add persona CSS classes | Phase 2 |
| `apps/web/components/layout/Sidebar.tsx` | **UPDATE** — add 4 nav items         | Phase 2 |
| `docs/PERSONA_PAGES.md`                  | **THIS FILE**                        | Phase 1 |

---

## 7. CSS Class Master Index

All classes below must be added to `apps/web/styles/globals.css` (or a new `apps/web/styles/personas.css` imported from globals.css).

### Customer classes

`.lux-learner-hero` `.lux-streak-badge` `.lux-goal-ring`  
`.lux-continue-strip` `.lux-course-progress-card` `.lux-progress-bar` `.lux-progress-label` `.lux-resume-btn`  
`.lux-enrolled-grid` `.lux-enrolled-card` `.lux-course-thumbnail` `.lux-course-meta` `.lux-course-progress-ring`  
`.lux-cert-row` `.lux-cert-card` `.lux-cert-icon` `.lux-cert-download`  
`.lux-recommended-grid` `.lux-recommend-card`

### Analytics classes

`.lux-kpi-row` `.lux-kpi-tile` `.lux-kpi-value` `.lux-kpi-label` `.lux-kpi-delta` `.lux-kpi-icon`  
`.lux-filter-bar` `.lux-date-range` `.lux-filter-select` `.lux-export-btn` `.lux-filter-reset`  
`.lux-chart-card` `.lux-chart-wrapper` `.lux-donut-card` `.lux-donut-legend`  
`.lux-data-table-card` `.lux-data-table` `.lux-sort-btn` `.lux-table-pagination`  
`.lux-heatmap-card` `.lux-heat-cell`

### Developer AI classes

`.lux-model-panel` `.lux-model-selector` `.lux-model-badge` `.lux-param-row` `.lux-system-prompt` `.lux-prompt-char-count`  
`.lux-tool-registry` `.lux-tool-tile` `.lux-tool-name` `.lux-tool-desc` `.lux-tool-toggle` `.lux-tool-status`  
`.lux-agent-chat` `.lux-chat-messages` `.lux-msg-user` `.lux-msg-agent` `.lux-msg-tool-call` `.lux-msg-thinking` `.lux-chat-input` `.lux-send-btn`  
`.lux-trace-panel` `.lux-trace-step` `.lux-trace-step-type` `.lux-trace-content` `.lux-trace-duration`  
`.lux-session-history` `.lux-session-row` `.lux-session-active`

### Automation classes

`.lux-automations-header`  
`.lux-tab-bar` `.lux-tab` `.lux-tab-count`  
`.lux-automation-grid` `.lux-automation-card` `.lux-automation-header-row` `.lux-automation-name` `.lux-automation-toggle`  
`.lux-automation-flow` `.lux-trigger-chip` `.lux-action-chip` `.lux-flow-arrow`  
`.lux-automation-meta` `.lux-automation-status` `.lux-automation-actions`  
`.lux-step-builder-modal` `.lux-step-builder-sheet` `.lux-trigger-selector` `.lux-trigger-option`  
`.lux-action-list` `.lux-action-block` `.lux-action-add-btn` `.lux-action-remove-btn` `.lux-step-builder-footer`  
`.lux-run-history` `.lux-run-success` `.lux-run-error` `.lux-run-detail-btn`

---

## 8. Implementation Rules for AI Agents

1. **Always use `--lux-*` or `--color-*` tokens** — never hardcode hex values.
2. **Use `.ios-card` as the base** for any new card component — extend with persona-specific classes.
3. **No chart library** — render chart placeholders as styled SVG rects or CSS grid cells until a library is chosen and approved.
4. **All pages require `getServerSideProps`** — extract tenant from `ctx.query.tenant`.
5. **Mock data inline** — no external API calls until backend endpoints are confirmed.
6. **No third-party component libraries** — use existing `@luxgen/ui` exports + iOS classes.
7. **Mobile-first** — all grids collapse to 1 column at `max-width: 640px`.
8. **Do not modify `agent.tsx`** — `/developer` is a new enhanced page; agent.tsx is kept.
