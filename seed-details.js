const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'osaka-minshuku.db'));

const details = {
  'yomogi': {
    introduction: '2025年全新開幕！艾屋吉屋よもぎの屋位於大阪大正區，是一間設備完善的全新包棟民宿。距離大正車站僅需步行4分鐘，前往心齋橋只需3站，交通極為便利。\n\n房源配備3間廁所、2間浴室，非常適合多人家庭或團體旅遊入住。大正區被稱為「大阪的小沖繩」，擁有獨特的下町風情和多元文化氛圍。\n\n全新裝潢、現代化設備，讓您在旅途中享受舒適如家的住宿體驗。',
    videoUrl: 'https://www.youtube.com/watch?v=temwZi8W8fk',
    quickInfo: [
      { title: '房源特色', value: '2025年新屋', desc: '全新裝潢設備' },
      { title: '房源類型', value: '整套房源', desc: '包棟民宿' }
    ],
    spaceIntro: [
      { title: '衛浴設備', desc: '配備3間獨立廁所和2間浴室，多人入住也不需要排隊等候，提供舒適便利的生活體驗。' },
      { title: '適合家庭', desc: '寬敞的空間設計，非常適合大家庭旅遊或多人團體入住，享受一起出遊的樂趣。' },
      { title: '交通便利', desc: '距離大正車站步行僅需4分鐘，前往心齋橋只需3站，輕鬆抵達大阪各大景點。' },
      { title: '入住/退房', desc: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，密碼鎖方便安全。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','自助入住','煙霧警報器','適合家庭','全新設備'],
    nearestStation: 'JR / 大阪地下鐵 大正站',
    transportDetail: '大正站 步行4分鐘\n心齋橋站 3站（約8分鐘）\n難波站 約10分鐘\n天王寺站 約15分鐘\n關西機場 約50分鐘',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.5!2d135.4875!3d34.6589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e7c3d3b3b3b3%3A0x0!2zMzTCsDM5JzMyLjAiTiAxMzXCsDI5JzE1LjAiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1543539317236403832',
    checkIn: '下午3點以後', checkOut: '上午10點之前'
  },
  'juichimei': {
    introduction: '十一鳴位於大阪大正區的寧靜住宅區，是一間溫馨舒適的包棟民宿。這裡遠離城市的喧囂，卻又保持著便利的交通連結。\n\n大正區被稱為「大阪的小沖繩」，擁有獨特的多元文化氛圍和下町風情。在這裡入住，您可以體驗最道地的大阪生活。\n\n整套房源提供私密舒適的住宿環境，非常適合家庭旅遊或朋友結伴出遊。',
    videoUrl: '',
    quickInfo: [
      { title: '位置特色', value: '寧靜住宅區', desc: '遠離喧囂' },
      { title: '房源類型', value: '整套房源', desc: '包棟民宿' }
    ],
    spaceIntro: [
      { title: '舒適環境', desc: '整套房源提供舒適的住宿環境，讓您在旅途中也能享受如家般的放鬆感受。' },
      { title: '適合家庭', desc: '寬敞的空間設計，非常適合家庭旅遊或朋友結伴出遊，享受一起出行的美好時光。' },
      { title: '寧靜環境', desc: '位於寧靜的住宅區，遠離城市喧囂，讓您享受平靜放鬆的休息時光。' },
      { title: '入住/退房', desc: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，方便快捷。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','自助入住'],
    nearestStation: 'JR / 大阪地下鐵 大正站',
    transportDetail: '大正站 步行約10分鐘\n心齋橋站 約12分鐘\n難波站 約15分鐘\n天王寺站 約18分鐘\n關西機場 約55分鐘',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.5!2d135.4875!3d34.6589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e7c3d3b3b3b3%3A0x0!2zMzTCsDM5JzMyLjAiTiAxMzXCsDI5JzE1LjAiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1372891258852120566',
    checkIn: '下午3點以後', checkOut: '上午10點之前'
  },
  'bunkaen': {
    introduction: '文華苑位於大阪大正區的中心位置，是一間溫馨舒適的 Guest House。這裡提供賓至如歸的住宿體驗，讓您在旅途中感受到家的溫暖。\n\n大正區擁有獨特的多元文化氛圍，被稱為「大阪的小沖繩」。在這裡，您可以體驗到與眾不同的下町風情，感受最道地的大阪生活。\n\n交通便利，周邊生活機能完善，是探索大阪的理想住宿選擇。',
    videoUrl: '',
    quickInfo: [
      { title: '房源特色', value: 'Guest House', desc: '溫馨民宿體驗' },
      { title: '位置優勢', value: '大正區中心', desc: '交通便利' }
    ],
    spaceIntro: [
      { title: 'Guest House 體驗', desc: '文華苑提供溫馨的 Guest House 住宿體驗，讓您在旅途中感受到賓至如歸的溫暖。' },
      { title: '優越位置', desc: '位於大正區中心，交通便利，周邊生活機能完善，是探索大阪的理想起點。' },
      { title: '大正風情', desc: '大正區被稱為「大阪的小沖繩」，擁有獨特的多元文化氛圍和下町風情。' },
      { title: '入住/退房', desc: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，輕鬆便捷。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','自助入住'],
    nearestStation: 'JR / 大阪地下鐵 大正站',
    transportDetail: '大正站 步行數分鐘\n心齋橋站 約10分鐘\n難波站 約12分鐘\n天王寺站 約15分鐘\n關西機場 約50分鐘',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.5!2d135.4875!3d34.6589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e7c3d3b3b3b3%3A0x0!2zMzTCsDM5JzMyLjAiTiAxMzXCsDI5JzE1LjAiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1278927863693438873',
    checkIn: '下午3點以後', checkOut: '上午10點之前'
  },
  'nk-homes-namba': {
    introduction: '位於大阪心齋橋的合法住宿公寓，座落於熱鬧的道頓堀商圈，距離大阪地鐵難波站步行僅5-6分鐘。\n\n44.65㎡的2DK公寓，配備電梯，臥室設有二張半單人床，客廳另有沙發床，最多可容納5人入住。\n\n地理位置絕佳，步行可達心齋橋商店街、道頓堀、黑門市場等熱門景點，非常適合購物與美食愛好者。',
    videoUrl: 'https://youtube.com/shorts/FWcwrYFd88w',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '2DK 公寓' }
    ],
    spaceIntro: [
      { title: '可以住宿的人數', desc: '最多5人可以住，臥室配有二張半單人床，客廳另有沙發床，第4、5位房客可使用日式床墊。' },
      { title: '廚房設備', desc: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。' },
      { title: 'Wi-Fi 網路', desc: '入住期間可以免費使用Wi-Fi。如果您不知道連接的方法，請通過平台提供的聯繫方式發短信問我們。' },
      { title: '入住/退房', desc: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','電梯','自助入住','合法執照','市中心位置'],
    nearestStation: '難波站（步行5-6分鐘）',
    transportDetail: '道頓堀（步行1分鐘）\n心齋橋商店街（步行3分鐘）\n黑門市場（步行10分鐘）\n日本橋電器街（步行8分鐘）',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.5009!3d34.6687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e71a9f8fe21f%3A0x3bdb2a7dd2d2!2z6YGT6aCV5aCC!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/28440628',
    checkIn: '下午4點以後', checkOut: '上午10點之前'
  },
  'shinsaibashi-family': {
    introduction: '位於大阪心齋橋市中心的2LDK家庭公寓，步行2分鐘即可抵達著名的道頓堀商圈。\n\n52㎡的寬敞空間包含兩間獨立臥室，一間配有三張單人床，另一間為日式床鋪，非常適合家庭入住。住宿期間為完全私人空間。\n\n配備攜帶式WiFi，讓您外出也能隨時上網。地理位置絕佳，購物、美食、觀光一應俱全。',
    videoUrl: '',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '2LDK 公寓' }
    ],
    spaceIntro: [
      { title: '可以住宿的人數', desc: '最多4人可以住，兩間獨立臥室設計，一間配有三張單人床，另一間為日式床鋪，非常適合家庭入住。' },
      { title: '廚房設備', desc: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。' },
      { title: 'Wi-Fi 網路', desc: '配備攜帶式WiFi，住宿期間可隨身攜帶，外出觀光也能隨時上網使用。' },
      { title: '入住/退房', desc: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。' }
    ],
    amenities: ['攜帶式WiFi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','電梯','自助入住','適合家庭','市中心位置'],
    nearestStation: '難波站（步行5-6分鐘）',
    transportDetail: '道頓堀（步行2分鐘）\n心齋橋商店街（步行3分鐘）\n黑門市場（步行10分鐘）\n日本橋電器街（步行8分鐘）',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.5009!3d34.6687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e71a9f8fe21f%3A0x3bdb2a7dd2d2!2z6YGT6aCV5aCC!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/13808333',
    checkIn: '下午4點以後', checkOut: '上午10點之前'
  },
  'nomad-inn': {
    introduction: '這是一棟靜謐日式住宅，位於大阪市中央區谷町六丁目，鄰近懷舊的空堀商店街。\n\n步行2分鐘即可抵達最近的地鐵站，交通十分便利。兩層樓的日式房屋，兼具日式生活方式與現代化設施。\n\n最多可容納5人入住，非常適合家庭旅遊、朋友出遊或小團體。位於安靜的日式住宅區，特別適合放鬆度假。',
    videoUrl: '',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '獨棟房屋' }
    ],
    spaceIntro: [
      { title: '可以住宿的人數', desc: '最多5人可以住，兩層樓日式房屋設計，提供舒適的空間，適合家庭、朋友或小團體入住。' },
      { title: '廚房設備', desc: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。' },
      { title: 'Wi-Fi 網路', desc: '入住期間可以免費使用Wi-Fi。如果您不知道連接的方法，請通過平台提供的聯繫方式發短信問我們。' },
      { title: '入住/退房', desc: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','露台/陽台','可長期住宿','自助入住','煙霧警報器'],
    nearestStation: '谷町六丁目站（步行2分鐘）',
    transportDetail: '空堀商店街（步行5分鐘）\n難波站（約10分鐘）\n心齋橋（約12分鐘）\n大阪城（約15分鐘）',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.4764!3d34.6839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDQxJzAyLjAiTiAxMzXCsDI4JzM1LjAiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1326417920271287072',
    checkIn: '下午4點以後', checkOut: '上午10點之前'
  },
  'geisha': {
    introduction: '歡迎來到芸舎！這是一棟位於大阪住之江區的舒適2層木屋，整棟房源供您獨享，並附有私人車庫，非常適合自駕旅客。\n\n房源鄰近南海住之江站，交通便利。獨棟房源提供完整的隱私空間，讓您感受居家般的放鬆體驗。\n\n最多可容納3人入住，非常適合情侶或小團體。房屋配備現代化設施，讓您在大阪之旅中享有舒適的住宿體驗。',
    videoUrl: '',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '獨棟木屋・附車庫' }
    ],
    spaceIntro: [
      { title: '舒適木屋空間', desc: '整棟2層木屋供您獨享，最多可容納3人入住。附有私人車庫，適合情侶或小團體自駕旅遊。' },
      { title: '完整廚房設備', desc: '配備完整廚房設施，包含電磁爐、微波爐、冰箱、電熱水壺及基本炊具餐具，方便您自行烹飪。' },
      { title: '免費 Wi-Fi', desc: '提供高速無線網路，讓您在入住期間隨時保持連線，方便工作與休閒使用。' },
      { title: '入住/退房', desc: '入住時間：下午3點以後\n退房時間：上午11點之前\n自助入住，方便彈性。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','自助入住','煙霧警報器','基本沐浴用品','床單毛巾'],
    nearestStation: '南海電鐵 住之江站 / 大阪Metro 四橋線 住之江公園站',
    transportDetail: '難波 地鐵約15分鐘\n心斋桥 地鐵約20分鐘\n住之江公園 步行約10分鐘\n關西機場 約45分鐘',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.5194!3d34.6729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDQwJzIyLjQiTiAxMzXCsDMxJzA5LjgiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1462715957355003327',
    checkIn: '下午3點以後', checkOut: '上午11點之前'
  },
  'sakuragawa-nishikujo': {
    introduction: '這是一間位於大阪知名旅遊區的寬敞住宅，距離西九條站步行僅5分鐘，前往USJ環球影城車程只需5分鐘。\n\n58㎡的空間最多可容納8人入住，非常適合家庭旅遊、朋友出遊或前往環球影城的團體。\n\n周邊便利店、超市、居酒屋一應俱全，適合長期住宿。距離關西機場約50分鐘車程，交通十分便利。',
    videoUrl: '',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '獨棟房屋' }
    ],
    spaceIntro: [
      { title: '可以住宿的人數', desc: '最多8人可以住，58㎡寬敞空間，非常適合家庭、朋友或前往環球影城的團體入住。' },
      { title: '廚房設備', desc: '基本炊具和餐具、電磁炉、微波爐、冰箱、電熱水壺，幾乎所有日常生活必需品都準備好了。' },
      { title: 'Wi-Fi 網路', desc: '入住期間可以免費使用Wi-Fi。如果您不知道連接的方法，請通過平台提供的聯繫方式發短信問我們。' },
      { title: '入住/退房', desc: '入住時間：下午4點以後\n退房時間：上午10點之前\n自助入住，基本上前台都沒人在。' }
    ],
    amenities: ['Wi-Fi','電視','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','可長期住宿','自助入住','煙霧警報器','近環球影城'],
    nearestStation: '西九條站（步行5分鐘）',
    transportDetail: 'USJ環球影城（車程5分鐘）\n大阪站（約4分鐘）\n難波站（約13分鐘）\n心齋橋站（約15分鐘）',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.4764!3d34.6839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e6c5eead6e43%3A0x8c3e1c5f9c3d1f0!2z6KW_5Lmd5p2h!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/42631189',
    checkIn: '下午4點以後', checkOut: '上午10點之前'
  },
  'taixiang-2f': {
    introduction: '台香 2F 是一間位於大阪福島區鷺洲的舒適榻榻米住宿，步行5分鐘即可抵達千日前地鐵線上的野田阪神站，交通非常便利。\n\n房源位於2樓，提供傳統日式榻榻米房間，讓您體驗道地的日本住宿文化。非常適合觀光、商務差旅或在大阪放鬆入住。\n\n整套房源供您獨享，最多可容納3人入住。配備完整的生活設施，讓您有賓至如歸的感覺。',
    videoUrl: '',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '榻榻米・2樓' }
    ],
    spaceIntro: [
      { title: '榻榻米房間', desc: '傳統日式榻榻米住宿體驗，舒適的日式空間讓您感受道地的日本文化。' },
      { title: '舒適空間', desc: '最多可容納3人入住，整套房源供您獨享，適合小家庭、情侶或商務旅客。' },
      { title: '完整設備', desc: '配備完整廚房、Wi-Fi、洗衣機、空調等設備，讓您的住宿體驗舒適便利。' },
      { title: '入住/退房', desc: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，輕鬆方便。' }
    ],
    amenities: ['交通便利','Wi-Fi','廚房','洗衣機','空調設備','吹風機','冰箱','微波爐','基本沐浴用品','煙霧警報器'],
    nearestStation: '千日前線 野田阪神站（步行5分鐘）',
    transportDetail: '難波 地鐵約10分鐘\n梅田 地鐵約10分鐘\n心斋桥 地鐵約15分鐘\n關西機場 約50分鐘',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.0!2d135.4850!3d34.6100!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzM2LjAiTiAxMzXCsDI5JzA2LjAiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1462702559380319721',
    checkIn: '下午3點以後', checkOut: '上午10點之前'
  },
  'taixiang-3f': {
    introduction: '台香 3F 是一間位於大阪福島區鷺洲的都市度假屋，步行5分鐘即可抵達千日前地鐵線上的野田阪神站，交通非常便利。\n\n房源位於3樓，配備舒適的雙人床，周邊便利商店和藥店眾多，生活機能完善，適合度假、出差或情侶旅行。\n\n最多可容納2人入住，整套房源供您獨享，讓您在大阪之旅中享有舒適私密的住宿體驗。',
    videoUrl: '',
    quickInfo: [
      { title: '房東', value: 'Max', desc: '10 年待客經驗' },
      { title: '房源類型', value: '整套房源', desc: '都市度假屋・3樓' }
    ],
    spaceIntro: [
      { title: '交通便利', desc: '步行5分鐘即可抵達野田阪神站，前往難波、梅田等主要區域都非常便利。' },
      { title: '溫馨空間', desc: '最多可容納2人入住，配備舒適雙人床。整套房源供您獨享，適合情侶或商務旅客。' },
      { title: '基本設備', desc: '配備 Wi-Fi、空調、基本廚房設備及生活必需品，讓您的住宿體驗舒適便利。' },
      { title: '入住/退房', desc: '入住時間：下午3點以後\n退房時間：上午10點之前\n自助入住，輕鬆方便。' }
    ],
    amenities: ['交通便利','Wi-Fi','空調設備','簡易廚房','吹風機','冰箱','自助入住','基本沐浴用品','日式被褥','煙霧警報器'],
    nearestStation: '千日前線 野田阪神站（步行5分鐘）',
    transportDetail: '難波 地鐵約10分鐘\n梅田 地鐵約10分鐘\n心斋桥 地鐵約15分鐘\n關西機場 約50分鐘',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0!2d135.4750!3d34.6920!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDQxJzMxLjIiTiAxMzXCsDI4JzMwLjAiRQ!5e0!3m2!1szh-TW!2sjp!4v1700000000000!5m2!1szh-TW!2sjp',
    airbnbUrl: 'https://www.airbnb.com.tw/rooms/1462711404983544336',
    checkIn: '下午3點以後', checkOut: '上午10點之前'
  }
};

const stmt = db.prepare(`UPDATE properties SET
  introduction=?, videoUrl=?, quickInfo=?, spaceIntro=?, amenities=?,
  nearestStation=?, transportDetail=?, mapEmbedUrl=?, airbnbUrl=?,
  checkIn=?, checkOut=?, updatedAt=datetime('now','localtime')
  WHERE id=?`);

const update = db.transaction(() => {
  for (const [id, d] of Object.entries(details)) {
    stmt.run(
      d.introduction, d.videoUrl,
      JSON.stringify(d.quickInfo), JSON.stringify(d.spaceIntro), JSON.stringify(d.amenities),
      d.nearestStation, d.transportDetail, d.mapEmbedUrl, d.airbnbUrl,
      d.checkIn, d.checkOut, id
    );
    console.log('  Updated:', id);
  }
});

update();
console.log('\nDone! Updated', Object.keys(details).length, 'properties with full detail data.');
db.close();
