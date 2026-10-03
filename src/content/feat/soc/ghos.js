/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    if (window.purpuraGhostProfilesInitialized) return;
    window.purpuraGhostProfilesInitialized = true;

    const BANNED_PROFILE_PATH = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/banned-users\/(\d+)\/profile/i;
    const PROFILE_STYLE_ID = 'ghost-profile-native-style';
    const PRE_MASK_STYLE_ID = 'purpura-ghost-pre-mask';
    const LAST_CLICKED_URL_KEY = 'purpura_ghost_last_clicked_url';
    const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

    let syncing = false;
    let needsRerun = false;
    let lastRenderedKey = '';
    let renderGeneration = 0;
    let syncTimer = 0;
    let csrfToken = '';
    let boundAuthToken = '';
    let tokensCaptured = false;
    let lastClickedUrl = null;

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPES[char]);
    const toNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;
    const formatNumber = value => toNumber(value).toLocaleString();
    const trimText = value => typeof value === 'string' ? value.trim() : '';

    const formatDate = value => {
        const text = String(value ?? '').trim();
        if (!text) return '';
        const timestamp = Date.parse(text);
        if (!Number.isFinite(timestamp)) return '';
        return new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const isGhostProfilePage = () => {
        const path = window.location.pathname || '';
        return BANNED_PROFILE_PATH.test(path) || path.includes('/request-error');
    };

    const applyPreMask = () => {
        if (!isGhostProfilePage()) return;
        if (document.getElementById(PRE_MASK_STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = PRE_MASK_STYLE_ID;
        style.textContent = '.error-page-container,.request-error-page,.request-error-page-content{opacity:0 !important;pointer-events:none !important}';
        (document.head || document.documentElement).appendChild(style);
        window.setTimeout(() => {
            const existing = document.getElementById(PRE_MASK_STYLE_ID);
            if (existing) existing.remove();
        }, 5000);
    };

    const removePreMask = () => {
        const style = document.getElementById(PRE_MASK_STYLE_ID);
        if (style) style.remove();
    };

    const captureTokens = () => {
        if (tokensCaptured) return;
        tokensCaptured = true;
        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]')?.content;
            const boundMeta = document.querySelector('meta[name="x-bound-auth-token"], meta[name="bound-auth-token"]')?.content;
            if (typeof csrfMeta === 'string' && csrfMeta.trim()) csrfToken = csrfMeta.trim();
            if (typeof boundMeta === 'string' && boundMeta.trim()) boundAuthToken = boundMeta.trim();
            const storageKeys = ['rbxBoundAuthToken', 'x-bound-auth-token', 'boundAuthToken', 'csrf-token', 'x-csrf-token'];
            storageKeys.forEach(key => {
                try {
                    const stored = window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key) || '';
                    if (!stored || typeof stored !== 'string' || !stored.trim()) return;
                    if (key.toLowerCase().includes('csrf')) {
                        if (!csrfToken) csrfToken = stored.trim();
                    } else if (!boundAuthToken) {
                        boundAuthToken = stored.trim();
                    }
                } catch {}
            });
        } catch {}
    };

    const sendBackgroundRequest = request => new Promise(resolve => {
        try {
            chrome.runtime.sendMessage(request, response => {
                if (chrome.runtime.lastError) {
                    resolve({ ok: false, status: 0, contentType: '', text: '' });
                    return;
                }
                resolve(response && typeof response === 'object' ? response : { ok: false, status: 0, contentType: '', text: '' });
            });
        } catch {
            resolve({ ok: false, status: 0, contentType: '', text: '' });
        }
    });

    const requestResource = async (url, method = 'GET', body = null, headers = null) => {
        captureTokens();
        const requestMethod = String(method || 'GET').toUpperCase();
        const serializedBody = typeof body === 'string' ? body : (body ? JSON.stringify(body) : '');
        const sendRequest = () => sendBackgroundRequest({
            type: 'PURPURA_FETCH_RESOURCE_REQUEST',
            url,
            method: requestMethod,
            body: serializedBody,
            accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
            csrfToken: requestMethod !== 'GET' ? csrfToken : '',
            boundAuthToken,
            headers: headers && typeof headers === 'object' ? headers : {}
        });

        try {
            let response = await sendRequest();
            if (response && typeof response.csrfToken === 'string' && response.csrfToken) csrfToken = response.csrfToken;
            if (response && typeof response.boundAuthToken === 'string' && response.boundAuthToken) boundAuthToken = response.boundAuthToken;
            if ((!response || !response.ok) && response && response.status === 403 && requestMethod !== 'GET' && csrfToken) {
                response = await sendRequest();
                if (response && typeof response.csrfToken === 'string' && response.csrfToken) csrfToken = response.csrfToken;
                if (response && typeof response.boundAuthToken === 'string' && response.boundAuthToken) boundAuthToken = response.boundAuthToken;
            }
            const text = typeof response?.text === 'string' ? response.text : '';
            let json = null;
            try {
                json = text ? JSON.parse(text) : null;
            } catch {}
            return { ok: !!response?.ok, status: Number(response?.status) || 0, json, text };
        } catch {
            return { ok: false, status: 0, json: null, text: '' };
        }
    };

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const isAuthFailure = response => {
        const status = Number(response?.status) || 0;
        if (status === 401 || status === 403) return true;

        const pattern = /unauth|forbidden|invalid|obstruct|revok|denied|expired|api[ -]?key/i;
        const payload = response && response.json && typeof response.json === 'object' ? response.json : null;

        if (payload) {
            const candidates = [payload.code, payload.error, payload.message, payload.title];
            for (const candidate of candidates) {
                const text = trimText(String(candidate ?? ''));
                if (text && pattern.test(text)) return true;
            }

            if (Array.isArray(payload.errors)) {
                for (const error of payload.errors) {
                    const text = trimText(String(error && error.message ? error.message : ''));
                    if (text && pattern.test(text)) return true;
                }
            }
        }

        const bodyText = trimText(response && typeof response.text === 'string' ? response.text : '');
        return !!(bodyText && pattern.test(bodyText));
    };

    async function ensureStudioApiKey(forceRefresh = false) {
        return await new Promise(resolve => {
            try {
                chrome.runtime.sendMessage({ action: 'purpuraEnsureStudioApiKey', forceRefresh: forceRefresh === true }, response => {
                    if (chrome.runtime.lastError || !response || response.ok !== true || typeof response.apiKey !== 'string' || !response.apiKey) {
                        resolve('');
                        return;
                    }
                    resolve(response.apiKey);
                });
            } catch {
                resolve('');
            }
        });
    }

    async function invalidateStudioApiKey() {
        await new Promise(resolve => {
            try {
                chrome.runtime.sendMessage({ action: 'purpuraInvalidateStudioApiKey' }, () => resolve(true));
            } catch {
                resolve(true);
            }
        });
    }

    const parseThumbnailResponse = response => {
        const entry = response && response.json && Array.isArray(response.json.data) ? response.json.data[0] : null;
        if (!entry) return null;
        return {
            state: typeof entry.state === 'string' ? entry.state : 'Unknown',
            imageUrl: typeof entry.imageUrl === 'string' ? entry.imageUrl : '',
            targetId: entry.targetId
        };
    };

    async function pollThumbnails(urls, attempts = 3, delayMs = 250) {
        let fallback = null;

        for (let attempt = 0; attempt < attempts; attempt++) {
            let pending = false;

            for (const url of urls) {
                const response = await requestResource(url);
                const thumbnail = parseThumbnailResponse(response);
                if (!thumbnail) continue;
                if (thumbnail.state === 'Completed' && thumbnail.imageUrl) return thumbnail;
                if ((thumbnail.state === 'Pending' || thumbnail.state === 'InReview') && !fallback) fallback = thumbnail;
                else if (!fallback) fallback = thumbnail;
                if (thumbnail.state === 'Pending' || thumbnail.state === 'InReview') pending = true;
            }

            if (attempt < attempts - 1 && (pending || !fallback)) await wait(delayMs);
        }

        return fallback || { state: 'Blocked', imageUrl: '', targetId: null };
    }

    const upgradeThumbnailUrl = url => url ? url.replace(/AvatarHeadshot/g, 'Avatar').replace(/150\/150/g, '420/420').replace(/\/Png\/?$/, '/Png/noFilter').replace(/\/isCircular$/, '/noFilter') : '';

    function buildHeadshotUrls(userId) {
        return [
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png&returnPolicy=PlaceHolder&isCircular=false`,
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&returnPolicy=PlaceHolder&isCircular=false`
        ];
    }

    function buildAvatarUrls(userId) {
        return [
            `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`,
            `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
        ];
    }

    async function generateThumbnailViaCloudApi(userId) {
        let apiKey = await ensureStudioApiKey();
        if (!apiKey) return { targetId: userId, state: 'Blocked', imageUrl: '', thumbnailType: 'AvatarHeadshot' };

        let refreshed = false;

        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                const response = await requestResource(`https://apis.roblox.com/cloud/v2/users/${userId}:generateThumbnail`, 'GET', null, { 'x-api-key': apiKey });
                const payload = response && response.json ? response.json : null;

                if (response.ok && payload && payload.done && payload.response && payload.response.imageUri) {
                    return { targetId: userId, state: 'Completed', imageUrl: payload.response.imageUri, thumbnailType: 'AvatarHeadshot' };
                }

                if (isAuthFailure(response)) {
                    await invalidateStudioApiKey();
                    if (refreshed) break;

                    apiKey = await ensureStudioApiKey(true);
                    refreshed = true;
                    if (!apiKey) break;
                    continue;
                }

                if (response.ok && payload && payload.done === false && attempt < 3) {
                    await wait(900);
                    continue;
                }
            } catch {}
            break;
        }

        return { targetId: userId, state: 'Blocked', imageUrl: '', thumbnailType: 'AvatarHeadshot' };
    }

    async function resolveAvatarThumbnail(userId) {
        const cloudThumbnail = await generateThumbnailViaCloudApi(userId);
        if (cloudThumbnail && cloudThumbnail.state === 'Completed' && cloudThumbnail.imageUrl) {
            return cloudThumbnail;
        }

        const headshot = await pollThumbnails(buildHeadshotUrls(userId), 4, 450);
        if (headshot && headshot.state === 'Completed' && headshot.imageUrl) {
            return { targetId: userId, state: 'Completed', imageUrl: headshot.imageUrl, thumbnailType: 'AvatarHeadshot' };
        }

        const assetThumbnail = await resolveAssetThumbnail(userId);
        if (assetThumbnail && assetThumbnail.state === 'Completed' && assetThumbnail.imageUrl) {
            return assetThumbnail;
        }

        const avatar = await pollThumbnails(buildAvatarUrls(userId), 2, 300);
        if (avatar && avatar.state === 'Completed' && avatar.imageUrl) {
            return { targetId: userId, state: 'Completed', imageUrl: avatar.imageUrl, thumbnailType: 'AvatarHeadshotFallback' };
        }

        return { targetId: userId, state: 'Blocked', imageUrl: '', thumbnailType: 'AvatarHeadshot' };
    }

    async function resolveAssetThumbnail(userId) {
        let assetIds = [];

        try {
            const response = await requestResource(`https://avatar.roblox.com/v2/avatar/users/${userId}/avatar`);
            const assets = Array.isArray(response?.json?.assets) ? response.json.assets : [];
            const faceAssetTypes = new Set([17, 18, 79]);
            const wearableAssets = assets.map(asset => ({
                id: Number(asset?.id),
                type: Number(asset?.assetType?.id ?? asset?.assetType)
            })).filter(asset => Number.isFinite(asset.id) && asset.id > 0);

            const faceAssets = wearableAssets.filter(asset => faceAssetTypes.has(asset.type)).map(asset => asset.id);
            assetIds = [...new Set(faceAssets)].slice(0, 8);
        } catch {}

        if (!assetIds.length) return { targetId: userId, state: 'Blocked', imageUrl: '', thumbnailType: 'AvatarAsset' };

        try {
            const response = await requestResource(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds.join(',')}&size=150x150&format=Png&returnPolicy=PlaceHolder`);
            const entries = Array.isArray(response?.json?.data) ? response.json.data : [];
            const thumbnails = new Map();
            entries.forEach(entry => {
                if (entry && entry.targetId != null) thumbnails.set(String(entry.targetId), entry);
            });

            for (const assetId of assetIds) {
                const thumbnail = thumbnails.get(String(assetId));
                if (thumbnail && thumbnail.state === 'Completed' && typeof thumbnail.imageUrl === 'string' && thumbnail.imageUrl) {
                    return { targetId: userId, state: 'Completed', imageUrl: thumbnail.imageUrl, thumbnailType: 'AvatarAsset' };
                }
            }
        } catch {}

        return { targetId: userId, state: 'Blocked', imageUrl: '', thumbnailType: 'AvatarAsset' };
    }

    function createAvatarRenderRequest(userId) {
        return {
            state: 'Pending',
            thumbnailType: 'Avatar',
            finalUpdate: (async () => {
                try {
                    const response = await requestResource(`https://avatar.roblox.com/v2/avatar/users/${userId}/avatar`);
                    if (response.ok && response.json) {
                        const avatar = response.json;
                        const renderRequest = {
                            thumbnailConfig: { thumbnailId: 1, thumbnailType: '2d', size: '420x420' },
                            avatarDefinition: {
                                assets: (Array.isArray(avatar.assets) ? avatar.assets : []).map(asset => ({
                                    id: asset.id,
                                    name: asset.name,
                                    assetType: asset.assetType,
                                    currentVersionId: asset.currentVersionId
                                })),
                                bodyColors: {
                                    headColor: avatar.bodyColor3s?.headColor3,
                                    torsoColor: avatar.bodyColor3s?.torsoColor3,
                                    rightArmColor: avatar.bodyColor3s?.rightArmColor3,
                                    leftArmColor: avatar.bodyColor3s?.leftArmColor3,
                                    rightLegColor: avatar.bodyColor3s?.rightLegColor3,
                                    leftLegColor: avatar.bodyColor3s?.leftLegColor3
                                },
                                scales: avatar.scales,
                                playerAvatarType: { playerAvatarType: avatar.playerAvatarType }
                            }
                        };

                        const renderResponse = await requestResource('https://avatar.roblox.com/v1/avatar/render', 'POST', renderRequest);
                        if (renderResponse.ok && renderResponse.json && typeof renderResponse.json.imageUrl === 'string' && renderResponse.json.imageUrl) {
                            return { state: 'Completed', imageUrl: renderResponse.json.imageUrl, thumbnailType: 'Avatar' };
                        }
                    }

                    const avatarThumbnail = await pollThumbnails(buildAvatarUrls(userId), 2);
                    if (avatarThumbnail && avatarThumbnail.state === 'Completed' && avatarThumbnail.imageUrl) {
                        return { state: 'Completed', imageUrl: avatarThumbnail.imageUrl, thumbnailType: 'Avatar' };
                    }

                    const cloudThumbnail = await generateThumbnailViaCloudApi(userId);
                    if (cloudThumbnail && cloudThumbnail.state === 'Completed' && cloudThumbnail.imageUrl) {
                        return { state: 'Completed', imageUrl: upgradeThumbnailUrl(cloudThumbnail.imageUrl) || cloudThumbnail.imageUrl, thumbnailType: 'Avatar' };
                    }
                } catch {}
                return null;
            })()
        };
    }

    const readFeatureConfig = () => window.__PurpuraSettings.ready.then(function () {
        const value = window.__PurpuraSettings.get('ghos');
        if (typeof value === 'boolean') return { enabled: value, webRequestPermission: false };
        if (value && typeof value === 'object') {
            return {
                enabled: value.enabled !== false,
                webRequestPermission: value.webRequestPermission === true
            };
        }
        return { enabled: true, webRequestPermission: false };
    });

    const hasWebRequestPermission = () => new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'checkWebRequestPermission' }, response => resolve(!!(response && response.has)));
    });

    const readRedirectUserId = () => new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'getGhostProfileRedirect' }, response => {
            resolve(response && response.userId ? String(response.userId) : null);
        });
    });

    const readLastClickedUrl = () => {
        try {
            if (lastClickedUrl !== null) return lastClickedUrl;
            lastClickedUrl = window.sessionStorage ? window.sessionStorage.getItem(LAST_CLICKED_URL_KEY) || '' : '';
            return lastClickedUrl;
        } catch {
            return '';
        }
    };

    const trackClickedUrl = event => {
        try {
            let target = event && event.target ? event.target : null;
            for (; target && target.tagName !== 'A';) target = target.parentElement;
            if (!target || !target.href) return;

            const url = String(target.href);
            if (!url.startsWith('http://') && !url.startsWith('https://')) return;

            lastClickedUrl = url;
            if (window.sessionStorage) window.sessionStorage.setItem(LAST_CLICKED_URL_KEY, url);
        } catch {}
    };

    const extractUserIdFromUrl = url => {
        const match = String(url || '').match(/users\/(\d+)\/profile/);
        return match && match[1] ? match[1] : null;
    };

    function injectStyles() {
        const legacyStyle = document.getElementById(`${PROFILE_STYLE_ID}-extra`);
        if (legacyStyle) legacyStyle.remove();

        let layoutStyle = document.getElementById(PROFILE_STYLE_ID);
        if (!layoutStyle) {
            layoutStyle = document.createElement('style');
            layoutStyle.id = PROFILE_STYLE_ID;
            (document.head || document.documentElement).appendChild(layoutStyle);
        }
        layoutStyle.textContent = '.ghost-profile-loading{display:flex;justify-content:center;align-items:center;height:400px}.profile-platform-container .profile-tabs{border-bottom:1px solid var(--purpura-border-color,rgba(255,255,255,.16));margin-bottom:24px}.profile-platform-container .profile-tab{display:flex;justify-content:center;align-items:center;padding:12px 0;color:var(--purpura-gray-text-color,#9ea6b3) !important;text-decoration:none;border-bottom:.5px solid rgba(0,0,0,0);transition:color .18s ease,border-color .18s ease,padding .18s ease}.profile-platform-container .profile-tab:hover{color:var(--purpura-main-text-color,#fff) !important;box-shadow:none;border-bottom:.5px solid var(--purpura-main-text-color,#fff)}.profile-platform-container .profile-tab.active{color:var(--purpura-main-text-color,#fff) !important;box-shadow:none;border-bottom:3px solid var(--purpura-main-text-color,#fff);padding-bottom:9.5px}.profile-platform-container .tab-pane{display:none !important}.profile-platform-container .tab-pane.active{display:block !important}.profile-platform-container .profile-tab-content-wrapper>.tab-pane{display:none}.profile-platform-container .profile-tab-content-wrapper>.tab-pane.active{display:block}.ghost-stat-placeholder{width:60px;height:20px;border-radius:10px;display:inline-block;vertical-align:middle}#content.content{background:none !important;background-color:rgba(0,0,0,0) !important}.ghost-scroll-btn{position:absolute;z-index:10;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.6) !important;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:#fff;opacity:1;transition:opacity .25s ease;pointer-events:auto}.ghost-scroll-btn.left{left:5px}.ghost-scroll-btn.right{right:5px}.ghost-scroll-btn.ghost-btn-disabled{opacity:.25 !important;cursor:default;pointer-events:auto}';

        let cardStyle = document.getElementById(`${PROFILE_STYLE_ID}-cards`);
        if (!cardStyle) {
            cardStyle = document.createElement('style');
            cardStyle.id = `${PROFILE_STYLE_ID}-cards`;
            (document.head || document.documentElement).appendChild(cardStyle);
        }
        cardStyle.textContent = '.ghost-item-card{text-align:left;width:100% !important;height:100%}.ghost-item-card-link{text-decoration:none;color:inherit}.ghost-item-thumb-container{position:relative;background-color:var(--purpura-button-background-color,rgba(208,217,251,.12));background-image:linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,.08));border-radius:8px;aspect-ratio:1/1;margin-bottom:8px;overflow:hidden}.ghost-item-thumb{width:100% !important;height:100% !important;object-fit:contain;border-radius:8px;padding:8px;display:block}.ghost-item-name{font-size:14px;font-weight:500;color:var(--purpura-main-text-color,#f7f7f8);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;word-break:break-word;min-height:2.6em;line-height:1.3}.ghost-item-rap{font-size:12px;font-weight:600;color:var(--purpura-secondary-text-color,#d5d7dd);display:flex;align-items:center;height:20px;gap:4px}.ghost-item-rap .icon-robux-16x16{margin-right:2px;flex-shrink:0}.ghost-item-thumb-container .icon-label{position:absolute;bottom:-1px;left:-1px;z-index:2}';
    }

    function getContentRoot() {
        return document.getElementById('content') || document.querySelector('#container-main .content') || document.body;
    }

    function showLoading(container) {
        if (!container) return;
        container.setAttribute('data-purpura-ghost-profile', '1');
        container.innerHTML = '<div class="ghost-profile-loading"><div class="spinner spinner-default"></div></div>';
    }

    function setStatValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.textContent = formatNumber(value);
        element.classList.remove('shimmer', 'ghost-stat-placeholder');
    }

    function createCarouselItem(itemKey, name, href, thumbnailUrl, meta = '') {
        const metaText = String(meta || '').trim();
        const isRobuxAmount = /^\d[\d,]*\s*R\$$/.test(metaText);
        const amountText = isRobuxAmount ? metaText.replace(/\s*R\$$/, '') : metaText;
        const metaMarkup = metaText
            ? `<div class="ghost-item-rap">${isRobuxAmount ? `<span class="icon-robux-16x16"></span><span>${escapeHtml(amountText)}</span>` : `<span>${escapeHtml(metaText)}</span>`}</div>`
            : '';

        return `<div class="css-nhhfrx-carouselItem" data-purpura-item="${escapeHtml(itemKey)}" style="width:150px;flex-shrink:0;"><div class="ghost-item-card"><a class="ghost-item-card-link" href="${href}"><div class="ghost-item-thumb-container"><span class="thumbnail-2d-container radius-medium" style="width:100%;height:100%;display:block;background:var(--purpura-button-background-color,rgba(208,217,251,.12));border-radius:8px;overflow:hidden;">${thumbnailUrl ? `<img class="ghost-item-thumb" src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(name)}">` : ''}</span></div><div class="ghost-item-name">${escapeHtml(name)}</div>${metaMarkup}</a></div></div>`;
    }

    function createGameCard(itemKey, name, href, thumbnailUrl, meta = '') {
        return `<li class="list-item game-card game-tile" data-purpura-item="${escapeHtml(itemKey)}"><a class="game-card-link" href="${href}"><div class="game-card-thumb-container"><span class="thumbnail-2d-container" style="width:100%;height:100%;display:block;overflow:hidden;border-radius:8px;background:var(--purpura-button-background-color);">${thumbnailUrl ? `<img class="game-card-thumb" src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;object-fit:cover;display:block;">` : ''}</span></div><div class="game-card-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div><div class="game-card-info"><span class="info-label icon-playing-counts-gray"></span><span class="info-label playing-counts-label">${escapeHtml(meta)}</span></div></a></li>`;
    }

    function attachImageFallback(image, fallbackUrl, onError) {
        if (!image) return;
        let fallbackUsed = false;
        image.addEventListener('error', () => {
            if (!fallbackUsed && fallbackUrl) {
                fallbackUsed = true;
                image.src = fallbackUrl;
                return;
            }
            if (typeof onError === 'function') onError();
        });
    }

    function renderGhostProfile(user) {
        const container = getContentRoot();
        if (!container) return;

        removePreMask();
        injectStyles();
        container.setAttribute('data-purpura-ghost-profile', '1');

        const joinDate = formatDate(user.created);
        const initial = escapeHtml((user.displayName || '?').charAt(0).toUpperCase() || '?');

        document.title = `${user.displayName} (@${user.name}) - Roblox`;
        if (!BANNED_PROFILE_PATH.test(window.location.pathname)) {
            window.history.replaceState({}, '', `/banned-users/${user.id}/profile`);
        }

        container.innerHTML = `<div class="profile-platform-container" data-profile-type="User" data-profile-id="${user.id}" data-purpura-ghost-profile="1" style="width:970px;margin:0 auto;">
            <div class="sg-system-feedback"><div class="alert-system-feedback"><div class="alert"><span class="alert-content"></span></div></div></div>

            <div class="relative flex flex-col items-center" style="height:300px;width:100%;">
                <div class="profile-avatar-gradient" style="width:100%;height:300px;">
                    <div style="background:var(--purpura-profile-main-gradient,linear-gradient(180deg,#2f3b56 0%,#1b2333 100%));width:100vw;margin-left:calc(50% - 50vw);height:300px;margin-top:-24px;position:relative;background-color:var(--purpura-profile-header-bg,#1b2333);padding:0 12px;"></div>
                    <div class="cover-gradient-overlay" style="position:absolute;bottom:0;width:100vw;margin-left:calc(50% - 50vw);left:0;height:64px;z-index:10;pointer-events:none;mask-image:linear-gradient(rgba(255,255,255,0) 0%, rgba(255,255,255,.5) 40%, rgba(255,255,255,.8) 60%, #fff 100%);background:var(--purpura-profile-overlay-gradient,transparent);"></div>
                </div>
                <div class="thumbnail-holder" style="position:absolute;top:-25px;left:0;right:0;bottom:0;z-index:1;display:flex;justify-content:center;align-items:center;pointer-events:none;overflow:hidden;height:300px;">
                    <div class="thumbnail-3d-container" style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">
                        <div id="ghost-profile-avatar-wrapper" class="avatar-thumbnail-container" style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;max-width:100%;max-height:100%;"></div>
                    </div>
                </div>
            </div>

            <div style="width:100%;position:relative;margin-top:-64px;z-index:20;">
                <div id="user-profile-header-bg" style="max-width:1140px;margin:0 auto;">
                    <div class="user-profile-header flex flex-col gap-large" style="padding:0 15px;">
                        <div class="user-profile-header-info flex justify-between items-center">
                            <div class="flex gap-medium items-center min-width-0">
                                <div id="ghost-profile-avatar-container" class="user-profile-header-details-avatar-container avatar-headshot-lg" style="width:120px;height:120px;min-width:120px;">
                                    <div class="avatar avatar-card-fullbody">
                                        <div id="ghost-profile-headshot-placeholder"></div>
                                        <div class="avatar-status"><span data-testid="presence-icon" class="offline icon-offline" title="Banned User"></span></div>
                                    </div>
                                </div>
                                <div class="flex flex-col min-width-0">
                                    <span class="items-center gap-xsmall flex min-width-0"><span id="profile-header-title-container-name" class="text-heading-large min-width-0 text-truncate-end text-no-wrap">${escapeHtml(user.displayName)}${user.isVerified ? '<span style="font-size:14px;margin-left:6px;color:var(--purpura-playbutton-color,var(--purpura-main-text-color));">&#10003;</span>' : ''}</span></span>
                                    <div class="min-width-0"><span class="stylistic-alts-username text-truncate-end text-no-wrap block">@${escapeHtml(user.name)}</span></div>
                                </div>
                            </div>
                        </div>

                        <div id="ghost-profile-stat-pills" class="flex-nowrap gap-small flex">
                            <a href="/users/${user.id}/friends#!/friends" class="relative clip group/interactable focus-visible:outline-focus cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility" style="text-decoration:none;"><div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div><span class="padding-y-xsmall text-no-wrap text-truncate-end"><span id="ghost-profile-friends-count" class="shimmer ghost-stat-placeholder"></span> Connections</span></a>
                            <a href="/users/${user.id}/friends#!/followers" class="relative clip group/interactable focus-visible:outline-focus cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility" style="text-decoration:none;"><div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div><span class="padding-y-xsmall text-no-wrap text-truncate-end"><span id="ghost-profile-followers-count" class="shimmer ghost-stat-placeholder"></span> Followers</span></a>
                            <a href="/users/${user.id}/friends#!/following" class="relative clip group/interactable focus-visible:outline-focus cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility" style="text-decoration:none;"><div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div><span class="padding-y-xsmall text-no-wrap text-truncate-end"><span id="ghost-profile-following-count" class="shimmer ghost-stat-placeholder"></span> Following</span></a>
                        </div>

                        <div><pre class="content-default text-body-medium description-content" style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(user.description || '')}</pre></div>
                        ${joinDate ? `<div id="ghost-profile-join-date" class="content-default text-body-medium" style="margin-top:4px;display:flex;gap:4px;align-items:center;"><span style="color:var(--purpura-main-text-color);">Joined:</span><span>${escapeHtml(joinDate)}</span></div>` : ''}
                    </div>
                </div>
            </div>

            <div style="max-width:1140px;margin:0 auto;padding:0 15px;">
                <ul class="profile-tabs flex">
                    <li class="justify-center flex fill"><a id="ghost-profile-tab-about-link" href="#ghost-profile-about-content" class="profile-tab active justify-center text-label-medium flex fill">About</a></li>
                    <li class="justify-center flex fill"><a id="ghost-profile-tab-creations-link" href="#ghost-profile-creations-content" class="profile-tab justify-center text-label-medium flex fill">Creations</a></li>
                </ul>
                <div class="profile-tab-content-wrapper padding-top-xxlarge">
                    <div id="ghost-profile-about-content" class="tab-pane active">
                        <div id="ghost-profile-sections-container">
                            <div id="ghost-profile-wearing-container"></div>
                            <div id="ghost-profile-store-container"></div>
                            <div id="ghost-profile-favorites-container"></div>
                            <div id="ghost-profile-friends-container"></div>
                            <div id="ghost-profile-groups-container"></div>
                            <div id="ghost-profile-badges-container"></div>
                        </div>
                    </div>
                    <div id="ghost-profile-creations-content" class="tab-pane">
                        <div class="profile-game section container-list"><div class="container-header"><h3>Experiences</h3></div><div class="game-grid"><ul id="ghost-profile-creations-list" class="hlist game-cards" style="display:flex;flex-wrap:wrap;gap:12px;list-style:none;padding:0;"></ul></div></div>
                    </div>
                </div>
            </div>
        </div>`;

        const tabs = container.querySelectorAll('.profile-tab');
        const panes = container.querySelectorAll('.tab-pane');
        tabs.forEach(tab => tab.addEventListener('click', event => {
            event.preventDefault();
            const targetId = (tab.getAttribute('href') || '').replace('#', '');
            tabs.forEach(other => other.classList.remove('active'));
            panes.forEach(pane => {
                pane.classList.remove('active');
                pane.style.display = 'none';
            });
            tab.classList.add('active');
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.add('active');
                target.style.display = 'block';
            }
        }));

        const headshotPlaceholder = document.getElementById('ghost-profile-headshot-placeholder');
        const avatarWrapper = document.getElementById('ghost-profile-avatar-wrapper');

        const setHeadshotImage = (url, adjustPosition = false) => {
            if (!headshotPlaceholder) return null;
            headshotPlaceholder.innerHTML = `<span class="thumbnail-2d-container avatar-card-image" style="width:120px;height:120px;display:block;overflow:hidden;border-radius:50%;background:var(--purpura-button-background-color);"><img src="${escapeHtml(url || '')}" alt="${initial}" style="width:100%;height:100%;object-fit:cover;${adjustPosition ? 'object-position:center 20%;' : ''}display:block;"></span>`;
            return headshotPlaceholder.querySelector('img');
        };

        const setAvatarImage = url => {
            if (!avatarWrapper) return null;
            avatarWrapper.innerHTML = `<img id="pg_avatar_big_img" src="${escapeHtml(url || '')}" alt="${initial}" style="height:290px;max-height:290px;width:auto;object-fit:contain;display:block;filter:drop-shadow(0 12px 20px rgba(0,0,0,.28));">`;
            return document.getElementById('pg_avatar_big_img');
        };

        const reuseAvatarForHeadshot = () => {
            const bigAvatar = document.getElementById('pg_avatar_big_img');
            const bigAvatarUrl = bigAvatar && typeof bigAvatar.getAttribute === 'function' ? (bigAvatar.getAttribute('src') || '') : '';
            if (bigAvatarUrl) {
                const image = setHeadshotImage(bigAvatarUrl, false);
                attachImageFallback(image, '', () => {});
                return;
            }
            if (headshotPlaceholder) {
                headshotPlaceholder.innerHTML = '<span class="thumbnail-2d-container icon-broken avatar-card-image" style="width:120px;height:120px;display:block;overflow:hidden;border-radius:50%;background:var(--purpura-button-background-color);"></span>';
            }
        };

        const showBrokenAvatar = () => {
            if (avatarWrapper) {
                avatarWrapper.innerHTML = '<span class="thumbnail-2d-container icon-broken" style="width:260px;height:260px;display:block;border-radius:12px;background:var(--purpura-button-background-color);opacity:.75;"></span>';
            }
        };

        const loadRenderedAvatar = () => {
            const request = createAvatarRenderRequest(user.id);
            const finalUpdate = request && request.finalUpdate;
            if (!finalUpdate) {
                showBrokenAvatar();
                return;
            }
            finalUpdate.then(result => {
                if (result && result.imageUrl) {
                    setAvatarImage(result.imageUrl);
                    const image = setHeadshotImage(result.imageUrl, false);
                    attachImageFallback(image, '', () => reuseAvatarForHeadshot());
                    return;
                }
                showBrokenAvatar();
            }).catch(() => showBrokenAvatar());
        };

        const loadHeadshotFallback = () => {
            const bigAvatar = document.getElementById('pg_avatar_big_img');
            const bigAvatarUrl = bigAvatar && typeof bigAvatar.getAttribute === 'function' ? (bigAvatar.getAttribute('src') || '') : '';
            if (bigAvatarUrl) {
                const image = setHeadshotImage(bigAvatarUrl, false);
                attachImageFallback(image, '', () => reuseAvatarForHeadshot());
                return;
            }

            const candidate = user.avatarUrl || upgradeThumbnailUrl(user.headshotUrl || '') || '';
            if (candidate) {
                const image = setHeadshotImage(candidate, false);
                attachImageFallback(image, '', () => reuseAvatarForHeadshot());
                return;
            }

            pollThumbnails(buildAvatarUrls(user.id), 2, 300).then(result => {
                if (result && result.state === 'Completed' && result.imageUrl) {
                    const image = setHeadshotImage(result.imageUrl, false);
                    attachImageFallback(image, '', () => reuseAvatarForHeadshot());
                    return;
                }
                reuseAvatarForHeadshot();
            }).catch(() => reuseAvatarForHeadshot());
        };

        const headshotImage = setHeadshotImage(user.avatarUrl || upgradeThumbnailUrl(user.headshotUrl || '') || user.headshotUrl || '', false);
        const avatarImage = setAvatarImage(user.avatarUrl || upgradeThumbnailUrl(user.headshotUrl || '') || '');

        if (headshotImage) {
            attachImageFallback(headshotImage, '', () => { loadHeadshotFallback(); });
        } else {
            loadHeadshotFallback();
        }

        if (avatarImage) {
            attachImageFallback(avatarImage, '', () => { loadRenderedAvatar(); });
        } else {
            loadRenderedAvatar();
        }

        if (user.avatarState !== 'Completed' || !user.avatarUrl) {
            loadRenderedAvatar();
            loadHeadshotFallback();
        }
    }

    function createCarouselSection(containerId, title, listId, listStyle = 'display:flex;flex-wrap:wrap;gap:12px;') {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = `<div class="profile-favorite-experiences" style="margin-top:24px;"><div class="profile-carousel"><div class="css-17g81zd-collectionCarouselContainer"><div style="margin-bottom:12px;"><h2 class="content-emphasis text-heading-small padding-none inline-block" style="margin:0;">${escapeHtml(title)}</h2></div><div id="${listId}" style="${listStyle}"></div></div></div></div>`;
        return document.getElementById(listId);
    }

    function isGhostProfileContainerReady(userId, containerId) {
        return document.querySelector('.profile-platform-container')?.dataset.profileId === String(userId) && !!document.getElementById(containerId);
    }

    async function loadConnectionCounts(userId) {
        const [friends, followers, following] = await Promise.all([
            requestResource(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
            requestResource(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
            requestResource(`https://friends.roblox.com/v1/users/${userId}/followings/count`)
        ]);

        setStatValue('ghost-profile-friends-count', friends && friends.json && typeof friends.json.count === 'number' ? friends.json.count : 0);
        setStatValue('ghost-profile-followers-count', followers && followers.json && typeof followers.json.count === 'number' ? followers.json.count : 0);
        setStatValue('ghost-profile-following-count', following && following.json && typeof following.json.count === 'number' ? following.json.count : 0);
    }

    async function loadCurrentlyWearing(userId) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-wearing-container')) return;

        const response = await requestResource(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`);
        const assetIds = response && response.json && Array.isArray(response.json.assetIds)
            ? [...new Set(response.json.assetIds.map(id => Number(id)).filter(id => Number.isFinite(id)))].slice(0, 16)
            : [];

        if (!assetIds.length) {
            const container = document.getElementById('ghost-profile-wearing-container');
            if (container) container.remove();
            return;
        }

        const thumbnailsResponse = await requestResource(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds.join(',')}&size=150x150&format=Png&isCircular=false`);
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-wearing-container')) return;

        const list = createCarouselSection('ghost-profile-wearing-container', 'Currently Wearing', 'ghost-profile-wearing-list', 'display:flex;flex-wrap:wrap;gap:12px;');
        if (!list) return;

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        const detailMap = new Map();
        const details = await Promise.all(assetIds.map(assetId => requestResource(`https://economy.roblox.com/v2/assets/${assetId}/details`)));
        details.forEach((detail, index) => {
            const assetId = assetIds[index];
            const payload = detail && detail.ok && detail.json ? detail.json : null;
            if (!payload) return;
            const name = typeof payload.Name === 'string' && payload.Name.trim() ? payload.Name.trim() : '';
            const price = Number.isFinite(Number(payload.PriceInRobux)) ? Number(payload.PriceInRobux) : null;
            detailMap.set(String(assetId), { name, value: price });
        });

        list.innerHTML = '';
        assetIds.forEach(assetId => {
            const key = String(assetId);
            const detail = detailMap.get(key) || {};
            const name = detail.name || `Asset ${key}`;
            const meta = detail.value == null ? 'Offsale' : (Number(detail.value) === 0 ? 'Free' : `${formatNumber(detail.value)} R$`);
            list.insertAdjacentHTML('beforeend', createCarouselItem(`wear_${key}`, name, `https://www.roblox.com/catalog/${key}/-`, thumbnailMap.get(key) || '', meta));
        });
    }

    async function loadStoreItems(userId, username) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-store-container')) return;

        const response = await requestResource(`https://catalog.roblox.com/v2/search/items/details?taxonomy=${encodeURIComponent('tZsUsd2BqGViQrJ9Vs3Wah')}&creatorName=${encodeURIComponent(username)}&salesTypeFilter=1&limit=10`);
        const items = response && response.json && Array.isArray(response.json.data) ? response.json.data.slice(0, 8) : [];

        if (!items.length) {
            const container = document.getElementById('ghost-profile-store-container');
            if (container) container.remove();
            return;
        }

        const itemIds = items.map(item => item && item.id).filter(id => Number.isFinite(Number(id)));
        const thumbnailsResponse = itemIds.length ? await requestResource(`https://thumbnails.roblox.com/v1/assets?assetIds=${itemIds.join(',')}&size=150x150&format=Png&isCircular=false`) : null;
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-store-container')) return;

        const list = createCarouselSection('ghost-profile-store-container', 'Store', 'ghost-profile-store-list', 'display:flex;flex-wrap:wrap;gap:12px;');
        if (!list) return;

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        list.innerHTML = '';
        items.forEach(item => {
            const itemId = String(item.id || '');
            if (!itemId) return;
            const name = item.name || `Item ${itemId}`;
            const meta = item.lowestPrice ? `${formatNumber(item.lowestPrice)} R$` : 'Item';
            list.insertAdjacentHTML('beforeend', createCarouselItem(`st_${itemId}`, name, `https://www.roblox.com/catalog/${itemId}/-`, thumbnailMap.get(itemId) || '', meta));
        });
    }

    async function loadFavoriteGames(userId) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-favorites-container')) return;

        const response = await requestResource(`https://games.roblox.com/v2/users/${userId}/favorite/games?limit=10&sortOrder=Desc`);
        const games = response && response.json && Array.isArray(response.json.data) ? response.json.data.slice(0, 8) : [];

        if (!games.length) {
            const container = document.getElementById('ghost-profile-favorites-container');
            if (container) container.remove();
            return;
        }

        const placeIds = games.map(game => game && game.rootPlace && game.rootPlace.id).filter(id => Number.isFinite(Number(id)));
        const thumbnailsResponse = placeIds.length ? await requestResource(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeIds.join(',')}&size=150x150&format=Png&isCircular=false`) : null;
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-favorites-container')) return;

        const list = createCarouselSection('ghost-profile-favorites-container', 'Favorites', 'ghost-profile-favorites-list', 'display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;');
        if (!list) return;

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        list.innerHTML = '';
        games.forEach(game => {
            const placeId = game && game.rootPlace && game.rootPlace.id ? String(game.rootPlace.id) : '';
            const name = game && game.name ? game.name : 'Untitled';
            const href = placeId ? `https://www.roblox.com/games/${placeId}/-` : `https://www.roblox.com/games/${game.id || 0}/-`;
            list.insertAdjacentHTML('beforeend', createCarouselItem(`fv_${placeId || game.id || 0}`, name, href, placeId ? thumbnailMap.get(placeId) || '' : '', 'Experience'));
        });
    }

    async function loadConnections(userId) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-friends-container')) return;

        const response = await requestResource(`https://friends.roblox.com/v1/users/${userId}/friends/find?userSort=2&limit=9`);
        const friends = response && response.json && Array.isArray(response.json.PageItems)
            ? response.json.PageItems.filter(friend => friend && Number(friend.id) > 0).slice(0, 9)
            : [];

        if (!friends.length) {
            const container = document.getElementById('ghost-profile-friends-container');
            if (container) container.remove();
            return;
        }

        const friendIds = friends.map(friend => Number(friend.id));
        const [profilesResponse, thumbnailsResponse] = await Promise.all([
            requestResource('https://apis.roblox.com/user-profile-api/v1/user/profiles/get-profiles', 'POST', { userIds: friendIds, fields: ['names.combinedName', 'isVerified', 'names.username'] }),
            requestResource(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${friendIds.join(',')}&size=150x150&format=Png&isCircular=false`)
        ]);

        if (!isGhostProfileContainerReady(userId, 'ghost-profile-friends-container')) return;

        const list = createCarouselSection('ghost-profile-friends-container', 'Connections', 'ghost-profile-friends-list', 'display:flex;gap:45px;overflow-x:auto;padding-bottom:10px;');
        if (!list) return;

        const profileMap = new Map();
        const profiles = profilesResponse && profilesResponse.json && Array.isArray(profilesResponse.json.profileDetails) ? profilesResponse.json.profileDetails : [];
        profiles.forEach(profile => {
            if (profile && profile.userId != null) profileMap.set(String(profile.userId), profile);
        });

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        list.innerHTML = '';
        friends.forEach(friend => {
            const friendId = String(friend.id);
            const profile = profileMap.get(friendId);
            const name = profile && profile.names && profile.names.combinedName ? profile.names.combinedName : (friend.name || `User ${friendId}`);
            const meta = profile && profile.names && profile.names.username ? `@${profile.names.username}` : 'Friend';
            list.insertAdjacentHTML('beforeend', createCarouselItem(`fr_${friendId}`, name, `https://www.roblox.com/users/${friendId}/profile`, thumbnailMap.get(friendId) || '', meta));
        });
    }

    async function loadCommunities(userId) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-groups-container')) return;

        const response = await requestResource(`https://groups.roblox.com/v1/users/${userId}/groups/roles?includeLocked=true`);
        const groups = response && response.json && Array.isArray(response.json.data) ? response.json.data.slice(0, 10) : [];

        if (!groups.length) {
            const container = document.getElementById('ghost-profile-groups-container');
            if (container) container.remove();
            return;
        }

        const groupIds = groups.map(group => group && group.group && group.group.id).filter(id => Number.isFinite(Number(id)));
        const thumbnailsResponse = groupIds.length ? await requestResource(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&size=150x150&format=Png&isCircular=false`) : null;
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-groups-container')) return;

        const list = createCarouselSection('ghost-profile-groups-container', 'Communities', 'ghost-profile-groups-list', 'display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;');
        if (!list) return;

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        list.innerHTML = '';
        groups.forEach(group => {
            const groupId = group && group.group && group.group.id ? String(group.group.id) : '';
            if (!groupId) return;
            const name = group.group.name || `Group ${groupId}`;
            const meta = group.role && group.role.name ? group.role.name : 'Role';
            list.insertAdjacentHTML('beforeend', createCarouselItem(`gr_${groupId}`, name, `https://www.roblox.com/groups/${groupId}/-`, thumbnailMap.get(groupId) || '', meta));
        });
    }

    async function loadBadges(userId) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-badges-container')) return;

        const response = await requestResource(`https://badges.roblox.com/v1/users/${userId}/badges?limit=10&sortOrder=Desc`);
        const badges = response && response.json && Array.isArray(response.json.data) ? response.json.data.slice(0, 10) : [];

        if (!badges.length) {
            const container = document.getElementById('ghost-profile-badges-container');
            if (container) container.remove();
            return;
        }

        const badgeIds = badges.map(badge => badge && badge.id).filter(id => Number.isFinite(Number(id)));
        const thumbnailsResponse = badgeIds.length ? await requestResource(`https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${badgeIds.join(',')}&size=150x150&format=Png&isCircular=false`) : null;
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-badges-container')) return;

        const list = createCarouselSection('ghost-profile-badges-container', 'Badges', 'ghost-profile-badges-list', 'display:flex;gap:20px;overflow-x:auto;padding-bottom:10px;');
        if (!list) return;

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        list.innerHTML = '';
        badges.forEach(badge => {
            const badgeId = String(badge.id || '');
            if (!badgeId) return;
            const name = badge.name || `Badge ${badgeId}`;
            list.insertAdjacentHTML('beforeend', createCarouselItem(`bd_${badgeId}`, name, `https://www.roblox.com/badges/${badgeId}/-`, thumbnailMap.get(badgeId) || '', 'Badge'));
        });
    }

    async function loadCreations(userId) {
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-creations-list')) return;

        const response = await requestResource(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50&sortOrder=Asc`);
        const games = response && response.json && Array.isArray(response.json.data) ? response.json.data : [];
        const list = document.getElementById('ghost-profile-creations-list');
        if (!list) return;

        if (!games.length) {
            list.innerHTML = '<p class="no-results-message">No experiences found.</p>';
            return;
        }

        const placeIds = games.map(game => game && game.rootPlace && game.rootPlace.id).filter(id => Number.isFinite(Number(id)));
        const thumbnailsResponse = placeIds.length ? await requestResource(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeIds.join(',')}&size=150x150&format=Png&isCircular=false`) : null;
        if (!isGhostProfileContainerReady(userId, 'ghost-profile-creations-list')) return;

        const thumbnailMap = new Map();
        const thumbnails = thumbnailsResponse && thumbnailsResponse.json && Array.isArray(thumbnailsResponse.json.data) ? thumbnailsResponse.json.data : [];
        thumbnails.forEach(thumbnail => {
            if (thumbnail && thumbnail.targetId != null) thumbnailMap.set(String(thumbnail.targetId), thumbnail.imageUrl || '');
        });

        list.innerHTML = '';
        games.forEach(game => {
            const placeId = game && game.rootPlace && game.rootPlace.id ? String(game.rootPlace.id) : '';
            const name = game && game.name ? game.name : 'Untitled';
            const href = placeId ? `https://www.roblox.com/games/${placeId}/-` : `https://www.roblox.com/games/${game.id || 0}/-`;
            const meta = game && typeof game.playing === 'number' ? `${formatNumber(game.playing)} playing` : 'Experience';
            list.insertAdjacentHTML('beforeend', createGameCard(`gm_${placeId || game.id || 0}`, name, href, placeId ? thumbnailMap.get(placeId) || '' : '', meta));
        });
    }

    async function fetchGhostUser(userId) {
        const numericId = Number(userId);
        if (!Number.isFinite(numericId) || numericId <= 0) return null;

        const [userResponse, profilesResponse, headshot, avatar, resolvedThumbnail] = await Promise.all([
            requestResource(`https://users.roblox.com/v1/users/${numericId}`),
            requestResource('https://apis.roblox.com/user-profile-api/v1/user/profiles/get-profiles', 'POST', { userIds: [numericId], fields: ['names.combinedName', 'isVerified', 'names.username'] }),
            pollThumbnails(buildHeadshotUrls(numericId), 4),
            pollThumbnails(buildAvatarUrls(numericId), 4),
            resolveAvatarThumbnail(numericId)
        ]);

        const profile = profilesResponse && profilesResponse.json && Array.isArray(profilesResponse.json.profileDetails) ? profilesResponse.json.profileDetails[0] : null;
        const user = userResponse && userResponse.ok && userResponse.json ? userResponse.json : null;

        if (user && user.isBanned === false) {
            window.location.replace(`https://www.roblox.com/users/${numericId}/profile`);
            return null;
        }

        const resolvedUrl = resolvedThumbnail && resolvedThumbnail.state === 'Completed' && typeof resolvedThumbnail.imageUrl === 'string' ? resolvedThumbnail.imageUrl : '';
        const headshotUrl = headshot && headshot.state === 'Completed' && typeof headshot.imageUrl === 'string' ? headshot.imageUrl : '';
        const headshotImageUrl = resolvedUrl || headshotUrl;
        const headshotType = resolvedUrl ? (resolvedThumbnail.thumbnailType || 'AvatarHeadshot') : (headshotUrl ? 'AvatarHeadshot' : '');

        const avatarUrlFallback = avatar && avatar.state === 'Completed' && typeof avatar.imageUrl === 'string' ? avatar.imageUrl : '';
        const upgradedResolved = resolvedUrl && resolvedThumbnail && resolvedThumbnail.thumbnailType !== 'AvatarAsset' ? (upgradeThumbnailUrl(resolvedUrl) || resolvedUrl) : '';
        const upgradedHeadshot = headshotUrl ? (upgradeThumbnailUrl(headshotUrl) || headshotUrl) : '';
        const avatarImageUrl = avatarUrlFallback || upgradedResolved || upgradedHeadshot;

        const headshotState = headshotImageUrl ? 'Completed' : (headshot && headshot.state ? headshot.state : 'Blocked');
        const avatarState = avatarImageUrl ? 'Completed' : (avatar && avatar.state ? avatar.state : 'Blocked');

        return {
            id: user && Number.isFinite(Number(user.id)) ? Number(user.id) : numericId,
            name: (user && user.name) || (profile && profile.names && profile.names.username) || 'Account Forgotten',
            displayName: (user && user.displayName) || (profile && profile.names && profile.names.combinedName) || (user && user.name) || 'Account Forgotten',
            description: user && typeof user.description === 'string' ? user.description : '',
            created: (user && user.created) || '',
            isVerified: !!(profile && profile.isVerified),
            headshotUrl: headshotImageUrl || '',
            headshotType,
            avatarUrl: avatarImageUrl || '',
            headshotState,
            avatarState
        };
    }

    async function renderGhostProfileForUser(userId) {
        const generation = ++renderGeneration;
        const container = getContentRoot();
        if (!container) return;

        showLoading(container);

        const user = await fetchGhostUser(userId);
        if (generation !== renderGeneration) return;
        if (!user) return;

        renderGhostProfile(user);

        await Promise.all([
            loadConnectionCounts(user.id),
            loadCurrentlyWearing(user.id),
            loadStoreItems(user.id, user.name),
            loadFavoriteGames(user.id),
            loadConnections(user.id),
            loadCommunities(user.id),
            loadBadges(user.id),
            loadCreations(user.id)
        ]);
    }

    async function detectGhostUserId() {
        const pathMatch = window.location.pathname.match(BANNED_PROFILE_PATH);
        if (pathMatch && pathMatch[1]) return pathMatch[1];

        const title = (document.title || '').toLowerCase();
        const isErrorPage = window.location.pathname.includes('/request-error') || title.includes('page not found') || !!document.querySelector('.error-page-container');
        if (!isErrorPage) return null;

        const clickedUserId = extractUserIdFromUrl(readLastClickedUrl());
        if (clickedUserId) return clickedUserId;

        return await readRedirectUserId();
    }

    async function syncGhostProfile() {
        if (syncing) {
            needsRerun = true;
            return;
        }
        syncing = true;

        try {
            do {
                needsRerun = false;

                const config = await readFeatureConfig();
                if (!config.enabled) {
                    removePreMask();
                    continue;
                }

                const pathMatch = window.location.pathname.match(BANNED_PROFILE_PATH);
                const bannedUserId = pathMatch && pathMatch[1] ? String(pathMatch[1]) : null;

                if (!bannedUserId) {
                    const clickedUserId = extractUserIdFromUrl(readLastClickedUrl());
                    if (!clickedUserId && !config.webRequestPermission) {
                        removePreMask();
                        continue;
                    }
                    if (!clickedUserId && !(await hasWebRequestPermission())) {
                        removePreMask();
                        continue;
                    }
                }

                const userId = bannedUserId || await detectGhostUserId();
                if (!userId) {
                    removePreMask();
                    continue;
                }

                const renderKey = `${userId}|${window.location.pathname}|${window.location.search}`;
                const existing = document.querySelector(`.profile-platform-container[data-profile-id="${userId}"]`);
                if (renderKey === lastRenderedKey && existing) continue;

                await renderGhostProfileForUser(userId);
                lastRenderedKey = renderKey;
            } while (needsRerun);
        } finally {
            syncing = false;
        }
    }

    function scheduleSync() {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => { syncGhostProfile(); }, 70);
    }

    const originalPushState = history.pushState.bind(history);
    history.pushState = function () {
        const result = originalPushState(...arguments);
        scheduleSync();
        return result;
    };

    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = function () {
        const result = originalReplaceState(...arguments);
        scheduleSync();
        return result;
    };

    window.addEventListener('popstate', scheduleSync);
    window.addEventListener('hashchange', scheduleSync);

    document.addEventListener('click', trackClickedUrl, true);
    readLastClickedUrl();

    applyPreMask();
    syncGhostProfile();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncGhostProfile, { once: true });
    }
})();
