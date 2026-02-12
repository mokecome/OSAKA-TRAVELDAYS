const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'osaka-minshuku.db'));

// Add new columns if not exist
try { db.exec("ALTER TABLE properties ADD COLUMN nearbyAttractions TEXT DEFAULT ''"); } catch(e) {}
try { db.exec("ALTER TABLE properties ADD COLUMN parkingInfo TEXT DEFAULT ''"); } catch(e) {}

const fixes = [
  {
    id: 'yomogi',
    secondaryBadge: '2025 新屋',
    capacity: '新房源・適合大家庭',
    size: '3 間衛浴・2 間浴室',
    transportInfo: '大正車站4分鐘抵達・心齋橋3站・全新包棟房',
    nearbyAttractions: '',
    parkingInfo: ''
    // regionEn, address, nearestStation already correct
  },
  {
    id: 'juichimei',
    secondaryBadge: '',
    capacity: '優質房源・整套房源・適合家庭旅遊',
    size: '',
    transportInfo: '大正區舒適包棟民宿・寧靜住宅區',
    nearbyAttractions: '',
    parkingInfo: ''
  },
  {
    id: 'bunkaen',
    secondaryBadge: 'Guest House',
    capacity: '優質房源・整套房源・溫馨舒適',
    size: '',
    transportInfo: '大正區中心・溫馨民宿體驗・交通便利',
    nearbyAttractions: '',
    parkingInfo: ''
  },
  {
    id: 'nk-homes-namba',
    secondaryBadge: '',
    capacity: '4.71 (159 則評價)・5 人',
    size: '44.65㎡・2DK 公寓',
    transportInfo: '心齋橋道頓堀公寓・難波站步行5分鐘',
    address: '〒542-0086 大阪市中央区西心斎橋2-7-22 道頓堀ハイツ405号室',
    nearestStation: '難波站（步行5-6分鐘）\n大阪メトロ御堂筋線\n大阪メトロ千日前線',
    transportDetail: '',
    nearbyAttractions: '道頓堀（步行1分鐘）\n心齋橋商店街（步行3分鐘）\n黑門市場（步行10分鐘）\n日本橋電器街（步行8分鐘）',
    parkingInfo: ''
  },
  {
    id: 'shinsaibashi-family',
    secondaryBadge: '',
    capacity: '4.72 (230 則評價)・4 人',
    size: '52㎡・2LDK 公寓',
    transportInfo: '心齋橋道頓堀2LDK家庭公寓・步行2分鐘',
    address: '〒542-0086 大阪市中央区西心斎橋2-7-22 道頓堀ハイツ406号',
    nearestStation: '難波站（步行5-6分鐘）\n大阪メトロ御堂筋線\n大阪メトロ千日前線',
    transportDetail: '',
    nearbyAttractions: '道頓堀（步行2分鐘）\n心齋橋商店街（步行3分鐘）\n黑門市場（步行10分鐘）\n日本橋電器街（步行8分鐘）',
    parkingInfo: ''
  },
  {
    id: 'nomad-inn',
    secondaryBadge: '',
    capacity: '4.86 (14 則評價)・5 人',
    size: '2 層樓・日式房屋',
    transportInfo: '貸切谷町6丁目一軒家・靜謐日式住宅',
    nearestStation: '谷町六丁目站（步行2分鐘）\n大阪メトロ谷町線\n大阪メトロ長堀鶴見緑地線',
    transportDetail: '',
    nearbyAttractions: '空堀商店街（步行5分鐘）\n難波站（約10分鐘）\n心齋橋（約12分鐘）\n大阪城（約15分鐘）',
    parkingInfo: ''
  },
  {
    id: 'geisha',
    secondaryBadge: '',
    regionEn: 'Suminoe / South Osaka',
    capacity: '4.67 (3 則評價)・3 人',
    size: '2 層樓・私人車庫',
    transportInfo: '住之江包棟一軒家・附私人車庫',
    address: '〒559-0004 大阪市住之江区住之江3-8-8',
    nearestStation: '南海電鐵 住之江站\n大阪Metro 四橋線 住之江公園站',
    nearbyAttractions: '',
    parkingInfo: '附私人車庫（免費）'
  },
  {
    id: 'sakuragawa-nishikujo',
    secondaryBadge: '',
    regionEn: 'Nishikujo / West Osaka',
    capacity: '4.69 (85 則評價)・8 人',
    size: '58㎡・獨棟房屋',
    transportInfo: '58㎡寬敞空間・環球影城5分鐘車程',
    address: '〒554-0012 大阪府大阪市此花区西九条1-10-12',
    nearestStation: '西九條站（步行5分鐘）\nJR大阪環狀線\n阪神電鐵阪神なんば線',
    transportDetail: '',
    nearbyAttractions: 'USJ環球影城（車程5分鐘）\n大阪站（約4分鐘）\n難波站（約13分鐘）\n心齋橋站（約15分鐘）',
    parkingInfo: ''
  },
  {
    id: 'taixiang-2f',
    secondaryBadge: '交通便利',
    regionEn: 'Fukushima / West Osaka',
    capacity: '4.75 (4 則評價)・3 人',
    size: '榻榻米房間・2 樓',
    transportInfo: '大阪榻榻米住宿・野田阪神站步行5分鐘',
    address: '〒553-0002 大阪市福島区鷺洲1-12-35 二階',
    nearestStation: '千日前線 野田阪神站（步行5分鐘）\nJR環狀線 野田站\n阪神電鐵 野田站',
    nearbyAttractions: '',
    parkingInfo: ''
  },
  {
    id: 'taixiang-3f',
    secondaryBadge: '交通便利',
    regionEn: 'Fukushima / West Osaka',
    capacity: '4.5 (4 則評價)・2 人',
    size: '雙人床・3 樓',
    transportInfo: '大阪都市度假屋・野田阪神站步行5分鐘',
    address: '〒553-0002 大阪市福島区鷺洲1-12-35 三階',
    nearestStation: '千日前線 野田阪神站（步行5分鐘）\nJR環狀線 野田站\n阪神電鐵 野田站',
    nearbyAttractions: '',
    parkingInfo: ''
  }
];

