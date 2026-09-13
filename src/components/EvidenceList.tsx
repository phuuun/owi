import React from 'react';
import { EvidenceItem, EvidenceStance } from '../types';
import { ArrowUpRight, Calendar, FileSearch } from 'lucide-react';

interface EvidenceListProps {
  evidence: EvidenceItem[];
  retrievalEmpty: boolean;
}

interface StanceStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

const getStanceStyle = (stance: EvidenceStance): StanceStyle => {
  switch (stance) {
    case 'SUPPORTS':
      return {
        label: 'MENDUKUNG KLAIM',
        badgeBg: 'bg-emerald-500/10',
        badgeText: 'text-emerald-400',
        badgeBorder: 'border-emerald-500/20',
        dotColor: 'bg-emerald-400',
      };
    case 'REFUTES':
      return {
        label: 'MEMBANTAH KLAIM',
        badgeBg: 'bg-rose-500/10',
        badgeText: 'text-rose-400',
        badgeBorder: 'border-rose-500/20',
        dotColor: 'bg-rose-400',
      };
    case 'UNRELATED':
    default:
      return {
        label: 'KONTEKS / TIDAK LANGSUNG',
        badgeBg: 'bg-neutral-800/80',
        badgeText: 'text-neutral-400',
        badgeBorder: 'border-neutral-700/60',
        dotColor: 'bg-neutral-500',
      };
  }
};

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidence,
  retrievalEmpty,
}) => {
  return (
    <section id="evidence-section" className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Arsip Bukti & Rujukan
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Daftar Bukti Terverifikasi
          </h2>
        </div>
        <span className="text-xs text-neutral-400 font-mono">
          {retrievalEmpty || evidence.length === 0
            ? '0 rujukan ditemukan'
            : `${evidence.length} dokumen rujukan teridentifikasi`}
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
        Rujukan bukti yang dihimpun secara otomatis dari arsip pemeriksa fakta, putusan lembaga resmi, dan media terakreditasi independen.
      </p>

      {/* Empty State when retrieval_empty is true or evidence is [] */}
      {retrievalEmpty || evidence.length === 0 ? (
        <div
          id="empty-evidence-card"
          className="p-10 bg-[#0a0a0c] border border-dashed border-white/[0.1] rounded-2xl text-center space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#141418] border border-white/[0.08] flex items-center justify-center text-neutral-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Tidak Ada Bukti Terverifikasi Ditemukan
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Sistem perayapan bukti tidak menemukan artikel periksa fakta atau dokumen resmi yang memverifikasi klaim ini secara langsung. Status dinyatakan netral tanpa penerbitan vonis.
          </p>
        </div>
      ) : (
        /* Primary Evidence Cards List */
        <div className="space-y-4 pt-1">
          {evidence.map((item, idx) => {
            const stanceConfig = getStanceStyle(item.stance);
            return (
              <article
                key={idx}
                id={`evidence-item-${idx}`}
                className="bg-[#0a0a0c] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl p-6 sm:p-7 transition-all shadow-xl space-y-4 group"
              >
                {/* Meta row: Source, Published date, Stance Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-md">
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.published}</span>
                    </span>
                  </div>

                  {/* Stance Chip */}
                  <div
                    id={`stance-chip-${idx}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${stanceConfig.badgeBg} ${stanceConfig.badgeText} ${stanceConfig.badgeBorder}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${stanceConfig.dotColor}`} />
                    <span>{stanceConfig.label}</span>
                  </div>
                </div>

                {/* Article Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight leading-snug group-hover:text-neutral-100 transition-colors">
                  {item.title}
                </h3>

                {/* Snippet Quote */}
                <div className="bg-[#121215] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                    "{item.snippet}"
                  </p>
                </div>

                {/* Footer with External Link */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-600 font-mono">
                    Dokumen #{idx + 1}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>Buka Rujukan Asli</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
