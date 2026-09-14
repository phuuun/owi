import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CaseFileCard } from './components/CaseFileCard';
import { EvidenceBoard } from './components/EvidenceBoard';
import { EvidenceBreakdown, type EvidenceFocus } from './components/EvidenceBreakdown';
import { EvidenceTimeline } from './components/EvidenceTimeline';
import { FocusShift } from './components/FocusShift';
import { HistorySidebar } from './components/HistorySidebar';
import { Layout } from './components/Layout';
import { ModelInsights } from './components/ModelInsights';
import { ScanningPulse } from './components/ScanningPulse';
import { SearchInterrogation } from './components/SearchInterrogation';
import { SectionHeading } from './components/SectionHeading';
import { TokenExplanation } from './components/TokenExplanation';
import { factCheck, fetchSamples, toRequest } from './lib/api';
import { hostname } from './lib/format';
import type { CaseHistoryEntry, SampleCase } from './types';

const PAGE: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22, ease: 'easeIn' } },
};

const sampleValue = ({ input }: SampleCase) => ('url' in input ? input.url : input.text);
const cleanUrl = () => window.location.pathname + window.location.search;

export default function App() {
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<'text' | 'url' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [archive, setArchive] = useState<CaseHistoryEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [samples, setSamples] = useState<SampleCase[]>([]);
  const [focus, setFocus] = useState<EvidenceFocus | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const entrySeq = useRef(0);

  const current = archive.find((entry) => entry.id === openId) ?? null;

  useEffect(() => {
    const ctrl = new AbortController();
    // Only the mock server serves samples; without them the section stays hidden.
    fetchSamples(ctrl.signal).then(setSamples, () => {});
    return () => ctrl.abort();
  }, []);

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

  const investigate = async (raw: string) => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    const request = toRequest(raw);
    setDraft(raw);
    setError(null);
    setPending('url' in request ? 'url' : 'text');

    try {
      const response = await factCheck(request, ctrl.signal);
      const entry: CaseHistoryEntry = { id: `entry-${++entrySeq.current}`, openedAt: new Date().toISOString(), response };
      setArchive((prev) => [entry, ...prev].slice(0, 20));
      openCase(entry);
    } catch (err) {
      if (!ctrl.signal.aborted) setError(err instanceof Error ? err.message : 'Terjadi kendala teknis saat memproses klaim.');
    } finally {
      if (inflight.current === ctrl) {
        inflight.current = null;
        setPending(null);
      }
    }
  };

  const selectEvidence = (id: string) => setFocus((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }));

  return (
    <MotionConfig reducedMotion="user">
      <Layout archiveCount={archive.length} onHome={goHome} onOpenArchive={() => setArchiveOpen(true)}>
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0 })}>
          {current ? (
            <motion.div key={current.id} variants={PAGE} initial="initial" animate="animate" exit="exit" className="pt-8 sm:pt-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goHome}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright"
                >
                  <ArrowLeft className="size-4" />
                  Kasus baru
                </button>
                {current.response.input.kind === 'url' && (
                  <a
                    href={current.response.input.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 truncate font-mono text-xs text-ink-muted transition-colors hover:text-ink-bright"
                  >
                    {hostname(current.response.input.value)}
                  </a>
                )}
              </div>

              <FocusShift className="space-y-16">
                <CaseFileCard response={current.response} />
                <EvidenceBoard response={current.response} activeId={focus?.id ?? null} onSelect={selectEvidence} />
                <EvidenceBreakdown
                  article={current.response.article}
                  evidence={current.response.evidence}
                  retrievalEmpty={current.response.retrieval_empty}
                  focus={focus}
                />
                <EvidenceTimeline
                  timeline={current.response.timeline}
                  evidence={current.response.evidence}
                  activeId={focus?.id ?? null}
                  onSelect={selectEvidence}
                />
                <TokenExplanation tokens={current.response.explanation_tokens} />
              </FocusShift>
            </motion.div>
          ) : (
            <motion.div key="home" variants={PAGE} initial="initial" animate="animate" exit="exit" className="pt-14 sm:pt-24">
              {/* TODO: replace with the final tagline once it's decided. */}
              <h1 className="text-5xl leading-[1.02] font-bold tracking-tight text-balance text-ink-bright sm:text-7xl">
                Tagline soon to be updated.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink">
                Paste a political claim or a news link. OWI checks it against fact-check archives, official records and court
                rulings, then shows you the evidence.
              </p>

              <div className="mt-10">
                <SearchInterrogation value={draft} onChange={setDraft} onSubmit={investigate} isLoading={pending !== null} />
              </div>

              {error && (
                <div role="alert" className="paper mt-6 rounded-sm border border-l-4 border-line border-l-debunked px-5 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-debunked">Gangguan sinyal</p>
                  <p className="mt-1 text-ink">{error}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {pending ? (
                  <ScanningPulse key="scanning" mode={pending} />
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
                        title="Berkas contoh"
                        aside={
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                            Data tiruan dari server mock
                          </span>
                        }
                      />
                      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {samples.map((sample, i) => (
                          <motion.li key={sample.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                            <button
                              type="button"
                              onClick={() => investigate(sampleValue(sample))}
                              className="paper flex h-full w-full flex-col rounded-sm border border-line p-4 text-left transition-colors hover:border-lens/60"
                            >
                              <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                                <span className="text-lens">{sample.id}</span>
                                <span>{'url' in sample.input ? 'Tautan' : 'Teks'}</span>
                              </span>
                              <span className="mt-2 font-mono text-sm font-bold uppercase tracking-[0.15em] text-ink-bright">
                                {sample.label}
                              </span>
                              <span className="mt-1 line-clamp-2 text-sm text-ink-muted">
                                {'url' in sample.input ? hostname(sample.input.url) : sample.input.text}
                              </span>
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
