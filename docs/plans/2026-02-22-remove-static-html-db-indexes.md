# Remove Static Fallback HTML + DB Index & Query Optimisation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Delete 530 lines of stale hardcoded property HTML, add two missing database indexes, and eliminate the N+1 query pattern in the regions API and SSR route.

**Architecture:**
- The `<div id="staticProperties">` block is now fully superseded by SSR (Task 4 of the previous plan). Removing it reduces index.html from ~2860 to ~2330 lines and eliminates stale maintenance burden. Three small JS references to `staticProperties` are removed alongside it.
- Two `CREATE INDEX IF NOT EXISTS` statements added to startup (safe to run on existing DB — SQLite ignores them if the index already exists).
- A new `getRegionsWithProperties()` helper replaces the N+1 loop in both `/api/regions` and the SSR `GET /` route: 1 query for regions → 1 bulk query for all their properties → 1 bulk query for all their images → in-memory assembly.

**Tech Stack:** better-sqlite3, Express, vanilla JS.

---

## Task 1: Delete static fallback HTML from index.html

**Files:**
- Modify: `public_html/index.html`

**Background:** `<div id="staticProperties">` (lines 1085–1616) contains ~530 lines of hardcoded property cards that were the pre-SSR fallback. Now that the server renders properties on every `GET /` request, this block is never shown to users (the SSR route injects `style="display:none;"` on it) and is never shown to crawlers (SSR content in `propertiesContainer` appears first). It is pure dead weight.

### Step 1: Delete the `staticProperties` div (lines 1085–1616)

The block to delete starts with:
```html
    <div id="staticProperties">
    <!-- 大正區 -->
```
and ends with the two closing `</div>` tags that close the last property card section:
```html
    </div>
    </div>
```
followed immediately by `  </section>` on the next line.

Delete everything from `    <div id="staticProperties">` through those closing divs, inclusive. After deletion the `</section>` that closes `<section id="properties">` should follow directly after `    <div id="propertiesContainer"><!-- SSR_PROPERTIES_PLACEHOLDER --></div>`.

Result should look like:
```html
    <div id="propertiesContainer"><!-- SSR_PROPERTIES_PLACEHOLDER --></div>

  </section>
```

### Step 2: Remove `staticEl` reference from `renderAllRegions()` in the renderer script

In the renderer IIFE (second `<script>` block), find `renderAllRegions`:

```js
        var container = document.getElementById('propertiesContainer');
        var staticEl = document.getElementById('staticProperties');

        if (html) {
          container.innerHTML = html;
          container.style.display = '';
          if (staticEl) staticEl.style.display = 'none';
```

Replace with (remove `staticEl` var, remove `staticEl.style.display`, remove `container.style.display` — container is already visible since we removed `display:none` in the SSR plan):

```js
        var container = document.getElementById('propertiesContainer');

        if (html) {
          container.innerHTML = html;
```

### Step 3: Remove the static filter-bar initialisation IIFE

In the same renderer script, find and delete the entire IIFE (5 lines + comment):

```js
      // Initialize filter bar from static HTML (overridden if API succeeds)
      (function() {
        var staticProps = document.getElementById('staticProperties');
        if (!staticProps) return;
        var sections = staticProps.querySelectorAll('[data-region-id]');
        if (!sections.length) return;
        var staticRegions = [];
        sections.forEach(function(el) {
          var h2 = el.querySelector('h2');
          staticRegions.push({ id: el.dataset.regionId, nameZh: h2 ? h2.textContent.trim() : el.dataset.regionId });
        });
        renderFilterBar(staticRegions);
      })();
```

Delete this entire block (comment + IIFE).

### Step 4: Remove the now-dead `staticProperties` replace from the SSR route in server.js

In `server.js`, inside `app.get('/')`, find:

```js
      pageHtml = pageHtml.replace(
        '<div id="staticProperties">',
        '<div id="staticProperties" style="display:none;">'
      );
```

Delete these 4 lines. The element no longer exists in index.html, so the replace was already a no-op; removing it makes the code accurate.

### Step 5: Verify

```bash
# No staticProperties references should remain in index.html:
grep -c 'staticProperties' /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/index.html

# Line count should be ~2330 (was ~2860):
wc -l /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/index.html
```

