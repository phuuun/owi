import React from 'react';
import { SessionHistoryEntry, VerdictType } from '../types';
import { History, X, Clock, ChevronRight, Trash2 } from 'lucide-react';

interface HistorySidebarProps {
  history: SessionHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: SessionHistoryEntry) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const getVerdictBadge = (verdict: VerdictType, retrievalEmpty: boolean) => {
  if (retrievalEmpty || verdict === 'UNVERIFIABLE') {
    return {
      label: 'NIHIL',
      badge: 'bg-neutral-900 text-neutral-400 border-neutral-700/60',
    };
  }

  switch (verdict) {
    case 'TRUE':
      return {
        label: 'BENAR',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    case 'FALSE':
      return {
        label: 'SALAH',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      };
    case 'MISLEADING':
      return {
        label: 'MENYESATKAN',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    case 'OPINION':
      return {
        label: 'OPINI',
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      };
    default:
      return {
        label: 'NETRAL',
        badge: 'bg-neutral-900 text-neutral-400 border-neutral-800',
      };
  }
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  activeId,
  onSelect,
  onClear,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="history-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        id="history-sidebar"
        className={`fixed lg:sticky top-0 right-0 h-full lg:h-[calc(100vh-2rem)] w-80 max-w-[85vw] bg-[#070709] border-l border-white/[0.08] z-50 lg:z-10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } ${isOpen ? 'block' : 'hidden lg:flex'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2 text-white">
            <History className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Riwayat Sesi
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-neutral-300 font-mono">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                id="clear-history-btn"
                onClick={onClear}
                title="Hapus riwayat sesi ini"
                className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              id="close-history-mobile-btn"
              onClick={onClose}
              className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Note: in-memory only as required */}
        <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] text-[10px] text-neutral-500 font-sans">
          <span>In-memory saja. Otomatis reset saat refresh.</span>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-neutral-600">
              <Clock className="w-7 h-7 stroke-1 mb-2" />
              <p className="text-xs text-neutral-500">
                Belum ada klaim yang diperiksa pada sesi ini.
              </p>
            </div>
          ) : (
            history.map((entry) => {
              const isActive = entry.id === activeId;
              const badgeInfo = getVerdictBadge(
                entry.response.verdict,
                entry.response.retrieval_empty
              );

              return (
                <button
                  key={entry.id}
                  id={`history-entry-${entry.id}`}
                  type="button"
                  onClick={() => {
                    onSelect(entry);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs space-y-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#18181d] border-white/30 shadow-lg ring-1 ring-white/10 text-white'
                      : 'bg-[#111114] border-white/[0.06] hover:bg-[#15151a] hover:border-white/[0.14] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeInfo.badge}`}
                    >
                      {badgeInfo.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {entry.timestamp}
                    </span>
                  </div>

                  <p className="font-normal line-clamp-2 leading-relaxed text-xs">
                    "{entry.inputText}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                    <span className="truncate max-w-[150px]">
                      {entry.response.topic}
                    </span>
                    <span className="flex items-center gap-0.5 text-neutral-400 group-hover:text-white">
                      <span>Buka</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
