import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CaseFileCard } from './components/CaseFileCard';
import { ClusterBoard } from './components/ClusterBoard';
import { CommentDossier, type DossierFocus } from './components/CommentDossier';
import { DetectiveMascot } from './components/DetectiveMascot';
import { FilmCountdown } from './components/FilmCountdown';
import { FocusShift } from './components/FocusShift';
import { HistorySidebar } from './components/HistorySidebar';
import { Layout } from './components/Layout';
import { ModelInsights } from './components/ModelInsights';
import { NoirSkyline } from './components/NoirSkyline';
import { PostingTimeline } from './components/PostingTimeline';
import { SearchInterrogation } from './components/SearchInterrogation';
import { SectionHeading } from './components/SectionHeading';
import { analyze, fetchSamples } from './lib/api';
import { CLIMATE_COLOR, tone } from './lib/climate';
import { hostname } from './lib/format';
import { useI18n } from './lib/i18n';
import type { CaseHistoryEntry, SampleCase } from './types';

interface Iris {
  /** Circle center in px from the top of the view element. */
  cy: number;
  reduce: boolean;
}

const circle = (r: number, cy: number) => `circle(${r}px at 50% ${cy}px)`;

// Cartoon iris wipe between views: the old view closes to a point, the new one opens from it.
const PAGE: Variants = {
  initial: ({ cy, reduce }: Iris) => (reduce ? { opacity: 0 } : { clipPath: circle(0, cy) }),
  animate: ({ cy, reduce }: Iris) =>
    reduce
      ? { opacity: 1 }
      : {
          clipPath: [circle(0, cy), circle(2400, cy)],
          transition: { duration: 0.65, ease: [0.5, 0, 0.3, 1] },
          transitionEnd: { clipPath: 'none' },
        },
  exit: ({ cy, reduce }: Iris) =>
    reduce
      ? { opacity: 0 }
      : { clipPath: [circle(2400, cy), circle(0, cy)], transition: { duration: 0.45, ease: [0.6, 0, 0.8, 0.4] } },
};

const cleanUrl = () => window.location.pathname + window.location.search;

