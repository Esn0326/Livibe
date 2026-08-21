import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const SOURCE_ORIGIN = 'https://twconcertview.com';
const OUTPUT_DIR = path.resolve('assets', 'venue-maps');
const SITE_DATA_PATH = path.resolve('assets', 'data', 'site-data.js');

// site-data.js is the single source for all imported site data.
const existingVenueDataSource = await readFile(SITE_DATA_PATH, 'utf8');
const venueSandbox = { window: {} };
vm.runInNewContext(existingVenueDataSource, venueSandbox, { filename: SITE_DATA_PATH });
const existingSiteData = venueSandbox.window.LIVIBE_DATA;
if (!existingSiteData || typeof existingSiteData !== 'object' || !existingSiteData.venueData?.locations) {
    throw new Error(`Invalid site data source: ${SITE_DATA_PATH}`);
}
const LOCATION_DATA = existingSiteData.venueData.locations;

const GROUP_OVERRIDES = {
    'taipei-dome-center-stage': 'taipei-dome',
    'taipei-dome-baseball': 'taipei-dome',
    'taipei-arena-center-stage': 'taipei-arena',
    'kaohsiung-national-stadium-center-stage': 'kaohsiung-national-stadium',
    'kaohsiung-national-stadium-aaa': 'kaohsiung-national-stadium',
    'kaohsiung-national-stadium-horizontal-stage': 'kaohsiung-national-stadium',
    'kaohsiung-arena-center-stage': 'kaohsiung-arena',
    'kspo-dome-seoul-center-stage': 'kspo-dome-seoul',
    'inspire-arena-incheon-standard-stage-2': 'inspire-arena-incheon',
    'inspire-arena-incheon-no-second-floor': 'inspire-arena-incheon',
    'inspire-arena-incheon-center-stage': 'inspire-arena-incheon',
    'goyang-gymnasium-center-stage': 'goyang-gymnasium',
    'nippon-budokan-center-stage': 'nippon-budokan-tokyo',
    'kai-tak-stadium-center-stage-hongkong': 'kai-tak-stadium-hongkong',
    'hong-kong-coliseum-center-stage': 'hong-kong-coliseum',
    'hong-kong-coliseum-end-stage': 'hong-kong-coliseum',
    'venetian-cotai-arena-end-stage-macau': 'venetian-cotai-arena-macau',
    'venetian-cotai-arena-center-stage-macau': 'venetian-cotai-arena-macau',
    'bukit-jalil-national-stadium-end-stage-1': 'bukit-jalil-national-stadium',
    'bukit-jalil-national-stadium-end-stage-2': 'bukit-jalil-national-stadium',
    'bukit-jalil-national-stadium-center-stage': 'bukit-jalil-national-stadium',
    'rajamangala-national-stadium-bangkok-standard-stage-2': 'rajamangala-national-stadium-bangkok',
    'rajamangala-national-stadium-bangkok-center-stage': 'rajamangala-national-stadium-bangkok',
    'singapore-national-stadium-north': 'singapore-national-stadium',
    'singapore-national-stadium-east': 'singapore-national-stadium'
};

const COUNTRY_META = Object.fromEntries(Object.entries(LOCATION_DATA.countries).map(([code, item]) => [code, {
    region: item.region['zh-TW'],
    city: item.region['zh-TW'],
    accent: item.accent
}]));

function cityTranslations(city) {
    return LOCATION_DATA.cities?.[city]?.name || { 'zh-TW': city || '', en: city || '' };
}

