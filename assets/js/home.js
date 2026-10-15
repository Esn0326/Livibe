let allEvents = [];
let filteredEvents = [];
let visibleCount = 24;
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const PAGE_SIZE = 24;
const qs = (selector) => document.querySelector(selector);
const { transform: transformRawData, escapeHtml, typeLabel } = window.LIVIBE_EVENTS;
const COMMUNITY = window.LIVIBE_COMMUNITY;

function renderStats(events) {
    const upcoming = events.filter((event) => event.isUpcoming).length;
    const venues = new Set(events.flatMap((event) => event.sessions.map((session) => session.venue))).size;
    const catalogSnapshot = window.LIVIBE_DATA?.meta?.catalogSnapshot;
    qs('#hero-stats').innerHTML = `
        <span><strong>${events.length}</strong> 場演出</span>
        <span><strong>${upcoming}</strong> 場即將到來</span>
        <span><strong>${venues}</strong> 個場館</span>
        ${catalogSnapshot ? `<span><strong>${escapeHtml(catalogSnapshot)}</strong> 資料查證基準</span>` : ''}
    `;
}

function applyFilters({ reset = true } = {}) {
    const search = qs('#search-input').value.trim().toLowerCase();
    const tag = qs('#filter-tag').value;
    const period = qs('#filter-period').value;
    const sort = qs('#sort-order').value;

    filteredEvents = allEvents.filter((event) => {
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

    filteredEvents.sort((a, b) => {
        if (sort === 'newest') return b.startDate.localeCompare(a.startDate);
        if (sort === 'oldest') return a.startDate.localeCompare(b.startDate);
        if (sort === 'rating') {
            const aSummary = COMMUNITY.summary(a);
            const bSummary = COMMUNITY.summary(b);
            return Number(bSummary.isRepresentative) - Number(aSummary.isRepresentative)
                || (bSummary.isRepresentative ? (bSummary.average ?? -1) - (aSummary.average ?? -1) : 0)
                || bSummary.count - aSummary.count
                || b.startDate.localeCompare(a.startDate);
        }
        if (a.isUpcoming !== b.isUpcoming) return a.isUpcoming ? -1 : 1;
        return a.isUpcoming
            ? a.startDate.localeCompare(b.startDate)
            : b.startDate.localeCompare(a.startDate);
    });

    if (reset) visibleCount = PAGE_SIZE;
    renderCalendar(filteredEvents);
    renderGrid();
}

function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar(events) {
    const grid = qs('#calendar-grid');
    const monthLabel = qs('#calendar-month');
    const countLabel = qs('#calendar-count');
    if (!grid || !monthLabel || !countLabel) return;

    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    monthLabel.textContent = `${year} 年 ${month + 1} 月`;

    const sessionsByDate = new Map();
    events.forEach((event) => {
        event.sessions.forEach((session) => {
            if (!sessionsByDate.has(session.date)) sessionsByDate.set(session.date, []);
            sessionsByDate.get(session.date).push(event);
        });
    });
    sessionsByDate.forEach((dayEvents) => dayEvents.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant')));

    const monthEventCount = Array.from(sessionsByDate.entries())
        .filter(([date]) => date.startsWith(monthKey))
        .reduce((total, [, dayEvents]) => total + dayEvents.length, 0);
    countLabel.textContent = `本月 ${monthEventCount} 場符合目前篩選條件`;

    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());
    const todayKey = localDateKey(new Date());
    const cells = [];

    for (let index = 0; index < 42; index += 1) {
        const cellDate = new Date(gridStart);
        cellDate.setDate(gridStart.getDate() + index);
        const dateKey = localDateKey(cellDate);
        const dayEvents = sessionsByDate.get(dateKey) || [];
        const visibleEvents = dayEvents.slice(0, 3);
        const classNames = ['calendar-day'];
        if (cellDate.getMonth() !== month) classNames.push('outside-month');
        if (dateKey === todayKey) classNames.push('today');

        cells.push(`
            <div class="${classNames.join(' ')}" role="gridcell" aria-label="${dateKey}，${dayEvents.length} 場演出">
                <div class="calendar-date-row">
                    <time datetime="${dateKey}">${cellDate.getDate()}</time>
                    ${dateKey === todayKey ? '<span>今天</span>' : ''}
                </div>
                <div class="calendar-day-events">
                    ${visibleEvents.map((event) => `
                        <a class="calendar-event ${dateKey >= todayKey ? 'upcoming' : 'past'}"
                           href="concert.html?id=${encodeURIComponent(event.id)}"
                           title="${escapeHtml(event.title)}｜${escapeHtml(event.sessions.find((session) => session.date === dateKey)?.venue || '')}">
                            ${escapeHtml(event.title)}
                        </a>
                    `).join('')}
                    ${dayEvents.length > visibleEvents.length ? `<span class="calendar-more">另有 ${dayEvents.length - visibleEvents.length} 場</span>` : ''}
                </div>
            </div>
        `);
    }

    grid.innerHTML = cells.join('');
}

function moveCalendarMonth(offset) {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + offset, 1);
    renderCalendar(filteredEvents);
}

function scoreDisplay(event) {
    const summary = COMMUNITY.summary(event);
    const label = summary.kind === 'expectation' ? '期待度' : '觀眾評分';
    if (!summary.count) return `<span class="card-rating-label">${label}</span> 等待首評`;
    if (!summary.isRepresentative) {
        return `<span class="card-rating-label">${label}</span> 樣本不足 <span>· ${summary.count} / ${summary.minimumSamples} 則</span>`;
    }
    return `<span class="card-rating-label">${label}</span> ${summary.average.toFixed(1)} <span>/ 10 · ${summary.count} 則</span>`;
}

function renderGrid() {
    const events = filteredEvents.slice(0, visibleCount);
    qs('#result-count').textContent = `顯示 ${events.length} / ${filteredEvents.length} 場`;
    const grid = qs('#concert-grid');
    const loadMore = qs('#load-more-button');

    if (!filteredEvents.length) {
        grid.innerHTML = '<div class="empty-state">找不到符合條件的演出，試著放寬搜尋或切換類型。</div>';
        loadMore.hidden = true;
        return;
    }

    grid.innerHTML = events.map((event) => `
        <a class="concert-card" href="concert.html?id=${encodeURIComponent(event.id)}" aria-label="${escapeHtml(event.title)}">
            <div class="poster-wrapper">
                <img src="${event.poster}" data-fallback-poster="${event.fallbackPoster}" alt="${escapeHtml(event.title)} 海報" loading="lazy">
                <span class="type-pill tag-${event.tag.toLowerCase()}">${typeLabel(event.tag)}</span>
            </div>
            <div class="card-content">
                <div class="card-rating">${scoreDisplay(event)}</div>
                <h3>${escapeHtml(event.title)}</h3>
                <p>${escapeHtml(event.displayArtist)}</p>
                <div class="card-meta">
                    <span>${escapeHtml(event.dateDisplay)}</span>
                    <span>${escapeHtml(event.sessions[0]?.venue || '未提供場館')}</span>
                </div>
            </div>
        </a>
    `).join('');
    grid.querySelectorAll('img[data-fallback-poster]').forEach((image) => {
        image.addEventListener('error', () => {
            const fallbackPoster = image.dataset.fallbackPoster;
            if (fallbackPoster && image.src !== fallbackPoster) image.src = fallbackPoster;
        }, { once: true });
    });
    loadMore.hidden = visibleCount >= filteredEvents.length;
    loadMore.textContent = `載入更多（尚有 ${Math.max(0, filteredEvents.length - visibleCount)} 場）`;
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
            <p>${escapeHtml(event.sessions[0]?.venue || '未提供場館')} 即將登場，場次與場館資訊已收錄。</p>
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
            qs(selector).addEventListener('input', () => applyFilters());
            qs(selector).addEventListener('change', () => applyFilters());
        });

        qs('#load-more-button').addEventListener('click', () => {
            visibleCount += PAGE_SIZE;
            renderGrid();
        });

        qs('#calendar-prev').addEventListener('click', () => moveCalendarMonth(-1));
        qs('#calendar-next').addEventListener('click', () => moveCalendarMonth(1));
        qs('#calendar-today').addEventListener('click', () => {
            const today = new Date();
            calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
            renderCalendar(filteredEvents);
        });

        applyFilters();
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div class="empty-state error">資料載入失敗，請確認演唱會資料格式正確，並透過本機伺服器開啟頁面。</div>';
    }
}

init();
