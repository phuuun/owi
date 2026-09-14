import type { CSSProperties } from 'react';
import type { EvidenceStance, FactCheckResponse, SourceType, Verdict } from '../types';

export interface VerdictMeta {
  label: string;
  stamp: string;
  note: string;
  color: string;
}

const VERDICTS: Record<Exclude<Verdict, 'UNVERIFIABLE'>, VerdictMeta> = {
  TRUE: {
    label: 'Benar',
    stamp: 'VERIFIED',
    note: 'Selaras dengan dokumen resmi dan rujukan terverifikasi.',
    color: 'var(--color-verified)',
  },
  FALSE: {
    label: 'Salah',
    stamp: 'DEBUNKED',
    note: 'Bertentangan dengan fakta dan dibantah sumber independen.',
    color: 'var(--color-debunked)',
  },
  MISLEADING: {
    label: 'Menyesatkan',
    stamp: 'MISLEADING',
    note: 'Mencampur fakta dengan konteks yang keliru.',
    color: 'var(--color-nuanced)',
  },
  OPINION: {
    label: 'Opini',
    stamp: 'OPINION',
    note: 'Penilaian subjektif, bukan fakta yang dapat diuji.',
    color: 'var(--color-ink)',
  },
};

const UNVERIFIABLE: VerdictMeta = {
  label: 'Tidak dapat diverifikasi',
  stamp: 'UNVERIFIED',
  note: 'Tidak ditemukan bukti yang cukup untuk membuktikan atau membantah klaim ini.',
  color: 'var(--color-nuanced)',
};

type Result = Pick<FactCheckResponse, 'verdict' | 'retrieval_empty'>;

// No evidence means no verdict, whatever the model said.
export const isUnverifiable = (r: Result) => r.retrieval_empty || r.verdict === 'UNVERIFIABLE';

export const verdictMeta = (r: Result): VerdictMeta => (isUnverifiable(r) ? UNVERIFIABLE : VERDICTS[r.verdict as keyof typeof VERDICTS]);

export const STANCE: Record<EvidenceStance, { label: string; color: string }> = {
  SUPPORTS: { label: 'Mendukung', color: 'var(--color-verified)' },
  REFUTES: { label: 'Membantah', color: 'var(--color-debunked)' },
  UNRELATED: { label: 'Konteks', color: 'var(--color-ink-muted)' },
};

const SOURCE_TYPE: Record<SourceType, string> = {
  FACT_CHECK: 'Cek fakta',
  OFFICIAL: 'Rilis resmi',
  COURT: 'Putusan pengadilan',
  NEWS: 'Berita',
  RESEARCH: 'Riset',
};

export const sourceTypeLabel = (t: string) => SOURCE_TYPE[t as SourceType] ?? 'Sumber';

/** Exposes a color as `--tone`, so Tailwind classes like `text-(--tone)` can use it. */
export const tone = (color: string) => ({ '--tone': color }) as CSSProperties;
