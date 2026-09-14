/**
 * API contract for `POST /api/fact-check`, shared by the mock server (`server/`)
 * and the React client. Keep this file type-only: the server imports it with
 * `import type` under Node's type stripping.
 */

export type Verdict = 'TRUE' | 'MISLEADING' | 'FALSE' | 'UNVERIFIABLE' | 'OPINION';

export type EntityType = 'PARTY' | 'PERSON' | 'INSTITUTION';

export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export type EvidenceStance = 'SUPPORTS' | 'REFUTES' | 'UNRELATED';

export type SourceType = 'FACT_CHECK' | 'OFFICIAL' | 'COURT' | 'NEWS' | 'RESEARCH';

export interface Entity {
  name: string;
  type: EntityType;
  stance: Sentiment;
}

export interface ExplanationToken {
  token: string;
  weight: number; // LIME, -1 .. 1
}

export interface Evidence {
  id: string;
  title: string;
  source: string;
  source_type: SourceType;
  url: string;
  published: string; // ISO date, YYYY-MM-DD
  stance: EvidenceStance;
  snippet: string;
}

/**
 * Where the claim was found: the article behind a submitted URL, or the earliest
 * article retrieval matched for pasted text. Null when there is none.
 */
export interface SourceArticle {
  headline: string;
  outlet: string;
  url: string;
  published: string; // ISO date
  paragraphs: string[];
  claim_quote: string; // verbatim sentence from `paragraphs` that carries the claim
}

export interface TimelineEvent {
  date: string; // ISO date
  kind: 'CLAIM' | 'EVIDENCE';
  label: string;
  evidence_id: string | null;
}

export type FactCheckRequest = { text: string } | { url: string };

export interface FactCheckResponse {
  case_id: string;
  checked_at: string; // ISO datetime
  input: { kind: 'text' | 'url'; value: string };
  verdict: Verdict;
  confidence: number; // 0 .. 1
  claim_extracted: string;
  topic: string;
  entities: Entity[];
  explanation_tokens: ExplanationToken[];
  article: SourceArticle | null;
  evidence: Evidence[];
  timeline: TimelineEvent[]; // oldest first
  retrieval_empty: boolean; // true → no verdict, confidence hidden
}

export interface SampleCase {
  id: string;
  label: string;
  input: FactCheckRequest;
}

export interface ApiError {
  error: { code: string; message: string };
}

// Client-only

export interface CaseHistoryEntry {
  id: string;
  openedAt: string;
  response: FactCheckResponse;
}
