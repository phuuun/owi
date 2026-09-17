import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ExplanationToken } from '../types';
import { useI18n } from '../lib/i18n';
import { SectionHeading } from './SectionHeading';

// LIME weights: amber pushes toward buzzer, cyan toward organic; opacity tracks |weight|.
const tint = (w: number) => {
  const a = Math.min(1, Math.abs(w)) * 0.5;
  return w >= 0 ? `rgb(255 149 0 / ${a})` : `rgb(0 229 255 / ${a})`;
};

export function TokenExplanation({ tokens }: { tokens: ExplanationToken[] }) {
  const { t } = useI18n();
  if (tokens.length === 0) return null;

  return (
    <section aria-labelledby="lime-title">
      <SectionHeading id="lime-title" title={t.tokens.title} />

      <details className="group mt-5">
        <summary className="flex w-fit list-none items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright [&::-webkit-details-marker]:hidden">
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          {t.tokens.toggle}
        </summary>

        <p className="paper mt-5 rounded-sm border border-line px-5 py-5 text-lg leading-loose text-ink-bright sm:px-7">
          {tokens.map((t, i) => (
            <Fragment key={i}>
              <span
                title={`${t.weight > 0 ? '+' : ''}${t.weight.toFixed(2)}`}
                style={{ backgroundColor: tint(t.weight) }}
                className="rounded-[2px] px-1 py-0.5"
              >
                {t.token}
              </span>{' '}
            </Fragment>
          ))}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          <span className="text-nuanced">{t.tokens.legendAmber}</span> {t.tokens.legend}{' '}
          <span className="text-verified">{t.tokens.legendCyan}</span> {t.tokens.legendTail}
        </p>
      </details>
    </section>
  );
}
