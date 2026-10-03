/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    if (window.purpuraThemeEngineInitialized) return;
    window.purpuraThemeEngineInitialized = true;

    const STORAGE_KEY = 'thm';
    const MASTER_TOGGLE_KEY = 'thmEnabled';
    const STYLE_ID = 'purpura-theme-style';
    const NATIVE_STYLE_ID = 'purpura-native-vars';
    const ALL_THEME_CLASSES = ['purpura-theme-purpuraCore', 'purpura-theme-midnight', 'purpura-theme-muted', 'purpura-theme-custom'];
    const BASE_CLASSES = [];

    const NATIVE_VAR_MAP = {
        surface0: ['--color-surface-0'],
        surface100: ['--color-surface-100'],
        surface200: ['--color-surface-200'],
        surface300: ['--color-surface-300'],
        mainText: ['--color-content-default','--color-content-emphasis','--dark-mode-content-default','--dark-mode-content-emphasis','--light-mode-content-default','--light-mode-content-emphasis'],
        secondaryText: ['--color-content-muted','--color-content-secondary','--dark-mode-content-muted','--dark-mode-content-secondary','--light-mode-content-muted','--light-mode-content-secondary'],
        playButton: ['--color-action-primary-background','--color-action-primary','--color-system-primary','--dark-mode-action-primary-background','--light-mode-action-primary-background']
    };

    let enabled = false;
    let selectedPreset = 'none';
    let customColors = null;
    let customThemes = [];
    let presetData = null;
    let styleElement = null;
    let observer = null;

    function parseEnabled(value) {
        if (typeof value === 'boolean') return value;
        if (value && typeof value === 'object') return value.enabled === true;
        return false;
    }

    function loadConfig() {
        var rawMaster = window.__PurpuraSettings.get(MASTER_TOGGLE_KEY);
        enabled = rawMaster === true;

        const raw = window.__PurpuraSettings.get(STORAGE_KEY);
        if (!raw || typeof raw !== 'object') {
            selectedPreset = 'none';
            customColors = null;
            customThemes = [];
        } else {
            selectedPreset = raw.selected || 'none';
            customColors = raw.customColors && typeof raw.customColors === 'object' ? raw.customColors : null;
            customThemes = Array.isArray(raw.customThemes) ? raw.customThemes : [];
        }
    }

    function fetchPresetData() {
        return fetch(chrome.runtime.getURL('data/themes.json'))
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }

    function getPresetColors(presetKey) {
        if (!presetData) return null;
        var preset = presetData[presetKey];
        return preset ? preset.colors : null;
    }

    function getPresetBase(presetKey) {
        if (!presetData) return null;
        var preset = presetData[presetKey];
        return preset ? preset.base : null;
    }

    function removeAllThemeClasses() {
        var body = document.body;
        if (!body) return;
        ALL_THEME_CLASSES.forEach(function (c) { body.classList.remove(c); });
        BASE_CLASSES.forEach(function (c) { body.classList.remove(c); });
    }

    function ensureStyleElement() {
        if (styleElement && styleElement.isConnected) {
            styleElement.parentNode.appendChild(styleElement);
            return styleElement;
        }
        styleElement = document.getElementById(STYLE_ID);
        if (!styleElement && document.head) {
            styleElement = document.createElement('style');
            styleElement.id = STYLE_ID;
            document.head.appendChild(styleElement);
        }
        return styleElement;
    }

    function injectThemeCSS(colors) {
        var style = ensureStyleElement();
        if (!style) return;
        var c = colors;
        var css = ':root {';
        var keys = Object.keys(c);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            css += '--purpura-' + key + ':' + c[key] + ';';
        }
        css += '}';

        var BC = ['body.purpura-theme-purpuraCore','body.purpura-theme-midnight','body.purpura-theme-muted','body.purpura-theme-custom'];
        function R(sel) { return BC.map(function(b){return b + ' ' + sel;}).join(','); }
        function R0(sel) { return BC.map(function(b){return b + sel;}).join(','); }
        function V(val, rule) { return val !== undefined && val !== null ? rule : ''; }

        css += '' +
        V(c.surface0, R('#container,.container-main,.main-content,.content,.page-content,.rbx-body,.game-main-content') + '{background-color:' + c.surface0 + '!important}') +
        V(c.surface100, R('.container-main .section-content,.section,.card,.game-cards .game-card,.item-card,.rbx-card,.chat-main,.rbx-scrollbar,.profile-about,.avatar-card-body,.notification-stream-body,.settings-sidebar,.settings-content,.game-home-page-container') + '{background-color:' + c.surface100 + '!important}') +
        V(c.surface200, R('.rbx-menu,.nav-menu,.popover,.dropdown-menu,.context-menu,.modal-dialog,.dialog-modal,.chat-dialog') + '{background-color:' + c.surface200 + '!important}') +
        V(c.cardBg, R('.rbx-card,.card-item,.list-item,.game-card,.item-tile,.catalog-item-row') + '{background-color:' + c.cardBg + '!important}') +
        V(c.headerBg, R('.rbx-header,header,#header,.navbar,.nav-container,.game-header,.game-home-header') + '{background-color:' + c.headerBg + '!important}') +
        V(c.navBg, R('#header,.rbx-header,header,.navbar,.nav-container,#navigation,#navbar,.header-container,.game-nav') + '{background-color:' + c.navBg + '!important}') +
        V(c.mainText, R('h1,h2,h3,h4,h5,h6,.text,.text-name,.font-header-1,.font-header-2,.rbx-text,.game-name,.item-name,label,.settings-label,.profile-display-name,.username') + '{color:' + c.mainText + '!important}') +
        V(c.secondaryText, R('.text-secondary,.text-muted,.text-small,.rbx-text-muted,.game-description,.item-description,.description') + '{color:' + c.secondaryText + '!important}') +
        V(c.tertiaryText, R('.text-tertiary,.text-label,.text-hint,.text-placeholder,.rbx-text-label,::placeholder,.input-hint') + '{color:' + c.tertiaryText + '!important}') +
        V(c.linkColor, R('a,a:link,.text-link,.rbx-link,.game-link,.rbx-text-nav,.nav-link,.settings-link') + '{color:' + c.linkColor + '!important}') +
        V(c.linkHover, R('a:hover,.text-link:hover,.rbx-link:hover') + '{color:' + c.linkHover + '!important}') +
        V(c.playButton, R('.btn-primary,.btn-cta,.rbx-button,.btn-full-width,.game-play-button,.play-button,.btn-play') + '{background-color:' + c.playButton + '!important}') +
        V(c.buttonBackground, R('.btn-secondary,.btn-default,.rbx-button-secondary,.rbx-btn') + '{background-color:' + c.buttonBackground + '!important;color:' + c.buttonTextColor + '!important}') +
        V(c.buttonHover, R('.btn-secondary:hover,.btn-default:hover,.rbx-button-secondary:hover,.rbx-btn:hover') + '{background-color:' + c.buttonHover + '!important}') +
        V(c.buttonActive, R('.btn-secondary:active,.btn-default:active,.rbx-button-secondary:active,.rbx-btn:active,.btn:active') + '{background-color:' + c.buttonActive + '!important}') +
        V(c.inputBg, R('.input-field,.rbx-input,input[type=text],input[type=search],textarea,.form-control,.search-bar') + '{background-color:' + c.inputBg + '!important;color:' + c.inputText + '!important;border-color:' + c.inputBorder + '!important}') +
        V(c.borderColor, R('.border,.rbx-border,.divider,.hr,.rbx-divider,.section-divider,.card-divider') + '{border-color:' + c.borderColor + '!important}') +
        V(c.scrollbarThumb, R0('::-webkit-scrollbar-thumb') + '{background-color:' + c.scrollbarThumb + '!important}') +
        V(c.scrollbarTrack, R0('::-webkit-scrollbar-track') + '{background-color:' + c.scrollbarTrack + '!important}') +
        V(c.surface300, R('.list-item:hover,.game-card:hover,.item-card:hover,.catalog-item-row:hover,.rbx-card:hover,.section-row:hover,.table-row:hover,.rbx-menu-item:hover,.rbx-option:hover') + '{background-color:' + c.surface300 + '!important}') +
        V(c.surface400, R('.tab-content,.tab-pane,.panel-body,.detail-panel,.info-panel,.sub-section,.nested-section') + '{background-color:' + c.surface400 + '!important}') +
        V(c.mutedText, R('::placeholder,.text-placeholder,.text-disabled,.rbx-text-disabled,.form-hint,.field-hint,[disabled]') + '{color:' + c.mutedText + '!important}') +
        V(c.shadow, R('.modal,.dialog,.popover,.dropdown-menu,.context-menu,.tooltip,.card,.rbx-card') + '{box-shadow:0 4px 16px ' + c.shadow + '!important}') +
        V(c.profileBg, R('.profile-header,.profile-header-container,.rbx-profile-header,.section-header,.account-header,.profile-about') + '{background-color:' + c.profileBg + '!important}') +
        V(c.iconColor, R('.icon-base,.rbx-icon,.rbx-icon-left,.rbx-icon-right,.icon-nav,.icon-arrow,.icon-sort,.icon-status,.icon-game-pass,.rbx-glyph,svg.rbx-icon,span[class*="icon-"]') + '{color:' + c.iconColor + '!important;fill:' + c.iconColor + '!important}') +
        V(c.surface100, R('#footer-container,.footer-container,footer,#footer,.rbx-footer,.container-footer,.footer-navigation,.legal-footer,.footer-bottom') + '{background-color:' + c.surface100 + '!important;border-top-color:' + c.borderColor + '!important}') +
        V(c.secondaryText, R('#footer-container .footer-links,ul.footer-links,.footer-links,.footer-link a,.text-footer-nav,.footer-text,.footer-copyright') + '{color:' + c.secondaryText + '!important}') +
        V(c.linkHover, R('.footer-link a:hover,.text-footer-nav:hover') + '{color:' + c.linkHover + '!important}') +
        V(c.accent, R('.rbx-tab.active,.nav-tab.active,.tab-active,.rbx-badge,.progress-fill') + '{background-color:' + c.accent + '!important}') +
        V(c.accentHover, R('.rbx-tab.active:hover,.nav-tab.active:hover,.tab-active:hover') + '{background-color:' + c.accentHover + '!important}') +
        V(c.accent, R(':focus-visible,.focus-ring') + '{outline-color:' + c.accent + '!important}') +
        V(c.borderEmphasis, R('.rbx-tab.active,.rbx-card.selected,.rbx-selected,.rbx-current,.rbx-highlight') + '{border-color:' + c.borderEmphasis + '!important}') +
        V(c.danger, R('.text-error,.error,.rbx-text-error,.alert-error') + '{color:' + c.danger + '!important}') +
        V(c.success, R('.text-success,.success,.rbx-text-success,.alert-success') + '{color:' + c.success + '!important}') +
        V(c.warning, R('.text-warning,.warning,.rbx-text-warning') + '{color:' + c.warning + '!important}');

        style.textContent = css;
    }

    function removeThemeCSS() {
        if (styleElement) {
            styleElement.textContent = '';
        }
        var el = document.getElementById(STYLE_ID);
        if (el) el.textContent = '';
        var nv = document.getElementById(NATIVE_STYLE_ID);
        if (nv) nv.textContent = '';
    }

    function injectNativeVars(colors, scopeClass) {
        var nv = document.getElementById(NATIVE_STYLE_ID);
        if (!nv && document.head) {
            nv = document.createElement('style');
            nv.id = NATIVE_STYLE_ID;
            document.head.appendChild(nv);        }

        var css = '';
        css += '.' + scopeClass + ',' + '.' + scopeClass + ' * {';
        var keys = Object.keys(NATIVE_VAR_MAP);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (colors[key] !== undefined && colors[key] !== null) {
                var targets = NATIVE_VAR_MAP[key];
                for (var j = 0; j < targets.length; j++) {
                    css += targets[j] + ':' + colors[key] + '!important;';
                }
            }
        }
        css += '}';
        nv.textContent = css;
    }

    function resolveColors(colors) {
        if (!colors) return colors;
        var isLight = document.body && document.body.classList.contains('light-theme');
        var resolved = {};
        var keys = Object.keys(colors);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key.slice(-4) === 'Dark' || key.slice(-6) === 'Light') {
                var baseKey = key.replace(/(Dark|Light)$/, '');
                var isDarkKey = key.slice(-4) === 'Dark';
                if ((isLight && !isDarkKey) || (!isLight && isDarkKey)) {
                    resolved[baseKey] = colors[key];
                } else if (!(baseKey in resolved)) {
                    resolved[baseKey] = colors[key];
                }
            } else {
                resolved[key] = colors[key];
            }
        }
        return resolved;
    }

    function applyLivePreview(colors) {
        if (document.body) {
            document.body.classList.add('purpura-theme-custom');
        }
        var resolved = resolveColors(colors);
        injectNativeVars(resolved, 'purpura-theme-custom');
        injectThemeCSS(resolved);
    }

    function applyPresetTheme(presetKey) {
        removeThemeCSS();
        var colors = getPresetColors(presetKey);
        if (colors) {
            var scope = 'purpura-theme-' + presetKey;
            injectNativeVars(colors, scope);
            injectThemeCSS(colors);
        }
    }

    function applyCustomTheme(colors) {
        removeThemeCSS();
        if (colors && Object.keys(colors).length > 0) {
            var resolved = resolveColors(colors);
            injectNativeVars(resolved, 'purpura-theme-custom');
            injectThemeCSS(resolved);
        }
    }

    function apply() {
        if (!document.body) return;

        if (!enabled || selectedPreset === 'none') {
            removeAllThemeClasses();
            removeThemeCSS();
            return;
        }

        removeAllThemeClasses();

        if (selectedPreset === 'custom') {
            document.body.classList.add('purpura-theme-custom');
            document.body.classList.add('dark-theme');
            applyCustomTheme(customColors);
        } else if (presetData && presetData[selectedPreset]) {
            var base = getPresetBase(selectedPreset);
            document.body.classList.add('purpura-theme-' + selectedPreset);
            if (base) document.body.classList.add(base);
            applyPresetTheme(selectedPreset);
        }
    }

    function initialize() {
        fetchPresetData().then(function (data) {
            presetData = data;
            loadConfig();
            apply();
            startObserver();
        });

        if (window.__PurpuraSettings && window.__PurpuraSettings.ready) {
            window.__PurpuraSettings.ready.then(function () {
                loadConfig();
                if (presetData) {
                    apply();
                    startObserver();
                }
            });
        }

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (areaName !== 'local') return;
            if (!changes[STORAGE_KEY] && !changes[MASTER_TOGGLE_KEY]) return;
            loadConfig();
            apply();
        });
    }

    function startObserver() {
        if (observer) return;
        if (!document.head) return;
        observer = new MutationObserver(function (mutations) {
            var el = document.getElementById(STYLE_ID);
            var nvEl = document.getElementById(NATIVE_STYLE_ID);
            if (!el && !nvEl && enabled && selectedPreset !== 'none') {
                styleElement = null;
                apply();
                return;
            }
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                if (!added) continue;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType === 1 && (node.tagName === 'STYLE' || node.tagName === 'LINK') && node.id !== STYLE_ID && node.id !== NATIVE_STYLE_ID) {
                        if (enabled && selectedPreset !== 'none') apply();
                        return;
                    }
                }
            }
        });
        observer.observe(document.head, { childList: true });
    }

    function setTheme(presetKey) {
        selectedPreset = presetKey;
        var isEquipping = presetKey !== 'none';
        if (isEquipping) {
            enabled = true;
            window.__PurpuraSettings.set(MASTER_TOGGLE_KEY, true);
        }
        var update = window.__PurpuraSettings.get(STORAGE_KEY) || {};
        if (typeof update !== 'object') update = {};
        update.selected = presetKey;
        update.enabled = isEquipping;
        window.__PurpuraSettings.set(STORAGE_KEY, update);
        if (presetData) apply();
    }

    function setCustomColors(colors) {
        customColors = colors;
        var update = window.__PurpuraSettings.get(STORAGE_KEY) || {};
        if (typeof update !== 'object') update = {};
        update.customColors = colors;
        if (selectedPreset === 'custom') {
            applyCustomTheme(colors);
        }
        window.__PurpuraSettings.set(STORAGE_KEY, update);
    }

    function saveCustomTheme(name, description, author, colors) {
        var theme = {
            name: name,
            description: description || '',
            author: author || 'Unknown',
            colors: colors,
            createdAt: Date.now()
        };
        customThemes.push(theme);
        var update = window.__PurpuraSettings.get(STORAGE_KEY) || {};
        if (typeof update !== 'object') update = {};
        update.customThemes = customThemes;
        window.__PurpuraSettings.set(STORAGE_KEY, update);
        return theme;
    }

    function deleteCustomTheme(index) {
        if (index >= 0 && index < customThemes.length) {
            customThemes.splice(index, 1);
            var update = window.__PurpuraSettings.get(STORAGE_KEY) || {};
            if (typeof update !== 'object') update = {};
            update.customThemes = customThemes;
            window.__PurpuraSettings.set(STORAGE_KEY, update);
        }
    }

    function exportTheme(name, description, author, colors) {
        var theme = {
            version: 1,
            type: 'purpuraTheme',
            name: name,
            description: description || '',
            author: author || 'Unknown',
            colors: colors
        };
        var blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var safeName = name.replace(/[^a-z0-9_-]/gi, '_').substring(0, 50) || 'theme';
        a.href = url;
        a.download = safeName + '.purpuraTheme';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importTheme(jsonString) {
        try {
            var data = JSON.parse(jsonString);
            if (data.type !== 'purpuraTheme' || !data.colors || !data.name) {
                throw new Error('Invalid .purpuraTheme file');
            }
            return {
                name: data.name,
                description: data.description || '',
                author: data.author || 'Unknown',
                colors: data.colors,
                version: data.version || 1
            };
        } catch (e) {
            throw new Error('Failed to parse .purpuraTheme file: ' + e.message);
        }
    }

    function getState() {
        return {
            enabled: enabled,
            selected: selectedPreset,
            customColors: customColors,
            customThemes: customThemes,
            presetData: presetData
        };
    }

    window.PurpuraThemeEngine = {
        setTheme: setTheme,
        setCustomColors: setCustomColors,
        applyLivePreview: applyLivePreview,
        saveCustomTheme: saveCustomTheme,
        deleteCustomTheme: deleteCustomTheme,
        exportTheme: exportTheme,
        importTheme: importTheme,
        getState: getState,
        getPresetColors: getPresetColors,
        apply: apply
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
