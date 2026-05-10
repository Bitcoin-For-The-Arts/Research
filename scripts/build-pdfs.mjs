#!/usr/bin/env node
// build-pdfs.mjs
//
// Generates print-ready, full-narrative PDF reports for every
// Bitcoin for the Arts Research report.
//
// Reads:
//   - data/reports/<slug>.json   canonical hero stats, charts, sources
//   - reports/<slug>/report.md   canonical narrative body (Markdown)
//
// Writes:
//   - pdfs/<slug>.pdf            downloadable, full report
//
// Markdown extensions used in report.md:
//   [^N]                            citation reference; N is 1-indexed into sources[]
//   {{chart:<id>}}                  chart placeholder; resolves to a chart in JSON
//   {{hero-stats}}                  hero strip placeholder; resolves to the four heroStats
//   ::: whymatters                  "Why this matters" callout block
//   ... body ...
//   :::
//   > **Pull quote.** ...           blockquote rendered as a pull quote
//
// Usage:
//   node scripts/build-pdfs.mjs                 # build every report
//   node scripts/build-pdfs.mjs the-arpa-cliff  # build one
//
// Environment:
//   CHROME_PATH   path to Chrome / Chromium (defaults to /usr/local/bin/google-chrome)

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import puppeteer from 'puppeteer-core';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const dataDir = join(repoRoot, 'data', 'reports');
const reportsDir = join(repoRoot, 'reports');
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

mkdirSync(pdfDir, { recursive: true });
mkdirSync(debugDir, { recursive: true });

// ---------- helpers ----------

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

function formatChartValue(chart, value) {
  const v =
    Math.abs(value) >= 1000
      ? value.toLocaleString('en-US', { maximumFractionDigits: 1 })
      : value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${chart.valuePrefix ?? ''}${v}${chart.valueSuffix ?? ''}`;
}

function renderBarChartSvg(chart) {
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
          <text x="${padLeft - 12}" y="${cy + 5}" text-anchor="end" class="bar-label">${escapeHtml(d.label)}</text>
          <rect x="${x}" y="${cy - barH / 2}" width="${len}" height="${barH}" rx="3" class="bar ${isNegative ? 'bar-neg' : ''}" />
          <text x="${x + len + 8}" y="${cy + 5}" class="bar-value">${escapeHtml(formatChartValue(chart, d.value))}</text>
        </g>`;
    })
    .join('');

  return `
  <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(chart.title)}" class="chart-svg">
    <line x1="${padLeft}" y1="${top}" x2="${padLeft}" y2="${h - bottom}" class="axis" />
    ${rows}
  </svg>`;
}

function renderChartFigure(chart, report) {
  const sources = (chart.sourceIds ?? [])
    .map((id) => report.sources.find((s) => s.id === id))
    .filter(Boolean);
  const caption = sources.length
    ? `Source${sources.length > 1 ? 's' : ''}: ${sources.map((s) => escapeHtml(s.label)).join('; ')}.`
    : '';

  return `
  <figure class="chart">
    <figcaption class="chart-title">${escapeHtml(chart.title)}</figcaption>
    <p class="chart-description">${escapeHtml(chart.description ?? '')}</p>
    ${renderBarChartSvg(chart)}
    ${caption ? `<p class="chart-source">${caption}</p>` : ''}
  </figure>`;
}

function renderHeroStats(report) {
  if (!report.heroStats?.length) return '';
  const items = report.heroStats
    .map((stat) => {
      const refs = (stat.sourceIds ?? [])
        .map((id) => {
          const i = report.sources.findIndex((s) => s.id === id);
          return i >= 0 ? `<a href="#ref-${escapeHtml(report.sources[i].id)}">[${i + 1}]</a>` : null;
        })
        .filter(Boolean)
        .join(' ');
      return `
        <div class="hero-stat">
          <div class="hero-value">${escapeHtml(stat.value)}</div>
          <div class="hero-label">${escapeHtml(stat.label)}</div>
          <p class="hero-context">${escapeHtml(stat.context)}${refs ? ` <sup>${refs}</sup>` : ''}</p>
        </div>`;
    })
    .join('');
  return `<div class="hero-strip">${items}</div>`;
}

