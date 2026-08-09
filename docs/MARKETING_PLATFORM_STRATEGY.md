# LuxGen — Marketing / Social Media Management Platform: Strategy & Technical Architecture

> **Status:** Proposal for founder review — this is the "first analysis" pass requested, not yet
> approved engineering scope.
> **Audience:** CEO/founder, engineers, future hires
> **Builds on:** [BUSINESS_STRATEGY_2026.md](./BUSINESS_STRATEGY_2026.md) (existing go-to-market
> model), [TEMPLATE_CONTROL_CORE.md](./TEMPLATE_CONTROL_CORE.md) (core-vs-customization rule),
> [AUTOMATION_HUB_STRATEGY.md](./AUTOMATION_HUB_STRATEGY.md) (compound/engine extension pattern),
> [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md) (9-domain sidebar model),
> [PLATFORM_VERTICALIZATION_STRATEGY.md](./PLATFORM_VERTICALIZATION_STRATEGY.md) (vocabulary/funnel
> pattern this doc reuses)
> **Companion:** [docs/todo-orchestrator/queue.yaml](./todo-orchestrator/queue.yaml) — epic `E6`

---

## 0. Why this doc exists

> CEO framing, verbatim intent: courses and e-commerce are a crowded, low-differentiation
> category right now. LuxGen needs a strategy that takes the company from **0 to profitable**,
> and social-media management for creators/agencies is the new target market.

This is a **go-to-market pivot proposal**, not a side feature. It's evaluated and designed as
one. The honest finding up front, from reading the actual codebase (not assumed): **almost none
of this exists today.** Section 2 has the full evidence table, but the summary is — the
automation engine, multi-tenancy, and billing you already built are reusable; media storage,
campaigns, an inbox, OAuth to external platforms, and CRM/leads are all genuinely new
infrastructure. That doesn't make this a bad bet — it makes it an honest one. Section 9 lays out
how to stage it so you're not burning runway building all sixteen menu sections before your first
paying customer.

---

## 1. Strategic rationale

### 1a. Why this, why now

