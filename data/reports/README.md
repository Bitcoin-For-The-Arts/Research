# Report chart data

Canonical, citable chart data behind every published **Bitcoin for the Arts Research** report. Each file is the source of truth for the charts and hero statistics rendered on the live portal at [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research) and for the print-ready PDFs in [`../../pdfs/`](../../pdfs/).

## Files

| File | Report | Live page |
|---|---|---|
| [`reports.json`](reports.json) | Portal index — list of reports and metadata used by `/research` | [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research) |
| [`state-of-arts-funding-2026.json`](state-of-arts-funding-2026.json) | The State of Arts Funding 2026 | [link](https://bitcoinforthearts.org/research/state-of-arts-funding-2026) |
| [`the-arpa-cliff.json`](the-arpa-cliff.json) | The ARPA Cliff | [link](https://bitcoinforthearts.org/research/the-arpa-cliff) |
| [`sound-money-for-the-arts.json`](sound-money-for-the-arts.json) | Sound Money for the Arts | [link](https://bitcoinforthearts.org/research/sound-money-for-the-arts) |

## Schema

Each per-report JSON follows the same shape:

```jsonc
{
  "slug": "string",                  // matches the URL slug at /research/<slug>
  "title": "string",                 // report title
  "byline": "Bitcoin for the Arts Research",
  "lastReviewed": "YYYY-MM-DD",      // date a human reviewer last verified every citation
  "heroStats": [
    {
      "label": "string",             // short label shown above the number
      "value": "string",             // headline number (e.g. "$135M", "-7.7%")
      "context": "string",           // one-sentence explanation of the figure
      "sourceIds": ["string"]        // IDs that resolve to entries in `sources`
    }
  ],
  "charts": [
    {
      "id": "string",                // stable chart identifier
      "title": "string",             // chart title
      "description": "string",       // chart subhead
      "type": "bar",                 // currently bar; future: line, area, scatter
      "valuePrefix": "$",            // optional axis prefix
      "valueSuffix": "%",            // optional axis suffix
      "sourceIds": ["string"],       // IDs that resolve to entries in `sources`
      "data": [
        { "label": "string", "value": number }
      ]
    }
  ],
  "sources": [
    {
      "id": "string",                // referenced by heroStats[].sourceIds and charts[].sourceIds
      "label": "string",             // citation text (publisher, title, year as applicable)
      "href": "url"                  // permanent URL to the primary source
    }
  ]
}
```

### Conventions

- **Source IDs are content-addressable inside a file.** Every `sourceIds` entry on a hero stat or chart must resolve to a `sources[].id` in the same JSON. We do not silently drop dangling references.
- **One JSON, one report.** Per-report files are independent — copying or editing one cannot accidentally affect another.
- **`lastReviewed`** is a citation date, not a publication date. It is the day a human checked every URL in `sources[]` and every figure in `heroStats[]` and `charts[]` against the cited primary source.
- **No hardcoded chart numbers in code.** Anything rendered as a chart is read from this JSON. If a number changes, it changes here, and the live portal, this repo's text, and the downloadable PDF all consume the new value.

## Sync with the live portal

The Next.js app at [`Bitcoin-For-The-Arts/Bitcoin-For-The-Arts`](https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts) currently ships a copy of these files at `data/research/` for runtime rendering on Vercel. The copies are kept byte-identical via routine sync. **The version in this repository is the citable source of truth.** If the two ever diverge, this one wins; the app copy is the one to be updated.

A future PR will switch the Next.js app to load these files from this repository directly (via git submodule or release artifact), so there is one location, not two.

## How to update a dataset

See [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md). The short version:

1. Edit the relevant JSON file with the new numbers.
2. Update `lastReviewed` to today's date.
3. Make sure every `sourceIds` reference still resolves to an entry in `sources[]`. Update `sources[]` URLs if a primary-source location has moved.
4. Open a pull request describing what changed and why, with links to every primary source that supports the new value.

Reviewers will check the change against [`../../METHODOLOGY.md`](../../METHODOLOGY.md) before merge.

## Validating a dataset locally

A minimal Node check that every `sourceIds` reference resolves to a source entry:

```js
const fs = require('node:fs');
const path = require('node:path');

for (const file of fs.readdirSync(__dirname)) {
  if (!file.endsWith('.json') || file === 'reports.json') continue;
  const report = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  const ids = new Set(report.sources.map((s) => s.id));
  const refs = [
    ...(report.heroStats ?? []).flatMap((h) => h.sourceIds ?? []),
    ...(report.charts ?? []).flatMap((c) => c.sourceIds ?? []),
  ];
  const missing = refs.filter((r) => !ids.has(r));
  if (missing.length) {
    console.error(`${file}: dangling sourceIds → ${[...new Set(missing)].join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`${file}: ok (${ids.size} sources, ${refs.length} references)`);
  }
}
```
