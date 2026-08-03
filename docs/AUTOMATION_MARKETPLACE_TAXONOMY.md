# Automation Marketplace — Taxonomy, Trigger/Action Library, and Scoring

> Companion to `docs/AUTOMATION_HUB_STRATEGY.md` (cross-industry problem→compound mapping, IA) and
> `docs/TEMPLATE_CONTROL_CORE.md` (how templates configure — never extend — the core engine).
> This doc covers the Marketplace's discovery taxonomy, the current real trigger/action/condition
> inventory (ground-truthed against `packages/automation-flow/src/catalog/compounds.ts`, not
> aspirational), and a scoring framework + shortlist for prioritizing what to build next.

---

## Taxonomy

Templates and compounds are tagged by:

- **Industry** — e.g. `ecommerce`, `retail`, `coaching`, `compliance-training`, `franchise`,
  `healthcare`, `hr`, `saas`. Discovery-only metadata (`FlowCompoundDefinition.industry?: string[]`
  on the compound, `AutomationTemplate.industry: string[]` on the template) — **never** an
  execution gate. See `docs/TEMPLATE_CONTROL_CORE.md`.
- **Category** — the compound's `category` field (`commerce`, `learner`, `developer`, `core`).
- **Plan gate** — Marketplace templates are seeded free (`priceCents: 0`) today; a paid tier for
  premium templates is a monetization option, not yet implemented.

## Trigger / Condition / Action library (current, real — from `compounds.ts`)

This is the actual catalog, not a wishlist. Anything not listed here doesn't exist yet.

### Triggers

| Compound ID | Category | What fires it |
| --- | --- | --- |
| `commerce.order.created` | commerce | New order created |
| `commerce.order.drafted` | commerce | Checkout started but not completed (feeds abandoned-cart) |
| `commerce.payment.sent` | commerce | Payment received |
| `commerce.order.updated` | commerce | Order fields changed |
| `learner.course.completed` | learner | Learner finishes a course |
| `learner.user.enrolled` | learner | New enrollment |
| `learner.group.joined` | learner | Learner added to a group/team |
| `learner.certificate.issued` | learner | Certificate issued |
| `core.schedule.cron` | core | Recurring schedule (cron expression) |
| `core.webhook.received` | core | Inbound webhook |
| `developer.code.staged` / `.committed` / `.merged` / `.failed` | developer | Agent Studio pipeline events |

### Conditions

| Compound ID | What it checks |
| --- | --- |
| `core.condition.field_equals` | Any payload field equals a value |
| `core.condition.field_contains` | Any payload field contains a substring |
| `commerce.condition.order_tag` | Order has a specific tag |
| `commerce.condition.order_total` | Order total compared against a threshold |

### Actions

| Compound ID | What it does |
| --- | --- |
| `commerce.order.update_fields` | Update fields on an order |
| `commerce.order.add_tags` | Tag an order |
| `core.notification.send_email` | Send a templated email (see `packages/agent/src/automation/email.ts` for the template registry) |
| `core.notification.notify_slack` | Post to Slack |
| `core.schedule.delay_event` | Re-emit an event after a delay (distinct from a `wait` node — see `TEMPLATE_CONTROL_CORE.md`) |
| `learner.enrollment.add_to_group` | Add a learner to a group |
| `learner.course.enroll` | Enroll a learner in a course |
| `developer.agent.run_task` | Kick off an Agent Studio task |
| `core.wait.delay` | Pause a flow for N seconds before the next node |

**Note:** `learner.certificate.expiring_soon` (trigger) and `learner.certificate.issue` (action) are
in progress on a separate branch (`feat/automation-hub-industry-compounds`) — not yet merged, not
listed above since this table reflects what's actually on `main`.

## Scoring framework for new compounds/templates

Before building a new trigger, action, or template, score it against:

| Criterion | Question |
| --- | --- |
| **Frequency** | How many tenants would actually hit this trigger regularly? |
| **Urgency** | Does delay cost the tenant money/compliance risk (vs. "nice to have")? |
| **Competition** | Do competitors (Thinkific, Kajabi, etc.) already offer this, or is it differentiating? |
| **AI requirement** | Does it need genuine LLM reasoning, or is it a deterministic trigger→action (cheaper, faster to ship, matches the "front-load logic outside the LLM" principle used in `docs/AGENT_ORCHESTRATOR.md`)? |
| **Solo-dev feasibility** | Can one engineer ship and test it in under a week using existing primitives? |
| **Pricing potential** | Does it justify gating behind Pro/Enterprise, or is it a free-tier onboarding template? |

## Illustrative shortlist (hypothesis, not validated with usage data)

| Rank | Template/Compound | Status | Rationale |
| --- | --- | --- | --- |
| 1 | Abandoned Cart Reminder | **Shipped** (`commerce.order.drafted` → wait → `core.condition.field_equals` → `core.notification.send_email`) | Very frequent, urgent, direct revenue impact |
| 2 | Certification Renewal Alert | In progress, unmerged (`feat/automation-hub-industry-compounds`) | Frequent in compliance-training/franchise/healthcare, low competition |
| 3 | New Student Onboarding | Proposed | Universal pain point, composable from existing `learner.user.enrolled` trigger + `core.notification.send_email` action — no new compound needed |
| 4 | Course Completion Upsell | Proposed | `learner.course.completed` trigger already exists; needs a "suggest next course" action (new) |
| 5 | Payment Failed/Retry | Proposed | Needs a new `commerce.payment.failed` trigger — not yet in the catalog |
| 6 | Learner Inactivity Nudge | Proposed | Needs a new scheduled sweep (same pattern as the certificate-reminder job) checking last-activity timestamps |

Items 3–6 are compositions of mostly-existing primitives or small, well-scoped additions — consistent
with `docs/TEMPLATE_CONTROL_CORE.md`'s core-vs-customization model (extend the catalog only when a
genuine gap exists; otherwise it's "just a template").

## Marketplace analytics (not yet built)

Recommended to track once templates ship: installs, activations (first successful run), and
ongoing run volume per template — informs which categories to invest in next. No implementation
yet; flagged here as a follow-up, not part of this doc-and-nav restructure.