Expected: `0` matches, line count ~2330.

### Step 6: Commit

```bash
cd /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html
git add index.html server.js
git commit -m "refactor: remove stale static fallback HTML and its JS references"
```

---

## Task 2: Add missing database indexes

**Files:**
- Modify: `public_html/server.js`

**Background:** Every call to `getPropertyWithImages()` issues `SELECT ... FROM property_images WHERE propertyId = ?`. Every `/api/regions` request issues `SELECT ... FROM properties WHERE regionId = ?` per region. Neither `propertyId` nor `regionId` is indexed, so SQLite performs full-table scans on every call. `CREATE INDEX IF NOT EXISTS` is safe to add to the startup block — SQLite is a no-op if the index already exists.

### Step 1: Add index creation after the migrations block

Find in `server.js` (after the migrations loop, around line 185):

```js
}

// Migrate existing properties: create regions from regionZh and link
```

Insert between `}` and the migration comment:

```js
// Create indexes for frequently queried foreign keys
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_properties_regionId ON properties(regionId);
  CREATE INDEX IF NOT EXISTS idx_property_images_propertyId ON property_images(propertyId);
`);

```

### Step 2: Verify

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/osaka-minshuku.db');
const rows = db.prepare(\"SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'\").all();
console.log(rows);
db.close();
"
```

Expected output:
```
[ { name: 'idx_properties_regionId' }, { name: 'idx_property_images_propertyId' } ]
```

### Step 3: Commit

```bash
cd /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html
git add server.js
git commit -m "perf: add DB indexes on properties.regionId and property_images.propertyId"
```

---

## Task 3: Fix N+1 query — extract `getRegionsWithProperties()` helper

**Files:**
- Modify: `public_html/server.js`

**Background:** Both `GET /api/regions` (line ~730) and the SSR `GET /` route (line ~647) use this pattern:

```js
const regions = db.prepare('SELECT * FROM regions ...').all();
for (const region of regions) {
  const props = db.prepare('SELECT * FROM properties WHERE regionId = ?').all(region.id);
  props.forEach(p => { getPropertyWithImages(p); });  // another query per property for images
  region.properties = props;
}
```

For N regions with M total properties this fires **1 + N + M** queries. The fix: 3 fixed queries regardless of data size (1 for regions, 1 bulk for properties, 1 bulk for images), then assemble in memory.

### Step 1: Add `getRegionsWithProperties()` helper

Find in `server.js` the existing `getPropertyWithImages` function (around line ~370 after the SSR section):

```js
function getPropertyWithImages(prop) {
```

Insert the new helper **immediately before** that function:

```js
/**
 * Fetch all regions with their nested properties and images in 3 queries total.
 * Replaces the N+1 loop pattern used in /api/regions and the SSR GET / route.
 */
function getRegionsWithProperties() {
  const regions = db.prepare('SELECT * FROM regions ORDER BY sortOrder ASC').all();
  if (regions.length === 0) return regions;

  // 1 query: all properties that belong to any of these regions
  const regionIds = regions.map(r => r.id);
  const placeholders = regionIds.map(() => '?').join(',');
  const allProps = db.prepare(
    `SELECT * FROM properties WHERE regionId IN (${placeholders}) ORDER BY createdAt ASC`
  ).all(...regionIds);

  if (allProps.length > 0) {
    // 1 query: all images for those properties
    const propIds = allProps.map(p => p.id);
    const imgPlaceholders = propIds.map(() => '?').join(',');
    const allImages = db.prepare(
      `SELECT id, propertyId, url, isLocal, filename, sortOrder
         FROM property_images
        WHERE propertyId IN (${imgPlaceholders})
        ORDER BY sortOrder`
    ).all(...propIds);

    // Group images by propertyId
    const imagesByPropId = {};
    for (const img of allImages) {
      if (!imagesByPropId[img.propertyId]) imagesByPropId[img.propertyId] = [];
      // Apply local-image cache-busting (same as getPropertyWithImages)
      if (img.isLocal && img.url) {
        try {
          const filePath = path.join(__dirname, img.url.replace(/^\//, ''));
          const mtime = Math.floor(fs.statSync(filePath).mtimeMs / 1000);
          img.url = img.url + '?' + mtime;
        } catch (e) {}
      }
      imagesByPropId[img.propertyId].push(img);
    }

    // Attach images + parse JSON fields to each property
    for (const p of allProps) {
      p.images     = imagesByPropId[p.id] || [];
      p.quickInfo  = safeParseJSON(p.quickInfo);
      p.amenities  = safeParseJSON(p.amenities);
      p.spaceIntro = safeParseJSON(p.spaceIntro);
    }
  } else {
    // No properties — still parse JSON fields (they'll be empty arrays)
    for (const p of allProps) {
      p.images     = [];
      p.quickInfo  = safeParseJSON(p.quickInfo);
      p.amenities  = safeParseJSON(p.amenities);
      p.spaceIntro = safeParseJSON(p.spaceIntro);
    }
  }

  // Group properties by regionId and attach to regions
  const propsByRegion = {};
  for (const p of allProps) {
    if (!propsByRegion[p.regionId]) propsByRegion[p.regionId] = [];
    propsByRegion[p.regionId].push(p);
  }
  for (const region of regions) {
    region.properties = propsByRegion[region.id] || [];
  }

  return regions;
}

```

