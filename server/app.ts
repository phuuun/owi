import { setTimeout as sleep } from 'node:timers/promises';
import express, { type ErrorRequestHandler, type Response } from 'express';
import type { ApiError } from '../src/types.ts';
import { buildResponse, parseInput, RequestError } from './analyze.ts';
import { langOf, MESSAGES } from './messages.ts';
import { samples } from './mock/index.ts';

export interface AppOptions {
  /** Simulated collection time, so the client's scanning state is visible in dev. */
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

  app.get('/api/samples', (req, res) => {
    res.json(samples(langOf(req.headers['accept-language'])));
  });

  app.post('/api/analyze', async (req, res) => {
    const lang = langOf(req.headers['accept-language']);
    const input = parseInput(req.body, lang);
    if (latencyMs > 0) await sleep(latencyMs);
    res.json(buildResponse(input, lang));
  });

  app.use('/api', (req, res) => {
    sendError(res, 404, 'NOT_FOUND', MESSAGES[langOf(req.headers['accept-language'])].notFound);
  });

  const onError: ErrorRequestHandler = (err, req, res, _next) => {
    const msg = MESSAGES[langOf(req.headers['accept-language'])];
    if (err instanceof RequestError) {
      sendError(res, 400, err.code, err.message);
    } else if (err?.type === 'entity.parse.failed') {
      sendError(res, 400, 'INVALID_JSON', msg.invalidJson);
    } else if (err?.type === 'entity.too.large') {
      sendError(res, 413, 'PAYLOAD_TOO_LARGE', msg.payloadTooLarge);
    } else {
      console.error(err);
      sendError(res, 500, 'INTERNAL', msg.internal);
    }
  };
  app.use(onError);

  return app;
}
