/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
var AccessoryAssetTypes = [8, 41, 42, 43, 44, 45, 46, 47], LayeredAssetTypes = [64, 65, 66, 67, 68, 69, 70, 71, 72, 41];
var ClassicClothingAssetTypes = [2, 11, 12];
(function () {
    'use strict';
    if (window.__PURPURA_IA_INTERCEPTOR_SETUP__) return;
    window.__PURPURA_IA_INTERCEPTOR_SETUP__ = true;
    var multiAccessoryEnabled = false;
    var isMultiEquipType = function (assetTypeId) {
        var id = Number(assetTypeId);
        if (ClassicClothingAssetTypes.includes(id)) return false;
        return AccessoryAssetTypes.includes(id) || LayeredAssetTypes.includes(id);
    };
    document.addEventListener('purpura:infinite-avatar', function (event) {
        var detail = event.detail;
        if (!detail) return;
        if (typeof detail.enabled === 'boolean') {
            window.purpuraInfiniteAvatarEnabled = detail.enabled;
            multiAccessoryEnabled = detail.enabled;
        }
        if (Array.isArray(detail.accessories)) AccessoryAssetTypes = detail.accessories.filter(function (id) { return !ClassicClothingAssetTypes.includes(Number(id)); });
        if (Array.isArray(detail.layered)) LayeredAssetTypes = detail.layered.filter(function (id) { return !ClassicClothingAssetTypes.includes(Number(id)); });
    });
    var patchAvatarService = function (service) {
        if (!service || service.__purpura_patched) return;
        service.__purpura_patched = true;
        var originalGetLimit = service.getAdvancedAccessoryLimit;
        service.getAdvancedAccessoryLimit = function (assetTypeId) {
            if (multiAccessoryEnabled && isMultiEquipType(assetTypeId)) return 100;
            return originalGetLimit ? originalGetLimit.call(this, assetTypeId) : 10;
        };
        var originalAddAsset = service.addAssetToAvatar;
        service.addAssetToAvatar = function (asset, currentAssets) {
            if (!multiAccessoryEnabled) return originalAddAsset.apply(this, arguments);
            var newAssetList = originalAddAsset.apply(this, arguments).filter(function (item) {
                var typeId = item && item.assetType ? item.assetType.id : undefined;
                return !isMultiEquipType(typeId);
            });
            var potentialAssets = [asset].concat(currentAssets);
            var uniqueMultiEquipAssets = [], seenIds = new Set();
            for (var i = 0; i < potentialAssets.length; i++) {
                var item = potentialAssets[i];
                if (item && item.id && !seenIds.has(item.id)) {
                    var typeId = item.assetType ? item.assetType.id : undefined;
                    if (isMultiEquipType(typeId)) {
                        uniqueMultiEquipAssets.push(item);
                        seenIds.add(item.id);
                    }
                }
            }
            var counts = { accessory: 0, layered: 0 }, limits = { accessory: 10, layered: 10 };
            for (var j = 0; j < uniqueMultiEquipAssets.length; j++) {
                var candidate = uniqueMultiEquipAssets[j];
                var candidateType = candidate.assetType ? candidate.assetType.id : undefined;
                AccessoryAssetTypes.includes(candidateType) ? counts.accessory < limits.accessory && (newAssetList.push(candidate), counts.accessory++) : LayeredAssetTypes.includes(candidateType) && counts.layered < limits.layered && (newAssetList.push(candidate), counts.layered++);
            }
            return newAssetList;
        };
    };
    (function () {
        var robloxObj = window.Roblox;
        var defineServiceProperty = function (obj) {
            var serviceObj = obj.AvatarAccoutrementService;
            serviceObj && patchAvatarService(serviceObj);
            Object.defineProperty(obj, 'AvatarAccoutrementService', {
                configurable: true,
                enumerable: true,
                get: function () { return serviceObj; },
                set: function (value) { serviceObj = value; patchAvatarService(value); }
            });
        };
        robloxObj ? defineServiceProperty(robloxObj) : Object.defineProperty(window, 'Roblox', {
            configurable: true,
            enumerable: true,
            get: function () { return robloxObj; },
            set: function (value) {
                robloxObj = value;
                value && typeof value === 'object' && defineServiceProperty(value);
            }
        });
        var customEquipAsset = function () {
            var args = arguments;
            var assetToAdd = args[0], assetArr = args[1];
            var accessoryCount = 0, layeredCount = 0;
            var assetToAddIsAccessory = AccessoryAssetTypes.includes(assetToAdd.assetType.id), assetToAddIsLayered = LayeredAssetTypes.includes(assetToAdd.assetType.id), newAssetArr = [];
            for (var i = assetArr.toReversed(), j = 0; j < i.length; j++) {
                var asset = i[j], canAdd = true;
                AccessoryAssetTypes.includes(asset.assetType.id) && (accessoryCount++, accessoryCount >= 10 && assetToAddIsAccessory && (canAdd = false));
                LayeredAssetTypes.includes(asset.assetType.id) && (layeredCount++, layeredCount >= 10 && assetToAddIsLayered && (canAdd = false));
                !assetToAddIsAccessory && !assetToAddIsLayered && assetToAdd.assetType.id === asset.assetType.id && (canAdd = false);
                canAdd && newAssetArr.push(asset);
            }
            return newAssetArr.reverse(), newAssetArr.push(assetToAdd), newAssetArr;
        };
        var originalDefineProperty = Object.defineProperty;
        var wrapAddAsset = function (original) {
            return function () {
                var asset = arguments[0];
                // 4th arg true = wearing a saved outfit, which must keep Roblox's replace behaviour.
                var hijack = window.purpuraInfiniteAvatarEnabled && !arguments[3] && asset && asset.assetType && isMultiEquipType(asset.assetType.id);
                return hijack ? customEquipAsset.apply(null, arguments) : original.apply(this, arguments);
            };
        };
        Object.defineProperty = function (obj, prop, descriptor) {
            // Turbopack (new Next.js site) exports plain values on a sealed object, so wrap them as they are defined.
            if (descriptor && typeof descriptor.value === 'function') {
                if (prop === 'addAssetToAvatar') descriptor = Object.assign({}, descriptor, { value: wrapAddAsset(descriptor.value) });
                else if (prop === 'getAdvancedAccessoryLimit') {
                    var originalLimit = descriptor.value;
                    descriptor = Object.assign({}, descriptor, { value: function (assetTypeId) {
                        return multiAccessoryEnabled && isMultiEquipType(assetTypeId) ? 100 : originalLimit.apply(this, arguments);
                    } });
                }
            }
            if (prop === '__esModule') setTimeout(function () {
                var exportDescriptor = Object.keys(obj).includes('addAssetToAvatar') && Object.getOwnPropertyDescriptor(obj, 'addAssetToAvatar');
                if (exportDescriptor && exportDescriptor.get) {
                    var originalGetter = exportDescriptor.get, originalAddAssetToAvatar = originalGetter();
                    Object.defineProperty(obj, 'addAssetToAvatar', {
                        get: function () {
                            return function () {
                                var asset = arguments[0], needsHijack = isMultiEquipType(asset.assetType.id);
                                return window.purpuraInfiniteAvatarEnabled && needsHijack ? customEquipAsset.apply(null, arguments) : originalAddAssetToAvatar.apply(this, arguments);
                            };
                        },
                        configurable: true
                    });
                }
            }, 1);
            return prop === 'addAssetToAvatar' && (descriptor.configurable = true), originalDefineProperty.call(Object, obj, prop, descriptor);
        };
    })();
})();
