import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Viewfinder focus: content arrives blurred, snaps sharp, hunts briefly past
 * focus and settles, like a lens locking on.
 */
export function FocusShift({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ transformOrigin: '50% 0' }}
      initial={{ opacity: 0, scale: 1.02, filter: 'blur(16px)' }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: ['blur(16px)', 'blur(0px)', 'blur(2.5px)', 'blur(0px)'],
        // A lingering filter keeps an expensive layer alive; drop it once settled.
        transitionEnd: { filter: 'none' },
      }}
      transition={{ duration: 0.75, ease: 'easeOut', filter: { duration: 0.75, times: [0, 0.5, 0.72, 1] } }}
    >
      {children}
    </motion.div>
  );
}
