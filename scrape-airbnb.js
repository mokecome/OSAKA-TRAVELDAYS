const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = path.join(__dirname, 'scrape-results');
const IMG_DIR = path.join(__dirname, 'images', 'airbnb');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// All 23 listings from Excel
const listings = [
  { room: '京都', name: '', airbnbId: '32369171', url: 'https://www.airbnb.com.tw/rooms/32369171' },
  { room: '405', name: 'NK Homes Namba', airbnbId: '28440628', url: 'https://www.airbnb.com.tw/rooms/28440628' },
  { room: '406', name: 'Shinsaibashi Family Room', airbnbId: '13808333', url: 'https://www.airbnb.com.tw/rooms/13808333' },
  { room: '806', name: 'Osaka Nest 大阪之巢', airbnbId: '39588682', url: 'https://www.airbnb.com.tw/rooms/39588682' },
  { room: '904', name: '愛彼家庭房', airbnbId: '1411658292659990663', url: 'https://www.airbnb.com.tw/rooms/1411658292659990663' },
  { room: '1305', name: 'クリスタルエグゼ リヴィエラ', airbnbId: '1191616569289275531', url: 'https://www.airbnb.com.tw/rooms/1191616569289275531' },
  { room: '西九条', name: '桜川・西九条', airbnbId: '42631189', url: 'https://www.airbnb.com.tw/rooms/42631189' },
  { room: 'DAIDODO', name: 'DAIDODO', airbnbId: '1313041401243092434', url: 'https://www.airbnb.com.tw/rooms/1313041401243092434' },
  { room: '谷六', name: 'The Nomad inn Osaka', airbnbId: '1326417920271287072', url: 'https://www.airbnb.com.tw/rooms/1326417920271287072' },
  { room: '住之江', name: '芸舎', airbnbId: '1462715957355003327', url: 'https://www.airbnb.com.tw/rooms/1462715957355003327' },
  { room: '鷺洲2樓', name: '台香', airbnbId: '1462702559380319721', url: 'https://www.airbnb.com.tw/rooms/1462702559380319721' },
  { room: '鷺洲3樓', name: '台香', airbnbId: '1462711404983544336', url: 'https://www.airbnb.com.tw/rooms/1462711404983544336' },
  { room: '波除', name: 'ハウス大福', airbnbId: '1326407907379451880', url: 'https://www.airbnb.com.tw/rooms/1326407907379451880' },
  { room: '三先', name: '', airbnbId: '1373123947611639228', url: 'https://www.airbnb.com.tw/rooms/1373123947611639228' },
  { room: '角屋', name: '十一鳴', airbnbId: '1372891258852120566', url: 'https://www.airbnb.com.tw/rooms/1372891258852120566' },
  { room: '大正', name: '文華苑 大正 Guest House', airbnbId: '1278927863693438873', url: 'https://www.airbnb.com.tw/rooms/1278927863693438873' },
  { room: '艾屋', name: 'よもぎの屋', airbnbId: '1543539317236403832', url: 'https://www.airbnb.com.tw/rooms/1543539317236403832' },
  { room: '都島', name: '光', airbnbId: '1462723475374263402', url: 'https://www.airbnb.com.tw/rooms/1462723475374263402' },
  { room: '天蓬-2F天和', name: '天蓬の宿', airbnbId: '1593290188413619025', url: 'https://www.airbnb.com.tw/rooms/1593290188413619025' },
  { room: '天蓬-2F天洋', name: '天蓬の宿', airbnbId: '1593269693497404617', url: 'https://www.airbnb.com.tw/rooms/1593269693497404617' },
  { room: '天蓬-3F蓬和', name: '天蓬の宿', airbnbId: '1593303138764010764', url: 'https://www.airbnb.com.tw/rooms/1593303138764010764' },
  { room: '天蓬-3F蓬洋', name: '天蓬の宿', airbnbId: '1572512577917857134', url: 'https://www.airbnb.com.tw/rooms/1572512577917857134' },
  { room: '天蓬-4F最上', name: '天蓬の宿', airbnbId: '1594625499363067746', url: 'https://www.airbnb.com.tw/rooms/1594625499363067746' },
];

