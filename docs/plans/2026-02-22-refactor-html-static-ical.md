# index.html Refactor + Static Fallback + iCAL Cache Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split index.html inline scripts into separate JS files, remove stale static fallback HTML, and persist the iCAL cache to SQLite so it survives server restarts.

**Architecture:**
- Three `<script>` blocks (lines 1872-2306, 2307-2522, 2525-2844) extracted to `/js/chatbot.js`, `/js/renderer.js`, `/js/i18n.js` and loaded via `<script src defer>`.
- `<div id="staticProperties">` (lines 1083-1614, ~530 lines of stale HTML) replaced with a loading spinner; renderer handles success/error states.
- `ical_cache` SQLite table added to `server.js`; cache warms from DB on startup, writes through on set, and deletes on property update.

**Tech Stack:** Vanilla JS (no build step), Express + better-sqlite3, existing `express.static` serves `/js/*` automatically.

---

## Cross-cutting notes

- All three JS files are non-module scripts. Globals defined in one file (e.g. `TRANSLATIONS`, `escHtml`, `observer`) are accessible from files loaded after it in the same page because browsers share the global scope across non-module `<script>` tags.
- Required load order: **i18n.js → renderer.js → chatbot.js** (renderer uses `escHtml` and `TRANSLATIONS` from i18n.js; chatbot is self-contained).
- Use `defer` on `<script src>` so scripts load in parallel and execute after DOM is parsed (same effect as placing at bottom of `<body>` but cleaner).
- `observer` (IntersectionObserver) stays in a small inline `<script>` block at the bottom of `<body>` and is shared as a global; renderer.js accesses it as `observer`.

---

## Task 1: Create `/js/` directory and extract i18n.js

**Files:**
- Create: `public_html/js/i18n.js`
- Modify: `public_html/index.html` (script block 3: lines 2525–2844)

**Step 1: Create `public_html/js/i18n.js`**

Copy the contents of script block 3 (the text between `<script>` on line 2525 and `</script>` on line 2844) exactly as-is into a new file. No changes to the JS content.

```
public_html/js/i18n.js
```

Contents = everything from line 2526 to line 2843 of index.html (the `const TRANSLATIONS = { ... }` block through the closing `})();`).

**Step 2: In `index.html`, replace script block 3**

Find:
```html
  <!-- Multilingual / i18n -->
  <script>
    const TRANSLATIONS = {
```
(line 2524–2525)

Replace the entire block (lines 2524–2844) with a single empty comment:
```html
  <!-- i18n loaded via /js/i18n.js -->
```

**Step 3: Add `<script src>` tags to `<head>`**

In `index.html`, after the existing `<link rel="stylesheet" href="/css/tailwind.min.css">` line (~line 34), add:

```html
  <script src="/js/i18n.js" defer></script>
```

(renderer.js and chatbot.js will be added in Tasks 2 and 3)

**Step 4: Smoke-test manually**

Open the page in browser. Language switching (中文/日本語/EN buttons) should work. Console should have no errors about `TRANSLATIONS` or `setLanguage`.

**Step 5: Commit**

```bash
git add public_html/js/i18n.js public_html/index.html
git commit -m "refactor: extract i18n script block to /js/i18n.js"
```

---

## Task 2: Extract renderer.js

**Files:**
- Create: `public_html/js/renderer.js`
- Modify: `public_html/index.html` (script block 2: lines 2307–2522)

**Step 1: Create `public_html/js/renderer.js`**

Copy the contents of script block 2 (everything between `<script>` on line 2307 and `</script>` on line 2522). The content is the `(function() { ... })();` IIFE starting with `// Dynamic Properties Renderer`.

No JS changes needed — `escHtml`, `TRANSLATIONS`, and `observer` are global bindings available at runtime.

**Step 2: In `index.html`, replace script block 2**

Remove the entire second script block (lines 2307–2522 after Task 1 renumbering may shift slightly—find by the comment `// Dynamic Properties Renderer`).

Replace with:
```html
  <!-- renderer loaded via /js/renderer.js -->
```

**Step 3: Add `<script src>` for renderer.js to `<head>`**

After the `i18n.js` script tag added in Task 1, add:

```html
  <script src="/js/renderer.js" defer></script>
```

Load order in head will now be:
```html
  <script src="/js/i18n.js" defer></script>
  <script src="/js/renderer.js" defer></script>
```

**Step 4: Verify**

Reload the page. Property cards must render from API. Region filter tabs must appear. No console errors.

**Step 5: Commit**

```bash
git add public_html/js/renderer.js public_html/index.html
git commit -m "refactor: extract dynamic renderer script to /js/renderer.js"
```

---

## Task 3: Extract chatbot.js

**Files:**
- Create: `public_html/js/chatbot.js`
- Modify: `public_html/index.html` (script block 1: lines 1872–2306)