| Factor | Courses/LMS (current bet) | Social media management (proposed) |
|---|---|---|
| Competitive density | Teachable, Kajabi, Thinkific, Cornerstone, Docebo — mature, well-funded | Buffer, Hootsuite, Later, Sprout Social — mature, but pricing/UX gaps for small teams remain (see 1c) |
| Differentiation available to LuxGen | Automations + AI, but competitors are closing this gap | Automation graph + AI content generation is *not* standard in this category yet at LuxGen's price point |
| Your existing ICP overlap | — | **Direct overlap** — coaches, agencies, and creator-operators (niches #1 and #5 in `BUSINESS_STRATEGY_2026.md` §4) already need to market what they teach/sell. This isn't a new customer to find, it's a new product to sell the *same* customer. |
| Reusable engineering | — | Multi-tenant core, Tower automation graph, billing/plan gates, Marketplace pattern — all reusable per §2 |

### 1b. The sharpest version of this strategy

Don't position this as "LuxGen now also does social media." Position it as: **the same
automation engine that runs a coach's course completions and certificates now also runs their
content calendar and lead funnel.** A creator-coach on LuxGen today enrolls someone in a course
when they buy; tomorrow, the same Tower graph can post the testimonial clip that got them to buy
in the first place. That's a genuine cross-sell into your *existing* customer base *and* a
standalone wedge for creators who don't need an LMS yet but need to post consistently.

### 1c. Competitive gap this can exploit

Buffer's navigation (Create → Publish → Analyze → Community → Start Page) and Hootsuite's
(publish, unified inbox, analytics, listening, competitive intel, collaboration) are the
category-standard IA — the menu you pasted matches this benchmark closely, which is a good sign
it's not a naive design. The gap: both are **generic schedulers bolted onto an ads/enterprise
sales motion.** Neither has a real automation graph (trigger → condition → action) under the
hood, and neither has AI content generation that's aware of a business's actual product/course
catalog. LuxGen's wedge: *"the only social tool that knows what you sell and automates the
handoff from post to lead to customer"* — which is section 14 (Leads/Funnel) done well, something
neither competitor does natively today.

### 1d. Recommended ICP for v1

Reuse `BUSINESS_STRATEGY_2026.md`'s existing niche #1 (creator-coach & cohort bootcamps) and #5
(agency white-label) — **do not invent a new ICP.** These buyers are already LinkedIn-heavy,
already run a content calendar manually or with Buffer/Later, and already trust LuxGen (or would,
via the same brand) for automation. This keeps sales/marketing focused instead of chasing two
unrelated audiences at once — the same "avoid multiple miracles" discipline `BUSINESS_STRATEGY_2026.md`
already applies to niche selection.

---

## 2. What already exists vs. what's net-new

Grounded in reading the actual code, not assumed. This table is the load-bearing part of this
doc — it's what makes section 9's phasing honest instead of aspirational.

| Capability | Status | Evidence |
|---|---|---|
| Multi-tenant core (subdomains, branding, plans) | **EXISTS — reusable as-is** | `packages/db/src/tenant.ts`, existing tenant routing middleware |
| Automation graph (trigger → condition → action → wait) | **EXISTS — reusable as-is** | `packages/automation-flow/src/{graph,runtime,validate}.ts` — confirmed domain-agnostic |
| `core.schedule.cron` + `core.webhook.received` compounds | **EXISTS — directly reusable** for "publish at scheduled time" and platform webhook callbacks | `packages/automation-flow/src/catalog/compounds.ts` |
| Billing plan tiers + feature gates | **EXISTS — reusable as-is** | `packages/billing/src/plans.ts` (`PlanTier`, `BillingFeature`, `FEATURE_MIN_PLAN`), `gates.ts` (`hasFeature`) — adding a Marketing feature flag is additive |
| Marketplace (template install pattern) | **EXISTS — reusable pattern** | `marketplaceService.ts` — the same "install a data-only template" idiom this doc uses for Content/Campaign templates |
| Usage rollup pattern (`TenantUsageMonthly`) | **EXISTS — reusable pattern, not reusable data** | `packages/db/src/usage.ts` — monthly-period-doc-per-tenant shape is exactly right for post/engagement metrics, but has none of the actual fields |
| Media/asset storage | **NET-NEW** | No `Media`/`Asset` model exists. Branding logo/favicon are base64 strings capped at 512KB directly in Mongo (`apps/api/src/routes/tenant.ts`) — this does not scale to a content library with video. Real object storage (S3-compatible) is required. |
| Campaigns | **NET-NEW** | Zero matches for "campaign" anywhere in `packages/db` or `apps/api`. |
| Inbox / comments / DMs | **NET-NEW** | `ActivityEvent`'s `STAFF_COMMENT` kind is an internal admin timeline on Product/Order/Customer, not a customer-facing conversation model. No DM/comment/mention schema exists. |
| External OAuth (connect a third-party account) | **NET-NEW** | Only OAuth pattern in the repo is *login* SSO (`packages/ui/src/SocialLoginButtons`) — authenticates a user into LuxGen. Nothing stores a third-party access/refresh token today. |
| CRM / leads | **NET-NEW** | No `Lead`/`Contact` model. Already flagged as a gap in `AUTOMATION_HUB_STRATEGY.md` for the real-estate/coaching vertical ("needs one generic CRM-push action") — same gap, now load-bearing instead of a nice-to-have. |
| Course/LMS-specific analytics | **EXISTS, not reusable data** | `apps/api/src/schema/analytics` only exposes `courseAnalytics`/`groupAnalytics` — nothing about posts, platforms, or audience. |
| A "Marketing" sidebar domain | **DOESN'T EXIST** | `PRODUCT_ARCHITECTURE.md`'s 9 domains have no Marketing/Social entry. This becomes domain #10 (§3). |

**Net read:** the engine and the business model machinery (tenancy, billing, templates) are a real
head start — you are not building a SaaS platform from scratch, you're building a new *vertical
slice* on a platform that already handles the hard multi-tenant/billing problems. But the actual
social-media-specific data (accounts, posts, media, conversations, leads) is 100% new, same as it
would be for a standalone startup. Budget and staff accordingly — don't let the platform reuse
create false confidence that this is a thin feature.

---

## 3. Product IA — where "Marketing" sits in LuxGen's domain model

`PRODUCT_ARCHITECTURE.md` organizes LuxGen into 9 sidebar domains matching business intent, not
code layout. Marketing becomes domain #10, following the same rule: it's a sidebar section and a
GraphQL area (`apps/api/src/schema/marketing/*`), it doesn't imply new `apps/`/`packages/`
boundaries.

```
LuxGen
├── Home
├── Learning
├── Commerce
├── People
├── Automation Hub
├── Intelligence
├── Workspace
├── Listings
├── Administration
├── Settings
└── Marketing  ← NEW (this doc)
    ├── Overview
    ├── Social Accounts
    ├── Create               (Ideas · AI Writer · Drafts · Media Library)
    ├── Publish               (Calendar · Queue · Composer)
    ├── Community              (Inbox · Comments · DMs · Mentions)
    ├── Analytics
    ├── Campaigns
    ├── Leads / Funnel
    └── AI Growth
```

Two menu items from your original list are deliberately folded into others rather than kept as
separate top-level entries, for the same reason `PRODUCT_ARCHITECTURE.md` keeps Listings/Automation
Hub separate but doesn't multiply top-level sections unnecessarily:

- **Trends/Social Listening** and **AI Growth** → merged into one **AI Growth** section (Ask AI,
  Strategy, Trends, Competitors as tabs of one screen) — they're both "AI looks at your data and
  tells you something," not two different user journeys.
- **Team/Collaboration**, **Link in Bio**, and **Monetization** → deferred out of the top-level
  nav for v1 (§9 Phase 2/3), reachable from Settings and a tenant's existing People domain once
  built, rather than adding three more sidebar entries before there's a single live Phase-0 user.

This keeps the *nav* honest about what's actually shipped, per the same discipline
`PRODUCT_ARCHITECTURE.md` already applies ("no URL changes without a working page behind them").

---

## 4. High-level architecture

```
                    ┌─────────────────────────────────────────────┐
                    │           External social platforms          │
                    │   Instagram · Facebook · YouTube · LinkedIn   │
                    │        · TikTok · X · Threads · GBP           │
                    └───────────────────┬───────────────────────────┘
                                         │ OAuth + platform APIs
                                         ▼
                    ┌─────────────────────────────────────────────┐
                    │   Integration Adapter Layer (NEW)             │
                    │   apps/api/src/integrations/{platform}/       │
                    │   - one adapter per platform, common interface│
                    │   - encrypted token vault                     │
                    │   - webhook receivers (comments/DMs/mentions)  │
                    └───────────────────┬───────────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
    │  Publishing        │      │  Community/Inbox   │      │  Analytics         │
    │  Pipeline (NEW)     │      │  Sync (NEW)         │      │  Ingestion (NEW)    │
    │  compose→schedule→   │      │  poll/webhook →      │      │  scheduled pull →    │
    │  queue→publish       │      │  InboxMessage model  │      │  MarketingUsageDaily │
    └─────────┬──────────┘      └─────────┬──────────┘      └─────────┬──────────┘
              │                          │                          │
              ▼                          ▼                          ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │              Tower Automation Graph (EXISTING — reused)                 │
    │  new compound category: marketing.* / social.*                          │
    │  marketing.post.published, marketing.comment.received,                  │
    │  marketing.lead.captured  →  core.notification.send_email (existing),   │
    │  new: marketing.lead.push_to_crm, marketing.post.cross_post             │
    └───────────────────────────────────┬─────────────────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────────┐
                    │   LuxGen Core (EXISTING — unchanged)          │
                    │   Multi-tenancy · Billing/plan gates ·        │
                    │   GraphQL contract · Marketplace pattern      │
                    └─────────────────────────────────────────────┘
```

**Data flow for the core loop (Phase 0):** a user connects one platform account (OAuth handshake
→ encrypted token stored) → composes a post in the Composer (optionally AI-drafted) → schedules it
→ a worker/cron picks it up at the scheduled time → the adapter calls the platform's publish API →
result (success/failure + platform post id) is written back → `marketing.post.published` fires on
the Tower graph → existing `core.notification.send_email` compound can notify the user, no new
compound required for that leg → analytics ingestion pulls engagement metrics on a schedule → the
Analytics screen renders them.

---

## 5. Data model (new Mongoose collections, `packages/db/src/marketing/`)

Following this repo's existing model conventions (tenant-scoped `_id`/`tenantId` pattern, sibling
to `packages/db/src/tenant.ts`/`automation.ts`).

