# Privacy Policy & Terms of Use Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add trilingual (zh-TW / ja / en) Privacy Policy and Terms of Use as standalone HTML pages, and wire up the existing footer links.

**Architecture:** Two new static HTML files (`privacy.html`, `terms.html`) styled with Tailwind CDN + amber color scheme matching the main site. Each page has a top nav with language switcher and a "back to home" button. Footer links in `index.html` updated from `href="#"` to the new pages. Copyright year updated from 2025 → 2026 across all affected files.

**Tech Stack:** HTML, Tailwind CSS CDN (same as main site), vanilla JS for language switching

---

### Task 1: Create `privacy.html`

**Files:**
- Create: `public_html/privacy.html`

**Step 1: Write the file**

Full page structure:
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-i18n-title="privacy.title">隱私政策 | 大阪旅行日民宿</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* amber accent, section headings, lang btn active state */
  </style>
</head>
<body class="bg-amber-50 text-stone-800 min-h-screen">

  <!-- Top Nav -->
  <nav class="bg-amber-900 text-white py-4 px-6 flex items-center justify-between">
    <a href="index.html" class="flex items-center gap-3 hover:opacity-80 transition">
      <img src="images/logo.png" class="w-10 h-10 object-contain">
      <span class="font-serif text-lg">大阪旅行日民宿</span>
    </a>
    <div class="flex items-center gap-4">
      <div class="flex gap-1">
        <button class="lang-btn" data-lang="zh-TW">繁中</button>
        <button class="lang-btn" data-lang="ja">日文</button>
        <button class="lang-btn" data-lang="en">EN</button>
      </div>
      <a href="index.html" class="text-amber-300 hover:text-white text-sm" data-i18n="nav.back">← 返回首頁</a>
    </div>
  </nav>

  <!-- Content -->
  <main class="container mx-auto max-w-3xl px-6 py-16">
    <h1 class="text-3xl font-serif font-bold text-amber-900 mb-2" data-i18n="privacy.title">隱私政策</h1>
    <p class="text-stone-500 text-sm mb-10" data-i18n="privacy.updated">最後更新：2026年2月</p>

    <!-- Section 1–7 each wrapped in <section> with heading + paragraphs -->
    <!-- All text elements have data-i18n attributes -->
  </main>

  <!-- Footer -->
  <footer class="bg-amber-900 text-amber-300 text-center py-6 text-sm">
    © 2026 大阪旅行日民宿 OSAKA TRAVELDAYS. All rights reserved.
  </footer>

  <script>
    /* TRANSLATIONS object (zh-TW / ja / en) + setLanguage() + auto-load from localStorage */
  </script>
</body>
</html>
```

Content sections (zh-TW / ja / en):
1. **資料蒐集目的** — 預訂處理、客戶服務、法規遵循
2. **蒐集的資料類型** — 姓名、聯絡方式、付款資訊、入住日期
3. **資料使用方式** — 僅用於提供住宿服務，不作行銷用途
4. **資料保護措施** — SSL加密、存取控制、資料保留期限
5. **第三方共享** — Airbnb平台、支付處理商，不對外販售
6. **Cookie 使用** — 僅用於語言偏好儲存
7. **聯絡方式** — service.traveldays@gmail.com / LINE @fgk8695x

**Step 2: Verify in browser**

Open `privacy.html` locally, check:
- [ ] Language switcher works (繁中 / 日文 / EN)
- [ ] All text changes correctly on language switch
- [ ] "返回首頁" link goes to index.html
- [ ] Styling matches amber theme

**Step 3: Commit**

```bash
git add public_html/privacy.html
git commit -m "feat: add trilingual privacy policy page"
```

---

### Task 2: Create `terms.html`

**Files:**
- Create: `public_html/terms.html`

**Step 1: Write the file**

Same structure as `privacy.html` but with Terms of Use content sections:
1. **服務說明** — 大阪市短期住宿民宿服務
2. **預訂與付款** — 最短2晚、接受信用卡/PayPal/Apple Pay/Google Pay
3. **取消政策** — 14天前免費取消，之後依比例收費
4. **入住規則** — 禁止吸菸、禁止寵物、禁止派對、噪音限制
5. **責任限制** — 不負責個人財物遺失，建議投保旅遊險
6. **爭議處理** — 日本法律管轄，大阪地方法院
7. **聯絡方式** — service.traveldays@gmail.com / LINE @fgk8695x

**Step 2: Verify in browser**

Same checks as Task 1.

**Step 3: Commit**

```bash
git add public_html/terms.html
git commit -m "feat: add trilingual terms of use page"
```

---

### Task 3: Update `index.html` footer links and copyright year

**Files:**
- Modify: `public_html/index.html` lines 1795–1798

**Step 1: Update footer links**

Find:
```html
<a href="#" class="text-amber-400 hover:text-white transition-colors text-sm" data-i18n="footer.privacy">隱私政策</a>
<a href="#" class="text-amber-400 hover:text-white transition-colors text-sm" data-i18n="footer.terms">使用條款</a>
```

Replace with:
```html
<a href="privacy.html" class="text-amber-400 hover:text-white transition-colors text-sm" data-i18n="footer.privacy">隱私政策</a>
<a href="terms.html" class="text-amber-400 hover:text-white transition-colors text-sm" data-i18n="footer.terms">使用條款</a>
```

**Step 2: Update copyright year**

Find (line ~1795):
```html
© 2025 大阪旅行日民宿 OSAKA TRAVELDAYS. All rights reserved.
```

Replace with:
```html
© 2026 大阪旅行日民宿 OSAKA TRAVELDAYS. All rights reserved.
```

**Step 3: Verify**

Open `index.html` → scroll to footer → confirm links open correct pages.

**Step 4: Commit**

```bash
git add public_html/index.html
git commit -m "fix: wire up privacy/terms links, update copyright to 2026"
```
