import { setTimeout as sleep } from 'node:timers/promises';
import express, { type ErrorRequestHandler, type Response } from 'express';
import type { ApiError } from '../src/types.ts';
import { buildResponse, parseInput, RequestError } from './factCheck.ts';
import { SAMPLES } from './mock/index.ts';

export interface AppOptions {
  /** Simulated retrieval time, so the client's scanning state is visible in dev. */
  latencyMs?: number;
}

function sendError(res: Response, status: number, code: string, message: string) {
  const body: ApiError = { error: { code, message } };
  res.status(status).json(body);
}

export function createApp({ latencyMs = 0 }: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', mode: 'mock' });
  });

  app.get('/api/samples', (_req, res) => {
    res.json(SAMPLES);
  });

  app.post('/api/fact-check', async (req, res) => {
    const input = parseInput(req.body);
    if (latencyMs > 0) await sleep(latencyMs);
    res.json(buildResponse(input));
  });

  app.use('/api', (_req, res) => {
    sendError(res, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof RequestError) {
      sendError(res, 400, err.code, err.message);
    } else if (err?.type === 'entity.parse.failed') {
      sendError(res, 400, 'INVALID_JSON', 'Isi permintaan harus berupa JSON yang valid.');
    } else if (err?.type === 'entity.too.large') {
      sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Isi permintaan terlalu besar.');
    } else {
      console.error(err);
      sendError(res, 500, 'INTERNAL', 'Terjadi kendala di server.');
    }
  };
  app.use(onError);

  return app;
}
