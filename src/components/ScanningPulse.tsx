import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const STEPS = {
  url: ['Membuka artikel dari tautan', 'Mengekstrak klaim utama'],
  text: ['Mengurai kalimat klaim'],
};
const COMMON = ['Menelusuri arsip cek fakta', 'Mencocokkan dokumen resmi', 'Menimbang bukti'];

// Blips sit on the sweep's path; each lights up as the beam passes its angle.
const SWEEP_SECONDS = 2.4;
const BLIPS = [
  { angle: 55, radius: 30 },
  { angle: 140, radius: 16 },
  { angle: 235, radius: 36 },
  { angle: 310, radius: 22 },
];

function Radar() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="relative size-32 shrink-0 overflow-hidden rounded-full border border-line-strong bg-charcoal">
      <div className="absolute inset-[18%] rounded-full border border-line" />
      <div className="absolute inset-[36%] rounded-full border border-line" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-line" />

      <div
        className="absolute inset-0 rounded-full motion-safe:animate-sweep"
        style={{
          background: 'conic-gradient(transparent 0 70%, rgb(245 197 24 / 0.06) 78%, rgb(245 197 24 / 0.5) 100%)',
        }}
      />

      {BLIPS.map(({ angle, radius }) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={angle}
            className="absolute size-1.5 -translate-1/2 rounded-full bg-lens shadow-[0_0_8px_var(--color-lens)]"
            style={{ left: `${50 + radius * Math.sin(rad)}%`, top: `${50 - radius * Math.cos(rad)}%` }}
            initial={{ opacity: reduceMotion ? 0.6 : 0 }}
            animate={reduceMotion ? undefined : { opacity: [0, 1, 0, 0] }}
            transition={{
              duration: SWEEP_SECONDS,
              times: [0, 0.02, 0.6, 1],
              repeat: Infinity,
              delay: (angle / 360) * SWEEP_SECONDS,
            }}
          />
        );
      })}

      <div className="static-noise absolute inset-0 opacity-15 mix-blend-screen" />
    </div>
  );
}

/** Loading state: a radar sweep plus a terminal-style log of what the lookup covers. */
export function ScanningPulse({ mode }: { mode: 'text' | 'url' }) {
  const steps = [...STEPS[mode], ...COMMON];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((i) => Math.min(i + 1, steps.length - 1)), 480);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="paper mt-10 flex flex-col items-center gap-8 overflow-hidden rounded-md border border-line p-6 sm:flex-row sm:p-8"
    >
      <span role="status" className="sr-only">
        Memeriksa klaim…
      </span>
      <Radar />

      <div aria-hidden="true" className="w-full min-w-0 flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lens">
          Memindai<span className="motion-safe:animate-blink">_</span>
        </p>
        <ol className="mt-4 space-y-1.5 font-mono text-sm">
          {steps.slice(0, current + 1).map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={i < current ? 'text-ink-muted' : 'text-ink-bright'}
            >
              <span className="mr-2 text-ink-muted">{i < current ? '›' : '▸'}</span>
              {step}
              {i === current && <span className="motion-safe:animate-blink">…</span>}
            </motion.li>
          ))}
        </ol>
        <div className="static-noise mt-5 h-1 w-full rounded-full opacity-40" />
      </div>
    </motion.div>
  );
}