| Model | Purpose | Key fields |
|---|---|---|
| `SocialAccount` | One connected external account per tenant | `tenantId`, `platform` (enum), `externalAccountId`, `displayName`, `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt`, `status` (connected/expired/revoked), `scopes[]` |
| `MediaAsset` | Uploaded/generated media, backing the Content Library | `tenantId`, `type` (image/video/doc), `storageUrl` (S3-compatible, **not base64-in-Mongo** — see §7), `sizeBytes`, `durationSeconds?`, `tags[]`, `createdBy` |
| `SocialPost` | A piece of content, one row per platform-target (a "cross-post" is N rows sharing a `postGroupId`) | `tenantId`, `postGroupId`, `socialAccountId`, `platform`, `status` (draft/queued/scheduled/publishing/published/failed), `scheduledAt`, `publishedAt`, `body`, `mediaAssetIds[]`, `externalPostId?`, `failureReason?` |
| `ContentIdea` | Saved AI-generated or manual ideas | `tenantId`, `source` (ai/manual/competitor), `prompt?`, `body`, `status` (saved/used/dismissed) |
| `Campaign` | Groups posts + goals + budget under one initiative | `tenantId`, `name`, `objective`, `platforms[]`, `startAt`, `endAt`, `budgetCents?`, `utmParams`, `postIds[]` |
| `InboxMessage` | Unified comment/DM/mention | `tenantId`, `socialAccountId`, `platform`, `kind` (comment/dm/mention), `externalMessageId`, `fromExternalUser`, `body`, `status` (unread/replied/assigned/resolved), `assignedToUserId?` |
| `Lead` | Captured from a link-in-bio form, DM, or comment | `tenantId`, `source` (post/campaign/dm), `sourcePostId?`, `email?`, `name?`, `stage` (new/contacted/qualified/converted), `convertedToCustomerId?` (links into existing `Customer` model — see §5a) |
| `MarketingUsageDaily` | Metrics rollup, mirrors `TenantUsageMonthly`'s shape at daily granularity | `tenantId`, `socialAccountId`, `date`, `impressions`, `reach`, `likes`, `comments`, `shares`, `saves`, `followerCount`, `linkClicks` |
| `AIGrowthInsight` | Cached AI-generated recommendations, refreshed on a schedule | `tenantId`, `kind` (performance/trend/competitor/funnel), `generatedAt`, `body`, `dismissedAt?` |

