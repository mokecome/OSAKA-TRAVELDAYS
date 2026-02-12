const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'osaka-minshuku.db'));
db.pragma('journal_mode = DELETE');
db.pragma('foreign_keys = ON');

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT '包棟民宿',
    regionZh TEXT DEFAULT '', regionEn TEXT DEFAULT '', regionDesc TEXT DEFAULT '',
    badge TEXT DEFAULT '', secondaryBadge TEXT DEFAULT '', shortDesc TEXT DEFAULT '',
    address TEXT DEFAULT '', transportInfo TEXT DEFAULT '', introduction TEXT DEFAULT '',
    videoUrl TEXT DEFAULT '', mapEmbedUrl TEXT DEFAULT '', airbnbUrl TEXT DEFAULT '',
    capacity TEXT DEFAULT '', size TEXT DEFAULT '', checkIn TEXT DEFAULT '下午3點以後',
    checkOut TEXT DEFAULT '上午10點之前', transportDetail TEXT DEFAULT '',
    quickInfo TEXT DEFAULT '[]', amenities TEXT DEFAULT '[]', spaceIntro TEXT DEFAULT '[]',
    nearestStation TEXT DEFAULT '', regionId INTEGER DEFAULT NULL,
    createdAt TEXT DEFAULT (datetime('now','localtime')),
    updatedAt TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT, propertyId TEXT NOT NULL,
    url TEXT NOT NULL, isLocal INTEGER DEFAULT 0, filename TEXT DEFAULT '',
    sortOrder INTEGER DEFAULT 0,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nameZh TEXT NOT NULL DEFAULT '',
    nameEn TEXT NOT NULL DEFAULT '', description TEXT DEFAULT '', sortOrder INTEGER DEFAULT 0
  );
