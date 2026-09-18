import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { CaseHistoryEntry } from '../types';
import { useI18n } from '../lib/i18n';
import { climateMeta } from '../lib/climate';
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
  const { t, fmt } = useI18n();
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
            {t.archive.title}
          </h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button type="button" onClick={onClear} className="btn">
                {t.archive.clear}
              </button>
            )}
            <button type="button" onClick={onClose} aria-label={t.archive.close} className="btn px-2">
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="px-5 pt-5 text-sm leading-relaxed text-ink-muted">{t.archive.empty}</p>
        ) : (
          <ul className="flex-1 space-y-2 overflow-y-auto p-3">
            {history.map((entry) => {
              const c = climateMeta(entry.response, t);
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
                      <RubberStamp size="sm" label={c.stamp} color={c.color} />
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm text-ink">
                      {entry.response.post?.title ?? entry.response.input.value}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] text-ink-muted">
                      {c.label} · {fmt.time(entry.openedAt)}
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
