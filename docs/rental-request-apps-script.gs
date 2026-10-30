/**
 * 租屋需求登記 → Email 通知 + Google 試算表記錄
 *
 * 網站（server.js 的 notifyRentalRequest）每收到一筆租屋需求，就把資料 POST 到這個
 * Apps Script。這個 script 用部署者自己的 Google 帳號寄信，並在試算表新增一列。
 *
 * 部署步驟（用 max@traveldays.jp 登入 Google）：
 *  1. 新建一個 Google 試算表，命名「租屋需求登記」。
 *  2. 選單「擴充功能」→「Apps Script」，刪掉預設內容，貼上這整個檔案，按儲存。
 *  3. 把下方 SECRET 換成網站 .env 裡的 RENTAL_REQUEST_WEBHOOK_SECRET。
 *  4. 右上角「部署」→「新增部署作業」→ 齒輪選「網頁應用程式」
 *     - 執行身分：我
 *     - 誰可以存取：所有人
 *     按「部署」→「授與存取權」→ 選帳號 → 出現「Google 尚未驗證這個應用程式」時，
 *     按「進階」→「前往（不安全）」→「允許」（這是你們自己的 script，可放心）。
 *  5. 複製「網頁應用程式網址」（https://script.google.com/macros/s/.../exec），
 *     填到網站 .env 的 RENTAL_REQUEST_WEBHOOK_URL 並重啟網站。
 *
 * 之後如果修改這個檔案，要用「部署」→「管理部署作業」→ 編輯 →「新版本」重新部署，
 * 網址不會變。
 */

// 收件人寫死在這裡：就算網址外流，信也只會寄到公司信箱。
var MAIL_TO = 'max@traveldays.jp';
var SECRET = 'PASTE_RENTAL_REQUEST_WEBHOOK_SECRET_HERE';

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  if (data.secret !== SECRET) return json_({ ok: false, error: 'forbidden' });

  MailApp.sendEmail({
    to: MAIL_TO,
    replyTo: data.replyTo || '',
    subject: String(data.subject || '【租屋需求登記】'),
    body: String(data.body || ''),
    name: '大阪旅行日民宿 網站'
  });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0 && data.header) {
    sheet.appendRow(data.header);
    sheet.setFrozenRows(1);
  }
  if (data.row) sheet.appendRow(data.row);

  return json_({ ok: true });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
