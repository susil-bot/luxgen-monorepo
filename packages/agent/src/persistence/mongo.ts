import mongoose from 'mongoose';
import { connectDB } from '@luxgen/db';
import { AgentTask, AgentAuditEntry, ActivityEventKind, ActivityActorType, ActivitySubjectType } from '@luxgen/db';
import type { AgentSession } from '../types/session';
import type { AuditAction } from '../types/task';
import type { ValidationResult } from '../types/validation';
import { getAgentConfig } from '../config/agent-mode';
import { recordTimelineEvent } from '../timeline/record';

let connected = false;

export function getMongoUri(): string | undefined {
  return process.env.AGENT_MONGODB_URI || process.env.MONGODB_URI;
}

export function isMongoPersistenceEnabled(): boolean {
  const uri = getMongoUri();
  if (!uri) return false;
  if (process.env.AGENT_MONGODB_FORCE === 'true') return true;
  return getAgentConfig().mode !== 'local';
}

export async function ensureMongoConnection(): Promise<boolean> {
  if (!isMongoPersistenceEnabled()) return false;
  if (connected && mongoose.connection.readyState === 1) return true;

  const uri = getMongoUri();
  if (!uri) return false;

  try {
    await connectDB(uri);
    connected = true;
    return true;
  } catch {
    return false;
  }
}

export async function syncSessionToMongo(session: AgentSession): Promise<void> {
  if (!(await ensureMongoConnection())) return;
  if (!session.tenantId || !session.userId) return;

  const fileCount = Object.keys(session.files).length;
  let status = session.status || 'created';
  if (fileCount > 0 && status === 'created') status = 'staged';

  await AgentTask.findOneAndUpdate(
    { sessionId: session.id },
    {
      sessionId: session.id,
      tenantId: session.tenantId,
      userId: session.userId,
      status,
      mode: session.mode || 'interactive',
      prompt: session.prompt,
      files: session.files,
      git: session.git,
      validation: session.validation,
      metadata: {
        updatedAt: new Date(session.updatedAt),
        createdAt: new Date(session.createdAt),
      },
    },
    { upsert: true, new: true },
  );
}

export async function appendAuditEntry(params: {
  sessionId: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  details?: Record<string, unknown>;
}): Promise<void> {
  if (!(await ensureMongoConnection())) return;

  await AgentAuditEntry.create({
    sessionId: params.sessionId,
    tenantId: params.tenantId,
    userId: params.userId,
    action: params.action,
    details: params.details || {},
    timestamp: new Date(),
  });

  await recordAgentTimelineFromAudit(params);
}

async function recordAgentTimelineFromAudit(params: {
  sessionId: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  details?: Record<string, unknown>;
}): Promise<void> {
  const tracked = new Set(['staged', 'committed', 'merged', 'failed', 'approved']);
  if (!tracked.has(params.action)) return;

  const details = params.details ?? {};
  const courseId = details.courseId as string | undefined;
  const orderId = details.orderId as string | undefined;
  const customerId = (details.customerId ?? details.userId ?? params.userId) as string | undefined;

  const subjects: Array<{ subjectType: ActivitySubjectType; subjectId: string }> = [];
  if (orderId) {
    subjects.push({ subjectType: ActivitySubjectType.ORDER, subjectId: orderId });
  }
  if (courseId) {
    subjects.push({ subjectType: ActivitySubjectType.PRODUCT, subjectId: courseId });
  }
  if (customerId && !orderId) {
    subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: customerId });
  }
  if (subjects.length === 0) return;

  const message = `Agent Studio: ${params.action}`;
  const metadata = {
    sessionId: params.sessionId,
    agentAction: params.action,
    userId: params.userId,
    ...details,
  };

  for (const { subjectType, subjectId } of subjects) {
    await recordTimelineEvent({
      tenantId: params.tenantId,
      subjectType,
      subjectId,
      kind: ActivityEventKind.APP,
      eventType: `agent.${params.action}`,
      message,
      actorType: ActivityActorType.APP,
      actorName: 'Agent Studio',
      metadata,
      criticalAlert: params.action === 'failed',
    });
  }
}

export async function getTaskFromMongo(sessionId: string): Promise<Record<string, unknown> | null> {
  if (!(await ensureMongoConnection())) return null;
  const doc = await AgentTask.findOne({ sessionId }).lean();
  return doc as Record<string, unknown> | null;
}

export async function getAuditLog(sessionId: string, limit = 50): Promise<Array<Record<string, unknown>>> {
  if (!(await ensureMongoConnection())) return [];
  const entries = await AgentAuditEntry.find({ sessionId }).sort({ timestamp: -1 }).limit(limit).lean();
  return entries as Array<Record<string, unknown>>;
}

export async function updateTaskValidation(sessionId: string, validation: ValidationResult): Promise<void> {
  if (!(await ensureMongoConnection())) return;
  await AgentTask.findOneAndUpdate(
    { sessionId },
    { validation, status: validation.passed ? 'pending_review' : 'staged' },
  );
}
