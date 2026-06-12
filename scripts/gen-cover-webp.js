#!/usr/bin/env node
/**
 * One-time backfill: generate WebP siblings for existing local cover images.
 * Run: node scripts/gen-cover-webp.js
 *
 * Scope: only property_images rows with isCover = 1 AND isLocal = 1 (~one per
 * property), NOT the full image library. New uploads already get a .webp
 * sibling from the upload pipeline in server.js, so this only fills the gap for
 * images that existed before that change.
 *
 * Safe to re-run: skips images whose .webp sibling already exists.
 */

'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'osaka-minshuku.db');
const COMPRESS_MAX_WIDTH = 1920;
const COMPRESS_QUALITY = 80;

const db = new Database(DB_PATH, { readonly: true });

const covers = db
  .prepare('SELECT url FROM property_images WHERE isCover = 1 AND isLocal = 1')
  .all();

console.log(`Found ${covers.length} local cover image(s).`);

let made = 0, skipped = 0, failed = 0;

(async () => {
  for (const { url } of covers) {
    if (!url) { skipped++; continue; }
    // url may be stored with a leading slash and/or a ?cache-buster query;
    // strip both to resolve the file on disk. The .webp sibling is named
    // <path>.webp (matching attachWebpUrl / the upload pipeline in server.js).
    const rel = url.replace(/^\//, '').split('?')[0];
    const src = path.join(ROOT, rel);
    const dest = src + '.webp';

    if (!fs.existsSync(src)) {
      console.warn(`  missing source, skipped: ${rel}`);
      skipped++;
      continue;
    }
    if (fs.existsSync(dest)) { skipped++; continue; }

    try {
      await sharp(src)
        .resize({ width: COMPRESS_MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: COMPRESS_QUALITY })
        .toFile(dest);
      made++;
      console.log(`  ✓ ${rel} -> ${path.basename(dest)}`);
    } catch (e) {
      failed++;
      console.warn(`  ✗ ${rel}: ${e.message}`);
    }
  }
  console.log(`\nDone. created=${made} skipped=${skipped} failed=${failed}`);
})();
