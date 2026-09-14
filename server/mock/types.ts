import type { FactCheckRequest, FactCheckResponse } from '../../src/types.ts';

/** One canned investigation. Request-specific fields are filled in by `buildResponse`. */
export interface MockCase {
  case_id: string;
  sample: { label: string; input: FactCheckRequest };
  /** Matches when every word of any one group appears in the lowercased input. */
  keywords: string[][];
  /** When the claim started circulating. Anchors the timeline when there is no article. */
  first_seen: string;
  result: Omit<FactCheckResponse, 'case_id' | 'checked_at' | 'input' | 'timeline'>;
}
