#!/usr/bin/env node
// build-pdfs.mjs
//
// Generates print-ready PDF briefs for every Bitcoin for the Arts Research
// report. Reads canonical chart-data JSON from data/reports/<slug>.json and
// renders each report through an inline HTML template, piped through headless
// Chrome to produce pdfs/<slug>.pdf.
//
// The output is a v1 research brief:
//   - cream background, black text, serif body
//   - orange + lime accents
//   - hero strip with the report's four headline statistics
//   - charts rendered inline as SVG, derived directly from the JSON
//   - source caption beneath every chart
//   - References block at the end, numbered, with permanent URLs
//   - institutional byline (Bitcoin for the Arts Research) and last-reviewed date
//
// Usage:
//   node scripts/build-pdfs.mjs               # builds every report
//   node scripts/build-pdfs.mjs the-arpa-cliff # builds one
//
// Environment:
//   CHROME_PATH     path to Chrome / Chromium (defaults to /usr/local/bin/google-chrome)

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const dataDir = join(repoRoot, 'data', 'reports');
const pdfDir = join(repoRoot, 'pdfs');
const debugDir = join(repoRoot, 'pdfs', '.debug-html');

const CHROME_PATH =
  process.env.CHROME_PATH ||
  (existsSync('/usr/local/bin/google-chrome')
    ? '/usr/local/bin/google-chrome'
    : existsSync('/usr/bin/google-chrome')
      ? '/usr/bin/google-chrome'
      : existsSync('/usr/bin/chromium')
        ? '/usr/bin/chromium'
        : null);

if (!CHROME_PATH) {
  console.error(
    'No Chrome/Chromium binary found. Set CHROME_PATH env var to the location of headless Chrome.',
  );
  process.exit(1);
}

const slugArg = process.argv[2];

const SLUGS = slugArg
  ? [slugArg]
  : readdirSync(dataDir)
      .filter((f) => f.endsWith('.json') && f !== 'reports.json')
      .map((f) => f.replace(/\.json$/, ''))
      .sort();

const REPORT_ABSTRACTS = {
  'state-of-arts-funding-2026':
    "BFTA's annual anchor document on public, private, and non-state-dependent funding of the arts in the United States, with the global research mandate as backdrop. The report establishes the funding landscape, documents the collapse of 2024–2026, traces who is hurt first, summarizes the market response from foundations and individual donors, and concludes with the analytical case for non-state-dependent funding.",
  'the-arpa-cliff':
    'A research brief on how temporary American Rescue Plan arts relief moved through federal, state, and local systems — and what happens as those dollars run off at the end of 2026. Built from primary sources at the National Endowment for the Arts, the U.S. Treasury, the National League of Cities, the National Assembly of State Arts Agencies, Arts Midwest, and individual state and municipal recovery programs.',
  'sound-money-for-the-arts':
    "BFTA's analytical case for why fiat debasement hits working artists harder than most professions — gig income, no equity capital, limited ability to time markets — and why Bitcoin-native endowments change the funding horizon for arts institutions. Analyzes purchasing-power decay of historical arts grants, the limits of traditional endowment spending rules under monetary expansion, and Bitcoin reserve durability over multi-decade horizons.",
};

const REPORT_SECTIONS = {
  'state-of-arts-funding-2026': [
    'Executive summary',
    'The funding landscape today',
    'The collapse: 2024–2026',
    'Who gets hurt',
    'The market response',
    'The case for non-state-dependent funding',
  ],
  'the-arpa-cliff': [
    'What the cliff actually looks like',
    'Why cities cannot replace the cliff',
    'Who gets hit first',
    'What Bitcoin has to do with this',
    'State-by-state source table',
  ],
  'sound-money-for-the-arts': [
    'Why working artists are exposed',
    'Purchasing power decay',
    'Traditional endowment limits',
    'Bitcoin reserve durability',
    'Risks, caveats, and fiduciary framing',
  ],
};

const REPORT_KICKERS = {
  'state-of-arts-funding-2026': 'Flagship annual report',
  'the-arpa-cliff': 'Deep-dive #1',
  'sound-money-for-the-arts': 'Deep-dive #2',
};

