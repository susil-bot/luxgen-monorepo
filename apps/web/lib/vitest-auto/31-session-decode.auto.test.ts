import { describe, expect, it } from 'vitest';
import { decodeJwtPayload } from '../session';

describe('31', () => {
  it('decodeJwtPayload', () => {
    const payload = Buffer.from(JSON.stringify({ exp: 1 }), 'utf8').toString('base64url');
    expect(decodeJwtPayload('a.' + payload + '.c')?.exp).toBe(1);
  });
});
