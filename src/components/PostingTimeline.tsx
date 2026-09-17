import { motion } from 'framer-motion';
import type { TimelineBucket } from '../types';
import { useI18n } from '../lib/i18n';
import type { Strings } from '../lib/strings';
import { SectionHeading } from './SectionHeading';

/** "15 menit", "3 jam" — the width of one column, read off the first gap. */
function bucketWidth(timeline: TimelineBucket[], t: Strings) {
  if (timeline.length < 2) return null;
  const minutes = Math.round((Date.parse(timeline[1].start) - Date.parse(timeline[0].start)) / 60_000);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return minutes < 60 ? t.timeline.minutes(minutes) : t.timeline.hours(Math.round(minutes / 60));
}

export function PostingTimeline({ timeline }: { timeline: TimelineBucket[] }) {
  const { t, fmt } = useI18n();
  if (timeline.length === 0) return null;

  const peak = Math.max(...timeline.map((b) => b.total), 1);
  const width = bucketWidth(timeline, t);
  const total = timeline.reduce((sum, b) => sum + b.total, 0);

  return (
    <section aria-labelledby="timeline-title">
      <SectionHeading
        id="timeline-title"
        title={t.timeline.title}
        aside={
          width && (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">{t.timeline.oneColumn(width)}</p>
          )
        }
      />

      <div className="paper mt-6 rounded-sm border border-line px-5 py-6 sm:px-7">
        <div role="img" aria-label={t.timeline.spread(fmt.count(total), fmt.count(peak))}>
          <div className="flex h-44 items-end gap-[3px]">
            {timeline.map((b, i) => {
              const organic = b.total - b.buzzer;
              return (
                <motion.div
                  key={b.start}
                  title={t.timeline.bucket(fmt.dateTime(b.start), fmt.count(b.total), fmt.count(b.buzzer))}
                  className="flex h-full flex-1 flex-col justify-end"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.03 }}
                >
                  <motion.span
                    className="w-full rounded-t-[1px] bg-line-strong"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(organic / peak) * 100}%` }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.span
                    className="w-full bg-debunked"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(b.buzzer / peak) * 100}%` }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between border-t border-line pt-2 font-mono text-[11px] text-ink-muted">
            <span>{fmt.dateTime(timeline[0].start)}</span>
            <span>{fmt.dateTime(timeline[timeline.length - 1].start)}</span>
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 bg-debunked" />
            {t.timeline.legendBuzzer}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 bg-line-strong" />
            {t.timeline.legendRest}
          </li>
        </ul>

        <p className="mt-4 text-sm leading-relaxed text-ink-muted">{t.timeline.note}</p>
      </div>
    </section>
  );
}
