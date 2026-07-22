'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getRedisUrl = getRedisUrl;
exports.isQueueEnabled = isQueueEnabled;
exports.getRedisClient = getRedisClient;
exports.connectQueue = connectQueue;
exports.enqueueHeadlessTask = enqueueHeadlessTask;
exports.dequeueHeadlessTask = dequeueHeadlessTask;
exports.getQueueDepth = getQueueDepth;
exports.disconnectQueue = disconnectQueue;
const ioredis_1 = __importDefault(require('ioredis'));
const crypto_1 = require('crypto');
const QUEUE_KEY = 'luxgen:agent:tasks';
let redis = null;
function getRedisUrl() {
  return process.env.AGENT_REDIS_URL || process.env.REDIS_URL;
}
function isQueueEnabled() {
  return Boolean(getRedisUrl()) && process.env.AGENT_QUEUE_ENABLED !== 'false';
}
function getRedisClient() {
  if (!isQueueEnabled()) return null;
  if (!redis) {
    redis = new ioredis_1.default(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}
async function connectQueue() {
  const client = getRedisClient();
  if (!client) return false;
  try {
    if (client.status !== 'ready') await client.connect();
    return true;
  } catch {
    return false;
  }
}
async function enqueueHeadlessTask(job) {
  const client = getRedisClient();
  if (!client) return null;
  await connectQueue();
  const fullJob = {
    ...job,
    id: (0, crypto_1.randomUUID)(),
    enqueuedAt: Date.now(),
  };
  await client.lpush(QUEUE_KEY, JSON.stringify(fullJob));
  return fullJob;
}
async function dequeueHeadlessTask(timeoutSeconds = 5) {
  const client = getRedisClient();
  if (!client) return null;
  await connectQueue();
  const result = await client.brpop(QUEUE_KEY, timeoutSeconds);
  if (!result) return null;
  const [, payload] = result;
  return JSON.parse(payload);
}
async function getQueueDepth() {
  const client = getRedisClient();
  if (!client) return 0;
  await connectQueue();
  return client.llen(QUEUE_KEY);
}
async function disconnectQueue() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
