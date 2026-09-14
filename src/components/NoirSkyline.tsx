import { useId } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const W = 1440;
const H = 560;
const STEP_H = 14;
const DECK_Y = H - 150;
const LAMP = '#e9b949';
const FILM_INK = '#efe7d6';

/** Mulberry32: a tiny seeded PRNG, so the city is the same on every render. */
function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Building {
  x: number;
  w: number;
  top: number;
  steps: number;
  spire: boolean;
  antenna: boolean;
}

function layer(seed: number, [minH, maxH]: [number, number], [minW, maxW]: [number, number]): Building[] {
  const rand = prng(seed);
  const buildings: Building[] = [];
  for (let x = -30; x < W + 30; ) {
    const w = minW + rand() * (maxW - minW);
    const h = minH + rand() * (maxH - minH);
    buildings.push({ x, w, top: H - h, steps: Math.floor(rand() * 3), spire: rand() < 0.14, antenna: rand() < 0.3 });
    x += w + (rand() < 0.35 ? 4 + rand() * 12 : -2);
  }
  return buildings;
}

const bodyTop = (b: Building) => b.top + b.steps * STEP_H;

const FAR = layer(7, [200, 400], [44, 110]);
const MID = layer(21, [130, 300], [56, 130]);
const NEAR = layer(42, [60, 150], [80, 170]);

const WINDOWS = (() => {
  const rand = prng(99);
  const lit: { x: number; y: number; flicker: boolean; delay: number }[] = [];
  for (const b of MID) {
    for (let y = bodyTop(b) + 10; y < H - 40; y += 16) {
      for (let x = b.x + 7; x < b.x + b.w - 9; x += 11) {
        if (rand() < 0.08) lit.push({ x, y, flicker: rand() < 0.2, delay: rand() * 6 });
      }
    }
  }
  return lit;
})();

const standOn = (x: number) => {
  const b = NEAR.find((n) => n.x <= x && n.x + n.w >= x);
  return b ? bodyTop(b) : H - 100;
};
const TOWER = { x: 1180, y: standOn(1180) };
const MAST = { x: 380, y: standOn(380) };

const BEAMS = [
  { x: 300, y: 330, from: -24, to: 12, duration: 11 },
  { x: 1010, y: 290, from: 20, to: -14, duration: 14 },
];

/** Art-deco setbacks: a body plus up to two narrower tiers, with an optional spire or antenna. */
function Tower({ b }: { b: Building }) {
  const top = bodyTop(b);
  const cx = b.x + b.w / 2;
  return (
    <>
      <rect x={b.x} y={top} width={b.w} height={H - top} />
      {Array.from({ length: b.steps }, (_, i) => {
        const inset = b.w * 0.12 * (i + 1);
        return <rect key={i} x={b.x + inset} y={top - STEP_H * (i + 1)} width={b.w - inset * 2} height={STEP_H + 1} />;
      })}
      {b.spire && <polygon points={`${cx - 5},${b.top + 1} ${cx + 5},${b.top + 1} ${cx},${b.top - 44}`} />}
      {b.antenna && !b.spire && <rect x={cx - 1} y={b.top - 30} width={2} height={31} />}
    </>
  );
}

/**
 * Night city behind the hero: moon, sweeping searchlights, three depths of
 * rooftops with lamp-lit windows, and an elevated train crossing now and then.
 * Far layers drift slower on scroll for depth.
 */
export function NoirSkyline() {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const farY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 90]);
  const midY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 45]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-14 left-1/2 -z-10 h-[640px] w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_28%,black_70%,transparent)]"
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`beam-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={FILM_INK} stopOpacity="0.14" />
            <stop offset="1" stopColor={FILM_INK} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`glow-${uid}`} cx="0.76" cy="0.26" r="0.5">
            <stop offset="0" stopColor={FILM_INK} stopOpacity="0.07" />
            <stop offset="1" stopColor={FILM_INK} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill={`url(#glow-${uid})`} />

        <motion.g style={{ y: farY }}>
          <circle cx="1090" cy="150" r="66" fill={FILM_INK} opacity="0.08" />
          <circle cx="1090" cy="150" r="86" fill="none" stroke={FILM_INK} strokeOpacity="0.05" />

          {BEAMS.map((beam) => (
            <g key={beam.x} transform={`translate(${beam.x} ${beam.y})`}>
              <motion.polygon
                points="0,0 -60,-520 60,-520"
                fill={`url(#beam-${uid})`}
                style={{ originX: 0.5, originY: 1 }}
                initial={{ rotate: beam.from }}
                animate={reduceMotion ? undefined : { rotate: [beam.from, beam.to] }}
                transition={{ duration: beam.duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              />
            </g>
          ))}

          <g fill="#25231f">
            {FAR.map((b, i) => (
              <Tower key={i} b={b} />
            ))}
          </g>
        </motion.g>

        <motion.g style={{ y: midY }}>
          <g fill="#1c1a17">
            {MID.map((b, i) => (
              <Tower key={i} b={b} />
            ))}
          </g>
          {WINDOWS.map((w, i) => (
            <rect
              key={i}
              x={w.x}
              y={w.y}
              width="4"
              height="7"
              fill={LAMP}
              opacity="0.5"
              className={w.flicker ? 'window-flicker' : undefined}
              style={w.flicker ? { animationDelay: `${w.delay}s` } : undefined}
            />
          ))}
        </motion.g>

        <g>
          {Array.from({ length: 13 }, (_, i) => (
            <rect key={i} x={i * 120 + 20} y={DECK_Y} width="8" height={H - DECK_Y} fill="#1a1816" />
          ))}
          <rect x="0" y={DECK_Y} width={W} height="12" fill="#2a2723" />
          <line x1="0" x2={W} y1={DECK_Y + 3} y2={DECK_Y + 3} stroke="#6b6458" strokeWidth="2" strokeDasharray="16 10" />
          <motion.g
            initial={{ x: reduceMotion ? 220 : -520 }}
            animate={reduceMotion ? undefined : { x: [-520, W + 40] }}
            transition={{ duration: 18, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
          >
            {[0, 1, 2].map((car) => (
              <g key={car} transform={`translate(${car * 132} ${DECK_Y - 30})`}>
                <rect width="124" height="28" rx="7" fill="#2e2b27" />
                {Array.from({ length: 7 }, (_, i) => (
                  <rect key={i} x={10 + i * 16} y="8" width="9" height="8" rx="1" fill={LAMP} opacity="0.55" />
                ))}
              </g>
            ))}
          </motion.g>
        </g>

        <g fill="#131210">
          {NEAR.map((b, i) => (
            <Tower key={i} b={b} />
          ))}

          <g transform={`translate(${TOWER.x} ${TOWER.y})`}>
            <path d="M-18 0 L-12 -40 M18 0 L12 -40 M-15 -20 L15 -20" stroke="#131210" strokeWidth="3" />
            <rect x="-20" y="-78" width="40" height="40" rx="3" />
            <polygon points="-24,-78 24,-78 0,-98" />
          </g>

          <rect x={MAST.x - 1.5} y={MAST.y - 60} width="3" height="60" />
          <circle cx={MAST.x} cy={MAST.y - 62} r="3" fill="#e0663a" className="motion-safe:animate-blink" />
        </g>
      </svg>
    </div>
  );
}
