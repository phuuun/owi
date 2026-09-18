import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AnalyzeResponse, Comment, CommentLabel } from '../types';
import { percent } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { COMMENT_LABEL_COLOR, signalKindLabel, tone } from '../lib/climate';
import { SectionHeading } from './SectionHeading';

/** A cluster or signal picked elsewhere on the page. `seq` changes on every pick, so re-picking still scrolls. */
export interface DossierFocus {
  id: string;
  seq: number;
}

const EXCERPT_MAX = 4;

function SignalRow({ signal, active, onSelect }: { signal: AnalyzeResponse['signals'][number]; active: boolean; onSelect: () => void }) {
  const { t } = useI18n();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        style={tone('var(--color-debunked)')}
        className={`paper block w-full rounded-sm border border-l-4 border-line border-l-(--tone) px-5 py-4 text-left transition-colors sm:px-6 ${
          active ? 'ring-1 ring-(--tone)' : 'hover:border-line-strong'
        }`}
      >
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          <span className="text-(--tone)">{signalKindLabel(signal.kind, t)}</span>
          <span className="tabular-nums">{percent(signal.weight)}%</span>
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-ink">{signal.detail}</span>
        <span aria-hidden="true" className="mt-3 block h-1 w-full overflow-hidden rounded-[1px] bg-line">
          <motion.span
            className="block h-full bg-(--tone)"
            initial={{ width: 0 }}
            whileInView={{ width: `${percent(signal.weight)}%` }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </span>
      </button>
    </li>
  );
}

function CommentEntry({ comment, active }: { comment: Comment; active: boolean }) {
  const { t } = useI18n();

  return (
    <li
      id={`comment-${comment.id}`}
      style={tone(COMMENT_LABEL_COLOR[comment.label])}
      className={`paper scroll-mt-24 rounded-sm border border-l-4 border-line border-l-(--tone) px-5 py-4 transition-shadow duration-300 sm:px-6 ${
        active ? 'ring-1 ring-(--tone)' : ''
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--tone)">{t.commentLabel[comment.label]}</p>
      <p className="mt-2 text-[17px] leading-relaxed text-ink-bright">{comment.text}</p>
      <p className="mt-2 font-mono text-[11px] text-ink-muted">{comment.author}</p>
    </li>
  );
}

/**
 * The short list shown by default. One comment of each label comes first, so a
 * cut-down excerpt never reads as if the whole section were buzzers.
 */
function excerptOf(comments: Comment[]) {
  const labels = new Set<CommentLabel>();
  const keep = new Set<string>();
  for (const c of comments) {
    if (labels.has(c.label)) continue;
    labels.add(c.label);
    keep.add(c.id);
  }
  for (const c of comments) {
    if (keep.size >= EXCERPT_MAX) break;
    keep.add(c.id);
  }
  return comments.filter((c) => keep.has(c.id));
}

interface CommentDossierProps {
  response: AnalyzeResponse;
  focus: DossierFocus | null;
  onSelectSignal: (signalId: string) => void;
}

export function CommentDossier({ response, focus, onSelectSignal }: CommentDossierProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const { comments, clusters, signals } = response;

  // A pick on the board or in the findings list names a cluster or a signal;
  // both resolve to the comments they were drawn from.
  const implicated = useMemo(() => {
    if (!focus) return new Set<string>();
    const source = clusters.find((c) => c.id === focus.id) ?? signals.find((s) => s.id === focus.id);
    return new Set(source?.comment_ids ?? []);
  }, [focus, clusters, signals]);

  // Picking a finding opens the full list: its evidence has to be on the page.
  const excerpt = useMemo(() => excerptOf(comments), [comments]);
  const shown = focus ? comments : excerpt;

  useEffect(() => {
    if (!focus) return;
    const first = comments.find((c) => implicated.has(c.id));
    if (!first) return;
    document.getElementById(`comment-${first.id}`)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }, [focus, implicated, comments, reduceMotion]);

  return (
    <>
      <section aria-labelledby="signals-title">
        <SectionHeading
          id="signals-title"
          title={signals.length === 0 ? t.dossier.findings : `${t.dossier.findings} · ${signals.length}`}
        />

        {signals.length === 0 ? (
          <div className="paper mt-6 rounded-sm border border-dashed border-line-strong p-6">
            <p className="text-ink">{t.dossier.noFindings}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {response.sample_empty ? t.dossier.noFindingsEmpty : t.dossier.noFindingsOrganic}
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {signals.map((s) => (
              <SignalRow key={s.id} signal={s} active={focus?.id === s.id} onSelect={() => onSelectSignal(s.id)} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="comments-title">
        <SectionHeading
          id="comments-title"
          title={shown.length === 0 ? t.dossier.comments : `${t.dossier.comments} · ${shown.length}`}
        />

        {comments.length === 0 ? (
          <div className="paper mt-6 rounded-sm border border-dashed border-line-strong p-6">
            <div aria-hidden="true" className="space-y-2">
              {['w-11/12', 'w-8/12', 'w-10/12'].map((w) => (
                <div key={w} className={`redaction h-4 ${w}`} />
              ))}
            </div>
            <p className="mt-5 text-ink">{t.dossier.noCommentsTitle}</p>
            <p className="mt-1 text-sm text-ink-muted">{t.dossier.noCommentsNote}</p>
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">{t.dossier.excerptNote}</p>
            <ol className="mt-5 space-y-4">
              {shown.map((c) => (
                <CommentEntry key={c.id} comment={c} active={implicated.has(c.id)} />
              ))}
            </ol>
          </>
        )}
      </section>
    </>
  );
}
