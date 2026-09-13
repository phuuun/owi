import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { SessionHistoryEntry } from '../types';
import { verdictInfo } from '../lib/verdict';

interface HistorySidebarProps {
  history: SessionHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: SessionHistoryEntry) => void;
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
      aria-label="Riwayat"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 ml-auto h-dvh max-h-dvh w-80 max-w-[85vw] border-0 border-l border-line bg-bg p-0 text-fg backdrop:bg-black/20 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between px-6">
          <h2 className="font-semibold tracking-tight">Riwayat</h2>
          <div className="flex items-center gap-4 text-sm text-muted">
            {history.length > 0 && (
              <button type="button" onClick={onClear} className="transition-colors hover:text-fg">
                Hapus
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Tutup" className="transition-colors hover:text-fg">
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="px-6 pt-4 text-sm text-muted">Belum ada klaim. Riwayat hilang saat halaman dimuat ulang.</p>
        ) : (
          <ul className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
            {history.map((entry) => {
              const v = verdictInfo(entry.response);
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(entry);
                      onClose();
                    }}
                    className={`w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-soft ${
                      entry.id === activeId ? 'bg-soft' : ''
                    }`}
                  >
                    <p className="line-clamp-2 text-sm">{entry.inputText}</p>
                    <p className="mt-1 text-xs text-muted">
                      <span className={v.text}>{v.label}</span> · {entry.timestamp}
                    </p>
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
