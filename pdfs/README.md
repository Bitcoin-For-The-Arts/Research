# PDFs

Downloadable, print-ready PDF versions of **Bitcoin for the Arts Research** reports.

The standard we hold ourselves to is the American Cancer Society's *Cancer Facts & Figures* — a single, well-designed, deeply-cited PDF that a foundation officer, journalist, or academic can download, print, mark up, and place on a desk.

## Generation

PDFs are generated from the live web reports at [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research) via the same headless-Chrome workflow used for the BFTA sponsor sheet, with a print stylesheet that:

- Removes navigation chrome and interactive elements
- Adopts a serif body face for paragraph text
- Renders charts as static figures with source captions
- Keeps the institutional byline, "last reviewed" date, and full *References* block

## Layout

```
pdfs/
├── README.md
├── state-of-arts-funding-2026.pdf
├── the-arpa-cliff.pdf
└── sound-money-for-the-arts.pdf
```

Filename matches the report slug. Each PDF is regenerated and replaced whenever the underlying report is updated; the prior PDF is preserved in git history.

## Versioning

PDFs follow the report versioning scheme — `v1`, `v1.1`, `v2`, etc. — set out in [`../METHODOLOGY.md`](../METHODOLOGY.md). The PDF's "last reviewed" date matches the live web report's.

## How to cite a PDF

> Bitcoin for the Arts Research. (2026). *[Report title]* (PDF). Bitcoin For The Arts, Inc. https://bitcoinforthearts.org/research/[slug]

Page numbers in citations refer to the PDF version when relevant.

## Status

PDFs for the three v1 reports are in production. As they are exported they will be checked in here.
