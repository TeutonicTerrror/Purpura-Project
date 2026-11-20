/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraServerRegionsMapInitialized) return;
    window.purpuraServerRegionsMapInitialized = true;

    const STORAGE_KEY = 'srm';
    const BUTTON_ID = 'purpura-server-regions-map-button';
    const TRIGGER_BAR_CLASS = 'purpura-server-regions-map-trigger-bar';
    const PANEL_ID = 'purpura-server-regions-map-panel';
    const STYLE_ID = 'purpura-server-regions-map-style';
    const REGION_DATA_PATH = 'data/ServerList.json';
    const WORLD_DATA_PATH = 'data/world-land.geojson';
    const API_ORIGIN = 'https://api.purpura.page';
    const DETAIL_BATCH_SIZE = 100;
    const PROBE_CHUNK = 30;
    const CACHE_TTL_MS = 5 * 60 * 1000;
    const LOCATION_CACHE_KEY = 'purpuraServerRegionCache';
    const LOCATION_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
    const LOCATION_CACHE_MAX = 5000;
    const TEXTURE_WIDTH = 1024;
    const TEXTURE_HEIGHT = 512;
    const MIN_CANVAS_SIZE = 280;
    const MAX_CANVAS_SIZE = 520;
    const MOUNT_DELAY_MS = 220;
    const FRAME_MS = 1000 / 60;
    const ROTATION_PER_MS = 0.0011 / 33;
    const TWO_PI = Math.PI * 2;

    const state = {
        enabled: false,
        panelOpen: false,
        panel: null,
        canvas: null,
        imageData: null,
        resizeObserver: null,
        worldTexture: null,
        worldGeo: null,
        worldTheme: null,
        worldPromise: null,
        themeColors: null,
        themeObserver: null,
        themeMedia: null,
        pixelMap: null,
        catalogPromise: null,
        catalogByKey: new Map(),
        catalogByDataCenterId: new Map(),
        dynamicByKey: new Map(),
        totalServers: 0,
        unknown: 0,
        fullServers: 0,
        dataState: 'idle',
        error: '',
        statusText: '',
        statusKind: '',
        selectedKey: null,
        hoverKey: null,
        projected: [],
        rotation: (-new Date().getTimezoneOffset() / 4) * Math.PI / 180,
        pitch: 0,
        dragging: false,
        dragLastX: 0,
        dragLastY: 0,
        dragDistance: 0,
        resumeAt: 0,
        animationFrame: 0,
        lastFrame: 0,
        lastTick: 0,
        forceRender: false,
        scanToken: 0,
        scanPlaceId: null,
        cache: new Map(),
        locationCache: new Map(),
        locationCachePromise: null,
        locationCacheSaveTimer: 0,
        mountTimer: 0,
        observer: null
    };

    function getPlaceId() {
        const match = window.location.pathname.match(/\/games\/(\d+)/i);
        return match ? match[1] : null;
    }

    function colorLuminance(value) {
        const text = String(value || '').trim();
        const rgb = text.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
        if (rgb) return (Number(rgb[1]) + Number(rgb[2]) + Number(rgb[3])) / 3;
        const hex = text.match(/^#?([0-9a-f]{6})$/i);
        if (hex) {
            const number = parseInt(hex[1], 16);
            return (((number >> 16) & 255) + ((number >> 8) & 255) + (number & 255)) / 3;
        }
        return null;
    }

    function isDarkTheme() {
        const root = document.documentElement;
        const body = document.body;
        const bodyTheme = body && body.getAttribute('data-theme');
        if (root.classList.contains('dark-theme') || root.getAttribute('data-theme') === 'dark' ||
            bodyTheme === 'dark' || (body && body.classList.contains('dark-theme'))) return true;
        if (root.classList.contains('light-theme') || root.getAttribute('data-theme') === 'light' ||
            bodyTheme === 'light' || (body && body.classList.contains('light-theme'))) return false;

        const surface = (body ? getComputedStyle(body).getPropertyValue('--color-surface-100').trim() : '') ||
            getComputedStyle(root).getPropertyValue('--color-surface-100').trim();
        const surfaceLuminance = colorLuminance(surface);
        if (surfaceLuminance !== null) return surfaceLuminance < 128;

        const background = body ? getComputedStyle(body).backgroundColor : '';
        const backgroundLuminance = colorLuminance(background);
        if (backgroundLuminance !== null) return backgroundLuminance < 128;

        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function parseCssColor(value) {
        const text = String(value || '').trim();
        if (!text) return null;
        if (text === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

        const rgb = text.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,\/]\s*([\d.]+%?))?\s*\)$/i);
        if (rgb) {
            const alphaText = rgb[4];
            const alpha = alphaText === undefined ? 1 :
                (alphaText.slice(-1) === '%' ? Number(alphaText.slice(0, -1)) / 100 : Number(alphaText));
            return {
                r: Math.max(0, Math.min(255, Number(rgb[1]))),
                g: Math.max(0, Math.min(255, Number(rgb[2]))),
                b: Math.max(0, Math.min(255, Number(rgb[3]))),
                a: Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1
            };
        }

        const hex = text.match(/^#([0-9a-f]{3,8})$/i);
        if (hex) {
            let digits = hex[1];
            if (digits.length === 3 || digits.length === 4) {
                digits = digits.split('').map((digit) => digit + digit).join('');
            }
            if (digits.length === 6 || digits.length === 8) {
                return {
                    r: parseInt(digits.slice(0, 2), 16),
                    g: parseInt(digits.slice(2, 4), 16),
                    b: parseInt(digits.slice(4, 6), 16),
                    a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1
                };
            }
        }

        return null;
    }

    function mixCssColor(first, second, amount) {
        const from = (typeof first === 'string' ? parseCssColor(first) : first) ||
            { r: 0, g: 0, b: 0, a: 1 };
        const to = (typeof second === 'string' ? parseCssColor(second) : second) ||
            { r: 0, g: 0, b: 0, a: 1 };
        const t = Math.max(0, Math.min(1, amount));
        return {
            r: from.r + (to.r - from.r) * t,
            g: from.g + (to.g - from.g) * t,
            b: from.b + (to.b - from.b) * t,
            a: from.a + (to.a - from.a) * t
        };
    }

    function cssColor(color) {
        return 'rgb(' + Math.round(color.r) + ', ' + Math.round(color.g) + ', ' + Math.round(color.b) + ')';
    }

    function cssRgba(color, alpha) {
        return 'rgba(' + Math.round(color.r) + ', ' + Math.round(color.g) + ', ' +
            Math.round(color.b) + ', ' + Math.max(0, Math.min(1, alpha)) + ')';
    }

    function readPlayButtonAppearance() {
        const button = document.querySelector(
            '#game-details-play-button-container button[data-testid="play-button"], ' +
            'button[data-testid="play-button"], .game-play-button, .btn-play'
        );
        if (!button) return null;

        const style = getComputedStyle(button);
        const imageColor = String(style.backgroundImage || '').match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/i);
        const background = parseCssColor(style.backgroundColor) ||
            (imageColor ? parseCssColor(imageColor[0]) : null);
        if (!background || background.a < 0.05) return null;

        return {
            background: background,
            color: parseCssColor(style.color)
        };
    }

    function themeColors(force) {
        if (!force && state.themeColors) return state.themeColors;

        const probe = state.panel || document.body || document.documentElement;
        const style = getComputedStyle(probe);
        const readValue = (name) => style.getPropertyValue(name).trim();
        const readColor = (name, fallback) => parseCssColor(readValue(name)) || parseCssColor(fallback) ||
            { r: 0, g: 0, b: 0, a: 1 };
        const dark = isDarkTheme();
        const surface = readColor('--color-surface-100', dark ? '#10141b' : '#ffffff');
        const surface2 = readColor('--color-surface-200', dark ? '#1a1f27' : '#f2f4f7');
        const content = readColor('--color-content-default', dark ? '#f3f6fb' : '#18212c');
        const mutedContent = readColor('--color-content-muted', dark ? '#9aa6b6' : '#6b7280');
        const playAppearance = readPlayButtonAppearance();
        const accentRaw = readValue('--purpura-playButton') ||
            readValue('--color-action-primary-background') ||
            readValue('--color-action-emphasis-background') ||
            readValue('--color-action-emphasis') || '#335fff';
        const accent = (playAppearance && playAppearance.background) ||
            parseCssColor(accentRaw) || parseCssColor('#335fff');
        const accentLuminance = (accent.r + accent.g + accent.b) / 3;
        const accentText = (playAppearance && playAppearance.color) ||
            parseCssColor(readValue('--color-content-on-emphasis')) ||
            parseCssColor(readValue('--color-content-inverse')) ||
            (accentLuminance > 160 ? { r: 17, g: 19, b: 21, a: 1 } : { r: 255, g: 255, b: 255, a: 1 });
        const ocean = mixCssColor(surface, content, dark ? 0.08 : 0.06);
        const land = mixCssColor(surface2, content, dark ? 0.30 : 0.16);
        const oceanDeep = mixCssColor(ocean, { r: 0, g: 0, b: 0, a: 1 }, dark ? 0.55 : 0.14);

        const palette = {
            key: [dark ? 'dark' : 'light', cssColor(ocean), cssColor(land), cssColor(content)].join('|'),
            dark: dark,
            colorScheme: dark ? 'dark' : 'light',
            ocean: cssColor(ocean),
            oceanDeep: cssColor(oceanDeep),
            land: cssColor(land),
            landStroke: cssRgba(content, dark ? 0.18 : 0.16),
            grid: cssRgba(content, dark ? 0.10 : 0.10),
            accent: cssColor(accent),
            accentText: cssColor(accentText),
            labelBg: cssRgba(surface, 0.94),
            labelText: cssColor(content),
            labelBorder: cssRgba(content, dark ? 0.24 : 0.16),
            muted: cssRgba(mutedContent, 0.50),
            edge: cssRgba(content, dark ? 0.24 : 0.22),
            selectedFill: cssColor(content),
            markerStroke: cssRgba(content, 0.50),
            markerStrokeSelected: cssRgba(content, 0.95),
            markerRing: cssRgba(content, dark ? 0.92 : 0.85),
            highlight: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.30)',
            shadowSoft: 'rgba(0, 0, 0, 0.01)',
            shadow: dark ? 'rgba(0, 0, 0, 0.62)' : 'rgba(0, 0, 0, 0.18)'
        };
        state.themeColors = palette;
        if (state.panel) {
            state.panel.style.setProperty('--srm-accent', palette.accent);
            state.panel.style.setProperty('--srm-accent-text', palette.accentText);
        }
        return palette;
    }

    function invalidateTheme() {
        state.themeColors = null;
        state.forceRender = true;
    }

    function watchTheme() {
        if (!state.themeObserver) {
            state.themeObserver = new MutationObserver(invalidateTheme);
            state.themeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
            if (state.themeMedia && state.themeMedia.addEventListener) {
                state.themeMedia.addEventListener('change', invalidateTheme);
            }
        }
        const options = { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] };
        state.themeObserver.observe(document.documentElement, options);
        if (document.body) state.themeObserver.observe(document.body, options);
    }

    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function normalizeLocation(location) {
        if (!location || typeof location !== 'object') return null;

        const latLong = location.latLong || location.latlong;
        let lat = null;
        let lon = null;

        if (Array.isArray(latLong) && latLong.length >= 2) {
            lat = Number(latLong[0]);
            lon = Number(latLong[1]);
        } else if (latLong && typeof latLong === 'object') {
            lat = Number(latLong.lat !== undefined ? latLong.lat : latLong.latitude);
            lon = Number(latLong.lon !== undefined ? latLong.lon : (latLong.lng !== undefined ? latLong.lng : latLong.longitude));
        }

        if (!Number.isFinite(lat)) lat = Number(location.latitude !== undefined ? location.latitude : location.lat);
        if (!Number.isFinite(lon)) lon = Number(location.longitude !== undefined ? location.longitude : (location.lon !== undefined ? location.lon : location.lng));

        return {
            country: typeof location.country === 'string' ? location.country : '',
            region: typeof location.region === 'string' ? location.region : '',
            city: typeof location.city === 'string' ? location.city : '',
            countryName: typeof location.country_name === 'string' ? location.country_name : '',
            lat: Number.isFinite(lat) ? lat : null,
            lon: Number.isFinite(lon) ? lon : null
        };
    }

    function locationKey(location) {
        if (!location) return '';
        return [location.country, location.region, location.city].filter(Boolean).join('|');
    }

    function locationLabel(location) {
        if (!location) return '';
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.country === 'US' && location.region) parts.push(location.region);
        if (location.countryName) parts.push(location.countryName);
        else if (location.country) parts.push(location.country);
        return parts.join(', ');
    }

    function labelForLocation(location) {
        const norm = normalizeLocation(location);
        if (!norm) return '';
        return locationLabel(norm) || locationKey(norm);
    }

    function angleDistance(latA, lonA, latB, lonB) {
        const latDelta = latA - latB;
        const lonDelta = Math.abs(((lonA - lonB + 540) % 360) - 180);
        return Math.hypot(latDelta, lonDelta * Math.cos((latA + latB) * Math.PI / 360));
    }

    function normalizeRotation(value) {
        return ((value + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
    }

    function normalizePitch(value) {
        return Math.max(-1.45, Math.min(1.45, value));
    }

    function project(lat, lon, radius, centerX, centerY) {
        const latRad = lat * Math.PI / 180;
        const delta = lon * Math.PI / 180 - state.rotation;
        const cosLat = Math.cos(latRad);
        const yUp = Math.sin(latRad);
        const z = cosLat * Math.cos(delta);
        const cosPitch = Math.cos(state.pitch);
        const sinPitch = Math.sin(state.pitch);
        const yRotated = yUp * cosPitch - z * sinPitch;
        const zRotated = yUp * sinPitch + z * cosPitch;
        return {
            x: centerX + cosLat * Math.sin(delta) * radius,
            y: centerY - yRotated * radius,
            z: zRotated
        };
    }

    function shortLabel(region) {
        const first = String(region.label || '').split(',')[0].trim();
        return first || region.key;
    }

    function allRegions() {
        return Array.from(state.catalogByKey.values()).concat(Array.from(state.dynamicByKey.values()));
    }

    function findRegion(key) {
        return state.catalogByKey.get(key) || state.dynamicByKey.get(key) || null;
    }

    function resetRegionCounts() {
        state.catalogByKey.forEach((region) => {
            region.count = 0;
            region.servers = [];
        });
        state.dynamicByKey.clear();
        state.totalServers = 0;
        state.unknown = 0;
        state.fullServers = 0;
    }

    function regionForLocation(location, dataCenterId) {
        if (dataCenterId !== undefined && dataCenterId !== null && dataCenterId !== '') {
            const exact = state.catalogByDataCenterId.get(String(dataCenterId));
            if (exact) return exact;
        }
        const norm = normalizeLocation(location);
        if (!norm) return null;

        const key = locationKey(norm);
        if (key && state.catalogByKey.has(key)) return state.catalogByKey.get(key);

        if (Number.isFinite(norm.lat) && Number.isFinite(norm.lon)) {
            let nearest = null;
            let nearestDistance = Infinity;
            state.catalogByKey.forEach((region) => {
                const distance = angleDistance(norm.lat, norm.lon, region.lat, region.lon);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = region;
                }
            });

            if (nearest && nearestDistance <= 2.2) return nearest;

            const dynamicKey = 'loc:' + norm.lat.toFixed(2) + ',' + norm.lon.toFixed(2);
            let dynamic = state.dynamicByKey.get(dynamicKey);
            if (!dynamic) {
                dynamic = {
                    key: dynamicKey,
                    label: locationLabel(norm) || dynamicKey,
                    lat: norm.lat,
                    lon: norm.lon,
                    count: 0,
                    servers: []
                };
                state.dynamicByKey.set(dynamicKey, dynamic);
            }
            return dynamic;
        }

        return null;
    }

    async function loadCatalog() {
        if (state.catalogPromise) return state.catalogPromise;

        state.catalogPromise = (async () => {
            try {
                const response = await fetch(chrome.runtime.getURL(REGION_DATA_PATH));
                if (!response.ok) return;
                const list = await response.json();
                if (!Array.isArray(list)) return;

                list.forEach((entry) => {
                    if (!entry || entry.inactive === true) return;
                    const norm = normalizeLocation(entry.location);
                    if (!norm || !Number.isFinite(norm.lat) || !Number.isFinite(norm.lon)) return;

                    const key = locationKey(norm) || ('loc:' + norm.lat.toFixed(2) + ',' + norm.lon.toFixed(2));
                    const existing = state.catalogByKey.get(key);
                    if (existing) {
                        if (Array.isArray(entry.dataCenterIds)) {
                            entry.dataCenterIds.forEach((dataCenterId) => {
                                if (dataCenterId && existing.dataCenterIds.indexOf(dataCenterId) === -1) {
                                    existing.dataCenterIds.push(dataCenterId);
                                }
                                if (dataCenterId) state.catalogByDataCenterId.set(String(dataCenterId), existing);
                            });
                        }
                        return;
                    }

                    const region = {
                        key: key,
                        label: locationLabel(norm) || key,
                        lat: norm.lat,
                        lon: norm.lon,
                        count: 0,
                        servers: [],
                        dataCenterIds: Array.isArray(entry.dataCenterIds) ? entry.dataCenterIds.slice() : []
                    };
                    state.catalogByKey.set(key, region);
                    region.dataCenterIds.forEach((dataCenterId) => {
                        if (dataCenterId) state.catalogByDataCenterId.set(String(dataCenterId), region);
                    });
                });
            } catch (_) { }
        })();

        return state.catalogPromise;
    }

    function loadLocationCache() {
        if (state.locationCachePromise) return state.locationCachePromise;
        state.locationCachePromise = new Promise((resolve) => {
            try {
                chrome.storage.local.get(LOCATION_CACHE_KEY, (data) => {
                    const raw = data && data[LOCATION_CACHE_KEY];
                    const now = Date.now();
                    if (raw && typeof raw === 'object') {
                        Object.keys(raw).forEach((serverId) => {
                            const entry = raw[serverId];
                            if (!entry || !entry.location || !Number.isFinite(entry.at)) return;
                            if (now - entry.at > LOCATION_CACHE_MAX_AGE_MS) return;
                            state.locationCache.set(serverId, entry);
                        });
                    }
                    resolve();
                });
            } catch (_) {
                resolve();
            }
        });
        return state.locationCachePromise;
    }

    function scheduleLocationCacheSave() {
        if (state.locationCacheSaveTimer) return;
        state.locationCacheSaveTimer = setTimeout(() => {
            state.locationCacheSaveTimer = 0;
            persistLocationCache();
        }, 1200);
    }

    function persistLocationCache() {
        const now = Date.now();
        const entries = Array.from(state.locationCache.entries())
            .filter((entry) => entry[1] && entry[1].location && now - entry[1].at <= LOCATION_CACHE_MAX_AGE_MS)
            .sort((a, b) => b[1].at - a[1].at)
            .slice(0, LOCATION_CACHE_MAX);
        const raw = {};
        entries.forEach(([serverId, entry]) => { raw[serverId] = entry; });
        try {
            chrome.storage.local.set({ [LOCATION_CACHE_KEY]: raw });
        } catch (_) { }
    }

    function traceRing(context, ring) {
        if (!Array.isArray(ring) || ring.length < 3) return;

        let started = false;
        for (let index = 0; index < ring.length; index += 1) {
            const point = ring[index];
            if (!Array.isArray(point) || point.length < 2) continue;
            const lon = Number(point[0]);
            const lat = Number(point[1]);
            if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

            const x = (lon + 180) / 360 * TEXTURE_WIDTH;
            const y = (90 - lat) / 180 * TEXTURE_HEIGHT;
            if (!started) {
                context.moveTo(x, y);
                started = true;
            } else {
                context.lineTo(x, y);
            }
        }

        if (!started) return;
        context.closePath();
    }

    async function loadWorldTexture() {
        if (state.worldPromise) return state.worldPromise;

        state.worldPromise = (async () => {
            try {
                const response = await fetch(chrome.runtime.getURL(WORLD_DATA_PATH));
                if (!response.ok) return;
                const data = await response.json();
                if (!data || !Array.isArray(data.features)) return;
                state.worldGeo = data;
                buildWorldTexture();
            } catch (_) { }
        })();

        return state.worldPromise;
    }

    function buildWorldTexture(colors) {
        if (!state.worldGeo) return;
        const palette = colors || themeColors();
        if (state.worldTexture && state.worldTheme === palette.key) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = TEXTURE_WIDTH;
            canvas.height = TEXTURE_HEIGHT;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) return;

            context.fillStyle = palette.ocean;
            context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
            context.fillStyle = palette.land;
            context.strokeStyle = palette.landStroke;
            context.lineWidth = 1.4;
            context.lineCap = 'round';
            context.lineJoin = 'round';

            context.beginPath();
            state.worldGeo.features.forEach((feature) => {
                const geometry = feature && feature.geometry;
                if (!geometry) return;
                if (geometry.type === 'Polygon') {
                    (geometry.coordinates || []).forEach((ring) => traceRing(context, ring));
                } else if (geometry.type === 'MultiPolygon') {
                    (geometry.coordinates || []).forEach((polygon) => {
                        (polygon || []).forEach((ring) => traceRing(context, ring));
                    });
                }
            });
            context.fill();
            context.stroke();

            context.strokeStyle = palette.grid;
            context.lineWidth = 1.5;
            for (let lon = -180; lon <= 180; lon += 30) {
                const x = (lon + 180) / 360 * TEXTURE_WIDTH;
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, TEXTURE_HEIGHT);
                context.stroke();
            }
            for (let lat = -60; lat <= 60; lat += 30) {
                const y = (90 - lat) / 180 * TEXTURE_HEIGHT;
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(TEXTURE_WIDTH, y);
                context.stroke();
            }

            state.worldTexture = context.getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
            state.worldTheme = palette.key;
        } catch (_) {
            state.worldTexture = null;
            state.worldTheme = palette.key;
        }
    }

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${BUTTON_ID} {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                margin-left: 12px;
                padding: 7px 11px;
                border: 1px solid rgba(155, 109, 255, 0.30);
                border-radius: 8px;
                background: rgba(155, 109, 255, 0.12);
                color: inherit;
                font: 600 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                cursor: pointer;
                vertical-align: middle;
                transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
            }
            #${BUTTON_ID}:hover {
                background: rgba(155, 109, 255, 0.22);
                border-color: rgba(155, 109, 255, 0.55);
                transform: translateY(-1px);
            }
            #${BUTTON_ID}:active { transform: translateY(0); }
            #${BUTTON_ID}:focus-visible {
                outline: 2px solid #a97bff;
                outline-offset: 2px;
            }
            #${BUTTON_ID} svg { width: 15px; height: 15px; flex: 0 0 auto; }
            .${TRIGGER_BAR_CLASS} {
                display: flex;
                justify-content: flex-end;
                width: 100%;
                padding: 0 0 8px;
            }
            #${PANEL_ID} {
                position: fixed;
                inset: 0;
                z-index: 2147483000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color-scheme: dark;
            }
            #${PANEL_ID}[hidden] { display: none; }
            #${PANEL_ID} * { box-sizing: border-box; }
            #${PANEL_ID} .srm-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(5, 4, 12, 0.74);
                backdrop-filter: blur(6px);
            }
            #${PANEL_ID} .srm-dialog {
                position: relative;
                display: flex;
                flex-direction: column;
                width: min(960px, 100%);
                max-height: min(820px, calc(100vh - 40px));
                overflow: hidden;
                border: 1px solid rgba(155, 109, 255, 0.24);
                border-radius: 18px;
                background: linear-gradient(150deg, #15111f 0%, #0b0a12 58%, #090810 100%);
                color: #f2efff;
                box-shadow: 0 30px 100px rgba(0, 0, 0, 0.68), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
                font-family: "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            #${PANEL_ID} .srm-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 20px;
                padding: 20px 22px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            }
            #${PANEL_ID} .srm-kicker {
                display: block;
                margin-bottom: 5px;
                color: #a97bff;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.16em;
            }
            #${PANEL_ID} .srm-title {
                margin: 0;
                color: #f7f3ff;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.03em;
            }
            #${PANEL_ID} .srm-subtitle {
                margin: 6px 0 0;
                color: #9d93b8;
                font-size: 12px;
                line-height: 1.45;
            }
            #${PANEL_ID} .srm-actions { display: flex; align-items: center; gap: 8px; }
            #${PANEL_ID} .srm-icon-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 34px;
                height: 34px;
                padding: 0;
                border: 1px solid rgba(255, 255, 255, 0.10);
                border-radius: 9px;
                background: rgba(255, 255, 255, 0.04);
                color: #d8d2eb;
                cursor: pointer;
                transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
            }
            #${PANEL_ID} .srm-icon-button:hover {
                border-color: rgba(155, 109, 255, 0.45);
                background: rgba(155, 109, 255, 0.14);
                color: #ffffff;
            }
            #${PANEL_ID} .srm-icon-button svg { width: 16px; height: 16px; }
            #${PANEL_ID} .srm-content {
                display: grid;
                grid-template-columns: minmax(0, 1fr) 330px;
                gap: 22px;
                padding: 20px 22px 22px;
                overflow: auto;
                overscroll-behavior: contain;
            }
            #${PANEL_ID} .srm-globe-column { min-width: 0; }
            #${PANEL_ID} .srm-globe-wrap {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                max-width: 560px;
                margin: 0 auto;
                aspect-ratio: 1 / 1;
            }
            #${PANEL_ID} .srm-canvas {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                cursor: grab;
                touch-action: none;
                filter: drop-shadow(0 22px 45px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 28px rgba(155, 109, 255, 0.16));
            }
            #${PANEL_ID} .srm-canvas:active { cursor: grabbing; }
            #${PANEL_ID} .srm-status {
                position: absolute;
                left: 50%;
                bottom: 3px;
                transform: translateX(-50%);
                max-width: calc(100% - 24px);
                padding: 5px 10px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 999px;
                background: rgba(8, 7, 15, 0.86);
                color: #b9afd2;
                font-size: 11px;
                line-height: 1.3;
                text-align: center;
                pointer-events: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            #${PANEL_ID} .srm-status[data-kind="error"] { color: #ff9b9b; border-color: rgba(255, 100, 100, 0.25); }
            #${PANEL_ID} .srm-side {
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-width: 0;
            }
            #${PANEL_ID} .srm-summary {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 8px;
            }
            #${PANEL_ID} .srm-stat {
                padding: 10px 11px;
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.025);
            }
            #${PANEL_ID} .srm-stat b {
                display: block;
                color: #f2edff;
                font-size: 18px;
                line-height: 1.2;
            }
            #${PANEL_ID} .srm-stat span {
                display: block;
                margin-top: 3px;
                color: #8d84a6;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.09em;
                text-transform: uppercase;
            }
            #${PANEL_ID} .srm-section-label {
                color: #8d84a6;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
            }
            #${PANEL_ID} .srm-region-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
                max-height: 310px;
                overflow: auto;
                padding-right: 2px;
            }
            #${PANEL_ID} .srm-region-row {
                display: flex;
                align-items: center;
                gap: 9px;
                width: 100%;
                padding: 9px 10px;
                border: 1px solid rgba(255, 255, 255, 0.065);
                border-radius: 9px;
                background: rgba(255, 255, 255, 0.022);
                color: #dcd5ee;
                font: inherit;
                font-size: 12px;
                text-align: left;
                cursor: pointer;
                transition: background 0.14s ease, border-color 0.14s ease;
            }
            #${PANEL_ID} .srm-region-row:hover {
                background: rgba(155, 109, 255, 0.10);
                border-color: rgba(155, 109, 255, 0.28);
            }
            #${PANEL_ID} .srm-region-row.is-selected {
                background: rgba(155, 109, 255, 0.18);
                border-color: rgba(155, 109, 255, 0.55);
            }
            #${PANEL_ID} .srm-dot {
                width: 7px;
                height: 7px;
                flex: 0 0 auto;
                border-radius: 50%;
                background: #a97bff;
                box-shadow: 0 0 8px rgba(169, 123, 255, 0.65);
            }
            #${PANEL_ID} .srm-region-name {
                min-width: 0;
                flex: 1 1 auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #${PANEL_ID} .srm-region-count {
                flex: 0 0 auto;
                min-width: 22px;
                padding: 2px 7px;
                border-radius: 999px;
                background: rgba(155, 109, 255, 0.18);
                color: #cdb9ff;
                font-size: 10px;
                font-weight: 700;
                text-align: center;
            }
            #${PANEL_ID} .srm-empty {
                padding: 18px 10px;
                color: #8d84a6;
                font-size: 12px;
                line-height: 1.5;
                text-align: center;
            }
            #${PANEL_ID} .srm-server-panel {
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.075);
            }
            #${PANEL_ID} .srm-server-panel[hidden] { display: none; }
            #${PANEL_ID} .srm-server-heading {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 8px;
            }
            #${PANEL_ID} .srm-server-heading strong {
                min-width: 0;
                color: #eee8ff;
                font-size: 13px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #${PANEL_ID} .srm-server-heading span { flex: 0 0 auto; color: #8d84a6; font-size: 10px; }
            #${PANEL_ID} .srm-server-list { display: flex; flex-direction: column; gap: 5px; max-height: 190px; overflow: auto; }
            #${PANEL_ID} .srm-server-row {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 7px 8px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.025);
            }
            #${PANEL_ID} .srm-server-id {
                min-width: 0;
                flex: 1 1 auto;
                color: #cfc7e4;
                font: 600 11px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #${PANEL_ID} .srm-server-players { flex: 0 0 auto; color: #8d84a6; font-size: 10px; }
            #${PANEL_ID} .srm-join {
                flex: 0 0 auto;
                padding: 5px 9px;
                border: 1px solid rgba(155, 109, 255, 0.35);
                border-radius: 6px;
                background: rgba(155, 109, 255, 0.16);
                color: #e8dcff;
                font: 700 10px/1 system-ui, sans-serif;
                cursor: pointer;
            }
            #${PANEL_ID} .srm-join:hover { background: rgba(155, 109, 255, 0.28); }
            #${PANEL_ID} .srm-join:disabled {
                opacity: 0.4;
                cursor: default;
                background: rgba(255, 255, 255, 0.04);
                border-color: rgba(255, 255, 255, 0.08);
            }
            #${PANEL_ID} .srm-more { padding: 5px 2px 0; color: #7f7699; font-size: 10px; text-align: center; }
            @media (max-width: 760px) {
                #${PANEL_ID} { padding: 10px; }
                #${PANEL_ID} .srm-content { grid-template-columns: minmax(0, 1fr); gap: 14px; padding: 16px; }
                #${PANEL_ID} .srm-region-list { max-height: 200px; }
                #${PANEL_ID} .srm-header { padding: 16px; }
                #${PANEL_ID} .srm-title { font-size: 21px; }
            }
            @media (max-width: 520px) {
                #${BUTTON_ID} span { display: none; }
                #${BUTTON_ID} { margin-left: 8px; padding: 7px; }
                #${PANEL_ID} .srm-summary { gap: 5px; }
                #${PANEL_ID} .srm-stat { padding: 8px; }
            }
            #purpura-server-regions-map-button {
                display: inline-flex; align-items: center; gap: 6px;
                min-height: 32px; padding: 0 12px; border-radius: 8px;
                border: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.14))));
                background: var(--color-surface-100, var(--purpura-surface100, #ffffff));
                color: var(--color-content-default, var(--purpura-mainText, #191b1d));
                box-shadow: none; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
            }
            #purpura-server-regions-map-button:hover {
                background: var(--color-state-hover, var(--color-surface-200, var(--purpura-surface200, rgba(0, 0, 0, 0.04))));
                border-color: var(--color-stroke-default, var(--color-border-default, var(--purpura-surface300, rgba(0, 0, 0, 0.22))));
                color: var(--color-content-emphasis, var(--purpura-mainText, #111315));
            }
            #purpura-server-regions-map-button:focus-visible {
                outline: 2px solid var(--color-action-emphasis-background, var(--purpura-playButton, #335fff));
                outline-offset: 2px;
            }
            #purpura-server-regions-map-panel { color-scheme: light dark; }
            #purpura-server-regions-map-panel .srm-backdrop { background: rgba(0, 0, 0, 0.48); }
            #purpura-server-regions-map-panel .srm-dialog {
                border-radius: 10px;
                border: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.12))));
                background: var(--color-surface-100, var(--purpura-surface100, #ffffff));
                color: var(--color-content-default, var(--purpura-mainText, #191b1d));
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
                font-family: inherit;
                color-scheme: light dark;
            }
            #purpura-server-regions-map-panel .srm-header {
                align-items: center; padding: 12px 16px; background: transparent;
                border-bottom: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.10))));
            }
            #purpura-server-regions-map-panel .srm-title {
                color: var(--color-content-emphasis, var(--purpura-mainText, #111315));
                font-family: inherit; font-size: 17px; font-weight: 700; letter-spacing: -0.01em;
            }
            #purpura-server-regions-map-panel .srm-icon-button {
                border: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.12))));
                border-radius: 7px;
                background: var(--color-surface-200, var(--purpura-surface200, rgba(0, 0, 0, 0.04)));
                color: var(--color-content-default, var(--purpura-mainText, #191b1d));
            }
            #purpura-server-regions-map-panel .srm-icon-button:hover {
                background: var(--color-state-hover, var(--color-surface-300, var(--purpura-surface300, rgba(0, 0, 0, 0.08))));
                border-color: var(--color-stroke-default, var(--color-border-default, var(--purpura-surface300, rgba(0, 0, 0, 0.22))));
                color: var(--color-content-emphasis, var(--purpura-mainText, #111315));
            }
            #purpura-server-regions-map-panel .srm-icon-button:focus-visible {
                outline: 2px solid var(--color-action-emphasis-background, var(--purpura-playButton, #335fff));
                outline-offset: 2px;
            }
            #purpura-server-regions-map-panel .srm-content { gap: 18px; padding: 14px 16px 16px; }
            #purpura-server-regions-map-panel .srm-canvas { filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.20)); }
            #purpura-server-regions-map-panel .srm-status {
                position: static; transform: none; max-width: none; margin-top: 8px; padding: 0; border: 0;
                border-radius: 0; background: none; overflow: visible; text-overflow: clip;
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
                font-size: 11px; text-align: center; white-space: normal;
            }
            #purpura-server-regions-map-panel .srm-status[data-kind="error"] {
                color: var(--color-content-error, #c62828);
            }
            #purpura-server-regions-map-panel .srm-side { gap: 0; }
            #purpura-server-regions-map-panel .srm-results {
                display: flex; flex-direction: column; max-height: min(560px, calc(100vh - 210px));
                overflow: auto; overscroll-behavior: contain; padding-right: 4px;
            }
            #purpura-server-regions-map-panel .srm-region-group { padding-bottom: 10px; }
            #purpura-server-regions-map-panel .srm-region-group-head {
                display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
                width: 100%; padding: 7px 0;
                border: 0;
                border-bottom: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.10))));
                background: none; color: inherit; font: inherit; text-align: left; cursor: pointer;
            }
            #purpura-server-regions-map-panel .srm-region-group-head:hover {
                color: var(--color-content-emphasis, var(--purpura-mainText, #111315));
            }
            #purpura-server-regions-map-panel .srm-region-group-head strong {
                min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                color: var(--color-content-emphasis, var(--purpura-mainText, #111315));
                font-size: 12px; font-weight: 600;
            }
            #purpura-server-regions-map-panel .srm-region-group-head span {
                flex: 0 0 auto;
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
                font-size: 10px;
            }
            #purpura-server-regions-map-panel .srm-all {
                align-self: flex-start; margin-bottom: 6px; padding: 0; border: 0; background: none;
                color: var(--srm-accent, var(--purpura-playButton, var(--color-action-primary-background, #335fff)));
                font: 600 11px/1.4 system-ui, sans-serif; cursor: pointer;
            }
            #purpura-server-regions-map-panel .srm-all:hover { filter: brightness(0.92); }
            #purpura-server-regions-map-panel .srm-server-row {
                gap: 8px; padding: 7px 0;
                border-bottom: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.06))));
                border-radius: 0; background: transparent;
            }
            #purpura-server-regions-map-panel .srm-server-id {
                color: var(--color-content-default, var(--purpura-mainText, #191b1d));
            }
            #purpura-server-regions-map-panel .srm-server-players {
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
            }
            #purpura-server-regions-map-panel .srm-join {
                min-height: 26px; padding: 0 10px; border: 0; border-radius: 6px;
                background: var(--srm-accent, var(--purpura-playButton, var(--color-action-primary-background, #335fff)));
                color: var(--srm-accent-text, var(--color-content-on-emphasis, var(--color-content-inverse, #ffffff)));
                font: inherit; font-size: 11px; font-weight: 600; cursor: pointer;
            }
            #purpura-server-regions-map-panel .srm-join:hover {
                background: var(--srm-accent, var(--purpura-playButton, var(--color-action-primary-background, #335fff)));
                filter: brightness(1.08);
            }
            #purpura-server-regions-map-panel .srm-join:disabled {
                opacity: 0.5; cursor: default;
                background: var(--color-surface-300, var(--purpura-surface300, rgba(0, 0, 0, 0.08)));
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
            }
            #purpura-server-regions-map-panel .srm-empty {
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
            }
            #purpura-server-regions-map-panel .srm-state {
                display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
                min-height: 260px; padding: 26px 18px; text-align: center;
                border: 1px dashed var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.16))));
                border-radius: 10px;
                background: var(--color-surface-200, var(--purpura-surface200, rgba(0, 0, 0, 0.025)));
            }
            #purpura-server-regions-map-panel .srm-state-icon {
                display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%;
                background: var(--color-surface-300, var(--purpura-surface300, rgba(0, 0, 0, 0.06)));
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
            }
            #purpura-server-regions-map-panel .srm-state-icon svg { width: 21px; height: 21px; }
            #purpura-server-regions-map-panel .srm-state-title {
                color: var(--color-content-emphasis, var(--purpura-mainText, #111315));
                font-size: 13px; font-weight: 700;
            }
            #purpura-server-regions-map-panel .srm-state-copy {
                max-width: 250px;
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
                font-size: 11px; line-height: 1.55;
            }
            #purpura-server-regions-map-panel .srm-loader {
                width: 30px; height: 30px; margin-bottom: 2px; border-radius: 50%;
                border: 2px solid var(--color-border-default, var(--color-stroke-default, rgba(0, 0, 0, 0.14)));
                border-top-color: var(--srm-accent, var(--purpura-playButton, var(--color-action-primary-background, #335fff)));
                animation: purpura-srm-spin 0.8s linear infinite;
            }
            #purpura-server-regions-map-panel .srm-state-action {
                min-height: 28px; margin-top: 3px; padding: 0 12px;
                border: 1px solid var(--color-border-default, var(--color-stroke-default, var(--purpura-surface300, rgba(0, 0, 0, 0.16))));
                border-radius: 6px;
                background: var(--color-surface-100, var(--purpura-surface100, #ffffff));
                color: var(--color-content-default, var(--purpura-mainText, #191b1d));
                font: inherit; font-size: 11px; font-weight: 600; cursor: pointer;
            }
            #purpura-server-regions-map-panel .srm-state-action:hover {
                background: var(--color-state-hover, var(--color-surface-300, var(--purpura-surface300, rgba(0, 0, 0, 0.08))));
                border-color: var(--color-stroke-default, var(--color-border-default, var(--purpura-surface300, rgba(0, 0, 0, 0.22))));
            }
            @keyframes purpura-srm-spin {
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                #purpura-server-regions-map-panel .srm-loader {
                    animation: none;
                    border-color: var(--srm-accent, var(--purpura-playButton, var(--color-action-primary-background, #335fff)));
                    opacity: 0.55;
                }
            }
            #purpura-server-regions-map-panel .srm-more {
                color: var(--color-content-muted, var(--purpura-secondaryText, #6b7280));
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function createTrigger() {
        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.type = 'button';
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-expanded', 'false');
        button.title = 'Open Server Regions Map';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14.5 14.5 0 0 1 0 18a14.5 14.5 0 0 1 0-18z"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg><span>Regions</span>';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openPanel();
        });
        return button;
    }

    function findAnchor() {
        const header = document.querySelector(
            '#running-game-instances-container .server-list-container-header, ' +
            '#game-instances-container .server-list-container-header, ' +
            '.server-list-container-header'
        );
        if (header) return { kind: 'header', element: header };

        const container = document.querySelector(
            '#running-game-instances-container, #game-instances-container, ' +
            '.game-instances-container, .rbx-game-server-item-container'
        );
        if (container) return { kind: 'container', element: container };
        return null;
    }

    function removeTrigger() {
        const button = document.getElementById(BUTTON_ID);
        if (button) button.remove();
        document.querySelectorAll('.' + TRIGGER_BAR_CLASS).forEach((bar) => {
            if (!bar.children.length) bar.remove();
        });
    }

    function mount() {
        if (!state.enabled || !getPlaceId()) {
            removeTrigger();
            return;
        }

        ensureStyle();
        const anchor = findAnchor();
        if (!anchor) {
            removeTrigger();
            return;
        }

        let button = document.getElementById(BUTTON_ID);
        if (!button) button = createTrigger();

        if (anchor.kind === 'container') {
            let bar = anchor.element.querySelector(':scope > .' + TRIGGER_BAR_CLASS);
            if (!bar) {
                bar = make('div', TRIGGER_BAR_CLASS);
                anchor.element.insertBefore(bar, anchor.element.firstChild);
            }
            if (button.parentElement !== bar) bar.appendChild(button);
        } else {
            if (button.parentElement !== anchor.element) anchor.element.appendChild(button);
        }

        button.setAttribute('aria-expanded', state.panelOpen ? 'true' : 'false');
    }

    function scheduleMount() {
        if (state.mountTimer) return;
        state.mountTimer = setTimeout(() => {
            state.mountTimer = 0;
            mount();
            if (state.panelOpen && state.scanPlaceId && state.scanPlaceId !== getPlaceId()) closePanel();
        }, MOUNT_DELAY_MS);
    }

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.hidden = true;
        panel.innerHTML = `
            <div class="srm-backdrop" data-srm-close></div>
            <section class="srm-dialog" role="dialog" aria-modal="true" aria-labelledby="srm-title">
                <header class="srm-header">
                    <h2 class="srm-title" id="srm-title">Server Regions</h2>
                    <div class="srm-actions">
                        <button type="button" class="srm-icon-button" data-srm-refresh title="Refresh server regions" aria-label="Refresh server regions">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
                        </button>
                        <button type="button" class="srm-icon-button" data-srm-close title="Close" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
                        </button>
                    </div>
                </header>
                <div class="srm-content">
                    <div class="srm-globe-column">
                        <div class="srm-globe-wrap">
                            <canvas class="srm-canvas" aria-label="Interactive globe showing Roblox server regions"></canvas>
                        </div>
                        <div class="srm-status" data-srm-status></div>
                    </div>
                    <aside class="srm-side">
                        <div class="srm-results" data-srm-results></div>
                    </aside>
                </div>
            </section>
        `;

        panel.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-srm-close]')) closePanel();
            else if (target.closest('[data-srm-refresh]')) loadData(true);
        });

        panel.addEventListener('wheel', (event) => {
            let scroller = event.target instanceof Element ? event.target : null;
            while (scroller && scroller !== panel) {
                if (scroller.matches('[data-srm-results], .srm-content') &&
                    scroller.scrollHeight > scroller.clientHeight + 1) break;
                scroller = scroller.parentElement;
            }
            if (scroller && scroller !== panel) {
                const atTop = scroller.scrollTop <= 0;
                const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
                if (!((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom))) {
                    event.stopPropagation();
                    return;
                }
            }
            event.preventDefault();
            event.stopPropagation();
        }, { passive: false });

        state.panel = panel;
        state.canvas = panel.querySelector('.srm-canvas');
        attachCanvasEvents();
        document.body.appendChild(panel);
    }

    function ensurePanel() {
        ensureStyle();
        if (!state.panel) createPanel();
        return state.panel;
    }

    function openPanel() {
        if (!state.enabled || !getPlaceId()) return;
        const panel = ensurePanel();
        if (!panel) return;

        state.panelOpen = true;
        panel.hidden = false;
        const trigger = document.getElementById(BUTTON_ID);
        if (trigger) trigger.setAttribute('aria-expanded', 'true');

        const wrap = state.canvas && state.canvas.parentElement;
        if (wrap && typeof ResizeObserver === 'function' && !state.resizeObserver) {
            state.resizeObserver = new ResizeObserver(() => {
                syncCanvasSize();
                state.forceRender = true;
            });
            state.resizeObserver.observe(wrap);
        }

        watchTheme();
        invalidateTheme();
        state.lastTick = 0;
        syncCanvasSize();
        state.forceRender = true;
        if (state.scanPlaceId !== getPlaceId()) {
            state.dataState = 'loading';
            state.error = '';
            setStatus('Scanning public servers…', 'loading');
        }
        renderPanel();
        renderGlobe();
        startAnimation();
        loadCatalog().then(() => {
            renderPanel();
            state.forceRender = true;
        });
        loadWorldTexture().then(() => {
            state.forceRender = true;
            renderGlobe();
        });
        loadData(false);

        const closeButton = panel.querySelector('button[data-srm-close]');
        if (closeButton && typeof closeButton.focus === 'function') closeButton.focus();
    }

    function closePanel() {
        if (!state.panelOpen) return;
        state.panelOpen = false;
        state.scanToken += 1;
        state.dragging = false;
        state.hoverKey = null;
        if (state.panel) state.panel.hidden = true;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
            state.animationFrame = 0;
        }
        const trigger = document.getElementById(BUTTON_ID);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function unmount() {
        closePanel();
        removeTrigger();
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
        if (state.resizeObserver) {
            state.resizeObserver.disconnect();
            state.resizeObserver = null;
        }
        if (state.themeObserver) {
            state.themeObserver.disconnect();
            state.themeObserver = null;
        }
        if (state.themeMedia && state.themeMedia.removeEventListener) {
            state.themeMedia.removeEventListener('change', invalidateTheme);
        }
        state.themeMedia = null;
        state.themeColors = null;
        state.pixelMap = null;
        if (state.panel) {
            state.panel.remove();
            state.panel = null;
            state.canvas = null;
            state.imageData = null;
        }
    }

    function syncCanvasSize() {
        if (!state.canvas) return;
        const wrap = state.canvas.parentElement;
        const width = wrap ? wrap.clientWidth : 0;
        const target = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, Math.round(width || 420)));
        if (state.canvas.width !== target || state.canvas.height !== target) {
            state.canvas.width = target;
            state.canvas.height = target;
            state.imageData = null;
            state.pixelMap = null;
        }
    }

    function attachCanvasEvents() {
        const canvas = state.canvas;
        if (!canvas) return;

        canvas.addEventListener('pointerdown', (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            state.dragging = true;
            state.dragLastX = event.clientX;
            state.dragLastY = event.clientY;
            state.dragDistance = 0;
            state.resumeAt = Date.now() + 8000;
            canvas.style.cursor = 'grabbing';
            if (typeof canvas.setPointerCapture === 'function') {
                try { canvas.setPointerCapture(event.pointerId); } catch (_) { }
            }
            event.preventDefault();
        });

        canvas.addEventListener('pointermove', (event) => {
            if (state.dragging) {
                const dx = event.clientX - state.dragLastX;
                const dy = event.clientY - state.dragLastY;
                state.dragLastX = event.clientX;
                state.dragLastY = event.clientY;
                state.dragDistance += Math.abs(dx) + Math.abs(dy);
                state.rotation = normalizeRotation(state.rotation - dx * 0.006);
                state.pitch = normalizePitch(state.pitch + dy * 0.006);
                state.forceRender = true;
                state.resumeAt = Date.now() + 8000;
                return;
            }
            const hit = hitTest(event.clientX, event.clientY);
            if (hit !== state.hoverKey) {
                state.hoverKey = hit;
                state.forceRender = true;
            }
            canvas.style.cursor = hit ? 'pointer' : 'grab';
        });

        const finishDrag = (event) => {
            if (!state.dragging) return;
            state.dragging = false;
            canvas.style.cursor = 'grab';
            state.resumeAt = Date.now() + 5000;
            if (typeof canvas.releasePointerCapture === 'function') {
                try { canvas.releasePointerCapture(event.pointerId); } catch (_) { }
            }
            if (state.dragDistance < 6) {
                const hit = hitTest(event.clientX, event.clientY);
                state.selectedKey = hit && hit === state.selectedKey ? null : hit;
                renderPanel();
                state.forceRender = true;
            }
        };

        canvas.addEventListener('pointerup', finishDrag);
        canvas.addEventListener('pointercancel', finishDrag);
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!event.deltaY) return;
            state.pitch = normalizePitch(state.pitch + event.deltaY * 0.0025);
            state.resumeAt = Date.now() + 5000;
            state.forceRender = true;
        }, { passive: false });
        canvas.addEventListener('pointerleave', () => {
            if (state.dragging) return;
            if (state.hoverKey) {
                state.hoverKey = null;
                state.forceRender = true;
            }
            canvas.style.cursor = 'grab';
        });
    }

    function hitTest(clientX, clientY) {
        if (!state.canvas) return null;
        const rect = state.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const x = (clientX - rect.left) * state.canvas.width / rect.width;
        const y = (clientY - rect.top) * state.canvas.height / rect.height;

        let closest = null;
        let closestDistance = 15;
        state.projected.forEach((entry) => {
            if (!entry.marker.count) return;
            const distance = Math.hypot(entry.point.x - x, entry.point.y - y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = entry.marker.key;
            }
        });
        return closest;
    }

    function startAnimation() {
        if (state.animationFrame) return;
        const reducedMotion = typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const tick = (now) => {
            if (!state.panelOpen) {
                state.animationFrame = 0;
                return;
            }
            const rotating = !state.dragging && !reducedMotion && !state.hoverKey && now > state.resumeAt;
            const delta = state.lastTick ? Math.min(50, Math.max(0, now - state.lastTick)) : 16;
            state.lastTick = now;
            if (rotating) state.rotation = normalizeRotation(state.rotation + ROTATION_PER_MS * delta);

            if ((rotating || state.forceRender) && now - state.lastFrame >= FRAME_MS) {
                state.lastFrame = now;
                state.forceRender = false;
                renderGlobe();
            }
            state.animationFrame = requestAnimationFrame(tick);
        };

        state.animationFrame = requestAnimationFrame(tick);
    }

    function roundedRect(context, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        context.beginPath();
        context.moveTo(x + r, y);
        context.lineTo(x + width - r, y);
        context.quadraticCurveTo(x + width, y, x + width, y + r);
        context.lineTo(x + width, y + height - r);
        context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        context.lineTo(x + r, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - r);
        context.lineTo(x, y + r);
        context.quadraticCurveTo(x, y, x + r, y);
        context.closePath();
    }

    function drawFallbackGraticule(context, radius, centerX, centerY, colors) {
        context.strokeStyle = colors.grid;
        context.lineWidth = 1;

        for (let lat = -60; lat <= 60; lat += 30) {
            let started = false;
            context.beginPath();
            for (let lon = -180; lon <= 180; lon += 4) {
                const point = project(lat, lon, radius, centerX, centerY);
                if (point.z > 0) {
                    if (!started) {
                        context.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        context.lineTo(point.x, point.y);
                    }
                } else {
                    started = false;
                }
            }
            context.stroke();
        }

        for (let lon = -180; lon < 180; lon += 30) {
            let started = false;
            context.beginPath();
            for (let lat = -90; lat <= 90; lat += 4) {
                const point = project(lat, lon, radius, centerX, centerY);
                if (point.z > 0) {
                    if (!started) {
                        context.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        context.lineTo(point.x, point.y);
                    }
                } else {
                    started = false;
                }
            }
            context.stroke();
        }
    }

    function drawLabel(context, marker, x, y, radius, colors) {
        const text = shortLabel(marker) + ' · ' + marker.count;
        context.font = '600 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        const width = context.measureText(text).width + 14;
        const height = 22;
        let top = y - radius - height - 7;
        if (top < 4) top = y + radius + 7;

        context.fillStyle = colors.labelBg;
        context.strokeStyle = colors.labelBorder;
        context.lineWidth = 1;
        roundedRect(context, x - width / 2, top, width, height, 7);
        context.fill();
        context.stroke();
        context.fillStyle = colors.labelText;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x, top + height / 2 + 0.5);
    }

    function buildPixelMap(size, radius, centerX, centerY) {
        const offsets = [];
        const uBase = [];
        const rowOffsets = [];
        const shade = [];
        const light = [];
        const xDir = [];
        const yDir = [];
        const zDir = [];

        for (let y = 0; y < size; y += 1) {
            const ny = (centerY - y) / radius;
            if (ny < -1 || ny > 1) continue;

            for (let x = 0; x < size; x += 1) {
                const nx = (x - centerX) / radius;
                const distanceSquared = nx * nx + ny * ny;
                if (distanceSquared > 1) continue;

                const nz = Math.sqrt(1 - distanceSquared);
                const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
                const v = 0.5 - lat / Math.PI;
                offsets.push((y * size + x) * 4);
                uBase.push(Math.atan2(nx, nz) / TWO_PI + 0.5);
                rowOffsets.push(Math.min(TEXTURE_HEIGHT - 1, Math.max(0, Math.floor(v * TEXTURE_HEIGHT))) * TEXTURE_WIDTH);
                shade.push(0.56 + 0.44 * Math.sqrt(nz));
                light.push(0.88 + 0.12 * nx);
                xDir.push(nx);
                yDir.push(ny);
                zDir.push(nz);
            }
        }

        return {
            size: size,
            offsets: Uint32Array.from(offsets),
            uBase: Float32Array.from(uBase),
            rowOffsets: Uint32Array.from(rowOffsets),
            shade: Float32Array.from(shade),
            light: Float32Array.from(light),
            xDir: Float32Array.from(xDir),
            yDir: Float32Array.from(yDir),
            zDir: Float32Array.from(zDir)
        };
    }

    function renderGlobe() {
        if (!state.panelOpen || !state.canvas) return;
        const canvas = state.canvas;
        const context = canvas.getContext('2d');
        if (!context) return;

        const size = canvas.width || MIN_CANVAS_SIZE;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 8;
        const colors = themeColors();
        if (state.panel && state.panel.style.colorScheme !== colors.colorScheme) {
            state.panel.style.colorScheme = colors.colorScheme;
        }
        if (state.worldGeo && state.worldTheme !== colors.key) buildWorldTexture(colors);

        if (!state.imageData || state.imageData.width !== size) {
            state.imageData = context.createImageData(size, size);
        }
        if (!state.pixelMap || state.pixelMap.size !== size) {
            state.pixelMap = buildPixelMap(size, radius, centerX, centerY);
        }

        if (state.worldTexture) {
            const output = state.imageData.data;
            const texture = state.worldTexture.data;
            const textureWidth = state.worldTexture.width;
            const map = state.pixelMap;
            const rotationOffset = state.rotation / TWO_PI;
            const pitch = state.pitch;

            if (Math.abs(pitch) < 0.0005) {
                for (let index = 0; index < map.offsets.length; index += 1) {
                    let u = map.uBase[index] + rotationOffset;
                    u -= Math.floor(u);
                    const tx = Math.min(textureWidth - 1, Math.max(0, (u * textureWidth) | 0));
                    const textureIndex = (map.rowOffsets[index] + tx) * 4;
                    const outputIndex = map.offsets[index];
                    const factor = map.shade[index] * map.light[index];

                    output[outputIndex] = texture[textureIndex] * factor;
                    output[outputIndex + 1] = texture[textureIndex + 1] * factor;
                    output[outputIndex + 2] = texture[textureIndex + 2] * factor;
                    output[outputIndex + 3] = 255;
                }
            } else {
                const cosPitch = Math.cos(pitch);
                const sinPitch = Math.sin(pitch);
                for (let index = 0; index < map.offsets.length; index += 1) {
                    const nx = map.xDir[index];
                    const ny = map.yDir[index];
                    const nz = map.zDir[index];
                    const yWorld = ny * cosPitch + nz * sinPitch;
                    const zWorld = nz * cosPitch - ny * sinPitch;
                    const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, yWorld))) / Math.PI;
                    const row = Math.min(TEXTURE_HEIGHT - 1, Math.max(0, Math.floor(v * TEXTURE_HEIGHT))) * TEXTURE_WIDTH;
                    let u = Math.atan2(nx, zWorld) / TWO_PI + 0.5 + rotationOffset;
                    u -= Math.floor(u);
                    const tx = Math.min(textureWidth - 1, Math.max(0, (u * textureWidth) | 0));
                    const textureIndex = (row + tx) * 4;
                    const outputIndex = map.offsets[index];
                    const factor = map.shade[index] * map.light[index];

                    output[outputIndex] = texture[textureIndex] * factor;
                    output[outputIndex + 1] = texture[textureIndex + 1] * factor;
                    output[outputIndex + 2] = texture[textureIndex + 2] * factor;
                    output[outputIndex + 3] = 255;
                }
            }

            context.clearRect(0, 0, size, size);
            context.putImageData(state.imageData, 0, 0);
        } else {
            context.clearRect(0, 0, size, size);
            const gradient = context.createRadialGradient(
                centerX - radius * 0.3, centerY - radius * 0.36, radius * 0.08,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, colors.ocean);
            gradient.addColorStop(1, colors.oceanDeep);
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, TWO_PI);
            context.fillStyle = gradient;
            context.fill();
            drawFallbackGraticule(context, radius, centerX, centerY, colors);
        }

        context.save();
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, TWO_PI);
        context.clip();
        const lighting = context.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.38, radius * 0.08,
            centerX, centerY, radius
        );
        lighting.addColorStop(0, colors.highlight);
        lighting.addColorStop(0.58, colors.shadowSoft);
        lighting.addColorStop(1, colors.shadow);
        context.fillStyle = lighting;
        context.fillRect(0, 0, size, size);
        context.restore();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, TWO_PI);
        context.strokeStyle = colors.edge;
        context.lineWidth = 1;
        context.stroke();

        state.projected = [];
        allRegions().forEach((marker) => {
            const point = project(marker.lat, marker.lon, radius, centerX, centerY);
            if (point.z > 0.01) state.projected.push({ marker: marker, point: point });
        });
        state.projected.sort((a, b) => a.point.z - b.point.z);

        state.projected.forEach((entry) => {
            const marker = entry.marker;
            const point = entry.point;
            const selected = marker.key === state.selectedKey;
            const hovered = marker.key === state.hoverKey;

            if (!marker.count) {
                context.beginPath();
                context.arc(point.x, point.y, 1.8, 0, TWO_PI);
                context.fillStyle = colors.muted;
                context.fill();
                return;
            }

            const markerRadius = 4 + Math.min(7, Math.log2(marker.count + 1) * 2.2);
            const alpha = Math.min(1, point.z * 2);

            context.beginPath();
            context.arc(point.x, point.y, markerRadius + 5, 0, TWO_PI);
            context.globalAlpha = 0.16 * alpha;
            context.fillStyle = colors.accent;
            context.fill();
            context.globalAlpha = 1;

            context.beginPath();
            context.arc(point.x, point.y, markerRadius, 0, TWO_PI);
            context.fillStyle = selected ? colors.selectedFill : colors.accent;
            context.fill();
            context.lineWidth = selected ? 2 : 1;
            context.strokeStyle = selected ? colors.markerStrokeSelected : colors.markerStroke;
            context.stroke();

            if (selected) {
                context.beginPath();
                context.arc(point.x, point.y, markerRadius + 5, 0, TWO_PI);
                context.strokeStyle = colors.markerRing;
                context.lineWidth = 1.5;
                context.stroke();
            }

            if (selected || hovered) {
                drawLabel(context, marker, point.x, point.y, markerRadius, colors);
            }
        });
    }

    function setStatus(text, kind) {
        state.statusText = text || '';
        state.statusKind = kind || '';
        const status = state.panel && state.panel.querySelector('[data-srm-status]');
        if (!status) return;
        status.textContent = state.statusText;
        status.dataset.kind = state.statusKind;
        status.hidden = !state.statusText;

        const loadingText = state.panel && state.panel.querySelector('[data-srm-loading-text]');
        if (loadingText && state.statusText) loadingText.textContent = state.statusText;
    }

    function setProgress(text) {
        setStatus(text, 'loading');
    }

    function renderSummary() {
        const summary = state.panel && state.panel.querySelector('[data-srm-summary]');
        if (!summary) return;
        summary.textContent = '';

        const rows = allRegions().filter((region) => region.count > 0);
        const values = [
            [String(state.totalServers), 'Servers'],
            [String(rows.length), 'Regions'],
            [String(state.unknown), 'Unmapped'],
            [String(state.fullServers), 'Full']
        ];

        values.forEach((value) => {
            const stat = make('div', 'srm-stat');
            stat.appendChild(make('b', '', value[0]));
            stat.appendChild(make('span', '', value[1]));
            summary.appendChild(stat);
        });
    }

    function renderRegionList() {
        const list = state.panel && state.panel.querySelector('[data-srm-regions]');
        if (!list) return;
        list.textContent = '';

        const rows = allRegions().filter((region) => region.count > 0).sort((a, b) => {
            return b.count - a.count || a.label.localeCompare(b.label);
        });
        if (state.dataState === 'error') {
            list.appendChild(make('div', 'srm-empty', state.error || 'Could not load server regions.'));
            return;
        }

        if (state.dataState === 'loading' && !rows.length) {
            list.appendChild(make('div', 'srm-empty', 'Scanning public servers and datacenter locations…'));
            return;
        }

        if (!rows.length) {
            list.appendChild(make('div', 'srm-empty', state.dataState === 'ready'
                ? 'No public server locations were detected for this game.'
                : 'Open the map to scan this game\'s public servers.'));
            return;
        }

        rows.forEach((region) => {
            const row = make('button', 'srm-region-row' + (region.key === state.selectedKey ? ' is-selected' : ''));
            row.type = 'button';
            row.title = region.label + ' — ' + region.count + (region.count === 1 ? ' server' : ' servers');
            row.setAttribute('aria-pressed', region.key === state.selectedKey ? 'true' : 'false');
            row.appendChild(make('span', 'srm-dot'));
            row.appendChild(make('span', 'srm-region-name', region.label));
            row.appendChild(make('span', 'srm-region-count', String(region.count)));
            row.addEventListener('click', () => {
                state.selectedKey = region.key;
                renderPanel();
                state.forceRender = true;
            });
            list.appendChild(row);
        });
    }

    function renderServerPanel() {
        const panel = state.panel && state.panel.querySelector('[data-srm-servers]');
        if (!panel) return;

        const region = state.selectedKey ? findRegion(state.selectedKey) : null;
        if (!region || !region.count) {
            panel.hidden = true;
            panel.textContent = '';
            return;
        }

        panel.hidden = false;
        panel.textContent = '';

        const heading = make('div', 'srm-server-heading');
        heading.appendChild(make('strong', '', region.label));
        heading.appendChild(make('span', '', region.count + (region.count === 1 ? ' server' : ' servers')));
        panel.appendChild(heading);

        const list = make('div', 'srm-server-list');
        const servers = region.servers.slice().sort((a, b) => {
            return (b.playing || 0) - (a.playing || 0);
        });
        const visible = servers.slice(0, 12);

        visible.forEach((server) => {
            const row = make('div', 'srm-server-row');
            const id = make('span', 'srm-server-id', '#' + String(server.id).slice(0, 8));
            id.title = server.id;
            const full = server.maxPlayers && server.playing >= server.maxPlayers;
            const players = make('span', 'srm-server-players', server.maxPlayers
                ? server.playing + ' / ' + server.maxPlayers
                : server.playing + ' playing');
            const join = make('button', 'srm-join', full ? 'Full' : 'Join');
            join.type = 'button';
            join.disabled = !!full;
            join.title = full ? 'This server is full' : 'Join this server';
            join.addEventListener('click', () => launchGame(getPlaceId(), server.id));
            row.append(id, players, join);
            list.appendChild(row);
        });

        panel.appendChild(list);

        if (servers.length > visible.length) {
            panel.appendChild(make('div', 'srm-more', '+' + (servers.length - visible.length) + ' more servers in this region'));
        }
    }

    function createServerLoadingState() {
        const wrap = make('div', 'srm-state srm-state-loading');
        wrap.setAttribute('role', 'status');
        wrap.setAttribute('aria-live', 'polite');

        const spinner = make('div', 'srm-loader');
        spinner.setAttribute('aria-hidden', 'true');
        const title = make('div', 'srm-state-title', 'Mapping servers…');
        const copy = make('div', 'srm-state-copy', state.statusText || 'Finding public servers and datacenter locations…');
        copy.dataset.srmLoadingText = '';
        wrap.append(spinner, title, copy);
        return wrap;
    }

    function createServerEmptyState(hasServers) {
        const wrap = make('div', 'srm-state');
        wrap.setAttribute('role', 'status');

        const icon = make('div', 'srm-state-icon');
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.7 12h16.6"/><path d="M12 3.5a13.5 13.5 0 0 1 0 17a13.5 13.5 0 0 1 0-17z"/><path d="M5.5 5.5l13 13"/></svg>';

        const title = make('div', 'srm-state-title', hasServers ? 'No joinable servers' : 'No servers to map');
        const copy = make('div', 'srm-state-copy', hasServers
            ? 'The public servers found are full or their locations could not be mapped.'
            : 'This game has no public servers available right now. Try refreshing in a moment.');
        const refresh = make('button', 'srm-state-action', 'Refresh');
        refresh.type = 'button';
        refresh.addEventListener('click', () => loadData(true));
        wrap.append(icon, title, copy, refresh);
        return wrap;
    }

    function renderResults() {
        const container = state.panel && state.panel.querySelector('[data-srm-results]');
        if (!container) return;
        container.textContent = '';

        const rows = allRegions().filter((region) => region.count > 0).sort((a, b) => {
            return b.count - a.count || a.label.localeCompare(b.label);
        });
        if (state.dataState === 'error') {
            container.appendChild(make('div', 'srm-empty', state.error || 'Could not load server regions.'));
            return;
        }
        if (state.dataState === 'loading' && !rows.length) {
            container.appendChild(createServerLoadingState());
            return;
        }
        if (!rows.length) {
            container.appendChild(state.dataState === 'ready'
                ? createServerEmptyState(state.totalServers > 0)
                : make('div', 'srm-empty', 'Open the map to scan public servers.'));
            return;
        }

        const visible = state.selectedKey ? rows.filter((region) => region.key === state.selectedKey) : rows;
        if (state.selectedKey) {
            const all = make('button', 'srm-all', 'All regions');
            all.type = 'button';
            all.addEventListener('click', () => {
                state.selectedKey = null;
                renderPanel();
                state.forceRender = true;
            });
            container.appendChild(all);
        }

        (visible.length ? visible : rows).forEach((region) => {
            const group = make('div', 'srm-region-group');
            const head = make('button', 'srm-region-group-head');
            head.type = 'button';
            head.title = 'Filter to ' + region.label;
            head.appendChild(make('strong', '', region.label));
            head.appendChild(make('span', '', region.count + (region.count === 1 ? ' server' : ' servers')));
            head.addEventListener('click', () => {
                state.selectedKey = state.selectedKey === region.key ? null : region.key;
                renderPanel();
                state.forceRender = true;
            });
            group.appendChild(head);

            const servers = region.servers.slice().sort((a, b) => (b.playing || 0) - (a.playing || 0));
            const visibleServers = servers.slice(0, 20);
            visibleServers.forEach((server) => {
                const row = make('div', 'srm-server-row');
                const id = make('span', 'srm-server-id', '#' + String(server.id).slice(0, 8));
                id.title = server.id;
                const players = make('span', 'srm-server-players', server.maxPlayers
                    ? server.playing + ' / ' + server.maxPlayers
                    : server.playing + ' playing');
                const join = make('button', 'srm-join', 'Join');
                join.type = 'button';
                join.title = 'Join this server';
                join.addEventListener('click', () => launchGame(getPlaceId(), server.id));
                row.append(id, players, join);
                group.appendChild(row);
            });
            if (servers.length > visibleServers.length) {
                group.appendChild(make('div', 'srm-more', '+' + (servers.length - visibleServers.length) + ' more'));
            }
            container.appendChild(group);
        });
    }

    function renderPanel() {
        if (!state.panel || !state.panelOpen) return;
        renderResults();
    }

    function applySnapshot(snapshot) {
        resetRegionCounts();
        state.totalServers = snapshot.servers.length;

        snapshot.servers.forEach((server) => {
            if (server.maxPlayers && server.playing >= server.maxPlayers) {
                state.fullServers += 1;
                return;
            }
            const region = regionForLocation(server.location, server.dataCenterId);
            if (!region) {
                state.unknown += 1;
                return;
            }
            region.count += 1;
            region.servers.push(server);
        });

        if (state.selectedKey && !findRegion(state.selectedKey)) state.selectedKey = null;
        state.dataState = 'ready';
        state.error = '';
        renderPanel();
        state.forceRender = true;
        renderGlobe();
    }

    async function fetchServers(placeId) {
        const servers = new Map();
        let cursor = null;

        for (let page = 0; page < 2; page += 1) {
            let url = 'https://games.roblox.com/v1/games/' + encodeURIComponent(placeId) +
                '/servers/Public?sortOrder=Desc&excludeFullGames=true&limit=100';
            if (cursor) url += '&cursor=' + encodeURIComponent(cursor);

            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) break;
            const data = await response.json();
            const list = data && Array.isArray(data.data) ? data.data : [];

            list.forEach((server) => {
                if (!server || !server.id) return;
                servers.set(server.id, {
                    id: server.id,
                    playing: typeof server.playing === 'number' ? server.playing : 0,
                    maxPlayers: typeof server.maxPlayers === 'number' ? server.maxPlayers : 0,
                    location: null,
                    dataCenterId: null
                });
            });

            cursor = data && data.nextPageCursor ? data.nextPageCursor : null;
            if (!cursor || !list.length) break;
        }

        return Array.from(servers.values());
    }

    function apiGet(path) {
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendMessage({
                    type: 'PURPURA_API_REQUEST',
                    url: API_ORIGIN + path,
                    method: 'GET'
                }, (response) => {
                    if (chrome.runtime.lastError || !response || !response.ok) {
                        resolve(null);
                        return;
                    }
                    try {
                        resolve(JSON.parse(response.text));
                    } catch (_) {
                        resolve(null);
                    }
                });
            } catch (_) {
                resolve(null);
            }
        });
    }

    async function knownServerLocations(placeId, serverIds) {
        const locations = new Map();
        for (let index = 0; index < serverIds.length; index += DETAIL_BATCH_SIZE) {
            const batch = serverIds.slice(index, index + DETAIL_BATCH_SIZE);
            const data = await apiGet('/v1/servers/details?place_id=' + encodeURIComponent(placeId) +
                '&server_ids=' + encodeURIComponent(batch.join(',')));
            if (!data || !Array.isArray(data.servers)) continue;
            data.servers.forEach((entry) => {
                if (!entry || !entry.serverId || !entry.location) return;
                locations.set(entry.serverId, {
                    location: entry.location,
                    dataCenterId: entry.dataCenterId || null
                });
            });
        }
        return locations;
    }

    function requestServerLocations(placeId, serverIds) {
        if (!serverIds.length) return Promise.resolve(null);
        return new Promise((resolve) => {
            const finish = (locations) => {
                resolve(locations && locations.size ? locations : null);
            };
            const collect = (servers) => {
                const locations = new Map();
                (servers || []).forEach((entry) => {
                    if (!entry || !entry.serverId || !entry.location) return;
                    locations.set(entry.serverId, {
                        location: entry.location,
                        dataCenterId: entry.dataCenterId || null
                    });
                });
                return locations;
            };
            const legacyFallback = () => {
                try {
                    chrome.runtime.sendMessage({
                        action: 'getServerRegions',
                        placeId: placeId,
                        serverIds: serverIds
                    }, (response) => {
                        if (chrome.runtime.lastError || !response || !Array.isArray(response.servers)) {
                            finish(null);
                            return;
                        }
                        finish(collect(response.servers));
                    });
                } catch (_) {
                    finish(null);
                }
            };
            try {
                chrome.runtime.sendMessage({
                    action: 'probeServerRegions',
                    placeId: placeId,
                    serverIds: serverIds
                }, (response) => {
                    if (chrome.runtime.lastError || !response || !Array.isArray(response.servers) || !response.servers.length) {
                        legacyFallback();
                        return;
                    }
                    finish(collect(response.servers));
                });
            } catch (_) {
                legacyFallback();
            }
        });
    }

    function launchGame(placeId, serverId) {
        const id = parseInt(placeId, 10);
        if (!id) return;
        const call = serverId
            ? "Roblox.GameLauncher.joinGameInstance(" + id + ", '" + serverId + "')"
            : 'Roblox.GameLauncher.joinGameInstance(' + id + ')';
        const code = 'if (typeof Roblox !== \'undefined\' && Roblox.GameLauncher && typeof Roblox.GameLauncher.joinGameInstance === \'function\') { ' + call + '; }';
        try {
            chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code });
        } catch (_) { }
    }

    async function loadData(force) {
        const placeId = getPlaceId();
        if (!placeId) return;

        if (state.scanPlaceId !== placeId) {
            state.scanPlaceId = placeId;
            state.selectedKey = null;
            state.dynamicByKey.clear();
            resetRegionCounts();
        }

        if (!state.cache.has(placeId)) {
            state.dataState = 'loading';
            state.error = '';
            renderPanel();
            setProgress('Scanning public servers…');
        }

        await loadCatalog();
        await loadLocationCache();
        if (!state.panelOpen) return;

        const cached = state.cache.get(placeId);
        if (!force && cached) {
            applySnapshot(cached);
            if (Date.now() - cached.at < CACHE_TTL_MS) {
                setStatus('Updated just now', 'ready');
                return;
            }
            setStatus('Refreshing cached results…', 'loading');
        }

        const token = ++state.scanToken;
        state.dataState = 'loading';
        state.error = '';
        state.totalServers = 0;
        state.unknown = 0;
        resetRegionCounts();
        renderPanel();
        state.forceRender = true;
        setProgress('Fetching public servers…');

        try {
            const servers = await fetchServers(placeId);
            if (token !== state.scanToken || !state.panelOpen) return;

            if (!servers.length) {
                const snapshot = { servers: [], at: Date.now() };
                state.cache.set(placeId, snapshot);
                applySnapshot(snapshot);
                setStatus('No public servers found for this game.', 'ready');
                return;
            }

            servers.forEach((server) => {
                const cachedLocation = state.locationCache.get(server.id);
                if (cachedLocation && cachedLocation.location) {
                    server.location = cachedLocation.location;
                    server.dataCenterId = cachedLocation.dataCenterId || null;
                }
            });

            let pending = servers.filter((server) => !server.location);
            if (pending.length) {
                const known = await knownServerLocations(placeId, pending.map((server) => server.id));
                if (token !== state.scanToken || !state.panelOpen) return;
                pending.forEach((server) => {
                    const entry = known.get(server.id);
                    if (!entry || !entry.location) return;
                    server.location = entry.location;
                    server.dataCenterId = entry.dataCenterId || null;
                });
            }

            pending = servers.filter((server) => !server.location).sort((a, b) => {
                return (b.maxPlayers - b.playing) - (a.maxPlayers - a.playing);
            });
            let resolved = servers.length - pending.length;
            let renderedMapped = -1;
            const renderMappedSoFar = () => {
                if (!resolved || resolved === renderedMapped) return;
                renderedMapped = resolved;
                applySnapshot({ servers: servers, at: Date.now() });
            };
            renderMappedSoFar();
            setProgress('Mapping servers… ' + resolved + ' / ' + servers.length);

            for (let index = 0; index < pending.length; index += PROBE_CHUNK) {
                const chunk = pending.slice(index, index + PROBE_CHUNK);
                const locations = await requestServerLocations(placeId, chunk.map((server) => server.id));
                if (token !== state.scanToken || !state.panelOpen) return;

                if (locations) {
                    chunk.forEach((server) => {
                        const entry = locations.get(server.id);
                        if (!entry || !entry.location) return;
                        server.location = entry.location;
                        server.dataCenterId = entry.dataCenterId || null;
                    });
                }
                resolved = servers.filter((server) => server.location).length;
                renderMappedSoFar();
                setProgress('Mapping servers… ' + resolved + ' / ' + servers.length);
            }

            servers.forEach((server) => {
                if (!server.location) return;
                state.locationCache.set(server.id, {
                    location: server.location,
                    dataCenterId: server.dataCenterId || null,
                    at: Date.now()
                });
            });
            scheduleLocationCacheSave();

            const snapshot = { servers: servers, at: Date.now() };
            state.cache.set(placeId, snapshot);
            applySnapshot(snapshot);
            const mapped = servers.length - state.fullServers - state.unknown;
            const regionCount = allRegions().filter((region) => region.count > 0).length;
            const unresolved = state.unknown ? ' · ' + state.unknown + ' unresolved' : '';
            setStatus(mapped + ' joinable servers · ' + regionCount + ' regions' + unresolved, 'ready');
        } catch (error) {
            if (token !== state.scanToken || !state.panelOpen) return;
            state.dataState = 'error';
            state.error = 'Could not load server regions. Try refreshing in a moment.';
            renderPanel();
            setStatus(state.error, 'error');
        }
    }

    function applyConfig(value) {
        const enabled = value !== false;
        const changed = enabled !== state.enabled;
        state.enabled = enabled;

        if (!enabled) {
            unmount();
            return;
        }

        ensureStyle();
        if (!state.observer) {
            state.observer = new MutationObserver(scheduleMount);
            state.observer.observe(document.documentElement, { childList: true, subtree: true });
        }
        if (changed || !document.getElementById(BUTTON_ID)) scheduleMount();
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && state.panelOpen) {
            event.preventDefault();
            closePanel();
        }
    });

    window.addEventListener('popstate', scheduleMount);
    window.addEventListener('hashchange', scheduleMount);

    window.__PurpuraSettings.ready.then(() => {
        applyConfig(window.__PurpuraSettings.get(STORAGE_KEY));
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync') return;
            if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
            applyConfig(changes[STORAGE_KEY].newValue);
        });
    });
})();
