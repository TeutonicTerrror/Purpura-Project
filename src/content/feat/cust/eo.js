/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraExtraOutfitsLoaded) return;
    window.__purpuraExtraOutfitsLoaded = true;
    if (window.location.pathname.toLowerCase().indexOf('/my/avatar') === -1) return;

    var STORAGE_KEY = 'eo';
    var DATA_KEY_PREFIX = 'eoOutfits_';
    var STYLE_ID = 'purpura-eo-style';
    var CREATE_BTN_ID = 'purpura-eo-create-btn';
    var CARD_ATTR = 'data-purpura-eo-id';
    var COSTUMES_SUBCATEGORY = 'MyCostumes';
    var PLACEHOLDER_IMAGE = 'https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png';
    var NAME_MAX = 50;

    var FALLBACK_MESSAGES = {
        eo_create_button: 'Create Extra Character',
        eo_create_title: 'Create Extra Character',
        eo_create_desc: "Save your avatar's current look as an extra character. Extra characters are stored by Purpura on this device and don't count toward Roblox's character limit.",
        eo_name_placeholder: 'Name your character',
        eo_create: 'Create',
        eo_cancel: 'Cancel',
        eo_update: 'Update',
        eo_rename: 'Rename',
        eo_delete: 'Delete',
        eo_convert: 'Make Extra',
        eo_rename_title: 'Rename Character',
        eo_rename_desc: 'Choose a new name for your character.',
        eo_delete_title: 'Delete Character',
        eo_delete_desc: 'Are you sure you want to delete this extra character? This cannot be undone.',
        eo_update_title: 'Update Character',
        eo_update_desc: "This will overwrite the character with your avatar's current look.",
        eo_convert_title: 'Make Extra Character',
        eo_convert_desc: 'This character will be copied into your extra characters and then deleted from Roblox, freeing up a Roblox character slot.',
        eo_created: 'Created extra character',
        eo_renamed: 'Renamed character',
        eo_deleted: 'Deleted character',
        eo_updated: 'Updated character',
        eo_worn: 'Wore character',
        eo_worn_missing: 'Wore character, but you no longer own some of its items',
        eo_converted: 'Moved character to extra characters',
        eo_convert_delete_fail: 'Copied character, but could not delete it from Roblox',
        eo_error: 'Something went wrong. Please try again.',
        eo_badge: 'Extra character (saved by Purpura)'
    };

    var enabled = false;
    var currentSubcategory = null;
    var subcategoryKnown = false;
    var observer = null;
    var renderToken = 0;
    var csrfToken = '';
    var cachedUserId = 0;
    var outfitsCache = null;



    function message(key) {
        try {
            if (window.chrome && chrome.i18n && typeof chrome.i18n.getMessage === 'function') {
                var localized = chrome.i18n.getMessage(key);
                if (localized) return localized;
            }
        } catch (_) {}
        return FALLBACK_MESSAGES[key] || key;
    }

    function getEnabled(value) {
        if (value === undefined || value === null) return true;
        return value === true || !!(value && typeof value === 'object' && value.enabled !== false);
    }

    function sleep(ms) {
        return new Promise(function (r) { setTimeout(r, ms); });
    }

    function stripHash(hex) {
        return typeof hex === 'string' ? hex.replace(/^#/, '').toUpperCase() : hex;
    }

    function isValidName(name) {
        var trimmed = (name || '').trim();
        return trimmed.length > 0 && trimmed.length <= NAME_MAX;
    }

    function readCsrfTokenFromDom() {
        try {
            var meta = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]');
            if (meta) return (meta.getAttribute('data-token') || meta.getAttribute('content') || '').trim();
        } catch (_) {}
        return '';
    }

    function robloxFetch(url, method, body) {
        var token = csrfToken || readCsrfTokenFromDom();
        if (token) csrfToken = token;

        function attempt(currentToken, retried) {
            var headers = { 'Accept': 'application/json' };
            if (body !== undefined) headers['Content-Type'] = 'application/json';
            if (method && method !== 'GET' && currentToken) headers['X-CSRF-TOKEN'] = currentToken;
            return fetch(url, {
                method: method || 'GET',
                credentials: 'include',
                headers: headers,
                body: body !== undefined ? JSON.stringify(body) : undefined
            }).then(function (resp) {
                var headerToken = resp.headers.get('x-csrf-token') || '';
                if (headerToken) csrfToken = headerToken;
                if (resp.status === 403 && !retried && headerToken) return attempt(headerToken, true);
                return resp.text().then(function (text) {
                    var data = null;
                    try { data = text ? JSON.parse(text) : null; } catch (_) {}
                    return { ok: resp.ok, status: resp.status, data: data };
                });
            });
        }
        return attempt(token, false).catch(function () {
            return { ok: false, status: 0, data: null };
        });
    }

    function resolveUserId() {
        if (cachedUserId > 0) return Promise.resolve(cachedUserId);
        try {
            var meta = document.querySelector('meta[name="user-data"]');
            var parsed = parseInt(meta && (meta.getAttribute('data-userid') || meta.getAttribute('data-user-id')), 10);
            if (parsed > 0) { cachedUserId = parsed; return Promise.resolve(parsed); }
        } catch (_) {}
        return robloxFetch('https://users.roblox.com/v1/users/authenticated').then(function (res) {
            var id = parseInt(res.data && res.data.id, 10);
            if (id > 0) cachedUserId = id;
            return cachedUserId;
        });
    }



    function dataKey(userId) {
        return DATA_KEY_PREFIX + userId;
    }

    function loadOutfits() {
        if (outfitsCache) return Promise.resolve(outfitsCache);
        return resolveUserId().then(function (userId) {
            if (!userId) return [];
            return new Promise(function (resolve) {
                chrome.storage.local.get([dataKey(userId)], function (res) {
                    var list = res && Array.isArray(res[dataKey(userId)]) ? res[dataKey(userId)] : [];
                    outfitsCache = list;
                    resolve(list);
                });
            });
        });
    }

    function saveOutfits(list) {
        outfitsCache = list;
        return resolveUserId().then(function (userId) {
            if (!userId) throw new Error('No user');
            return new Promise(function (resolve, reject) {
                var payload = {};
                payload[dataKey(userId)] = list;
                chrome.storage.local.set(payload, function () {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve(list);
                });
            });
        });
    }

    function updateOutfit(id, patch) {
        return loadOutfits().then(function (list) {
            var next = list.map(function (o) { return o.id === id ? Object.assign({}, o, patch) : o; });
            return saveOutfits(next);
        });
    }

    function newId() {
        return 'eo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }



    function normalizeAssets(assets) {
        return (assets || []).map(function (a) {
            var entry = { id: a.id };
            if (a.meta && typeof a.meta === 'object') entry.meta = a.meta;
            return entry;
        }).filter(function (a) { return a.id; });
    }

    function normalizeBodyColors(colors, suffix) {
        var out = {};
        Object.keys(colors || {}).forEach(function (key) {
            var base = suffix && key.slice(-suffix.length) === suffix ? key.slice(0, -suffix.length) : key;
            out[base] = stripHash(colors[key]);
        });
        return out;
    }

    function fetchCurrentOutfit() {
        return robloxFetch('https://avatar.roblox.com/v4/avatar?selectionTypes=0&selectionTypes=1&selectionTypes=2&selectionTypes=3&selectionTypes=4&selectionTypes=5')
            .then(function (res) {
                var model = res.ok && res.data && res.data.avatarModel;
                if (model) {
                    var config = res.data.avatarConfigurations || {};
                    return {
                        assets: normalizeAssets(model.assets),
                        bodyColors: normalizeBodyColors(model.bodyColors),
                        scales: model.scales,
                        playerAvatarType: model.playerAvatarType,
                        background: config.background && config.background.backgroundAsset && config.background.backgroundAsset.id || 0
                    };
                }
                return robloxFetch('https://avatar.roblox.com/v2/avatar/avatar').then(function (fallback) {
                    if (!fallback.ok || !fallback.data) return null;
                    return {
                        assets: normalizeAssets(fallback.data.assets),
                        bodyColors: normalizeBodyColors(fallback.data.bodyColor3s, '3'),
                        scales: fallback.data.scales,
                        playerAvatarType: fallback.data.playerAvatarType,
                        background: 0
                    };
                });
            });
    }

    function renderThumbnail(outfit) {
        var bodyColors = {};
        Object.keys(outfit.bodyColors || {}).forEach(function (k) { bodyColors[k] = stripHash(outfit.bodyColors[k]); });
        var request = {
            thumbnailConfig: { thumbnailId: 1, thumbnailType: '2dWebp', size: '150x150' },
            avatarDefinition: {
                assets: outfit.assets,
                bodyColors: bodyColors,
                scales: outfit.scales,
                playerAvatarType: { playerAvatarType: outfit.playerAvatarType },
                backgroundRequestModel: { id: outfit.background || 0 }
            }
        };
        var attempts = 0;
        function poll() {
            attempts++;
            return robloxFetch('https://avatar.roblox.com/v1/avatar/render', 'POST', request).then(function (res) {
                if (attempts > 20) return null;
                if (res.status === 429) return sleep(5000).then(poll);
                if (!res.ok || !res.data) return null;
                if (res.data.state === 'Pending') return sleep(2000).then(poll);
                return res.data.imageUrl || null;
            });
        }
        return poll();
    }

    function setCardsLoading(loading) {
        document.dispatchEvent(new CustomEvent('purpura:eo:cards-loading', { detail: loading }));
    }

    function triggerAvatarViewerRefresh() {
        try {
            var redrawLink = document.querySelector('.left-wrapper .redraw-avatar a, .redraw-avatar a.text-link');
            if (redrawLink) redrawLink.click();
        } catch (_) {}
    }

    function notifyEditorOfAvatarChange() {
        return robloxFetch('https://avatar.roblox.com/v2/avatar/avatar').then(function (res) {
            if (!res.ok || !res.data) { triggerAvatarViewerRefresh(); return; }
            var applied = false;
            function onApplied(e) { applied = !!e.detail; }
            document.addEventListener('purpura:eo:avatar-applied', onApplied, { once: true });
            document.dispatchEvent(new CustomEvent('purpura:eo:avatar-changed', {
                detail: JSON.stringify({
                    playerAvatarType: res.data.playerAvatarType,
                    assets: res.data.assets,
                    scales: res.data.scales,
                    bodyColor3s: res.data.bodyColor3s
                })
            }));
            document.removeEventListener('purpura:eo:avatar-applied', onApplied);
            if (!applied) triggerAvatarViewerRefresh();
        });
    }

    function wearOutfit(outfit) {
        var bodyColors = {};
        Object.keys(outfit.bodyColors || {}).forEach(function (k) { bodyColors[k] = '#' + stripHash(outfit.bodyColors[k]); });
        var model = {
            assets: (outfit.assets || []).slice(),
            bodyColors: bodyColors,
            scales: outfit.scales,
            playerAvatarType: outfit.playerAvatarType
        };
        var config = { backgroundRequestModel: { id: outfit.background || 0 } };
        function body() {
            return {
                avatarDefinition: { updateAvatarModel: model, updateAvatarConfig: config },
                updateTypes: ['UpdateAssets', 'UpdateBackground', 'UpdateScales', 'UpdateAvatarType', 'UpdateBodyColors']
            };
        }
        var missing = [];
        return robloxFetch('https://avatar.roblox.com/v4/avatar', 'PATCH', body()).then(function (res) {
            if (res.ok && res.data && res.data.success !== false) return res;
            var validation = res.data && res.data.validation;
            if (!validation) return res;
            var invalidIds = {};
            (validation.invalidAssets || []).forEach(function (a) {
                var id = a && (a.id || a.assetId);
                if (id) { invalidIds[id] = true; missing.push(id); }
            });
            model.assets = model.assets.filter(function (a) { return !invalidIds[a.id]; });
            if (validation.invalidBackground) delete config.backgroundRequestModel;
            return robloxFetch('https://avatar.roblox.com/v4/avatar', 'PATCH', body());
        }).then(function (res) {
            if (!res.ok || (res.data && res.data.success === false)) throw new Error('Wear failed');
            return missing;
        });
    }



    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#' + CREATE_BTN_ID + '{position:absolute!important;float:none!important;margin:0!important;z-index:2;}',
            '.purpura-eo-card .thumbnail-2d-container{position:relative;}',
            '.purpura-eo-card .purpura-eo-badge{position:absolute;right:4px;bottom:4px;width:20px;height:20px;border-radius:50%;background:#7c3aed;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.4);pointer-events:none;}',
            '.purpura-eo-card .purpura-eo-badge svg{width:13px;height:13px;}',
            '.purpura-eo-card .item-card-menu{height:100%;}',
            '.purpura-eo-card .item-card-menu.active{display:flex;flex-direction:column;justify-content:center;}',
            '.purpura-eo-card .item-card-menu button{margin:2px 0;}',
            '.purpura-eo-card.purpura-eo-busy .item-card-thumb-container{opacity:.5;pointer-events:none;}',
            '.purpura-eo-overlay{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;}',
            '.purpura-eo-modal{width:min(440px,calc(100% - 32px));border-radius:12px;padding:20px;background:#fff;color:#111;box-shadow:0 6px 24px rgba(0,0,0,.35);font-family:inherit;}',
            '.dark-theme .purpura-eo-modal,html.dark-theme .purpura-eo-modal{background:#232527;color:#fff;}',
            '.purpura-eo-modal h3{margin:0 0 8px;font-size:20px;font-weight:700;}',
            '.purpura-eo-modal p{margin:0 0 14px;opacity:.85;line-height:1.4;}',
            '.purpura-eo-modal input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid rgba(127,127,127,.4);background:transparent;color:inherit;font-size:15px;margin-bottom:14px;}',
            '.purpura-eo-modal-actions{display:flex;justify-content:flex-end;gap:8px;}',
            '.purpura-eo-modal-actions button{min-width:90px;}',
            '.purpura-eo-toast{position:fixed;left:50%;bottom:32px;transform:translate(-50%,140%);transition:transform .2s;z-index:10060;padding:12px 18px;border-radius:10px;background:#1f2023;color:#fff;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.35);max-width:480px;}',
            '.purpura-eo-toast.show{transform:translate(-50%,0);}',
            '.purpura-eo-toast.error{background:#b42318;}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    function toast(text, isError) {
        var el = document.createElement('div');
        el.className = 'purpura-eo-toast' + (isError ? ' error' : '');
        el.setAttribute('role', 'status');
        el.textContent = text;
        document.body.appendChild(el);
        requestAnimationFrame(function () { el.classList.add('show'); });
        setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { el.remove(); }, 250);
        }, 4000);
    }


    function openModal(opts) {
        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'purpura-eo-overlay';
            var modal = document.createElement('div');
            modal.className = 'purpura-eo-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');

            var h = document.createElement('h3');
            h.textContent = opts.title;
            var p = document.createElement('p');
            p.textContent = opts.description;
            modal.appendChild(h);
            modal.appendChild(p);

            var input = null;
            if (opts.placeholder) {
                input = document.createElement('input');
                input.type = 'text';
                input.maxLength = NAME_MAX;
                input.autocomplete = 'off';
                input.placeholder = opts.placeholder;
                input.value = opts.initialValue || '';
                modal.appendChild(input);
            }

            var actions = document.createElement('div');
            actions.className = 'purpura-eo-modal-actions';
            var cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.className = 'btn-control-md';
            cancel.textContent = message('eo_cancel');
            var confirm = document.createElement('button');
            confirm.type = 'button';
            confirm.className = opts.danger ? 'btn-alert-md' : 'btn-primary-md';
            confirm.textContent = opts.confirmText;
            actions.appendChild(cancel);
            actions.appendChild(confirm);
            modal.appendChild(actions);
            overlay.appendChild(modal);

            function refreshState() {
                if (!input) return;
                var valid = isValidName(input.value);
                confirm.disabled = !valid;
                confirm.classList.toggle('disabled', !valid);
            }
            function close(result) {
                document.removeEventListener('keydown', onKey, true);
                overlay.remove();
                resolve(result);
            }
            function submit() {
                if (input) {
                    if (!isValidName(input.value)) return;
                    close(input.value.trim());
                } else {
                    close(true);
                }
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.stopPropagation(); close(null); }
                else if (e.key === 'Enter') { e.preventDefault(); submit(); }
            }

            overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(null); });
            cancel.addEventListener('click', function () { close(null); });
            confirm.addEventListener('click', submit);
            if (input) input.addEventListener('input', refreshState);
            document.addEventListener('keydown', onKey, true);
            refreshState();
            document.body.appendChild(overlay);
            (input || confirm).focus();
        });
    }

    function menuButton(label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-secondary-xs';
        b.textContent = label;
        return b;
    }





    var CREATE_CHARACTER_RE = /create\s+new\s+(character|costume|outfit)/i;

    function isVisible(el) {
        return !!(el && el.isConnected && el.getClientRects().length);
    }

    function getCreateCharacterButton() {
        var buttons = document.querySelectorAll('button.btn-float-right');
        var fallback = null;
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            if (b.id === CREATE_BTN_ID || !isVisible(b)) continue;
            if (CREATE_CHARACTER_RE.test(b.textContent || '')) return b;
            if (!fallback && b.closest('#costumes')) fallback = b;
        }
        return fallback;
    }

    function getCostumesPane() {
        var anchor = getCreateCharacterButton();
        if (!anchor) return null;
        return anchor.closest('#costumes, .tab-pane') || document.getElementById('costumes') || anchor.parentElement;
    }

    function getCostumesList() {
        var pane = getCostumesPane();
        return pane ? pane.querySelector('.hlist') : null;
    }

    function isCostumesOpen() {
        return !!getCreateCharacterButton();
    }

    function removeInjectedUI() {
        document.querySelectorAll('[' + CARD_ATTR + ']').forEach(function (el) { el.remove(); });
        var btn = document.getElementById(CREATE_BTN_ID);
        if (btn) btn.remove();
        document.querySelectorAll('.purpura-eo-convert').forEach(function (el) { el.remove(); });
    }

    function createCard(outfit) {
        var li = document.createElement('li');
        li.className = 'list-item item-card seven-column purpura-eo-card';
        li.setAttribute(CARD_ATTR, outfit.id);

        var wrap = document.createElement('div');
        var container = document.createElement('div');
        container.className = 'item-card-container remove-panel outfit-card';
        var link = document.createElement('div');
        link.className = 'item-card-link';
        link.style.position = 'relative';

        var thumbLink = document.createElement('a');
        thumbLink.className = 'item-card-thumb-container';
        thumbLink.setAttribute('role', 'button');
        thumbLink.title = outfit.name;
        var thumb = document.createElement('span');
        thumb.className = 'item-card-thumb';
        var thumbInner = document.createElement('span');
        thumbInner.className = 'thumbnail-2d-container shimmer';
        var img = document.createElement('img');
        img.alt = outfit.name;
        img.loading = 'lazy';
        img.addEventListener('load', function () { thumbInner.classList.remove('shimmer'); });
        var badge = document.createElement('span');
        badge.className = 'purpura-eo-badge';
        badge.title = message('eo_badge');
        badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
        thumbInner.appendChild(img);
        thumbInner.appendChild(badge);
        thumb.appendChild(thumbInner);
        thumbLink.appendChild(thumb);

        var menu = document.createElement('div');
        menu.className = 'item-card-menu';
        var updateBtn = menuButton(message('eo_update'));
        var renameBtn = menuButton(message('eo_rename'));
        var deleteBtn = menuButton(message('eo_delete'));
        var cancelBtn = menuButton(message('eo_cancel'));
        menu.appendChild(updateBtn);
        menu.appendChild(renameBtn);
        menu.appendChild(deleteBtn);
        menu.appendChild(cancelBtn);

        link.appendChild(thumbLink);
        link.appendChild(menu);

        var caption = document.createElement('div');
        caption.className = 'item-card-caption';
        var nameLink = document.createElement('a');
        nameLink.className = 'item-card-name-link';
        var nameEl = document.createElement('div');
        nameEl.className = 'text-overflow item-card-name';
        nameEl.textContent = outfit.name;
        nameEl.title = outfit.name;
        nameLink.appendChild(nameEl);
        var settingsIcon = document.createElement('span');
        settingsIcon.className = 'icon-settings-16x16 edit-outfit';
        settingsIcon.setAttribute('role', 'button');
        caption.appendChild(nameLink);
        caption.appendChild(settingsIcon);

        container.appendChild(link);
        container.appendChild(caption);
        wrap.appendChild(container);
        li.appendChild(wrap);

        function setMenu(open) { menu.classList.toggle('active', open); }
        function setThumb(url) {
            thumbInner.classList.add('shimmer');
            img.src = url || PLACEHOLDER_IMAGE;
        }

        var regenerating = false;
        function regenerate() {
            if (regenerating) return;
            regenerating = true;
            renderThumbnail(outfit.outfit).then(function (url) {
                regenerating = false;
                if (!url) { img.src = PLACEHOLDER_IMAGE; return; }
                outfit.image = url;
                setThumb(url);
                updateOutfit(outfit.id, { image: url }).catch(function () {});
            });
        }
        img.addEventListener('error', function () {
            if (img.src === PLACEHOLDER_IMAGE) return;
            regenerate();
        });
        if (outfit.image) setThumb(outfit.image); else regenerate();

        settingsIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            setMenu(!menu.classList.contains('active'));
        });
        cancelBtn.addEventListener('click', function () { setMenu(false); });

        thumbLink.addEventListener('click', function () {
            if (li.classList.contains('purpura-eo-busy')) return;
            li.classList.add('purpura-eo-busy');
            setCardsLoading(true);
            wearOutfit(outfit.outfit).then(function (missing) {
                toast(missing.length ? message('eo_worn_missing') : message('eo_worn'), false);
                return notifyEditorOfAvatarChange();
            }).catch(function () {
                toast(message('eo_error'), true);
            }).then(function () {
                li.classList.remove('purpura-eo-busy');
                setCardsLoading(false);
            });
        });

        renameBtn.addEventListener('click', function () {
            setMenu(false);
            openModal({
                title: message('eo_rename_title'),
                description: message('eo_rename_desc'),
                placeholder: message('eo_name_placeholder'),
                initialValue: outfit.name,
                confirmText: message('eo_rename')
            }).then(function (name) {
                if (!name) return;
                updateOutfit(outfit.id, { name: name }).then(function () {
                    outfit.name = name;
                    nameEl.textContent = name;
                    nameEl.title = name;
                    thumbLink.title = name;
                    img.alt = name;
                    toast(message('eo_renamed'), false);
                }).catch(function () { toast(message('eo_error'), true); });
            });
        });

        deleteBtn.addEventListener('click', function () {
            setMenu(false);
            openModal({
                title: message('eo_delete_title'),
                description: message('eo_delete_desc'),
                confirmText: message('eo_delete'),
                danger: true
            }).then(function (ok) {
                if (!ok) return;
                loadOutfits().then(function (list) {
                    return saveOutfits(list.filter(function (o) { return o.id !== outfit.id; }));
                }).then(function () {
                    li.remove();
                    toast(message('eo_deleted'), false);
                }).catch(function () { toast(message('eo_error'), true); });
            });
        });

        updateBtn.addEventListener('click', function () {
            setMenu(false);
            openModal({
                title: message('eo_update_title'),
                description: message('eo_update_desc'),
                confirmText: message('eo_update')
            }).then(function (ok) {
                if (!ok) return;
                fetchCurrentOutfit().then(function (current) {
                    if (!current) throw new Error('No outfit');
                    outfit.outfit = current;
                    return updateOutfit(outfit.id, { outfit: current, image: '' }).then(function () {
                        toast(message('eo_updated'), false);
                        regenerate();
                    });
                }).catch(function () { toast(message('eo_error'), true); });
            });
        });

        return li;
    }

    function ensureCreateButton() {
        var anchor = getCreateCharacterButton();
        if (!anchor) return;
        var existing = document.getElementById(CREATE_BTN_ID);
        if (existing && existing.nextElementSibling === anchor) {
            positionCreateButton(existing, anchor);
            return;
        }
        if (existing) existing.remove();


        var btn = document.createElement('button');
        btn.id = CREATE_BTN_ID;
        btn.type = 'button';
        btn.className = anchor.className.split(/\s+/).filter(function (c) {
            return c && c !== 'btn-float-right' && c !== 'relative';
        }).join(' ');
        btn.style.textDecoration = 'none';
        var label = document.createElement('span');
        label.className = 'flex items-center min-width-0 gap-xsmall';
        var text = document.createElement('span');
        text.className = 'padding-y-xsmall text-truncate-end text-no-wrap';
        text.textContent = message('eo_create_button');
        label.appendChild(text);
        btn.appendChild(label);
        btn.addEventListener('click', onCreateClicked);

        anchor.parentNode.insertBefore(btn, anchor);
        positionCreateButton(btn, anchor);
    }



    function positionCreateButton(btn, anchor) {
        if (!btn || !anchor || !anchor.offsetParent) return;
        var gap = 6;
        var top = Math.round(anchor.offsetTop - btn.offsetHeight - gap);
        var left = Math.round(anchor.offsetLeft + anchor.offsetWidth - btn.offsetWidth);
        if (btn.style.top !== top + 'px') btn.style.top = top + 'px';
        if (btn.style.left !== left + 'px') btn.style.left = left + 'px';
    }

    window.addEventListener('resize', function () {
        var btn = document.getElementById(CREATE_BTN_ID);
        if (btn) positionCreateButton(btn, btn.nextElementSibling);
    });

    function onCreateClicked() {
        openModal({
            title: message('eo_create_title'),
            description: message('eo_create_desc'),
            placeholder: message('eo_name_placeholder'),
            confirmText: message('eo_create')
        }).then(function (name) {
            if (!name) return;
            fetchCurrentOutfit().then(function (current) {
                if (!current) throw new Error('No outfit');
                var entry = { id: newId(), name: name, image: '', outfit: current, createdAt: Date.now() };
                return loadOutfits().then(function (list) {
                    return saveOutfits([entry].concat(list));
                }).then(function () {
                    toast(message('eo_created'), false);
                    var list = getCostumesList();
                    if (list && isCostumesOpen()) list.insertBefore(createCard(entry), list.firstChild);
                });
            }).catch(function () { toast(message('eo_error'), true); });
        });
    }



    function getRobloxOutfitId(card) {
        var thumb = card.querySelector('[data-thumbnail-target-id], [thumbnail-target-id]');
        var id = thumb && (thumb.getAttribute('data-thumbnail-target-id') || thumb.getAttribute('thumbnail-target-id'));
        return id && /^\d+$/.test(id) ? id : null;
    }

    function convertRobloxOutfit(outfitId, card) {
        robloxFetch('https://avatar.roblox.com/v3/outfits/' + outfitId + '/details').then(function (res) {
            var d = res.ok && res.data;
            if (!d) throw new Error('No details');
            var outfit = {
                assets: normalizeAssets(d.assets),
                bodyColors: normalizeBodyColors(d.bodyColor3s, '3'),
                scales: d.scale || d.scales,
                playerAvatarType: d.playerAvatarType,
                background: 0
            };
            var img = card.querySelector('img');
            var image = img && img.src && img.src.indexOf('http') === 0 ? img.src : '';
            var entry = { id: newId(), name: (d.name || 'Character').slice(0, NAME_MAX), image: image, outfit: outfit, createdAt: Date.now() };
            return loadOutfits().then(function (list) {
                return saveOutfits([entry].concat(list));
            }).then(function () {
                return robloxFetch('https://avatar.roblox.com/v1/outfits/' + outfitId + '/delete', 'POST', {});
            }).then(function (del) {
                if (del.ok) {
                    card.remove();
                    toast(message('eo_converted'), false);
                } else {
                    toast(message('eo_convert_delete_fail'), true);
                }
                var list = getCostumesList();
                if (list && isCostumesOpen()) list.insertBefore(createCard(entry), list.firstChild);
            });
        }).catch(function () { toast(message('eo_error'), true); });
    }

    function decorateRobloxCards(list) {
        Array.prototype.forEach.call(list.children, function (card) {
            if (card.hasAttribute(CARD_ATTR) || !card.classList || !card.classList.contains('item-card')) return;
            var menu = card.querySelector('.item-card-menu');
            if (!menu || menu.querySelector('.purpura-eo-convert')) return;
            var outfitId = getRobloxOutfitId(card);
            if (!outfitId) return;
            var btn = menuButton(message('eo_convert'));
            btn.classList.add('purpura-eo-convert');
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openModal({
                    title: message('eo_convert_title'),
                    description: message('eo_convert_desc'),
                    confirmText: message('eo_convert')
                }).then(function (ok) {
                    if (ok) convertRobloxOutfit(outfitId, card);
                });
            });
            menu.insertBefore(btn, menu.lastChild);
        });
    }



    function renderExtraCards() {
        var token = ++renderToken;
        return loadOutfits().then(function (outfits) {
            if (token !== renderToken || !enabled || !isCostumesOpen()) return;
            var list = getCostumesList();
            if (!list) return;
            list.querySelectorAll('[' + CARD_ATTR + ']').forEach(function (el) { el.remove(); });
            for (var i = outfits.length - 1; i >= 0; i--) {
                list.insertBefore(createCard(outfits[i]), list.firstChild);
            }
        });
    }

    var syncScheduled = false;
    function scheduleSync() {
        if (syncScheduled) return;
        syncScheduled = true;
        requestAnimationFrame(function () {
            syncScheduled = false;
            sync();
        });
    }

    var lastList = null;
    function sync() {
        if (!enabled) return;
        if (!isCostumesOpen()) {
            lastList = null;
            removeInjectedUI();
            return;
        }
        var list = getCostumesList();
        if (!list) return;
        addStyles();
        ensureCreateButton();
        if (list !== lastList || !list.querySelector('[' + CARD_ATTR + ']')) {
            lastList = list;
            loadOutfits().then(function (outfits) {
                if (outfits.length && !list.querySelector('[' + CARD_ATTR + ']')) renderExtraCards();
            });
        }
        decorateRobloxCards(list);
    }

    function onSubcategory(e) {
        subcategoryKnown = true;
        currentSubcategory = e.detail || '';
        lastList = null;
        removeInjectedUI();
        scheduleSync();
    }

    function start() {
        var attr = document.documentElement.getAttribute('data-purpura-eo-subcategory');
        if (attr !== null) { subcategoryKnown = true; currentSubcategory = attr; }
        document.addEventListener('purpura:eo:subcategory', onSubcategory);
        if (!observer) {
            observer = new MutationObserver(scheduleSync);
            observer.observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        }
        scheduleSync();
    }

    function stop() {
        document.removeEventListener('purpura:eo:subcategory', onSubcategory);
        if (observer) { observer.disconnect(); observer = null; }
        lastList = null;
        removeInjectedUI();
    }

    function applyEnabledState(nextEnabled) {
        var was = enabled;
        enabled = !!nextEnabled;
        if (enabled === was) return;
        if (enabled) {
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
            else start();
        } else {
            stop();
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
            if (namespace === 'sync' && changes[STORAGE_KEY]) {
                applyEnabledState(getEnabled(changes[STORAGE_KEY].newValue));
            }
            if (namespace === 'local' && cachedUserId && changes[dataKey(cachedUserId)]) {
                outfitsCache = null;
            }
        });
    }
})();