export default function App() {
  const { lang, t } = useI18n();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archive, setArchive] = useState<CaseHistoryEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [samples, setSamples] = useState<SampleCase[]>([]);
  const [focus, setFocus] = useState<DossierFocus | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const entrySeq = useRef(0);

  const current = archive.find((entry) => entry.id === openId) ?? null;

  const reduceMotion = useReducedMotion();
  // Center the iris on the visible screen. Views start below the 56px header, and
  // the entering view opens after the scroll has been reset to the top.
  const iris = (entering: boolean): Iris => ({
    reduce: Boolean(reduceMotion),
    cy: (entering ? 0 : window.scrollY) + window.innerHeight / 2 - 56,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    // Only the mock server serves samples; without them the section stays hidden.
    fetchSamples(lang, ctrl.signal).then(setSamples, () => {});
    return () => ctrl.abort();
  }, [lang]);

  // A report carries prose the server wrote — the topic, each finding, each
  // cluster's name — so a reading fetched in the other language is refreshed
  // when it is on screen. The language guard is what stops this from looping.
  useEffect(() => {
    if (!current || current.lang === lang) return;
    const ctrl = new AbortController();
    const { id } = current;
    analyze(current.response.input.value, lang, ctrl.signal).then(
      (response) => setArchive((prev) => prev.map((entry) => (entry.id === id ? { ...entry, lang, response } : entry))),
      () => {},
    );
    return () => ctrl.abort();
  }, [lang, current]);

  // Each opened report is a history entry, so Back returns to the interrogation room.
  useEffect(() => {
    if (window.location.hash) window.history.replaceState(null, '', cleanUrl());
    const onPop = (e: PopStateEvent) => {
      setOpenId((e.state as { entryId?: string } | null)?.entryId ?? null);
      setFocus(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openCase = (entry: CaseHistoryEntry) => {
    setOpenId(entry.id);
    setFocus(null);
    window.history.pushState({ entryId: entry.id }, '', `#${entry.response.case_id}`);
  };

  const goHome = () => {
    if (!openId) return;
    setOpenId(null);
    window.history.pushState(null, '', cleanUrl());
  };

  const investigate = async (url: string) => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setDraft(url);
    setError(null);
    setPending(true);

    try {
      const response = await analyze(url, lang, ctrl.signal);
      const entry: CaseHistoryEntry = {
        id: `entry-${++entrySeq.current}`,
        openedAt: new Date().toISOString(),
        lang,
        response,
      };
      setArchive((prev) => [entry, ...prev].slice(0, 20));
      openCase(entry);
    } catch (err) {
      if (!ctrl.signal.aborted) {
        setError(err instanceof Error ? err.message : t.home.errorFallback);
      }
    } finally {
      if (inflight.current === ctrl) {
        inflight.current = null;
        setPending(false);
      }
    }
  };

  const selectFocus = (id: string) => setFocus((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }));

  return (
    <MotionConfig reducedMotion="user">
      <Layout archiveCount={archive.length} onHome={goHome} onOpenArchive={() => setArchiveOpen(true)}>
        <AnimatePresence mode="wait" custom={iris(false)} onExitComplete={() => window.scrollTo({ top: 0 })}>
          {current ? (
            <motion.div
              key={current.id}
              custom={iris(true)}
              variants={PAGE}
              initial="initial"
              animate="animate"
              exit="exit"
              className="pt-8 sm:pt-10"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={goHome} className="btn">
                  <ArrowLeft className="size-4" />
                  {t.home.newCase}
                </button>
                <a
                  href={current.response.input.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate font-mono text-xs text-ink-muted transition-colors hover:text-ink-bright"
                >
                  {hostname(current.response.input.value)}
                </a>
              </div>

              <FocusShift className="space-y-16">
                <CaseFileCard response={current.response} />
                <ClusterBoard response={current.response} activeId={focus?.id ?? null} onSelect={selectFocus} />
                <CommentDossier response={current.response} focus={focus} onSelectSignal={selectFocus} />
                <PostingTimeline timeline={current.response.timeline} />
              </FocusShift>
            </motion.div>
          ) : (
            <motion.div
              key="home"
              custom={iris(true)}
              variants={PAGE}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative isolate pt-14 sm:pt-24"
            >
              <NoirSkyline />
              <DetectiveMascot mode={pending ? 'searching' : 'idle'} className="absolute top-8 right-0 hidden w-52 lg:block xl:w-60" />

              <h1 className="text-5xl leading-[1.02] font-bold tracking-tight text-balance text-ink-bright sm:text-7xl lg:max-w-2xl">
                {t.home.tagline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink">{t.home.intro}</p>

              <div className="mt-10">
                <SearchInterrogation value={draft} onChange={setDraft} onSubmit={investigate} isLoading={pending} />
              </div>

              {error && (
                <div role="alert" className="paper mt-6 rounded-sm border border-l-4 border-line border-l-debunked px-5 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-debunked">{t.home.errorTitle}</p>
                  <p className="mt-1 text-ink">{error}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {pending ? (
                  <FilmCountdown key="countdown" />
                ) : (
                  samples.length > 0 && (
                    <motion.section
                      key="samples"
                      aria-labelledby="samples-title"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-14"
                    >
                      <SectionHeading
                        id="samples-title"
                        title={t.home.samplesTitle}
                        aside={
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                            {t.home.samplesAside}
                          </span>
                        }
                      />
                      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {samples.map((sample, i) => (
                          <motion.li key={sample.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                            <button
                              type="button"
                              onClick={() => investigate(sample.url)}
                              style={tone(CLIMATE_COLOR[sample.climate])}
                              className="paper flex h-full w-full flex-col rounded-sm border border-line p-4 text-left transition-colors hover:border-lens/60"
                            >
                              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-lens">{sample.id}</span>
                              <span className="mt-2 font-mono text-sm font-bold uppercase tracking-[0.15em] text-(--tone)">
                                {sample.label}
                              </span>
                              <span className="mt-2 text-sm leading-relaxed text-ink-muted">{sample.note}</span>
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.section>
                  )
                )}
              </AnimatePresence>

              <ModelInsights />
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>

      <HistorySidebar
        history={archive}
        activeId={openId}
        onSelect={openCase}
        onClear={() => {
          setArchive([]);
          goHome();
        }}
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
      />
    </MotionConfig>
  );
}
