import { createHash, randomBytes } from 'crypto';
import { McpApiKey, McpToolAuditEntry, User, type IMcpApiKey, type McpApiKeyScope } from '@luxgen/db';

const KEY_PREFIX = 'luxgen_mcp_';

export function hashMcpApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

function generateRawKey(): string {
  return `${KEY_PREFIX}${randomBytes(24).toString('hex')}`;
}

export interface VerifiedMcpApiKey {
  id: string;
  tenantId: string;
  name: string;
  scopes: McpApiKeyScope[];
  createdByUserId: string;
}

export const mcpApiKeyService = {
  async createKey(
    tenantId: string,
    name: string,
    scopes: McpApiKeyScope[],
    createdByUserId: string,
  ): Promise<{ key: IMcpApiKey; secret: string }> {
    const secret = generateRawKey();
    const doc = await McpApiKey.create({
      tenantId,
      name: name.trim(),
      keyHash: hashMcpApiKey(secret),
      keyPrefix: secret.slice(0, KEY_PREFIX.length + 8),
      scopes,
      createdByUserId,
    });
    return { key: doc, secret };
  },

  async listKeys(tenantId: string): Promise<IMcpApiKey[]> {
    return McpApiKey.find({ tenantId, revokedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .lean<IMcpApiKey[]>();
  },

  async revokeKey(id: string, tenantId: string): Promise<IMcpApiKey | null> {
    return McpApiKey.findOneAndUpdate(
      { _id: id, tenantId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
      { new: true },
    ).lean<IMcpApiKey>();
  },

  async verifyRawKey(rawKey: string): Promise<VerifiedMcpApiKey | null> {
    if (!rawKey.startsWith(KEY_PREFIX)) return null;
    const keyHash = hashMcpApiKey(rawKey);
    const doc = await McpApiKey.findOne({ keyHash, revokedAt: { $exists: false } }).lean<IMcpApiKey>();
    if (!doc) return null;

    await McpApiKey.updateOne({ _id: doc._id }, { lastUsedAt: new Date() });

    return {
      id: String(doc._id),
      tenantId: doc.tenantId,
      name: doc.name,
      scopes: doc.scopes,
      createdByUserId: doc.createdByUserId,
    };
  },

  async loadKeyOwnerUser(createdByUserId: string) {
    return User.findById(createdByUserId).populate('tenant');
  },

  toGraphQL(key: IMcpApiKey) {
    return {
      id: String(key._id),
      tenantId: key.tenantId,
      name: key.name,
      scopes: key.scopes.map((s) => s.toUpperCase()),
      keyPrefix: key.keyPrefix,
      createdAt: key.createdAt,
      revokedAt: key.revokedAt ?? null,
      lastUsedAt: key.lastUsedAt ?? null,
    };
  },

  async recordToolAudit(input: {
    tenantId: string;
    keyId?: string;
    userId?: string;
    tool: string;
    success: boolean;
    durationMs: number;
    error?: string;
  }) {
    await McpToolAuditEntry.create({
      tenantId: input.tenantId,
      keyId: input.keyId,
      userId: input.userId,
      tool: input.tool,
      success: input.success,
      durationMs: input.durationMs,
      error: input.error,
      timestamp: new Date(),
    });
    return true;
  },

  async listAuditLog(tenantId: string, limit = 50) {
    const cap = Math.min(200, Math.max(1, limit));
    const rows = await McpToolAuditEntry.find({ tenantId }).sort({ timestamp: -1 }).limit(cap).lean();
    return rows.map((r) => ({
      id: String(r._id),
      tenantId: r.tenantId,
      keyId: r.keyId ?? null,
      userId: r.userId ?? null,
      tool: r.tool,
      success: r.success,
      durationMs: r.durationMs,
      error: r.error ?? null,
      timestamp: r.timestamp,
    }));
  },
};
