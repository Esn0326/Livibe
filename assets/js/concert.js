let currentEvent = null;
let currentSessionIndex = 0;
const qs = (selector) => document.querySelector(selector);
const { transform: transformRawData, escapeHtml, typeLabel } = window.LIVIBE_EVENTS;
const ACCESS = window.LIVIBE_ACCESS;
const COMMUNITY = window.LIVIBE_COMMUNITY;
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

function readStoredDiscussion(eventId) {
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

function getStoredDiscussion(event) {
    const current = readStoredDiscussion(event.id);
    if (current.length || !event.legacyId || event.legacyId === event.id) return current;
    const legacy = readStoredDiscussion(event.legacyId);
    if (legacy.length) localStorage.setItem(discussionKey(event.id), JSON.stringify(legacy));
    return legacy;
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
            text: event.isUpcoming
                ? '這場演出尚未舉行，目前只收集期待度；演出結束後會切換為觀眾評價。'
                : '這個頁面正在等待第一則觀眾評價。分數只會使用實際送出的評價計算。',
            time: '評分說明'
        }
    ];
}

function updateRatingSummary(event) {
    const summary = COMMUNITY.summary(event);
    const isExpectation = summary.kind === 'expectation';
    qs('#rating-score').textContent = summary.average === null ? '--' : summary.average.toFixed(1);
    qs('#rating-label').textContent = `${isExpectation ? '觀眾期待度' : '觀眾評分'}${summary.count && !summary.isRepresentative ? '（樣本不足）' : ''}`;
    qs('#rating-volume').textContent = `${summary.count} / ${summary.minimumSamples} 則`;
    qs('#discussion-title').textContent = isExpectation ? '演出期待與討論' : '觀眾評價與討論';
    qs('#review-score-label').textContent = isExpectation ? '你的期待度' : '你的演後評分';
    qs('#review-text').placeholder = isExpectation
        ? '分享你期待的歌單、舞台或嘉賓'
        : '分享音響、視線、入場動線或演出亮點';
    const sampleNote = summary.isRepresentative ? '已達第一版最低樣本門檻。' : `至少需要 ${summary.minimumSamples} 則才列入評分排序。`;
    qs('#review-disclosure').textContent = isExpectation
        ? `尚未舉行：此處顯示期待度，不會混入演出後評分。${sampleNote}資料目前只儲存在你的瀏覽器。`
        : `分數來自本頁實際送出的演後評價。${sampleNote}資料目前只儲存在你的瀏覽器。`;
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
        ['MVP Roadmap', '可信評價功能持續建置中', '目前只呈現實際送出的本機樣本；正式會員、認證入場與防灌分將於後續階段加入。', 'index.html#product-roadmap'],
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
        ...getStoredDiscussion(event).map((item) => ({ ...item, source: 'stored' })),
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
            ${Number.isFinite(Number(item.rating)) ? `<small>${Number(item.rating).toFixed(1)} / 10</small>` : ''}
        </article>
    `).join('');
    list.querySelectorAll('.discussion-delete').forEach((button) => button.addEventListener('click', () => {
        if (!ACCESS.can('discussion.delete')) return;
        if (button.dataset.discussionSource === 'stored') {
            const next = getStoredDiscussion(event).filter((item) => item.id !== button.dataset.discussionId);
            localStorage.setItem(discussionKey(event.id), JSON.stringify(next));
        } else {
            const nextDeleted = getDeletedDiscussion(event.id);
            nextDeleted.add(button.dataset.discussionId);
            localStorage.setItem(deletedDiscussionKey(event.id), JSON.stringify([...nextDeleted]));
        }
        renderDiscussion(event);
        updateRatingSummary(event);
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
        const items = getStoredDiscussion(event);
        items.unshift({
            id: globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`,
            name: '本機使用者',
            rating: Number(qs('#review-rating').value),
            text,
            kind: COMMUNITY.kindFor(event),
            time: `${event.isUpcoming ? '期待度' : '演後評價'} · 剛剛`
        });
        localStorage.setItem(discussionKey(event.id), JSON.stringify(items.slice(0, 10)));
        qs('#review-text').value = '';
        renderDiscussion(event);
        updateRatingSummary(event);
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
        score: null,
        copy: `此區屬於「${config.label}」配置；目前尚無經審核的真實視野投稿。實際視線仍會依延伸台、燈光、音響與現場器材位置調整。`,
        tags: ['配置參考', config.label, '等待投稿'],
        photo: null
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
        hideButton.disabled = true;
        hideButton.textContent = '照片資料待上線';
        hideButton.title = '真實照片投稿與審核功能會在後續階段接上';
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
    updateRatingSummary(event);
    qs('#display-organizer').textContent = event.organizer;
    window.setupArenaMapControls(qs('#stage-svg-diagram'), document.querySelector('#venue-section [data-map-tools]'));
    const catalogSnapshot = window.LIVIBE_DATA?.meta?.catalogSnapshot;
    qs('#summary-text').textContent = `${event.title} 收錄於 LIVIBE 演唱會資料庫，目前包含 ${event.sessions.length} 個場次、${event.artists.length} 組演出名單與場館資訊。${catalogSnapshot ? ` 資料查證基準：${catalogSnapshot}。` : ''}`;

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
        const event = events.find((item) => item.id === id || item.legacyId === id || item.title === id);
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
                qs('#view-score').textContent = '--';
                qs('#view-description').textContent = view.copy;
                qs('#view-tags').innerHTML = [...new Set([...view.tags, '等待真實投稿'])].map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
                qs('#seat-view-photo').classList.add('is-placeholder');
                qs('#seat-view-photo').style.backgroundImage = 'none';
                qs('#seat-view-photo').innerHTML = `<span>${escapeHtml(view.title)} · 等待真實視野投稿</span>`;
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
