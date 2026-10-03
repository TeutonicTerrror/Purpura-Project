/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__purpuraInfiniteAvatarLoaded) return;
    window.__purpuraInfiniteAvatarLoaded = true;
    var STORAGE_KEY = 'ia';
    var CATEGORIES_URL = 'https://catalog.roblox.com/v1/categories';
    var categoriesCache = null;
    var pendingCategories = null;
    function dispatch(detail) {
        document.dispatchEvent(new CustomEvent('purpura:infinite-avatar', { detail: detail }));
    }
    function fetchCategories() {
        if (categoriesCache) return Promise.resolve(categoriesCache);
        if (pendingCategories) return pendingCategories;
        pendingCategories = fetch(CATEGORIES_URL, { method: 'GET', credentials: 'include' }).then(function (response) {
            if (!response.ok) throw new Error('categories request failed');
            return response.json();
        }).then(function (data) {
            categoriesCache = Array.isArray(data) ? data : [];
            return categoriesCache;
        }).catch(function () { return []; });
        return pendingCategories;
    }
    function categoryIds(categories, name) {
        var category = categories.find(function (item) { return item && (item.category === name || item.name === name); });
        return category ? category.assetTypeIds || [] : [];
    }
    function subcategoryIds(categories, name) {
        for (var i = 0; i < categories.length; i++) {
            var subcategories = categories[i] && categories[i].subcategories || [];
            var subcategory = subcategories.find(function (item) { return item && (item.subcategory === name || item.name === name); });
            if (subcategory) return subcategory.assetTypeIds || [];
        }
        return [];
    }
    function updateState() {
        var stored = window.__PurpuraSettings.get(STORAGE_KEY);
        var enabled = stored === undefined || stored === null ? true : stored === true;
        dispatch({ enabled: enabled });
        if (!enabled) return;
        fetchCategories().then(function (categories) {
            var accessories = new Set(categoryIds(categories, 'Accessories'));
            subcategoryIds(categories, 'HairAccessories').forEach(function (id) { accessories.add(id); });
            dispatch({ enabled: true, accessories: Array.from(accessories), layered: categoryIds(categories, 'Clothing') });
        });
    }
    window.__PurpuraSettings.ready.then(updateState);
    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'local' && changes[STORAGE_KEY]) updateState();
    });
})();
