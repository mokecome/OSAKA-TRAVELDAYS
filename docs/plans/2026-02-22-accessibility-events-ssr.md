# Accessibility, Event Delegation & SSR Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix missing ARIA attributes and roles across the page, replace per-element event binding with delegation in the chatbot, and add server-side pre-rendering of the properties section so search crawlers see real content.

**Architecture:**
- Accessibility: targeted attribute additions to static HTML + dynamic rendering helpers; no structural changes.
- Event delegation: chatbot's `init()` registers two delegated listeners once (on `chatCategories` and `chatMessages`); per-element bindings in `renderCategories` and `addBotMessage` are removed.
- SSR: Express `GET /` route reads `index.html`, queries DB, renders property HTML server-side (same logic as front-end renderer), injects into page before serving. Client-side renderer checks `window.__SSR_REGIONS` and skips the API fetch when it exists.

**Tech Stack:** Vanilla HTML/JS, Express + better-sqlite3, no new dependencies.

---

## File location note

If the **refactor plan** (`2026-02-22-refactor-html-static-ical.md`) has already been executed:
- Chatbot code lives in `public_html/js/chatbot.js`
- Renderer code lives in `public_html/js/renderer.js`
- i18n code lives in `public_html/js/i18n.js`

If it **has not** been executed, all JS lives in inline `<script>` blocks inside `public_html/index.html`. The plan below gives line numbers for the current un-refactored state and also notes the JS file paths for the refactored state.

---

## Task 1: Accessibility — static HTML in index.html

**Files:**
- Modify: `public_html/index.html`

These are all targeted attribute additions; no content or layout changes.

### Change 1a: Mobile hamburger button (line ~1000)

Find:
```html
        <button class="md:hidden p-2 text-amber-800">
```
Replace with:
```html
        <button class="md:hidden p-2 text-amber-800" aria-label="開啟選單" aria-expanded="false" id="mobileMenuBtn">
```

### Change 1b: Chat window — add dialog role (line ~1840)

Find:
```html
  <div class="chat-window" id="chatWindow">
```
Replace with:
```html
  <div class="chat-window" id="chatWindow" role="dialog" aria-labelledby="chatTitle" aria-modal="true" aria-hidden="true">
```

**Why `aria-hidden="true"` initially:** The dialog is hidden visually; screen readers should ignore it until it opens. The chatbot JS must toggle `aria-hidden` when the dialog opens/closes (see Task 3).

### Change 1c: Chat close button (line ~1850)

Find:
```html
<button class="close-btn" id="closeChat">
```
Replace with:
```html
<button class="close-btn" id="closeChat" aria-label="關閉客服">
```

### Change 1d: Chat input (line ~1863)

Find:
```html
      <input type="text" class="chat-input" id="chatInput" placeholder="請輸入您的問題...">
```
Replace with:
```html
      <input type="text" class="chat-input" id="chatInput" placeholder="請輸入您的問題..." aria-label="輸入問題">
```

### Change 1e: Chat send button (line ~1864)

Find:
```html
      <button class="send-btn" id="sendBtn" disabled>
```
Replace with:
```html
      <button class="send-btn" id="sendBtn" disabled aria-label="送出">
```

### Change 1f: Language buttons — add aria-pressed (lines ~990-992)

Find:
```html
            <button onclick="setLanguage('zh-TW')" data-lang="zh-TW" class="lang-btn-nav active">中文</button>
            <button onclick="setLanguage('ja')" data-lang="ja" class="lang-btn-nav">日本語</button>
            <button onclick="setLanguage('en')" data-lang="en" class="lang-btn-nav">EN</button>
```
Replace with:
```html
            <button onclick="setLanguage('zh-TW')" data-lang="zh-TW" class="lang-btn-nav active" aria-pressed="true">中文</button>
            <button onclick="setLanguage('ja')" data-lang="ja" class="lang-btn-nav" aria-pressed="false">日本語</button>
            <button onclick="setLanguage('en')" data-lang="en" class="lang-btn-nav" aria-pressed="false">EN</button>
```

Also update the `setLanguage` function (line ~2677) to sync `aria-pressed`:

Find (in the `setLanguage` function body, inside the i18n `<script>` block or `js/i18n.js`):
```js
      document.querySelectorAll('.lang-btn-nav').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
```
Replace with:
```js
      document.querySelectorAll('.lang-btn-nav').forEach(function(btn) {
        var isActive = btn.dataset.lang === lang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
```

### Change 1g: Main landmark

