# OWI · Online Web Investigator

Read the comment section under a social media post and report which way it leans — and whether that lean grew on its own or was driven.

**Buzzer** is the Indonesian internet term for someone paid or organised to amplify a message, opinion or brand so that it looks like the common view. OWI looks for the traces that leaves behind in a comment section: the same sentence posted by many accounts, a spike of comments in a few minutes, fresh accounts that do nothing but praise.

> **The distinction OWI is built around:** a comment section that leans hard one way is not evidence of buzzers. People genuinely agree about things. Buzzer is a claim about *coordination*, so only the `ASTROTURFED` reading asserts it, and it needs coordination markers, not a lopsided score. Critical sentiment toward a figure, party or institution is never treated as a signal.

OWI is an assistive tool, not a verdict. Its reading covers the comments it actually read, and it reports patterns across a comment section rather than accusing individual people — handles arrive masked. When it cannot read enough comments it says so instead of guessing.

The interface runs in Indonesian or English; see [Language](#language).

> **Status:** the model and the comment collectors are still being built. The API is an Express mock server that answers from 5 canned cases in `server/mock/cases/`.

## Run

```bash
npm install
npm run dev       # mock API on :8787 + web on http://localhost:3000
```

```bash
npm run build     # production bundle in dist/
npm run lint      # strict typecheck, client and server
npm test          # node --test (Node 22.18+, runs .ts directly)
```

| Env var          | Default | Used by                                                   |
| ---------------- | ------- | --------------------------------------------------------- |
| `OWI_API_PORT`   | `8787`  | mock server port and the Vite `/api` proxy target         |
| `OWI_LATENCY_MS` | `1600`  | simulated collection time, so the scanning state is visible |

## The reading

Two separate outputs, because they answer different questions.

**`climate`** — the state of the comment section as a whole:

| Value | Shown as (ID / EN) | Means |
| --- | --- | --- |
| `NEUTRAL` | Netral · Neutral | Opinions are split; no side dominates. |
| `LEANING` | Condong · Leaning | One side dominates, but the wording and timing look natural. |
| `ASTROTURFED` | Kemungkinan buzzer · Likely buzzer | Dominant *and* coordinated: template sentences, burst timing, fresh accounts. |
| `INSUFFICIENT` | Kurang data · Not enough data | Too few readable comments to judge anything. |

`ASTROTURFED` is phrased as a likelihood, not a finding: it is a model's call and the model can be wrong.

**`lean`** — *condong ke mana*: a target and a direction, e.g. Pro-Pemerintah at 71%, or `null` when no side clears the margin.

Coordination markers (`signals[].kind`) are `TEMPLATE`, `BURST`, `FRESH_ACCOUNT`, `GENERIC_PRAISE`, `NO_ARGUMENT`, `HASHTAG_PUSH` and `REPLY_RING`. Each carries a weight; `clusters[]` groups the accounts that posted the same thing at the same time.

## Mock server

`server/` runs on Node's built-in TypeScript support: no build step.

- `app.ts`: routes, validation errors, JSON 404s
- `analyze.ts`: request parsing, platform check, URL matching, fallback response
- `mock/cases/*.ts`: one file per case

The five cases are chosen to span the model, not just to fill a list:

| Case | Reading | Why it's here |
| --- | --- | --- |
| `astroturfed-ikn` | Kemungkinan buzzer | Political, two template clusters, a burst in the first half hour |
| `leaning-ppn` | Condong tapi alami | **The counterexample.** 83% against a policy, zero clusters, old accounts, five days of comments |
| `neutral-debat` | Netral | Both sides arguing with actual content |
| `astroturfed-brand` | Kemungkinan buzzer produk | Buzzers are not only political — same machinery sold to a brand |
| `insufficient-replies-off` | Kurang data | The post resolved, the comment section did not |

A link to a supported platform that matches no case comes back `INSUFFICIENT` with `sample_empty: true`, an empty sample and no token weights. A link to any other host is rejected with `UNSUPPORTED_PLATFORM` rather than pretended over. The home page lists the cases under **Contoh output**, each with its climate and a sentence on why it reads that way; the list is fetched from `/api/samples` and simply disappears when a real backend doesn't serve it.

Each case's `timeline` is a real aggregate over its whole sample, while `comments` is only the excerpt shown in the report — the tests assert the two agree (`sum(timeline.total) === post.sampled`, and the timeline's buzzer share matches `buzzer_share`).

To use a real backend, have it implement the contract below and point the proxy at it (`OWI_API_PORT`, or edit `vite.config.ts`). The client validates every response in `parseAnalyzeResponse`, so a payload that breaks the contract shows an error instead of a blank page.

## Language

The interface runs in Indonesian or English, switched with the `ID | EN` toggle in the header. The choice is kept in `localStorage` and sets `<html lang>`; Indonesian is the default.

Only OWI's own writing is translated. Comments, post titles and account handles are data and stay exactly as they were posted — an English interface reading an Indonesian comment section is the normal case.

Some of that writing comes from the API (`topic`, each `signals[].detail`, each `clusters[].label`, and the sample labels), so requests carry `Accept-Language: id` or `en` and the server answers in kind; anything other than `en` is served Indonesian. Switching language while a report is open refetches that case. Interface strings live in `src/lib/strings.ts`, where `EN` is typed against `ID` so a missing key fails `npm run lint`; the server's own messages are in `server/messages.ts`.

## API

Types live in `src/types.ts` and are shared by client and server, as is platform detection (`src/lib/platform.ts`).

`POST /api/analyze`

