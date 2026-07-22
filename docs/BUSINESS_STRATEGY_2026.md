# LuxGen — Business Strategy & Product Positioning (2026)

> **Status:** Canonical product direction document  
> **Audience:** Founders, investors, engineers, mobile team  
> **Companion:** `docs/GRAPHQL_PLATFORM.md`, `docs/AGENT_STUDIO_ARCHITECTURE.md`

---

## 1. Executive Summary

**LuxGen is an AI-native, multi-tenant learning & automation platform (LMS+) for organizations that sell or deliver training — not a generic website builder and not a dev tool.**

What exists in the monorepo today:

| Layer | What we built | Monetizable value |
|-------|---------------|-------------------|
| **Core LMS** | Courses, groups, users, dashboards, learner (`/customers`) & admin personas | Training delivery |
| **Multi-tenancy** | Subdomain tenants (`demo`, `idea-vibes`), branding, plans | White-label SaaS |
| **Automations** | Trigger → action workflows (UI + Phase 7 GraphQL backend) | Ops efficiency, upsell |
| **Agent Studio** | AI that changes the codebase with approval + git pipeline | Enterprise differentiation |
| **GraphQL API** | Single backend for web + mobile | Platform scale |
| **Analytics** | Admin metrics, group/course analytics | Revenue intelligence |

**Recommended 2026 wedge:** *TrainOS for teams under 500* — coaches, bootcamps, and L&D teams who outgrew Teachable/Thinkific but cannot afford Cornerstone + custom dev.

**Primary buyer:** Head of L&D, agency owner, or creator-operator who needs **branded training + automations + optional AI customization** without hiring engineers.

---

## 2. Problem We Solve

| Pain (buyer) | Current workaround | LuxGen answer |
|--------------|-------------------|---------------|
| "My LMS doesn't match our brand" | Duct-tape WordPress + plugins | Multi-tenant white-label |
| "Completion doesn't trigger sales ops" | Zapier glue, brittle | Native automations + webhooks |
| "We need mobile for field staff" | Separate vendor | Same GraphQL API → mobile app |
| "Custom features cost $50k" | Agency sprints | Agent Studio (approved AI changes) |
| "Compliance needs audit trails" | Spreadsheets | Agent audit log + automation run history |

---

## 3. Who We Are NOT Building For (filter early)

| Segment | Why skip (for now) |
|---------|-------------------|
| K-12 school districts | Long sales cycles, procurement, low ARPU |
| Consumer MOOC at Coursera scale | Content + marketing spend, not platform |
| Pure developer tools market | Competes with Cursor/Devin; Agent Studio is a *feature*, not the product |
| Enterprise 10k+ employees | Needs SOC2, SCORM, HRIS — Phase 2+ only |

---

## 4. Target Niches — Ranked for 2026 AI Era

Scoring: **TAM access** · **willingness to pay** · **fit with current codebase** · **AI differentiation**

| Rank | Niche | ICP (ideal customer) | Price band | Why now (2026) |
|------|-------|----------------------|------------|----------------|
| **1** | **Creator-coach & cohort bootcamps** | 1–20 person training businesses, $500k–$5M revenue | $79–$299/mo | AI automations for onboarding, certificates, upsells; mobile for learners |
| **2** | **Corporate L&D (50–500 employees)** | HR/L&D manager, professional services, SaaS companies | $299–$999/mo | Replace Thinkific + Zapier; compliance-friendly audit from Agent Studio |
| **3** | **Franchise & field training** | Retail, hospitality, healthcare clinics (multi-location) | $499–$1.5k/mo | Subdomain per franchisee; mobile-first learners |
| **4** | **Compliance micro-vertical** | HIPAA/OSHA training providers | $199–$799/mo | Certificates + automations + audit logs |
| **5** | **Agency white-label** | Digital agencies reselling to clients | $199/mo + per-tenant | Multi-tenant already built |

### Recommended beachhead (pick ONE for first 12 months)

**Niche #1 + #2 hybrid: "Branded training platform for expert-led businesses"**

- **Buyer persona:** *Alex — Operator* (runs a 6-person coaching firm, 800 active learners, uses Stripe + Zoom, frustrated with Kajabi limits)
- **User persona:** *Learner* (mobile app), *Admin* (web dashboard), *Alex* (automations + optional Agent Studio on Enterprise)

---

## 5. Product Definition — What the Monorepo IS

```
LuxGen = Multi-tenant LMS + Automation Engine + (Enterprise) AI Customization Layer
```

### Applications in the monorepo

