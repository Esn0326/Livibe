// === 確保抓圖邏輯 (同樣加入到 detail.js) ===
async function fetchPoster(keyword) {
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=album&limit=1`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
        }
    } catch (e) { console.error('海報抓取失敗:', e); }
    return "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600";
}

async function loadDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    try {
        const r = await fetch('data.json');
        const rawData = await r.json();

        // 1. 先用 transformRawData 轉換資料，讓結構與 main.js 一致
        const allEvents = transformRawData(rawData);

        // 2. 安全尋找：檢查 allEvents 是否為陣列
        if (!allEvents || !Array.isArray(allEvents)) {
            throw new Error("無法解析資料");
        }

        const item = allEvents.find(i => i.title === id || i.id === id);

        if (!item) {
            document.getElementById('detail-title').innerText = "找不到演出詳情";
            return;
        }

        // 3. 處理海報 (如果沒有預設圖片，就呼叫 API)
        const posterImg = document.getElementById('detail-poster');
        posterImg.src = await fetchPoster(item.all_artists[0]);

        // 4. 其餘 UI 渲染
        document.getElementById('detail-title').innerText = item.title.replace(/(世界)?(巡迴)?演唱會/g, '');

        const dbHtml = `<div style="color:#F5C518; margin:10px 0;">🔊 ${item.db || 95} dB</div>`;
        document.getElementById('detail-title').insertAdjacentHTML('afterend', dbHtml);

        const tagEl = document.getElementById('tag-display');
        tagEl.innerText = item.tag;
        tagEl.className = `ui-tag tag-${item.tag.toLowerCase()}`;

        // 設定場次資訊
        const dateEl = document.getElementById('display-date');
        const venueEl = document.getElementById('display-venue');
        const mapEl = document.getElementById('display-map');

        if(item.sessions && item.sessions.length > 0) {
            dateEl.innerText = item.sessions[0].date;
            venueEl.innerText = item.sessions[0].venue;
            mapEl.href = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(item.sessions[0].venue)}`;
        }

    } catch (error) {
        console.error("載入失敗:", error);
    }
}

// 確保這段函數存在 (你在 detail.js 裡本來就有的)
function transformRawData(rawData) {
    const flatData = Array.isArray(rawData[0]) ? rawData.flat() : rawData;
    const grouped = {};
    flatData.forEach(item => {
        if (!grouped[item.theme]) {
            grouped[item.theme] = { id: 'evt_' + Math.random().toString(36).substr(2, 9), title: item.theme, organizer: item.organizer, rawItems: [] };
        }
        grouped[item.theme].rawItems.push(item);
    });

    return Object.values(grouped).map(group => {
        const items = group.rawItems;
        const all_artists = Array.from(new Set(items.map(i => i.artist)));
        const dateMap = {};
        items.forEach(i => {
            const cleanDate = (i.date.match(/\d{4}-\d{2}-\d{2}/) || [i.date])[0];
            if (!dateMap[cleanDate]) dateMap[cleanDate] = { venue: i.venue, artists: [], rawDate: i.date };
            dateMap[cleanDate].artists.push(i.artist);
        });
        const sortedDates = Object.keys(dateMap).sort();
        const sessions = sortedDates.map((date, idx) => ({ id: group.id + '_s' + idx, date: dateMap[date].rawDate, venue: dateMap[date].venue }));
        const performance_days = sortedDates.map((date, idx) => ({ date: dateMap[date].rawDate, artists: dateMap[date].artists }));

        const isFestival = all_artists.length > 2 || /季|節|祭|大港開唱|Festival/i.test(group.title);

        return {
            ...group,
            all_artists,
            sessions,
            performance_days,
            tag: isFestival ? "FESTIVAL" : (sessions.length > 1 ? "TOUR" : "SHOWCASE"),
            db: Math.floor(Math.random() * (125 - 90 + 1)) + 90
        };
    });
}

loadDetail();