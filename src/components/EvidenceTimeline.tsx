import { motion } from 'framer-motion';
import type { Evidence, TimelineEvent } from '../types';
import { formatDate } from '../lib/format';
import { STANCE, tone } from '../lib/verdict';
import { SectionHeading } from './SectionHeading';

interface EvidenceTimelineProps {
  timeline: TimelineEvent[];
  evidence: Evidence[];
  activeId: string | null;
  onSelect: (evidenceId: string) => void;
}

export function EvidenceTimeline({ timeline, evidence, activeId, onSelect }: EvidenceTimelineProps) {
  if (timeline.length === 0) return null;
  const byId = new Map(evidence.map((e) => [e.id, e]));

  return (
    <section aria-labelledby="timeline-title">
      <SectionHeading id="timeline-title" title="Kronologi" />

      <ol className="mt-6">
        {timeline.map((event, i) => {
          const item = event.evidence_id ? byId.get(event.evidence_id) : undefined;
          const last = i === timeline.length - 1;
          return (
            <motion.li
              key={`${event.date}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06 }}
              style={tone(item ? STANCE[item.stance].color : 'var(--color-lens)')}
              className="grid grid-cols-[5.5rem_1rem_1fr] gap-x-3 sm:grid-cols-[7rem_1rem_1fr] sm:gap-x-4"
            >
              <time dateTime={event.date} className="pt-px text-right font-mono text-xs text-ink-muted tabular-nums">
                {formatDate(event.date)}
              </time>

              <div aria-hidden="true" className="relative flex justify-center">
                {!last && <span className="absolute top-3 -bottom-1 w-px bg-line" />}
                <span
                  className={`relative mt-1 size-2.5 rotate-45 border border-(--tone) ${
                    event.kind === 'CLAIM' ? 'bg-(--tone)' : 'bg-charcoal'
                  }`}
                />
              </div>

              <div className={`min-w-0 ${last ? '' : 'pb-6'}`}>
                <p className="text-sm text-ink">{event.label}</p>
                {item && (
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`mt-1 text-left text-sm underline-offset-4 transition-colors hover:text-ink-bright hover:underline ${
                      activeId === item.id ? 'text-ink-bright underline' : 'text-ink-muted'
                    }`}
                  >
                    {item.title}
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
