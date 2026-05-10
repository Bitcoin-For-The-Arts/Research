# Reports

Full research reports published by **Bitcoin for the Arts Research**. Each report has a folder here and a live, web-rendered version at [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research).

## Index

| # | Slug | Title | Status |
|---|---|---|---|
| 1 | [`state-of-arts-funding-2026`](state-of-arts-funding-2026/) | The State of Arts Funding 2026 — flagship annual | Published v1 |
| 2 | [`the-arpa-cliff`](the-arpa-cliff/) | The ARPA Cliff — deep-dive #1 | Published v1 |
| 3 | [`sound-money-for-the-arts`](sound-money-for-the-arts/) | Sound Money for the Arts — deep-dive #2 | Published v1 |

## Folder layout (per report)

```
reports/<slug>/
├── README.md            ← cover sheet: title, byline, last reviewed, abstract, sections, sources
├── report.md            ← canonical narrative body — full prose with [^N] citations,
│                          {{chart:id}}, {{hero-stats}}, and ::: whymatters callouts
└── translations/<lang>/ ← optional translations (see CONTRIBUTING.md)
```

The chart-data JSON that backs every figure lives at [`../data/reports/<slug>.json`](../data/reports/). The downloadable PDF lives at [`../pdfs/<slug>.pdf`](../pdfs/) and is generated from `report.md` + the JSON by [`../scripts/build-pdfs.mjs`](../scripts/build-pdfs.mjs).

## Authoring conventions

- **Byline.** Every report is bylined *Bitcoin for the Arts Research*. There are no personal bylines.
- **Last reviewed.** Every report's README displays the date a human reviewer last verified every citation.
- **Citations.** Numbered footnotes per [`CITATIONS.md`](../CITATIONS.md).
- **Data.** Chart numbers come from versioned data files, never from hardcoded prose.
- **Evidence standard.** Every claim follows [`METHODOLOGY.md`](../METHODOLOGY.md).
- **Scope.** Every report stays inside [`ETHOS.md`](../ETHOS.md).

To propose a new report, see [`CONTRIBUTING.md`](../CONTRIBUTING.md).