### 5a. One explicit reuse decision: `Lead` → `Customer`

Rather than building a parallel CRM, `Lead.convertedToCustomerId` links into the **existing**
`Customer` model (`packages/db` commerce domain) once a lead buys something. This mirrors the
same "don't duplicate, alias" idiom `PLATFORM_VERTICALIZATION_STRATEGY.md` already established for
Course/Product — a lead that converts becomes a normal Customer, not a second parallel person
record. `Lead` itself is still net-new (nothing upstream of "became a customer" exists today).

---

## 6. Automation engine extension

One new compound category, `marketing.*`, added to `packages/automation-flow/src/catalog/compounds.ts`
— same additive pattern used for every prior vertical (confirmed: the graph engine, runtime, and
validator are domain-agnostic, no engine changes required, per `AUTOMATION_HUB_STRATEGY.md` §4).

| Compound | Type | Net-new bridge handler required? |
|---|---|---|
| `marketing.post.published` | trigger | Yes — fires from the publishing pipeline (§4) |
| `marketing.post.failed` | trigger | Yes — same pipeline |
| `marketing.comment.received` | trigger | Yes — fires from inbox sync |
| `marketing.lead.captured` | trigger | Yes — fires from link-in-bio form / DM parsing |
| `marketing.post.cross_post` | action | Yes — publishes the same content to N connected accounts |
| `marketing.lead.push_to_crm` | action | Reuses the CRM-push gap already flagged in `AUTOMATION_HUB_STRATEGY.md` §3 — build once, benefits both docs |
| `core.notification.send_email` | action | **Existing — zero new code** |
| `core.schedule.cron` | trigger | **Existing — zero new code**, powers the publish-queue sweep |

