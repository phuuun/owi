import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FolderClosed } from 'lucide-react';
import type { EntityType, FactCheckResponse, Sentiment } from '../types';
import { formatTime, percent } from '../lib/format';
import { isUnverifiable, tone, verdictMeta } from '../lib/verdict';
import { RubberStamp } from './RubberStamp';

const ENTITY_TYPE: Record<EntityType, string> = { INSTITUTION: 'Lembaga', PERSON: 'Tokoh', PARTY: 'Partai' };
const SENTIMENT: Record<Sentiment, string> = { POSITIVE: 'positif', NEGATIVE: 'kritis', NEUTRAL: 'netral' };

const TICKS = 20;

function ConfidenceMeter({ value, delay }: { value: number; delay: number }) {
  const lit = Math.round((value / 100) * TICKS);
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label="Keyakinan model">
      <p className="font-mono text-3xl font-bold text-ink-bright tabular-nums">
        {value}
        <span className="text-lg text-ink-muted">%</span>
      </p>
      <div aria-hidden="true" className="mt-2 flex gap-[3px]">
        {Array.from({ length: TICKS }, (_, i) => (
          <motion.span
            key={i}
            className={`h-3 flex-1 rounded-[1px] ${i < lit ? 'bg-(--tone)' : 'bg-line'}`}
            initial={i < lit ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + i * 0.025, duration: 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-newsprint px-5 py-5 sm:px-6">
      <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

interface CaseFileCardProps {
  response: FactCheckResponse;
  /** Seconds before the verdict stamp drops, so it lands after the lens settles. */
  stampDelay?: number;
}

export function CaseFileCard({ response, stampDelay = 0.6 }: CaseFileCardProps) {
  const v = verdictMeta(response);
  const unverifiable = isUnverifiable(response);

  return (
    <motion.article
      aria-labelledby="case-claim-label"
      style={tone(v.color)}
      // The folder jolts as the stamp hits it.
      animate={{ y: [0, 3, -1, 0] }}
      transition={{ delay: stampDelay + 0.1, duration: 0.28 }}
    >
      <div className="paper -mb-px inline-flex items-center gap-2.5 rounded-t-md border border-b-0 border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
        <FolderClosed className="size-3.5" strokeWidth={1.75} />
        Berkas kasus
        <span className="text-lens">{response.case_id}</span>
      </div>

      <div className="paper overflow-hidden rounded-md rounded-tl-none border border-line">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-dashed border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-muted sm:px-8">
          <span>Rahasia · untuk pemeriksaan</span>
          <span>{response.topic}</span>
        </div>

        <div className="grid gap-8 px-5 py-7 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="min-w-0">
            <p id="case-claim-label" className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">
              Klaim yang diperiksa
            </p>
            <blockquote className="mt-3 text-xl font-medium leading-snug text-pretty text-ink-bright sm:text-2xl">
              “{response.claim_extracted}”
            </blockquote>
            <p className="mt-4 font-mono text-xs text-ink-muted">
              Diserahkan sebagai {response.input.kind === 'url' ? 'tautan artikel' : 'teks'} · diperiksa{' '}
              {formatTime(response.checked_at)}
            </p>
          </div>

          <RubberStamp
            label={v.stamp}
            caption={response.case_id}
            color={v.color}
            delay={stampDelay}
            className="justify-self-start md:mr-2 md:justify-self-end"
          />
        </div>

        <dl className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
          <Cell label="Vonis">
            <p className="text-lg font-semibold text-(--tone)">{v.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{v.note}</p>
          </Cell>

          <Cell label="Keyakinan model">
            {unverifiable ? (
              <p className="text-sm leading-relaxed text-ink-muted">Tidak ditampilkan. Tanpa bukti, skor keyakinan tidak bermakna.</p>
            ) : (
              <ConfidenceMeter value={percent(response.confidence)} delay={stampDelay + 0.25} />
            )}
          </Cell>

          <Cell label="Pihak disebut">
            {response.entities.length === 0 ? (
              <p className="text-sm text-ink-muted">Tidak ada</p>
            ) : (
              <ul className="space-y-2">
                {response.entities.map((e, i) => (
                  <li key={i} className="text-sm leading-snug">
                    <span className="text-ink">{e.name}</span>
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      {ENTITY_TYPE[e.type]} · nada {SENTIMENT[e.stance]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cell>
        </dl>
      </div>
    </motion.article>
  );
}
