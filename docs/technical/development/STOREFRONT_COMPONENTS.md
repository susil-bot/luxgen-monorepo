# Storefront landing components (UI-184)

| Component | Route | Use when |
| --------- | ----- | -------- |
| `SimpleHomeWelcome` | `/` (`pages/index.tsx`) | Default tenant home — minimal welcome for all subdomains |
| `LearnifyStorefront` | `/store`, `/store/mentors` | Full commerce storefront with branding, categories, GPT assistant |

`StorefrontLanding` re-exports `LearnifyStorefront` for legacy imports.

Only one landing template renders per route; there is no double-mount.
