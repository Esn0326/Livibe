let allEvents = [];

// === 新增：使用 iTunes API 動態抓取海報 ===
async function fetchPoster(keyword) {
    try {
        // 透過 iTunes 搜尋藝人或活動的專輯/單曲封面
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=album&limit=1`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            // iTunes 預設回傳 100x100，我們將字串替換以取得 600x600 高畫質圖
            return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
        }
    } catch (e) {
        console.error('海報抓取失敗:', e);
    }
    // 若找不到相關圖片，給予一張質感的預設展演空間圖
    return "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600";
}

// === 核心轉換引擎 (升級為 Async 以支援圖片抓取) ===
async function transformRawData(rawData) {
    const flatData = Array.isArray(rawData[0]) ? rawData.flat() : rawData;
    const grouped = {};

    flatData.forEach(item => {
        if (!grouped[item.theme]) {
            grouped[item.theme] = {
                id: 'evt_' + Math.random().toString(36).substr(2, 9),
                title: item.theme,
                organizer: item.organizer,
                rawItems: []
            };
        }
        grouped[item.theme].rawItems.push(item);
    });

    // 使用 Promise.all 處理所有非同步的海報抓取任務
    const transformedData = await Promise.all(Object.values(grouped).map(async (group) => {
        const items = group.rawItems;
        const all_artists = Array.from(new Set(items.map(i => i.artist)));

        const dateMap = {};
        items.forEach(i => {
            const cleanDate = (i.date.match(/\d{4}-\d{2}-\d{2}/) || [i.date])[0];
            if (!dateMap[cleanDate]) dateMap[cleanDate] = { venue: i.venue, artists: [], rawDate: i.date };
            dateMap[cleanDate].artists.push(i.artist);
        });

        const sortedDates = Object.keys(dateMap).sort();
        const startDate = sortedDates[0];

        const sessions = sortedDates.map((date, idx) => ({
            id: group.id + '_s' + idx,
            date: dateMap[date].rawDate,
            venue: dateMap[date].venue
        }));

        const performance_days = sortedDates.map((date, idx) => ({
            date: `${dateMap[date].rawDate} (Day ${idx + 1})`,
            artists: dateMap[date].artists
        }));

        // 💡 邏輯優化 1：FESTIVAL 雙重判定 (關鍵字 + 藝人數量)
        const festivalKeywords = /季|節|祭|大港開唱|Festival/i;
        const isFestival = all_artists.length > 2 ||
                           festivalKeywords.test(group.title) ||
                           festivalKeywords.test(items[0].venue);

        const tag = isFestival ? "FESTIVAL" : (sessions.length > 1 ? "TOUR" : "SHOWCASE");

        // 💡 邏輯優化 2：清除標題贅詞
        const cleanTitle = group.title.replace(/(世界)?(巡迴)?演唱會/g, '').trim();

        // 💡 邏輯優化 3：動態抓取海報 (音樂祭搜標題，巡演搜藝人)
        const searchKeyword = isFestival ? cleanTitle : all_artists[0].split('(')[0].trim(); // 移除 (日)、(韓) 等註記
        const dynamicPoster = await fetchPoster(searchKeyword);

        return {
            id: group.id,
            title: cleanTitle, // 使用清理過的標題
            display_artist: isFestival ? "多組藝人出演" : all_artists[0],
            all_artists: all_artists,
            tag: tag,
            start_date: startDate,
            date_display: sessions.length > 1 ? `${startDate} 起 (共 ${sessions.length} 場)` : startDate,
            poster: dynamicPoster, // 使用 API 抓取的海報
            db: Math.floor(Math.random() * (125 - 90 + 1)) + 90,
            organizer: group.organizer,
            sessions: sessions,
            performance_days: performance_days
        };
    }));

    return transformedData;
}

// === 初始化與載入 ===
async function init() {
    // 可以在這裡加入 Loading 動畫邏輯，因為抓圖片會花一點點時間
    const grid = document.getElementById('concert-grid');
    grid.innerHTML = '<h2 style="color:var(--imdb-yellow); text-align:center; width:100%;">正在為您抓取最新演出海報...</h2>';

    try {
        const r = await fetch('data.json');
        const rawData = await r.json();

        // 等待所有資料轉換與海報抓取完成
        allEvents = await transformRawData(rawData);

        document.getElementById('search-input').addEventListener('input', applyFilters);
        document.getElementById('filter-tag').addEventListener('change', applyFilters);
        document.getElementById('sort-order').addEventListener('change', applyFilters);

        applyFilters();
    } catch (error) {
        console.error("初始化失敗:", error);
        grid.innerHTML = '<h2 style="color:red; text-align:center; width:100%;">資料載入失敗，請確認 data.json 格式正確。</h2>';
    }
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const tag = document.getElementById('filter-tag').value;
    const sort = document.getElementById('sort-order').value;

    let filtered = allEvents.filter(item => {
        const matchSearch = item.title.toLowerCase().includes(search) ||
                            item.all_artists.some(a => a.toLowerCase().includes(search));
        const matchTag = (tag === 'all' || item.tag === tag);
        return matchSearch && matchTag;
    });

    filtered.sort((a, b) => {
        const dA = new Date(a.start_date), dB = new Date(b.start_date);
        return sort === 'newest' ? dB - dA : dA - dB;
    });

    render(filtered);
}

function render(events) {
    const grid = document.getElementById('concert-grid');
    grid.innerHTML = events.map(item => `
        <div class="concert-card" onclick="location.href='concert.html?id=${encodeURIComponent(item.title)}'">
            <div class="fest-tag tag-${item.tag.toLowerCase()}">${item.tag}</div>
            <div class="poster-wrapper"><img src="${item.poster}" loading="lazy"></div>
            <div class="card-content">
                <div class="card-title">${item.title}</div>
                <div class="card-artist">${item.display_artist}</div>
                <div class="card-artist" style="margin-top:8px;">
                    📅 ${item.date_display}
                </div>
            </div>
        </div>
    `).join('');
}

init();