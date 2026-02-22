'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'osaka-minshuku.db'));

function ml(zhTW, ja, en) {
  return JSON.stringify({ 'zh-TW': zhTW, ja: ja, en: en });
}

function isAlreadyMultilingual(val) {
  if (!val) return false;
  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try {
      const o = JSON.parse(val);
      return o['zh-TW'] !== undefined || o['ja'] !== undefined;
    } catch (e) {}
  }
  return false;
}

// Wrap a quickInfo/spaceIntro array where each item has title, value(optional), desc
function mlArray(items) {
  return JSON.stringify(items.map(item => {
    const out = {
      title: { 'zh-TW': item.title.zhTW, ja: item.title.ja, en: item.title.en },
      desc: { 'zh-TW': item.desc.zhTW, ja: item.desc.ja, en: item.desc.en },
    };
    if (item.value) {
      out.value = { 'zh-TW': item.value.zhTW, ja: item.value.ja, en: item.value.en };
    }
    return out;
  }));
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const translations = {

  // ── 1. yomogi ───────────────────────────────────────────────────────────────
  yomogi: {
    name: ml(
      '艾屋吉屋よもぎの屋',
      '艾屋吉屋よもぎの屋',
      'Yomogi-no-ya'
    ),
    shortDesc: ml(
      '全新包棟房・3廁2浴室',
      '新築貸切・トイレ3つ・バスルーム2つ',
      'Entire New Home · 3 Toilets & 2 Bathrooms'
    ),
    badge: ml('包棟民宿', '貸切民泊', 'Entire Home'),
    secondaryBadge: ml('2025 新屋', '2025年新築', '2025 New Build'),
    transportInfo: ml(
      '大正車站4分鐘抵達・心齋橋3站・全新包棟房',
      '大正駅徒歩4分・心斎橋3駅・新築貸切',
      '4 min walk to Taisho Stn · 3 stops to Shinsaibashi · Brand New'
    ),
    transportDetail: ml(
      '大正站 步行4分鐘\n心齋橋站 3站（約8分鐘）\n難波站 約10分鐘\n天王寺站 約15分鐘\n關西機場 約50分鐘',
      '大正駅 徒歩4分\n心斎橋駅 3駅（約8分）\n難波駅 約10分\n天王寺駅 約15分\n関西空港 約50分',
      'Taisho Stn: 4 min walk\nShinsaibashi Stn: 3 stops (approx. 8 min)\nNamba Stn: approx. 10 min\nTennoji Stn: approx. 15 min\nKansai Airport: approx. 50 min'
    ),
    introduction: ml(
      '2025年全新開幕！艾屋吉屋よもぎの屋位於大阪大正區，是一間設備完善的全新包棟民宿。距離大正車站僅需步行4分鐘，前往心齋橋只需3站，交通極為便利。\n\n房源配備3間廁所、2間浴室，非常適合多人家庭或團體旅遊入住。大正區被稱為「大阪的小沖繩」，擁有獨特的下町風情和多元文化氛圍。\n\n全新裝潢、現代化設備，讓您在旅途中享受舒適如家的住宿體驗。',
      '2025年新規オープン！艾屋吉屋よもぎの屋は大阪大正区に位置する、設備が充実した新築の貸切民泊です。大正駅から徒歩わずか4分、心斎橋へは3駅とアクセス抜群です。\n\n3つの独立したトイレと2つのバスルームを完備しており、大人数のご家族やグループ旅行に最適です。大正区は「大阪の小沖縄」とも呼ばれ、独特の下町情緒と多文化的な雰囲気が魅力です。\n\n真新しいインテリアと最新設備で、旅先でも我が家のような快適な滞在をお楽しみください。',
      'Grand opening in 2025! Yomogi-no-ya is a brand-new, fully-equipped entire-home rental in Taisho Ward, Osaka. Just a 4-minute walk from Taisho Station and only 3 stops to Shinsaibashi, the location could not be more convenient.\n\nWith 3 separate toilets and 2 bathrooms, this home is perfect for large families or group travelers. Taisho Ward is known as "Little Okinawa in Osaka," brimming with unique shitamachi charm and a vibrant multicultural vibe.\n\nFresh décor and modern amenities ensure a comfortable, home-away-from-home experience throughout your stay.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房源特色', ja: '物件の特徴', en: 'Property Highlights' },
        value: { zhTW: '2025年新屋', ja: '2025年新築', en: '2025 New Build' },
        desc: { zhTW: '全新裝潢設備', ja: '新築・新設備', en: 'Brand new interiors & appliances' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '包棟民宿', ja: '貸切民泊', en: 'Entire home rental' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '衛浴設備', ja: 'バス・トイレ設備', en: 'Bathroom Facilities' },
        desc: { zhTW: '配備3間獨立廁所和2間浴室，多人入住也不需要排隊等候，提供舒適便利的生活體驗。', ja: '独立したトイレが3つ、バスルームが2つあり、大人数でご利用いただいても順番待ちは不要。快適で便利な生活空間をご提供します。', en: 'Three separate toilets and two full bathrooms mean no queuing—even for large groups. Enjoy a relaxed, hassle-free stay.' },
      },
      {
        title: { zhTW: '適合家庭', ja: 'ファミリー向け', en: 'Family Friendly' },
        desc: { zhTW: '寬敞的空間設計，非常適合大家庭旅遊或多人團體入住，享受一起出遊的樂趣。', ja: '広々とした空間設計で、大家族やグループ旅行に最適。みんなで旅する楽しさを満喫してください。', en: 'The spacious layout is ideal for large families or groups traveling together—plenty of room for everyone to relax and enjoy.' },
      },
      {
        title: { zhTW: '交通便利', ja: 'アクセス便利', en: 'Excellent Access' },
        desc: { zhTW: '距離大正車站步行僅需4分鐘，前往心齋橋只需3站，輕鬆抵達大阪各大景點。', ja: '大正駅まで徒歩4分、心斎橋へはわずか3駅で、大阪の主要スポットへ楽々アクセスできます。', en: "Just a 4-minute walk to Taisho Station and 3 stops to Shinsaibashi—Osaka's top attractions are all within easy reach." },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，密碼鎖方便安全。', ja: 'チェックイン：15:00以降\nチェックアウト：10:00まで\nセルフチェックイン（暗証番号錠）で安心・便利。', en: 'Check-in: from 3:00 PM\nCheck-out: by 10:00 AM\nSelf check-in via keypad lock—convenient and secure.' },
      },
    ]),
  },

  // ── 2. juichimei ────────────────────────────────────────────────────────────
  juichimei: {
    name: ml('十一鳴', '十一鳴', 'Juichimei'),
    shortDesc: ml('舒適包棟住宿', '快適な貸切宿泊', 'Comfortable Entire-Home Stay'),
    badge: ml('包棟民宿', '貸切民泊', 'Entire Home'),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '大正區舒適包棟民宿・寧靜住宅區',
      '大正区の快適な貸切民泊・閑静な住宅街',
      'Cozy Entire Home in Taisho · Quiet Residential Area'
    ),
    transportDetail: ml(
      '大正站 步行約10分鐘\n心齋橋站 約12分鐘\n難波站 約15分鐘\n天王寺站 約18分鐘\n關西機場 約55分鐘',
      '大正駅 徒歩約10分\n心斎橋駅 約12分\n難波駅 約15分\n天王寺駅 約18分\n関西空港 約55分',
      'Taisho Stn: approx. 10 min walk\nShinsaibashi Stn: approx. 12 min\nNamba Stn: approx. 15 min\nTennoji Stn: approx. 18 min\nKansai Airport: approx. 55 min'
    ),
    introduction: ml(
      '十一鳴位於大阪大正區的寧靜住宅區，是一間溫馨舒適的包棟民宿。這裡遠離城市的喧囂，卻又保持著便利的交通連結。\n\n大正區被稱為「大阪的小沖繩」，擁有獨特的多元文化氛圍和下町風情。在這裡入住，您可以體驗最道地的大阪生活。\n\n整套房源提供私密舒適的住宿環境，非常適合家庭旅遊或朋友結伴出遊。',
      '十一鳴は大阪大正区の静かな住宅街に位置する、温かみあふれる貸切民泊です。都市の喧騒から離れながらも、便利な交通アクセスを備えています。\n\n大正区は「大阪の小沖縄」として知られ、独特の多文化的雰囲気と下町情緒が魅力です。ここに滞在すれば、最も地元らしい大阪の暮らしを体験できます。\n\n貸切のプライベートな空間で、ご家族やお仲間との旅行に最適な環境をご提供します。',
      'Juichimei is a warm and welcoming entire-home rental tucked in a quiet residential neighbourhood of Taisho Ward, Osaka. Far from the city hustle yet still well-connected, it offers the best of both worlds.\n\nTaisho Ward is celebrated as "Little Okinawa in Osaka," with a distinctive multicultural atmosphere and authentic shitamachi character. Staying here lets you experience genuine Osaka local life.\n\nThe fully private space is ideal for families or groups of friends looking for a comfortable, home-style base.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '位置特色', ja: 'ロケーションの特徴', en: 'Location Highlights' },
        value: { zhTW: '寧靜住宅區', ja: '閑静な住宅街', en: 'Quiet Residential Area' },
        desc: { zhTW: '遠離喧囂', ja: '都会の喧騒から離れた静かな環境', en: 'Away from the city noise' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '包棟民宿', ja: '貸切民泊', en: 'Entire home rental' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '舒適環境', ja: '快適な空間', en: 'Comfortable Space' },
        desc: { zhTW: '整套房源提供舒適的住宿環境，讓您在旅途中也能享受如家般的放鬆感受。', ja: '貸切の空間で、旅の疲れも癒える我が家のようなくつろぎをお届けします。', en: 'The entire property is yours alone, giving you a relaxed, home-like atmosphere throughout your trip.' },
      },
      {
        title: { zhTW: '適合家庭', ja: 'ファミリー向け', en: 'Family Friendly' },
        desc: { zhTW: '寬敞的空間設計，非常適合家庭旅遊或朋友結伴出遊，享受一起出行的美好時光。', ja: '広々とした間取りで、ご家族旅行や友人同士の旅行に最適。一緒に過ごす素敵な時間をお楽しみください。', en: 'The roomy layout is perfect for family trips or friends traveling together—enjoy quality time in a private, relaxed setting.' },
      },
      {
        title: { zhTW: '寧靜環境', ja: '静かな環境', en: 'Peaceful Surroundings' },
        desc: { zhTW: '位於寧靜的住宅區，遠離城市喧囂，讓您享受平靜放鬆的休息時光。', ja: '静かな住宅街に位置し、都会の喧騒から離れてゆったりとした休息をお楽しみいただけます。', en: 'Nestled in a peaceful neighbourhood, far from city noise—the perfect environment to unwind and recharge.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，方便快捷。', ja: 'チェックイン：15:00以降\nチェックアウト：10:00まで\nセルフチェックインで手軽・スムーズ。', en: 'Check-in: from 3:00 PM\nCheck-out: by 10:00 AM\nSelf check-in for a smooth, hassle-free arrival.' },
      },
    ]),
  },

  // ── 3. bunkaen ──────────────────────────────────────────────────────────────
  bunkaen: {
    name: ml('文華苑 大正 Guest House', '文華苑 大正 ゲストハウス', 'Bunkaen Taisho Guest House'),
    shortDesc: ml('溫馨民宿體驗', '温かみあふれる宿泊体験', 'Cozy Guest House Experience'),
    badge: ml('Guest House', 'ゲストハウス', 'Guest House'),
    secondaryBadge: ml('Guest House', 'ゲストハウス', 'Guest House'),
    transportInfo: ml(
      '大正區中心・溫馨民宿體驗・交通便利',
      '大正区中心・温かみのある宿泊体験・アクセス便利',
      'Central Taisho · Cozy Guest House · Great Access'
    ),
    transportDetail: ml(
      '大正站 步行數分鐘\n心齋橋站 約10分鐘\n難波站 約12分鐘\n天王寺站 約15分鐘\n關西機場 約50分鐘',
      '大正駅 徒歩数分\n心斎橋駅 約10分\n難波駅 約12分\n天王寺駅 約15分\n関西空港 約50分',
      'Taisho Stn: a few min walk\nShinsaibashi Stn: approx. 10 min\nNamba Stn: approx. 12 min\nTennoji Stn: approx. 15 min\nKansai Airport: approx. 50 min'
    ),
    introduction: ml(
      '文華苑位於大阪大正區的中心位置，是一間溫馨舒適的 Guest House。這裡提供賓至如歸的住宿體驗，讓您在旅途中感受到家的溫暖。\n\n大正區擁有獨特的多元文化氛圍，被稱為「大阪的小沖繩」。在這裡，您可以體驗到與眾不同的下町風情，感受最道地的大阪生活。\n\n交通便利，周邊生活機能完善，是探索大阪的理想住宿選擇。',
      '文華苑は大阪大正区の中心に位置する、温かみあふれるゲストハウスです。旅の疲れも忘れるような、我が家のような居心地の良さをご提供します。\n\n大正区は「大阪の小沖縄」として知られ、独特の多文化的雰囲気と下町情緒が魅力。ここに滞在すれば、本物の大阪の暮らしを体感できます。\n\n交通便利で周辺の生活環境も充実しており、大阪観光の理想的な拠点です。',
      'Bunkaen is a warm and welcoming guest house located in the heart of Taisho Ward, Osaka. Expect a genuine home-away-from-home experience that will make you feel right at ease.\n\nTaisho Ward is affectionately known as "Little Okinawa in Osaka," offering a uniquely multicultural atmosphere and authentic shitamachi charm—perfect for experiencing real Osaka daily life.\n\nConveniently located with excellent transport links and all amenities close by, Bunkaen is the ideal base for exploring Osaka.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房源特色', ja: '物件の特徴', en: 'Property Highlights' },
        value: { zhTW: 'Guest House', ja: 'ゲストハウス', en: 'Guest House' },
        desc: { zhTW: '溫馨民宿體驗', ja: '温かみのある宿泊体験', en: 'Cozy, welcoming atmosphere' },
      },
      {
        title: { zhTW: '位置優勢', ja: 'ロケーションの強み', en: 'Location Advantage' },
        value: { zhTW: '大正區中心', ja: '大正区中心部', en: 'Central Taisho' },
        desc: { zhTW: '交通便利', ja: '交通アクセス良好', en: 'Excellent transport links' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: 'Guest House 體驗', ja: 'ゲストハウス体験', en: 'Guest House Experience' },
        desc: { zhTW: '文華苑提供溫馨的 Guest House 住宿體驗，讓您在旅途中感受到賓至如歸的溫暖。', ja: '文華苑では温かみのあるゲストハウス体験をご提供し、旅の間もくつろいだ我が家のような雰囲気をお楽しみいただけます。', en: 'Bunkaen delivers a warm, genuine guest house experience—making you feel truly at home no matter how far you have traveled.' },
      },
      {
        title: { zhTW: '優越位置', ja: '好アクセスの立地', en: 'Prime Location' },
        desc: { zhTW: '位於大正區中心，交通便利，周邊生活機能完善，是探索大阪的理想起點。', ja: '大正区の中心部に位置し、交通便利で周辺環境も充実。大阪観光の理想的なスタート地点です。', en: 'Centrally located in Taisho Ward with great transport connections and all daily conveniences nearby—an ideal starting point for exploring Osaka.' },
      },
      {
        title: { zhTW: '大正風情', ja: '大正区の情緒', en: 'Taisho Ward Charm' },
        desc: { zhTW: '大正區被稱為「大阪的小沖繩」，擁有獨特的多元文化氛圍和下町風情。', ja: '大正区は「大阪の小沖縄」とも呼ばれ、独特の多文化的雰囲気と下町情緒が魅力です。', en: 'Known as "Little Okinawa in Osaka," Taisho Ward boasts a one-of-a-kind multicultural vibe and old-town shitamachi character.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，輕鬆便捷。', ja: 'チェックイン：15:00以降\nチェックアウト：10:00まで\nセルフチェックインで気軽・スムーズ。', en: 'Check-in: from 3:00 PM\nCheck-out: by 10:00 AM\nSelf check-in for an easy, stress-free arrival.' },
      },
    ]),
  },

  // ── 4. nk-homes-namba ───────────────────────────────────────────────────────
  'nk-homes-namba': {
    name: ml('NK Homes Namba', 'NK Homes Namba', 'NK Homes Namba'),
    shortDesc: ml('道頓堀高級公寓', '道頓堀プレミアムアパートメント', 'Premium Dotonbori Apartment'),
    badge: ml('公寓式民宿', 'マンション民泊', 'Apartment Stay'),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '心齋橋道頓堀公寓・難波站步行5分鐘',
      '心斎橋・道頓堀アパートメント・難波駅徒歩5分',
      'Shinsaibashi / Dotonbori Apt · 5 min walk to Namba Stn'
    ),
    introduction: ml(
      '位於大阪心齋橋的合法住宿公寓，座落於熱鬧的道頓堀商圈，距離大阪地鐵難波站步行僅5-6分鐘。\n\n44.65㎡的2DK公寓，配備電梯，臥室設有二張半單人床，客廳另有沙發床，最多可容納5人入住。\n\n地理位置絕佳，步行可達心齋橋商店街、道頓堀、黑門市場等熱門景點，非常適合購物與美食愛好者。',
      '大阪心斎橋に位置する合法登録済みのアパートメントで、にぎやかな道頓堀エリアの中心に立地。大阪メトロ難波駅まで徒歩わずか5〜6分です。\n\n44.65㎡の2DKアパートはエレベーター完備。ベッドルームにはセミシングルベッドが2台、リビングにはソファベッドがあり、最大5名様までご宿泊いただけます。\n\n心斎橋商店街、道頓堀、黒門市場などの人気スポットへも徒歩圏内で、ショッピングやグルメを楽しみたい方に最適です。',
      'A legally registered apartment in the heart of Shinsaibashi, right in the lively Dotonbori district—just a 5–6 minute walk from Osaka Metro Namba Station.\n\nThis 44.65㎡ 2DK apartment features an elevator, two semi-single beds in the bedroom, and a sofa bed in the living area, accommodating up to 5 guests.\n\nPerfectly located within walking distance of Shinsaibashi Shopping Street, Dotonbori, and Kuromon Market—a dream base for shoppers and food lovers alike.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '2DK 公寓', ja: '2DKアパートメント', en: '2DK Apartment' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '可以住宿的人數', ja: '宿泊可能人数', en: 'Maximum Occupancy' },
        desc: { zhTW: '最多5人可以住，臥室配有二張半單人床，客廳另有沙發床，第4、5位房客可使用日式床墊。', ja: '最大5名様まで宿泊可能。ベッドルームにセミシングルベッド2台、リビングにソファベッドを完備。4〜5人目のゲストには和式布団をご用意しています。', en: 'Up to 5 guests. The bedroom has two semi-single beds; the living area has a sofa bed. Japanese-style floor mattresses are available for the 4th and 5th guests.' },
      },
      {
        title: { zhTW: '廚房設備', ja: 'キッチン設備', en: 'Kitchen Equipment' },
        desc: { zhTW: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。', ja: '基本的な調理器具と食器、IHクッキングヒーター、電子レンジ、冷蔵庫、電気ケトルを完備。日常生活に必要なものはほぼ揃っています。', en: 'Fully equipped with basic cookware and tableware, IH induction hob, microwave, refrigerator, and electric kettle—almost everything you need for daily living.' },
      },
      {
        title: { zhTW: 'Wi-Fi 網路', ja: 'Wi-Fi', en: 'Wi-Fi' },
        desc: { zhTW: '入住期間可以免費使用Wi-Fi。如果您不知道連接的方法，請通過平台提供的聯繫方式發短信問我們。', ja: '滞在中は無料でWi-Fiをご利用いただけます。接続方法がご不明な場合は、プラットフォームのメッセージ機能でお気軽にお問い合わせください。', en: 'Free Wi-Fi is available throughout your stay. If you need help connecting, just send us a message through the booking platform.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。', ja: 'チェックイン：16:00以降\nチェックアウト：10:00まで\nセルフチェックイン。基本的にフロントには人が常駐していません。', en: 'Check-in: from 4:00 PM\nCheck-out: by 10:00 AM\nSelf check-in. Please note there is generally no staff at the front desk.' },
      },
    ]),
  },

  // ── 5. shinsaibashi-family ───────────────────────────────────────────────────
  'shinsaibashi-family': {
    name: ml('Shinsaibashi Family Room', 'Shinsaibashi Family Room', 'Shinsaibashi Family Room'),
    shortDesc: ml('道頓堀家庭房', '道頓堀ファミリールーム', 'Dotonbori Family Room'),
    badge: ml('公寓式民宿', 'マンション民泊', 'Apartment Stay'),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '心齋橋道頓堀2LDK家庭公寓・步行2分鐘',
      '心斎橋・道頓堀2LDKファミリーアパート・徒歩2分',
      'Shinsaibashi / Dotonbori 2LDK Family Apt · 2 min walk'
    ),
    introduction: ml(
      '位於大阪心齋橋市中心的2LDK家庭公寓，步行2分鐘即可抵達著名的道頓堀商圈。\n\n52㎡的寬敞空間包含兩間獨立臥室，一間配有三張單人床，另一間為日式床鋪，非常適合家庭入住。住宿期間為完全私人空間。\n\n配備攜帶式WiFi，讓您外出也能隨時上網。地理位置絕佳，購物、美食、觀光一應俱全。',
      '大阪心斎橋の市街地中心に位置する2LDKファミリーアパートメント。道頓堀エリアまで徒歩わずか2分です。\n\n52㎡の広々とした空間に独立した2つの寝室を備えています。一室にはシングルベッドが3台、もう一室には和式ベッドがあり、ファミリー滞在に最適。滞在中は完全プライベートな空間をご利用いただけます。\n\nポータブルWi-Fiを完備しており、外出中もいつでもオンラインに。買い物・グルメ・観光がすべて揃う絶好のロケーションです。',
      'A spacious 2LDK family apartment in the very heart of Shinsaibashi, Osaka—just a 2-minute walk from the famous Dotonbori entertainment district.\n\nAt 52㎡, this entire-home rental features two separate bedrooms: one with three single beds and one with Japanese-style bedding. Exclusively yours throughout your stay.\n\nComes with a portable Wi-Fi device so you can stay connected on the go. Shopping, dining, and sightseeing are all right at your doorstep.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '2LDK 公寓', ja: '2LDKアパートメント', en: '2LDK Apartment' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '可以住宿的人數', ja: '宿泊可能人数', en: 'Maximum Occupancy' },
        desc: { zhTW: '最多4人可以住，兩間獨立臥室設計，一間配有三張單人床，另一間為日式床鋪，非常適合家庭入住。', ja: '最大4名様まで宿泊可能。独立した2つの寝室があり、一方にはシングルベッド3台、もう一方には和式ベッドを完備。ファミリー旅行に最適です。', en: 'Up to 4 guests. Two separate bedrooms—one with three single beds, one with Japanese-style bedding. Perfect for families.' },
      },
      {
        title: { zhTW: '廚房設備', ja: 'キッチン設備', en: 'Kitchen Equipment' },
        desc: { zhTW: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。', ja: '基本的な調理器具と食器、IHクッキングヒーター、電子レンジ、冷蔵庫、電気ケトルを完備。日常生活に必要なものはほぼ揃っています。', en: 'Fully equipped with basic cookware, tableware, IH induction hob, microwave, refrigerator, and electric kettle.' },
      },
      {
        title: { zhTW: 'Wi-Fi 網路', ja: 'Wi-Fi', en: 'Wi-Fi' },
        desc: { zhTW: '配備攜帶式WiFi，住宿期間可隨身攜帶，外出觀光也能隨時上網使用。', ja: 'ポータブルWi-Fiを完備しており、滞在中は外出先でもいつでもインターネットをご利用いただけます。', en: 'A portable Wi-Fi device is provided so you can stay connected even while out sightseeing.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。', ja: 'チェックイン：16:00以降\nチェックアウト：10:00まで\nセルフチェックイン。基本的にフロントには人が常駐していません。', en: 'Check-in: from 4:00 PM\nCheck-out: by 10:00 AM\nSelf check-in; no front desk staff on site.' },
      },
    ]),
  },

  // ── 6. nomad-inn ─────────────────────────────────────────────────────────────
  'nomad-inn': {
    name: ml('The Nomad inn Osaka', 'The Nomad inn Osaka', 'The Nomad Inn Osaka'),
    shortDesc: ml('58㎡ ・ 2LDK', '58㎡ ・ 2LDK', '58㎡ · 2LDK'),
    badge: ml('包棟民宿', '貸切民泊', 'Entire Home'),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '貸切谷町6丁目一軒家・靜謐日式住宅',
      '谷町6丁目一軒家貸切・静かな日本家屋',
      'Entire Traditional House in Tanimachi 6-chome · Peaceful & Quiet'
    ),
    introduction: ml(
      '這是一棟靜謐日式住宅，位於大阪市中央區谷町六丁目，鄰近懷舊的空堀商店街。\n\n步行2分鐘即可抵達最近的地鐵站，交通十分便利。兩層樓的日式房屋，兼具日式生活方式與現代化設施。\n\n最多可容納5人入住，非常適合家庭旅遊、朋友出遊或小團體。位於安靜的日式住宅區，特別適合放鬆度假。',
      '大阪市中央区谷町六丁目に位置する静かな日本家屋で、懐かしい空堀商店街に隣接しています。\n\n最寄りの地下鉄駅まで徒歩2分と交通至便。日本の暮らし方と現代的な設備を兼ね備えた2階建ての一軒家です。\n\n最大5名様まで宿泊可能で、家族旅行や友人同士の旅、少人数グループに最適。静かな住宅街でゆったりとした休暇をお楽しみください。',
      'A serene traditional Japanese house in Tanimachi 6-chome, Osaka, close to the nostalgic Karahori Shopping Street.\n\nJust a 2-minute walk from the nearest subway station, making it supremely convenient. This two-storey home blends Japanese living style with modern amenities.\n\nAccommodating up to 5 guests, it is ideal for families, friend groups, or small parties. The quiet residential setting makes it a perfect retreat for a relaxing getaway.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '獨棟房屋', ja: '一軒家', en: 'Entire house' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '可以住宿的人數', ja: '宿泊可能人数', en: 'Maximum Occupancy' },
        desc: { zhTW: '最多5人可以住，兩層樓日式房屋設計，提供舒適的空間，適合家庭、朋友或小團體入住。', ja: '最大5名様まで宿泊可能。2階建ての日本家屋で、ご家族・ご友人・少人数グループに最適な快適空間をご提供します。', en: 'Up to 5 guests. The two-storey Japanese house offers comfortable space for families, friends, or small groups.' },
      },
      {
        title: { zhTW: '廚房設備', ja: 'キッチン設備', en: 'Kitchen Equipment' },
        desc: { zhTW: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。', ja: '基本的な調理器具と食器、IHクッキングヒーター、電子レンジ、冷蔵庫、電気ケトルを完備。日常生活に必要なものはほぼ揃っています。', en: 'Basic cookware and tableware, IH induction hob, microwave, refrigerator, and electric kettle—almost everything you need.' },
      },
      {
        title: { zhTW: 'Wi-Fi 網路', ja: 'Wi-Fi', en: 'Wi-Fi' },
        desc: { zhTW: '入住期間可以免費使用Wi-Fi。如果您不知道連接的方法，請通過平台提供的聯繫方式發短信問我們。', ja: '滞在中は無料でWi-Fiをご利用いただけます。接続方法がご不明な場合は、プラットフォームのメッセージ機能でお気軽にお問い合わせください。', en: 'Free Wi-Fi throughout your stay. If you need help connecting, message us through the booking platform.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。', ja: 'チェックイン：16:00以降\nチェックアウト：10:00まで\nセルフチェックイン。基本的にフロントには人が常駐していません。', en: 'Check-in: from 4:00 PM\nCheck-out: by 10:00 AM\nSelf check-in; no front desk staff on site.' },
      },
    ]),
  },

  // ── 7. geisha ────────────────────────────────────────────────────────────────
  geisha: {
    name: ml('芸舎', '芸舎', 'Geisha'),
    shortDesc: ml('住之江包棟一軒家', '住之江区の貸切一軒家', 'Entire House in Suminoe'),
    badge: ml('包棟民宿', '貸切民泊', 'Entire Home'),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '住之江包棟一軒家・附私人車庫',
      '住之江区の貸切一軒家・専用駐車場付き',
      'Entire House in Suminoe · Private Garage Included'
    ),
    transportDetail: ml(
      '難波 地鐵約15分鐘\n心斋桥 地鐵約20分鐘\n住之江公園 步行約10分鐘\n關西機場 約45分鐘',
      '難波 地下鉄約15分\n心斎橋 地下鉄約20分\n住之江公園 徒歩約10分\n関西空港 約45分',
      'Namba: approx. 15 min by subway\nShinsaibashi: approx. 20 min by subway\nSuminoe Park: approx. 10 min walk\nKansai Airport: approx. 45 min'
    ),
    introduction: ml(
      '歡迎來到芸舎！這是一棟位於大阪住之江區的舒適2層木屋，整棟房源供您獨享，並附有私人車庫，非常適合自駕旅客。\n\n房源鄰近南海住之江站，交通便利。獨棟房源提供完整的隱私空間，讓您感受居家般的放鬆體驗。\n\n最多可容納3人入住，非常適合情侶或小團體。房屋配備現代化設施，讓您在大阪之旅中享有舒適的住宿體驗。',
      '芸舎へようこそ！大阪住之江区に位置するこの快適な2階建て木造一軒家は、貸切でご利用いただけます。専用駐車場付きで、レンタカー旅行のお客様に最適です。\n\n南海住之江駅に近く交通便利。プライベートな一軒家で、まるで我が家のようなリラックスした時間をお過ごしください。\n\n最大3名様まで宿泊可能で、カップルや少人数グループに最適。最新設備を完備し、大阪旅行を快適にサポートします。',
      'Welcome to Geisha! This cozy two-storey wooden house in Suminoe Ward, Osaka is exclusively yours, complete with a private garage—ideal for guests traveling by car.\n\nConveniently located near Nankai Suminoe Station, the house offers total privacy and a truly relaxing, home-like atmosphere.\n\nAccommodating up to 3 guests, it is perfect for couples or small groups. Modern amenities ensure a comfortable and memorable stay in Osaka.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '獨棟木屋・附車庫', ja: '一軒家・専用駐車場付き', en: 'Entire house with private garage' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '舒適木屋空間', ja: '快適な木造一軒家', en: 'Cozy Wooden House' },
        desc: { zhTW: '整棟2層木屋供您獨享，最多可容納3人入住。附有私人車庫，適合情侶或小團體自駕旅遊。', ja: '2階建て木造一軒家を丸ごとご利用いただけます。最大3名まで宿泊可能。専用駐車場付きで、カップルや少人数グループのドライブ旅行に最適です。', en: 'The entire two-storey wooden house is yours, accommodating up to 3 guests. A private garage makes it perfect for couples or small groups on a road trip.' },
      },
      {
        title: { zhTW: '完整廚房設備', ja: '充実したキッチン設備', en: 'Fully Equipped Kitchen' },
        desc: { zhTW: '配備完整廚房設施，包含電磁爐、微波爐、冰箱、電熱水壺及基本炊具餐具，方便您自行烹飪。', ja: 'IHクッキングヒーター、電子レンジ、冷蔵庫、電気ケトル、基本的な調理器具と食器を完備。自炊も気軽にお楽しみいただけます。', en: 'Fully equipped with an IH induction hob, microwave, refrigerator, electric kettle, and basic cookware—everything you need to cook your own meals.' },
      },
      {
        title: { zhTW: '免費 Wi-Fi', ja: '無料Wi-Fi', en: 'Free Wi-Fi' },
        desc: { zhTW: '提供高速無線網路，讓您在入住期間隨時保持連線，方便工作與休閒使用。', ja: '高速無線LANを完備。滞在中はいつでもインターネットに接続でき、仕事にも娯楽にもご活用いただけます。', en: 'High-speed wireless internet is available throughout your stay—perfect for remote work or streaming your favourite content.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午3點以後\n退房時間：上午11點之前\n自助入住，方便彈性。', ja: 'チェックイン：15:00以降\nチェックアウト：11:00まで\nセルフチェックインで柔軟・便利。', en: 'Check-in: from 3:00 PM\nCheck-out: by 11:00 AM\nSelf check-in for a flexible, hassle-free arrival.' },
      },
    ]),
  },

  // ── 8. sakuragawa-nishikujo ──────────────────────────────────────────────────
  'sakuragawa-nishikujo': {
    name: ml('桜川・西九条', '桜川・西九条', 'Sakuragawa Nishikujo'),
    shortDesc: ml('此花区舒適住宿', '此花区の快適宿泊', 'Comfortable Stay in Konohana'),
    badge: ml('包棟民宿', '貸切民泊', 'Entire Home'),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '58㎡寬敞空間・環球影城5分鐘車程',
      '58㎡の広々空間・USJ車で5分',
      '58㎡ Spacious Home · 5 min to USJ by Car'
    ),
    introduction: ml(
      '這是一間位於大阪知名旅遊區的寬敞住宅，距離西九條站步行僅5分鐘，前往USJ環球影城車程只需5分鐘。\n\n58㎡的空間最多可容納8人入住，非常適合家庭旅遊、朋友出遊或前往環球影城的團體。\n\n周邊便利店、超市、居酒屋一應俱全，適合長期住宿。距離關西機場約50分鐘車程，交通十分便利。',
      '大阪の人気観光エリアに位置する広々とした住宅で、西九条駅まで徒歩5分、USJユニバーサル・スタジオ・ジャパンへは車でわずか5分です。\n\n58㎡の広い空間に最大8名様まで宿泊可能。家族旅行、友人グループ、またはUSJを目的とした団体旅行に最適です。\n\n周辺にはコンビニ、スーパー、居酒屋が揃っており、長期滞在にも対応。関西空港まで車で約50分と交通至便です。',
      'A spacious home in one of Osaka\'s most popular tourist areas—just a 5-minute walk from Nishikujo Station and only 5 minutes by car to Universal Studios Japan (USJ).\n\nAt 58㎡, the property accommodates up to 8 guests, making it ideal for family trips, friend groups, or USJ-bound parties.\n\nConvenience stores, supermarkets, and izakaya restaurants are all close by, and Kansai Airport is about 50 minutes away by car.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '獨棟房屋', ja: '一軒家', en: 'Entire house' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '可以住宿的人數', ja: '宿泊可能人数', en: 'Maximum Occupancy' },
        desc: { zhTW: '最多8人可以住，58㎡寬敞空間，非常適合家庭、朋友或前往環球影城的團體入住。', ja: '最大8名様まで宿泊可能。58㎡の広々とした空間で、ご家族・ご友人・USJ観光グループに最適です。', en: 'Up to 8 guests in 58㎡ of spacious living area—ideal for families, friend groups, or anyone heading to USJ.' },
      },
      {
        title: { zhTW: '廚房設備', ja: 'キッチン設備', en: 'Kitchen Equipment' },
        desc: { zhTW: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。', ja: '基本的な調理器具と食器、IHクッキングヒーター、電子レンジ、冷蔵庫、電気ケトルを完備。日常生活に必要なものはほぼ揃っています。', en: 'Basic cookware and tableware, IH induction hob, microwave, refrigerator, and electric kettle—almost everything you need.' },
      },
      {
        title: { zhTW: 'Wi-Fi 網路', ja: 'Wi-Fi', en: 'Wi-Fi' },
        desc: { zhTW: '入住期間可以免費使用Wi-Fi。如果您不知道連接的方法，請通過平台提供的聯繫方式發短信問我們。', ja: '滞在中は無料でWi-Fiをご利用いただけます。接続方法がご不明な場合は、プラットフォームのメッセージ機能でお気軽にお問い合わせください。', en: 'Free Wi-Fi throughout your stay. Message us through the platform if you need help connecting.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。', ja: 'チェックイン：16:00以降\nチェックアウト：10:00まで\nセルフチェックイン。基本的にフロントには人が常駐していません。', en: 'Check-in: from 4:00 PM\nCheck-out: by 10:00 AM\nSelf check-in; no front desk staff on site.' },
      },
    ]),
  },

  // ── 9. taixiang-2f ───────────────────────────────────────────────────────────
  'taixiang-2f': {
    name: ml('台香 2F', '台香 2F', 'Taixiang 2F'),
    shortDesc: ml('舒適住宅・二階', '快適な住まい・2階', 'Comfortable Home · 2nd Floor'),
    badge: ml('包棟民宿', '貸切民泊', 'Entire Home'),
    secondaryBadge: ml('交通便利', 'アクセス良好', 'Great Access'),
    transportInfo: ml(
      '大阪榻榻米住宿・野田阪神站步行5分鐘',
      '大阪の畳宿泊・野田阪神駅徒歩5分',
      'Osaka Tatami Stay · 5 min walk to Noda-Hanshin Stn'
    ),
    transportDetail: ml(
      '難波 地鐵約10分鐘\n梅田 地鐵約10分鐘\n心斋桥 地鐵約15分鐘\n關西機場 約50分鐘',
      '難波 地下鉄約10分\n梅田 地下鉄約10分\n心斎橋 地下鉄約15分\n関西空港 約50分',
      'Namba: approx. 10 min by subway\nUmeda: approx. 10 min by subway\nShinsaibashi: approx. 15 min by subway\nKansai Airport: approx. 50 min'
    ),
    introduction: ml(
      '台香 2F 是一間位於大阪福島區鷺洲的舒適榻榻米住宿，步行5分鐘即可抵達千日前地鐵線上的野田阪神站，交通非常便利。\n\n房源位於2樓，提供傳統日式榻榻米房間，讓您體驗道地的日本住宿文化。非常適合觀光、商務差旅或在大阪放鬆入住。\n\n整套房源供您獨享，最多可容納3人入住。配備完整的生活設施，讓您有賓至如歸的感覺。',
      '台香 2Fは大阪福島区鷺洲に位置する快適な畳宿泊施設です。千日前線野田阪神駅まで徒歩5分と交通至便。\n\n2階に位置し、伝統的な和室（畳部屋）をご提供。本格的な日本の宿泊文化を体験していただけます。観光・出張・大阪でのんびり滞在に最適です。\n\n貸切でご利用いただける全室プライベート空間で、最大3名様まで宿泊可能。充実した生活設備で我が家のようにお寛ぎください。',
      'Taixiang 2F is a comfortable tatami-style accommodation in Sagisu, Fukushima Ward, Osaka—just a 5-minute walk from Noda-Hanshin Station on the Sennichimae Line.\n\nLocated on the 2nd floor, the property offers traditional Japanese tatami rooms for an authentic Japanese lodging experience. Perfect for sightseeing, business trips, or a relaxing Osaka stay.\n\nThe entire space is exclusively yours, accommodating up to 3 guests. Fully equipped amenities ensure a home-away-from-home feeling.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '榻榻米・2樓', ja: '和室（畳）・2階', en: 'Tatami room · 2nd floor' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '榻榻米房間', ja: '和室（畳部屋）', en: 'Tatami Room' },
        desc: { zhTW: '傳統日式榻榻米住宿體驗，舒適的日式空間讓您感受道地的日本文化。', ja: '伝統的な和室（畳部屋）での宿泊体験。本格的な日本文化を感じながらゆっくりお寛ぎください。', en: 'Experience authentic Japanese hospitality in a traditional tatami room—immerse yourself in genuine Japanese culture and comfort.' },
      },
      {
        title: { zhTW: '舒適空間', ja: '快適な空間', en: 'Comfortable Space' },
        desc: { zhTW: '最多可容納3人入住，整套房源供您獨享，適合小家庭、情侶或商務旅客。', ja: '最大3名様まで宿泊可能。貸切の完全プライベート空間で、小家族・カップル・ビジネス旅行者に最適です。', en: 'Up to 3 guests in an exclusively private space—great for small families, couples, or business travelers.' },
      },
      {
        title: { zhTW: '完整設備', ja: '充実した設備', en: 'Full Amenities' },
        desc: { zhTW: '配備完整廚房、Wi-Fi、洗衣機、空調等設備，讓您的住宿體驗舒適便利。', ja: 'キッチン、Wi-Fi、洗濯機、エアコンを完備し、快適で便利な滞在をサポートします。', en: 'Fully equipped with a kitchen, Wi-Fi, washing machine, and air conditioning for a comfortable and convenient stay.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，輕鬆方便。', ja: 'チェックイン：15:00以降\nチェックアウト：10:00まで\nセルフチェックインで気軽・スムーズ。', en: 'Check-in: from 3:00 PM\nCheck-out: by 10:00 AM\nSelf check-in for an easy, smooth arrival.' },
      },
    ]),
  },

  // ── 10. taixiang-3f ──────────────────────────────────────────────────────────
  'taixiang-3f': {
    name: ml('台香 3F', '台香 3F', 'Taixiang 3F'),
    shortDesc: ml('榻榻米住宿・三階', '畳宿泊・3階', 'Tatami Stay · 3rd Floor'),
    badge: ml('公寓式民宿', 'マンション民泊', 'Apartment Stay'),
    secondaryBadge: ml('交通便利', 'アクセス良好', 'Great Access'),
    transportInfo: ml(
      '大阪都市度假屋・野田阪神站步行5分鐘',
      '大阪アーバンリトリート・野田阪神駅徒歩5分',
      'Osaka Urban Retreat · 5 min walk to Noda-Hanshin Stn'
    ),
    transportDetail: ml(
      '難波 地鐵約10分鐘\n梅田 地鐵約10分鐘\n心斋桥 地鐵約15分鐘\n關西機場 約50分鐘',
      '難波 地下鉄約10分\n梅田 地下鉄約10分\n心斎橋 地下鉄約15分\n関西空港 約50分',
      'Namba: approx. 10 min by subway\nUmeda: approx. 10 min by subway\nShinsaibashi: approx. 15 min by subway\nKansai Airport: approx. 50 min'
    ),
    introduction: ml(
      '台香 3F 是一間位於大阪福島區鷺洲的都市度假屋，步行5分鐘即可抵達千日前地鐵線上的野田阪神站，交通非常便利。\n\n房源位於3樓，配備舒適的雙人床，周邊便利商店和藥店眾多，生活機能完善，適合度假、出差或情侶旅行。\n\n最多可容納2人入住，整套房源供您獨享，讓您在大阪之旅中享有舒適私密的住宿體驗。',
      '台香 3Fは大阪福島区鷺洲に位置する都市型リトリートです。千日前線野田阪神駅まで徒歩5分と交通至便。\n\n3階に位置し、快適なダブルベッドを完備。周辺にはコンビニや薬局も多く生活に便利で、バカンス・出張・カップル旅行に最適です。\n\n最大2名様まで宿泊可能。貸切の完全プライベート空間で、大阪旅行をより快適にお過ごしいただけます。',
      'Taixiang 3F is an urban retreat in Sagisu, Fukushima Ward, Osaka—just a 5-minute walk from Noda-Hanshin Station on the Sennichimae Line.\n\nLocated on the 3rd floor with a comfortable double bed, surrounded by convenience stores and pharmacies. Perfect for a leisure trip, business stay, or romantic getaway.\n\nAccommodating up to 2 guests in an exclusively private space—a comfortable and intimate base for your Osaka adventure.'
    ),
    quickInfo: mlArray([
      {
        title: { zhTW: '房東', ja: 'ホスト', en: 'Host' },
        value: { zhTW: 'Max', ja: 'Max', en: 'Max' },
        desc: { zhTW: '10 年待客經驗', ja: '10年のホスト経験', en: '10 years of hosting experience' },
      },
      {
        title: { zhTW: '房源類型', ja: '物件タイプ', en: 'Property Type' },
        value: { zhTW: '整套房源', ja: '貸切', en: 'Entire Place' },
        desc: { zhTW: '都市度假屋・3樓', ja: 'アーバンリトリート・3階', en: 'Urban retreat · 3rd floor' },
      },
    ]),
    spaceIntro: mlArray([
      {
        title: { zhTW: '交通便利', ja: 'アクセス便利', en: 'Excellent Access' },
        desc: { zhTW: '步行5分鐘即可抵達野田阪神站，前往難波、梅田等主要區域都非常便利。', ja: '徒歩5分で野田阪神駅に到達でき、難波・梅田など主要エリアへのアクセスも大変便利です。', en: 'Just a 5-minute walk to Noda-Hanshin Station, with easy access to Namba, Umeda, and other major areas.' },
      },
      {
        title: { zhTW: '溫馨空間', ja: '温かみのある空間', en: 'Cozy Space' },
        desc: { zhTW: '最多可容納2人入住，配備舒適雙人床。整套房源供您獨享，適合情侶或商務旅客。', ja: '最大2名様まで宿泊可能。快適なダブルベッドを完備。貸切の完全プライベート空間でカップルやビジネス旅行者に最適です。', en: 'Up to 2 guests with a comfortable double bed. Exclusively yours—ideal for couples or business travelers.' },
      },
      {
        title: { zhTW: '基本設備', ja: '基本設備', en: 'Basic Amenities' },
        desc: { zhTW: '配備 Wi-Fi、空調、基本廚房設備及生活必需品，讓您的住宿體驗舒適便利。', ja: 'Wi-Fi、エアコン、基本的なキッチン設備と生活必需品を完備し、快適で便利な滞在をお楽しみいただけます。', en: 'Wi-Fi, air conditioning, basic kitchen equipment, and daily essentials are all provided for a comfortable stay.' },
      },
      {
        title: { zhTW: '入住/退房', ja: 'チェックイン/チェックアウト', en: 'Check-in / Check-out' },
        desc: { zhTW: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，輕鬆方便。', ja: 'チェックイン：15:00以降\nチェックアウト：10:00まで\nセルフチェックインで気軽・スムーズ。', en: 'Check-in: from 3:00 PM\nCheck-out: by 10:00 AM\nSelf check-in for an easy, smooth arrival.' },
      },
    ]),
  },

  // ── 11. kyoto-garden ─────────────────────────────────────────────────────────
  'kyoto-garden': {
    name: ml('京都日式庭園', '京都日本庭園', 'Kyoto Japanese Garden House'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      'JR兩站到京都站・嵐山13分鐘・2LDK 60㎡',
      'JR2駅で京都駅・嵐山13分・2LDK 60㎡',
      '2 Stops to Kyoto Stn by JR · 13 min to Arashiyama · 2LDK 60㎡'
    ),
    introduction: ml(
      '⭐English 中文 日本語 OK⭐位置於京都市和嵐山地區的中間(丹波口)，去市區和嵐山觀光都方便。⭐搭乘嵐山小火車(嵯峨野トロッコ列車)必經的JR路線，JR山陰本線(嵯峨野線)「丹波口」站步行10分鐘。房子是一戶建，從JR山陰本線(嵯峨野線)「丹波口」站步行10分鐘。⭐沿路有連鎖握壽司店スシロー(壽司郎)、Starbucks咖啡店 、日式涮涮鍋連鎖店「かごの屋」 、7-11 、大型書店 TSUTAYA. 「丹波口站」旁邊就是有京都的築地市場之稱的「京都市中央市場」，市場內有食堂，可品嘗道地日本海鮮。⭐第一間房間有一張雙人床(120cmx200cm)與2帖榻榻米空間，若小孩要睡同一房間可鋪床...',
      '⭐英語・中国語・日本語対応⭐京都市街と嵐山の中間（丹波口）に位置し、市内観光も嵐山観光もどちらも便利です。⭐嵯峨野トロッコ列車を利用する際に通るJRルート沿い。JR山陰本線（嵯峨野線）「丹波口」駅から徒歩10分の一戸建てです。⭐道沿いにはスシロー、スターバックス、かごの屋（しゃぶしゃぶチェーン）、7-11、大型書店TUTAYAがあります。「丹波口」駅の隣には「京都市中央卸売市場」（京都の築地市場）があり、食堂で本格的な海鮮料理をお楽しみいただけます。⭐1室目はダブルベッド（120×200cm）と畳2帳のスペースがあり、お子様が同室に寝る場合は布団を敷くことが可能です...',
      '⭐ English / Chinese / Japanese spoken ⭐ Located midway between central Kyoto and the Arashiyama area (Tambaguchi), making sightseeing in both directions a breeze. ⭐ Just a 10-minute walk from Tambaguchi Station on the JR Sagano Line—the very line used to reach the famous Sagano Romantic Train. The property is a standalone house. ⭐ Along the way you will find Sushiro, Starbucks, Kagono-ya (shabu-shabu chain), 7-Eleven, and TSUTAYA bookstore. Next to Tambaguchi Station is the Kyoto Central Wholesale Market, known as the "Tsukiji of Kyoto," where you can enjoy fresh local seafood at the market canteen. ⭐ The first bedroom has a double bed (120×200 cm) plus 2 tatami mats—children can sleep on a futon in the same room...'
    ),
  },

  // ── 12. osaka-nest-806 ───────────────────────────────────────────────────────
  'osaka-nest-806': {
    name: ml('Osaka Nest 大阪之巢', 'Osaka Nest 大阪の巣', 'Osaka Nest'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '道頓堀1分鐘3間客房高級房屋55分鐘路程！ 日本橋30分鐘秒',
      '道頓堀1分・3室・高級物件・日本橋30秒',
      'Dotonbori 1 min · 3 Rooms · Premium Property · Nipponbashi 30 sec'
    ),
    introduction: ml(
      '日本橋大坪數合法民宿67.31 ㎡公寓坐北朝南每房有窗明亮乾淨在房裡聽不見噪雜的聲音床及床墊是無印良品的產品冷暖氣空調裝置是三菱制高級型號牌子其濾網有自動沖洗無印良品所有寢具升級三菱品牌空調具有烘乾功能的Hitachi品牌洗衣機恆溫浴缸和自動馬桶座坐浴盆免費高速WiFi免費攜帶式WiFi徒步圈:日本橋地鐵站/道頓堀1分鐘,黑門市場约2分鐘Kuromon market 2mins 道樂螃蟹约3分鐘Kanidouraku螃蟹餐廳3分心齋橋约鐘5分鐘.心齋橋5分鐘難波，高島屋百货大丸百貨分鐘。7-11便利商店位於物業大樓的樓下。\n由工作人員引導入住或使用密碼鑰匙箱盒自助入住房東會引導房客進入房源。提...',
      '日本橋の広々とした合法登録民泊67.31㎡のアパートメント。南向きで各部屋に窓があり、明るく清潔な空間。室内に騒音が入りにくい静かな環境です。ベッドとマットレスは無印良品製。三菱製高級エアコン（フィルター自動洗浄付き）。全寝具は無印良品。乾燥機能付き日立製洗濯機。追い焚き機能付き浴槽と自動洗浄トイレ（ウォシュレット）。無料高速Wi-Fi＋無料ポータブルWi-Fi完備。徒歩圏内：日本橋地下鉄駅・道頓堀1分、黒門市場約2分、道楽かに約3分、心斎橋約5分、難波・高島屋・大丸百貨店は数分。1階には7-11便利店あり。スタッフによるチェックイン案内またはキーボックスでのセルフチェクインが可能。',
      'A legally registered, spacious 67.31㎡ apartment in Nipponbashi. South-facing with windows in every room—bright, clean, and remarkably quiet. Beds and mattresses are MUJI brand. Premium Mitsubishi air conditioning with auto-clean filters. All bedding is MUJI. Hitachi washing machine with dryer function. Adjustable-temperature bathtub and auto-clean washlet toilet. Free high-speed Wi-Fi plus free portable Wi-Fi. Walking distance: Nipponbashi subway station & Dotonbori 1 min, Kuromon Market approx. 2 min, Kani Doraku crab restaurant approx. 3 min, Shinsaibashi approx. 5 min, Namba, Takashimaya and Daimaru department stores within minutes. 7-Eleven convenience store is in the building lobby. Staff-assisted or self check-in via key box available.'
    ),
  },

  // ── 13. aipei-family-904 ─────────────────────────────────────────────────────
  'aipei-family-904': {
    name: ml('愛彼家庭房', 'アイペイ ファミリールーム', 'Aipei Family Room'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '道頓堀・日本橋精品2LDK家庭房',
      '道頓堀・日本橋プレミアム2LDKファミリールーム',
      'Dotonbori · Nipponbashi Premium 2LDK Family Room'
    ),
    introduction: ml(
      '位於大阪市中心的舒適公寓，步行5分鐘即可抵達熱鬧的道頓堀區，步行3分鐘即可抵達日本橋地鐵站，非常適合輕鬆探索這座城市。位置方便，靠近著名的黑門市場，樓下就有一家便利商店，您所需的一切都近在咫尺。大樓有電梯，公寓配備簡單廚房和基本烹飪用具，讓您在住宿期間享用輕食。其他注意事項《房屋守則》／重要通知房源內和周圍所有街道和巷子嚴禁吸煙。請注意公共區域和深夜時段的噪音水平，以免打擾鄰居。請遵守當地垃圾分類規則。 嚴禁未經許可處理大型垃圾（如行李箱、嬰兒車等）。 任何違規行為都可能會導致額外的處置費用。毛巾政策（日本私人住宿的標準做法）請注意，這是日式私人住宿（不是旅館）。 在您入住期間不提供每日清潔和...',
      '大阪市内中心部の快適なアパートメント。賑やかな道頓堀エリアへ徒歩5分、日本橋地下鉄駅まで徒歩3分と便利な立地で大阪観光に最適。有名な黒門市場にも近く、1階に便利なコンビニがあります。大樓にはエレベーターがあり、シンプルなキッチンと基本的な調理器具を完備。【ハウスルール】建物内および周辺の道路・路地での喫煙は厳禁。夜間や共用部での騒音にご注意ください。地域のゴミ分別ルールに従ってください。無断での大型ゴミ（スーツケース、ベビーカー等）の廃棄は禁止。違反した場合、追加処理費用が発生する場合があります。タオルポリシー（日本の民泊の標準）：こちらは日本式民泊（ホテルではありません）のため、毎日の清掃サービスや...',
      'A comfortable apartment in central Osaka—5 minutes on foot to the vibrant Dotonbori area and 3 minutes walk to Nipponbashi subway station, perfect for exploring the city. Close to the famous Kuromon Market and with a convenience store right in the building. Elevator access; the apartment comes with a simple kitchen and basic cooking utensils. House Rules: Smoking is strictly prohibited inside the property and on all surrounding streets and alleys. Please be mindful of noise levels in common areas and late at night. Follow local waste-sorting rules. Unauthorized disposal of large items (suitcases, strollers, etc.) is prohibited and may incur additional fees. Towel Policy: This is a Japanese private lodging (not a hotel); daily cleaning and towel replacement are not provided...'
    ),
  },

  // ── 14. crystal-riviera-1305 ─────────────────────────────────────────────────
  'crystal-riviera-1305': {
    name: ml('クリスタルエグゼ リヴィエラ', 'クリスタルエグゼ リヴィエラ', 'Crystal Exe Riviera'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '大阪日本橋頂樓豪華度假屋',
      '大阪日本橋最上階プレミアムヴィラ',
      'Osaka Nipponbashi Top-Floor Luxury Villa'
    ),
    introduction: ml(
      '您好！感謝您的詢問和預訂。 我的房子位於公寓的頂樓，景觀非常好。步行★1 分鐘即可抵達日本橋站，步行 8 分鐘即可抵達難波站★ 步行即可抵達黑門市場、道頓堀和心齋橋浴室提供★豪華的碳酸泉水。樓下★有24小時便利商店和餐廳地理位置★極佳，房間乾淨，獨享整套房源（包括浴室和廁所）\n請勿在房間內抽煙。住宿期間，請遵守日本的社區守則。 請勿大聲喧嘩，並妥善處理垃圾。請勿在未經許可的情況下丟棄大型垃圾（如行李箱或嬰兒車）。如果違反此規定，我們將收取處理費。',
      'こんにちは！お問い合わせ・ご予約ありがとうございます。私の部屋はマンションの最上階にあり、眺望が素晴らしい物件です。★日本橋駅まで徒歩1分、難波駅まで徒歩8分★黒門市場・道頓堀・心斎橋にも徒歩でアクセス可能。バスルームには★豪華な炭酸泉★を完備。1階には★24時間営業のコンビニとレストランが入居。★絶好のロケーション、清潔な部屋、浴室・トイレを含む完全プライベート空間をご提供します。\n室内での喫煙は禁止です。滞在中は日本の地域ルールを遵守してください。大声での騒音はご遠慮ください。ゴミは適切に処理してください。無断で大型ゴミ（スーツケースやベビーカーなど）を廃棄することは禁じられています。違反した場合は処理費用を申し受けます。',
      'Hello and thank you for your inquiry! This apartment is on the top floor with spectacular views. ★ 1-minute walk to Nipponbashi Station and 8-minute walk to Namba Station ★ Kuromon Market, Dotonbori, and Shinsaibashi are all within walking distance. The bathroom features ★ luxurious carbonated spa water ★. A 24-hour convenience store and restaurants are located on the ground floor. ★ Prime location, immaculate rooms, and the entire unit—including bathroom and toilet—is exclusively yours.\nNo smoking indoors. Please follow Japanese community guidelines during your stay. Keep noise levels down and dispose of rubbish properly. Unauthorized disposal of large items (suitcases, strollers, etc.) is not permitted and will incur a handling fee.'
    ),
  },

  // ── 15. daidodo ──────────────────────────────────────────────────────────────
  daidodo: {
    name: ml('DAIDODO', 'DAIDODO', 'DAIDODO'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '位於Karahori商店區的Daidodo獨立房屋',
      '空堀商店街エリアのDAIDODO一軒家',
      'DAIDODO Standalone House in the Karahori Shopping District'
    ),
    introduction: ml(
      '這間舒適、優雅的日式房屋位於寧靜而充滿活力的黑堀商店街區，距離谷町六丁目站僅幾分鐘路程，讓您體驗大阪的魅力。這間整潔安靜的度假屋以簡單、經典和舒適的元素精心裝飾，完美平衡了舒適與時尚。這是尋找靈感的創意和文化愛好者的理想選擇，是城市文化脈動中心的寧靜天堂。\n未經事先同意，不得進行商業拍攝。 如果您是YouTuber、網紅或有拍攝需求的創作者，請提前與我們聯絡討論安排。住宿期間，請遵守社區規定，避免發出過度的噪音。請根據當地法規分類和處理垃圾。這是一棟嚴禁吸煙的建築物。 室內、室外和周圍道路上禁止抽煙。 感謝你的配合。請勿在未經許可的情況下丟棄大型垃圾（如行李箱或嬰兒車）。如果違反此規定，我們將...',
      'この快適でエレガントな日本家屋は、活気ある空堀商店街に位置し、谷町六丁目駅からほんの数分の好立地で大阪の魅力を満喫できます。シンプル・クラシック・快適をテーマに丁寧に設えた清潔で静かなバケーションレンタル。コンフォートとスタイルの絶妙なバランスが魅力です。インスピレーションを求めるクリエイターや文化愛好家にとって、都市の文化的鼓動の中心にある静かな隠れ家です。\n事前の同意なしに商業撮影を行うことは禁止されています。YouTuber・インフルエンサー・撮影目的のクリエイターの方は事前にご相談ください。滞在中は地域のルールを守り、過度な騒音はお控えください。地元の法規に従いゴミを分別・処理してください。建物内での喫煙は一切禁止です（室内・室外・周辺道路を含む）。ご協力ありがとうございます。無断での大型ゴミ廃棄は禁止されており、違反した場合は処理費用を申し受けます。',
      'A comfortable and refined Japanese-style house nestled in the lively Karahori Shopping District, just minutes from Tanimachi-6-chome Station—ideal for experiencing the authentic charm of Osaka. This serene, well-curated vacation rental is decorated with simple, classic, and cozy elements that strike a perfect balance between comfort and style. A tranquil sanctuary at the heart of urban culture—the ideal choice for creative minds and culture enthusiasts.\nCommercial filming without prior consent is not permitted. YouTubers, influencers, and content creators with filming needs should contact us in advance. Please observe community rules and keep noise to a minimum during your stay. Sort and dispose of rubbish according to local regulations. Smoking is strictly prohibited throughout the building—including indoors, outdoors, and on surrounding streets. Unauthorized disposal of large items (suitcases, strollers, etc.) is not permitted and will incur a handling fee.'
    ),
  },

  // ── 16. house-daifuku ────────────────────────────────────────────────────────
  'house-daifuku': {
    name: ml('ハウス大福', 'ハウス大福', 'House Daifuku'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '弁天駅1分 駐車場有り 波除一軒家',
      '弁天駅1分・駐車場あり・波除一軒家',
      'Bentencho Stn 1 min · Parking Available · Nanokenarida House'
    ),
    introduction: ml(
      '徒歩1分 ★ 弁天駅北口！免費停車位！大阪弁天町溫馨日式房屋歡迎來到我們位於大阪弁天町的溫馨2層日式住宅！步行約1-2分鐘即可抵達弁天町站，是大阪觀光的絕佳基地。空中花園溫泉（ Sky Garden Onsen ）步行4分★鐘即可抵達最好的溫泉！特色：寬敞的公共空間：一樓有舒適的客廳、設備齊全的廚房、現代化的淋浴間和獨立廁所。傳統臥室：二樓有2間榻榻米臥室，您可以體驗日本傳統生活。便利設施：二樓有洗衣機。停車：一樓有一個私人車庫，面積有限，僅供輕型車輛（ Kcar ）停車。您會發現以下內容將傳統日式設計與現代設施融為一體的舒適空間。位於安靜安全的住宅區，公共交通便利。可輕鬆前往大阪的主要旅遊目...',
      '★弁天駅北口から徒歩1分！無料駐車場あり！大阪弁天町の温かみある2階建て日本家屋へようこそ！弁天町駅まで徒歩1〜2分の好立地で、大阪観光の絶好の拠点です。スカイガーデン温泉まで徒歩わずか4分★大阪最高の温泉も近い！特徴：広い共有スペース：1階には快適なリビング、設備の整ったキッチン、モダンなシャワールーム、独立したトイレ。伝統的な寝室：2階には畳の寝室が2部屋あり、日本の伝統的な暮らしを体験できます。便利な設備：2階に洗濯機あり。駐車：1階に専用ガレージあり（スペース限定、軽自動車専用）。伝統的な和風デザインと現代的な設備が融合した快適空間。静かで安全な住宅街に位置し、公共交通機関も便利。大阪の主要観光スポットへも楽々アクセスできます。',
      '★ Just 1 min walk from Bentencho Station North Exit! Free parking included! Welcome to our cozy two-storey Japanese-style home in Bentencho, Osaka—a superb base for sightseeing, only 1–2 minutes on foot from the station. Sky Garden Onsen is a mere ★ 4-minute walk away! Features: Spacious shared areas: 1F has a comfortable living room, fully equipped kitchen, modern shower room, and separate toilet. Traditional bedrooms: 2F has 2 tatami bedrooms for an authentic Japanese living experience. Washing machine on the 2nd floor. Parking: private garage on 1F (limited space, K-cars only). A harmonious blend of traditional Japanese design and modern conveniences, located in a quiet and safe residential area with easy public transport access to all major Osaka attractions.'
    ),
  },

  // ── 17. misaki-house ─────────────────────────────────────────────────────────
  'misaki-house': {
    name: ml('三先の家', '三先の家', 'Misaki House'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '朝潮橋步行5分鐘・超市藥局1分鐘・生活便利',
      '朝潮橋徒歩5分・スーパー・薬局1分・生活便利',
      'Asashiobashi 5 min walk · Supermarket & Pharmacy 1 min · Daily Convenience'
    ),
    introduction: ml(
      '這棟獨立的兩層樓房屋位於大阪地鐵朝潮橋站附近，步行5分鐘即可抵達車站。適合短期住宿和長期住宿。藥店、超市和100日元商店就在對面，讓日常購物變得輕鬆方便。溫馨舒適的起居空間提供輕鬆的氛圍，讓您在大阪的住宿更加愉快。客人使用權限房客在住宿期間可以獨享整套房源，不會與他人共用空間。其他注意事項《房屋守則》／重要通知房源內和周圍所有街道和巷子嚴禁吸煙。請注意公共區域和深夜時段的噪音水平，以免打擾鄰居。請遵守當地垃圾分類規則。 嚴禁未經許可處理大型垃圾（如行李箱、嬰兒車等）。 任何違規行為都可能會導致額外的處置費用。毛巾政策（日本私人住宿的標準做法）請注意，這是日式私人住宿（不是旅館）。 在您入住期間...',
      'この2階建ての独立した一軒家は大阪市営地下鉄朝潮橋駅から徒歩5分の立地。短期・長期滞在どちらにも対応しています。向かいには薬局・スーパー・100円ショップがあり、日常の買い物が大変便利です。温かみのある居住空間がくつろいだ雰囲気を生み出し、大阪での滞在をより快適にしてくれます。滞在中は他のゲストと共用せず、物件全体を貸切でご利用いただけます。【ハウスルール】建物内および周辺道路での喫煙は厳禁。夜間や共用部での騒音にご注意ください。地域のゴミ分別ルールに従ってください。無断での大型ゴミ廃棄（スーツケース・ベビーカー等）は禁止。違反した場合は追加費用が発生します。タオルポリシー（日本の民泊標準）：こちらは日本式民泊（ホテルではありません）のため、毎日の清掃サービスや...',
      'A standalone two-storey house just a 5-minute walk from Asashiobashi Station on the Osaka Municipal Subway. Suitable for both short and long stays. A pharmacy, supermarket, and 100-yen shop are right across the street, making daily errands effortless. The warm and comfortable living areas create a relaxed atmosphere that makes your Osaka stay truly enjoyable. Guests have exclusive use of the entire property with no shared spaces. House Rules: Smoking is strictly prohibited inside and on all surrounding streets. Please be considerate of noise in common areas and at night. Follow local waste-sorting rules. Unauthorized disposal of large items (suitcases, strollers, etc.) is prohibited and may incur extra fees. Towel Policy: This is a Japanese-style private lodging (not a hotel); daily cleaning and towel replacement are not provided...'
    ),
  },

  // ── 18. hikari-miyakojima ────────────────────────────────────────────────────
  'hikari-miyakojima': {
    name: ml('光', '光', 'Hikari'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '大阪都島玻璃設計屋Osaka Designer House',
      '大阪都島ガラスデザイナーズハウス',
      'Osaka Miyakojima Glass Designer House'
    ),
    introduction: ml(
      '步行🌟8 分鐘即可抵達宮古島都島站 | 帶電梯的房源 | 最多可入住 7 位房客 🌟歡迎來到您在大阪的家一樣！這間寬敞、獨特設計的3層樓房屋非常適合家庭或一群好友入住。 步行8分鐘即可抵達谷町地鐵線上的宮古島站，您可以輕鬆前往東梅田和其他主要目的地。無論您是探索大阪還是與親人一起放鬆，這裡都是您住宿的完美基地。我們非常期待您的到來！\n房源內和周圍所有街道和巷子嚴禁吸煙。請注意公共區域和深夜時段的噪音水平，以免打擾鄰居。請遵守當地垃圾分類規則。 嚴禁未經許可處理大型垃圾（如行李箱、嬰兒車等）。 任何違規行為都可能會導致額外的處置費用。毛巾政策（日本私人住宿的標準做法）請注意，這是日式私人住宿...',
      '🌟都島駅まで徒歩8分 | エレベーター付き | 最大7名宿泊可能 🌟大阪でのご滞在へようこそ！この広々としたユニークデザインの3階建て一軒家は、ご家族やグループ旅行に最適です。谷町線の都島駅まで徒歩8分で、東梅田その他主要エリアへも楽々アクセス。大阪観光にも、大切な人とゆっくり過ごすにも、理想的な拠点です。皆様のお越しを心よりお待ちしております！\n建物内および周辺道路での喫煙は厳禁。夜間や共用部での騒音にご注意ください。地域のゴミ分別ルールに従ってください。無断での大型ゴミ廃棄（スーツケース・ベビーカー等）は禁止。違反した場合は追加費用が発生します。タオルポリシー：こちらは日本式民泊（ホテルではありません）のため...',
      '🌟 8-minute walk to Miyakojima Station | Elevator included | Up to 7 guests 🌟 Welcome to your home in Osaka! This spacious, uniquely designed 3-storey house is ideal for families or groups of friends. Just an 8-minute walk to Miyakojima Station on the Tanimachi Line, giving you easy access to Higashi-Umeda and all major destinations. Whether you are exploring Osaka or relaxing with loved ones, this is the perfect base. We look forward to welcoming you!\nSmoking is strictly prohibited inside the property and on all surrounding streets and alleys. Please be mindful of noise in common areas and at night. Follow local waste-sorting rules. Unauthorized disposal of large items (suitcases, strollers, etc.) is prohibited and may incur extra fees. Towel Policy: This is a Japanese-style private lodging (not a hotel)...'
    ),
  },

  // ── 19. tenpou-2f-tenwa ──────────────────────────────────────────────────────
  'tenpou-2f-tenwa': {
    name: ml('天蓬の宿', '天蓬の宿', 'Tenpou no Yado'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '[2樓 天和榻榻米]中央心齋橋豪華房源',
      '[2F 天和・和室]心斎橋中心プレミアム物件',
      '[2F Tenwa Tatami] Premium Shinsaibashi Central'
    ),
    introduction: ml(
      'Located in the heart of Shinsaibashi, this cozy studio offers unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, and you\'ll find plenty of drugstores, restaurants, and cafés...',
      '心斎橋の中心に位置するこの居心地の良いスタジオは、抜群のアクセスを誇ります。大丸百貨店、PARCO、地下鉄駅はすべて徒歩3分。ビルの目の前には1分以内でコンビニがあり、薬局、レストラン、カフェも豊富に揃っています。',
      'Located in the heart of Shinsaibashi, this cozy studio offers unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, and you\'ll find plenty of drugstores, restaurants, and cafés nearby.'
    ),
  },

  // ── 20. tenpou-2f-tenyo ──────────────────────────────────────────────────────
  'tenpou-2f-tenyo': {
    name: ml('天蓬の宿', '天蓬の宿', 'Tenpou no Yado'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '[2樓 天洋 Western]中央心齋橋豪華房源',
      '[2F 天洋・洋室]心斎橋中心プレミアム物件',
      '[2F Tenyo Western] Premium Shinsaibashi Central'
    ),
    introduction: ml(
      '這間舒適的單間公寓位於心齋橋的中心，提供無與倫比的便利。 步行3分鐘即可抵達大丸百貨、PARCO和地鐵站。 步行不到一分鐘即可抵達大樓，周圍有許多藥店、餐廳和咖啡館。請注意，大樓內沒有電梯。',
      'この快適なスタジオは心斎橋の中心部に位置し、抜群の利便性を誇ります。大丸百貨店、PARCO、地下鉄駅まで徒歩3分。ビル前にコンビニが1分以内にあり、薬局、レストラン、カフェも充実しています。なお、ビル内にエレベーターはありません。',
      'This cozy studio apartment is located in the heart of Shinsaibashi, offering unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, surrounded by plenty of drugstores, restaurants, and cafés. Please note there is no elevator in the building.'
    ),
  },

  // ── 21. tenpou-3f-houwa ──────────────────────────────────────────────────────
  'tenpou-3f-houwa': {
    name: ml('天蓬の宿', '天蓬の宿', 'Tenpou no Yado'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '[3樓 蓬和榻榻米]中央心齋橋豪華房源',
      '[3F 蓬和・和室]心斎橋中心プレミアム物件',
      '[3F Houwa Tatami] Premium Shinsaibashi Central'
    ),
    introduction: ml(
      'Located in the heart of Shinsaibashi, this cozy studio offers unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, and you\'ll find plenty of drugstores, restaurants, and cafés...',
      '心斎橋の中心に位置するこの居心地の良いスタジオは、抜群のアクセスを誇ります。大丸百貨店、PARCO、地下鉄駅はすべて徒歩3分。ビル前には1分以内でコンビニがあり、薬局、レストラン、カフェも充実しています。',
      'Located in the heart of Shinsaibashi, this cozy studio offers unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, with plenty of drugstores, restaurants, and cafés nearby.'
    ),
  },

  // ── 22. tenpou-3f-houyo ──────────────────────────────────────────────────────
  'tenpou-3f-houyo': {
    name: ml('天蓬の宿', '天蓬の宿', 'Tenpou no Yado'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '[3樓 蓬洋西式]中央心齋橋豪華房源',
      '[3F 蓬洋・洋室]心斎橋中心プレミアム物件',
      '[3F Houyo Western] Premium Shinsaibashi Central'
    ),
    introduction: ml(
      '這間舒適的單間公寓位於心齋橋的中心，提供無與倫比的便利。 步行3分鐘即可抵達大丸百貨、PARCO和地鐵站。 步行不到一分鐘即可抵達大樓，周圍有許多藥店、餐廳和咖啡館。我們有5間房間。請告訴我們您偏好的類型和房客人數。 我們可以容納1–18位房客。請注意，大樓內沒有電梯。',
      'この快適なスタジオは心斎橋の中心部に位置し、抜群の利便性を誇ります。大丸百貨店、PARCO、地下鉄駅まで徒歩3分。ビル前には1分以内でコンビニがあり、薬局、レストラン、カフェも充実しています。客室は全5室。ご希望のタイプとご人数をお知らせください。1〜18名様まで対応可能です。なお、ビル内にエレベーターはありません。',
      'This cozy studio apartment is in the heart of Shinsaibashi, offering unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, with plenty of drugstores, restaurants, and cafés nearby. We have 5 rooms in total—let us know your preferred room type and number of guests. We can accommodate 1–18 guests. Please note there is no elevator in the building.'
    ),
  },

  // ── 23. tenpou-4f-saijo ──────────────────────────────────────────────────────
  'tenpou-4f-saijo': {
    name: ml('天蓬の宿', '天蓬の宿', 'Tenpou no Yado'),
    shortDesc: ml('', '', ''),
    badge: ml('', '', ''),
    secondaryBadge: ml('', '', ''),
    transportInfo: ml(
      '[4F 最上的天蓬]中央心齋橋豪華房源',
      '[4F 最上階・天蓬]心斎橋中心プレミアム物件',
      '[4F Top Floor · Saijo] Premium Shinsaibashi Central'
    ),
    introduction: ml(
      'Located in the heart of Shinsaibashi, this cozy studio offers unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, and you\'ll find plenty of drugstores, restaurants, and cafés...',
      '心斎橋の中心に位置するこのスタジオは、最上階ならではの開放感と抜群のアクセスを誇ります。大丸百貨店、PARCO、地下鉄駅まで徒歩3分。ビル前には1分以内でコンビニがあり、薬局、レストラン、カフェも充実しています。',
      'Located in the heart of Shinsaibashi on the top floor, this cozy studio offers a bright, open atmosphere and unbeatable convenience. Daimaru Department Store, PARCO, and the subway station are all just a 3-minute walk away. A convenience store is less than one minute from the building, with plenty of drugstores, restaurants, and cafés nearby.'
    ),
  },
};

