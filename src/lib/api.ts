import type { AnalyzeRequest, AnalyzeResponse, ExampleClaim } from '../types';

/**
 * MOCK FLAG:
 * Set to `false` to make real network calls to POST /api/analyze.
 * When `false`, the client executes a real fetch against the specified endpoint.
 */
export const MOCK = true;

export const EXAMPLE_CLAIMS: ExampleClaim[] = [
  {
    id: 'misleading-fuel',
    label: 'BBM & Program Makan Bergizi',
    category: 'Ekonomi / Kebijakan',
    text: 'Pemerintah secara resmi menghapus total BBM bersubsidi jenis Pertalite mulai bulan depan demi mengalihkan seluruh anggarannya ke program Makan Bergizi Gratis.',
  },
  {
    id: 'false-debt',
    label: 'Utang Luar Negeri & IKN',
    category: 'Fiskal / Cek Fakta',
    text: 'Kementerian Keuangan mengumumkan utang luar negeri Indonesia meroket Rp20.000 triliun dalam sebulan akibat pembiayaan langsung infrastruktur IKN Nusantara.',
  },
  {
    id: 'true-mk',
    label: 'Putusan Mahkamah Konstitusi',
    category: 'Hukum / Tata Negara',
    text: 'Mahkamah Konstitusi mengabulkan sebagian uji materi Pasal 169 huruf q UU Pemilu, sehingga syarat usia capres-cawapres menjadi minimal 40 tahun atau pernah/sedang menduduki jabatan yang dipilih melalui pemilihan umum termasuk pilkada.',
  },
];

/** Dev shortcuts (footer "Pengembang" panel), one per mock case, in MOCK_DATABASE order. */
export const SCENARIOS = [
  { label: 'Salah', text: EXAMPLE_CLAIMS[1].text },
  { label: 'Benar', text: EXAMPLE_CLAIMS[2].text },
  { label: 'Menyesatkan', text: EXAMPLE_CLAIMS[0].text },
  {
    label: 'Opini',
    text: 'Kebijakan hilirisasi mineral tambang di Indonesia merupakan kegagalan strategis terbesar yang hanya menguntungkan oligarki dan merusak kedaulatan lingkungan masa depan.',
  },
  {
    label: 'Tanpa bukti',
    text: 'Beredar kabar bahwa ketua umum partai koalisi menggelar pertemuan rahasia dini hari di pulau terpencil Kepulauan Seribu untuk menetapkan jatah menteri 2029.',
  },
];

