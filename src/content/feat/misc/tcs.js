/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    if (window.purpuraTrustedCreatorStatusInitialized) return;
    window.purpuraTrustedCreatorStatusInitialized = true;

    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    const STORAGE_KEY = 'tcs';
    const CACHE_KEY = 'purpuraTrustedCreatorCache';
    const CACHE_TTL_MS = 60 * 60 * 1000;
    const API_URL = 'https://itemconfiguration.roblox.com/v1/permissions/action-allowed-for-item-type?trustedCreatorCheck=true&action=1&assetType=61';
    const ROW_CLASS = 'purpura-trusted-creator-row';
    const NEIGHBOUR_ROW_SELECTOR = '.purpura-original-account-row';
    const FIELD_CLASS = 'settings-text-field-container';
    const ANCHOR_SELECTOR = '#account-change-password, #fido-registration-container, .passkey-upsell-banner';

    const pendingSections = new WeakSet();

    let enabled = false;
    let observer = null;

    function isAccountSettingsPage() {
        return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?my\/account(?:\/|$)/i.test(window.location.pathname);
    }

    function sectionFor(element) {
        const section = element.closest('.setting-section');
        if (!section) return null;
        if (
            section.querySelector('#account-change-password') ||
            section.querySelector('#fido-registration-container') ||
            section.querySelector('.passkey-upsell-banner')
        ) {
            return section;
        }
        return null;
    }

    function passwordFieldIn(section) {
        const button = section.querySelector('#account-change-password');
        return button ? button.closest('.' + FIELD_CLASS) : null;
    }

    function contentOf(section) {
        const passwordField = passwordFieldIn(section);
        return (
            (passwordField && passwordField.parentElement) ||
            section.querySelector('#fido-registration-container')?.parentElement ||
            section.querySelector('.passkey-upsell-banner')?.parentElement ||
            section.querySelector('.section-content') ||
            section
        );
    }

    function buildRow(valueText, tooltip) {
        const row = document.createElement('div');
        row.className = 'form-group ' + FIELD_CLASS + ' ' + ROW_CLASS;

        const field = document.createElement('div');
        field.className = 'account-settings-text-field';

        const label = document.createElement('span');
        label.className = 'text-title-large account-info-inline-label';
        label.textContent = t('tcs_label');

        const lines = document.createElement('div');
        lines.className = 'settings-text-lines-container';

        const meta = document.createElement('div');
        meta.className = 'account-settings-value-metadata-container';
        meta.style.display = 'flex';
        meta.style.alignItems = 'center';

        const value = document.createElement('span');
        value.className = 'settings-text-span-visible text-body-medium';
        value.textContent = valueText;
        meta.appendChild(value);

        const info = document.createElement('span');
        info.className = 'purpura-account-info-icon';
        info.setAttribute('role', 'img');
        info.setAttribute('title', tooltip);
        info.setAttribute('aria-label', tooltip);
        info.textContent = 'i';
        Object.assign(info.style, {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            marginLeft: '6px',
            borderRadius: '50%',
            border: '1px solid currentColor',
            fontSize: '11px',
            fontWeight: '700',
            lineHeight: '1',
            cursor: 'help',
            opacity: '0.6'
        });
        meta.appendChild(info);

        lines.appendChild(meta);
        field.appendChild(label);
        field.appendChild(lines);
        row.appendChild(field);
        return row;
    }

    function render(section, isTrustedCreator) {
        if (!enabled || !section.isConnected) return;

        const existing = section.querySelector('.' + ROW_CLASS);
        if (existing) {
            const value = existing.querySelector('.settings-text-span-visible');
            if (value) value.textContent = isTrustedCreator ? t('tcs_yes') : t('tcs_no');
            return;
        }

        const row = buildRow(isTrustedCreator ? t('tcs_yes') : t('tcs_no'), t('tcs_tooltip'));

        const neighbour = section.querySelector(NEIGHBOUR_ROW_SELECTOR);
        if (neighbour) {
            neighbour.insertAdjacentElement('afterend', row);
            return;
        }

        const content = contentOf(section);
        const passwordField = passwordFieldIn(section);
        if (passwordField && passwordField.parentElement === content) {
            passwordField.insertAdjacentElement('afterend', row);
            return;
        }
        content.appendChild(row);
    }

    function getLocal(keys) {
        return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    }

    function setLocal(items) {
        return new Promise((resolve) => chrome.storage.local.set(items, resolve));
    }

    async function authenticatedUserId() {
        try {
            const meta = document.querySelector('meta[name="user-data"]');
            const candidate = meta?.getAttribute('data-userid') || meta?.getAttribute('data-user-id');
            if (candidate) return Number(candidate);
            const resp = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
            if (!resp.ok) return null;
            const data = await resp.json();
            return data?.id || null;
        } catch {
            return null;
        }
    }

    function cachedStatus(allCache, userId) {
        const entry = allCache ? allCache[userId] : null;
        if (!entry || typeof entry.isTrustedCreator !== 'boolean') return null;
        if (!Number.isFinite(Number(entry.timestamp)) || Date.now() - Number(entry.timestamp) > CACHE_TTL_MS) return null;
        return entry;
    }

    async function loadValue(section) {
        if (!enabled || pendingSections.has(section)) return;
        if (section.querySelector('.' + ROW_CLASS)) return;

        pendingSections.add(section);

        try {
            const userId = await authenticatedUserId();
            if (!userId) return;

            const stored = await getLocal([CACHE_KEY]);
            const cached = cachedStatus(stored[CACHE_KEY], userId);
            if (cached) {
                render(section, cached.isTrustedCreator);
                return;
            }

            const response = await fetch(API_URL, { credentials: 'include' });
            if (!response.ok) return;

            const data = await response.json();
            if (typeof data?.isActionAllowed !== 'boolean') return;

            const entry = { isTrustedCreator: data.isActionAllowed, timestamp: Date.now() };

            const latest = await getLocal([CACHE_KEY]);
            const allCache = latest[CACHE_KEY] && typeof latest[CACHE_KEY] === 'object' ? latest[CACHE_KEY] : {};
            allCache[userId] = entry;
            await setLocal({ [CACHE_KEY]: allCache });

            render(section, entry.isTrustedCreator);
        } catch {
        } finally {
            pendingSections.delete(section);
        }
    }

    function scan() {
        if (!enabled || !document.body) return;
        document.querySelectorAll(ANCHOR_SELECTOR).forEach((element) => {
            const section = sectionFor(element);
            if (section) loadValue(section);
        });
    }

    function start() {
        if (!isAccountSettingsPage() || !document.body || observer) return;
        observer = new MutationObserver(scan);
        observer.observe(document.body, { childList: true, subtree: true });
        scan();
    }

    function stop() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        document.querySelectorAll('.' + ROW_CLASS).forEach((row) => row.remove());
    }

    window.__PurpuraSettings.ready.then(function () {
        enabled = window.__PurpuraSettings.get(STORAGE_KEY) !== false;
        if (enabled) start();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local' || !changes[STORAGE_KEY]) return;
        enabled = window.__PurpuraSettings.get(STORAGE_KEY) !== false;
        if (enabled) start();
        else stop();
    });
})();
