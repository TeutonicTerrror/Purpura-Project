/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'sap';
    const STYLE_ID = 'purpura-sticky-avatar';
    let enabled = false;
    let styleEl = null;
    let observer = null;
    let retryTimer = null;

    function isAvatarPage() {
        return window.location.pathname.startsWith('/my/avatar');
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = [
            'body.purpura-sticky-avatar-active #avatar-react-container > div:not([role="status"]) { display:flex !important; align-items:flex-start !important; min-height:100vh !important; }',
            'body.purpura-sticky-avatar-active .avatar-editor-header { display:none !important; }',
            'body.purpura-sticky-avatar-active #avatar-react-container .section-content.remove-panel { position:sticky !important; top:56px !important; align-self:flex-start !important; flex-shrink:0 !important; float:none !important; z-index:1 !important; }',
            'body.purpura-sticky-avatar-active .left-wrapper-placeholder { position:sticky !important; top:56px !important; align-self:flex-start !important; flex-shrink:0 !important; float:none !important; width:277px !important; }',
            'body.purpura-sticky-avatar-active .left-wrapper { float:none !important; width:277px !important; height:auto !important; }',
            'body.purpura-sticky-avatar-active .right-panel.six-column { flex:1 1 auto !important; float:none !important; min-width:0 !important; width:auto !important; }'
        ].join('\n');
        (document.head || document.documentElement).appendChild(styleEl);
    }

    function removeStyles() {
        if (styleEl) { styleEl.remove(); styleEl = null; }
        var existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();
        if (document.body) document.body.classList.remove('purpura-sticky-avatar-active');
    }

    function apply() {
        if (!enabled || !isAvatarPage() || !document.body) return;
        injectStyles();
        document.body.classList.add('purpura-sticky-avatar-active');
    }

    function observeAvatarRoot() {
        if (observer) observer.disconnect();
        var root = document.getElementById('avatar-react-container');
        if (!root) {
            observer = new MutationObserver(function () {
                root = document.getElementById('avatar-react-container');
                if (root) {
                    observer.disconnect();
                    apply();
                    observeAvatarRoot();
                }
            });
            observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
            return;
        }
        observer = new MutationObserver(function () { apply(); });
        observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function update() {
        if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
        if (!enabled || !isAvatarPage()) {
            if (!isAvatarPage()) removeStyles();
            return;
        }
        if (!document.body) {
            retryTimer = setTimeout(update, 100);
            return;
        }
        apply();
        observeAvatarRoot();
    }

    function loadSetting() {
        chrome.storage.local.get([STORAGE_KEY], function (result) {
            var raw = result[STORAGE_KEY];
            enabled = raw === undefined || raw === true || !!(raw && raw.enabled === true);
            update();
        });
    }

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'local' || !changes[STORAGE_KEY]) return;
        var raw = changes[STORAGE_KEY].newValue;
        enabled = raw === true || !!(raw && raw.enabled === true);
        enabled ? update() : removeStyles();
    });

    var originalPushState = history.pushState;
    history.pushState = function () {
        originalPushState.apply(this, arguments);
        setTimeout(update, 300);
    };
    window.addEventListener('popstate', function () { setTimeout(update, 300); });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update);
    else update();
    loadSetting();
})();
