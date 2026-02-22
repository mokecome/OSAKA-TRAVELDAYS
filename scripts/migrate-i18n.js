#!/usr/bin/env node
/**
 * One-time migration: translate existing property content to ja and en.
 * Run: node --env-file=.env scripts/migrate-i18n.js
 *
 * Requires ANTHROPIC_API_KEY in .env.
 * Safe to re-run: skips properties already in multilingual format.
 */

'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'osaka-minshuku.db');
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not set. Run with: node --env-file=.env scripts/migrate-i18n.js');
  process.exit(1);
}

const db = new Database(DB_PATH);

// Simple string fields to translate
const STRING_FIELDS = ['name', 'shortDesc', 'introduction', 'transportInfo', 'transportDetail',
                       'badge', 'secondaryBadge', 'address', 'nearestStation'];

function safeParseJSON(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch (e) { return []; }
}

function isAlreadyMultilingual(val) {
  if (!val) return false;
  if (typeof val === 'string' && val.startsWith('{')) {
    try { const o = JSON.parse(val); return !!(o['zh-TW'] || o['ja'] || o['en']); } catch(e) {}
  }
  return false;
}

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) throw new Error('Claude API error: ' + res.status + ' ' + await res.text());
  const data = await res.json();
  return data.content[0].text.trim();
}

async function translateProperty(prop) {
  // Check if already migrated (all non-empty string fields are multilingual JSON)
  const alreadyDone = STRING_FIELDS.every(f => !prop[f] || isAlreadyMultilingual(prop[f]));
  if (alreadyDone) {
    // Also check quickInfo and spaceIntro
    const qi = safeParseJSON(prop.quickInfo);
    const si = safeParseJSON(prop.spaceIntro);
    const allQiDone = qi.every(item =>
      (!item.title || isAlreadyMultilingual(item.title)) &&
      (!item.value || isAlreadyMultilingual(item.value)) &&
      (!item.desc  || isAlreadyMultilingual(item.desc))
    );
    const allSiDone = si.every(item =>
      (!item.title || isAlreadyMultilingual(item.title)) &&
      (!item.desc  || isAlreadyMultilingual(item.desc))
    );
    if (allQiDone && allSiDone) {
      console.log(`  [SKIP] ${prop.id} — already multilingual`);
      return null;
    }
  }

  // Collect all text items to translate in one API call
  const allItems = [];

  // Simple string fields
  for (const f of STRING_FIELDS) {
    if (prop[f] && !isAlreadyMultilingual(prop[f])) {
      allItems.push({ key: f, val: prop[f] });
    }
  }

  // quickInfo sub-fields
  const qi = safeParseJSON(prop.quickInfo);
  qi.forEach((item, i) => {
    if (item.title && !isAlreadyMultilingual(item.title)) allItems.push({ key: `qi${i}title`, val: item.title });
    if (item.value && !isAlreadyMultilingual(item.value)) allItems.push({ key: `qi${i}value`, val: item.value });
    if (item.desc  && !isAlreadyMultilingual(item.desc))  allItems.push({ key: `qi${i}desc`,  val: item.desc });
  });

  // spaceIntro sub-fields
  const si = safeParseJSON(prop.spaceIntro);
  si.forEach((item, i) => {
    if (item.title && !isAlreadyMultilingual(item.title)) allItems.push({ key: `si${i}title`, val: item.title });
    if (item.desc  && !isAlreadyMultilingual(item.desc))  allItems.push({ key: `si${i}desc`,  val: item.desc });
  });

  if (allItems.length === 0) return null;

  const prompt = `You are translating Japanese vacation rental property content.
Translate each item from Traditional Chinese to both Japanese (ja) and English (en).
Return a JSON object mapping each key to {"ja":"...","en":"..."}.
Be natural and appropriate for a hospitality context.
Do NOT translate URLs, numbers, or symbols.

Items to translate:
${JSON.stringify(Object.fromEntries(allItems.map(x => [x.key, x.val])), null, 2)}

Return ONLY valid JSON, no explanation.`;

  const raw = await callClaude(prompt);

  // Parse response — handle ```json ... ``` wrapping
  let translations;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    translations = JSON.parse(match ? match[0] : raw);
  } catch (e) {
    throw new Error('Failed to parse Claude response: ' + raw.substring(0, 200));
  }

  // Build update object
  const updates = {};

  // Simple string fields
  for (const { key, val } of allItems.filter(x => STRING_FIELDS.includes(x.key))) {
    const t = translations[key] || {};
    updates[key] = JSON.stringify({ 'zh-TW': val, ja: t.ja || val, en: t.en || val });
  }

  // quickInfo
  if (qi.length > 0) {
    const newQi = qi.map((item, i) => {
      const newItem = { ...item };
      if (item.title) {
        const t = translations[`qi${i}title`] || {};
        newItem.title = isAlreadyMultilingual(item.title)
          ? item.title
          : JSON.stringify({ 'zh-TW': item.title, ja: t.ja || item.title, en: t.en || item.title });
      }
      if (item.value) {
        const t = translations[`qi${i}value`] || {};
        newItem.value = isAlreadyMultilingual(item.value)
          ? item.value
          : JSON.stringify({ 'zh-TW': item.value, ja: t.ja || item.value, en: t.en || item.value });
      }
      if (item.desc) {
        const t = translations[`qi${i}desc`] || {};
        newItem.desc = isAlreadyMultilingual(item.desc)
          ? item.desc
          : JSON.stringify({ 'zh-TW': item.desc, ja: t.ja || item.desc, en: t.en || item.desc });
      }
      return newItem;
    });
    updates.quickInfo = JSON.stringify(newQi);
  }

  // spaceIntro
  if (si.length > 0) {
    const newSi = si.map((item, i) => {
      const newItem = { ...item };
      if (item.title) {
        const t = translations[`si${i}title`] || {};
        newItem.title = isAlreadyMultilingual(item.title)
          ? item.title
          : JSON.stringify({ 'zh-TW': item.title, ja: t.ja || item.title, en: t.en || item.title });
      }
      if (item.desc) {
        const t = translations[`si${i}desc`] || {};
        newItem.desc = isAlreadyMultilingual(item.desc)
          ? item.desc
          : JSON.stringify({ 'zh-TW': item.desc, ja: t.ja || item.desc, en: t.en || item.desc });
      }
      return newItem;
    });
    updates.spaceIntro = JSON.stringify(newSi);
  }

  return updates;
}

async function main() {
  const props = db.prepare('SELECT * FROM properties').all();
  console.log(`Found ${props.length} properties to process.\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const prop of props) {
    console.log(`Processing: ${prop.id} (${prop.name})`);
    try {
      const updates = await translateProperty(prop);
      if (!updates) { skipped++; continue; }

      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(updates), prop.id];
      db.prepare(`UPDATE properties SET ${setClauses} WHERE id = ?`).run(...values);

      console.log(`  [OK] ${prop.id} — translated ${Object.keys(updates).length} fields`);
      success++;

      // Avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  [FAIL] ${prop.id}: ${err.message}`);
      failed++;
    }
  }

  db.close();
  console.log(`\nDone. Success: ${success}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
