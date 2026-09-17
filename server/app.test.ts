import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { parseAnalyzeResponse } from '../src/lib/api.ts';
import type { AnalyzeResponse, ApiError, SampleCase } from '../src/types.ts';
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

const post = (body: unknown, lang = 'id') =>
  fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

async function samples(lang = 'id') {
  const res = await fetch(`${base}/api/samples`, { headers: { 'Accept-Language': lang } });
  return (await res.json()) as SampleCase[];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

test('each sample opens its own case with the expected climate', async () => {
  const climates = [];
  for (const sample of await samples()) {
    const res = await post({ url: sample.url });
    assert.equal(res.status, 200);
    const body = (await res.json()) as AnalyzeResponse;
    assert.equal(body.case_id, sample.id);
    climates.push(body.climate);
  }
  assert.deepEqual(climates, ['ASTROTURFED', 'LEANING', 'NEUTRAL', 'ASTROTURFED', 'INSUFFICIENT']);
});

test('responses pass the client validator and are internally consistent', async () => {
  for (const sample of await samples()) {
    const body = parseAnalyzeResponse(await (await post({ url: sample.url })).json());

    const starts = body.timeline.map((b) => b.start);
    assert.deepEqual(starts, [...starts].sort(), `${body.case_id} timeline out of order`);
    for (const bucket of body.timeline) {
      assert.ok(bucket.buzzer <= bucket.total, `${body.case_id} has more buzzers than comments in a bucket`);
    }

    // The chart has to describe the same sample the header claims was read.
    if (body.post && body.timeline.length > 0) {
      assert.equal(sum(body.timeline.map((b) => b.total)), body.post.sampled, `${body.case_id} timeline total != sampled`);
      assert.ok(body.post.sampled <= body.post.comment_count, `${body.case_id} read more comments than exist`);
    }
    if (body.timeline.length > 0) {
      const share = sum(body.timeline.map((b) => b.buzzer)) / sum(body.timeline.map((b) => b.total));
      assert.ok(Math.abs(share - body.buzzer_share) < 0.01, `${body.case_id} buzzer_share != timeline share`);
    }

    const stances = body.breakdown.pro + body.breakdown.contra + body.breakdown.neutral;
    if (!body.sample_empty) assert.ok(Math.abs(stances - 1) < 0.01, `${body.case_id} breakdown does not sum to 1`);

    // Every cluster and finding must point at comments that were actually returned.
    const ids = new Set(body.comments.map((c) => c.id));
    for (const source of [...body.clusters, ...body.signals]) {
      for (const id of source.comment_ids) {
        assert.ok(ids.has(id), `${body.case_id} ${source.id} links unknown ${id}`);
      }
    }
    for (const comment of body.comments) {
      if (comment.cluster_id) {
        assert.ok(
          body.clusters.some((cl) => cl.id === comment.cluster_id),
          `${body.case_id} ${comment.id} is in unknown ${comment.cluster_id}`,
        );
      }
    }

    // A lean must agree with the composition it was drawn from.
    if (body.lean) {
      const share = body.lean.direction === 'PRO' ? body.breakdown.pro : body.breakdown.contra;
      assert.equal(body.lean.share, share, `${body.case_id} lean share != breakdown`);
    }
  }
});

test('only ASTROTURFED asserts coordination', async () => {
  for (const sample of await samples()) {
    const body = (await (await post({ url: sample.url })).json()) as AnalyzeResponse;
    if (body.climate !== 'ASTROTURFED') {
      assert.deepEqual(body.clusters, [], `${body.case_id} draws clusters without calling buzzer`);
    } else {
      assert.ok(body.clusters.length > 0, `${body.case_id} calls buzzer with no cluster to show`);
    }
  }
});

test('a leaning comment section is not called buzzer on the lean alone', async () => {
  const url = 'https://www.tiktok.com/@warungdata/video/7451-ppn-12-persen';
  const body = (await (await post({ url })).json()) as AnalyzeResponse;
  assert.equal(body.climate, 'LEANING');
  assert.ok(body.lean && body.lean.share > 0.8, 'expected a strong lean');
  assert.ok(body.buzzer_share < 0.1, 'expected almost no coordinated comments');
});

test('a post outside the archive reports no reading, not a guess', async () => {
  const url = 'https://www.youtube.com/watch?v=belum-pernah-dibaca';
  const body = (await (await post({ url })).json()) as AnalyzeResponse;
  assert.deepEqual(body.input, { kind: 'url', value: url });
  assert.equal(body.climate, 'INSUFFICIENT');
  assert.equal(body.sample_empty, true);
  assert.equal(body.lean, null);
  assert.deepEqual([body.comments, body.clusters, body.signals, body.explanation_tokens], [[], [], [], []]);
});

test('the same unmatched link reopens the same case number', async () => {
  const url = 'https://www.instagram.com/p/tidak-ada-di-arsip/';
  const [a, b] = await Promise.all([post({ url }), post({ url })]);
  const [first, second] = [(await a.json()) as AnalyzeResponse, (await b.json()) as AnalyzeResponse];
  assert.equal(first.case_id, second.case_id);
});

test('bad requests get a 400 with a readable code', async () => {
  const cases: [unknown, string][] = [
    [{}, 'INVALID_BODY'],
    [{ text: 'sebuah klaim politik' }, 'INVALID_BODY'],
    [{ url: 'ftp://files.example/a' }, 'INVALID_URL'],
    [{ url: 'bukan tautan' }, 'INVALID_URL'],
    [{ url: 'https://contoh.example/berita/cuaca' }, 'UNSUPPORTED_PLATFORM'],
    ['{"url": ', 'INVALID_JSON'],
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

test('Accept-Language switches the prose OWI writes, never the comments it quotes', async () => {
  const url = 'https://www.youtube.com/watch?v=8anggaran-ikn-tahap-dua';
  const [id, en] = await Promise.all([
    post({ url }).then((r) => r.json() as Promise<AnalyzeResponse>),
    post({ url }, 'en').then((r) => r.json() as Promise<AnalyzeResponse>),
  ]);

  assert.notEqual(id.topic, en.topic);
  assert.equal(en.clusters[0].label, 'Cluster A');
  assert.ok(/^14 accounts/.test(en.signals[0].detail), en.signals[0].detail);

  // Comments, titles and handles are data: they stay exactly as posted.
  assert.deepEqual(
    en.comments.map((c) => c.text),
    id.comments.map((c) => c.text),
  );
  assert.equal(en.post?.title, id.post?.title);

  const [idSamples, enSamples] = await Promise.all([samples(), samples('en')]);
  assert.deepEqual(
    enSamples.map((s) => s.url),
    idSamples.map((s) => s.url),
  );
  assert.deepEqual(
    enSamples.map((s) => s.climate),
    ['ASTROTURFED', 'LEANING', 'NEUTRAL', 'ASTROTURFED', 'INSUFFICIENT'],
  );
  for (const [i, sample] of enSamples.entries()) {
    assert.notEqual(sample.label, idSamples[i].label, `${sample.id} label is not translated`);
    assert.notEqual(sample.note, idSamples[i].note, `${sample.id} note is not translated`);
  }
});

test('a bad request is explained in the language it was asked in', async () => {
  const res = await post({ url: 'https://contoh.example/berita/cuaca' }, 'en');
  assert.equal(res.status, 400);
  const body = (await res.json()) as ApiError;
  assert.equal(body.error.code, 'UNSUPPORTED_PLATFORM');
  assert.match(body.error.message, /^OWI can only read/);
});
