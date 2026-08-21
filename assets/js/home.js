let allEvents = [];
const qs = (selector) => document.querySelector(selector);
const { transform: transformRawData, escapeHtml, typeLabel } = window.LIVIBE_EVENTS;

function renderStats(events) {
    const upcoming = events.filter((event) => event.isUpcoming).length;
    const venues = new Set(events.flatMap((event) => event.sessions.map((session) => session.venue))).size;
    qs('#hero-stats').innerHTML = `
        <span><strong>${events.length}</strong> 場演出</span>
        <span><strong>${upcoming}</strong> 場即將到來</span>
        <span><strong>${venues}</strong> 個場館</span>
    `;
}

function applyFilters() {
    const search = qs('#search-input').value.trim().toLowerCase();
    const tag = qs('#filter-tag').value;
    const period = qs('#filter-period').value;
    const sort = qs('#sort-order').value;

    let filtered = allEvents.filter((event) => {
        const haystack = [
            event.title,
            event.displayArtist,
            event.organizer,
            ...event.artists,
            ...event.sessions.map((session) => session.venue)
        ].join(' ').toLowerCase();
        const matchesSearch = !search || haystack.includes(search);
        const matchesTag = tag === 'all' || event.tag === tag;
        const matchesPeriod = period === 'all' || (period === 'upcoming' ? event.isUpcoming : !event.isUpcoming);
        return matchesSearch && matchesTag && matchesPeriod;
    });

    filtered.sort((a, b) => {
        if (sort === 'newest') return b.startDate.localeCompare(a.startDate);
        if (sort === 'oldest') return a.startDate.localeCompare(b.startDate);
        if (sort === 'rating') return b.rating - a.rating;
        return (b.rating + (b.isUpcoming ? 0.4 : 0)) - (a.rating + (a.isUpcoming ? 0.4 : 0));
    });

    renderGrid(filtered);
}

function renderGrid(events) {
    qs('#result-count').textContent = `${events.length} 場演出`;
    const grid = qs('#concert-grid');

    if (!events.length) {
        grid.innerHTML = '<div class="empty-state">找不到符合條件的演出，試著放寬搜尋或切換類型。</div>';
        return;
    }

    grid.innerHTML = events.map((event) => `
        <a class="concert-card" href="concert.html?id=${encodeURIComponent(event.id)}" aria-label="${escapeHtml(event.title)}">
            <div class="poster-wrapper">
                <img src="${event.poster}" alt="${escapeHtml(event.title)} 海報" loading="lazy">
                <span class="type-pill tag-${event.tag.toLowerCase()}">${typeLabel(event.tag)}</span>
            </div>
            <div class="card-content">
                <div class="card-rating">${event.rating.toFixed(1)} <span>/ 10</span></div>
                <h3>${escapeHtml(event.title)}</h3>
                <p>${escapeHtml(event.displayArtist)}</p>
                <div class="card-meta">
                    <span>${escapeHtml(event.dateDisplay)}</span>
                    <span>${escapeHtml(event.sessions[0]?.venue || '未提供場館')}</span>
                </div>
            </div>
        </a>
    `).join('');
}

function renderHomeNews(events) {
    const newsEvents = events
        .filter((event) => event.isUpcoming)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 3);

    qs('#home-news').innerHTML = newsEvents.map((event) => `
        <a class="news-card" href="concert.html?id=${encodeURIComponent(event.id)}">
            <span>${escapeHtml(event.startDate)}</span>
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.sessions[0]?.venue || '未提供場館')} 即將登場，觀眾討論熱度持續升溫。</p>
        </a>
    `).join('');
}

async function init() {
    const grid = qs('#concert-grid');
    grid.innerHTML = '<div class="empty-state">正在載入演唱會資料...</div>';

    try {
        const rawData = window.LIVIBE_DATA?.concerts;
        if (!Array.isArray(rawData)) throw new Error('演唱會資料格式錯誤');
        allEvents = transformRawData(rawData);
        renderStats(allEvents);
        renderHomeNews(allEvents);

        ['#search-input', '#filter-tag', '#filter-period', '#sort-order'].forEach((selector) => {
            qs(selector).addEventListener('input', applyFilters);
            qs(selector).addEventListener('change', applyFilters);
        });

        applyFilters();
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div class="empty-state error">資料載入失敗，請確認演唱會資料格式正確，並透過本機伺服器開啟頁面。</div>';
    }
}

init();
