import { describe, expect, it } from 'vitest';
import { startHealthServer, stopHealthServer } from '../health';

describe('45', () => { it('health server', async () => { startHealthServer(9191); await expect(stopHealthServer()).resolves.toBeUndefined(); }); });
