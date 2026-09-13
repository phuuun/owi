import React, { useState } from 'react';
import { ExplanationToken } from '../types';
import { ChevronDown, ChevronUp, Cpu, Info, BarChart2 } from 'lucide-react';

interface TokenExplanationProps {
  claimExtracted: string;
  tokens: ExplanationToken[];
}

export const TokenExplanation: React.FC<TokenExplanationProps> = ({
  claimExtracted,
  tokens,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!tokens || tokens.length === 0) {
    return null;
  }

  // Calculate warm / cool color styling for dark mode Apple aesthetic
  const getTokenStyle = (weight: number) => {
    const absWeight = Math.min(1, Math.abs(weight));
    const opacity = Math.max(0.12, absWeight * 0.45);

    if (weight >= 0) {
      // Warm tones (amber)
      return {
        backgroundColor: `rgba(245, 158, 11, ${opacity})`,
        color: '#fef3c7',
        borderColor: `rgba(245, 158, 11, ${Math.max(0.2, opacity * 1.2)})`,
      };
    } else {
      // Cool tones (sky blue)
      return {
        backgroundColor: `rgba(56, 189, 248, ${opacity})`,
        color: '#e0f2fe',
        borderColor: `rgba(56, 189, 248, ${Math.max(0.2, opacity * 1.2)})`,
      };
    }
  };

  return (
    <section
      id="token-explanation-section"
      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl transition-all"
    >
      {/* Collapsible Accordion Header (Closed by default) */}
      <button
        type="button"
        id="toggle-explanation-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#121215] border border-white/[0.08] flex items-center justify-center text-neutral-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Transparansi Model: Penjelasan Kontribusi Kata (LIME)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Melihat pembobotan pengaruh token kata terhadap klasifikasi sistem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="hidden sm:inline-block">
            {isOpen ? 'Sembunyikan' : 'Lihat'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-300" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div id="token-explanation-content" className="p-6 space-y-6 border-t border-white/[0.06]">
          {/* Explanation Legend */}
          <div className="p-4 bg-[#121215] border border-white/[0.06] rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-white">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Panduan Membaca Pembobotan Kata (LIME Attribution):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
              <div className="flex items-center gap-2.5">
                <span className="inline-block w-3.5 h-3.5 rounded-sm bg-amber-500/20 border border-amber-500/50" />
                <span>
                  <strong className="text-amber-300 font-medium">Warna Hangat (Oranye):</strong> Menopang fitur klaim.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="inline-block w-3.5 h-3.5 rounded-sm bg-sky-500/20 border border-sky-500/50" />
                <span>
                  <strong className="text-sky-300 font-medium">Warna Dingin (Biru):</strong> Menahan atau bertolak belakang.
                </span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 border-t border-white/[0.04] pt-2">
              Kepekatan warna sebanding dengan nilai mutlak bobot kontribusi (|weight|).
            </p>
          </div>

          {/* Render Extracted Claim with Highlighted Tokens */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Visualisasi Bobot pada Kalimat Klaim:
            </div>
            <div
              id="highlighted-tokens-container"
              className="p-5 bg-[#121215] border border-white/[0.06] rounded-xl leading-loose text-sm text-white flex flex-wrap gap-2 items-center"
            >
              {tokens.map((t, idx) => {
                const style = getTokenStyle(t.weight);
                const weightDisplay = t.weight > 0 ? `+${t.weight.toFixed(2)}` : t.weight.toFixed(2);
                return (
                  <span
                    key={idx}
                    id={`token-badge-${idx}`}
                    title={`Kata: "${t.token}" | Bobot LIME: ${weightDisplay}`}
                    style={style}
                    className="inline-flex items-baseline px-2.5 py-1 rounded-lg border text-xs font-medium transition-all hover:scale-105 cursor-help"
                  >
                    <span>{t.token}</span>
                    <span className="ml-1.5 text-[9px] font-mono opacity-60">
                      {weightDisplay}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Detailed Attribution Table for Auditability */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Tabel Rincian Fitur Utama:</span>
            </div>
            <div className="max-h-48 overflow-y-auto border border-white/[0.06] rounded-xl bg-[#121215]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181c] border-b border-white/[0.06] text-neutral-400 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3.5 font-medium">Token / Kata</th>
                    <th className="py-2.5 px-3.5 font-medium">Pengaruh</th>
                    <th className="py-2.5 px-3.5 font-medium text-right font-mono">Nilai Bobot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[...tokens]
                    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                    .map((t, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3.5 font-medium text-white">
                          {t.token}
                        </td>
                        <td className="py-2 px-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              t.weight >= 0
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                            }`}
                          >
                            {t.weight >= 0 ? 'Positif' : 'Negatif'}
                          </span>
                        </td>
                        <td className="py-2 px-3.5 text-right font-mono text-neutral-300">
                          {t.weight > 0 ? `+${t.weight.toFixed(3)}` : t.weight.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
