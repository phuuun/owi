import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';

// Mock evaluation results. Placeholders until the model is trained and evaluated
// on the real dataset: replace these constants (or fetch them) once numbers exist.

const PIPELINE = [
  { step: '01', title: 'Claim extraction', body: 'Pulls the checkable statement out of pasted text or a news article.' },
  { step: '02', title: 'Evidence retrieval', body: 'Searches fact-check archives, official releases and court rulings for related documents.' },
  { step: '03', title: 'Stance detection', body: 'Labels each document as supporting the claim, refuting it, or only giving context.' },
  { step: '04', title: 'Verdict & confidence', body: 'Combines the stances into one verdict and a confidence score. No evidence means no verdict.' },
];

const METRICS = [
  { label: 'Accuracy', value: '87.4%' },
  { label: 'Macro F1', value: '0.84' },
  { label: 'Precision', value: '0.86' },
  { label: 'Recall', value: '0.82' },
];

// Chart series colors, validated for the newsprint surface (#1a1a1b) with the
// dataviz palette checks. Kept apart from the verdict colors, which mean status.
const GOLD = '#B88C00';
const BLUE = '#5F7FE0';

const EPOCHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ACCURACY_SERIES = [
  { key: 'train', name: 'Training', color: GOLD, values: [62, 71, 76, 80, 83, 85, 87, 88.5, 89.6, 90.4] },
  { key: 'val', name: 'Validation', color: BLUE, values: [60, 68, 73, 77, 80, 82, 83.5, 84.6, 85.2, 85.6] },
];

const F1_BY_VERDICT = [
  { verdict: 'True', f1: 0.88, samples: 240 },
  { verdict: 'False', f1: 0.91, samples: 310 },
  { verdict: 'Misleading', f1: 0.74, samples: 180 },
  { verdict: 'Opinion', f1: 0.81, samples: 150 },
  { verdict: 'Unverifiable', f1: 0.79, samples: 120 },
];

function MockTag({ children = 'Mock' }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-sm border border-dashed border-line-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
      {children}
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
  return (
    <details className="group mt-5">
      <summary className="w-fit list-none font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-bright [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">View as table</span>
        <span className="hidden group-open:inline">Hide table</span>
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
            {s.name}
          </li>
        ))}
      </ul>

      <div
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label="Accuracy by training epoch. Use the left and right arrow keys to read each epoch."
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
                    {i === 0 ? `Epoch ${epoch}` : epoch}
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
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">Epoch {EPOCHS[active]}</p>
            <ul className="mt-1 space-y-0.5">
              {ACCURACY_SERIES.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold text-ink-bright tabular-nums">{s.values[active]}%</span>
                  <span className="text-ink-muted">{s.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {active !== null &&
            `Epoch ${EPOCHS[active]}: ${ACCURACY_SERIES.map((s) => `${s.name} ${s.values[active]}%`).join(', ')}`}
        </p>
      </div>

      <TableView
        caption="Accuracy by training epoch"
        head={['Epoch', ...ACCURACY_SERIES.map((s) => s.name)]}
        rows={EPOCHS.map((epoch, i) => [epoch, ...ACCURACY_SERIES.map((s) => `${s.values[i]}%`)])}
      />
    </div>
  );
}

const F1_TICKS = [0, 0.25, 0.5, 0.75, 1];

function F1Chart() {
  const [active, setActive] = useState<string | null>(null);

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
          {F1_BY_VERDICT.map((row, i) => (
            <li
              key={row.verdict}
              tabIndex={0}
              aria-label={`${row.verdict}: F1 ${row.f1.toFixed(2)}, ${row.samples} test samples`}
              onPointerEnter={() => setActive(row.verdict)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(row.verdict)}
              onBlur={() => setActive(null)}
              className="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-sm"
            >
              <span className="truncate text-sm text-ink">{row.verdict}</span>
              <div className="h-6 pr-12">
                <div className="relative h-full">
                  <motion.div
                    className={`absolute inset-y-0.5 left-0 rounded-r-[4px] transition-opacity ${
                      active && active !== row.verdict ? 'opacity-45' : ''
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
                    {row.f1.toFixed(2)}
                  </span>

                  {active === row.verdict && (
                    <div
                      className="pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-sm border border-line-strong bg-charcoal/95 px-3 py-2 shadow-lg"
                      style={{ left: `min(${row.f1 * 100}%, calc(100% - 9rem))` }}
                    >
                      <p className="text-sm">
                        <span className="font-semibold text-ink-bright tabular-nums">{row.f1.toFixed(2)}</span>{' '}
                        <span className="text-ink-muted">F1 · {row.verdict}</span>
                      </p>
                      <p className="font-mono text-[11px] text-ink-muted">{row.samples} test samples</p>
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
        caption="F1 score by verdict"
        head={['Verdict', 'F1', 'Test samples']}
        rows={F1_BY_VERDICT.map((row) => [row.verdict, row.f1.toFixed(2), row.samples])}
      />
    </div>
  );
}

/** Home-page room for the model explanation, evaluation charts and scoring method. All mock for now. */
export function ModelInsights() {
  return (
    <section aria-labelledby="model-title" className="mt-20">
      <SectionHeading id="model-title" title="Model & methodology" aside={<MockTag>Mock data · soon to be updated</MockTag>} />
      <p className="mt-5 max-w-2xl leading-relaxed text-ink">
        How OWI reaches a verdict and how well the model performs. Everything below is a placeholder until the model is
        evaluated on the real dataset.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PIPELINE.map((item) => (
          <li key={item.step} className="paper rounded-sm border border-line p-5">
            <p className="font-mono text-xs text-lens">{item.step}</p>
            <h3 className="mt-2 font-medium text-ink-bright">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            <p className="mt-4 border-t border-dashed border-line pt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
              Model · soon to be updated
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="paper rounded-sm border border-line p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink-muted">{m.label}</p>
              <MockTag />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink-bright">{m.value}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">Test set · soon to be updated</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Accuracy by training epoch" subtitle="Share of claims labeled correctly after each epoch.">
          <AccuracyChart />
        </Panel>
        <Panel title="F1 score by verdict" subtitle="Balance of precision and recall for each verdict, from 0 to 1.">
          <F1Chart />
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title="Confidence score" subtitle="How document stances become one number. Formula soon to be updated.">
          <div className="overflow-x-auto rounded-sm border border-line bg-charcoal px-4 py-4 font-mono text-xs whitespace-nowrap text-ink-bright sm:text-base">
            confidence = |Σ wᵢ · sᵢ · pᵢ| / Σ wᵢ
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-mono text-ink-bright">wᵢ</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">Credibility weight of source i, e.g. court ruling above news report</dd>
            </div>
            <div>
              <dt className="font-mono text-ink-bright">sᵢ</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">Stance of document i: +1 supports, −1 refutes, 0 context</dd>
            </div>
            <div>
              <dt className="font-mono text-ink-bright">pᵢ</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">Stance classifier's probability for document i</dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-dashed border-line pt-4 text-sm leading-relaxed text-ink-muted">
            Already in place: when retrieval finds no evidence, the verdict is Unverifiable and no confidence score is shown.
          </p>
        </Panel>
      </div>
    </section>
  );
}
