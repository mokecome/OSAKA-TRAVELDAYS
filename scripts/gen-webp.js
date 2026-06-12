#!/usr/bin/env node
/**
 * One-time backfill: generate WebP siblings (full size + responsive widths) for
 * existing local images. New uploads already get these from the upload pipeline
 * in server.js; this fills the gap for images that predate that change.
 *
 * Run:  ~/.nvm/versions/node/v22.22.2/bin/node scripts/gen-webp.js
 *       (bare `node` is v18 and can't load better-sqlite3 — see memory.)
 *
 * Scope:
 *   - every property_images row with isLocal = 1 (covers + gallery)
 *   - the static /onepage/images/oneday_description_0N.jpg charter images
 * Hero/logo are handled separately (custom filenames, see commit notes).
 *
 * Safe to re-run: existing siblings are skipped (generateWebpVariants is
 * idempotent unless force).
 */

'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { generateWebpVariants } = require('../lib/webp');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'osaka-minshuku.db');

function collectSources() {
  const sources = new Set();

  // 1. All local property images (strip any ?cache-buster query).
  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare('SELECT url FROM property_images WHERE isLocal = 1').all();
  db.close();
  for (const { url } of rows) {
    if (!url) continue;
    const rel = url.replace(/^\//, '').split('?')[0];
    sources.add(path.join(ROOT, rel));
  }

  // 2. Static charter "說明圖" images.
  for (let n = 1; n <= 6; n++) {
    sources.add(path.join(ROOT, 'onepage', 'images', `oneday_description_0${n}.jpg`));
  }

  return [...sources];
}

(async () => {
  const sources = collectSources();
  console.log(`Processing ${sources.length} source image(s)...`);

  let made = 0, skippedMissing = 0, upToDate = 0, failed = 0;
  for (const src of sources) {
    if (!fs.existsSync(src)) { skippedMissing++; continue; }
    try {
      const created = await generateWebpVariants(src);
      if (created.length > 0) { made += created.length; console.log(`  ✓ ${path.relative(ROOT, src)} (+${created.length})`); }
      else { upToDate++; }
    } catch (e) {
      failed++;
      console.warn(`  ✗ ${path.relative(ROOT, src)}: ${e.message}`);
    }
  }

  console.log(`\nDone. variants_created=${made} sources_uptodate=${upToDate} sources_missing=${skippedMissing} failed=${failed}`);
})();
