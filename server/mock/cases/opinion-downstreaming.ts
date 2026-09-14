import type { MockCase } from '../types.ts';

const CLAIM =
  'Kebijakan hilirisasi mineral tambang di Indonesia merupakan kegagalan strategis terbesar yang hanya menguntungkan oligarki dan merusak kedaulatan lingkungan masa depan.';

export const opinionDownstreaming: MockCase = {
  case_id: 'OWI-2024-0625',
  sample: { label: 'Opini', input: { text: CLAIM } },
  keywords: [['hilirisasi'], ['oligarki'], ['kegagalan'], ['terburuk'], ['menurut saya']],
  first_seen: '2024-06-25',
  result: {
    verdict: 'OPINION',
    confidence: 0.92,
    claim_extracted:
      'Kebijakan hilirisasi mineral tambang di Indonesia merupakan kegagalan strategis yang hanya menguntungkan oligarki serta merusak kedaulatan lingkungan masa depan.',
    topic: 'Politik & Diskursus Publik',
    entities: [
      { name: 'Pemerintah RI', type: 'INSTITUTION', stance: 'NEGATIVE' },
      { name: 'Kementerian Investasi / BKPM', type: 'INSTITUTION', stance: 'NEGATIVE' },
    ],
    explanation_tokens: [
      { token: 'Kebijakan', weight: 0.12 },
      { token: 'hilirisasi', weight: 0.18 },
      { token: 'mineral', weight: 0.08 },
      { token: 'tambang', weight: 0.06 },
      { token: 'di', weight: 0.01 },
      { token: 'Indonesia', weight: 0.02 },
      { token: 'merupakan', weight: 0.01 },
      { token: 'kegagalan', weight: -0.81 },
      { token: 'strategis', weight: -0.67 },
      { token: 'yang', weight: 0.01 },
      { token: 'hanya', weight: -0.73 },
      { token: 'menguntungkan', weight: -0.65 },
      { token: 'oligarki', weight: -0.92 },
      { token: 'serta', weight: 0.02 },
      { token: 'merusak', weight: -0.84 },
      { token: 'kedaulatan', weight: -0.45 },
      { token: 'lingkungan', weight: -0.55 },
      { token: 'masa', weight: -0.12 },
      { token: 'depan.', weight: -0.15 },
    ],
    article: {
      headline: 'Hilirisasi Tambang, Untuk Siapa?',
      outlet: 'Kolom Publik',
      url: 'https://kolompublik.example/opini/hilirisasi-tambang-untuk-siapa',
      published: '2024-06-25',
      paragraphs: [
        'Setiap kali angka ekspor nikel olahan diumumkan, pemerintah menyebutnya bukti keberhasilan. Namun di balik grafik yang menanjak, ada pertanyaan yang jarang dijawab.',
        CLAIM,
        'Tulisan ini merupakan pendapat pribadi penulis dan tidak mewakili sikap redaksi.',
      ],
      claim_quote: CLAIM,
    },
    evidence: [
      {
        id: 'nickel-csis',
        title: 'Menimbang Sisi Terang dan Gelap Kebijakan Hilirisasi Nikel Indonesia',
        source: 'Centre for Strategic and International Studies (CSIS)',
        source_type: 'RESEARCH',
        url: 'https://www.csis.or.id',
        published: '2024-05-22',
        stance: 'UNRELATED',
        snippet:
          'Analisis CSIS memaparkan diskursus publik di mana kelompok pro menyoroti lonjakan nilai ekspor nikel olahan, sedangkan pengamat kritis menyoroti minimnya serapan tenaga kerja lokal dan tantangan tata kelola ekologis.',
      },
      {
        id: 'nickel-lpem',
        title: 'Perdebatan Multi-perspektif Efektivitas Hilirisasi Tambang Nasional',
        source: 'LPEM FEB Universitas Indonesia',
        source_type: 'RESEARCH',
        url: 'https://lpem.org',
        published: '2024-06-18',
        stance: 'UNRELATED',
        snippet:
          "Penilaian apakah hilirisasi dinilai 'sukses' atau 'gagal' sangat bergantung pada indikator normatif yang digunakan oleh masing-masing pemangku kepentingan dalam diskursus kebijakan publik.",
      },
    ],
    retrieval_empty: false,
  },
};
