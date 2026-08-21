import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve('.');

async function readWindowGlobal(relativePath, globalName) {
    const source = await readFile(path.join(root, relativePath), 'utf8');
    const context = { window: {} };
    vm.runInNewContext(source, context, { filename: relativePath });
    return context.window[globalName];
}

const concerts = await readWindowGlobal('assets/data/concerts.js', 'LIVIBE_CONCERT_DATA');
const venueData = await readWindowGlobal('assets/data/venues.js', 'LIVIBE_VENUE_DATA');

if (!Array.isArray(concerts) || !Array.isArray(venueData?.venues) || !venueData?.locations?.cities) {
    throw new Error('Active data sources are incomplete.');
}

const siteDataSource = `/**
 * LIVIBE 網站資料唯一來源。
 * 集中管理演出、國家、城市、多語系、色票、場館與舞台配置。
 */
window.LIVIBE_DATA = ${JSON.stringify({ concerts, venueData }, null, 2)};
`;
await writeFile(path.join(root, 'assets/data/site-data.js'), siteDataSource, 'utf8');

const mapParts = [
    'assets/js/maps/traces/central.js',
    'assets/js/maps/traces/single-side.js',
    'assets/js/maps/traces/single-side-800.js',
    'assets/js/maps/taipei-arena.js',
    'assets/js/maps/taipei-arena-refined.js',
    'assets/js/maps/linkou-arena.js'
];
const mapSources = await Promise.all(mapParts.map((file) => readFile(path.join(root, file), 'utf8')));
const combinedMaps = `/**
 * LIVIBE 自訂互動座位圖。
 * 依賴順序：描點資料 → 台北小巨蛋基礎 → 精修覆寫 → 林口體育館。
 */
${mapSources.map((source, index) => `\n/* ${mapParts[index]} */\n${source.trim()}\n`).join('')}`;
await writeFile(path.join(root, 'assets/js/venue-maps.js'), combinedMaps, 'utf8');

console.log(`Merged ${concerts.length} concerts, ${venueData.venues.length} venues and ${mapParts.length} map modules.`);
