import type { MockCase } from '../types.ts';

const CLAIM =
  'Mahkamah Konstitusi mengabulkan sebagian uji materi Pasal 169 huruf q UU Pemilu, sehingga syarat usia capres-cawapres menjadi minimal 40 tahun atau pernah/sedang menduduki jabatan yang dipilih melalui pemilihan umum termasuk pilkada.';

export const trueMkRuling: MockCase = {
  case_id: 'OWI-2023-1016',
  sample: { label: 'Benar', input: { text: CLAIM } },
  keywords: [['mahkamah konstitusi'], ['mk', 'usia'], ['capres-cawapres']],
  first_seen: '2023-10-16',
  result: {
    verdict: 'TRUE',
    confidence: 0.98,
    claim_extracted:
      'Mahkamah Konstitusi memutuskan syarat usia capres-cawapres dapat di bawah 40 tahun asalkan pernah atau sedang menduduki jabatan hasil pemilu/pilkada.',
    topic: 'Hukum & Tata Negara',
    entities: [
      { name: 'Mahkamah Konstitusi', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'KPU RI', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'DPR RI', type: 'INSTITUTION', stance: 'NEUTRAL' },
    ],
    explanation_tokens: [
      { token: 'Mahkamah', weight: 0.25 },
      { token: 'Konstitusi', weight: 0.31 },
      { token: 'memutuskan', weight: 0.42 },
      { token: 'syarat', weight: 0.18 },
      { token: 'usia', weight: 0.36 },
      { token: 'capres-cawapres', weight: 0.54 },
      { token: 'dapat', weight: 0.29 },
      { token: 'di', weight: 0.05 },
      { token: 'bawah', weight: 0.44 },
      { token: '40', weight: 0.81 },
      { token: 'tahun', weight: 0.72 },
      { token: 'asalkan', weight: 0.35 },
      { token: 'pernah', weight: 0.65 },
      { token: 'atau', weight: 0.15 },
      { token: 'sedang', weight: 0.55 },
      { token: 'menduduki', weight: 0.48 },
      { token: 'jabatan', weight: 0.76 },
      { token: 'hasil', weight: 0.38 },
      { token: 'pemilu/pilkada.', weight: 0.71 },
    ],
    article: {
      headline: 'MK Kabulkan Sebagian Uji Materi Syarat Usia Capres-Cawapres',
      outlet: 'Warta Nusantara',
      url: 'https://wartanusantara.example/hukum/mk-kabulkan-uji-materi-usia-capres',
      published: '2023-10-16',
      paragraphs: [
        'JAKARTA — Sidang pleno Mahkamah Konstitusi pada Senin siang membacakan putusan atas sejumlah permohonan uji materi Undang-Undang Nomor 7 Tahun 2017 tentang Pemilihan Umum.',
        CLAIM,
        'Putusan tersebut diwarnai pendapat berbeda (dissenting opinion) dari sejumlah hakim konstitusi. KPU menyatakan akan mempelajari amar putusan sebelum menyesuaikan peraturan teknis pencalonan.',
      ],
      claim_quote: CLAIM,
    },
    evidence: [
      {
        id: 'mk-putusan',
        title: 'Salinan Putusan Nomor 90/PUU-XXI/2023 Perkara Pengujian Materiil UU Pemilu',
        source: 'Mahkamah Konstitusi RI',
        source_type: 'COURT',
        url: 'https://www.mkri.id',
        published: '2023-10-16',
        stance: 'SUPPORTS',
        snippet:
          "Amar Putusan: Mengabulkan permohonan pemohon untuk sebagian. Menyatakan Pasal 169 huruf q UU 7/2017 bertentangan dengan UUD 1945 secara bersyarat sepanjang tidak dimaknai 'berusia paling rendah 40 tahun atau pernah/sedang menduduki jabatan yang dipilih melalui pemilihan umum termasuk pemilihan kepala daerah'.",
      },
      {
        id: 'mk-antara',
        title: 'MK Putuskan Batas Usia Capres-Cawapres Berlaku Alternatif Syarat Kepala Daerah',
        source: 'Antara News',
        source_type: 'NEWS',
        url: 'https://www.antaranews.com',
        published: '2023-10-16',
        stance: 'SUPPORTS',
        snippet:
          'Sidang pleno pengucapan putusan Mahkamah Konstitusi resmi menetapkan klausul alternatif pengalaman kepala daerah dalam syarat usia capres-cawapres Republik Indonesia.',
      },
      {
        id: 'mk-kompas',
        title: 'Putusan MK Buka Jalan Kepala Daerah Berusia di Bawah 40 Tahun Maju Pilpres',
        source: 'Harian Kompas',
        source_type: 'NEWS',
        url: 'https://www.kompas.id',
        published: '2023-10-17',
        stance: 'SUPPORTS',
        snippet:
          'Komisi Pemilihan Umum (KPU) selanjutnya menindaklanjuti amar putusan MK tersebut dengan menyelaraskan peraturan teknis pencalonan presiden dan wakil presiden.',
      },
    ],
    retrieval_empty: false,
  },
};
