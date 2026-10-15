import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(projectRoot, 'assets/data/site-data.js');
const posterSourcePath = resolve(projectRoot, 'tools/concert-posters.json');
const posterSources = JSON.parse(await readFile(posterSourcePath, 'utf8'));
const CATALOG_SNAPSHOT = '2026-10-15';
const slugify = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');

// Snapshot: 2026-10-15. This catalog intentionally covers ticketed concerts,
// concert-style music festivals and announced future shows in Taiwan. Pure fan
// meetings, award ceremonies, sports intermissions and date-less rumours are
// excluded. See non/research/concert-data-sources.md for the research trail.
const events = [];
const add = (artist, venue, dates, theme, organizer = '未提供', posterUrl = '') => {
    const normalizedDates = Array.isArray(dates) ? dates : [dates];
    const id = `${slugify(theme)}-${normalizedDates[0]}-${slugify(venue)}`;
    events.push({
        id,
        artists: Array.isArray(artist) ? artist : [artist],
        venue,
        dates: normalizedDates,
        theme,
        organizer,
        posterUrl: posterUrl || posterSources[id]?.posterUrl || ''
    });
};

// 2022 — Taipei Arena official/history records plus verified major shows.
add('魚丁糸 (Oaeen)', '台北小巨蛋', ['2022-02-19', '2022-02-20'], '《池堂影夜》演唱會', '環球音樂');
add('動力火車', '台北小巨蛋', ['2022-03-05'], '《都是因為愛》世界巡迴演唱會 台北旗艦場');
add('張惠妹 (aMEI)', '台北小巨蛋', ['2022-04-01', '2022-04-02', '2022-04-03', '2022-04-05', '2022-04-06', '2022-04-08', '2022-04-09', '2022-04-10', '2022-04-12', '2022-04-13', '2022-04-15', '2022-04-16'], 'ASMR 世界巡迴演唱會 台北首站', '聲動娛樂');
add('羅志祥 (Show Lo)', '台北小巨蛋', ['2022-07-09'], '羅志祥演唱會', '寬宏藝術');
add('A-Lin', '台北小巨蛋', ['2022-07-16', '2022-07-17'], 'A-LINK with PASSENGERS 演唱會', '宜辰整合行銷');
add('陶晶瑩', '台北小巨蛋', ['2022-07-30'], 'MOMAN 演唱會', '開麗娛樂');
add('五堅情', '台北小巨蛋', ['2022-08-06', '2022-08-07'], 'Moon Landing 月面著陸演唱會');
add('瘦子 E.SO', '台北小巨蛋', ['2022-08-12', '2022-08-13', '2022-08-14'], '地囚人演唱會', '本色音樂');
add('八三夭 (831)', '台北小巨蛋', ['2022-08-20', '2022-08-21'], '《顛倒世界》巡迴演唱會 台北首站', 'KKLIVE');
add('Sigur Rós', '新莊體育館', ['2022-08-05'], 'Sigur Rós World Tour 2022', '乙太娛樂');
add('徐若瑄', '台北小巨蛋', ['2022-09-03'], 'VIVILAND 巡迴演唱會');
add('韋禮安 (WeiBird)', '台北小巨蛋', ['2022-09-10', '2022-09-11'], '《如果可以，我想和你明天再見》演唱會', 'KKLIVE');
add('伍佰 & China Blue', '台北小巨蛋', ['2022-09-24', '2022-09-25'], 'ROCK STAR 演唱會', '開麗娛樂');
add('彭佳慧', '台北小巨蛋', ['2022-10-01'], '《怎樣 Julia / Run Wild》巡迴演唱會 台北站');
add('劉若英', '台北小巨蛋', ['2022-10-08'], '《飛行日》巡迴演唱會');
add('美秀集團 (Amazing Show)', '台南安平觀夕平台', ['2022-10-09'], '2022 浪人祭 Vagabond Festival', '笨道人');
add('周興哲 (Eric Chou)', '台北小巨蛋', ['2022-10-21', '2022-10-22', '2022-10-23'], 'Odyssey~旅程巡迴演唱會', '星空飛騰');
add('萬芳', '台北小巨蛋', ['2022-11-12'], '萬芳30《你的30 ______，你今天有沒有來》演唱會');
add('周湯豪', '台北小巨蛋', ['2022-11-19', '2022-11-20'], 'REALIVE 演唱會');
add('SUPER JUNIOR', '台北小巨蛋', ['2022-11-25', '2022-11-26', '2022-11-27'], 'SUPER SHOW 9 : ROAD in TAIPEI', '超級圓頂');
add('盧廣仲 (Crowd Lu)', '台北小巨蛋', ['2022-12-03'], '《勵志的早晨 勵志的夜晚》14週年演唱會', '添翼創越');
add('洪榮宏', '台北小巨蛋', ['2022-12-10'], '《阿宏的心聲》演唱會');
add('Alan Walker', '台北大佳河濱公園', ['2022-12-11'], 'S2O Taiwan Songkran Music Festival 2022', '斯邦奈');
add('Sarah Brightman', '台北小巨蛋', ['2022-12-17'], 'A Christmas Symphony');
add('安溥', '台北小巨蛋', ['2022-12-24', '2022-12-25'], 'to Ebb 潮水箴言10週年演唱會');
add('蔡依林 (Jolin Tsai)', '台北小巨蛋', ['2022-12-31', '2023-01-01', '2023-01-02', '2023-01-06', '2023-01-07', '2023-01-08'], 'Ugly Beauty 世界巡迴演唱會 FINALE in TAIPEI', '超級圓頂');

