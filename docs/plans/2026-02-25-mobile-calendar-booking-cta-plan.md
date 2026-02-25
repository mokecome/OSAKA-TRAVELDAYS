# Mobile Availability Calendar + Booking CTA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show the availability calendar and booking button on mobile (currently hidden inside the desktop-only sidebar).

**Architecture:** Single file change — `room-template.html`. Add CSS for a fixed bottom bar + a mobile calendar section injected by `renderProperty()`. Reuse all existing JS globals (`calBlockedDates`, `calYear`, `calMonth`, `renderCalendar`, `calNavigate`). No new fetch calls.

**Tech Stack:** Vanilla JS, inline CSS, Tailwind (for `lg:hidden` equivalent via media query).

---

## Cross-cutting notes

- `renderProperty()` builds a `html` string then sets `mainContent.innerHTML = html`. The mobile calendar section is appended to this string **before** the assignment.
- The fixed bottom bar is a separate DOM element appended directly to `document.body` **after** `mainContent.innerHTML = html`.
- `renderProperty()` can be called multiple times (language switch) — always remove the old bar before creating a new one.
- `loadAvailability()` renders into `#availabilityCalendar` (sidebar). We extend it to also render into `#availabilityCalendarMobile` if it exists.
- `calNavigate()` updates shared `calYear`/`calMonth` then re-renders `#availabilityCalendar`. Extend it the same way.
- No tests exist for this file; manual browser verification is the test.

---

## Task 1: Add CSS for mobile booking bar and body padding

**File:** `room-template.html`

**Step 1: Locate the closing `</style>` tag**

Find (around line 242):
```html
    @media (max-width: 640px) {
      .gallery-grid { grid-template-columns: repeat(2, 1fr); }
    }
```
The `</style>` tag follows shortly after the lang-switcher styles.

**Step 2: Insert CSS before `</style>`**

Find:
```css
    .lang-btn-nav.active { background: #92400e; color: white; border-radius: 20px; }
    .room-page-wrapper { display: flex; align-items: flex-start; }
```

After the `.room-sidebar` media query block (ends with `}`), but before `</style>`, add:

```css
    /* Mobile booking bar */
    .mobile-booking-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #fde68a;
      z-index: 40;
      box-shadow: 0 -4px 12px rgba(139, 69, 19, 0.1);
    }
    @media (max-width: 1023px) {
      .mobile-booking-bar { display: block; }
      body.has-booking-bar { padding-bottom: 80px; }
    }
```

**Step 3: Commit**

```bash
git add room-template.html
git commit -m "style: add mobile-booking-bar CSS and body padding helper"
```

---

## Task 2: Add mobile calendar section in renderProperty()

**File:** `room-template.html`

**Step 1: Locate the insertion point**

Find (around line 635–637):
```js
      }

      var airbnbTrackUrl = p.airbnbUrl ? p.airbnbUrl + ...
```
(This is immediately after the amenities `if` block closes.)

**Step 2: Insert mobile calendar HTML between the amenities block and `airbnbTrackUrl`**

Find exactly:
```js
      var airbnbTrackUrl = p.airbnbUrl ? p.airbnbUrl + (p.airbnbUrl.includes('?') ? '&' : '?') + 'utm_source=osaka-traveldays&utm_medium=website&utm_campaign=room-page' : '';
```

Replace with:
```js
      // ========== Mobile Availability Calendar ==========
      if (p.ical_url) {
        html += '<section class="py-12 lg:hidden bg-amber-50/50" id="mobileCalendarSection">' +
          '<div class="container mx-auto px-4">' +
          '<h2 class="text-2xl font-serif text-amber-900 mb-6 section-title">空房日期</h2>' +
          '<div id="availabilityCalendarMobile" style="margin-top:2.5rem">' +
          '<p style="color:#9ca3af;font-size:0.95rem">載入中...</p>' +
          '</div>' +
          '</div>' +
          '</section>';
      }

      var airbnbTrackUrl = p.airbnbUrl ? p.airbnbUrl + (p.airbnbUrl.includes('?') ? '&' : '?') + 'utm_source=osaka-traveldays&utm_medium=website&utm_campaign=room-page' : '';
```

**Step 3: Commit**

```bash
git add room-template.html
git commit -m "feat: inject mobile availability calendar section in renderProperty()"
```

---

## Task 3: Add fixed bottom booking bar in renderProperty()

**File:** `room-template.html`

**Step 1: Locate the insertion point**

Find (around line 641–644):
```js
      document.getElementById('mainContent').innerHTML = html;

      // ========== Populate Sidebar ==========
```