This is the same "6 of 8 verticals need zero or one new compound" pattern
`AUTOMATION_HUB_STRATEGY.md` found — here it's closer to "half the compounds are net-new," which
is honest given this is a new domain, not a new industry on an existing domain.

---

## 7. Integration/OAuth adapter architecture

**Design principle:** platform-agnostic core, one real adapter first.

```ts
// apps/api/src/integrations/types.ts (NEW)
interface SocialPlatformAdapter {
  platform: SocialPlatform;
  getAuthUrl(tenantId: string, redirectUri: string): string;
  exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }>;
  publishPost(account: SocialAccount, post: SocialPost): Promise<{ externalPostId: string }>;
  fetchEngagementMetrics(account: SocialAccount, since: Date): Promise<EngagementMetric[]>;
  // Community sync — poll-based for v1 (simpler), webhook-based later per platform
  fetchNewMessages?(account: SocialAccount, since: Date): Promise<InboxMessagePayload[]>;
}
```

Every platform implements this one interface. The publishing pipeline, inbox sync, and analytics
ingestion code never branch on platform — they call `adapter.publishPost(...)` and let the
adapter own platform-specific quirks (media format requirements, character limits, rate limits).
This is the same "engine doesn't know about verticals" discipline the Tower graph already runs on
(§6), applied one layer down.

**Token security:** `encryptedAccessToken`/`encryptedRefreshToken` on `SocialAccount` — encrypted
at rest (AES-256, key from environment secret, not stored in Mongo alongside the data), never
returned in any GraphQL response. This is genuinely new infrastructure (§2) and needs a security
review before it ships, not an afterthought.

### 7a. Which platform first — a real operational constraint, not just an engineering choice

Every major platform (Meta/Instagram+Facebook, Google/YouTube, LinkedIn, TikTok) requires an
app-review or developer-access-approval process that runs on the platform's timeline, not yours —
typically 2–6 weeks, sometimes requiring business verification. **This means the API application
should start in parallel with engineering, not after it.** Recommendation:

1. **This week:** apply for developer/API access on **LinkedIn** (best ICP fit — your existing
   niches #1/#5 buyers already live there) and **X/Twitter** (self-serve, fastest to actually get
   a working key even though it has a paid tier) simultaneously, so at least one is likely approved
   by the time the adapter code is ready to test against something real.
2. **Build the adapter interface and the full internal pipeline (§4) against whichever approval
   lands first** — the interface in §7 makes this a swap, not a rewrite, if you have to start with
   whichever platform approves faster rather than your first choice.
3. **Do not build a mock-only adapter and call it done.** A scheduler that doesn't actually post
   anywhere isn't sellable. The mock adapter is useful for automated tests, not as the v1 product.

---

## 8. Billing / plan gate extension

Additive to `packages/billing/src/plans.ts` — no structural change:

```ts
// BillingFeature union gains:
| 'marketing'           // gates the whole Marketing domain
| 'marketingMultiAccount' // gates connecting >1 social account per platform
| 'marketingAIWriter'   // gates AI content generation calls (cost-bearing, meter it)
```

