import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import type { Evidence, SourceArticle } from '../types';
import { formatDate, hostname } from '../lib/format';
import { STANCE, sourceTypeLabel, tone } from '../lib/verdict';
import { SectionHeading } from './SectionHeading';

/** Evidence picked elsewhere on the page. `seq` changes on every pick, so re-picking the same item still scrolls. */
export interface EvidenceFocus {
  id: string;
  seq: number;
}

// One black bar per text line: matches the snippet's leading-7 (28px).
const REDACTION_LINES =
  'repeating-linear-gradient(to bottom, transparent 0 5px, var(--color-redaction) 5px 23px, transparent 23px 28px)';

function ArticleParagraph({ text, quote }: { text: string; quote: string }) {
  const at = quote ? text.indexOf(quote) : -1;
  if (at < 0) return <p>{text}</p>;

  return (
    <p>
      {text.slice(0, at)}
      <span className="mr-1.5 inline-block rounded-[2px] bg-lens px-1 align-middle font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
        Klaim
      </span>
      <motion.mark
        initial={{ backgroundSize: '0% 100%' }}
        whileInView={{ backgroundSize: '100% 100%' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
        className="box-decoration-clone bg-transparent bg-linear-to-r from-lens/20 to-lens/20 bg-no-repeat px-0.5 text-ink-bright shadow-[inset_0_-2px_0_var(--color-lens)]"
      >
        {quote}
      </motion.mark>
      {text.slice(at + quote.length)}
    </p>
  );
}

function ArticleExcerpt({ article }: { article: SourceArticle }) {
  return (
    <section aria-labelledby="article-title">
      <SectionHeading
        id="article-title"
        title="Artikel sumber"
        aside={
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-ink-muted transition-colors hover:text-ink-bright"
          >
            {hostname(article.url)}
            <ArrowUpRight className="size-3.5" />
          </a>
        }
      />
      <div className="paper mt-6 rounded-sm border border-line px-5 py-6 sm:px-10 sm:py-9">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">
          {article.outlet} · {formatDate(article.published)}
        </p>
        <h3 className="mt-3 max-w-[40ch] text-2xl font-semibold leading-tight text-balance text-ink-bright sm:text-3xl">
          {article.headline}
        </h3>
        <div className="mt-6 max-w-[68ch] space-y-4 text-[17px] leading-[1.75] text-ink">
          {article.paragraphs.map((p, i) => (
            <ArticleParagraph key={i} text={p} quote={article.claim_quote} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface DossierEntryProps {
  item: Evidence;
  index: number;
  open: boolean;
  active: boolean;
  onToggle: () => void;
}

function DossierEntry({ item, index, open, active, onToggle }: DossierEntryProps) {
  const stance = STANCE[item.stance];
  const snippetId = `snippet-${item.id}`;

  return (
    <li
      id={`dossier-${item.id}`}
      style={tone(stance.color)}
      className={`paper scroll-mt-24 rounded-sm border border-l-4 border-line border-l-(--tone) px-5 py-5 transition-shadow duration-300 sm:px-6 ${
        active ? 'ring-1 ring-(--tone)' : ''
      }`}
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        <span className="text-(--tone)">
          Bukti {String(index + 1).padStart(2, '0')} · {stance.label}
        </span>
        <span>{sourceTypeLabel(item.source_type)}</span>
        <time dateTime={item.published}>{formatDate(item.published)}</time>
      </p>

      <h3 className="mt-2 text-lg font-medium leading-snug text-ink-bright">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="decoration-1 underline-offset-4 hover:underline">
          {item.title}
          <ArrowUpRight className="ml-1 inline size-4 text-ink-muted" />
        </a>
      </h3>
      <p className="mt-1 text-sm text-ink-muted">
        {item.source} · {hostname(item.url)}
      </p>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={snippetId}
        className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright"
      >
        {open ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {open ? 'Tutup redaksi' : 'Buka redaksi'}
      </button>

      <div className="relative mt-3 max-w-[72ch]">
        <motion.p
          id={snippetId}
          initial={false}
          animate={{ filter: open ? 'blur(0px)' : 'blur(6px)' }}
          transition={{ duration: 0.4 }}
          className={`text-sm leading-7 text-ink ${open ? '' : 'invisible'}`}
        >
          {item.snippet}
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
              <span className="absolute top-[7px] right-2 font-mono text-[10px] tracking-[0.3em] text-ink-muted/60">DISENSOR</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

interface EvidenceBreakdownProps {
  article: SourceArticle | null;
  evidence: Evidence[];
  retrievalEmpty: boolean;
  focus: EvidenceFocus | null;
}

export function EvidenceBreakdown({ article, evidence, retrievalEmpty, focus }: EvidenceBreakdownProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const empty = retrievalEmpty || evidence.length === 0;
  const allOpen = !empty && evidence.every((e) => open.has(e.id));

  // Picking evidence on the board or timeline opens its file and brings it into view.
  useEffect(() => {
    if (!focus) return;
    setOpen((prev) => new Set(prev).add(focus.id));
    document
      .getElementById(`dossier-${focus.id}`)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }, [focus, reduceMotion]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <>
      {article && <ArticleExcerpt article={article} />}

      <section aria-labelledby="dossier-title">
        <SectionHeading
          id="dossier-title"
          title={empty ? 'Berkas bukti' : `Berkas bukti · ${evidence.length}`}
          aside={
            !empty && (
              <button
                type="button"
                onClick={() => setOpen(allOpen ? new Set() : new Set(evidence.map((e) => e.id)))}
                className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright"
              >
                {allOpen ? 'Tutup semua' : 'Buka semua redaksi'}
              </button>
            )
          }
        />

        {empty ? (
          <div className="paper mt-6 rounded-sm border border-dashed border-line-strong p-6">
            <div aria-hidden="true" className="space-y-2">
              {['w-11/12', 'w-8/12', 'w-10/12'].map((w) => (
                <div key={w} className={`redaction h-4 ${w}`} />
              ))}
            </div>
            <p className="mt-5 text-ink">Tidak ada bukti relevan yang ditemukan di arsip.</p>
            <p className="mt-1 text-sm text-ink-muted">OWI tidak menebak. Tanpa bukti, klaim ini dibiarkan tanpa vonis.</p>
          </div>
        ) : (
          <ol className="mt-6 space-y-4">
            {evidence.map((item, i) => (
              <DossierEntry
                key={item.id}
                item={item}
                index={i}
                open={open.has(item.id)}
                active={focus?.id === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