### Step 2: Rewrite `/api/regions` to use the helper

Find:

```js
// List all regions with nested properties
app.get('/api/regions', (req, res) => {
  const regions = db.prepare('SELECT * FROM regions ORDER BY sortOrder ASC').all();
  for (const region of regions) {
    const props = db.prepare('SELECT * FROM properties WHERE regionId = ? ORDER BY createdAt ASC').all(region.id);
    props.forEach(p => { getPropertyWithImages(p); });
    region.properties = props;
  }
  res.json(regions);
});
```

Replace with:

```js
// List all regions with nested properties
app.get('/api/regions', (req, res) => {
  res.json(getRegionsWithProperties());
});
```

### Step 3: Rewrite the SSR `GET /` route to use the helper

Find inside `app.get('/', ...)`:

```js
      const regions = db.prepare('SELECT * FROM regions ORDER BY sortOrder ASC').all();
      for (const region of regions) {
        const props = db.prepare('SELECT * FROM properties WHERE regionId = ? ORDER BY createdAt ASC').all(region.id);
        props.forEach(p => { getPropertyWithImages(p); });
        region.properties = props;
      }
```

Replace with:

```js
      const regions = getRegionsWithProperties();
```

### Step 4: Verify query count reduction

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/osaka-minshuku.db');

let queryCount = 0;
const origPrepare = db.prepare.bind(db);
db.prepare = function(sql) {
  queryCount++;
  return origPrepare(sql);
};

// Simulate getRegionsWithProperties
const regions = db.prepare('SELECT * FROM regions ORDER BY sortOrder ASC').all();
if (regions.length > 0) {
  const ids = regions.map(r => r.id);
  db.prepare('SELECT * FROM properties WHERE regionId IN (' + ids.map(() => '?').join(',') + ')').all(...ids);
  db.prepare('SELECT id, propertyId, url, isLocal, filename, sortOrder FROM property_images WHERE propertyId IN (SELECT id FROM properties WHERE regionId IS NOT NULL)').all();
}
console.log('Queries prepared:', queryCount);
db.close();
"
```

Expected: `3` (was `1 + N_regions + N_properties` before).

### Step 5: Commit

```bash
cd /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html
git add server.js
git commit -m "perf: fix N+1 query in /api/regions and SSR route with bulk getRegionsWithProperties()"
```

---

## Final verification

After all 3 tasks:

```bash
# 1. No staticProperties in index.html
grep -c 'staticProperties' /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/index.html
# Expected: 0

# 2. Indexes exist in DB
node -e "
const db = require('better-sqlite3')('/home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/osaka-minshuku.db');
console.log(db.prepare(\"SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'\").all());
"
# Expected: both idx_properties_regionId and idx_property_images_propertyId

# 3. /api/regions route uses helper (1-liner)
grep -A2 'app.get.*api/regions' /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/server.js
# Expected: res.json(getRegionsWithProperties());

# 4. index.html line count
wc -l /home/1267721.cloudwaysapps.com/yuqqxgzmck/public_html/index.html
# Expected: ~2330
```
