import type { AnalyzeResponse, Lang } from '../src/types.ts';
import { detectPlatform } from '../src/lib/platform.ts';
import { MESSAGES } from './messages.ts';
import { CASES } from './mock/index.ts';
import type { MockCase } from './mock/types.ts';

const URL_MAX = 2048;

export type CaseInput = AnalyzeResponse['input'];

/** A client mistake. `message` is shown to the user as-is. */
export class RequestError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function parseInput(body: unknown, lang: Lang = 'id'): CaseInput {
  const msg = MESSAGES[lang];
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  if (typeof b.url !== 'string') {
    throw new RequestError('INVALID_BODY', msg.invalidBody);
  }

  const raw = b.url.trim();
  const url = URL.canParse(raw) ? new URL(raw) : null;
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:') || raw.length > URL_MAX) {
    throw new RequestError('INVALID_URL', msg.invalidUrl);
  }
  if (!detectPlatform(url.href)) {
    throw new RequestError('UNSUPPORTED_PLATFORM', msg.unsupportedPlatform);
  }
  return { kind: 'url', value: url.href };
}

/** "…/watch?v=x8-anggaran-ikn" → "… watch v x8 anggaran ikn", so slugs hit keywords. */
function urlWords(href: string) {
  try {
    const u = new URL(href);
    return decodeURIComponent(`${u.pathname} ${u.search}`).replace(/[-_/?=&+.]+/g, ' ');
  } catch {
    return '';
  }
}

export function findCase(input: CaseInput): MockCase | undefined {
  const exact = CASES.find((c) => c.result.post?.url === input.value);
  if (exact) return exact;

  const haystack = `${input.value} ${urlWords(input.value)}`.toLowerCase();
  return CASES.find((c) => c.keywords.some((group) => group.every((word) => haystack.includes(word))));
}

/** FNV-1a, so resubmitting the same unmatched link reopens the same case number. */
function caseNumber(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).slice(-4).toUpperCase().padStart(4, '0');
}

export function buildResponse(input: CaseInput, lang: Lang = 'id', now = new Date()): AnalyzeResponse {
  const match = findCase(input);
  if (match) {
    const { topic, signals, clusters, ...rest } = match.result;
    return {
      case_id: match.case_id,
      checked_at: now.toISOString(),
      input,
      ...rest,
      topic: topic[lang],
      signals: signals.map((s) => ({ ...s, detail: s.detail[lang] })),
      clusters: clusters.map((c) => ({ ...c, label: c.label[lang] })),
    };
  }

  // Nothing fetched: report that the room could not be read rather than call a
  // climate on zero comments.
  return {
    case_id: `OWI-${now.getFullYear()}-${caseNumber(input.value)}`,
    checked_at: now.toISOString(),
    input,
    post: null,
    climate: 'INSUFFICIENT',
    confidence: 0,
    lean: null,
    topic: MESSAGES[lang].unreadable,
    breakdown: { pro: 0, contra: 0, neutral: 0 },
    buzzer_share: 0,
    entities: [],
    comments: [],
    clusters: [],
    signals: [],
    explanation_tokens: [],
    timeline: [],
    sample_empty: true,
  };
}
