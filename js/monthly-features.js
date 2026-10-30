// Monthly-stay checklist shared by admin (views/admin.html) and the room page
// (room-template.html, monthly mode only). Properties store the selected KEYS in
// properties.monthlyFeatures, so labels can change here without touching data.
// Item format: [key, zh-TW, ja, en]
(function () {
  function L(zh, ja, en) { return { 'zh-TW': zh, ja: ja, en: en }; }
  function layouts(names) { return names.map(function (n) { return ['layout_' + n, n, n, n]; }); }

  window.MONTHLY_FEATURE_SECTIONS = [
    {
      key: 'includes',
      title: L('月租費用包含', '月額費用・契約条件', 'Monthly Rent Includes'),
      groups: [
        { title: L('禮金・押金', '礼金・敷金', 'Key Money & Deposit'), items: [
          ['reikin_yes',  '需禮金',   '礼金あり', 'Key money required'],
          ['reikin_no',   '不需禮金', '礼金なし', 'No key money'],
          ['deposit_yes', '需押金',   '敷金あり', 'Deposit required'],
          ['deposit_no',  '不需押金', '敷金なし', 'No deposit']
        ] },
        { title: L('費用', '費用', 'Utilities & Fees'), items: [
          ['wifi_fee',     'Wi-Fi費用',   'Wi-Fi料金', 'Wi-Fi'],
          ['water_fee',    '水費',        '水道代',    'Water'],
          ['electric_fee', '電費',        '電気代',    'Electricity'],
          ['gas_fee',      '瓦斯費',      'ガス代',    'Gas'],
          ['garbage_fee',  '垃圾處理費用', 'ゴミ処理費', 'Garbage disposal']
        ] },
        { title: L('家具', '家具', 'Furniture'), items: [
          ['furnished',   '帶家具',   '家具付き', 'Furnished'],
          ['unfurnished', '不帶家具', '家具なし', 'Unfurnished']
        ] },
        { title: L('格局', '間取り', 'Layout'), items: layouts(
          ['1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3K', '3DK', '3LDK', '4K', '4DK', '4LDK']
        ).concat([['layout_5Kplus', '5K以上', '5K以上', '5K or larger']]) }
      ]
    },
    {
      key: 'details',
      title: L('房屋詳細', '物件詳細', 'Property Details'),
      groups: [
        { title: L('建築構造', '建物構造', 'Construction'), items: [
          ['rc',          '鋼筋混凝土造', '鉄筋コンクリート造', 'Reinforced concrete'],
          ['steel',       '鋼骨結構',     '鉄骨造',             'Steel frame'],
          ['wood',        '木造',         '木造',               'Wooden'],
          ['brick_other', '磚塊造・其他', 'ブロック造・その他', 'Brick / other']
        ] },
        { title: L('樓層與位置', '階数・位置', 'Floor & Position'), items: [
          ['floor_1',   '1 樓物件',     '1階',     'Ground floor'],
          ['floor_2up', '2 樓以上',     '2階以上', '2nd floor or higher'],
          ['top_floor', '頂樓物件',     '最上階',  'Top floor'],
          ['corner',    '邊間（角間）', '角部屋',  'Corner unit'],
          ['south',     '朝南',         '南向き',  'South-facing']
        ] },
        { title: L('室內設備', '室内設備', 'Interior'), items: [
          ['washer_space', '室內洗衣機放置處', '室内洗濯機置場', 'Indoor washer space'],
          ['vanity',       '獨立洗手台',       '独立洗面台',     'Separate vanity'],
          ['wood_floor',   '木質地板',         'フローリング',   'Wood flooring'],
          ['loft',         '閣樓',             'ロフト',         'Loft'],
          ['furn_appl',    '附家具、家電',     '家具・家電付き', 'Furniture & appliances']
        ] },
        { title: L('冷暖氣設備', '冷暖房設備', 'Heating & Cooling'), items: [
          ['aircon',          '附冷氣',   'エアコン付き', 'Air conditioning'],
          ['floor_heating',   '地板暖氣', '床暖房',       'Floor heating'],
          ['kerosene_heater', '燈油暖氣', '灯油暖房',     'Kerosene heating'],
          ['gas_heater',      '瓦斯暖氣', 'ガス暖房',     'Gas heating']
        ] },
        { title: L('浴室與廁所', 'バス・トイレ', 'Bath & Toilet'), items: [
          ['bath_toilet_sep', '浴室與廁所分開',   'バス・トイレ別', 'Separate bath & toilet'],
          ['washlet',         '免治馬桶',         '温水洗浄便座',   'Bidet toilet'],
          ['bath_dryer',      '浴室乾燥機',       '浴室乾燥機',     'Bathroom dryer'],
          ['reheat_bath',     '可重新加熱浴缸水', '追い焚き機能',   'Bath reheating'],
          ['shower_room',     '淋浴間',           'シャワールーム', 'Shower room']
        ] },
        { title: L('廚房設備', 'キッチン設備', 'Kitchen'), items: [
          ['gas_stove',      '可使用瓦斯爐',       'ガスコンロ対応',                 'Gas stove'],
          ['ih_stove',       'IH 電磁爐',          'IHクッキングヒーター',           'IH cooktop'],
          ['two_burners',    '兩口以上爐具',       '2口以上コンロ',                  'Two or more burners'],
          ['all_electric',   '全電化住宅',         'オール電化',                     'All-electric home'],
          ['system_kitchen', '系統廚房',           'システムキッチン',               'Fitted kitchen'],
          ['island_kitchen', '中島式／吧檯式廚房', 'アイランド・カウンターキッチン', 'Island / counter kitchen']
        ] }
      ]
    }
  ];
})();
