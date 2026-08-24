(function () {
    const now = new Date();
    const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const FALLBACK_POSTERS = [
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1100&auto=format&fit=crop'
    ];

    function hashCode(value) {
        return Array.from(value).reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
    }

    function slugify(value) {
        return value.trim().toLowerCase().replace(/\s+/g, '-');
    }

    function firstDate(value) {
        return String(value || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || '1970-01-01';
    }

    function classifyEvent(title, artists, sessions) {
        const text = `${title} ${sessions.map((session) => session.venue).join(' ')}`;
        if (/音樂祭|開唱|Festival|Fest|S2O|櫻花祭|火球祭|浪人祭|簡單生活節/i.test(text) || artists.length > 2) return 'FESTIVAL';
        return sessions.length > 1 ? 'TOUR' : 'SHOWCASE';
    }

    function transform(rawData) {
        const flatData = Array.isArray(rawData?.[0]) ? rawData.flat() : rawData;
        const grouped = new Map();
        (Array.isArray(flatData) ? flatData : []).forEach((item) => {
            const title = String(item.theme || '未命名演出').replace(/\s+/g, ' ').trim();
            const groupKey = item.eventId || title;
            if (!grouped.has(groupKey)) grouped.set(groupKey, {
                id: item.eventId || slugify(title),
                legacyId: slugify(title),
                title,
                organizer: item.organizer || '未提供',
                rawItems: []
            });
            grouped.get(groupKey).rawItems.push(item);
        });

        return Array.from(grouped.values()).map((group) => {
            const artists = [...new Set(group.rawItems.map((item) => item.artist).filter(Boolean))];
            const dateMap = new Map();
            group.rawItems.forEach((item) => {
                const date = firstDate(item.date);
                if (!dateMap.has(date)) dateMap.set(date, { date, label: item.date, venue: item.venue || '未提供', artists: [] });
                dateMap.get(date).artists.push(item.artist);
            });
            const sessions = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
            const tag = classifyEvent(group.title, artists, sessions);
            const startDate = sessions[0]?.date || '1970-01-01';
            const endDate = sessions.at(-1)?.date || startDate;
            return {
                id: group.id,
                legacyId: group.legacyId,
                title: group.title,
                displayArtist: tag === 'FESTIVAL' ? '多組藝人共同演出' : artists[0] || '待公布',
                artists,
                tag,
                startDate,
                endDate,
                dateDisplay: sessions.length > 1 ? `${startDate} 起，共 ${sessions.length} 場` : startDate,
                poster: FALLBACK_POSTERS[Math.abs(hashCode(group.title)) % FALLBACK_POSTERS.length],
                organizer: group.organizer,
                sessions,
                isUpcoming: new Date(`${endDate}T00:00:00+08:00`) >= TODAY
            };
        });
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[char]));
    }

    window.LIVIBE_EVENTS = {
        transform,
        escapeHtml,
        typeLabel: (tag) => ({ TOUR: '巡迴', FESTIVAL: '音樂祭', SHOWCASE: '專場' }[tag] || tag)
    };
}());

