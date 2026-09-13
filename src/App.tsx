import React, { useState, useEffect } from 'react';
import { ClaimInput } from './components/ClaimInput';
import { VerdictCard } from './components/VerdictCard';
import { EvidenceList } from './components/EvidenceList';
import { EntityChips } from './components/EntityChips';
import { TokenExplanation } from './components/TokenExplanation';
import { HistorySidebar } from './components/HistorySidebar';
import { ResultSkeleton } from './components/ResultSkeleton';
import { analyzeClaim, MOCK, MOCK_DATABASE } from './lib/api';
import { AnalyzeResponse, SessionHistoryEntry } from './types';
import {
  History,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // Application state
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<AnalyzeResponse | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Initialize with sample case to demonstrate full layout on initial load
  useEffect(() => {
    const initialCase = MOCK_DATABASE['misleading-claim'];
    const initialText =
      'Pemerintah secara resmi menghapus total BBM bersubsidi jenis Pertalite mulai bulan depan demi mengalihkan seluruh anggarannya ke program Makan Bergizi Gratis.';
    const initialId = 'init-1';

    const initialEntry: SessionHistoryEntry = {
      id: initialId,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      inputText: initialText,
      response: initialCase,
    };

    setCurrentResponse(initialCase);
    setInputText(initialText);
    setActiveHistoryId(initialId);
    setHistory([initialEntry]);
  }, []);

  const handleAnalyze = async (textToAnalyze: string) => {
    setIsLoading(true);
    setError(null);
    setInputText(textToAnalyze);

    try {
      const response = await analyzeClaim({ text: textToAnalyze });
      setCurrentResponse(response);

      // Add to session history (in-memory only)
      const newEntry: SessionHistoryEntry = {
        id: `check-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        inputText: textToAnalyze,
        response,
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 19)]);
      setActiveHistoryId(newEntry.id);
    } catch (err: any) {
      setError(err.message || 'Terjadi kendala teknis saat memproses penelusuran klaim.');
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

  // Quick switcher for all 5 specific mock cases required by prompt
  const handleLoadMockCase = (caseKey: keyof typeof MOCK_DATABASE) => {
    let claimText = '';
    switch (caseKey) {
      case 'false-claim':
        claimText =
          'Kementerian Keuangan mengumumkan utang luar negeri Indonesia meroket Rp20.000 triliun dalam sebulan akibat pembiayaan langsung infrastruktur IKN Nusantara.';
        break;
      case 'true-claim':
        claimText =
          'Mahkamah Konstitusi mengabulkan sebagian uji materi Pasal 169 huruf q UU Pemilu, sehingga syarat usia capres-cawapres menjadi minimal 40 tahun atau pernah/sedang menduduki jabatan yang dipilih melalui pemilihan umum termasuk pilkada.';
        break;
      case 'misleading-claim':
        claimText =
          'Pemerintah secara resmi menghapus total BBM bersubsidi jenis Pertalite mulai bulan depan demi mengalihkan seluruh anggarannya ke program Makan Bergizi Gratis.';
        break;
      case 'opinion-claim':
        claimText =
          'Kebijakan hilirisasi mineral tambang di Indonesia merupakan kegagalan strategis terbesar yang hanya menguntungkan oligarki dan merusak kedaulatan lingkungan masa depan.';
        break;
      case 'unverifiable-claim':
        claimText =
          'Beredar kabar bahwa ketua umum partai koalisi menggelar pertemuan rahasia dini hari di pulau terpencil Kepulauan Seribu untuk menetapkan jatah menteri 2029.';
        break;
      default:
        claimText = MOCK_DATABASE[caseKey].claim_extracted;
    }

    handleAnalyze(claimText);
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Apple Minimalist Frosted Navbar */}
      <header className="border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm tracking-tight group-hover:bg-neutral-200 transition-colors">
                o
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg tracking-tight text-white leading-none">
                  owi
                </span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase hidden sm:inline">
                  Verifikasi Klaim
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* API Status Badge */}
            <div
              id="mock-status-indicator"
              title="Status API (src/lib/api.ts)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.08] bg-[#111114] text-[11px] text-neutral-400 font-mono"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${MOCK ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{MOCK ? 'Mock Mode' : 'Live API'}</span>
            </div>

            {currentResponse && (
              <button
                type="button"
                id="reset-check-btn"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Klaim Baru</span>
              </button>
            )}

            <button
              type="button"
              id="toggle-history-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#141417] hover:bg-[#1d1d22] border border-white/[0.08] text-white rounded-full transition-all cursor-pointer shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-neutral-400" />
              <span>Riwayat</span>
              {history.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/[0.1] text-[10px] font-mono text-neutral-300">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Primary Evaluation Column */}
        <main className="flex-1 w-full space-y-8">
          {/* Apple Minimalist Hero Intro */}
          <div className="space-y-4 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 block">
              Instrumen Pemeriksaan Publik
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Verifikasi Klaim Politik.
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed font-normal">
              Ekstraksi pernyataan inti, pencarian bukti dari repositori independen, identifikasi entitas terkait, serta visualisasi kontribusi kata secara transparan.
            </p>

            {/* Quick 5-Case Test Bar (Apple segmented pills) */}
            <div className="pt-2">
              <div className="text-[11px] text-neutral-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-neutral-400" />
                <span>Uji 5 Skenario Standar:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadMockCase('false-claim')}
                  className="px-3 py-1 text-xs rounded-full bg-[#111114] border border-white/[0.06] text-neutral-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all cursor-pointer font-medium"
                >
                  1. Salah (3 Rujukan)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadMockCase('true-claim')}
                  className="px-3 py-1 text-xs rounded-full bg-[#111114] border border-white/[0.06] text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all cursor-pointer font-medium"
                >
                  2. Benar (MK)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadMockCase('misleading-claim')}
                  className="px-3 py-1 text-xs rounded-full bg-[#111114] border border-white/[0.06] text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all cursor-pointer font-medium"
                >
                  3. Menyesatkan (BBM)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadMockCase('opinion-claim')}
                  className="px-3 py-1 text-xs rounded-full bg-[#111114] border border-white/[0.06] text-neutral-300 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all cursor-pointer font-medium"
                >
                  4. Opini (Nikel)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadMockCase('unverifiable-claim')}
                  className="px-3 py-1 text-xs rounded-full bg-[#111114] border border-white/[0.06] text-neutral-300 hover:text-white hover:border-white/30 hover:bg-white/[0.08] transition-all cursor-pointer font-medium"
                >
                  5. Bukti Kosong (Nihil)
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Input View */}
          <ClaimInput
            onSubmit={handleAnalyze}
            isLoading={isLoading}
            initialText={inputText}
          />

          {/* Technical Error Notice */}
          {error && (
            <div
              id="analysis-error-banner"
              className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-rose-300 text-xs space-y-1"
            >
              <div className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-400" />
                <span>Kendala Pemrosesan</span>
              </div>
              <p className="text-neutral-400">{error}</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && <ResultSkeleton />}

          {/* Section 2: Result View */}
          {!isLoading && currentResponse && (
            <div id="claim-assessment-results" className="space-y-6 pt-2">
              {/* Order 1: Verdict badge + confidence bar + Extracted claim quote */}
              <VerdictCard
                verdict={currentResponse.verdict}
                confidence={currentResponse.confidence}
                claimExtracted={currentResponse.claim_extracted}
                topic={currentResponse.topic}
                retrievalEmpty={currentResponse.retrieval_empty}
              />

              {/* Order 2: Evidence List (Most important section with high visual weight) */}
              <EvidenceList
                evidence={currentResponse.evidence}
                retrievalEmpty={currentResponse.retrieval_empty}
              />

              {/* Order 3: Entities called (with methodology notice) */}
              <EntityChips entities={currentResponse.entities} />

              {/* Order 4: Token Explanation (LIME token weights, warm/cool highlights, collapsible) */}
              <TokenExplanation
                claimExtracted={currentResponse.claim_extracted}
                tokens={currentResponse.explanation_tokens}
              />
            </div>
          )}
        </main>

        {/* History Sidebar */}
        <HistorySidebar
          history={history}
          activeId={activeHistoryId}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Persistent Civic Footer Disclaimer */}
      <footer
        id="persistent-civic-footer"
        className="mt-20 border-t border-white/[0.08] bg-[#050507] py-10 text-xs text-neutral-500 font-sans"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="p-5 bg-[#0a0a0c] border border-white/[0.06] rounded-2xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-medium text-white text-xs block">
                  Disclaimer Publik & Integritas Alat Bantu:
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  <strong className="text-white font-medium">owi</strong> adalah instrumen komputasi berbantuan kecerdasan buatan untuk menguji konsistensi pernyataan terhadap repositori rujukan terbuka.{' '}
                  <span className="text-white font-medium">Bukan merupakan vonis hukum, penentu kebenaran mutlak, atau ketetapan peradilan</span>.
                  Pengguna dianjurkan meninjau langsung sumber rujukan tertera sebelum menarik kesimpulan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-600 pt-1">
            <span>
              owi — Pemeriksa Klaim Politik Indonesia (REST POST /api/analyze).
            </span>
            <span className="font-mono">
              In-Memory Session Architecture
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