Recommend a **separate pricing track**, not folded into the existing Starter/Pro/Business tiers —
this is a different buyer motion (a solo creator posting content vs. an L&D admin running
courses), and `BUSINESS_STRATEGY_2026.md` §3 already warns against "avoid multiple miracles" —
don't force one pricing ladder to serve two different jobs-to-be-done. Suggested starting point,
consistent with the existing ARPA target (~$180/mo) and Buffer/Hootsuite's actual market pricing
(roughly $6–$120/mo depending on tier):

| Tier | Monthly | Includes |
|---|---|---|
| Creator | $19 | 3 social accounts, 30 scheduled posts/mo, basic analytics |
| Growth | $49 | 10 accounts, unlimited posts, AI Writer, Inbox |
| Agency | $149 | Unlimited accounts across sub-tenants, Campaigns, team roles, white-label |

This is a starting hypothesis for the founder checklist (§11), not a final decision — pricing
needs competitor validation before launch.

---

## 9. Phased roadmap

The full 16-section menu is the north star; **do not build it all before shipping.** Below is the
staged build recommended to reach a sellable product fastest, with the honest reuse-vs-net-new
call from §2 baked into each phase's sizing.

### Phase 0 — MVP wedge (target: first paying customer)

**Goal:** one person can connect one real platform account, write a post (optionally AI-assisted),
schedule it, see it actually go live, and see basic results. This is the smallest slice that is a
believable, sellable product on its own.

| Menu section | In scope | Out of scope this phase |
|---|---|---|
| Social Accounts | Connect/disconnect one platform, connection health | Account groups, multi-brand |
| Create → AI Writer | Caption/hook/hashtag generation for one post at a time | Repurposing, brand voice profiles |
| Create → Media Library | Upload + basic tagging, backed by real object storage | Templates, brand assets library |
| Publish | Calendar (month/week view), Composer, Queue, Drafts | Per-platform customization beyond basic text/media |
| Analytics | Overview + per-post basic metrics (impressions, likes, comments) | Audience demographics, video retention, conversion tracking |

### Phase 1 — Retention loop

Community (Inbox — replying keeps users opening the app daily, the #1 reason to come back) +
`marketing.*` automation compounds live (§6) so the existing automation-graph differentiation
becomes real, not just architecture.

### Phase 2 — Expansion revenue

Campcampaigns, multi-account groups (agency use case), Team/Collaboration roles + approval
workflow (unlocks the Agency pricing tier in §8).

### Phase 3 — Differentiation moat

AI Growth agent (this is where the "knows what you sell" wedge from §1c actually gets built),
Leads/Funnel with CRM push, Trends/listening, Link in Bio, Monetization tracking.

**Explicitly not scheduled:** none of Phase 2/3 is scoped to task-card level yet — that's
deliberate, per this codebase's own `L`/"split before enqueue" discipline (see `T-VERT-10` in
`queue.yaml` for the precedent). Phase 0 gets full task cards in §12; Phase 1–3 stay at this
roadmap level of detail until Phase 0 has real usage data to react to.

---

## 10. UI checklist (Phase 0)

- [ ] `/marketing` overview — empty state before any account connected, summary cards after
- [ ] `/marketing/accounts` — connect button per platform, OAuth redirect handling, connection
      status list, disconnect action
- [ ] `/marketing/create` — AI Writer panel (prompt → caption/hashtags/hook variations), save-as-draft
- [ ] `/marketing/library` — upload (drag-drop), grid view, tag/search/filter, delete
- [ ] `/marketing/publish` — Composer (platform picker, media attach, character-count-aware per
      platform, schedule-or-publish-now), Calendar (month/week toggle), Queue list, Drafts list
- [ ] `/marketing/analytics` — overview cards (posts published, avg engagement), per-post detail
      view
- [ ] Nav: new "Marketing" sidebar section in `packages/ui/src/Layout/DefaultNavigation.tsx`,
      gated behind the `marketing` plan flag the same way `automations`/`analytics` already are in
      `apps/web/lib/use-sidebar-sections.ts`
