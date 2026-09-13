import { useState } from 'react';
import { History } from 'lucide-react';
import { ClaimInput } from './components/ClaimInput';
import { VerdictCard } from './components/VerdictCard';
import { EvidenceList } from './components/EvidenceList';
import { EntityChips } from './components/EntityChips';
import { TokenExplanation } from './components/TokenExplanation';
import { HistorySidebar } from './components/HistorySidebar';
import { ResultSkeleton } from './components/ResultSkeleton';
import { analyzeClaim, MOCK, SCENARIOS } from './lib/api';
import type { AnalyzeResponse, SessionHistoryEntry } from './types';

const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<AnalyzeResponse | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAnalyze = async (textToAnalyze: string) => {
    setIsLoading(true);
    setError(null);
    setInputText(textToAnalyze);

    try {
      const response = await analyzeClaim({ text: textToAnalyze });
      setCurrentResponse(response);

      // Session history is in-memory only
      const newEntry: SessionHistoryEntry = {
        id: `check-${Date.now()}`,
        timestamp: now(),
        inputText: textToAnalyze,
        response,
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 19)]);
      setActiveHistoryId(newEntry.id);
    } catch (err) {
      setError((err instanceof Error && err.message) || 'Terjadi kendala teknis saat memproses klaim.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (entry: SessionHistoryEntry) => {
    setInputText(entry.inputText);
    setCurrentResponse(entry.response);
    setActiveHistoryId(entry.id);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setActiveHistoryId(null);
  };

  const handleReset = () => {
    setInputText('');
    setCurrentResponse(null);
    setActiveHistoryId(null);
    setError(null);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-12 max-w-2xl items-center justify-between px-6">
          <button type="button" onClick={handleReset} className="text-lg font-semibold tracking-tight">
            owi
          </button>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Riwayat"
            className="text-muted transition-colors hover:text-fg"
          >
            <History className="size-5" strokeWidth={1.5} />
          </button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pt-24 pb-32">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">Periksa klaim.</h1>
        <p className="mt-4 text-xl text-muted">Bandingkan pernyataan politik dengan bukti terbuka.</p>

        <ClaimInput value={inputText} onChange={setInputText} onSubmit={handleAnalyze} isLoading={isLoading} />

        {error && (
          <p role="alert" className="mt-8 text-red-500">
            {error}
          </p>
        )}

        {isLoading && <ResultSkeleton />}

        {!isLoading && currentResponse && (
          <div className="mt-24 space-y-20">
            <VerdictCard response={currentResponse} />
            <EvidenceList evidence={currentResponse.evidence} retrievalEmpty={currentResponse.retrieval_empty} />
            <EntityChips entities={currentResponse.entities} />
            <TokenExplanation tokens={currentResponse.explanation_tokens} />
          </div>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-2xl space-y-3 px-6 py-10 text-xs leading-relaxed text-muted">
          <p>owi adalah alat bantu, bukan vonis hukum atau penentu kebenaran. Selalu periksa sumber aslinya.</p>
          <p>Sentimen kritis terhadap tokoh, partai, atau lembaga bukan indikator hoaks.</p>
          <details className="pt-3">
            <summary className="w-fit hover:text-fg">Pengembang{MOCK && ' · mode mock'}</summary>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    handleAnalyze(s.text);
                  }}
                  className="hover:text-fg disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      </footer>

      <HistorySidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
