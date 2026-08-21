(function () {
    const PHOTO_ZONES = new Set([
        'lta-floora', 'lta-floorb', 'lta-floorc', 'lta-floord',
        'lta-orange1b2', 'lta-orange2a1', 'lta-orange2a2', 'lta-orange2b1',
        'lta-orange4a2', 'lta-orange4b1', 'lta-yellow1b1', 'lta-yellow2a1',
        'lta-yellow2a2', 'lta-yellow2b2', 'lta-yellow4b2', 'lta-blue1a1',
        'lta-blue3b2', 'lta-blue5b1'
    ]);

    const zone = (id, label, fill, d, x, y) => ({ id, label, fill, d, x, y });
    const zones = [
        zone('lta-blue5b2', '藍5B-2', '#0678e1', 'm873 1652.5-47.5-59-239.5 139 67 98.5z', 729.5, 1712.25),
        zone('lta-blue5b1', '藍5B-1', '#0678e1', 'm934 1712-50-49-203.5 192 80.5 73z', 807.25, 1795.5),
        zone('lta-blue4b2', '藍4B-2', '#0678e1', 'm1016.5 1757-68.5-39-152 226.5 114 61.5z', 906.25, 1862),
        zone('lta-blue4b1', '藍4B-1', '#0678e1', 'm1111 1788.5-73-22-78 261 120.5 27.5z', 1035.5, 1910.75),
        zone('lta-blue3b2', '藍3B-2', '#0678e1', 'm1254.49 1796.66-123.9-4.66-29.59 265.41 157 2.59z', 1179.5, 1926),
        zone('lta-blue3b1', '藍3B-1', '#0678e1', 'm1297.51 1796.66 123.9-4.66 29.59 265.41-157 2.59z', 1372.5, 1926),
        zone('lta-blue5a3', '藍5A-3', '#0678e1', 'M366 1926c-42.068-45.78-113.055-151.34-124.5-174.5l168.5-44 82 136z', 366.75, 1816.75),
        zone('lta-blue5a2', '藍5A-2', '#0678e1', 'M640 1994.66 508.901 1867 406 1936.5c58.164 59.79 92.932 90.95 162.266 138.5z', 523, 1971),
        zone('lta-blue5a1', '藍5A-1', '#0678e1', 'M796 2088.89 657.692 2011 596 2094.18 757.692 2174z', 696, 2092.5),
        zone('lta-blue4a2', '藍4A-2', '#0678e1', 'M1004 2206.5 812 2146l-16 45 192 63z', 900, 2200),
        zone('lta-blue1b1', '藍1B-1', '#0678e1', 'm1673 1652.5 47.5-59 239.5 139-67 98.5z', 1816.5, 1712.25),
        zone('lta-blue1b2', '藍1B-2', '#0678e1', 'm1612 1712 50-49 203.5 192-80.5 73z', 1738.75, 1795.5),
        zone('lta-blue2b1', '藍2B-1', '#0678e1', 'm1529.5 1757 68.5-39 152 226.5-114 61.5z', 1639.75, 1862),
        zone('lta-blue2b2', '藍2B-2', '#0678e1', 'm1435 1788.5 73-22 78 261-120.5 27.5z', 1510.5, 1910.75),
        zone('lta-blue1a1', '藍1A-1', '#0678e1', 'M2180 1926c42.07-45.78 113.06-151.34 124.5-174.5l-168.5-44-82 136z', 2179.25, 1816.75),
        zone('lta-blue1a2', '藍1A-2', '#0678e1', 'M1906 1994.66 2037.1 1867l102.9 69.5c-58.16 59.79-92.93 90.95-162.27 138.5z', 2023, 1971),
        zone('lta-blue2a1', '藍2A-1', '#0678e1', 'm1750 2088.89 138.31-77.89 61.69 83.18-161.69 79.82z', 1850, 2092.5),
        zone('lta-blue2a2', '藍2A-2', '#0678e1', 'm1531 2217.5 192-60.5 16 45-192 63z', 1635, 2211),
        zone('lta-blue4a1', '藍4A-1', '#0678e1', 'm1017 2268.86 22-94.86 120 12.71V2293z', 1088, 2233.5),
        zone('lta-blue3a1', '藍3A-1', '#0678e1', 'm1530 2268.86-22-94.86-120 12.71V2293z', 1459, 2233.5),

        zone('lta-yellow4b1', '黃4B-1', '#dcb500', 'm565 1699-45-95 266-90.5 21 44.5z', 663.5, 1606.25),
        zone('lta-yellow4b2', '黃4B-2', '#dcb500', 'M510.849 1542c-17.352-47.9-21.254-78.19-21.849-136h275.599L779 1479z', 634, 1474),
        zone('lta-yellow1b2', '黃1B-2', '#dcb500', 'M489 733V628.5h271.5V733z', 624.75, 680.75),
        zone('lta-yellow1b1', '黃1B-1', '#dcb500', 'M489 945V768h272v177z', 625, 856.5),
        zone('lta-yellow2b2', '黃2B-2', '#dcb500', 'M489 1155V980h272v175z', 625, 1067.5),
        zone('lta-yellow2a1', '黃2A-1', '#dcb500', 'M86 1267v-173h243v173z', 207.5, 1180.5),
        zone('lta-yellow2a2', '黃2A-2', '#dcb500', 'M86 1071V898h243v173z', 207.5, 984.5),
        zone('lta-yellow1a1', '黃1A-1', '#dcb500', 'M86 870V697h243v173z', 207.5, 783.5),
        zone('lta-yellow4a2', '黃4A-2', '#dcb500', 'M328.299 1294 86 1297.99c9.396 86.57 18.194 130.38 42.5 197.01l212.5-8.98c-11.508-94.52-13.042-132.85-12.701-192.02Z', 213.5, 1394.5),
        zone('lta-yellow4a1', '黃4A-1', '#dcb500', 'M222.5 1718c-56.981-71.78-69.164-110.48-81.5-188l207-17 43 146z', 266, 1615.5),
        zone('lta-yellow2b1', '黃2B-1', '#dcb500', 'M489 1367v-175h272v175z', 625, 1279.5),

        zone('lta-orange4b2', '橙4B-2', '#f1a000', 'm1981 1699 45-95-266-90.5-21 44.5z', 1882.5, 1606.25),
        zone('lta-orange4a1', '橙4A-1', '#f1a000', 'M2323.5 1718c56.98-71.78 69.16-110.48 81.5-188l-207-17-43 146z', 2280, 1615.5),
        zone('lta-orange4b1', '橙4B-1', '#f1a000', 'M2039.15 1542c17.35-47.9 21.26-78.19 21.85-136h-275.6l-14.4 73z', 1916, 1474),
        zone('lta-orange1b1', '橙1B-1', '#f1a000', 'M2061 733V628.5h-271.5V733z', 1925.25, 680.75),
        zone('lta-orange1b2', '橙1B-2', '#f1a000', 'M2061 945V768h-272v177z', 1925, 856.5),
        zone('lta-orange2b1', '橙2B-1', '#f1a000', 'M2061 1155V980h-272v175z', 1925, 1067.5),
        zone('lta-orange2a2', '橙2A-2', '#f1a000', 'M2464 1267v-173h-243v173z', 2342.5, 1180.5),
        zone('lta-orange2a1', '橙2A-1', '#f1a000', 'M2464 1071V898h-243v173z', 2342.5, 984.5),
        zone('lta-orange1a2', '橙1A-2', '#f1a000', 'M2464 870V697h-243v173z', 2342.5, 783.5),
        zone('lta-orange4a2', '橙4A-2', '#f1a000', 'm2221.7 1294 242.3 3.99c-9.4 86.57-18.19 130.38-42.5 197.01l-212.5-8.98c11.51-94.52 13.04-132.85 12.7-192.02Z', 2336.5, 1394.5),
        zone('lta-orange2b2', '橙2B-2', '#f1a000', 'M2061 1367v-175h-272v175z', 1925, 1279.5),

        zone('lta-floora', 'A', '#3bb153', 'M876 1091.5V662h406v429.5z', 1079, 876.75),
        zone('lta-floorb', 'B', '#3bb153', 'M1307 1091.5V662h406v429.5z', 1510, 876.75),
        zone('lta-floorc', 'C', '#3bb153', 'M876 1546v-429.5h406V1546z', 1079, 1331.25),
        zone('lta-floord', 'D', '#3bb153', 'M1307 1546v-429.5h406V1546z', 1510, 1331.25)
    ];

    const zoneInfo = (item, index) => {
        const isFloor = item.id.includes('floor');
        const isBlue = item.id.includes('blue');
        const isYellow = item.id.includes('yellow');
        const location = isFloor ? `平面區 · ${item.label} 區`
            : isBlue ? `高層看台 · ${item.label}`
                : isYellow ? `左側看台 · ${item.label}`
                    : `右側看台 · ${item.label}`;
        const score = isFloor ? 8.8 + (index % 2) * .2
            : isBlue ? 7.8 + (index % 4) * .1
                : 8.1 + (index % 4) * .1;
        const copy = isFloor
            ? '平面區能近距離觀看人物與延伸舞台，實際遮擋會受到前排觀眾身高與站位影響。'
            : isBlue
                ? '高層看台可完整觀看舞台、燈光與全場動線，人物細節較需要搭配大螢幕。'
                : '側邊看台兼顧舞台距離與視線高度；越靠舞台側邊，觀看主螢幕的角度會越斜。';
        return {
            title: `${item.label} 區視野`,
            location,
            score: score.toFixed(1),
            copy,
            tags: isFloor ? ['平面區', '近距離'] : ['固定座席', isBlue ? '完整舞美' : '側面視角'],
            photo: index % 4
        };
    };

    window.LINKOU_ARENA_ZONES = Object.fromEntries(zones.map((item, index) => [item.id, zoneInfo(item, index)]));
    window.LINKOU_ARENA_ZONES['lta-access-left'] = {
        title: '左側身障區', location: '左側看台 · 身障席', score: '8.3',
        copy: '身障席鄰近左側看台，實際席位及陪同席安排請以該場主辦單位公告為準。',
        tags: ['身障席', '無障礙動線'], photo: 0
    };
    window.LINKOU_ARENA_ZONES['lta-access-right'] = {
        title: '右側身障區', location: '右側看台 · 身障席', score: '8.3',
        copy: '身障席鄰近右側看台，實際席位及陪同席安排請以該場主辦單位公告為準。',
        tags: ['身障席', '無障礙動線'], photo: 1
    };

    const seatMarkup = (item) => {
        const hasPhoto = PHOTO_ZONES.has(item.id);
        return `<g class="seat-zone ${hasPhoto ? 'has-photo' : 'no-photo'}" data-zone="${item.id}" data-has-photo="${hasPhoto}" tabindex="0" role="button" aria-label="${item.label} 區">
            <path d="${item.d}" fill="${item.fill}"/>
            <text class="zone-label" x="${item.x}" y="${item.y}">${item.label}</text>
        </g>`;
    };

    const accessMarkup = (id, x, side) => `<g class="seat-zone access-zone no-photo" data-zone="${id}" data-has-photo="false" tabindex="0" role="button" aria-label="${side}身障區">
        <rect x="${x}" y="1031" width="79" height="85" rx="8" fill="#c7c4cc"/>
        <text class="accessibility-symbol" x="${x + 39.5}" y="1075">♿</text>
    </g>`;

    window.linkouArenaMapMarkup = function () {
        return `
            <rect width="2550" height="2550" fill="#eeeeee"/>
            <g class="linkou-stage" aria-label="舞台 STAGE">
                <rect x="952.5" y="294" width="654.5" height="291.5" rx="5"/>
                <text x="1279.75" y="420">舞台</text>
                <text x="1279.75" y="485">STAGE</text>
            </g>
            ${zones.map(seatMarkup).join('')}
            ${accessMarkup('lta-access-left', 385, '左側')}
            ${accessMarkup('lta-access-right', 2100, '右側')}
            <g class="linkou-foh" aria-label="控台 FOH">
                <rect x="1110" y="1573" width="341" height="121.5" rx="5"/>
                <text x="1280.5" y="1640">控台 FOH</text>
            </g>`;
    };
}());