`);

// ==================== SEED REGIONS ====================
const regionsData = [
  { nameZh: '大正區', nameEn: 'Taisho Ward', description: '大阪的小沖繩，充滿獨特文化魅力的下町風情', sortOrder: 0 },
  { nameZh: '心齋橋 / 日本橋 / 難波', nameEn: 'Shinsaibashi / Nipponbashi / Namba', description: '大阪最繁華的商業中心，購物美食一應俱全', sortOrder: 1 },
  { nameZh: '住之江区', nameEn: 'Suminoe Ward', description: '寧靜住宅區，感受在地生活氛圍', sortOrder: 2 },
  { nameZh: '西九條 / 九條區 / 福島區', nameEn: 'Nishikujo / Kujo / Fukushima', description: '交通樞紐，輕鬆前往各大景點', sortOrder: 3 },
];

const insertRegion = db.prepare('INSERT INTO regions (nameZh, nameEn, description, sortOrder) VALUES (?,?,?,?)');
const regionIds = {};

const seedRegions = db.transaction(() => {
  // Clear existing
  db.exec('DELETE FROM property_images');
  db.exec('DELETE FROM properties');
  db.exec('DELETE FROM regions');

  for (const r of regionsData) {
    const info = insertRegion.run(r.nameZh, r.nameEn, r.description, r.sortOrder);
    regionIds[r.nameZh] = info.lastInsertRowid;
  }
});
seedRegions();
console.log('Regions seeded:', Object.keys(regionIds).length);

// ==================== SEED PROPERTIES ====================
const propertiesData = [
  // 大正區
  {
    id: 'yomogi', name: '艾屋吉屋よもぎの屋', type: '包棟民宿',
    region: '大正區', badge: '包棟民宿', secondaryBadge: '2025新屋',
    shortDesc: '全新包棟房・3廁2浴室',
    address: '大阪市大正区三軒家西1-12-19',
    transportInfo: '大正車站4分鐘・心齋橋3站',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-1543539317236403832/original/8b40bf75-14a9-40dd-98a3-ce0d90847671.jpeg'
    ]
  },
  {
    id: 'juichimei', name: '十一鳴', type: '包棟民宿',
    region: '大正區', badge: '包棟民宿', secondaryBadge: '整套房源',
    shortDesc: '舒適包棟住宿',
    address: '大阪市大正区三軒家西2-1-6',
    transportInfo: '寧靜住宅區・適合家庭旅遊',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM3Mjg5MTI1ODg1MjEyMDU2Ng==/original/2df9c702-2477-45ba-929e-524d8383f7fb.jpeg'
    ]
  },
  {
    id: 'bunkaen', name: '文華苑 大正 Guest House', type: 'Guest House',
    region: '大正區', badge: 'Guest House', secondaryBadge: '整套房源',
    shortDesc: '溫馨民宿體驗',
    address: '大阪市大正区三軒家西',
    transportInfo: '大正區中心・交通便利',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI3ODkyNzg2MzY5MzQzODg3Mw%3D%3D/original/7bd428dd-6a09-4916-8ea5-364de7662fbc.jpeg'
    ]
  },
  // 心齋橋 / 日本橋 / 難波
  {
    id: 'nk-homes-namba', name: 'NK Homes Namba', type: '獨立式套房',
    region: '心齋橋 / 日本橋 / 難波', badge: '公寓式民宿', secondaryBadge: '道頓堀旁',
    shortDesc: '道頓堀高級公寓',
    address: '大阪市中央区西心斎橋2-7-22 405號',
    transportInfo: '心齋橋站步行3分鐘・購物天堂',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6Mjg0NDA2Mjg%3D/original/32ebfb0d-cf1c-4c9d-84a4-55bbefd752ac.jpeg'
    ]
  },
  {
    id: 'shinsaibashi-family', name: 'Shinsaibashi Family Room', type: '獨立式套房',
    region: '心齋橋 / 日本橋 / 難波', badge: '公寓式民宿', secondaryBadge: '家庭首選',
    shortDesc: '道頓堀家庭房',
    address: '大阪市中央区西心斎橋2-7-22 406號',
    transportInfo: '適合家庭入住・寬敞舒適',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM4MDgzMzM%3D/original/8c675e91-f0c4-4165-b7be-15c789a34e2f.jpeg'
    ]
  },
  {
    id: 'nomad-inn', name: 'The Nomad inn Osaka', type: '包棟民宿',
    region: '心齋橋 / 日本橋 / 難波', badge: '包棟民宿', secondaryBadge: '最多 8 人',
    shortDesc: '58㎡ ・ 2LDK',
    address: '大阪市中央区谷町六丁目-3-11',
    transportInfo: '谷町六丁目站步行2分鐘',
    capacity: '最多8人', size: '58㎡',
    images: [
      'https://a0.muscache.com/im/pictures/miso/Hosting-1326417920271287072/original/cc4c8b06-db32-41ee-804d-250f31e8b128.jpeg'
    ]
  },
  // 住之江区
  {
    id: 'geisha', name: '芸舎', type: '包棟民宿',
    region: '住之江区', badge: '包棟民宿', secondaryBadge: '整套房源',
    shortDesc: '住之江包棟一軒家',
    address: '大阪市住之江区住之江3-8-8',
    transportInfo: '寬敞舒適・適合家庭旅遊',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/237464a1-4121-4b42-a793-8b7475f26388.jpeg?im_w=720'
    ]
  },
  // 西九條 / 九條區 / 福島區
  {
    id: 'sakuragawa-nishikujo', name: '桜川・西九条', type: '包棟民宿',
    region: '西九條 / 九條區 / 福島區', badge: '包棟民宿', secondaryBadge: 'USJ首選',
    shortDesc: '此花区舒適住宿',
    address: '大阪市此花区西九条1-10-12',
    transportInfo: '西九條站步行5分鐘・USJ直達',
    images: [
      'https://a0.muscache.com/im/pictures/miso/Hosting-42631189/original/364206ee-096b-4c4f-8050-4417b9e82580.png'
    ]
  },
  {
    id: 'taixiang-2f', name: '台香 2F', type: '包棟民宿',
    region: '西九條 / 九條區 / 福島區', badge: '包棟民宿', secondaryBadge: '附停車場',
    shortDesc: '舒適住宅・二階',
    address: '大阪市福島区鷺洲1-12-35 二階',
    transportInfo: '附設停車場・自駕首選',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/600a04f5-ad46-4703-be41-71debea597f4.jpeg'
    ]
  },
  {
    id: 'taixiang-3f', name: '台香 3F', type: '獨立式套房',
    region: '西九條 / 九條區 / 福島區', badge: '公寓式民宿', secondaryBadge: '最多 3 人',
    shortDesc: '榻榻米住宿・三階',
    address: '大阪市福島区鷺洲1-12-35 三階',
    transportInfo: '傳統榻榻米・日式體驗',
    capacity: '最多3人',
    images: [
      'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/1a21ce8e-edf4-4381-8807-2be00d836a5b.jpeg'
    ]
  },
];

const insertProp = db.prepare(`INSERT INTO properties (id, name, type, regionId, regionZh, regionEn, regionDesc,
  badge, secondaryBadge, shortDesc, address, transportInfo, introduction, videoUrl, mapEmbedUrl,
  airbnbUrl, capacity, size, checkIn, checkOut, transportDetail, quickInfo, amenities, spaceIntro, nearestStation)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

const insertImg = db.prepare('INSERT INTO property_images (propertyId, url, isLocal, filename, sortOrder) VALUES (?,?,?,?,?)');

const seedProperties = db.transaction(() => {
  for (const p of propertiesData) {
    const regionId = regionIds[p.region];
    const region = regionsData.find(r => r.nameZh === p.region);

    insertProp.run(
      p.id, p.name, p.type || '包棟民宿',
      regionId, region.nameZh, region.nameEn, region.description,
      p.badge || '', p.secondaryBadge || '', p.shortDesc || '',
      p.address || '', p.transportInfo || '', p.introduction || '',
      p.videoUrl || '', p.mapEmbedUrl || '', p.airbnbUrl || '',
      p.capacity || '', p.size || '', p.checkIn || '下午3點以後',
      p.checkOut || '上午10點之前', p.transportDetail || '',
      JSON.stringify(p.quickInfo || []), JSON.stringify(p.amenities || []),
      JSON.stringify(p.spaceIntro || []), p.nearestStation || ''
    );

    (p.images || []).forEach((url, i) => {
      insertImg.run(p.id, url, 0, '', i);
    });
  }
});
seedProperties();

// Verify
const propCount = db.prepare('SELECT COUNT(*) as c FROM properties').get().c;
const regionCount = db.prepare('SELECT COUNT(*) as c FROM regions').get().c;
const imgCount = db.prepare('SELECT COUNT(*) as c FROM property_images').get().c;
console.log(`Done! ${regionCount} regions, ${propCount} properties, ${imgCount} images seeded.`);

db.close();