function decodeHtml(value) {
    return value
        .replace(/<[^>]*>/g, '')
        .replaceAll('&amp;', '&')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function slugFromUrl(url) {
    return new URL(url).pathname.split('/').filter(Boolean).at(-1);
}

function countryForIndex(index) {
    if (index <= 47) return 'TW';
    if (index <= 62) return 'KR';
    if (index <= 71) return 'JP';
    if (index <= 77) return 'HK';
    if (index <= 80) return 'MO';
    if ([81, 93, 94, 95].includes(index)) return 'SG';
    if ([82, 83].includes(index)) return 'PH';
    if ([84, 89, 90, 91, 92].includes(index)) return 'TH';
    if ([85, 86, 87, 88].includes(index)) return 'MY';
    return 'ID';
}

function layoutLabel(name, slug) {
    const text = `${name} ${slug}`.toLowerCase();
    if (text.includes('aaa')) return 'AAA 中央舞台';
    if (text.includes('baseball') || name.includes('球賽')) return '球賽模式';
    if (text.includes('horizontal') || name.includes('橫開')) return '橫向舞台';
    if (text.includes('no-second-floor') || name.includes('無二樓')) return '無二樓配置';
    if (text.includes('standard-stage-2') || name.includes('標準舞台2') || name.includes('版本2')) return '標準舞台 2';
    if (text.includes('center-stage') || name.includes('中央舞台')) return '中央舞台';
    if (text.includes('end-stage-1') || name.includes('單側舞台 1')) return '單側舞台 1';
    if (text.includes('end-stage-2') || name.includes('單側舞台 2')) return '單側舞台 2';
    if (text.includes('end-stage') || name.includes('單側舞台')) return '單側舞台';
    if (slug.endsWith('-north') || name.includes('北側舞台')) return '北側舞台';
    if (slug.endsWith('-east') || name.includes('東側舞台')) return '東側舞台';
    return '標準舞台';
}

function physicalName(name) {
    return name
        .replace(/中央舞台(?:\s*\([^)]*\))?$/i, '')
        .replace(/\s*\(AAA版本\)$/i, '')
        .replace(/\s*球賽版本$/i, '')
        .replace(/\s*橫開舞台$/i, '')
        .replace(/\s*標準舞台2$/i, '')
        .replace(/\s*無二樓配置$/i, '')
        .replace(/\s*單側舞台\s*[12]?$/i, '')
        .replace(/\s*[北東]側舞台$/i, '')
        .trim();
}

function seededRating(seed) {
    let hash = 0;
    for (const char of seed) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    return Number((7.8 + (Math.abs(hash) % 12) / 10).toFixed(1));
}

async function fetchText(url, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'LIVIBE venue map importer' } });
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            return await response.text();
        } catch (error) {
            lastError = error;
            if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        }
    }
    throw lastError;
}

function extractVenueLinks(html) {
    const nav = html.match(/<nav[^>]*aria-label="所有場館"[^>]*>[\s\S]*?<\/nav>/i)?.[0] || html;
    const links = [];
    const seen = new Set();
    for (const match of nav.matchAll(/<a[^>]+href="([^"]*\/venue\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
        const url = new URL(match[1], SOURCE_ORIGIN).href;
        if (seen.has(url)) continue;
        seen.add(url);
        links.push({ url, name: decodeHtml(match[2]) });
    }
    return links;
}

function extractSvgId(html) {
    return html.match(/<link[^>]+rel="preload"[^>]+href="\/svgs\/([A-Za-z0-9_-]+)\.svg"/i)?.[1]
        || html.match(/\/svgs\/([A-Za-z0-9_-]+)\.svg/i)?.[1]
        || null;
}

function extractVenueSchema(html) {
    for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
        try {
            const value = JSON.parse(match[1]);
            const entries = Array.isArray(value) ? value : [value];
            const venue = entries.find((item) => item?.['@type'] === 'PerformingArtsVenue');
            if (venue) return venue;
        } catch {}
    }
    return {};
}

function sanitizeSvg(svg) {
    return svg
        .replace(/<script\b[\s\S]*?<\/script>/gi, '')
        .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, '')
        .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
}

function countSeatZones(svg) {
    const rootGroup = svg.match(/<svg\b[^>]*>\s*<g\b[^>]*>([\s\S]*)<\/g>\s*<\/svg>/i)?.[1] || svg;
    const candidates = Array.from(rootGroup.matchAll(/<(path|polygon|rect|g)\b[^>]*\bid="([^"]+)"/gi));
    const excluded = /(?:^|[-_])(stage|foh|back|background|bg|outline|base|mask|clip)(?:$|[-_])/i;
    return candidates.filter((match) => {
        const tag = match[1].toLowerCase();
        const id = match[2];
        if (excluded.test(id)) return false;
        if (tag === 'g' && !/(?:^|[-_])ch\d*$/i.test(id)) return false;
        return true;
    }).length;
}

