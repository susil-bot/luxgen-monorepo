import { config } from 'dotenv';
import path from 'path';
import { ensureMongoConnection, runWorkerLoop, shutdownWorker } from '@luxgen/agent';

config({ path: path.resolve(__dirname, '../../../apps/web/.env.local') });
config({ path: path.resolve(__dirname, '../../../apps/api/.env') });
config();

async function main() {
  console.log('[agent-worker] Starting LuxGen Agent Worker (Phase 6)');

  const mongoOk = await ensureMongoConnection();
  console.log(`[agent-worker] MongoDB: ${mongoOk ? 'connected' : 'filesystem fallback'}`);

  process.on('SIGINT', async () => {
    console.log('\n[agent-worker] Shutting down…');
    await shutdownWorker();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await shutdownWorker();
    process.exit(0);
  });

  await runWorkerLoop();
}

main().catch((err) => {
  console.error('[agent-worker] Fatal:', err);
  process.exit(1);
});
