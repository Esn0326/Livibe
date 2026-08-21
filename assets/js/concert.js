let currentEvent = null;
let currentSessionIndex = 0;
const qs = (selector) => document.querySelector(selector);
const { transform: transformRawData, escapeHtml, typeLabel } = window.LIVIBE_EVENTS;
const ACCESS = window.LIVIBE_ACCESS;
const CONCERT_CONFIG_KEY = 'livibe-concert-venue-configs';
const RAW_VENUES = window.LIVIBE_DATA?.venueData?.venues || [];
const CONCERT_IMPORTED_ZONE_INFO = {};

function venueConfigs(venue) {
    if (venue.id === 'taipei-arena') {
        return [
            { id: 'taipei-arena-single', label: '單側舞台', mapKind: 'taipei-single', zoneCount: 48 },
            { id: 'taipei-arena-center', label: '中央舞台', mapKind: 'taipei-center', zoneCount: 48 }
        ];
    }
    if (venue.id === 'ntsu-arena-linkou') {
        return [{ id: 'ntsu-arena-linkou-local', label: '標準舞台', mapKind: 'linkou', zoneCount: 48 }];
    }
    return Array.isArray(venue.configs) ? venue.configs : [];
}

const CONCERT_VENUES = RAW_VENUES.map((venue) => ({ ...venue, configs: venueConfigs(venue) }));

function normalizedVenueName(value) {
    return String(value || '')
        .replace(/臺/g, '台')
        .replace(/[\s·・()（）\-]/g, '')
        .replace(/體育館|綜合體育館|主場館|展演館/g, '館')
        .toLowerCase();
}

function findSessionVenue(sessionVenue) {
    const target = normalizedVenueName(sessionVenue);
    const aliasId = /林口|國立體育大學/.test(sessionVenue) ? 'ntsu-arena-linkou' : null;
    if (aliasId) return CONCERT_VENUES.find((venue) => venue.id === aliasId) || null;
    return CONCERT_VENUES.find((venue) => {
        const candidate = normalizedVenueName(venue.name);
        return candidate === target || candidate.includes(target) || target.includes(candidate);
    }) || null;
}

function concertConfigKey(event, session) {
    return `${event.id}:${session.date}:${normalizedVenueName(session.venue)}`;
}

function readConcertConfigs() {
    try {
        return JSON.parse(localStorage.getItem(CONCERT_CONFIG_KEY) || '{}');
    } catch {
        return {};
    }
}

function selectedVenueConfig(event, session, venue) {
    const configs = venue?.configs || [];
    const savedId = readConcertConfigs()[concertConfigKey(event, session)];
    return configs.find((config) => config.id === savedId) || configs[0] || null;
}

function mapsUrl(venue) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

function discussionKey(eventId) {
    return `livibe-discussion-${eventId}`;
}

function deletedDiscussionKey(eventId) {
    return `livibe-deleted-discussion-${eventId}`;
}

function stableDiscussionId(item, index) {
    const seed = `${item.name}|${item.time}|${item.text}|${index}`;
    let hash = 0;
    for (const char of seed) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    return `local-${Math.abs(hash)}`;
}

function getStoredDiscussion(eventId) {
    try {
        const items = JSON.parse(localStorage.getItem(discussionKey(eventId)) || '[]');
        let migrated = false;
        const normalized = items.map((item, index) => {
            if (item.id) return item;
            migrated = true;
            return { ...item, id: stableDiscussionId(item, index) };
        });
        if (migrated) localStorage.setItem(discussionKey(eventId), JSON.stringify(normalized));
        return normalized;
    } catch {
        return [];
    }
}

function getDeletedDiscussion(eventId) {
    try {
        return new Set(JSON.parse(localStorage.getItem(deletedDiscussionKey(eventId)) || '[]'));
    } catch {
        return new Set();
    }
}

function defaultDiscussion(event) {
    return [
        {
            id: 'default-editorial',
            name: 'LIVIBE 編輯部',
            rating: event.rating,
            text: `${event.sessions[0]?.venue || '場館'} 的動線與音場表現是本場值得觀察的重點。`,
            time: '精選留言'
        },
        {
            id: 'default-community',
            name: '觀眾 Mina',
            rating: Math.max(7, Math.round(event.rating - 0.4)),
            text: '希望大家補充不同區域視角，之後買票更有參考價值。',
            time: '討論串'
        }
    ];
}

