import http from 'http';

let server: http.Server | null = null;

export function startHealthServer(port = 9090): void {
  server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  });

  server.listen(port, () => {
    console.log(`[agent-worker] Health server listening on :${port}`);
  });

  server.on('error', (err) => {
    console.error('[agent-worker] Health server error:', err.message);
  });
}

export function stopHealthServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
    server = null;
  });
}
