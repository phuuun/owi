import type { AnalyzeResponse, Cluster, Lang, Signal } from '../../src/types.ts';

/** One string OWI writes itself, held in both interface languages. */
export type Localized = Record<Lang, string>;

/**
 * A case's fixed reading. The fields OWI writes in its own voice — the topic,
 * each finding's detail, each cluster's name — are kept in both languages and
 * resolved per request; comments, titles and handles are data and stay as
 * posted.
 */
export type MockResult = Omit<AnalyzeResponse, 'case_id' | 'checked_at' | 'input' | 'topic' | 'signals' | 'clusters'> & {
  topic: Localized;
  signals: (Omit<Signal, 'detail'> & { detail: Localized })[];
  clusters: (Omit<Cluster, 'label'> & { label: Localized })[];
};

/** One canned reading of a comment section. Request-specific fields are filled in by `buildResponse`. */
export interface MockCase {
  case_id: string;
  /** Listed on the home page as an example of one reading OWI can return. */
  sample: { label: Localized; note: Localized; url: string };
  /** Matches when every word of any one group appears in the lowercased URL. */
  keywords: string[][];
  /**
   * `timeline` covers the whole sample, while `comments` is only the excerpt
   * shown in the report, so the two are given independently.
   */
  result: MockResult;
}
