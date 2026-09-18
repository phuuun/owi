import { useEffect, useId } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useI18n } from '../lib/i18n';

const INK = '#e6dfcf';
const LINE = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/** `searching` leans him in over a magnifier; `resting` is the reading finished, mug out. */
export type MascotMode = 'idle' | 'searching' | 'resting';

interface DetectiveMascotProps {
  mode: MascotMode;
  className?: string;
}

/**
 * The OWI detective: fedora, round shades, windblown scarf. Bobs while idle,
 * glances toward the pointer, tips his hat on hover. Decorative only.
 */
export function DetectiveMascot({ mode, className = '' }: DetectiveMascotProps) {
  const { t } = useI18n();
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const lookX = useSpring(rawX, { stiffness: 120, damping: 14 });
  const lookY = useSpring(rawY, { stiffness: 120, damping: 14 });

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(((e.clientX / window.innerWidth) * 2 - 1) * 4);
      rawY.set(((e.clientY / window.innerHeight) * 2 - 1) * 3);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion, rawX, rawY]);

  return (
    <motion.div
      aria-hidden="true"
      className={`group select-none ${className}`}
      initial={false}
      animate={mode}
      whileHover="tip"
    >
      <span className="pointer-events-none absolute -top-2 right-[70%] rounded-sm border border-line-strong bg-charcoal px-3 py-1.5 font-mono text-xs whitespace-nowrap text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {t.mascot[mode]}
      </span>

      <motion.svg
        viewBox="0 0 240 240"
        className="w-full overflow-visible"
        variants={{
          idle: { rotate: 0, y: reduceMotion ? 0 : [0, -6, 0], transition: { y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } } },
          searching: { rotate: -6, y: 4, transition: { type: 'spring', stiffness: 200, damping: 14 } },
          // Leaned back, breathing slower: the reading is done.
          resting: { rotate: 5, y: reduceMotion ? 0 : [0, -3, 0], transition: { y: { duration: 4.6, repeat: Infinity, ease: 'easeInOut' } } },
        }}
      >
        <defs>
          <clipPath id={`lenses-${uid}`}>
            <circle cx="100" cy="130" r="16" />
            <circle cx="142" cy="130" r="16" />
          </clipPath>
        </defs>

        <motion.path
          d="M104 180 C 80 176, 52 160, 16 166 C 34 174, 50 182, 62 190 C 44 194, 30 208, 10 212 C 46 220, 86 204, 108 192 Z"
          fill="#6b6458"
          {...LINE}
          style={{ originX: 1, originY: 0.3 }}
          animate={reduceMotion ? undefined : { rotate: [0, -5, 3, 0], skewY: [0, 4, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <path d="M34 240 C 40 202, 76 180, 120 178 C 164 180, 200 202, 206 240 Z" fill="#2a2825" {...LINE} />
        <path d="M96 176 L74 214 L110 204 L112 182 Z" fill="#3a3733" {...LINE} />
        <path d="M144 176 L166 214 L130 204 L128 182 Z" fill="#3a3733" {...LINE} />

        <circle cx="120" cy="130" r="44" fill="#57524a" {...LINE} />
        <path d="M110 158 Q122 164 134 155" fill="none" {...LINE} />

        <motion.g style={{ x: lookX, y: lookY }}>
          <path d="M84 128 L77 124 M158 128 L164 124 M116 128 Q121 123 126 128" fill="none" {...LINE} />
          <circle cx="100" cy="130" r="16" fill="#060606" {...LINE} />
          <circle cx="142" cy="130" r="16" fill="#060606" {...LINE} />
          <g clipPath={`url(#lenses-${uid})`}>
            <motion.polygon
              points="0,106 9,106 -5,154 -14,154"
              fill={INK}
              opacity="0.85"
              initial={{ x: 60 }}
              animate={reduceMotion ? undefined : { x: [60, 180] }}
              transition={{
                duration: mode === 'searching' ? 0.5 : 0.9,
                repeat: Infinity,
                repeatDelay: mode === 'searching' ? 0.5 : 3.4,
                ease: 'easeInOut',
              }}
            />
          </g>
        </motion.g>

        <motion.g
          style={{ originX: 0.3, originY: 1 }}
          variants={{ idle: { y: 0, rotate: 0 }, searching: { y: 0, rotate: 0 }, resting: { y: 0, rotate: 0 }, tip: { y: -14, rotate: -12 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <path d="M74 90 C 70 60, 84 40, 118 40 C 152 40, 166 60, 162 88 C 138 96, 98 96, 74 90 Z" fill="#5d5850" {...LINE} />
          <path d="M100 46 C 110 56, 126 56, 136 46" fill="none" {...LINE} />
          <path d="M74 80 C 98 88, 140 88, 163 78 L162 88 C 138 96, 98 96, 74 90 Z" fill="#0d0d0c" {...LINE} />
          <ellipse cx="118" cy="92" rx="78" ry="13" transform="rotate(-4 118 92)" fill="#4a463f" {...LINE} />
        </motion.g>

        <AnimatePresence>
          {mode === 'resting' && (
            <motion.g key="mug" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {[
                { x: 190, delay: 0 },
                { x: 206, delay: 0.9 },
              ].map(({ x, delay }) => (
                <motion.path
                  key={x}
                  d={`M${x} 152 Q${x - 6} 142 ${x} 132`}
                  fill="none"
                  stroke={INK}
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={reduceMotion ? { opacity: 0.5 } : { y: [0, -12], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeOut' }}
                />
              ))}
              <path d="M214 174 C 230 174, 230 194, 214 194" fill="none" {...LINE} />
              <path d="M176 166 H216 V190 C216 202, 207 210, 196 210 C185 210, 176 202, 176 190 Z" fill="#3a3733" {...LINE} />
            </motion.g>
          )}

          {mode === 'searching' && (
            <motion.g
              key="magnifier"
              style={{ originX: 0.2, originY: 0.2 }}
              initial={{ opacity: 0, scale: 0.2, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: reduceMotion ? 0 : [0, 10, -6, 0] }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{
                opacity: { duration: 0.2 },
                scale: { type: 'spring', stiffness: 260, damping: 16 },
                rotate: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <line x1="212" y1="194" x2="232" y2="222" stroke={INK} strokeWidth="8" strokeLinecap="round" />
              <circle cx="196" cy="172" r="24" fill="rgb(245 197 24 / 0.14)" stroke={INK} strokeWidth="5" />
              <path d="M184 162 Q190 154 200 154" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>
    </motion.div>
  );
}
