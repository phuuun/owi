import type { ReactNode } from 'react';
import { Aperture, Archive } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  archiveCount: number;
  onHome: () => void;
  onOpenArchive: () => void;
}

export function Layout({ children, archiveCount, onHome, onOpenArchive }: LayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-charcoal/85 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
          <button type="button" onClick={onHome} className="group flex items-center gap-2.5">
            <Aperture className="size-5 text-lens transition-transform duration-500 group-hover:rotate-90" strokeWidth={1.75} />
            <span className="font-mono text-lg font-bold tracking-[0.25em] text-ink-bright">OWI</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted sm:inline">
              Online Web Investigator
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenArchive}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright"
          >
            <Archive className="size-4" strokeWidth={1.75} />
            Arsip
            {archiveCount > 0 && <span className="text-lens tabular-nums">{archiveCount}</span>}
          </button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 pb-24 sm:px-8">{children}</main>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto max-w-5xl space-y-2 px-5 py-8 text-xs leading-relaxed text-ink-muted sm:px-8">
          <p>OWI adalah alat bantu, bukan vonis hukum atau penentu kebenaran. Selalu periksa sumber aslinya.</p>
          <p>Sentimen kritis terhadap tokoh, partai, atau lembaga bukan indikator hoaks.</p>
        </div>
      </footer>

      <div aria-hidden="true" className="crt-vignette" />
      <div aria-hidden="true" className="crt-scanlines" />
      <div aria-hidden="true" className="crt-roll" />
      <div aria-hidden="true" className="crt-grain" />
    </div>
  );
}
