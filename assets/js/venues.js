const VENUE_DATA = window.LIVIBE_DATA?.venueData;
const IMPORTED_VENUES = Array.isArray(VENUE_DATA?.venues) ? VENUE_DATA.venues : [];
const ACCESS = window.LIVIBE_ACCESS;
const VENUE_CATEGORIES = Object.freeze({
    standard: '標準舞台',
    end_stage: '單側舞台',
    center_stage: '中央舞台',
    sports: '球賽模式',
    horizontal: '橫向舞台',
    outdoor: '戶外／音樂祭',
    other: '其他配置'
});
let currentVenue = null;
let currentConfig = null;

function readVenueCategoryOverrides() {
    try {
        return JSON.parse(localStorage.getItem('livibe-venue-category-overrides') || '{}');
    } catch {
        return {};
    }
}

function inferVenueCategory(config) {
    const text = `${config.id} ${config.label}`.toLowerCase();
    if (/baseball|球賽/.test(text)) return 'sports';
    if (/center|中央/.test(text)) return 'center_stage';
    if (/end-stage|single|單側/.test(text)) return 'end_stage';
    if (/horizontal|橫向|橫開/.test(text)) return 'horizontal';
    if (/outdoor|festival|戶外|音樂祭/.test(text)) return 'outdoor';
    return 'standard';
}

function venueCategoryKey(venue, config) {
    return `${venue.id}:${config.id}`;
}

function venueCategory(venue, config) {
    const override = readVenueCategoryOverrides()[venueCategoryKey(venue, config)];
    return VENUE_CATEGORIES[override] ? override : inferVenueCategory(config);
}

