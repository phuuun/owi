import type { ApiError, FactCheckRequest, FactCheckResponse, SampleCase } from '../types.ts';

/** A lone pasted link is an article URL; anything else is claim text. */
export function toRequest(raw: string): FactCheckRequest {
  const value = raw.trim();
  return /^https?:\/\/\S+$/i.test(value) ? { url: value } : { text: value };
}

async function call<T>(path: string, init: RequestInit, parse: (data: unknown) => T): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { Accept: 'application/json', ...init.headers } });
  } catch (err) {
    if (init.signal?.aborted) throw err;
    throw new Error('Server OWI tidak dapat dihubungi. Pastikan API berjalan (npm run dev).');
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as ApiError | null)?.error?.message ?? `Permintaan gagal (${res.status}).`);
  }
  return parse(data);
}

export const factCheck = (request: FactCheckRequest, signal?: AbortSignal) =>
  call(
    '/api/fact-check',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal },
    parseFactCheckResponse,
  );

/** Only the mock server has samples; callers should treat a failure as "no samples". */
export const fetchSamples = (signal?: AbortSignal) => call('/api/samples', { signal }, parseSamples);

// Backend output is untrusted: a missing array or unknown enum would crash the
// report view, so reject malformed payloads with a readable error instead.

const VERDICTS: readonly unknown[] = ['TRUE', 'MISLEADING', 'FALSE', 'UNVERIFIABLE', 'OPINION'];
const STANCES: readonly unknown[] = ['SUPPORTS', 'REFUTES', 'UNRELATED'];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null;
const allStr = (o: Obj, keys: string[]) => keys.every((k) => typeof o[k] === 'string');

const isEvidence = (e: unknown) =>
  isObj(e) && allStr(e, ['id', 'title', 'source', 'source_type', 'url', 'published', 'snippet']) && STANCES.includes(e.stance);

const isArticle = (a: unknown) =>
  isObj(a) &&
  allStr(a, ['headline', 'outlet', 'url', 'published', 'claim_quote']) &&
  Array.isArray(a.paragraphs) &&
  a.paragraphs.every((p) => typeof p === 'string');

const isTimelineEvent = (t: unknown) => isObj(t) && allStr(t, ['date', 'label']) && (t.kind === 'CLAIM' || t.kind === 'EVIDENCE');

export function parseFactCheckResponse(data: unknown): FactCheckResponse {
  const ok =
    isObj(data) &&
    allStr(data, ['case_id', 'checked_at', 'claim_extracted', 'topic']) &&
    VERDICTS.includes(data.verdict) &&
    typeof data.confidence === 'number' &&
    isObj(data.input) &&
    (data.input.kind === 'text' || data.input.kind === 'url') &&
    typeof data.input.value === 'string' &&
    Array.isArray(data.entities) &&
    Array.isArray(data.explanation_tokens) &&
    Array.isArray(data.evidence) &&
    data.evidence.every(isEvidence) &&
    Array.isArray(data.timeline) &&
    data.timeline.every(isTimelineEvent) &&
    (data.article === null || isArticle(data.article)) &&
    typeof data.retrieval_empty === 'boolean';

  if (!ok) throw new Error('Respons server tidak sesuai kontrak API.');
  return data as unknown as FactCheckResponse;
}

function parseSamples(data: unknown): SampleCase[] {
  const ok =
    Array.isArray(data) &&
    data.every((s) => isObj(s) && allStr(s, ['id', 'label']) && isObj(s.input) && ('text' in s.input || 'url' in s.input));
  if (!ok) throw new Error('Daftar contoh tidak sesuai kontrak API.');
  return data as SampleCase[];
}
