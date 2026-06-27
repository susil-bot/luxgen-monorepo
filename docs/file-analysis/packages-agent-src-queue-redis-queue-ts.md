# redis-queue.ts

## File Path

`packages/agent/src/queue/redis-queue.ts`

## Purpose

Application module

## Stats

| Metric | Value |
|--------|-------|
| Lines | 317 |
| Exports | 24 |
| Functions (detected) | 23 |

## Imports (external / workspace)

- `ioredis`
- `crypto`
- `../types/task`
- `../types/task`


## Exports

- `MAX_CONCURRENT_STREAMS_PER_TENANT`
- `MAX_AGENT_MESSAGES_PER_MINUTE`
- `getRedisUrl`
- `isQueueEnabled`
- `getStalledIntervalMs`
- `getMaxStalledCount`
- `getRedisClient`
- `connectQueue`
- `acquireTenantStreamSlot`
- `releaseTenantStreamSlot`
- `isAgentMessageRateLimited`
- `resetAgentRateLimitFallback`
- `enqueueHeadlessTask`
- `dequeueHeadlessTask`
- `acknowledgeHeadlessTask`
- `recoverStalledJobs`
- `startStalledJobRecovery`
- `stopStalledJobRecovery`
- `getQueueDepth`
- `requeueHeadlessTask`
- `moveJobToDeadLetter`
- `listDeadLetterJobs`
- `handleJobFailure`
- `disconnectQueue`

## Design Pattern

Module / Utility

## Dependencies

- **Runtime:** Derived from import graph above.
- **Workspace packages:** none

## Function-Level Notes

### `getRedisUrl`

- **Approx. line:** 36
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `getRedisUrl`?"

### `isQueueEnabled`

- **Approx. line:** 40
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `isQueueEnabled`?"

### `getStalledIntervalMs`

- **Approx. line:** 44
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `getStalledIntervalMs`?"

### `getMaxStalledCount`

- **Approx. line:** 50
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `getMaxStalledCount`?"

### `getRedisClient`

- **Approx. line:** 56
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `getRedisClient`?"

### `connectQueue`

- **Approx. line:** 68
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `connectQueue`?"

### `acquireTenantStreamSlot`

- **Approx. line:** 79
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `acquireTenantStreamSlot`?"

### `releaseTenantStreamSlot`

- **Approx. line:** 106
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `releaseTenantStreamSlot`?"

### `isAgentMessageRateLimited`

- **Approx. line:** 128
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `isAgentMessageRateLimited`?"

### `resetAgentRateLimitFallback`

- **Approx. line:** 157
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `resetAgentRateLimitFallback`?"

### `enqueueHeadlessTask`

- **Approx. line:** 162
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `enqueueHeadlessTask`?"

### `dequeueHeadlessTask`

- **Approx. line:** 182
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `dequeueHeadlessTask`?"

### `acknowledgeHeadlessTask`

- **Approx. line:** 204
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `acknowledgeHeadlessTask`?"

### `recoverStalledJobs`

- **Approx. line:** 212
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `recoverStalledJobs`?"

### `startStalledJobRecovery`

- **Approx. line:** 245
- **Role:** Implementation detail — open source file for full signature.
- **Interview:** "What are inputs, outputs, and side effects of `startStalledJobRecovery`?"


## Interview Questions

- Walk me through MAX_CONCURRENT_STREAMS_PER_TENANT line by line.
- What would break if we removed this file?
- How would you unit test this module?

## Possible Improvements

- Add explicit unit tests if missing.
- Document edge cases in JSDoc on public exports.
- Avoid circular imports with sibling modules.

## Senior-Level Discussion

- **Why this way?** Colocated with feature domain (`packages/agent/src`).
- **Tradeoff:** Monorepo shared package vs app-local — weigh bundle size and coupling.
- **Production concern:** Verify error boundaries, auth gates, and tenant scoping on every data path.

## Real-World Usage

Search repo for imports of this file:

```bash
rg "redis-queue" apps packages --glob '*.{ts,tsx}'
```

## Related Concepts

- See [03-react.md](../interview-prep/03-react.md) for React patterns.
- See [05-node.md](../interview-prep/05-node.md) for API/middleware patterns.
- See [06-mongodb.md](../interview-prep/06-mongodb.md) for Mongoose models.

---
_Auto-generated by `scripts/generate-interview-prep.mjs`. Enrich manually for hot-path files._
