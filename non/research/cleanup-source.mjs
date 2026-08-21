import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const generatedDir = path.join(root, 'non', 'generated');
await mkdir(generatedDir, { recursive: true });

const mapPath = path.join(root, 'assets', 'js', 'maps', 'taipei-arena.js');
const mapSource = await readFile(mapPath, 'utf8');
await writeFile(path.join(generatedDir, 'taipei-arena-pre-cleanup.js'), mapSource, 'utf8');

const centralMarker = '    window.taipeiArenaMapMarkup = function () {';
const centralStarts = Array.from(mapSource.matchAll(/    window\.taipeiArenaMapMarkup = function \(\) \{/g), (match) => match.index);
const singleStarts = Array.from(mapSource.matchAll(/    window\.singleSideArenaMapMarkup = function \(\) \{/g), (match) => match.index);
const centralStart = centralStarts.at(-1);
const prefixEnd = centralStarts[0];
const aliasMarker = '    window.centralStageMapMarkup = window.taipeiArenaMapMarkup;';
const aliasStart = mapSource.indexOf(aliasMarker, centralStart);
const aliasEnd = aliasStart + aliasMarker.length;
const singleStart = singleStarts.at(-1);
const controlsStart = mapSource.indexOf('    window.setupArenaMapControls = function', singleStart);

if ([centralStart, prefixEnd, aliasStart, singleStart, controlsStart].some((index) => index == null || index < 0)) {
    throw new Error('Could not identify Taipei Arena implementation boundaries.');
}

const cleanedMap = [
    mapSource.slice(0, prefixEnd).trimEnd(),
    mapSource.slice(centralStart, aliasEnd).trim(),
    mapSource.slice(singleStart, controlsStart).trim(),
    mapSource.slice(controlsStart).trimStart()
].join('\n\n');
await writeFile(mapPath, cleanedMap, 'utf8');

const concertPath = path.join(root, 'assets', 'js', 'pages', 'concert.js');
const concertSource = await readFile(concertPath, 'utf8');
const unusedStart = concertSource.indexOf('    const svgContent = `');
const renderStart = concertSource.indexOf("    qs('#stage-svg-diagram').setAttribute", unusedStart);
if (unusedStart < 0 || renderStart < 0) throw new Error('Could not identify unused detail SVG example.');
await writeFile(
    path.join(generatedDir, 'unused-detail-seat-example.txt'),
    concertSource.slice(unusedStart, renderStart).trim(),
    'utf8'
);
await writeFile(concertPath, concertSource.slice(0, unusedStart) + concertSource.slice(renderStart), 'utf8');

console.log(`Taipei Arena implementations: ${centralStarts.length} → 1; single-side implementations: ${singleStarts.length} → 1.`);
