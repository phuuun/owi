import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link2, ScanSearch, TriangleAlert } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { detectPlatform, PLATFORM_LABEL } from '../lib/platform';

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
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function SearchInterrogation({ value, onChange, onSubmit, isLoading }: SearchInterrogationProps) {
  const { t } = useI18n();
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const [focusCount, setFocusCount] = useState(0);
  // Held as a key, not a sentence, so a language switch retranslates it.
  const [problem, setProblem] = useState<'needFullUrl' | 'unsupported' | null>(null);

  const trimmed = value.trim();
  const platform = detectPlatform(trimmed);
  const armed = focused || isLoading || trimmed.length > 0;

  // Mirrors server/analyze.ts, so the obvious mistakes never reach the network.
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (isLoading || !trimmed) return;
    if (!/^https?:\/\/\S+$/i.test(trimmed)) {
      setProblem('needFullUrl');
      return;
    }
    if (!platform) {
      setProblem('unsupported');
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
            {isLoading ? t.search.stateRecording : armed ? t.search.stateFocus : t.search.stateStandby}
          </span>
          <span aria-live="polite" className="relative overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={platform ?? (trimmed ? 'unknown' : 'idle')}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={`flex items-center gap-1.5 ${platform ? 'text-verified' : ''}`}
              >
                {platform ? <Link2 className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                {platform ? PLATFORM_LABEL[platform] : trimmed ? t.search.unknownPlatform : t.search.waitingForLink}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <label htmlFor={id} className="sr-only">
          {t.search.inputLabel}
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
          aria-invalid={Boolean(problem)}
          aria-describedby={`${id}-hint`}
          placeholder={t.search.placeholder}
          className="mt-4 block min-h-20 w-full resize-none bg-transparent text-lg leading-relaxed text-ink-bright field-sizing-content placeholder:text-ink-muted focus:outline-none disabled:opacity-60 sm:text-xl"
        />

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-dashed border-line pt-3">
          <p id={`${id}-hint`} className="min-w-0 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            {t.search.hint}
            <span className="hidden sm:inline">{t.search.hintEnter}</span>
          </p>
          <button
            type="submit"
            disabled={isLoading || !trimmed}
            className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-lens px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-ink-bright disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-muted"
          >
            <ScanSearch className="size-4" strokeWidth={2.25} />
            {isLoading ? t.search.submitLoading : t.search.submit}
          </button>
        </div>
      </motion.div>

      {problem && (
        <p role="alert" className="mt-3 font-mono text-sm text-debunked">
          {t.search[problem]}
        </p>
      )}
    </form>
  );
}