mkdirSync(pdfDir, { recursive: true });
mkdirSync(debugDir, { recursive: true });

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const formatValue = (chart, value) => {
  const v =
    Math.abs(value) >= 1000
      ? value.toLocaleString('en-US', { maximumFractionDigits: 1 })
      : value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${chart.valuePrefix ?? ''}${v}${chart.valueSuffix ?? ''}`;
};

function renderBarChart(chart) {
  const w = 660;
  const padLeft = 170;
  const padRight = 24;
  const rowH = 38;
  const barH = 22;
  const top = 8;
  const bottom = 8;
  const innerW = w - padLeft - padRight;
  const maxRaw = Math.max(...chart.data.map((d) => Math.abs(d.value)));
  const max = maxRaw === 0 ? 1 : maxRaw * 1.05;
  const h = top + bottom + rowH * chart.data.length;

  const rows = chart.data
    .map((d, i) => {
      const cy = top + i * rowH + rowH / 2;
      const len = (Math.abs(d.value) / max) * innerW;
      const isNegative = d.value < 0;
      const x = padLeft;
      return `
        <g>
          <text x="${padLeft - 12}" y="${cy + 5}" text-anchor="end" class="bar-label">${escape(d.label)}</text>
          <rect x="${x}" y="${cy - barH / 2}" width="${len}" height="${barH}" rx="3" class="bar ${isNegative ? 'bar-neg' : ''}" />
          <text x="${x + len + 8}" y="${cy + 5}" class="bar-value">${escape(formatValue(chart, d.value))}</text>
        </g>`;
    })
    .join('');

  return `
  <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(chart.title)}" class="chart-svg">
    <line x1="${padLeft}" y1="${top}" x2="${padLeft}" y2="${h - bottom}" class="axis" />
    ${rows}
  </svg>`;
}

function renderChart(chart, report) {
  const sources = (chart.sourceIds ?? [])
    .map((id) => report.sources.find((s) => s.id === id))
    .filter(Boolean);
  const caption = sources.length
    ? `Source${sources.length > 1 ? 's' : ''}: ${sources
        .map((s) => escape(s.label))
        .join('; ')}.`
    : '';

  return `
  <figure class="chart">
    <figcaption class="chart-title">${escape(chart.title)}</figcaption>
    <p class="chart-description">${escape(chart.description ?? '')}</p>
    ${renderBarChart(chart)}
    ${caption ? `<p class="chart-source">${caption}</p>` : ''}
  </figure>`;
}

function renderHeroStat(stat, report, idx) {
  const sourceCaption = (stat.sourceIds ?? [])
    .map((id) => {
      const i = report.sources.findIndex((s) => s.id === id);
      return i >= 0 ? `[${i + 1}]` : null;
    })
    .filter(Boolean)
    .join(' ');

  return `
    <div class="hero-stat">
      <div class="hero-value">${escape(stat.value)}</div>
      <div class="hero-label">${escape(stat.label)}</div>
      <p class="hero-context">${escape(stat.context)}${sourceCaption ? ` <sup>${sourceCaption}</sup>` : ''}</p>
    </div>`;
}

function renderReferences(report) {
  return report.sources
    .map(
      (s, i) => `
      <li id="ref-${escape(s.id)}">
        <span class="ref-n">[${i + 1}]</span>
        <span class="ref-body">${escape(s.label)}. <a href="${escape(s.href)}">${escape(s.href)}</a></span>
      </li>`,
    )
    .join('');
}

function renderHTML(report, slug) {
  const abstract = REPORT_ABSTRACTS[slug] ?? '';
  const sections = REPORT_SECTIONS[slug] ?? [];
  const kicker = REPORT_KICKERS[slug] ?? 'Research brief';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escape(report.title)} — Bitcoin for the Arts Research</title>
<style>
  /* ----- BFTA Research print-brief stylesheet ----- */

  @page {
    size: Letter;
    margin: 0.85in 0.75in 0.85in 0.75in;
    @bottom-left   { content: "Bitcoin for the Arts Research"; font: 9pt "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif; color: #555; }
    @bottom-center { content: "${escape(report.title)}"; font: 9pt "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif; color: #555; }
    @bottom-right  { content: "Page " counter(page) " of " counter(pages); font: 9pt "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif; color: #555; }
  }
  @page :first { @bottom-left { content: ""; } @bottom-center { content: ""; } @bottom-right { content: ""; } }

  :root {
    --cream: #FFFAF0;
    --black: #0A0A0A;
    --ink:   #1A1A1A;
    --muted: #555;
    --rule:  #D9D2C4;
    --accent: #FF4F14;
    --accent-soft: #FFE7DC;
    --lime: #B3FF48;
  }

  html, body { background: var(--cream); color: var(--ink); margin: 0; padding: 0; }
  body {
    font: 11pt/1.55 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Font aliases used throughout — keep changes here to retune the whole brief */
  .ff-serif { font-family: "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif; }
  .ff-sans  { font-family: "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif; }
  a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--rule); word-break: break-word; }
  sup { font-size: 0.72em; vertical-align: super; line-height: 0; }

  .kicker {
    font: 600 9pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
  }

  /* ----- cover ----- */

  .cover { page-break-after: always; padding-top: 0.2in; }
  .cover .lockup {
    display: flex; align-items: baseline; justify-content: space-between;
    border-bottom: 2px solid var(--black); padding-bottom: 0.4em; margin-bottom: 0.9in;
  }
  .cover .lockup .org {
    font: 700 12pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  .cover .lockup .org em {
    color: var(--accent); font-style: normal; font-weight: 700;
  }
  .cover .lockup .meta {
    font: 9pt/1.4 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--muted); text-align: right;
  }

  .cover h1 {
    font: 700 44pt/1.05 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    letter-spacing: -0.01em;
    margin: 0 0 0.35in 0;
    max-width: 6in;
  }
  .cover .dek {
    font: 400 14pt/1.5 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    color: var(--ink); max-width: 6.2in; margin: 0 0 0.55in 0;
  }
  .byline-block {
    border-top: 1px solid var(--rule); padding-top: 0.3em;
    font: 9pt/1.5 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--muted);
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.4em 1.5em; max-width: 6.2in;
  }
  .byline-block strong { color: var(--ink); font-weight: 600; }

  /* hero strip on the cover */
  .hero-strip {
    margin-top: 0.7in;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.4in 0.5in;
  }
  .hero-stat { border-top: 1px solid var(--black); padding-top: 0.18in; }
  .hero-value {
    font: 700 36pt/1 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    color: var(--black);
  }
  .hero-value::first-letter { color: inherit; }
  .hero-label {
    margin-top: 0.05in;
    font: 600 9pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);
  }
  .hero-context {
    margin: 0.12in 0 0; font-size: 10pt; line-height: 1.45; color: var(--ink);
  }

  /* ----- body ----- */

  .body { padding-top: 0.05in; }
  .body h2 {
    font: 700 18pt/1.15 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    margin: 0.45in 0 0.12in 0;
    border-top: 1px solid var(--rule);
    padding-top: 0.18in;
    page-break-after: avoid;
  }
  .body h2.first { margin-top: 0; border-top: none; padding-top: 0; }
  .body h3 {
    font: 700 11pt/1.15 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted);
    margin: 0.25in 0 0.08in 0;
  }
  .body p { margin: 0 0 0.16in 0; }
  .body .lead { font-size: 12.5pt; line-height: 1.6; }

  .pullquote {
    border-left: 4px solid var(--accent);
    padding: 0.08in 0.18in;
    margin: 0.25in 0;
    font-size: 12pt; font-style: italic; color: var(--ink);
    background: var(--cream);
  }

  .callout {
    background: var(--accent-soft);
    border-left: 4px solid var(--accent);
    padding: 0.18in 0.22in; margin: 0.25in 0;
  }
  .callout .label {
    font: 700 9pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);
    margin-bottom: 0.06in;
  }

  /* ----- charts ----- */

  .chart { margin: 0.32in 0; page-break-inside: avoid; }
  .chart-title {
    font: 700 12pt/1.3 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    margin-bottom: 0.04in;
  }
  .chart-description {
    margin: 0 0 0.12in 0; font-size: 10pt; color: var(--ink); line-height: 1.5;
  }
  .chart-svg { width: 100%; height: auto; }
  .chart-svg .axis { stroke: var(--ink); stroke-width: 1; }
  .chart-svg .bar { fill: var(--accent); }
  .chart-svg .bar-neg { fill: var(--ink); }
  .chart-svg .bar-label {
    font: 600 10pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    fill: var(--ink);
  }
  .chart-svg .bar-value {
    font: 700 10pt/1 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    fill: var(--ink);
  }
  .chart-source {
    margin: 0.06in 0 0 0;
    font: 9pt/1.45 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--muted);
  }

  /* ----- planned sections list ----- */

  .planned-sections {
    margin: 0.25in 0;
    padding: 0; list-style: none;
    border-top: 1px solid var(--rule);
  }
  .planned-sections li {
    padding: 0.12in 0; border-bottom: 1px solid var(--rule);
    font: 11pt/1.4 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    display: flex; gap: 0.18in; align-items: baseline;
  }
  .planned-sections .n {
    font: 700 10pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--accent);
    width: 0.4in; flex: 0 0 0.4in;
  }

  /* ----- references ----- */

  .references { page-break-before: always; }
  .references h2 { border-top: none; padding-top: 0; margin-top: 0; }
  .references ol {
    list-style: none; padding: 0; margin: 0;
    counter-reset: ref;
  }
  .references li {
    padding: 0.08in 0; border-bottom: 1px solid var(--rule);
    font-size: 10pt; line-height: 1.5;
    display: grid; grid-template-columns: 0.45in 1fr; gap: 0.1in;
  }
  .references .ref-n {
    font: 700 10pt/1.5 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--accent);
  }
  .references .ref-body a { font-size: 9.5pt; color: var(--muted); }

  /* ----- colophon ----- */

  .colophon {
    margin-top: 0.4in;
    padding-top: 0.18in; border-top: 2px solid var(--black);
    font: 9pt/1.55 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--muted);
  }
  .colophon strong { color: var(--ink); font-weight: 600; }
</style>
</head>
<body>

  <section class="cover">
    <div class="lockup">
      <div class="org">Bitcoin <em>for the</em> Arts <span style="color: var(--muted); font-weight: 500; letter-spacing: 0.02em;">Research</span></div>
      <div class="meta">
        ${escape(kicker)}<br />
        Last reviewed ${escape(report.lastReviewed)}
      </div>
    </div>

    <div class="kicker">${escape(kicker)}</div>
    <h1>${escape(report.title)}</h1>
    <p class="dek">${escape(abstract)}</p>

    <div class="byline-block">
      <div><strong>Byline</strong><br />${escape(report.byline)}</div>
      <div><strong>Last reviewed</strong><br />${escape(report.lastReviewed)}</div>
      <div><strong>License</strong><br />Creative Commons Attribution 4.0 (CC&nbsp;BY&nbsp;4.0)</div>
      <div><strong>Citation</strong><br />Bitcoin for the Arts Research. (2026). <em>${escape(report.title)}</em>.</div>
    </div>

    ${
      report.heroStats?.length
        ? `<div class="hero-strip">${report.heroStats.map((s) => renderHeroStat(s, report)).join('')}</div>`
        : ''
    }
  </section>

  <section class="body">
    <h2 class="first">Abstract</h2>
    <p class="lead">${escape(abstract)}</p>

    <div class="callout">
      <div class="label">Why this brief exists</div>
      <p style="margin:0;">Bitcoin for the Arts Research is the public research program of Bitcoin For The Arts, Inc., a 501(c)(3) nonprofit. Every claim in this document is traceable to a primary source. The institutional byline is "Bitcoin for the Arts Research" — there are no personal bylines on BFTA reports. See the live web version for the full report; this PDF is the citable, print-ready brief.</p>
    </div>

    ${
      sections.length
        ? `<h2>Report structure</h2>
           <ol class="planned-sections">
             ${sections
               .map((s, i) => `<li><span class="n">${(i + 1).toString().padStart(2, '0')}</span><span>${escape(s)}</span></li>`)
               .join('')}
           </ol>`
        : ''
    }

    ${
      report.charts?.length
        ? `<h2>Headline charts</h2>
           ${report.charts.map((c) => renderChart(c, report)).join('')}`
        : ''
    }

    <h2>Where to read the full report</h2>
    <p>The complete, web-rendered version of this report — with full narrative text, source-linked footnotes, and any updates posted since this PDF was generated — lives at <a href="https://bitcoinforthearts.org/research/${escape(report.slug)}">bitcoinforthearts.org/research/${escape(report.slug)}</a>. The canonical, citable chart-data JSON behind every number in this brief is published at <a href="https://github.com/Bitcoin-For-The-Arts/Research/blob/main/data/reports/${escape(report.slug)}.json">github.com/Bitcoin-For-The-Arts/Research</a>.</p>

    <div class="pullquote">
      "If we do not have a reference, we do not publish the data. Period." — BFTA Research methodology
    </div>
  </section>

  <section class="references">
    <h2>References</h2>
    <ol>${renderReferences(report)}</ol>

    <div class="colophon">
      <strong>About this brief.</strong> This PDF is generated from
      <code>data/reports/${escape(report.slug)}.json</code> in the public
      research repository at github.com/Bitcoin-For-The-Arts/Research using the
      build script <code>scripts/build-pdfs.mjs</code>. Every figure shown in
      this brief is derived from the same JSON dataset and the primary sources
      listed above. Corrections and source updates may be submitted at
      <a href="https://github.com/Bitcoin-For-The-Arts/Research/issues">github.com/Bitcoin-For-The-Arts/Research/issues</a>
      or by emailing <a href="mailto:info@bitcoinforthearts.org">info@bitcoinforthearts.org</a>.
      <br /><br />
      <strong>Bitcoin For The Arts, Inc.</strong> is a 501(c)(3) public charity
      (EIN 41-2642260) headquartered in New York, NY, with a global research
      mandate. This document is licensed under Creative Commons Attribution 4.0
      International (CC BY 4.0).
    </div>
  </section>

</body>
</html>`;
}

async function build(slug) {
  const dataPath = join(dataDir, `${slug}.json`);
  if (!existsSync(dataPath)) {
    throw new Error(`No dataset at ${dataPath}`);
  }
  const report = JSON.parse(readFileSync(dataPath, 'utf8'));

  const html = renderHTML(report, slug);
  const htmlPath = join(debugDir, `${slug}.html`);
  writeFileSync(htmlPath, html);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const out = join(pdfDir, `${slug}.pdf`);
    await page.pdf({
      path: out,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    console.log(`Built ${out}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  for (const slug of SLUGS) {
    await build(slug);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
