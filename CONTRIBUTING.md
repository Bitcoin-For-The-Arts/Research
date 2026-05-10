# Contributing to Bitcoin for the Arts Research

Thank you for your interest in contributing to the research arm of Bitcoin For The Arts, Inc. Our credibility is the asset. Contributors are part of how we protect it.

Before contributing, please read:

- **[README.md](README.md)** — what this repository is
- **[ETHOS.md](ETHOS.md)** — what we cover, what we do not, and why
- **[METHODOLOGY.md](METHODOLOGY.md)** — the evidence standard
- **[CITATIONS.md](CITATIONS.md)** — how we cite, how to cite us
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — contributor conduct

---

## Who can contribute

Anyone whose contribution helps us hold a higher evidence standard. In particular, we welcome:

- **Researchers, economists, public-finance specialists, and nonprofit-finance professionals** — propose reports, contribute data appendices, peer-review existing drafts, audit chart data, file corrections.
- **Arts administrators and program officers** — share public budget documents, grant rolls, and appropriation records.
- **Data volunteers and developers** — clean datasets, structure JSON files, map state and municipal arts spending, build tools that read our datasets.
- **Translators** — extend our research beyond English so global creators and global funders can use it.
- **Writers and editors** — tighten language, eliminate hype, hold the institutional voice.
- **Designers** — improve chart legibility, typography, and the PDF print-stylesheet for downloadable reports.

We do **not** publish work that conflicts with the [ETHOS.md](ETHOS.md). If you are unsure, open a [GitHub Discussion](https://github.com/Bitcoin-For-The-Arts/Research/discussions) before investing time.

---

## Types of contribution

### 1. Corrections and source updates

The most valuable contributions are corrections to published reports.

**To submit a correction:**

1. Open a [GitHub issue](https://github.com/Bitcoin-For-The-Arts/Research/issues) labeled `correction`, or email `info@bitcoinforthearts.org` with subject `BFTA Research correction`.
2. Include:
   - The report title and section
   - The exact claim or data point
   - The primary source you are referencing, with page, table, or line number when applicable
   - Optional: a proposed corrected text

We will acknowledge receipt, assess the correction against the source hierarchy in [METHODOLOGY.md](METHODOLOGY.md), and — if the correction stands — update the report and its "last reviewed" date. Prior versions remain in git history. Corrections are public.

### 2. New data

If you have access to a primary source we are missing — a state arts agency budget, a municipal culture-office expenditure, a foundation 990, a national arts council appropriations table — we want it.

**To contribute data:**

1. Open a pull request adding the dataset to `data/`, with:
   - The dataset itself, as JSON or CSV
   - A `README.md` in the relevant subfolder describing the data, the primary source, the field definitions, and the "last accessed" date
   - The source added to the registry in [CITATIONS.md](CITATIONS.md) if it is new
2. The dataset should match the shape used by existing reports in the [BFTA main repo](https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts) — see `data/research/*.json` there for the canonical structure.

### 3. New report proposals

A new report is a substantial commitment. Before drafting, please open an issue using the *Report proposal* template with:

- Working title
- One-paragraph thesis
- Why this report belongs alongside existing BFTA research (in scope per [ETHOS.md](ETHOS.md))
- Outline (proposed sections)
- Primary sources you intend to draw on (5–15 named sources expected)
- Whether you intend to draft, contribute data only, or sponsor someone else's draft

We will respond with a scope note. Approved proposals are added to the roadmap in [README.md](README.md) and assigned a slug for `reports/<slug>/`.

### 4. Existing-report contributions

For substantive contributions to an already-published report:

1. Fork the repo and create a feature branch from `main`.
2. Make changes in the relevant `reports/<slug>/` folder, with primary-source citations for every changed fact.
3. Update the report's "last reviewed" date and add a revision-history entry.
4. Open a pull request describing what you changed and why, with links to every source.

A maintainer reviews the change against the methodology before merging.

### 5. Articles and newsletters

Long-form research articles and newsletter editions live in `articles/` and `newsletters/` respectively. These are mirrors of, or precursors to, formal reports. The same evidence standard applies. See those folders' READMEs for the file layout.

### 6. Media

Charts, figures, and report illustrations live in `media/`. See `media/README.md` for the labeling standard, including how AI-generated imagery is disclosed.

### 7. Translations

To translate a report:

1. Open an issue stating which report and which language.
2. Create `reports/<slug>/translations/<lang>/` with the translated text.
3. Translations are reviewed by a second speaker of the target language whenever possible before merge.

---

## Style and voice

We write in the register of a federal statistical agency or a major foundation's research arm. Plain. Precise. Footnoted. Confident without being loud.

- **No advocacy language** ("we must," "the urgent need," "shocking," "alarming"). Let the numbers carry the argument.
- **No partisan framing.** Public policy is described mechanically.
- **No hype around Bitcoin.** Bitcoin is analyzed as monetary technology, not celebrated.
- **Define terms once** in [GLOSSARY.md](GLOSSARY.md) and use them consistently across reports.
- **Cite at the sentence, not the paragraph.** If a sentence asserts a fact, a footnote should point a reader to the source.
- **Disclose limitations.** Preliminary, proposed, lagged, revised, or estimated data is labeled.

---

## Pull request process

1. **Fork** and create a feature branch from `main`. Name branches descriptively: `data/state-arts-fy2027`, `correction/arpa-cliff-section-3`, `report/multiplier-effect-draft`.
2. **Make focused commits** with clear messages. Prefer one logical change per commit.
3. **Open a pull request** against `main`. Include:
   - What you changed and why
   - Links to every primary source used
   - The "last reviewed" date update, if applicable
4. **Review.** A maintainer will check the change against [METHODOLOGY.md](METHODOLOGY.md). Expect questions about sourcing — they are not personal, they are the standard.
5. **Merge.** Once the change meets the standard, it is merged and reflected on the live portal at [bitcoinforthearts.org/research](https://bitcoinforthearts.org/research) on the next deploy.

### Commit message conventions

- `data: add NASAA FY2027 state appropriations table`
- `report: ARPA Cliff — update Boston FY2027 figure to adopted budget`
- `correction: ARPA Cliff — fix NLC 2026 deadline reference`
- `docs: clarify AI-imagery disclosure in METHODOLOGY`
- `media: add chart-4 for State of Arts Funding 2026`

---

## License

By contributing, you agree that your contributions will be licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE), the same license that governs this repository.

Primary sources cited within your contribution retain their original copyrights and terms of use. Do not commit copyrighted material you do not have permission to redistribute.

---

## Conduct

Participation in this repository is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Short version: be precise, be respectful, and let the evidence carry the disagreement.

---

## Questions

- General: `info@bitcoinforthearts.org`
- Press / partnerships: `hello@bitcoinforthearts.org`
- GitHub Discussions: https://github.com/Bitcoin-For-The-Arts/Research/discussions
- GitHub Issues: https://github.com/Bitcoin-For-The-Arts/Research/issues