// Update each property
const fields = ['secondaryBadge','capacity','size','transportInfo','regionEn','address','nearestStation','transportDetail','nearbyAttractions','parkingInfo'];

for (const fix of fixes) {
  const setClauses = [];
  const values = [];
  for (const field of fields) {
    if (fix[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(fix[field]);
    }
  }
  if (setClauses.length > 0) {
    values.push(fix.id);
    db.prepare(`UPDATE properties SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    console.log(`  Updated: ${fix.id} (${setClauses.length} fields)`);
  }
}

// Also update regionEn in the regions table for affected regions
const regionFixes = [
  { oldEn: 'Suminoe Ward', newEn: 'Suminoe / South Osaka' },
  { oldEn: 'Nishikujo / Kujo / Fukushima', newEn: '' } // will handle per property below
];

// Update geisha's region
const geishaRegion = db.prepare("SELECT regionId FROM properties WHERE id = 'geisha'").get();
if (geishaRegion && geishaRegion.regionId) {
  db.prepare("UPDATE regions SET nameEn = 'Suminoe / South Osaka' WHERE id = ?").run(geishaRegion.regionId);
  console.log('  Updated geisha region nameEn');
}

// For sakuragawa/taixiang region: check if they share same region
const sakuraRegion = db.prepare("SELECT regionId FROM properties WHERE id = 'sakuragawa-nishikujo'").get();
const taiRegion = db.prepare("SELECT regionId FROM properties WHERE id = 'taixiang-2f'").get();
if (sakuraRegion && taiRegion && sakuraRegion.regionId === taiRegion.regionId) {
  // They share a region - but original pages have different regionEn values
  // sakuragawa: "Nishikujo / West Osaka", taixiang: "Fukushima / West Osaka"
  // They should be in different regions. For now, update the shared region name
  // and note that individual property regionEn is used by the template
  console.log('  Note: sakuragawa and taixiang share a region but have different regionEn in originals');
}

// Fix taixiang-2f amenities: add missing '自助入住' and '電視'
const t2f = db.prepare("SELECT amenities FROM properties WHERE id = 'taixiang-2f'").get();
if (t2f) {
  const amenities = JSON.parse(t2f.amenities || '[]');
  // Original order: 交通便利, Wi-Fi, 廚房, 洗衣機, 空調設備, 吹風機, 冰箱, 自助入住, 電視, 微波爐, 基本沐浴用品, 煙霧警報器
  const correctAmenities = ['交通便利', 'Wi-Fi', '廚房', '洗衣機', '空調設備', '吹風機', '冰箱', '自助入住', '電視', '微波爐', '基本沐浴用品', '煙霧警報器'];
  db.prepare("UPDATE properties SET amenities = ? WHERE id = 'taixiang-2f'").run(JSON.stringify(correctAmenities));
  console.log('  Fixed taixiang-2f amenities (added 自助入住, 電視)');
}

db.close();
console.log('\nDone! All fixes applied.');