// 5 Complete Mock Responses matching the exact API contract
export const MOCK_DATABASE: Record<string, AnalyzeResponse> = {
  // Case 1: FALSE claim with 3 refuting sources
  'false-claim': {
    verdict: 'FALSE',
    confidence: 0.94,
    claim_extracted: 'Utang luar negeri Indonesia melonjak hingga Rp20.000 triliun dalam tempo sebulan akibat pembiayaan infrastruktur IKN.',
    entities: [
      { name: 'Kementerian Keuangan RI', type: 'INSTITUTION', stance: 'NEGATIVE' },
      { name: 'Bank Indonesia', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'Otorita Ibu Kota Nusantara (OIKN)', type: 'INSTITUTION', stance: 'NEGATIVE' },
    ],
    topic: 'Ekonomi & Fiskal',
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
    evidence: [
      {
        title: 'Cek Fakta: Hoaks Klaim Utang Luar Negeri Indonesia Menembus Rp20.000 Triliun',
        source: 'Kompas.com Cek Fakta',
        url: 'https://cekfakta.kompas.com',
        published: '14 Agustus 2024',
        stance: 'REFUTES',
        snippet: 'Berdasarkan Publikasi Statistik Utang Luar Negeri Indonesia (SULNI) periode Juni 2024 oleh Bank Indonesia dan Kemenkeu, posisi ULN Indonesia tercatat USD 408,6 miliar (sekitar Rp6.500 triliun). Angka Rp20.000 triliun merupakan fabrikasi data tanpa rujukan resmi.',
      },
      {
        title: 'Keliru, Narasi Lonjakan Utang Luar Negeri 20 Ribu Triliun Akibat Pembangunan IKN',
        source: 'Tempo.co Cek Fakta',
        url: 'https://cekfakta.tempo.co',
        published: '15 Agustus 2024',
        stance: 'REFUTES',
        snippet: 'Pemeriksaan Tempo mengonfirmasi bahwa alokasi APBN untuk IKN dilakukan bertahap dan telah diaudit Badan Pemeriksa Keuangan (BPK). Tidak ada instrumen pinjaman luar negeri pemerintah yang melipatgandakan total utang dalam tempo sebulan.',
      },
      {
        title: '[SALAH] Utang Pemerintah Meroket Rp20.000 Triliun Hanya Dalam Tempo Sebulan',
        source: 'TurnBackHoax.id / Mafindo',
        url: 'https://turnbackhoax.id',
        published: '17 Agustus 2024',
        stance: 'REFUTES',
        snippet: 'Kategori: Konten yang Dimanipulasi. Narasi ini merupakan daur ulang klaim lama yang mencatut tangkapan layar siaran berita televisi dengan mengubah grafis angka nominal utang negara secara serampangan.',
      },
    ],
    retrieval_empty: false,
  },

  // Case 2: TRUE claim
  'true-claim': {
    verdict: 'TRUE',
    confidence: 0.98,
    claim_extracted: 'Mahkamah Konstitusi memutuskan syarat usia capres-cawapres dapat di bawah 40 tahun asalkan pernah atau sedang menduduki jabatan hasil pemilu/pilkada.',
    entities: [
      { name: 'Mahkamah Konstitusi', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'KPU RI', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'DPR RI', type: 'INSTITUTION', stance: 'NEUTRAL' },
    ],
    topic: 'Hukum & Tata Negara',
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
    evidence: [
      {
        title: 'Salinan Putusan Nomor 90/PUU-XXI/2023 Perkara Pengujian Materiil UU Pemilu',
        source: 'Mahkamah Konstitusi RI',
        url: 'https://www.mkri.id',
        published: '16 Oktober 2023',
        stance: 'SUPPORTS',
        snippet: "Amar Putusan: Mengabulkan permohonan pemohon untuk sebagian. Menyatakan Pasal 169 huruf q UU 7/2017 bertentangan dengan UUD 1945 secara bersyarat sepanjang tidak dimaknai 'berusia paling rendah 40 tahun atau pernah/sedang menduduki jabatan yang dipilih melalui pemilihan umum termasuk pemilihan kepala daerah'.",
      },
      {
        title: 'MK Putuskan Batas Usia Capres-Cawapres Berlaku Alternatif Syarat Kepala Daerah',
        source: 'Antara News',
        url: 'https://www.antaranews.com',
        published: '16 Oktober 2023',
        stance: 'SUPPORTS',
        snippet: 'Sidang pleno pengucapan putusan Mahkamah Konstitusi resmi menetapkan klausul alternatif pengalaman kepala daerah dalam syarat usia capres-cawapres Republik Indonesia.',
      },
      {
        title: 'Putusan MK Buka Jalan Kepala Daerah Berusia di Bawah 40 Tahun Maju Pilpres',
        source: 'Harian Kompas',
        url: 'https://www.kompas.id',
        published: '17 Oktober 2023',
        stance: 'SUPPORTS',
        snippet: 'Komisi Pemilihan Umum (KPU) selanjutnya menindaklanjuti amar putusan MK tersebut dengan menyelaraskan peraturan teknis pencalonan presiden dan wakil presiden.',
      },
    ],
    retrieval_empty: false,
  },

  // Case 3: MISLEADING claim with mixed evidence
  'misleading-claim': {
    verdict: 'MISLEADING',
    confidence: 0.86,
    claim_extracted: 'Pemerintah menghapus total BBM bersubsidi jenis Pertalite mulai bulan depan untuk mengalihkan seluruh anggarannya ke program Makan Bergizi Gratis.',
    entities: [
      { name: 'Kementerian ESDM', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'PT Pertamina (Persero)', type: 'INSTITUTION', stance: 'NEUTRAL' },
      { name: 'Badan Gizi Nasional', type: 'INSTITUTION', stance: 'NEGATIVE' },
    ],
    topic: 'Kebijakan Publik & Energi',
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
    evidence: [
      {
        title: 'BPH Migas: Tidak Ada Penghapusan Pertalite Total, Melainkan Pengetatan Kriteria Pembeli',
        source: 'Katadata',
        url: 'https://katadata.co.id',
        published: '3 September 2024',
        stance: 'REFUTES',
        snippet: 'BPH Migas memastikan pemerintah tidak menghapus BBM Pertalite, melainkan menyusun regulasi pembatasan pembelian untuk mobil dengan kapasitas mesin tertentu agar subsidi lebih tepat sasaran.',
      },
      {
        title: 'Kemenkeu Rilis Pos Anggaran Program Makan Bergizi Gratis dalam RAPBN 2025',
        source: 'Harian Kontan',
        url: 'https://nasional.kontan.co.id',
        published: '29 Agustus 2024',
        stance: 'SUPPORTS',
        snippet: 'Pemerintah mengalokasikan Rp71 triliun untuk program Makan Bergizi Gratis pada APBN 2025 melalui pos belanja fungsi pendidikan dan cadangan program prioritas, bukan dari penarikan alokasi subsidi BBM.',
      },
      {
        title: 'Pertamina Jamin Stok Distribusi BBM Bersubsidi Aman Hingga Akhir Tahun',
        source: 'CNN Indonesia',
        url: 'https://www.cnnindonesia.com',
        published: '4 September 2024',
        stance: 'UNRELATED',
        snippet: 'Corporate Secretary Pertamina Patra Niaga memastikan sarana dan prasarana logistik energi di seluruh SPBU nasional tetap beroperasi normal dan kuota tahunan mencukupi kebutuhan masyarakat.',
      },
    ],
    retrieval_empty: false,
  },

  // Case 4: OPINION input
  'opinion-claim': {
    verdict: 'OPINION',
    confidence: 0.92,
    claim_extracted: 'Kebijakan hilirisasi mineral tambang di Indonesia merupakan kegagalan strategis yang hanya menguntungkan oligarki serta merusak kedaulatan lingkungan masa depan.',
    entities: [
      { name: 'Pemerintah RI', type: 'INSTITUTION', stance: 'NEGATIVE' },
      { name: 'Kementerian Investasi / BKPM', type: 'INSTITUTION', stance: 'NEGATIVE' },
    ],
    topic: 'Politik & Diskursus Publik',
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
    evidence: [
      {
        title: 'Menimbang Sisi Terang dan Gelap Kebijakan Hilirisasi Nikel Indonesia',
        source: 'Centre for Strategic and International Studies (CSIS)',
        url: 'https://www.csis.or.id',
        published: '22 Mei 2024',
        stance: 'UNRELATED',
        snippet: 'Analisis CSIS memaparkan diskursus publik di mana kelompok pro menyoroti lonjakan nilai ekspor nikel olahan, sedangkan pengamat kritis menyoroti minimnya serapan tenaga kerja lokal dan tantangan tata kelola ekologis.',
      },
      {
        title: 'Perdebatan Multi-perspektif Efektivitas Hilirisasi Tambang Nasional',
        source: 'LPEM FEB Universitas Indonesia',
        url: 'https://lpem.org',
        published: '18 Juni 2024',
        stance: 'UNRELATED',
        snippet: "Penilaian apakah hilirisasi dinilai 'sukses' atau 'gagal' sangat bergantung pada indikator normatif yang digunakan oleh masing-masing pemangku kepentingan dalam diskursus kebijakan publik.",
      },
    ],
    retrieval_empty: false,
  },

  // Case 5: UNVERIFIABLE case where retrieval_empty is true and evidence is []
  'unverifiable-claim': {
    verdict: 'UNVERIFIABLE',
    confidence: 0.15,
    claim_extracted: 'Pertemuan rahasia ketua umum partai koalisi berlangsung tengah malam di bunker militer terpencil untuk menentukan pembagian kursi kabinet 2029.',
    entities: [
      { name: 'Koalisi Partai Politik', type: 'PARTY', stance: 'NEUTRAL' },
    ],
    topic: 'Desas-Desus Politik',
    explanation_tokens: [
      { token: 'Pertemuan', weight: -0.12 },
      { token: 'rahasia', weight: -0.45 },
      { token: 'ketua', weight: 0.05 },
      { token: 'umum', weight: 0.04 },
      { token: 'partai', weight: 0.08 },
      { token: 'koalisi', weight: 0.06 },
      { token: 'berlangsung', weight: -0.05 },
      { token: 'tengah', weight: -0.14 },
      { token: 'malam', weight: -0.16 },
      { token: 'di', weight: -0.02 },
      { token: 'bunker', weight: -0.48 },
      { token: 'militer', weight: -0.22 },
      { token: 'terpencil', weight: -0.52 },
      { token: 'untuk', weight: 0.03 },
      { token: 'menentukan', weight: -0.18 },
      { token: 'pembagian', weight: -0.25 },
      { token: 'kursi', weight: -0.28 },
      { token: 'kabinet', weight: 0.12 },
      { token: '2029.', weight: -0.35 },
    ],
    evidence: [],
    retrieval_empty: true,
  },
};

