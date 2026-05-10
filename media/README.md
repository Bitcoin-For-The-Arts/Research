# Media

Charts, figures, and report illustrations used by **Bitcoin for the Arts Research.**

```
media/
├── README.md
├── charts/      ← chart images generated from data/, used in reports
└── images/      ← hero art, section headers, motif illustrations
```

## Layout

### `charts/`

Rendered chart images (PNG, SVG) generated from versioned datasets in [`../data/`](../data/) or from the canonical chart-data JSON in the main BFTA repository. Filename pattern:

```
<report-slug>-<chart-id>.png
```

Example: `the-arpa-cliff-nea-arp-distribution.png`

Each chart in `charts/` must:

1. Be derived from a dataset whose source is documented per [`../CITATIONS.md`](../CITATIONS.md)
2. Carry a source caption when used in a report
3. Match the BFTA visual standard — black + orange + lime palette over cream backgrounds; grayscale for supporting data; ACS / Brookings seriousness

### `images/`

Hero art, section headers, and motif illustrations. Filename pattern is descriptive:

```
<report-slug>-hero.jpg
<report-slug>-section-<n>.jpg
```

### AI-generated imagery disclosure

Per [`../METHODOLOGY.md`](../METHODOLOGY.md): AI-generated imagery may be used to **depict already-verified data** in hero art, section headers, and chart-explainer images. AI imagery is **never** used to manufacture or imply data that has not been verified through the source hierarchy. Where an image is AI-generated, the file's accompanying metadata must record it.

For each AI-generated image, include a sibling text file:

```
<image-filename>.notes.txt
```

…with the following minimum fields:

```
generator: <tool used>
prompt: <prompt summary>
date: YYYY-MM-DD
depicts: <what verified data or concept the image illustrates>
verified-data-source: <citation ID(s) from CITATIONS.md>
```

This is non-negotiable. Every AI-generated image is labeled.

## Status

Seeded folder. Charts and images for the three v1 reports currently live in the main BFTA repository at `public/research/` and the per-report hero images at `public/<slug>.jpg`. As the corpus grows, the canonical chart and hero images may migrate here.

## Contributing media

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md), section *6. Media*.
