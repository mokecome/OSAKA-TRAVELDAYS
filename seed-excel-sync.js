const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(__dirname, 'osaka-minshuku.db'));

// Load scraped results
const allResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'scrape-results', 'all-results.json'), 'utf8'));

// Excel data: room → { address (with postal code), password, googleMapsUrl }
const excelData = {
  '京都': { address: '〒600-8892 京都府京都市下京区西七条西八反田町63', mapsUrl: 'https://maps.app.goo.gl/jP2CcsARMGEds6Qk8', password: '1823' },
  '405': { address: '〒542-0086 大阪市中央区西心斎橋2-7-22道頓堀ハイツ405号室', mapsUrl: 'https://goo.gl/maps/Gig2xWzhYHNYmpso8', password: '' },
  '406': { address: '〒542-0086 大阪市中央区西心斎橋2-7-22道頓堀ハイツ406号', mapsUrl: 'https://goo.gl/maps/Gig2xWzhYHNYmpso8', password: '' },
  '806': { address: '〒542-0073 大阪市中央区日本橋1-4-12クリスタルエグゼ日本橋806', mapsUrl: 'https://goo.gl/maps/XthbCinxQcniQ92d7', password: '1823' },
  '904': { address: '〒542-0073 大阪市中央区日本橋1-4-12クリスタルエグゼ日本橋904', mapsUrl: 'https://goo.gl/maps/XthbCinxQcniQ92d7', password: '717' },
  '1305': { address: '〒542-0073 大阪市中央区日本橋1-4-12クリスタルエグゼ日本橋1305号室', mapsUrl: 'https://goo.gl/maps/XthbCinxQcniQ92d7', password: '1823' },
  '西九条': { address: '〒554-0012 大阪府大阪市此花区西九条1-10-12', mapsUrl: 'https://goo.gl/maps/5XFjn5v8Y8HQRGeHA', password: '1024' },
  'DAIDODO': { address: '〒542-0062 大阪市中央区上本町西3-3-2', mapsUrl: 'https://maps.app.goo.gl/hywsLtzpVyFLBYhk7', password: '3' },
  '谷六': { address: '〒542-0012 大阪市中央区谷町六丁目-3-11', mapsUrl: 'https://maps.app.goo.gl/1pQVm9vzTAn7sVCU7', password: '283' },
  '住之江': { address: '〒559-0004 大阪市住之江区住之江3-8-8', mapsUrl: 'https://maps.app.goo.gl/DTdDmosk8a3aMrJy9', password: '283' },
  '鷺洲2樓': { address: '〒553-0002 大阪市福島区鷺洲1-12-35二階', mapsUrl: 'https://maps.app.goo.gl/X8RYVMc7H2WGZL4A7', password: '717' },
  '鷺洲3樓': { address: '〒553-0002 大阪市福島区鷺洲1-12-35 三階', mapsUrl: 'https://maps.app.goo.gl/X8RYVMc7H2WGZL4A7', password: '283' },
  '波除': { address: '〒552-0001 大阪市港区波除5-1-6', mapsUrl: 'https://maps.app.goo.gl/Mq1qg9hf4EDKNEEF8', password: '717' },
  '三先': { address: '〒552-0016 大阪市港区三先2-16-17', mapsUrl: 'https://maps.app.goo.gl/raKZfno4ev3JSaL76', password: '717' },
  '角屋': { address: '〒551-0001 大阪市大正区三軒家西2-1-6', mapsUrl: 'https://maps.app.goo.gl/qvJHZBrvREard2iK7', password: '717' },
  '大正': { address: '〒551-0001 大阪市大正区三軒家西', mapsUrl: 'https://maps.app.goo.gl/SZo9pdH54ZEMRZgz6', password: '' },
  '艾屋': { address: '〒551-0001 大阪市大正区三軒家西1-12-19', mapsUrl: 'https://maps.app.goo.gl/J4wNRq4zjnky35Yc6', password: '3' },
  '都島': { address: '〒534-0021 大阪市都島区都島本通3-12-23', mapsUrl: 'https://maps.app.goo.gl/PunkvMWwruhwtKACA', password: '3' },
  '天蓬-2F天和': { address: '〒542-0083 大阪府大阪市中央区東心斎橋1-14-24', mapsUrl: 'https://maps.app.goo.gl/DbdX5pMzwLgHREzCA', password: '0283' },
  '天蓬-2F天洋': { address: '〒542-0083 大阪府大阪市中央区東心斎橋1-14-24', mapsUrl: 'https://maps.app.goo.gl/DbdX5pMzwLgHREzCA', password: '0421' },
  '天蓬-3F蓬和': { address: '〒542-0083 大阪府大阪市中央区東心斎橋1-14-24', mapsUrl: 'https://maps.app.goo.gl/DbdX5pMzwLgHREzCA', password: '0717' },
  '天蓬-3F蓬洋': { address: '〒542-0083 大阪府大阪市中央区東心斎橋1-14-24', mapsUrl: 'https://maps.app.goo.gl/DbdX5pMzwLgHREzCA', password: '1117' },
  '天蓬-4F最上': { address: '〒542-0083 大阪府大阪市中央区東心斎橋1-14-24', mapsUrl: 'https://maps.app.goo.gl/DbdX5pMzwLgHREzCA', password: '1024' },
};

