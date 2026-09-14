import type { MockCase } from '../types.ts';

const CLAIM =
  'Beredar kabar bahwa ketua umum partai koalisi menggelar pertemuan rahasia dini hari di pulau terpencil Kepulauan Seribu untuk menetapkan jatah menteri 2029.';

export const unverifiableRumor: MockCase = {
  case_id: 'OWI-2025-0203',
  sample: { label: 'Tanpa bukti', input: { text: CLAIM } },
  keywords: [['rahasia'], ['bunker'], ['pulau terpencil'], ['desas-desus'], ['bisik-bisik']],
  first_seen: '2025-02-03',
  result: {
    verdict: 'UNVERIFIABLE',
    confidence: 0.15,
    claim_extracted:
      'Ketua umum partai koalisi menggelar pertemuan rahasia dini hari di pulau terpencil Kepulauan Seribu untuk menetapkan jatah menteri 2029.',
    topic: 'Desas-Desus Politik',
    entities: [{ name: 'Koalisi Partai Politik', type: 'PARTY', stance: 'NEUTRAL' }],
    explanation_tokens: [
      { token: 'Ketua', weight: 0.05 },
      { token: 'umum', weight: 0.04 },
      { token: 'partai', weight: 0.08 },
      { token: 'koalisi', weight: 0.06 },
      { token: 'menggelar', weight: -0.05 },
      { token: 'pertemuan', weight: -0.12 },
      { token: 'rahasia', weight: -0.45 },
      { token: 'dini', weight: -0.14 },
      { token: 'hari', weight: -0.16 },
      { token: 'di', weight: -0.02 },
      { token: 'pulau', weight: -0.21 },
      { token: 'terpencil', weight: -0.52 },
      { token: 'Kepulauan', weight: -0.08 },
      { token: 'Seribu', weight: -0.11 },
      { token: 'untuk', weight: 0.03 },
      { token: 'menetapkan', weight: -0.18 },
      { token: 'jatah', weight: -0.28 },
      { token: 'menteri', weight: 0.12 },
      { token: '2029.', weight: -0.35 },
    ],
    // Circulated as a chat forward: no article to trace it back to.
    article: null,
    evidence: [],
    retrieval_empty: true,
  },
};
