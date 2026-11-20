/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
const params = new URLSearchParams(location.search);
const id = params.get('id') || '';
let permissions = { permissions: [], origins: [] };

try {
    const parsed = JSON.parse(params.get('permissions') || '{}');
    permissions = {
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
        origins: Array.isArray(parsed.origins) ? parsed.origins : []
    };
} catch {}

const PERMISSION_LABELS = {
    webRequest: 'Watch network requests for Ghost Profiles',
    webNavigation: 'Detect page navigation',
    contextMenus: 'Add items to the right-click menu',
    menus: 'Add items to the right-click menu'
};

const list = document.getElementById('permissions');

[...permissions.permissions, ...permissions.origins].forEach((permission) => {
    const item = document.createElement('li');
    item.textContent = PERMISSION_LABELS[permission] || permission;
    list.append(item);
});

const finish = (granted) => {
    try {
        Promise.resolve(
            chrome.runtime.sendMessage({
                action: 'firefoxPermissionResult',
                id,
                granted
            })
        ).finally(() => window.close());
    } catch {
        window.close();
    }
};

document.getElementById('allow').addEventListener('click', () => {
    chrome.permissions
        .request(permissions)
        .then((granted) => finish(granted))
        .catch(() => finish(false));
});

document.getElementById('cancel').addEventListener('click', () => finish(false));
