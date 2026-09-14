import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { CaseHistoryEntry } from '../types';
import { formatTime } from '../lib/format';
import { verdictMeta } from '../lib/verdict';
import { RubberStamp } from './RubberStamp';

interface HistorySidebarProps {
  history: CaseHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: CaseHistoryEntry) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HistorySidebar({ history, activeId, onSelect, onClear, isOpen, onClose }: HistorySidebarProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Native modal dialog: focus trap, Esc to close and backdrop for free.
  useEffect(() => {
    const dialog = ref.current;
    if (isOpen && !dialog?.open) dialog?.showModal();
    if (!isOpen && dialog?.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="archive-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 ml-auto h-dvh max-h-dvh w-96 max-w-[88vw] translate-x-6 border-0 border-l border-line bg-newsprint p-0 text-ink opacity-0 transition-[opacity,translate,display,overlay] duration-300 transition-discrete backdrop:bg-black/60 open:translate-x-0 open:opacity-100 starting:open:translate-x-6 starting:open:opacity-0"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 id="archive-title" className="font-mono text-sm uppercase tracking-[0.25em] text-ink-bright">
            Arsip kasus
          </h2>
          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            {history.length > 0 && (
              <button type="button" onClick={onClear} className="transition-colors hover:text-ink-bright">
                Kosongkan
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Tutup arsip" className="transition-colors hover:text-ink-bright">
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="px-5 pt-5 text-sm leading-relaxed text-ink-muted">
            Belum ada kasus. Arsip hanya tersimpan selama halaman ini terbuka.
          </p>
        ) : (
          <ul className="flex-1 space-y-2 overflow-y-auto p-3">
            {history.map((entry) => {
              const v = verdictMeta(entry.response);
              const active = entry.id === activeId;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(entry);
                      onClose();
                    }}
                    aria-current={active || undefined}
                    className={`paper w-full rounded-sm border px-4 py-3 text-left transition-colors hover:border-line-strong ${
                      active ? 'border-lens/60' : 'border-line'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-lens">{entry.response.case_id}</span>
                      <RubberStamp size="sm" label={v.stamp} color={v.color} />
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm text-ink">{entry.response.claim_extracted}</span>
                    <span className="mt-1 block font-mono text-[11px] text-ink-muted">
                      {v.label} · {formatTime(entry.openedAt)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </dialog>
  );
}