function updateSession(index) {
    currentSessionIndex = index;
    const session = currentEvent.sessions[index];
    qs('#display-date').textContent = session.label;
    qs('#display-venue').textContent = session.venue;
    qs('#display-map').href = mapsUrl(session.venue);
    qs('#diagram-venue-name').textContent = `${session.venue} · 本場配置`;
    renderConcertVenueConfiguration(currentEvent, session);
}

function renderArtists(event) {
    if (event.tag === 'FESTIVAL') {
        qs('#artist-list').innerHTML = event.sessions.map((session, index) => `
            <div class="artist-day">
                <h3>Day ${index + 1} · ${escapeHtml(session.label)}</h3>
                <ul>${[...new Set(session.artists)].map((artist) => `<li>${escapeHtml(artist)}</li>`).join('')}</ul>
            </div>
        `).join('');
        return;
    }

    qs('#artist-list').innerHTML = `
        <h3>演出藝人</h3>
        <ul>${event.artists.map((artist) => `<li>${escapeHtml(artist)}</li>`).join('')}</ul>
    `;
}

function renderNews(event) {
    const keywords = encodeURIComponent(`${event.title} ${event.displayArtist}`);
    const news = [
        ['LIVIBE Guide', `${event.title} 演出資訊與場館指南`, '整理日期、場館、主辦單位與入場前可先確認的重點。', '#venue-section'],
        ['Community Watch', `${event.displayArtist} 近期演出討論熱度上升`, '觀眾最常關注票區視線、音響表現與交通散場安排。', '#discussion-section'],
        ['Google News', '查看外部新聞搜尋', '以演出名稱與藝人作為關鍵字，查看最新公開報導。', `https://news.google.com/search?q=${keywords}`]
    ];

    qs('#news-list').innerHTML = news.map(([source, title, copy, href], index) => `
        <a class="news-card" href="${href}" ${index === 2 ? 'target="_blank" rel="noopener"' : ''}>
            <span>${escapeHtml(source)}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(copy)}</p>
        </a>
    `).join('');
}

function renderDiscussion(event) {
    const deleted = getDeletedDiscussion(event.id);
    const items = [
        ...getStoredDiscussion(event.id).map((item) => ({ ...item, source: 'stored' })),
        ...defaultDiscussion(event).filter((item) => !deleted.has(item.id)).map((item) => ({ ...item, source: 'default' }))
    ];
    const canDelete = ACCESS.can('discussion.delete');
    const list = qs('#discussion-list');
    list.innerHTML = items.map((item) => `
        <article class="discussion-item">
            <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.time)}</span>
                ${canDelete ? `<button class="discussion-delete" type="button" data-discussion-id="${escapeHtml(item.id)}" data-discussion-source="${item.source}" aria-label="刪除 ${escapeHtml(item.name)} 的留言">刪除</button>` : ''}
            </div>
            <p>${escapeHtml(item.text)}</p>
            <small>${Number(item.rating).toFixed(1)} / 10</small>
        </article>
    `).join('');
    list.querySelectorAll('.discussion-delete').forEach((button) => button.addEventListener('click', () => {
        if (!ACCESS.can('discussion.delete')) return;
        if (button.dataset.discussionSource === 'stored') {
            const next = getStoredDiscussion(event.id).filter((item) => item.id !== button.dataset.discussionId);
            localStorage.setItem(discussionKey(event.id), JSON.stringify(next));
        } else {
            const nextDeleted = getDeletedDiscussion(event.id);
            nextDeleted.add(button.dataset.discussionId);
            localStorage.setItem(deletedDiscussionKey(event.id), JSON.stringify([...nextDeleted]));
        }
        renderDiscussion(event);
    }));
}

function updateReviewPermissions() {
    const allowed = ACCESS.can('discussion.create');
    qs('#review-form').querySelectorAll('select, textarea, button').forEach((control) => { control.disabled = !allowed; });
    qs('#review-form button[type="submit"]').textContent = allowed ? '送出討論' : '訪客無法留言';
}

