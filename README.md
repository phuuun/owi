# OWI · Online Web Investigator

Check Indonesian political claims against open evidence: fact-check archives, official releases, court rulings and verified reporting.

OWI is an assistive tool, not a verdict. When no evidence is found it says so instead of guessing.

> **Status:** the evidence database is still being built. The API is an Express mock server that answers from 5 canned cases in `server/mock/cases/`.

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
| `OWI_LATENCY_MS` | `1600`  | simulated lookup time, so the scanning state is visible    |

## Mock server

`server/` runs on Node's built-in TypeScript support: no build step.

- `app.ts`: routes, validation errors, JSON 404s
- `factCheck.ts`: request parsing, keyword/URL matching, timeline building
- `mock/cases/*.ts`: one file per case (false, true, misleading, opinion, no evidence)

Input that matches no case comes back `UNVERIFIABLE` with empty evidence and no token weights. The home page lists the cases under **Berkas contoh**; the list is fetched from `/api/samples` and simply disappears when a real backend doesn't serve it.

To use a real backend, have it implement the contract below and point the proxy at it (`OWI_API_PORT`, or edit `vite.config.ts`). The client validates every response in `parseFactCheckResponse`, so a payload that breaks the contract shows an error instead of a blank page.

## API

Types live in `src/types.ts` and are shared by client and server.

`POST /api/fact-check`

```ts
// request: exactly one of
{ text: string }   // 10..1000 chars
{ url: string }    // http(s) article link

// response
{
  case_id: string,                 // "OWI-2024-0814"
  checked_at: string,              // ISO datetime
  input: { kind: 'text' | 'url', value: string },
  verdict: 'TRUE' | 'MISLEADING' | 'FALSE' | 'UNVERIFIABLE' | 'OPINION',
  confidence: number,              // 0..1, hidden when unverifiable
  claim_extracted: string,
  topic: string,
  entities: { name, type: 'INSTITUTION' | 'PERSON' | 'PARTY', stance: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[],
  explanation_tokens: { token: string, weight: number }[],   // LIME, -1..1
  article: {                       // where the claim was found, or null
    headline, outlet, url, published, paragraphs: string[], claim_quote: string
  } | null,
  evidence: {
    id, title, source, url, snippet,
    source_type: 'FACT_CHECK' | 'OFFICIAL' | 'COURT' | 'NEWS' | 'RESEARCH',
    published: string,             // YYYY-MM-DD
    stance: 'SUPPORTS' | 'REFUTES' | 'UNRELATED',
  }[],
  timeline: { date, kind: 'CLAIM' | 'EVIDENCE', label, evidence_id: string | null }[],  // oldest first
  retrieval_empty: boolean,        // true → "Tidak dapat diverifikasi"
}
```

Errors are `{ error: { code, message } }` with status 400 (`INVALID_BODY`, `TEXT_TOO_SHORT`, `TEXT_TOO_LONG`, `INVALID_URL`, `INVALID_JSON`), 404 or 500. `message` is written for the user and shown as-is.

`GET /api/samples` lists the sample cases. `GET /api/health` returns `{ status, mode }`.

## Theme

Noir detective meets black-and-white broadcast. Tailwind v4 is configured in CSS, so there is no `tailwind.config.js`: the tokens are in the `@theme` block of `src/index.css`.

| Token                                   | Value                           | Use                                        |
| --------------------------------------- | ------------------------------- | ------------------------------------------ |
| `charcoal` / `newsprint` / `slate`      | `#121212` `#1A1A1B` `#1E2022`   | page, documents, controls                  |
| `ink-bright` / `ink` / `ink-muted`      | `#FFFFFF` `#E0E0E0` `#888888`   | headings, body, metadata                   |
| `verified`                              | `#00E5FF`                       | true, supporting evidence                  |
| `debunked`                              | `#FF3B30`                       | false, refuting evidence                   |
| `nuanced`                               | `#FF9500`                       | misleading, unverifiable                   |
| `lens`                                  | `#F5C518`                       | viewfinder, focus rings, case numbers      |

Inter is the reading face; Courier Prime is for stamps, labels and numbers. The `.crt-*` classes (scanlines, vignette, grain, rolling refresh bar) sit above the page and ignore the pointer. Motion respects `prefers-reduced-motion`: CSS loops stop, and Framer Motion drops transforms and the lens blur.

## Layout

```
server/
├── index.ts               listen on OWI_API_PORT
├── app.ts                 Express routes and error handling
├── factCheck.ts           parse, match, build response + timeline
├── app.test.ts
└── mock/                  MockCase type, case registry, one file per case
src/
├── App.tsx                home ↔ report transitions, archive, browser history
├── types.ts               API contract
├── lib/api.ts             fetch client + response validation
├── lib/verdict.ts         verdict/stance labels, stamp words, colors
├── lib/format.ts          dates, percent, hostnames
└── components/
    ├── Layout             header, footer, CRT overlays
    ├── SearchInterrogation  viewfinder input (text or URL)
    ├── FilmCountdown      film-leader 3-2-1 loading state
    ├── NoirSkyline        night city backdrop behind the home hero
    ├── DetectiveMascot    fedora-and-shades mascot, reacts while searching
    ├── ModelInsights      model explanation, mock metrics and charts
    ├── FocusShift         blur-to-sharp lens reveal for results
    ├── CaseFileCard       case folder, verdict, confidence, entities
    ├── RubberStamp        stamp-drop animation
    ├── EvidenceBoard      claim ↔ evidence thread graph
    ├── EvidenceBreakdown  source article + redacted evidence dossier
    ├── EvidenceTimeline   chronology of claim and evidence
    ├── TokenExplanation   LIME word weights
    └── HistorySidebar     in-memory case archive
```

The archive lives in memory and clears on refresh.