// Download image helper
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const ws = fs.createWriteStream(filepath);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(filepath); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function scrapeListing(page, listing, index) {
  const result = {
    room: listing.room,
    excelName: listing.name,
    airbnbId: listing.airbnbId,
    airbnbUrl: listing.url,
    title: '',
    rating: '',
    reviews: '',
    guests: '',
    bedrooms: '',
    beds: '',
    bathrooms: '',
    propertyType: '',
    description: '',
    amenities: [],
    checkIn: '',
    checkOut: '',
    photos: [],
    localPhotos: [],
  };

  console.log(`\n[${ index + 1 }/${listings.length}] Scraping: ${listing.room} (${listing.airbnbId})...`);

  try {
    await page.goto(listing.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Close cookie/translation popups
    for (const label of ['關閉', 'Close', '知道了', '確定']) {
      try {
        const btn = page.locator(`button[aria-label="${label}"]`).first();
        if (await btn.isVisible({ timeout: 1500 })) { await btn.click(); await page.waitForTimeout(500); }
      } catch(e) {}
    }
    // Close translation banner if any
    try {
      const transBanner = page.locator('button:has-text("翻譯關閉"), button:has-text("顯示原文")');
      // don't click, just dismiss
    } catch(e) {}

    // ===== EXTRACT DATA USING page.evaluate() =====
    const pageData = await page.evaluate(() => {
      const data = {};

      // 1. Title from h1
      const h1 = document.querySelector('h1');
      data.title = h1 ? h1.textContent.trim() : '';

      // 2. JSON-LD structured data
      const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of ldScripts) {
        try {
          const ld = JSON.parse(s.textContent);
          if (ld['@type'] === 'VacationRental' || ld['@type'] === 'Apartment' || ld['@type'] === 'House' || ld['@type'] === 'LodgingBusiness') {
            data.jsonLd = ld;
          }
        } catch(e) {}
      }

      // 3. Find rating from page - look for specific patterns
      const allText = document.body.innerText;

      // Rating: look for ★ X.XX pattern or just a standalone rating
      const ratingMatch = allText.match(/★\s*([\d.]+)/);
      if (ratingMatch) data.rating = ratingMatch[1];

      // Reviews: look for N 則評價
      const reviewMatch = allText.match(/(\d+)\s*則評價/);
      if (reviewMatch) data.reviews = reviewMatch[1];

      // 4. Overview bar: "N位房客 · N間臥室 · N張床 · N間衛浴"
      // This is usually in an <ol> element near the top
      const overviewOl = document.querySelector('ol');
      if (overviewOl) {
        const olText = overviewOl.textContent;
        const guestM = olText.match(/(\d+)\s*位/);
        if (guestM) data.guests = guestM[1];
        const bedroomM = olText.match(/(\d+)\s*間.*?臥室/);
        if (bedroomM) data.bedrooms = bedroomM[1];
        const bedM = olText.match(/(\d+)\s*張.*?床/);
        if (bedM) data.beds = bedM[1];
        const bathM = olText.match(/([\d.]+)\s*間.*?(衛浴|浴室)/);
        if (bathM) data.bathrooms = bathM[1];
      }

      // Also try from li items
      const lis = document.querySelectorAll('ol li');
      lis.forEach(li => {
        const t = li.textContent.trim();
        if (!data.guests) { const m = t.match(/(\d+)\s*位\s*(旅客|房客|来宾|guest)/i); if (m) data.guests = m[1]; }
        if (!data.bedrooms) { const m = t.match(/(\d+)\s*間\s*臥室/); if (m) data.bedrooms = m[1]; }
        if (!data.beds) { const m = t.match(/(\d+)\s*張\s*床/); if (m) data.beds = m[1]; }
        if (!data.bathrooms) { const m = t.match(/([\d.]+)\s*間\s*(衛浴|浴室)/); if (m) data.bathrooms = m[1]; }
      });
      // Fallback: check JSON-LD occupancy
      if (!data.guests && data.jsonLd && data.jsonLd.containsPlace && data.jsonLd.containsPlace.occupancy) {
        data.guests = String(data.jsonLd.containsPlace.occupancy.value);
      }

      // 5. Description section
      const descSection = document.querySelector('[data-section-id="DESCRIPTION_DEFAULT"]');
      if (descSection) {
        // Get just the readable text, skip "顯示更多" button text
        const descSpans = descSection.querySelectorAll('span');
        let desc = '';
        descSpans.forEach(s => {
          const t = s.textContent.trim();
          if (t.length > 20) desc += (desc ? '\n' : '') + t;
        });
        data.description = desc || descSection.innerText.replace(/顯示更多內容|顯示較少內容/g, '').trim();
      }

      // 6. Amenities section
      const amenitySection = document.querySelector('[data-section-id="AMENITIES_DEFAULT"]');
      if (amenitySection) {
        const amenityDivs = amenitySection.querySelectorAll('div[class]');
        const amenitySet = new Set();
        amenityDivs.forEach(div => {
          // Amenity items usually have text + optional "不提供" strikethrough
          const text = div.textContent.trim();
          if (text && text.length >= 2 && text.length <= 20 &&
              !text.includes('顯示') && !text.includes('有提供') &&
              !text.includes('設備') && !text.includes('服務')) {
            amenitySet.add(text);
          }
        });
        data.amenitiesInline = [...amenitySet];
      }

      // 7. Check-in/check-out from policies section
      const policySection = document.querySelector('[data-section-id="POLICIES_DEFAULT"]');
      if (policySection) {
        const pText = policySection.innerText;
        // Patterns: "入住時間：下午3:00後" "退房時間：上午11:00前"
        const ciMatch = pText.match(/入住[時间]*[：:]\s*(.+?)(?:\n|退房|$)/);
        if (ciMatch) data.checkIn = ciMatch[1].trim();
        const coMatch = pText.match(/退房[時间]*[：:]\s*(.+?)(?:\n|入住|$)/);
        if (coMatch) data.checkOut = coMatch[1].trim();

        // Also try: 下午3:00 - 下午8:00 / 上午11:00
        if (!data.checkIn) {
          const ci2 = pText.match(/下午\s*[\d:]+\s*[-~]\s*(?:下午|晚上)\s*[\d:]+/);
          if (ci2) data.checkIn = ci2[0];
          else {
            const ci3 = pText.match(/(下午\s*\d+[：:]\d+)\s*(?:後|以後|之後)/);
            if (ci3) data.checkIn = ci3[1] + '以後';
          }
        }
        if (!data.checkOut) {
          const co2 = pText.match(/(上午\s*[\d:]+)\s*(?:前|之前)/);
          if (co2) data.checkOut = co2[1] + '之前';
        }
      }

      // 8. All photo URLs from img tags
      const imgs = document.querySelectorAll('img');
      const photoSet = new Set();
      imgs.forEach(img => {
        const src = img.src || img.dataset.src || '';
        if (src.includes('muscache.com') && src.includes('/pictures/') &&
            !src.includes('avatar') && !src.includes('user') &&
            !src.includes('platform-assets') && !src.includes('search-bar') &&
            !src.includes('Map') && !src.includes('map')) {
          // Get highest quality version
          let clean = src.split('?')[0];
          photoSet.add(clean);
        }
      });
      data.photos = [...photoSet];

      return data;
    });

    // Merge extracted data
    result.title = pageData.title || result.title;
    result.rating = pageData.rating || '';
    result.reviews = pageData.reviews || '';
    result.guests = pageData.guests || '';
    result.bedrooms = pageData.bedrooms || '';
    result.beds = pageData.beds || '';
    result.bathrooms = pageData.bathrooms || '';
    result.description = pageData.description || '';
    result.checkIn = pageData.checkIn || '';
    result.checkOut = pageData.checkOut || '';
    result.photos = pageData.photos || [];

    // JSON-LD enrichment
    if (pageData.jsonLd) {
      const ld = pageData.jsonLd;
      if (!result.rating && ld.aggregateRating) result.rating = String(ld.aggregateRating.ratingValue);
      if (!result.reviews && ld.aggregateRating) result.reviews = String(ld.aggregateRating.ratingCount);
      if (!result.guests && ld.containsPlace?.occupancy) result.guests = String(ld.containsPlace.occupancy.value);
      if (ld.description && !result.description) result.description = ld.description;
    }

    // ===== AMENITIES: try clicking "顯示全部 N 項設備與服務" =====
    if (pageData.amenitiesInline && pageData.amenitiesInline.length > 0) {
      result.amenities = pageData.amenitiesInline;
    }

    try {
      // Find and click the "show all amenities" button
      const amenityBtns = await page.locator('button').all();
      for (const btn of amenityBtns) {
        const text = await btn.textContent().catch(() => '');
        if (text.includes('顯示全部') && (text.includes('設備') || text.includes('amenities'))) {
          await btn.scrollIntoViewIfNeeded({ timeout: 5000 });
          await page.waitForTimeout(500);
          await btn.click({ timeout: 10000 });
          await page.waitForTimeout(2500);

          // Extract from modal
          const modalAmenities = await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]') || document.querySelector('[data-testid="modal-container"]');
            if (!dialog) return [];
            const items = new Set();
            // Look for amenity rows - they typically have an icon + text
            const rows = dialog.querySelectorAll('div');
            rows.forEach(row => {
              // Check if this div contains an SVG (icon) and text
              const svg = row.querySelector('svg');
              const text = row.textContent.trim();
              if (text && text.length >= 2 && text.length <= 25 &&
                  !text.includes('顯示') && !text.includes('關閉') &&
                  !text.includes('有提供') && !text.includes('設備與服務') &&
                  !text.includes('不提供')) {
                // Only add if this appears to be a leaf element (no child divs with text)
                const childDivs = row.querySelectorAll('div');
                let isLeaf = true;
                childDivs.forEach(cd => {
                  if (cd !== row && cd.textContent.trim() === text) isLeaf = false;
                });
                if (isLeaf || childDivs.length <= 1) items.add(text);
              }
            });
            return [...items];
          });

          if (modalAmenities.length > result.amenities.length) {
            result.amenities = modalAmenities;
          }

          // Close modal
          try { await page.keyboard.press('Escape'); await page.waitForTimeout(500); } catch(e) {}
          break;
        }
      }
    } catch(e) { console.log('  - amenities extraction note:', e.message); }

    // ===== PHOTOS: click "顯示所有照片" to get all =====
    try {
      const photoBtns = await page.locator('button').all();
      for (const btn of photoBtns) {
        const text = await btn.textContent().catch(() => '');
        if (text.includes('顯示所有照片') || text.includes('Show all photos')) {
          await btn.scrollIntoViewIfNeeded({ timeout: 5000 });
          await page.waitForTimeout(500);
          await btn.click({ timeout: 10000 });
          await page.waitForTimeout(3000);

          // Scroll through gallery to load lazy images
          for (let i = 0; i < 10; i++) {
            await page.evaluate(() => {
              const modal = document.querySelector('[role="dialog"]') || document;
              const scrollable = modal.querySelector('[style*="overflow"]') || modal;
              if (scrollable.scrollBy) scrollable.scrollBy(0, 600);
              else window.scrollBy(0, 600);
            });
            await page.waitForTimeout(600);
          }

          // Extract all photos from gallery
          const galleryPhotos = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            const photoSet = new Set();
            imgs.forEach(img => {
              const src = img.src || '';
              if (src.includes('muscache.com') && src.includes('/pictures/') &&
                  !src.includes('avatar') && !src.includes('user') &&
                  !src.includes('platform-assets') && !src.includes('search-bar') &&
                  !src.includes('Map') && !src.includes('map')) {
                photoSet.add(src.split('?')[0]);
              }
            });
            return [...photoSet];
          });

          if (galleryPhotos.length > result.photos.length) {
            result.photos = galleryPhotos;
          }

          try { await page.keyboard.press('Escape'); await page.waitForTimeout(500); } catch(e) {}
          break;
        }
      }
    } catch(e) { console.log('  - gallery extraction note:', e.message); }

    // ===== LOG RESULTS =====
    console.log(`  Title: ${result.title}`);
    console.log(`  Rating: ${result.rating} (${result.reviews} reviews)`);
    console.log(`  Guests: ${result.guests}, Bedrooms: ${result.bedrooms}, Beds: ${result.beds}, Bath: ${result.bathrooms}`);
    console.log(`  CheckIn: ${result.checkIn}, CheckOut: ${result.checkOut}`);
    console.log(`  Description: ${result.description ? result.description.substring(0, 80) + '...' : 'N/A'}`);
    console.log(`  Amenities: ${result.amenities.length} items - ${result.amenities.slice(0, 5).join(', ')}${result.amenities.length > 5 ? '...' : ''}`);
    console.log(`  Photos: ${result.photos.length} found`);

    // ===== DOWNLOAD PHOTOS =====
    const propertyImgDir = path.join(IMG_DIR, listing.airbnbId);
    if (!fs.existsSync(propertyImgDir)) fs.mkdirSync(propertyImgDir, { recursive: true });

    for (let i = 0; i < result.photos.length; i++) {
      const photoUrl = result.photos[i];
      const ext = '.jpg';
      const filename = `${String(i + 1).padStart(2, '0')}${ext}`;
      const filepath = path.join(propertyImgDir, filename);

      if (fs.existsSync(filepath)) {
        result.localPhotos.push(`images/airbnb/${listing.airbnbId}/${filename}`);
        continue;
      }

      try {
        await downloadImage(photoUrl, filepath);
        result.localPhotos.push(`images/airbnb/${listing.airbnbId}/${filename}`);
      } catch(e) {
        console.log(`    Failed to download photo ${i + 1}: ${e.message}`);
      }
    }
    console.log(`  Downloaded: ${result.localPhotos.length} photos to images/airbnb/${listing.airbnbId}/`);

  } catch(e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // Save individual result
  const outFile = path.join(OUTPUT_DIR, `${listing.airbnbId}.json`);
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');

  return result;
}