function bindReviewForm(event) {
    qs('#review-form').addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        if (!ACCESS.can('discussion.create')) return;
        const text = qs('#review-text').value.trim();
        if (!text) return;
        const items = getStoredDiscussion(event.id);
        items.unshift({
            id: globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`,
            name: '我的留言',
            rating: Number(qs('#review-rating').value),
            text,
            time: '剛剛'
        });
        localStorage.setItem(discussionKey(event.id), JSON.stringify(items.slice(0, 10)));
        qs('#review-text').value = '';
        renderDiscussion(event);
    });
}

function bindWatchlist(event) {
    const key = 'livibe-watchlist';
    const button = qs('#watchlist-button');
    const read = () => JSON.parse(localStorage.getItem(key) || '[]');
    const update = () => {
        button.textContent = read().includes(event.id) ? '已加入片單' : '加入片單';
    };
    button.addEventListener('click', () => {
        const list = read();
        const next = list.includes(event.id) ? list.filter((id) => id !== event.id) : [...list, event.id];
        localStorage.setItem(key, JSON.stringify(next));
        update();
    });
    update();
}

function genericConcertImportedView(zone, venue, config, index) {
    const label = zone.dataset.zoneLabel || zone.getAttribute('aria-label') || zone.id || `區域 ${index + 1}`;
    return {
        title: `${label} 座位視野`,
        location: `${venue.name} · ${config.label}`,
        score: (7.8 + (index % 9) / 10).toFixed(1),
        copy: `此區屬於「${config.label}」配置；實際視線仍會依延伸台、燈光、音響與現場器材位置調整。`,
        tags: ['場館配置', config.label],
        photo: index % 4
    };
}

function customConcertMapMarkup(config) {
    if (config.mapKind === 'taipei-single') return window.singleSideArenaMapMarkup();
    if (config.mapKind === 'taipei-center') return window.centralStageMapMarkup();
    if (config.mapKind === 'linkou') return window.linkouArenaMapMarkup();
    return '';
}

function renderConcertConfigControl(event, session, venue, config) {
    const container = qs('#concert-config-admin');
    if (!container) return;
    if (!venue || !config) {
        container.innerHTML = '<span class="concert-config-status">此場館尚未建立座位配置</span>';
        return;
    }
    const canManage = ACCESS.can('concert.venue_config.manage');
    container.innerHTML = `
        <span class="concert-config-status">目前配置：${escapeHtml(config.label)}</span>
        ${canManage ? `<label class="concert-config-control">
            <span>修改本場配置</span>
            <select aria-label="修改演唱會場館配置">
                ${venue.configs.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === config.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}
            </select>
        </label>` : ''}`;
    container.querySelector('select')?.addEventListener('change', (changeEvent) => {
        if (!ACCESS.can('concert.venue_config.manage')) return;
        const settings = readConcertConfigs();
        settings[concertConfigKey(event, session)] = changeEvent.target.value;
        localStorage.setItem(CONCERT_CONFIG_KEY, JSON.stringify(settings));
        renderConcertVenueConfiguration(event, session);
    });
}

async function renderConcertVenueConfiguration(event, session) {
    const venue = findSessionVenue(session.venue);
    const config = selectedVenueConfig(event, session, venue);
    renderConcertConfigControl(event, session, venue, config);
    const diagram = qs('#stage-svg-diagram');
    if (!diagram) return;
    const renderToken = `${event.id}:${session.date}:${config?.id || 'missing'}:${Date.now()}`;
    diagram.dataset.renderToken = renderToken;
    diagram.classList.remove('taipei-arena-diagram', 'linkou-arena-diagram', 'imported-venue-diagram');
    diagram.classList.add(config?.mapKind === 'linkou'
        ? 'linkou-arena-diagram'
        : config?.mapKind
            ? 'taipei-arena-diagram'
            : 'imported-venue-diagram');
    diagram.style.width = '100%';
    diagram.dataset.scale = '1';
    diagram.setAttribute('aria-label', `${session.venue}・${config?.label || '尚無配置'}互動座位圖`);
    const hideButton = document.querySelector('#venue-section [data-map-action="hide-empty"]');
    if (hideButton) {
        hideButton.disabled = Boolean(config?.mapAsset && !config.mapKind);
        hideButton.textContent = hideButton.disabled ? '照片狀態未同步' : '隱藏無照片區';
        hideButton.classList.remove('active');
    }

    if (!venue || !config) {
        diagram.setAttribute('viewBox', '0 0 1000 600');
        diagram.innerHTML = '<text class="map-error-label" x="500" y="300">此場館尚未建立座位配置</text>';
        return;
    }

    try {
        if (config.mapAsset && !config.mapKind) {
            diagram.setAttribute('viewBox', config.viewBox || '0 0 1000 1000');
            diagram.innerHTML = '<text class="map-loading-label" x="50%" y="50%">座位圖載入中…</text>';
            await window.LIVIBE_MAP_UTILS.loadImportedMap({
                diagram,
                venue,
                config,
                renderToken,
                createView: (zone, index) => genericConcertImportedView(zone, venue, config, index),
                infoStore: CONCERT_IMPORTED_ZONE_INFO
            });
        } else {
            diagram.setAttribute('viewBox', config.mapKind === 'linkou' ? '0 0 2550 2550' : '0 0 2550 3488');
            diagram.innerHTML = customConcertMapMarkup(config);
        }
        if (diagram.dataset.renderToken !== renderToken) return;
        bindSvgStageControls();
    } catch (error) {
        console.error(error);
        if (diagram.dataset.renderToken === renderToken) {
            diagram.setAttribute('viewBox', '0 0 1000 600');
            diagram.innerHTML = '<text class="map-error-label" x="500" y="300">座位圖載入失敗</text>';
        }
    }
}

function renderDetail(event) {
    currentEvent = event;
    document.title = `LIVIBE | ${event.title}`;
    qs('#detail-poster').style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.62)), url("${event.poster}")`;
    qs('#tag-display').textContent = typeLabel(event.tag);
    qs('#tag-display').className = `type-pill tag-${event.tag.toLowerCase()}`;
    qs('#status-display').textContent = event.isUpcoming ? '即將到來' : '歷史演出';
    qs('#detail-title').textContent = event.title;
    qs('#detail-artist').textContent = event.displayArtist;
    qs('#rating-score').textContent = event.rating.toFixed(1);
    qs('#volume-score').textContent = `${event.volume} dB`;
    qs('#display-organizer').textContent = event.organizer;
    window.setupArenaMapControls(qs('#stage-svg-diagram'), document.querySelector('#venue-section [data-map-tools]'));
    qs('#summary-text').textContent = `${event.title} 收錄於 LIVIBE 演唱會資料庫，目前包含 ${event.sessions.length} 個場次、${event.artists.length} 組演出名單與場館資訊。`;

    const dropdown = qs('#session-dropdown');
    dropdown.innerHTML = event.sessions.map((session, index) => `<option value="${index}">${escapeHtml(session.label)} · ${escapeHtml(session.venue)}</option>`).join('');
    qs('#session-container').style.display = event.sessions.length > 1 ? 'block' : 'none';
    dropdown.addEventListener('change', () => updateSession(Number(dropdown.value)));
    updateSession(0);

    renderArtists(event);
    renderNews(event);
    renderDiscussion(event);
    ACCESS.mountRoleControl(qs('#discussion-role-control'));
    updateReviewPermissions();
    bindReviewForm(event);
    bindWatchlist(event);
}

window.addEventListener('livibe:rolechange', () => {
    ACCESS.mountRoleControl(qs('#discussion-role-control'));
    updateReviewPermissions();
    if (currentEvent) {
        renderDiscussion(currentEvent);
        const session = currentEvent.sessions[currentSessionIndex];
        const venue = findSessionVenue(session.venue);
        renderConcertConfigControl(currentEvent, session, venue, selectedVenueConfig(currentEvent, session, venue));
    }
});

async function loadDetail() {
    const id = new URLSearchParams(window.location.search).get('id');

    try {
        const rawData = window.LIVIBE_DATA?.concerts;
        if (!Array.isArray(rawData)) throw new Error('演唱會資料格式錯誤');
        const events = transformRawData(rawData);
        const event = events.find((item) => item.id === id || item.title === id);
        if (!event) {
            qs('#detail-title').textContent = '找不到這場演出';
            qs('#summary-text').textContent = '請回到首頁重新選擇演唱會。';
            return;
        }
        renderDetail(event);
    } catch (error) {
        console.error(error);
        qs('#detail-title').textContent = '資料載入失敗';
        qs('#summary-text').textContent = '請確認演唱會資料格式正確，並透過本機伺服器開啟頁面。';
    }
}

loadDetail();
function bindSvgStageControls() {
    const stageDescriptions = {
        v001: { title: '特區 001', location: '平面區 · 前段左側', score: '9.2', copy: '距離表演者很近，能清楚看到表情；觀看主舞台需要稍微向右轉。', tags: ['近距離', '側面視角'], photo: 0 },
        v002: { title: '特區 002', location: '平面區 · 中央偏左', score: '9.0', copy: '兼顧近距離震撼感與主音場表現，延伸舞台經過時距離很近。', tags: ['延伸舞台近', '音場均衡'], photo: 1 },
        v003: { title: '特區 003', location: '平面區 · 延伸台左側', score: '9.5', copy: '延伸舞台神位，藝人走近時幾乎不需要看大螢幕。', tags: ['神席', '人物清楚'], photo: 2 },
        v004: { title: '特區 004', location: '平面區 · 延伸台右側', score: '9.4', copy: '延伸舞台右側第一視角，主舞台完整度也很高。', tags: ['神席', '舞台完整'], photo: 3 },
        v005: { title: '特區 005', location: '平面區 · 中央偏右', score: '8.9', copy: '視野優異、包圍感強烈，適合想兼顧近距離與舞台效果的觀眾。', tags: ['近距離', '包圍感'], photo: 1 },
        v006: { title: '特區 006', location: '平面區 · 前段右側', score: '8.7', copy: '靠近舞台右側，距離感很好，但部分場次可能會看到較多側面。', tags: ['近距離', '留意舞台配置'], photo: 0 },
        r123: { title: '紅區 123', location: '二樓 · 前排側區', score: '8.4', copy: '視線高度舒服，人物與舞台比例均衡，是避開平面區人頭遮擋的安全選擇。', tags: ['視線平穩', '少人頭遮擋'], photo: 2 },
        r122: { title: '紅區 122', location: '二樓 · 中段正面', score: '8.8', copy: '燈光秀與大螢幕呈現比例最均衡，適合重視完整舞美的觀眾。', tags: ['完整舞美', '正面視角'], photo: 3 },
        b224: { title: '藍區 224', location: '三樓 · 側邊高層', score: '7.6', copy: '可俯瞰全場燈海，但人物較小，側邊器材可能因場次配置造成遮擋。', tags: ['全景', '人物較小'], photo: 0 },
        b223: { title: '藍區 223', location: '三樓 · 正面高層', score: '8.0', copy: '完整看見舞台設計與全場燈海，距離較遠但性價比高。', tags: ['完整舞美', '性價比'], photo: 1 }
    };
    Object.assign(stageDescriptions, window.TAIPEI_ARENA_ZONES || {});
    Object.assign(stageDescriptions, window.LINKOU_ARENA_ZONES || {});
    Object.assign(stageDescriptions, CONCERT_IMPORTED_ZONE_INFO);
    const photos = [
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000&auto=format&fit=crop'
    ];

    const zones = document.querySelectorAll('#stage-svg-diagram .seat-zone');
    zones.forEach((zone) => {
        zone.addEventListener('click', () => {
            // 移除其他區塊的 active 類別
            zones.forEach((item) => item.classList.remove('active'));
            // 為當前點擊區塊加上 active 類別
            zone.classList.add('active');

            const zoneId = zone.dataset.zone;
            if (stageDescriptions[zoneId]) {
                const view = stageDescriptions[zoneId];
                qs('#view-title').textContent = view.title;
                qs('#view-location').textContent = view.location;
                qs('#view-score').textContent = view.score;
                qs('#view-description').textContent = view.copy;
                qs('#view-tags').innerHTML = view.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
                qs('#seat-view-photo').style.backgroundImage = `linear-gradient(180deg, transparent 52%, rgba(0,0,0,.72)), url("${photos[view.photo]}")`;
                qs('#seat-view-photo').innerHTML = `<span>觀眾席實拍示意 · ${escapeHtml(view.title)}</span>`;
            }
        });
    });

    const firstZone = document.querySelector('#stage-svg-diagram .seat-zone');
    if (firstZone) firstZone.dispatchEvent(new Event('click'));

    zones.forEach((zone) => zone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            zone.dispatchEvent(new Event('click'));
        }
    }));
}
