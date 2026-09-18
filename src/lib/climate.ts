import type { CSSProperties } from 'react';
import type { AnalyzeResponse, Climate, CommentLabel, Lean, SignalKind, Stance } from '../types';
import type { Strings } from './strings';

export const CLIMATE_COLOR: Record<Climate, string> = {
  NEUTRAL: 'var(--color-verified)',
  LEANING: 'var(--color-nuanced)',
  ASTROTURFED: 'var(--color-debunked)',
  INSUFFICIENT: 'var(--color-ink-muted)',
};

/**
 * Pro and contra are deliberately not good-and-bad colours: which side a
 * comment section favours is not a verdict on that side.
 */
export const STANCE_COLOR: Record<Stance, string> = {
  PRO: 'var(--color-verified)',
  CONTRA: 'var(--color-nuanced)',
  NEUTRAL: 'var(--color-ink-muted)',
};

export const COMMENT_LABEL_COLOR: Record<CommentLabel, string> = {
  BUZZER: 'var(--color-debunked)',
  ORGANIC: 'var(--color-verified)',
  UNCLEAR: 'var(--color-ink-muted)',
};

type Result = Pick<AnalyzeResponse, 'climate' | 'sample_empty'>;

/** An empty sample means no reading, whatever the model said. */
export const isInsufficient = (r: Result) => r.sample_empty || r.climate === 'INSUFFICIENT';

export function climateMeta(r: Result, t: Strings) {
  const key: Climate = isInsufficient(r) ? 'INSUFFICIENT' : r.climate;
  return { ...t.climate[key], color: CLIMATE_COLOR[key] };
}

export const signalKindLabel = (kind: string, t: Strings) =>
  t.signalKind[kind as SignalKind] ?? t.signalKind.UNKNOWN;

/** "Pro-Pemerintah", "Against-Kenaikan PPN 12%". */
export const leanLabel = (lean: Lean, t: Strings) => `${t.stance[lean.direction]}-${lean.target}`;

/** Exposes a color as `--tone`, so Tailwind classes like `text-(--tone)` can use it. */
export const tone = (color: string) => ({ '--tone': color }) as CSSProperties;
