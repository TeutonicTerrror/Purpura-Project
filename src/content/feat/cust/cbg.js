/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.purpuraCustomBackdropInitialized) return;
    window.purpuraCustomBackdropInitialized = true;

    const STORAGE_KEY = 'cbg';
    const LAYER_ID = 'purpura-backdrop-layer';
    const STYLE_ID = 'purpura-backdrop-style';
    const ACTIVE_CLASS = 'purpura-backdrop-active';

    const FIT_VALUES = ['cover', 'contain', 'stretch', 'tile'];
    const FIT_CSS = {
        cover: { size: 'cover', repeat: 'no-repeat' },
        contain: { size: 'contain', repeat: 'no-repeat' },
        stretch: { size: '100% 100%', repeat: 'no-repeat' },
        tile: { size: 'auto', repeat: 'repeat' }
    };

    const DEFAULT_CONFIG = {
        enabled: false,
        image: '',
        fit: 'cover',
        opacity: 100,
        blur: 0,
        dim: 0
    };

    const UNSAFE_IMAGE_CHARS = /[\\"'()<>\s]/;

    let activeConfig = null;
    let observer = null;

    function isUsableImage(value) {
        if (typeof value !== 'string') return false;
        const image = value.trim();
        if (!image || UNSAFE_IMAGE_CHARS.test(image)) return false;
        return /^https:\/\//i.test(image) || /^data:image\//i.test(image);
    }

    function clampNumber(value, min, max, fallback, round) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        const clamped = Math.max(min, Math.min(max, number));
        return round ? Math.round(clamped) : clamped;
    }

    function sanitizeConfig(value) {
        const config = value && typeof value === 'object' ? value : {};
        return {
            enabled: config.enabled === true,
            image: isUsableImage(config.image) ? config.image.trim() : '',
            fit: FIT_VALUES.indexOf(config.fit) === -1 ? DEFAULT_CONFIG.fit : config.fit,
            opacity: clampNumber(config.opacity, 0, 100, DEFAULT_CONFIG.opacity, true),
            blur: clampNumber(config.blur, 0, 20, DEFAULT_CONFIG.blur, true),
            dim: clampNumber(config.dim, 0, 100, DEFAULT_CONFIG.dim, true)
        };
    }

    function buildCss(config) {
        const fit = FIT_CSS[config.fit] || FIT_CSS.cover;
        const dim = config.dim > 0
            ? 'linear-gradient(rgba(0,0,0,' + (config.dim / 100) + '), rgba(0,0,0,' + (config.dim / 100) + ')), '
            : '';

        return (
            '#' + LAYER_ID + ' {\n' +
            '    position: fixed;\n' +
            '    inset: 0;\n' +
            '    z-index: 0;\n' +
            '    pointer-events: none;\n' +
            '    user-select: none;\n' +
            '    background-image: ' + dim + 'url("' + config.image + '");\n' +
            '    background-position: center center;\n' +
            '    background-repeat: ' + fit.repeat + ';\n' +
            '    background-size: ' + fit.size + ';\n' +
            '    background-attachment: fixed;\n' +
            '    opacity: ' + (config.opacity / 100) + ';\n' +
            '    filter: blur(' + config.blur + 'px);\n' +
            '}\n' +
            'html.' + ACTIVE_CLASS + ',\n' +
            'html.' + ACTIVE_CLASS + ' body {\n' +
            '    background-color: transparent !important;\n' +
            '    background-image: none !important;\n' +
            '}\n' +
            'html.' + ACTIVE_CLASS + ' main.container-main,\n' +
            'html.' + ACTIVE_CLASS + ' #container-main,\n' +
            'html.' + ACTIVE_CLASS + ' #content.content,\n' +
            'html.' + ACTIVE_CLASS + ' .content#content {\n' +
            '    position: relative;\n' +
            '    z-index: 1;\n' +
            '    background-color: transparent !important;\n' +
            '    background-image: none !important;\n' +
            '}\n'
        );
    }

    function removeBackdrop() {
        activeConfig = null;
        stopObserver();
        document.documentElement.classList.remove(ACTIVE_CLASS);
        if (document.body) document.body.classList.remove(ACTIVE_CLASS);

        const layer = document.getElementById(LAYER_ID);
        if (layer) layer.remove();
        const style = document.getElementById(STYLE_ID);
        if (style) style.remove();
    }

    function ensureLayer() {
        const root = document.body;
        if (!root) return null;

        let layer = document.getElementById(LAYER_ID);
        if (layer && layer.parentElement !== root) {
            layer.remove();
            layer = null;
        }
        if (!layer) {
            layer = document.createElement('div');
            layer.id = LAYER_ID;
            layer.setAttribute('aria-hidden', 'true');
        }
        if (root.firstChild !== layer) {
            root.insertBefore(layer, root.firstChild);
        }
        return layer;
    }

    function applyBackdrop(value) {
        const config = sanitizeConfig(value);

        if (!config.enabled || !config.image) {
            removeBackdrop();
            return;
        }

        activeConfig = config;
        document.documentElement.classList.add(ACTIVE_CLASS);
        if (document.body) document.body.classList.add(ACTIVE_CLASS);

        ensureLayer();

        const existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = buildCss(config);
        (document.head || document.documentElement).appendChild(style);

        startObserver();
    }

    function onDomChange() {
        if (!activeConfig) return;
        if (document.getElementById(LAYER_ID)) return;
        ensureLayer();
    }

    function startObserver() {
        if (observer || !document.documentElement) return;
        observer = new MutationObserver(onDomChange);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
    }

    function refresh() {
        applyBackdrop(window.__PurpuraSettings.getRaw(STORAGE_KEY));
    }

    function init() {
        window.__PurpuraSettings.ready.then(refresh).catch(() => {});
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