```ts
// request
{ url: string }   // http(s) link to a YouTube, Instagram, TikTok, X or Facebook post

// response
{
  case_id: string,                 // "OWI-2025-0142"
  checked_at: string,              // ISO datetime
  input: { kind: 'url', value: string },
  post: {                          // the post whose comments were read, or null
    platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'X' | 'FACEBOOK',
    url, title, author,
    published: string,             // YYYY-MM-DD
    comment_count: number,         // total the platform reports
    sampled: number,               // how many OWI actually read
  } | null,
  climate: 'NEUTRAL' | 'LEANING' | 'ASTROTURFED' | 'INSUFFICIENT',
  confidence: number,              // 0..1, hidden when the sample is empty
  lean: { target: string, direction: 'PRO' | 'CONTRA', share: number } | null,
  topic: string,
  breakdown: { pro: number, contra: number, neutral: number },   // shares, sum to 1
  buzzer_share: number,            // 0..1 of the sample labelled BUZZER
  entities: { name, type: 'INSTITUTION' | 'PERSON' | 'PARTY' | 'BRAND',
              stance: 'PRO' | 'CONTRA' | 'NEUTRAL', mentions: number }[],
  comments: {                      // the excerpt shown, not the whole sample
    id, author,                    // author is masked at the source: "@and***17"
    posted_at: string,             // ISO datetime
    text: string, likes: number,
    stance: 'PRO' | 'CONTRA' | 'NEUTRAL',
    label: 'BUZZER' | 'ORGANIC' | 'UNCLEAR',
    score: number,                 // 0..1 buzzer likelihood
    cluster_id: string | null,
    account: { age_days, followers, posts_per_day, default_avatar },
  }[],
  clusters: {
    id, label, size, similarity, window_minutes,
    template: string,              // shared skeleton, varying parts as […]
    comment_ids: string[],
  }[],
  signals: { id, kind: SignalKind, detail, weight, comment_ids: string[] }[],
  explanation_tokens: { token: string, weight: number }[],   // LIME, -1..1
  timeline: { start: string, total: number, buzzer: number }[],  // oldest first
  sample_empty: boolean,           // true → "Kurang data"
}
```

Errors are `{ error: { code, message } }` with status 400 (`INVALID_BODY`, `INVALID_URL`, `UNSUPPORTED_PLATFORM`, `INVALID_JSON`), 404 or 500. `message` is written for the user, in the requested language, and shown as-is.

`GET /api/samples` lists the sample cases as `{ id, climate, label, note, url }`. `GET /api/health` returns `{ status, mode }`.

## Theme

Noir detective meets black-and-white broadcast. Tailwind v4 is configured in CSS, so there is no `tailwind.config.js`: the tokens are in the `@theme` block of `src/index.css`.

| Token                                   | Value                           | Use                                        |
| --------------------------------------- | ------------------------------- | ------------------------------------------ |
| `charcoal` / `newsprint` / `slate`      | `#121212` `#1A1A1B` `#1E2022`   | page, documents, controls                  |
| `ink-bright` / `ink` / `ink-muted`      | `#FFFFFF` `#E0E0E0` `#888888`   | headings, body, metadata                   |
| `verified`                              | `#00E5FF`                       | neutral climate, genuine comments, pro     |
| `debunked`                              | `#FF3B30`                       | buzzer, clusters, coordination signals     |
| `nuanced`                               | `#FF9500`                       | leaning climate, contra                    |
| `lens`                                  | `#F5C518`                       | viewfinder, focus rings, case numbers      |

Pro and contra are deliberately not good-and-bad colours: which side a comment section favours is not a verdict on that side.

Inter is the reading face; Courier Prime is for stamps, labels and numbers. The `.crt-*` classes (scanlines, vignette, grain, rolling refresh bar) sit above the page and ignore the pointer. Motion respects `prefers-reduced-motion`: CSS loops stop, and Framer Motion drops transforms and the lens blur.

## Layout

```
server/
├── index.ts               listen on OWI_API_PORT
├── app.ts                 Express routes and error handling
├── analyze.ts             parse, platform check, match, localize, fallback response
├── messages.ts            API messages in both languages, Accept-Language parsing
├── app.test.ts
└── mock/                  MockCase type, case registry, one file per case
src/
├── App.tsx                home ↔ report transitions, archive, browser history
├── types.ts               API contract
├── lib/api.ts             fetch client + response validation
├── lib/platform.ts        platform detection, shared with the server
├── lib/strings.ts         every interface string, Indonesian and English
├── lib/i18n.tsx           language state, storage, <html lang>, strings + formatters
├── lib/climate.ts         climate/stance/signal colors and label lookups
├── lib/format.ts          dates, WIB clock times, counts, percent, hostnames
└── components/
    ├── Layout             header, language toggle, footer, CRT overlays
    ├── SearchInterrogation  viewfinder input, live platform detection
    ├── FilmCountdown      film-leader 3-2-1 loading state
    ├── NoirSkyline        night city backdrop behind the home hero
    ├── DetectiveMascot    fedora-and-shades mascot, reacts while searching
    ├── ModelInsights      model explanation, mock metrics and charts
    ├── FocusShift         blur-to-sharp lens reveal for results
    ├── CaseFileCard       climate, lean, composition, buzzer share, entities
    ├── RubberStamp        stamp-drop animation
    ├── ClusterBoard       post ↔ coordination cluster thread graph
    ├── CommentDossier     findings list + comment excerpts, redacted accounts
    ├── PostingTimeline    comment volume over time, buzzer portion shaded
    ├── TokenExplanation   LIME word weights
    └── HistorySidebar     in-memory case archive
```

The archive lives in memory and clears on refresh.
