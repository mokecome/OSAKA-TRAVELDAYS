// 租屋需求登記 form options, shared by monthly.html (form), views/admin.html
// (list labels) and server.js (whitelist validation). Submissions store the KEYS.
// Item format: [key, zh-TW, ja, en]
(function (root) {
  var RENTAL_REQUEST_OPTIONS = {
    lookingFor: [
      ['rent',       '租屋',           '賃貸',             'Rent'],
      ['buy',        '購買房屋',       '購入',             'Buy'],
      ['commercial', '店面／商用物件', '店舗・事業用物件', 'Shop / commercial']
    ],
    budget: [
      ['under5',  '5萬日圓以下',  '5万円以下',   'Under ¥50,000'],
      ['5to6',    '5～6萬日圓',   '5～6万円',    '¥50,000–60,000'],
      ['6to8',    '6～8萬日圓',   '6～8万円',    '¥60,000–80,000'],
      ['8to10',   '8～10萬日圓',  '8～10万円',   '¥80,000–100,000'],
      ['over10',  '10萬日圓以上', '10万円以上',  'Over ¥100,000']
    ],
    layout: [
      ['1r1k',    '套房／單間（1R／1K）', 'ワンルーム（1R／1K）', 'Studio (1R / 1K)'],
      ['1dk',     '1DK',                  '1DK',                  '1DK'],
      ['1ldk',    '1LDK',                 '1LDK',                 '1LDK'],
      ['2ldkup',  '2LDK 以上',            '2LDK以上',             '2LDK or larger'],
      ['any',     '不限，希望由你們推薦', 'こだわらない・おまかせ', 'No preference — recommend one']
    ],
    moveIn: [
      ['now',       '立即入住',   'すぐに入居',   'Immediately'],
      ['1m',        '1個月內',    '1ヶ月以内',    'Within 1 month'],
      ['1to3m',     '1～3個月內', '1～3ヶ月以内', 'Within 1–3 months'],
      ['3mplus',    '3個月以後',  '3ヶ月以降',    'After 3 months'],
      ['undecided', '尚未確定',   '未定',         'Not decided yet']
    ],
    people: [
      ['1',      '1 人',     '1人',     '1 person'],
      ['2',      '2 人',     '2人',     '2 people'],
      ['3plus',  '3 人以上', '3人以上', '3 or more'],
      ['family', '家庭入住', 'ファミリー', 'Family']
    ],
    features: [
      ['bath_toilet_sep', '浴室與廁所分開',   'バス・トイレ別',   'Separate bath & toilet'],
      ['vanity',          '獨立洗手台',       '独立洗面台',       'Separate vanity'],
      ['aircon',          '附冷氣',           'エアコン付き',     'Air conditioning'],
      ['washer_space',    '室內洗衣機放置處', '室内洗濯機置場',   'Indoor washer space'],
      ['furn_appl',       '附家具家電',       '家具・家電付き',   'Furniture & appliances'],
      ['elevator',        '電梯',             'エレベーター',     'Elevator'],
      ['pets',            '可養寵物',         'ペット可',         'Pets allowed'],
      ['foreigners',      '可外國人入住',     '外国籍可',         'Foreigners welcome'],
      ['short_term',      '可短期租住',       '短期可',           'Short-term OK'],
      ['parking',         '附停車位',         '駐車場あり',       'Parking']
    ],
    contactVia: [
      ['email',    '電子郵件', 'メール',   'Email'],
      ['line',     'LINE',     'LINE',     'LINE'],
      ['whatsapp', 'WhatsApp', 'WhatsApp', 'WhatsApp']
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = RENTAL_REQUEST_OPTIONS;
  else root.RENTAL_REQUEST_OPTIONS = RENTAL_REQUEST_OPTIONS;
})(this);
