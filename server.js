const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;
const SITE_URL = process.env.SITE_URL || 'https://airbnb.traveldays.com.tw';
const icalCache = new Map();

// ==================== AUTH ====================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CHANGE_ME_NOW';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(32).toString('hex');
if (!process.env.ADMIN_TOKEN) {
  console.log('⚠️  Auto-generated ADMIN_TOKEN:', ADMIN_TOKEN);
}

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: '未授權' });
  }
  next();
}

// ==================== MIDDLEWARE ====================

// Gzip compression
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) return next();

  const originalSend = res.send.bind(res);
  res.send = function(body) {
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      const contentType = res.getHeader('Content-Type') || '';
      if (contentType.includes('text') || contentType.includes('json') || contentType.includes('xml') || contentType.includes('javascript')) {
        res.setHeader('Content-Encoding', 'gzip');
        res.removeHeader('Content-Length');
        const compressed = zlib.gzipSync(typeof body === 'string' ? Buffer.from(body) : body);
        return originalSend(compressed);
      }
    }
    return originalSend(body);
  };
  next();
});

app.use(express.json({ limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self'",
    "frame-src https://www.google.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; '));
  next();
});

// CORS whitelist
const ALLOWED_ORIGINS = [
  'https://airbnb.traveldays.com.tw',
  'https://phpstack-1267721-6206156.cloudwaysapps.com'
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Token');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '請求過於頻繁，請稍後再試' }
}));

// Prevent nginx / browser from caching any API response
app.use('/api/', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Accel-Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});
app.post('/api/upload', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: '上傳次數過多' }
}));

// Serve admin.html from views/ with no-cache headers
app.get('/admin.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ==================== DATABASE SETUP ====================
const db = new Database(path.join(__dirname, 'osaka-minshuku.db'));
db.pragma('journal_mode = DELETE');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT '包棟民宿',
    regionZh TEXT DEFAULT '',
    regionEn TEXT DEFAULT '',
    regionDesc TEXT DEFAULT '',
    badge TEXT DEFAULT '',
    secondaryBadge TEXT DEFAULT '',
    shortDesc TEXT DEFAULT '',
    address TEXT DEFAULT '',
    transportInfo TEXT DEFAULT '',
    introduction TEXT DEFAULT '',
    videoUrl TEXT DEFAULT '',
    mapEmbedUrl TEXT DEFAULT '',
    airbnbUrl TEXT DEFAULT '',
    capacity TEXT DEFAULT '',
    size TEXT DEFAULT '',
    checkIn TEXT DEFAULT '下午3點以後',
    checkOut TEXT DEFAULT '上午10點之前',
    transportDetail TEXT DEFAULT '',
    quickInfo TEXT DEFAULT '[]',
    amenities TEXT DEFAULT '[]',
    spaceIntro TEXT DEFAULT '[]',
    nearestStation TEXT DEFAULT '',
    nearbyAttractions TEXT DEFAULT '',
    parkingInfo TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now','localtime')),
    updatedAt TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propertyId TEXT NOT NULL,
    url TEXT NOT NULL,
    isLocal INTEGER DEFAULT 0,
    filename TEXT DEFAULT '',
    sortOrder INTEGER DEFAULT 0,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nameZh TEXT NOT NULL DEFAULT '',
    nameEn TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ical_cache (
    property_id TEXT PRIMARY KEY,
    blocked_dates TEXT NOT NULL DEFAULT '[]',
    fetched_at INTEGER NOT NULL DEFAULT 0
  );

`);

// Migrate existing DB: add new columns if missing
const migrations = [
  "ALTER TABLE properties ADD COLUMN amenities TEXT DEFAULT '[]'",
  "ALTER TABLE properties ADD COLUMN spaceIntro TEXT DEFAULT '[]'",
  "ALTER TABLE properties ADD COLUMN nearestStation TEXT DEFAULT ''",
  "ALTER TABLE properties ADD COLUMN regionId INTEGER DEFAULT NULL",
  "ALTER TABLE properties ADD COLUMN ical_url TEXT DEFAULT ''",
  "ALTER TABLE properties ADD COLUMN nearbyAttractions TEXT DEFAULT ''",
  "ALTER TABLE properties ADD COLUMN parkingInfo TEXT DEFAULT ''"
];
for (const sql of migrations) {
  try { db.exec(sql); } catch(e) {
    if (!e.message.includes('duplicate column name')) console.error('[migration]', e.message);
  }
}

// Create indexes for frequently queried foreign keys
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_properties_regionId ON properties(regionId);
  CREATE INDEX IF NOT EXISTS idx_property_images_propertyId ON property_images(propertyId);
`);

// Migrate existing properties: create regions from regionZh and link
{
  const orphans = db.prepare("SELECT DISTINCT regionZh, regionEn, regionDesc FROM properties WHERE regionId IS NULL AND regionZh != ''").all();
  if (orphans.length > 0) {
    const maxOrder = db.prepare("SELECT COALESCE(MAX(sortOrder), -1) as m FROM regions").get().m;
    let order = maxOrder + 1;
    for (const o of orphans) {
      const existing = db.prepare("SELECT id FROM regions WHERE nameZh = ?").get(o.regionZh);
      let regionId;
      if (existing) {
        regionId = existing.id;
      } else {
        const info = db.prepare("INSERT INTO regions (nameZh, nameEn, description, sortOrder) VALUES (?,?,?,?)").run(o.regionZh, o.regionEn || '', o.regionDesc || '', order++);
        regionId = info.lastInsertRowid;
      }
      db.prepare("UPDATE properties SET regionId = ? WHERE regionZh = ? AND regionId IS NULL").run(regionId, o.regionZh);
    }
    console.log(`  Migrated ${orphans.length} region(s) from existing properties`);
  }
}

