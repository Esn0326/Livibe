(function () {
    const zone = (title, location, score, copy, tags, photo = 0) => ({ title, location, score, copy, tags, photo });

    window.TAIPEI_ARENA_ZONES = {
        special1: zone('特1區', '平面特區 · 舞台左側', '9.0', '鄰近主舞台左側，人物距離近；部分演出需要稍微轉頭觀看延伸台。', ['近距離', '側面視角'], 0),
        special2: zone('特2區', '平面特區 · 中央', '9.5', '正對延伸舞台的核心位置，主舞台與人物距離表現都很出色。', ['延伸舞台近', '神席'], 1),
        special3: zone('特3區', '平面特區 · 舞台右側', '9.0', '鄰近主舞台右側，適合看人物細節，舞台配置不同時需注意器材位置。', ['近距離', '留意配置'], 2),
        special4: zone('特4區', '平面特區 · 左後方', '8.6', '距離舞台適中，能兼顧延伸台與部分完整舞美。', ['人物清楚', '舞台完整'], 3),
        special5: zone('特5區', '平面特區 · 後方中央', '8.8', '平面區中央視角，舞台完整度高，但需留意前排觀眾身高。', ['正面視角', '可能有人頭'], 1),
        special6: zone('特6區', '平面特區 · 右後方', '8.6', '與特4區對稱，適合兼顧人物與大螢幕。', ['視野均衡', '大螢幕清楚'], 2),
        purple2a: zone('紫2A', '二樓 · 舞台左前側', '8.7', '與舞台距離很近，但觀看完整舞台時角度較斜。', ['近距離', '側面視角'], 0),
        purple2b: zone('紫2B', '二樓 · 左側前段', '8.8', '高度與距離平衡良好，花車或側台經過時很有臨場感。', ['視線平穩', '人物清楚'], 1),
        purple2c: zone('紫2C', '二樓 · 左側中段', '8.5', '能清楚看見主舞台與大螢幕，側面角度仍在可接受範圍。', ['大螢幕清楚', '側面視角'], 2),
        purple2d: zone('紫2D', '二樓 · 左側後段', '8.3', '舞台距離稍遠，但視線高度舒適且較少受到人頭遮擋。', ['少人頭遮擋', '視線平穩'], 3),
        purple2e: zone('紫2E', '二樓 · 左後角', '8.1', '可看到完整燈光與觀眾席，主舞台人物較小。', ['完整舞美', '人物較小'], 0),
        red2a: zone('紅2A', '二樓 · 舞台右前側', '8.7', '與紫2A對稱，人物距離近，但演出時可能主要看到側面。', ['近距離', '側面視角'], 1),
        red2b: zone('紅2B', '二樓 · 右側前段', '8.8', '高度與距離表現均衡，是右側看台的熱門選擇。', ['視線平穩', '人物清楚'], 2),
        red2c: zone('紅2C', '二樓 · 右側中段', '8.5', '主舞台與螢幕皆容易觀看，舞美完整度不錯。', ['舞台完整', '大螢幕清楚'], 3),
        red2d: zone('紅2D', '二樓 · 右側後段', '8.3', '距離稍遠但不易被前方觀眾遮擋，適合穩定觀看。', ['少人頭遮擋', '視線平穩'], 0),
        red2e: zone('紅2E', '二樓 · 右後角', '8.1', '能俯瞰完整燈海，人物細節較需要依賴大螢幕。', ['完整舞美', '人物較小'], 1),
        yellow2a: zone('黃2A', '二樓 · 後方右側', '8.5', '正面偏右的均衡視角，適合完整欣賞舞台設計。', ['舞台完整', '性價比'], 2),
        yellow2b: zone('黃2B', '二樓 · 後方偏右', '8.7', '接近正中央，舞台、螢幕與音場比例相當均衡。', ['正面視角', '音場均衡'], 3),
        yellow2c: zone('黃2C', '二樓 · 後方中央', '9.0', '最正面的二樓視角，完整舞美與燈光效果表現最佳。', ['正面神位', '完整舞美'], 0),
        yellow2d: zone('黃2D', '二樓 · 後方偏左', '8.7', '與黃2B對稱，視野開闊且適合看完整舞台。', ['正面視角', '視野開闊'], 1),
        yellow2e: zone('黃2E', '二樓 · 後方左側', '8.5', '正面偏左的均衡位置，距離感稍遠但遮擋較少。', ['舞台完整', '少遮擋'], 2),
        yellow3a: zone('黃3A', '三樓 · 右側前段', '7.8', '高度較高且角度偏側，能看舞美但人物主要依賴螢幕。', ['全景', '人物較小'], 3),
        yellow3b: zone('黃3B', '三樓 · 右側中段', '7.9', '視野範圍大，前排座位需留意欄杆高度。', ['全景', '留意欄杆'], 0),
        yellow3c: zone('黃3C', '三樓 · 右後方', '8.0', '可俯瞰舞台與全場燈海，適合重視整體氣氛。', ['全場燈海', '人物較小'], 1),
        yellow3d: zone('黃3D', '三樓 · 後方偏右', '8.1', '接近正面，舞台結構清楚，距離感較遠。', ['完整舞美', '高樓層'], 2),
        yellow3e: zone('黃3E', '三樓 · 後方中央', '8.3', '最正面的高樓層視角，能完整看見燈光與舞台設計。', ['正面視角', '完整舞美'], 3),
        yellow3f: zone('黃3F', '三樓 · 後方偏左', '8.1', '與黃3D對稱，畫面完整且音場相對均衡。', ['完整舞美', '音場均衡'], 0),
        yellow3g: zone('黃3G', '三樓 · 左後方', '8.0', '全景感受良好，第一排可能受到玻璃或欄杆影響。', ['全景', '留意欄杆'], 1),
        yellow3h: zone('黃3H', '三樓 · 左側中段', '7.9', '能看完整燈海，但靠牆座位需注意視線角度。', ['全場燈海', '留意側牆'], 2),
        yellow3i: zone('黃3I', '三樓 · 左側前段', '7.8', '高處側視角，人物較小但能看到舞台機關全貌。', ['舞台機關', '人物較小'], 3),
        yellow3j: zone('黃3J', '三樓 · 左側最前段', '7.6', '距離舞台側邊較近，部分場次可能有器材遮擋。', ['側面視角', '留意器材'], 0),
        east301: zone('東側包廂 301–310', '東側包廂', '7.9', '獨立包廂視角，座位舒適但靠近舞台的區段角度較側。', ['包廂', '側面視角'], 1),
        west301: zone('西側包廂 301–310', '西側包廂', '7.9', '與東側包廂對稱，適合重視空間感與固定座席的觀眾。', ['包廂', '固定座席'], 2)
    };

    for (let number = 301; number <= 310; number += 1) {
        window.TAIPEI_ARENA_ZONES[`east${number}`] = zone(`東${number}包廂`, `東側包廂 · ${number}`, '7.9', '獨立包廂座席，空間感舒適；越靠近舞台的包廂角度越側。', ['包廂', '固定座席'], number % 4);
        window.TAIPEI_ARENA_ZONES[`west${number}`] = zone(`西${number}包廂`, `西側包廂 · ${number}`, '7.9', '獨立包廂座席，適合重視舒適度與固定視線的觀眾。', ['包廂', '固定座席'], (number + 1) % 4);
    }
    for (let number = 401; number <= 410; number += 1) {
        window.TAIPEI_ARENA_ZONES[`east${number}`] = zone(`東${number}包廂`, `東側包廂 · ${number}`, '7.7', '單側舞台配置的東側高層包廂，實際遮擋依舞台設備而異。', ['包廂', '側面視角'], number % 4);
        window.TAIPEI_ARENA_ZONES[`west${number}`] = zone(`西${number}包廂`, `西側包廂 · ${number}`, '7.7', '單側舞台配置的西側高層包廂，實際遮擋依舞台設備而異。', ['包廂', '側面視角'], (number + 1) % 4);
    }
    ['a', 'b', 'c', 'd', 'e'].forEach((letter, index) => {
        const label = letter.toUpperCase();
        window.TAIPEI_ARENA_ZONES[`purple1${letter}`] = zone(`紫-1${label}`, `一樓看台 · 舞台左側 ${label}`, (8.9 - index * .12).toFixed(1), '靠近舞台的內側看台，人物距離近，需留意側面角度。', ['近距離', '側面視角'], index % 4);
        window.TAIPEI_ARENA_ZONES[`red1${letter}`] = zone(`紅-1${label}`, `一樓看台 · 舞台右側 ${label}`, (8.9 - index * .12).toFixed(1), '靠近舞台的內側看台，視線高度穩定，部分舞台機關可能在側面。', ['近距離', '固定座席'], (index + 1) % 4);
    });
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach((letter, index) => {
        const label = letter.toUpperCase();
        window.TAIPEI_ARENA_ZONES[`floor${letter}`] = zone(`平面 ${label} 區`, `平面特區 · ${label}`, index < 2 ? '9.2' : index < 6 ? '8.9' : '8.6', '平面特區視角，實際距離與遮擋會依舞台延伸台及前方觀眾而改變。', ['平面特區', '人物距離近'], index % 4);
    });
    ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].forEach((letter, index) => {
        const label = letter.toUpperCase();
        window.TAIPEI_ARENA_ZONES[`yellow800${letter}`] = zone(
            `黃3${label}・800區`,
            `三樓 黃3${label} 最後五排`,
            '7.4',
            '三樓最外圈末五排的獨立票價區，與黃3區其他座位分開評價。',
            ['800元座位', '三樓最後五排'],
            index % 4
        );
    });
    [
        ['accessible-purple2b', '紫2B身障區'],
        ['accessible-purple2d', '紫2D身障區'],
        ['accessible-red2b', '紅2B身障區'],
        ['accessible-red2d', '紅2D身障區']
    ].forEach(([id, label], index) => {
        window.TAIPEI_ARENA_ZONES[id] = zone(
            label,
            `二樓看台・${label}`,
            '8.2',
            '身心障礙席與陪同席區域，實際席位配置及入場方式以主辦單位公告為準。',
            ['身心障礙席', '無障礙動線'],
            index % 4
        );
    });

    const PHOTO_ZONES = new Set(['special1', 'special2', 'special3', 'special5', 'purple2a', 'purple2b', 'purple2c', 'red2a', 'red2b', 'red2c', 'yellow2a', 'yellow2b', 'yellow2c', 'yellow2d', 'yellow2e', 'yellow3c', 'yellow3d', 'yellow3e', 'yellow3f', 'yellow3g', 'east305', 'east306', 'west305', 'west306']);

    const seatGroup = (id, shape, label, fontSize = 13) => `
        <g class="seat-zone" data-zone="${id}" data-has-photo="${PHOTO_ZONES.has(id)}" tabindex="0" role="button" aria-label="${window.TAIPEI_ARENA_ZONES[id].title}">
            ${shape}
            <text class="zone-label" x="${label[0]}" y="${label[1]}" text-anchor="middle" font-size="${fontSize}">${label[2]}</text>
        </g>`;

window.taipeiArenaMapMarkup = function () {
        const trace = window.taipeiArenaTrace;
        if (!trace) return '';
        const byId = new Map(trace.components.map((component) => [component.trace_id, component]));
        const zoneTraces = {
            purple2a: [3, 4], purple2b: [6, 7], purple2c: [18, 19], purple2d: [29, 30], purple2e: [40],
            red2a: [2, 5], red2b: [8, 9], red2c: [20, 21], red2d: [31, 32], red2e: [41],
            special1: [10], special2: [26], special3: [11], special4: [35], special5: [36], special6: [37],
            yellow2a: [46], yellow2b: [50], yellow2c: [51], yellow2d: [49], yellow2e: [47],
            yellow3a: [52], yellow3b: [54], yellow3c: [56], yellow3d: [59], yellow3e: [61],
            yellow3f: [60], yellow3g: [58], yellow3h: [57], yellow3i: [55], yellow3j: [53],
            east310: [12], west310: [13], east309: [14], west309: [15], east308: [16], west308: [17],
            east307: [22], west307: [23], east306: [24], west306: [25], east305: [27], west305: [28],
            east304: [33], west304: [34], east303: [38], west303: [39], east302: [42], west302: [43],
            east301: [44], west301: [45]
        };
        const labels = {
            purple1a: '紫1A', purple1b: '紫1B', purple1c: '紫1C', purple1d: '紫1D', purple1e: '紫1E',
            purple2a: '紫2A', purple2b: '紫2B', purple2c: '紫2C', purple2d: '紫2D', purple2e: '紫2E',
            red1a: '紅1A', red1b: '紅1B', red1c: '紅1C', red1d: '紅1D',
            red2a: '紅2A', red2b: '紅2B', red2c: '紅2C', red2d: '紅2D', red2e: '紅2E',
            special1: '特1區', special2: '特2區', special3: '特3區', special4: '特4區', special5: '特5區', special6: '特6區',
            yellow2a: '黃2A', yellow2b: '黃2B', yellow2c: '黃2C', yellow2d: '黃2D', yellow2e: '黃2E',
            yellow3a: '黃3A', yellow3b: '黃3B', yellow3c: '黃3C', yellow3d: '黃3D', yellow3e: '黃3E',
            yellow3f: '黃3F', yellow3g: '黃3G', yellow3h: '黃3H', yellow3i: '黃3I', yellow3j: '黃3J'
        };
        const envelopeIds = new Set([
            2, 3, 4, 5, 6, 7, 8, 9, 18, 19, 20, 21, 29, 30, 31, 32,
            40, 41, 46, 47, 49, 50, 51
        ]);
        const outerEnvelope = (points) => {
            const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
            const cross = (o, a, b) =>
                (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
            const half = (source) => {
                const result = [];
                source.forEach((point) => {
                    while (result.length > 1 && cross(result.at(-2), result.at(-1), point) <= 0) result.pop();
                    result.push(point);
                });
                return result.slice(0, -1);
            };
            return half(sorted).concat(half([...sorted].reverse()));
        };
        const path = (component, fillOverride) => {
            const points = envelopeIds.has(component.trace_id)
                ? outerEnvelope(component.points)
                : component.points;
            return `<path style="fill:${fillOverride || component.fill}" d="M ${points.map((point) => point.join(' ')).join(' L ')} Z"/>`;
        };
        const zoneColor = (id) => {
            if (/^(east|west)/.test(id)) return '#7d6467';
            if (id.startsWith('special')) return '#4285ae';
            if (id.startsWith('purple')) return '#8d3a92';
            if (id.startsWith('red')) return '#d26369';
            if (id.startsWith('yellow2')) return '#f4b000';
            if (id.startsWith('yellow3')) return '#d99400';
            return null;
        };
        const thirdFloorCuts = {
            yellow3i: [[185, 1150], [370, 1212]],
            yellow3h: [[170, 1250], [457, 1370]],
            yellow3g: [[298, 1370], [549, 1428]],
            yellow3f: [[493, 1428], [643, 1448]],
            yellow3e: [[657, 1448], [807, 1428]],
            yellow3d: [[751, 1428], [1002, 1370]],
            yellow3c: [[843, 1370], [1130, 1250]],
            yellow3b: [[930, 1212], [1115, 1150]]
        };
        const priceLabelPositions = {
            yellow800i: [125, 1188],
            yellow800h: [275, 1360],
            yellow800g: [425, 1448],
            yellow800f: [570, 1468],
            yellow800e: [730, 1468],
            yellow800d: [875, 1448],
            yellow800c: [1025, 1360],
            yellow800b: [1175, 1188]
        };
        const zones = Object.entries(zoneTraces).map(([id, traceIds]) => {
            const components = traceIds.map((traceId) => byId.get(traceId)).filter(Boolean);
            const box = /^(east|west)/.test(id);
            const alignedSide = /^(purple2|red2)[a-d]$/.test(id);
            const fill = zoneColor(id);
            let shapes = components.map((component) => path(component, fill)).join('');
            if (box) {
                const component = components[0];
                const x = id.startsWith('east') ? 76 : 1083;
                const y = component.centroid[1] * trace.target.scale - 22.5;
                shapes = `<rect style="fill:${fill}" x="${x}" y="${y.toFixed(1)}" width="140" height="45" rx="2"/>`;
            }
            if (alignedSide) {
                const [y, height] = {
                    a: [148, 85],
                    b: [242, 137],
                    c: [388, 137],
                    d: [534, 137]
                }[id.at(-1)];
                const [x, width] = id.startsWith('purple2') ? [247, 135] : [917, 135];
                shapes = `<rect style="fill:${fill}" x="${x}" y="${y}" width="${width}" height="${height}" rx="2"/>`;
            }
            if (id === 'yellow3a') {
                const mirrorSource = byId.get(53);
                shapes = `<g transform="translate(${trace.target.width} 0) scale(-1 1)">${path(mirrorSource, fill)}</g>`;
            }
            if (thirdFloorCuts[id]) {
                const [start, end] = thirdFloorCuts[id];
                const mainClipId = `main-rows-${id}`;
                shapes = `<clipPath id="${mainClipId}" pointer-events="none">
                    <path d="M -150 -100 L 1450 -100 L 1450 ${end[1]} L ${end[0]} ${end[1]} L ${start[0]} ${start[1]} L -150 ${start[1]} Z"/>
                </clipPath>
                <g clip-path="url(#${mainClipId})" pointer-events="visiblePainted">${shapes}</g>`;
            }
            const label = labels[id] || id.replace(/^(east|west)/, '').toUpperCase();
            let centroid = components.reduce((sum, component) => [
                sum[0] + component.centroid[0], sum[1] + component.centroid[1]
            ], [0, 0]).map((value) => value / components.length);
            if (id === 'yellow3a') {
                const mirrorSource = byId.get(53);
                centroid = [trace.source.width - mirrorSource.centroid[0], mirrorSource.centroid[1]];
            }
            const x = (centroid[0] * trace.target.scale).toFixed(1);
            const y = (centroid[1] * trace.target.scale).toFixed(1);
            return `<g class="seat-zone${PHOTO_ZONES.has(id) ? ' has-photo' : ' no-photo'}" data-zone="${id}" data-seat-button="true" tabindex="0" role="button" aria-label="${label}">${shapes}<text class="zone-label" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="18">${label}</text></g>`;
        }).join('');
        const priceZones = Object.entries(thirdFloorCuts).map(([baseId, cut]) => {
            const components = zoneTraces[baseId].map((traceId) => byId.get(traceId)).filter(Boolean);
            const shapes = components.map((component) => path(component, zoneColor(baseId))).join('');
            const [start, end] = cut;
            const id = baseId.replace('yellow3', 'yellow800');
            const clipId = `last-rows-${id}`;
            const [labelX, labelY] = priceLabelPositions[id];
            return `<g class="seat-zone no-photo price-zone" data-zone="${id}" data-seat-button="true" tabindex="0" role="button" aria-label="800元獨立座位區">
                <clipPath id="${clipId}" pointer-events="none">${shapes}</clipPath>
                <path d="M ${start[0]} ${start[1]} L ${end[0]} ${end[1]} L 1450 1600 L -150 1600 Z" style="fill:#bd4fa3;stroke:#f5f5f5;stroke-width:5" clip-path="url(#${clipId})" pointer-events="visiblePainted"/>
                <text class="zone-label price-label" x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="15">800</text>
            </g>`;
        }).join('');
        const stage = `<g class="stage-shape" style="fill:#929292">
            <path d="M540 4 H760 V16 H795 V32 H825 V50 H850 V198 H700 V342 H735 V455 H565 V342 H600 V198 H450 V50 H475 V32 H505 V16 H540 Z"/>
        </g>`;
        const foh = `<g class="foh">
            <rect x="565" y="820" width="170" height="64" rx="2" style="fill:#8f8f8f;stroke:none"/>
            <text x="650" y="861" text-anchor="middle" font-size="22" fill="#fff">控台 FOH</text>
        </g>`;
        const accessibilityZones = [
            ['accessible-purple2b', 225, 242, '紫2B身障區'],
            ['accessible-purple2d', 225, 534, '紫2D身障區'],
            ['accessible-red2b', 1058, 242, '紅2B身障區'],
            ['accessible-red2d', 1058, 534, '紅2D身障區']
        ].map(([id, x, y, label]) => `
            <g class="seat-zone no-photo accessibility-zone" data-zone="${id}" data-seat-button="true" tabindex="0" role="button" aria-label="${label}">
                <rect x="${x}" y="${y}" width="17" height="137" rx="2" style="fill:#8f8f8f"/>
                <text x="${x + 8.5}" y="${y + 82}" text-anchor="middle" font-size="22" style="fill:#111;pointer-events:none">♿</text>
            </g>`).join('');
        return `<rect width="${trace.target.width}" height="${trace.target.height}" fill="#e2e2e2"/>
            <g class="traced-fixed">${stage}${foh}</g>
            <text x="650" y="105" text-anchor="middle" font-size="34" fill="#fff">舞台</text>
            <text x="650" y="145" text-anchor="middle" font-size="34" fill="#fff">STAGE</text>
            ${accessibilityZones}
            ${zones}
            ${priceZones}`;
    };

    window.centralStageMapMarkup = window.taipeiArenaMapMarkup;

window.singleSideArenaMapMarkup = function () {
        const trace = window.singleSideArenaTrace;
        if (!trace) return '';
        const byId = new Map(trace.components.map((component) => [component.trace_id, component]));
        const groups = {
            purple2a: [2, 4, 6], purple2b: [8, 9], purple2c: [27, 28], purple2d: [47, 48], purple2e: [66, 67],
            red2a: [3, 5, 7], red2b: [10, 11, 22], red2c: [29, 30], red2d: [49, 50, 55], red2e: [68, 69],
            floorA: [16], floorB: [31], floorC: [45], floorD: [60],
            floorE: [17], floorF: [32], floorG: [46], floorH: [61],
            yellow2e: [74], yellow2d: [77], yellow2c: [79], yellow2b: [78], yellow2a: [75],
            yellow3j: [80], yellow3i: [82], yellow3h: [85], yellow3g: [87], yellow3f: [88],
            yellow3e: [89], yellow3d: [86], yellow3c: [84], yellow3b: [83], yellow3a: [81]
        };
        const labels = {
            purple2a: '紫2A', purple2b: '紫2B', purple2c: '紫2C', purple2d: '紫2D', purple2e: '紫2E',
            red2a: '紅2A', red2b: '紅2B', red2c: '紅2C', red2d: '紅2D', red2e: '紅2E',
            floorA: 'A', floorB: 'B', floorC: 'C', floorD: 'D', floorE: 'E', floorF: 'F', floorG: 'G', floorH: 'H',
            yellow2a: '黃2A', yellow2b: '黃2B', yellow2c: '黃2C', yellow2d: '黃2D', yellow2e: '黃2E',
            yellow3a: '黃3A', yellow3b: '黃3B', yellow3c: '黃3C', yellow3d: '黃3D', yellow3e: '黃3E',
            yellow3f: '黃3F', yellow3g: '黃3G', yellow3h: '黃3H', yellow3i: '黃3I', yellow3j: '黃3J'
        };
        const zoneId = (id) => id.startsWith('floor') ? `floor${id.at(-1).toLowerCase()}` : id;
        const fill = (id) => id.startsWith('purple') ? '#8c22db'
            : id.startsWith('red') ? '#ea3e31'
                : id.startsWith('floor') ? '#3bb153'
                    : id.startsWith('yellow3') ? '#e19a00'
                        : '#f0aa00';
        const hull = (points) => {
            const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
            const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
            const half = (source) => {
                const result = [];
                source.forEach((point) => {
                    while (result.length > 1 && cross(result.at(-2), result.at(-1), point) <= 0) result.pop();
                    result.push(point);
                });
                return result.slice(0, -1);
            };
            return half(sorted).concat(half([...sorted].reverse()));
        };
        const path = (component, color, useHull = false) => {
            const points = useHull ? hull(component.points) : component.points;
            return `<path style="fill:${color}" d="M ${points.map((point) => point.join(' ')).join(' L ')} Z"/>`;
        };
        const zones = Object.entries(groups).map(([id, ids]) => {
            const components = ids.map((traceId) => byId.get(traceId)).filter(Boolean);
            const useHull = !/^yellow3[abij]$/.test(id);
            let shapes = components.length > 1
                ? path({ points: components.flatMap((component) => component.points) }, fill(id), true)
                : path(components[0], fill(id), useHull);
            let centroid = components.reduce((sum, component) => [
                sum[0] + component.centroid[0], sum[1] + component.centroid[1]
            ], [0, 0]).map((value) => value / components.length);
            if (/^(purple2|red2)[a-d]$/.test(id)) {
                const [y, height] = { a: [38, 100], b: [148, 143], c: [303, 145], d: [458, 145] }[id.at(-1)];
                const [x, width] = id.startsWith('purple') ? [215, 214] : [854, 214];
                shapes = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" style="fill:${fill(id)}"/>`;
                centroid = [(x + width / 2) / trace.target.scale, (y + height / 2) / trace.target.scale];
            }
            if (/^floor[A-H]$/.test(id)) {
                const letter = id.at(-1);
                const left = 'ABCD'.includes(letter);
                const row = left ? 'ABCD'.indexOf(letter) : 'EFGH'.indexOf(letter);
                const x = left ? 458 : 653;
                const y = [165, 305, 446, 587][row];
                const width = left ? 181 : 175;
                const height = [126, 129, 129, 128][row];
                shapes = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" style="fill:${fill(id)}"/>`;
                centroid = [(x + width / 2) / trace.target.scale, (y + height / 2) / trace.target.scale];
            }
            const x = (centroid[0] * trace.target.scale).toFixed(1);
            const y = (centroid[1] * trace.target.scale).toFixed(1);
            const dataZone = zoneId(id);
            return `<g class="seat-zone${PHOTO_ZONES.has(dataZone) ? ' has-photo' : ' no-photo'}" data-zone="${dataZone}" data-seat-button="true" tabindex="0" role="button" aria-label="${labels[id]}">
                ${shapes}<text class="zone-label" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="23">${labels[id]}</text>
            </g>`;
        }).join('');
        const boxes = ['east', 'west'].map((side) => Array.from({ length: 10 }, (_, index) => {
            const y = 155 + index * 57;
            const first = 410 - index;
            const second = 310 - index;
            const columns = side === 'east' ? [[33, first], [100, second]] : [[1128, second], [1193, first]];
            return columns.map(([x, number]) => `<g class="seat-zone no-photo box-zone" data-zone="${side}${number}" data-seat-button="true" tabindex="0" role="button">
                <rect x="${x}" y="${y}" width="55" height="31" rx="3" style="fill:#7d6467"/>
                <text class="zone-label" x="${x + 27.5}" y="${y + 15.5}" text-anchor="middle" dominant-baseline="middle" font-size="14">${number}</text>
            </g>`).join('');
        }).join('')).join('');
        const priceTrace = window.singleSide800Trace;
        let priceZones = '';
        if (priceTrace) {
            const darkPaths = priceTrace.components.map((component) => path(component, '#c49004', true)).join('');
            const positions = {
                i: [176, 1255], h: [250, 1320], g: [379, 1380], f: [558, 1428],
                e: [720, 1428], d: [897, 1380], c: [1038, 1320], b: [1110, 1255]
            };
            priceZones = Object.entries(positions).map(([letter, position]) => {
                const baseId = `yellow3${letter}`;
                const baseComponents = groups[baseId].map((traceId) => byId.get(traceId)).filter(Boolean);
                const baseShape = baseComponents.map((component) => path(component, '#fff', false)).join('');
                const id = `yellow800${letter}`;
                return `<g class="seat-zone no-photo price-zone" data-zone="${id}" data-seat-button="true" tabindex="0" role="button">
                    <clipPath id="confirmed-${id}" pointer-events="none">${baseShape}</clipPath>
                    <g clip-path="url(#confirmed-${id})" pointer-events="visiblePainted">${darkPaths}</g>
                    <text class="zone-label" x="${position[0]}" y="${position[1]}" text-anchor="middle" dominant-baseline="middle" font-size="15">800</text>
                </g>`;
            }).join('');
        }
        const stage = path(byId.get(1), '#c4c2c6', true);
        return `<rect width="${trace.target.width}" height="${trace.target.height}" fill="#fff"/>
            <g class="stage-shape">${stage}<text x="636.5" y="58" text-anchor="middle" font-size="28">舞台</text><text x="636.5" y="94" text-anchor="middle" font-size="28">STAGE</text></g>
            <g class="foh"><rect x="558" y="763" width="177" height="72" rx="3" style="fill:#89858d;stroke:none"/><text x="646.5" y="806" text-anchor="middle" font-size="22" fill="#fff">控台 FOH</text></g>
            ${boxes}${zones}${priceZones}`;
    };

window.setupArenaMapControls = function (svg, controls) {
        if (!svg || !controls || controls.dataset.bound === 'true') return;
        controls.dataset.bound = 'true';
        const applyScale = (scale) => {
            svg.style.width = `${scale * 100}%`;
            svg.style.height = 'auto';
            svg.style.maxWidth = 'none';
            svg.dataset.scale = String(scale);
        };
        controls.addEventListener('click', (event) => {
            const button = event.target.closest('[data-map-action]');
            if (!button) return;
            const action = button.dataset.mapAction;
            let scale = Number(svg.dataset.scale || 1);
            if (action === 'in') scale = Math.min(2, Number((scale + .2).toFixed(1)));
            if (action === 'out') scale = Math.max(.7, Number((scale - .2).toFixed(1)));
            if (action === 'reset') scale = 1;
            if (action === 'hide-empty') {
                const hiding = svg.classList.toggle('hide-no-photo');
                button.classList.toggle('active', hiding);
                button.textContent = hiding ? '顯示全部區域' : '隱藏無照片區';
            }
            applyScale(scale);
        });
        applyScale(Number(svg.dataset.scale || 1));
    };
}());
