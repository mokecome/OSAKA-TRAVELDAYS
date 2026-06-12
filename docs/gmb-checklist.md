# 📋 Google 商家檔案(GMB)註冊清單

> 站外工作 —— 只能由商家本人在 Google 後台完成,程式無法代勞。
> 目標:讓 Google 地圖 / 在地搜尋 / AI 真正「找得到」大阪旅行日民宿。
> 完成階段 1–2(建立 + 驗證)就會開始出現在地圖;階段 3–4 是加分。

## 商家資料(複製用,取自網站真實資料)

| 欄位 | 值 |
|---|---|
| 商家名稱 | `大阪旅行日民宿 OSAKA TRAVELDAYS` |
| 法人 | `DAIDODO合同会社` |
| 地址 | `〒552-0003 大阪市港区磯路1-8-3` |
| 類別(主) | 民宿 / `Vacation home rental agency`(或 Holiday apartment rental) |
| 網站 | `https://stay.traveldays.com.tw/` |
| Email | `support@traveldays.jp` |
| LINE | `@fgk8695x` / `https://lin.ee/pGrA7Ej` |
| 營業時間 | 全天候自助入住(Check-in 15:00 / Check-out 10:00) |

> ⚠️ **一致性是重點**:名稱、地址、電話要跟網站 schema(`index.html` 的 `LodgingBusiness`)一字不差,Google 才會把網站和商家綁在一起。

---

## 階段 1️⃣ 建立商家

- [ ] 用公司 Google 帳號登入 <https://business.google.com>
- [ ] 「新增商家」→ 輸入名稱 `大阪旅行日民宿 OSAKA TRAVELDAYS`
- [ ] 選類別:`Vacation home rental agency`(民宿/度假出租)
- [ ] 填地址 `〒552-0003 大阪市港区磯路1-8-3`
- [ ] 在地圖上把圖釘**精準拖到實際位置**(這一步會產生官方經緯度 → 階段 4 要用)

## 階段 2️⃣ 驗證(最花時間,通常 1–2 週)

- [ ] 選驗證方式:**明信片**(寄郵遞驗證碼到上述地址)或**電話/影片**(若有提供)
- [ ] 收到驗證碼後輸入完成驗證
- [ ] ⏳ 未驗證前商家不會公開顯示,要耐心等明信片

## 階段 3️⃣ 完善檔案(影響曝光與點擊)

- [ ] 填營業時間、服務說明(中文客服、自助密碼鎖入住等)
- [ ] 上傳照片:外觀、房內、周邊 —— 用網站已有的 hero / 房源圖即可
- [ ] 網站連結填 `https://stay.traveldays.com.tw/`
- [ ] 加入 LINE 作為聯絡/預約方式
- [ ] (有電話再填)新增公開電話號碼

## 階段 4️⃣ 回填網站 schema(拿到 GMB 資料後)

- [ ] 從 GMB 取得**官方經緯度**和**電話**
- [ ] 把這兩項加回 `index.html` 的 `LodgingBusiness`(程式裡已留註解位置:
      "telephone" 與 "geo"{latitude,longitude},目前刻意省略以免假值誤導)
- [ ] 用 Google Rich Results Test(<https://search.google.com/test/rich-results>)確認無誤
- [ ] 👉 這一步可以請工程協助,約 5 分鐘

---

## 背景:為什麼需要 GMB

- **schema(已完成)** 只是讓 Google「看懂」你的網站內容。
- **GMB** 才是讓你實際**出現在 Google 地圖、在地搜尋結果(local pack)**的東西。
- 兩者資料一致時效果最好:schema 幫網站背書,GMB 提供地圖實體。

相關技術變更紀錄見 commit `a3949db`(schema 定位)、`eca3b4c`(移除假佔位值)。
