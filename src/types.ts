export type VerdictType = 'TRUE' | 'MISLEADING' | 'FALSE' | 'UNVERIFIABLE' | 'OPINION';

export type EntityCategory = 'PARTY' | 'PERSON' | 'INSTITUTION';

export type StanceType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface EntityItem {
  name: string;
  type: EntityCategory;
  stance: StanceType;
}

export interface ExplanationToken {
  token: string;
  weight: number; // -1 .. 1
}

export type EvidenceStance = 'SUPPORTS' | 'REFUTES' | 'UNRELATED';

export interface EvidenceItem {
  title: string;
  source: string;
  url: string;
  published: string;
  stance: EvidenceStance;
  snippet: string;
}

export interface AnalyzeRequest {
  text: string;
}

export interface AnalyzeResponse {
  verdict: VerdictType;
  confidence: number; // 0..1
  claim_extracted: string;
  entities: EntityItem[];
  topic: string;
  explanation_tokens: ExplanationToken[];
  evidence: EvidenceItem[];
  retrieval_empty: boolean;
}

export interface SessionHistoryEntry {
  id: string;
  timestamp: string;
  inputText: string;
  response: AnalyzeResponse;
}

export interface ExampleClaim {
  id: string;
  label: string;
  category: string;
  text: string;
}