// ==================== SITE SETTINGS DEFAULTS ====================
{
  const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
  const defaults = [
    ['hero.image', JSON.stringify({ url: '/images/hero.jpg' })],
    ['hero.title', JSON.stringify({
      'zh-TW': '大阪旅行日民宿',
      'ja': '大阪トラベルデイズ民宿',
      'en': 'Osaka TravelDays Guesthouse'
    })],
    ['hero.subtitle', JSON.stringify({
      'zh-TW': 'OSAKA TRAVELDAYS',
      'ja': 'OSAKA TRAVELDAYS',
      'en': 'OSAKA TRAVELDAYS'
    })],
    ['hero.desc', JSON.stringify({
      'zh-TW': '精選大阪各區優質民宿・包棟住宿・公寓式酒店\n體驗最道地的日本生活',
      'ja': '大阪各エリアの厳選民泊・丸ごと貸切・サービスアパートメント\n本場の日本生活を体験',
      'en': 'Curated Osaka guesthouses, entire-home rentals & serviced apartments\nExperience authentic Japanese living'
    })],
    ['hero.cta', JSON.stringify({
      'zh-TW': '瀏覽房源',
      'ja': '物件を見る',
      'en': 'View Properties'
    })],
    ['faq.items', JSON.stringify([
      {
        q: { 'zh-TW': '如何預訂大阪旅行日民宿？', 'ja': '大阪旅行日民宿の予約方法は？', 'en': 'How do I book?' },
        a: {
          'zh-TW': '透過 Airbnb 預訂，或透過 LINE（@fgk8695x）/ Email（service.traveldays@gmail.com）聯繫我們進行直接預訂。最少需訂 2 晚，支援信用卡、PayPal、Apple Pay / Google Pay 等付款方式。',
          'ja': 'Airbnbでご予約いただくか、LINE（@fgk8695x）/ Email（service.traveldays@gmail.com）でご連絡ください。最低2泊から。クレジットカード・PayPal・Apple Pay / Google Pay対応。',
          'en': 'Book via Airbnb, or contact us via LINE (@fgk8695x) / Email (service.traveldays@gmail.com) for direct booking. Minimum 2 nights. Accepts credit card, PayPal, Apple Pay / Google Pay.'
        }
      },
      {
        q: { 'zh-TW': '入住和退房時間是幾點？', 'ja': 'チェックイン・チェックアウト時間は？', 'en': 'What are the check-in and check-out times?' },
        a: {
          'zh-TW': '入住時間為下午 3 點（15:00）以後，退房時間為上午 10 點（10:00）之前。我們採用自助式密碼鎖入住，入住前會將密碼傳送給您，讓您隨時輕鬆入住。',
          'ja': 'チェックインは15:00以降、チェックアウトは10:00まで。暗証番号式セルフチェックインで、入室前にパスワードをお送りします。',
          'en': 'Check-in from 15:00, check-out by 10:00. We use self check-in with a code lock — your access code will be sent before arrival.'
        }
      },
      {
        q: { 'zh-TW': '民宿提供哪些設施和服務？', 'ja': 'どんな設備・サービスがありますか？', 'en': 'What amenities and services are included?' },
        a: {
          'zh-TW': '所有房源均配備免費 WiFi、廚房設備、洗衣機、空調、吹風機、毛巾及沐浴用品等基本生活設施。部分房源另提供停車場、浴缸、私人庭院等。詳細設施請參考各房源頁面。',
          'ja': '全物件に無料WiFi・キッチン・洗濯機・エアコン・ドライヤー・タオル・アメニティを完備。一部物件は駐車場・バスタブ・専用庭あり。詳細は各物件ページへ。',
          'en': 'All properties include free WiFi, kitchen, washer, AC, hair dryer, towels and toiletries. Some properties also offer parking, bathtub, and private garden. See each listing for details.'
        }
      },
      {
        q: { 'zh-TW': '大阪旅行日民宿有哪些地區的房源？', 'ja': 'どのエリアに物件がありますか？', 'en': 'Which areas do you have properties in?' },
        a: {
          'zh-TW': '我們的房源遍布大阪熱門地區，包括<strong>大正區</strong>（小沖繩風情）、<strong>心齋橋/日本橋/難波</strong>（購物美食中心）、<strong>住之江區</strong>（寧靜住宅區）、<strong>西九條/九條區/福島區</strong>（USJ交通樞紐）。所有房源均鄰近車站，方便前往各大景點。',
          'ja': '大阪の人気エリア（大正区、心斎橋・難波・日本橋、住之江区、西九条・九条・福島区）に物件があります。',
          'en': 'Our properties are located in popular Osaka areas including Taisho Ward, Shinsaibashi/Namba/Nipponbashi, Suminoe Ward, and Nishi-Kujo/Kujo/Fukushima areas.'
        }
      },
      {
        q: { 'zh-TW': '可以取消預訂或改期嗎？', 'ja': 'キャンセル・日程変更はできますか？', 'en': 'Can I cancel or reschedule?' },
        a: {
          'zh-TW': '入住 14 天前可免費取消，之後將依距離入住日的時間收取相應費用。如需改期，請盡早透過 LINE 或 Email 聯繫我們協助處理。詳細取消政策請參考 Airbnb 預訂頁面。',
          'ja': '14日前まで無料キャンセル、以降は時期により費用が発生します。日程変更はLINEまたはEmailでお早めにご連絡ください。詳細はAirbnbページをご確認ください。',
          'en': 'Free cancellation up to 14 days before check-in. Fees apply after that based on how close to the check-in date. Contact us via LINE or Email for rescheduling. See the Airbnb listing for the full cancellation policy.'
        }
      },
      {
        q: { 'zh-TW': '退房後可以寄放行李嗎？', 'ja': 'チェックアウト後、荷物を預けられますか？', 'en': 'Can I store luggage after check-out?' },
        a: {
          'zh-TW': '只能放到下午一點。',
          'ja': '午後1時まで荷物をお預かりできます。',
          'en': 'Luggage can only be stored until 1 PM.'
        }
      }
    ])],
    ['footer.email', JSON.stringify('service.traveldays@gmail.com')],
    ['footer.line', JSON.stringify('@fgk8695x')],
    ['footer.company', JSON.stringify({
      'zh-TW': 'DAIDODO合同会社',
      'ja': 'DAIDODO合同会社',
      'en': 'DAIDODO LLC'
    })],
    ['footer.address', JSON.stringify({
      'zh-TW': '大阪市中央区上本町西3−3−２',
      'ja': '大阪市中央区上本町西3−3−２',
      'en': '3-3-2 Uehommachi Nishi, Chuo-ku, Osaka'
    })]
  ];
  for (const [key, value] of defaults) {
    insertSetting.run(key, value);
  }
}

