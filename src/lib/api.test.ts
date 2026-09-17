import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildResponse } from '../../server/analyze.ts';
import { parseAnalyzeResponse } from './api.ts';
import { detectPlatform } from './platform.ts';

test('detectPlatform matches subdomains and short links, and nothing else', () => {
  assert.equal(detectPlatform('https://www.youtube.com/watch?v=a'), 'YOUTUBE');
  assert.equal(detectPlatform('https://m.youtube.com/watch?v=a'), 'YOUTUBE');
  assert.equal(detectPlatform('https://youtu.be/a'), 'YOUTUBE');
  assert.equal(detectPlatform('https://twitter.com/a/status/1'), 'X');
  assert.equal(detectPlatform('https://x.com/a/status/1'), 'X');
  assert.equal(detectPlatform('https://kompas.com/a'), null);
  // Must not match a lookalike host that merely ends in the brand name.
  assert.equal(detectPlatform('https://notyoutube.com/watch?v=a'), null);
  assert.equal(detectPlatform('bukan tautan'), null);
});

test('parseAnalyzeResponse accepts server output and rejects contract breaks', () => {
  const good = buildResponse({ kind: 'url', value: 'https://www.youtube.com/watch?v=8anggaran-ikn-tahap-dua' });
  assert.equal(parseAnalyzeResponse(good), good);

  const bad = [
    null,
    {},
    { ...good, climate: 'BUZZER' },
    { ...good, confidence: '0.9' },
    { ...good, comments: undefined },
    { ...good, comments: [{ ...good.comments[0], label: 'MAYBE' }] },
    { ...good, comments: [{ ...good.comments[0], account: undefined }] },
    { ...good, clusters: [{ ...good.clusters[0], comment_ids: 'ikn-c01' }] },
    { ...good, post: { ...good.post, platform: 'REDDIT' } },
    { ...good, lean: { target: 'Pemerintah', direction: 'MAYBE', share: 0.7 } },
    { ...good, breakdown: { pro: 0.7, contra: 0.2 } },
    { ...good, input: { kind: 'text', value: 'a' } },
    { ...good, timeline: [{ start: '2025-08-19T09:00:00+07:00' }] },
  ];
  for (const payload of bad) assert.throws(() => parseAnalyzeResponse(payload), /kontrak API/);
});

test('an unreadable comment section still satisfies the contract', () => {
  const empty = buildResponse({ kind: 'url', value: 'https://www.tiktok.com/@siapa/video/0' });
  assert.equal(parseAnalyzeResponse(empty), empty);
  assert.equal(empty.post, null);
  assert.equal(empty.lean, null);
});