**Step 1: Identify what to extract from script block 1**

Script block 1 (lines 1872–2306) contains TWO sections:
1. **Keep inline** (lines 1872–1913): IntersectionObserver setup + smooth scroll + header scroll effect. These must stay inline so `observer` is a global available to renderer.js.
2. **Extract** (lines 1915–2305): `// ======= FAQ Chatbot =======` through `FAQChatbot.init();`

**Step 2: Create `public_html/js/chatbot.js`**

Contents = lines 1915–2305 of index.html (the `const FAQChatbot = { ... }` block through `FAQChatbot.init();`).

**Step 3: In `index.html`, remove the chatbot section from script block 1**

The inline script block becomes only the observer+scroll code (lines 1872–1913). Delete from `// ======= FAQ Chatbot =======` (line 1915) to `FAQChatbot.init();` (line 2305), then close the script tag with `</script>`.

Result: inline `<script>` at end of body is ~40 lines instead of ~430.

**Step 4: Add `<script src>` for chatbot.js to `<head>`**

```html
  <script src="/js/i18n.js" defer></script>
  <script src="/js/renderer.js" defer></script>
  <script src="/js/chatbot.js" defer></script>
```

**Step 5: Verify**

Reload. Chat button should work. Language cycling inside chatbot should work. No console errors.

**Step 6: Commit**

```bash
git add public_html/js/chatbot.js public_html/index.html
git commit -m "refactor: extract FAQ chatbot script to /js/chatbot.js"
```

---

## Task 4: Remove static fallback HTML and add loading/error state

**Files:**
- Modify: `public_html/index.html` (lines 1081–1614)
- Modify: `public_html/js/renderer.js`