| App | Role | Audience |
|-----|------|----------|
| `apps/web` | Admin, creator, agent studio, automations | Operators, admins, developers |
| `apps/api` | **GraphQL source of truth** | Web, mobile, integrations |
| `apps/agent-worker` | Headless AI jobs | Internal / Enterprise |
| `apps/mobile` *(planned alongside)* | Learner experience | End learners |
| `packages/ui` | Shared design system (web); tokens inform mobile | All frontends |
| `packages/agent` | AI change management | Enterprise tier |

### GraphQL-first rule (web + mobile)

All new features **must** ship as GraphQL types in `apps/api` first. Web and mobile are thin clients. See `docs/GRAPHQL_PLATFORM.md`.

---

## 6. Monetization Model

### Pricing tiers (suggested launch)

| Tier | Monthly | Includes | Agent Studio |
|------|---------|----------|--------------|
| **Starter** | $49 | 1 tenant, 100 learners, courses, groups | ❌ |
| **Pro** | $149 | 500 learners, automations, analytics, mobile app | ❌ |
| **Business** | $349 | 2k learners, webhooks, priority support, custom domain | Preview |
| **Enterprise** | Custom | Unlimited tenants, Agent Studio, git pipeline, SLA | ✅ |

### Revenue streams

1. **SaaS subscription** (primary)
2. **Usage overages** — learners, automation runs, agent task minutes
3. **White-label setup fee** — $2k–$10k one-time
4. **Marketplace** (future) — automation templates, agent skills ($19–$99)

### Unit economics targets (Year 1)

| Metric | Target |
|--------|--------|
| ARPA (avg revenue per account) | $180/mo |
| CAC payback | < 8 months |
| Gross margin | > 75% (SaaS + MongoDB/Redis) |
| Logo churn (annual) | < 15% |

---

## 7. Competitive Edge in the AI Era (2026)

| Competitor | Their gap | LuxGen edge |
|------------|-----------|-------------|
| Teachable / Kajabi | Weak B2B, no real automations | Native workflows + GraphQL |
| Thinkific + Zapier | Integration tax, no mobile parity | One API, one data model |
| Cornerstone / Docebo | Expensive, slow to customize | Agent Studio for approved customizations |
| Notion / generic AI | Not LMS-native | Learning events as first-class triggers |
| Cursor / Devin | Dev-only, no tenant context | AI inside *your* branded product |

**Moat stack:** Multi-tenant data · Automation graph · Audit trail · GraphQL contract · Optional git-backed AI changes.

---

## 8. Go-to-Market (first 90 days)

| Week | Focus | Success metric |
|------|-------|----------------|
| 1–4 | Ship GraphQL automations + wire web UI | 3 design partners on Pro waitlist |
| 5–8 | Mobile MVP (learner: courses, progress) | Same GraphQL, 1 pilot tenant |
| 9–12 | Paid beta — 10 customers at $149/mo | $1.5k MRR, <5% weekly churn |

**Channels:** LinkedIn (L&D + creator operators), partner agencies, "Thinkific alternative" SEO, Product Hunt.

---

## 9. Roadmap Aligned to Revenue

| Phase | Engineering | Business outcome |
|-------|-------------|------------------|
| **7** *(now)* | GraphQL automations + Agent bridge | Demo-able workflows; design partner ready |
| **8** | Mobile app (Expo) on GraphQL | Learner retention; Pro tier justified |
| **9** *(shipped)* | Billing (Stripe) + plan gates | Monetization live |
| **10** *(shipped)* | Marketplace templates + usage metering | Expansion revenue |

---

## 10. Decisions Required (founder checklist)

- [ ] **Confirm beachhead:** Creator-coach vs corporate L&D (recommend hybrid)
- [ ] **Mobile scope v1:** Learner-only (recommended) vs full admin
- [ ] **Agent Studio tier:** Enterprise-only (recommended) vs Pro add-on
- [ ] **First paid feature gate:** Automations on Pro (recommended)

---

## 11. KPI Dashboard (track monthly)

| KPI | Definition |
|-----|------------|
| MRR | Paid tenant subscriptions |
| Active learners | MAU on learner/mobile |
| Automation runs | Executions per tenant (usage billing) |
| Agent tasks | Enterprise engagement |
| Time-to-value | Signup → first course published |

---

## 12. One-Line Pitch

**LuxGen helps expert-led businesses deliver branded training on web and mobile, automate learner journeys, and — on Enterprise — safely customize their platform with AI — all on one GraphQL backend.**

---

*Document owner: Product. Review quarterly. Last updated: Phase 7 implementation.*
