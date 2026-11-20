/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__purpuraVerifiedBadgeLoaded) return;
    window.__purpuraVerifiedBadgeLoaded = true;

    var KEY = 'vb';
    var BADGE_CLASS = 'purpura-verified-badge';
    var BADGE_SVG = '<svg viewBox="0 0 28 28" width="100%" height="100%" aria-hidden="true"><rect x="5.888" width="22.89" height="22.89" transform="rotate(15 5.888 0)" fill="#0066FF"/><path fill="#fff" fill-rule="evenodd" d="M20.543 8.751l.006.006c.601.601.601 1.575 0 2.176l-8.732 8.732-4.367-4.368a1.54 1.54 0 0 1 0-2.175l.007-.007a1.54 1.54 0 0 1 2.176 0l2.184 2.185 6.55-6.549a1.54 1.54 0 0 1 2.176 0z"/></svg>';
    var enabled = false;
    var me = null;
    var observer = null;
    var scanTimer = 0;

    function readUser() {
        var meta = document.querySelector('meta[name="user-data"]');
        if (!meta) return null;
        var id = meta.getAttribute('data-userid');
        if (!/^\d+$/.test(id || '')) return null;
        var names = [meta.getAttribute('data-displayname'), meta.getAttribute('data-name')]
            .filter(Boolean)
            .map(function (n) { return n.trim(); });
        names = names.concat(names.map(function (n) { return '@' + n; }));
        return { id: id, names: names };
    }

    function makeBadge() {
        var span = document.createElement('span');
        span.className = BADGE_CLASS;
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', 'Verified');
        span.title = 'Verified';
        span.innerHTML = BADGE_SVG;
        return span;
    }

    function hasBadge(el) {
        return !!el.querySelector('.' + BADGE_CLASS + ',[data-rblx-verified-badge-icon],.verified-badge-icon,[class*="verified-badge"]');
    }

    function nameLeaf(root) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        var best = null;
        for (var el = root; el; el = walker.nextNode()) {
            if (el.children.length > 0 && el !== root) continue;
            var text = (el.textContent || '').trim();
            if (me.names.indexOf(text) === -1) continue;
            if (!best || text.charAt(0) !== '@') best = el;
            if (text.charAt(0) !== '@') break;
        }
        return best;
    }

    function badgeAfter(el) {
        if (!el || hasBadge(el.parentElement || el)) return;
        el.insertAdjacentElement('afterend', makeBadge());
    }

    function scan() {
        scanTimer = 0;
        if (!enabled) return;
        me = me || readUser();
        if (!me) return;
        var links = document.querySelectorAll('a[href*="/users/' + me.id + '/profile"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (hasBadge(link)) continue;
            var leaf = nameLeaf(link);
            if (leaf && leaf !== link) badgeAfter(leaf);
            else if (leaf) link.appendChild(makeBadge());
        }
        if (new RegExp('/users/' + me.id + '/profile', 'i').test(location.pathname)) {
            var headers = document.querySelectorAll('#profile-header-title-container-name, .profile-header-title-container, .profile-name, .header-title h1');
            for (var j = 0; j < headers.length; j++) {
                var header = headers[j];
                if (header.closest('a') || hasBadge(header.parentElement || header)) continue;
                var title = nameLeaf(header);
                if (title) badgeAfter(title);
            }
        }
    }

    function schedule() {
        if (!scanTimer) scanTimer = setTimeout(scan, 150);
    }

    function injectStyles() {
        if (document.getElementById(BADGE_CLASS + '-style')) return;
        var s = document.createElement('style');
        s.id = BADGE_CLASS + '-style';
        s.textContent = '.' + BADGE_CLASS + '{display:inline-block;flex:0 0 auto;width:1em;height:1em;min-width:12px;min-height:12px;max-width:28px;max-height:28px;margin-left:.25em;vertical-align:-.125em;line-height:0}.' + BADGE_CLASS + ' svg{display:block}';
        (document.head || document.documentElement).appendChild(s);
    }

    function setEnabled(next) {
        enabled = next;
        if (enabled) {
            injectStyles();
            if (!observer) {
                observer = new MutationObserver(schedule);
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
            schedule();
            return;
        }
        if (observer) { observer.disconnect(); observer = null; }
        document.querySelectorAll('.' + BADGE_CLASS).forEach(function (el) { el.remove(); });
    }

    function load() {
        window.__PurpuraSettings.ready.then(function () { setEnabled(window.__PurpuraSettings.get(KEY) === true); });
    }

    var attempts = 0;
    var poll = setInterval(function () {
        if (window.__PurpuraSettings) { clearInterval(poll); load(); }
        else if (++attempts > 50) clearInterval(poll);
    }, 100);
    chrome.storage.onChanged.addListener(function (c, area) {
        if (area === 'sync' && c[KEY] && window.__PurpuraSettings) setEnabled(c[KEY].newValue === true);
    });
})();
