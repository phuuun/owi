import type { MockCase } from '../types.ts';

const CLAIM =
  'Kementerian Keuangan mengumumkan utang luar negeri Indonesia meroket Rp20.000 triliun dalam sebulan akibat pembiayaan langsung infrastruktur IKN Nusantara.';

export const falseDebt: MockCase = {
  case_id: 'OWI-2024-0814',
  sample: { label: 'Salah', input: { text: CLAIM } },
  keywords: [['20.000'], ['utang'], ['ikn', 'meroket']],
  first_seen: '2024-08-12',
  result: {
    verdict: 'FALSE',
    confidence: 0.94,
    claim_extracted:
      'Utang luar negeri Indonesia melonjak hingga Rp20.000 triliun dalam tempo sebulan akibat pembiayaan infrastruktur IKN.',
    topic: 'Ekonomi & Fiskal',
    entities: [
      { name: 'Kementerian Keuangan RI', type: 'INSTITUTION', stance: 'NEGATIVE' },
      { name: 'Bank Indonesia', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'Otorita Ibu Kota Nusantara (OIKN)', type: 'INSTITUTION', stance: 'NEGATIVE' },
    ],
    explanation_tokens: [
      { token: 'Utang', weight: 0.12 },
      { token: 'luar', weight: 0.05 },
      { token: 'negeri', weight: 0.08 },
      { token: 'Indonesia', weight: 0.03 },
      { token: 'melonjak', weight: -0.84 },
      { token: 'hingga', weight: -0.15 },
      { token: 'Rp20.000', weight: -0.96 },
      { token: 'triliun', weight: -0.91 },
      { token: 'dalam', weight: -0.04 },
      { token: 'tempo', weight: -0.02 },
      { token: 'sebulan', weight: -0.74 },
      { token: 'akibat', weight: -0.18 },
      { token: 'pembiayaan', weight: -0.22 },
      { token: 'infrastruktur', weight: -0.08 },
      { token: 'IKN.', weight: -0.32 },
    ],
    article: {
      headline: 'Utang Negara Meroket Rp20.000 Triliun dalam Sebulan, IKN Disebut Biang Keladi',
      outlet: 'KabarViral24',
      url: 'https://kabarviral24.example/ekonomi/utang-meroket-rp20000-triliun-ikn',
      published: '2024-08-12',
      paragraphs: [
        'JAKARTA — Kabar mengejutkan datang dari sektor fiskal. Sebuah tangkapan layar yang ramai dibagikan di media sosial menunjukkan grafik utang pemerintah yang melonjak tajam.',
        CLAIM,
        'Warganet pun ramai mempertanyakan transparansi anggaran pembangunan ibu kota baru. Hingga berita ini diturunkan, redaksi belum memperoleh tautan ke dokumen resmi yang dimaksud.',
      ],
      claim_quote: CLAIM,
    },
    evidence: [
      {
        id: 'debt-kompas',
        title: 'Cek Fakta: Hoaks Klaim Utang Luar Negeri Indonesia Menembus Rp20.000 Triliun',
        source: 'Kompas.com Cek Fakta',
        source_type: 'FACT_CHECK',
        url: 'https://cekfakta.kompas.com',
        published: '2024-08-14',
        stance: 'REFUTES',
        snippet:
          'Berdasarkan Publikasi Statistik Utang Luar Negeri Indonesia (SULNI) periode Juni 2024 oleh Bank Indonesia dan Kemenkeu, posisi ULN Indonesia tercatat USD 408,6 miliar (sekitar Rp6.500 triliun). Angka Rp20.000 triliun merupakan fabrikasi data tanpa rujukan resmi.',
      },
      {
        id: 'debt-tempo',
        title: 'Keliru, Narasi Lonjakan Utang Luar Negeri 20 Ribu Triliun Akibat Pembangunan IKN',
        source: 'Tempo.co Cek Fakta',
        source_type: 'FACT_CHECK',
        url: 'https://cekfakta.tempo.co',
        published: '2024-08-15',
        stance: 'REFUTES',
        snippet:
          'Pemeriksaan Tempo mengonfirmasi bahwa alokasi APBN untuk IKN dilakukan bertahap dan telah diaudit Badan Pemeriksa Keuangan (BPK). Tidak ada instrumen pinjaman luar negeri pemerintah yang melipatgandakan total utang dalam tempo sebulan.',
      },
      {
        id: 'debt-turnbackhoax',
        title: '[SALAH] Utang Pemerintah Meroket Rp20.000 Triliun Hanya Dalam Tempo Sebulan',
        source: 'TurnBackHoax.id / Mafindo',
        source_type: 'FACT_CHECK',
        url: 'https://turnbackhoax.id',
        published: '2024-08-17',
        stance: 'REFUTES',
        snippet:
          'Kategori: Konten yang Dimanipulasi. Narasi ini merupakan daur ulang klaim lama yang mencatut tangkapan layar siaran berita televisi dengan mengubah grafis angka nominal utang negara secara serampangan.',
      },
    ],
    retrieval_empty: false,
  },
};
