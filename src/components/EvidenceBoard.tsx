import { useLayoutEffect, useRef, useState, type Ref } from 'react';
import { motion } from 'framer-motion';
import type { Evidence, EvidenceStance, FactCheckResponse } from '../types';
import { formatDate } from '../lib/format';
import { STANCE, sourceTypeLabel, tone, verdictMeta } from '../lib/verdict';
import { SectionHeading } from './SectionHeading';

interface Thread {
  id: string;
  d: string;
  color: string;
}

// Pinned papers never hang perfectly straight.
const TILTS = [-1.2, 0.9, -0.5, 1.3, -0.9];

/**
 * `el`'s box in `board`'s layout coordinates. Walks offsets rather than
 * getBoundingClientRect, so in-flight transforms (focus shift, card entrance,
 * paper tilt) don't skew the threads.
 */
function boxWithin(el: HTMLElement, board: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let n: HTMLElement | null = el; n && n !== board; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

type Box = ReturnType<typeof boxWithin>;

/**
 * Thread from the claim to card `i` of `n`. Threads sit behind the papers, so
 * side cards are joined facing edge to facing edge across the gutter. Stacked
 * cards (phones, the context row) hang from the claim's bottom edge, fanned out
 * so the threads don't collapse into one line.
 */
function threadPath(claim: Box, card: Box, i: number, n: number) {
  const SAG = 14;
  const leftOf = card.x + card.w <= claim.x;
  const rightOf = card.x >= claim.x + claim.w;

  if (leftOf || rightOf) {
    const a = { x: leftOf ? claim.x : claim.x + claim.w, y: claim.y + claim.h / 2 };
    const b = { x: leftOf ? card.x + card.w : card.x, y: card.y + card.h / 2 };
    const dx = (b.x - a.x) / 2;
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y + SAG} ${b.x - dx} ${b.y + SAG} ${b.x} ${b.y}`;
  }

  const a = { x: claim.x + (claim.w * (i + 1)) / (n + 1), y: claim.y + claim.h };
  const b = { x: card.x + card.w / 2, y: card.y };
  const dy = (b.y - a.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`;
}

function ClaimNode({ ref, claim, label, color }: { ref: Ref<HTMLDivElement>; claim: string; label: string; color: string }) {
  return (
    <div
      ref={ref}
      style={tone(color)}
      className="paper mx-auto max-w-md rounded-sm border-2 border-(--tone) p-5 shadow-[0_12px_32px_rgb(0_0_0/0.55)]"
    >
      <span aria-hidden="true" className="absolute -top-2 left-[calc(50%-8px)] size-4 rounded-full border-2 border-charcoal bg-lens" />
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-(--tone)">Klaim · {label}</p>
      <p className="mt-2 line-clamp-5 leading-snug text-ink-bright">{claim}</p>
    </div>
  );
}

interface EvidenceNodeProps {
  item: Evidence;
  order: number;
  active: boolean;
  cardRef: (el: HTMLElement | null) => void;
  onSelect: (id: string) => void;
}

function EvidenceNode({ item, order, active, cardRef, onSelect }: EvidenceNodeProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + order * 0.1, duration: 0.35 }}>
      <motion.button
        ref={cardRef}
        type="button"
        onClick={() => onSelect(item.id)}
        aria-pressed={active}
        style={tone(STANCE[item.stance].color)}
        animate={{ rotate: active ? 0 : TILTS[order % TILTS.length] }}
        whileHover={{ rotate: 0, y: -2 }}
        transition={{ duration: 0.2 }}
        className={`paper block w-full rounded-sm border p-4 pt-5 text-left shadow-[0_8px_24px_rgb(0_0_0/0.45)] transition-colors ${
          active ? 'border-(--tone)' : 'border-line hover:border-line-strong'
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute -top-1.5 left-[calc(50%-6px)] size-3 rounded-full border border-charcoal bg-(--tone)"
        />
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-(--tone)">
          {sourceTypeLabel(item.source_type)} · {formatDate(item.published)}
        </span>
        <span className="mt-1.5 line-clamp-3 block text-sm font-medium leading-snug text-ink-bright">{item.title}</span>
        <span className="mt-2 block truncate font-mono text-[11px] text-ink-muted">{item.source}</span>
      </motion.button>
    </motion.div>
  );
}

function ColumnLabel({ stance, count }: { stance: EvidenceStance; count: number }) {
  return (
    <p
      style={tone(STANCE[stance].color)}
      className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-(--tone)"
    >
      <span aria-hidden="true" className="h-px w-4 bg-(--tone)" />
      {STANCE[stance].label} · {count}
    </p>
  );
}

const SIDES: { stance: EvidenceStance; empty: string; order: string }[] = [
  { stance: 'REFUTES', empty: 'Tidak ada bukti yang membantah', order: 'md:order-1' },
  { stance: 'SUPPORTS', empty: 'Tidak ada bukti yang mendukung', order: 'md:order-3' },
];

interface EvidenceBoardProps {
  response: FactCheckResponse;
  activeId: string | null;
  onSelect: (evidenceId: string) => void;
}

/** Claim pinned in the middle, refuting evidence to its left, supporting to its right, strung together. */
export function EvidenceBoard({ response, activeId, onSelect }: EvidenceBoardProps) {
  const { evidence } = response;
  const v = verdictMeta(response);
  const boardRef = useRef<HTMLDivElement>(null);
  const claimRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const [threads, setThreads] = useState<Thread[]>([]);

  useLayoutEffect(() => {
    const board = boardRef.current;
    const claim = claimRef.current;
    if (!board || !claim) return;

    const measure = () => {
      const from = boxWithin(claim, board);
      setThreads(
        evidence.flatMap((e, i) => {
          const card = cards.current.get(e.id);
          if (!card) return [];
          const d = threadPath(from, boxWithin(card, board), i, evidence.length);
          return [{ id: e.id, d, color: STANCE[e.stance].color }];
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [evidence]);

  const cardRef = (id: string) => (el: HTMLElement | null) => {
    if (el) cards.current.set(id, el);
    else cards.current.delete(id);
  };

  // Stable entrance order across columns, in API order.
  const orderOf = new Map(evidence.map((e, i) => [e.id, i]));
  const context = evidence.filter((e) => e.stance === 'UNRELATED');
  const claim = <ClaimNode ref={claimRef} claim={response.claim_extracted} label={v.label} color={v.color} />;

  return (
    <section aria-labelledby="board-title">
      <SectionHeading
        id="board-title"
        title="Papan bukti"
        aside={
          evidence.length > 0 && (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">Pilih bukti untuk membuka berkasnya</p>
          )
        }
      />

      <div
        ref={boardRef}
        className="relative mt-6 overflow-hidden rounded-sm border border-line bg-charcoal bg-[radial-gradient(var(--color-line)_1px,transparent_1px)] bg-size-[20px_20px] p-5 sm:p-8"
      >
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
          {threads.map((t, i) => (
            <motion.path
              key={t.id}
              d={t.d}
              fill="none"
              strokeLinecap="round"
              style={{ stroke: t.color, filter: 'drop-shadow(0 2px 1px rgb(0 0 0 / 0.7))' }}
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: 1,
                strokeWidth: activeId === t.id ? 2.5 : 1.5,
                opacity: activeId && activeId !== t.id ? 0.3 : 0.9,
              }}
              transition={{
                pathLength: { delay: 0.9 + i * 0.12, duration: 0.7, ease: 'easeInOut' },
                default: { duration: 0.2 },
              }}
            />
          ))}
        </svg>

        {evidence.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-6">
            {claim}
            <p className="max-w-sm text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              Belum ada bukti untuk ditautkan ke klaim ini
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,1.15fr)_1fr] md:items-center">
            <div className="md:order-2">{claim}</div>

            {SIDES.map((side) => {
              const items = evidence.filter((e) => e.stance === side.stance);
              return (
                <div key={side.stance} className={`space-y-5 ${side.order}`}>
                  <ColumnLabel stance={side.stance} count={items.length} />
                  {items.length === 0 ? (
                    <p className="rounded-sm border border-dashed border-line-strong px-4 py-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                      {side.empty}
                    </p>
                  ) : (
                    items.map((item) => (
                      <EvidenceNode
                        key={item.id}
                        item={item}
                        order={orderOf.get(item.id) ?? 0}
                        active={activeId === item.id}
                        cardRef={cardRef(item.id)}
                        onSelect={onSelect}
                      />
                    ))
                  )}
                </div>
              );
            })}

            {context.length > 0 && (
              <div className="space-y-5 md:order-4 md:col-span-3">
                <ColumnLabel stance="UNRELATED" count={context.length} />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {context.map((item) => (
                    <EvidenceNode
                      key={item.id}
                      item={item}
                      order={orderOf.get(item.id) ?? 0}
                      active={activeId === item.id}
                      cardRef={cardRef(item.id)}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
