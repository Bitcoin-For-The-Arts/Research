# Charts

Rendered chart images for **Bitcoin for the Arts Research** reports. See [`../README.md`](../README.md) for the labeling standard.

## Current chart images (v1 reports)

The following render of the portal's first wave of charts is mirrored here from the live BFTA app. As the chart-generation pipeline migrates into this repository, named files (`<report-slug>-<chart-id>.png`) will replace the current numeric names.

| File | Approximate role |
|---|---|
| [`chart.png`](chart.png) | Composite / overview chart used across the portal |
| [`chart-1.png`](chart-1.png) | First chart in publication sequence |
| [`chart-2.png`](chart-2.png) | Second chart in publication sequence |
| [`chart-3.png`](chart-3.png) | Third chart in publication sequence |

The chart numbers themselves are not authoritative here — the canonical numbers behind every chart live in [`../../data/reports/`](../../data/reports/), one JSON per report. These PNG renders are derived from those datasets and the same BFTA chart style (black + orange + lime palette on cream, ACS / Brookings seriousness, source caption beneath every chart).

## Renaming and migration

The next chart-pipeline pass replaces the current numeric file names with content-addressable ones:

```
<report-slug>-<chart-id>.png
```

…for example `the-arpa-cliff-nea-arp-distribution.png` (where `nea-arp-distribution` is a `charts[].id` in `data/reports/the-arpa-cliff.json`). That sync will be done in a follow-up PR alongside automation that re-renders the PNGs from the JSON whenever a dataset changes.

## Source captions

A chart is never published without a source caption. Captions are derived from the chart's `sourceIds` and resolved against the `sources[]` block of its report JSON. The same source-resolution rule applies to chart captions in the downloadable PDFs in [`../../pdfs/`](../../pdfs/).
