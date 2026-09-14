import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link2, ScanSearch, Type } from 'lucide-react';
import { toRequest } from '../lib/api';

// Mirrors the server's validation (server/factCheck.ts).
const TEXT_MIN = 10;
const TEXT_MAX = 1000;

const MUTED = '#888888';
const LENS = '#f5c518';

// Viewfinder brackets. (x, y) points inward, so idle brackets sit inside the
// frame and snap outward to its edges once the field is armed.
const CORNERS = [
  { pos: 'left-0 top-0 border-l-2 border-t-2', x: 1, y: 1 },
  { pos: 'right-0 top-0 border-r-2 border-t-2', x: -1, y: 1 },
  { pos: 'bottom-0 left-0 border-b-2 border-l-2', x: 1, y: -1 },
  { pos: 'bottom-0 right-0 border-b-2 border-r-2', x: -1, y: -1 },
];

interface SearchInterrogationProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (raw: string) => void;
  isLoading: boolean;
}

export function SearchInterrogation({ value, onChange, onSubmit, isLoading }: SearchInterrogationProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const [focusCount, setFocusCount] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  const trimmed = value.trim();
  const isUrl = 'url' in toRequest(value);
  const overLimit = !isUrl && trimmed.length > TEXT_MAX;
  const armed = focused || isLoading || trimmed.length > 0;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (isLoading || overLimit) return;
    if (!isUrl && trimmed.length < TEXT_MIN) {
      setProblem(`Klaim terlalu pendek, minimal ${TEXT_MIN} karakter.`);
      return;
    }
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <motion.div
        initial={false}
        animate={armed ? 'armed' : 'idle'}
        className={`relative rounded-sm border bg-slate/85 px-5 py-4 backdrop-blur-[2px] transition-colors duration-300 sm:px-7 ${
          armed ? 'border-line-strong' : 'border-line'
        }`}
      >
        {CORNERS.map((c) => (
          <motion.span
            key={c.pos}
            aria-hidden="true"
            className={`pointer-events-none absolute size-5 ${c.pos}`}
            variants={{
              idle: { x: c.x * 10, y: c.y * 10, opacity: 0.6, borderColor: MUTED },
              armed: { x: -c.x * 4, y: -c.y * 4, opacity: 1, borderColor: LENS },
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          />
        ))}

        {/* Scope crosshair: hairlines run from the frame out to the screen edges. */}
        {['right-full bg-linear-to-l', 'left-full bg-linear-to-r'].map((side) => (
          <span
            key={side}
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 h-px w-screen to-transparent ${side} ${armed ? 'from-lens/60' : 'from-line-strong'}`}
          />
        ))}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-full left-1/2 h-10 w-px bg-linear-to-b to-transparent ${armed ? 'from-lens/60' : 'from-line-strong'}`}
        />

        {/* Lens sweep: once per focus, continuously while the lookup runs. */}
        {!reduceMotion && (isLoading || focusCount > 0) && (
          <motion.span
            key={isLoading ? 'loading' : focusCount}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-lens to-transparent"
            initial={{ top: '0%', opacity: 0.9 }}
            animate={{ top: '100%', opacity: isLoading ? 0.9 : 0 }}
            transition={isLoading ? { duration: 1.4, ease: 'linear', repeat: Infinity } : { duration: 0.7, ease: 'easeInOut' }}
          />
        )}

        <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">
          <span aria-hidden="true" className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${armed ? 'bg-lens motion-safe:animate-blink' : 'bg-line-strong'}`} />
            {isLoading ? 'Merekam' : armed ? 'Fokus' : 'Siaga'}
          </span>
          <span aria-live="polite" className="relative overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={isUrl ? 'url' : 'text'}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={`flex items-center gap-1.5 ${isUrl ? 'text-verified' : ''}`}
              >
                {isUrl ? <Link2 className="size-3.5" /> : <Type className="size-3.5" />}
                {isUrl ? 'Tautan artikel' : 'Teks klaim'}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <label htmlFor={id} className="sr-only">
          Klaim atau tautan artikel
        </label>
        <textarea
          id={id}
          rows={2}
          value={value}
          disabled={isLoading}
          onChange={(e) => {
            onChange(e.target.value);
            setProblem(null);
          }}
          onFocus={() => {
            setFocused(true);
            setFocusCount((n) => n + 1);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(problem) || overLimit}
          aria-describedby={`${id}-hint`}
          placeholder="Tempel klaim politik atau tautan artikel berita…"
          className="mt-4 block min-h-20 w-full resize-none bg-transparent text-lg leading-relaxed text-ink-bright field-sizing-content placeholder:text-ink-muted focus:outline-none disabled:opacity-60 sm:text-xl"
        />

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-dashed border-line pt-3">
          <p id={`${id}-hint`} className="min-w-0 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            {isUrl ? (
              'Artikel diurai jadi klaim'
            ) : (
              <span className={`tabular-nums ${overLimit ? 'text-debunked' : ''}`}>
                {String(trimmed.length).padStart(3, '0')}/{TEXT_MAX}
              </span>
            )}
            <span className="hidden sm:inline"> · Enter untuk memeriksa</span>
          </p>
          <button
            type="submit"
            disabled={isLoading || !trimmed || overLimit}
            className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-lens px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-ink-bright disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-muted"
          >
            <ScanSearch className="size-4" strokeWidth={2.25} />
            {isLoading ? 'Memindai' : 'Interogasi'}
          </button>
        </div>
      </motion.div>

      {problem && (
        <p role="alert" className="mt-3 font-mono text-sm text-debunked">
          {problem}
        </p>
      )}
    </form>
  );
}
