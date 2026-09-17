import type { AnalyzeResponse, ApiError, Lang, SampleCase } from '../types.ts';
import { DICT } from './strings.ts';

/** `Accept-Language` picks the language the server writes its own prose in. */
async function call<T>(path: string, lang: Lang, init: RequestInit, parse: (data: unknown, lang: Lang) => T): Promise<T> {
  const t = DICT[lang].api;
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { Accept: 'application/json', 'Accept-Language': lang, ...init.headers },
    });
  } catch (err) {
    if (init.signal?.aborted) throw err;
    throw new Error(t.unreachable);
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as ApiError | null)?.error?.message ?? t.failed(res.status));
  }
  return parse(data, lang);
}

export const analyze = (url: string, lang: Lang, signal?: AbortSignal) =>
  call(
    '/api/analyze',
    lang,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }), signal },
    parseAnalyzeResponse,
  );

/** Only the mock server has samples; callers should treat a failure as "no samples". */
export const fetchSamples = (lang: Lang, signal?: AbortSignal) => call('/api/samples', lang, { signal }, parseSamples);

// Backend output is untrusted: a missing array or an unknown enum would crash
// the report view, so reject malformed payloads with a readable error instead.

const CLIMATES: readonly unknown[] = ['NEUTRAL', 'LEANING', 'ASTROTURFED', 'INSUFFICIENT'];
const STANCES: readonly unknown[] = ['PRO', 'CONTRA', 'NEUTRAL'];
const LABELS: readonly unknown[] = ['BUZZER', 'ORGANIC', 'UNCLEAR'];
const PLATFORMS: readonly unknown[] = ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'X', 'FACEBOOK'];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null;
const allStr = (o: Obj, keys: string[]) => keys.every((k) => typeof o[k] === 'string');
const allNum = (o: Obj, keys: string[]) => keys.every((k) => typeof o[k] === 'number');
const strArray = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === 'string');

const isComment = (c: unknown) =>
  isObj(c) &&
  allStr(c, ['id', 'author', 'posted_at', 'text']) &&
  allNum(c, ['likes', 'score']) &&
  STANCES.includes(c.stance) &&
  LABELS.includes(c.label) &&
  (c.cluster_id === null || typeof c.cluster_id === 'string') &&
  isObj(c.account) &&
  allNum(c.account, ['age_days', 'followers', 'posts_per_day']) &&
  typeof c.account.default_avatar === 'boolean';

const isCluster = (c: unknown) =>
  isObj(c) && allStr(c, ['id', 'label', 'template']) && allNum(c, ['size', 'similarity', 'window_minutes']) && strArray(c.comment_ids);

const isSignal = (s: unknown) =>
  isObj(s) && allStr(s, ['id', 'kind', 'detail']) && typeof s.weight === 'number' && strArray(s.comment_ids);

const isPost = (p: unknown) =>
  isObj(p) && PLATFORMS.includes(p.platform) && allStr(p, ['url', 'title', 'author', 'published']) && allNum(p, ['comment_count', 'sampled']);

const isLean = (l: unknown) =>
  isObj(l) && typeof l.target === 'string' && (l.direction === 'PRO' || l.direction === 'CONTRA') && typeof l.share === 'number';

const isBucket = (b: unknown) => isObj(b) && typeof b.start === 'string' && allNum(b, ['total', 'buzzer']);

export function parseAnalyzeResponse(data: unknown, lang: Lang = 'id'): AnalyzeResponse {
  const ok =
    isObj(data) &&
    allStr(data, ['case_id', 'checked_at', 'topic']) &&
    CLIMATES.includes(data.climate) &&
    allNum(data, ['confidence', 'buzzer_share']) &&
    isObj(data.input) &&
    data.input.kind === 'url' &&
    typeof data.input.value === 'string' &&
    (data.post === null || isPost(data.post)) &&
    (data.lean === null || isLean(data.lean)) &&
    isObj(data.breakdown) &&
    allNum(data.breakdown, ['pro', 'contra', 'neutral']) &&
    Array.isArray(data.entities) &&
    Array.isArray(data.explanation_tokens) &&
    Array.isArray(data.comments) &&
    data.comments.every(isComment) &&
    Array.isArray(data.clusters) &&
    data.clusters.every(isCluster) &&
    Array.isArray(data.signals) &&
    data.signals.every(isSignal) &&
    Array.isArray(data.timeline) &&
    data.timeline.every(isBucket) &&
    typeof data.sample_empty === 'boolean';

  if (!ok) throw new Error(DICT[lang].api.badContract);
  return data as unknown as AnalyzeResponse;
}

function parseSamples(data: unknown, lang: Lang): SampleCase[] {
  const ok =
    Array.isArray(data) &&
    data.every((s) => isObj(s) && allStr(s, ['id', 'label', 'note', 'url']) && CLIMATES.includes(s.climate));
  if (!ok) throw new Error(DICT[lang].api.badSamples);
  return data as SampleCase[];
}
