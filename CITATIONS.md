# Citation standard

Every factual claim in every BFTA Research publication is traceable to a primary source. This document is the **how** of that promise — the citation format we use, the registry of primary sources we draw from, and how external authors should cite us in return.

For the broader evidence standard, see [METHODOLOGY.md](METHODOLOGY.md).

---

## How we cite, inside a report

We use **numbered footnotes** that appear as superscripts in body text and resolve to a fully-formed source entry in a *References* block at the end of the report. The reference block follows this pattern:

> *[n]* Author or issuing institution. *Title of document or page* (year). Publisher, table/page/section if applicable. URL or DOI. Last accessed YYYY-MM-DD.

### Example

> *"State arts agency appropriations entered FY2026 below FY2025."*<sup>3</sup>

> *[3]* Arts Midwest. *Public Funding for the Arts in the Midwest: 2026 by the Numbers* (2026). https://artsmidwest.org/resources/research-data/public-funding-for-the-arts-in-the-midwest-2026-by-the-numbers/. Last accessed 2026-05-10.

### Inline data

When a single statistic comes from a primary source, the source is cited at first appearance in that section and re-cited any time the figure is restated in a different section or chart caption.

### Charts

Every chart in a BFTA report has a **source caption** beneath it that names the primary source(s) by ID (e.g. `Source: NEA ARP overview; NEA ARP state and regional`). Those IDs resolve to entries in the report's source list and to the JSON data file in [`data/`](data/) that drives the chart.

### Estimates

If a number is an estimate, the report labels it (*"BFTA estimate"*) and the footnote describes the calculation, the inputs, and the inputs' primary sources.

### "Last reviewed" dates

Every report displays a **last reviewed** date in the hero. The date reflects when a human reviewer last checked every source citation against its current primary source.

---

## How to cite BFTA Research

If you are a journalist, academic, foundation officer, or fellow researcher citing this work, use:

### Short form (journalism)

> *…according to research from Bitcoin for the Arts.*

### Long form (academic / institutional)

> Bitcoin for the Arts Research. (2026). *The State of Arts Funding 2026*. Bitcoin For The Arts, Inc. https://bitcoinforthearts.org/research/state-of-arts-funding-2026

### Specific data point

> Bitcoin for the Arts Research. (2026). *The ARPA Cliff*, hero stat: "$135M NEA ARP allocation." Bitcoin For The Arts, Inc. https://bitcoinforthearts.org/research/the-arpa-cliff

The **institutional byline** is *Bitcoin for the Arts Research*. There are no personal bylines on BFTA reports.

If you need help locating a primary source behind any BFTA number, email `info@bitcoinforthearts.org` with the report and the figure in question.

---

## Primary-source registry

These are the recurring primary sources our reports draw on. The registry is not exhaustive — individual reports cite additional sources in their own reference blocks — but it captures the institutions whose data appears most often in BFTA research.

### Federal government and statistical agencies (United States)

| ID | Source | URL |
|---|---|---|
| `bea-acpsa` | U.S. Bureau of Economic Analysis — Arts and Cultural Production Satellite Account | https://www.bea.gov/data/special-topics/arts-and-cultural |
| `bls` | U.S. Bureau of Labor Statistics | https://www.bls.gov/ |
| `treasury-slfrf` | U.S. Department of the Treasury — State and Local Fiscal Recovery Funds | https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds |
| `nea-arp-overview` | National Endowment for the Arts — The American Rescue Plan | https://www.arts.gov/COVID-19/the-american-rescue-plan |
| `nea-research` | National Endowment for the Arts — Research & Analysis | https://www.arts.gov/impact/research |
| `irs-990` | IRS — Form 990 / 990-PF (public exempt-organization filings) | https://www.irs.gov/charities-non-profits/form-990-resources-and-tools |

### State and local public-finance sources

| ID | Source | URL |
|---|---|---|
| `nasaa` | National Assembly of State Arts Agencies | https://nasaa-arts.org/ |
| `nlc` | National League of Cities | https://www.nlc.org/ |
| `arts-midwest` | Arts Midwest — regional public-funding research | https://artsmidwest.org/ |

State and municipal budgets, state arts agency appropriation pages, and city culture-office budgets are cited individually per report.

### Nonprofit research and philanthropy

| ID | Source | URL |
|---|---|---|
| `candid` | Candid (Foundation Center) — foundation and nonprofit data | https://candid.org/ |
| `americans-for-arts` | Americans for the Arts | https://www.americansforthearts.org/ |
| `urban-ncs` | Urban Institute — National Center for Charitable Statistics | https://nccs.urban.org/ |
| `brookings` | Brookings Institution | https://www.brookings.edu/ |
| `pew` | Pew Research Center | https://www.pewresearch.org/ |

### International and global

| ID | Source | URL |
|---|---|---|
| `unesco-uis` | UNESCO Institute for Statistics — culture indicators | https://uis.unesco.org/ |
| `oecd-culture` | OECD — culture and creative sectors data | https://www.oecd.org/ |
| `eurostat-culture` | Eurostat — culture statistics | https://ec.europa.eu/eurostat/web/culture |

National ministries of culture, national arts councils (e.g. Arts Council England, Canada Council for the Arts, Australia Council), and equivalent statistical agencies are cited per-report.

### Bitcoin and monetary research

| ID | Source | URL |
|---|---|---|
| `bitcoin-whitepaper` | Nakamoto, S. (2008). *Bitcoin: A Peer-to-Peer Electronic Cash System.* | https://bitcoin.org/bitcoin.pdf |
| `fred` | Federal Reserve Economic Data (FRED) — monetary aggregates, CPI, M2 | https://fred.stlouisfed.org/ |
| `bls-cpi` | U.S. Bureau of Labor Statistics — Consumer Price Index | https://www.bls.gov/cpi/ |

These are the most common monetary references for our *Sound Money for the Arts* deep-dive series.

---

## Adding a new primary source

If your contribution introduces a primary source not already in the registry, please add it to the relevant section of this document in the same pull request that introduces the citation. Include the issuing institution, a permanent URL where possible, and a short note on what the source covers.

For details on the contribution process, see [CONTRIBUTING.md](CONTRIBUTING.md).
