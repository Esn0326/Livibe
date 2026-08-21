# 台灣演唱會資料重建紀錄（2022–2026）

資料快照日期：2026-08-21（Asia/Taipei）

## 收錄範圍

- 台灣境內已有公開日期與場館的售票演唱會、演唱會型音樂祭，以及已公告但尚未演出的場次。
- 主要以台北小巨蛋、台北大巨蛋、高雄巨蛋的場館紀錄建立骨架，再補高雄國家體育場、林口體育館、台北流行音樂中心、Zepp New Taipei、南港展覽館與大型音樂祭。
- 不收錄純粉絲見面會、頒獎典禮、體育賽事中場、校園／尾牙／商演、免費市集舞台，以及沒有確定日期或場館的傳聞。
- `assets/data/concerts.json` 維持既有 `artist`、`venue`、`date`、`theme`、`organizer` 五欄格式；多日演出拆成一日一筆，讓前端能正確建立場次與判斷已開唱／未開唱。

## 主要來源

- 台北小巨蛋歷年節目查詢（官方）：https://www.arena.taipei/news.aspx?n=4A7BFF61FA074F0F&sms=F9A95D3F5A5C2C68
- 台北小巨蛋已公開活動（官方）：https://www.arena.taipei/News.aspx?n=2E1489AFE4B1BEA1&sms=F9A95D3F5A5C2C68
- 台北小巨蛋演唱會列表（交叉核對）：https://zh.wikipedia.org/wiki/%E8%87%BA%E5%8C%97%E5%B0%8F%E5%B7%A8%E8%9B%8B%E6%BC%94%E5%94%B1%E6%9C%83%E5%88%97%E8%A1%A8
- 台北大巨蛋演唱會列表（交叉核對）：https://zh.wikipedia.org/wiki/%E8%87%BA%E5%8C%97%E5%A4%A7%E5%B7%A8%E8%9B%8B
- 高雄巨蛋 2024 藝文表演（官方）：https://www.kaoarena.com.tw/Home/CalendarList?Category=%E8%97%9D%E6%96%87%E8%A1%A8%E6%BC%94&year=2024
- 高雄巨蛋 2025 藝文表演（官方）：https://www.kaoarena.com.tw/Home/CalendarList?Category=%E8%97%9D%E6%96%87%E8%A1%A8%E6%BC%94&year=2025
- 高雄巨蛋 2026 藝文表演（官方）：https://www.kaoarena.com.tw/Home/CalendarList?Category=%E8%97%9D%E6%96%87%E8%A1%A8%E6%BC%94&year=2026
- Live Nation Taiwan（主辦／入場公告）：https://www.livenation.com.tw/
- BTS 2026 高雄三場官方活動頁：https://www.livenation.com.tw/event/bts-world-tour-arirang-in-kaohsiung-kaohsiung-tickets-edp1675887
- 高雄流行音樂中心節目表（官方）：https://kpmc.com.tw/program/
- 2024 台灣演唱會彙整（TVBS，逐筆連回售票／主辦資訊）：https://news.tvbs.com.tw/entertainment/2423671
- 2025 台灣演唱會彙整（TVBS，逐筆連回售票／主辦資訊）：https://news.tvbs.com.tw/entertainment/jk-pop/2647902
- 2026 已公告演唱會彙整（用於發現，再回查場館／主辦）：https://www.tickettw.com/concerts
- Setlist.fm 台灣場館與音樂祭頁（用於核對已實際演出的日期）：https://www.setlist.fm/
- 高雄市政府 2023 大型演唱會清單（官方公報附件）：https://cissearch.kcc.gov.tw/Upload/Attachment/%E5%85%AC%E5%A0%B1%E8%B3%87%E6%96%99/%E9%AB%98%E9%9B%84%E5%B8%82%E8%AD%B0%E6%9C%83/41%E5%8D%B7/4%E6%9C%9F/41%E5%8D%B74%E6%9C%9F08557%E8%B5%B7%E9%A0%8108826%E8%BF%84%E9%A0%81.pdf

## 重建方式

```powershell
node tools/rebuild-concert-catalog.mjs
node tools/build-concert-data.mjs
node tools/validate-project.mjs
```

未來更新時，先調整 `tools/rebuild-concert-catalog.mjs` 的事件清單，再依序執行上述三個指令。若公告取消或延期，應移除原日期並改成實際舉辦日；仍未確定新日期的活動暫不寫入正式資料。