// ==================== IMAGE UPLOAD ====================
const uploadDir = path.join(__dirname, 'images', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + '-' + Math.random().toString(36).substring(2, 9) + ext;
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

// ==================== iCAL ====================
function parseIcal(icsText) {
  const blocked = new Set();
  const events = icsText.split('BEGIN:VEVENT').slice(1);
  for (const ev of events) {
    const s = ev.match(/DTSTART[^:\n]*:(\d{8})/);
    const e = ev.match(/DTEND[^:\n]*:(\d{8})/);
    if (s && e) {
      const d = new Date(s[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      const end = new Date(e[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      while (d < end) {
        blocked.add(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
    }
  }
  return Array.from(blocked);
}


// ==================== SSR RENDERER ====================

const HOUSE_ICON_SVG = '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>';
const APARTMENT_ICON_SVG = '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>';

/**
 * Extract the display value for `lang` from a multilingual field.
 * Handles: plain string (backward compat), JSON object, or JSON string.
 */
function localizeField(val, lang) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return lang in val ? val[lang] : (val['zh-TW'] ?? '');
  if (typeof val === 'string' && val.startsWith('{')) {
    try { const o = JSON.parse(val); return lang in o ? o[lang] : (o['zh-TW'] ?? ''); } catch (e) {}
  }
  return val;
}

function ssrRenderCard(property, delay, lang) {
  lang = lang || 'zh-TW';
  const name          = localizeField(property.name, lang);
  const shortDesc     = localizeField(property.shortDesc, lang);
  const badge         = localizeField(property.badge, lang);
  const secondaryBadge = localizeField(property.secondaryBadge, lang);
  const address       = localizeField(property.address, lang);
  const transportInfo = localizeField(property.transportInfo, lang);
  const coverUrl = (property.images && property.images.length > 0) ? property.images[0].url || '' : '';
  const badgeIcon = (badge === '公寓式民宿' || property.type === '公寓式民宿') ? APARTMENT_ICON_SVG : HOUSE_ICON_SVG;
  const delayAttr = delay > 0 ? ` style="animation-delay: ${delay}s;"` : '';

  return `<div class="property-card animate-fadeInUp"${delayAttr}>` +
    `<div class="relative aspect-[4/3] overflow-hidden">` +
      `<img src="${escHtml(coverUrl)}" alt="${escHtml(name)}" loading="lazy" class="w-full h-full object-cover card-image">` +
      `<div class="image-overlay"></div>` +
      `<div class="absolute top-4 left-4"><span class="badge">${badgeIcon} ${escHtml(badge)}</span></div>` +
      (secondaryBadge ? `<div class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5"><span class="text-amber-800 font-bold text-sm">${escHtml(secondaryBadge)}</span></div>` : '') +
    `</div>` +
    `<div class="p-6 flex flex-col flex-1">` +
      `<h3 class="font-bold text-xl text-amber-900 mb-1">${escHtml(name)}</h3>` +
      `<p class="text-amber-500 text-sm mb-4">${escHtml(shortDesc)}</p>` +
      `<div class="space-y-1 mb-5">` +
        `<div class="info-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>${escHtml(address)}</span></div>` +
        `<div class="info-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>${escHtml(transportInfo)}</span></div>` +
      `</div>` +
      `<a href="rooms/${escHtml(property.id)}.html" class="btn-primary w-full mt-auto"><span>查看詳情</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></a>` +
    `</div>` +
  `</div>`;
}

function ssrRenderRegion(region, properties, isOdd, lang) {
  lang = lang || 'zh-TW';
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
    if (count === 1) cardsHtml += `<div class="w-full max-w-sm">${ssrRenderCard(properties[i], delay, lang)}</div>`;
    else if (count >= 5) cardsHtml += `<div class="w-full md:w-[calc(33.333%-1.4rem)]">${ssrRenderCard(properties[i], delay, lang)}</div>`;
    else cardsHtml += ssrRenderCard(properties[i], delay, lang);
  }

  return `<div class="py-16 lg:py-20 ${bgClass}" data-region-id="${escHtml(String(region.id))}">` +
    `<div class="container mx-auto px-4 lg:px-8">` +
      `<div class="text-center mb-14">` +
        `<span class="text-amber-500 text-sm tracking-widest uppercase mb-3 block">${escHtml(region.nameEn)}</span>` +
        `<h2 class="text-2xl md:text-3xl lg:text-4xl font-serif text-amber-900 section-title">${escHtml(region.nameZh)}</h2>` +
        (region.description ? `<p class="text-amber-600 mt-4 max-w-lg mx-auto">${escHtml(localizeField(region.description, lang))}</p>` : '') +
      `</div>` +
      `<div class="${gridClass}">${cardsHtml}</div>` +
    `</div>` +
  `</div>`;
}

function ssrRenderAllRegions(regions) {
  const activeRegions = regions.filter(r => r.properties && r.properties.length > 0);
  let html = '';
  activeRegions.forEach((region, idx) => {
    html += ssrRenderRegion(region, region.properties, idx % 2 === 0, 'zh-TW');
  });
  return html;
}

let ssrCache = null; // string | null — invalidated on property/region changes
let ssrCacheMtime = 0; // mtime of index.html when cache was built

function invalidateSSRCache() {
  ssrCache = null;
  ssrCacheMtime = 0;
}

// ==================== HELPERS ====================

/** Safely parse a JSON string, returning fallback (default []) on failure. */
function safeParseJSON(str, fallback = []) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch(e) { return fallback; }
}

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

function getPropertyWithImages(prop) {
  if (!prop) return null;
  prop.images = db.prepare('SELECT id, propertyId, url, isLocal, filename, sortOrder FROM property_images WHERE propertyId = ? ORDER BY sortOrder').all(prop.id);
  prop.images = prop.images.map(img => {
    if (img.isLocal && img.url) {
      try {
        const filePath = path.join(__dirname, img.url.replace(/^\//, ''));
        const mtime = Math.floor(fs.statSync(filePath).mtimeMs / 1000);
        img.url = img.url + '?' + mtime;
      } catch (e) {}
    }
    return img;
  });
  prop.quickInfo  = safeParseJSON(prop.quickInfo);
  prop.amenities  = safeParseJSON(prop.amenities);
  prop.spaceIntro = safeParseJSON(prop.spaceIntro);
  return prop;
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function stripHtmlForMeta(str) {
  if (!str) return '';
  return str.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// ==================== SSR: ROOM PAGES ====================
const roomTemplate = fs.readFileSync(path.join(__dirname, 'room-template.html'), 'utf-8');

app.get('/rooms/:id.html', (req, res) => {
  const propertyId = req.params.id;
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);

  if (!prop) {
    res.status(404).send(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>找不到此房源 | 大阪旅行日民宿</title>
  <meta name="robots" content="noindex">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&family=Noto+Serif+TC:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="font-family:'Noto Sans TC',sans-serif;background:#FFFBF7;color:#2D1810;">
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
    <div>
      <p style="font-size:5rem;margin-bottom:1rem;">🏠</p>
      <h1 style="font-family:'Noto Serif TC',serif;font-size:2rem;color:#8B4513;margin-bottom:0.5rem;">找不到此房源</h1>
      <p style="color:#6B5344;margin-bottom:2rem;">您要找的頁面不存在，可能已移除或網址有誤。</p>
      <a href="/" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#8B4513,#A0522D);color:white;border-radius:12px;text-decoration:none;font-weight:600;">返回首頁瀏覽房源</a>
    </div>
  </div>
</body>
</html>`);
    return;
  }

  const p = getPropertyWithImages(prop);
  const coverImage = (p.images && p.images.length > 0) ? p.images[0].url : '';
  const fullCoverUrl = coverImage.startsWith('http') ? coverImage : `${SITE_URL}/${coverImage}`;
  const pageUrl = `${SITE_URL}/rooms/${propertyId}.html`;

  // Build meta description (always zh-TW for SEO)
  const _nameZh = localizeField(p.name, 'zh-TW');
  const _transportInfoZh = localizeField(p.transportInfo, 'zh-TW');
  const _introductionZh = localizeField(p.introduction, 'zh-TW');
  const descParts = [];
  if (_nameZh) descParts.push(_nameZh);
  if (p.regionZh) descParts.push(`位於大阪${p.regionZh}`);
  if (_transportInfoZh) descParts.push(_transportInfoZh);
  if (p.capacity) descParts.push(p.capacity);
  const introSnippet = _introductionZh ? stripHtmlForMeta(_introductionZh).substring(0, 100) : '';
  if (introSnippet) descParts.push(introSnippet);
  const metaDescription = descParts.join('。').substring(0, 160);

  // Build amenities text for structured data
  const amenityList = (p.amenities || []).join(', ');

  // JSON-LD structured data (always zh-TW for SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": _nameZh,
    "description": metaDescription,
    "url": pageUrl,
    "image": fullCoverUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": localizeField(p.address, 'zh-TW') || '',
      "addressLocality": "大阪市",
      "addressRegion": "大阪府",
      "addressCountry": "JP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "addressCountry": "JP"
    },
    "checkinTime": p.checkIn || "15:00",
    "checkoutTime": p.checkOut || "10:00",
    "amenityFeature": (p.amenities || []).map(a => ({
      "@type": "LocationFeatureSpecification",
      "name": a,
      "value": true
    })),
    "potentialAction": p.airbnbUrl ? {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": p.airbnbUrl
      },
      "result": {
        "@type": "LodgingReservation",
        "name": `預訂 ${_nameZh}`
      }
    } : undefined
  };

  // BreadcrumbList
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "首頁", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": p.regionZh || "房源", "item": `${SITE_URL}/#properties` },
      { "@type": "ListItem", "position": 3, "name": _nameZh, "item": pageUrl }
    ]
  };

  // Build SSR content (visible to crawlers even without JS; always zh-TW)
  const _addressZh = localizeField(p.address, 'zh-TW');
  const ssrContent = `
    <noscript>
      <article class="container mx-auto px-4 py-20 max-w-4xl">
        <h1 class="text-3xl font-bold text-amber-900 mb-4">${escHtml(_nameZh)}</h1>
        ${p.regionZh ? `<p class="text-amber-600 mb-2">地區：${escHtml(p.regionZh)}</p>` : ''}
        ${_transportInfoZh ? `<p class="text-amber-700 mb-4">${escHtml(_transportInfoZh)}</p>` : ''}
        ${p.capacity ? `<p class="mb-2">容納人數：${escHtml(p.capacity)}</p>` : ''}
        ${_addressZh ? `<p class="mb-2">地址：${escHtml(_addressZh)}</p>` : ''}
        ${coverImage ? `<img src="${escHtml(coverImage)}" alt="${escHtml(_nameZh)} - 大阪民宿" style="max-width:100%;height:auto;">` : ''}
        ${_introductionZh ? `<div class="mt-6"><h2 class="text-xl font-bold mb-2">房源介紹</h2><p>${escHtml(_introductionZh)}</p></div>` : ''}
        ${amenityList ? `<div class="mt-4"><h2 class="text-xl font-bold mb-2">設備服務</h2><p>${escHtml(amenityList)}</p></div>` : ''}
        ${p.airbnbUrl ? `<div class="mt-6"><a href="${escHtml(p.airbnbUrl)}" rel="noopener" class="btn-primary">立即預訂</a></div>` : ''}
      </article>
    </noscript>`;

  // Inject into template
  const seoHead = `
  <title>${escHtml(_nameZh)} | 大阪旅行日民宿 OSAKA TRAVELDAYS</title>
  <meta name="description" content="${escHtml(metaDescription)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escHtml(_nameZh)} | 大阪旅行日民宿">
  <meta property="og:description" content="${escHtml(metaDescription)}">
  <meta property="og:image" content="${escHtml(fullCoverUrl)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="大阪旅行日民宿 OSAKA TRAVELDAYS">
  <meta property="og:locale" content="zh_TW">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(_nameZh)} | 大阪旅行日民宿">
  <meta name="twitter:description" content="${escHtml(metaDescription)}">
  <meta name="twitter:image" content="${escHtml(fullCoverUrl)}">

  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>')}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd).replace(/<\/script>/gi, '<\\/script>')}</script>`;

  // Replace in template
  let html = roomTemplate;
  // Replace the title tag
  html = html.replace(/<title>[^<]*<\/title>/, seoHead);
  // Inject SSR content after the loading div
  html = html.replace('</main>', ssrContent + '\n  </main>');
  // Inject mobile booking bar (SSR — no JS dependency)
  if (p.airbnbUrl) {
    const trackUrl = p.airbnbUrl + (p.airbnbUrl.includes('?') ? '&' : '?') + 'utm_source=osaka-traveldays&utm_medium=website&utm_campaign=room-page';
    const mobileBarHtml = `<div id="mobileBookingBar" class="mobile-booking-bar">` +
      `<a href="${escHtml(trackUrl)}" target="_blank" rel="noopener" class="airbnb-cta" ` +
      `style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;` +
      `background:linear-gradient(135deg,#8B4513,#A0522D);color:white;border-radius:8px;` +
      `padding:14px 24px;font-weight:600;text-decoration:none;">` +
      `<span id="mobileBookingBarText">立即預訂</span>` +
      `<svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">` +
      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>` +
      `</svg></a></div>`;
    html = html.replace('<!-- MOBILE_BOOKING_BAR_PLACEHOLDER -->', mobileBarHtml);
  } else {
    html = html.replace('<!-- MOBILE_BOOKING_BAR_PLACEHOLDER -->', '');
  }
  // Inject full multilingual property data for client-side language switching
  const propDataScript = `<script>window.__PROPERTY_DATA = ${JSON.stringify(p).replace(/<\/script>/gi, '<\\/script>')};</script>`;
  html = html.replace('</body>', propDataScript + '\n</body>');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Accel-Expires', '0');
  res.send(html);
});

// ==================== SEO: SITEMAP & ROBOTS ====================
// (Must be BEFORE static middleware so Express doesn't 404 on these)

app.get('/robots.txt', (req, res) => {
  const siteUrl = SITE_URL;
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  const siteUrl = SITE_URL;
  const properties = db.prepare('SELECT id, updatedAt FROM properties ORDER BY updatedAt DESC').all();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Property pages
  for (const p of properties) {
    const lastmod = p.updatedAt ? p.updatedAt.split(' ')[0] : new Date().toISOString().split('T')[0];
    xml += `  <url>\n    <loc>${siteUrl}/rooms/${encodeURIComponent(p.id)}.html</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += '</urlset>';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// ==================== HOMEPAGE SSR ====================

app.get('/', (req, res) => {
  try {
    // Invalidate cache if index.html has been modified since last build
    const indexPath = path.join(__dirname, 'index.html');
    const currentMtime = fs.statSync(indexPath).mtimeMs;
    if (ssrCache && currentMtime !== ssrCacheMtime) {
      ssrCache = null;
    }

    if (!ssrCache) {
      const regions = getRegionsWithProperties();

      const propertiesHtml = ssrRenderAllRegions(regions);
      const totalProps = regions.reduce((n, r) => n + (r.properties ? r.properties.length : 0), 0);
      const activeRegionCount = regions.filter(r => r.properties && r.properties.length > 0).length;

      const regionsSummary = regions
        .filter(r => r.properties && r.properties.length > 0)
        .map(r => ({ id: r.id, nameZh: r.nameZh, nameEn: r.nameEn }));

      let pageHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

      pageHtml = pageHtml.replace(
        '<!-- SSR_PROPERTIES_PLACEHOLDER -->',
        propertiesHtml
      );

      pageHtml = pageHtml.replace(
        /(<p id="statProperties"[^>]*>)\d+(<\/p>)/,
        `$1${totalProps}$2`
      );
      pageHtml = pageHtml.replace(
        /(<p id="statRegions"[^>]*>)\d+(<\/p>)/,
        `$1${activeRegionCount}$2`
      );

      const hydrationScript = `<script>window.__SSR_REGIONS=${JSON.stringify(regionsSummary)};<\/script>`;
      pageHtml = pageHtml.replace('</body>', hydrationScript + '\n</body>');

      ssrCache = pageHtml;
      ssrCacheMtime = currentMtime;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(ssrCache);
  } catch (err) {
    console.error('SSR error:', err.message);
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// ==================== STATIC FILES ====================

// Cache headers for static assets
app.use('/images', express.static(path.join(__dirname, 'images'), {
  maxAge: '7d',
  immutable: true
}));

app.use(express.static(__dirname, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// ==================== API ROUTES ====================

// ---- LOGIN ----
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: '密碼錯誤' });
  }
});

// ---- REGIONS ----

// List all regions with nested properties
app.get('/api/regions', (req, res) => {
  res.json(getRegionsWithProperties());
});

// Create or update region
app.post('/api/regions', requireAuth, (req, res) => {
  const { id, nameZh, nameEn, description } = req.body;
  if (!nameZh) return res.status(400).json({ error: 'nameZh is required' });

  if (id) {
    db.prepare('UPDATE regions SET nameZh=?, nameEn=?, description=? WHERE id=?').run(nameZh, nameEn || '', description || '', id);
    const updated = db.prepare('SELECT * FROM regions WHERE id = ?').get(id);
    invalidateSSRCache();
    return res.json(updated);
  } else {
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sortOrder), -1) as m FROM regions').get().m;
    const info = db.prepare('INSERT INTO regions (nameZh, nameEn, description, sortOrder) VALUES (?,?,?,?)').run(nameZh, nameEn || '', description || '', maxOrder + 1);
    const created = db.prepare('SELECT * FROM regions WHERE id = ?').get(info.lastInsertRowid);
    invalidateSSRCache();
    return res.json(created);
  }
});

// Move region up or down
app.put('/api/regions/:id/move', requireAuth, (req, res) => {
  const { direction } = req.body;
  if (!['up', 'down'].includes(direction)) return res.status(400).json({ error: 'direction must be "up" or "down"' });
  const regionId = parseInt(req.params.id);
  const allRegions = db.prepare('SELECT id, sortOrder FROM regions ORDER BY sortOrder ASC').all();
  const idx = allRegions.findIndex(r => r.id === regionId);
  if (idx === -1) return res.status(404).json({ error: 'Region not found' });

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= allRegions.length) return res.json({ success: true }); // no-op

  const swapRegion = allRegions[swapIdx];
  const currentRegion = allRegions[idx];

  db.transaction(() => {
    db.prepare('UPDATE regions SET sortOrder = ? WHERE id = ?').run(swapRegion.sortOrder, currentRegion.id);
    db.prepare('UPDATE regions SET sortOrder = ? WHERE id = ?').run(currentRegion.sortOrder, swapRegion.id);
  })();

  invalidateSSRCache();
  res.json({ success: true });
});

// Delete region
app.delete('/api/regions/:id', requireAuth, (req, res) => {
  const regionId = parseInt(req.params.id);
  const count = db.prepare('SELECT COUNT(*) as c FROM properties WHERE regionId = ?').get(regionId).c;
  if (count > 0) return res.status(400).json({ error: `此區域還有 ${count} 個房源，請先移除房源再刪除區域` });

  db.prepare('DELETE FROM regions WHERE id = ?').run(regionId);
  invalidateSSRCache();
  res.json({ success: true });
});

// ---- PROPERTIES ----

// List all properties
app.get('/api/properties', (req, res) => {
  const props = db.prepare('SELECT * FROM properties ORDER BY updatedAt DESC').all();
  if (props.length > 0) {
    const ids = props.map(p => p.id);
    const placeholders = ids.map(() => '?').join(',');
    const allImages = db.prepare(
      `SELECT id, propertyId, url, isLocal, filename, sortOrder FROM property_images WHERE propertyId IN (${placeholders}) ORDER BY sortOrder`
    ).all(...ids);
    const imagesByPropId = {};
    for (const img of allImages) {
      if (!imagesByPropId[img.propertyId]) imagesByPropId[img.propertyId] = [];
      if (img.isLocal && img.url) {
        try {
          const filePath = path.join(__dirname, img.url.replace(/^\//, ''));
          const mtime = Math.floor(fs.statSync(filePath).mtimeMs / 1000);
          img.url = img.url + '?' + mtime;
        } catch (e) {}
      }
      imagesByPropId[img.propertyId].push(img);
    }
    for (const p of props) {
      p.images     = imagesByPropId[p.id] || [];
      p.quickInfo  = safeParseJSON(p.quickInfo);
      p.amenities  = safeParseJSON(p.amenities);
      p.spaceIntro = safeParseJSON(p.spaceIntro);
    }
  }
  res.json(props);
});

// Get single property
app.get('/api/properties/:id', (req, res) => {
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!prop) return res.status(404).json({ error: 'Not found' });
  res.json(getPropertyWithImages(prop));
});

// Get availability (blocked dates) from Airbnb iCal
const ICAL_TTL_MS = 30000; // 30 seconds
app.get('/api/properties/:id/availability', async (req, res) => {
  try {
    const prop = db.prepare('SELECT ical_url FROM properties WHERE id = ?').get(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Not found' });
    if (!prop.ical_url) return res.json({ blockedDates: [] });

    const cached = db.prepare('SELECT blocked_dates, fetched_at FROM ical_cache WHERE property_id = ?').get(req.params.id);
    if (cached && Date.now() - cached.fetched_at < ICAL_TTL_MS) {
      return res.json({ blockedDates: JSON.parse(cached.blocked_dates) });
    }

    const response = await fetch(prop.ical_url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('iCal fetch failed: ' + response.status);
    const text = await response.text();
    const blockedDates = parseIcal(text);
    db.prepare('INSERT OR REPLACE INTO ical_cache (property_id, blocked_dates, fetched_at) VALUES (?,?,?)').run(req.params.id, JSON.stringify(blockedDates), Date.now());
    res.json({ blockedDates });
  } catch (err) {
    console.error('iCal fetch error:', err.message);
    try {
      const stale = db.prepare('SELECT blocked_dates FROM ical_cache WHERE property_id = ?').get(req.params.id);
      if (stale) return res.json({ blockedDates: JSON.parse(stale.blocked_dates) });
    } catch (_) {}
    res.status(502).json({ error: 'iCal fetch failed', blockedDates: [] });
  }
});

// Normalize Google Maps URL to embed format
async function normalizeMapUrl(url) {
  if (!url) return '';
  if (url.includes('/maps/embed')) return url;

  let resolvedUrl = url;
  // Short link → follow redirect to get real URL
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    try {
      const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
      const location = r.headers.get('location');
      if (location) resolvedUrl = location;
    } catch (_) {}
  }

  // Extract @lat,lng from URL
  const m = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) {
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${m[2]}!3d${m[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1szh-TW!2sjp`;
  }

  return url;
}

// Create or update property
app.post('/api/properties', requireAuth, async (req, res) => {
  const p = req.body;
  const ml = (v) => v && typeof v === 'object' && !Array.isArray(v) ? JSON.stringify(v) : (v || '');
  if (!p.id || !p.name) return res.status(400).json({ error: 'ID and name are required' });

  // Validate regionId before touching the DB
  let regionZh = '', regionEn = '', regionDesc = '';
  if (p.regionId) {
    const region = db.prepare('SELECT nameZh, nameEn, description FROM regions WHERE id = ?').get(p.regionId);
    if (!region) return res.status(400).json({ error: '指定的區域不存在' });
    regionZh = region.nameZh; regionEn = region.nameEn; regionDesc = region.description;
  }

  const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(p.id);

  const mapEmbedUrl = await normalizeMapUrl(p.mapEmbedUrl);

  const transaction = db.transaction(() => {
    if (existing) {
      db.prepare(`UPDATE properties SET
        name=?, type=?, regionId=?, regionZh=?, regionEn=?, regionDesc=?, badge=?, secondaryBadge=?,
        shortDesc=?, address=?, transportInfo=?, introduction=?, videoUrl=?, mapEmbedUrl=?,
        airbnbUrl=?, capacity=?, size=?, checkIn=?, checkOut=?, transportDetail=?,
        quickInfo=?, amenities=?, spaceIntro=?, nearestStation=?, nearbyAttractions=?, parkingInfo=?, ical_url=?,
        updatedAt=datetime('now','localtime')
        WHERE id=?`).run(
        ml(p.name), p.type || '包棟民宿', p.regionId || null, regionZh, regionEn, regionDesc,
        ml(p.badge), ml(p.secondaryBadge), ml(p.shortDesc), ml(p.address),
        ml(p.transportInfo), ml(p.introduction), p.videoUrl || '', mapEmbedUrl,
        p.airbnbUrl || '', p.capacity || '', p.size || '', p.checkIn || '下午3點以後',
        p.checkOut || '上午10點之前', ml(p.transportDetail),
        JSON.stringify(p.quickInfo || []), JSON.stringify(p.amenities || []),
        JSON.stringify(p.spaceIntro || []), ml(p.nearestStation), ml(p.nearbyAttractions), ml(p.parkingInfo), p.icalUrl || '', p.id
      );
      // Clear iCal cache so next availability request re-fetches
      icalCache.delete(p.id);
    } else {
      db.prepare(`INSERT INTO properties (id, name, type, regionId, regionZh, regionEn, regionDesc, badge,
        secondaryBadge, shortDesc, address, transportInfo, introduction, videoUrl, mapEmbedUrl,
        airbnbUrl, capacity, size, checkIn, checkOut, transportDetail, quickInfo,
        amenities, spaceIntro, nearestStation, nearbyAttractions, parkingInfo, ical_url)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        p.id, ml(p.name), p.type || '包棟民宿', p.regionId || null, regionZh, regionEn, regionDesc,
        ml(p.badge), ml(p.secondaryBadge), ml(p.shortDesc), ml(p.address),
        ml(p.transportInfo), ml(p.introduction), p.videoUrl || '', mapEmbedUrl,
        p.airbnbUrl || '', p.capacity || '', p.size || '', p.checkIn || '下午3點以後',
        p.checkOut || '上午10點之前', ml(p.transportDetail), JSON.stringify(p.quickInfo || []),
        JSON.stringify(p.amenities || []), JSON.stringify(p.spaceIntro || []),
        ml(p.nearestStation), ml(p.nearbyAttractions), ml(p.parkingInfo), p.icalUrl || ''
      );
    }

    // Sync images
    db.prepare('DELETE FROM property_images WHERE propertyId = ?').run(p.id);
    const insertImg = db.prepare('INSERT INTO property_images (propertyId, url, isLocal, filename, sortOrder) VALUES (?,?,?,?,?)');
    (p.images || []).forEach((img, i) => {
      insertImg.run(p.id, img.url, img.isLocal ? 1 : 0, img.filename || '', i);
    });
  });

  transaction();
  const saved = db.prepare('SELECT * FROM properties WHERE id = ?').get(p.id);
  invalidateSSRCache();
  res.json(getPropertyWithImages(saved));
});

// Rename property ID (for when user changes slug)
app.put('/api/properties/:oldId/rename', requireAuth, (req, res) => {
  const { oldId } = req.params;
  const { newId } = req.body;
  if (!newId || !/^[a-zA-Z0-9_-]{1,50}$/.test(newId)) return res.status(400).json({ error: 'newId must be 1–50 alphanumeric/dash/underscore characters' });

  const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(newId);
  if (existing && oldId !== newId) return res.status(409).json({ error: 'ID already exists' });

  const transaction = db.transaction(() => {
    db.prepare('UPDATE property_images SET propertyId = ? WHERE propertyId = ?').run(newId, oldId);
    db.prepare('UPDATE properties SET id = ? WHERE id = ?').run(newId, oldId);
    db.prepare('UPDATE ical_cache SET property_id = ? WHERE property_id = ?').run(newId, oldId);
  });

  transaction();
  invalidateSSRCache();
  res.json({ success: true });
});

// Delete property
app.delete('/api/properties/:id', requireAuth, (req, res) => {
  const images = db.prepare('SELECT url FROM property_images WHERE propertyId = ? AND isLocal = 1').all(req.params.id);
  images.forEach(img => {
    const filePath = path.join(__dirname, img.url);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  });

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM property_images WHERE propertyId = ?').run(req.params.id);
    db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
    icalCache.delete(req.params.id);
  });

  transaction();
  invalidateSSRCache();
  res.json({ success: true });
});

// Upload images
app.post('/api/upload', requireAuth, upload.array('images', 20), (req, res) => {
  const files = req.files.map(f => ({
    url: 'images/uploads/' + f.filename,
    isLocal: 1,
    filename: f.originalname
  }));
  res.json(files);
});

// Delete uploaded image file
app.delete('/api/upload/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename); // strip any directory components
  const filePath = path.join(uploadDir, filename);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(uploadDir) + path.sep)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
  }
  res.json({ success: true });
});

// Export all data as JSON
app.get('/api/export', requireAuth, (req, res) => {
  const props = db.prepare('SELECT * FROM properties ORDER BY updatedAt DESC').all();
  props.forEach(p => {
    p.images = db.prepare('SELECT url, isLocal, filename, sortOrder FROM property_images WHERE propertyId = ? ORDER BY sortOrder').all(p.id);
    p.quickInfo  = safeParseJSON(p.quickInfo);
    p.amenities  = safeParseJSON(p.amenities);
    p.spaceIntro = safeParseJSON(p.spaceIntro);
  });
  res.setHeader('Content-Disposition', 'attachment; filename=osaka-properties.json');
  res.json(props);
});

// Import data from JSON
app.post('/api/import', requireAuth, (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) return res.status(400).json({ error: 'Array expected' });

  const insertProp = db.prepare(`INSERT OR REPLACE INTO properties (id, name, type, regionZh, regionEn,
    regionDesc, badge, secondaryBadge, shortDesc, address, transportInfo, introduction, videoUrl,
    mapEmbedUrl, airbnbUrl, capacity, size, checkIn, checkOut, transportDetail, quickInfo,
    amenities, spaceIntro, nearestStation, nearbyAttractions, parkingInfo, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const delImgs = db.prepare('DELETE FROM property_images WHERE propertyId = ?');
  const insertImg = db.prepare('INSERT INTO property_images (propertyId, url, isLocal, filename, sortOrder) VALUES (?,?,?,?,?)');

  const importAll = db.transaction((items) => {
    for (const p of items) {
      insertProp.run(p.id, p.name, p.type || '', p.regionZh || '', p.regionEn || '',
        p.regionDesc || '', p.badge || '', p.secondaryBadge || '', p.shortDesc || '',
        p.address || '', p.transportInfo || '', p.introduction || '', p.videoUrl || '',
        p.mapEmbedUrl || '', p.airbnbUrl || '', p.capacity || '', p.size || '',
        p.checkIn || '', p.checkOut || '', p.transportDetail || '',
        JSON.stringify(p.quickInfo || []),
        JSON.stringify(p.amenities || []), JSON.stringify(p.spaceIntro || []),
        p.nearestStation || '', p.nearbyAttractions || '', p.parkingInfo || '',
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString());

      delImgs.run(p.id);
      (p.images || []).forEach((img, i) => {
        insertImg.run(p.id, img.url, img.isLocal ? 1 : 0, img.filename || '', i);
      });
    }
  });

  importAll(data);
  invalidateSSRCache();
  icalCache.clear();
  res.json({ success: true, count: data.length });
});

// ---- SITE SETTINGS ----
const ALLOWED_SETTINGS_KEYS = new Set([
  'hero.image', 'hero.title', 'hero.subtitle', 'hero.desc', 'hero.cta',
  'faq.items', 'footer.email', 'footer.line', 'footer.company', 'footer.address'
]);

// Get all settings (public)
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  const result = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch (e) {
      result[row.key] = row.value;
    }
  }
  res.json(result);
});

// Update a setting (auth required)
app.post('/api/settings', requireAuth, (req, res) => {
  const { key, value } = req.body;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return res.status(400).json({ error: 'key must be a non-empty string' });
  }
  if (!ALLOWED_SETTINGS_KEYS.has(key.trim())) {
    return res.status(400).json({ error: 'Unknown settings key' });
  }
  if (value === undefined) {
    return res.status(400).json({ error: 'value is required' });
  }
  db.prepare(`INSERT INTO site_settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP`)
    .run(key.trim(), JSON.stringify(value));
  invalidateSSRCache();
  res.json({ success: true });
});

// ==================== START ====================
app.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   大阪旅行日民宿 - 後台管理系統     ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║   http://localhost:${PORT}/admin.html    ║`);
  console.log(`  ║   http://localhost:${PORT}/             ║`);
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║   SEO: sitemap.xml ✓ robots.txt ✓   ║');
  console.log('  ║   SSR: Room pages pre-rendered ✓     ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
