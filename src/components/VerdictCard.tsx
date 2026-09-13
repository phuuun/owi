import React from 'react';
import { VerdictType } from '../types';
import { Quote, AlertTriangle, HelpCircle, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

interface VerdictCardProps {
  verdict: VerdictType;
  confidence: number;
  claimExtracted: string;
  topic?: string;
  retrievalEmpty: boolean;
}

interface VerdictConfig {
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  icon: React.ReactNode;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  confidence,
  claimExtracted,
  topic,
  retrievalEmpty,
}) => {
  const getVerdictConfig = (): VerdictConfig => {
    if (retrievalEmpty || verdict === 'UNVERIFIABLE') {
      return {
        label: 'TIDAK DAPAT DIVERIFIKASI',
        description:
          'Penelusuran basis data terbuka tidak menemukan arsip atau bukti independen yang cukup untuk membuktikan maupun membantah klaim ini.',
        badgeBg: 'bg-neutral-900',
        badgeText: 'text-neutral-300',
        badgeBorder: 'border-neutral-700/60',
        barColor: 'bg-neutral-600',
        icon: <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0" />,
      };
    }

    switch (verdict) {
      case 'TRUE':
        return {
          label: 'BENAR',
          description: 'Pernyataan ini terbukti selaras dengan dokumen resmi, data otoritatif, dan rujukan investigasi terverifikasi.',
          badgeBg: 'bg-emerald-500/10',
          badgeText: 'text-emerald-400',
          badgeBorder: 'border-emerald-500/25',
          barColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        };
      case 'FALSE':
        return {
          label: 'SALAH / DISINFORMASI',
          description: 'Pernyataan ini memuat data yang bertolak belakang dengan fakta teruji dan dibantah oleh berbagai arsip independen.',
          badgeBg: 'bg-rose-500/10',
          badgeText: 'text-rose-400',
          badgeBorder: 'border-rose-500/25',
          barColor: 'bg-rose-500',
          icon: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
        };
      case 'MISLEADING':
        return {
          label: 'MENYESATKAN',
          description: 'Pernyataan memadukan potongan fakta dengan konteks keliru atau menyajikan kesimpulan yang mendistorsi data riil.',
          badgeBg: 'bg-amber-500/10',
          badgeText: 'text-amber-400',
          badgeBorder: 'border-amber-500/25',
          barColor: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        };
      case 'OPINION':
        return {
          label: 'OPINI / PENILAIAN SUBJEKTIF',
          description: 'Pernyataan berbentuk evaluasi nilai atau pandangan subyektif yang tidak dapat diuji sebagai fakta tunggal absolut.',
          badgeBg: 'bg-indigo-500/10',
          badgeText: 'text-indigo-400',
          badgeBorder: 'border-indigo-500/25',
          barColor: 'bg-indigo-500',
          icon: <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />,
        };
      default:
        return {
          label: 'DALAM PENELAAHAN',
          description: 'Hasil penilaian membutuhkan penelusuran lebih mendalam.',
          badgeBg: 'bg-neutral-900',
          badgeText: 'text-neutral-400',
          badgeBorder: 'border-neutral-800',
          barColor: 'bg-neutral-700',
          icon: <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />,
        };
    }
  };

  const config = getVerdictConfig();
  const confidencePercent = Math.min(100, Math.max(0, Math.round(confidence * 100)));

  return (
    <div
      id="verdict-card"
      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl transition-all"
    >
      {/* Critical notice when retrieval is empty */}
      {retrievalEmpty && (
        <div
          id="retrieval-empty-notice"
          className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-xl text-neutral-300 text-xs leading-relaxed flex items-start gap-3"
        >
          <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white block">Ketiadaan Bukti Pembanding Terbuka</span>
            <p className="text-neutral-400">
              Mesin pencarian bukti tidak menemukan dokumen atau arsip cek fakta yang relevan secara langsung.
              Sistem tidak mengeluarkan vonis kepastian kebenaran.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Row: Topic & Claim ID */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {topic && (
            <span
              id="verdict-topic-tag"
              className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]"
            >
              Topik: {topic}
            </span>
          )}
          <span className="text-[11px] font-mono text-neutral-600 ml-auto">
            REF #VER-{Math.abs(claimExtracted.length * 137).toString(16).toUpperCase()}
          </span>
        </div>

        {/* Verdict Badge & Confidence Widget */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              id="verdict-badge"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
            >
              {config.icon}
              <span>{config.label}</span>
            </div>
          </div>

          {/* Apple-style Confidence Bar */}
          <div
            id="confidence-section"
            className={`sm:w-64 p-3.5 rounded-xl border ${
              retrievalEmpty
                ? 'bg-[#111114] border-white/[0.04] opacity-60'
                : 'bg-[#111114] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-400 text-[11px]">Keyakinan Model</span>
              <span
                id="confidence-percentage"
                className="font-mono text-xs font-semibold text-white"
              >
                {retrievalEmpty ? 'N/A' : `${confidencePercent}%`}
              </span>
            </div>

            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                id="confidence-bar-fill"
                className={`h-full transition-all duration-700 ease-out rounded-full ${
                  retrievalEmpty ? 'bg-neutral-600' : config.barColor
                }`}
                style={{ width: `${retrievalEmpty ? 10 : confidencePercent}%` }}
              />
            </div>
            {retrievalEmpty && (
              <span className="block mt-1.5 text-[10px] text-neutral-500">
                Skor tidak diterapkan karena bukti nihil
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed max-w-3xl">
          {config.description}
        </p>
      </div>

      {/* Extracted Claim Quote */}
      <div id="extracted-claim-box" className="pt-5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <Quote className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Klaim Inti yang Diekstraksi
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-white/[0.06]">
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
            "{claimExtracted}"
          </p>
        </div>
      </div>
    </div>
  );
};
