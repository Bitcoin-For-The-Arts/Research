#!/usr/bin/env node
// Validate every JSON dataset in data/reports/:
//   - file parses
//   - every sourceIds reference in heroStats and charts resolves to a sources[].id
//   - top-level required fields are present
//
// Exits non-zero on any failure so CI can gate on this.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'data', 'reports');

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
}

if (failed > 0) {
  console.error(`\n${failed} dataset(s) failed validation.`);
  process.exit(1);
}
