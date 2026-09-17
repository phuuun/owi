"""
Collect Indonesian fact-check articles from turnbackhoax.id (Mafindo) into owi's
AnalyzeResponse-shaped schema.

Why this source: robots.txt is fully open (`Disallow:` — nothing blocked), and every
article embeds schema.org ClaimReview JSON-LD plus labeled sections (Narasi / Hasil
Periksa Fakta / Penjelasan / Referensi) — claim, verdict and evidence are already
structured on the page, no manual labeling needed to bootstrap a dataset.

Do NOT point this pattern at kompas.com or cekfakta.kompas.com: their robots.txt
explicitly prohibits automated data mining and dataset/ML use, and by-name-blocks
ClaudeBot, Scrapy, and ~40 other bots. See scripts/README.md.

Usage:
    pip install requests beautifulsoup4 lxml
    python scripts/scrape_turnbackhoax.py --start-id 36400 --end-id 36650
    python scripts/scrape_turnbackhoax.py --pages 10          # walk recent listing pages instead

Output:
    buzzer_data/canonical/turnbackhoax.jsonl   (one record per line, append-only, deduped)
    buzzer_data/raw/turnbackhoax/<id>.html      (raw page cache — re-runs never re-fetch)
"""
from __future__ import annotations

import argparse
import json
import random
import re
import time
from dataclasses import dataclass, asdict
from html import unescape
from pathlib import Path
from typing import Iterable

import requests
from bs4 import BeautifulSoup

BASE = "https://turnbackhoax.id"
ROOT = Path("./buzzer_data")
RAW = ROOT / "raw" / "turnbackhoax"
CANONICAL = ROOT / "canonical"
for p in (RAW, CANONICAL):
    p.mkdir(parents=True, exist_ok=True)
OUT_PATH = CANONICAL / "turnbackhoax.jsonl"

# Identify honestly and give a contact route — good practice for a small academic project,
# and it's how a site operator tells your traffic apart from an attack if something goes wrong.
HEADERS = {
    "User-Agent": "owi-factcheck-collector/0.1 (student project; contact: sinambeladavid087@gmail.com)"
}

# turnbackhoax.id/articles/{id} resolves regardless of slug, so slugs never need scraping first.
REQUEST_DELAY_RANGE = (1.5, 3.0)  # polite jitter; no Crawl-delay is set, this is a self-imposed floor
MAX_RETRIES = 3

# Mafindo's rating vocabulary -> owi's VerdictType (src/types.ts). Extend as you observe more
# alternateName values in the wild; anything unmapped falls through to UNVERIFIABLE rather than
# guessing, matching owi's "no evidence / no confident label -> say so" policy.
VERDICT_MAP = {
    "salah": "FALSE",
    "hoaks": "FALSE",
    "penipuan": "FALSE",
    "konten yang dimanipulasi": "FALSE",
    "konten palsu": "FALSE",
    "benar": "TRUE",
    "sebagian benar": "MISLEADING",
    "menyesatkan": "MISLEADING",
    "satire": "OPINION",
    "parodi": "OPINION",
}


@dataclass
class FactCheckRecord:
    source_id: str
    url: str
    title: str
    verdict_raw: str | None
    verdict: str  # owi VerdictType
    claim_extracted: str
    explanation: str
    published: str | None
    author_org: str | None
    evidence: list[dict]  # [{title, source, url, published, stance, snippet}]
    _collected_at: str
    _collector: str = "turnbackhoax-scraper-0.1"


def fetch(url: str, session: requests.Session) -> str | None:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.get(url, headers=HEADERS, timeout=15)
        except requests.RequestException as exc:
            print(f"  [retry {attempt}] {url}: {exc}")
            time.sleep(2 * attempt)
            continue
        if resp.status_code == 200:
            return resp.text
        if resp.status_code == 404:
            return None
        if resp.status_code == 429:
            wait = int(resp.headers.get("Retry-After", 10))
            print(f"  [429] backing off {wait}s")
            time.sleep(wait)
            continue
        print(f"  [http {resp.status_code}] {url}")
        time.sleep(2 * attempt)
    return None


def strip_html(node) -> str:
    if node is None:
        return ""
    return unescape(re.sub(r"\s+", " ", node.get_text(" ", strip=True)))


