import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { parseFactCheckResponse } from '../src/lib/api.ts';
import type { ApiError, FactCheckResponse, SampleCase } from '../src/types.ts';
import { createApp } from './app.ts';

let server: Server;
let base = '';

before(async () => {
  server = createApp().listen(0);
  await once(server, 'listening');
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

const post = (body: unknown) =>
  fetch(`${base}/api/fact-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

async function samples() {
  const res = await fetch(`${base}/api/samples`);
  return (await res.json()) as SampleCase[];
}

test('each sample opens its own case with the expected verdict', async () => {
  const verdicts = [];
  for (const sample of await samples()) {
    const res = await post(sample.input);
    assert.equal(res.status, 200);
    const body = (await res.json()) as FactCheckResponse;
    assert.equal(body.case_id, sample.id);
    verdicts.push(body.verdict);
  }
  assert.deepEqual(verdicts, ['FALSE', 'TRUE', 'MISLEADING', 'OPINION', 'UNVERIFIABLE']);
});

test('responses pass the client validator and are internally consistent', async () => {
  for (const sample of await samples()) {
    const body = parseFactCheckResponse(await (await post(sample.input)).json());

    const dates = body.timeline.map((e) => e.date);
    assert.deepEqual(dates, [...dates].sort(), `${body.case_id} timeline out of order`);

    const ids = new Set(body.evidence.map((e) => e.id));
    for (const event of body.timeline) {
      if (event.evidence_id) assert.ok(ids.has(event.evidence_id), `${body.case_id} links unknown ${event.evidence_id}`);
    }
    if (body.article) {
      assert.ok(body.article.paragraphs.includes(body.article.claim_quote), `${body.case_id} quote not in article`);
    }
  }
});

test('input outside the archive is unverifiable, not guessed', async () => {
  const text = (await (await post({ text: 'Harga cabai naik di pasar tradisional minggu ini' })).json()) as FactCheckResponse;
  assert.equal(text.verdict, 'UNVERIFIABLE');
  assert.equal(text.retrieval_empty, true);
  assert.deepEqual([text.evidence, text.explanation_tokens], [[], []]);

  const url = (await (await post({ url: 'https://contoh.example/berita/cuaca' })).json()) as FactCheckResponse;
  assert.deepEqual(url.input, { kind: 'url', value: 'https://contoh.example/berita/cuaca' });
  assert.equal(url.verdict, 'UNVERIFIABLE');
});

test('bad requests get a 400 with a readable code', async () => {
  const cases: [unknown, string][] = [
    [{}, 'INVALID_BODY'],
    [{ text: 'klaim panjang sekali', url: 'https://a.example' }, 'INVALID_BODY'],
    [{ text: 'pendek' }, 'TEXT_TOO_SHORT'],
    [{ text: 'x'.repeat(1001) }, 'TEXT_TOO_LONG'],
    [{ url: 'ftp://files.example/a' }, 'INVALID_URL'],
    [{ url: 'bukan tautan' }, 'INVALID_URL'],
    ['{"text": ', 'INVALID_JSON'],
  ];
  for (const [body, code] of cases) {
    const res = await post(body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(((await res.json()) as ApiError).error.code, code);
  }
});

test('unknown API routes return JSON 404', async () => {
  const res = await fetch(`${base}/api/nope`);
  assert.equal(res.status, 404);
  assert.equal(((await res.json()) as ApiError).error.code, 'NOT_FOUND');
});
