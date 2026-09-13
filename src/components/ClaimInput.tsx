import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { EXAMPLE_CLAIMS } from '../lib/api';

interface ClaimInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
}

const MAX_CHARS = 1000;

export const ClaimInput: React.FC<ClaimInputProps> = ({
  onSubmit,
  isLoading,
  initialText = '',
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setValidationError('Silakan masukkan teks klaim atau kutipan berita terlebih dahulu.');
      return;
    }
    if (trimmed.length < 10) {
      setValidationError('Teks terlalu pendek. Masukkan kalimat klaim minimal 10 karakter.');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectExample = (text: string) => {
    setInputText(text);
    setValidationError(null);
  };

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div
      id="claim-input-container"
      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 sm:p-8 transition-all hover:border-white/[0.12] shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Pemeriksaan Klaim
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            Masukkan narasi, rilis pers, atau pernyataan politik untuk diverifikasi terhadap rujukan independen.
          </p>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline-block">
          ⌘ + Enter untuk kirim
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            id="claim-textarea"
            rows={5}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Tempelkan pernyataan pejabat, narasi media, atau klaim politik di sini..."
            className={`w-full p-4 rounded-xl bg-[#111114] border text-white font-sans text-base leading-relaxed placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-all resize-y min-h-[130px] ${
              isOverLimit ? 'border-rose-500/80 focus:ring-rose-500/30' : 'border-white/[0.07]'
            } ${isLoading ? 'opacity-40 cursor-not-allowed' : ''}`}
          />

          <div className="flex items-center justify-between mt-2.5 px-1">
            <span
              id="char-counter"
              className={`text-xs font-mono transition-colors ${
                isOverLimit ? 'text-rose-400 font-semibold' : 'text-neutral-400'
              }`}
            >
              {charCount} / {MAX_CHARS}
            </span>

            {inputText && !isLoading && (
              <button
                type="button"
                id="clear-claim-btn"
                onClick={() => {
                  setInputText('');
                  setValidationError(null);
                }}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Bersihkan
              </button>
            )}
          </div>
        </div>

        {validationError && (
          <div
            id="claim-validation-error"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-xl text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            id="submit-claim-btn"
            disabled={isLoading || !inputText.trim() || isOverLimit}
            className="inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-medium text-sm rounded-full transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.12)] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <>
                <span>Periksa</span>
                <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3 Clickable Example Claims */}
      <div id="example-claims-section" className="mt-8 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Contoh Klaim Teruji
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EXAMPLE_CLAIMS.map((example) => (
            <button
              key={example.id}
              id={`example-btn-${example.id}`}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectExample(example.text)}
              className="text-left p-3.5 rounded-xl bg-[#121215] border border-white/[0.06] hover:border-white/20 hover:bg-[#17171c] transition-all group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                  {example.category}
                </span>
                <ArrowUpRight className="w-3 h-3 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs text-neutral-300 font-sans line-clamp-3 leading-relaxed group-hover:text-white transition-colors">
                "{example.text}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