/**
 * Intelligent helper to pick or synthesize a mock response based on text content
 */
function getMockResponseForText(text: string): AnalyzeResponse {
  const lower = text.toLowerCase();

  // Match false claim about debt or IKN
  if (lower.includes('20.000') || lower.includes('utang') || (lower.includes('ikn') && lower.includes('meroket'))) {
    return MOCK_DATABASE['false-claim'];
  }

  // Match MK ruling
  if (lower.includes('mahkamah konstitusi') || (lower.includes('mk') && lower.includes('usia')) || lower.includes('capres-cawapres')) {
    return MOCK_DATABASE['true-claim'];
  }

  // Match Pertalite / fuel / makan bergizi
  if (lower.includes('pertalite') || lower.includes('bbm') || lower.includes('makan bergizi') || lower.includes('subsidi')) {
    return MOCK_DATABASE['misleading-claim'];
  }

  // Match opinion keywords
  if (lower.includes('hilirisasi') || lower.includes('oligarki') || lower.includes('kegagalan') || lower.includes('terburuk') || lower.includes('menurut saya')) {
    return MOCK_DATABASE['opinion-claim'];
  }

  // Match unverifiable rumor keywords
  if (lower.includes('rahasia') || lower.includes('bunker') || lower.includes('pulau terpencil') || lower.includes('desas-desus') || lower.includes('bisik-bisik')) {
    return MOCK_DATABASE['unverifiable-claim'];
  }

  // General fallback: generate a nuanced mock response with genuine token attribution from input
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 4) {
    // Short / unverifiable input
    return {
      verdict: 'UNVERIFIABLE',
      confidence: 0.2,
      claim_extracted: text.trim(),
      entities: [],
      topic: 'Klaim Umum',
      explanation_tokens: words.map((word) => ({
        token: word,
        weight: (Math.sin(word.length) * 0.4),
      })),
      evidence: [],
      retrieval_empty: true,
    };
  }

  // Generate a realistic assessed response for arbitrary input
  return {
    verdict: 'UNVERIFIABLE',
    confidence: 0.25,
    claim_extracted: text.trim().replace(/[.?]+$/, '') + '.',
    entities: [
      { name: 'Pemerintah RI', type: 'INSTITUTION', stance: 'NEUTRAL' }
    ],
    topic: 'Isu Publik',
    explanation_tokens: words.slice(0, 24).map((w, idx) => ({
      token: w,
      weight: parseFloat((Math.sin(idx + w.length) * 0.6).toFixed(2)),
    })),
    evidence: [],
    retrieval_empty: true,
  };
}