- [ ] Empty/loading/error states on every screen above — no fabricated data, matching this
      repo's existing house rule (`DO NOT: invent demo users` in `AGENT_TASK_CARD.md`)
- [ ] Plan-gate upsell card shown when `marketing` flag is off, matching the existing
      automations/marketplace gated-feature pattern

## 11. API checklist (Phase 0)

- [ ] `packages/db/src/marketing/{social-account,media-asset,social-post}.ts` — models per §5
- [ ] `apps/api/src/integrations/types.ts` + `apps/api/src/integrations/linkedin/adapter.ts` (or
      whichever platform's access lands first per §7a) — first real `SocialPlatformAdapter`
- [ ] `apps/api/src/services/socialAccountService.ts` — OAuth handshake, encrypted token
      storage/refresh, connection health checks
- [ ] `apps/api/src/services/mediaAssetService.ts` — upload to object storage, signed URL
      generation, delete
- [ ] `apps/api/src/services/socialPostService.ts` — draft/schedule/publish state machine,
      cross-post fan-out (one `postGroupId`, N `SocialPost` rows)
- [ ] Scheduled worker (reuses `core.schedule.cron` compound, §6) — sweeps due `SocialPost` rows,
      calls the adapter, writes back status
- [ ] `apps/api/src/schema/marketing/{typeDefs,resolvers}.ts` — GraphQL surface:
      `socialAccounts`, `connectSocialAccount`, `disconnectSocialAccount`, `mediaAssets`,
      `uploadMediaAsset`, `socialPosts`, `createSocialPost`, `scheduleSocialPost`,
      `publishSocialPostNow`, `marketingAnalyticsOverview`
- [ ] `requireFeature(ctx, 'marketing')` plan gate on every mutation, matching the existing
      `planGate.ts` pattern used by automations/marketplace resolvers
- [ ] `marketing.post.published`/`marketing.post.failed` compounds + bridge handlers
      (`packages/agent/src/automation/bridge.ts`) per §6
- [ ] AI Writer: reuses existing AI infrastructure from `packages/agent` if a suitable text-gen
      path already exists there (needs a follow-up check before scoping — not confirmed by this
      pass's research) rather than standing up a second AI integration

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Platform API approval takes longer than engineering | Apply in parallel, start Day 1 (§7a) — don't let this become the critical path discovered late |
| Building all 16 sections before any revenue | Phase 0 scope is deliberately narrow (§9) — resist scope creep into Phase 1+ before Phase 0 has a paying customer |
| Token security incident (a breached third-party OAuth token is a real liability, unlike an internal bug) | Encrypted at rest, security review before launch, least-privilege scopes only (§7) |
| Diluting the existing LMS/commerce positioning with a second, unrelated product | Frame as one engine two surfaces (§1b), not two companies — same brand, same automation story, cross-sell into existing tenants first |
| Object storage is a new operational dependency (uptime, cost, egress) | Use an S3-compatible provider with a mature Node SDK; budget this into unit economics before Phase 0 pricing is finalized |
| AI Writer cost (LLM calls are usage-cost-bearing, unlike the rest of the platform) | Meter and gate via `marketingAIWriter` flag (§8) from day one, don't ship unmetered AI generation |

---

## 13. Decisions needed from you (founder checklist)

- [ ] **Confirm this becomes the primary 2026 wedge**, or a parallel bet alongside the existing
      LMS beachhead (recommend: parallel, cross-sold into existing tenants first — cheaper than a
      cold second GTM motion, per §1b)
- [ ] **First platform** (recommend: LinkedIn + X in parallel, ship whichever approves first — §7a)
- [ ] **Pricing track**: separate Marketing tiers (§8, recommended) vs. folding into existing plans
- [ ] **Team/hiring**: this is genuinely new infrastructure (§2) — confirm whether Phase 0 is
      scoped for the current team or needs a hire before committing to a timeline

---

*Document owner: Product/Eng. Task cards for Phase 0 in `docs/todo-orchestrator/queue.yaml` epic
`E6`. Review after Phase 0 ships to real usage.*
