# Data

Versioned datasets that back **Bitcoin for the Arts Research** charts, tables, and statistical claims. Every published chart in a BFTA report draws its numbers from a file in this folder (or from the canonical chart-data JSON in the main BFTA repository).

## Why this folder exists

Numbers in prose are easy to misread, mis-edit, and slowly drift away from their source. Numbers in versioned data files are auditable: a contributor can open one file, see every value behind a chart, see the primary source, and see in git history every change ever made.

This is how we keep "all data must be verifiable" from being a slogan.

## Folder layout

```
data/
├── README.md
├── reports/                  ← chart-data JSON behind every published BFTA report (canonical)
├── state-arts-agencies/      ← state appropriations series (raw upstream data)
├── federal-arts-funding/     ← NEA, NEH, ARP, IMLS budgets and allocations
├── foundation-giving/        ← Candid / Foundation Center sector data
├── municipal-arts-budgets/   ← city-level culture-office budgets (added per case study)
└── international/            ← global ministries of culture, UNESCO, OECD, Eurostat
```

[`reports/`](reports/) is the **canonical, citable source of truth** for every chart and hero statistic in a published BFTA Research report. The other sub-folders hold the upstream raw data (full appropriations tables, full grant rolls, full filing dumps) from which the chart-ready slices in `reports/` are derived.

(Some folders are seeded empty until the first dataset arrives. See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) to contribute one.)

## File conventions

Each dataset is a JSON or CSV file accompanied by a short README documenting:

1. **Source** — primary-source citation, with permalink (matches an entry in [`../CITATIONS.md`](../CITATIONS.md))
2. **Last accessed** — YYYY-MM-DD date the source was last verified
3. **Geography** — what the data covers (US federal, US state, US local, international)
4. **Period** — fiscal years or calendar years covered
5. **Units** — currency, base year if real-dollar adjusted, definition
6. **Field definitions** — what each JSON key or CSV column means
7. **Known limitations** — preliminary, proposed, lagged, revised, or estimated qualifiers
8. **Used by** — which report(s) reference this dataset

### Example field definitions

```jsonc
{
  "source": "NASAA — Legislative Appropriations Annual Survey",
  "sourceHref": "https://nasaa-arts.org/research/funding/legislative-appropriations-annual-survey/",
  "lastAccessed": "2026-05-10",
  "units": "USD, nominal",
  "geography": "US, state",
  "fiscalYears": ["FY2024", "FY2025", "FY2026"],
  "knownLimitations": "Preliminary figures pending end-of-FY revisions for 4 states.",
  "data": [
    { "state": "AL", "FY2024": 1234567, "FY2025": 1200000, "FY2026": 1100000 }
  ]
}
```

## Canonical chart-data location

The canonical chart-data JSON for every published BFTA Research report now lives in this repository at [`reports/`](reports/):

- [`reports/state-of-arts-funding-2026.json`](reports/state-of-arts-funding-2026.json)
- [`reports/the-arpa-cliff.json`](reports/the-arpa-cliff.json)
- [`reports/sound-money-for-the-arts.json`](reports/sound-money-for-the-arts.json)
- [`reports/reports.json`](reports/reports.json) — portal index

The live Next.js app at [`Bitcoin-For-The-Arts/Bitcoin-For-The-Arts`](https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts) currently ships byte-identical copies of these files at `data/research/` for runtime rendering on Vercel. **This repository wins** if the two ever diverge; the app copy is the one to update. A follow-up PR will switch the Next.js app to load these files from this repository directly so there is one location, not two.

## Contributing data

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md), section *2. New data*. The short version:

1. Add the dataset under the most appropriate subfolder
2. Write its README with the seven fields above
3. Add the primary source to [`../CITATIONS.md`](../CITATIONS.md) if it is new
4. Open a pull request describing the dataset, the source, and what report(s) you expect to use it
