/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__purpuraR6WarningRemoverLoaded) return;
    window.__purpuraR6WarningRemoverLoaded = true;

    var STORAGE_KEY = 'r6w';
    var SELECTOR_TOGGLE_GROUP = '.avatar-type-contents-container .MuiToggleButtonGroup-root';
    var SELECTOR_TOGGLE_GROUP_FALLBACK = '.MuiToggleButtonGroup-root, [role=\"group\"]';
    var SELECTOR_MODAL = 'div[role=\"presentation\"].MuiDialog-root';
    var SELECTOR_MODAL_NEW = 'div[role=\"dialog\"].foundation-web-dialog-content';
    var SELECTOR_MODAL_FALLBACK = '.MuiDialog-root, div[role=\"dialog\"], [data-state=\"open\"].foundation-web-dialog-content';
    var SELECTOR_VIEW_TOGGLE = '.toggle-three-dee';
    var DATASET_PATCHED = 'purpuraR6Patched';

    var enabled = true;
    var lastToggleClickTime = 0;
    var observer = null;
    var urlPollInterval = null;
    var lastUrl = location.href;

    function isAvatarPage() {
        return window.location.pathname.toLowerCase().indexOf('/my/avatar') !== -1;
    }

    function getEnabled(value) {
        if (value === undefined) return true;
        return value === true;
    }

    function forceViewRefresh() {
        var toggleBtn = document.querySelector(SELECTOR_VIEW_TOGGLE) || document.querySelector('[class*=\"toggle-three\"]') || document.querySelector('button[class*=\"toggle\"]');
        if (!toggleBtn) return;
        var originalText = (toggleBtn.textContent || '').trim();
        toggleBtn.click();
        setTimeout(function () {
            try {
                if ((toggleBtn.textContent || '').trim() !== originalText) toggleBtn.click();
            } catch (_) {}
        }, 150);
    }

    function handleToggleGroupFound(group) {
        if (!group || group.dataset[DATASET_PATCHED]) return;
        group.dataset[DATASET_PATCHED] = 'true';
        var buttons = group.querySelectorAll('button');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                lastToggleClickTime = Date.now();
                buttons.forEach(function (b) {
                    var isSelected = b === btn;
                    b.setAttribute('aria-pressed', String(isSelected));
                    if (isSelected) b.classList.add('selected', 'Mui-selected');
                    else b.classList.remove('selected', 'Mui-selected');
                });
            }, { capture: true });
        });
    }

    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('button') : null;
        if (!btn) return;
        if (!isAvatarPage() || !enabled) return;
        var t = (btn.textContent || '').trim();
        var tu = t.toUpperCase();
        var isR6R15Text = tu === 'R6' || tu === 'R15';
        var group = btn.closest('.MuiToggleButtonGroup-root') || btn.closest('[role=\"group\"]') || btn.closest('.avatar-type-contents-container');
        var isToggleContext = false;
        if (group) {
            var allBtns = group.querySelectorAll ? group.querySelectorAll('button') : [];
            if (allBtns.length >= 2) isToggleContext = true;
            if (group.closest && group.closest('.avatar-type-contents-container')) isToggleContext = true;
        }
        if (isR6R15Text || isToggleContext) {
            if (isR6R15Text) {
                lastToggleClickTime = Date.now();
                return;
            }
            if (group && group.closest && group.closest('.avatar-type-contents-container')) {
                lastToggleClickTime = Date.now();
            } else if (isR6R15Text) {
                lastToggleClickTime = Date.now();
            }
        }
    }, true);

    function findSwitchButton(modal) {
        var allButtons = modal.querySelectorAll('button');
        for (var i = 0; i < allButtons.length; i++) {
            if ((allButtons[i].textContent || '').trim().toLowerCase() === 'switch') return allButtons[i];
        }
        var txt = (modal.textContent || '').toLowerCase();
        var isR6Warning = txt.indexOf('r6 characters have limitations') !== -1 || (txt.indexOf('r6') !== -1 && txt.indexOf('warning') !== -1);
        if (isR6Warning && allButtons.length >= 2) {
            return allButtons[allButtons.length - 1];
        }
        if (allButtons.length) return allButtons[allButtons.length - 1];
        return null;
    }

    function isR6WarningModal(modal) {
        if (!modal) return false;
        var txt = (modal.textContent || '').toLowerCase();
        if (txt.indexOf('r6 characters have limitations') !== -1) return true;
        if (txt.indexOf('r6') !== -1 && txt.indexOf('unsupported items will be removed') !== -1) return true;
        if (txt.indexOf('switch') !== -1 && txt.indexOf('r6') !== -1) return true;
        var hasSwitch = false;
        var btns = modal.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) if ((btns[i].textContent || '').trim().toLowerCase() === 'switch') { hasSwitch = true; break; }
        if (hasSwitch && txt.indexOf('warning') !== -1) return true;
        return false;
    }

    function handleModalFound(modal) {
        if (!modal || !modal.isConnected) return;
        if (!isR6WarningModal(modal)) return;
        if (Date.now() - lastToggleClickTime > 1500) return;
        var switchBtn = findSwitchButton(modal);
        if (!switchBtn) return;
        try {
            var root = modal.closest('[data-radix-portal]') || modal.closest('div[role=\"presentation\"]') || modal;
            if (root && root !== modal) {
                root.style.visibility = 'hidden';
                root.style.opacity = '0';
                root.style.pointerEvents = 'none';
            }
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            var backdrop = document.querySelector('[data-radix-portal] [data-state=\"open\"].foundation-web-dialog-content');
            if (backdrop && backdrop !== modal) {
                try { backdrop.style.visibility = 'hidden'; } catch (_) {}
            }
        } catch (_) {}
        try { switchBtn.click(); } catch (_) {}
        setTimeout(function () {
            forceViewRefresh();
        }, 200);
    }

    function getToggleGroups(root) {
        var out = [];
        function push(q) {
            try {
                if (root && root.nodeType === 1 && root.matches && root.matches(q)) out.push(root);
                var list = root && root.querySelectorAll ? root.querySelectorAll(q) : document.querySelectorAll(q);
                list.forEach(function (el) { out.push(el); });
            } catch (_) {}
        }
        push(SELECTOR_TOGGLE_GROUP);
        if (!out.length) push(SELECTOR_TOGGLE_GROUP_FALLBACK);
        return out;
    }

    function getModals(root) {
        var out = [];
        function push(q) {
            try {
                if (root && root.nodeType === 1 && root.matches && root.matches(q)) out.push(root);
                var list = root && root.querySelectorAll ? root.querySelectorAll(q) : document.querySelectorAll(q);
                list.forEach(function (el) { out.push(el); });
            } catch (_) {}
        }
        push(SELECTOR_MODAL);
        push(SELECTOR_MODAL_NEW);
        var fb = [];
        try {
            document.querySelectorAll(SELECTOR_MODAL_FALLBACK).forEach(function (el) { fb.push(el); });
        } catch (_) {}
        fb.forEach(function (el) { if (out.indexOf(el) === -1) out.push(el); });
        if (root && root.nodeType === 1 && root.matches) {
            try { if (root.matches(SELECTOR_MODAL_FALLBACK) && out.indexOf(root) === -1) out.push(root); } catch (_) {}
            try { if (root.matches(SELECTOR_MODAL_NEW) && out.indexOf(root) === -1) out.push(root); } catch (_) {}
        }
        if (root && root.querySelectorAll) {
            try {
                root.querySelectorAll(SELECTOR_MODAL_NEW + ',' + SELECTOR_MODAL_FALLBACK).forEach(function (el) {
                    if (out.indexOf(el) === -1) out.push(el);
                });
            } catch (_) {}
        }
        return out;
    }

    function scan(root) {
        if (!enabled || !isAvatarPage()) return;
        getToggleGroups(root).forEach(handleToggleGroupFound);
        getModals(root).forEach(handleModalFound);
        if (!root) {
            document.querySelectorAll(SELECTOR_TOGGLE_GROUP).forEach(handleToggleGroupFound);
            if (!document.querySelector(SELECTOR_TOGGLE_GROUP)) {
                document.querySelectorAll(SELECTOR_TOGGLE_GROUP_FALLBACK).forEach(function (el) {
                    if (el.closest && el.closest('.avatar-type-contents-container')) handleToggleGroupFound(el);
                });
            }
            document.querySelectorAll(SELECTOR_MODAL).forEach(handleModalFound);
            document.querySelectorAll(SELECTOR_MODAL_NEW).forEach(handleModalFound);
            if (!document.querySelector(SELECTOR_MODAL) && !document.querySelector(SELECTOR_MODAL_NEW)) {
                document.querySelectorAll(SELECTOR_MODAL_FALLBACK).forEach(function (el) {
                    if (isR6WarningModal(el)) handleModalFound(el);
                });
            }
        }
    }

    var scanTimer = 0;
    function scheduleScan() {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(function () {
            scanTimer = 0;
            scan(document);
        }, 80);
    }

    function startObserver() {
        if (observer || !document.documentElement) return;
        observer = new MutationObserver(function (mutations) {
            if (!enabled || !isAvatarPage()) return;
            var shouldSchedule = false;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (!m.addedNodes || !m.addedNodes.length) continue;
                for (var j = 0; j < m.addedNodes.length; j++) {
                    var node = m.addedNodes[j];
                    if (!node || node.nodeType !== 1) continue;
                    var isModal = false;
                    var isToggle = false;
                    try {
                        if (node.matches && (node.matches(SELECTOR_MODAL) || node.matches(SELECTOR_MODAL_NEW) || node.matches(SELECTOR_MODAL_FALLBACK))) isModal = true;
                        else if (node.querySelector && (node.querySelector(SELECTOR_MODAL) || node.querySelector(SELECTOR_MODAL_NEW) || node.querySelector(SELECTOR_MODAL_FALLBACK) || node.querySelector('[role=\"dialog\"]'))) isModal = true;
                    } catch (_) {}
                    try {
                        if (node.matches && (node.matches(SELECTOR_TOGGLE_GROUP) || node.matches(SELECTOR_TOGGLE_GROUP_FALLBACK) || node.matches('.avatar-type-contents-container'))) isToggle = true;
                        else if (node.querySelector && (node.querySelector(SELECTOR_TOGGLE_GROUP) || node.querySelector('.avatar-type-contents-container'))) isToggle = true;
                    } catch (_) {}
                    if (isModal || isToggle) {
                        scan(node);
                        if (isModal) {
                            if (node.matches) {
                                try {
                                    if (node.matches(SELECTOR_MODAL) || node.matches(SELECTOR_MODAL_NEW) || node.matches('[role=\"dialog\"]')) handleModalFound(node);
                                } catch (_) {}
                            }
                            var inner = [];
                            try {
                                if (node.querySelectorAll) {
                                    node.querySelectorAll(SELECTOR_MODAL + ',' + SELECTOR_MODAL_NEW + ',' + SELECTOR_MODAL_FALLBACK + ', div[role=\"dialog\"]').forEach(function (el) { inner.push(el); });
                                }
                            } catch (_) {}
                            for (var k = 0; k < inner.length; k++) handleModalFound(inner[k]);
                            if (node.matches && node.matches('[data-radix-portal]')) {
                                var portalDialogs = node.querySelectorAll ? node.querySelectorAll('div[role=\"dialog\"]') : [];
                                for (var p = 0; p < portalDialogs.length; p++) handleModalFound(portalDialogs[p]);
                            }
                        }
                    }
                    shouldSchedule = true;
                }
            }
            if (shouldSchedule) scheduleScan();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (observer) { observer.disconnect(); observer = null; }
        if (scanTimer) { clearTimeout(scanTimer); scanTimer = 0; }
    }

    function onUrlChange() {
        var newUrl = location.href;
        if (newUrl === lastUrl) return;
        lastUrl = newUrl;
        if (enabled && isAvatarPage()) scheduleScan();
    }

    function startUrlPolling() {
        if (urlPollInterval) return;
        urlPollInterval = setInterval(onUrlChange, 600);
    }

    function stopUrlPolling() {
        if (urlPollInterval) { clearInterval(urlPollInterval); urlPollInterval = null; }
    }

    function setEnabled(next) {
        enabled = !!next;
        if (enabled) {
            if (!isAvatarPage()) return;
            startObserver();
            startUrlPolling();
            scheduleScan();
            return;
        }
        stopObserver();
        stopUrlPolling();
        document.querySelectorAll('[' + 'data-' + DATASET_PATCHED.toLowerCase() + ']').forEach(function (el) {
            try { delete el.dataset[DATASET_PATCHED]; } catch (_) { el.removeAttribute('data-' + DATASET_PATCHED); }
        });
        document.querySelectorAll('[data-purpuraR6Patched]').forEach(function (el) { el.removeAttribute('data-purpuraR6Patched'); });
    }

    function loadSetting() {
        function doLoad() {
            window.__PurpuraSettings.ready.then(function () {
                var v = window.__PurpuraSettings.get(STORAGE_KEY);
                setEnabled(getEnabled(v));
            });
        }
        if (!window.__PurpuraSettings) {
            var attempts = 0;
            var poll = setInterval(function () {
                if (window.__PurpuraSettings) { clearInterval(poll); doLoad(); }
                else if (++attempts > 50) clearInterval(poll);
            }, 100);
            return;
        }
        doLoad();
    }

    loadSetting();
    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync' || !changes[STORAGE_KEY]) return;
        loadSetting();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            if (enabled && isAvatarPage()) { startObserver(); startUrlPolling(); scheduleScan(); }
        }, { once: true });
    } else if (enabled && isAvatarPage()) {
        startObserver();
        startUrlPolling();
        scheduleScan();
    }

    var origPushState = history.pushState.bind(history);
    history.pushState = function () {
        var r = origPushState.apply(this, arguments);
        onUrlChange();
        return r;
    };
    var origReplaceState = history.replaceState.bind(history);
    history.replaceState = function () {
        var r = origReplaceState.apply(this, arguments);
        onUrlChange();
        return r;
    };
    window.addEventListener('popstate', onUrlChange);
})();