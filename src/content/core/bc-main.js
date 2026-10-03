/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraBetterContinueLaunchBridge) return;
    window.__purpuraBetterContinueLaunchBridge = true;

    const GAME_LAUNCH_SUCCESS_URL = 'https://metrics.roblox.com/v1/games/report-event';
    const GAME_LAUNCH_SUCCESS_EVENT = 'purpura-game-launch-success';

    function isLaunchSuccessRequest(url) {
        return typeof url === 'string' &&
            url.includes(GAME_LAUNCH_SUCCESS_URL) &&
            url.includes('GameLaunchSuccessWeb_Win32');
    }

    function announceLaunch(url) {
        if (!isLaunchSuccessRequest(url)) return;
        document.dispatchEvent(new CustomEvent(GAME_LAUNCH_SUCCESS_EVENT, {
            detail: { url }
        }));
    }

    const originalFetch = window.fetch;
    if (typeof originalFetch === 'function') {
        window.fetch = function (...args) {
            const input = args[0];
            const url = typeof input === 'string' ? input :
                (input && typeof input.url === 'string' ? input.url : '');
            const result = originalFetch.apply(this, args);
            if (result && typeof result.then === 'function') {
                result.then(() => announceLaunch(url)).catch(() => {});
            }
            return result;
        };
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.__purpuraBetterContinueUrl = typeof url === 'string' ? url : '';
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', () => {
            announceLaunch(this.__purpuraBetterContinueUrl || '');
        }, { once: true });
        return originalSend.apply(this, args);
    };
})();