def parse_article(html: str, url: str) -> FactCheckRecord | None:
    soup = BeautifulSoup(html, "lxml")

    ld_tag = soup.find("script", {"type": "application/ld+json"})
    claim_review = {}
    if ld_tag and ld_tag.string:
        try:
            claim_review = json.loads(ld_tag.string)
        except json.JSONDecodeError:
            claim_review = {}

    title = strip_html(soup.find("title")).split(" | ")[0]
    if not title:
        return None

    verdict_raw = (claim_review.get("reviewRating") or {}).get("alternateName")
    verdict = VERDICT_MAP.get((verdict_raw or "").strip().lower(), "UNVERIFIABLE")
    published = (claim_review.get("itemReviewed") or {}).get("datePublished")
    author_org = (claim_review.get("author") or {}).get("name")

    # Select the content <div> inside each section, not the "Narasi"/"Penjelasan" <strong> label.
    narasi = strip_html(soup.select_one(".article-origin div"))
    penjelasan = strip_html(soup.select_one(".article-explanation div"))

    references = []
    for a in soup.select(".article-references a[href]"):
        href = a["href"].strip()
        if href:
            references.append(href)

    evidence = [
        {
            "title": None,  # not fetched here: see scripts/README.md "fetching cited sources"
            "source": None,
            "url": ref_url,
            "published": None,
            "stance": "SUPPORTS" if verdict == "TRUE" else "REFUTES" if verdict == "FALSE" else "UNRELATED",
            "snippet": None,
        }
        for ref_url in references
    ]

    return FactCheckRecord(
        source_id=url.rstrip("/").rsplit("/", 1)[-1].split("-", 1)[0],
        url=url,
        title=title,
        verdict_raw=verdict_raw,
        verdict=verdict,
        claim_extracted=narasi or title,
        explanation=penjelasan,
        published=published,
        author_org=author_org,
        evidence=evidence,
        _collected_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    )


def load_seen_ids() -> set[str]:
    if not OUT_PATH.exists():
        return set()
    seen = set()
    with OUT_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            if line.strip():
                seen.add(json.loads(line)["source_id"])
    return seen


def collect_by_id_range(start_id: int, end_id: int) -> Iterable[str]:
    for i in range(start_id, end_id + 1):
        yield f"{BASE}/articles/{i}"


def collect_from_listing(pages: int, session: requests.Session) -> Iterable[str]:
    seen_urls: set[str] = set()
    for page in range(1, pages + 1):
        html = fetch(f"{BASE}/articles?page={page}", session)
        if not html:
            break
        for m in re.finditer(rf'href="({re.escape(BASE)}/articles/\d+-[^"]+)"', html):
            if m.group(1) not in seen_urls:
                seen_urls.add(m.group(1))
                yield m.group(1)
        time.sleep(random.uniform(*REQUEST_DELAY_RANGE))


def run(urls: Iterable[str]) -> None:
    session = requests.Session()
    seen_ids = load_seen_ids()
    n_written = n_skipped = n_missing = 0

    with OUT_PATH.open("a", encoding="utf-8") as out:
        for url in urls:
            article_id = url.rstrip("/").rsplit("/", 1)[-1].split("-", 1)[0]
            if article_id in seen_ids:
                n_skipped += 1
                continue

            cache_path = RAW / f"{article_id}.html"
            if cache_path.exists():
                html = cache_path.read_text(encoding="utf-8")
            else:
                html = fetch(url, session)
                time.sleep(random.uniform(*REQUEST_DELAY_RANGE))
                if html is None:
                    n_missing += 1
                    continue
                cache_path.write_text(html, encoding="utf-8")

            record = parse_article(html, url)
            if record is None:
                n_missing += 1
                continue

            out.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")
            out.flush()
            seen_ids.add(article_id)
            n_written += 1
            print(f"  [{n_written}] {record.verdict:<12} {record.title[:70]}")

    print(f"\nwritten={n_written} skipped(seen)={n_skipped} missing/404={n_missing}")
    print(f"-> {OUT_PATH}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--start-id", type=int, help="backfill: first numeric article id")
    mode.add_argument("--pages", type=int, help="crawl N pages of the recent-articles listing instead")
    ap.add_argument("--end-id", type=int, help="backfill: last numeric article id (required with --start-id)")
    args = ap.parse_args()

    if args.start_id is not None:
        if args.end_id is None:
            ap.error("--end-id is required with --start-id")
        urls = collect_by_id_range(args.start_id, args.end_id)
    else:
        urls = collect_from_listing(args.pages, requests.Session())

    run(urls)


if __name__ == "__main__":
    main()