/**
 * Primary API entrypoint for analyzing claims.
 * Respects MOCK flag:
 * - If MOCK === true: returns realistic simulated server responses with 600ms latency.
 * - If MOCK === false: performs real POST /api/analyze request.
 */
export async function analyzeClaim(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  if (!request.text || request.text.trim().length === 0) {
    throw new Error('Teks klaim tidak boleh kosong.');
  }

  if (MOCK) {
    // Simulate network latency (650ms) to allow loading skeleton state to be visible and smooth
    await new Promise((resolve) => setTimeout(resolve, 650));
    return getMockResponseForText(request.text);
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || '';
    } catch {
      // ignore
    }
    throw new Error(`Gagal menganalisis klaim: ${response.status} ${response.statusText} ${errorDetail}`.trim());
  }

  return parseAnalyzeResponse(await response.json());
}

const VERDICTS = ['TRUE', 'MISLEADING', 'FALSE', 'UNVERIFIABLE', 'OPINION'];

/**
 * Backend output is untrusted: a missing array or unknown verdict would crash
 * the result view, so reject malformed payloads with a readable error instead.
 */
export function parseAnalyzeResponse(data: unknown): AnalyzeResponse {
  const d = data as Partial<AnalyzeResponse> | null;
  if (
    !d ||
    !VERDICTS.includes(d.verdict as string) ||
    typeof d.confidence !== 'number' ||
    typeof d.claim_extracted !== 'string' ||
    !Array.isArray(d.entities) ||
    !Array.isArray(d.explanation_tokens) ||
    !Array.isArray(d.evidence) ||
    typeof d.retrieval_empty !== 'boolean'
  ) {
    throw new Error('Respons server tidak sesuai kontrak API.');
  }
  return d as AnalyzeResponse;
}