// Process range (by index, default all)
const startIdx = parseInt(process.argv[2]) || 0;
const endIdx = parseInt(process.argv[3]) || listings.length;

(async () => {
  console.log(`=== Airbnb Scraper ===`);
  console.log(`Processing listings ${startIdx + 1} to ${endIdx} of ${listings.length}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-TW',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();
  const allResults = [];

  for (let i = startIdx; i < endIdx; i++) {
    const result = await scrapeListing(page, listings[i], i);
    allResults.push(result);
    // Pause between requests
    if (i < endIdx - 1) await page.waitForTimeout(2000);
  }

  await browser.close();

  // Save combined results (merge with existing)
  const combinedFile = path.join(OUTPUT_DIR, 'all-results.json');
  let existing = [];
  if (fs.existsSync(combinedFile)) {
    try { existing = JSON.parse(fs.readFileSync(combinedFile, 'utf8')); } catch(e) {}
  }
  for (const r of allResults) {
    const idx = existing.findIndex(e => e.airbnbId === r.airbnbId);
    if (idx >= 0) existing[idx] = r;
    else existing.push(r);
  }
  fs.writeFileSync(combinedFile, JSON.stringify(existing, null, 2), 'utf8');

  console.log(`\n=== Done! ===`);
  console.log(`Processed: ${allResults.length} listings`);
  console.log(`Results saved to: ${OUTPUT_DIR}`);
})();