async function runPool(items, worker, concurrency = 5) {
    const results = new Array(items.length);
    let cursor = 0;
    async function consume() {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            results[index] = await worker(items[index], index);
            if ((index + 1) % 10 === 0 || index + 1 === items.length) {
                console.log(`Imported ${index + 1}/${items.length}`);
            }
        }
    }
    await Promise.all(Array.from({ length: concurrency }, consume));
    return results;
}

await mkdir(OUTPUT_DIR, { recursive: true });
await mkdir(path.dirname(SITE_DATA_PATH), { recursive: true });

const homepage = await fetchText(`${SOURCE_ORIGIN}/`);
const links = extractVenueLinks(homepage);
if (links.length !== 97) throw new Error(`Expected 97 venue layouts, found ${links.length}`);

const configs = await runPool(links, async (link, index) => {
    const slug = slugFromUrl(link.url);
    const html = await fetchText(link.url);
    const svgId = extractSvgId(html);
    if (!svgId) throw new Error(`No SVG id found for ${link.url}`);
    const svgUrl = `${SOURCE_ORIGIN}/svgs/${svgId}.svg`;
    const svg = sanitizeSvg(await fetchText(svgUrl));
    const assetName = `${slug}.svg`;
    await writeFile(path.join(OUTPUT_DIR, assetName), svg, 'utf8');
    const schema = extractVenueSchema(html);
    const viewBox = svg.match(/viewBox="([^"]+)"/i)?.[1] || '0 0 1000 1000';
    const zoneCount = countSeatZones(svg);
    return {
        id: slug,
        groupId: GROUP_OVERRIDES[slug] || slug,
        name: link.name,
        layout: layoutLabel(link.name, slug),
        country: countryForIndex(index),
        sourceUrl: link.url,
        mapAsset: `assets/venue-maps/${assetName}`,
        svgId,
        viewBox,
        zoneCount,
        capacity: Number(schema.maximumAttendeeCapacity) || null,
        city: schema.address?.addressLocality || null
    };
});

const groups = new Map();
for (const config of configs) {
    if (!groups.has(config.groupId)) {
        const meta = COUNTRY_META[config.country];
        const citySource = config.city || meta.city;
        const cityI18n = cityTranslations(citySource);
        groups.set(config.groupId, {
            id: config.groupId,
            name: physicalName(config.name),
            city: cityI18n['zh-TW'],
            citySource,
            cityI18n,
            region: meta.region,
            country: config.country,
            capacity: config.capacity,
            photos: 0,
            rating: seededRating(config.groupId),
            zones: config.zoneCount,
            accent: meta.accent,
            configs: []
        });
    }
    const group = groups.get(config.groupId);
    group.capacity ||= config.capacity;
    group.zones = Math.max(group.zones, config.zoneCount);
    group.configs.push({
        id: config.id,
        label: config.layout,
        sourceUrl: config.sourceUrl,
        mapAsset: config.mapAsset,
        viewBox: config.viewBox,
        zoneCount: config.zoneCount
    });
}

const catalog = Array.from(groups.values());
if (catalog.length !== 76) throw new Error(`Expected 76 physical venues, found ${catalog.length}`);

const output = `/**
 * LIVIBE 網站資料唯一來源。
 * site-data.js 是 concerts、locations 與 venues 的 single source。
 * 請勿直接編輯；重新匯入時會保留 concerts/locations 並更新 venues。
 */
window.LIVIBE_DATA = ${JSON.stringify({
    concerts: existingSiteData.concerts || [],
    venueData: { venues: catalog, locations: LOCATION_DATA }
}, null, 2)};\n`;
await writeFile(SITE_DATA_PATH, output, 'utf8');
console.log(`Done: ${configs.length} layouts grouped into ${catalog.length} venues.`);
