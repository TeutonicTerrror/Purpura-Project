/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.purpuraSidebarTweaksInitialized) return;
    window.purpuraSidebarTweaksInitialized = true;

    var STORAGE_KEY = 'sbt';
    var STYLE_ID = 'purpura-sidebar-tweaks-style';
    var OVERLAY_ID = 'purpura-sbt-overlay';
    var READY_ATTR = 'data-purpura-sbt-ready';
    var COLLAPSE_ATTR = 'data-purpura-sbt';
    var HOVER_ATTR = 'data-purpura-sbt-hover';
    var LAYOUT_ATTR = 'data-purpura-sbt-layout';
    var ITEM_ATTR = 'data-purpura-sbt-key';
    var HIDDEN_ATTR = 'data-purpura-sbt-hidden';

    var SIDEBAR_SELECTOR = '.left-nav';
    var CONTENT_SELECTOR = 'main.container-main';
    var CONTROL_SELECTOR = '.left-nav nav a[href], .left-nav nav button';
    var RESPONSIVE_MENU_SELECTOR = 'button.menu-button.btn-navigation-nav-menu-md, .icon-nav-menu';
    var GROUPS_SELECTOR = '.groups-list-sidebar';
    var BREAKPOINT = 768;
    var SCAN_DELAY = 120;
    var RESCAN_INTERVAL = 1500;

    var BUTTON_CLASS = 'purpura-sbt-layout-button';
    var PURPURA_ITEM_CLASS = 'purpura-nav-item';
    var EDITOR_ITEM_CLASS = 'purpura-sbt-item';
    var EDITOR_KEY_ATTR = 'data-sbt-key';

    var PURPURA_SIDEBAR_KEY = 'sdbr';
    var PURPURA_SIDEBAR_ID = 'purpura-sidebar-nav';
    var PURPURA_ACTIVE_CLASS = 'purpura-custom-sidebar-active';
    var PURPURA_ITEM_SELECTOR = '.' + PURPURA_ITEM_CLASS;
    var PURPURA_KEY_PREFIX = 'purpura:';
    var KEEP_SELECTOR =
        '#purpura-kofi-abc, .purpura-support-btn, .purpura-sidebar-footer, .purpura-sidebar-tabs, .' + BUTTON_CLASS;

    var TRANSACTIONS_URL = 'https://www.roblox.com/transactions';
    var TRANSACTIONS_PATH = '/transactions';
    var TRANSACTIONS_NATIVE_KEY = 'href:' + TRANSACTIONS_PATH;
    var TRANSACTIONS_PURPURA_KEY = PURPURA_KEY_PREFIX + TRANSACTIONS_PATH;
    var TRANSACTIONS_KEYS = [TRANSACTIONS_NATIVE_KEY, TRANSACTIONS_PURPURA_KEY];
    var TRANSACTIONS_MARKER = 'data-purpura-sbt-transactions';
    var TRANSACTIONS_NEIGHBOUR_PATHS = ['/communities', '/groups'];
    var SETTINGS_URL = 'https://www.roblox.com/my/account?purpura=info#!/info';
    var SETTINGS_MARKER = 'data-purpura-sbt-settings';

    var FALLBACK_STRINGS = {
        sidebarTweaks_button: 'Customize Layout',
        sidebarTweaks_overlayTitle: 'Sidebar Layout',
        sidebarTweaks_overlayHint: 'Drag to reorder. Use the eye to show or hide an item.',
        sidebarTweaks_save: 'Save',
        sidebarTweaks_reset: 'Reset',
        sidebarTweaks_close: 'Close',
        sidebarTweaks_empty: 'Purpura could not find any sidebar buttons.',
        sidebarTweaks_untitled: 'Untitled',
        sidebarTweaks_myProfile: 'My Profile',
        sidebarTweaks_myTransactions: 'My Transactions',
        sidebarTweaks_show: 'Show',
        sidebarTweaks_hide: 'Hide',
        sdbr_purpuraSettings: 'Purpura Settings'
    };

    var ICON = {
        settings:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;width:20px;height:20px"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        layout:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2.1"/><circle cx="15" cy="12" r="2.1"/><circle cx="8" cy="18" r="2.1"/></svg>',
        grip:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
        eye:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
        eyeOff:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a18.4 18.4 0 0 1-3.4 4.4"/><path d="M6.5 6.7A18.2 18.2 0 0 0 2 12s3.6 7 10 7a10.8 10.8 0 0 0 5.5-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
        close:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
        transactions:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;width:20px;height:20px"><path d="M6 3h12v18l-2-1.25L14 21l-2-1.25L10 21l-2-1.25L6 21z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>'
    };

    var CLOSE_BUTTON_CLASSES =
        'foundation-web-close-affordance flex stroke-none cursor-pointer relative clip group/interactable focus-visible:outline-focus disabled:outline-none bg-over-media-100 padding-medium radius-circle';
    var STATE_LAYER_CLASSES =
        'absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none';

    var CSS = [
        ':root{--purpura-sbt-expanded:289px;--purpura-sbt-narrow:72px;--purpura-sbt-speed:380ms;--purpura-sbt-ease:cubic-bezier(0.22,1,0.36,1)}',

        '.left-nav[' + COLLAPSE_ATTR + '="true"]{width:var(--purpura-sbt-narrow)!important;transition:width var(--purpura-sbt-speed) var(--purpura-sbt-ease);will-change:width}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]>.flex,',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]>.flex>div:first-child{width:var(--purpura-sbt-narrow)!important;transition:width var(--purpura-sbt-speed) var(--purpura-sbt-ease)}',

        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav ul{align-items:center}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav li>a,',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav li>button{width:48px!important;min-width:48px!important;justify-content:center!important;padding-left:0!important;padding-right:0!important;margin-left:auto;margin-right:auto;box-sizing:border-box}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav li>a>span:not(:first-of-type),',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav li>button>span:not(:first-of-type){display:none!important}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav li>a>span:first-of-type,',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) nav li>button>span:first-of-type{margin:0!important}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) .padding-x-large{padding-left:0!important;padding-right:0!important}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) .foundation-web-badge{display:none!important}',

        '.left-nav[' + COLLAPSE_ATTR + '="true"][' + HOVER_ATTR + '="true"]{width:var(--purpura-sbt-expanded)!important;z-index:1000!important;box-shadow:0 18px 48px rgba(0,0,0,0.22)}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"][' + HOVER_ATTR + '="true"]>.flex,',
        '.left-nav[' + COLLAPSE_ATTR + '="true"][' + HOVER_ATTR + '="true"]>.flex>div:first-child{width:var(--purpura-sbt-expanded)!important}',

        '@media (min-width:768px){',
        CONTENT_SELECTOR + '[' + COLLAPSE_ATTR + '="true"]{margin-left:var(--purpura-sbt-narrow)!important;width:calc(100% - var(--purpura-sbt-narrow))!important;box-sizing:border-box;transition:margin-left var(--purpura-sbt-speed) var(--purpura-sbt-ease),width var(--purpura-sbt-speed) var(--purpura-sbt-ease)}',
        '}',

        'body:has(.left-nav[' + COLLAPSE_ATTR + '="true"]) ' + GROUPS_SELECTOR + '{left:var(--purpura-sbt-narrow)!important;transition:left var(--purpura-sbt-speed) var(--purpura-sbt-ease)}',

        '.left-nav .' + BUTTON_CLASS + '{position:absolute;right:12px;bottom:12px;z-index:3;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 14px;margin:0;border:1px solid var(--color-stroke-default,rgba(0,0,0,0.14));border-radius:10px;background:var(--color-surface-100,#fff);color:var(--color-content-emphasis,#191b1d);font-family:inherit;font-size:14px;font-weight:600;line-height:20px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.16);transition:opacity 0.2s ease,background-color 0.18s ease,box-shadow 0.18s ease,transform 0.18s ease}',
        '.left-nav .' + BUTTON_CLASS + ':hover{background:var(--color-surface-200,rgba(128,128,128,0.12));box-shadow:0 4px 14px rgba(0,0,0,0.2)}',
        '.left-nav .' + BUTTON_CLASS + ':active{background:var(--color-surface-300,rgba(128,128,128,0.2));transform:scale(0.97)}',
        '.left-nav .' + BUTTON_CLASS + ' svg{display:block;width:18px;height:18px;flex-shrink:0}',
        '.left-nav .' + BUTTON_CLASS + ' .purpura-support-label{display:block;flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:inherit;color:inherit}',
        '.left-nav[' + LAYOUT_ATTR + '="true"] nav ul{padding-bottom:72px!important}',
        '.left-nav[' + COLLAPSE_ATTR + '="true"]:not([' + HOVER_ATTR + '="true"]) .' + BUTTON_CLASS + '{opacity:0;visibility:hidden;pointer-events:none}',

        '.left-nav [' + HIDDEN_ATTR + '="true"],',
        '#' + PURPURA_SIDEBAR_ID + ' [' + HIDDEN_ATTR + '="true"]{display:none!important}',

        '#' + PURPURA_SIDEBAR_ID + ' .' + BUTTON_CLASS + '{display:flex;align-items:center;justify-content:center;gap:12px;width:48px;height:48px;padding:0;margin:0;border:0;border-radius:14px;background-color:transparent;color:var(--purpura-text-muted,rgba(255,255,255,0.5));font-family:inherit;cursor:pointer;flex-shrink:0;overflow:hidden;transition:width 0.5s var(--purpura-bezier,cubic-bezier(0.16,1,0.3,1)),padding 0.5s var(--purpura-bezier,cubic-bezier(0.16,1,0.3,1)),background-color 0.2s ease,color 0.2s ease}',
        '#' + PURPURA_SIDEBAR_ID + ' .' + BUTTON_CLASS + ':hover{background-color:var(--purpura-item-hover,rgba(255,255,255,0.08));color:var(--purpura-text,inherit)}',
        '#' + PURPURA_SIDEBAR_ID + ':hover .' + BUTTON_CLASS + '{width:100%;justify-content:flex-start;padding:0 20px;border-radius:16px}',
        '#' + PURPURA_SIDEBAR_ID + ' .' + BUTTON_CLASS + ' svg{display:block;width:20px;height:20px;flex-shrink:0}',
        '#' + PURPURA_SIDEBAR_ID + ' .' + BUTTON_CLASS + ' .purpura-support-label{display:none;font-size:14px;font-weight:700;white-space:nowrap}',
        '#' + PURPURA_SIDEBAR_ID + ':hover .' + BUTTON_CLASS + ' .purpura-support-label{display:block}',

        '#' + OVERLAY_ID + '{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;background-color:rgba(0,0,0,0.6);opacity:0;transition:opacity 0.16s ease}',
        '#' + OVERLAY_ID + '.is-visible{opacity:1}',
        '#' + OVERLAY_ID + ' *{box-sizing:border-box}',
        '.purpura-sbt-dialog{position:relative;display:flex;flex-direction:column;width:min(560px,100%);max-height:calc(100vh - 48px);border:1px solid var(--color-stroke-default,rgba(0,0,0,0.12));border-radius:var(--radius-large,12px);background-color:var(--color-surface-100,#fff);color:var(--color-content-emphasis,#191b1d);box-shadow:0 12px 32px rgba(0,0,0,0.32);font-family:inherit;font-size:16px;line-height:1.4;overflow:hidden;transform:translateY(12px) scale(0.97);transition:transform 0.24s var(--purpura-sbt-ease)}',
        '#' + OVERLAY_ID + '.is-visible .purpura-sbt-dialog{transform:none}',
        '.purpura-sbt-header{display:flex;flex:0 0 auto;align-items:center;gap:10px;padding:20px 56px 4px 24px}',
        '.purpura-sbt-title{flex:1 1 auto;min-width:0;margin:0;font-size:20px;font-weight:700;line-height:1.25;letter-spacing:normal;color:var(--color-content-emphasis,#191b1d)}',
        '.purpura-sbt-close{position:absolute;top:10px;right:10px;z-index:2;display:flex}',
        '.purpura-sbt-close svg{display:block;width:16px;height:16px}',
        '.purpura-sbt-hint{flex:0 0 auto;margin:0;padding:0 24px 12px;font-size:13px;line-height:1.5;color:var(--color-content-muted,#6e6e6e)}',
        '.purpura-sbt-list{display:flex;flex:1 1 auto;flex-direction:column;gap:8px;min-height:0;margin:0;padding:0 24px;list-style:none;overflow-y:auto}',
        '.' + EDITOR_ITEM_CLASS + '{display:flex;align-items:center;gap:12px;min-height:52px;padding:10px 12px;border-radius:var(--radius-medium,8px);background-color:var(--color-surface-200,rgba(128,128,128,0.12));cursor:grab;user-select:none;transition:background-color 0.15s ease,opacity 0.15s ease}',
        '.' + EDITOR_ITEM_CLASS + ':hover{background-color:var(--color-surface-300,rgba(128,128,128,0.2))}',
        '.' + EDITOR_ITEM_CLASS + ':active{cursor:grabbing}',
        '.' + EDITOR_ITEM_CLASS + '.is-dragging{opacity:0.35}',
        '.' + EDITOR_ITEM_CLASS + '.is-hidden{opacity:0.65}',
        '.' + EDITOR_ITEM_CLASS + '.is-hidden .purpura-sbt-label{color:var(--color-content-muted,#6e6e6e)}',
        '.purpura-sbt-grip{display:inline-flex;flex:0 0 22px;align-items:center;justify-content:center;color:var(--color-content-muted,#8a8e91)}',
        '.purpura-sbt-grip svg{display:block;width:20px;height:20px}',
        '.purpura-sbt-label{flex:1 1 auto;min-width:0;overflow:hidden;font-size:16px;font-weight:700;text-overflow:ellipsis;white-space:nowrap;color:var(--color-content-emphasis,#191b1d)}',
        '.purpura-sbt-eye{display:inline-flex;flex:0 0 32px;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;border-radius:var(--radius-medium,8px);background-color:transparent;color:var(--color-content-emphasis,#191b1d);cursor:pointer;transition:background-color 0.15s ease}',
        '.purpura-sbt-eye:hover{background-color:var(--color-state-hover,rgba(128,128,128,0.18))}',
        '.purpura-sbt-eye:active{background-color:var(--color-state-press,rgba(128,128,128,0.24))}',
        '.purpura-sbt-eye svg{display:block;width:20px;height:20px}',
        '.purpura-sbt-footer{display:flex;flex:0 0 auto;align-items:center;justify-content:flex-end;gap:12px;padding:16px 24px 20px}',
        '.purpura-sbt-btn:disabled{opacity:0.5;cursor:not-allowed}',
        '.purpura-sbt-empty{margin:0;padding:16px 0;font-size:14px;text-align:center;color:var(--color-content-muted,#6e6e6e)}',

        '@media (prefers-reduced-motion:reduce){',
        '.left-nav,.left-nav>.flex,' + CONTENT_SELECTOR + ',body:has(.left-nav[' + COLLAPSE_ATTR + '="true"]) ' + GROUPS_SELECTOR + '{transition:none!important}',
        '#' + OVERLAY_ID + ',.purpura-sbt-dialog,' + '.' + EDITOR_ITEM_CLASS + '{transition:none!important}',
        '}'
    ].join('\n');

    var state = {
        enabled: false,
        hoverExpand: true,
        layout: false,
        order: [],
        hidden: [],
        transactions: false
    };

    var currentSidebar = null;
    var currentContent = null;
    var sidebarObserver = null;
    var hoverTarget = null;
    var scanTimer = 0;
    var syncTimer = 0;
    var rescanTimer = 0;
    var editorOverlay = null;
    var editorKeyHandler = null;

    function message(key) {
        try {
            return chrome.i18n.getMessage(key) || FALLBACK_STRINGS[key] || key;
        } catch (_) {
            return FALLBACK_STRINGS[key] || key;
        }
    }

    function setAttr(element, name, value) {
        if (!element) return;
        if (element.getAttribute(name) !== value) element.setAttribute(name, value);
    }

    function removeAttr(element, name) {
        if (element && element.hasAttribute(name)) element.removeAttribute(name);
    }

    function readConfig() {
        var raw = window.__PurpuraSettings ? window.__PurpuraSettings.get(STORAGE_KEY) : null;
        if (!raw || typeof raw !== 'object') raw = {};
        state.enabled = raw.enabled !== false;
        state.hoverExpand = raw.hoverExpand !== false;
        state.layout = raw.layout === true;
        state.order = Array.isArray(raw.order) ? raw.order.map(String) : [];
        state.hidden = Array.isArray(raw.hidden) ? raw.hidden.map(String) : [];
        state.transactions = raw.transactions === true;
    }

    function writeConfig(patch) {
        var raw = window.__PurpuraSettings ? window.__PurpuraSettings.get(STORAGE_KEY) : null;
        var next = raw && typeof raw === 'object' ? Object.assign({}, raw) : {};
        Object.assign(next, patch);
        if (window.__PurpuraSettings) window.__PurpuraSettings.set(STORAGE_KEY, next);
        Object.assign(state, patch);
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);
    }

    function supportsHover() {
        try {
            if (!window.matchMedia) return true;
            return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        } catch (_) {
            return true;
        }
    }

    function isVisible(element) {
        if (!element) return false;
        var style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        var rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function isResponsiveNavActive() {
        var menu = document.querySelector(RESPONSIVE_MENU_SELECTOR);
        if (!menu) return false;
        return isVisible(menu.closest('button') || menu);
    }

    function isWideLayout() {
        return window.innerWidth >= BREAKPOINT && !isResponsiveNavActive();
    }

    function purpuraSidebar() {
        if (!document.body || !document.body.classList.contains(PURPURA_ACTIVE_CLASS)) return null;
        var nav = document.getElementById(PURPURA_SIDEBAR_ID);
        return nav && nav.isConnected ? nav : null;
    }

    function isPurpuraSidebar(sidebar) {
        return !!sidebar && sidebar.id === PURPURA_SIDEBAR_ID;
    }

    function getSidebar() {
        return purpuraSidebar() || document.querySelector(SIDEBAR_SELECTOR);
    }

    function isKept(element) {
        if (!element || !element.closest) return false;
        return !!element.closest(KEEP_SELECTOR);
    }

    function getContentRoot() {
        return document.querySelector(CONTENT_SELECTOR);
    }

    function detachHover() {
        if (!hoverTarget) return;
        hoverTarget.removeEventListener('pointerenter', onPointerEnter);
        hoverTarget.removeEventListener('pointerleave', onPointerLeave);
        hoverTarget = null;
    }

    function attachHover(sidebar) {
        if (hoverTarget === sidebar) return;
        if (hoverTarget) {
            hoverTarget.removeEventListener('pointerenter', onPointerEnter);
            hoverTarget.removeEventListener('pointerleave', onPointerLeave);
        }
        hoverTarget = sidebar;
        sidebar.addEventListener('pointerenter', onPointerEnter);
        sidebar.addEventListener('pointerleave', onPointerLeave);
    }

    function onPointerEnter() {
        if (!state.enabled || !state.hoverExpand) return;
        if (!isWideLayout() || !supportsHover() || !currentSidebar) return;
        setAttr(currentSidebar, HOVER_ATTR, 'true');
    }

    function onPointerLeave() {
        removeAttr(currentSidebar, HOVER_ATTR);
    }

    function syncCollapse(sidebar) {
        var active = state.enabled && state.hoverExpand && isWideLayout() && !isPurpuraSidebar(sidebar);
        if (active) {
            setAttr(sidebar, COLLAPSE_ATTR, 'true');
            setAttr(currentContent, COLLAPSE_ATTR, 'true');
        } else {
            removeAttr(sidebar, HOVER_ATTR);
            removeAttr(sidebar, COLLAPSE_ATTR);
            removeAttr(currentContent, COLLAPSE_ATTR);
        }
    }

    function normalizePath(pathname) {
        var normalized = String(pathname || '').toLowerCase().replace(/^\/[a-z]{2}(?:-[a-z]{2})?\//, '/');
        if (normalized.length > 1) normalized = normalized.replace(/\/$/, '');
        return normalized || '/';
    }

    function iconClassOf(control) {
        var icons = control.querySelectorAll('[class*="icon-regular-"]');
        for (var i = 0; i < icons.length; i++) {
            var list = icons[i].classList;
            for (var j = 0; j < list.length; j++) {
                if (list[j].indexOf('icon-regular-') === 0) return list[j];
            }
        }
        return null;
    }

    function baseKeyFor(control, element) {
        var href = control.getAttribute && control.getAttribute('href');
        if (href) {
            try {
                var url = new URL(href, window.location.origin);
                return 'href:' + normalizePath(url.pathname) + url.search;
            } catch (_) {}
        }
        var iconClass = iconClassOf(control);
        if (iconClass) return 'icon:' + iconClass;
        var text = (element.textContent || '').trim().toLowerCase().replace(/\s+/g, '-');
        return text ? 'text:' + text.slice(0, 48) : null;
    }

    function labelOf(control) {
        var candidates = control.querySelectorAll('.nav-item-text, .foundation-web-menu-item-title, span.text-truncate-end');
        for (var i = 0; i < candidates.length; i++) {
            var text = (candidates[i].textContent || '').trim();
            if (text) return text.replace(/\s+/g, ' ');
        }
        var aria = control.getAttribute('aria-label') || control.getAttribute('title');
        if (aria && aria.trim()) return aria.trim();
        var own = (control.textContent || '').trim().replace(/\s+/g, ' ');
        return own || message('sidebarTweaks_untitled');
    }

    function purpuraLabelOf(control) {
        var label = control.querySelector('.purpura-nav-label');
        var text = label ? (label.textContent || '').trim() : '';
        if (text) return text.replace(/\s+/g, ' ');
        var aria = control.getAttribute('aria-label') || control.getAttribute('title');
        if (aria && aria.trim()) return aria.trim();
        return message('sidebarTweaks_untitled');
    }

    function purpuraKeyFor(control) {
        var pattern = control.getAttribute('data-pattern');
        if (pattern) return PURPURA_KEY_PREFIX + pattern;
        var href = control.getAttribute('data-url');
        if (href) {
            try {
                var url = new URL(href, window.location.origin);
                return PURPURA_KEY_PREFIX + 'href:' + normalizePath(url.pathname) + url.search;
            } catch (_) {}
        }
        var label = purpuraLabelOf(control);
        return label ? PURPURA_KEY_PREFIX + 'label:' + label.toLowerCase().replace(/\s+/g, '-').slice(0, 48) : null;
    }

    function isTransactionsKey(key) {
        return !!key && TRANSACTIONS_KEYS.indexOf(key) !== -1;
    }

    function pathOf(href) {
        try {
            return normalizePath(new URL(href, window.location.origin).pathname);
        } catch (_) {
            return '';
        }
    }

    function purpuraTransactionsItem(sidebar) {
        var items = sidebar.querySelectorAll(PURPURA_ITEM_SELECTOR);
        for (var i = 0; i < items.length; i++) {
            if (purpuraKeyFor(items[i]) === TRANSACTIONS_PURPURA_KEY) return items[i];
        }
        return null;
    }

    function transactionsItem(sidebar) {
        if (!sidebar) return null;
        if (isPurpuraSidebar(sidebar)) return purpuraTransactionsItem(sidebar);
        return sidebar.querySelector('[' + TRANSACTIONS_MARKER + ']');
    }

    function settingsItem(sidebar) {
        if (!sidebar) return null;
        return sidebar.querySelector('[' + SETTINGS_MARKER + ']');
    }

    function transactionsTemplate(sidebar) {
        var anchors = sidebar.querySelectorAll('nav a[href]');
        var fallback = null;

        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            if (isKept(anchor) || anchor.closest('[' + TRANSACTIONS_MARKER + ']') || anchor.closest('[' + SETTINGS_MARKER + ']')) continue;

            var item = anchor.closest('li, [role="menuitem"], [role="listitem"]') || anchor.parentElement;
            if (!item || item === anchor || !sidebar.contains(item)) continue;

            if (TRANSACTIONS_NEIGHBOUR_PATHS.indexOf(pathOf(anchor.getAttribute('href'))) !== -1) return item;
            fallback = item;
        }

        return fallback;
    }

    function stripClonedState(root) {
        var nodes = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
        nodes.forEach(function (node) {
            node.removeAttribute('id');
            node.removeAttribute('aria-current');
            node.removeAttribute('aria-selected');
            Array.prototype.slice.call(node.attributes).forEach(function (attribute) {
                if (attribute.name.indexOf('data-') === 0) node.removeAttribute(attribute.name);
            });
            node.classList.remove(
                'active',
                'selected',
                'active-menu-item',
                'selected-menu-item',
                'router-link-active',
                'router-link-exact-active'
            );
        });
    }

    function labelTargetOf(link) {
        var nodes = link.querySelectorAll('*');
        for (var i = nodes.length - 1; i >= 0; i--) {
            if (!nodes[i].children.length && (nodes[i].textContent || '').trim()) return nodes[i];
        }
        return null;
    }

    function iconHostOf(link, label) {
        var children = link.children;
        var i;
        var holdsLabel = function (child) {
            return !!label && (child === label || child.contains(label));
        };

        for (i = 0; i < children.length; i++) {
            if (holdsLabel(children[i])) continue;
            if (children[i].querySelector('svg, [class*="icon"], [class*="Icon"]')) return children[i];
        }
        for (i = 0; i < children.length; i++) {
            if (holdsLabel(children[i])) continue;
            if (!(children[i].textContent || '').trim()) return children[i];
        }
        return null;
    }

    function createTransactionsItem(sidebar) {
        var template = transactionsTemplate(sidebar);
        if (!template || !template.parentElement) return null;

        var item = template.cloneNode(true);
        stripClonedState(item);

        var link = item.tagName === 'A' ? item : item.querySelector('a[href]');
        if (!link) return null;

        item.setAttribute(TRANSACTIONS_MARKER, 'true');
        link.setAttribute('href', TRANSACTIONS_URL);

        var label = labelTargetOf(link);
        if (label) label.textContent = message('sidebarTweaks_myTransactions');
        else link.insertAdjacentHTML('beforeend', '<span>' + message('sidebarTweaks_myTransactions') + '</span>');

        var host = iconHostOf(link, label);
        if (host) {
            host.innerHTML = ICON.transactions;
            if (host.style) host.style.backgroundImage = 'none';
        } else {
            link.insertAdjacentHTML('afterbegin', ICON.transactions);
        }

        template.parentElement.insertBefore(item, template.nextSibling);
        return item;
    }

    function ensureTransactionsItem(sidebar) {
        if (!sidebar || isPurpuraSidebar(sidebar)) return;
        if (transactionsItem(sidebar)) return;
        createTransactionsItem(sidebar);
    }

    function createSettingsItem(sidebar) {
        var template = transactionsTemplate(sidebar);
        if (!template || !template.parentElement) return null;

        var item = template.cloneNode(true);
        stripClonedState(item);

        var link = item.tagName === 'A' ? item : item.querySelector('a[href]');
        if (!link) return null;

        item.setAttribute(SETTINGS_MARKER, 'true');
        link.setAttribute('href', SETTINGS_URL);
        link.setAttribute('aria-label', message('sdbr_purpuraSettings'));
        link.setAttribute('title', message('sdbr_purpuraSettings'));

        var label = labelTargetOf(link);
        if (label) label.textContent = message('sdbr_purpuraSettings');
        else link.insertAdjacentHTML('beforeend', '<span>' + message('sdbr_purpuraSettings') + '</span>');

        var host = iconHostOf(link, label);
        if (host) {
            host.innerHTML = ICON.settings;
            if (host.style) host.style.backgroundImage = 'none';
        } else {
            link.insertAdjacentHTML('afterbegin', ICON.settings);
        }

        var parent = template.parentElement;
        var kofi = document.getElementById('purpura-kofi-abc');
        parent.insertBefore(item, kofi && kofi.parentElement === parent ? kofi : null);
        return item;
    }

    function ensureSettingsItem(sidebar) {
        if (!sidebar || isPurpuraSidebar(sidebar)) return;
        if (settingsItem(sidebar)) return;
        createSettingsItem(sidebar);
    }

    function applyTransactionsState(sidebar) {
        var item = transactionsItem(sidebar);
        if (!item) return;
        if (state.transactions) removeAttr(item, HIDDEN_ATTR);
        else setAttr(item, HIDDEN_ATTR, 'true');
    }

    function collectPurpuraItems(sidebar) {
        var controls = sidebar.querySelectorAll(PURPURA_ITEM_SELECTOR);
        var items = [];
        var usedKeys = new Set();

        for (var i = 0; i < controls.length; i++) {
            var control = controls[i];
            if (isKept(control)) continue;
            var key = purpuraKeyFor(control);
            if (!key) continue;

            var base = key;
            var occurrence = 2;
            while (usedKeys.has(key)) {
                key = base + ':occurrence-' + occurrence;
                occurrence += 1;
            }

            usedKeys.add(key);
            items.push({ key: key, label: purpuraLabelOf(control), element: control });
        }

        var profileKey = PURPURA_KEY_PREFIX + '/profile';
        for (var j = 0; j < items.length; j++) {
            if (items[j].key === profileKey) {
                items[j].label = message('sidebarTweaks_myProfile');
                break;
            }
        }

        return items;
    }

    function collectItems(sidebar) {
        if (!sidebar) return [];
        if (isPurpuraSidebar(sidebar)) return collectPurpuraItems(sidebar);

        var controls = sidebar.querySelectorAll(CONTROL_SELECTOR);
        var items = [];
        var used = new Set();
        var usedKeys = new Set();

        for (var i = 0; i < controls.length; i++) {
            var control = controls[i];
            if (isKept(control)) continue;
            var element = control.closest('li, [role="menuitem"], [role="listitem"]') || control;
            if (!element || used.has(element)) continue;
            if (!sidebar.contains(element) || !element.parentElement) continue;
            if (isKept(element)) continue;

            var key = baseKeyFor(control, element);
            if (!key) continue;

            var base = key;
            var occurrence = 2;
            while (usedKeys.has(key)) {
                key = base + ':occurrence-' + occurrence;
                occurrence += 1;
            }

            used.add(element);
            usedKeys.add(key);
            items.push({ key: key, label: labelOf(control), element: element });
        }

        if (items.length) items[0].label = message('sidebarTweaks_myProfile');
        return items;
    }

    function applyItemState(items) {
        var hidden = new Set(state.hidden);
        items.forEach(function (item) {
            if (isKept(item.element)) {
                removeAttr(item.element, HIDDEN_ATTR);
                return;
            }
            if (item.element.getAttribute(ITEM_ATTR) !== item.key) item.element.setAttribute(ITEM_ATTR, item.key);
            if (isTransactionsKey(item.key)) return;
            if (hidden.has(item.key)) setAttr(item.element, HIDDEN_ATTR, 'true');
            else removeAttr(item.element, HIDDEN_ATTR);
        });
    }

    function applyItemOrder(items) {
        if (!state.order.length || items.length < 2) return;

        var index = {};
        state.order.forEach(function (key, position) {
            if (!(key in index)) index[key] = position;
        });

        var groups = [];
        items.forEach(function (item) {
            var parent = item.element.parentElement;
            if (!parent) return;
            var group = null;
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].parent === parent) {
                    group = groups[i];
                    break;
                }
            }
            if (!group) {
                group = { parent: parent, items: [] };
                groups.push(group);
            }
            group.items.push(item);
        });

        groups.forEach(function (group) {
            var desired = group.items.slice().sort(function (a, b) {
                var aIndex = index[a.key];
                var bIndex = index[b.key];
                var aKnown = aIndex !== undefined;
                var bKnown = bIndex !== undefined;
                if (aKnown && bKnown) return aIndex - bIndex;
                if (aKnown) return -1;
                if (bKnown) return 1;
                return a.element.compareDocumentPosition(b.element) === 4 ? -1 : 1;
            });
            for (var i = 1; i < desired.length; i++) {
                var previous = desired[i - 1].element;
                var current = desired[i].element;
                if (current.previousElementSibling !== previous) {
                    group.parent.insertBefore(current, previous.nextSibling);
                }
            }
        });
    }

    function clearItemState(sidebar) {
        var tagged = sidebar.querySelectorAll('[' + ITEM_ATTR + ']');
        for (var i = 0; i < tagged.length; i++) {
            if (isTransactionsKey(tagged[i].getAttribute(ITEM_ATTR))) continue;
            removeAttr(tagged[i], ITEM_ATTR);
            removeAttr(tagged[i], HIDDEN_ATTR);
        }
    }

    function createLayoutButton(withLabel) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = BUTTON_CLASS;
        button.setAttribute('aria-label', message('sidebarTweaks_button'));
        button.setAttribute('title', message('sidebarTweaks_button'));
        button.innerHTML = ICON.layout;
        if (withLabel) {
            var label = document.createElement('span');
            label.className = 'purpura-support-label';
            label.textContent = message('sidebarTweaks_button');
            button.appendChild(label);
        }
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openEditor();
        });
        return button;
    }

    function layoutButtonTarget(sidebar) {
        if (isPurpuraSidebar(sidebar)) {
            var footer = sidebar.querySelector('.purpura-sidebar-footer');
            if (footer) return { parent: footer, before: footer.firstChild, label: true };
        }
        return { parent: sidebar, before: null, label: true };
    }

    function syncLayout(sidebar) {
        if (!state.layout) {
            removeAttr(sidebar, LAYOUT_ATTR);
            var stale = sidebar.querySelector('.' + BUTTON_CLASS);
            if (stale) stale.remove();
            clearItemState(sidebar);
            return;
        }

        setAttr(sidebar, LAYOUT_ATTR, 'true');

        var target = layoutButtonTarget(sidebar);
        var button = sidebar.querySelector('.' + BUTTON_CLASS);
        if (button && button.parentElement !== target.parent) {
            button.remove();
            button = null;
        }
        if (!button) {
            button = createLayoutButton(target.label);
            target.parent.insertBefore(button, target.before);
        }

        var items = collectItems(sidebar);
        applyItemState(items);
        applyItemOrder(items);
    }

    function detachSidebar(sidebar) {
        if (!sidebar) return;
        removeAttr(sidebar, READY_ATTR);
        removeAttr(sidebar, COLLAPSE_ATTR);
        removeAttr(sidebar, HOVER_ATTR);
        removeAttr(sidebar, LAYOUT_ATTR);
        var button = sidebar.querySelector('.' + BUTTON_CLASS);
        if (button) button.remove();
        var injected = sidebar.querySelector('[' + TRANSACTIONS_MARKER + ']');
        if (injected) injected.remove();
        var settings = sidebar.querySelector('[' + SETTINGS_MARKER + ']');
        if (settings) settings.remove();
        clearItemState(sidebar);
    }

    function sync() {
        if (!state.enabled) return;
        ensureStyles();

        var sidebar = getSidebar();
        if (sidebar !== currentSidebar) {
            if (sidebarObserver) {
                sidebarObserver.disconnect();
                sidebarObserver = null;
            }
            detachHover();
            detachSidebar(currentSidebar);
            currentSidebar = sidebar;
            if (sidebar) {
                sidebarObserver = new MutationObserver(queueSync);
                sidebarObserver.observe(sidebar, { childList: true, subtree: true });
                if (!isPurpuraSidebar(sidebar)) attachHover(sidebar);
            }
        }

        currentContent = getContentRoot();

        if (!sidebar) return;

        setAttr(sidebar, READY_ATTR, 'true');
        syncCollapse(sidebar);
        ensureTransactionsItem(sidebar);
        ensureSettingsItem(sidebar);
        syncLayout(sidebar);
        applyTransactionsState(sidebar);
    }

    function queueSync() {
        if (syncTimer) return;
        syncTimer = setTimeout(function () {
            syncTimer = 0;
            sync();
        }, SCAN_DELAY);
    }

    function teardown() {
        detachSidebar(currentSidebar);
        if (currentContent) removeAttr(currentContent, COLLAPSE_ATTR);
        closeEditor();
    }

    function apply() {
        if (!state.enabled) {
            teardown();
            currentSidebar = null;
            currentContent = null;
            return;
        }
        sync();
    }

    function flip(list, mutate) {
        var before = new Map();
        Array.prototype.forEach.call(list.children, function (child) {
            before.set(child, child.getBoundingClientRect().top);
        });

        mutate();

        Array.prototype.forEach.call(list.children, function (child) {
            var previous = before.get(child);
            if (previous === undefined) return;
            var delta = previous - child.getBoundingClientRect().top;
            if (!delta) return;
            child.style.transition = 'none';
            child.style.transform = 'translateY(' + delta + 'px)';
            requestAnimationFrame(function () {
                child.style.transition = '';
                child.style.transform = '';
            });
        });
    }

    function enableDrag(list) {
        var dragging = null;

        list.addEventListener('dragstart', function (event) {
            var item = event.target.closest ? event.target.closest('.' + EDITOR_ITEM_CLASS) : null;
            if (!item || item.parentElement !== list) {
                event.preventDefault();
                return;
            }
            dragging = item;
            item.classList.add('is-dragging');
            try {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.getAttribute(EDITOR_KEY_ATTR) || '');
            } catch (_) {}
        });

        list.addEventListener('dragover', function (event) {
            if (!dragging) return;
            event.preventDefault();
            try {
                event.dataTransfer.dropEffect = 'move';
            } catch (_) {}
            var after = dragTarget(list, event.clientY, dragging);
            if (after === null && dragging.nextElementSibling === null) return;
            flip(list, function () {
                if (after) list.insertBefore(dragging, after);
                else list.appendChild(dragging);
            });
        });

        list.addEventListener('dragend', function () {
            if (!dragging) return;
            dragging.classList.remove('is-dragging');
            dragging = null;
        });
    }

    function dragTarget(list, y, dragging) {
        var items = Array.prototype.filter.call(list.children, function (child) {
            return child !== dragging;
        });
        var closest = null;
        var closestOffset = Number.NEGATIVE_INFINITY;
        items.forEach(function (child) {
            var box = child.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closestOffset) {
                closestOffset = offset;
                closest = child;
            }
        });
        return closest;
    }

    function renderEditorList(list, working, items) {
        list.textContent = '';

        if (!items.length) {
            var empty = document.createElement('p');
            empty.className = 'purpura-sbt-empty';
            empty.textContent = message('sidebarTweaks_empty');
            list.appendChild(empty);
            return;
        }

        items.forEach(function (item) {
            var row = document.createElement('li');
            row.className = EDITOR_ITEM_CLASS;
            row.setAttribute('draggable', 'true');
            row.setAttribute(EDITOR_KEY_ATTR, item.key);

            var grip = document.createElement('span');
            grip.className = 'purpura-sbt-grip';
            grip.setAttribute('aria-hidden', 'true');
            grip.innerHTML = ICON.grip;

            var label = document.createElement('span');
            label.className = 'purpura-sbt-label';
            label.textContent = item.label;

            var eye = document.createElement('button');
            eye.type = 'button';
            eye.className = 'purpura-sbt-eye';

            var switched = isTransactionsKey(item.key);

            var paint = function () {
                var hidden = switched ? !working.transactions : working.hidden.has(item.key);
                eye.innerHTML = hidden ? ICON.eyeOff : ICON.eye;
                eye.setAttribute('aria-pressed', String(!hidden));
                eye.setAttribute('aria-label', hidden ? message('sidebarTweaks_show') : message('sidebarTweaks_hide'));
                eye.setAttribute('title', hidden ? message('sidebarTweaks_show') : message('sidebarTweaks_hide'));
                row.classList.toggle('is-hidden', hidden);
            };

            eye.addEventListener('mousedown', function (event) {
                event.stopPropagation();
            });
            eye.addEventListener('click', function (event) {
                event.preventDefault();
                if (switched) working.transactions = !working.transactions;
                else if (working.hidden.has(item.key)) working.hidden.delete(item.key);
                else working.hidden.add(item.key);
                paint();
            });

            paint();
            row.appendChild(grip);
            row.appendChild(label);
            row.appendChild(eye);
            list.appendChild(row);
        });
    }

    function closeEditor() {
        if (editorKeyHandler) {
            document.removeEventListener('keydown', editorKeyHandler);
            editorKeyHandler = null;
        }
        if (editorOverlay && editorOverlay.parentNode) editorOverlay.parentNode.removeChild(editorOverlay);
        editorOverlay = null;
    }

    function openEditor() {
        if (!document.body || !currentSidebar) return;
        closeEditor();

        var sidebar = currentSidebar;
        var items = collectItems(sidebar);
        var working = { hidden: new Set(state.hidden), transactions: state.transactions };

        if (state.order.length) {
            var index = {};
            state.order.forEach(function (key, position) {
                index[key] = position;
            });
            items = items.slice().sort(function (a, b) {
                var aIndex = index[a.key];
                var bIndex = index[b.key];
                if (aIndex === undefined && bIndex === undefined) return 0;
                if (aIndex === undefined) return 1;
                if (bIndex === undefined) return -1;
                return aIndex - bIndex;
            });
        }

        var overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        var dialog = document.createElement('div');
        dialog.className = 'purpura-sbt-dialog';

        var header = document.createElement('div');
        header.className = 'purpura-sbt-header';

        var icon = document.createElement('span');
        icon.className = 'purpura-sbt-grip';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = ICON.layout;

        var title = document.createElement('h2');
        title.className = 'purpura-sbt-title';
        title.textContent = message('sidebarTweaks_overlayTitle');

        var closeWrap = document.createElement('div');
        closeWrap.className = 'purpura-sbt-close';

        var closeState = document.createElement('div');
        closeState.setAttribute('role', 'presentation');
        closeState.className = STATE_LAYER_CLASSES;

        var closeIcon = document.createElement('span');
        closeIcon.setAttribute('aria-hidden', 'true');
        closeIcon.className = 'grow-0 shrink-0 basis-auto';
        closeIcon.innerHTML = ICON.close;

        var close = document.createElement('button');
        close.type = 'button';
        close.className = CLOSE_BUTTON_CLASSES;
        close.setAttribute('aria-label', message('sidebarTweaks_close'));
        close.setAttribute('title', message('sidebarTweaks_close'));
        close.addEventListener('click', closeEditor);
        close.appendChild(closeState);
        close.appendChild(closeIcon);
        closeWrap.appendChild(close);

        header.appendChild(icon);
        header.appendChild(title);

        var hint = document.createElement('p');
        hint.className = 'purpura-sbt-hint';
        hint.textContent = message('sidebarTweaks_overlayHint');

        var list = document.createElement('ul');
        list.className = 'purpura-sbt-list';

        var footer = document.createElement('div');
        footer.className = 'purpura-sbt-footer';

        var reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'purpura-sbt-btn ghost btn-secondary-md btn-min-width';
        reset.textContent = message('sidebarTweaks_reset');
        reset.disabled = !state.order.length && !state.hidden.length && state.transactions !== true;
        reset.addEventListener('click', function () {
            writeConfig({ order: [], hidden: [], transactions: false });
            working.hidden = new Set();
            working.transactions = false;
            closeEditor();
            sync();
        });

        var save = document.createElement('button');
        save.type = 'button';
        save.className = 'purpura-sbt-btn primary btn-primary-md btn-min-width';
        save.textContent = message('sidebarTweaks_save');
        save.disabled = !items.length;
        save.addEventListener('click', function () {
            var nextOrder = Array.prototype.map.call(list.children, function (child) {
                return child.getAttribute(EDITOR_KEY_ATTR);
            }).filter(Boolean);
            writeConfig({
                order: nextOrder,
                hidden: Array.from(working.hidden),
                transactions: working.transactions === true
            });
            closeEditor();
            sync();
        });

        footer.appendChild(reset);
        footer.appendChild(save);

        dialog.appendChild(header);
        dialog.appendChild(hint);
        dialog.appendChild(list);
        dialog.appendChild(footer);
        dialog.appendChild(closeWrap);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        renderEditorList(list, working, items);
        enableDrag(list);

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeEditor();
        });

        editorKeyHandler = function (event) {
            if (event.key === 'Escape') closeEditor();
        };
        document.addEventListener('keydown', editorKeyHandler);

        requestAnimationFrame(function () {
            overlay.classList.add('is-visible');
        });

        editorOverlay = overlay;
    }

    function startRescan() {
        if (rescanTimer) return;
        rescanTimer = setInterval(function () {
            if (!state.enabled || !document.body) return;
            var sidebar = getSidebar();
            if (!currentSidebar || !currentSidebar.isConnected || !currentSidebar.hasAttribute(READY_ATTR) || sidebar !== currentSidebar) sync();
            else if (state.layout || state.transactions) queueSync();
        }, RESCAN_INTERVAL);
    }

    window.addEventListener('resize', queueSync, { passive: true });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace !== 'local') return;
        if (changes[PURPURA_SIDEBAR_KEY]) queueSync();
        if (!changes[STORAGE_KEY]) return;
        readConfig();
        if (!state.enabled) {
            teardown();
            currentSidebar = null;
            currentContent = null;
            return;
        }
        sync();
    });

    window.__PurpuraSettings.ready.then(function () {
        readConfig();
        if (!state.enabled) return;
        apply();
        startRescan();
    }).catch(function () {});
})();