**Background:** `<div id="staticProperties">` (lines 1083–1614) contains ~530 lines of hardcoded property HTML that was a fallback for when the API fails. This HTML is stale (it doesn't reflect DB changes), creates a maintenance burden, and causes undefined behavior on failure. The API is on the same server so failures are rare; a proper error message is more honest.

**Step 1: Replace static HTML with loading spinner in `index.html`**

Find (around line 1081):
```html
    <div id="propertiesContainer" style="display:none;"></div>

    <div id="staticProperties">
```

Delete from `<div id="staticProperties">` all the way through its closing `</div>` (line 1614). That closing `</div>` ends the staticProperties div.

Replace with a loading indicator:
```html
    <div id="propertiesContainer"></div>

    <div id="propertiesLoading" class="py-24 text-center">
      <div class="inline-block w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      <p class="mt-4 text-amber-700 text-sm" data-i18n="loading.properties">載入中...</p>
    </div>
```

Note: `propertiesContainer` no longer needs `style="display:none;"` — it starts empty; the loading div is what users see initially.

**Step 2: Add `loading.properties` translation key to i18n.js**

In `public_html/js/i18n.js`, find `const TRANSLATIONS = {` and add the key to all three languages:

In `'zh-TW'` block, after `'filter.all': '全部'`:
```js
        'loading.properties': '載入中...',
        'error.properties': '載入失敗，請重新整理頁面。',
```

In `'ja'` block, same position:
```js
        'loading.properties': '読み込み中...',
        'error.properties': '読み込みに失敗しました。ページを更新してください。',
```

In `'en'` block, same position:
```js
        'loading.properties': 'Loading...',
        'error.properties': 'Failed to load. Please refresh the page.',
```

**Step 3: Update renderer.js — remove static references, add error handling**

In `public_html/js/renderer.js`, find the `renderAllRegions` function. Currently it hides `staticEl` on success. Update it to:

1. On **success** (has HTML): hide `#propertiesLoading`, show container.
2. On **failure**: hide `#propertiesLoading`, show error message in container.

Find the `renderAllRegions` function body where it assigns to `container` and `staticEl`:

```js
        var container = document.getElementById('propertiesContainer');
        var staticEl = document.getElementById('staticProperties');

        if (html) {
          container.innerHTML = html;
          container.style.display = '';
          if (staticEl) staticEl.style.display = 'none';
          // ...
        }
```

Replace with:
```js
        var container = document.getElementById('propertiesContainer');
        var loadingEl = document.getElementById('propertiesLoading');

        if (html) {
          container.innerHTML = html;
          if (loadingEl) loadingEl.style.display = 'none';
          // ... rest unchanged
        }
```

Find the `renderFilterBar` initialization IIFE (reads `staticProperties` sections to build filter bar before API responds):

```js
      // Initialize filter bar from static HTML (overridden if API succeeds)
      (function() {
        var staticProps = document.getElementById('staticProperties');
        if (!staticProps) return;
        // ...
      })();
```

**Delete this entire IIFE** — there is no more static HTML to read from.

Find the `.catch` handler in the `fetch('/api/regions')` chain:

```js
        .catch(function(err) {
          console.warn('Failed to load regions from API, using static fallback:', err);
        });
```

Replace with:
```js
        .catch(function(err) {
          console.error('Failed to load regions from API:', err);
          var loadingEl = document.getElementById('propertiesLoading');
          var container = document.getElementById('propertiesContainer');
          var lang = localStorage.getItem('lang') || 'zh-TW';
          var msg = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang] && TRANSLATIONS[lang]['error.properties'])
            || '載入失敗，請重新整理頁面。';
          if (loadingEl) loadingEl.style.display = 'none';
          if (container) container.innerHTML = '<p class="py-24 text-center text-amber-700">' + msg + '</p>';
        });
```

**Step 4: Verify**

Reload page. Loading spinner should appear briefly, then property cards. Check network tab — no more large static HTML in the DOM source. Manually break the API (e.g. temporary typo in fetch URL) and confirm error message shows instead of blank page.

**Step 5: Commit**

```bash
git add public_html/index.html public_html/js/renderer.js public_html/js/i18n.js
git commit -m "refactor: remove stale static fallback HTML, add loading/error state"
```

---

## Task 5: Persist iCAL cache to SQLite

**Files:**
- Modify: `public_html/server.js`

**Background:** `icalCache` is an in-memory `Map` (line 341). After a server restart, all cached availability data is lost, causing every first request to re-fetch the external iCal URL. Persisting to SQLite means the cache survives restarts.

**Step 1: Add `ical_cache` table to `db.exec`**

In `server.js`, find the `db.exec(\`` block (line 118) and add a new table after `site_settings`:

```js
  CREATE TABLE IF NOT EXISTS ical_cache (
    property_id TEXT PRIMARY KEY,
    blocked_dates TEXT NOT NULL DEFAULT '[]',
    fetched_at INTEGER NOT NULL
  );
```

Full location: inside the backtick template literal passed to `db.exec`, after the `site_settings` table definition and before the closing backtick.

**Step 2: Warm the in-memory cache from DB on startup**

Find line 341 (after the `db.exec` and migrations block):
```js
const icalCache = new Map(); // propertyId -> { blockedDates, fetchedAt }
```

Replace with:
```js
const icalCache = new Map(); // propertyId -> { blockedDates, fetchedAt }

// Warm cache from DB on startup
(function warmIcalCache() {
  const rows = db.prepare('SELECT property_id, blocked_dates, fetched_at FROM ical_cache').all();
  for (const row of rows) {
    icalCache.set(row.property_id, {
      blockedDates: JSON.parse(row.blocked_dates || '[]'),
      fetchedAt: row.fetched_at
    });
  }
  if (rows.length > 0) console.log(`iCal cache warmed: ${rows.length} entries`);
})();
```

**Step 3: Write through to DB when caching a new result**

Find the cache-set line in the `/api/availability/:id` handler (line ~697):
```js
    icalCache.set(req.params.id, { blockedDates, fetchedAt: Date.now() });
```

Replace with:
```js
    const now = Date.now();
    icalCache.set(req.params.id, { blockedDates, fetchedAt: now });
    db.prepare(
      'INSERT OR REPLACE INTO ical_cache (property_id, blocked_dates, fetched_at) VALUES (?, ?, ?)'
    ).run(req.params.id, JSON.stringify(blockedDates), now);
```

**Step 4: Delete from DB when clearing cache on property update**

Find the cache-delete line (~line 738):
```js
      icalCache.delete(p.id);
```

Replace with:
```js
      icalCache.delete(p.id);
      db.prepare('DELETE FROM ical_cache WHERE property_id = ?').run(p.id);
```

**Step 5: Verify**

1. Restart the server: `node --env-file=.env server.js`
2. Hit `GET /api/availability/:id` for a property with an iCal URL — response should work.
3. Restart server again.
4. Hit the same URL — the cache startup log should show "iCal cache warmed: 1 entries" and the response should be instant (no external fetch).

**Step 6: Commit**

```bash
git add public_html/server.js
git commit -m "feat: persist iCal availability cache to SQLite across server restarts"
```

---

## Final verification

After all 5 tasks:
1. `index.html` should be ~1800 lines (down from 2846), with three `<script src defer>` tags in `<head>` and one small inline script (~40 lines) at bottom of `<body>`.
2. `/js/i18n.js`, `/js/renderer.js`, `/js/chatbot.js` all exist and serve correctly (check network tab: HTTP 200, Content-Type: application/javascript).
3. Language switching, chatbot, property rendering, and region filter all work.
4. No `staticProperties` div in DOM source.
5. iCal cache rows visible in SQLite: `sqlite3 osaka-minshuku.db "SELECT * FROM ical_cache;"`
