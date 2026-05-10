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
├── report.md            ← full text, with numbered citations
├── data/                ← report-specific datasets (JSON/CSV) that drive charts
├── figures/             ← chart images and figures, generated from data/
├── pdf/                 ← downloadable PDF version(s) of the report
└── translations/<lang>/ ← optional translations (see CONTRIBUTING.md)
```

## Authoring conventions

- **Byline.** Every report is bylined *Bitcoin for the Arts Research*. There are no personal bylines.
- **Last reviewed.** Every report's README displays the date a human reviewer last verified every citation.
- **Citations.** Numbered footnotes per [`CITATIONS.md`](../CITATIONS.md).
- **Data.** Chart numbers come from versioned data files, never from hardcoded prose.
- **Evidence standard.** Every claim follows [`METHODOLOGY.md`](../METHODOLOGY.md).
- **Scope.** Every report stays inside [`ETHOS.md`](../ETHOS.md).

To propose a new report, see [`CONTRIBUTING.md`](../CONTRIBUTING.md).
