import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { FilmStripIcon } from './FilmStripIcon';

const TICK_MS = 800;
const COUNT = [3, 2, 1];

function Sprockets({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`absolute inset-y-0 w-6 overflow-hidden bg-[#0d0c0b] sm:w-8 ${side === 'left' ? 'left-0' : 'right-0'}`}>
      {/* One hole period is 28px (12px hole + 16px gap); .film-run shifts by exactly that, so the loop is seamless. */}
      <div className="film-run absolute inset-x-0 -top-7 flex flex-col items-center gap-4">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="h-3 w-3.5 shrink-0 rounded-[3px] bg-[#cfc6b4]/30 sm:w-4" />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading state as an old film leader: a clock wipe sweeps the rings once per
 * tick while the countdown runs 3, 2, 1, and the plaque names what is being
 * read. It loops until the response arrives.
 */
export function FilmCountdown() {
  const { t } = useI18n();
  const targets = t.loading.targets;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Each target holds for two ticks so it can actually be read.
  const target = targets[Math.floor(tick / 2) % targets.length];

  return (
    <motion.div
      // An old set powering on: a bright line that opens into the picture.
      initial={{ opacity: 0, scaleY: 0.01 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.01, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ duration: 0.35, ease: [0.2, 0.9, 0.3, 1] }}
      style={{ '--tick': `${TICK_MS}ms` } as CSSProperties}
      className="relative mt-10 overflow-hidden rounded-sm border border-line"
    >
      <span role="status" className="sr-only">
        {t.loading.status}
      </span>

      <div
        aria-hidden="true"
        className="film-flicker relative h-[22rem] bg-[radial-gradient(ellipse_at_center,#4a443b_0%,#2b2824_45%,#141311_100%)]"
      >
        <div className="absolute left-0 h-px w-full bg-[#efe7d6]/30" style={{ top: '58%' }} />
        <div className="absolute inset-y-0 left-1/2 w-px bg-[#efe7d6]/30" />

        <div className="absolute top-5 left-1/2 z-10 w-60 -translate-x-1/2 border border-[#efe7d6]/60 bg-[#1b1a17]/85 px-4 pt-1 pb-1.5 text-center">
          <FilmStripIcon className="absolute -top-4 -left-9 w-14 -rotate-[28deg]" />
          <p className="text-xs text-[#efe7d6]">{t.loading.reading}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={target}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold text-lens"
            >
              {target}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="absolute left-1/2 size-52 -translate-1/2" style={{ top: '58%' }}>
          <div className="leader-sweep absolute inset-[7%] rounded-full" />
          <div className="absolute inset-0 rounded-full border-[3px] border-[#efe7d6]" />
          <div className="absolute inset-[7%] rounded-full border-2 border-[#efe7d6]/85" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
            <circle cx="50" cy="50" r="48.5" pathLength={1} fill="none" stroke="#efe7d6" strokeWidth="3" className="leader-arc" />
          </svg>
          <div className="leader-hand absolute top-[7%] left-[calc(50%-1px)] h-[43%] w-0.5 origin-bottom bg-[#efe7d6]" />

          <AnimatePresence initial={false}>
            <motion.span
              key={tick}
              className="absolute inset-0 grid place-items-center text-8xl font-bold text-lens [text-shadow:0_4px_0_#0c0b0a]"
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            >
              {COUNT[tick % COUNT.length]}
            </motion.span>
          </AnimatePresence>
        </div>

        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.5em] text-[#efe7d6]/80">
          READY
        </p>

        <span className="film-scratch absolute inset-y-0 left-[31%] w-px bg-[#f3ecdc]" />
        <span className="film-scratch absolute inset-y-0 left-[67%] w-px bg-[#f3ecdc] [animation-delay:0.55s]" />
        <div className="static-noise pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(0_0_0/0.7)_100%)]" />
        <Sprockets side="left" />
        <Sprockets side="right" />
      </div>
    </motion.div>
  );
}