Find (line ~976):
```html
<body class="min-h-screen">
  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50
```
Add a `<main>` tag wrapping the page content. After the `</header>` (around line 1007), add:
```html
  <main id="mainContent">
```
Then find the matching close, just before `<!-- FAQ Chatbot Widget -->` (around line 1830):
```html
  <!-- FAQ Chatbot Widget -->
```
Add the closing `</main>` immediately before that comment:
```html
  </main>

  <!-- FAQ Chatbot Widget -->
```

**Step 2: Verify in browser**

Open the page. In DevTools, run:
```js
document.querySelectorAll('[role], [aria-label], [aria-pressed], [aria-hidden], main').length
```
Expected: significantly more than 1 (was 1, should now be 15+).

**Step 3: Commit**

```bash
git add public_html/index.html
git commit -m "fix: add missing ARIA attributes and main landmark to index.html"
```

---

## Task 2: Accessibility — dynamic JS (renderer)

**Files:**
- Modify: `public_html/index.html` inline script block 2 (lines ~2307-2522)
  OR `public_html/js/renderer.js` (if refactor plan was applied)

### Change 2a: Add `loading="lazy"` to property card images

Find in `renderCard`:
```js
            '<img src="' + escHtml(coverUrl) + '" alt="' + escHtml(property.name) + '" class="w-full h-full object-cover card-image">' +
```
Replace with:
```js
            '<img src="' + escHtml(coverUrl) + '" alt="' + escHtml(property.name) + '" loading="lazy" class="w-full h-full object-cover card-image">' +
```

### Change 2b: Add `aria-label` to region filter tab buttons

Find in `renderFilterBar`:
```js
        var html = '<button class="region-tab active" data-rid="all" data-i18n="filter.all">' + allLabel + '</button>';
```
Replace with:
```js
        var html = '<button class="region-tab active" data-rid="all" data-i18n="filter.all" aria-pressed="true">' + allLabel + '</button>';
```

Find:
```js
          html += '<button class="region-tab" data-rid="' + rid + '">' + escHtml(r.nameZh) + '</button>';
```
Replace with:
```js
          html += '<button class="region-tab" data-rid="' + rid + '" aria-pressed="false">' + escHtml(r.nameZh) + '</button>';
```

Also update `filterByRegion` to sync `aria-pressed`:

Find:
```js
      function filterByRegion(rid) {
        document.querySelectorAll('.region-tab').forEach(function(btn) {
          btn.classList.toggle('active', btn.dataset.rid === rid);
        });
```
Replace with:
```js
      function filterByRegion(rid) {
        document.querySelectorAll('.region-tab').forEach(function(btn) {
          var isActive = btn.dataset.rid === rid;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
```

**Step 2: Commit**

```bash
git add public_html/index.html   # or public_html/js/renderer.js
git commit -m "fix: add loading=lazy and aria-pressed to dynamic property renderer"
```

---

## Task 3: Event delegation in chatbot + aria-hidden toggle

**Files:**
- Modify: `public_html/index.html` inline script block 1 (lines ~1919-2305)
  OR `public_html/js/chatbot.js` (if refactor plan was applied)

### Change 3a: Move category + quick-reply listeners to `init()`

The current code adds event listeners inside `renderCategories()` and `addBotMessage()`, which are called repeatedly (on language change, on every new bot message). Switch both to delegation set up once in `init()`.

**Step 1: In `init()`, add two delegated listeners**

Find in the `init()` method (look for `this.elements = { ... }` and the code right after):
```js
      init() {
```

Find the section where `init()` binds the send button and chat open/close. It will look like:
```js
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.chatInput.addEventListener('keypress', ...
```

After those lines, add the two delegated listeners:
```js
        // Delegated: category buttons and LINE button
        this.elements.chatCategories.addEventListener('click', (e) => {
          const catBtn = e.target.closest('.category-btn');
          if (catBtn) { this.selectCategory(catBtn.dataset.category); return; }
          if (e.target.closest('.learn-more-btn')) this.showLineQRCode();
        });

        // Delegated: quick-reply buttons
        this.elements.chatMessages.addEventListener('click', (e) => {
          const btn = e.target.closest('.quick-reply-btn');
          if (btn) this.handleQuickReply(btn.dataset.faq);
        });
```

**Step 2: Remove per-element bindings from `renderCategories()`**

