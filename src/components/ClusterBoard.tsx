import { useLayoutEffect, useRef, useState, type Ref } from 'react';
import { motion } from 'framer-motion';
import type { AnalyzeResponse, Cluster } from '../types';
import { percent } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { PLATFORM_LABEL } from '../lib/platform';
import { climateMeta, tone } from '../lib/climate';
import { SectionHeading } from './SectionHeading';

interface Thread {
  id: string;
  d: string;
}

// Pinned papers never hang perfectly straight.
const TILTS = [-1.2, 0.9, -0.5, 1.3, -0.9];

const THREAD_COLOR = 'var(--color-debunked)';

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
 * Thread from the post to card `i` of `n`. Threads sit behind the papers, so
 * side cards are joined facing edge to facing edge across the gutter. Stacked
 * cards (phones) hang from the post's bottom edge, fanned out so the threads
 * don't collapse into one line.
 */
function threadPath(post: Box, card: Box, i: number, n: number) {
  const SAG = 14;
  const leftOf = card.x + card.w <= post.x;
  const rightOf = card.x >= post.x + post.w;

  if (leftOf || rightOf) {
    const a = { x: leftOf ? post.x : post.x + post.w, y: post.y + post.h / 2 };
    const b = { x: leftOf ? card.x + card.w : card.x, y: card.y + card.h / 2 };
    const dx = (b.x - a.x) / 2;
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y + SAG} ${b.x - dx} ${b.y + SAG} ${b.x} ${b.y}`;
  }

  const a = { x: post.x + (post.w * (i + 1)) / (n + 1), y: post.y + post.h };
  const b = { x: card.x + card.w / 2, y: card.y };
  const dy = (b.y - a.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`;
}

function PostNode({ ref, response }: { ref: Ref<HTMLDivElement>; response: AnalyzeResponse }) {
  const { t, fmt } = useI18n();
  const c = climateMeta(response, t);
  const { post } = response;

  return (
    <div
      ref={ref}
      style={tone(c.color)}
      className="paper mx-auto max-w-md rounded-sm border-2 border-(--tone) p-5 shadow-[0_12px_32px_rgb(0_0_0/0.55)]"
    >
      <span aria-hidden="true" className="absolute -top-2 left-[calc(50%-8px)] size-4 rounded-full border-2 border-charcoal bg-lens" />
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-(--tone)">
        {post ? PLATFORM_LABEL[post.platform] : t.board.post} · {c.label}
      </p>
      <p className="mt-2 line-clamp-4 leading-snug text-ink-bright">{post ? post.title : t.caseFile.postUnavailable}</p>
      {post && <p className="mt-2 font-mono text-[11px] text-ink-muted">{t.board.commentsRead(fmt.count(post.sampled))}</p>}
    </div>
  );
}

interface ClusterNodeProps {
  item: Cluster;
  order: number;
  active: boolean;
  cardRef: (el: HTMLElement | null) => void;
  onSelect: (id: string) => void;
}

function ClusterNode({ item, order, active, cardRef, onSelect }: ClusterNodeProps) {
  const { t, fmt } = useI18n();

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + order * 0.1, duration: 0.35 }}>
      <motion.button
        ref={cardRef}
        type="button"
        onClick={() => onSelect(item.id)}
        aria-pressed={active}
        style={tone(THREAD_COLOR)}
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
          {t.board.clusterMeta(item.label, fmt.count(item.size))}
        </span>
        <span className="mt-1.5 line-clamp-3 block text-sm leading-snug text-ink-bright italic">“{item.template}”</span>
        <span className="mt-2 block font-mono text-[11px] text-ink-muted">
          {t.board.clusterStats(percent(item.similarity), item.window_minutes)}
        </span>
      </motion.button>
    </motion.div>
  );
}

interface ClusterBoardProps {
  response: AnalyzeResponse;
  activeId: string | null;
  onSelect: (clusterId: string) => void;
}

/** The post pinned in the middle, each coordination cluster strung to it. */
export function ClusterBoard({ response, activeId, onSelect }: ClusterBoardProps) {
  const { t } = useI18n();
  const { clusters } = response;
  const boardRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const [threads, setThreads] = useState<Thread[]>([]);

  useLayoutEffect(() => {
    const board = boardRef.current;
    const post = postRef.current;
    if (!board || !post) return;

    const measure = () => {
      const from = boxWithin(post, board);
      setThreads(
        clusters.flatMap((cl, i) => {
          const card = cards.current.get(cl.id);
          if (!card) return [];
          return [{ id: cl.id, d: threadPath(from, boxWithin(card, board), i, clusters.length) }];
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [clusters]);

  const cardRef = (id: string) => (el: HTMLElement | null) => {
    if (el) cards.current.set(id, el);
    else cards.current.delete(id);
  };

  // Alternate sides so the threads fan out instead of stacking on one edge.
  const sides = [clusters.filter((_, i) => i % 2 === 0), clusters.filter((_, i) => i % 2 === 1)];
  const orderOf = new Map(clusters.map((cl, i) => [cl.id, i]));
  const postNode = <PostNode ref={postRef} response={response} />;

  return (
    <section aria-labelledby="board-title">
      <SectionHeading
        id="board-title"
        title={t.board.title}
        aside={
          clusters.length > 0 && (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">{t.board.hint}</p>
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
              style={{ stroke: THREAD_COLOR, filter: 'drop-shadow(0 2px 1px rgb(0 0 0 / 0.7))' }}
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

        {clusters.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-6">
            {postNode}
            <p className="max-w-md text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              {response.sample_empty ? t.board.emptyNoComments : t.board.emptyNoClusters}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,1.15fr)_1fr] md:items-center">
            <div className="md:order-2">{postNode}</div>

            {sides.map((items, side) => (
              <div key={side} className={`space-y-5 ${side === 0 ? 'md:order-1' : 'md:order-3'}`}>
                {items.map((item) => (
                  <ClusterNode
                    key={item.id}
                    item={item}
                    order={orderOf.get(item.id) ?? 0}
                    active={activeId === item.id}
                    cardRef={cardRef(item.id)}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
