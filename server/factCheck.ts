import type { Evidence, EvidenceStance, FactCheckResponse, SourceArticle, TimelineEvent } from '../src/types.ts';
import { CASES } from './mock/index.ts';
import type { MockCase } from './mock/types.ts';

export const TEXT_MIN = 10;
export const TEXT_MAX = 1000;
const URL_MAX = 2048;

export type CaseInput = FactCheckResponse['input'];

/** A client mistake. `message` is shown to the user as-is. */
export class RequestError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function parseInput(body: unknown): CaseInput {
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const hasText = typeof b.text === 'string';
  const hasUrl = typeof b.url === 'string';
  if (hasText === hasUrl) {
    throw new RequestError('INVALID_BODY', 'Kirim tepat satu isian: "text" atau "url".');
  }

  if (hasUrl) {
    const raw = (b.url as string).trim();
    const url = URL.canParse(raw) ? new URL(raw) : null;
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:') || raw.length > URL_MAX) {
      throw new RequestError('INVALID_URL', 'Tautan artikel harus berupa alamat http:// atau https:// yang valid.');
    }
    return { kind: 'url', value: url.href };
  }

  const text = (b.text as string).trim();
  if (text.length < TEXT_MIN) {
    throw new RequestError('TEXT_TOO_SHORT', `Klaim terlalu pendek, minimal ${TEXT_MIN} karakter.`);
  }
  if (text.length > TEXT_MAX) {
    throw new RequestError('TEXT_TOO_LONG', `Klaim terlalu panjang, maksimal ${TEXT_MAX} karakter.`);
  }
  return { kind: 'text', value: text };
}

/** "…/pertalite-dihapus-anggaran" → "… pertalite dihapus anggaran", so slugs hit keywords. */
function slugWords(href: string) {
  try {
    return decodeURIComponent(new URL(href).pathname).replace(/[-_/]+/g, ' ');
  } catch {
    return '';
  }
}

export function findCase(input: CaseInput): MockCase | undefined {
  if (input.kind === 'url') {
    const exact = CASES.find((c) => c.result.article?.url === input.value);
    if (exact) return exact;
  }
  const haystack = (input.kind === 'url' ? `${input.value} ${slugWords(input.value)}` : input.value).toLowerCase();
  return CASES.find((c) => c.keywords.some((group) => group.every((word) => haystack.includes(word))));
}

const STANCE_VERB: Record<EvidenceStance, string> = {
  SUPPORTS: 'mendukung klaim',
  REFUTES: 'membantah klaim',
  UNRELATED: 'memberi konteks',
};

export function buildTimeline(firstSeen: string, article: SourceArticle | null, evidence: Evidence[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      date: article?.published ?? firstSeen,
      kind: 'CLAIM',
      label: article ? `Klaim terbit di ${article.outlet}` : 'Klaim mulai beredar',
      evidence_id: null,
    },
    ...evidence.map((e): TimelineEvent => ({
      date: e.published,
      kind: 'EVIDENCE',
      label: `${e.source} ${STANCE_VERB[e.stance]}`,
      evidence_id: e.id,
    })),
  ];
  // Array#sort is stable, so the claim stays ahead of evidence from the same day.
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/** FNV-1a, so resubmitting the same unmatched input reopens the same case number. */
function caseNumber(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).slice(-4).toUpperCase().padStart(4, '0');
}

export function buildResponse(input: CaseInput, now = new Date()): FactCheckResponse {
  const match = findCase(input);
  if (match) {
    return {
      case_id: match.case_id,
      checked_at: now.toISOString(),
      input,
      ...match.result,
      timeline: buildTimeline(match.first_seen, match.result.article, match.result.evidence),
    };
  }

  // Nothing in the archive: say so rather than invent a verdict or token weights.
  const host = input.kind === 'url' ? new URL(input.value).hostname : '';
  return {
    case_id: `OWI-${now.getFullYear()}-${caseNumber(input.value)}`,
    checked_at: now.toISOString(),
    input,
    verdict: 'UNVERIFIABLE',
    confidence: 0,
    claim_extracted:
      input.kind === 'url' ? `Artikel di ${host} belum ada di arsip bukti.` : input.value.replace(/[.?!]*$/, '.'),
    topic: input.kind === 'url' ? 'Tautan Artikel' : 'Klaim Umum',
    entities: [],
    explanation_tokens: [],
    article: null,
    evidence: [],
    timeline: [],
    retrieval_empty: true,
  };
}
