
# Automation Hub — Cross-Industry Expansion Strategy & IA

> Status: Proposal for review · Owner: Product/Eng · Builds on: `docs/BUSINESS_STRATEGY_2026.md`, `docs/AUTOMATION_FLOW_SCHEMA.md`, `docs/FEATURE_CATALOG.md`

## TL;DR

Auth is done. The next unlock isn't a new product — it's **surfacing what you already built as a horizontal automation platform**. `@luxgen/automation-flow` (the Tower trigger→condition→action graph) is architecturally identical to Shopify Flow / Zapier: namespaced compounds (`{domain}.{entity}.{event}`), a graph engine, a marketplace, plan gates, usage metering. Today it only ships `commerce.*`, `learner.*`, `core.*`, `developer.*` compounds because the product is scoped to LMS+commerce. The fastest path to "solve most automation use cases across industries" is **not a rewrite** — it's adding industry-tagged compound packs and templates on top of the engine you already shipped in Phase 7/10.

This doc: (1) applies a problem-selection framework to pick which industries to target first, (2) proposes the sub-menu / page IA for a new **Automation Hub**, and (3) maps each target industry's core pain to specific triggers/actions — noting what exists vs. what's net-new.

---

## 1. What you already have (don't rebuild this)

| Piece | Where | Reusable for any industry? |
|---|---|---|
| Flow graph engine (trigger → condition → action → wait, branching) | `packages/automation-flow/src/{graph,runtime,validate}.ts` | Yes — domain-agnostic |
| Compound catalog (namespaced triggers/conditions/actions) | `packages/automation-flow/src/catalog/compounds.ts` | Yes — just add new compounds |
| Execution bridge | `packages/agent/src/automation/bridge.ts` | Yes — one handler per compound |
| Marketplace (one-click install templates) | `marketplaceService.ts`, `/marketplace` | Yes — needs industry filter |
| Plan gates + usage metering | `@luxgen/billing`, `TenantUsageMonthly` | Yes — already tenant-scoped |
| Multi-tenant subdomains + white-label | Core platform | Yes — this is your moat vs. Zapier (branded, embedded, not a separate tool) |

Current compound categories are only `commerce`, `learner`, `core`, `developer`. That's the entire gap.

---

## 2. Problem selection (why these industries, not others)

Borrowing the "fix one parameter, float the rest" principle: **fix the engine and the beachhead (training/coaching businesses per `BUSINESS_STRATEGY_2026.md`)**, and let the *vertical compound packs* be the flexible parameter you experiment with. Don't re-litigate the core LMS+commerce bet — extend outward from it into industries that already touch your existing triggers (enrollment, completion, orders, payments) rather than inventing unrelated domains (that's the "avoid multiple miracles" risk check — an industry pack that needs zero new infrastructure is low-risk; one needing a new data model is a miracle you should be wary of stacking with others).

**Screen:** does the industry's core pain map onto `enrollment`, `completion`, `order/payment`, `schedule`, or `webhook` triggers with only new *actions* (not new *infrastructure*)? If yes → cheap to ship. If no → defer.

| Criterion | Weight | Why |
|---|---|---|
| Reuses existing triggers (enrollment/order/schedule) | High | Zero new data model risk |
| Solo/small-team buildable (new compounds, not new services) | High | You're a small team post-auth, pre-scale |
| Fits current ICP adjacency (training, coaching, agencies, franchises — from `BUSINESS_STRATEGY_2026.md` §4) | High | Don't dilute the beachhead |
| Clear willingness-to-pay signal (compliance, franchise, agency budgets are well documented) | Medium | De-risks pricing |
| Requires genuinely new AI/ML | Low priority for v1 | Adds time-to-ship without proportional differentiation yet |

---

## 3. Cross-industry problem map

Each row: the industry pain, the compound(s) it needs, and whether that compound exists today or is net-new.

| Industry | Core "automation" pain | Trigger(s) | Action(s) | Build status |
|---|---|---|---|---|
| **Coaching / cohort bootcamps** (current beachhead) | Manual onboarding, drip content, certificate chasing | `learner.user.enrolled`, `learner.course.completed` ✅ existing | `learner.course.enroll`, `core.notification.send_email` ✅ existing | Ship templates only |
| **Franchise / multi-location retail & healthcare clinics** | Rolling out mandatory training + tracking per-location compliance | `learner.user.enrolled`, `core.schedule.cron` ✅ | new: `learner.certificate.expiring` (recert reminder), `core.notification.send_sms` | Mostly existing + 1–2 new compounds |
| **Compliance training providers (HIPAA/OSHA)** | Recertification deadlines, audit trail for inspectors | `core.schedule.cron` ✅ | new: `learner.recert.reminder`, new: `core.report.generate_audit_pdf` | New action, reuses schedule trigger |
| **Agencies reselling white-label** | Client onboarding checklist, recurring status reports to clients | `commerce.order.created` (new client signs) ✅ | new: `core.report.send_client_summary` (uses existing usage/analytics data) | Mostly existing |
| **E-commerce / retail (beyond current commerce triggers)** | Abandoned cart, post-purchase review requests, inventory-linked upsell | `commerce.order.drafted` ✅, `commerce.order.created` ✅ | new: `commerce.cart.abandoned_reminder`, new: `commerce.order.request_review` | Small net-new set, same domain |
| **HR / People ops (internal training angle)** | New-hire onboarding sequences, review-cycle reminders | `learner.user.enrolled` ✅ (map "employee" onto learner model), `core.schedule.cron` ✅ | `learner.enrollment.add_to_group` ✅, new: `core.notification.notify_teams` (Teams, not just Slack) | Nearly all existing |
| **SaaS / dev teams (Agent Studio angle)** | Deploy notifications, failed-build alerts, changelog generation | `developer.code.merged` ✅, `developer.code.failed` ✅ | `core.notification.notify_slack` ✅, `developer.agent.run_task` ✅ | Fully existing already — just needs a template + marketing push |
| **Real estate / high-touch sales coaching** | Lead nurture sequences after a webinar/course signup | `learner.user.enrolled` ✅, `core.webhook.received` ✅ (form fills) | `core.notification.send_email` ✅, new: `core.crm.push_lead` | Needs one generic CRM-push action |

