# fix(agent): make SEND_EMAIL actually send mail and re-evaluate flow conditions after a wait against live data

**Branch:** `fix/automation-send-email-and-live-condition-eval` (based on `main`)
**Labels:** `help wanted`, `bug`, `agent`, `need-manual-review`
**Author:** susil-bot (with Claude, Cowork mode)

## Label: **bug**

## Why

Found while building the abandoned-cart-reminder automation (separate feat PR:
`feat/automation-hub-industry-compounds`). Two pre-existing correctness bugs in
`packages/agent/src/automation/bridge.ts`, both affecting **already-shipped**
marketplace templates (`welcome-sequence`, `weekly-digest`, `completion-cert-slack`
all use `SEND_EMAIL` today):

1. **`SEND_EMAIL` was a log-only stub.** `executeAction()` handled it in the same
   switch branch as `NOTIFY_SLACK`/`CALL_WEBHOOK`/etc. — all of which just
   `console.log` and record a timeline entry. No automation using `SEND_EMAIL` has
   ever sent a real email.
2. **Flow conditions after a `wait` step evaluated stale data.**
   `planFlowExecutionFromDefinition` resolves the *entire* graph — including which
   branch a condition takes — against the trigger-time payload, before any `wait`
   runs. A flow like "wait 60 minutes, then check if the order is still unpaid"
   silently used data captured an hour earlier, not the current state.

Per `.cursor/rules/pr-workflow.mdc` ("never mix bugs and features in one PR"),
these are split out from the recert-reminder / abandoned-cart-reminder feature
that exposed them.

## What changed

- **`packages/agent/src/automation/email.ts`** (new) — self-contained email
  dispatch: SendGrid via `fetch` when `EMAIL_PROVIDER=sendgrid` +
  `SENDGRID_API_KEY` are set, otherwise logs (mirrors the existing provider logic
  in `apps/api/src/utils/email.ts`, kept in `packages/agent` rather than importing
  from `apps/api` — packages must not depend on apps). Ships the two templates
  that already existed as catalog options before this PR: `order_confirmation`,
  `custom`.
- **`packages/agent/src/automation/bridge.ts`**:
  - `executeAction()`'s `SEND_EMAIL` case now resolves a recipient
    (`resolveRecipientEmail` — checks `customerEmail`/`email`/`studentEmail`/
    `recipientEmail` on the trigger payload) and calls `sendAutomationEmail`.
    Skips with a warning (does not throw) if no recipient is resolvable, so a
    malformed payload can't take down the whole automation run.
  - `executeAutomationActions()` now walks the flow graph node-by-node
    (`walkFlowLive`) instead of pre-planning the whole path
    (`planFlowExecutionFromDefinition` is kept — it's still used for the
    human-readable run summary in `recordAutomationTimeline`, which doesn't need
    to be live). After every `wait` node, `refreshEventPayload()` re-fetches the
    `Enrollment` record (courseId + studentId from the payload) and merges fresh
    `paymentStatus`/`learningStatus`/`progressPercent` into the payload before the
    next condition evaluates. Fails open — a lookup error or unresolvable payload
    just keeps the stale data rather than aborting the run.

## Not changed

- `ISSUE_CERTIFICATE` stays a log-only stub in this PR — making it persist real
  certificate expiry data is scoped to the feat PR (it's genuinely new
  capability, not restoring previously-advertised behavior).
- No schema changes, no new dependencies, no new infrastructure. Zero cost impact.

## Enterprise-standard / low-cost notes

- Fix is scoped to two files, reuses the existing email-provider pattern
  1:1 from `apps/api`, and reuses the existing `Enrollment` model — no new
  collection, no new service, no new queue.
- `need-manual-review` requested because this changes runtime behavior of every
  tenant's existing `SEND_EMAIL` automations (they'll start actually sending mail
  for the first time) — worth a human confirming `EMAIL_PROVIDER`/`SENDGRID_API_KEY`
  are set as intended in each environment before this reaches production, or mail
  will silently stay in `log` mode (safe default, but worth confirming deliberately).

## Test plan

- [ ] Unit: `sendAutomationEmail` falls back to `log` provider when
      `SENDGRID_API_KEY` is unset; throws on non-2xx SendGrid response.
- [ ] Unit: `resolveRecipientEmail` returns `undefined` for a payload with no
      email-shaped field, and the first match in priority order otherwise.
- [ ] Integration: an `Automation` with `flowDefinition` = trigger → `wait(1s)` →
      `condition(field_equals)` → `action` — assert the condition sees the
      **post-wait** DB state, not the trigger-time payload (mock `Enrollment`
      update between trigger and wait completing).
- [ ] Regression: existing flat `actions[]` automations (no `flowDefinition`)
      still execute unchanged.

## Checklist

- [ ] `EMAIL_PROVIDER` / `SENDGRID_API_KEY` / `EMAIL_FROM` confirmed per
      environment before merge (see "Enterprise-standard" note above)
- [ ] `npm run build --workspace=@luxgen/agent` (or `turbo build --filter=@luxgen/agent`)
      run before deploy
