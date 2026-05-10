# PDFs

Downloadable, print-ready **full PDF reports** for every **Bitcoin for the Arts Research** publication. A single, well-designed, deeply-cited PDF that a foundation officer, journalist, or academic can download, print, mark up, and place on a desk.

## Current PDFs (v1)

| Report | File | Pages |
|---|---|---|
| The State of Arts Funding 2026 | [`state-of-arts-funding-2026.pdf`](state-of-arts-funding-2026.pdf) | 8 |
| The ARPA Cliff | [`the-arpa-cliff.pdf`](the-arpa-cliff.pdf) | 8 |
| Sound Money for the Arts | [`sound-money-for-the-arts.pdf`](sound-money-for-the-arts.pdf) | 8 |

Every figure in every PDF is derived from the canonical chart-data JSON at [`../data/reports/`](../data/reports/) and the full narrative text in [`../reports/<slug>/report.md`](../reports/). Every reference in the *References* block resolves to a primary source URL. The institutional byline *Bitcoin for the Arts Research* and the "last reviewed" date appear on the cover and in every page header.

## What's in each PDF

Each PDF is the **complete report** — the same narrative published at [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research), formatted for print:

1. **Cover** — kicker, title, byline block (byline / last reviewed / status / license / suggested citation).
2. **Full report body** — every section of the live report rendered from canonical Markdown, with charts placed inline, citations as numbered superscripts that link to the references block, *Why this matters* callouts, and pull quotes.
3. **Hero-statistics strip** — the four headline figures, embedded in the executive summary section where the live page places them.
4. **References** — numbered, with permanent URLs to every primary source. Each numbered citation in the body links to its entry here.
5. **Colophon** — provenance, corrections workflow, license, 501(c)(3) registration.

The web version at [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research) and the PDF are rendered from the **same canonical Markdown + JSON sources** in this repository. They are the same report in two formats.

## Sources of truth

```
data/reports/<slug>.json          ← chart data, hero stats, sources (citable)
reports/<slug>/report.md          ← full narrative body (canonical prose, [^N] citations, {{chart:id}}, {{hero-stats}}, ::: whymatters)
        │
        ▼
scripts/build-pdfs.mjs            ← reads both, renders HTML, drives headless Chrome
        │
        ▼
pdfs/<slug>.pdf                   ← downloadable full report
```

Change a number in the JSON or a paragraph in the Markdown, rerun `npm run build:pdfs`, and every downstream artifact updates. No hardcoded numbers in prose, no hardcoded prose in code.

## Generation

```bash
npm install                          # one-time
npm run validate:data                # check every source-id reference, cite ref, and chart ref resolves
npm run build:pdfs                   # build every report
node scripts/build-pdfs.mjs the-arpa-cliff   # build one
```

The build script:

1. Reads `data/reports/<slug>.json` (canonical, citable chart data + sources).
2. Reads `reports/<slug>/report.md` (canonical narrative body).
3. Pre-processes the Markdown for the BFTA report dialect — `{#anchor}` heading IDs, `[^N]` footnote refs, `{{chart:id}}` and `{{hero-stats}}` placeholders, and `::: whymatters` fenced callouts.
4. Renders Markdown through [`marked`](https://github.com/markedjs/marked) to HTML; post-processes citation refs, chart placeholders, hero-strip placeholder, and pull-quote blockquotes.
5. Embeds the body in a print-stylesheet HTML document with cover, references, and colophon.
6. Pipes the document through headless Chrome (`puppeteer-core` + the system Chrome at `CHROME_PATH`) to produce a print-ready Letter PDF.

Set the `CHROME_PATH` environment variable if your Chrome / Chromium binary is somewhere other than `/usr/local/bin/google-chrome`.

### Fonts

The template uses the open Liberation Serif family for body text and Liberation Sans for accents, with fallbacks to Tinos, DejaVu, Noto, Georgia, and system stacks. No font is downloaded at build time; the build runs against whatever the system has installed. Liberation Serif and Liberation Sans ship with most Linux distributions.

## Versioning

PDFs follow the report versioning scheme set out in [`../METHODOLOGY.md`](../METHODOLOGY.md) — `v1`, `v1.1`, `v2`, and so on. When the JSON or the Markdown changes, the PDF is regenerated and replaced; the prior PDF is preserved in git history.

The "last reviewed" date on the PDF cover and in the running header is the date a human reviewer last verified every citation. The PDF's last-reviewed date always matches the JSON dataset's `lastReviewed` field.

## Citing a PDF

> Bitcoin for the Arts Research. (2026). *[Report title]*. Bitcoin For The Arts, Inc. https://bitcoinforthearts.org/research/[slug]

Where a specific page or figure is being cited, append the page or chart ID. Chart IDs match the `charts[].id` field in the report JSON, so a citation like "*The ARPA Cliff*, chart `nea-arp-distribution`" is unambiguous and machine-resolvable.

## Roadmap

v1 is the **full report in print**: every section, every chart, every citation, every reference, every callout — generated from versioned Markdown + JSON in one repeatable build.

Future passes:

- **v1.x** — typographic polish (small-caps, refined chart axis treatment, hero photo on cover, table-of-contents page for long reports)
- **v2** — multi-format build (PDF, EPUB, accessible HTML, executive one-pager) from the same canonical sources
- **v3** — automated PDF re-generation on dataset or narrative change via GitHub Actions
