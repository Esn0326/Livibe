# LIVIBE

LIVIBE 是以 IMDb 評價網站概念呈現演唱會、場館與互動座位視野的靜態網站。

## Source tree

```text
.
├─ index.html                         # 首頁
├─ concert.html                       # 演唱會詳情
├─ venues.html                        # 場館與座位圖
├─ login.html                         # 管理者登入
├─ assets/
│  ├─ css/app.css                     # 全站樣式
│  ├─ data/site-data.js               # 全站資料唯一來源
│  ├─ js/
│  │  ├─ core.js                      # 共用資料轉換與角色權限
│  │  ├─ home.js                      # 首頁控制
│  │  ├─ concert.js                   # 演唱會詳情控制
│  │  ├─ venues.js                    # 場館目錄與互動控制
│  │  └─ venue-maps.js                # 小巨蛋、林口與描點資料
│  └─ venue-maps/                     # 通用場館 SVG
├─ tools/                              # 資料重建、場館匯入與驗證
└─ non/                                # 不參與正式網站載入的歷史與產製資料
```

## Local preview

直接開啟 HTML 可以瀏覽演唱會清單、詳情與場館目錄；若要載入全部通用場館互動 SVG，仍建議透過本機伺服器執行：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

然後開啟 `http://127.0.0.1:8765/`。

## Roles and permissions

目前角色分為訪客、一般會員、內容編輯與最高管理員。最高管理員可刪除所有討論留言、調整每一份場館配置的視野分類，並替個別演唱會場次指定場館座位配置。管理者由 `login.html` 登入，登入狀態存放在目前分頁的 `sessionStorage`，關閉分頁後自動失效。

正式環境可在載入 `assets/js/core.js` 前，由登入系統指定角色：

```html
<script>window.LIVIBE_CURRENT_USER_ROLE = 'super_admin';</script>
```

前端權限只負責介面與靜態預覽。接上正式帳號、留言 API 或資料庫時，刪除留言與修改分類仍必須在後端再次驗證角色，不能只依賴瀏覽器端判斷。

## Site data

演出、國家、城市顯示、繁中／英文名稱、場館卡色票、場館與舞台配置都集中於
`assets/data/site-data.js`。前端與維護工具共用同一份資料，不需要同步多個輸入檔。

## Concert data

演唱會正式清單維護於 `tools/rebuild-concert-catalog.mjs`，目前收錄 2022–2026 年台灣已舉辦及已公告場次。重建時會保留場館資料，只更新 `site-data.js` 的演出內容：

```powershell
node tools/rebuild-concert-catalog.mjs
node tools/validate-project.mjs
```

場館匯入工具 `tools/import-venue-maps.mjs` 會保留演出與地區設定，只更新同一份 `site-data.js` 的場館內容。

查證範圍與主要來源記錄於 `non/research/concert-data-sources.md`。
