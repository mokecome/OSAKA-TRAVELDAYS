# Property Multilingual (i18n) Design

**Date:** 2026-02-22
**Status:** Approved

---

## Goal

Add zh-TW / ja / en multilingual support to property content fields. Existing Chinese data becomes zh-TW; ja and en are auto-translated via a one-time migration script using Claude API. Admins can edit translations in the admin panel afterwards.

---

## Scope

### Fields to translate (A — required)
- `name` — Property name
- `shortDesc` — Card subtitle
- `introduction` — Full room description
- `transportInfo` — Transport summary (shown on card)
- `transportDetail` — Detailed transport directions
- `spaceIntro` (JSON array) — Each item's `title` and `desc`
- `quickInfo` (JSON array) — Each item's `title`, `value`, and `desc`

### Fields to translate (B — optional but included)
- `badge` — Primary badge label
- `secondaryBadge` — Secondary badge label
- `address` — Property address
- `nearestStation` — Nearest train station(s)

### Fields NOT translated (language-agnostic)
- `id`, `type`, `regionId`, `capacity`, `size`
- `videoUrl`, `mapEmbedUrl`, `airbnbUrl`, `ical_url`
- `checkIn`, `checkOut` (times — same across languages)
- `amenities` (fixed icon keys)
- `createdAt`, `updatedAt`

---

## Storage Format (Method A — JSON in existing TEXT columns)

Consistent with `site_settings` (hero, FAQ, footer) and existing JSON fields.

**Simple string fields** become JSON objects:
```json
{ "zh-TW": "大阪旅行日 難波店", "ja": "大阪トラベルデイズ 難波店", "en": "Osaka Travel Days Namba" }
```

**JSON array fields** — text sub-fields become multilingual objects:
```json
spaceIntro: [
  {
    "title": { "zh-TW": "衛浴設備", "ja": "バスルーム", "en": "Bathroom" },
    "desc":  { "zh-TW": "獨立衛浴...", "ja": "独立した浴室...", "en": "Private bathroom..." }
  }
]

quickInfo: [
  {
    "title": { "zh-TW": "入住人數", "ja": "入居人数", "en": "Capacity" },
    "value": { "zh-TW": "最多8人",  "ja": "最大8名",   "en": "Up to 8" },
    "desc":  { "zh-TW": "...",      "ja": "...",       "en": "..." }
  }
]
```

No DB schema changes required — all fields are already TEXT.

---

## Components

### 1. Migration Script (`scripts/migrate-i18n.js`)

- One-time script, not part of server.js
- Reads all properties from DB
- For each property: calls Claude API (claude-haiku-4-5) to translate all A+B fields
- Wraps zh-TW original + translated ja + en into JSON objects
- Writes back to DB
- Prints success/failure report

### 2. `server.js` changes

- Add `localizeProperty(prop, lang)` helper: extracts `field[lang] || field['zh-TW']` for each multilingual field
- `getPropertyWithImages()` — returns raw multilingual data (client picks language)
- `getRegionsWithProperties()` — returns raw multilingual data
- SSR `GET /` — renders using `zh-TW` (SEO default); `window.__SSR_REGIONS` retains full multilingual objects
- SSR room pages — inject `window.__PROPERTY_DATA` with full multilingual object; page re-renders text on language switch
- Admin API (`GET /api/properties`, `GET /api/properties/:id`) — return raw multilingual data
- Property save (`POST/PUT /api/properties`) — accept and store multilingual JSON for translatable fields

### 3. `index.html` — client renderer changes

- `renderCard(prop, lang)` — picks `prop.name[lang] || prop.name['zh-TW']` etc.
- `renderAllRegions()` — passes current language to `renderCard()`
- `setLanguage(lang)` — after setting language, re-renders property cards if container has content
- Room detail page: `window.__PROPERTY_DATA` accessed; text sections re-rendered on language switch

### 4. `views/admin.html` — form changes

- Add language tabs (`[ 繁中 | 日文 | 英文 ]`) to property form, same pattern as hero section
- Each A+B field gets 3 language-specific inputs
- `loadProperty()` — populates all language inputs from multilingual JSON
- `saveProperty()` — collects all language inputs and builds multilingual JSON before POST

---

## Data Flow

```
Admin saves property
  → { name: { zh-TW, ja, en }, shortDesc: { zh-TW, ja, en }, ... }
  → POST /api/properties → DB stores JSON strings

GET / (SSR)
  → getRegionsWithProperties() → raw multilingual data
  → ssrRenderCard() uses zh-TW fields
  → window.__SSR_REGIONS = full multilingual array
  → client: renderCard(prop, currentLang) on language switch → re-render

GET /rooms/:id.html (SSR)
  → getPropertyWithImages() → raw multilingual data
  → server renders zh-TW fields in HTML
  → window.__PROPERTY_DATA = full multilingual object
  → client: on language switch → re-render text sections
```

---

## Migration Strategy

1. Run `scripts/migrate-i18n.js` once
2. Script translates all existing properties: zh-TW = original, ja/en = Claude API output
3. Admin reviews and edits translations as needed via admin panel
4. Script can be re-run safely (idempotent — skips properties already in multilingual format)

---

## Fallback

All multilingual lookups use `field[lang] || field['zh-TW'] || field` pattern:
- If ja/en is empty, fall back to zh-TW
- If field is still a plain string (not yet migrated), use as-is
