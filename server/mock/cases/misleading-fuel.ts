import type { MockCase } from '../types.ts';

const CLAIM =
  'Pemerintah secara resmi menghapus total BBM bersubsidi jenis Pertalite mulai bulan depan demi mengalihkan seluruh anggarannya ke program Makan Bergizi Gratis.';

const ARTICLE_URL = 'https://inforakyat.example/nasional/pertalite-dihapus-anggaran-makan-bergizi-gratis';

export const misleadingFuel: MockCase = {
  case_id: 'OWI-2024-0902',
  // Submitted as a URL so the samples exercise the article-link input path.
  sample: { label: 'Menyesatkan', input: { url: ARTICLE_URL } },
  keywords: [['pertalite'], ['bbm'], ['makan bergizi'], ['subsidi']],
  first_seen: '2024-09-02',
  result: {
    verdict: 'MISLEADING',
    confidence: 0.86,
    claim_extracted:
      'Pemerintah menghapus total BBM bersubsidi jenis Pertalite mulai bulan depan untuk mengalihkan seluruh anggarannya ke program Makan Bergizi Gratis.',
    topic: 'Kebijakan Publik & Energi',
    entities: [
      { name: 'Kementerian ESDM', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'PT Pertamina (Persero)', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'Badan Gizi Nasional', type: 'INSTITUTION', stance: 'NEGATIVE' },
    ],
    explanation_tokens: [
      { token: 'Pemerintah', weight: 0.05 },
      { token: 'menghapus', weight: -0.74 },
      { token: 'total', weight: -0.89 },
      { token: 'BBM', weight: 0.12 },
      { token: 'bersubsidi', weight: 0.22 },
      { token: 'jenis', weight: 0.02 },
      { token: 'Pertalite', weight: 0.18 },
      { token: 'mulai', weight: -0.21 },
      { token: 'bulan', weight: -0.19 },
      { token: 'depan', weight: -0.18 },
      { token: 'untuk', weight: -0.11 },
      { token: 'mengalihkan', weight: -0.63 },
      { token: 'seluruh', weight: -0.78 },
      { token: 'anggarannya', weight: -0.32 },
      { token: 'ke', weight: 0.02 },
      { token: 'program', weight: 0.08 },
      { token: 'Makan', weight: 0.09 },
      { token: 'Bergizi', weight: 0.06 },
      { token: 'Gratis.', weight: 0.07 },
    ],
    article: {
      headline: 'Pertalite Resmi Dihapus Bulan Depan, Anggaran Dialihkan ke Makan Bergizi Gratis',
      outlet: 'InfoRakyat Terkini',
      url: ARTICLE_URL,
      published: '2024-09-02',
      paragraphs: [
        'JAKARTA — Antrean kendaraan terlihat mengular di sejumlah SPBU sejak pagi setelah pesan berantai soal penghapusan BBM bersubsidi beredar luas.',
        CLAIM,
        'Sejumlah pengendara mengaku khawatir harga kebutuhan pokok ikut naik. Pesan tersebut tidak mencantumkan nomor regulasi maupun pejabat yang memberikan pernyataan.',
      ],
      claim_quote: CLAIM,
    },
    evidence: [
      {
        id: 'fuel-katadata',
        title: 'BPH Migas: Tidak Ada Penghapusan Pertalite Total, Melainkan Pengetatan Kriteria Pembeli',
        source: 'Katadata',
        source_type: 'NEWS',
        url: 'https://katadata.co.id',
        published: '2024-09-03',
        stance: 'REFUTES',
        snippet:
          'BPH Migas memastikan pemerintah tidak menghapus BBM Pertalite, melainkan menyusun regulasi pembatasan pembelian untuk mobil dengan kapasitas mesin tertentu agar subsidi lebih tepat sasaran.',
      },
      {
        id: 'fuel-kontan',
        title: 'Kemenkeu Rilis Pos Anggaran Program Makan Bergizi Gratis dalam RAPBN 2025',
        source: 'Harian Kontan',
        source_type: 'NEWS',
        url: 'https://nasional.kontan.co.id',
        published: '2024-08-29',
        stance: 'SUPPORTS',
        snippet:
          'Pemerintah mengalokasikan Rp71 triliun untuk program Makan Bergizi Gratis pada APBN 2025 melalui pos belanja fungsi pendidikan dan cadangan program prioritas, bukan dari penarikan alokasi subsidi BBM.',
      },
      {
        id: 'fuel-cnn',
        title: 'Pertamina Jamin Stok Distribusi BBM Bersubsidi Aman Hingga Akhir Tahun',
        source: 'CNN Indonesia',
        source_type: 'NEWS',
        url: 'https://www.cnnindonesia.com',
        published: '2024-09-04',
        stance: 'UNRELATED',
        snippet:
          'Corporate Secretary Pertamina Patra Niaga memastikan sarana dan prasarana logistik energi di seluruh SPBU nasional tetap beroperasi normal dan kuota tahunan mencukupi kebutuhan masyarakat.',
      },
    ],
    retrieval_empty: false,
  },
};
