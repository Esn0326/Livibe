# 台灣演唱會資料重建紀錄（2022–2027）

資料快照日期：2026-10-15（Asia/Taipei）

## 收錄範圍

- 台灣境內已有公開日期與場館的售票演唱會、演唱會型音樂祭，以及已公告但尚未演出的場次。
- 主要以台北小巨蛋、台北大巨蛋、高雄巨蛋的場館紀錄建立骨架，再補高雄國家體育場、林口體育館、台北流行音樂中心、Zepp New Taipei、南港展覽館與大型音樂祭。
- 不收錄純粉絲見面會、頒獎典禮、體育賽事中場、校園／尾牙／商演、免費市集舞台，以及沒有確定日期或場館的傳聞。
- `assets/data/site-data.js` 的演唱會資料維持既有 `artist`、`venue`、`date`、`theme`、`organizer` 五欄格式；多日演出拆成一日一筆，讓前端能正確建立場次與判斷已開唱／未開唱。

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
node tools/validate-project.mjs
```

未來更新時，先調整 `tools/rebuild-concert-catalog.mjs` 的事件清單，再依序執行上述兩個指令。若公告取消或延期，應移除原日期並改成實際舉辦日；仍未確定新日期的活動暫不寫入正式資料。

### 官方海報連結

每筆 `add()` 可選填第六個參數 `posterUrl`。僅使用主辦、藝人或官方售票頁直接提供的 HTTPS 圖片網址；網址不存在或圖片無法載入時，網站會自動顯示預設演出圖。例如：

```js
add('藝人', '場館', ['YYYY-MM-DD'], '演出名稱', '主辦單位', 'https://official.example/poster.jpg');
```

## 2026-08-31 更新核對

- Live Nation Taiwan：wave to earth - the pieces tour（2026-11-24，TICC 台北國際會議中心）：https://www.livenation.com.tw/en/event/wave-to-earth-the-pieces-tour-taipei-tickets-edp1674746
- Live Nation Taiwan：Young K Solo Tour <YOUNGEST> in TAIPEI（2026-11-28 加場、11-29，TICC 台北國際會議中心）：https://www.livenation.com.tw/en/event/young-k-solo-tour-youngest-in-taipei-taipei-tickets-edp1690424
- Live Nation Taiwan：Khalid: It's Always Summer Somewhere Tour（2026-12-07，TICC 台北國際會議中心）：https://www.livenation.com.tw/en/khalid-tickets-adp928417

## 2026-09-07 更新核對

- Live Nation Taiwan：5 SECONDS OF SUMMER: EVERYONE’S A STAR! WORLD TOUR（2026-11-25，臺北流行音樂中心）：https://www.livenation.com.tw/en/event/5-seconds-of-summer-everyone-s-a-star-world-tour-taipei-tickets-edp1690391
- Live Nation Taiwan：DOMi & JD BECK - WHO ASKED? Tour（2026-12-04，Clapper Studio）：https://www.livenation.com.tw/event/domi-and-jd-beck-who-asked-tour-taipei-tickets-edp1689630
- Live Nation Taiwan：brb. “half/lives” Tour（2026-12-05，Clapper Studio）：https://www.livenation.com.tw/en/event/brb-half-lives-tour-taipei-tickets-edp1687732
- Live Nation Taiwan：AGAINST THE CURRENT : TILL DEATH & BACK TOUR（2027-01-15，TICC 台北國際會議中心）：https://www.livenation.com.tw/event/against-the-current-till-death-and-back-tour-taipei-tickets-edp1685117
- Live Nation Taiwan：Maroon 5 Asia 2027 in Kaohsiung（2027-01-24，高雄國家體育場）：https://www.livenation.com.tw/en/event/maroon-5-asia-2027-in-kaohsiung-kaohsiung-tickets-edp1689725
- Live Nation Taiwan：WESTLIFE 25: THE ANNIVERSARY WORLD TOUR（2027-01-30，高雄巨蛋）：https://www.livenation.com.tw/event/westlife-25-the-anniversary-world-tour-kaohsiung-tickets-edp1686626
- Live Nation Taiwan：Bruno Mars - The Romantic Tour（2027-05-01、05-02，高雄國家體育場）：https://www.livenation.com.tw/event/bruno-mars-the-romantic-tour-kaohsiung-tickets-edp1692984

## 2026-09-14 更新核對

- Live Nation Taiwan：李泳知 2026 LEE YOUNGJI WORLD TOUR <2.0>（2026-09-19、09-20，臺北流行音樂中心表演廳；09-20 為加場）：https://www.livenation.com.tw/event/2026-lee-youngji-world-tour-2-0--taipei-tickets-edp1669737
- 高雄流行音樂中心：THE ROSE ROSETOPIA ASIA TOUR 2026 IN KAOHSIUNG（2026-09-19，海音館）：https://kpmc.com.tw/program/?locationfilter=193
- 臺北小巨蛋：MUSIC EXPO LIVE 2026 in TAIPEI（2026-10-24、10-25，台北小巨蛋；AiNA THE END、ATEEZ、FRUITS ZIPPER、Hearts2Hearts、King & Prince、NCT WISH、櫻坂46、&TEAM）：https://www.arena.taipei/News_Content.aspx?n=2E1489AFE4B1BEA1&s=E4E6C8C6312BFA4E&sms=F9A95D3F5A5C2C68
- 臺北小巨蛋已公開活動清單：凱基金控 x Accusefive 告五人《在這裡 @century》世界巡迴演唱會（2026-11-07、11-08，台北小巨蛋）：https://www.arena.taipei/News.aspx?n=2E1489AFE4B1BEA1&sms=F9A95D3F5A5C2C68
- 高雄流行音樂中心：山下智久 2026 巡迴演唱會 DREAMING 高雄場（2026-11-14，海音館；下午加場及晚場）：https://kpmc.com.tw/program/?locationfilter=193

## 2026-09-21 更新核對

- 遠雄創藝／Tixcraft：BOYNEXTDOOR TOUR ‘KNOCK ON Vol.2’ IN TAIPEI（2027-01-08、01-09、01-10，國立體育大學綜合體育館／林口體育館）：https://tixcraft.com/activity/detail/27_bnd
- 高雄流行音樂中心：2026 Takao Rock 打狗祭 ➤ Hi-ing 5｜拍謝少年〖噪音特區 Noise Zone〗高流演唱會｜售票專場（2026-10-10，海音館）：https://kpmc.com.tw/program/
- 高雄流行音樂中心：2026 Takao Rock 打狗祭 KMC Select ➤國泰世華銀行 蔡健雅 除此之外 Into The B-Sides（2026-10-17，海音館）：https://kpmc.com.tw/program/2026-hih-1017/
- 高雄流行音樂中心：尤雅《往事只能回味》演唱會高雄站（2026-10-24，海音館）：https://kpmc.com.tw/program/?locationfilter=193
- Live Nation Taiwan：The Kid LAROI: A PERFECT WORLD TOUR（2026-07-03、07-07、07-08，Zepp New Taipei）：https://www.livenation.com.tw/en/tkl-tpe
- Live Nation Taiwan：Kodaline – Farewell Tour（2026-08-24，TICC 台北國際會議中心）：https://www.livenation.com.tw/kodaline26
- Live Nation Taiwan：BE:FIRST WORLD SHOWCASE 2026 “WATCH ME”（2026-09-27，Legacy TERA）：https://www.livenation.com.tw/en/event/be-first-world-showcase-2026-watch-me--taipei-tickets-edp1674414
- Live Nation Taiwan：Henry Moodie: Mood Swings World Tour（2026-09-28，高雄 LIVE WAREHOUSE）：https://www.livenation.com.tw/en/event/henry-moodie-mood-swings-world-tour-kaohsiung-tickets-edp1683261
- Live Nation Taiwan：Post Malone Presents The BIG ASS Stadium World Tour（2026-09-19，高雄國家體育場）：https://www.livenation.com.tw/en/event/post-malone-presents-the-big-ass-stadium-world-tour-kaohsiung-tickets-edp1664488
- Live Nation Taiwan：Henry Moodie: Mood Swings World Tour（2026-10-05，Legacy Taipei 傳 音樂展演空間；加場）：https://www.livenation.com.tw/en/event/henry-moodie-mood-swings-world-tour-taipei-tickets-edp1694176

## 2026-09-29 更新核對

- 臺北小巨蛋：凱基金控 x Accusefive 告五人《在這裡 @century》世界巡迴演唱會（2026-11-06、11-07、11-08，台北小巨蛋；補正漏列的 11-06 場）：https://www.arena.taipei/News.aspx?n=2E1489AFE4B1BEA1&sms=F9A95D3F5A5C2C68
- 臺北小巨蛋：劉若英《飛行日》2026巡迴演唱會 台北站（2026-12-05，台北小巨蛋）：https://www.arena.taipei/News_Content.aspx?n=2E1489AFE4B1BEA1&s=EC29FBA0E020B360&sms=F9A95D3F5A5C2C68
- Live Nation Taiwan：孫盛希 Shi Shi [The Taste Of…] 世界巡迴 台北場（2026-11-01，Legacy TERA）：https://www.livenation.com.tw/en/legacy-tera-tickets-vdp1606688
- Live Nation Taiwan：徐暐翔《愛火山的人》專場演唱會（2026-11-08，Legacy Taipei）：https://www.livenation.com.tw/event/%E5%BE%90%E6%9A%90%E7%BF%94-%E6%84%9B%E7%81%AB%E5%B1%B1%E7%9A%84%E4%BA%BA-%E5%B0%88%E5%A0%B4%E6%BC%94%E5%94%B1%E6%9C%83-taipei-tickets-edp1694192
- Live Nation Taiwan：Juice Boy “Where Forever Ends” Live Concert 2026（2026-11-14，SUB LIVE）：https://www.livenation.com.tw/en/event/juice-boy-%E6%89%80%E4%BB%A5%E8%AA%AA%E6%B0%B8%E9%81%A0%E5%A4%9A%E9%95%B7-%E5%8F%B0%E5%8C%97%E6%BC%94%E5%94%B1%E6%9C%83-taipei-tickets-edp1697822
- Live Nation Taiwan：Malcolm Todd: Do That Again Tour（2026-11-23，TICC 台北國際會議中心）：https://www.livenation.com.tw/en/event/malcolm-todd-do-that-again-tour-taipei-tickets-edp1697051
- 高雄流行音樂中心：鄭宜農 Enno Cheng《缺與圓之後 Inter-Phases》高雄演唱會（2026-12-27，LIVE WAREHOUSE 大庫）：https://kpmc.com.tw/program/2026-lwh-1227/
- Live Nation Taiwan：Freya Skye - Stars Align Tour（2027-02-22，Zepp New Taipei）：https://www.livenation.com.tw/en/event/freya-skye-stars-align-tour-taipei-tickets-edp1698820

## 2026-10-12 更新核對

- Tixcraft／APPLEWOOD Taiwan：2026 PLAVE World Tour [KEEP IT MANIC] in Taipei（2026-10-23 加場、10-24，林口體育館）：https://tixcraft.com/activity/detail/26_plavetp
- Tixcraft／iMe TW：82MAJOR ＜82CLUB : OUT OF CONTROL＞ in TAIPEI（2026-11-08，Clapper Studio）：https://tixcraft.com/activity/detail/26_82major
- Tixcraft／Live Nation Taiwan：yung kai - stay with the ocean, i'll find you: asia tour 2026（2026-11-11，Zepp New Taipei）：https://tixcraft.com/activity/detail/26_yungkai
- Tixcraft／Live Nation Taiwan：CULTURE WARS LIVE IN TAIPEI 2026（2026-11-13，Legacy Taipei）：https://tixcraft.com/activity/detail/26_cw
- Tixcraft：2026 LE SSERAFIM TOUR ‘PUREFLOW’ IN TAIPEI（2026-11-14、11-15，林口體育館）：https://tixcraft.com/activity/detail/26_lsf
- Tixcraft／FBG Live Taiwan：BINI: SIGNALS WORLD TOUR 2026 TAIPEI（2026-11-15，新北市工商展覽中心）：https://tixcraft.com/activity/detail/26_bini
- Tixcraft／用心音樂等：F✦FOREVER 恆星之城・光年赴約・臺北 限定場演唱會（2026-11-28、11-29，台北大巨蛋）：https://tixcraft.com/activity/detail/26_forever
- Tixcraft／Live Nation Taiwan：FKJ – Tyber Tour in Taipei（2026-12-08，Zepp New Taipei）：https://tixcraft.com/activity/detail/26_fkj
- Tixcraft／ULC Presents 有料創藝：Slowdive 2026 Live in Taipei（2026-12-10，Zepp New Taipei）：https://tixcraft.com/activity/detail/26_slowdive
- Tixcraft／APPLEWOOD Taiwan：T.O.P PRE-STUDIO 2026 in KAOHSIUNG（2026-12-19，高雄巨蛋）：https://tixcraft.com/activity/detail/26_topkh
- Tixcraft／Live Nation Taiwan：Blue 25th Anniversary Tour in Kaohsiung（2027-01-17，高雄流行音樂中心海音館）：https://tixcraft.com/activity/detail/27_bluekh

## 2026-10-15 更新核對

- Tixcraft：鼓鼓 呂思緯 GBOYSWAG《我現在又在想你了 Missing You All Over Again》巡迴演唱會（2026-12-26，台北流行音樂中心表演廳）：https://tixcraft.com/activity/detail/26_gboyswag
- Tixcraft／Live Nation Taiwan：〖衝突的意義_Mastering〗溫室雜草專輯發片最大場（2027-01-29，Legacy TERA）：https://tixcraft.com/activity/detail/27_easyweeds
- Tixcraft：2026-27 ROY KIM LIVE TOUR [R:O:Y] in TAIPEI（2027-01-30，Zepp New Taipei）：https://tixcraft.com/activity/detail/27_roykim
- Live Nation Taiwan／Tixcraft：beabadoobee: The Powerlines Tour（2027-04-11，高雄流行音樂中心海音館）：https://www.livenation.com.tw/event/beabadoobee-the-powerlines-tour-kaohsiung-tickets-edp1703196

## 2026-10-15 場館補查

- 臺北小巨蛋：MAMAMOO 2026 WORLD TOUR <4WARD> in TAIPEI（2026-11-28、11-29，台北小巨蛋；主辦：希林國際、VIBE MAKER 希波企劃；官方海報已嵌入）：https://www.arena.taipei/News_Content.aspx?n=2E1489AFE4B1BEA1&s=55BD65177B7B10B3&sms=F9A95D3F5A5C2C68
- 臺北小巨蛋：田馥甄《要去什麼地方》2026台北小巨蛋演唱會（2026-12-12、12-13、12-15、12-18、12-19、12-20，台北小巨蛋；主辦：樂來樂好有限公司；官方海報已嵌入）：https://www.arena.taipei/News_Content.aspx?n=2E1489AFE4B1BEA1&s=8DA71330A665A8F4&sms=F9A95D3F5A5C2C68
- 臺北小巨蛋：Mr.Children Tour 2026 “Saturday in the Park”（2026-12-26、12-27，台北小巨蛋；主辦：雅慕斯娛樂；官方海報已嵌入）：https://www.arena.taipei/News_Content.aspx?n=2E1489AFE4B1BEA1&s=1A4179D898446F51&sms=F9A95D3F5A5C2C68
