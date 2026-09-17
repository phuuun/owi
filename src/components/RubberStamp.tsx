import { motion } from 'framer-motion';
import { tone } from '../lib/climate';

interface RubberStampProps {
  label: string;
  color: string;
  /** Small line under the word, e.g. the case number. Large stamps only. */
  caption?: string;
  delay?: number;
  size?: 'sm' | 'lg';
  className?: string;
}

const TILT = -8;

/**
 * An ink stamp that drops onto the page: starts oversized and tilted, lands
 * with a stiff spring, and leaves a brief ink ring. Decorative: the reading is
 * always stated in text next to it.
 */
export function RubberStamp({ label, color, caption, delay = 0, size = 'lg', className = '' }: RubberStampProps) {
  const lg = size === 'lg';

  return (
    <div aria-hidden="true" style={tone(color)} className={`pointer-events-none relative inline-grid select-none ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: lg ? 2.4 : 1.8, rotate: TILT - 16 }}
        animate={{ opacity: 1, scale: 1, rotate: TILT }}
        transition={{
          default: { delay, type: 'spring', stiffness: 600, damping: 26, mass: 0.8 },
          opacity: { delay, duration: 0.08 },
        }}
        className={`ink-worn rounded-sm border-(--tone) font-mono font-bold uppercase text-(--tone) ${
          lg ? 'border-4 p-1 text-2xl tracking-[0.16em] sm:text-3xl' : 'border-2 p-px text-[10px] tracking-[0.12em]'
        }`}
      >
        <span className={`block rounded-[1px] border border-(--tone)/60 text-center ${lg ? 'px-4 py-1' : 'px-1.5'}`}>
          {label}
          {lg && caption && <span className="block text-[10px] tracking-[0.3em]">{caption}</span>}
        </span>
      </motion.div>

      {lg && (
        <motion.span
          className="absolute inset-0 rounded-sm border-2 border-(--tone)"
          initial={{ opacity: 0, scale: 0.9, rotate: TILT }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1, 1.3] }}
          transition={{ delay: delay + 0.1, duration: 0.55, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}