function renderVenueCategoryControl(venue, config) {
    if (!venue || !config) return;
    const category = venueCategory(venue, config);
    $('#featured-category-badge').textContent = `視野分類：${VENUE_CATEGORIES[category]}`;
    const admin = $('#venue-category-admin');
    if (!ACCESS.can('venue.category.manage')) {
        admin.innerHTML = '';
        return;
    }
    admin.innerHTML = `
        <label class="venue-category-control">
            <span>管理分類</span>
            <select aria-label="管理場館視野分類">
                ${Object.entries(VENUE_CATEGORIES).map(([id, label]) => `<option value="${id}" ${id === category ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
        </label>`;
    admin.querySelector('select').addEventListener('change', (event) => {
        if (!ACCESS.can('venue.category.manage')) return;
        const overrides = readVenueCategoryOverrides();
        overrides[venueCategoryKey(venue, config)] = event.target.value;
        localStorage.setItem('livibe-venue-category-overrides', JSON.stringify(overrides));
        renderVenueCategoryControl(venue, config);
    });
}

const DEFAULT_LOCALE = window.LIVIBE_LOCALE || document.documentElement.lang || 'zh-TW';
const LOCATION_DATA = VENUE_DATA?.locations || { countries: {}, cities: {} };

function cityTranslations(city) {
    return LOCATION_DATA.cities?.[city]?.name || { 'zh-TW': city || '', en: city || '' };
}

function localizedText(messages, locale = DEFAULT_LOCALE) {
    return messages?.[locale] || messages?.['zh-TW'] || messages?.en || '';
}

function venueCity(venue, locale = DEFAULT_LOCALE) {
    return localizedText(venue.cityI18n, locale) || venue.city || venue.region;
}

const CUSTOM_VENUE_OVERRIDES = {
    'taipei-arena': (venue) => {
        return {
            ...venue,
            name: '台北小巨蛋',
            city: '台北市',
            citySource: 'Taipei',
            capacity: 15000,
            zones: 48,
            mapType: 'taipei',
            configs: [
                { id: 'taipei-arena-single', label: '單側舞台', mapKind: 'taipei-single', zoneCount: 48 },
                { id: 'taipei-arena-center', label: '中央舞台', mapKind: 'taipei-center', zoneCount: 48 }
            ]
        };
    },
    'ntsu-arena-linkou': (venue) => ({
        ...venue,
        name: '國立體育大學綜合體育館',
        city: '桃園市',
        citySource: 'Taoyuan',
        capacity: 15000,
        zones: 48,
        mapType: 'linkou',
        configs: [
            { id: 'ntsu-arena-linkou-local', label: '標準舞台', mapKind: 'linkou', zoneCount: 48 }
        ]
    })
};

if (!IMPORTED_VENUES.length) throw new Error('場館資料格式錯誤');

const VENUES = IMPORTED_VENUES
    .map((venue) => {
        const sourceCity = venue.city || venue.citySource || '';
        const cityI18n = venue.cityI18n || cityTranslations(sourceCity);
        const [cardAccent, cardAccentSecondary] = LOCATION_DATA.cities?.[sourceCity]?.palette || [venue.accent, '#222734'];
        const normalized = {
            ...venue,
            citySource: sourceCity,
            cityI18n,
            city: localizedText(cityI18n, 'zh-TW'),
            cardAccent,
            cardAccentSecondary,
            photos: 0,
            rating: null,
            zones: Number(venue.zones) || 0,
            configs: Array.isArray(venue.configs) ? venue.configs : []
        };
        return CUSTOM_VENUE_OVERRIDES[venue.id]?.(normalized) || normalized;
    })
    .sort((a, b) => {
        const priority = { 'taipei-arena': 0, 'taipei-dome': 1, 'ntsu-arena-linkou': 2 };
        return (priority[a.id] ?? 10) - (priority[b.id] ?? 10);
    })
    .map((venue) => ({ ...venue, layouts: venue.configs.map((config) => config.label) }));

window.LIVIBE_IMPORTED_ZONE_INFO = {};

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[char]));

function formatCapacity(capacity) {
    const number = Number(capacity);
    return Number.isFinite(number) && number > 0 ? `容納約 ${number.toLocaleString()} 人` : '容量依活動配置而異';
}

function genericImportedView(zone, venue, config, index) {
    const label = zone.dataset.fullname || zone.getAttribute('aria-label') || zone.id || `區域 ${index + 1}`;
    return {
        location: `${venue.name} · ${label}`,
        title: `${label} 座位視野`,
        score: null,
        copy: `此區屬於「${config.label}」配置；目前尚無經審核的真實視野投稿。實際視線仍會依延伸台、燈光、音響與現場器材位置調整。`
    };
}

function updateVenueUrl(zoneId = null) {
    if (!currentVenue || !currentConfig) return;
    const url = new URL(window.location.href);
    url.searchParams.set('venue', currentVenue.id);
    url.searchParams.set('config', currentConfig.id);
    if (zoneId) url.searchParams.set('zone', zoneId);
    else url.searchParams.delete('zone');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function selectZone(zoneId, { syncUrl = true } = {}) {
    document.querySelectorAll('#featured-diagram .seat-zone').forEach((zone) => {
        zone.classList.toggle('active', zone.dataset.zone === zoneId);
    });
    const shared = window.TAIPEI_ARENA_ZONES?.[zoneId];
    const linkou = window.LINKOU_ARENA_ZONES?.[zoneId];
    const imported = window.LIVIBE_IMPORTED_ZONE_INFO?.[zoneId];
    const view = linkou || shared || imported;
    if (!view) return;
    $('#featured-zone-label').textContent = view.location;
    $('#featured-zone-title').textContent = view.title;
    $('#featured-zone-score').textContent = '--';
    $('#featured-zone-score').nextElementSibling.textContent = ' 尚無評分';
    $('#featured-zone-copy').textContent = view.copy;
    const photo = $('#featured-photo');
    photo.classList.add('is-placeholder');
    photo.style.backgroundImage = 'none';
    photo.innerHTML = '<span>等待真實視野投稿</span>';
    const shareButton = $('#copy-zone-link');
    shareButton.disabled = false;
    shareButton.dataset.zoneId = zoneId;
    shareButton.textContent = '複製此視野連結';
    if (syncUrl) updateVenueUrl(zoneId);
}

async function loadImportedMap(diagram, venue, config, renderToken) {
    return window.LIVIBE_MAP_UTILS.loadImportedMap({
        diagram,
        venue,
        config,
        renderToken,
        createView: (zone, index) => genericImportedView(zone, venue, config, index),
        infoStore: window.LIVIBE_IMPORTED_ZONE_INFO
    });
}

function customMapMarkup(config) {
    if (config.mapKind === 'linkou') return window.linkouArenaMapMarkup();
    if (config.mapKind === 'taipei-single') return window.singleSideArenaMapMarkup();
    if (config.mapKind === 'taipei-center') return window.centralStageMapMarkup();
    return '';
}

function bindZoneInteractions(diagram) {
    diagram.querySelectorAll('.seat-zone').forEach((zone) => {
        zone.addEventListener('click', () => selectZone(zone.dataset.zone));
        zone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectZone(zone.dataset.zone);
            }
        });
    });
}

function resetMapTools(diagram, imported) {
    diagram.classList.remove('hide-no-photo');
    diagram.style.width = '100%';
    diagram.dataset.scale = '1';
    const hideButton = document.querySelector('#featured-venue [data-map-action="hide-empty"]');
    hideButton?.classList.remove('active');
    if (hideButton) {
        hideButton.textContent = '照片資料待上線';
        hideButton.disabled = true;
        hideButton.title = '真實照片投稿與審核功能會在後續階段接上';
    }
}

async function renderVenueConfig(venue, config, requestedZoneId = null) {
    currentVenue = venue;
    currentConfig = config;
    updateVenueUrl(requestedZoneId);
    renderVenueCategoryControl(venue, config);
    const shareButton = $('#copy-zone-link');
    shareButton.disabled = true;
    shareButton.dataset.zoneId = '';
    shareButton.textContent = '選擇座位區後分享';
    $('#featured-photo').classList.add('is-placeholder');
    $('#featured-photo').style.backgroundImage = 'none';
    $('#featured-photo').innerHTML = '<span>等待真實視野投稿</span>';
    $('#featured-zone-label').textContent = '請選擇座位區';
    $('#featured-zone-title').textContent = '選取區域以建立分享連結';
    $('#featured-zone-score').textContent = '--';
    $('#featured-zone-score').nextElementSibling.textContent = ' 尚無評分';
    $('#featured-zone-copy').textContent = '現階段提供座位區定位與配置參考；照片、描述與評分必須由真實投稿資料產生。';
    const diagram = $('#featured-diagram');
    const imported = Boolean(config.mapAsset && !config.mapKind);
    const renderToken = `${venue.id}:${config.id}:${Date.now()}`;
    diagram.dataset.renderToken = renderToken;
    diagram.classList.remove('taipei-arena-diagram', 'linkou-arena-diagram', 'imported-venue-diagram');
    diagram.classList.add(imported ? 'imported-venue-diagram' : (venue.mapType === 'linkou' ? 'linkou-arena-diagram' : 'taipei-arena-diagram'));
    diagram.setAttribute('aria-label', `${venue.name}・${config.label}互動座位圖`);
    resetMapTools(diagram, imported);
    $('#featured-zones').textContent = imported ? '…' : (config.zoneCount || venue.zones || 0);
    $('#featured-map-caption').textContent = imported
        ? `點選座位區查看視野摘要 · ${config.label} · 座位圖已轉為 LIVIBE 本機資產`
        : venue.mapType === 'linkou'
            ? '點選座位區查看視野摘要 · 林口體育館為單一標準舞台配置'
            : '點選座位區查看視野摘要 · 台北小巨蛋 LIVIBE 精修配置';
    window.setupArenaMapControls(diagram, document.querySelector('#featured-venue [data-map-tools]'));

    try {
        if (imported) {
            diagram.setAttribute('viewBox', config.viewBox || '0 0 1000 1000');
            diagram.innerHTML = '<text class="map-loading-label" x="50%" y="50%">座位圖載入中…</text>';
            const importedZones = await loadImportedMap(diagram, venue, config, renderToken);
            if (diagram.dataset.renderToken === renderToken) {
                $('#featured-zones').textContent = importedZones.length;
            }
        } else {
            diagram.setAttribute('viewBox', venue.mapType === 'linkou' ? '0 0 2550 2550' : '0 0 2550 3488');
            diagram.innerHTML = customMapMarkup(config);
        }
        if (diagram.dataset.renderToken !== renderToken) return;
        bindZoneInteractions(diagram);
        const zones = Array.from(diagram.querySelectorAll('.seat-zone'));
        const requestedZone = zones.find((zone) => zone.dataset.zone === requestedZoneId);
        const initialZone = requestedZone || (!imported ? zones[0] : null);
        if (initialZone) selectZone(initialZone.dataset.zone, { syncUrl: Boolean(requestedZone) });
    } catch (error) {
        console.error(error);
        if (diagram.dataset.renderToken === renderToken) {
            diagram.setAttribute('viewBox', '0 0 1000 600');
            diagram.innerHTML = '<text class="map-error-label" x="500" y="300">座位圖載入失敗</text>';
        }
    }
}

function showVenue(venue, { configId = null, zoneId = null, scroll = true } = {}) {
    currentVenue = venue;
    $('#featured-name').textContent = venue.name;
    $('#featured-meta').textContent = `${venueCity(venue)} · ${formatCapacity(venue.capacity)}`;
    $('#featured-photos').textContent = venue.configs.length;
    $('#featured-photo-unit').textContent = '份配置';
    $('#featured-rating').textContent = '--';
    $('#featured-zones').textContent = venue.zones;

    const singleLayout = venue.configs.length === 1;
    const selectedConfig = venue.configs.find((config) => config.id === configId) || venue.configs[0];
    const tabs = $('#layout-tabs');
    tabs.classList.toggle('single-layout', singleLayout);
    tabs.innerHTML = singleLayout
        ? `<span class="layout-badge">單一配置 · ${escapeHtml(venue.configs[0].label)}</span>`
        : venue.configs.map((config) => `<button class="${config.id === selectedConfig.id ? 'active' : ''}" type="button" data-config-id="${escapeHtml(config.id)}">${escapeHtml(config.label)}</button>`).join('');

    tabs.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const config = venue.configs.find((item) => item.id === button.dataset.configId);
        if (config) renderVenueConfig(venue, config);
    }));

    renderVenueConfig(venue, selectedConfig, zoneId);
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderRegionOptions() {
    const select = $('#venue-region');
    const countries = Array.from(new Set(VENUES.map((venue) => venue.country))).filter(Boolean);
    select.innerHTML = `<option value="all">所有地區與城市</option>${countries.map((countryCode) => {
        const country = LOCATION_DATA.countries?.[countryCode];
        const regionLabel = localizedText(country?.region) || VENUES.find((venue) => venue.country === countryCode)?.region || countryCode;
        const cities = Array.from(new Set(VENUES.filter((venue) => venue.country === countryCode).map((venue) => venue.citySource))).filter(Boolean);
        return `<optgroup label="${escapeHtml(regionLabel)}"><option value="country:${escapeHtml(countryCode)}">${escapeHtml(regionLabel)}・全部城市</option>${cities.map((city) => `<option value="city:${escapeHtml(city)}">${escapeHtml(localizedText(cityTranslations(city)))}</option>`).join('')}</optgroup>`;
    }).join('')}`;
}

function renderVenues() {
    const query = $('#venue-search').value.trim().toLowerCase();
    const locationFilter = $('#venue-region').value;
    const filtered = VENUES.filter((venue) => {
        const cityKeywords = Object.values(venue.cityI18n || {}).join(' ');
        const haystack = `${venue.name} ${venueCity(venue)} ${cityKeywords} ${venue.region} ${venue.configs.map((config) => config.label).join(' ')}`.toLowerCase();
        const matchesLocation = locationFilter === 'all'
            || (locationFilter.startsWith('country:') && venue.country === locationFilter.slice(8))
            || (locationFilter.startsWith('city:') && venue.citySource === locationFilter.slice(5));
        return (!query || haystack.includes(query)) && matchesLocation;
    });
    $('#venue-result-count').textContent = `${filtered.length} 座場館`;
    $('#venue-grid').innerHTML = filtered.map((venue) => `
        <button class="venue-card" type="button" data-id="${escapeHtml(venue.id)}" style="--venue-accent:${venue.cardAccent};--venue-accent-secondary:${venue.cardAccentSecondary}">
            <div class="venue-card-art"><span>${escapeHtml(venueCity(venue))}</span><strong>${escapeHtml(venueCity(venue).slice(0, 2))}</strong></div>
            <div class="venue-card-content">
                <div><small>${escapeHtml(venue.region)} · ${venue.configs.length} 種舞台配置</small><strong class="venue-score">等待投稿</strong></div>
                <h3>${escapeHtml(venue.name)}</h3>
                <p>已收錄 ${venue.configs.length} 份座位圖 · ${venue.zones ? `${venue.zones} 個座位區` : '互動分區載入後顯示'}</p>
                <span class="text-link">查看座位圖 →</span>
            </div>
        </button>`).join('') || '<div class="empty-state">找不到符合條件的場館。</div>';
    document.querySelectorAll('.venue-card').forEach((card) => {
        card.addEventListener('click', () => showVenue(VENUES.find((venue) => venue.id === card.dataset.id)));
    });
}

$('#venue-count').textContent = VENUES.length;
ACCESS.mountRoleControl($('#venue-role-control'));
renderRegionOptions();
const initialParams = new URLSearchParams(window.location.search);
const initialVenue = VENUES.find((venue) => venue.id === initialParams.get('venue')) || VENUES[0];
showVenue(initialVenue, {
    configId: initialParams.get('config'),
    zoneId: initialParams.get('zone'),
    scroll: false
});
['#venue-search', '#venue-region'].forEach((selector) => {
    $(selector).addEventListener('input', renderVenues);
    $(selector).addEventListener('change', renderVenues);
});
renderVenues();

$('#copy-zone-link').addEventListener('click', async () => {
    const button = $('#copy-zone-link');
    if (!button.dataset.zoneId) return;
    updateVenueUrl(button.dataset.zoneId);
    try {
        await navigator.clipboard.writeText(window.location.href);
        button.textContent = '連結已複製';
    } catch {
        button.textContent = '請複製網址列連結';
    }
});

window.addEventListener('livibe:rolechange', () => {
    ACCESS.mountRoleControl($('#venue-role-control'));
    renderVenueCategoryControl(currentVenue, currentConfig);
});
