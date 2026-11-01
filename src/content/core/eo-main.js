/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__PURPURA_EO_MAIN__) return;
    window.__PURPURA_EO_MAIN__ = true;
    if (window.location.pathname.toLowerCase().indexOf('/my/avatar') === -1) return;

    var SUBCATEGORY_ATTR = 'data-purpura-eo-subcategory';
    var setWornAssets = null, setAvatarType = null, setScales = null, scalesState = null, setBodyColors = null, setCardsLoading = null;
    var lastSubcategory;

    function onDefined(target, key) {
        return new Promise(function (resolve) {
            if (target[key] !== undefined) return resolve(target[key]);
            var previousSetter = (Object.getOwnPropertyDescriptor(target, key) || {}).set;
            Object.defineProperty(target, key, {
                enumerable: false,
                configurable: true,
                set: function (value) {
                    if (previousSetter) { try { previousSetter(value); } catch (_) {} }
                    delete target[key];
                    target[key] = value;
                    resolve(value);
                }
            });
        });
    }

    function publishSubcategory(state) {
        var name = state && state.selectedSubcategory && state.selectedSubcategory.name;
        if (name === lastSubcategory) return;
        lastSubcategory = name;
        try { document.documentElement.setAttribute(SUBCATEGORY_ATTR, name || ''); } catch (_) {}
        document.dispatchEvent(new CustomEvent('purpura:eo:subcategory', { detail: name || '' }));
    }

    function captureContextSetters(value) {
        if (!value || typeof value !== 'object') return;
        if (typeof value.setCurrentlyWornAssets === 'function') setWornAssets = value.setCurrentlyWornAssets;
        if (typeof value.setAvatarType === 'function') setAvatarType = value.setAvatarType;
        if (typeof value.setAvatarCallLimiterItemCardsDisabled === 'function') setCardsLoading = value.setAvatarCallLimiterItemCardsDisabled;
    }

    onDefined(window, 'React').then(function (React) {
        var originalUseState = React.useState;
        React.useState = function () {
            var result = originalUseState.apply(this, arguments);
            var initial = arguments[0];
            if (initial && typeof initial === 'object') {
                try {
                    if (initial.head !== undefined && initial.head && initial.head.value !== undefined) {
                        scalesState = result[0];
                        setScales = result[1];
                    }
                    if (initial.headColorId !== undefined) setBodyColors = result[1];
                    if ('selectedTab' in initial) publishSubcategory(result[0]);
                } catch (_) {}
            }
            return result;
        };

        var originalUseContext = React.useContext;
        React.useContext = function () {
            var value = originalUseContext.apply(this, arguments);
            try { captureContextSetters(value); } catch (_) {}
            return value;
        };

        var originalCreateElement = React.createElement;
        React.createElement = function () {
            var element = originalCreateElement.apply(this, arguments);
            try {
                var props = arguments[1];
                if (props && typeof props === 'object' && props.value && typeof props.value === 'object') {
                    captureContextSetters(props.value);
                }
            } catch (_) {}
            return element;
        };
    });

    function toBodyColorIds(bodyColor3s) {
        var out = {};
        Object.keys(bodyColor3s || {}).forEach(function (key) {
            out[key.replace('3', 'Id')] = bodyColor3s[key];
        });
        return out;
    }

    function applyScales(scales) {
        if (!scalesState || !setScales || !scales) return;
        var next = Object.assign({}, scalesState);
        Object.keys(scales).forEach(function (key) {
            if (next[key]) next[key] = Object.assign({}, next[key], { value: scales[key] * 100 });
        });
        setScales(next);
    }

    document.addEventListener('purpura:eo:avatar-changed', function (event) {
        var data;
        try { data = JSON.parse(event.detail); } catch (_) { return; }
        if (!data) return;
        var applied = false;
        try { if (setAvatarType && data.playerAvatarType) { setAvatarType(data.playerAvatarType); applied = true; } } catch (_) {}
        try { if (setWornAssets && data.assets) { setWornAssets(data.assets); applied = true; } } catch (_) {}
        try { applyScales(data.scales); } catch (_) {}
        try { if (setBodyColors && data.bodyColor3s) setBodyColors(toBodyColorIds(data.bodyColor3s)); } catch (_) {}
        document.dispatchEvent(new CustomEvent('purpura:eo:avatar-applied', { detail: applied }));
    });

    document.addEventListener('purpura:eo:cards-loading', function (event) {
        try { if (setCardsLoading) setCardsLoading(!!event.detail); } catch (_) {}
    });
})();
