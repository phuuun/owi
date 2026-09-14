import { createApp } from './app.ts';

const port = Number(process.env.OWI_API_PORT ?? 8787);
const latencyMs = Number(process.env.OWI_LATENCY_MS ?? 1600);

const server = createApp({ latencyMs }).listen(port, (error) => {
  if (error) throw error;
  console.log(`[owi] mock API on http://localhost:${port} (simulated latency ${latencyMs}ms)`);
});

// The Vite dev proxy reuses idle keep-alive sockets. With Node's 5s default, a
// check after a short pause can land on a socket the server is closing, which
// surfaces as ECONNRESET and a 500 in the browser. Outlive typical pauses.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