// 2023 — Taipei Arena history and verified stadium/arena/international shows.
add('Backstreet Boys', '高雄巨蛋', ['2023-02-18'], 'DNA World Tour', 'Live Nation Taiwan');
add('魚丁糸 (Oaeen)', '台北小巨蛋', ['2023-02-18', '2023-02-19'], '《池堂影夜》演唱會', '環球音樂');
add('張信哲', '台北小巨蛋', ['2023-02-25'], '《未來式 2.0》世界巡迴演唱會');
add('Westlife', '高雄巨蛋', ['2023-02-26'], 'The Wild Dreams Tour', 'Live Nation Taiwan');
add('OneRepublic', '台北小巨蛋', ['2023-03-05'], 'OneRepublic Live in Concert', 'Live Nation Taiwan');
add('草蜢', '台北小巨蛋', ['2023-03-18'], 'RE：GRASSHOPPER 巡迴演唱會 台北首站');
add('BLACKPINK', '高雄國家體育場', ['2023-03-18', '2023-03-19'], 'BORN PINK World Tour', 'Live Nation Taiwan');
add('五月天 (Mayday)', '高雄國家體育場', ['2023-03-29', '2023-03-31', '2023-04-01', '2023-04-02'], '諾亞方舟10週年進化復刻限定版', '相信音樂');
add('張惠妹 (aMEI)', '高雄巨蛋', ['2023-03-31', '2023-04-01', '2023-04-02', '2023-04-04', '2023-04-05', '2023-04-07', '2023-04-08', '2023-04-14', '2023-04-15', '2023-04-16'], 'ASMR 世界巡迴演唱會 高雄站', '聲動娛樂');
add('黃明志', '台北小巨蛋', ['2023-04-01'], '《大飛機》世界巡迴演唱會');
add('告五人 (Accusefive)', '台北小巨蛋', ['2023-04-08', '2023-04-09'], '《宇宙的有趣》第一次新世界巡迴演唱會', '相信音樂');
add('玖壹壹', '台北小巨蛋', ['2023-04-15'], 'BROMAN 演唱會');
add('動力火車', '台北小巨蛋', ['2023-04-22', '2023-04-23'], '《都是因為愛》世界巡迴演唱會 台北安可場');
add('蔡健雅', '台北小巨蛋', ['2023-05-06', '2023-05-07'], 'Let’s Depart！給世界最悠長的吻演唱會');
add('魏如萱', '台北小巨蛋', ['2023-05-13', '2023-05-14'], 'HAVE A NICE :DAY 2 YOU 巡迴演唱會');
add('林志炫', '台北小巨蛋', ['2023-05-20'], 'ONE take 2.0 我忘了我已老去世界巡迴演唱會');
add('iKON', '台北小巨蛋', ['2023-05-21'], 'iKON WORLD TOUR TAKE OFF');
add('張清芳', '台北小巨蛋', ['2023-06-10', '2023-06-11'], 'TimeLESS 演唱會');
add('楊丞琳', '台北小巨蛋', ['2023-06-17', '2023-06-18'], 'LIKE A STAR 世界巡迴演唱會 台北返場');
add('TAEYEON 太妍', '台北小巨蛋', ['2023-06-24'], 'The ODD Of LOVE');
add('陳奕迅', '台北小巨蛋', ['2023-07-15', '2023-07-16', '2023-07-18', '2023-07-19', '2023-07-21', '2023-07-22', '2023-07-23'], 'FEAR AND DREAMS 世界巡迴演唱會');
add('羅志祥 (Show Lo)', '台北小巨蛋', ['2023-07-29', '2023-07-30'], 'EVOLUTION 羅志祥演唱會', '寬宏藝術');
add('田馥甄 (Hebe)', '台北小巨蛋', ['2023-08-05', '2023-08-06', '2023-08-11', '2023-08-12', '2023-08-13'], '一一巡迴演唱會 台北最終場', '何樂音樂');
add('王力宏', '台北小巨蛋', ['2023-09-09', '2023-09-10'], 'ONE Leehom Wang 一個王力宏巡迴演唱會', '寬魚國際');
add('ONE OK ROCK', '台北南港展覽館一館', ['2023-09-16', '2023-09-17'], 'LUXURY DISEASE ASIA TOUR 2023', 'KKLIVE');
add('MAN WITH A MISSION', 'Zepp New Taipei', ['2023-09-17'], 'WOLVES ON PARADE World Tour', '好玩國際文化');
add('李榮浩', '台北小巨蛋', ['2023-09-16'], '縱橫四海世界巡迴演唱會', '華納音樂');
add('Post Malone', '台北南港展覽館一館', ['2023-09-20'], "If Y'all Weren't Here, I'd Be Crying Tour", 'Live Nation Taiwan');
add('王心凌', '台北小巨蛋', ['2023-09-23', '2023-09-24'], 'SUGAR HIGH 世界巡迴演唱會 台北首站');
add('盧廣仲 (Crowd Lu)', '台北小巨蛋', ['2023-09-30'], '《勵志的團圓》巡迴演唱會 旗艦安可場', '添翼創越');
add('徐懷鈺', '台北小巨蛋', ['2023-10-07'], '《倒數三秒》巡迴演唱會');
add('Sam Smith', '台北小巨蛋', ['2023-10-09'], 'GLORIA the tour', '寬宏藝術');
add('5566', '台北小巨蛋', ['2023-10-14'], '2056 20週年演唱會 台北安可場');
add('徐佳瑩', '台北小巨蛋', ['2023-11-04', '2023-11-05'], '《變得有些奢侈的事》巡迴演唱會');
add('Coldplay', '高雄國家體育場', ['2023-11-11', '2023-11-12'], 'Music of the Spheres World Tour', 'Live Nation Taiwan');
add('韋禮安 (WeiBird)', '台北小巨蛋', ['2023-11-11', '2023-11-12'], '《如果可以，我想和你明天再見 again》演唱會', 'KKLIVE');
add('姜育恆', '台北小巨蛋', ['2023-11-18'], '《人生的路》演唱會');
add('九澤CP', '台北小巨蛋', ['2023-11-25'], '愛在你身邊 LOVE GAME 演唱會');
add(['滅火器 (Fire EX.)', 'ASIAN KUNG-FU GENERATION', 'ELLEGARDEN', '10-FEET', '李泳知'], '樂天桃園棒球場', ['2023-11-25', '2023-11-26'], '2023 FireBall Fest 火球祭', '夥球擊');
add('Joji', '台北南港展覽館一館', ['2023-11-24'], 'Pandemonium Tour', 'Live Nation Taiwan');
add('milet', 'Zepp New Taipei', ['2023-11-29', '2023-11-30'], 'milet live tour “5AM” in Taipei', '大鴻藝術');
add(['YOASOBI', '告五人', '落日飛車'], '台北華山1914文創園區', ['2023-12-02', '2023-12-03'], '2023 Simple Life 簡單生活節', '中子創新');
add('YOASOBI', 'Zepp New Taipei', ['2023-12-04'], 'YOASOBI ASIA TOUR 2023-2024', '好玩國際文化');
add('林宥嘉', '台北小巨蛋', ['2023-12-15', '2023-12-16', '2023-12-17'], 'IDOL 世界巡迴演唱會 台北返場');
add('MC HotDog', '台北小巨蛋', ['2023-12-23', '2023-12-24'], '《髒藝術家》演唱會');

