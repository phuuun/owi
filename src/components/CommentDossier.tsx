import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Heart } from 'lucide-react';
import type { AnalyzeResponse, Comment } from '../types';
import { percent } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { COMMENT_LABEL_COLOR, signalKindLabel, signalStrength, STANCE_COLOR, tone } from '../lib/climate';
import { SectionHeading } from './SectionHeading';

/** A cluster or signal picked elsewhere on the page. `seq` changes on every pick, so re-picking still scrolls. */
export interface DossierFocus {
  id: string;
  seq: number;
}

// One black bar per text line: matches the account row's leading-7 (28px).
const REDACTION_LINES =
  'repeating-linear-gradient(to bottom, transparent 0 5px, var(--color-redaction) 5px 23px, transparent 23px 28px)';

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
          <span>{t.dossier.signalStrength(signalStrength(signal.weight, t))}</span>
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

function AccountRow({ comment, open }: { comment: Comment; open: boolean }) {
  const { t, fmt } = useI18n();
  const { account } = comment;
  return (
    <div className="relative mt-3 max-w-[72ch]">
      <motion.p
        initial={false}
        animate={{ filter: open ? 'blur(0px)' : 'blur(6px)' }}
        transition={{ duration: 0.4 }}
        className={`font-mono text-xs leading-7 text-ink-muted ${open ? '' : 'invisible'}`}
      >
        {t.dossier.account(
          fmt.count(account.age_days),
          fmt.count(account.followers),
          account.posts_per_day,
          account.default_avatar ? t.dossier.avatarDefault : t.dossier.avatarOwn,
        )}
      </motion.p>
      <AnimatePresence initial={false}>
        {!open && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 origin-right"
            style={{ background: REDACTION_LINES }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.4, ease: [0.7, 0, 0.3, 1] }}
          >
            <span className="absolute top-[7px] right-2 font-mono text-[10px] tracking-[0.3em] text-ink-muted/60">
              {t.dossier.redacted}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CommentEntryProps {
  comment: Comment;
  open: boolean;
  active: boolean;
  onToggle: () => void;
}

function CommentEntry({ comment, open, active, onToggle }: CommentEntryProps) {
  const { t, fmt } = useI18n();

  return (
    <li
      id={`comment-${comment.id}`}
      style={tone(COMMENT_LABEL_COLOR[comment.label])}
      className={`paper scroll-mt-24 rounded-sm border border-l-4 border-line border-l-(--tone) px-5 py-5 transition-shadow duration-300 sm:px-6 ${
        active ? 'ring-1 ring-(--tone)' : ''
      }`}
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        <span className="text-(--tone)">{t.commentLabel[comment.label]}</span>
        <span className="tabular-nums">{percent(comment.score)}%</span>
        <span style={{ color: STANCE_COLOR[comment.stance] }}>{t.stance[comment.stance]}</span>
        <time dateTime={comment.posted_at}>{fmt.dateTime(comment.posted_at)}</time>
      </p>

      <p className="mt-3 text-[17px] leading-relaxed text-ink-bright">{comment.text}</p>

      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-ink-muted">
        <span>{comment.author}</span>
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3" strokeWidth={2} />
          {fmt.count(comment.likes)}
        </span>
      </p>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright"
      >
        {open ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {open ? t.dossier.closeAccount : t.dossier.openAccount}
      </button>

      <AccountRow comment={comment} open={open} />
    </li>
  );
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
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const allOpen = comments.length > 0 && comments.every((c) => open.has(c.id));

  // A pick on the board or in the findings list names a cluster or a signal;
  // both resolve to the comments they were drawn from.
  const implicated = useMemo(() => {
    if (!focus) return new Set<string>();
    const source = clusters.find((c) => c.id === focus.id) ?? signals.find((s) => s.id === focus.id);
    return new Set(source?.comment_ids ?? []);
  }, [focus, clusters, signals]);

  useEffect(() => {
    if (!focus) return;
    const first = comments.find((c) => implicated.has(c.id));
    if (!first) return;
    document.getElementById(`comment-${first.id}`)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }, [focus, implicated, comments, reduceMotion]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

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
          title={comments.length === 0 ? t.dossier.comments : `${t.dossier.comments} · ${comments.length}`}
          aside={
            comments.length > 0 && (
              <button
                type="button"
                onClick={() => setOpen(allOpen ? new Set() : new Set(comments.map((c) => c.id)))}
                className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright"
              >
                {allOpen ? t.dossier.closeAll : t.dossier.openAll}
              </button>
            )
          }
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
              {comments.map((c) => (
                <CommentEntry
                  key={c.id}
                  comment={c}
                  open={open.has(c.id)}
                  active={implicated.has(c.id)}
                  onToggle={() => toggle(c.id)}
                />
              ))}
            </ol>
          </>
        )}
      </section>
    </>
  );
}
