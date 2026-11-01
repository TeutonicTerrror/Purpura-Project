/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.purpuraSiteFixesInitialized) return;
    window.purpuraSiteFixesInitialized = true;

    const STORAGE_KEY = 'sfix';
    const STYLE_ID = 'purpura-site-fixes';

    const BADGE_CLASS = 'purpura-site-fixes-badge';
    const SIDEBAR_PROFILE_LINK = 'a[href="/users/profile"].text-title-large';
    const TOPNAV_PROFILE_LINK = '.age-bracket-label a';

    const VERIFIED_CACHE_KEY = 'sfixVerifiedViewer';
    const VERIFIED_CACHE_TTL = 6 * 60 * 60 * 1000;

    const BADGE_SVG =
        '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
        '<path fill="currentColor" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91' +
        's-2.52-1.27-3.91-.81C14.67 2.63 13.43 1.75 12 1.75s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81' +
        's-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91' +
        's2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81' +
        's1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34Z"/>' +
        '<path fill="#fff" d="m10.75 16.24-3.5-3.5 1.41-1.41 2.09 2.09 5.09-5.09 1.41 1.41-6.5 6.5Z"/>' +
        '</svg>';

    const LINE_COLOR = 'var(--purpura-surface300,var(--color-stroke-default,rgba(128,128,128,.4)))';
    const THUMB_DARK = 'var(--purpura-scrollbarThumb,rgba(208,217,251,.3))';
    const THUMB_LIGHT = 'var(--purpura-scrollbarThumb,rgba(27,37,75,.3))';
    const TRACK = 'var(--purpura-scrollbarTrack,transparent)';

    const CSS = [
        '.thumbnail-2d-container.icon-pending>img[src],' +
        '.thumbnail-2d-container.icon-broken>img[src],' +
        '.thumbnail-2d-container.icon-in-review>img[src],' +
        '.thumbnail-2d-container.icon-blocked>img[src]{display:none}',

        '.icon-close.push-notifications-dismiss-prompt{filter:invert(1)}',

        '.game-follow-button-container .tooltip-inner{white-space:break-spaces}',

        '.bundle-items ul{display:flex;flex-wrap:wrap}',

        '#item-details-description{white-space:pre-wrap}',

        '.left-wrapper,.left-wrapper-placeholder{min-height:600px;height:fit-content}',

        '.event-hosted-by-container{border-top-color:' + LINE_COLOR + '!important}',

        '.top-section{margin-bottom:46px}',

        '.enable-three-dee,' +
        '.toggle-three-dee,' +
        '.toggle-thumbnail-type-btn:not(.roseal-user-profile-btn){line-height:150%!important;' +
        'z-index:9!important;border-radius:999px!important;padding:4px 12px!important;' +
        'font-weight:bold!important;border-color:transparent!important}',

        '.text-footer-nav img{padding-left:5px}',

        '.dark-theme .carousel-controls.btn-primary-md{background-color:rgba(0,0,0,.7)!important}',
        '.light-theme .carousel-controls.btn-primary-md{background-color:rgba(255,255,255,.9)!important}',

        '.friends-carousel-tile .friend-tile-game-card{width:100px;height:100px}',
        '.favorite-games-container .game-cards .game-card{width:159px}',
        '.profile-header-main .profile-avatar-image{flex-shrink:0}',

        '.game-sort-carousel-wrapper{transition:padding-bottom .1s ease-in}',
        '.game-sort-carousel-wrapper:has([data-testid=game-tile-hover-game-tile-contents] .regular-play-button)' +
        '{padding-bottom:6px}',

        'a[data-testid="section-header-title-subtitle-container"]{width:fit-content;max-width:100%}',

        '.slide-item-name.games.font-title{line-height:normal!important}',

        '.cart-item-container .rm-item-btn-container.icon-actions-clear-sm button{width:18px;height:18px}',

        '.user-profile-header-info>.flex.gap-medium.items-center.min-width-0>.flex.flex-col.min-width-0' +
        '{align-self:stretch;box-sizing:border-box;padding-block:20px}',

        'html,body{scrollbar-color:' + THUMB_DARK + ' ' + TRACK + '}',
        'html:has(>body.light-theme),html:has(>body.light-theme) body{scrollbar-color:' +
        THUMB_LIGHT + ' ' + TRACK + '}',

        '.' + BADGE_CLASS + '{display:inline-block;width:18px;height:18px;margin-left:4px;' +
        'vertical-align:middle;flex-shrink:0;color:var(--purpura-playButton,#00a2ff)}',
        '.' + BADGE_CLASS + ' svg{display:block;width:100%;height:100%}'
    ].join('\n');

    let enabled = false;
    let observer = null;
    let scanTimer = 0;
    let viewerVerified = null;
    let verifiedPromise = null;

    function removeStyles() {
        const existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);
    }

    function badgeLabel() {
        return chrome.i18n.getMessage('siteFixes_verifiedBadge') || 'Verified';
    }

    function addBadge(link, nameSelector, size) {
        if (link.querySelector('.' + BADGE_CLASS)) return;

        const nameSpan = link.querySelector(nameSelector);
        if (!nameSpan) return;

        const badge = document.createElement('span');
        badge.className = BADGE_CLASS;
        badge.setAttribute('role', 'img');
        badge.title = badgeLabel();
        badge.setAttribute('aria-label', badgeLabel());
        badge.style.width = size + 'px';
        badge.style.height = size + 'px';
        badge.innerHTML = BADGE_SVG;

        nameSpan.after(badge);
    }

    function decorate(linkSelector, nameSelector, size) {
        const links = document.querySelectorAll(linkSelector);
        for (let i = 0; i < links.length; i++) addBadge(links[i], nameSelector, size);
    }

    function removeBadges() {
        const badges = document.querySelectorAll('.' + BADGE_CLASS);
        for (let i = 0; i < badges.length; i++) badges[i].remove();
    }

    function refreshBadges() {
        if (!enabled || viewerVerified !== true) return;
        decorate(SIDEBAR_PROFILE_LINK, '.text-truncate-end', 20);
        decorate(TOPNAV_PROFILE_LINK, '.age-bracket-label-username', 18);
    }

    function queueBadgeScan() {
        if (scanTimer) return;
        scanTimer = setTimeout(function () {
            scanTimer = 0;
            refreshBadges();
        }, 100);
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(queueBadgeScan);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
        if (scanTimer) {
            clearTimeout(scanTimer);
            scanTimer = 0;
        }
    }

    function readVerifiedCache() {
        return new Promise(function (resolve) {
            try {
                chrome.storage.local.get([VERIFIED_CACHE_KEY], function (data) {
                    const entry = data ? data[VERIFIED_CACHE_KEY] : null;
                    const fresh = entry && typeof entry.verified === 'boolean' &&
                        Date.now() - (entry.at || 0) < VERIFIED_CACHE_TTL;
                    resolve(fresh ? entry.verified : null);
                });
            } catch (_) {
                resolve(null);
            }
        });
    }

    function writeVerifiedCache(verified) {
        try {
            const data = {};
            data[VERIFIED_CACHE_KEY] = { verified: verified, at: Date.now() };
            chrome.storage.local.set(data);
        } catch (_) { }
    }

    function lookupVerifiedViewer() {
        return fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (user) {
                if (!user || !user.id) return false;
                return fetch('https://users.roblox.com/v1/users/' + user.id, { credentials: 'include' })
                    .then(function (res) { return res.ok ? res.json() : null; })
                    .then(function (details) {
                        const verified = !!(details && details.hasVerifiedBadge);
                        writeVerifiedCache(verified);
                        return verified;
                    });
            })
            .catch(function () { return false; });
    }

    function isViewerVerified() {
        if (viewerVerified !== null) return Promise.resolve(viewerVerified);
        if (verifiedPromise) return verifiedPromise;

        verifiedPromise = readVerifiedCache()
            .then(function (cached) {
                return typeof cached === 'boolean' ? cached : lookupVerifiedViewer();
            })
            .catch(function () { return false; })
            .then(function (verified) {
                viewerVerified = verified;
                verifiedPromise = null;
                if (verified) refreshBadges();
                return verified;
            });

        return verifiedPromise;
    }

    function applySiteFixes(on) {
        enabled = !!on;

        if (!enabled) {
            removeStyles();
            removeBadges();
            stopObserver();
            return;
        }

        ensureStyles();

        isViewerVerified().then(function (verified) {
            if (!enabled || !verified) return;
            refreshBadges();
            startObserver();
        });
    }

    function refresh() {
        applySiteFixes(window.__PurpuraSettings.getRaw(STORAGE_KEY) === true);
    }

    function init() {
        window.__PurpuraSettings.ready.then(refresh).catch(function () {});
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace !== 'local' || !changes[STORAGE_KEY]) return;
            refresh();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