// 2024 — Taipei Arena, Taipei Dome, Kaohsiung Arena and verified major shows.
add('ENHYPEN', '國立體育大學綜合體育館', ['2024-01-13', '2024-01-14'], "WORLD TOUR 'FATE'", 'Applewood Taiwan');
add('詹雅雯', '台北小巨蛋', ['2024-01-20'], '《春分》巡迴演唱會');
add('安溥', '台北小巨蛋', ['2024-02-03'], '《時寐》巡迴演唱會');
add('IVE', '國立體育大學綜合體育館', ['2024-03-02', '2024-03-03'], "1ST WORLD TOUR 'SHOW WHAT I HAVE'", 'Live Nation Taiwan');
add('鄭中基', '台北小巨蛋', ['2024-03-09', '2024-03-10'], 'Fragments of Wonder 世界巡迴演唱會 台北站');
add('五月天 (Mayday)', '高雄國家體育場', ['2024-03-23', '2024-03-24', '2024-03-29', '2024-03-30', '2024-03-31'], '回到那一天25週年巡迴演唱會', '相信音樂');
add('Calum Scott', '台北小巨蛋', ['2024-03-27'], 'Calum Scott 2024 TAIPEI');
add(['滿島光 x 大象體操', '閃靈', '拍謝少年', '康士坦的變化球'], '高雄駁二藝術特區', ['2024-03-30', '2024-03-31'], '2024 大港開唱 Megaport Festival', '出日音樂');
add('CNBLUE', '高雄流行音樂中心 海音館', ['2024-04-05', '2024-04-06'], 'CNBLUENTITY IN KAOHSIUNG', '希林國際');
add('IU', '台北小巨蛋', ['2024-04-06', '2024-04-07'], 'IU H.E.R.E.H World Tour Concert');
add('梁詠琪', '台北小巨蛋', ['2024-04-13'], '時間遇上我們世界巡迴演唱會');
add('動力火車', '高雄巨蛋', ['2024-04-20', '2024-04-21'], '《都是因為愛》世界巡迴演唱會 高雄安可場');
add('宇宙人', '台北小巨蛋', ['2024-04-27'], 'α：回到未來20週年演唱會');
add('杜德偉', '台北小巨蛋', ['2024-05-18'], 'Get Up 世界巡迴演唱會');
add('TREASURE', '國立體育大學綜合體育館', ['2024-05-19'], '2024 TREASURE RELAY TOUR [REBOOT]', 'Live Nation Taiwan');
add('張學友', '台北小巨蛋', ['2024-05-31', '2024-06-01', '2024-06-02', '2024-06-14', '2024-06-15', '2024-06-16'], '60+ 世界巡迴演唱會 台北站', '超級圓頂');
add('李泳知', '台北流行音樂中心 表演廳', ['2024-06-22'], 'WORLD TOUR - ALL OR NOTHING', 'Live Nation Taiwan');
add('Aimer', '國立體育大學綜合體育館', ['2024-06-22', '2024-06-23'], '3 nuits tour 2024 in Taipei', '雅慕斯娛樂');
add('BABYMONSTER', '台北流行音樂中心 表演廳', ['2024-06-23'], 'PRESENTS : SEE YOU THERE IN TAIPEI', 'Live Nation Taiwan');
add('Perfume', '台北流行音樂中心 表演廳', ['2024-07-06'], 'COD3 OF P3RFUM3 ZOZ5 Asia Tour', '雅慕斯娛樂');
add(['Red Velvet', 'SUNMI', 'HWASA', 'KWON EUNBI', 'UNIS'], '高雄巨蛋', ['2024-07-13'], 'K-MEGA CONCERT in Kaohsiung');
add('林志炫', '台北小巨蛋', ['2024-07-13'], 'ONE take 2.0 我忘了我已老去世界巡迴演唱會 台北安可場');
add('SUHO', '台北流行音樂中心 表演廳', ['2024-07-13'], '2024 SUHO CONCERT <SU:HOME>', 'Applewood Taiwan');
add('ITZY', '台北小巨蛋', ['2024-07-20'], 'ITZY 2ND WORLD TOUR “BORN TO BE”', 'Live Nation Taiwan');
add('Energy', '台北小巨蛋', ['2024-07-27', '2024-07-28'], '《一觸即發》巡迴演唱會', '相信音樂');
add('Ozone', '台北小巨蛋', ['2024-08-03'], 'World Top 演唱會');
add('aespa', '國立體育大學綜合體育館', ['2024-08-09', '2024-08-10', '2024-08-11'], 'SYNK : PARALLEL LINE', 'iMe Taiwan');
add('宇多田光', '台北小巨蛋', ['2024-08-10', '2024-08-11'], 'HIKARU UTADA SCIENCE FICTION TOUR 2024');
add('宇宙人', '高雄巨蛋', ['2024-08-10'], 'α：回到未來20週年演唱會');
add('DOYOUNG 道英', '台北流行音樂中心 表演廳', ['2024-08-16'], '2024 DOYOUNG CONCERT [Dear Youth,]', 'Live Nation Taiwan');
add('SUPER JUNIOR', '台北小巨蛋', ['2024-08-16', '2024-08-17', '2024-08-18'], 'SUPER SHOW SPIN-OFF : Halftime');
add(['五月天', 'Energy', 'GLAY', '動力火車'], '台北小巨蛋', ['2024-08-24', '2024-08-25'], '2024 SUPER SLIPPA 超犀利趴13', '相信音樂');
add(['多組藝人'], '高雄巨蛋', ['2024-08-31'], 'ECO L!VE CONCERT');
add('Energy', '高雄巨蛋', ['2024-09-07', '2024-09-08'], '《一觸即發》巡迴演唱會', '相信音樂');
add('蔡健雅', '高雄巨蛋', ['2024-09-14'], 'Let’s Depart！給世界最悠長的吻巡迴演唱會');
add('麋先生', '台北小巨蛋', ['2024-09-21'], '《馬戲團運動 CircUs》世界巡迴演唱會');
add('陳曉東', '台北小巨蛋', ['2024-09-28'], '《心有獨鍾》世界巡迴演唱會');
add('鄭中基', '高雄巨蛋', ['2024-09-28', '2024-09-29'], 'Fragments of Wonder 世界巡迴演唱會 高雄安可場');
add('(G)I-DLE', '台北小巨蛋', ['2024-10-04', '2024-10-05', '2024-10-06'], '(G)I-DLE WORLD TOUR [iDOL]');
add(['Creepy Nuts', '水曜日のカンパネラ', 'toe'], '台南安平觀夕平台', ['2024-10-04', '2024-10-05', '2024-10-06'], '2024 浪人祭 Vagabond Festival', '笨道人');
add('徐佳瑩', '高雄巨蛋', ['2024-10-05'], '《變得有些奢侈的事》巡迴演唱會 高雄場');
add('TOMORROW X TOGETHER', '國立體育大學綜合體育館', ['2024-10-05', '2024-10-06'], 'WORLD TOUR <ACT : PROMISE>', '遠雄創藝');
add('王心凌', '台北小巨蛋', ['2024-10-12', '2024-10-13'], 'SUGAR HIGH 2.0 世界巡迴演唱會');
add('張清芳', '台北小巨蛋', ['2024-10-19'], 'TimeLESS 演唱會 花見特別安可場');
add('FTISLAND', '高雄流行音樂中心 海音館', ['2024-10-26'], "2024 FTISLAND LIVE 'PULSE' IN KAOHSIUNG", '希林國際');
add('劉德華', '台北小巨蛋', ['2024-11-01', '2024-11-02', '2024-11-03'], '今天…is the Day 巡迴演唱會');
add('陶喆', '台北小巨蛋', ['2024-11-09', '2024-11-10'], 'Soul Power II 世界巡迴演唱會');
add('藤井風', '台北小巨蛋', ['2024-11-16', '2024-11-17'], 'Best of Fujii Kaze 2020-2024 ASIA TOUR');
add('鄭伊健', '高雄巨蛋', ['2024-11-23'], 'HERE＆NOW 鄭伊健演唱會2024 高雄站', 'KKLIVE');
add('周湯豪', '台北小巨蛋', ['2024-11-23', '2024-11-24'], 'REALIVE (R2) 演唱會 特仕版');
add('浪花男子', '台北小巨蛋', ['2024-11-30', '2024-12-01'], "Naniwa Danshi ASIA TOUR 2024+2025 '+Alpha'");
add('Charlie Puth', '高雄巨蛋', ['2024-12-05'], 'Charlie Puth Presents “Something New”', 'Live Nation Taiwan');
add('周杰倫', '台北大巨蛋', ['2024-12-05', '2024-12-06', '2024-12-07', '2024-12-08'], '嘉年華世界巡迴演唱會 台北站', '杰威爾音樂');
add('蕭秉治', '台北小巨蛋', ['2024-12-07'], '《活著Alive》演唱會', '相信音樂');
add('TRASH', '台北小巨蛋', ['2024-12-14'], '《幸福的末班車》15週年演唱會');
add('TAEYANG 太陽', '台北流行音樂中心 表演廳', ['2024-12-14'], 'THE LIGHT YEAR IN TAIPEI', 'Live Nation Taiwan');
add('Official髭男dism', '台北小巨蛋', ['2024-12-15'], 'OFFICIAL HIGE DANDISM ASIA TOUR 2024 - Rejoice -');
add('張惠妹 (aMEI)', '台北大巨蛋', ['2024-12-21', '2024-12-22', '2024-12-28', '2024-12-29', '2024-12-31'], 'ASMR Maxxx 台北大巨蛋演唱會', '聲動娛樂');
add('羅志祥 (Show Lo)', '高雄巨蛋', ['2024-12-28', '2024-12-31'], '羅志祥30巡迴演唱會 高雄站', '寬宏藝術');
add('郭富城', '台北小巨蛋', ['2024-12-27', '2024-12-28', '2024-12-29'], 'ICONIC 世界巡迴演唱會');

