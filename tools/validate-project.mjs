import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { runInNewContext } from 'node:vm';

const root = path.resolve('.');
const pages = ['index.html', 'concert.html', 'venues.html', 'login.html'];
const missingReferences = [];

for (const page of pages) {
    const html = await readFile(path.join(root, page), 'utf8');
    const references = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), (match) => match[1]);
    for (const reference of references) {
        if (/^(?:https?:|#|mailto:|tel:)/.test(reference)) continue;
        const localPath = reference.split(/[?#]/)[0];
        try {
            await access(path.resolve(root, localPath));
        } catch {
            missingReferences.push(`${page} -> ${localPath}`);
        }
    }
}

const siteDataSource = await readFile(path.join(root, 'assets', 'data', 'site-data.js'), 'utf8');
const siteDataContext = { window: {} };
runInNewContext(siteDataSource, siteDataContext);
const siteData = siteDataContext.window.LIVIBE_DATA;
const concerts = siteData?.concerts || [];
const venueData = siteData?.venueData;
const catalog = venueData?.venues || [];
const locations = venueData?.locations || {};
const configs = catalog.flatMap((venue) => venue.configs || []);
const missingMaps = [];
for (const config of configs) {
    try {
        await access(path.resolve(root, config.mapAsset));
    } catch {
        missingMaps.push(config.mapAsset);
    }
}

const unknownCities = [...new Set(catalog.map((venue) => venue.citySource || venue.city).filter((city) => !locations.cities[city]))];
const siteDataValid = Array.isArray(concerts) && Array.isArray(catalog) && Boolean(locations.cities) && Boolean(locations.countries);
const failures = { missingReferences, missingMaps, unknownCities, siteDataValid };
if (missingReferences.length || missingMaps.length || unknownCities.length || !siteDataValid) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
} else {
    console.log(JSON.stringify({ pages: pages.length, concerts: concerts.length, venues: catalog.length, layouts: configs.length, cities: Object.keys(locations.cities).length, status: 'ok' }, null, 2));
}
