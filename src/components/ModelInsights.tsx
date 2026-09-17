import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { CommentLabel } from '../types';
import { useI18n } from '../lib/i18n';
import type { Strings } from '../lib/strings';
import { SectionHeading } from './SectionHeading';

// Mock evaluation results. Placeholders until the model is trained and evaluated
// on the real dataset: replace these constants (or fetch them) once numbers exist.

const STEPS = ['01', '02', '03', '04'];

const METRICS: { key: keyof Strings['model']['metrics']; value: number; digits: number; suffix?: string }[] = [
  { key: 'accuracy', value: 87.4, digits: 1, suffix: '%' },
  { key: 'macroF1', value: 0.84, digits: 2 },
  { key: 'precision', value: 0.86, digits: 2 },
  { key: 'recall', value: 0.82, digits: 2 },
];

// Chart series colors, validated for the newsprint surface (#1a1a1b) with the
// dataviz palette checks. Kept apart from the climate colors, which mean status.
const GOLD = '#B88C00';
const BLUE = '#5F7FE0';

const EPOCHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ACCURACY_SERIES: { key: 'train' | 'validate'; color: string; values: number[] }[] = [
  { key: 'train', color: GOLD, values: [62, 71, 76, 80, 83, 85, 87, 88.5, 89.6, 90.4] },
  { key: 'validate', color: BLUE, values: [60, 68, 73, 77, 80, 82, 83.5, 84.6, 85.2, 85.6] },
];

const F1_BY_LABEL: { label: CommentLabel; f1: number; samples: number }[] = [
  { label: 'BUZZER', f1: 0.88, samples: 420 },
  { label: 'ORGANIC', f1: 0.91, samples: 960 },
  { label: 'UNCLEAR', f1: 0.66, samples: 210 },
];

