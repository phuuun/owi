# Data collection scripts

> **Out of date since the pivot (2026-09-16).** owi now reads social media comment
> sections for buzzer coordination, not fact-check verdicts for claims. The
> TurnBackHoax scraper below collects *claim/verdict* records, which no longer map
> onto `AnalyzeResponse` — keep it if a claim-checking side quest is still wanted,
> otherwise the collector owi actually needs now is the account/comment one
> (`buzzer.ipynb`). Decide before spending more time on either.

Scrapers that feed owi's dataset. Separate from the frontend (`src/`) and from
`buzzer.ipynb` (account/coordination-behavior collection — a different unit of
analysis; see the notebook's own `#9 Validation` section).

## Don't scrape first — check for an existing dataset

For a student project, someone has usually already done this. Before running
anything below, check Kaggle:

- **[dataset hoax turnbackhoax](https://www.kaggle.com/datasets/aginanjar/dataset-hoax-turnbackhoax)**
  (aginanjar) — 15,674 TurnBackHoax articles through Oct 2024, verdict embedded
  in the title (`[SALAH]`/`[PENIPUAN]`). Closest match to owi's schema; start here.
- **[Indonesian Fact and Hoax Political News](https://www.kaggle.com/datasets/linkgish/indonesian-fact-and-hoax-political-news)**
  (M Razif Rizqullah) — bigger, adds real-news counterexamples from CNN/Kompas/
  Tempo, MIT licensed, ships its own scraper: [github.com/rizquuula/News-Scrapping](https://github.com/rizquuula/News-Scrapping).
- **[Indonesia False News(Hoax) Dataset](https://www.kaggle.com/datasets/muhammadghazimuharam/indonesiafalsenews)** —
  small, 6 years old, fine as a quick baseline for testing verdict logic.

Both TurnBackHoax datasets stop in **October 2024** — `kaggle_scrape_turnbackhoax.ipynb`
below extends them forward.

## Site clearance — checked before writing any scraper

| Site | robots.txt / ToS | Verdict |
|---|---|---|
| `turnbackhoax.id` (Mafindo) | `Disallow:` (nothing blocked) | **Use this.** |
| `cekfakta.tempo.co` | `Content-Signal: ai-train=no, use=reference` | OK for on-demand lookup/citation; do not bulk-download to train a model on their text. |
| `detik.com` | Open, but no `/cek-fakta` vertical (404) | General news only — a source of corroborating articles, not of pre-labeled verdicts. |
| `kompas.com` / `cekfakta.kompas.com` | **Explicit ban**: "prohibited... [for] the development of any software, machine learning, artificial intelligence (AI), and/or large language models"; by-name blocks `ClaudeBot`, `Scrapy`, `anthropic-ai`, ~40 others | **Do not scrape.** Even though the `cekfakta.` subdomain's own robots.txt says `Allow: /`, the parent ToS governs the whole publisher. |

Re-check a site's `robots.txt` and terms-of-use page yourself before adding it —
these change, and this table is a snapshot from 2026-09-14.

## `kaggle_scrape_turnbackhoax.ipynb`

The simple version: run it as a Kaggle notebook, same habit as always (Add Data
to attach the community dataset above as a starting point, run top to bottom,
Save Version, publish the output as a new dataset). Plain functions, no
classes or CLI flags — meant to be read and tweaked in cells, not maintained
as a library.

## `scrape_turnbackhoax.py`

The full version: same site, packaged as a proper CLI script (caching, retry,
resumable) for running locally rather than in a notebook. Collects Mafindo's
fact-check archive. Every article embeds schema.org
`ClaimReview` JSON-LD (verdict, date, author org) plus four labeled sections:
Narasi (claim), Hasil Periksa Fakta (verdict + cited source URLs), Penjelasan
(reasoning), Referensi (further reading). This mapped onto the old fact-check
contract; it does **not** map onto the current `AnalyzeResponse` in
[`../src/types.ts`](../src/types.ts).

```bash
pip install requests beautifulsoup4 lxml

# Backfill a range of numeric article IDs (IDs are sequential; the URL slug
# is decorative — /articles/36622 and /articles/36622-anything both resolve).
python scripts/scrape_turnbackhoax.py --start-id 36400 --end-id 36650

# Or walk the N most recent pages of the listing instead of guessing an ID range.
python scripts/scrape_turnbackhoax.py --pages 20
```

Output: `buzzer_data/canonical/turnbackhoax.jsonl` (one record per line,
append-only — re-running skips IDs already present) and a raw HTML cache
under `buzzer_data/raw/turnbackhoax/` (so re-parsing after a code fix never
re-hits the network). Both are gitignored; nobody should commit scraped
content.

**Politeness, not just legality:** custom `User-Agent` naming the project and
a contact email, 1.5–3s randomized delay between requests, retry with
backoff on network errors, `Retry-After` handling on 429. There's no
`Crawl-delay` in the site's robots.txt, so those numbers are a self-imposed
floor — raise them if you notice the site slowing down, never lower them to
finish faster.

### Known gaps to close next

- **`evidence[].title/source/snippet` are `null`.** The scraper only records
  the *cited* URLs (Referensi / Sumber) — it doesn't fetch and parse each one.
  A second pass (`enrich_evidence.py`, not yet written) should fetch each
  cited URL once, cache it, and pull `<title>`/OpenGraph metadata + a snippet.
  Skip this for URLs already in `turnbackhoax.jsonl` itself (self-citations).
- **`VERDICT_MAP` is incomplete.** It covers rating strings seen so far
  (`Salah`, `Benar`, `Menyesatkan`, `Penipuan`, `Satire`, ...). Run a backfill,
  then `jq -r .verdict_raw buzzer_data/canonical/turnbackhoax.jsonl | sort -u`
  to find unmapped values before trusting `verdict` at scale.
- **No language filter.** Mafindo occasionally reviews non-Indonesian viral
  claims; filter by `language` (reuse `detect_language` from
  `buzzer.ipynb` §3) if the dataset needs to stay Indonesian-only.
- **Explanation and Narasi text are single fields**, not sentence-segmented.
  If `explanation_tokens` (LIME-style) is meant to come from real model
  attributions later, this raw text is the input to that model, not a
  substitute for it — don't hand-fabricate weights.
