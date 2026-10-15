import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteDataPath = resolve(projectRoot, 'assets/data/site-data.js');
const sourceNotesPath = resolve(projectRoot, 'non/research/concert-data-sources.md');
const outputPath = resolve(projectRoot, 'tools/concert-posters.json');
const overridePath = resolve(projectRoot, 'tools/concert-poster-overrides.json');
const searchOverridePath = resolve(projectRoot, 'tools/concert-poster-search-overrides.json');
const userAgent = 'LIVIBE catalog maintainer/1.0 (+https://esn0326.github.io/Livibe/)';

const htmlDecode = (value = '') => value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const stripTags = (value = '') => htmlDecode(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const normalized = (value = '') => stripTags(String(value))
    .normalize('NFKC')
    .toLowerCase()
    .replace(/20\d{2}/g, ' ')
    .replace(/(?:台北|臺北|高雄)(?:站|場)?/g, ' ')
    .replace(/(?:巡迴|世界|演唱會|concert|tour|live|in|world|官方|活動|藝文表演)/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '');

function ngrams(value) {
    const chars = [...normalized(value)];
    if (chars.length < 2) return new Set(chars);
    return new Set(chars.slice(0, -1).map((char, index) => `${char}${chars[index + 1]}`));
}

function similarity(left, right) {
    const a = ngrams(left);
    const b = ngrams(right);
    if (!a.size || !b.size) return 0;
    let overlap = 0;
    for (const token of a) if (b.has(token)) overlap += 1;
    return (2 * overlap) / (a.size + b.size);
}

function datesFromText(value) {
    const dates = new Set();
    let currentYear = null;
    for (const match of String(value).matchAll(/(?:(20\d{2})[\/-])?(\d{1,2})[\/-](\d{1,2})/g)) {
        if (match[1]) currentYear = Number(match[1]);
        if (!currentYear) continue;
        const month = String(Number(match[2])).padStart(2, '0');
        const day = String(Number(match[3])).padStart(2, '0');
        dates.add(`${currentYear}-${month}-${day}`);
    }
    return [...dates];
}

function absoluteUrl(value, pageUrl) {
    if (!value || value === '#') return null;
    try {
        const url = new URL(htmlDecode(value), pageUrl);
        return url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
}

async function fetchText(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': userAgent,
            Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8'
        },
        redirect: 'follow'
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return { text: await response.text(), url: response.url };
}

function metaContent(html, key) {
    const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i')
    ];
    for (const pattern of patterns) {
        const value = html.match(pattern)?.[1];
        if (value) return htmlDecode(value);
    }
    return '';
}

