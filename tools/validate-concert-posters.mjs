import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const posterPath = resolve(projectRoot, 'tools/concert-posters.json');
const posters = JSON.parse(await readFile(posterPath, 'utf8'));
const userAgent = 'LIVIBE poster validator/1.0 (+https://esn0326.github.io/Livibe/)';

async function validatePoster([eventId, poster]) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
        const response = await fetch(poster.posterUrl, {
            headers: {
                'User-Agent': userAgent,
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                Range: 'bytes=0-2047'
            },
            redirect: 'follow',
            signal: controller.signal
        });
        const contentType = response.headers.get('content-type') || '';
        const valid = response.ok && contentType.toLowerCase().startsWith('image/');
        await response.body?.cancel();
        return valid ? null : {
            eventId,
            posterUrl: poster.posterUrl,
            status: response.status,
            contentType
        };
    } catch (error) {
        return { eventId, posterUrl: poster.posterUrl, error: error.message };
    } finally {
        clearTimeout(timeout);
    }
}

const entries = Object.entries(posters);
const failures = [];
const concurrency = 12;
let cursor = 0;
await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < entries.length) {
        const entry = entries[cursor];
        cursor += 1;
        const failure = await validatePoster(entry);
        if (failure) failures.push(failure);
    }
}));

if (failures.length) {
    console.error(JSON.stringify({ checked: entries.length, failures }, null, 2));
    process.exitCode = 1;
} else {
    console.log(JSON.stringify({ checked: entries.length, reachableImages: entries.length, status: 'ok' }, null, 2));
}
