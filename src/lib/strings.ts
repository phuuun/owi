import type { Lang } from '../types.ts';
import { PLATFORM_LIST } from './platform.ts';

/**
 * Every string the interface writes itself. Comments, post titles and account
 * handles are data and are never translated; OWI's own prose is.
 *
 * `EN` is typed against `ID`, so a missing or mistyped key fails `npm run lint`
 * rather than silently falling back.
 */
const ID = {
  langName: { id: 'Indonesia', en: 'Inggris' },

  layout: {
    language: 'Bahasa',
    archive: 'Arsip',
    disclaimerTool: 'OWI cuma alat bantu, bukan vonis. Bacaannya soal kolom komentar yang dibaca, bukan soal orangnya.',
    disclaimerLean: 'Kolom komentar yang condong belum tentu ada buzzer-nya. Orang emang bisa sepakat tanpa dikomando.',
  },

  home: {
    tagline: 'tagline soon to be updated',
    intro:
      'Tempel link postingannya. OWI bakal baca kolom komentarnya, terus kasih tahu opini di sana condong ke mana dan apakah ramainya alami atau digerakkan.',
    newCase: 'Kasus baru',
    errorTitle: 'Gangguan sinyal',
    errorFallback: 'Ada yang error pas baca kolom komentarnya.',
    samplesTitle: 'Contoh output',
    samplesAside: 'Bukan data asli, cuma contoh',
  },

  search: {
    inputLabel: 'Link postingan media sosial',
    placeholder: 'Tempel link postingan YouTube, Instagram, TikTok, X, atau Facebook…',
    hint: 'OWI bakal baca kolom komentarnya',
    hintEnter: ' · Enter buat mulai',
    submit: 'Cek',
    submitLoading: 'Memindai',
    stateStandby: 'Siaga',
    stateFocus: 'Fokus',
    stateRecording: 'Merekam',
    waitingForLink: 'Nunggu link',
    unknownPlatform: 'Platform nggak dikenal',
    needFullUrl: 'Tempel link lengkapnya ya, yang diawali http:// atau https://.',
    unsupported: `OWI baru bisa baca kolom komentar dari ${PLATFORM_LIST.id}.`,
  },

  loading: {
    status: 'Lagi baca kolom komentar…',
    reading: 'Lagi baca',
    targets: ['Link postingan', 'Kolom komentar', 'Pola kalimat', 'Waktu komentar', 'Jejak akun'],
  },

  caseFile: {
    folder: 'Berkas kasus',
    classified: 'Rahasia · buat pemeriksaan',
    postRead: 'Kolom komentar yang dibaca',
    postUnavailable: 'Postingannya nggak kebuka',
    sampledOf: (read: string, total: string) => `${read} dari ${total} komentar kebaca`,
    checkedAt: (time: string) => `dicek ${time}`,
    reading: 'Bacaan',
    leansToward: 'Condong ke',
    confidence: 'Keyakinan model',
    composition: 'Isi kolom komentar',
    buzzerShare: 'Terindikasi buzzer',
    discussed: 'Yang dibahas',
    leanShare: (p: number) => `${p}% komentar yang kebaca ada di sisi ini.`,
    leanUnknown: 'Belum ketahuan',
    leanNone: 'Nggak ada yang menang',
    leanUnknownNote: 'Komentarnya kurang buat nentuin arahnya.',
    leanNoneNote: 'Selisih antar sisinya kelewat tipis buat disebut condong.',
    confidenceHidden: 'Nggak ditampilkan. Tanpa komentar yang kebaca, skor keyakinan nggak ada artinya.',
    noComments: 'Nggak ada komentar yang kebaca',
    notCounted: 'Nggak dihitung',
    buzzerShareNote: 'dari komentar yang dibaca kelihatan digerakkan bareng.',
    none: 'Nggak ada',
    entityLine: (type: string, stance: string, mentions: string) => `${type} · nada ${stance} · disebut ${mentions} kali`,
  },

  board: {
    title: 'Papan koordinasi',
    hint: 'Klik klaster buat lihat komentarnya',
    post: 'Unggahan',
    commentsRead: (n: string) => `${n} komentar kebaca`,
    clusterMeta: (label: string, accounts: string) => `${label} · ${accounts} akun`,
    clusterStats: (similarity: number, minutes: number) => `${similarity}% mirip · dalam ${minutes} menit`,
    emptyNoComments: 'Nggak ada komentar buat dicek',
    emptyNoClusters: 'Nggak nemu klaster yang gerak bareng. Komentar yang senada di sini ditulis pakai kalimat masing-masing.',
  },

  dossier: {
    findings: 'Temuan',
    noFindings: 'Nggak nemu tanda-tanda koordinasi.',
    noFindingsEmpty: 'Nggak ada komentar yang bisa dicek di postingan ini.',
    noFindingsOrganic: 'Komentarnya ditulis pakai kalimat masing-masing dan datangnya nggak barengan.',
    comments: 'Berkas komentar',
    openAll: 'Buka semua data akun',
    closeAll: 'Tutup semua',
    noCommentsTitle: 'Nggak ada komentar yang bisa dibaca dari postingan ini.',
    noCommentsNote: 'OWI nggak nebak. Tanpa komentar, kolom ini dibiarin tanpa penilaian.',
    excerptNote:
      'Ini cuma kutipan, bukan semuanya. Nama akun udah disamarkan dari sumbernya: OWI ngelaporin pola, bukan nuduh orangnya.',
    signalStrength: (tier: string) => `Kekuatan ${tier.toLowerCase()}`,
    openAccount: 'Buka data akun',
    closeAccount: 'Tutup data akun',
    redacted: 'DISENSOR',
    avatarDefault: 'bawaan',
    avatarOwn: 'sendiri',
    account: (age: string, followers: string, perDay: number, avatar: string) =>
      `Akun umur ${age} hari · ${followers} pengikut · ${perDay} postingan/hari · foto profil ${avatar}`,
  },

  timeline: {
    title: 'Ramainya kapan',
    oneColumn: (width: string) => `Satu kolom = ${width}`,
    minutes: (n: number) => `${n} menit`,
    hours: (n: number) => `${n} jam`,
    spread: (total: string, peak: string) => `Sebaran ${total} komentar dari waktu ke waktu, paling ramai ${peak} komentar.`,
    bucket: (when: string, total: string, buzzer: string) => `${when} · ${total} komentar, ${buzzer} terindikasi buzzer`,
    legendBuzzer: 'Kemungkinan buzzer',
    legendRest: 'Sisanya',
    note: 'Obrolan yang ramai sendiri biasanya turun pelan-pelan. Kalau ada satu kolom yang jauh lebih tinggi dari sebelahnya, berarti komentarnya datang bareng.',
  },

  tokens: {
    title: 'Cara model mikir',
    toggle: 'Lihat bobot tiap kata',
    legend: 'narik ke arah buzzer,',
    legendAmber: 'Amber',
    legendCyan: 'sian',
    legendTail: 'ke arah komentar asli. Makin pekat, makin gede pengaruhnya. Arahin kursor ke katanya buat lihat bobotnya.',
  },

  archive: {
    title: 'Arsip kasus',
    clear: 'Kosongkan',
    close: 'Tutup arsip',
    empty: 'Belum ada kasus. Arsipnya cuma nyimpen selama halaman ini kebuka.',
  },

  model: {
    title: 'Model & metodologi',
    aside: 'Angka contoh · nyusul',
    intro:
      'Berikut bagaimana OWI bekerja dengan modelnya. Semua angka di bawah masih sementara sampai modelnya diuji pakai dataset beneran.',
    mock: 'Mock',
    pending: 'Model · nyusul',
    testSet: 'Set uji · nyusul',
    openTable: 'Lihat tabelnya',
    closeTable: 'Tutup tabel',
    pipeline: [
      { title: 'Ambil komentar', body: 'Narik komentar dari link postingan, lengkap sama waktunya dan data publik akun yang nulis.' },
      { title: 'Pilah komentar', body: 'Nilai tiap komentar: buzzer, asli, atau belum jelas, sekalian sisi mana yang didukung.' },
      { title: 'Cari koordinasi', body: 'Ngumpulin komentar yang kalimatnya mirip dan waktunya berdekatan jadi satu klaster.' },
      { title: 'Bacaan kolom', body: 'Gabungin arah opini sama tanda koordinasi jadi satu bacaan. Tanpa komentar, nggak ada bacaan.' },
    ],
    metrics: { accuracy: 'Akurasi', macroF1: 'Macro F1', precision: 'Presisi', recall: 'Recall' },
    accuracyTitle: 'Akurasi per epoch pelatihan',
    accuracySubtitle: 'Berapa banyak komentar yang dilabeli bener tiap habis satu epoch.',
    accuracyHint: 'Akurasi per epoch pelatihan. Pakai tombol panah kiri dan kanan buat baca tiap epoch.',
    train: 'Pelatihan',
    validate: 'Validasi',
    epoch: 'Epoch',
    f1Title: 'Skor F1 per kelas',
    f1Subtitle: 'Keseimbangan presisi sama recall tiap kelas komentar, dari 0 sampai 1.',
    f1Class: 'Kelas',
    f1Samples: 'Sampel uji',
    f1Row: (label: string, f1: string, samples: string) => `${label}: F1 ${f1}, ${samples} sampel uji`,
    scoreTitle: 'Skor koordinasi',
    scoreSubtitle: 'Gimana tanda-tandanya digabung jadi satu angka. Rumusnya masih sementara.',
    scoreFormula: 'koordinasi = Σ (wᵢ · cᵢ) / Σ wᵢ',
    scoreWeight: 'Bobot jenis tanda i; kalimat copy-paste lebih berat daripada pujian kosong',
    scoreStrength: 'Sekuat apa tanda i muncul di kolom ini, 0 sampai 1',
    scoreThresholdTerm: 'ambang',
    scoreThreshold: 'Batas yang harus dilewati, dan wajib ada minimal satu klaster',
    scoreNote:
      'Udah jalan: arah opini nggak pernah ikut naikin skor koordinasi, dan kalau nggak ada komentar yang kebaca, bacaannya jadi Kurang data tanpa skor keyakinan.',
  },

  climate: {
    NEUTRAL: {
      label: 'Netral',
      stamp: 'NETRAL',
      note: 'Suaranya terbagi. Nggak ada sisi yang cukup menang buat disebut condong.',
    },
    LEANING: {
      label: 'Condong',
      stamp: 'CONDONG',
      note: 'Satu sisi menang banyak, tapi cara nulis dan waktunya masih wajar.',
    },
    ASTROTURFED: {
      label: 'Kemungkinan buzzer',
      stamp: 'BUZZER',
      note: 'Satu sisi menang banyak, ditambah kalimat yang seragam dan komentar yang datang bareng.',
    },
    INSUFFICIENT: {
      label: 'Kurang data',
      stamp: 'NO DATA',
      note: 'Komentar yang kebaca kesedikitan buat dinilai.',
    },
  },

  stance: { PRO: 'Pro', CONTRA: 'Kontra', NEUTRAL: 'Netral' },
  commentLabel: { BUZZER: 'Buzzer', ORGANIC: 'Asli', UNCLEAR: 'Belum jelas' },
  strength: { STRONG: 'Kuat', MEDIUM: 'Sedang', WEAK: 'Lemah' },
  entityType: { INSTITUTION: 'Lembaga', PERSON: 'Tokoh', PARTY: 'Partai', BRAND: 'Merek' },
  signalKind: {
    TEMPLATE: 'Kalimat copy-paste',
    BURST: 'Datang bareng',
    FRESH_ACCOUNT: 'Akun baru',
    GENERIC_PRAISE: 'Pujian kosong',
    NO_ARGUMENT: 'Nggak ada alasan',
    HASHTAG_PUSH: 'Tagar didorong',
    REPLY_RING: 'Saling balas',
    UNKNOWN: 'Temuan',
  },

  api: {
    unreachable: 'Server OWI nggak bisa dihubungi. Pastikan API-nya udah jalan (npm run dev).',
    failed: (status: number) => `Gagal nyambung ke server (${status}).`,
    badContract: 'Balasan server nggak cocok sama kontrak API.',
    badSamples: 'Daftar contoh nggak cocok sama kontrak API.',
  },
};

