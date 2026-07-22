# Bulk Upload & Export — Feature Architecture

> **Parent:** [Technical docs](../README.md) · **Related:** [../../FEATURE_CATALOG.md](../../FEATURE_CATALOG.md)

> **Type:** Feature Discovery Document
> **Status:** Ready for implementation
> **Author:** Senior Architect Review — 2026-06-20
> **Scope:** End-to-end architecture for bulk CSV/XLSX import and export across all major entities in the LuxGen multi-tenant platform

---

## 1. Problem Statement

The platform currently offers no way to:

- Import large sets of users, groups, members, courses, or listings from external systems (migration, onboarding, Shopify sync)
- Export tenant data for reporting, backup, CRM sync, or compliance

Every entity must be created one at a time through the UI. For tenants with 100+ users or 500+ listings, this is a hard blocker to adoption.

---

## 2. Entities in Scope

Derived from live DB models in `packages/db/src/`:

| Entity            | Model File            | Key Fields                                                     | Plan Gate |
| ----------------- | --------------------- | -------------------------------------------------------------- | --------- |
| Users             | `user.ts`             | email, firstName, lastName, role, status, phone, marketing\*   | starter+  |
| Group Members     | `group.ts`            | groupId, userId, role                                          | starter+  |
| Business Listings | `business-listing.ts` | businessName, applicantEmail, category, website, address       | starter+  |
| Courses           | `course.ts`           | title, description, instructor (email ref), startDate, endDate | pro+      |
| Enrollments       | `enrollment.ts`       | course (title ref), student (email ref), paymentStatus         | pro+      |
| Automations       | `automation.ts`       | name, triggerType, actions (JSON array), enabled               | pro+      |
| Activity Events   | `activity-event.ts`   | export-only, read-only audit trail                             | business+ |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (Next.js)                                                   │
│  ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────┐ │
│  │  BulkImportWizard│   │  ExportModal     │   │  JobStatus Panel│ │
│  │  /bulk/import    │   │  (per-list page) │   │  /bulk/jobs     │ │
│  └────────┬─────────┘   └────────┬─────────┘   └────────┬────────┘ │
│           │  multipart           │  POST               │  poll     │
└───────────┼──────────────────────┼─────────────────────┼───────────┘
            │                      │                     │
