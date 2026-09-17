import type { MockCase } from '../types.ts';

const URL = 'https://x.com/akunresmi/status/1889-balasan-dibatasi';

/**
 * The post resolved, the comment section did not. Distinct from an unreachable
 * link: here OWI knows what it was looking at and still has nothing to read, so
 * it reports that instead of calling a climate on a handful of replies.
 */
export const insufficientRepliesOff: MockCase = {
  case_id: 'OWI-2025-0401',
  sample: {
    label: { id: 'Kurang data', en: 'Not enough data' },
    note: {
      id: 'Balasan dibatasi, cuma segelintir komentar yang kebaca. OWI milih bilang nggak tahu daripada nebak.',
      en: 'Replies are restricted, so only a handful of comments could be read. OWI would rather say it does not know than guess.',
    },
    url: URL,
  },
  keywords: [['balasan', 'dibatasi'], ['1889']],
  result: {
    post: {
      platform: 'X',
      url: URL,
      title: 'Pernyataan resmi terkait pemberitaan sepekan terakhir',
      author: '@akunresmi',
      published: '2025-03-24',
      comment_count: 12,
      sampled: 12,
    },
    climate: 'INSUFFICIENT',
    confidence: 0,
    lean: null,
    topic: { id: 'Balasan Dibatasi', en: 'Replies Restricted' },
    breakdown: { pro: 0, contra: 0, neutral: 0 },
    buzzer_share: 0,
    entities: [],
    comments: [],
    clusters: [],
    signals: [],
    explanation_tokens: [],
    timeline: [],
    sample_empty: true,
  },
};