// 2025 — official Taipei/Kaohsiung arena records, Taipei Dome and selected major venues.
add('A-Lin', '台北小巨蛋', ['2025-01-17', '2025-01-18', '2025-01-19'], 'A-LINK with PASSENGERS 巡迴演唱會最終站', '宜辰整合行銷');
add('SUPER JUNIOR-D&E', '高雄巨蛋', ['2025-01-25', '2025-01-26'], 'WORLD TOUR ECLIPSE in KAOHSIUNG');
add('Apink', 'TICC 台北國際會議中心', ['2025-02-01'], '2025 Apink 7th CONCERT [PINK NEW YEAR] In TAIPEI');
add('2NE1', '國立體育大學綜合體育館', ['2025-02-08'], '2024-25 2NE1 ASIA TOUR [WELCOME BACK] IN TAIPEI', 'Live Nation Taiwan');
add('YOASOBI', '台北小巨蛋', ['2025-02-08', '2025-02-09'], 'YOASOBI ASIA TOUR 2024-2025 “超現實 cho-genjitsu”', '好玩國際文化');
add('Maroon 5', '高雄國家體育場', ['2025-02-14'], 'Maroon 5 Asia 2025 – Kaohsiung', 'Live Nation Taiwan');
add(['多組民歌歌手'], '高雄巨蛋', ['2025-02-15'], '2025 民歌50高峰會 最終場');
add('蘇打綠', '台北小巨蛋', ['2025-02-22', '2025-02-23'], '《二十年一刻》巡迴演唱會');
add('麋先生', '高雄巨蛋', ['2025-03-01'], '《馬戲團運動 CircUs》世界巡迴演唱會 高雄站');
add('Kylie Minogue', '高雄巨蛋', ['2025-03-15'], 'Tension Tour 2025', 'Live Nation Taiwan');
add('米津玄師', '台北小巨蛋', ['2025-03-15', '2025-03-16'], 'KENSHI YONEZU 2025 WORLD TOUR / JUNK', '大鴻藝術');
add('TAEYEON 太妍', '台北大巨蛋', ['2025-03-16'], 'The TENSE in Taipei', 'Live Nation Taiwan');
add('戴佩妮', '台北小巨蛋', ['2025-03-22'], '雙生火焰演唱會');
add('Cigarettes After Sex', '桃園會展中心', ['2025-03-22'], 'X’s World Tour 2025', 'Live Nation Taiwan');
add('keshi', '國立體育大學綜合體育館', ['2025-03-28'], 'REQUIEM TOUR in Taipei 2025', 'Live Nation Taiwan');
add('張學友', '高雄巨蛋', ['2025-03-28', '2025-03-29', '2025-03-30'], '60+ 世界巡迴演唱會 高雄站', '超級圓頂');
add('張學友', '台北小巨蛋', ['2025-04-04', '2025-04-05', '2025-04-06', '2025-04-11', '2025-04-12', '2025-04-13', '2025-04-18', '2025-04-19', '2025-04-20'], '60+ 世界巡迴演唱會 台北安可場', '超級圓頂');
add('Andrea Bocelli', '台北大巨蛋', ['2025-04-04'], 'Andrea Bocelli Live in Taipei Dome');
add('TRASH', '高雄巨蛋', ['2025-05-03'], '《幸福的末班車》15週年演唱會 高雄場');
add('陳奕迅', '高雄巨蛋', ['2025-05-23', '2025-05-24', '2025-05-25', '2025-05-29', '2025-05-30', '2025-05-31'], 'FEAR AND DREAMS 世界巡迴演唱會 高雄站');
add('彭佳慧', '台北小巨蛋', ['2025-06-07'], '《一路這樣愛過來》演唱會');
add('林俊傑', '台北大巨蛋', ['2025-06-07', '2025-06-08'], 'JJ20 FINAL LAP 世界巡迴演唱會', 'JFJ Productions');
add('伍佰 & China Blue', '台北小巨蛋', ['2025-06-13', '2025-06-14', '2025-06-15'], 'Rock Star 2 巡迴演唱會', '開麗娛樂');
add('五月天 (Mayday)', '台北大巨蛋', ['2025-06-27', '2025-06-28', '2025-06-29', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-11', '2025-07-12'], '回到那一天25週年巡迴演唱會 台北站', '相信音樂');
add('G-DRAGON', '台北小巨蛋', ['2025-07-11', '2025-07-12', '2025-07-13'], 'Übermensch World Tour in Taipei', 'Live Nation Taiwan');
add('江蕙', '高雄巨蛋', ['2025-07-11', '2025-07-12', '2025-07-15', '2025-07-18', '2025-07-19', '2025-07-22', '2025-07-25', '2025-07-26'], '《無．有》演唱會 高雄站');
add('頑童MJ116', '台北小巨蛋', ['2025-07-18', '2025-07-19', '2025-07-20', '2025-07-22', '2025-07-25', '2025-07-26', '2025-07-27'], 'OGS 台北小巨蛋演唱會');
add('濱崎步', '台北小巨蛋', ['2025-08-01', '2025-08-02'], 'ayumi hamasaki Asia Tour 2025 A ～I am ayu -ep.Ⅱ-');
add(['FTISLAND', 'CNBLUE', 'N.Flying', 'Hi-Fi Un!corn'], '高雄巨蛋', ['2025-08-02', '2025-08-03'], '2025 FNC BAND KINGDOM IN KAOHSIUNG');
add('蘇打綠', '高雄巨蛋', ['2025-08-09', '2025-08-10'], '《二十年一刻》巡迴演唱會 高雄站');
add('江蕙', '台北小巨蛋', ['2025-08-12', '2025-08-13', '2025-08-15', '2025-08-16', '2025-08-17', '2025-08-19', '2025-08-20', '2025-08-22', '2025-08-23', '2025-08-24', '2025-08-26', '2025-08-27', '2025-08-29', '2025-08-30', '2025-09-01'], '《無．有》演唱會 台北站');
add('孫燕姿', '高雄巨蛋', ['2025-08-16', '2025-08-17'], '《就在日落以後》巡迴演唱會 高雄站');
add('蕭秉治', '高雄巨蛋', ['2025-08-23'], '《活著Alive》高雄巨蛋演唱會', '相信音樂');
add('八三夭 (831)', '高雄巨蛋', ['2025-08-30'], '《沒有翅膀的人》世界巡迴演唱會 高雄首站');
add('Energy', '高雄巨蛋', ['2025-09-06', '2025-09-07'], 'ALL IN 全面進擊演唱會 高雄站', '相信音樂');
add('蔡琴', '高雄巨蛋', ['2025-09-13'], '不要告別巡迴演唱會');
add('周華健', '台北小巨蛋', ['2025-09-20', '2025-09-21'], '少年的奇幻之旅3.0演唱會');
add('周興哲 (Eric Chou)', '台北小巨蛋', ['2025-09-26', '2025-09-27', '2025-09-28'], 'Odyssey~旅程巡迴演唱會 台北返場', '星空飛騰');
add('李翊君', '台北小巨蛋', ['2025-10-04'], '《翊起聽見愛》演唱會');
add(['五月天', '玖壹壹', '丁噹', 'U:NUS'], '高雄巨蛋', ['2025-10-04', '2025-10-05'], '2025 SUPER SLIPPA 超犀利趴14', '相信音樂');
add('優里', '台北小巨蛋', ['2025-10-11', '2025-10-12'], 'YUURI ASIA TOUR 2025 in TAIPEI');
add('G-DRAGON', '台北大巨蛋', ['2025-11-01', '2025-11-02'], 'Übermensch World Tour Encore in Taipei', 'Live Nation Taiwan');
add('理想混蛋', '台北小巨蛋', ['2025-11-01', '2025-11-02'], '《不是因為天氣晴朗才見面》演唱會');
add('郭富城', '高雄巨蛋', ['2025-11-08', '2025-11-09'], 'ICONIC 世界巡迴演唱會 高雄站');
add('SUPER JUNIOR', '台北大巨蛋', ['2025-11-14', '2025-11-15', '2025-11-16'], 'SUPER SHOW 10 in TAIPEI');
add('丁噹', '台北小巨蛋', ['2025-11-15', '2025-11-16'], '《夜遊 A Night Tour》小巨蛋夜未眠巡迴演唱會');
add('Marz23', '台北小巨蛋', ['2025-11-22'], '不簡單的演唱會');
add('伍佰 & China Blue', '高雄巨蛋', ['2025-11-22', '2025-11-23'], 'Rock Star 2 演唱會 高雄站', '開麗娛樂');
add(['ASIAN KUNG-FU GENERATION', '滅火器', '多組藝人'], '樂天桃園棒球場', ['2025-11-22', '2025-11-23'], '2025 FireBall Fest 火球祭', '夥球擊');
add(['超過60組民歌音樂人'], '台北大巨蛋', ['2025-11-22'], '臺北大巨蛋 民歌大團圓');
add('初音未來', '台北小巨蛋', ['2025-11-26'], 'HATSUNE MIKU EXPO 2025 TAIPEI');
add('周華健', '高雄巨蛋', ['2025-11-29'], '少年的奇幻之旅3.0巡迴演唱會');
add('NCT DREAM', '台北大巨蛋', ['2025-12-06'], 'THE DREAM SHOW 4 in Taipei');
add(['多組民歌歌手'], '高雄巨蛋', ['2025-12-06'], '2025 民歌50高峰會 最終加場');
add('ZEROBASEONE', '台北小巨蛋', ['2025-12-06'], '2025 ZEROBASEONE WORLD TOUR [HERE&NOW]');
add('羅志祥 (Show Lo)', '台北小巨蛋', ['2025-12-13', '2025-12-14'], '羅志祥30巡迴演唱會 台北站', '寬宏藝術');
add('OneRepublic', '高雄巨蛋', ['2025-12-19'], 'OneRepublic 2025 Live in Kaohsiung', 'Live Nation Taiwan');
add('宇宙人', '台北小巨蛋', ['2025-12-20'], 'α：回到未來1986 演唱會');
add('Doja Cat', '高雄巨蛋', ['2025-12-21'], 'Ma Vie World Tour', 'Live Nation Taiwan');
add('李聖傑', '台北小巨蛋', ['2025-12-26', '2025-12-27'], 'One Day 直到那一天世界巡迴演唱會');
add('蔡依林 (Jolin Tsai)', '台北大巨蛋', ['2025-12-30', '2025-12-31', '2026-01-01'], 'PLEASURE 世界巡迴演唱會 TAIPEI 2025-2026', '凌時差音樂');

// 2026 — held shows and officially announced future shows as of 2026-10-15.
add('BABYMONSTER', '台北小巨蛋', ['2026-01-02', '2026-01-03'], 'BABYMONSTER ASIA FAN CONCERT 2025-26：LOVE MONSTERS');
add('Energy', '台北小巨蛋', ['2026-01-10', '2026-01-11'], 'ALL IN 全面進擊巡迴演唱會', '相信音樂');
add('Rain', '台北小巨蛋', ['2026-01-17'], 'Still Raining: Encore');
add(['夏川里美', '告五人', '玖壹壹', '盧廣仲', '周興哲', 'A-Lin', '張信哲'], '台北大巨蛋', ['2026-01-18'], '五十・動轉未來感恩慈善演唱會');
add('SUPER JUNIOR', '高雄巨蛋', ['2026-01-23', '2026-01-24', '2026-01-25'], 'SUPER SHOW 10 in KAOHSIUNG');
add('王心凌', '台北小巨蛋', ['2026-01-23', '2026-01-24'], 'SUGAR HIGH 2.0 世界巡迴演唱會 最終場');
add('Calum Scott', '高雄巨蛋', ['2026-01-31'], 'The Avenoir Tour 2026 in Kaohsiung', 'Live Nation Taiwan');
add('TOMORROW X TOGETHER', '台北大巨蛋', ['2026-01-31', '2026-02-01'], 'ACT : TOMORROW in TAIPEI');
add('魏如萱', '台北小巨蛋', ['2026-02-07', '2026-02-08'], '《怪奇的珍珠》巡迴演唱會 台北旗艦場');
add('江蕙', '台北小巨蛋', ['2026-02-20', '2026-02-21', '2026-02-22', '2026-02-24', '2026-02-25'], '《無．有》演唱會 台北最終場');
add('OneRepublic', '台北小巨蛋', ['2026-03-04'], 'From Asia With Love', 'Live Nation Taiwan');
add('i-dle', '台北大巨蛋', ['2026-03-07'], 'Syncopation in Taipei');
add('TWICE', '台北大巨蛋', ['2026-03-20', '2026-03-21', '2026-03-22'], 'THIS IS FOR World Tour in Taipei', 'Live Nation Taiwan');
add('戴佩妮', '高雄巨蛋', ['2026-03-21'], '雙生火焰高雄巨蛋演唱會');
add('NCT WISH', '高雄巨蛋', ['2026-03-28'], 'INTO THE WISH : Our WISH in KAOHSIUNG');
add('tuki.', '台北小巨蛋', ['2026-04-04', '2026-04-05'], 'tuki. ASIA TOUR 2026');
add('G.E.M. 鄧紫棋', '台北大巨蛋', ['2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12'], 'I AM GLORIA 世界巡迴演唱會 台北站');
add('丁噹', '高雄巨蛋', ['2026-04-18'], '《夜遊 A Night Tour》高雄巨蛋夜未眠巡迴演唱會');
add('CxM', '高雄巨蛋', ['2026-04-24', '2026-04-25', '2026-04-26'], 'CxM [DOUBLE UP] LIVE PARTY in KAOHSIUNG');
add('周蕙', '台北小巨蛋', ['2026-04-25'], '《好想好好愛周蕙》演唱會');
add('ONE OK ROCK', '台北大巨蛋', ['2026-04-25', '2026-04-26'], 'DETOX ASIA TOUR 2026', 'KKLIVE');
add(['張清芳', '張清芳的好友們'], '台北小巨蛋', ['2026-04-26'], '張清芳與她的好友們慈善演唱會');
add('EXO', '台北小巨蛋', ['2026-05-09', '2026-05-10'], 'EXO PLANET #6 - EXhOrizon in TAIPEI', '超級圓頂');
add('孫燕姿', '台北大巨蛋', ['2026-05-15', '2026-05-17'], '《就在日落以後》巡迴演唱會 台北站');
add('動力火車', '台北小巨蛋', ['2026-05-15', '2026-05-16', '2026-05-17'], '《一路向前》世界巡迴演唱會 台北旗艦場');
add('韋禮安 (WeiBird)', '台北小巨蛋', ['2026-05-30', '2026-05-31'], '《韋，您好 HI WE1》巡迴演唱會', 'KKLIVE');
add('頑童MJ116', '高雄巨蛋', ['2026-06-06', '2026-06-07', '2026-06-12', '2026-06-13', '2026-06-14'], 'OGS 高雄巨蛋演唱會');
add('King Gnu', '台北小巨蛋', ['2026-06-06', '2026-06-07'], 'CEN+RAL Tour in Taipei');
add('LiSA', '台北小巨蛋', ['2026-06-19', '2026-06-20'], 'LiSA LiVE is Smile Always～15～ in Taipei');
add('ITZY', '高雄巨蛋', ['2026-06-27', '2026-06-28'], 'ITZY 3RD WORLD TOUR TUNNEL VISION in KAOHSIUNG', 'Live Nation Taiwan');
add('五月天 (Mayday)', '台北大巨蛋', ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-08', '2026-07-10', '2026-07-11', '2026-07-12'], '#5525+2 回到那一天巡迴演唱會 台北站', '相信音樂');
add('MAMAMOO', '高雄巨蛋', ['2026-07-04', '2026-07-05'], '2026 WORLD TOUR <4WARD> in KAOHSIUNG');
add('NMIXX', '高雄巨蛋', ['2026-07-11', '2026-07-12'], '1ST WORLD TOUR EPISODE 1：ZERO FRONTIER IN KAOHSIUNG');
add('EXO', '高雄巨蛋', ['2026-07-18', '2026-07-19'], 'EXO PLANET #6 - EXhOrizon in KAOHSIUNG', '超級圓頂');
add('滅火器 (Fire EX.)', '台北小巨蛋', ['2026-07-18', '2026-07-19'], 'ON FIRE DAY 2026 演唱會');
add('DxS', '高雄巨蛋', ['2026-07-24', '2026-07-25', '2026-07-26'], 'DxS [SERENADE] ON STAGE - KAOHSIUNG');
add('落日飛車', '高雄流行音樂中心 海音館', ['2026-08-08', '2026-08-09'], '落日飛車2026高雄演唱會');
add('許富凱', '台北小巨蛋', ['2026-08-08'], '《一五一拾》台北小巨蛋演唱會');
add(['多組韓國藝人'], '高雄巨蛋', ['2026-08-08'], 'K-WAVE INFINITY');
add('aespa', '台北大巨蛋', ['2026-08-11'], 'SYNK : COMPLEXITY in TAIPEI');
add('八三夭 (831)', '台北小巨蛋', ['2026-08-15', '2026-08-16'], '《沒有翅膀的人》世界巡迴演唱會 2026生日趴');
add('back number', '台北小巨蛋', ['2026-08-22', '2026-08-23'], 'Grateful Yesterdays Tour 2026 in Taipei');
add('T.O.P', '國立體育大學綜合體育館', ['2026-08-22', '2026-08-23'], 'T.O.P 2026 FAN CONCERT in TAIPEI');
add('游鴻明', '高雄巨蛋', ['2026-08-22'], '《敵不過想念》演唱會 高雄站');
add('Official髭男dism', '台北小巨蛋', ['2026-08-29', '2026-08-30'], 'OFFICIAL HIGE DANDISM ASIA TOUR 2026');
add(['多組女歌手'], '高雄巨蛋', ['2026-09-05'], 'HER VOICE - 無所畏懼的女聲');
add('ITZY', '台北小巨蛋', ['2026-09-05'], 'ITZY 3RD WORLD TOUR TUNNEL VISION in TAIPEI', 'Live Nation Taiwan');
add('IVE', '台北小巨蛋', ['2026-09-11', '2026-09-12', '2026-09-13'], 'IVE 2ND WORLD TOUR SHOW WHAT I AM IN TAIPEI', 'Live Nation Taiwan');
add('李泳知 (Lee Youngji)', '台北流行音樂中心 表演廳', ['2026-09-19', '2026-09-20'], '2026 LEE YOUNGJI WORLD TOUR <2.0>', 'Live Nation Taiwan');
add('劉若英', '高雄巨蛋', ['2026-09-12'], '《飛行日》2026巡迴演唱會 高雄站');
add('FTISLAND', '高雄流行音樂中心 海音館', ['2026-09-12'], "2026 FTISLAND TOUR 0 — XIX — III 'FaTe' in KAOHSIUNG", '希林國際');
add('THE ROSE', '高雄流行音樂中心 海音館', ['2026-09-19'], 'THE ROSE ROSETOPIA ASIA TOUR 2026 IN KAOHSIUNG');
add('蕭煌奇', '台北小巨蛋', ['2026-09-18', '2026-09-19'], 'BRAVO 演唱會');
add('Hans Zimmer', '高雄巨蛋', ['2026-09-19'], 'HANS ZIMMER LIVE - THE NEXT LEVEL IN KAOHSIUNG');
add('LANY', '台北小巨蛋', ['2026-09-26'], 'LANY: soft world tour', 'Live Nation Taiwan');
add('TREASURE', '高雄巨蛋', ['2026-09-26'], 'THE STAGE 2026 NEW WAV : LIVE IN KAOHSIUNG');
add('彭佳慧', '台北小巨蛋', ['2026-10-03'], '《數著時間的日子》巡迴演唱會');
add('PLAVE', '高雄巨蛋', ['2026-10-03'], '2026 PLAVE World Tour [KEEP IT MANIC] in Kaohsiung');
add('優里', '台北小巨蛋', ['2026-10-09', '2026-10-10'], 'YUURI 2026 LIVE IN TAIPEI');
add('BIGBANG', '台北大巨蛋', ['2026-10-10', '2026-10-11'], 'XX : COSMOS World Tour in Taipei');
add('XG', '台北小巨蛋', ['2026-10-17'], 'XG WORLD TOUR: THE CORE');
add(['AiNA THE END', 'ATEEZ', 'FRUITS ZIPPER', 'Hearts2Hearts', 'King & Prince', 'NCT WISH', '櫻坂46', '&TEAM'], '台北小巨蛋', ['2026-10-24', '2026-10-25'], 'MUSIC EXPO LIVE 2026 in TAIPEI', '寬宏藝術');
add('理想混蛋', '高雄巨蛋', ['2026-10-17', '2026-10-18'], '《不是因為天氣晴朗才見面》演唱會 高雄站');
add('Charlie Puth', '台北小巨蛋', ['2026-10-20'], "Whatever's Clever! World Tour", 'Live Nation Taiwan');
add('TWS', '高雄巨蛋', ['2026-10-24'], "2026 TWS TOUR '24/7:FOR:YOU' IN KAOHSIUNG");
add('PLAVE', '國立體育大學綜合體育館 (林口體育館)', ['2026-10-23', '2026-10-24'], '2026 PLAVE World Tour [KEEP IT MANIC] in Taipei', 'APPLEWOOD Taiwan');
add('Vaundy', '台北小巨蛋', ['2026-10-31', '2026-11-01'], 'Vaundy ASIA ARENA TOUR 2026 “HORO”', '大鴻藝術');
add('告五人 (Accusefive)', '台北小巨蛋', ['2026-11-06', '2026-11-07', '2026-11-08'], '《在這裡 @century》世界巡迴演唱會', '相信音樂');
add('孫盛希 (Shi Shi)', 'Legacy TERA', ['2026-11-01'], 'Shi Shi [The Taste Of…] 世界巡迴 台北場', 'Live Nation Taiwan');
add('徐暐翔 (Vash Hsu)', 'Legacy Taipei 傳 音樂展演空間', ['2026-11-08'], '《愛火山的人》專場演唱會', 'Live Nation Taiwan / 台灣索尼音樂娛樂');
add('82MAJOR', 'Clapper Studio', ['2026-11-08'], '82CLUB : OUT OF CONTROL in TAIPEI', 'iMe TW');
add('yung kai', 'Zepp New Taipei', ['2026-11-11'], "stay with the ocean, i'll find you: asia tour 2026", 'Live Nation Taiwan');
add('Culture Wars', 'Legacy Taipei 傳 音樂展演空間', ['2026-11-13'], 'CULTURE WARS LIVE IN TAIPEI 2026', 'Live Nation Taiwan');
add('Juice Boy', 'SUB LIVE', ['2026-11-14'], 'Where Forever Ends Live Concert 2026', 'Live Nation Taiwan');
add('Malcolm Todd', 'TICC 台北國際會議中心', ['2026-11-23'], 'Malcolm Todd: Do That Again Tour', 'Live Nation Taiwan');
add('山下智久', '高雄流行音樂中心 海音館', ['2026-11-14'], '2026 巡迴演唱會 DREAMING 高雄場');
add('LE SSERAFIM', '國立體育大學綜合體育館 (林口體育館)', ['2026-11-14', '2026-11-15'], '2026 LE SSERAFIM TOUR ‘PUREFLOW’ IN TAIPEI');
add('BINI', '新北市工商展覽中心', ['2026-11-15'], 'BINI: SIGNALS WORLD TOUR 2026 TAIPEI', 'FBG Live Taiwan');
add('BTS', '高雄國家體育場', ['2026-11-19', '2026-11-21', '2026-11-22'], "BTS WORLD TOUR 'ARIRANG' IN KAOHSIUNG", 'BIGHIT MUSIC / Live Nation Taiwan');
add('BABYMONSTER', '台北小巨蛋', ['2026-11-21', '2026-11-22'], 'BABYMONSTER WORLD TOUR [CHOOM] in TAIPEI');
add('wave to earth', 'TICC 台北國際會議中心', ['2026-11-24'], 'wave to earth - the pieces tour', 'Live Nation Taiwan');
add('Joji', '高雄巨蛋', ['2026-11-27'], 'JOJI SOLARIS', 'Live Nation Taiwan');
add('Young K', 'TICC 台北國際會議中心', ['2026-11-28', '2026-11-29'], 'Young K Solo Tour <YOUNGEST> in TAIPEI', 'Live Nation Taiwan');
add(['言承旭', '吳建豪', '周渝民', '五月天 阿信'], '台北大巨蛋', ['2026-11-28', '2026-11-29'], 'F✦FOREVER 恆星之城・光年赴約・臺北 限定場演唱會', '用心音樂 / 相信音樂 / 寬魚國際 / Live Nation Taiwan');
add('MAMAMOO', '台北小巨蛋', ['2026-11-28', '2026-11-29'], 'MAMAMOO 2026 WORLD TOUR <4WARD> in TAIPEI', '希林國際 / VIBE MAKER 希波企劃', 'https://www-ws.gov.taipei/001/Upload/617/relpic/28176/9713315/8d67f75e-a235-4a4b-b865-fbce152b2d7c.png');
add('DOMi + JD Beck', 'Clapper Studio', ['2026-12-04'], 'DOMi & JD BECK - WHO ASKED? Tour', 'Live Nation Taiwan');
add('brb.', 'Clapper Studio', ['2026-12-05'], 'brb. “half/lives” Tour', 'Live Nation Taiwan');
add('Khalid', 'TICC 台北國際會議中心', ['2026-12-07'], "Khalid: It's Always Summer Somewhere Tour", 'Live Nation Taiwan');
add('FKJ', 'Zepp New Taipei', ['2026-12-08'], 'FKJ – Tyber Tour in Taipei', 'Live Nation Taiwan');
add('Slowdive', 'Zepp New Taipei', ['2026-12-10'], 'Slowdive 2026 Live in Taipei', 'ULC Presents 有料創藝');
add('田馥甄 (Hebe)', '台北小巨蛋', ['2026-12-12', '2026-12-13', '2026-12-15', '2026-12-18', '2026-12-19', '2026-12-20'], '要去什麼地方 2026台北小巨蛋演唱會', '樂來樂好有限公司 / 何樂音樂有限公司', 'https://www-ws.gov.taipei/001/Upload/617/relpic/28176/9713720/7bba5940-80f8-48f0-9be5-17017b4b3fce.jpg');
add('劉若英', '台北小巨蛋', ['2026-12-05'], '《飛行日》2026巡迴演唱會 台北站', '相信音樂 / 相遇音樂');
add('T.O.P', '高雄巨蛋', ['2026-12-19'], 'T.O.P PRE-STUDIO 2026 in KAOHSIUNG', 'APPLEWOOD Taiwan');
add('Mr.Children', '台北小巨蛋', ['2026-12-26', '2026-12-27'], 'Mr.Children Tour 2026 “Saturday in the Park”', '雅慕斯娛樂股份有限公司', 'https://www-ws.gov.taipei/001/Upload/617/relpic/28176/9716413/baebf606-ce09-4683-b954-43e954546cc1.jpg');
add('鄭宜農 (Enno Cheng)', '高雄流行音樂中心 LIVE WAREHOUSE 大庫', ['2026-12-27'], '《缺與圓之後 Inter-Phases》高雄演唱會', '邊走邊聽有限公司');
add('鼓鼓 呂思緯 (GBOYSWAG)', '台北流行音樂中心 表演廳', ['2026-12-26'], '《我現在又在想你了 Missing You All Over Again》巡迴演唱會');
add('Stray Kids', '台北大巨蛋', ['2026-12-12'], 'Stray Kids World Tour “RUN IT” in Taipei', 'Live Nation Taiwan');
add('滅火器 (Fire EX.)', '高雄巨蛋', ['2026-12-12', '2026-12-13'], 'ON FIRE DAY 2026 高雄巨蛋演唱會');
add('5 Seconds of Summer', '台北流行音樂中心 表演廳', ['2026-11-25'], '5 SECONDS OF SUMMER: EVERYONE’S A STAR! WORLD TOUR', 'Live Nation Taiwan');
add('Kodaline', 'TICC 台北國際會議中心', ['2026-08-24'], 'Kodaline – Farewell Tour', 'Live Nation Taiwan');
add('The Kid LAROI', 'Zepp New Taipei', ['2026-07-03', '2026-07-07', '2026-07-08'], 'THE KID LAROI: A PERFECT WORLD TOUR', 'Live Nation Taiwan');
add('BE:FIRST', 'Legacy TERA', ['2026-09-27'], 'BE:FIRST WORLD SHOWCASE 2026 “WATCH ME”', 'Live Nation Taiwan');
add('Henry Moodie', '高雄 LIVE WAREHOUSE', ['2026-09-28'], 'Henry Moodie: Mood Swings World Tour', 'Live Nation Taiwan');
add('Henry Moodie', 'Legacy Taipei 傳 音樂展演空間', ['2026-10-05'], 'Henry Moodie: Mood Swings World Tour', 'Live Nation Taiwan');
add('Post Malone', '高雄國家體育場', ['2026-09-19'], 'Post Malone Presents The BIG ASS Stadium World Tour', 'Live Nation Taiwan');
add('拍謝少年', '高雄流行音樂中心 海音館', ['2026-10-10'], '2026 Takao Rock 打狗祭 ➤ Hi-ing 5 | 拍謝少年〖噪音特區 Noise Zone〗高流演唱會 | 售票專場', '高雄流行音樂中心');
add('蔡健雅', '高雄流行音樂中心 海音館', ['2026-10-17'], '2026 Takao Rock 打狗祭 KMC Select ➤國泰世華銀行 蔡健雅 除此之外 Into The B-Sides', '高雄流行音樂中心');
add('尤雅', '高雄流行音樂中心 海音館', ['2026-10-24'], '尤雅- 2026《往事只能回味》演唱會-高雄站');

// 2027 — officially announced future shows as of 2026-10-15.
add('BOYNEXTDOOR', '國立體育大學綜合體育館 (林口體育館)', ['2027-01-08', '2027-01-09', '2027-01-10'], 'BOYNEXTDOOR TOUR ‘KNOCK ON Vol.2’ IN TAIPEI', '遠雄創藝');
add('Blue', '高雄流行音樂中心 海音館', ['2027-01-17'], 'Blue 25th Anniversary Tour in Kaohsiung', 'Live Nation Taiwan');
add('Against The Current', 'TICC 台北國際會議中心', ['2027-01-15'], 'AGAINST THE CURRENT : TILL DEATH & BACK TOUR', 'Live Nation Taiwan');
add('Maroon 5', '高雄國家體育場', ['2027-01-24'], 'Maroon 5 Asia 2027 in Kaohsiung', 'Live Nation Taiwan');
add('Westlife', '高雄巨蛋', ['2027-01-30'], 'WESTLIFE 25: THE ANNIVERSARY WORLD TOUR', 'Live Nation Taiwan');
add('Freya Skye', 'Zepp New Taipei', ['2027-02-22'], 'Freya Skye - Stars Align Tour', 'Live Nation Taiwan');
add('溫室雜草 (Easy Weeds)', 'Legacy TERA', ['2027-01-29'], '〖衝突的意義_Mastering〗溫室雜草專輯發片最大場', 'Live Nation Taiwan');
add('Roy Kim', 'Zepp New Taipei', ['2027-01-30'], '2026-27 ROY KIM LIVE TOUR [R:O:Y] in TAIPEI');
add('beabadoobee', '高雄流行音樂中心 海音館', ['2027-04-11'], 'The Powerlines Tour', 'Live Nation Taiwan');
add('Bruno Mars', '高雄國家體育場', ['2027-05-01', '2027-05-02'], 'Bruno Mars - The Romantic Tour', 'Live Nation Taiwan');

const concerts = events.flatMap((event) => event.dates.flatMap((date) => event.artists.map((artist) => ({
    eventId: event.id,
    artist,
    venue: event.venue,
    date,
    theme: event.theme,
    organizer: event.organizer,
    posterUrl: event.posterUrl
})))).sort((a, b) => a.date.localeCompare(b.date) || a.theme.localeCompare(b.theme, 'zh-Hant') || a.artist.localeCompare(b.artist, 'zh-Hant'));

const existingSource = await readFile(outputPath, 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(existingSource, sandbox, { filename: outputPath });
const existingData = sandbox.window.LIVIBE_DATA;
if (!existingData?.venueData) throw new Error(`Invalid site data source: ${outputPath}`);

const meta = {
    ...(existingData.meta || {}),
    catalogSnapshot: CATALOG_SNAPSHOT,
    catalogScope: '2022–2027 台灣已舉行及已正式公告演出',
    catalogPolicy: '排除純傳聞、未定日期活動、典禮與體育中場演出'
};

const output = `/**
 * LIVIBE 網站資料唯一來源。
 * 集中管理演出、國家、城市、多語系、色票、場館與舞台配置。
 */
window.LIVIBE_DATA = ${JSON.stringify({ meta, concerts, venueData: existingData.venueData }, null, 2)};\n`;
await writeFile(outputPath, output, 'utf8');
console.log(`Rebuilt ${concerts.length} concert rows from ${events.length} verified events in site-data.js.`);
