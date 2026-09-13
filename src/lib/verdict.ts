import type { AnalyzeResponse, VerdictType } from '../types';

interface VerdictInfo {
  label: string;
  note: string;
  text: string;
  bar: string;
}

type Result = Pick<AnalyzeResponse, 'verdict' | 'retrieval_empty'>;

const VERDICTS: Record<Exclude<VerdictType, 'UNVERIFIABLE'>, VerdictInfo> = {
  TRUE: {
    label: 'Benar',
    note: 'Selaras dengan dokumen resmi dan rujukan terverifikasi.',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  FALSE: {
    label: 'Salah',
    note: 'Bertentangan dengan fakta dan dibantah sumber independen.',
    text: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-500',
  },
  MISLEADING: {
    label: 'Menyesatkan',
    note: 'Mencampur fakta dengan konteks yang keliru.',
    text: 'text-orange-600 dark:text-orange-400',
    bar: 'bg-orange-500',
  },
  OPINION: {
    label: 'Opini',
    note: 'Penilaian subjektif, bukan fakta yang dapat diuji.',
    text: 'text-indigo-600 dark:text-indigo-400',
    bar: 'bg-indigo-500',
  },
};

const UNVERIFIABLE: VerdictInfo = {
  label: 'Tidak dapat diverifikasi',
  note: 'Tidak ditemukan bukti yang cukup untuk membuktikan atau membantah klaim ini.',
  text: 'text-muted',
  bar: 'bg-muted',
};

// No evidence means no verdict, whatever the model said.
export const isUnverifiable = (r: Result) => r.retrieval_empty || r.verdict === 'UNVERIFIABLE';

export const verdictInfo = (r: Result): VerdictInfo =>
  r.retrieval_empty || r.verdict === 'UNVERIFIABLE' ? UNVERIFIABLE : VERDICTS[r.verdict];
