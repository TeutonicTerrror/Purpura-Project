/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraAdjustAccessoriesLoaded) return;
    window.__purpuraAdjustAccessoriesLoaded = true;

    var STORAGE_KEY = 'aa';
    var BUTTON_ID = 'purpura-adjust-accessories-btn';
    var BUTTON_WRAP_ID = 'purpura-adjust-accessories-wrap';
    var ITEM_ID = 'purpura-adjust-accessories-item';
    var STYLE_ID = 'purpura-adjust-accessories-style';
    var OVERLAY_ID = 'purpura-adjust-accessories-overlay';
    var DIALOG_ID = 'purpura-adjust-accessories-dialog';

    var EDIT_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" fill="currentColor" class="roseal-icon"><path d="M427-120v-225h60v83h353v60H487v82h-60Zm-307-82v-60h247v60H120Zm187-166v-82H120v-60h187v-84h60v226h-60Zm120-82v-60h413v60H427Zm166-165v-225h60v82h187v60H653v83h-60Zm-473-83v-60h413v60H120Z"></path></svg>';
    var CLOSE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    var BACK_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    var NUMBER_EDIT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';

    var REFINEMENT_TABS = ['scale', 'position', 'rotation'];
    var PREVIEW_TYPES = ['Avatar', 'AvatarHeadShot', 'AvatarBust'];

    var ASSET_TYPES = [
        { assetTypeId: 8, assetType: 'Hat', label: 'Hat', isAccessory: true, isRefinable: true },
        { assetTypeId: 41, assetType: 'HairAccessory', label: 'Hair Accessory', isAccessory: true, isRefinable: false },
        { assetTypeId: 42, assetType: 'FaceAccessory', label: 'Face Accessory', isAccessory: true, isRefinable: true },
        { assetTypeId: 43, assetType: 'NeckAccessory', label: 'Neck Accessory', isAccessory: true, isRefinable: true },
        { assetTypeId: 44, assetType: 'ShoulderAccessory', label: 'Shoulder Accessory', isAccessory: true, isRefinable: true },
        { assetTypeId: 45, assetType: 'FrontAccessory', label: 'Front Accessory', isAccessory: true, isRefinable: true },
        { assetTypeId: 46, assetType: 'BackAccessory', label: 'Back Accessory', isAccessory: true, isRefinable: true },
        { assetTypeId: 47, assetType: 'WaistAccessory', label: 'Waist Accessory', isAccessory: true, isRefinable: true },
        { assetTypeId: 64, assetType: 'TShirtAccessory', label: 'T-Shirt Accessory', isAccessory: true, isLayered: true, meta: { order: 7 } },
        { assetTypeId: 65, assetType: 'ShirtAccessory', label: 'Shirt Accessory', isAccessory: true, isLayered: true, meta: { order: 8 } },
        { assetTypeId: 66, assetType: 'PantsAccessory', label: 'Pants Accessory', isAccessory: true, isLayered: true, meta: { order: 4 } },
        { assetTypeId: 67, assetType: 'JacketAccessory', label: 'Jacket Accessory', isAccessory: true, isLayered: true, meta: { order: 10 } },
        { assetTypeId: 68, assetType: 'SweaterAccessory', label: 'Sweater Accessory', isAccessory: true, isLayered: true, meta: { order: 9 } },
        { assetTypeId: 69, assetType: 'ShortsAccessory', label: 'Shorts Accessory', isAccessory: true, isLayered: true, meta: { order: 5 } },
        { assetTypeId: 70, assetType: 'LeftShoeAccessory', label: 'Left Shoe Accessory', isAccessory: true, isLayered: true, meta: { order: 3 } },
        { assetTypeId: 71, assetType: 'RightShoeAccessory', label: 'Right Shoe Accessory', isAccessory: true, isLayered: true, meta: { order: 3 } },
        { assetTypeId: 72, assetType: 'DressSkirtAccessory', label: 'Dress Skirt Accessory', isAccessory: true, isLayered: true, meta: { order: 6 } },
        { assetTypeId: 76, assetType: 'EyebrowAccessory', label: 'Eyebrow Accessory', isLayered: true, meta: { order: 1 } },
        { assetTypeId: 77, assetType: 'EyelashAccessory', label: 'Eyelash Accessory', isLayered: true, meta: { order: 2 } }
    ];

    var DEFAULT_REFINEMENT_TYPES = [8, 42, 43, 44, 45, 46, 47];
    var DEFAULT_LOWER_BOUNDS = {
        scale: { X: 0.5, Y: 0.5, Z: 0.5 },
        position: { X: -0.5, Y: -0.5, Z: -0.5 },
        rotation: { X: -90, Y: -90, Z: -90 }
    };
    var DEFAULT_UPPER_BOUNDS = {
        scale: { X: 1.5, Y: 1.5, Z: 1.5 },
        position: { X: 0.5, Y: 0.5, Z: 0.5 },
        rotation: { X: 90, Y: 90, Z: 90 }
    };

    var FALLBACK_MESSAGES = {
        adjustAccessories_button: 'Adjust Accessories',
        adjustAccessories_title: 'Adjust Accessories',
        adjustAccessories_subtitle: 'Reposition, rotate, scale, and reorder worn accessories on your avatar.',
        adjustAccessories_back: 'Back',
        adjustAccessories_close: 'Close',
        adjustAccessories_scale: 'Scale',
        adjustAccessories_position: 'Position',
        adjustAccessories_rotation: 'Rotation',
        adjustAccessories_order: 'Order',
        adjustAccessories_orderTooltip: 'Controls the composition order for layered clothing. Items with a higher order appear on top.',
        adjustAccessories_resetToDefault: 'Reset to Default',
        adjustAccessories_noWornAssets: 'You are not currently wearing any adjustable accessories.',
        adjustAccessories_loading: 'Loading worn accessories...',
        adjustAccessories_fetchError: 'An error occurred while fetching your avatar, please try again later.',
        adjustAccessories_updateError: 'Failed to update asset, please try again later.',
        adjustAccessories_removeError: 'Failed to remove worn asset, please try again later.',
        adjustAccessories_saved: 'Saved'
    };

    var enabled = true;
    var observer = null;
    var csrfToken = '';
    var avatarRulesCache = null;
    var cachedUserId = 0;
    var previewPollTimer = null;
    var previewRetryTimers = [];

    var modalState = {
        open: false,
        view: 'list',
        activeTab: 'scale',
        viewType: 'Avatar',
        refreshId: 0,
        userId: 0,
        previewUrls: {
            Avatar: '',
            AvatarHeadShot: '',
            AvatarBust: ''
        },
        previewLoading: false,
        saving: false,
        error: '',
        status: '',
        avatar: null,
        avatarRules: null,
        thumbnails: {},
        selectedAsset: null,
        editingCoordField: {}
    };

    function message(key, substitutions) {
        try {
            if (window.chrome && chrome.i18n && typeof chrome.i18n.getMessage === 'function') {
                var localized = chrome.i18n.getMessage(key, substitutions);
                if (localized) return localized;
            }
        } catch (_) {}
        return FALLBACK_MESSAGES[key] || key;
    }

    function isAvatarPage() {
        return window.location.pathname.toLowerCase().indexOf('/my/avatar') !== -1;
    }

    function getEnabled(value) {
        if (value === undefined || value === null) return true;
        return value === true || !!(value && typeof value === 'object' && value.enabled !== false);
    }

    function cloneValue(val) {
        if (val === null || val === undefined) return val;
        try {
            return JSON.parse(JSON.stringify(val));
        } catch (_) {
            return val;
        }
    }

    function getAssetTypeInfo(idOrName) {
        if (idOrName === null || idOrName === undefined) return null;
        var num = Number(idOrName);
        for (var i = 0; i < ASSET_TYPES.length; i++) {
            var entry = ASSET_TYPES[i];
            if (Number.isFinite(num) && num > 0 && entry.assetTypeId === num) return entry;
            if (typeof idOrName === 'string' && (entry.assetType === idOrName || entry.label === idOrName)) return entry;
        }
        return null;
    }

    function getAssetTypeId(asset) {
        if (!asset || typeof asset !== 'object') return 0;
        var id = asset.assetType && typeof asset.assetType === 'object' ? asset.assetType.id : asset.assetTypeId || asset.assetType;
        var num = Number(id);
        if (Number.isFinite(num) && num > 0) return num;
        var name = asset.assetType && typeof asset.assetType === 'object' ? asset.assetType.name : asset.assetTypeName;
        var info = getAssetTypeInfo(name);
        return info ? info.assetTypeId : 0;
    }

    function getAssetTypeName(asset) {
        var typeId = getAssetTypeId(asset);
        var info = getAssetTypeInfo(typeId);
        if (info) return info.label;
        if (asset && asset.assetType && typeof asset.assetType.name === 'string' && asset.assetType.name) {
            return asset.assetType.name;
        }
        return 'Accessory';
    }

    function isRefinableAsset(asset, rules) {
        var typeId = getAssetTypeId(asset);
        if (typeId === 41) return false;
        if (rules && Array.isArray(rules.accessoryRefinementTypes) && rules.accessoryRefinementTypes.length) {
            return rules.accessoryRefinementTypes.indexOf(typeId) !== -1;
        }
        if (DEFAULT_REFINEMENT_TYPES.indexOf(typeId) !== -1) return true;
        var info = getAssetTypeInfo(typeId);
        return !!(info && info.isRefinable);
    }

    function isLayeredAsset(asset) {
        var typeId = getAssetTypeId(asset);
        var info = getAssetTypeInfo(typeId);
        return !!(info && info.isLayered);
    }

    function isEditableAsset(asset, rules) {
        return isRefinableAsset(asset, rules) || isLayeredAsset(asset);
    }

    function getBoundsForAsset(asset, rules) {
        var typeId = getAssetTypeId(asset);
        var info = getAssetTypeInfo(typeId);
        var key = info ? info.assetType : (asset && asset.assetType && asset.assetType.name) || '';
        var lowerRaw = key && rules && rules.accessoryRefinementLowerBounds && rules.accessoryRefinementLowerBounds[key];
        var upperRaw = key && rules && rules.accessoryRefinementUpperBounds && rules.accessoryRefinementUpperBounds[key];
        if (!lowerRaw || !upperRaw || !lowerRaw.scale || !upperRaw.scale) {
            return {
                lower: cloneValue(DEFAULT_LOWER_BOUNDS),
                upper: cloneValue(DEFAULT_UPPER_BOUNDS)
            };
        }
        return {
            lower: {
                scale: {
                    X: Number(lowerRaw.scale.xScale ?? DEFAULT_LOWER_BOUNDS.scale.X),
                    Y: Number(lowerRaw.scale.yScale ?? DEFAULT_LOWER_BOUNDS.scale.Y),
                    Z: Number(lowerRaw.scale.zScale ?? DEFAULT_LOWER_BOUNDS.scale.Z)
                },
                position: {
                    X: Number(lowerRaw.position.xPosition ?? DEFAULT_LOWER_BOUNDS.position.X),
                    Y: Number(lowerRaw.position.yPosition ?? DEFAULT_LOWER_BOUNDS.position.Y),
                    Z: Number(lowerRaw.position.zPosition ?? DEFAULT_LOWER_BOUNDS.position.Z)
                },
                rotation: {
                    X: Number(lowerRaw.rotation.xRotation ?? DEFAULT_LOWER_BOUNDS.rotation.X),
                    Y: Number(lowerRaw.rotation.yRotation ?? DEFAULT_LOWER_BOUNDS.rotation.Y),
                    Z: Number(lowerRaw.rotation.zRotation ?? DEFAULT_LOWER_BOUNDS.rotation.Z)
                }
            },
            upper: {
                scale: {
                    X: Number(upperRaw.scale.xScale ?? DEFAULT_UPPER_BOUNDS.scale.X),
                    Y: Number(upperRaw.scale.yScale ?? DEFAULT_UPPER_BOUNDS.scale.Y),
                    Z: Number(upperRaw.scale.zScale ?? DEFAULT_UPPER_BOUNDS.scale.Z)
                },
                position: {
                    X: Number(upperRaw.position.xPosition ?? DEFAULT_UPPER_BOUNDS.position.X),
                    Y: Number(upperRaw.position.yPosition ?? DEFAULT_UPPER_BOUNDS.position.Y),
                    Z: Number(upperRaw.position.zPosition ?? DEFAULT_UPPER_BOUNDS.position.Z)
                },
                rotation: {
                    X: Number(upperRaw.rotation.xRotation ?? DEFAULT_UPPER_BOUNDS.rotation.X),
                    Y: Number(upperRaw.rotation.yRotation ?? DEFAULT_UPPER_BOUNDS.rotation.Y),
                    Z: Number(upperRaw.rotation.zRotation ?? DEFAULT_UPPER_BOUNDS.rotation.Z)
                }
            }
        };
    }

    function updateAssetInList(updatedAsset, assetsList, bumpLayeredOrder) {
        var matched = null;
        var out = [];
        var bumped = false;
        var list = Array.isArray(assetsList) ? assetsList : [];
        for (var i = 0; i < list.length; i++) {
            var item = cloneValue(list[i]);
            if (item && Number(item.id) === Number(updatedAsset.id)) {
                matched = item;
            } else if (
                bumpLayeredOrder &&
                updatedAsset.meta &&
                updatedAsset.meta.order !== undefined &&
                item &&
                item.meta &&
                item.meta.order !== undefined &&
                item.meta.order >= updatedAsset.meta.order &&
                isLayeredAsset(item)
            ) {
                bumped = true;
                item.meta.order = Number(item.meta.order) + 1;
            }
            out.push(item);
        }
        if (updatedAsset && updatedAsset.meta && matched) {
            matched.meta = cloneValue(updatedAsset.meta);
            if (isLayeredAsset(updatedAsset) && updatedAsset.meta.order !== undefined) {
                var orderVal = (bumped && matched.meta && matched.meta.order !== undefined)
                    ? matched.meta.order
                    : updatedAsset.meta.order;
                matched.meta.order = orderVal;
            }
        }
        return out;
    }

    function serializeWearingAssets(assetsList) {
        var list = Array.isArray(assetsList) ? assetsList : [];
        return list.map(function (asset) {
            var entry = { id: Number(asset.id) };
            if (asset.meta && typeof asset.meta === 'object') {
                entry.meta = cloneValue(asset.meta);
            }
            return entry;
        });
    }

    function readCsrfTokenFromDom() {
        try {
            var meta = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]');
            if (meta) {
                var tok = meta.getAttribute('data-token') || meta.getAttribute('content') || '';
                if (tok) return tok.trim();
            }
        } catch (_) {}
        return '';
    }

    function readUserIdFromDom() {
        if (cachedUserId > 0) return cachedUserId;
        try {
            var meta = document.querySelector('meta[name="user-data"]');
            if (meta) {
                var raw = meta.getAttribute('data-userid') || meta.getAttribute('data-user-id') || '';
                var parsed = parseInt(raw, 10);
                if (Number.isFinite(parsed) && parsed > 0) {
                    cachedUserId = parsed;
                    return parsed;
                }
            }
        } catch (_) {}
        return 0;
    }

    function resolveCurrentUserId() {
        var domId = readUserIdFromDom();
        if (domId > 0) return Promise.resolve(domId);

        return new Promise(function (resolve) {
            try {
                if (window.chrome && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.get(['robloxUserId'], function (res) {
                        var stored = parseInt(res && res.robloxUserId, 10);
                        if (Number.isFinite(stored) && stored > 0) {
                            cachedUserId = stored;
                            resolve(stored);
                            return;
                        }
                        fetchAuthenticatedUserId().then(resolve);
                    });
                    return;
                }
            } catch (_) {}
            fetchAuthenticatedUserId().then(resolve);
        });
    }

    function fetchAuthenticatedUserId() {
        return fetchJson('https://users.roblox.com/v1/users/authenticated')
            .then(function (data) {
                var id = parseInt(data && data.id, 10);
                if (Number.isFinite(id) && id > 0) {
                    cachedUserId = id;
                    return id;
                }
                return 0;
            })
            .catch(function () {
                return 0;
            });
    }

    function fetchJson(url, options) {
        var opts = Object.assign({ credentials: 'include' }, options || {});
        return fetch(url, opts).then(function (resp) {
            if (!resp.ok) {
                var err = new Error('HTTP ' + resp.status);
                err.status = resp.status;
                throw err;
            }
            return resp.json();
        });
    }

    function postRobloxJson(url, bodyObj) {
        var token = csrfToken || readCsrfTokenFromDom();
        if (token) csrfToken = token;

        function attempt(currentToken, retried) {
            var headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (currentToken) headers['X-CSRF-TOKEN'] = currentToken;
            return fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: headers,
                body: JSON.stringify(bodyObj || {})
            }).then(function (resp) {
                var headerToken = resp.headers && typeof resp.headers.get === 'function'
                    ? (resp.headers.get('x-csrf-token') || resp.headers.get('X-CSRF-TOKEN') || '')
                    : '';
                if (headerToken) csrfToken = headerToken;
                if (resp.status === 403 && !retried && headerToken) {
                    return attempt(headerToken, true);
                }
                if (!resp.ok) {
                    var err = new Error('HTTP ' + resp.status);
                    err.status = resp.status;
                    throw err;
                }
                return resp.json().catch(function () { return { success: true }; });
            });
        }

        return attempt(token, false);
    }

    function fetchAvatarData() {
        return fetchJson('https://avatar.roblox.com/v2/avatar/avatar').catch(function () {
            return fetchJson('https://avatar.roblox.com/v1/avatar');
        });
    }

    function fetchAvatarRules() {
        if (avatarRulesCache) return Promise.resolve(avatarRulesCache);
        return fetchJson('https://avatar.roblox.com/v1/avatar-rules').then(function (rules) {
            if (rules && typeof rules === 'object') avatarRulesCache = rules;
            return avatarRulesCache;
        }).catch(function () {
            return null;
        });
    }

    function fetchAssetThumbnails(assetIds) {
        var ids = (Array.isArray(assetIds) ? assetIds : []).map(Number).filter(Boolean);
        if (!ids.length) return Promise.resolve({});
        var url = 'https://thumbnails.roblox.com/v1/assets?assetIds=' +
            ids.map(encodeURIComponent).join(',') +
            '&size=150x150&format=Png&isCircular=false';
        return fetchJson(url).then(function (data) {
            var out = {};
            var list = data && Array.isArray(data.data) ? data.data : [];
            list.forEach(function (entry) {
                if (entry && entry.targetId && entry.imageUrl) {
                    out[String(entry.targetId)] = entry.imageUrl;
                }
            });
            return out;
        }).catch(function () {
            return {};
        });
    }

    function fetchSingleUser2DThumbnail(userId, viewType) {
        var endpoint = 'avatar';
        if (viewType === 'AvatarHeadShot') endpoint = 'avatar-headshot';
        else if (viewType === 'AvatarBust') endpoint = 'avatar-bust';
        var url = 'https://thumbnails.roblox.com/v1/users/' + endpoint +
            '?userIds=' + encodeURIComponent(userId) +
            '&size=420x420&format=Webp&isCircular=false';
        return fetchJson(url).then(function (res) {
            var entry = res && Array.isArray(res.data) ? res.data[0] : null;
            return entry || null;
        }).catch(function () {
            return null;
        });
    }

    function fetchUser2DPreviewThumbnails(userId, attempt) {
        var uid = Number(userId);
        if (!Number.isFinite(uid) || uid <= 0) return Promise.resolve({});
        var tryNum = Number(attempt) || 0;

        var batchPayload = PREVIEW_TYPES.map(function (t) {
            return {
                requestId: t + ':' + uid,
                targetId: uid,
                type: t,
                size: '420x420',
                format: 'Webp',
                isCircular: false
            };
        });

        return postRobloxJson('https://thumbnails.roblox.com/v1/batch', batchPayload)
            .then(function (res) {
                var list = res && Array.isArray(res.data) ? res.data : [];
                if (!list.length) throw new Error('Empty batch');
                var map = {};
                var pending = false;
                list.forEach(function (item) {
                    if (!item) return;
                    var reqId = String(item.requestId || '');
                    var typeKey = reqId.split(':')[0] || item.type;
                    if (item.state === 'Completed' && item.imageUrl && typeKey) {
                        map[typeKey] = item.imageUrl;
                    } else if (item.state && item.state !== 'Completed' && item.state !== 'Error' && item.state !== 'Blocked') {
                        pending = true;
                    }
                });
                return { map: map, pending: pending };
            })
            .catch(function () {
                return Promise.all(PREVIEW_TYPES.map(function (t) {
                    return fetchSingleUser2DThumbnail(uid, t).then(function (entry) {
                        return { type: t, entry: entry };
                    });
                })).then(function (results) {
                    var map = {};
                    var pending = false;
                    results.forEach(function (r) {
                        if (r.entry && r.entry.state === 'Completed' && r.entry.imageUrl) {
                            map[r.type] = r.entry.imageUrl;
                        } else if (r.entry && r.entry.state && r.entry.state !== 'Completed') {
                            pending = true;
                        }
                    });
                    return { map: map, pending: pending };
                });
            })
            .then(function (outcome) {
                if (!modalState.open) return outcome.map;
                var changed = false;
                PREVIEW_TYPES.forEach(function (t) {
                    if (outcome.map[t] && modalState.previewUrls[t] !== outcome.map[t]) {
                        modalState.previewUrls[t] = outcome.map[t];
                        changed = true;
                    }
                });
                modalState.previewLoading = !!outcome.pending;
                if (changed) {
                    updatePreviewDomNodes();
                } else {
                    updatePreviewLoadingState();
                }
                if (outcome.pending && tryNum < 5 && modalState.open) {
                    var timer = setTimeout(function () {
                        if (modalState.open) fetchUser2DPreviewThumbnails(uid, tryNum + 1);
                    }, 900);
                    previewRetryTimers.push(timer);
                }
                return outcome.map;
            });
    }

    function clearPreviewTimers() {
        if (previewPollTimer) {
            clearInterval(previewPollTimer);
            previewPollTimer = null;
        }
        while (previewRetryTimers.length) {
            clearTimeout(previewRetryTimers.pop());
        }
    }

    function refresh2DPreviewAfterChange() {
        modalState.refreshId += 1;
        modalState.previewLoading = true;
        updatePreviewLoadingState();
        var uid = modalState.userId || readUserIdFromDom();
        if (!uid) return;
        fetchUser2DPreviewThumbnails(uid, 0);
        var t1 = setTimeout(function () {
            if (modalState.open) fetchUser2DPreviewThumbnails(uid, 1);
        }, 750);
        var t2 = setTimeout(function () {
            if (modalState.open) fetchUser2DPreviewThumbnails(uid, 2);
        }, 1800);
        previewRetryTimers.push(t1, t2);
    }

    function updatePreviewLoadingState() {
        var dialog = document.getElementById(DIALOG_ID);
        if (!dialog) return;
        var mainSpan = dialog.querySelector('.thumbnail-preview-container .thumbnail-preview');
        if (mainSpan) {
            mainSpan.classList.toggle('is-prev-thumbnail', !!modalState.previewLoading);
        }
    }

    function updatePreviewDomNodes() {
        var dialog = document.getElementById(DIALOG_ID);
        if (!dialog) return;
        var mainBox = dialog.querySelector('.thumbnail-preview-container');
        if (mainBox) {
            mainBox.classList.toggle('cut-out', modalState.viewType === 'AvatarHeadShot');
            var mainSpan = mainBox.querySelector('.thumbnail-preview');
            if (mainSpan) {
                mainSpan.classList.toggle('is-prev-thumbnail', !!modalState.previewLoading);
                var currentUrl = modalState.previewUrls[modalState.viewType] || '';
                mainSpan.classList.toggle('shimmer', !currentUrl);
                var img = mainSpan.querySelector('img');
                if (currentUrl) {
                    if (!img) {
                        img = document.createElement('img');
                        img.alt = modalState.viewType;
                        mainSpan.appendChild(img);
                    }
                    if (img.getAttribute('src') !== currentUrl) {
                        img.src = currentUrl;
                    }
                }
            }
        }
        PREVIEW_TYPES.forEach(function (t) {
            var navItem = dialog.querySelector('.thumbnail-navigation .avatar[data-view-type="' + t + '"]');
            if (!navItem) return;
            navItem.classList.toggle('selected', modalState.viewType === t);
            var span = navItem.querySelector('.avatar-card-image');
            var url = modalState.previewUrls[t] || '';
            if (span) {
                span.classList.toggle('shimmer', !url);
                var navImg = span.querySelector('img');
                if (url) {
                    if (!navImg) {
                        navImg = document.createElement('img');
                        navImg.alt = t;
                        span.appendChild(navImg);
                    }
                    if (navImg.getAttribute('src') !== url) {
                        navImg.src = url;
                    }
                }
            }
        });
    }

    function triggerAvatarViewerRefresh() {
        try {
            var redrawLink = document.querySelector('.left-wrapper .redraw-avatar a, .redraw-avatar a.text-link');
            if (redrawLink && typeof redrawLink.click === 'function') {
                redrawLink.click();
                return;
            }
            var toggleBtn = document.querySelector('.toggle-three-dee');
            if (toggleBtn && typeof toggleBtn.click === 'function') {
                var origText = (toggleBtn.textContent || '').trim();
                toggleBtn.click();
                setTimeout(function () {
                    try {
                        if ((toggleBtn.textContent || '').trim() !== origText) toggleBtn.click();
                    } catch (_) {}
                }, 150);
            }
        } catch (_) {}
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.left-wrapper .redraw-avatar:has(#' + BUTTON_WRAP_ID + '), .redraw-avatar:has(#' + BUTTON_WRAP_ID + '){display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}',
            '.left-wrapper .redraw-avatar:has(#' + BUTTON_WRAP_ID + ')>a, .redraw-avatar:has(#' + BUTTON_WRAP_ID + ')>a{margin-left:auto}',
            '#' + BUTTON_WRAP_ID + '{display:flex;align-items:center;width:100%;margin-top:8px}',
            '#' + BUTTON_ID + '{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;gap:6px;min-height:36px;height:36px;margin-left:auto;padding:0 14px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.22)))!important;border-radius:8px!important;background:var(--purpura-surface200,var(--color-surface-200,#272930))!important;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))!important;font-size:14px;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;user-select:none;box-shadow:0 1px 3px rgba(0,0,0,.22);transition:background-color .16s ease,border-color .16s ease,transform .12s ease,box-shadow .16s ease}',
            '.light-theme #' + BUTTON_ID + '{background:#f2f4f5!important;color:#393b3d!important;border-color:rgba(0,0,0,.16)!important;box-shadow:0 1px 2px rgba(0,0,0,.06)}',
            '#' + BUTTON_ID + ':hover{border-color:var(--purpura-surface300,rgba(255,255,255,.35))!important;background:var(--purpura-surface300,var(--color-surface-300,#333640))!important;box-shadow:0 3px 8px rgba(0,0,0,.28)}',
            '.light-theme #' + BUTTON_ID + ':hover{background:#e3e5e7!important;border-color:rgba(0,0,0,.25)!important}',
            '#' + BUTTON_ID + ':active{transform:translateY(1px)}',
            '#' + BUTTON_ID + ' .roseal-icon{width:18px;height:18px;flex-shrink:0;display:block}',
            '#' + ITEM_ID + ' #' + BUTTON_ID + '{min-height:28px;height:28px;padding:0 10px;font-size:12px;margin-left:0}',
            '#' + ITEM_ID + ' #' + BUTTON_ID + ' .roseal-icon{width:15px;height:15px}',
            '#UserAvatar{transition:filter .3s ease}',
            'body:has(#' + OVERLAY_ID + ') #UserAvatar{filter:blur(15px)}',

            '#' + OVERLAY_ID + '{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit;overflow-y:auto}',
            '#' + DIALOG_ID + '{display:flex;flex-direction:column;width:min(540px,95vw);max-height:min(860px,92vh);padding:16px 18px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));border-radius:12px;background:var(--purpura-surface100,var(--color-surface-100,#232527));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));box-shadow:0 20px 60px rgba(0,0,0,.55);box-sizing:border-box;overflow:hidden}',
            '.light-theme #' + DIALOG_ID + '{background:#fff;color:#393b3d;border-color:#dee1e3}',
            '#' + DIALOG_ID + ' *{box-sizing:border-box}',
            '.purpura-aa-header{display:flex;align-items:center;gap:10px;padding-bottom:10px;margin-bottom:8px;border-bottom:1px solid var(--purpura-surface300,rgba(255,255,255,.12));flex-shrink:0}',
            '.light-theme .purpura-aa-header{border-bottom-color:rgba(0,0,0,.1)}',
            '.purpura-aa-header h2{margin:0;font-size:18px;font-weight:700;flex:1;text-align:center;color:inherit}',
            '.purpura-aa-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;cursor:pointer;flex-shrink:0;transition:background-color .15s ease}',
            '.purpura-aa-icon-btn:hover{background:rgba(128,128,128,.18)}',
            '.purpura-aa-error{margin:0 0 8px;padding:8px 10px;border-radius:8px;background:rgba(239,68,68,.14);border:1px solid rgba(239,68,68,.35);color:#f87171;font-size:12px;flex-shrink:0}',
            '.purpura-aa-status{font-size:11px;color:var(--purpura-secondaryText,#a3a3a3);flex-shrink:0}',

            '.advanced-customization-modal .advanced-customization-content{display:flex;flex-direction:column;min-height:0;flex:1;overflow-y:auto}',
            '.advanced-customization-modal .thumbnail-navigation-container{display:flex;flex-direction:column;padding-bottom:8px;align-items:center;margin-bottom:10px;border-bottom:1px solid var(--purpura-surface300,rgba(255,255,255,.12));flex-shrink:0}',
            '.light-theme .advanced-customization-modal .thumbnail-navigation-container{border-bottom-color:rgba(0,0,0,.1)}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container{margin-bottom:10px;border-radius:8px;background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.12),rgba(0,0,0,.22));display:flex;align-items:center;justify-content:center;overflow:hidden;width:200px!important;height:200px!important;position:relative}',
            '.light-theme .advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container{background:#f2f4f5}',
            '@media(min-height:1000px){.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container,.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container .thumbnail-preview{width:260px!important;height:260px!important}}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container .thumbnail-preview{width:200px!important;height:200px!important;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity .2s ease}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container .thumbnail-preview.is-prev-thumbnail{opacity:.35}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container .thumbnail-preview img{width:100%;height:100%;object-fit:contain;display:block}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container.cut-out .thumbnail-preview{position:relative}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-preview-container.cut-out .thumbnail-preview::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle closest-side,transparent 50%,rgba(0,0,0,.5) 50%);z-index:1;pointer-events:none}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-navigation{padding-bottom:4px;display:flex;justify-content:center;gap:6px}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-navigation .avatar{width:36px;height:36px;border-radius:50%;overflow:hidden;opacity:.3;cursor:pointer;transition:opacity .2s ease;background:#d0d0d0;display:flex;align-items:center;justify-content:center}',
            '.light-theme .advanced-customization-modal .thumbnail-navigation-container .thumbnail-navigation .avatar{background:#888}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-navigation .avatar.selected{opacity:1}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-navigation .avatar .avatar-card-image{width:100%;height:100%;display:block}',
            '.advanced-customization-modal .thumbnail-navigation-container .thumbnail-navigation .avatar .avatar-card-image img{width:100%;height:100%;object-fit:cover;display:block}',

            '.advanced-customization-modal .assets-list-container{display:flex;flex-direction:column;min-height:0;flex:1}',
            '.advanced-customization-modal .assets-list{list-style:none;margin:4px 0 0;padding:0;max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:4px}',
            '.advanced-customization-modal .assets-list-empty{padding:28px 16px;text-align:center;color:var(--purpura-secondaryText,#a3a3a3);font-size:13px}',
            '.advanced-customization-modal .asset-details-container{display:flex;align-items:center;gap:10px;padding:6px 8px;border:1px solid var(--purpura-surface300,rgba(255,255,255,.08));border-radius:8px;background:var(--purpura-surface200,rgba(255,255,255,.04))}',
            '.light-theme .advanced-customization-modal .asset-details-container{background:#f2f4f5;border-color:rgba(0,0,0,.08)}',
            '.advanced-customization-modal .asset-thumbnail{width:64px;height:64px;border-radius:8px;overflow:hidden;background:var(--purpura-surface300,#2b2c32);flex-shrink:0;display:flex;align-items:center;justify-content:center}',
            '.light-theme .advanced-customization-modal .asset-thumbnail{background:#dee1e3}',
            '.advanced-customization-modal .asset-thumbnail img{width:100%;height:100%;object-fit:cover;display:block}',
            '.advanced-customization-modal .asset-details{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}',
            '.advanced-customization-modal .asset-name{font-size:14px;font-weight:600;color:inherit;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.advanced-customization-modal .asset-name:hover{text-decoration:underline}',
            '.advanced-customization-modal .asset-type-name{font-size:12px;color:var(--purpura-secondaryText,#a3a3a3)}',
            '.advanced-customization-modal .asset-actions{margin-left:auto;margin-right:4px;display:flex;align-items:center;gap:5px;flex-shrink:0}',
            '.advanced-customization-modal .asset-layered-order{font-size:12px;color:var(--purpura-secondaryText,#a3a3a3);margin-right:4px}',
            '.advanced-customization-modal .roseal-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:8px;background:transparent;color:inherit;cursor:pointer;transition:background-color .15s ease}',
            '.advanced-customization-modal .roseal-btn:hover{background:rgba(255,255,255,.12)}',
            '.light-theme .advanced-customization-modal .roseal-btn:hover{background:rgba(0,0,0,.1)}',
            '.advanced-customization-modal .roseal-btn .roseal-icon{width:24px;height:24px;display:block}',
            '.advanced-customization-modal .asset-configuration-container{display:flex;flex-direction:column;gap:14px;padding:4px 6px 12px}',
            '.advanced-customization-modal .asset-configuration{display:flex;flex-direction:column;gap:16px}',
            '.advanced-customization-modal .refinement-asset-configuration-container{display:flex;flex-direction:column;gap:10px;padding:0 4px}',
            '.advanced-customization-modal .refinement-title{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
            '.advanced-customization-modal .roseal-pill-toggle{display:inline-flex;background:var(--purpura-surface200,#191b1d);border-radius:24px;padding:2px;gap:2px}',
            '.light-theme .advanced-customization-modal .roseal-pill-toggle{background:#dee1e3}',
            '.advanced-customization-modal .pill-item{position:relative;flex:1}',
            '.advanced-customization-modal .pill-input{display:none}',
            '.advanced-customization-modal .pill-label{display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;line-height:20px;font-weight:700;color:var(--purpura-secondaryText,#a3a3a3);cursor:pointer;user-select:none;transition:background-color .15s ease,color .15s ease}',
            '.advanced-customization-modal .pill-label.checked-label{background:var(--purpura-surface300,#393b3d);color:#fff}',
            '.light-theme .advanced-customization-modal .pill-label.checked-label{background:#fff;color:#393b3d}',
            '.advanced-customization-modal .refinement-reset{padding:4px 8px;border:none;border-radius:6px;background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline}',
            '.advanced-customization-modal .refinement-reset:hover{opacity:.8}',
            '.advanced-customization-modal .xyz-coords-fields{display:flex;flex-direction:column;gap:10px;width:100%}',
            '.advanced-customization-modal .config-section{display:flex;flex-direction:column;gap:4px;width:100%}',
            '.advanced-customization-modal .section-label{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700}',
            '.advanced-customization-modal .section-label .title-label{display:flex;align-items:center;gap:4px}',
            '.advanced-customization-modal .section-label .value-label{margin-left:auto;margin-right:4px;font-size:13px;font-weight:600}',
            '.advanced-customization-modal .section-label .value-input{margin-left:auto;margin-right:4px;width:80px;height:28px;padding:2px 8px;border:1px solid var(--purpura-surface300,rgba(255,255,255,.22));border-radius:6px;background:var(--purpura-surface200,#2b2c32);color:inherit;font-size:12px}',
            '.light-theme .advanced-customization-modal .section-label .value-input{background:#f2f4f5;border-color:rgba(0,0,0,.2)}',
            '.advanced-customization-modal .coord-edit-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--purpura-secondaryText,#a3a3a3);cursor:pointer}',
            '.advanced-customization-modal .coord-edit-btn:hover{background:rgba(128,128,128,.18);color:inherit}',
            '.advanced-customization-modal .roseal-range{width:100%;accent-color:var(--purpura-playButton,var(--color-action-emphasis,#fff));cursor:pointer}',
            '.advanced-customization-modal .roseal-disabled{opacity:.45;pointer-events:none}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    function formatCoordValue(val, isPercent) {
        var num = Number(val);
        if (!Number.isFinite(num)) num = isPercent ? 1 : 0;
        if (isPercent) {
            return Math.round(num * 100) + '%';
        }
        var rounded = Math.round(num * 10000) / 10000;
        return String(rounded);
    }

    function clampNumber(val, min, max, fallback) {
        var num = Number(val);
        if (!Number.isFinite(num)) return fallback;
        if (Number.isFinite(min) && num < min) return min;
        if (Number.isFinite(max) && num > max) return max;
        return num;
    }

    function persistUpdatedAsset(nextAsset) {
        if (!modalState.avatar || !Array.isArray(modalState.avatar.assets)) return Promise.resolve(false);
        var updatedAssets = updateAssetInList(nextAsset, modalState.avatar.assets, false);
        var payloadAssets = serializeWearingAssets(updatedAssets);
        modalState.saving = true;
        modalState.error = '';
        modalState.status = '';
        renderModalContent();

        return postRobloxJson('https://avatar.roblox.com/v2/avatar/set-wearing-assets', { assets: payloadAssets })
            .then(function (res) {
                if (res && res.success === false) {
                    throw new Error('set-wearing-assets returned success:false');
                }
                modalState.avatar.assets = updatedAssets;
                modalState.selectedAsset = cloneValue(nextAsset);
                modalState.saving = false;
                modalState.status = message('adjustAccessories_saved');
                renderModalContent();
                refresh2DPreviewAfterChange();
                triggerAvatarViewerRefresh();
                return true;
            })
            .catch(function () {
                modalState.saving = false;
                modalState.error = message('adjustAccessories_updateError');
                renderModalContent();
                return false;
            });
    }

    function removeAssetFromAvatar(assetId) {
        if (!modalState.avatar || !Array.isArray(modalState.avatar.assets)) return Promise.resolve(false);
        var remaining = modalState.avatar.assets.filter(function (a) {
            return Number(a && a.id) !== Number(assetId);
        });
        var payloadAssets = serializeWearingAssets(remaining);
        modalState.saving = true;
        modalState.error = '';
        renderModalContent();

        return postRobloxJson('https://avatar.roblox.com/v2/avatar/set-wearing-assets', { assets: payloadAssets })
            .then(function (res) {
                if (res && res.success === false) {
                    throw new Error('set-wearing-assets returned success:false');
                }
                modalState.avatar.assets = remaining;
                modalState.saving = false;
                renderModalContent();
                refresh2DPreviewAfterChange();
                triggerAvatarViewerRefresh();
                return true;
            })
            .catch(function () {
                modalState.saving = false;
                modalState.error = message('adjustAccessories_removeError');
                renderModalContent();
                return false;
            });
    }

    function createThumbnailPreviewSection() {
        var navContainer = document.createElement('div');
        navContainer.className = 'thumbnail-navigation-container';

        var previewContainer = document.createElement('div');
        previewContainer.className = 'thumbnail-preview-container avatar-back thumbnail-2d-preview-container' +
            (modalState.viewType === 'AvatarHeadShot' ? ' cut-out' : '');

        var currentUrl = modalState.previewUrls[modalState.viewType] || '';
        var previewSpan = document.createElement('span');
        previewSpan.className = 'thumbnail-2d-container roseal-thumbnail-2d-container thumbnail-preview' +
            (!currentUrl ? ' shimmer' : '') +
            (modalState.previewLoading ? ' is-prev-thumbnail' : '');

        if (currentUrl) {
            var previewImg = document.createElement('img');
            previewImg.src = currentUrl;
            previewImg.alt = modalState.viewType;
            previewSpan.appendChild(previewImg);
        }
        previewContainer.appendChild(previewSpan);
        navContainer.appendChild(previewContainer);

        var navRow = document.createElement('div');
        navRow.className = 'thumbnail-navigation';

        var viewClasses = {
            Avatar: 'avatar-selection',
            AvatarHeadShot: 'avatar-headshot-selection',
            AvatarBust: 'avatar-bust-selection'
        };

        PREVIEW_TYPES.forEach(function (viewType) {
            var avatarBtn = document.createElement('div');
            avatarBtn.className = 'avatar avatar-headshot-xs ' + viewClasses[viewType] +
                (modalState.viewType === viewType ? ' selected' : '');
            avatarBtn.dataset.viewType = viewType;

            var cardSpan = document.createElement('span');
            var thumbUrl = modalState.previewUrls[viewType] || '';
            cardSpan.className = 'thumbnail-2d-container roseal-thumbnail-2d-container avatar-card-image' +
                (!thumbUrl ? ' shimmer' : '');
            if (thumbUrl) {
                var navImg = document.createElement('img');
                navImg.src = thumbUrl;
                navImg.alt = viewType;
                cardSpan.appendChild(navImg);
            }
            avatarBtn.appendChild(cardSpan);
            avatarBtn.addEventListener('click', function () {
                if (modalState.viewType === viewType) return;
                modalState.viewType = viewType;
                updatePreviewDomNodes();
            });
            navRow.appendChild(avatarBtn);
        });

        navContainer.appendChild(navRow);
        return navContainer;
    }

    function createAssetRowElement(asset) {
        var li = document.createElement('li');
        li.className = 'asset-details-container';
        li.dataset.assetId = String(asset.id);

        var thumbWrap = document.createElement('div');
        thumbWrap.className = 'asset-thumbnail';
        var thumbUrl = modalState.thumbnails[String(asset.id)];
        if (thumbUrl) {
            var img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = asset.name || ('Asset ' + asset.id);
            thumbWrap.appendChild(img);
        }
        li.appendChild(thumbWrap);

        var details = document.createElement('div');
        details.className = 'asset-details text-overflow';
        var nameLink = document.createElement('a');
        nameLink.className = 'asset-name text-overflow text-link';
        nameLink.href = 'https://www.roblox.com/catalog/' + encodeURIComponent(asset.id);
        nameLink.target = '_blank';
        nameLink.rel = 'noopener noreferrer';
        nameLink.textContent = asset.name || ('Asset ' + asset.id);
        var typeDiv = document.createElement('div');
        typeDiv.className = 'asset-type-name text-overflow text small';
        typeDiv.textContent = getAssetTypeName(asset);
        details.appendChild(nameLink);
        details.appendChild(typeDiv);
        li.appendChild(details);

        var actions = document.createElement('div');
        actions.className = 'asset-actions';

        if (isEditableAsset(asset, modalState.avatarRules)) {
            if (asset.meta && asset.meta.order !== undefined) {
                var orderBadge = document.createElement('div');
                orderBadge.className = 'asset-layered-order text small';
                orderBadge.textContent = message('adjustAccessories_order') + ': ' + asset.meta.order;
                actions.appendChild(orderBadge);
            }
            var editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'roseal-btn edit-item-btn';
            editBtn.setAttribute('aria-label', message('adjustAccessories_title'));
            editBtn.innerHTML = EDIT_ICON_SVG;
            editBtn.addEventListener('click', function () {
                modalState.selectedAsset = cloneValue(asset);
                modalState.view = 'asset';
                modalState.activeTab = 'scale';
                modalState.editingCoordField = {};
                modalState.error = '';
                modalState.status = '';
                renderModalContent();
            });
            actions.appendChild(editBtn);
        }

        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'roseal-btn remove-item-btn';
        removeBtn.setAttribute('aria-label', 'Remove');
        removeBtn.innerHTML = CLOSE_ICON_SVG;
        removeBtn.addEventListener('click', function () {
            removeAssetFromAvatar(asset.id);
        });
        actions.appendChild(removeBtn);

        li.appendChild(actions);
        return li;
    }

    function createCoordFieldElement(opts) {
        var section = document.createElement('div');
        section.className = 'coord-field font-bold config-section';
        if (opts.axis) section.dataset.axis = opts.axis;

        var labelRow = document.createElement('div');
        labelRow.className = 'section-label';

        if (opts.label) {
            var titleWrap = document.createElement('div');
            titleWrap.className = 'title-label';
            var titleText = document.createElement('span');
            titleText.className = 'title-label-text';
            titleText.textContent = opts.label;
            titleWrap.appendChild(titleText);
            labelRow.appendChild(titleWrap);
        }

        var isEditingNumber = !!modalState.editingCoordField[opts.fieldKey];
        var valueLabel = document.createElement('div');
        valueLabel.className = 'value-label';
        valueLabel.textContent = formatCoordValue(opts.value, opts.showTotal);

        var numberInput = document.createElement('input');
        numberInput.type = 'number';
        numberInput.className = 'value-input';
        var displayMin = opts.showTotal ? opts.min * 100 : opts.min;
        var displayMax = opts.showTotal ? opts.max * 100 : opts.max;
        var displayVal = opts.showTotal ? Math.round(opts.value * 100) : opts.value;
        numberInput.min = String(displayMin);
        numberInput.max = String(displayMax);
        numberInput.step = opts.showTotal ? '1' : '0.01';
        numberInput.value = String(displayVal);

        if (isEditingNumber) {
            labelRow.appendChild(numberInput);
        } else {
            labelRow.appendChild(valueLabel);
        }

        var editToggleBtn = document.createElement('button');
        editToggleBtn.type = 'button';
        editToggleBtn.className = 'coord-edit-btn';
        editToggleBtn.innerHTML = NUMBER_EDIT_SVG;
        editToggleBtn.addEventListener('click', function () {
            modalState.editingCoordField[opts.fieldKey] = !modalState.editingCoordField[opts.fieldKey];
            renderModalContent();
        });
        labelRow.appendChild(editToggleBtn);
        section.appendChild(labelRow);

        var range = document.createElement('input');
        range.type = 'range';
        range.className = 'roseal-range';
        range.min = String(opts.min);
        range.max = String(opts.max);
        range.step = String(opts.step || 0.01);
        range.value = String(opts.value);

        range.addEventListener('input', function () {
            var nextVal = clampNumber(parseFloat(range.value), opts.min, opts.max, opts.value);
            valueLabel.textContent = formatCoordValue(nextVal, opts.showTotal);
            if (opts.onLiveUpdate) opts.onLiveUpdate(nextVal);
        });
        range.addEventListener('change', function () {
            var nextVal = clampNumber(parseFloat(range.value), opts.min, opts.max, opts.value);
            opts.onCommit(nextVal);
        });

        numberInput.addEventListener('change', function () {
            var raw = parseFloat(numberInput.value);
            if (!Number.isFinite(raw)) return;
            var scaled = opts.showTotal ? raw / 100 : raw;
            var clamped = clampNumber(scaled, opts.min, opts.max, opts.value);
            opts.onCommit(clamped);
        });

        section.appendChild(range);
        return section;
    }

    function renderAssetEditorView(container) {
        var asset = modalState.selectedAsset;
        if (!asset) {
            modalState.view = 'list';
            renderListView(container);
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'asset-configuration-container text-emphasis';

        var headerRow = document.createElement('div');
        headerRow.className = 'asset-details-container';
        var thumbWrap = document.createElement('div');
        thumbWrap.className = 'asset-thumbnail';
        var thumbUrl = modalState.thumbnails[String(asset.id)];
        if (thumbUrl) {
            var img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = asset.name || ('Asset ' + asset.id);
            thumbWrap.appendChild(img);
        }
        headerRow.appendChild(thumbWrap);

        var details = document.createElement('div');
        details.className = 'asset-details text-overflow';
        var nameLink = document.createElement('a');
        nameLink.className = 'asset-name text-overflow text-link';
        nameLink.href = 'https://www.roblox.com/catalog/' + encodeURIComponent(asset.id);
        nameLink.target = '_blank';
        nameLink.rel = 'noopener noreferrer';
        nameLink.textContent = asset.name || ('Asset ' + asset.id);
        var typeDiv = document.createElement('div');
        typeDiv.className = 'asset-type-name text text-overflow small';
        typeDiv.textContent = getAssetTypeName(asset);
        details.appendChild(nameLink);
        details.appendChild(typeDiv);
        headerRow.appendChild(details);
        wrapper.appendChild(headerRow);

        var configBody = document.createElement('div');
        configBody.className = 'asset-configuration';

        var layered = isLayeredAsset(asset);
        var refinable = isRefinableAsset(asset, modalState.avatarRules);

        var layeredContainer = document.createElement('div');
        layeredContainer.className = 'layered-asset-configuration configuration-container' +
            ((!layered || modalState.saving) ? ' roseal-disabled' : '');
        var orderSection = document.createElement('div');
        orderSection.className = 'config-section font-bold text-emphasis order-section';
        var orderLabelRow = document.createElement('div');
        orderLabelRow.className = 'section-label';
        var orderTitle = document.createElement('div');
        orderTitle.className = 'title-label';
        orderTitle.title = message('adjustAccessories_orderTooltip');
        var orderTitleText = document.createElement('span');
        orderTitleText.className = 'title-label-text';
        orderTitleText.textContent = message('adjustAccessories_order');
        orderTitle.appendChild(orderTitleText);
        var currentOrder = asset.meta && asset.meta.order !== undefined ? Number(asset.meta.order) : 0;
        var orderValueLabel = document.createElement('div');
        orderValueLabel.className = 'value-label';
        orderValueLabel.textContent = String(currentOrder);
        orderLabelRow.appendChild(orderTitle);
        orderLabelRow.appendChild(orderValueLabel);
        orderSection.appendChild(orderLabelRow);

        var maxOrder = currentOrder;
        if (modalState.avatar && Array.isArray(modalState.avatar.assets)) {
            modalState.avatar.assets.forEach(function (item) {
                var itemOrder = (item && item.meta && item.meta.order !== undefined) ? Number(item.meta.order) : 0;
                var extra = Number(item && item.id) === Number(asset.id) ? 0 : 1;
                if (itemOrder + extra > maxOrder) maxOrder = itemOrder + extra;
            });
        }
        if (maxOrder < 10) maxOrder = 10;

        var orderRange = document.createElement('input');
        orderRange.type = 'range';
        orderRange.className = 'roseal-range order-range';
        orderRange.min = '0';
        orderRange.max = String(maxOrder);
        orderRange.step = '1';
        orderRange.value = String(currentOrder);
        orderRange.addEventListener('input', function () {
            var val = Math.round(Number(orderRange.value) || 0);
            orderValueLabel.textContent = String(val);
            asset.meta = Object.assign({}, asset.meta || {}, { order: val });
        });
        orderRange.addEventListener('change', function () {
            var val = Math.round(Number(orderRange.value) || 0);
            var nextAsset = cloneValue(asset);
            nextAsset.meta = Object.assign({}, nextAsset.meta || {}, { order: val });
            persistUpdatedAsset(nextAsset);
        });
        orderSection.appendChild(orderRange);
        layeredContainer.appendChild(orderSection);
        configBody.appendChild(layeredContainer);

        var refinementContainer = document.createElement('div');
        refinementContainer.className = 'refinement-asset-configuration-container' +
            ((!refinable || modalState.saving) ? ' roseal-disabled' : '');

        var refinementHeader = document.createElement('div');
        refinementHeader.className = 'refinement-title';

        var pillGroup = document.createElement('div');
        pillGroup.className = 'roseal-pill-toggle refinement-toggle';
        REFINEMENT_TABS.forEach(function (tabId) {
            var pillItem = document.createElement('div');
            pillItem.className = 'pill-item';
            var radio = document.createElement('input');
            radio.className = 'pill-input';
            radio.type = 'radio';
            radio.value = tabId;
            radio.checked = modalState.activeTab === tabId;
            var label = document.createElement('label');
            label.className = 'pill-label' + (modalState.activeTab === tabId ? ' checked-label' : '');
            label.dataset.tab = tabId;
            label.textContent = message('adjustAccessories_' + tabId);
            label.addEventListener('click', function () {
                modalState.activeTab = tabId;
                modalState.editingCoordField = {};
                renderModalContent();
            });
            pillItem.appendChild(radio);
            pillItem.appendChild(label);
            pillGroup.appendChild(pillItem);
        });
        refinementHeader.appendChild(pillGroup);

        var activeTab = modalState.activeTab;
        var defaultCoordVal = activeTab === 'scale' ? 1 : 0;

        var resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'refinement-reset';
        resetBtn.textContent = message('adjustAccessories_resetToDefault');
        resetBtn.addEventListener('click', function () {
            var defVal = modalState.activeTab === 'scale' ? 1 : 0;
            var nextAsset = cloneValue(asset);
            nextAsset.meta = Object.assign({}, nextAsset.meta || {});
            nextAsset.meta[modalState.activeTab] = { X: defVal, Y: defVal, Z: defVal };
            modalState.selectedAsset = nextAsset;
            persistUpdatedAsset(nextAsset);
        });
        refinementHeader.appendChild(resetBtn);
        refinementContainer.appendChild(refinementHeader);

        var bounds = getBoundsForAsset(asset, modalState.avatarRules);
        var lower = bounds.lower[activeTab] || DEFAULT_LOWER_BOUNDS[activeTab];
        var upper = bounds.upper[activeTab] || DEFAULT_UPPER_BOUNDS[activeTab];
        var currentCoords = (asset.meta && asset.meta[activeTab])
            ? asset.meta[activeTab]
            : { X: defaultCoordVal, Y: defaultCoordVal, Z: defaultCoordVal };

        var coordsBox = document.createElement('div');
        coordsBox.className = 'refinement-asset-configuration configuration-container';
        var xyzFields = document.createElement('div');
        xyzFields.className = 'xyz-coords-fields';

        var isScale = activeTab === 'scale';
        var stepVal = activeTab === 'rotation' ? 1 : 0.01;

        function commitCoordUpdate(nextCoords) {
            var nextAsset = cloneValue(asset);
            nextAsset.meta = Object.assign({}, nextAsset.meta || {});
            nextAsset.meta[activeTab] = {
                X: Number(nextCoords.X),
                Y: Number(nextCoords.Y),
                Z: Number(nextCoords.Z)
            };
            modalState.selectedAsset = nextAsset;
            persistUpdatedAsset(nextAsset);
        }

        xyzFields.appendChild(createCoordFieldElement({
            axis: 'X',
            fieldKey: activeTab + '_X',
            label: isScale ? '' : 'X',
            showTotal: isScale,
            value: Number(currentCoords.X ?? defaultCoordVal),
            min: Number(lower.X),
            max: Number(upper.X),
            step: stepVal,
            onLiveUpdate: function (val) {
                asset.meta = Object.assign({}, asset.meta || {});
                if (isScale) {
                    asset.meta[activeTab] = { X: val, Y: val, Z: val };
                } else {
                    asset.meta[activeTab] = Object.assign({}, currentCoords, { X: val });
                }
            },
            onCommit: function (val) {
                if (isScale) {
                    commitCoordUpdate({ X: val, Y: val, Z: val });
                } else {
                    commitCoordUpdate({ X: val, Y: currentCoords.Y ?? defaultCoordVal, Z: currentCoords.Z ?? defaultCoordVal });
                }
            }
        }));

        if (!isScale) {
            xyzFields.appendChild(createCoordFieldElement({
                axis: 'Y',
                fieldKey: activeTab + '_Y',
                label: 'Y',
                showTotal: false,
                value: Number(currentCoords.Y ?? defaultCoordVal),
                min: Number(lower.Y),
                max: Number(upper.Y),
                step: stepVal,
                onLiveUpdate: function (val) {
                    asset.meta = Object.assign({}, asset.meta || {});
                    asset.meta[activeTab] = Object.assign({}, currentCoords, { Y: val });
                },
                onCommit: function (val) {
                    commitCoordUpdate({ X: currentCoords.X ?? defaultCoordVal, Y: val, Z: currentCoords.Z ?? defaultCoordVal });
                }
            }));

            xyzFields.appendChild(createCoordFieldElement({
                axis: 'Z',
                fieldKey: activeTab + '_Z',
                label: 'Z',
                showTotal: false,
                value: Number(currentCoords.Z ?? defaultCoordVal),
                min: Number(lower.Z),
                max: Number(upper.Z),
                step: stepVal,
                onLiveUpdate: function (val) {
                    asset.meta = Object.assign({}, asset.meta || {});
                    asset.meta[activeTab] = Object.assign({}, currentCoords, { Z: val });
                },
                onCommit: function (val) {
                    commitCoordUpdate({ X: currentCoords.X ?? defaultCoordVal, Y: currentCoords.Y ?? defaultCoordVal, Z: val });
                }
            }));
        }

        coordsBox.appendChild(xyzFields);
        refinementContainer.appendChild(coordsBox);
        configBody.appendChild(refinementContainer);
        wrapper.appendChild(configBody);
        container.appendChild(wrapper);
    }

    function renderListView(container) {
        if (!modalState.avatar) {
            var emptyLoading = document.createElement('div');
            emptyLoading.className = 'assets-list-empty';
            emptyLoading.textContent = modalState.error || message('adjustAccessories_loading');
            container.appendChild(emptyLoading);
            return;
        }

        var assets = Array.isArray(modalState.avatar.assets) ? modalState.avatar.assets : [];
        var editableAssets = assets.filter(function (asset) {
            return isEditableAsset(asset, modalState.avatarRules);
        });

        if (!editableAssets.length) {
            var empty = document.createElement('div');
            empty.className = 'assets-list-empty';
            empty.textContent = message('adjustAccessories_noWornAssets');
            container.appendChild(empty);
            return;
        }

        var ul = document.createElement('ul');
        ul.className = 'assets-list list-striped' + (modalState.saving ? ' roseal-disabled' : '');
        editableAssets.forEach(function (asset) {
            ul.appendChild(createAssetRowElement(asset));
        });
        container.appendChild(ul);
    }

    function renderModalContent() {
        var dialog = document.getElementById(DIALOG_ID);
        if (!dialog) return;
        dialog.textContent = '';

        var header = document.createElement('div');
        header.className = 'purpura-aa-header modal-title';

        if (modalState.view === 'asset') {
            var backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.className = 'purpura-aa-icon-btn back-arrow';
            backBtn.setAttribute('aria-label', message('adjustAccessories_back'));
            backBtn.innerHTML = BACK_ICON_SVG;
            backBtn.addEventListener('click', function () {
                modalState.view = 'list';
                modalState.selectedAsset = null;
                modalState.error = '';
                modalState.status = '';
                renderModalContent();
            });
            header.appendChild(backBtn);
        }

        var title = document.createElement('h2');
        title.className = 'page-name';
        title.textContent = message('adjustAccessories_title');
        header.appendChild(title);

        if (modalState.status) {
            var statusEl = document.createElement('span');
            statusEl.className = 'purpura-aa-status';
            statusEl.textContent = modalState.status;
            header.appendChild(statusEl);
        }

        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'purpura-aa-icon-btn purpura-aa-close';
        closeBtn.setAttribute('aria-label', message('adjustAccessories_close'));
        closeBtn.innerHTML = CLOSE_ICON_SVG;
        closeBtn.addEventListener('click', closeModal);
        header.appendChild(closeBtn);

        dialog.appendChild(header);

        if (modalState.error) {
            var errEl = document.createElement('div');
            errEl.className = 'purpura-aa-error text-error';
            errEl.textContent = modalState.error;
            dialog.appendChild(errEl);
        }

        var contentWrap = document.createElement('div');
        contentWrap.className = 'advanced-customization-content';

        var leftCol = document.createElement('div');
        leftCol.className = 'advanced-customization-left';
        leftCol.appendChild(createThumbnailPreviewSection());
        contentWrap.appendChild(leftCol);

        var rightCol = document.createElement('div');
        rightCol.className = 'advanced-customization-right';
        var body = document.createElement('div');
        body.className = 'assets-list-container page-container' + (modalState.view !== 'asset' ? ' max-size' : '');
        if (modalState.view === 'asset') {
            renderAssetEditorView(body);
        } else {
            renderListView(body);
        }
        rightCol.appendChild(body);
        contentWrap.appendChild(rightCol);

        dialog.appendChild(contentWrap);
    }

    function onKeyDown(e) {
        if (e.key === 'Escape') closeModal();
    }

    function closeModal() {
        modalState.open = false;
        clearPreviewTimers();
        var overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.remove();
        document.removeEventListener('keydown', onKeyDown);
    }

    function openModal() {
        if (document.getElementById(OVERLAY_ID)) return;
        addStyles();
        clearPreviewTimers();

        modalState.open = true;
        modalState.view = 'list';
        modalState.activeTab = 'scale';
        modalState.viewType = 'Avatar';
        modalState.refreshId += 1;
        modalState.previewLoading = false;
        modalState.saving = false;
        modalState.error = '';
        modalState.status = '';
        modalState.avatar = null;
        modalState.selectedAsset = null;
        modalState.editingCoordField = {};

        var overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.className = 'advanced-customization-modal';
        var dialog = document.createElement('div');
        dialog.id = DIALOG_ID;
        overlay.appendChild(dialog);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });
        document.body.appendChild(overlay);
        document.addEventListener('keydown', onKeyDown);

        renderModalContent();

        resolveCurrentUserId().then(function (uid) {
            if (!modalState.open) return;
            if (uid > 0) {
                modalState.userId = uid;
                fetchUser2DPreviewThumbnails(uid, 0);
                previewPollTimer = setInterval(function () {
                    if (modalState.open && modalState.userId > 0) {
                        fetchUser2DPreviewThumbnails(modalState.userId, 0);
                    }
                }, 10000);
            }
        });

        Promise.all([fetchAvatarData(), fetchAvatarRules()])
            .then(function (results) {
                if (!modalState.open) return;
                var avatar = results[0];
                var rules = results[1];
                if (!avatar || !Array.isArray(avatar.assets)) {
                    modalState.error = message('adjustAccessories_fetchError');
                    renderModalContent();
                    return;
                }
                modalState.avatar = avatar;
                modalState.avatarRules = rules;
                renderModalContent();

                var ids = avatar.assets.map(function (a) { return a && a.id; }).filter(Boolean);
                return fetchAssetThumbnails(ids).then(function (thumbs) {
                    if (!modalState.open) return;
                    modalState.thumbnails = Object.assign({}, modalState.thumbnails, thumbs);
                    renderModalContent();
                });
            })
            .catch(function () {
                if (!modalState.open) return;
                modalState.error = message('adjustAccessories_fetchError');
                renderModalContent();
            });
    }

    function findRedrawContainer() {
        return (
            document.querySelector('.left-wrapper .redraw-avatar') ||
            document.querySelector('#avatar-web-app .redraw-avatar') ||
            document.querySelector('.redraw-avatar')
        );
    }

    function injectButton() {
        if (!enabled || !isAvatarPage() || !document.body) return;
        if (document.getElementById(BUTTON_ID)) return;

        var redrawContainer = findRedrawContainer();
        var breadcrumb = document.querySelector('.breadcrumb-container');
        if (!redrawContainer && !breadcrumb) return;

        addStyles();
        var button = document.createElement('button');
        button.type = 'button';
        button.id = BUTTON_ID;
        button.className = 'btn-secondary-md btn-min-width purpura-adjust-accessories-btn';
        button.innerHTML = EDIT_ICON_SVG + '<span>' + message('adjustAccessories_button') + '</span>';
        button.addEventListener('click', openModal);

        if (redrawContainer) {
            var wrap = document.createElement('div');
            wrap.id = BUTTON_WRAP_ID;
            wrap.appendChild(button);
            redrawContainer.appendChild(wrap);
            return;
        }

        var tag = (breadcrumb.tagName || '').toUpperCase();
        if (tag === 'UL' || tag === 'OL') {
            var li = document.createElement('li');
            li.id = ITEM_ID;
            li.style.cssText = 'float:left;margin-left:6px;display:flex;align-items:center;';
            li.appendChild(button);
            breadcrumb.appendChild(li);
        } else {
            breadcrumb.appendChild(button);
        }
    }

    function removeInjectedUI() {
        var wrap = document.getElementById(BUTTON_WRAP_ID);
        if (wrap) wrap.remove();
        var item = document.getElementById(ITEM_ID);
        if (item) item.remove();
        var btn = document.getElementById(BUTTON_ID);
        if (btn) btn.remove();
        closeModal();
    }

    function startObserver() {
        if (!document.body) return;
        injectButton();
        if (observer) return;
        observer = new MutationObserver(function () {
            if (!enabled || !isAvatarPage()) return;
            if (!document.getElementById(BUTTON_ID)) injectButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function applyEnabledState(nextEnabled) {
        enabled = !!nextEnabled;
        if (enabled) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startObserver, { once: true });
            } else {
                startObserver();
            }
        } else {
            stopObserver();
            removeInjectedUI();
        }
    }

    if (window.__PurpuraSettings && window.__PurpuraSettings.ready) {
        window.__PurpuraSettings.ready.then(function () {
            applyEnabledState(getEnabled(window.__PurpuraSettings.get(STORAGE_KEY)));
        }).catch(function () {
            applyEnabledState(true);
        });
    } else {
        applyEnabledState(true);
    }

    if (window.chrome && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace !== 'sync' || !changes[STORAGE_KEY]) return;
            applyEnabledState(getEnabled(changes[STORAGE_KEY].newValue));
        });
    }
})();
