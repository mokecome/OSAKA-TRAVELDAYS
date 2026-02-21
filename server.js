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
`);

// Migrate existing DB: add new columns if missing
try { db.exec("ALTER TABLE properties ADD COLUMN amenities TEXT DEFAULT '[]'"); } catch(e) {}
try { db.exec("ALTER TABLE properties ADD COLUMN spaceIntro TEXT DEFAULT '[]'"); } catch(e) {}
try { db.exec("ALTER TABLE properties ADD COLUMN nearestStation TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE properties ADD COLUMN regionId INTEGER DEFAULT NULL"); } catch(e) {}

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

// ==================== HELPERS ====================
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
  prop.quickInfo = JSON.parse(prop.quickInfo || '[]');
  prop.amenities = JSON.parse(prop.amenities || '[]');
  prop.spaceIntro = JSON.parse(prop.spaceIntro || '[]');
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

  // Build meta description
  const descParts = [];
  if (p.name) descParts.push(p.name);
  if (p.regionZh) descParts.push(`位於大阪${p.regionZh}`);
  if (p.transportInfo) descParts.push(p.transportInfo);
  if (p.capacity) descParts.push(p.capacity);
  const introSnippet = p.introduction ? stripHtmlForMeta(p.introduction).substring(0, 100) : '';
  if (introSnippet) descParts.push(introSnippet);
  const metaDescription = descParts.join('。').substring(0, 160);

  // Build amenities text for structured data
  const amenityList = (p.amenities || []).join(', ');

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": p.name,
    "description": metaDescription,
    "url": pageUrl,
    "image": fullCoverUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": p.address || '',
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
        "name": `預訂 ${p.name}`
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
      { "@type": "ListItem", "position": 3, "name": p.name, "item": pageUrl }
    ]
  };

  // Build SSR content (visible to crawlers even without JS)
  const ssrContent = `
    <noscript>
      <article class="container mx-auto px-4 py-20 max-w-4xl">
        <h1 class="text-3xl font-bold text-amber-900 mb-4">${escHtml(p.name)}</h1>
        ${p.regionZh ? `<p class="text-amber-600 mb-2">地區：${escHtml(p.regionZh)}</p>` : ''}
        ${p.transportInfo ? `<p class="text-amber-700 mb-4">${escHtml(p.transportInfo)}</p>` : ''}
        ${p.capacity ? `<p class="mb-2">容納人數：${escHtml(p.capacity)}</p>` : ''}
        ${p.address ? `<p class="mb-2">地址：${escHtml(p.address)}</p>` : ''}
        ${coverImage ? `<img src="${escHtml(coverImage)}" alt="${escHtml(p.name)} - 大阪民宿" style="max-width:100%;height:auto;">` : ''}
        ${p.introduction ? `<div class="mt-6"><h2 class="text-xl font-bold mb-2">房源介紹</h2><p>${escHtml(p.introduction)}</p></div>` : ''}
        ${amenityList ? `<div class="mt-4"><h2 class="text-xl font-bold mb-2">設備服務</h2><p>${escHtml(amenityList)}</p></div>` : ''}
        ${p.airbnbUrl ? `<div class="mt-6"><a href="${escHtml(p.airbnbUrl)}" rel="noopener" class="btn-primary">前往 Airbnb 預訂</a></div>` : ''}
      </article>
    </noscript>`;

  // Inject into template
  const seoHead = `
  <title>${escHtml(p.name)} | 大阪旅行日民宿 OSAKA TRAVELDAYS</title>
  <meta name="description" content="${escHtml(metaDescription)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escHtml(p.name)} | 大阪旅行日民宿">
  <meta property="og:description" content="${escHtml(metaDescription)}">
  <meta property="og:image" content="${escHtml(fullCoverUrl)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="大阪旅行日民宿 OSAKA TRAVELDAYS">
  <meta property="og:locale" content="zh_TW">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(p.name)} | 大阪旅行日民宿">
  <meta name="twitter:description" content="${escHtml(metaDescription)}">
  <meta name="twitter:image" content="${escHtml(fullCoverUrl)}">

  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;

  // Replace in template
  let html = roomTemplate;
  // Replace the title tag
  html = html.replace(/<title>[^<]*<\/title>/, seoHead);
  // Inject SSR content after the loading div
  html = html.replace('</main>', ssrContent + '\n  </main>');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
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
  const regions = db.prepare('SELECT * FROM regions ORDER BY sortOrder ASC').all();
  for (const region of regions) {
    const props = db.prepare('SELECT * FROM properties WHERE regionId = ? ORDER BY createdAt ASC').all(region.id);
    props.forEach(p => { getPropertyWithImages(p); });
    region.properties = props;
  }
  res.json(regions);
});

// Create or update region
app.post('/api/regions', requireAuth, (req, res) => {
  const { id, nameZh, nameEn, description } = req.body;
  if (!nameZh) return res.status(400).json({ error: 'nameZh is required' });

  if (id) {
    db.prepare('UPDATE regions SET nameZh=?, nameEn=?, description=? WHERE id=?').run(nameZh, nameEn || '', description || '', id);
    const updated = db.prepare('SELECT * FROM regions WHERE id = ?').get(id);
    return res.json(updated);
  } else {
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sortOrder), -1) as m FROM regions').get().m;
    const info = db.prepare('INSERT INTO regions (nameZh, nameEn, description, sortOrder) VALUES (?,?,?,?)').run(nameZh, nameEn || '', description || '', maxOrder + 1);
    const created = db.prepare('SELECT * FROM regions WHERE id = ?').get(info.lastInsertRowid);
    return res.json(created);
  }
});

