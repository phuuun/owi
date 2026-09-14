import { createApp } from './app.ts';

const port = Number(process.env.OWI_API_PORT ?? 8787);
const latencyMs = Number(process.env.OWI_LATENCY_MS ?? 1600);

createApp({ latencyMs }).listen(port, (error) => {
  if (error) throw error;
  console.log(`[owi] mock API on http://localhost:${port} (simulated latency ${latencyMs}ms)`);
});
