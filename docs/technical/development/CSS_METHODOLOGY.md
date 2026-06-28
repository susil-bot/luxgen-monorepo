# CSS methodology (UI-11)

LuxGen web styling uses a **layered** approach. Pick the right layer for each concern — do not mix inline styles for layout that belongs in tokens or utilities.

## Primary stack (use first)

| Layer | Where | Use for |
| ----- | ----- | ------- |
| **Design tokens** | `apps/web/styles/globals.css` (`:root`, `[data-tenant]`) | Colours, spacing, typography, radii — `var(--color-blue)`, `var(--space-4)` |
| **iOS system classes** | `globals.css` (`.ios-btn-primary`, `.ios-card`, `.ios-large-title`) | Buttons, cards, nav chrome consistent with `@luxgen/ui` |
| **Tailwind utilities** | `className` on pages/components | Layout (flex/grid), responsive breakpoints, one-off spacing |

## Rules

1. **Colours** — prefer `var(--color-*)` over hex literals.
2. **Spacing** — use Tailwind (`p-4`, `gap-2`) or token variables; avoid magic pixel inline styles.
3. **Component CSS** — co-locate in `*.css` or `*.module.css` under `packages/ui/src/`; import from `_app.tsx` or the component.
4. **Inline `style={{}}`** — only for dynamic values (computed widths, graph positions). Never for static colours or padding.
5. **New pages** — wrap content in `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