// Move region up or down
app.put('/api/regions/:id/move', requireAuth, (req, res) => {
  const { direction } = req.body; // 'up' or 'down'
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

  res.json({ success: true });
});

// Delete region
app.delete('/api/regions/:id', requireAuth, (req, res) => {
  const regionId = parseInt(req.params.id);
  const count = db.prepare('SELECT COUNT(*) as c FROM properties WHERE regionId = ?').get(regionId).c;
  if (count > 0) return res.status(400).json({ error: `此區域還有 ${count} 個房源，請先移除房源再刪除區域` });

  db.prepare('DELETE FROM regions WHERE id = ?').run(regionId);
  res.json({ success: true });
});

// ---- PROPERTIES ----

// List all properties
app.get('/api/properties', (req, res) => {
  const props = db.prepare('SELECT * FROM properties ORDER BY updatedAt DESC').all();
  props.forEach(p => {
    p.images = db.prepare('SELECT id, propertyId, url, isLocal, filename, sortOrder FROM property_images WHERE propertyId = ? ORDER BY sortOrder').all(p.id);
    p.quickInfo = JSON.parse(p.quickInfo || '[]');
    p.amenities = JSON.parse(p.amenities || '[]');
    p.spaceIntro = JSON.parse(p.spaceIntro || '[]');
  });
  res.json(props);
});

// Get single property
app.get('/api/properties/:id', (req, res) => {
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!prop) return res.status(404).json({ error: 'Not found' });
  res.json(getPropertyWithImages(prop));
});

// Create or update property
app.post('/api/properties', requireAuth, (req, res) => {
  const p = req.body;
  if (!p.id || !p.name) return res.status(400).json({ error: 'ID and name are required' });

  const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(p.id);

  const transaction = db.transaction(() => {
    // Get region info for backward compat fields
    let regionZh = '', regionEn = '', regionDesc = '';
    if (p.regionId) {
      const region = db.prepare('SELECT nameZh, nameEn, description FROM regions WHERE id = ?').get(p.regionId);
      if (region) { regionZh = region.nameZh; regionEn = region.nameEn; regionDesc = region.description; }
    }

    if (existing) {
      db.prepare(`UPDATE properties SET
        name=?, type=?, regionId=?, regionZh=?, regionEn=?, regionDesc=?, badge=?, secondaryBadge=?,
        shortDesc=?, address=?, transportInfo=?, introduction=?, videoUrl=?, mapEmbedUrl=?,
        airbnbUrl=?, capacity=?, size=?, checkIn=?, checkOut=?, transportDetail=?,
        quickInfo=?, amenities=?, spaceIntro=?, nearestStation=?, updatedAt=datetime('now','localtime')
        WHERE id=?`).run(
        p.name, p.type || '包棟民宿', p.regionId || null, regionZh, regionEn, regionDesc,
        p.badge || '', p.secondaryBadge || '', p.shortDesc || '', p.address || '',
        p.transportInfo || '', p.introduction || '', p.videoUrl || '', p.mapEmbedUrl || '',
        p.airbnbUrl || '', p.capacity || '', p.size || '', p.checkIn || '下午3點以後',
        p.checkOut || '上午10點之前', p.transportDetail || '',
        JSON.stringify(p.quickInfo || []), JSON.stringify(p.amenities || []),
        JSON.stringify(p.spaceIntro || []), p.nearestStation || '', p.id
      );
    } else {
      db.prepare(`INSERT INTO properties (id, name, type, regionId, regionZh, regionEn, regionDesc, badge,
        secondaryBadge, shortDesc, address, transportInfo, introduction, videoUrl, mapEmbedUrl,
        airbnbUrl, capacity, size, checkIn, checkOut, transportDetail, quickInfo,
        amenities, spaceIntro, nearestStation)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        p.id, p.name, p.type || '包棟民宿', p.regionId || null, regionZh, regionEn, regionDesc,
        p.badge || '', p.secondaryBadge || '', p.shortDesc || '', p.address || '',
        p.transportInfo || '', p.introduction || '', p.videoUrl || '', p.mapEmbedUrl || '',
        p.airbnbUrl || '', p.capacity || '', p.size || '', p.checkIn || '下午3點以後',
        p.checkOut || '上午10點之前', p.transportDetail || '', JSON.stringify(p.quickInfo || []),
        JSON.stringify(p.amenities || []), JSON.stringify(p.spaceIntro || []), p.nearestStation || ''
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
  res.json(getPropertyWithImages(saved));
});

// Rename property ID (for when user changes slug)
app.put('/api/properties/:oldId/rename', requireAuth, (req, res) => {
  const { oldId } = req.params;
  const { newId } = req.body;
  if (!newId) return res.status(400).json({ error: 'newId required' });

  const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(newId);
  if (existing && oldId !== newId) return res.status(409).json({ error: 'ID already exists' });

  const transaction = db.transaction(() => {
    db.prepare('UPDATE property_images SET propertyId = ? WHERE propertyId = ?').run(newId, oldId);
    db.prepare('UPDATE properties SET id = ? WHERE id = ?').run(newId, oldId);
  });

  transaction();
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
  });

  transaction();
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
  const filePath = path.join(uploadDir, req.params.filename);
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
    p.quickInfo = JSON.parse(p.quickInfo || '[]');
    p.amenities = JSON.parse(p.amenities || '[]');
    p.spaceIntro = JSON.parse(p.spaceIntro || '[]');
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
    amenities, spaceIntro, nearestStation, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

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
        p.nearestStation || '',
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString());

      delImgs.run(p.id);
      (p.images || []).forEach((img, i) => {
        insertImg.run(p.id, img.url, img.isLocal ? 1 : 0, img.filename || '', i);
      });
    }
  });

  importAll(data);
  res.json({ success: true, count: data.length });
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