function MockTag({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <span className="inline-block rounded-sm border border-dashed border-line-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
      {children ?? t.model.mock}
    </span>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="paper rounded-sm border border-line p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink-bright">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
        <MockTag />
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function TableView({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  const { t } = useI18n();
  return (
    <details className="group mt-5">
      <summary className="w-fit list-none font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">{t.model.openTable}</span>
        <span className="hidden group-open:inline">{t.model.closeTable}</span>
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line text-ink-muted">
              {head.map((h) => (
                <th key={h} scope="col" className="py-2 pr-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line/60">
                {row.map((cell, j) => (
                  <td key={j} className={`py-1.5 pr-4 tabular-nums ${j === 0 ? 'text-ink' : 'text-ink-bright'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

const H = 240;
const M = { top: 12, right: 52, bottom: 28, left: 40 };
const Y_MIN = 50;
const Y_MAX = 100;
const Y_TICKS = [50, 60, 70, 80, 90, 100];

function AccuracyChart() {
  const { t, fmt } = useI18n();
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const last = EPOCHS.length - 1;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = H - M.top - M.bottom;
  const x = (i: number) => M.left + (i / last) * plotW;
  const y = (v: number) => M.top + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;
  const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
  const shown = active ?? last;

  // The crosshair finds the epoch: readers aim at a column, not at a 2px line.
  const handlePointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActive(Math.min(last, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * last))));
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setActive((i) => Math.min(last, Math.max(0, (i ?? last) + (e.key === 'ArrowRight' ? 1 : -1))));
  };

  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
        {ACCURACY_SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
            {t.model[s.key]}
          </li>
        ))}
      </ul>

      <div
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={t.model.accuracyHint}
        onKeyDown={handleKey}
        onFocus={() => setActive((i) => i ?? last)}
        onBlur={() => setActive(null)}
        className="relative mt-3"
        style={{ height: H }}
      >
        {width > 0 && (
          <svg width={width} height={H} aria-hidden="true" className="block overflow-visible">
            {Y_TICKS.map((t) => (
              <g key={t}>
                <line
                  x1={M.left}
                  x2={M.left + plotW}
                  y1={y(t)}
                  y2={y(t)}
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                  style={{ stroke: 'var(--color-line)' }}
                />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-muted font-mono text-[11px] tabular-nums">
                  {t}%
                </text>
              </g>
            ))}

            {EPOCHS.map(
              (epoch, i) =>
                (i % 3 === 0 || i === last) && (
                  <text key={epoch} x={x(i)} y={H - 8} textAnchor="middle" className="fill-ink-muted font-mono text-[11px] tabular-nums">
                    {i === 0 ? `${t.model.epoch} ${epoch}` : epoch}
                  </text>
                ),
            )}

            {active !== null && (
              <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + plotH} strokeWidth={1} style={{ stroke: 'var(--color-line-strong)' }} />
            )}

            {ACCURACY_SERIES.map((s) => (
              <g key={s.key}>
                <motion.path
                  d={path(s.values)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <circle
                  cx={x(shown)}
                  cy={y(s.values[shown])}
                  r={4}
                  fill={s.color}
                  strokeWidth={2}
                  style={{ stroke: 'var(--color-newsprint)' }}
                />
                <text x={x(last) + 10} y={y(s.values[last])} dy="0.32em" className="fill-ink font-mono text-[11px] tabular-nums">
                  {s.values[last]}%
                </text>
              </g>
            ))}

            <rect
              x={M.left}
              y={M.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onPointerMove={handlePointer}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}

        {width > 0 && active !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-36 rounded-sm border border-line-strong bg-charcoal/95 px-3 py-2 shadow-lg"
            style={{ left: Math.min(Math.max(x(active) - 72, 0), width - 144) }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {t.model.epoch} {EPOCHS[active]}
            </p>
            <ul className="mt-1 space-y-0.5">
              {ACCURACY_SERIES.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold text-ink-bright tabular-nums">{fmt.num(s.values[active], 1)}%</span>
                  <span className="text-ink-muted">{t.model[s.key]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {active !== null &&
            `${t.model.epoch} ${EPOCHS[active]}: ${ACCURACY_SERIES.map((s) => `${t.model[s.key]} ${fmt.num(s.values[active], 1)}%`).join(', ')}`}
        </p>
      </div>

      <TableView
        caption={t.model.accuracyTitle}
        head={[t.model.epoch, ...ACCURACY_SERIES.map((s) => t.model[s.key])]}
        rows={EPOCHS.map((epoch, i) => [epoch, ...ACCURACY_SERIES.map((s) => `${fmt.num(s.values[i], 1)}%`)])}
      />
    </div>
  );
}

const F1_TICKS = [0, 0.25, 0.5, 0.75, 1];

function F1Chart() {
  const { t, fmt } = useI18n();
  const [active, setActive] = useState<CommentLabel | null>(null);

  return (
    <div>
      <div className="relative">
        {/* Gridlines span the value column only: label column is 6.5rem + 0.75rem gap, value gutter is 3rem. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-12 left-[7.25rem]">
          {F1_TICKS.map((t) => (
            <span key={t} className="absolute inset-y-0 w-px bg-line" style={{ left: `${t * 100}%` }} />
          ))}
        </div>

        <ul className="relative space-y-3">
          {F1_BY_LABEL.map((row, i) => (
            <li
              key={row.label}
              tabIndex={0}
              aria-label={t.model.f1Row(t.commentLabel[row.label], fmt.num(row.f1, 2), fmt.count(row.samples))}
              onPointerEnter={() => setActive(row.label)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(row.label)}
              onBlur={() => setActive(null)}
              className="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-sm"
            >
              <span className="truncate text-sm text-ink">{t.commentLabel[row.label]}</span>
              <div className="h-6 pr-12">
                <div className="relative h-full">
                  <motion.div
                    className={`absolute inset-y-0.5 left-0 rounded-r-[4px] transition-opacity ${
                      active && active !== row.label ? 'opacity-45' : ''
                    }`}
                    style={{ width: `${row.f1 * 100}%`, background: GOLD, originX: 0 }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.6, ease: 'easeOut' }}
                  />
                  <span
                    className="absolute top-1/2 -translate-y-1/2 pl-2 font-mono text-xs text-ink-bright tabular-nums"
                    style={{ left: `${row.f1 * 100}%` }}
                  >
                    {fmt.num(row.f1, 2)}
                  </span>

                  {active === row.label && (
                    <div
                      className="pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-sm border border-line-strong bg-charcoal/95 px-3 py-2 shadow-lg"
                      style={{ left: `min(${row.f1 * 100}%, calc(100% - 9rem))` }}
                    >
                      <p className="text-sm">
                        <span className="font-semibold text-ink-bright tabular-nums">{fmt.num(row.f1, 2)}</span>{' '}
                        <span className="text-ink-muted">F1 · {t.commentLabel[row.label]}</span>
                      </p>
                      <p className="font-mono text-[11px] text-ink-muted">
                        {fmt.count(row.samples)} {t.model.f1Samples.toLowerCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" className="mt-2 grid grid-cols-[6.5rem_1fr] gap-3">
        <span />
        <div className="pr-12">
          <div className="relative h-4">
            {F1_TICKS.map((t) => (
              <span
                key={t}
                // Quarter ticks collide on phones; keep 0 / 0.5 / 1 there.
                className={`absolute -translate-x-1/2 font-mono text-[11px] text-ink-muted tabular-nums ${
                  t === 0.25 || t === 0.75 ? 'hidden sm:inline' : ''
                }`}
                style={{ left: `${t * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <TableView
        caption={t.model.f1Title}
        head={[t.model.f1Class, 'F1', t.model.f1Samples]}
        rows={F1_BY_LABEL.map((row) => [t.commentLabel[row.label], fmt.num(row.f1, 2), fmt.count(row.samples)])}
      />
    </div>
  );
}

/** Home-page room for the model explanation, evaluation charts and scoring method. All mock for now. */
export function ModelInsights() {
  const { t, fmt } = useI18n();

  return (
    <section aria-labelledby="model-title" className="mt-20">
      <SectionHeading id="model-title" title={t.model.title} aside={<MockTag>{t.model.aside}</MockTag>} />
      <p className="mt-5 max-w-2xl leading-relaxed text-ink">{t.model.intro}</p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {t.model.pipeline.map((item, i) => (
          <li key={STEPS[i]} className="paper rounded-sm border border-line p-5">
            <p className="font-mono text-xs text-lens">{STEPS[i]}</p>
            <h3 className="mt-2 font-medium text-ink-bright">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            <p className="mt-4 border-t border-dashed border-line pt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
              {t.model.pending}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.key} className="paper rounded-sm border border-line p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-muted">{t.model.metrics[m.key]}</p>
              <MockTag />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink-bright">
              {fmt.num(m.value, m.digits)}
              {m.suffix}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">{t.model.testSet}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title={t.model.accuracyTitle} subtitle={t.model.accuracySubtitle}>
          <AccuracyChart />
        </Panel>
        <Panel title={t.model.f1Title} subtitle={t.model.f1Subtitle}>
          <F1Chart />
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title={t.model.scoreTitle} subtitle={t.model.scoreSubtitle}>
          <div className="overflow-x-auto rounded-sm border border-line bg-charcoal px-4 py-4 font-mono text-xs whitespace-nowrap text-ink-bright sm:text-base">
            {t.model.scoreFormula}
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-mono text-ink-bright">wᵢ</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">{t.model.scoreWeight}</dd>
            </div>
            <div>
              <dt className="font-mono text-ink-bright">cᵢ</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">{t.model.scoreStrength}</dd>
            </div>
            <div>
              <dt className="font-mono text-ink-bright">{t.model.scoreThresholdTerm}</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">{t.model.scoreThreshold}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-dashed border-line pt-4 text-sm leading-relaxed text-ink-muted">
            {t.model.scoreNote}
          </p>
        </Panel>
      </div>
    </section>
  );
}