// Mapping from Excel room name to DB slug
const existingMap = {
  '艾屋': 'yomogi',
  '角屋': 'juichimei',
  '大正': 'bunkaen',
  '405': 'nk-homes-namba',
  '406': 'shinsaibashi-family',
  '谷六': 'nomad-inn',
  '住之江': 'geisha',
  '西九条': 'sakuragawa-nishikujo',
  '鷺洲2樓': 'taixiang-2f',
  '鷺洲3樓': 'taixiang-3f',
};

// New properties need slugs and region assignments
const newPropertyConfig = {
  '京都': { slug: 'kyoto-garden', regionZh: '京都', regionEn: 'Kyoto' },
  '806': { slug: 'osaka-nest-806', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  '904': { slug: 'aipei-family-904', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  '1305': { slug: 'crystal-riviera-1305', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  'DAIDODO': { slug: 'daidodo', regionZh: '谷町 / 上本町', regionEn: 'Tanimachi / Uehommachi' },
  '波除': { slug: 'house-daifuku', regionZh: '港区 / 弁天町', regionEn: 'Minato / Bentencho' },
  '三先': { slug: 'misaki-house', regionZh: '港区 / 弁天町', regionEn: 'Minato / Bentencho' },
  '都島': { slug: 'hikari-miyakojima', regionZh: '都島区', regionEn: 'Miyakojima' },
  '天蓬-2F天和': { slug: 'tenpou-2f-tenwa', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  '天蓬-2F天洋': { slug: 'tenpou-2f-tenyo', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  '天蓬-3F蓬和': { slug: 'tenpou-3f-houwa', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  '天蓬-3F蓬洋': { slug: 'tenpou-3f-houyo', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
  '天蓬-4F最上': { slug: 'tenpou-4f-saijo', regionZh: '心齋橋 / 日本橋 / 難波', regionEn: 'Shinsaibashi / Nipponbashi / Namba' },
};

// ===== Amenity cleaning =====
const categoryHeaders = new Set([
  '衛浴', '臥室和洗衣', '暖氣和冷氣', '居家安全', '網路和辦公',
  '廚房和餐飲', '美景', '停車和設施', '服務', '娛樂', '戶外',
  '未提供', '家庭', '位置特色',
]);

function cleanAmenities(rawList) {
  const cleaned = [];
  const seen = new Set();
  for (const item of rawList) {
    let text = item.trim();
    // Skip empty
    if (!text) continue;
    // Skip category headers
    if (categoryHeaders.has(text)) continue;
    // Skip concatenated strings (category + items joined, > 15 chars with no spaces)
    if (text.length > 15 && !text.includes(' ') && !text.includes('・')) continue;
    // Skip "未提供" items
    if (text.startsWith('未提供')) continue;
    // Skip description texts
    if (text.includes('客人可自行') || text.includes('碗、筷') || text.includes('（')) continue;
    // Skip "Other" prefix
    text = text.replace(/^「Other」/, '');
    // Normalize common names
    text = text.replace('有電視，並可觀賞一般第四台', '電視');
    text = text.replace('建物內有洗衣機', '洗衣機');
    text = text.replace('建物內有烘衣機', '烘衣機');
    // Skip if too long (likely concatenated)
    if (text.length > 12) continue;
    // Skip duplicates
    if (seen.has(text)) continue;
    seen.add(text);
    cleaned.push(text);
  }
  return cleaned;
}

// ===== Build capacity string: "rating (N 則評價)・N 人" =====
function buildCapacity(result) {
  const parts = [];
  if (result.rating && result.rating !== '1') {
    const reviewStr = result.reviews ? `${result.reviews} 則評價` : '';
    parts.push(reviewStr ? `${result.rating} (${reviewStr})` : result.rating);
  }
  if (result.guests && result.guests !== '1') {
    parts.push(`${result.guests} 人`);
  }
  return parts.join('・');
}

// ===== Build size string from Airbnb data =====
function buildSize(result) {
  // Try to extract from title: look for ㎡, DK, LDK patterns
  const title = result.title || '';
  const sqmMatch = title.match(/([\d.]+)\s*㎡/);
  const typeMatch = title.match(/(\d+[LDK]+)/);
  const parts = [];
  if (sqmMatch) parts.push(sqmMatch[1] + '㎡');
  if (typeMatch) parts.push(typeMatch[1]);
  if (result.bedrooms && parseInt(result.bedrooms) > 0) {
    if (!typeMatch) parts.push(result.bedrooms + ' 間臥室');
  }
  if (result.bathrooms) parts.push(result.bathrooms + ' 間衛浴');
  return parts.join('・');
}

// ===== Clean description =====
function cleanDescription(desc) {
  if (!desc) return '';
  // Remove excessive formatting
  let clean = desc
    .replace(/顯示更多內容|顯示較少內容/g, '')
    .replace(/登記詳情.*$/s, '')
    .replace(/房源空間.*?其他注意事項/s, '\n')
    .trim();
  // Take first 300 chars for introduction
  if (clean.length > 300) {
    clean = clean.substring(0, 300).replace(/[，。！？\s]+$/, '') + '...';
  }
  return clean;
}

// ===== Ensure region exists, return regionId =====
function ensureRegion(zhName, enName) {
  const existing = db.prepare('SELECT id FROM regions WHERE nameZh = ?').get(zhName);
  if (existing) return existing.id;
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sortOrder), -1) as m FROM regions').get().m;
  const info = db.prepare('INSERT INTO regions (nameZh, nameEn, description, sortOrder) VALUES (?,?,?,?)').run(zhName, enName, '', maxOrder + 1);
  console.log(`  Created region: ${zhName} (${enName})`);
  return info.lastInsertRowid;
}

// ===== MAIN =====
console.log('=== Excel Sync: Processing all 23 listings ===\n');

let updatedCount = 0;
let insertedCount = 0;

for (const result of allResults) {
  const room = result.room;
  const excel = excelData[room];
  if (!excel) { console.log(`SKIP: ${room} - no Excel data`); continue; }

  const isExisting = room in existingMap;
  const slug = isExisting ? existingMap[room] : (newPropertyConfig[room]?.slug || room.toLowerCase());
  const config = newPropertyConfig[room];

  // Clean data
  const amenities = cleanAmenities(result.amenities);
  const capacity = buildCapacity(result);
  const size = buildSize(result);
  const description = cleanDescription(result.description);
  const address = excel.address;

  console.log(`[${room}] slug=${slug}, existing=${isExisting}`);
  console.log(`  Title: ${result.title}`);
  console.log(`  Capacity: ${capacity}`);
  console.log(`  Size: ${size}`);
  console.log(`  Amenities (${amenities.length}): ${amenities.slice(0, 6).join(', ')}...`);
  console.log(`  Photos: ${result.localPhotos.length}`);

  if (isExisting) {
    // ===== UPDATE existing property =====
    const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(slug);
    if (!prop) { console.log(`  ERROR: property ${slug} not found in DB`); continue; }

    const updates = {};

    // Update address if Excel has a more complete one (with postal code)
    if (address && address.includes('〒') && (!prop.address || !prop.address.includes('〒'))) {
      updates.address = address;
    }

    // Update capacity if empty or changed
    if (capacity && (!prop.capacity || prop.capacity !== capacity)) {
      updates.capacity = capacity;
    }

    // Update size if we have better data
    if (size && (!prop.size || prop.size !== size)) {
      updates.size = size;
    }

    // Update amenities if scraped has more
    const currentAmenities = JSON.parse(prop.amenities || '[]');
    if (amenities.length > currentAmenities.length) {
      updates.amenities = JSON.stringify(amenities);
    }

    // Update introduction if empty
    if (description && !prop.introduction) {
      updates.introduction = description;
    }

    // Update photos: add new local photos that aren't already in DB
    const existingImages = db.prepare('SELECT url FROM property_images WHERE propertyId = ?').all(slug);
    const existingUrls = new Set(existingImages.map(i => i.url));
    const newPhotos = result.localPhotos.filter(p => !existingUrls.has(p));

    // If existing has no local photos, replace all with scraped ones
    const hasLocalImages = existingImages.some(i => i.url.startsWith('images/airbnb/'));
    if (!hasLocalImages && result.localPhotos.length > 0) {
      // Replace remote URLs with local photos
      db.prepare('DELETE FROM property_images WHERE propertyId = ?').run(slug);
      const insertImg = db.prepare('INSERT INTO property_images (propertyId, url, isLocal, filename, sortOrder) VALUES (?,?,1,?,?)');
      result.localPhotos.forEach((photo, i) => {
        insertImg.run(slug, photo, path.basename(photo), i);
      });
      console.log(`  Replaced images: ${result.localPhotos.length} local photos`);
    }

    // Apply updates
    const setClauses = [];
    const values = [];
    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`${key} = ?`);
      values.push(val);
    }
    if (setClauses.length > 0) {
      values.push(slug);
      db.prepare(`UPDATE properties SET ${setClauses.join(', ')}, updatedAt = datetime('now','localtime') WHERE id = ?`).run(...values);
      console.log(`  Updated ${setClauses.length} fields: ${Object.keys(updates).join(', ')}`);
      updatedCount++;
    } else {
      console.log(`  No changes needed`);
    }

  } else {
    // ===== INSERT new property =====
    if (!config) { console.log(`  SKIP: no config for ${room}`); continue; }

    const regionId = ensureRegion(config.regionZh, config.regionEn);

    // Determine property name
    let name = result.excelName || result.title;
    // Use a cleaner name from title if excelName is empty
    if (!name) name = result.title;

    // Build transportInfo from title/description
    let transportInfo = result.title;
    if (transportInfo.length > 50) {
      transportInfo = transportInfo.substring(0, 50) + '...';
    }

    db.prepare(`INSERT INTO properties (
      id, name, type, regionId, regionZh, regionEn, regionDesc,
      badge, secondaryBadge, shortDesc, address, transportInfo,
      introduction, videoUrl, mapEmbedUrl, airbnbUrl,
      capacity, size, checkIn, checkOut, transportDetail,
      quickInfo, amenities, spaceIntro, nearestStation
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      config.slug,
      name,
      '包棟民宿',
      regionId,
      config.regionZh,
      config.regionEn,
      '',
      '', // badge
      '', // secondaryBadge
      '', // shortDesc
      address,
      transportInfo,
      description,
      '', // videoUrl
      '', // mapEmbedUrl
      result.airbnbUrl,
      capacity,
      size,
      result.checkIn || '下午3點以後',
      result.checkOut || '上午10點之前',
      '', // transportDetail
      '[]', // quickInfo
      JSON.stringify(amenities),
      '[]', // spaceIntro
      '' // nearestStation
    );

    // Insert photos
    const insertImg = db.prepare('INSERT INTO property_images (propertyId, url, isLocal, filename, sortOrder) VALUES (?,?,1,?,?)');
    result.localPhotos.forEach((photo, i) => {
      insertImg.run(config.slug, photo, path.basename(photo), i);
    });

    console.log(`  INSERTED new property: ${config.slug} with ${result.localPhotos.length} photos`);
    insertedCount++;
  }

  console.log('');
}

// Summary
console.log('=== Summary ===');
console.log(`Updated: ${updatedCount} existing properties`);
console.log(`Inserted: ${insertedCount} new properties`);

const totalProps = db.prepare('SELECT COUNT(*) as c FROM properties').get().c;
const totalImages = db.prepare('SELECT COUNT(*) as c FROM property_images').get().c;
const totalRegions = db.prepare('SELECT COUNT(*) as c FROM regions').get().c;
console.log(`Total properties: ${totalProps}`);
console.log(`Total images: ${totalImages}`);
console.log(`Total regions: ${totalRegions}`);

db.close();
console.log('\nDone!');
