import type { Lang } from '../types.ts';
import { PLATFORM_LIST } from './platform.ts';

/**
 * Every string the interface writes itself. Comments, post titles and account
 * handles are data and are never translated; OWI's own prose is.
 *
 * Keep it short and spoken: one idea per line, no lab words. `EN` is typed
 * against `ID`, so a missing or mistyped key fails `npm run lint` rather than
 * silently falling back.
 */
const ID = {
  langName: { id: 'Indonesia', en: 'Inggris' },

  layout: {
    language: 'Bahasa',
    archive: 'Arsip',
    disclaimerTool: 'OWI cuma alat bantu, bukan vonis. Yang dinilai komentarnya, bukan orangnya.',
    disclaimerLean: 'Komentar yang condong belum tentu buzzer. Orang emang bisa sepakat sendiri.',
  },

  home: {
    tagline: 'tagline soon to be updated',
    intro: 'Tempel link postingan. OWI baca komentarnya, terus kasih tahu condongnya ke mana dan ramenya alami atau digerakkan.',
    newCase: 'Kasus baru',
    errorTitle: 'Gagal',
    errorFallback: 'Ada yang error pas baca komentarnya.',
    samplesTitle: 'Contoh',
    samplesAside: 'Bukan data asli',
  },

  search: {
    inputLabel: 'Link postingan media sosial',
    placeholder: 'Tempel link YouTube, Instagram, TikTok, X, atau Facebook…',
    hint: 'OWI bakal baca komentarnya',
    hintEnter: ' · Enter buat mulai',
    submit: 'Cek',
    submitLoading: 'Memindai',
    stateStandby: 'Siaga',
    stateFocus: 'Fokus',
    stateRecording: 'Merekam',
    waitingForLink: 'Nunggu link',
    unknownPlatform: 'Platform nggak dikenal',
    needFullUrl: 'Tempel link lengkapnya, mulai dari https://.',
    unsupported: `OWI baru bisa baca ${PLATFORM_LIST.id}.`,
  },

  loading: {
    status: 'Lagi baca komentar…',
    reading: 'Lagi baca',
    targets: ['Link postingan', 'Komentar', 'Pola kalimat', 'Jejak akun'],
  },

  /** Hover line on the mascot, keyed by what he is doing. */
  mascot: {
    idle: 'Ada link? Sini dicek.',
    searching: 'Lagi dicek…',
    resting: 'Udah kelar. Ngopi dulu.',
  },

  caseFile: {
    folder: 'Berkas kasus',
    postRead: 'Postingan yang dicek',
    postUnavailable: 'Postingannya nggak kebuka',
    reading: 'Hasil',
    leansToward: 'Condong ke',
    confidence: 'Keyakinan model',
    composition: 'Isi komentar',
    buzzerShare: 'Diduga buzzer',
    onBreak: 'Istirahat dulu',
    leanShare: (p: number) => `${p}% komentar ada di sisi ini.`,
    leanUnknown: 'Belum ketahuan',
    leanNone: 'Nggak ada yang menang',
    leanUnknownNote: 'Komentarnya kesedikitan.',
    leanNoneNote: 'Selisihnya tipis banget.',
    confidenceHidden: 'Nggak ada komentar, jadi nggak ada skornya.',
    noComments: 'Nggak ada komentar',
    notCounted: 'Nggak dihitung',
    buzzerShareNote: 'komentar kelihatan digerakkan bareng.',
  },

  board: {
    title: 'Papan koordinasi',
    hint: 'Klik klaster buat lihat komentarnya',
    post: 'Unggahan',
    commentsRead: (n: string) => `${n} komentar dibaca`,
    clusterMeta: (label: string, accounts: string) => `${label} · ${accounts} akun`,
    clusterStats: (similarity: number, minutes: number) => `${similarity}% mirip · dalam ${minutes} menit`,
    emptyNoComments: 'Nggak ada komentar buat dicek',
    emptyNoClusters: 'Nggak ada yang gerak bareng. Kalimatnya beda-beda semua.',
  },

  dossier: {
    findings: 'Temuan',
    noFindings: 'Nggak ada tanda koordinasi.',
    noFindingsEmpty: 'Nggak ada komentar buat dicek.',
    noFindingsOrganic: 'Kalimatnya beda-beda dan datangnya nggak barengan.',
    comments: 'Komentar',
    noCommentsTitle: 'Nggak ada komentar yang kebaca.',
    noCommentsNote: 'OWI nggak nebak-nebak.',
    excerptNote: 'Cuma kutipan. Nama akunnya disamarkan.',
  },

  timeline: {
    title: 'Ramainya kapan',
    oneColumn: (width: string) => `Satu batang = ${width}`,
    minutes: (n: number) => `${n} menit`,
    hours: (n: number) => `${n} jam`,
    spread: (total: string, peak: string) => `${total} komentar dari waktu ke waktu, paling ramai ${peak}.`,
    bucket: (when: string, total: string, buzzer: string) => `${when} · ${total} komentar, ${buzzer} diduga buzzer`,
    legendBuzzer: 'Kemungkinan buzzer',
    legendRest: 'Sisanya',
    note: 'Kalau ada satu batang yang jauh lebih tinggi, berarti komentarnya datang bareng.',
  },

  archive: {
    title: 'Arsip kasus',
    clear: 'Kosongkan',
    close: 'Tutup arsip',
    empty: 'Belum ada kasus. Kehapus kalau halamannya di-refresh.',
  },

  model: {
    title: 'Cara kerjanya',
    aside: 'Modelnya belum jadi',
    pipeline: [
      { title: 'Ambil komentar', body: 'Narik komentar dari link postingan, lengkap sama jam postingnya.' },
      { title: 'Pilah komentar', body: 'Tiap komentar dinilai: buzzer, asli, atau belum jelas.' },
      { title: 'Cari yang bareng', body: 'Komentar yang kalimatnya mirip dan datangnya berdekatan dikumpulin jadi satu klaster.' },
      { title: 'Kasih hasil', body: 'Arah opini sama tanda koordinasi digabung jadi satu hasil. Nggak ada komentar, nggak ada hasil.' },
    ],
    /** Evaluation mockup. Home page only — a report never shows these. */
    mock: 'Mock',
    openTable: 'Lihat tabelnya',
    closeTable: 'Tutup tabel',
    metrics: { accuracy: 'Akurasi', macroF1: 'Macro F1', precision: 'Presisi', recall: 'Recall' },
    accuracyTitle: 'Akurasi tiap epoch',
    accuracySubtitle: 'Berapa banyak komentar yang dilabeli bener tiap habis satu putaran latihan.',
    accuracyHint: 'Akurasi tiap epoch. Pakai tombol panah kiri dan kanan buat baca satu-satu.',
    train: 'Latihan',
    validate: 'Validasi',
    epoch: 'Epoch',
    f1Title: 'Skor F1 tiap label',
    f1Subtitle: 'Seberapa bener model nebak tiap label, dari 0 sampai 1.',
    f1Class: 'Label',
    f1Samples: 'Sampel uji',
    f1Row: (label: string, f1: string, samples: string) => `${label}: F1 ${f1}, ${samples} sampel uji`,
  },

  climate: {
    NEUTRAL: {
      label: 'Netral',
      stamp: 'NETRAL',
      note: 'Suaranya kebagi rata. Nggak ada yang menang.',
    },
    LEANING: {
      label: 'Condong',
      stamp: 'CONDONG',
      note: 'Satu sisi menang banyak, tapi kalimat sama waktunya wajar.',
    },
    ASTROTURFED: {
      label: 'Kemungkinan buzzer',
      stamp: 'BUZZER',
      note: 'Satu sisi menang banyak, kalimatnya seragam, datangnya bareng.',
    },
    INSUFFICIENT: {
      label: 'Kurang data',
      stamp: 'NO DATA',
      note: 'Komentarnya kesedikitan buat dinilai.',
    },
  },

  stance: { PRO: 'Pro', CONTRA: 'Kontra', NEUTRAL: 'Netral' },
  commentLabel: { BUZZER: 'Buzzer', ORGANIC: 'Asli', UNCLEAR: 'Belum jelas' },
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
    unreachable: 'Server OWI nggak bisa dihubungi. Pastiin API-nya jalan (npm run dev).',
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
    disclaimerTool: 'OWI is a helper, not a verdict. It judges comments, not the people behind them.',
    disclaimerLean: 'Comments leaning one way are not proof of buzzers. People really do agree on their own.',
  },

  home: {
    tagline: 'tagline soon to be updated',
    intro: 'Paste a post link. OWI reads the comments and tells you which way they lean, and whether the crowd came on its own or was driven.',
    newCase: 'New case',
    errorTitle: 'Failed',
    errorFallback: 'Something broke while reading the comments.',
    samplesTitle: 'Examples',
    samplesAside: 'Not real data',
  },

  search: {
    inputLabel: 'Social media post link',
    placeholder: 'Paste a YouTube, Instagram, TikTok, X or Facebook link…',
    hint: 'OWI will read the comments',
    hintEnter: ' · Enter to start',
    submit: 'Check',
    submitLoading: 'Scanning',
    stateStandby: 'Standby',
    stateFocus: 'Focus',
    stateRecording: 'Recording',
    waitingForLink: 'Waiting for a link',
    unknownPlatform: 'Unknown platform',
    needFullUrl: 'Paste the full link, starting with https://.',
    unsupported: `OWI can only read ${PLATFORM_LIST.en}.`,
  },

  loading: {
    status: 'Reading the comments…',
    reading: 'Reading',
    targets: ['Post link', 'Comments', 'Wording', 'Account trails'],
  },

  mascot: {
    idle: "Got a link? Let's check it.",
    searching: 'On it…',
    resting: 'All done. Coffee break.',
  },

  caseFile: {
    folder: 'Case file',
    postRead: 'Post checked',
    postUnavailable: 'The post could not be opened',
    reading: 'Result',
    leansToward: 'Leans toward',
    confidence: 'Model confidence',
    composition: 'What the comments say',
    buzzerShare: 'Looks like buzzer',
    onBreak: 'On a break',
    leanShare: (p: number) => `${p}% of comments sit on this side.`,
    leanUnknown: 'Not clear yet',
    leanNone: 'No side wins',
    leanUnknownNote: 'Too few comments to tell.',
    leanNoneNote: 'The gap is very thin.',
    confidenceHidden: 'No comments, so no score.',
    noComments: 'No comments',
    notCounted: 'Not counted',
    buzzerShareNote: 'of the comments look driven together.',
  },

  board: {
    title: 'Coordination board',
    hint: 'Click a cluster to see its comments',
    post: 'Post',
    commentsRead: (n: string) => `${n} comments read`,
    clusterMeta: (label: string, accounts: string) => `${label} · ${accounts} accounts`,
    clusterStats: (similarity: number, minutes: number) => `${similarity}% alike · within ${minutes} min`,
    emptyNoComments: 'No comments to check',
    emptyNoClusters: 'Nothing moving in step. Every comment is worded differently.',
  },

  dossier: {
    findings: 'Findings',
    noFindings: 'No signs of coordination.',
    noFindingsEmpty: 'There are no comments to check.',
    noFindingsOrganic: 'The wording varies and they did not arrive together.',
    comments: 'Comments',
    noCommentsTitle: 'No comments could be read.',
    noCommentsNote: 'OWI does not guess.',
    excerptNote: 'Just an excerpt. Handles are masked.',
  },

  timeline: {
    title: 'When it got busy',
    oneColumn: (width: string) => `One bar = ${width}`,
    minutes: (n: number) => `${n} min`,
    hours: (n: number) => `${n} hr`,
    spread: (total: string, peak: string) => `${total} comments over time, busiest ${peak}.`,
    bucket: (when: string, total: string, buzzer: string) => `${when} · ${total} comments, ${buzzer} look like buzzer`,
    legendBuzzer: 'Likely buzzer',
    legendRest: 'The rest',
    note: 'One bar far taller than the others means the comments arrived together.',
  },

  archive: {
    title: 'Case archive',
    clear: 'Clear',
    close: 'Close archive',
    empty: 'No cases yet. They are gone once you refresh.',
  },

  model: {
    title: 'How it works',
    aside: 'Model not built yet',
    pipeline: [
      { title: 'Collect comments', body: 'Pull the comments off the post link, with the time each one landed.' },
      { title: 'Sort comments', body: 'Judge each comment: buzzer, organic or unclear.' },
      { title: 'Find the ones in step', body: 'Group comments with near-identical wording and close timing into one cluster.' },
      { title: 'Give the result', body: 'The lean and the coordination signs become one result. No comments, no result.' },
    ],
    mock: 'Mock',
    openTable: 'See the table',
    closeTable: 'Close the table',
    metrics: { accuracy: 'Accuracy', macroF1: 'Macro F1', precision: 'Precision', recall: 'Recall' },
    accuracyTitle: 'Accuracy per epoch',
    accuracySubtitle: 'How many comments got the right label after each training round.',
    accuracyHint: 'Accuracy per epoch. Use the left and right arrow keys to read them one by one.',
    train: 'Training',
    validate: 'Validation',
    epoch: 'Epoch',
    f1Title: 'F1 score per label',
    f1Subtitle: 'How well the model calls each label, from 0 to 1.',
    f1Class: 'Label',
    f1Samples: 'Test samples',
    f1Row: (label: string, f1: string, samples: string) => `${label}: F1 ${f1}, ${samples} test samples`,
  },

  climate: {
    NEUTRAL: {
      label: 'Neutral',
      stamp: 'NEUTRAL',
      note: 'The voices are split. No side wins.',
    },
    LEANING: {
      label: 'Leaning',
      stamp: 'LEANING',
      note: 'One side wins big, but the wording and timing look normal.',
    },
    ASTROTURFED: {
      label: 'Likely buzzer',
      stamp: 'BUZZER',
      note: 'One side wins big, the wording is uniform, and they came together.',
    },
    INSUFFICIENT: {
      label: 'Not enough data',
      stamp: 'NO DATA',
      note: 'Too few comments to judge.',
    },
  },

  stance: { PRO: 'Pro', CONTRA: 'Against', NEUTRAL: 'Neutral' },
  commentLabel: { BUZZER: 'Buzzer', ORGANIC: 'Organic', UNCLEAR: 'Unclear' },
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
    unreachable: 'The OWI server is unreachable. Check the API is running (npm run dev).',
    failed: (status: number) => `Could not reach the server (${status}).`,
    badContract: 'The server reply does not match the API contract.',
    badSamples: 'The sample list does not match the API contract.',
  },
};

export const DICT: Record<Lang, Strings> = { id: ID, en: EN };
