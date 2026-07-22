import { config } from 'dotenv';
import path from 'path';
import { ensureMongoConnection, runWorkerLoop, shutdownWorker } from '@luxgen/agent';
import { startHealthServer, stopHealthServer } from './health';

// In K8s the env vars are injected via ConfigMap/Secret — dotenv is a no-op there.
// For local dev, fall back to the app env files if present.
config({ path: path.resolve(process.env.ENV_FILE || '/dev/null') });
config({ path: path.resolve(__dirname, '../../../apps/api/.env') });
config();

const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || '9090', 10);

async function main() {
  console.log('[agent-worker] Starting LuxGen Agent Worker');

  // Start health server first so K8s probes pass before the worker loop begins.
  startHealthServer(HEALTH_PORT);

  const mongoOk = await ensureMongoConnection();
  console.log(`[agent-worker] MongoDB: ${mongoOk ? 'connected' : 'filesystem fallback'}`);

  const shutdown = async () => {
    console.log('[agent-worker] Shutting down…');
    await stopHealthServer();
    await shutdownWorker();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await runWorkerLoop();
}

main().catch((err) => {
  console.error('[agent-worker] Fatal:', err);
  process.exit(1);
});