function renderReferencesBlock(report) {
  return `
    <ol class="references-list">
      ${report.sources
        .map(
          (s, i) => `
        <li id="ref-${escapeHtml(s.id)}">
          <span class="ref-n">[${i + 1}]</span>
          <span class="ref-body">${escapeHtml(s.label)}. <a href="${escapeHtml(s.href)}">${escapeHtml(s.href)}</a></span>
        </li>`,
        )
        .join('')}
    </ol>`;
}

// ---------- markdown ----------

function parseFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

// Convert ::: whymatters ... ::: fenced callouts to HTML before marked sees them.
// Convert {{chart:id}} and {{hero-stats}} to safe placeholder tokens that survive
// markdown rendering and can be substituted afterwards.
function preprocessMarkdown(md) {
  // ## Heading {#anchor}   → strip the anchor; we re-apply it as an id attribute
  // via a post-render pass on the rendered <h2>.
  // Embed the anchor in a comment marker that survives marked.
  md = md.replace(
    /^(#{1,6})\s+(.+?)\s*\{#([a-zA-Z0-9_-]+)\}\s*$/gm,
    (_, hashes, title, id) => `${hashes} ${title}\n<!--anchor:${id}-->`,
  );
  // ::: whymatters \n ... \n :::
  md = md.replace(
    /^:::\s*whymatters\s*\n([\s\S]*?)\n:::\s*$/gm,
    (_, body) => `\n<aside data-callout="whymatters">\n${body}\n</aside>\n`,
  );
  // {{chart:id}}
  md = md.replace(/\{\{chart:([a-zA-Z0-9_-]+)\}\}/g, (_, id) => `\n<div data-chart="${id}"></div>\n`);
  // {{hero-stats}}
  md = md.replace(/\{\{hero-stats\}\}/g, () => `\n<div data-hero-stats="true"></div>\n`);
  return md;
}

// After marked, replace placeholder divs with rendered HTML, replace footnote
// references [^N] with superscript links, and identify blockquotes that begin
// with "Pull quote." as pullquotes.
function postprocessHtml(html, report) {
  // <h2>Title</h2>\n<!--anchor:id-->  → <h2 id="id">Title</h2>
  html = html.replace(
    /<(h[1-6])>([\s\S]*?)<\/\1>\s*<!--anchor:([a-zA-Z0-9_-]+)-->/g,
    (_, tag, inner, id) => `<${tag} id="${id}">${inner}</${tag}>`,
  );

  // chart placeholders
  html = html.replace(/<div data-chart="([a-zA-Z0-9_-]+)"><\/div>/g, (_, id) => {
    const chart = report.charts?.find((c) => c.id === id);
    if (!chart) {
      console.error(`  warning: unknown chart id "${id}" in report ${report.slug}`);
      return '';
    }
    return renderChartFigure(chart, report);
  });

  // hero-stats placeholder
  html = html.replace(/<div data-hero-stats="true"><\/div>/g, () => renderHeroStats(report));

  // footnote refs [^N] -> superscript link to references
  html = html.replace(/\[\^(\d+)\]/g, (_, nStr) => {
    const n = parseInt(nStr, 10);
    const source = report.sources?.[n - 1];
    if (!source) return `<sup>[${nStr}]</sup>`;
    return `<sup class="cite"><a href="#ref-${escapeHtml(source.id)}">[${n}]</a></sup>`;
  });

  // blockquotes starting with <strong>Pull quote.</strong> => pullquote class
  html = html.replace(
    /<blockquote>\s*<p>\s*<strong>Pull quote\.<\/strong>\s*/g,
    '<blockquote class="pullquote"><p>',
  );

  // promote callout asides to <div class="callout"> with heading
  html = html.replace(
    /<aside data-callout="whymatters">([\s\S]*?)<\/aside>/g,
    (_, body) => `<div class="callout"><div class="callout-label">Why this matters</div>${body.trim()}</div>`,
  );

  return html;
}

function renderReportBody(report, reportMd) {
  const { meta, body } = parseFrontMatter(reportMd);
  const preprocessed = preprocessMarkdown(body);
  const rendered = marked.parse(preprocessed, { gfm: true, breaks: false });
  const post = postprocessHtml(rendered, report);
  return { meta, html: post };
}

// ---------- top-level document ----------

function renderHTML(report, reportMd) {
  const { meta, html: body } = renderReportBody(report, reportMd);
  const kicker = meta.kicker || '';
  const status = meta.status || 'Version 1.0';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(report.title)} — Bitcoin for the Arts Research</title>
<style>
  @page {
    size: Letter;
    margin: 0.85in 0.75in 0.85in 0.75in;
    @bottom-left   { content: "Bitcoin for the Arts Research"; font: 9pt "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif; color: #555; }
    @bottom-center { content: "${escapeHtml(report.title)}"; font: 9pt "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif; color: #555; }
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
    font: 10.5pt/1.55 "Liberation Serif", "Tinos", "DejaVu Serif", "Charter", Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--rule); word-break: break-word; }
  sup { font-size: 0.72em; vertical-align: super; line-height: 0; }
  sup.cite a { border: none; font-weight: 600; }

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
  .cover .lockup .org em { color: var(--accent); font-style: normal; font-weight: 700; }
  .cover .lockup .meta {
    font: 9pt/1.4 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--muted); text-align: right;
  }
  .cover h1 {
    font: 700 42pt/1.05 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    letter-spacing: -0.01em; margin: 0 0 0.35in 0; max-width: 6.2in;
  }
  .cover .dek {
    font: 400 14pt/1.5 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    color: var(--ink); max-width: 6.2in; margin: 0 0 0.55in 0;
  }
  .byline-block {
    border-top: 1px solid var(--rule); padding-top: 0.3em;
    font: 9pt/1.5 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--muted);
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.4em 1.5em; max-width: 6.2in;
  }
  .byline-block strong { color: var(--ink); font-weight: 600; }

  /* ----- body ----- */
  .body {
    padding-top: 0.05in;
  }
  .body h2 {
    font: 700 17pt/1.15 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    margin: 0.5in 0 0.12in 0;
    border-top: 1px solid var(--rule);
    padding-top: 0.18in;
    page-break-after: avoid;
  }
  .body section:first-of-type h2,
  .body h2:first-of-type { margin-top: 0.05in; border-top: none; padding-top: 0; }
  .body p {
    margin: 0 0 0.14in 0;
    text-align: justify;
    hyphens: auto;
  }
  .body p + p { text-indent: 0; }
  .body h2 + p { margin-top: 0.05in; }

  /* hero strip embedded in body */
  .hero-strip {
    margin: 0.25in 0 0.05in 0;
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.3in 0.45in;
    page-break-inside: avoid;
  }
  .hero-stat {
    border-top: 1px solid var(--black);
    padding-top: 0.12in;
  }
  .hero-value {
    font: 700 30pt/1 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    color: var(--black);
  }
  .hero-label {
    margin-top: 0.04in;
    font: 600 9pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);
  }
  .hero-context {
    margin: 0.08in 0 0; font-size: 9.5pt; line-height: 1.45; color: var(--ink);
    text-align: left;
  }
  .hero-context sup a { border: none; }

  /* pull quotes */
  blockquote.pullquote {
    border-left: 4px solid var(--accent);
    padding: 0.08in 0.22in;
    margin: 0.28in 0;
    background: var(--cream);
  }
  blockquote.pullquote p {
    font: italic 13pt/1.5 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    margin: 0;
    text-align: left;
  }

  /* generic blockquotes (fallback) */
  blockquote {
    border-left: 3px solid var(--rule);
    margin: 0.2in 0;
    padding: 0.04in 0.18in;
    color: var(--ink);
  }

  /* Why this matters callout */
  .callout {
    background: var(--accent-soft);
    border-left: 4px solid var(--accent);
    padding: 0.18in 0.24in; margin: 0.28in 0;
    page-break-inside: avoid;
  }
  .callout-label {
    font: 700 9pt/1 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);
    margin-bottom: 0.08in;
  }
  .callout p { margin: 0 0 0.08in 0; text-align: left; }
  .callout p:last-child { margin: 0; }

  /* charts */
  .chart { margin: 0.32in 0; page-break-inside: avoid; }
  .chart-title {
    font: 700 12pt/1.3 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    margin-bottom: 0.04in;
  }
  .chart-description {
    margin: 0 0 0.12in 0; font-size: 10pt; color: var(--ink); line-height: 1.5;
    text-align: left;
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
    text-align: left;
  }

  /* references */
  .references { page-break-before: always; }
  .references h2 {
    border-top: none; padding-top: 0; margin-top: 0;
    font: 700 17pt/1.15 "Liberation Serif", "Tinos", "DejaVu Serif", Georgia, serif;
    margin-bottom: 0.18in;
  }
  .references-list {
    list-style: none; padding: 0; margin: 0;
  }
  .references-list li {
    padding: 0.08in 0; border-bottom: 1px solid var(--rule);
    font-size: 10pt; line-height: 1.5;
    display: grid; grid-template-columns: 0.45in 1fr; gap: 0.1in;
  }
  .ref-n {
    font: 700 10pt/1.5 "Liberation Sans", "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    color: var(--accent);
  }
  .ref-body a { font-size: 9.5pt; color: var(--muted); }

  /* colophon */
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
        ${escapeHtml(kicker || status)}<br />
        Last reviewed ${escapeHtml(report.lastReviewed)}
      </div>
    </div>

    ${kicker ? `<div class="kicker">${escapeHtml(kicker)}</div>` : ''}
    <h1>${escapeHtml(report.title)}</h1>
    <p class="dek">A full report from Bitcoin for the Arts Research. Every figure is traceable to a primary source listed in the References block at the end of this document. The institutional byline is "Bitcoin for the Arts Research" — there are no personal bylines on BFTA reports.</p>

    <div class="byline-block">
      <div><strong>Byline</strong><br />${escapeHtml(report.byline)}</div>
      <div><strong>Last reviewed</strong><br />${escapeHtml(report.lastReviewed)}</div>
      <div><strong>Status</strong><br />${escapeHtml(status)}</div>
      <div><strong>License</strong><br />Creative Commons Attribution 4.0 (CC&nbsp;BY&nbsp;4.0)</div>
      <div style="grid-column: 1 / -1;"><strong>Citation</strong><br />Bitcoin for the Arts Research. (2026). <em>${escapeHtml(report.title)}</em>. Bitcoin For The Arts, Inc. https://bitcoinforthearts.org/research/${escapeHtml(report.slug)}</div>
    </div>
  </section>

  <section class="body">
    ${body}
  </section>

  <section class="references">
    <h2>References</h2>
    ${renderReferencesBlock(report)}

    <div class="colophon">
      <strong>About this report.</strong> This PDF is generated from
      <code>data/reports/${escapeHtml(report.slug)}.json</code> and
      <code>reports/${escapeHtml(report.slug)}/report.md</code> in the public
      research repository at github.com/Bitcoin-For-The-Arts/Research using the
      build script <code>scripts/build-pdfs.mjs</code>. Every figure in this
      report is derived from the same JSON dataset and the primary sources
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
  const reportPath = join(reportsDir, slug, 'report.md');

  if (!existsSync(dataPath)) throw new Error(`No dataset at ${dataPath}`);
  if (!existsSync(reportPath)) throw new Error(`No report markdown at ${reportPath}`);

  const report = JSON.parse(readFileSync(dataPath, 'utf8'));
  const reportMd = readFileSync(reportPath, 'utf8');

  const html = renderHTML(report, reportMd);
  writeFileSync(join(debugDir, `${slug}.html`), html);

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
