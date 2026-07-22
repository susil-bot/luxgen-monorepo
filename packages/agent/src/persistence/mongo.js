'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getMongoUri = getMongoUri;
exports.isMongoPersistenceEnabled = isMongoPersistenceEnabled;
exports.ensureMongoConnection = ensureMongoConnection;
exports.syncSessionToMongo = syncSessionToMongo;
exports.appendAuditEntry = appendAuditEntry;
exports.getTaskFromMongo = getTaskFromMongo;
exports.getAuditLog = getAuditLog;
exports.updateTaskValidation = updateTaskValidation;
const mongoose_1 = __importDefault(require('mongoose'));
const db_1 = require('@luxgen/db');
const db_2 = require('@luxgen/db');
const agent_mode_1 = require('../config/agent-mode');
let connected = false;
function getMongoUri() {
  return process.env.AGENT_MONGODB_URI || process.env.MONGODB_URI;
}
function isMongoPersistenceEnabled() {
  const uri = getMongoUri();
  if (!uri) return false;
  if (process.env.AGENT_MONGODB_FORCE === 'true') return true;
  return (0, agent_mode_1.getAgentConfig)().mode !== 'local';
}
async function ensureMongoConnection() {
  if (!isMongoPersistenceEnabled()) return false;
  if (connected && mongoose_1.default.connection.readyState === 1) return true;
  const uri = getMongoUri();
  if (!uri) return false;
  try {
    await (0, db_1.connectDB)(uri);
    connected = true;
    return true;
  } catch {
    return false;
  }
}
async function syncSessionToMongo(session) {
  if (!(await ensureMongoConnection())) return;
  if (!session.tenantId || !session.userId) return;
  const fileCount = Object.keys(session.files).length;
  let status = session.status || 'created';
  if (fileCount > 0 && status === 'created') status = 'staged';
  await db_2.AgentTask.findOneAndUpdate(
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
async function appendAuditEntry(params) {
  if (!(await ensureMongoConnection())) return;
  await db_2.AgentAuditEntry.create({
    sessionId: params.sessionId,
    tenantId: params.tenantId,
    userId: params.userId,
    action: params.action,
    details: params.details || {},
    timestamp: new Date(),
  });
}
async function getTaskFromMongo(sessionId) {
  if (!(await ensureMongoConnection())) return null;
  const doc = await db_2.AgentTask.findOne({ sessionId }).lean();
  return doc;
}
async function getAuditLog(sessionId, limit = 50) {
  if (!(await ensureMongoConnection())) return [];
  const entries = await db_2.AgentAuditEntry.find({ sessionId }).sort({ timestamp: -1 }).limit(limit).lean();
  return entries;
}
async function updateTaskValidation(sessionId, validation) {
  if (!(await ensureMongoConnection())) return;
  await db_2.AgentTask.findOneAndUpdate(
    { sessionId },
    { validation, status: validation.passed ? 'pending_review' : 'staged' },
  );
}
