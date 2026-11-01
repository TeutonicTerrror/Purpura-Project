/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */

(function () {
    'use strict';
    const STORAGE_KEY = 'rs';
    const DATA_KEY = 'purpuraRecentServers';
    const SECTION_ID = 'purpura-recent-servers';
    const SEPARATOR_ID = 'purpura-recent-servers-separator';
    const EXPANDED_KEY = 'purpura-recentservers-expanded';
    const MAX_SHOWN = 10;
    let enabled = false;
    let configuration = 0;
    let scheduled = false;
    let entries = [];
    let headshot = null;
    let headshotFor = 0;
    const checked = new Map();
    const t = (key, fallback, subs) => chrome.i18n.getMessage(key, subs) || fallback;

    function placeId() {
        const match = location.pathname.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?games\/(\d+)/i);
        return match ? Number(match[1]) : 0;
    }

    function currentUserId() {
        const meta = document.querySelector('meta[name="user-data"]');
        const id = Number(meta && meta.getAttribute('data-userid'));
        return Number.isSafeInteger(id) && id > 0 ? id : 0;
    }

    function universeId() {
        const meta = document.querySelector('#game-detail-page[data-universe-id], #game-detail-meta-data[data-universe-id]');
        const id = Number(meta && meta.getAttribute('data-universe-id'));
        return Number.isSafeInteger(id) && id > 0 ? id : 0;
    }

    function relevant() {
        const place = placeId();
        const user = currentUserId();
        const universe = universeId();
        if (!place || !user) return [];
        return entries
            .filter(entry => entry.userId === user && checked.get(entry.gameId) !== false &&
                (entry.placeId === place || entry.rootPlaceId === place || (universe && entry.universeId === universe)))
            .sort((a, b) => b.lastSeen - a.lastSeen)
            .slice(0, MAX_SHOWN);
    }

    function lastPlayed(ts) {
        const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
        if (seconds < 60) return t('recentServers_justNow', 'Last played just now');
        let value = Math.round(seconds / 60);
        let unit = 'minute';
        if (value >= 60) { value = Math.round(value / 60); unit = 'hour'; }
        if (unit === 'hour' && value >= 24) { value = Math.round(value / 24); unit = 'day'; }
        let relative;
        try {
            relative = new Intl.RelativeTimeFormat(chrome.i18n.getUILanguage(), { numeric: 'always' }).format(-value, unit);
        } catch (error) {
            relative = value + ' ' + unit + (value === 1 ? '' : 's') + ' ago';
        }
        return t('recentServers_lastPlayed', 'Last played ' + relative, [relative]);
    }

    function join(entry) {
        const id = Number(entry.placeId);
        if (!Number.isSafeInteger(id) || id <= 0 || !/^[0-9a-f-]{36}$/i.test(entry.gameId)) return;
        const code = "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinGameInstance==='function'){" +
            'Roblox.GameLauncher.joinGameInstance(' + id + ",'" + entry.gameId + "');}";
        try {
            chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code });
        } catch (error) { }
    }

    async function joinStatus(entry) {
        const body = JSON.stringify({ placeId: entry.placeId, gameId: entry.gameId });
        let token = '';
        for (let attempt = 0; attempt < 2; attempt++) {
            const response = await fetch('https://gamejoin.roblox.com/v1/join-game-instance', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...(token ? { 'x-csrf-token': token } : {}) },
                body
            });
            if (response.status === 403 && response.headers.get('x-csrf-token') && !token) {
                token = response.headers.get('x-csrf-token');
                continue;
            }
            if (!response.ok) return null;
            const data = await response.json();
            return typeof data?.status === 'number' ? data.status : null;
        }
        return null;
    }

    async function verify(list) {
        const pending = list.filter(entry => !checked.has(entry.gameId));
        if (!pending.length) return;
        pending.forEach(entry => checked.set(entry.gameId, null));
        const dead = [];
        await Promise.all(pending.map(async entry => {
            try {
                const status = await joinStatus(entry);
                const alive = !(status === 5 || status === 11 || status === 12);
                checked.set(entry.gameId, alive);
                if (!alive) dead.push(entry);
            } catch (error) {
                checked.set(entry.gameId, true);
            }
        }));
        if (!dead.length) return;
        const stored = (await chrome.storage.local.get(DATA_KEY))[DATA_KEY];
        if (!Array.isArray(stored)) return;
        const next = stored.filter(item => !dead.some(entry => entry.gameId === item?.gameId && entry.userId === item?.userId));
        await chrome.storage.local.set({ [DATA_KEY]: next });
    }

    async function loadHeadshot() {
        const user = currentUserId();
        if (!user || (headshotFor === user && headshot !== null)) return;
        headshotFor = user;
        headshot = '';
        try {
            const response = await fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + user +
                '&size=150x150&format=Webp&isCircular=true');
            const data = await response.json();
            const url = data?.data?.[0]?.imageUrl;
            if (typeof url === 'string' && /^https:\/\/[a-z0-9.-]+\.rbxcdn\.com\//i.test(url)) headshot = url;
        } catch (error) { }
        document.querySelectorAll('#' + SECTION_ID + ' img[data-purpura-rs-headshot]').forEach(applyHeadshot);
    }

    function applyHeadshot(img) {
        const holder = img.parentElement;
        if (headshot) {
            if (img.getAttribute('src') !== headshot) img.src = headshot;
        } else if (headshot === '' && headshotFor) {
            if (holder) holder.classList.remove('shimmer');
        }
    }

    function makeHeadshot(className) {
        const img = document.createElement('img');
        img.className = className;
        img.alt = '';
        img.style.opacity = '0';
        img.setAttribute('data-purpura-rs-headshot', '');
        img.addEventListener('load', () => {
            if (img.parentElement) img.parentElement.classList.remove('shimmer');
            img.style.opacity = '1';
        });
        if (headshot) img.src = headshot;
        return img;
    }

    function isModern() {
        return !document.getElementById('rbx-public-running-games') && !!document.querySelector('.friends-servers');
    }

    function findAnchor() {
        if (isModern()) {
            const friends = document.querySelector('.friends-servers');
            return { modern: true, parent: friends.parentElement, before: friends };
        }
        const section = document.getElementById('rbx-friends-running-games') ||
            document.getElementById('rbx-public-running-games');
        if (section && section.parentElement) return { modern: false, parent: section.parentElement, before: section };
        const container = document.getElementById('running-game-instances-container');
        if (container) return { modern: false, parent: container, before: container.firstElementChild };
        return null;
    }

    function buildLegacyCard(entry) {
        const item = document.createElement('li');
        item.className = 'rbx-game-server-item col-md-3 col-sm-4 col-xs-6';
        item.setAttribute('data-placeid', String(entry.placeId));
        item.setAttribute('data-gameid', entry.gameId);

        const card = document.createElement('div');
        card.className = 'card-item';

        const thumbs = document.createElement('div');
        thumbs.className = 'player-thumbnails-container';
        const avatar = document.createElement('a');
        avatar.className = 'avatar avatar-headshot-md player-avatar';
        avatar.href = 'https://www.roblox.com/users/' + entry.userId + '/profile';
        const frame = document.createElement('span');
        frame.className = 'thumbnail-2d-container avatar-card-image shimmer';
        frame.appendChild(makeHeadshot(''));
        avatar.appendChild(frame);
        thumbs.appendChild(avatar);

        const details = document.createElement('div');
        details.className = 'rbx-game-server-details game-server-details';
        const status = document.createElement('div');
        status.className = 'text-info rbx-game-status rbx-game-server-status text-overflow purpura-rs-when';
        status.style.cssText = 'height:auto!important;overflow:visible!important;white-space:break-spaces!important;';
        status.dataset.lastSeen = String(entry.lastSeen);
        status.textContent = lastPlayed(entry.lastSeen);
        status.title = new Date(entry.lastSeen).toLocaleString();
        const holder = document.createElement('span');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width';
        button.textContent = t('recentServers_join', 'Join');
        button.addEventListener('click', event => {
            event.preventDefault();
            if (enabled) join(entry);
        });
        holder.appendChild(button);
        details.append(status, holder);

        card.append(thumbs, details);
        item.appendChild(card);
        return item;
    }

    function buildLegacySection(list) {
        const section = document.createElement('div');
        section.id = SECTION_ID;
        section.className = 'stack server-list-section';

        const header = document.createElement('div');
        header.className = 'container-header';
        header.style.cursor = 'pointer';
        const headerInner = document.createElement('div');
        headerInner.className = 'server-list-container-header';
        const title = document.createElement('h2');
        title.className = 'server-list-header';
        title.textContent = t('settings_recentServers_label', 'Recent Servers');
        const toggle = document.createElement('span');
        toggle.style.marginLeft = '3px';
        headerInner.append(title, toggle);
        header.appendChild(headerInner);

        const items = document.createElement('ul');
        items.className = 'card-list rbx-friends-game-server-item-container';
        list.forEach(entry => items.appendChild(buildLegacyCard(entry)));

        let expanded = localStorage.getItem(EXPANDED_KEY) !== 'false';
        const sync = () => {
            toggle.className = 'icon-' + (expanded ? 'up' : 'down') + '-16x16';
            items.style.display = expanded ? '' : 'none';
        };
        header.addEventListener('click', () => {
            expanded = !expanded;
            try { localStorage.setItem(EXPANDED_KEY, String(expanded)); } catch (error) { }
            sync();
        });
        sync();

        section.append(header, items);
        return section;
    }

    function buildModernRow(entry) {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between padding-y-medium width-full server-instance';
        row.setAttribute('data-gameid', entry.gameId);
        row.setAttribute('data-placeid', String(entry.placeId));

        const left = document.createElement('div');
        left.className = 'flex items-center gap-medium min-width-0';
        const thumbs = document.createElement('div');
        thumbs.className = 'grow-0 shrink-0 basis-auto relative height-[40px] width-[40px] thumbnails-container';
        const thumb = document.createElement('span');
        thumb.className = 'width-[40px] height-[40px]';
        thumb.style.display = 'block';
        const frame = document.createElement('span');
        frame.className = 'thumbnail-2d-container radius-circle clip shimmer';
        frame.appendChild(makeHeadshot('size-full'));
        thumb.appendChild(frame);
        thumbs.appendChild(thumb);
        const textWrap = document.createElement('div');
        textWrap.className = 'flex flex-col min-width-0';
        const text = document.createElement('span');
        text.className = 'text-body-medium content-muted purpura-rs-when';
        text.dataset.lastSeen = String(entry.lastSeen);
        text.textContent = lastPlayed(entry.lastSeen);
        text.title = new Date(entry.lastSeen).toLocaleString();
        textWrap.appendChild(text);
        left.append(thumbs, textWrap);

        const right = document.createElement('div');
        right.className = 'flex items-center gap-small grow-0 shrink-0 basis-auto';
        const buttonWrap = document.createElement('div');
        buttonWrap.className = 'width-[63px] large:width-[200px]';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'foundation-web-button relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex items-center justify-center stroke-none padding-y-none select-none radius-medium text-label-small height-800 padding-x-small bg-action-soft-emphasis content-action-soft-emphasis width-full';
        button.style.textDecoration = 'none';
        const overlay = document.createElement('div');
        overlay.setAttribute('role', 'presentation');
        overlay.className = 'absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none';
        const labelOuter = document.createElement('span');
        labelOuter.className = 'flex items-center min-width-0 gap-xsmall';
        const label = document.createElement('span');
        label.className = 'padding-y-xsmall text-truncate-end text-no-wrap';
        label.textContent = t('recentServers_join', 'Join');
        labelOuter.appendChild(label);
        button.append(overlay, labelOuter);
        button.addEventListener('click', event => {
            event.preventDefault();
            if (enabled) join(entry);
        });
        buttonWrap.appendChild(button);
        right.appendChild(buttonWrap);

        row.append(left, right);
        return row;
    }

    function buildModernSection(list) {
        const section = document.createElement('div');
        section.id = SECTION_ID;
        section.className = 'flex flex-col gap-large width-full';
        const head = document.createElement('div');
        head.className = 'flex flex-col gap-xsmall';
        const title = document.createElement('h3');
        title.className = 'text-heading-small content-emphasis padding-none';
        title.textContent = t('settings_recentServers_label', 'Recent Servers');
        head.appendChild(title);
        const items = document.createElement('div');
        items.className = 'flex flex-col server-instances';
        list.forEach(entry => items.appendChild(buildModernRow(entry)));
        section.append(head, items);
        return section;
    }

    function buildSeparator() {
        const wrap = document.createElement('div');
        wrap.id = SEPARATOR_ID;
        wrap.className = 'margin-y-large';
        const line = document.createElement('div');
        line.setAttribute('role', 'separator');
        line.setAttribute('data-orientation', 'horizontal');
        line.setAttribute('aria-orientation', 'horizontal');
        line.className = 'stroke-default self-stretch';
        line.style.cssText = 'border-right-width:0;border-bottom-width:0;box-sizing:border-box;border-style:solid;height:0;border-top-width:var(--stroke-standard);border-left-width:0;';
        wrap.appendChild(line);
        return wrap;
    }

    function signature(list, modern) {
        return (modern ? 'm|' : 'l|') + list.map(entry => entry.gameId + ':' + entry.lastSeen).join('|');
    }

    function removeSection() {
        const existing = document.getElementById(SECTION_ID);
        if (existing) existing.remove();
        const separator = document.getElementById(SEPARATOR_ID);
        if (separator) separator.remove();
    }

    function render() {
        if (!enabled || !placeId()) {
            removeSection();
            return;
        }
        const list = relevant();
        verify(list).catch(() => { });
        loadHeadshot().catch(() => { });
        if (!list.length) {
            removeSection();
            return;
        }
        const anchor = findAnchor();
        if (!anchor) return;
        const sig = signature(list, anchor.modern);
        const existing = document.getElementById(SECTION_ID);
        if (existing && existing.isConnected && existing.dataset.signature === sig) return;
        removeSection();
        const section = anchor.modern ? buildModernSection(list) : buildLegacySection(list);
        section.dataset.signature = sig;
        anchor.parent.insertBefore(section, anchor.before);
        if (anchor.modern) anchor.parent.insertBefore(buildSeparator(), anchor.before);
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        setTimeout(() => {
            scheduled = false;
            render();
        }, 150);
    }

    async function loadEntries() {
        const stored = (await chrome.storage.local.get(DATA_KEY))[DATA_KEY];
        entries = Array.isArray(stored)
            ? stored.filter(entry => entry && typeof entry.gameId === 'string' && Number.isFinite(entry.lastSeen))
            : [];
    }

    async function configure() {
        const generation = ++configuration;
        const [settings, restrictions] = await Promise.all([
            chrome.storage.sync.get(STORAGE_KEY),
            chrome.storage.local.get('noFeatures')
        ]);
        if (generation !== configuration) return;
        enabled = settings[STORAGE_KEY] !== false && restrictions.noFeatures !== true;
        if (!enabled) {
            removeSection();
            return;
        }
        await loadEntries();
        if (generation !== configuration) return;
        removeSection();
        render();
    }

    const observer = new MutationObserver(() => {
        if (!enabled || !placeId()) return;
        const existing = document.getElementById(SECTION_ID);
        if (!existing || existing.dataset.signature.charAt(0) !== (isModern() ? 'm' : 'l')) schedule();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes[STORAGE_KEY]) || (area === 'local' && changes.noFeatures)) {
            configure().catch(() => { });
        } else if (area === 'local' && changes[DATA_KEY] && enabled) {
            loadEntries().then(render).catch(() => { });
        }
    });
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);
    setInterval(() => {
        if (!enabled || document.hidden) return;
        document.querySelectorAll('#' + SECTION_ID + ' .purpura-rs-when').forEach(label => {
            const ts = Number(label.dataset.lastSeen);
            if (!Number.isFinite(ts)) return;
            const text = lastPlayed(ts);
            if (label.textContent !== text) label.textContent = text;
        });
    }, 30000);

    configure().catch(() => { });
})();
