# Mobile Availability Calendar + Booking CTA Design

**Date:** 2026-02-25

## Problem

On mobile (< 1024px), the room detail page sidebar (`#roomSidebar`) is `display: none`. This means the availability calendar and "立即預訂" booking button are completely invisible to mobile users.

## Solution

Three additions to `room-template.html`, desktop behavior unchanged.

---

## ① Mobile Availability Calendar (main content)

**What:** Inline `<section>` injected into `mainContent` after the amenities section, containing the availability calendar.

**When:** Only rendered when `p.ical_url` has a value.

**Display:** Hidden on desktop (≥ 1024px via `display:none` / Tailwind `lg:hidden`), full-width on mobile.

**Calendar:** Single month (current month), same `renderCalendar()` / `calNavigate()` logic already used by the sidebar. Uses the shared `calBlockedDates` / `calYear` / `calMonth` state — no duplicate fetch needed because `loadAvailability()` already populates these globals.

**Styling:** Amber border/background, consistent with sidebar calendar. Section title "空房日期".

---

## ② Fixed Bottom Booking Bar (mobile only)

**What:** A fixed `position: fixed; bottom: 0` bar with a full-width "立即預訂 →" button.

**When:** Only rendered when `p.airbnbUrl` has a value.

**Display:** Hidden on desktop (≥ 1024px), visible on mobile.

**Link:** Same `airbnbTrackUrl` (with UTM params) as sidebar button.

**Tracking:** Same `gtag` click event via existing `.airbnb-cta` class listener — no new JS needed.

**Body padding:** Add `padding-bottom: 80px` to `body` on mobile to prevent footer being obscured by the bar.

---

## ③ Desktop (unchanged)

Sidebar remains exactly as-is: sticky 420px panel with calendar + booking button, `display: none` below 1024px.

---

## Implementation Scope

**File:** `room-template.html` only — one file change.

**JS changes:** `renderProperty()` function: append mobile calendar section HTML and fixed bottom bar HTML to `mainContent` (or insert before closing tag). No new fetch calls, no new global state.

**CSS changes:** Two small additions inside `<style>`:
- `.mobile-booking-bar` — fixed bottom bar styles
- `@media (min-width: 1024px)` block to hide mobile-only elements on desktop

---

## Non-goals

- No scroll-to-calendar link in the booking bar
- No 2-month display on mobile
- No changes to sidebar, server.js, or any other file