export type Strings = typeof ID;

const EN: Strings = {
  langName: { id: 'Indonesian', en: 'English' },

  layout: {
    language: 'Language',
    archive: 'Archive',
    disclaimerTool: 'OWI is an assistive tool, not a verdict. Its reading covers the comments it read, not the people who wrote them.',
    disclaimerLean: 'A comment section that leans one way is not proof of buzzers. People really do agree without being told to.',
  },

  home: {
    tagline: 'tagline soon to be updated',
    intro:
      'Paste the link to a post. OWI reads its comment section and tells you which way the opinion there leans, and whether the crowd showed up on its own or was driven.',
    newCase: 'New case',
    errorTitle: 'Signal trouble',
    errorFallback: 'Something broke while reading the comment section.',
    samplesTitle: 'Sample output',
    samplesAside: 'Not real data, just examples',
  },

  search: {
    inputLabel: 'Social media post link',
    placeholder: 'Paste a YouTube, Instagram, TikTok, X or Facebook post link…',
    hint: 'OWI will read its comment section',
    hintEnter: ' · Enter to start',
    submit: 'Check',
    submitLoading: 'Scanning',
    stateStandby: 'Standby',
    stateFocus: 'Focus',
    stateRecording: 'Recording',
    waitingForLink: 'Waiting for a link',
    unknownPlatform: 'Unknown platform',
    needFullUrl: 'Paste the full link, starting with http:// or https://.',
    unsupported: `OWI can only read comment sections on ${PLATFORM_LIST.en}.`,
  },

  loading: {
    status: 'Reading the comment section…',
    reading: 'Reading',
    targets: ['Post link', 'Comment section', 'Sentence patterns', 'Comment timing', 'Account trails'],
  },

  caseFile: {
    folder: 'Case file',
    classified: 'Classified · for review',
    postRead: 'Comment section read',
    postUnavailable: 'The post could not be opened',
    sampledOf: (read: string, total: string) => `${read} of ${total} comments read`,
    checkedAt: (time: string) => `checked ${time}`,
    reading: 'Reading',
    leansToward: 'Leans toward',
    confidence: 'Model confidence',
    composition: 'What is in the comments',
    buzzerShare: 'Flagged as buzzer',
    discussed: 'Who is discussed',
    leanShare: (p: number) => `${p}% of the comments read sit on this side.`,
    leanUnknown: 'Not established',
    leanNone: 'No side wins',
    leanUnknownNote: 'Too few comments to tell which way it leans.',
    leanNoneNote: 'The gap between the sides is too thin to call it a lean.',
    confidenceHidden: 'Not shown. With no comments read, a confidence score would mean nothing.',
    noComments: 'No comments were read',
    notCounted: 'Not counted',
    buzzerShareNote: 'of the comments read look like they were driven together.',
    none: 'None',
    entityLine: (type: string, stance: string, mentions: string) => `${type} · ${stance} tone · mentioned ${mentions} times`,
  },

  board: {
    title: 'Coordination board',
    hint: 'Click a cluster to see its comments',
    post: 'Post',
    commentsRead: (n: string) => `${n} comments read`,
    clusterMeta: (label: string, accounts: string) => `${label} · ${accounts} accounts`,
    clusterStats: (similarity: number, minutes: number) => `${similarity}% alike · within ${minutes} min`,
    emptyNoComments: 'No comments to check',
    emptyNoClusters: 'No cluster moving in step. The comments that agree here were each written in their own words.',
  },

  dossier: {
    findings: 'Findings',
    noFindings: 'No coordination markers found.',
    noFindingsEmpty: 'There are no comments to check on this post.',
    noFindingsOrganic: 'The comments are written in their own words and did not arrive together.',
    comments: 'Comment file',
    openAll: 'Open every account record',
    closeAll: 'Close all',
    noCommentsTitle: 'No comments could be read from this post.',
    noCommentsNote: 'OWI does not guess. With no comments, this section is left unjudged.',
    excerptNote:
      'This is an excerpt, not the whole sample. Handles arrive masked from the source: OWI reports patterns, it does not accuse people.',
    signalStrength: (tier: string) => `${tier} signal`,
    openAccount: 'Open account record',
    closeAccount: 'Close account record',
    redacted: 'REDACTED',
    avatarDefault: 'default',
    avatarOwn: 'custom',
    account: (age: string, followers: string, perDay: number, avatar: string) =>
      `Account ${age} days old · ${followers} followers · ${perDay} posts/day · ${avatar} profile picture`,
  },

  timeline: {
    title: 'When it got busy',
    oneColumn: (width: string) => `One column = ${width}`,
    minutes: (n: number) => `${n} min`,
    hours: (n: number) => `${n} hr`,
    spread: (total: string, peak: string) => `${total} comments spread over time, busiest column ${peak} comments.`,
    bucket: (when: string, total: string, buzzer: string) => `${when} · ${total} comments, ${buzzer} flagged as buzzer`,
    legendBuzzer: 'Likely buzzer',
    legendRest: 'The rest',
    note: 'A conversation that gets busy on its own tails off slowly. One column far taller than its neighbours means the comments arrived together.',
  },

  tokens: {
    title: 'How the model reads it',
    toggle: 'See the weight on each word',
    legend: 'pulls toward buzzer,',
    legendAmber: 'Amber',
    legendCyan: 'cyan',
    legendTail: 'toward organic. The denser the tint, the heavier the pull. Hover a word to see its weight.',
  },

  archive: {
    title: 'Case archive',
    clear: 'Clear',
    close: 'Close archive',
    empty: 'No cases yet. The archive only keeps them while this page stays open.',
  },

  model: {
    title: 'Model & methodology',
    aside: 'Sample numbers · to follow',
    intro: 'Here is how OWI works with its model. Every number below is a placeholder until the model is tested on a real dataset.',
    mock: 'Mock',
    pending: 'Model · to follow',
    testSet: 'Test set · to follow',
    openTable: 'See the table',
    closeTable: 'Close the table',
    pipeline: [
      { title: 'Collect comments', body: 'Pull the comments off the post link, with their timing and the public data of the accounts that wrote them.' },
      { title: 'Sort comments', body: 'Judge each comment: buzzer, organic or unclear, and which side it backs.' },
      { title: 'Look for coordination', body: 'Group comments whose wording is alike and whose timing is close into one cluster.' },
      { title: 'Read the section', body: 'Combine the direction of opinion with the coordination markers into one reading. With no comments, there is no reading.' },
    ],
    metrics: { accuracy: 'Accuracy', macroF1: 'Macro F1', precision: 'Precision', recall: 'Recall' },
    accuracyTitle: 'Accuracy per training epoch',
    accuracySubtitle: 'How many comments were labelled correctly after each epoch.',
    accuracyHint: 'Accuracy per training epoch. Use the left and right arrow keys to read each epoch.',
    train: 'Training',
    validate: 'Validation',
    epoch: 'Epoch',
    f1Title: 'F1 score per class',
    f1Subtitle: 'The balance of precision and recall for each comment class, from 0 to 1.',
    f1Class: 'Class',
    f1Samples: 'Test samples',
    f1Row: (label: string, f1: string, samples: string) => `${label}: F1 ${f1}, ${samples} test samples`,
    scoreTitle: 'Coordination score',
    scoreSubtitle: 'How the markers are combined into one number. The formula is still provisional.',
    scoreFormula: 'coordination = Σ (wᵢ · cᵢ) / Σ wᵢ',
    scoreWeight: 'Weight of marker type i; copy-pasted sentences count for more than empty praise',
    scoreStrength: 'How strongly marker i shows up in this section, 0 to 1',
    scoreThresholdTerm: 'threshold',
    scoreThreshold: 'The line that has to be crossed, plus at least one cluster',
    scoreNote:
      'Already in place: the direction of opinion never raises the coordination score, and when no comments can be read the result is Not enough data, with no confidence score.',
  },

  climate: {
    NEUTRAL: {
      label: 'Neutral',
      stamp: 'NEUTRAL',
      note: 'The voices are split. No side wins by enough to call it a lean.',
    },
    LEANING: {
      label: 'Leaning',
      stamp: 'LEANING',
      note: 'One side wins by a lot, but the wording and the timing still look natural.',
    },
    ASTROTURFED: {
      label: 'Likely buzzer',
      stamp: 'BUZZER',
      note: 'One side wins by a lot, plus uniform sentences and comments that arrived together.',
    },
    INSUFFICIENT: {
      label: 'Not enough data',
      stamp: 'NO DATA',
      note: 'Too few comments could be read to judge anything.',
    },
  },

  stance: { PRO: 'Pro', CONTRA: 'Against', NEUTRAL: 'Neutral' },
  commentLabel: { BUZZER: 'Buzzer', ORGANIC: 'Organic', UNCLEAR: 'Unclear' },
  strength: { STRONG: 'Strong', MEDIUM: 'Medium', WEAK: 'Weak' },
  entityType: { INSTITUTION: 'Institution', PERSON: 'Person', PARTY: 'Party', BRAND: 'Brand' },
  signalKind: {
    TEMPLATE: 'Copy-pasted wording',
    BURST: 'Arrived together',
    FRESH_ACCOUNT: 'Fresh accounts',
    GENERIC_PRAISE: 'Empty praise',
    NO_ARGUMENT: 'No reasoning',
    HASHTAG_PUSH: 'Hashtag push',
    REPLY_RING: 'Reply ring',
    UNKNOWN: 'Finding',
  },

  api: {
    unreachable: 'The OWI server is unreachable. Check that the API is running (npm run dev).',
    failed: (status: number) => `Could not reach the server (${status}).`,
    badContract: 'The server reply does not match the API contract.',
    badSamples: 'The sample list does not match the API contract.',
  },
};

export const DICT: Record<Lang, Strings> = { id: ID, en: EN };