// ─── APPLY TRANSLATIONS ────────────────────────────────────────────────────────

const TRANSLATABLE_SIMPLE = [
  'name', 'shortDesc', 'badge', 'secondaryBadge',
  'transportInfo', 'transportDetail', 'introduction',
];
const TRANSLATABLE_JSON = ['quickInfo', 'spaceIntro'];

const updateStmt = db.prepare(
  'UPDATE properties SET ' +
  TRANSLATABLE_SIMPLE.map(f => `${f} = @${f}`).join(', ') + ', ' +
  TRANSLATABLE_JSON.map(f => `${f} = @${f}`).join(', ') +
  ', updatedAt = datetime(\'now\') WHERE id = @id'
);

let updated = 0, skipped = 0;

for (const [id, fields] of Object.entries(translations)) {
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
  if (!prop) {
    console.log(`[SKIP] ${id} not found in DB`);
    skipped++;
    continue;
  }

  // Check if already multilingual by inspecting the name field
  if (isAlreadyMultilingual(prop.name)) {
    console.log(`[SKIP] ${id} already multilingual`);
    skipped++;
    continue;
  }

  const params = { id };

  for (const field of TRANSLATABLE_SIMPLE) {
    params[field] = fields[field] !== undefined ? fields[field] : prop[field];
  }
  for (const field of TRANSLATABLE_JSON) {
    params[field] = fields[field] !== undefined ? fields[field] : prop[field];
  }

  updateStmt.run(params);
  console.log(`[OK] Updated: ${id}`);
  updated++;
}

db.close();
console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