**Step 2: Insert bar creation after `mainContent.innerHTML = html`**

Find exactly:
```js
      document.getElementById('mainContent').innerHTML = html;

      // ========== Populate Sidebar ==========
      var sidebarEl = document.getElementById('roomSidebar');
```

Replace with:
```js
      document.getElementById('mainContent').innerHTML = html;

      // ========== Mobile Fixed Booking Bar ==========
      var existingBar = document.getElementById('mobileBookingBar');
      if (existingBar) existingBar.remove();
      if (p.airbnbUrl) {
        var bar = document.createElement('div');
        bar.id = 'mobileBookingBar';
        bar.className = 'mobile-booking-bar';
        bar.innerHTML = '<a href="' + esc(airbnbTrackUrl) + '" target="_blank" rel="noopener" ' +
          'class="airbnb-cta btn-primary" ' +
          'style="width:100%;justify-content:center;gap:8px;border-radius:8px;padding:14px 24px">' +
          '<span>立即預訂</span>' +
          '<svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
          'd="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>' +
          '</svg></a>';
        document.body.appendChild(bar);
        document.body.classList.add('has-booking-bar');
      } else {
        document.body.classList.remove('has-booking-bar');
      }

      // ========== Populate Sidebar ==========
      var sidebarEl = document.getElementById('roomSidebar');
```

**Step 3: Commit**

```bash
git add room-template.html
git commit -m "feat: add fixed mobile booking bar in renderProperty()"
```

---

## Task 4: Mirror calendar renders to mobile element

**File:** `room-template.html`

After Tasks 2 and 3, `#availabilityCalendarMobile` exists in the DOM but never gets populated because `loadAvailability()` and `calNavigate()` only target `#availabilityCalendar`.

**Step 1: Update `loadAvailability()` — success path**

Find (around line 746–748):
```js
          var now = new Date();
          calYear = now.getFullYear();
          calMonth = now.getMonth();
          renderCalendar(el);
        })
```

Replace with:
```js
          var now = new Date();
          calYear = now.getFullYear();
          calMonth = now.getMonth();
          renderCalendar(el);
          var mobileEl = document.getElementById('availabilityCalendarMobile');
          if (mobileEl) renderCalendar(mobileEl);
        })
```

**Step 2: Update `loadAvailability()` — error path**

Find (around line 749–752):
```js
        .catch(function() {
          var el = document.getElementById('availabilityCalendar');
          if (el) el.innerHTML = '<p style="color:#9ca3af;font-size:0.9rem">無法載入空房資訊，請直接至 Airbnb 查看</p>';
        });
```

Replace with:
```js
        .catch(function() {
          var el = document.getElementById('availabilityCalendar');
          if (el) el.innerHTML = '<p style="color:#9ca3af;font-size:0.9rem">無法載入空房資訊，請直接至 Airbnb 查看</p>';
          var mobileEl = document.getElementById('availabilityCalendarMobile');
          if (mobileEl) mobileEl.innerHTML = '<p style="color:#9ca3af;font-size:0.9rem">無法載入空房資訊，請直接至 Airbnb 查看</p>';
        });
```

**Step 3: Update `calNavigate()`**

Find (around line 847–853):
```js
    window.calNavigate = function(dir) {
      calMonth += dir;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      if (calMonth > 11) { calMonth = 0; calYear++; }
      var el = document.getElementById('availabilityCalendar');
      if (el) renderCalendar(el);
    };
```

Replace with:
```js
    window.calNavigate = function(dir) {
      calMonth += dir;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      if (calMonth > 11) { calMonth = 0; calYear++; }
      var el = document.getElementById('availabilityCalendar');
      if (el) renderCalendar(el);
      var mobileEl = document.getElementById('availabilityCalendarMobile');
      if (mobileEl) renderCalendar(mobileEl);
    };
```

**Step 4: Commit**

```bash
git add room-template.html
git commit -m "feat: mirror availability calendar renders to mobile element"
```

---

## Final verification

1. Open a property detail page on mobile viewport (≤ 768px in DevTools).
2. Scroll to bottom — "空房日期" calendar section should appear (amber border, single month).
3. Fixed bar "立即預訂 →" should be visible at the bottom of the screen.
4. Tap "立即預訂" — should open Airbnb URL with UTM params in new tab.
5. Navigate calendar months with `‹` `›` buttons — calendar should update.
6. Switch to desktop viewport (≥ 1024px) — mobile calendar section and fixed bar should both disappear; sidebar should show as before.
7. Switch language — property re-renders, bar re-creates correctly (no duplicate bars).
