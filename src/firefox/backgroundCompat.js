/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    const permissionsApi = chrome.permissions;
    if (!permissionsApi || typeof permissionsApi.request !== 'function') return;

    const nativeRequest = permissionsApi.request.bind(permissionsApi);
    const nativeContains = permissionsApi.contains.bind(permissionsApi);
    const pendingRequests = new Map();

    const resolvePending = (id, granted) => {
        const pending = pendingRequests.get(id);
        if (!pending) return;

        pendingRequests.delete(id);
        pending.resolve(granted);

        if (pending.windowId !== undefined && chrome.windows) {
            chrome.windows.remove(pending.windowId).catch(() => {});
        }
    };

    const requestFromExtensionPage = (permissions) =>
        new Promise((resolve) => {
            const id = crypto.randomUUID();
            pendingRequests.set(id, { resolve });

            const params = new URLSearchParams({
                id,
                permissions: JSON.stringify(permissions)
            });

            if (!chrome.windows || !chrome.windows.create) {
                resolvePending(id, false);
                return;
            }

            chrome.windows
                .create({
                    url: chrome.runtime.getURL(
                        `firefox-permission-request.html?${params}`
                    ),
                    type: 'popup',
                    width: 440,
                    height: 320
                })
                .then((createdWindow) => {
                    const pending = pendingRequests.get(id);
                    if (pending) pending.windowId = createdWindow.id;
                })
                .catch(() => resolvePending(id, false));
        });

    if (chrome.windows && chrome.windows.onRemoved) {
        chrome.windows.onRemoved.addListener((windowId) => {
            for (const [id, pending] of pendingRequests) {
                if (pending.windowId === windowId) resolvePending(id, false);
            }
        });
    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message?.action === 'firefoxPermissionResult') {
            resolvePending(message.id, !!message.granted);
        }
    });

    const request = async (permissions) => {
        const missing = { permissions: [], origins: [] };

        for (const permission of permissions.permissions || []) {
            if (!(await nativeContains({ permissions: [permission] }))) {
                missing.permissions.push(permission);
            }
        }

        for (const origin of permissions.origins || []) {
            if (!(await nativeContains({ origins: [origin] }))) {
                missing.origins.push(origin);
            }
        }

        if (!missing.permissions.length && !missing.origins.length) return true;

        try {
            return await nativeRequest(missing);
        } catch (error) {
            if (!/user input/i.test(String(error?.message))) throw error;
            return requestFromExtensionPage(missing);
        }
    };

    permissionsApi.request = function (permissions, callback) {
        const result = request(permissions || {});

        if (typeof callback !== 'function') return result;

        result.then(
            (granted) => callback(granted),
            (error) => {
                console.warn('Purpura: Permission request failed', error);
                callback(false);
            }
        );
        return undefined;
    };

    const nativeRemove = permissionsApi.remove.bind(permissionsApi);
    const requiredPermissions = new Set(
        chrome.runtime.getManifest().permissions || []
    );

    const remove = async (permissions) => {
        const removable = {
            permissions: (permissions.permissions || []).filter(
                (permission) => !requiredPermissions.has(permission)
            ),
            origins: permissions.origins || []
        };

        if (!removable.permissions.length && !removable.origins.length) {
            return false;
        }

        return nativeRemove(removable);
    };

    permissionsApi.remove = function (permissions, callback) {
        const result = remove(permissions || {});

        if (typeof callback !== 'function') return result;

        result.then(
            (removed) => callback(removed),
            (error) => {
                console.warn('Purpura: Permission removal failed', error);
                callback(false);
            }
        );
        return undefined;
    };
})();