(function () {
    const DISCUSSION_PREFIX = 'livibe-discussion-';
    const MIN_REPRESENTATIVE_SAMPLES = 5;

    function kindFor(event) {
        return event?.isUpcoming ? 'expectation' : 'review';
    }

    function read(eventId) {
        try {
            const value = JSON.parse(localStorage.getItem(`${DISCUSSION_PREFIX}${eventId}`) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function entriesFor(event) {
        const kind = kindFor(event);
        const ids = [...new Set([event.id, event.legacyId].filter(Boolean))];
        const seen = new Set();
        return ids.flatMap((eventId) => read(eventId)).filter((item) => {
            const itemId = item.id || `${item.time}:${item.text}`;
            if (seen.has(itemId)) return false;
            seen.add(itemId);
            return (item.kind || kind) === kind && Number.isFinite(Number(item.rating));
        });
    }

    function summary(event) {
        const entries = entriesFor(event);
        const total = entries.reduce((sum, item) => sum + Number(item.rating), 0);
        const distribution = Array.from({ length: 10 }, (_, index) => ({
            score: index + 1,
            count: entries.filter((item) => Number(item.rating) === index + 1).length
        }));
        return {
            kind: kindFor(event),
            count: entries.length,
            average: entries.length ? Number((total / entries.length).toFixed(1)) : null,
            minimumSamples: MIN_REPRESENTATIVE_SAMPLES,
            isRepresentative: entries.length >= MIN_REPRESENTATIVE_SAMPLES,
            distribution
        };
    }

    window.LIVIBE_COMMUNITY = {
        MIN_REPRESENTATIVE_SAMPLES,
        kindFor,
        read,
        entriesFor,
        summary
    };
}());

(function () {
    const ADMIN_SESSION_KEY = 'livibe-admin-session';
    const ADMIN_ACCOUNT = Object.freeze({
        username: 'admin',
        passwordHash: '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0'
    });
    const roles = Object.freeze({
        visitor: { label: '訪客', level: 0, permissions: [] },
        member: { label: '一般會員', level: 10, permissions: ['discussion.create'] },
        editor: { label: '內容編輯', level: 50, permissions: ['discussion.create'] },
        super_admin: {
            label: '最高管理員',
            level: 100,
            permissions: ['discussion.create', 'discussion.delete', 'venue.category.manage', 'concert.venue_config.manage']
        }
    });

    function readAdminSession() {
        try {
            const session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || 'null');
            return session?.username === ADMIN_ACCOUNT.username ? session : null;
        } catch {
            return null;
        }
    }

    const injectedRole = window.LIVIBE_CURRENT_USER_ROLE;
    let adminSession = readAdminSession();
    let currentRole = adminSession ? 'super_admin' : roles[injectedRole] ? injectedRole : 'member';

    function can(permission) {
        return roles[currentRole]?.permissions.includes(permission) || false;
    }

    function currentPageTarget() {
        const filename = window.location.pathname.split('/').pop() || 'index.html';
        return `${filename}${window.location.search}${window.location.hash}`;
    }

    function loginUrl() {
        return `login.html?next=${encodeURIComponent(currentPageTarget())}`;
    }

    async function sha256(value) {
        if (!globalThis.crypto?.subtle) throw new Error('此瀏覽器不支援安全登入驗證');
        const bytes = new TextEncoder().encode(value);
        const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    async function login(username, password) {
        const normalizedUsername = String(username || '').trim().toLowerCase();
        if (normalizedUsername !== ADMIN_ACCOUNT.username) return false;
        const passwordHash = await sha256(String(password || '').trim());
        if (passwordHash !== ADMIN_ACCOUNT.passwordHash) return false;
        adminSession = { username: ADMIN_ACCOUNT.username, authenticatedAt: new Date().toISOString() };
        try {
            sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
        } catch {
            return false;
        }
        currentRole = 'super_admin';
        syncAuthLinks();
        window.dispatchEvent(new CustomEvent('livibe:rolechange', { detail: { role: currentRole } }));
        return true;
    }

    function logout() {
        adminSession = null;
        try {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
        } catch {}
        currentRole = roles[injectedRole] ? injectedRole : 'member';
        syncAuthLinks();
        window.dispatchEvent(new CustomEvent('livibe:rolechange', { detail: { role: currentRole } }));
    }

    function syncAuthLinks() {
        document.querySelectorAll('[data-auth-link]').forEach((link) => {
            link.textContent = adminSession ? `登出 ${ADMIN_ACCOUNT.username}` : '管理登入';
            link.href = adminSession ? '#' : loginUrl();
            link.onclick = adminSession ? (event) => {
                event.preventDefault();
                logout();
            } : null;
        });
    }

    function mountRoleControl(container) {
        if (!container) return;
        container.innerHTML = `
            <span class="role-badge">${roles[currentRole].label}</span>
            ${adminSession
                ? '<button class="role-auth-action" type="button">登出</button>'
                : `<a class="role-auth-action" href="${loginUrl()}">管理登入</a>`}`;
        container.querySelector('button')?.addEventListener('click', logout);
    }

    function safeNextPage() {
        const candidate = new URLSearchParams(window.location.search).get('next') || 'venues.html';
        return /^(?:index|concert|venues)\.html(?:[?#].*)?$/.test(candidate) ? candidate : 'venues.html';
    }

    function mountLoginForm() {
        const form = document.querySelector('#admin-login-form');
        if (!form) return;
        const message = document.querySelector('#login-message');
        if (adminSession) {
            message.className = 'login-message success';
            message.textContent = `已使用 ${ADMIN_ACCOUNT.username} 登入最高管理員。`;
        }
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = form.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = '驗證中…';
            message.className = 'login-message';
            message.textContent = '';
            try {
                const success = await login(
                    form.querySelector('#login-username').value,
                    form.querySelector('#login-password').value
                );
                if (!success) throw new Error('帳號或密碼不正確');
                message.className = 'login-message success';
                message.textContent = '登入成功，正在前往管理頁面…';
                window.location.href = safeNextPage();
            } catch (error) {
                message.className = 'login-message error';
                message.textContent = error.message || '登入失敗，請稍後再試';
                form.querySelector('#login-password').value = '';
                form.querySelector('#login-password').focus();
            } finally {
                button.disabled = false;
                button.textContent = '登入管理後台';
            }
        });
    }

    window.LIVIBE_ACCESS = {
        roles,
        can,
        currentRole: () => currentRole,
        currentRoleLabel: () => roles[currentRole].label,
        currentUser: () => adminSession?.username || null,
        isAuthenticated: () => Boolean(adminSession),
        login,
        logout,
        mountRoleControl,
    };
    syncAuthLinks();
    mountLoginForm();
}());
