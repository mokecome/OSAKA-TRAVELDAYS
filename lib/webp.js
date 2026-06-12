'use strict';
// Shared WebP helpers used by the upload pipeline (server.js) and the one-time
// backfill scripts. Siblings are written next to the original file:
//   <src>.webp        full size (capped at WEBP_FULL_MAX width)
//   <src>.480.webp    one per WEBP_WIDTHS entry smaller than the original
// so a public URL of /a/b.jpg maps to /a/b.jpg.webp (+ /a/b.jpg.480.webp …).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WEBP_WIDTHS = [480, 960]; // responsive variants; full-size is the default
const WEBP_FULL_MAX = 1920;
const WEBP_QUALITY = 80;

// Generate WebP variants beside srcPath. Best-effort and idempotent: existing
// siblings are skipped unless opts.force. Returns the list of paths created.
async function generateWebpVariants(srcPath, opts = {}) {
  const force = !!opts.force;
  let origW;
  try {
    origW = (await sharp(srcPath).metadata()).width || WEBP_FULL_MAX;
  } catch (e) {
    return []; // unreadable / not an image — leave the original untouched
  }
  const targets = [{ dest: srcPath + '.webp', width: Math.min(origW, WEBP_FULL_MAX) }];
  for (const w of WEBP_WIDTHS) {
    if (w < origW) targets.push({ dest: `${srcPath}.${w}.webp`, width: w });
  }
  const made = [];
  for (const t of targets) {
    if (!force && fs.existsSync(t.dest)) continue;
    try {
      await sharp(srcPath)
        .resize({ width: t.width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(t.dest);
      made.push(t.dest);
    } catch (e) { /* best-effort: one failed size must not abort the rest */ }
  }
  return made;
}

// Every WebP sibling path that generateWebpVariants could have produced for a
// file — used to clean up on delete.
function webpVariantPaths(srcPath) {
  return [srcPath + '.webp', ...WEBP_WIDTHS.map((w) => `${srcPath}.${w}.webp`)];
}

// Build { webpUrl, webpSrcset } for a public image URL (which may carry a
// leading slash and/or a ?cache-buster query). Returns nulls when no full-size
// webp exists on disk. `baseDir` is the filesystem root the URL is relative to.
// webpSrcset is non-null only when at least one width variant exists, so a
// consumer can fall back to a single-source <picture> using webpUrl.
function buildWebpInfo(url, baseDir) {
  if (!url) return { webpUrl: null, webpSrcset: null };
  const qIdx = url.indexOf('?');
  const pathPart = qIdx === -1 ? url : url.slice(0, qIdx);
  const query = qIdx === -1 ? '' : url.slice(qIdx);
  const rel = pathPart.replace(/^\//, '');
  if (!fs.existsSync(path.join(baseDir, rel + '.webp'))) {
    return { webpUrl: null, webpSrcset: null };
  }
  const srcset = [];
  for (const w of WEBP_WIDTHS) {
    if (fs.existsSync(path.join(baseDir, `${rel}.${w}.webp`))) {
      srcset.push(`${pathPart}.${w}.webp${query} ${w}w`);
    }
  }
  srcset.push(`${pathPart}.webp${query} ${WEBP_FULL_MAX}w`);
  return {
    webpUrl: `${pathPart}.webp${query}`,
    webpSrcset: srcset.length > 1 ? srcset.join(', ') : null,
  };
}

module.exports = {
  WEBP_WIDTHS,
  WEBP_FULL_MAX,
  WEBP_QUALITY,
  generateWebpVariants,
  webpVariantPaths,
  buildWebpInfo,
};
