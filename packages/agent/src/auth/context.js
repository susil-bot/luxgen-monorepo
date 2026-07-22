'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isAuthRequired = isAuthRequired;
exports.extractBearerToken = extractBearerToken;
exports.resolveAgentAuth = resolveAgentAuth;
exports.bindSessionAuth = bindSessionAuth;
const auth_1 = require('@luxgen/auth');
const session_store_1 = require('../changeset/session-store');
const agent_mode_1 = require('../config/agent-mode');
const DEV_CONTEXT = {
  userId: 'dev-user',
  tenantId: 'demo',
  email: 'dev@luxgen.local',
  role: 'ADMIN',
};
function isAuthRequired() {
  const mode = (0, agent_mode_1.getAgentConfig)().mode;
  return mode === 'staging' || mode === 'production';
}
function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}
function resolveAgentAuth(req) {
  const token = extractBearerToken(req);
  if (token) {
    const payload = (0, auth_1.verifyToken)(token);
    if (payload) {
      return {
        userId: payload.id,
        tenantId: payload.tenant || 'demo',
        email: payload.email,
        role: payload.role,
      };
    }
  }
  const tenantHeader = req.headers['x-tenant-id'];
  const userHeader = req.headers['x-user-id'];
  if (typeof tenantHeader === 'string' && typeof userHeader === 'string') {
    return { userId: userHeader, tenantId: tenantHeader };
  }
  if (!isAuthRequired()) {
    return DEV_CONTEXT;
  }
  return null;
}
function bindSessionAuth(sessionId, auth, extras) {
  const session = (0, session_store_1.loadSession)(sessionId);
  session.tenantId = auth.tenantId;
  session.userId = auth.userId;
  session.mode = extras?.mode || session.mode || 'interactive';
  if (extras?.prompt) session.prompt = extras.prompt;
  session.status = session.status || 'created';
  (0, session_store_1.saveSession)(session);
}
