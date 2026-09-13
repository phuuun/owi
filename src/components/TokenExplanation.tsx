import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ExplanationToken } from '../types';

// LIME weights: orange pushes toward the verdict, blue away; opacity tracks |weight|.
const tint = (w: number) => {
  const a = Math.min(1, Math.abs(w)) * 0.55;
  return w >= 0 ? `rgba(255, 149, 0, ${a})` : `rgba(0, 122, 255, ${a})`;
};

export function TokenExplanation({ tokens }: { tokens: ExplanationToken[] }) {
  if (tokens.length === 0) return null;

  return (
    <details className="group">
      <summary className="flex w-fit list-none items-center gap-1 text-sm text-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
        Cara model menilai
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>

      <p className="mt-6 text-xl leading-loose">
        {tokens.map((t, i) => (
          <Fragment key={i}>
            <span
              title={`${t.weight > 0 ? '+' : ''}${t.weight.toFixed(2)}`}
              style={{ backgroundColor: tint(t.weight) }}
              className="rounded-md px-1 py-0.5"
            >
              {t.token}
            </span>{' '}
          </Fragment>
        ))}
      </p>

      <p className="mt-4 text-sm text-muted">
        <span className="text-orange-500">Oranye</span> mendorong ke arah vonis, <span className="text-blue-500">biru</span>{' '}
        menjauh. Makin pekat, makin besar pengaruhnya.
      </p>
    </details>
  );
}
