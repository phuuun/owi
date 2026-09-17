/**
 * API contract for `POST /api/analyze`, shared by the mock server (`server/`)
 * and the React client. Keep this file type-only: the server imports it with
 * `import type` under Node's type stripping.
 */

export type Platform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'X' | 'FACEBOOK';

/**
 * Interface language, asked for with `Accept-Language`. It picks the language
 * OWI writes its own reading in; the comments it quotes stay in whatever
 * language they were posted in.
 */
export type Lang = 'id' | 'en';

/**
 * The state of a comment section as a whole.
 *
 * `LEANING` and `ASTROTURFED` are kept apart on purpose. A comment section can
 * lean hard one way and still be entirely organic — people really do agree
 * about things. Buzzer is a claim about *coordination*, never about which side
 * is winning, so only `ASTROTURFED` asserts it.
 */
export type Climate = 'NEUTRAL' | 'LEANING' | 'ASTROTURFED' | 'INSUFFICIENT';

/** Where a comment sits relative to `Lean.target`. */
export type Stance = 'PRO' | 'CONTRA' | 'NEUTRAL';

export type CommentLabel = 'BUZZER' | 'ORGANIC' | 'UNCLEAR';

export type EntityType = 'PARTY' | 'PERSON' | 'INSTITUTION' | 'BRAND';

/** Coordination markers. One per row in the findings section. */
export type SignalKind =
  | 'TEMPLATE' // near-identical wording across separate accounts
  | 'BURST' // a spike of comments inside a short window
  | 'FRESH_ACCOUNT' // accounts registered just before the post went up
  | 'GENERIC_PRAISE' // approval that never refers to the post's content
  | 'NO_ARGUMENT' // assertion with no reasoning, source or specifics
  | 'HASHTAG_PUSH' // one tag repeated to push it into trending
  | 'REPLY_RING'; // a closed set of accounts amplifying each other

/**
 * Which way the comment section tilts, and how far. Null when no side clears
 * the margin — that is what `NEUTRAL` means.
 */
export interface Lean {
  /** What the section is tilted about: "Pemerintah", "Kenaikan PPN 12%". */
  target: string;
  direction: 'PRO' | 'CONTRA';
  /** Share of the sample on the dominant side, 0 .. 1. */
  share: number;
}

/** Share of sampled comments per stance. Sums to ~1. */
export interface StanceBreakdown {
  pro: number;
  contra: number;
  neutral: number;
}

export interface Entity {
  name: string;
  type: EntityType;
  /** How the comment section treats this entity, not the entity's own position. */
  stance: Stance;
  mentions: number;
}

export interface ExplanationToken {
  token: string;
  weight: number; // LIME, -1 .. 1
}

/** Public behaviour of a commenting account. No private or identifying data. */
export interface AccountSignals {
  age_days: number;
  followers: number;
  posts_per_day: number;
  /** Still on the platform's placeholder avatar. */
  default_avatar: boolean;
}

/**
 * One sampled comment. `author` is always masked at the source — OWI reports
 * patterns across a comment section, it does not accuse named people.
 */
export interface Comment {
  id: string;
  author: string; // masked handle, e.g. "@and***17"
  posted_at: string; // ISO datetime
  text: string;
  likes: number;
  stance: Stance;
  label: CommentLabel;
  score: number; // buzzer likelihood, 0 .. 1
  /** Set when this comment falls inside a coordination cluster. */
  cluster_id: string | null;
  account: AccountSignals;
}

/** A group of accounts posting the same thing at the same time. */
export interface Cluster {
  id: string;
  label: string; // "Klaster A"
  size: number; // accounts in the cluster
  similarity: number; // mean pairwise text similarity, 0 .. 1
  window_minutes: number; // span from first to last comment
  template: string; // the shared skeleton, with varying parts as […]
  comment_ids: string[];
}

export interface Signal {
  id: string;
  kind: SignalKind;
  detail: string; // written for the user, shown as-is
  weight: number; // contribution to the climate call, 0 .. 1
  comment_ids: string[];
}

/** The post whose comment section was read. Null when it could not be fetched. */
export interface Post {
  platform: Platform;
  url: string;
  title: string;
  author: string;
  published: string; // ISO date, YYYY-MM-DD
  /** Total the platform reports. */
  comment_count: number;
  /** How many OWI actually read. Never claim coverage beyond this. */
  sampled: number;
}

/** Comment volume in one time bucket, split by label. */
export interface TimelineBucket {
  start: string; // ISO datetime, bucket start
  total: number;
  buzzer: number;
}

export type AnalyzeRequest = { url: string };

export interface AnalyzeResponse {
  case_id: string;
  checked_at: string; // ISO datetime
  input: { kind: 'url'; value: string };
  post: Post | null;
  climate: Climate;
  confidence: number; // 0 .. 1, hidden when the sample is empty
  lean: Lean | null;
  topic: string;
  breakdown: StanceBreakdown;
  buzzer_share: number; // share of the sample labelled BUZZER, 0 .. 1
  entities: Entity[];
  /**
   * The excerpt shown in the report, not the whole sample: the most
   * representative comments plus the highest-scoring ones. `post.sampled` is
   * how many were actually read.
   */
  comments: Comment[];
  clusters: Cluster[];
  signals: Signal[];
  explanation_tokens: ExplanationToken[];
  timeline: TimelineBucket[]; // oldest first
  sample_empty: boolean; // true → no climate call, confidence hidden
}

/** One example reading, listed on the home page so the four climates are legible before anything is scanned. */
export interface SampleCase {
  id: string;
  climate: Climate;
  label: string;
  /** Why this case reads the way it does, in one or two sentences. */
  note: string;
  url: string;
}

export interface ApiError {
  error: { code: string; message: string };
}

// Client-only

export interface CaseHistoryEntry {
  id: string;
  openedAt: string;
  /** The language this reading was fetched in, so a switch can refresh it. */
  lang: Lang;
  response: AnalyzeResponse;
}
