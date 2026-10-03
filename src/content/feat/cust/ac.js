/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraAvatarCyclerLoaded) return;
    window.__purpuraAvatarCyclerLoaded = true;

    var STORAGE_ENABLED = 'ac';
    var STORAGE_IDS = 'purpura_avatar_cycler_ids';
    var STORAGE_INTERVAL = 'purpura_avatar_cycler_interval';
    var STORAGE_DETAILS = 'purpura_avatar_cycler_details';
    var BUTTON_ID = 'purpura-avatar-cycler-button';
    var OVERLAY_ID = 'purpura-avatar-cycler-overlay';
    var loadedCursor = '';
    var loading = false;
    var avatarList = null;
    var selected = new Set();
    var outfitCache = new Map();
    var intervalInput = null;
    var setButton = null;
    var disableButton = null;
    var savedCycleActive = false;

    function message(key, substitutions) {
        return chrome.i18n.getMessage(key, substitutions) || key;
    }

    function isAvatarPage() {
        return window.location.pathname.toLowerCase().indexOf('/my/avatar') !== -1;
    }

    function getEnabled(value) {
        if (value === undefined) return true;
        return value === true || !!(value && typeof value === 'object' && value.enabled === true);
    }

    function getJson(url, options) {
        options = options || {};
        options.credentials = 'include';
        return fetch(url, options).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        });
    }

    function makeButton(text, className) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = text;
        return button;
    }

    function addStyles() {
        if (document.getElementById('purpura-avatar-cycler-style')) return;
        var style = document.createElement('style');
        style.id = 'purpura-avatar-cycler-style';
        style.textContent = [
            '#purpura-avatar-cycler-button{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;min-height:20px;height:20px;margin-left:5px;padding:0 8px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)))!important;border-radius:999px!important;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32))!important;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))!important;font-size:10px;font-weight:600;line-height:12px;letter-spacing:.01em;white-space:nowrap;cursor:pointer;box-shadow:0 1px 2px color-mix(in srgb,var(--purpura-surface0,#000) 18%,transparent);transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease}',
            '#purpura-avatar-cycler-button:hover{border-color:var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.24)))!important;background:var(--purpura-surface300,var(--color-surface-300,#34353b))!important;box-shadow:0 2px 6px color-mix(in srgb,var(--purpura-surface0,#000) 24%,transparent)}',
            '#purpura-avatar-cycler-button:active{background:var(--purpura-surface300,var(--color-surface-300,#34353b))!important;box-shadow:inset 0 1px 2px color-mix(in srgb,var(--purpura-surface0,#000) 24%,transparent)}',
            '#purpura-avatar-cycler-button:focus-visible{outline:2px solid var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));outline-offset:2px}',
            '#purpura-avatar-cycler-overlay{position:fixed;inset:0;z-index:100000;background:color-mix(in srgb,var(--purpura-surface0,var(--color-surface-0,#000)) 78%,transparent);display:flex;align-items:center;justify-content:center;padding:20px}',
            '#purpura-avatar-cycler-dialog{display:flex;flex-direction:column;width:min(600px,94vw);height:min(600px,88vh);padding:24px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));border-radius:var(--purpura-radius,var(--radius-medium,12px));background:var(--purpura-surface100,var(--color-surface-100,#1f2025));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));box-shadow:0 20px 60px color-mix(in srgb,var(--purpura-surface0,#000) 55%,transparent)}',
            '#purpura-avatar-cycler-dialog h2{margin:0 0 8px;font-size:22px;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}',
            '#purpura-avatar-cycler-dialog p{margin:0;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));font-size:13px}',
            '.purpura-ac-settings{display:flex;align-items:center;gap:10px;padding:14px 0 8px}',
            '.purpura-ac-settings label{font-size:13px;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}',
            '.purpura-ac-settings input{width:86px;padding:7px 9px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:var(--purpura-radius-sm,var(--radius-small,6px));background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}',
            '.purpura-ac-status{padding:5px 0 12px;font-size:12px;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3))}',
            '.purpura-ac-list{display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:8px;overflow-y:auto;min-height:0;flex:1;padding:4px}',
            '.purpura-ac-card{position:relative;display:flex;flex-direction:column;align-items:center;width:104px;padding:6px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.1)));border-radius:var(--purpura-radius-sm,var(--radius-small,8px));background:var(--purpura-surface200,var(--color-surface-200,rgba(255,255,255,.04)));cursor:pointer;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}',
            '.purpura-ac-card:hover,.purpura-ac-card.selected{border-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));background:var(--purpura-surface300,var(--color-surface-300,rgba(0,162,255,.14)))}',
            '.purpura-ac-card img{width:92px;height:92px;object-fit:cover;border-radius:var(--purpura-radius-sm,var(--radius-small,6px));background:var(--purpura-surface300,var(--color-surface-300,#34353b))}',
            '.purpura-ac-card span{width:100%;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;font-size:12px}',
            '.purpura-ac-card input{position:absolute;top:8px;right:8px;width:16px;height:16px;accent-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff))}',
            '.purpura-ac-load{align-self:center;margin:10px 0;padding:8px 14px;height:38px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:var(--purpura-radius-sm,var(--radius-small,6px));background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));cursor:pointer}',
            '.purpura-ac-load:hover{background:var(--purpura-surface300,var(--color-surface-300,#34353b))}',
            '.purpura-ac-actions{display:flex;gap:8px;align-items:center;padding-top:14px}',
            '.purpura-ac-actions button{flex:1 1 0;min-width:0;height:38px;padding:8px 12px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:var(--purpura-radius-sm,var(--radius-small,7px));background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));cursor:pointer;font-weight:600;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.purpura-ac-actions button:hover{background:var(--purpura-surface300,var(--color-surface-300,#34353b))}',
            '.purpura-ac-actions .purpura-ac-primary{border-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));background:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}',
            '.purpura-ac-actions .purpura-ac-primary:hover{filter:brightness(1.1)}',
            '.purpura-ac-actions button:disabled{opacity:.5;cursor:not-allowed}',
            '@media(max-width:600px){#purpura-avatar-cycler-dialog{padding:16px}.purpura-ac-card{width:88px}.purpura-ac-card img{width:76px;height:76px}}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    function getOutfitThumbnails(ids) {
        if (!ids.length) return Promise.resolve({});
        return getJson('https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=' + ids.map(encodeURIComponent).join(',') + '&size=150x150&format=Png&isCircular=false')
            .then(function (data) {
                var result = {};
                (Array.isArray(data.data) ? data.data : []).forEach(function (item) {
                    if (item && item.targetId && item.imageUrl) result[String(item.targetId)] = item.imageUrl;
                });
                return result;
            }).catch(function () { return {}; });
    }

    function updateStateText() {
        var status = document.getElementById('purpura-ac-status');
        if (status) status.textContent = message('avatarCycler_selectStatus', [String(selected.size)]);
        if (setButton) {
            setButton.disabled = selected.size < 2;
            setButton.textContent = selected.size < 2
                ? message('avatarCycler_selectShort')
                : message('avatarCycler_setButton', [String(selected.size)]);
        }
        if (disableButton) {
            disableButton.style.display = savedCycleActive ? 'block' : 'none';
        }
    }

    function makeCard(outfit, thumbnailUrl) {
        var id = Number(outfit.itemId);
        var card = document.createElement('div');
        card.className = 'purpura-ac-card' + (selected.has(id) ? ' selected' : '');
        card.dataset.outfitId = String(id);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selected.has(id);
        checkbox.setAttribute('aria-label', outfit.itemName || message('avatarCycler_avatar'));

        var image = document.createElement('img');
        if (thumbnailUrl) image.src = thumbnailUrl;
        image.alt = outfit.itemName || message('avatarCycler_avatar');
        image.loading = 'lazy';
        image.onerror = function () { image.style.visibility = 'hidden'; };

        var name = document.createElement('span');
        name.textContent = outfit.itemName || message('avatarCycler_avatar');

        function toggle() {
            if (selected.has(id)) selected.delete(id);
            else selected.add(id);
            checkbox.checked = selected.has(id);
            card.classList.toggle('selected', checkbox.checked);
            updateStateText();
        }

        checkbox.addEventListener('click', function (event) {
            event.stopPropagation();
            toggle();
        });
        card.addEventListener('click', toggle);
        card.appendChild(checkbox);
        card.appendChild(image);
        card.appendChild(name);
        return card;
    }

    function fetchAndRender(reset) {
        if (loading || (!reset && loadedCursor === null)) return;
        loading = true;
        var loadButton = document.getElementById('purpura-ac-load-more');
        if (loadButton) {
            loadButton.disabled = true;
            loadButton.textContent = message('avatarCycler_loading');
        }
        if (reset) {
            loadedCursor = '';
            if (avatarList) avatarList.textContent = '';
        }

        var params = new URLSearchParams({
            sortOption: '1',
            pageLimit: '50',
            'itemCategories[0].ItemSubType': '3',
            'itemCategories[0].ItemType': 'Outfit'
        });
        if (loadedCursor) params.set('pageToken', loadedCursor);

        getJson('https://avatar.roblox.com/v1/avatar-inventory?' + params.toString())
            .then(function (data) {
                var outfits = Array.isArray(data.avatarInventoryItems) ? data.avatarInventoryItems : [];
                var ids = outfits.map(function (outfit) { return Number(outfit.itemId); }).filter(Boolean);
                return getOutfitThumbnails(ids).then(function (thumbnails) {
                    outfits.forEach(function (outfit) {
                        if (outfit && outfit.itemId && avatarList) avatarList.appendChild(makeCard(outfit, thumbnails[String(outfit.itemId)]));
                    });
                }).then(function () {
                    loadedCursor = data.nextPageToken || null;
                    if (loadButton) loadButton.style.display = loadedCursor ? 'block' : 'none';
                });
            })
            .catch(function () {
                var status = document.getElementById('purpura-ac-status');
                if (status) status.textContent = message('avatarCycler_loadFailed');
            })
            .finally(function () {
                loading = false;
                if (loadButton) {
                    loadButton.disabled = false;
                    loadButton.textContent = message('avatarCycler_loadMore');
                }
            });
    }

    function closeOverlay() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.remove();
        document.removeEventListener('keydown', closeOnEscape);
    }

    function closeOnEscape(event) {
        if (event.key === 'Escape') closeOverlay();
    }

    function openCycler() {
        if (document.getElementById(OVERLAY_ID)) return;
        addStyles();
        Promise.all([
            new Promise(function (resolve) {
                chrome.storage.sync.get([STORAGE_ENABLED, STORAGE_INTERVAL], resolve);
            }),
            new Promise(function (resolve) {
                chrome.storage.local.get([STORAGE_IDS, STORAGE_DETAILS], resolve);
            })
        ]).then(function (results) {
            var syncData = results[0] || {};
            var localData = results[1] || {};
            selected = new Set(Array.isArray(localData[STORAGE_IDS]) ? localData[STORAGE_IDS].map(Number) : []);
            savedCycleActive = selected.size >= 2;
            loadedCursor = '';
            loading = false;
            outfitCache.clear();

            var overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            var dialog = document.createElement('div');
            dialog.id = 'purpura-avatar-cycler-dialog';

            var title = document.createElement('h2');
            title.textContent = message('avatarCycler_title');
            var description = document.createElement('p');
            description.textContent = message('avatarCycler_description');

            var settings = document.createElement('div');
            settings.className = 'purpura-ac-settings';
            var intervalLabel = document.createElement('label');
            intervalLabel.textContent = message('avatarCycler_interval');
            intervalInput = document.createElement('input');
            intervalInput.type = 'number';
            intervalInput.min = '5';
            intervalInput.step = '1';
            intervalInput.value = Math.max(5, Number(syncData[STORAGE_INTERVAL]) || 5);
            settings.appendChild(intervalLabel);
            settings.appendChild(intervalInput);

            var status = document.createElement('div');
            status.id = 'purpura-ac-status';
            status.className = 'purpura-ac-status';

            avatarList = document.createElement('div');
            avatarList.className = 'purpura-ac-list';
            var loadMore = makeButton(message('avatarCycler_loadMore'), 'purpura-ac-load');
            loadMore.id = 'purpura-ac-load-more';
            loadMore.style.display = 'none';
            loadMore.addEventListener('click', function () { fetchAndRender(false); });

            var actions = document.createElement('div');
            actions.className = 'purpura-ac-actions';
            disableButton = makeButton(message('avatarCycler_disable'), 'purpura-ac-disable');
            disableButton.style.display = getEnabled(syncData[STORAGE_ENABLED]) && savedCycleActive ? 'block' : 'none';
            disableButton.addEventListener('click', function () {
                selected.clear();
                savedCycleActive = false;
                chrome.storage.local.set({
                    purpura_avatar_cycler_ids: [],
                    purpura_avatar_cycler_details: {}
                });
                avatarList.querySelectorAll('.purpura-ac-card').forEach(function (card) {
                    card.classList.remove('selected');
                    var checkbox = card.querySelector('input');
                    if (checkbox) checkbox.checked = false;
                });
                updateStateText();
            });
            var clearButton = makeButton(message('avatarCycler_clear'), 'purpura-ac-clear');
            clearButton.addEventListener('click', function () {
                selected.clear();
                savedCycleActive = false;
                chrome.storage.local.set({
                    purpura_avatar_cycler_ids: [],
                    purpura_avatar_cycler_details: {}
                });
                avatarList.querySelectorAll('.purpura-ac-card').forEach(function (card) {
                    card.classList.remove('selected');
                    var checkbox = card.querySelector('input');
                    if (checkbox) checkbox.checked = false;
                });
                updateStateText();
            });
            setButton = makeButton(message('avatarCycler_selectShort'), 'purpura-ac-primary');
            setButton.disabled = true;
            setButton.addEventListener('click', saveCycler);
            actions.appendChild(disableButton);
            actions.appendChild(clearButton);
            actions.appendChild(setButton);

            dialog.appendChild(title);
            dialog.appendChild(description);
            dialog.appendChild(settings);
            dialog.appendChild(status);
            dialog.appendChild(avatarList);
            dialog.appendChild(loadMore);
            dialog.appendChild(actions);
            overlay.appendChild(dialog);
            overlay.addEventListener('click', function (event) {
                if (event.target === overlay) closeOverlay();
            });
            document.body.appendChild(overlay);
            document.addEventListener('keydown', closeOnEscape);
            updateStateText();
            fetchAndRender(true);
        });
    }

    function saveCycler() {
        if (selected.size < 2 || !intervalInput) return;
        var ids = Array.from(selected);
        var seconds = Math.max(5, parseInt(intervalInput.value, 10) || 5);
        setButton.disabled = true;
        setButton.textContent = message('avatarCycler_loadingDetails');
        Promise.all(ids.map(function (id) {
            if (outfitCache.has(id)) return Promise.resolve([id, outfitCache.get(id)]);
            return getJson('https://avatar.roblox.com/v4/outfits/' + encodeURIComponent(id) + '/details')
                .then(function (details) {
                    outfitCache.set(id, details);
                    return [id, details];
                });
        })).then(function (details) {
            var map = {};
            details.forEach(function (entry) { map[String(entry[0])] = entry[1]; });
            return new Promise(function (resolve) {
                chrome.storage.local.set({
                    purpura_avatar_cycler_ids: ids,
                    purpura_avatar_cycler_details: map
                }, resolve);
            });
        }).then(function () {
            return new Promise(function (resolve) {
                chrome.storage.sync.set({
                    ac: true,
                    purpura_avatar_cycler_interval: seconds
                }, resolve);
            });
        }).then(function () {
            savedCycleActive = true;
            setButton.disabled = false;
            setButton.textContent = message('avatarCycler_active');
            if (disableButton) disableButton.style.display = 'block';
            setTimeout(updateStateText, 1500);
        }).catch(function () {
            setButton.disabled = false;
            setButton.textContent = message('avatarCycler_saveFailed');
            updateStateText();
        });
    }

    function injectButton(container) {
        if (!container || document.getElementById(BUTTON_ID) || !isAvatarPage()) return;
        var item = document.createElement('li');
        item.id = 'purpura-avatar-cycler-item';
        item.style.cssText = 'float:left;margin-left:5px;display:flex;align-items:center;gap:5px;';
        var button = makeButton(message('avatarCycler_button'), 'btn-secondary-xs');
        button.id = BUTTON_ID;
        button.addEventListener('click', openCycler);
        item.appendChild(button);
        container.appendChild(item);
    }

    function observeAvatarPage() {
        if (!isAvatarPage() || !document.body) return;
        addStyles();
        var observer = new MutationObserver(function () {
            if (!isAvatarPage()) return;
            var breadcrumb = document.querySelector('.breadcrumb-container');
            if (breadcrumb) injectButton(breadcrumb);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        var breadcrumb = document.querySelector('.breadcrumb-container');
        if (breadcrumb) injectButton(breadcrumb);
    }

    window.__PurpuraSettings.ready.then(function () {
        if (!getEnabled(window.__PurpuraSettings.get(STORAGE_ENABLED))) return;
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeAvatarPage, { once: true });
        else observeAvatarPage();
    });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace !== 'sync' || !changes[STORAGE_ENABLED]) return;
        if (getEnabled(changes[STORAGE_ENABLED].newValue)) observeAvatarPage();
        else {
            var button = document.getElementById(BUTTON_ID);
            if (button) button.remove();
            closeOverlay();
        }
    });
})();
