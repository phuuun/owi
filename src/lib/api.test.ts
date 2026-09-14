import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildResponse } from '../../server/factCheck.ts';
import { parseFactCheckResponse, toRequest } from './api.ts';

test('toRequest sends a lone link as a URL and everything else as text', () => {
  assert.deepEqual(toRequest('  https://kompas.com/a  '), { url: 'https://kompas.com/a' });
  assert.deepEqual(toRequest('Menurut https://kompas.com/a utang naik'), { text: 'Menurut https://kompas.com/a utang naik' });
  assert.deepEqual(toRequest('kompas.com/a'), { text: 'kompas.com/a' });
});

test('parseFactCheckResponse accepts server output and rejects contract breaks', () => {
  const good = buildResponse({ kind: 'text', value: 'Utang meroket Rp20.000 triliun sebulan' });
  assert.equal(parseFactCheckResponse(good), good);

  const bad = [
    null,
    {},
    { ...good, verdict: 'HOAX' },
    { ...good, confidence: '0.9' },
    { ...good, evidence: undefined },
    { ...good, evidence: [{ ...good.evidence[0], stance: 'MAYBE' }] },
    { ...good, article: { ...good.article, paragraphs: 'teks' } },
    { ...good, input: { kind: 'file', value: 'a' } },
    { ...good, timeline: [{ date: '2024-01-01' }] },
  ];
  for (const payload of bad) assert.throws(() => parseFactCheckResponse(payload), /kontrak API/);
});
