import { TenantSigningKey, type TenantSigningKeyStatus } from '@luxgen/db';

export interface PersistedSigningKey {
  tenantId: string;
  keyId: string;
  secret: string;
  status: TenantSigningKeyStatus;
  expiresAt?: Date;
}

export async function loadActiveAndGraceKeys(): Promise<PersistedSigningKey[]> {
  const now = new Date();
  const rows = await TenantSigningKey.find({
    status: { $in: ['active', 'grace'] },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .select('+secret')
    .lean();

  return rows.map((row) => ({
    tenantId: row.tenantId,
    keyId: row.keyId,
    secret: row.secret,
    status: row.status,
    expiresAt: row.expiresAt ?? undefined,
  }));
}

export async function upsertActiveKey(tenantId: string, secret: string): Promise<void> {
  await TenantSigningKey.findOneAndUpdate(
    { keyId: tenantId },
    { tenantId, keyId: tenantId, secret, status: 'active', $unset: { expiresAt: '', revokedAt: '' } },
    { upsert: true, new: true },
  );
}

export async function insertGraceKey(tenantId: string, secret: string, expiresAt: Date): Promise<void> {
  const keyId = `${tenantId}_grace_${expiresAt.getTime()}`;
  await TenantSigningKey.create({
    tenantId,
    keyId,
    secret,
    status: 'grace',
    expiresAt,
  });
}

export async function revokeKeysForTenant(tenantId: string): Promise<number> {
  const now = new Date();
  const result = await TenantSigningKey.updateMany(
    { tenantId, status: { $ne: 'revoked' } },
    { $set: { status: 'revoked', revokedAt: now } },
  );
  return result.modifiedCount;
}
