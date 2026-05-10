#!/usr/bin/env node
// Validate every JSON dataset in data/reports/ and the matching Markdown
// narrative in reports/<slug>/report.md:
//   - JSON file parses; required fields present
//   - every sourceIds reference in heroStats and charts resolves to sources[].id
//   - every [^N] footnote in report.md points to sources[N-1]
//   - every {{chart:id}} placeholder in report.md resolves to a chart in JSON
//
// Exits non-zero on any failure so CI can gate on this.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const dataDir = join(repoRoot, 'data', 'reports');
const reportsDir = join(repoRoot, 'reports');

const REQUIRED_REPORT_FIELDS = ['slug', 'title', 'byline', 'lastReviewed', 'sources'];

let failed = 0;

for (const file of readdirSync(dataDir).sort()) {
  if (!file.endsWith('.json')) continue;
  const path = join(dataDir, file);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`${file}: failed to parse — ${err.message}`);
    failed++;
    continue;
  }

  if (file === 'reports.json') {
    if (!Array.isArray(parsed)) {
      console.error(`${file}: expected top-level array`);
      failed++;
      continue;
    }
    console.log(`${file}: ok (${parsed.length} entries)`);
    continue;
  }

  const missing = REQUIRED_REPORT_FIELDS.filter((k) => parsed[k] === undefined);
  if (missing.length) {
    console.error(`${file}: missing required field(s): ${missing.join(', ')}`);
    failed++;
    continue;
  }

  const sourceIds = new Set(parsed.sources.map((s) => s.id));
  const referenced = [
    ...(parsed.heroStats ?? []).flatMap((h) => h.sourceIds ?? []),
    ...(parsed.charts ?? []).flatMap((c) => c.sourceIds ?? []),
  ];
  const dangling = [...new Set(referenced.filter((id) => !sourceIds.has(id)))];

  if (dangling.length) {
    console.error(`${file}: dangling sourceIds → ${dangling.join(', ')}`);
    failed++;
    continue;
  }

  console.log(
    `${file}: ok (${sourceIds.size} sources, ${referenced.length} references, ` +
      `${parsed.heroStats?.length ?? 0} hero stats, ${parsed.charts?.length ?? 0} charts)`,
  );

  // Cross-check against reports/<slug>/report.md if it exists.
  const mdPath = join(reportsDir, parsed.slug, 'report.md');
  if (existsSync(mdPath)) {
    const md = readFileSync(mdPath, 'utf8');

    const cites = [...md.matchAll(/\[\^(\d+)\]/g)].map((m) => parseInt(m[1], 10));
    const n = parsed.sources.length;
    const outOfRange = [...new Set(cites.filter((c) => c < 1 || c > n))];
    if (outOfRange.length) {
      console.error(
        `  ${parsed.slug}/report.md: cite refs out of range (sources are 1..${n}): ${outOfRange.join(', ')}`,
      );
      failed++;
    }

    const chartIds = new Set((parsed.charts ?? []).map((c) => c.id));
    const refsToCharts = [...md.matchAll(/\{\{chart:([a-zA-Z0-9_-]+)\}\}/g)].map((m) => m[1]);
    const unknownCharts = [...new Set(refsToCharts.filter((id) => !chartIds.has(id)))];
    if (unknownCharts.length) {
      console.error(
        `  ${parsed.slug}/report.md: unknown {{chart:...}} ids: ${unknownCharts.join(', ')}`,
      );
      failed++;
    }

    const usedCites = new Set(cites);
    const unusedSources = parsed.sources.filter((_, i) => !usedCites.has(i + 1)).map((s) => s.id);
    const unusedCharts = (parsed.charts ?? [])
      .map((c) => c.id)
      .filter((id) => !refsToCharts.includes(id));
    const notes = [];
    if (unusedSources.length) notes.push(`unused sources: ${unusedSources.join(', ')}`);
    if (unusedCharts.length) notes.push(`unused charts: ${unusedCharts.join(', ')}`);
    console.log(
      `  ${parsed.slug}/report.md: ok (${cites.length} cite refs, ${refsToCharts.length} chart refs)` +
        (notes.length ? ` — note: ${notes.join('; ')}` : ''),
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed} dataset(s) failed validation.`);
  process.exit(1);
}