Find (in `renderCategories()`):
```js
        // Bind category clicks
        this.elements.chatCategories.querySelectorAll('.category-btn').forEach(btn => {
          btn.addEventListener('click', () => this.selectCategory(btn.dataset.category));
        });

        // Bind learn more button
        document.getElementById('learnMoreBtn').addEventListener('click', () => this.showLineQRCode());
```
Delete these 6 lines entirely.

**Step 3: Remove per-message binding from `addBotMessage()`**

Find:
```js
        // Bind quick reply clicks
        this.elements.chatMessages.querySelectorAll('.quick-reply-btn:not([data-bound])').forEach(btn => {
          btn.setAttribute('data-bound', 'true');
          btn.addEventListener('click', () => this.handleQuickReply(btn.dataset.faq));
        });
```
Delete these 4 lines entirely.

Also remove `data-bound` from the quick-reply button template (it's now unused). Find in `addBotMessage()`:
```js
            return `<button class="quick-reply-btn" data-faq="${faqId}">▸ ${faq.question[this.language]}</button>`;
```
This line stays as-is (no `data-bound` attribute was in it — good).

**Step 4: Toggle `aria-hidden` on chat window open/close**

Find in `toggleChat()` (look for `this.isOpen`):
```js
      toggleChat() {
        this.isOpen = !this.isOpen;
        this.elements.chatWindow.classList.toggle('open', this.isOpen);
        this.elements.chatIcon.style.display = this.isOpen ? 'none' : '';
        this.elements.closeIcon.style.display = this.isOpen ? '' : 'none';
```
After the `classList.toggle` line, add:
```js
        this.elements.chatWindow.setAttribute('aria-hidden', this.isOpen ? 'false' : 'true');
```

**Step 5: Test**

1. Open the page, click the chat button → chat opens, no console errors.
2. Click a category → shows FAQ questions.
3. Click a quick-reply → shows answer.
4. Change language → chatbot re-renders categories, buttons still work.
5. In DevTools: `document.getElementById('chatWindow').getAttribute('aria-hidden')` → `"false"` when open.

**Step 6: Commit**

```bash
git add public_html/index.html   # or public_html/js/chatbot.js
git commit -m "refactor: use event delegation for chatbot buttons, add aria-hidden toggle"
```

---

## Task 4: Server-side rendering of homepage properties

**Files:**
- Modify: `public_html/server.js`
- Modify: `public_html/index.html`

**Background:** Properties currently render client-side via JS + `/api/regions` fetch. Search crawlers (Googlebot) often execute JS but may not wait for API responses. Pre-rendering the property HTML server-side and embedding it in the initial HTML response guarantees crawlers see full content. The client-side renderer hydrates (sets up filter bar + animations) without re-fetching when it detects SSR data.

### Step 1: Add SSR placeholder to index.html

Find in `index.html` (around line 1081):
```html
    <div id="propertiesContainer" style="display:none;"></div>
```
Replace with:
```html
    <div id="propertiesContainer"><!-- SSR_PROPERTIES_PLACEHOLDER --></div>
```
(Remove `style="display:none;"` — when SSR injects content, it's visible from the start.)

### Step 2: Add `escHtml` helper and SSR rendering function to server.js

Find in `server.js` near the top of the `// ==================== HELPERS ====================` section (line ~343), after the `getPropertyWithImages` function. Add:

```js
// ==================== SSR RENDERER ====================

function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const HOUSE_ICON_SVG = '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>';
const APARTMENT_ICON_SVG = '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>';

function ssrRenderCard(property, delay) {
  const coverUrl = (property.images && property.images.length > 0) ? property.images[0].url || '' : '';
  const badgeIcon = (property.badge === '公寓式民宿' || property.type === '公寓式民宿') ? APARTMENT_ICON_SVG : HOUSE_ICON_SVG;
  const delayAttr = delay > 0 ? ` style="animation-delay: ${delay}s;"` : '';

  return `<div class="property-card animate-fadeInUp"${delayAttr}>` +
    `<div class="relative aspect-[4/3] overflow-hidden">` +
      `<img src="${escHtml(coverUrl)}" alt="${escHtml(property.name)}" loading="lazy" class="w-full h-full object-cover card-image">` +
      `<div class="image-overlay"></div>` +
      `<div class="absolute top-4 left-4"><span class="badge">${badgeIcon} ${escHtml(property.badge)}</span></div>` +
      (property.secondaryBadge ? `<div class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5"><span class="text-amber-800 font-bold text-sm">${escHtml(property.secondaryBadge)}</span></div>` : '') +
    `</div>` +
    `<div class="p-6 flex flex-col flex-1">` +
      `<h3 class="font-bold text-xl text-amber-900 mb-1">${escHtml(property.name)}</h3>` +
      `<p class="text-amber-500 text-sm mb-4">${escHtml(property.shortDesc)}</p>` +
      `<div class="space-y-1 mb-5">` +
        `<div class="info-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>${escHtml(property.address)}</span></div>` +
        `<div class="info-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>${escHtml(property.transportInfo)}</span></div>` +
      `</div>` +
      `<a href="rooms/${escHtml(property.id)}.html" class="btn-primary w-full mt-auto"><span>查看詳情</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></a>` +
    `</div>` +
  `</div>`;
}

function ssrRenderRegion(region, properties, isOdd) {
  const bgClass = isOdd ? 'bg-gradient-to-b from-amber-50/50 to-white' : 'bg-white';
  const count = properties.length;
  let gridClass;
  if (count === 1) gridClass = 'flex justify-center';
  else if (count === 2) gridClass = 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto';
  else if (count <= 4) gridClass = `grid grid-cols-1 md:grid-cols-${count} gap-8 max-w-6xl mx-auto`;
  else gridClass = 'flex flex-wrap justify-center gap-8 max-w-6xl mx-auto';

  let cardsHtml = '';
  for (let i = 0; i < count; i++) {
    const delay = i * 0.1;
    if (count === 1) cardsHtml += `<div class="w-full max-w-sm">${ssrRenderCard(properties[i], delay)}</div>`;
    else if (count >= 5) cardsHtml += `<div class="w-full md:w-[calc(33.333%-1.4rem)]">${ssrRenderCard(properties[i], delay)}</div>`;
    else cardsHtml += ssrRenderCard(properties[i], delay);
  }

  return `<div class="py-16 lg:py-20 ${bgClass}" data-region-id="${escHtml(String(region.id))}">` +
    `<div class="container mx-auto px-4 lg:px-8">` +
      `<div class="text-center mb-14">` +
        `<span class="text-amber-500 text-sm tracking-widest uppercase mb-3 block">${escHtml(region.nameEn)}</span>` +
        `<h2 class="text-2xl md:text-3xl lg:text-4xl font-serif text-amber-900 section-title">${escHtml(region.nameZh)}</h2>` +
        (region.description ? `<p class="text-amber-600 mt-4 max-w-lg mx-auto">${escHtml(region.description)}</p>` : '') +
      `</div>` +
      `<div class="${gridClass}">${cardsHtml}</div>` +
    `</div>` +
  `</div>`;
}

function ssrRenderAllRegions(regions) {
  const activeRegions = regions.filter(r => r.properties && r.properties.length > 0);
  let html = '';
  activeRegions.forEach((region, idx) => {
    html += ssrRenderRegion(region, region.properties, idx % 2 === 0);
  });
  return html;
}

let ssrCache = null; // { html: string, regionsJson: string } — invalidated on property/region changes

function invalidateSSRCache() {
  ssrCache = null;
}
```

### Step 3: Add `GET /` route in server.js

This route must be placed **BEFORE** the `express.static` middleware block (~line 577). Find:

```js
// ==================== STATIC FILES ====================
```

Insert immediately before that line:

```js
// ==================== HOMEPAGE SSR ====================

app.get('/', (req, res) => {
  try {
    if (!ssrCache) {
      // Query regions + properties (same as /api/regions)
      const regions = db.prepare('SELECT * FROM regions ORDER BY sortOrder ASC').all();
      for (const region of regions) {
        const props = db.prepare('SELECT * FROM properties WHERE regionId = ? ORDER BY createdAt ASC').all(region.id);
        props.forEach(p => { getPropertyWithImages(p); });
        region.properties = props;
      }

      const propertiesHtml = ssrRenderAllRegions(regions);
      const totalProps = regions.reduce((n, r) => n + (r.properties ? r.properties.length : 0), 0);
      const activeRegionCount = regions.filter(r => r.properties && r.properties.length > 0).length;

      // Serialize a lightweight regions summary for client hydration
      // (omit full image data to keep inline JSON small)
      const regionsSummary = regions
        .filter(r => r.properties && r.properties.length > 0)
        .map(r => ({ id: r.id, nameZh: r.nameZh, nameEn: r.nameEn }));

      let pageHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

      // 1. Inject rendered properties into placeholder
      pageHtml = pageHtml.replace(
        '<!-- SSR_PROPERTIES_PLACEHOLDER -->',
        propertiesHtml
      );

      // 2. Hide legacy static fallback (if still present)
      pageHtml = pageHtml.replace(
        '<div id="staticProperties">',
        '<div id="staticProperties" style="display:none;">'
      );

      // 3. Update stats counters in HTML
      pageHtml = pageHtml.replace(
        /(<p id="statProperties"[^>]*>)\d+(<\/p>)/,
        `$1${totalProps}$2`
      );
      pageHtml = pageHtml.replace(
        /(<p id="statRegions"[^>]*>)\d+(<\/p>)/,
        `$1${activeRegionCount}$2`
      );

      // 4. Inject hydration data just before </body>
      const hydrationScript = `<script>window.__SSR_REGIONS=${JSON.stringify(regionsSummary)};</script>`;
      pageHtml = pageHtml.replace('</body>', hydrationScript + '\n</body>');

      ssrCache = pageHtml;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(ssrCache);
  } catch (err) {
    console.error('SSR error:', err.message);
    // Fall through to express.static to serve the plain index.html
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

```

### Step 4: Invalidate SSR cache on data changes

Call `invalidateSSRCache()` at the end of every route that changes properties or regions. Find these 6 locations in server.js:

1. `app.post('/api/regions', ...)` — end of handler, before `return res.json(...)`. Add `invalidateSSRCache();`
2. `app.put('/api/regions/:id/move', ...)` — end of handler
3. `app.delete('/api/regions/:id', ...)` — end of handler
4. `app.post('/api/properties', ...)` — end of handler (both the update and insert branches)
5. `app.put('/api/properties/:oldId/rename', ...)` — end of handler
6. `app.delete('/api/properties/:id', ...)` — end of handler

Each addition is one line: `invalidateSSRCache();` placed just before the `res.json(...)` call.

### Step 5: Update renderer.js (or inline script) to skip fetch when SSR data is present

Find in the renderer's IIFE (inline `<script>` block or `js/renderer.js`), the section that starts the fetch:

```js
      // Fetch regions from API
      fetch('/api/regions')
```

**Insert the SSR hydration check before that fetch:**

```js
      // If server pre-rendered the properties, hydrate from SSR data (skip API fetch)
      if (window.__SSR_REGIONS && window.__SSR_REGIONS.length > 0) {
        var container = document.getElementById('propertiesContainer');
        // Content already in DOM from SSR; just wire up filter + animations
        var activeRegions = window.__SSR_REGIONS; // lightweight summary already filtered
        renderFilterBar(activeRegions);
        container.querySelectorAll('.animate-fadeInUp, .animate-scaleIn').forEach(function(el) {
          el.style.animationPlayState = 'paused';
          observer.observe(el);
        });
        // Update stats from DOM (already correct from SSR injection)
        return; // skip fetch
      }

      // Fetch regions from API
      fetch('/api/regions')
```

### Step 6: Verify

1. Restart the server: `node --env-file=.env server.js`
2. `curl -s http://localhost:3000/ | grep 'data-region-id'` — must return multiple `data-region-id` values (confirms SSR HTML injection).
3. `curl -s http://localhost:3000/ | grep '__SSR_REGIONS'` — must find the hydration script.
4. Open in browser: properties load instantly (no flash / loading delay), filter bar appears, animations work.
5. Disable JS in browser (DevTools → Settings → Debugger → Disable JavaScript): reload page → property cards visible (confirms crawler compatibility).
6. Add a test property via admin → SSR cache should rebuild on next `GET /`.

### Step 7: Commit

```bash
git add public_html/server.js public_html/index.html
git commit -m "feat: server-side render homepage properties for SEO, hydrate on client"
```

---

## Final verification checklist

- [ ] `aria-label` present on: mobile menu btn, close-chat btn, send btn, chat input
- [ ] `role="dialog" aria-modal="true" aria-labelledby="chatTitle"` on `#chatWindow`
- [ ] `aria-hidden` toggles correctly when chat opens/closes
- [ ] `aria-pressed` on language buttons and region filter tabs updates on click
- [ ] `loading="lazy"` on all dynamically rendered property card images
- [ ] `<main>` wraps page content between `<header>` and chat widget
- [ ] No per-element listeners added inside `renderCategories()` or `addBotMessage()`
- [ ] Chatbot category + quick-reply clicks work via delegation
- [ ] `curl localhost:3000/ | grep data-region-id` returns property sections
- [ ] Page works with JS disabled (SSR content visible)
- [ ] Filter bar and animations work after JS hydration