function posterFromHtml(html, pageUrl) {
    const candidates = [];
    const addCandidate = (raw, priority) => {
        const url = absoluteUrl(raw, pageUrl);
        if (!url || /(?:fbsharelogo|fb-share|facebook-black|facebook\.com\/tr|footer_logo|logo\.|aplus|egov|qrcode|ln-default-image|index-sea-shape|program\.background|\.svg(?:\?|$))/i.test(url)) return;
        candidates.push({ url, priority });
    };

    addCandidate(metaContent(html, 'og:image'), 70);
    addCandidate(metaContent(html, 'twitter:image'), 65);

    for (const match of html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)) {
        const raw = match[1];
        const tag = match[0];
        let priority = 10;
        if (/\/relpic\//i.test(raw)) priority = 100;
        else if (/ReservationImg/i.test(raw)) priority = 95;
        else if (/dynamicmedia\.livenationinternational/i.test(raw)) priority = 90;
        else if (/wp-content\/uploads/i.test(raw)) priority = 85;
        else if (/(?:poster|event|activity|program|cover|hero)/i.test(`${raw} ${tag}`)) priority = 55;
        addCandidate(raw, priority);
    }

    for (const match of html.matchAll(/["']image["']\s*:\s*["']([^"']+)["']/gi)) addCandidate(match[1], 60);
    return candidates.sort((a, b) => b.priority - a.priority)[0]?.url || null;
}

const context = { window: {} };
vm.runInNewContext(await readFile(siteDataPath, 'utf8'), context);
const rows = context.window.LIVIBE_DATA?.concerts || [];
const eventMap = new Map();
for (const row of rows) {
    if (!eventMap.has(row.eventId)) eventMap.set(row.eventId, {
        id: row.eventId,
        title: row.theme,
        venue: row.venue,
        artists: new Set(),
        dates: new Set()
    });
    const event = eventMap.get(row.eventId);
    event.artists.add(row.artist);
    event.dates.add(row.date);
}
const events = [...eventMap.values()].map((event) => ({
    ...event,
    artists: [...event.artists],
    dates: [...event.dates]
}));

const posters = {};
const audit = [];

function chooseEvent({ title, dates, venuePattern }) {
    let candidates = events.filter((event) => !posters[event.id]?.posterUrl);
    if (venuePattern) candidates = candidates.filter((event) => venuePattern.test(event.venue));
    if (dates?.length) {
        const dated = candidates.filter((event) => event.dates.some((date) => dates.includes(date)));
        if (!dated.length) return null;
        candidates = dated;
    }
    const ranked = candidates.map((event) => ({
        event,
        score: similarity(title, `${event.title} ${event.artists.join(' ')}`)
    })).sort((a, b) => b.score - a.score);
    if (!ranked.length) return null;
    if (ranked.length === 1 && dates?.length && ranked[0].event.dates.some((date) => dates.includes(date))) return ranked[0].event;
    return ranked[0].score >= 0.25 ? ranked[0].event : null;
}

function chooseRecordedEvent({ title, dates }) {
    if (!dates?.length) return null;
    const ranked = events
        .filter((event) => event.dates.some((date) => dates.includes(date)))
        .map((event) => ({
            event,
            score: similarity(title, `${event.title} ${event.artists.join(' ')}`)
        }))
        .sort((a, b) => b.score - a.score);
    return ranked[0]?.score >= 0.25 ? ranked[0].event : null;
}

function recordPoster(event, posterUrl, sourcePageUrl, sourceType, title) {
    if (!event || !posterUrl || posters[event.id]?.posterUrl) return false;
    posters[event.id] = { posterUrl, sourcePageUrl, sourceType };
    audit.push({ eventId: event.id, title: event.title, matchedFrom: title, posterUrl, sourcePageUrl, sourceType });
    return true;
}

async function pooled(items, worker, concurrency = 6) {
    let next = 0;
    const results = [];
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (next < items.length) {
            const index = next++;
            try {
                results[index] = await worker(items[index], index);
            } catch (error) {
                results[index] = { error: error.message, item: items[index] };
            }
        }
    }));
    return results;
}

async function crawlTaipeiArena() {
    const base = 'https://www.arena.taipei/';
    const entries = [];
    for (let page = 1; page <= 16; page += 1) {
        const listUrl = new URL('news.aspx', base);
        listUrl.searchParams.set('PageSize', '20');
        listUrl.searchParams.set('n', '4A7BFF61FA074F0F');
        listUrl.searchParams.set('page', String(page));
        listUrl.searchParams.set('sms', 'F9A95D3F5A5C2C68');
        const { text } = await fetchText(listUrl.href);
        const pageEntries = [];
        for (const match of text.matchAll(/<a[^>]+href=["']([^"']*News_Content\.aspx[^"']+)["'][^>]*>(.*?)<\/a>/gis)) {
            const title = stripTags(match[2]);
            const dates = datesFromText(title);
            if (!dates.length) continue;
            pageEntries.push({ title, dates, sourcePageUrl: absoluteUrl(match[1], listUrl.href) });
        }
        entries.push(...pageEntries);
        if (pageEntries.some((entry) => entry.dates.some((date) => date < '2022-01-01'))) break;
    }

    const matched = entries.map((entry) => ({
        ...entry,
        event: chooseEvent({ title: entry.title, dates: entry.dates, venuePattern: /^台北小巨蛋$/ })
    })).filter((entry) => entry.event && entry.sourcePageUrl);

    await pooled(matched, async (entry) => {
        const { text, url } = await fetchText(entry.sourcePageUrl);
        const posterUrl = posterFromHtml(text, url);
        recordPoster(entry.event, posterUrl, url, 'taipei-arena', entry.title);
    });
}

async function crawlCurrentTaipeiArena() {
    const listUrl = 'https://www.arena.taipei/News.aspx?n=2E1489AFE4B1BEA1&sms=F9A95D3F5A5C2C68';
    const { text } = await fetchText(listUrl);
    const entries = [];
    for (const match of text.matchAll(/<a[^>]+href=["']([^"']*News_Content\.aspx[^"']+)["'][^>]*>(.*?)<\/a>/gis)) {
        const title = stripTags(match[2]);
        const sourcePageUrl = absoluteUrl(match[1], listUrl);
        if (!title || !sourcePageUrl) continue;
        entries.push({ title, sourcePageUrl });
    }

    await pooled(entries, async (entry) => {
        const { text: detail, url } = await fetchText(entry.sourcePageUrl);
        const detailTitle = stripTags(detail.match(/<h[12][^>]*>(.*?)<\/h[12]>/is)?.[1] || entry.title);
        const dates = datesFromText(detail);
        const event = chooseEvent({ title: detailTitle, dates, venuePattern: /^台北小巨蛋$/ });
        recordPoster(event, posterFromHtml(detail, url), url, 'taipei-arena-current', detailTitle);
    });
}

async function crawlKaohsiungArena() {
    for (let year = 2022; year <= 2027; year += 1) {
        const listUrl = `https://www.kaoarena.com.tw/Home/CalendarList?Category=${encodeURIComponent('藝文表演')}&year=${year}`;
        const { text } = await fetchText(listUrl);
        for (const match of text.matchAll(/<a[^>]+href=["']([^"']*CalendarDetail[^"']+)["'][^>]*>(.*?)<\/a>/gis)) {
            const inner = match[2];
            const title = stripTags(inner);
            const dates = datesFromText(title);
            const event = chooseEvent({ title, dates, venuePattern: /^高雄巨蛋$/ });
            const image = inner.match(/<img[^>]+(?:src|data-src)=["']([^"']+)/i)?.[1];
            const sourcePageUrl = absoluteUrl(match[1], listUrl);
            const posterUrl = absoluteUrl(image, listUrl);
            recordPoster(event, posterUrl, sourcePageUrl, 'kaohsiung-arena', title);
        }
    }
}

async function crawlRecordedSources() {
    const notes = await readFile(sourceNotesPath, 'utf8');
    const entries = notes.split(/\r?\n/).flatMap((line) => {
        const url = line.match(/https:\/\/\S+/)?.[0]?.replace(/[）)。,，]+$/, '');
        if (!url || !line.trim().startsWith('-')) return [];
        const dates = datesFromText(line);
        if (!dates.length) return [];
        const event = chooseRecordedEvent({ title: line, dates });
        return event ? [{ title: line, dates, event, sourcePageUrl: url }] : [];
    });

    await pooled(entries, async (entry) => {
        const { text, url } = await fetchText(entry.sourcePageUrl);
        const posterUrl = posterFromHtml(text, url);
        recordPoster(entry.event, posterUrl, url, 'recorded-official-source', entry.title);
    }, 5);
}

await crawlTaipeiArena();
await crawlCurrentTaipeiArena();
await crawlKaohsiungArena();
await crawlRecordedSources();

const overrides = {
    ...JSON.parse(await readFile(searchOverridePath, 'utf8')),
    ...JSON.parse(await readFile(overridePath, 'utf8'))
};
for (const [eventId, override] of Object.entries(overrides)) {
    if (!eventMap.has(eventId)) throw new Error(`Unknown poster override event: ${eventId}`);
    posters[eventId] = override;
}

const sortedPosters = Object.fromEntries(Object.entries(posters).sort(([left], [right]) => left.localeCompare(right, 'zh-Hant')));
await writeFile(outputPath, `${JSON.stringify(sortedPosters, null, 2)}\n`, 'utf8');

const coveredEvents = events.filter((event) => sortedPosters[event.id]?.posterUrl).length;
console.log(JSON.stringify({
    events: events.length,
    coveredEvents,
    addedThisRun: audit.length,
    missingEvents: events.length - coveredEvents,
    bySource: audit.reduce((counts, item) => ({ ...counts, [item.sourceType]: (counts[item.sourceType] || 0) + 1 }), {})
}, null, 2));

if (audit.length) {
    console.log('\nAdded posters:');
    for (const item of audit) console.log(`- ${item.title} <- ${item.sourceType}`);
}

if (coveredEvents !== events.length) process.exitCode = 1;
