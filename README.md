# owi

Check Indonesian political claims against open evidence: fact-check archives, official releases, court rulings and verified reporting.

owi is an assistive tool, not a verdict. When no evidence is found it says so instead of guessing.

> **Status:** frontend only. Results come from 5 canned mock cases in `src/lib/api.ts`. There is no detection backend yet.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # production bundle in dist/
npm run lint    # strict typecheck
npm test        # node --test (Node 22.18+)
```

## Mock mode

`MOCK = true` in `src/lib/api.ts` matches claims to canned responses by keyword. Open **Pengembang** in the footer for one-click shortcuts to all 5 cases: false, true, misleading, opinion and no evidence.

To use a real backend:

1. Set `MOCK = false`.
2. Proxy `/api` in `vite.config.ts`: `server: { proxy: { '/api': 'http://localhost:8000' } }`.

Responses are checked by `parseAnalyzeResponse`. Anything that breaks the contract shows an error, not a blank page.

## API

`POST /api/analyze`

```ts
// request
{ text: string }

// response
{
  verdict: 'TRUE' | 'MISLEADING' | 'FALSE' | 'UNVERIFIABLE' | 'OPINION',
  confidence: number,            // 0..1
  claim_extracted: string,
  topic: string,
  entities: { name: string, type: 'INSTITUTION' | 'PERSON' | 'PARTY', stance: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[],
  explanation_tokens: { token: string, weight: number }[],   // LIME, -1..1
  evidence: { title: string, source: string, url: string, published: string, stance: 'SUPPORTS' | 'REFUTES' | 'UNRELATED', snippet: string }[],
  retrieval_empty: boolean,      // true → "Tidak dapat diverifikasi", confidence hidden
}
```

## Layout

```
src/
├── App.tsx             page shell, state, footer dev panel
├── types.ts            API contract types
├── lib/api.ts          MOCK flag, mock data, fetch + response validation
├── lib/verdict.ts      verdict labels and colors
└── components/         ClaimInput, VerdictCard, EvidenceList, EntityChips,
                        TokenExplanation, HistorySidebar, ResultSkeleton
```

History lives in memory and clears on refresh. The UI follows the system light/dark setting.
