import type { AnalyzeResponse } from '../types';
import { isUnverifiable, verdictInfo } from '../lib/verdict';

export function VerdictCard({ response }: { response: AnalyzeResponse }) {
  const v = verdictInfo(response);
  const pct = Math.round(Math.min(1, Math.max(0, response.confidence)) * 100);

  return (
    <section>
      <p className="text-sm text-muted">{response.topic}</p>
      <h2 className={`mt-2 text-5xl font-semibold tracking-tight sm:text-6xl ${v.text}`}>{v.label}.</h2>
      <p className="mt-4 text-lg text-muted">{v.note}</p>

      {!isUnverifiable(response) && (
        <div className="mt-8 flex items-center gap-4">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-soft">
            <div className={`h-full rounded-full transition-[width] duration-700 ${v.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm text-muted tabular-nums">{pct}% yakin</span>
        </div>
      )}

      <blockquote className="mt-10 border-l-2 border-line pl-5 text-xl leading-relaxed">
        {response.claim_extracted}
      </blockquote>
    </section>
  );
}
