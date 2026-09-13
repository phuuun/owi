import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeClaim, MOCK_DATABASE, parseAnalyzeResponse, SCENARIOS } from './api.ts';

test('parseAnalyzeResponse accepts every mock case and rejects malformed payloads', () => {
  for (const r of Object.values(MOCK_DATABASE)) assert.equal(parseAnalyzeResponse(r), r);

  const good = MOCK_DATABASE['false-claim'];
  for (const bad of [null, {}, { ...good, verdict: 'HOAX' }, { ...good, evidence: undefined }, { ...good, confidence: '0.9' }]) {
    assert.throws(() => parseAnalyzeResponse(bad), /kontrak API/);
  }
});

test('each dev scenario hits its own mock case', async () => {
  const verdicts = [];
  for (const s of SCENARIOS) verdicts.push((await analyzeClaim({ text: s.text })).verdict);
  assert.deepEqual(verdicts, ['FALSE', 'TRUE', 'MISLEADING', 'OPINION', 'UNVERIFIABLE']);
  await assert.rejects(analyzeClaim({ text: '   ' }));
});