**Pattern:** 6 of 8 verticals need zero or one new compound. The generic engine already covers most of the surface area — the real work is packaging (templates, naming, industry-specific onboarding copy), not new infrastructure.

### Recommended build order (v1: 2 quarters)

1. **Franchise/multi-location + Compliance training** — closest to current LMS core, highest willingness-to-pay (per `BUSINESS_STRATEGY_2026.md` niche #3/#4), needs only recert-reminder + audit-PDF actions.
2. **E-commerce extensions** — you already have commerce triggers; abandoned-cart/review-request are the two highest-value generic actions in the space.
3. **Agencies (white-label reporting)** — reuses usage/analytics data you already compute for billing; mostly a reporting action + template.
4. **SaaS/dev (Agent Studio)** — already fully buildable; ship as a template pack, not new code, to prove the "one engine, many industries" story quickly and cheaply (good early wedge for the pitch/demo).

---

## 4. Automation Hub — Sub-menu & Page Architecture

Rename/expand the existing `/automations` and `/marketplace` routes into one top-level nav section, following the existing `packages/ui/src/Layout/DefaultNavigation.tsx` + role-based nav pattern already scoped in `NAVIGATION_ARCHITECTURE_SCOPE.md`.

```
Automation Hub (top-level sidebar item)
├── Overview               /automations
├── Flow Builder           /automations/tower/:id
├── Templates              /marketplace
├── Trigger & Action Library /automations/library
├── Run History            /automations/runs
├── Integrations           /automations/integrations
└── Usage & Limits         /billing (existing, linked)
```

| Page | Functionality | Solves |
|---|---|---|
| **Overview** | List of a tenant's automations, on/off toggle, last-run status, quick "duplicate" | Fast answer to "what's automated for my business right now" — same for a coach or a franchise ops manager |
| **Flow Builder** (existing Tower graph editor) | Drag trigger → condition → action → wait nodes; branch on true/false | The one canvas every industry uses — no vertical-specific UI needed |
| **Templates / Marketplace** | Filterable by **industry tag** (new field) instead of just category; one-click install pre-built flows (e.g. "HIPAA recert reminder," "Abandoned cart," "New client onboarding report") | This is where "industry differentiation" actually lives — not in new UI, in curated template content |
| **Trigger & Action Library** | Browsable, searchable list of every compound, grouped by category *and* filterable by industry; shows which plan tier gates it | Lets an admin self-serve discover "can I automate X" without asking support |
| **Run History** | Per-automation execution log (already backed by `automationRuns` GraphQL query), filterable by status/date | Audit trail — directly answers the compliance-vertical pain point |
| **Integrations** | Webhook management (`core.webhook.received` config), future: Slack/Teams/CRM connectors | External system hooks — the "glue" every industry eventually needs |
| **Usage & Limits** | Reuses existing billing/usage bars | Ties automation runs to plan gates — already built in Phase 9/10 |

### Minimal data model changes required

- Add `industry?: string[]` to `FlowCompoundDefinition` (catalog) and to the marketplace template schema — this is the one schema change that unlocks the whole filter/discovery story.
- Add 6–8 new compounds per the table in §3 (each is additive to `catalog/compounds.ts`, following the existing pattern in §"Adding a compound" of `AUTOMATION_FLOW_SCHEMA.md`).
- No changes needed to the graph engine, runtime, or validation — confirmed by reading `graph.ts`/`runtime.ts`: they're already domain-agnostic.

---

## 5. Risks / what to watch

| Risk | Mitigation |
|---|---|
| Spreading thin across 8 industries dilutes the coaching/L&D beachhead positioning in `BUSINESS_STRATEGY_2026.md` | Ship Automation Hub as **one engine, industry template packs** — market copy stays "TrainOS + your industry's workflows," not a horizontal Zapier competitor |
| New compounds need real handlers in `bridge.ts`, not just catalog entries — easy to ship a template that doesn't actually run | Gate each template's public release behind a bridge handler + test, same as existing `automationService.test.ts` pattern |
| Marketplace with no industry filter today means templates get lost as the catalog grows | Ship the `industry` tag + filter UI *before* adding more than ~10 templates |
| Compliance vertical (HIPAA/audit) implies real legal exposure if "audit trail" claims aren't accurate | Keep messaging to "run history export," not "compliance guarantee," until legal reviews it |

---

## 6. Next steps

1. Add `industry` field to compound + template schemas (small, unblocks everything else).
2. Build the 2 highest-ROI net-new compounds first: recert reminder + abandoned-cart reminder.
3. Ship 4 templates (one per vertical in build order above) to `/marketplace` with industry tags.
4. Add Trigger & Action Library page (mostly a read view over the existing catalog — cheapest new page to build).
5. Re-test the "Overview" and "Run History" pages against the new templates before wider rollout.