┌───────────▼──────────────────────▼─────────────────────▼───────────┐
│  Express API  (apps/api)                                             │
│  POST /api/bulk/upload/:entity   →  BulkUploadController            │
│  POST /api/bulk/export/:entity   →  ExportController                │
│  GET  /api/bulk/jobs/:jobId      →  JobStatusController             │
│  GET  /api/bulk/jobs/:jobId/download  →  Presigned redirect         │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │ multer (memory) │  │  BulkJobService  │  │  PlanGate check    │ │
│  │ 10MB file limit │  │  enqueue + track │  │  assertFeature()   │ │
│  └────────┬────────┘  └────────┬─────────┘  └────────────────────┘ │
│           │  upload to S3      │  push to BullMQ queue              │
└───────────┼────────────────────┼────────────────────────────────────┘
            │                    │
     ┌──────▼──────┐      ┌──────▼──────────────────────────────────┐
     │  AWS S3 /   │      │  Redis (existing: REDIS_URL)             │
     │  MinIO      │      │  BullMQ queues:                          │
     │  (file store│      │    bulk:import  (concurrency 2)          │
     │             │      │    bulk:export  (concurrency 5)          │
     └──────┬──────┘      └──────┬──────────────────────────────────┘
            │                    │
     ┌──────▼────────────────────▼──────────────────────────────────┐
     │  Agent Worker  (apps/agent-worker)  — extended                │
     │                                                                │
     │  runWorkerLoop()  ← existing                                  │
     │  runBulkImportWorker()  ← NEW                                 │
     │  runBulkExportWorker()  ← NEW                                 │
     │                                                                │
     │  ┌────────────────────────────────────────────────────────┐   │
     │  │  ImportProcessor                                        │   │
     │  │   1. Download file from S3                             │   │
     │  │   2. Stream-parse CSV / XLSX row by row                │   │
     │  │   3. Validate each row against entity schema           │   │
     │  │   4. Apply column mapping                              │   │
     │  │   5. Batch upsert 100 rows → MongoDB bulkWrite         │   │
     │  │   6. Emit progress updates to BulkJob record           │   │
     │  │   7. On complete: write error report to S3             │   │
     │  └────────────────────────────────────────────────────────┘   │
     │                                                                │
     │  ┌────────────────────────────────────────────────────────┐   │
     │  │  ExportProcessor                                        │   │
     │  │   1. Query MongoDB with tenant filter + filters         │   │
     │  │   2. Stream rows → CSV/XLSX writer                     │   │
     │  │   3. Upload to S3 as streaming multipart               │   │
     │  │   4. Generate presigned download URL (TTL 1h)          │   │
     │  │   5. Update BulkJob.downloadUrl                        │   │
     │  └────────────────────────────────────────────────────────┘   │
     └──────────────────────────────────────────────────────────────┘
```

---

## 4. New Database Model: `BulkJob`

**File to create:** `packages/db/src/bulk-job.ts`

```typescript
// Represents a single import or export operation, tracked to completion.
export type BulkJobType = 'import' | 'export';
export type BulkJobStatus = 'queued' | 'processing' | 'complete' | 'failed' | 'cancelled';
export type BulkJobEntity =
  | 'users'
  | 'group_members'
  | 'listings'
  | 'courses'
  | 'enrollments'
  | 'automations'
  | 'activity_events';
export type BulkJobFormat = 'csv' | 'xlsx' | 'json';

export interface IBulkJobProgress {
  processed: number; // rows processed so far
  total: number; // total rows in file (0 if unknown)
  errors: number; // rows that failed validation or insert
  skipped: number; // rows skipped (duplicates in upsert mode)
}

export interface IBulkJobResult {
  summary: IBulkJobProgress;
  errorReportKey?: string; // S3 key of the per-row error CSV
  downloadKey?: string; // S3 key of the exported file
  downloadUrl?: string; // Presigned URL (TTL 1h, only after export complete)
  downloadExpiresAt?: Date;
}

export interface IBulkJob extends Document {
  tenantId: string;
  createdByUserId: string;
  type: BulkJobType;
  entity: BulkJobEntity;
  format: BulkJobFormat;
  status: BulkJobStatus;
  fileKey?: string; // S3 key of the uploaded source file
  fileName?: string; // original filename for display
  columnMapping?: Record<string, string>; // { csvHeader: systemField }
  filters?: Record<string, unknown>; // export filter criteria
  dryRun: boolean; // if true, validate only, do not write
  progress: IBulkJobProgress;
  result?: IBulkJobResult;
  errorMessage?: string;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes required:**

```
{ tenantId: 1, status: 1, createdAt: -1 }
{ tenantId: 1, type: 1, entity: 1 }
{ createdByUserId: 1 }
```

Register the model in `packages/db/src/index.ts`.

---

## 5. New Package: `packages/bulk-ops`

This package holds all shared types, validators, column definitions, and parsers used by both the API layer and the worker. Keeps the worker free of Express deps.

### Directory structure

```
packages/bulk-ops/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── types.ts               ← shared BulkOpsError, ColumnDef, MappingTemplate
    ├── column-defs/
    │   ├── users.ts           ← ColumnDef[] for User import/export
    │   ├── group-members.ts
    │   ├── listings.ts
    │   ├── courses.ts
    │   ├── enrollments.ts
    │   └── automations.ts
    ├── validators/
    │   ├── row-validator.ts   ← validates a single parsed row against ColumnDef rules
    │   └── plan-validator.ts  ← checks row count against plan limits before queueing
    ├── parsers/
    │   ├── csv-parser.ts      ← wraps papaparse, returns AsyncGenerator<RawRow>
    │   └── xlsx-parser.ts     ← wraps exceljs, returns AsyncGenerator<RawRow>
    └── serializers/
        ├── csv-serializer.ts  ← streams rows to CSV (for export)
        └── xlsx-serializer.ts ← streams rows to XLSX (for export)
```

### `ColumnDef` type

```typescript
// A single column definition shared between import template headers
// and export column selection.
export interface ColumnDef {
  key: string; // system field name (matches DB field)
  label: string; // human-readable column header
  required: boolean; // import: row fails if missing
  importable: boolean; // can be provided in an import file
  exportable: boolean; // included in exports
  type: 'string' | 'email' | 'enum' | 'boolean' | 'date' | 'json';
  enumValues?: string[]; // for type 'enum', allowed values
  transform?: (raw: string) => unknown; // e.g., lowercase email
  validate?: (value: unknown) => string | null; // returns error message or null
}
```

### Example: `column-defs/users.ts`

```typescript
import { UserRole, UserStatus } from '@luxgen/db';
export const USER_COLUMNS: ColumnDef[] = [
  {
    key: 'email',
    label: 'Email',
    required: true,
    type: 'email',
    importable: true,
    exportable: true,
    transform: (v) => String(v).toLowerCase().trim(),
  },
  { key: 'firstName', label: 'First Name', required: true, type: 'string', importable: true, exportable: true },
  { key: 'lastName', label: 'Last Name', required: true, type: 'string', importable: true, exportable: true },
  {
    key: 'role',
    label: 'Role',
    required: false,
    type: 'enum',
    importable: true,
    exportable: true,
    enumValues: Object.values(UserRole),
    default: UserRole.STUDENT,
  },
  {
    key: 'status',
    label: 'Status',
    required: false,
    type: 'enum',
    importable: true,
    exportable: true,
    enumValues: Object.values(UserStatus),
    default: UserStatus.PENDING,
  },
  { key: 'phone', label: 'Phone', required: false, type: 'string', importable: true, exportable: true },
  {
    key: 'marketingEmail',
    label: 'Marketing Email',
    required: false,
    type: 'boolean',
    importable: true,
    exportable: true,
  },
  { key: 'createdAt', label: 'Created At', required: false, type: 'date', importable: false, exportable: true },
  // Never export/import password, JWT, or staffNotes via bulk
];
```

---

## 6. API Layer

### New route file: `apps/api/src/routes/bulk.ts`

Register in `app.ts`:

```typescript
import bulkRoutes from './routes/bulk';
app.use('/api/bulk', bulkRoutes);
```

### Endpoints

#### `POST /api/bulk/upload/:entity`

**Purpose:** Accept a file, stage it to S3, create a `BulkJob`, enqueue the job.

**Auth:** `authMiddleware` (authenticated user)
**Plan gate:** `starter` minimum. Row count limit validated per plan tier before queueing.

**Request:** `multipart/form-data`

```
file         binary        The CSV / XLSX file
format       string        'csv' | 'xlsx' | 'json'
columnMapping  string      JSON: { csvHeader: systemField }
dryRun       boolean       If true, validate only, no writes
```

**Response:**

```json
{ "jobId": "64abc...", "status": "queued", "entity": "users", "totalRows": 312 }
```

**Processing flow inside the handler:**

1. `requireFeature(ctx, 'bulkOps')` — plan gate
2. `multer.memoryStorage()` — accept file up to plan limit size
3. Count rows in buffer (fast CSV line count or XLSX `xlsx.getWorksheet(1).rowCount`)
4. Validate row count ≤ `getPlanLimits(plan).maxBulkImportRows`
5. Upload buffer to S3: `s3.upload({ Bucket, Key: bulkops/<tenantId>/<jobId>/source.<ext> })`
6. Create `BulkJob` in MongoDB
7. Push job to BullMQ queue `bulk:import`
8. Return `{ jobId, status: 'queued' }`

**Middleware order:** `authMiddleware → planGate → multerMiddleware → handler`

---

#### `POST /api/bulk/export/:entity`

**Purpose:** Enqueue an export job; returns a jobId the client polls.

**Auth:** `authMiddleware`
**Plan gate:** `starter` minimum for CSV; `pro` for XLSX + column selection.

**Request body (JSON):**

```json
{
  "format": "csv",
  "filters": { "status": "ACTIVE", "role": "STUDENT" },
  "columns": ["email", "firstName", "lastName", "createdAt"]
}
```

**Response:**

```json
{ "jobId": "64xyz...", "status": "queued" }
```

**Processing flow:**

1. Plan gate check
2. Create `BulkJob` (type: `export`, no fileKey yet)
3. Push to BullMQ queue `bulk:export`
4. Return `{ jobId, status: 'queued' }`

---

#### `GET /api/bulk/jobs/:jobId`

**Purpose:** Poll job progress and status.

**Auth:** `authMiddleware` + validate `job.tenantId === req.tenantId`

**Response:**

```json
{
  "jobId": "64abc...",
  "status": "processing",
  "entity": "users",
  "type": "import",
  "progress": { "processed": 150, "total": 312, "errors": 3, "skipped": 5 },
  "createdAt": "2026-06-20T10:00:00Z"
}
```

---

#### `GET /api/bulk/jobs/:jobId/download`

**Purpose:** Redirect to the presigned S3 download URL for completed exports or error reports.

**Auth:** `authMiddleware` + ownership check

**Response:** `302 redirect` to presigned S3 URL (TTL: 1 hour)

If export job: redirect to the exported file.
If import job with errors: redirect to the per-row error report CSV.

---

#### `GET /api/bulk/jobs`

**Purpose:** List the tenant's recent bulk jobs (last 50, paginated).

**Auth:** `authMiddleware`

**Response:** Array of `BulkJob` summaries (no file keys exposed to client).

---

#### `DELETE /api/bulk/jobs/:jobId`

**Purpose:** Cancel a queued job (if still in queue) or delete the record.

---

### New service file: `apps/api/src/services/bulkJobService.ts`

```typescript
class BulkJobService {
  async createImportJob(tenantId, userId, entity, format, fileKey, fileName, columnMapping, dryRun): Promise<IBulkJob>;
  async createExportJob(tenantId, userId, entity, format, filters, columns): Promise<IBulkJob>;
  async getJob(jobId, tenantId): Promise<IBulkJob | null>; // scoped by tenantId
  async listJobs(tenantId, limit, skip): Promise<IBulkJob[]>;
  async updateProgress(jobId, progress): Promise<void>; // called by worker
  async markComplete(jobId, result): Promise<void>;
  async markFailed(jobId, errorMessage): Promise<void>;
}
```

---

## 7. Worker Layer

### Extend `apps/agent-worker/src/index.ts`

Add alongside `runWorkerLoop()`:

```typescript
import { runBulkImportWorker, runBulkExportWorker } from '@luxgen/bulk-worker';

await Promise.all([runWorkerLoop(), runBulkImportWorker(), runBulkExportWorker()]);
```

### New package: `packages/bulk-worker` (or extend `packages/agent`)

Alternatively, add bulk processing directly into `apps/agent-worker/src/bulk/` to avoid creating another package. Given the monorepo structure, adding directly to the agent-worker `src` is simpler.

### Import Processor (`apps/agent-worker/src/bulk/import-processor.ts`)

```typescript
// Called by BullMQ worker for each bulk:import job.
async function processImportJob(job: BullMQJob<BulkImportPayload>) {
  const { jobId, tenantId, fileKey, entity, columnMapping, dryRun } = job.data;

  // 1. Download file buffer from S3
  const buffer = await s3.getObject({ Bucket, Key: fileKey }).promise();

  // 2. Get column definitions for entity
  const colDefs = getColumnDefs(entity); // from packages/bulk-ops

  // 3. Stream-parse — use AsyncGenerator to avoid loading entire file into memory
  const rows = parseFile(buffer.Body, format, colDefs); // yields { rowNum, raw, mapped }

  const errors: RowError[] = [];
  let processed = 0;
  let batch: MappedRow[] = [];
  const BATCH_SIZE = 100;

  for await (const { rowNum, raw, mapped, validationErrors } of rows) {
    if (validationErrors.length > 0) {
      errors.push({ rowNum, errors: validationErrors, raw });
      continue;
    }
    batch.push(mapped);

    if (batch.length >= BATCH_SIZE) {
      if (!dryRun) {
        await writeBatch(entity, tenantId, batch); // MongoDB bulkWrite
      }
      processed += batch.length;
      batch = [];
      // emit progress every batch
      await bulkJobService.updateProgress(jobId, { processed, total: totalRows, errors: errors.length });
      await job.updateProgress(Math.round((processed / totalRows) * 100));
    }
  }

  // flush remaining batch
  if (batch.length > 0 && !dryRun) {
    await writeBatch(entity, tenantId, batch);
    processed += batch.length;
  }

  // Write error report to S3 if errors exist
  let errorReportKey: string | undefined;
  if (errors.length > 0) {
    errorReportKey = await writeErrorReport(jobId, tenantId, errors);
  }

  await bulkJobService.markComplete(jobId, {
    summary: { processed, total: totalRows, errors: errors.length, skipped: 0 },
    errorReportKey,
  });
}
```

### Batch Writer (`apps/agent-worker/src/bulk/batch-writer.ts`)

Uses MongoDB `bulkWrite` with upsert semantics to be idempotent (safe to re-run):

```typescript
// Example for users entity
async function writeBatch(entity: BulkJobEntity, tenantId: string, rows: MappedRow[]) {
  switch (entity) {
    case 'users':
      await User.bulkWrite(
        rows.map((row) => ({
          updateOne: {
            filter: { email: row.email, tenant: tenantId },
            update: { $setOnInsert: { password: generateTempPassword() }, $set: { ...row, tenant: tenantId } },
            upsert: true,
          },
        })),
      );
      break;
    case 'listings':
      await BusinessListing.bulkWrite(
        rows.map((row) => ({
          updateOne: {
            filter: { tenantId, applicantEmail: row.applicantEmail },
            update: { $set: { ...row, tenantId } },
            upsert: true,
          },
        })),
      );
      break;
    // ... other entities
  }
}
```

**Upsert key per entity:**
| Entity | Upsert key |
|--------|-----------|
| users | `{ email, tenant }` |
| group_members | `{ groupId, userId }` |
| listings | `{ tenantId, slug }` |
| courses | `{ tenant, title, instructor }` |
| enrollments | `{ course, student }` (unique index already exists) |
| automations | `{ tenantId, name }` |

---

### Export Processor (`apps/agent-worker/src/bulk/export-processor.ts`)

```typescript
async function processExportJob(job: BullMQJob<BulkExportPayload>) {
  const { jobId, tenantId, entity, format, filters, columns } = job.data;

  // 1. Build MongoDB query from filters — always scope by tenantId
  const query = buildEntityQuery(entity, tenantId, filters);
  const colDefs = getColumnDefs(entity).filter((c) => c.exportable && columns.includes(c.key));

  // 2. Stream from MongoDB using cursor() to avoid loading all records into memory
  const cursor = getEntityModel(entity).find(query).lean().cursor();

  // 3. Stream to S3 via multipart upload
  const s3Key = `bulkops/${tenantId}/${jobId}/export.${format}`;
  const { upload, writeRow } = createS3StreamUpload(s3Key, format, colDefs);

  let count = 0;
  for await (const doc of cursor) {
    const row = serializeRow(doc, colDefs);
    await writeRow(row);
    count++;
    if (count % 500 === 0) {
      await bulkJobService.updateProgress(jobId, { processed: count, total: 0 });
      await job.updateProgress(-1); // indeterminate
    }
  }

  await upload.done();

  // 4. Generate presigned download URL (1 hour TTL)
  const downloadUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket,
    Key: s3Key,
    Expires: 3600,
  });

  await bulkJobService.markComplete(jobId, {
    summary: { processed: count, total: count, errors: 0, skipped: 0 },
    downloadKey: s3Key,
    downloadUrl,
    downloadExpiresAt: new Date(Date.now() + 3600 * 1000),
  });
}
```

---

## 8. BullMQ Queue Setup

**File to create:** `apps/api/src/lib/bulkQueue.ts` (API side — enqueuing only)
**File to create:** `apps/agent-worker/src/bulk/queues.ts` (worker side — consuming)

```typescript
// apps/api/src/lib/bulkQueue.ts
import { Queue } from 'bullmq';
import { getRedisClient } from './redis';

let _importQueue: Queue | null = null;
let _exportQueue: Queue | null = null;

export function getImportQueue(): Queue {
  if (!_importQueue) {
    _importQueue = new Queue('bulk:import', { connection: getRedisClient()! });
  }
  return _importQueue;
}

export function getExportQueue(): Queue {
  if (!_exportQueue) {
    _exportQueue = new Queue('bulk:export', { connection: getRedisClient()! });
  }
  return _exportQueue;
}
```

**Worker config:**

```typescript
// apps/agent-worker/src/bulk/queues.ts
import { Worker } from 'bullmq';

export function runBulkImportWorker() {
  const worker = new Worker('bulk:import', processImportJob, {
    connection: redisConnection,
    concurrency: 2, // 2 parallel imports per worker pod
    limiter: { max: 5, duration: 1000 }, // 5 jobs/sec across all instances
  });
  worker.on('failed', (job, err) => {
    logger.error(`Import job ${job?.id} failed: ${err.message}`);
    bulkJobService.markFailed(job!.data.jobId, err.message);
  });
  return worker;
}

export function runBulkExportWorker() {
  const worker = new Worker('bulk:export', processExportJob, {
    connection: redisConnection,
    concurrency: 5, // exports are read-only, can run more in parallel
  });
  // ...
  return worker;
}
```

**Add `bullmq` to `apps/agent-worker/package.json`** (ioredis already present as a peer dep of bullmq).

---

## 9. Plan Limits

Extend `packages/billing/src/plans.ts` to add `bulkOps` limits:

```typescript
// Add to PlanDefinition.limits:
limits: {
  maxLearners: number;
  maxAutomations: number;
  maxAutomationRunsPerMonth: number;
  maxBulkImportRowsPerJob: number;   // NEW
  maxBulkExportsPerDay: number;      // NEW
}

// Add to PLAN_DEFINITIONS:
free:       { maxBulkImportRowsPerJob: 0,      maxBulkExportsPerDay: 0     }  // no bulk ops
starter:    { maxBulkImportRowsPerJob: 500,    maxBulkExportsPerDay: 3     }
pro:        { maxBulkImportRowsPerJob: 5000,   maxBulkExportsPerDay: 10    }
business:   { maxBulkImportRowsPerJob: 25000,  maxBulkExportsPerDay: 50    }
enterprise: { maxBulkImportRowsPerJob: 100000, maxBulkExportsPerDay: -1    }  // -1 = unlimited
```

Add `'bulkOps'` to `BillingFeature` type in `plans.ts`.

Add to `packages/billing/src/gates.ts`:

```typescript
case 'bulkOps':
  return plan !== 'free';
```

---

## 10. File Storage (S3)

**New environment variables** (add to `.env.example` and K8s `secret.yaml`/`configmap.yaml`):

```
BULK_OPS_S3_BUCKET=luxgen-bulk-ops
BULK_OPS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
# Or for self-hosted / staging:
BULK_OPS_S3_ENDPOINT=http://minio:9000   # MinIO endpoint (optional)
```

**S3 key structure:**

```
bulkops/
  {tenantId}/
    {jobId}/
      source.csv          ← uploaded import file
      export.csv          ← generated export file
      errors.csv          ← per-row validation error report
```

**S3 lifecycle policy:** Delete files after 7 days. No sensitive data stored permanently.

**Fallback for local dev:** If `BULK_OPS_S3_BUCKET` is not set, store files temporarily in `/tmp/luxgen-bulk/{tenantId}/{jobId}/`. Log a warning. Never use filesystem fallback in production.

**New utility:** `apps/api/src/lib/bulkStorage.ts`

```typescript
export async function uploadToBulkStorage(key: string, buffer: Buffer, contentType: string): Promise<string>;
export async function downloadFromBulkStorage(key: string): Promise<Buffer>;
export async function generatePresignedUrl(key: string, ttlSeconds: number): Promise<string>;
export async function deleteFromBulkStorage(key: string): Promise<void>;
```

---

## 11. Frontend Implementation

### New pages

#### `/pages/bulk/import.tsx` — Multi-step import wizard

**Step 1: Select entity**

- Dropdown: Users / Group Members / Listings / Courses / Enrollments
- Show max row limit for current plan
- Download template button → `GET /api/bulk/template/:entity` → returns CSV with correct headers

**Step 2: Upload file**

- Drag-and-drop area accepting `.csv`, `.xlsx`
- File size limit shown (derived from plan)
- Preview: first 5 rows shown in a table

**Step 3: Column Mapping**

- Left column: CSV headers detected from file
- Right column: system field dropdown (required fields marked)
- Auto-map when headers match exactly (case-insensitive)
- "Save as template" for reuse

**Step 4: Dry Run Preview**

- Client sends file with `dryRun: true`
- Server returns validation errors per row without writing
- Show: `312 rows valid`, `8 rows with errors`, expandable error table
- "Proceed to import" button (enabled only if user accepts error rows will be skipped)

**Step 5: Confirm & Track**

- Starts actual import
- Progress bar polling `/api/bulk/jobs/:jobId` every 2 seconds
- On complete: show summary + "Download error report" if any

#### Export modal (added to list pages)

Add an **"Export"** button to the toolbar of:

- `/pages/admin/users.tsx`
- `/pages/groups/index.tsx`
- `/pages/admin/customers/index.tsx`
- `/pages/admin/listings/index.tsx`
- `/pages/courses.tsx`

Export modal contains:

- Format selector: CSV / XLSX
- Column selector: checkboxes for exportable columns
- Filter summary: "Exporting 423 records matching current filters"
- Export button → polls job until complete → triggers download

#### `/pages/bulk/jobs.tsx` — Job history

Table of all recent import/export jobs with status, entity, row count, created time, and download/error-report links.

---

### New GraphQL types (optional — could be REST-only)

If GraphQL coverage is wanted:

```graphql
# apps/api/src/schema/bulkOps/typeDefs.ts
type BulkJob {
  id: ID!
  type: BulkJobType!
  entity: BulkJobEntity!
  format: BulkJobFormat!
  status: BulkJobStatus!
  progress: BulkJobProgress!
  dryRun: Boolean!
  createdAt: DateTime!
  completedAt: DateTime
  errorMessage: String
}

type BulkJobProgress {
  processed: Int!
  total: Int!
  errors: Int!
  skipped: Int!
}

enum BulkJobType {
  import
  export
}
enum BulkJobStatus {
  queued
  processing
  complete
  failed
  cancelled
}
enum BulkJobEntity {
  users
  group_members
  listings
  courses
  enrollments
  automations
}
enum BulkJobFormat {
  csv
  xlsx
  json
}

type Query {
  bulkJob(id: ID!): BulkJob
  bulkJobs(limit: Int, offset: Int): [BulkJob!]!
}

type Mutation {
  cancelBulkJob(id: ID!): BulkJob!
}

type Subscription {
  bulkJobProgress(jobId: ID!): BulkJob! # real-time via WebSocket
}
```

The upload and export initiation remain REST endpoints (file upload via multipart, not GraphQL).

---

## 12. Download Template Endpoint

**File to add:** handler inside `apps/api/src/routes/bulk.ts`

```
GET /api/bulk/template/:entity?format=csv
```

Returns a CSV / XLSX file with correct headers, column descriptions, and one example row. No auth required (public endpoint) to allow pre-login downloads.

Generated from `ColumnDef[]` in `packages/bulk-ops/src/column-defs/`.

---

## 13. Security Considerations

| Risk                                                 | Mitigation                                                                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| A tenant importing users into another tenant's space | `tenantId` is always sourced from the verified JWT, never from the file or request body                                       |
| File upload DoS (very large files)                   | Multer `limits.fileSize` = plan-based limit; row count validated before S3 upload                                             |
| Malicious CSV (CSV injection)                        | Sanitize cell values starting with `=`, `+`, `-`, `@` before writing to export                                                |
| S3 key enumeration                                   | S3 keys include `tenantId` prefix; IAM policy limits each tenant to their prefix                                              |
| Presigned URL sharing                                | TTL 1 hour; URL is job-scoped; user must be authenticated to request URL                                                      |
| Password exposure in user import                     | Never include `password` in import columns. Generate a random temp password on insert; send invite email (once H-19 is fixed) |
| Column mapping injection                             | Map only to known `ColumnDef.key` values; reject any unmapped system fields                                                   |

---

## 14. Error Handling & Reporting

### Per-row error report

When an import finishes with row-level errors, generate a CSV uploaded to S3:

```
Row,Original Data,Error
3,"john@.com,John,Doe","email: invalid format"
7,"alice@test.com,,,","firstName: required"
12,"bob@test.com,Bob,Smith,SUPERADMIN","role: must be one of ADMIN,INSTRUCTOR,STUDENT,USER"
```

The client can download this via `GET /api/bulk/jobs/:jobId/download?type=errors`.

### Job-level failures

If the worker itself crashes (OOM, Redis timeout), BullMQ's stalled-job recovery re-enqueues the job after `stalledInterval` (default 30s). The `BulkJob` record stays in `processing` state. The API polling endpoint should treat `status === 'processing'` + `startedAt` older than 10 minutes as a warning state.

---

## 15. Implementation Order (Recommended Sequence)

The following sequence minimises blocked work — each phase is independently shippable:

### Phase 1 — Foundation (unblocks everything)

1. Add `BulkJob` model to `packages/db/src/bulk-job.ts` and register in `index.ts`
2. Create `packages/bulk-ops` with `ColumnDef` types and column definitions for all entities
3. Add `bulkOps` feature flag and row limits to `packages/billing/src/plans.ts` and `gates.ts`
4. Create `apps/api/src/lib/bulkStorage.ts` (S3 + local fallback)
5. Add `bullmq` dep to `apps/agent-worker/package.json`; set up queues in `apps/api/src/lib/bulkQueue.ts`

### Phase 2 — API Endpoints

6. Create `apps/api/src/services/bulkJobService.ts`
7. Create `apps/api/src/routes/bulk.ts` with all 5 endpoints
8. Register `/api/bulk` in `apps/api/src/app.ts`
9. Add `GET /api/bulk/template/:entity` endpoint

### Phase 3 — Worker Processing

10. Implement `apps/agent-worker/src/bulk/import-processor.ts`
11. Implement `apps/agent-worker/src/bulk/export-processor.ts`
12. Implement `apps/agent-worker/src/bulk/batch-writer.ts` for all entities
13. Extend `apps/agent-worker/src/index.ts` to start bulk queues alongside `runWorkerLoop()`

### Phase 4 — Frontend

14. Create `/pages/bulk/import.tsx` (5-step wizard)
15. Create export modal component: `apps/web/components/bulk/ExportModal.tsx`
16. Create job history: `/pages/bulk/jobs.tsx`
17. Wire export button to existing list pages (users, groups, listings, courses)
18. Add progress poller hook: `apps/web/hooks/useBulkJobPoller.ts`

### Phase 5 — Polish & Tests

19. Write unit tests for `packages/bulk-ops` row validator and CSV/XLSX parsers
20. Write integration tests for all 5 bulk REST endpoints
21. Write worker integration test (import 10 rows → verify DB writes)
22. Add K8s env vars to `configmap.yaml` and `secret.yaml` (S3 credentials)
23. Update `k8s/agent-worker.yaml` to add `BULK_OPS_S3_BUCKET` env var

---

## 16. New Files Checklist

```
packages/
  bulk-ops/
    package.json                                 ← new package
    tsconfig.json
    src/
      index.ts
      types.ts
      column-defs/users.ts
      column-defs/group-members.ts
      column-defs/listings.ts
      column-defs/courses.ts
      column-defs/enrollments.ts
      column-defs/automations.ts
      validators/row-validator.ts
      validators/plan-validator.ts
      parsers/csv-parser.ts
      parsers/xlsx-parser.ts
      serializers/csv-serializer.ts
      serializers/xlsx-serializer.ts
  db/src/
    bulk-job.ts                                  ← new DB model
    index.ts                                     ← add BulkJob export
  billing/src/
    plans.ts                                     ← add maxBulkImportRowsPerJob, maxBulkExportsPerDay
    gates.ts                                     ← add 'bulkOps' feature

apps/api/src/
  lib/
    bulkStorage.ts                               ← S3 + local-dev fallback
    bulkQueue.ts                                 ← BullMQ queue instances
  services/
    bulkJobService.ts                            ← job CRUD + progress updates
  routes/
    bulk.ts                                      ← all 5 REST endpoints
  app.ts                                         ← register /api/bulk

apps/agent-worker/src/
  bulk/
    import-processor.ts
    export-processor.ts
    batch-writer.ts
    queues.ts
  index.ts                                       ← start bulk workers

apps/web/
  pages/
    bulk/
      import.tsx                                 ← multi-step wizard
      jobs.tsx                                   ← job history
  components/
    bulk/
      ExportModal.tsx
      BulkImportWizard.tsx
      ColumnMappingStep.tsx
      DryRunPreview.tsx
      JobProgressBar.tsx
  hooks/
    useBulkJobPoller.ts

k8s/
  configmap.yaml                                 ← add BULK_OPS_S3_BUCKET, BULK_OPS_S3_REGION
  secret.yaml                                    ← add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  agent-worker.yaml                              ← add S3 env refs
```

---

## 17. Dependencies to Add

| Package                         | Used in           | Purpose                                       |
| ------------------------------- | ----------------- | --------------------------------------------- |
| `bullmq`                        | agent-worker, api | Job queue (ioredis already installed as peer) |
| `@aws-sdk/client-s3`            | api, agent-worker | S3 upload/download/presign                    |
| `@aws-sdk/s3-request-presigner` | api               | Presigned URL generation                      |
| `papaparse`                     | bulk-ops          | CSV streaming parser                          |
| `exceljs`                       | bulk-ops          | XLSX read/write streaming                     |
| `multer`                        | api               | Multipart file upload middleware              |
| `@types/multer`                 | api               | TypeScript types                              |

No new client-side dependencies needed — the frontend uses native fetch for file upload and the job polling hook uses the existing `apollo-client` or plain fetch.

---

## 18. Open Questions (Decisions Required Before Implementation)

1. **S3 vs MinIO for staging:** Does the staging environment have S3 access, or should MinIO be added to `docker-compose.staging.yml`?

2. **Password handling for imported users:** When a user is created via bulk import, should they:
   a. Receive an invite email (depends on H-19 password reset being implemented first), or
   b. Get a generated temp password returned in the error report (risky), or
   c. Be created in `PENDING` status with no password, requiring an admin-triggered invite?
   **Recommendation:** Option C — create as `PENDING`, admin can bulk-invite after import via the existing invite endpoint.

3. **Duplicate handling mode:** Import conflicting records should support two modes:
   - `upsert` (default) — update existing records matched by upsert key
   - `skip` — skip rows where the record already exists
   - `fail` — abort entire job if any duplicate is found
     Should this be configurable per-job, or fixed at `upsert` always?

4. **Real-time progress:** The current plan uses polling (every 2s). BullMQ supports progress events via Redis pub/sub. If WebSocket is preferred over polling, the existing GraphQL `Subscription` + WS setup can relay BullMQ progress events. Is polling acceptable, or should real-time WebSocket be required?

5. **Export scheduling:** Should tenants be able to schedule recurring exports (e.g., weekly user export to S3)? If yes, this integrates with the existing `Automation` trigger system (`SCHEDULE` trigger type → `CALL_WEBHOOK` action posting to `/api/bulk/export`). Out of scope for Phase 1 but designed to be added without breaking changes.
