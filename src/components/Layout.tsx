import type { ReactNode } from 'react';
import { Aperture, Archive } from 'lucide-react';
import { LANGS, useI18n } from '../lib/i18n';

function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.layout.language}
      className="flex items-center overflow-hidden rounded-sm border border-line"
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
            lang === code ? 'bg-lens text-charcoal' : 'text-ink-muted hover:text-ink-bright'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
  archiveCount: number;
  onHome: () => void;
  onOpenArchive: () => void;
}

export function Layout({ children, archiveCount, onHome, onOpenArchive }: LayoutProps) {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-charcoal/85 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <button type="button" onClick={onHome} className="group flex items-center gap-2.5">
            <Aperture className="size-5 text-lens transition-transform duration-500 group-hover:rotate-90" strokeWidth={1.75} />
            <span className="font-mono text-lg font-bold tracking-[0.25em] text-ink-bright">OWI</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted sm:inline">
              Online Web Investigator
            </span>
          </button>

          <div className="flex items-center gap-4">
            <LanguageToggle />

            <button type="button" onClick={onOpenArchive} className="btn">
              <Archive className="size-4" strokeWidth={1.75} />
              {t.layout.archive}
              {archiveCount > 0 && <span className="text-lens tabular-nums">{archiveCount}</span>}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 pb-24 sm:px-8">{children}</main>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto max-w-5xl space-y-2 px-5 py-8 text-xs leading-relaxed text-ink-muted sm:px-8">
          <p>{t.layout.disclaimerTool}</p>
          <p>{t.layout.disclaimerLean}</p>
        </div>
      </footer>

      <div aria-hidden="true" className="crt-vignette" />
      <div aria-hidden="true" className="crt-scanlines" />
      <div aria-hidden="true" className="crt-roll" />
      <div aria-hidden="true" className="crt-grain" />
    </div>
  );
}
