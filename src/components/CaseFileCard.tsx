import { useEffect, useState, type ReactNode } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { FolderClosed } from 'lucide-react';
import type { AnalyzeResponse, Stance } from '../types';
import { percent } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { PLATFORM_LABEL } from '../lib/platform';
import { climateMeta, isInsufficient, leanLabel, STANCE_COLOR, tone } from '../lib/climate';
import { FilmStripIcon } from './FilmStripIcon';
import { RubberStamp } from './RubberStamp';

const TICKS = 20;

/** Rolls a number up from 0 like a score counter. */
function useCountUp(target: number, delay: number) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(target);
      return;
    }
    const controls = animate(0, target, {
      delay,
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, delay, reduceMotion]);

  return shown;
}

function ConfidenceMeter({ value, delay }: { value: number; delay: number }) {
  const { t } = useI18n();
  const shown = useCountUp(value, delay);
  const lit = Math.round((value / 100) * TICKS);
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={t.caseFile.confidence}>
      <div className="relative mt-4 ml-5 inline-block min-w-28 border border-ink-muted/60 bg-charcoal/70 px-4 pt-1 pb-1.5 text-center">
        <FilmStripIcon className="absolute -top-3.5 -left-7 w-12 -rotate-[26deg]" />
        <p className="text-3xl font-bold text-lens tabular-nums">
          {shown}
          <span className="text-lg">%</span>
        </p>
      </div>
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

const ORDER: Stance[] = ['PRO', 'CONTRA', 'NEUTRAL'];

/** Stacked share of the sample, one segment per stance. */
function StanceBar({ breakdown, delay }: { breakdown: AnalyzeResponse['breakdown']; delay: number }) {
  const { t } = useI18n();
  const share: Record<Stance, number> = { PRO: breakdown.pro, CONTRA: breakdown.contra, NEUTRAL: breakdown.neutral };
  const total = ORDER.reduce((sum, s) => sum + share[s], 0);
  if (total <= 0) return <p className="text-sm text-ink-muted">{t.caseFile.noComments}</p>;

  return (
    <div>
      <div aria-hidden="true" className="flex h-3 w-full overflow-hidden rounded-[1px] bg-line">
        {ORDER.map((s) => (
          <motion.span
            key={s}
            style={{ backgroundColor: STANCE_COLOR[s] }}
            initial={{ width: 0 }}
            animate={{ width: `${(share[s] / total) * 100}%` }}
            transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1">
        {ORDER.map((s) => (
          <li key={s} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            <span aria-hidden="true" className="size-2 shrink-0" style={{ backgroundColor: STANCE_COLOR[s] }} />
            {t.stance[s]}
            <span className="ml-auto tabular-nums text-ink">{percent(share[s])}%</span>
          </li>
        ))}
      </ul>
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
  response: AnalyzeResponse;
  /** Seconds before the stamp drops, so it lands after the lens settles. */
  stampDelay?: number;
}

export function CaseFileCard({ response, stampDelay = 0.6 }: CaseFileCardProps) {
  const { t, fmt } = useI18n();
  const c = climateMeta(response, t);
  const insufficient = isInsufficient(response);
  const { post, lean } = response;

  return (
    <motion.article
      aria-labelledby="case-post-label"
      style={tone(c.color)}
      // The folder jolts as the stamp hits it.
      animate={{ y: [0, 3, -1, 0] }}
      transition={{ delay: stampDelay + 0.1, duration: 0.28 }}
    >
      <div className="paper -mb-px inline-flex items-center gap-2.5 rounded-t-md border border-b-0 border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
        <FolderClosed className="size-3.5" strokeWidth={1.75} />
        {t.caseFile.folder}
        <span className="text-lens">{response.case_id}</span>
      </div>

      <div className="paper overflow-hidden rounded-md rounded-tl-none border border-line">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-dashed border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-muted sm:px-8">
          <span>{t.caseFile.classified}</span>
          <span>{response.topic}</span>
        </div>

        <div className="grid gap-8 px-5 py-7 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="min-w-0">
            <p id="case-post-label" className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">
              {t.caseFile.postRead}
            </p>
            <blockquote className="mt-3 text-xl font-medium leading-snug text-pretty text-ink-bright sm:text-2xl">
              {post ? post.title : t.caseFile.postUnavailable}
            </blockquote>
            <p className="mt-4 font-mono text-xs text-ink-muted">
              {post ? `${PLATFORM_LABEL[post.platform]} · ${post.author} · ` : ''}
              {post ? `${t.caseFile.sampledOf(fmt.count(post.sampled), fmt.count(post.comment_count))} · ` : ''}
              {t.caseFile.checkedAt(fmt.time(response.checked_at))}
            </p>
          </div>

          <RubberStamp
            label={c.stamp}
            caption={response.case_id}
            color={c.color}
            delay={stampDelay}
            className="justify-self-start md:mr-2 md:justify-self-end"
          />
        </div>

        <dl className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          <Cell label={t.caseFile.reading}>
            <p className="text-lg font-semibold text-(--tone)">{c.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{c.note}</p>
          </Cell>

          <Cell label={t.caseFile.leansToward}>
            {lean ? (
              <>
                <p className="text-lg font-semibold" style={{ color: STANCE_COLOR[lean.direction] }}>
                  {leanLabel(lean, t)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.caseFile.leanShare(percent(lean.share))}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-ink">
                  {insufficient ? t.caseFile.leanUnknown : t.caseFile.leanNone}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {insufficient ? t.caseFile.leanUnknownNote : t.caseFile.leanNoneNote}
                </p>
              </>
            )}
          </Cell>

          <Cell label={t.caseFile.confidence}>
            {insufficient ? (
              <p className="text-sm leading-relaxed text-ink-muted">{t.caseFile.confidenceHidden}</p>
            ) : (
              <ConfidenceMeter value={percent(response.confidence)} delay={stampDelay + 0.25} />
            )}
          </Cell>

          <Cell label={t.caseFile.composition}>
            <StanceBar breakdown={response.breakdown} delay={stampDelay + 0.35} />
          </Cell>

          <Cell label={t.caseFile.buzzerShare}>
            {insufficient ? (
              <p className="text-sm text-ink-muted">{t.caseFile.notCounted}</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-debunked tabular-nums">
                  {percent(response.buzzer_share)}
                  <span className="text-lg">%</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.caseFile.buzzerShareNote}</p>
              </>
            )}
          </Cell>

          <Cell label={t.caseFile.discussed}>
            {response.entities.length === 0 ? (
              <p className="text-sm text-ink-muted">{t.caseFile.none}</p>
            ) : (
              <ul className="space-y-2">
                {response.entities.map((e, i) => (
                  <li key={i} className="text-sm leading-snug">
                    <span className="text-ink">{e.name}</span>
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      {t.caseFile.entityLine(t.entityType[e.type], t.stance[e.stance].toLowerCase(), fmt.count(e.mentions))}
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
