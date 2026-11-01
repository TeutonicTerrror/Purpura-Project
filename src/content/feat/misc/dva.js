/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    const STORAGE_KEY = 'dva';
    const CAROUSEL_SELECTORS =
        '#carousel-game-details, [data-testid="game-carousel"], .game-carousel';
    const MEDIA_AREA_SELECTOR =
        'video, .video-preview-wrapper, [data-testid="video-preview-wrapper"], ' +
        '.carousel-video, .game-preview-video-container, ' +
        'iframe[src*="youtube-nocookie.com/embed"], iframe[src*="youtube.com/embed"]';
    const YT_IFRAME_SELECTOR =
        'iframe[src*="youtube-nocookie.com/embed"], iframe[src*="youtube.com/embed"]';
    const GESTURE_WINDOW_MS = 4000;
    const OBSERVER_TIMEOUT_MS = 60000;

    let enabled = false;
    let observer = null;
    let observerTimer = null;
    let lastGestureAt = 0;
    let lastGestureTarget = null;
    const trackedIframes = new WeakSet();

    function isManualPlay() {
        if (Date.now() - lastGestureAt > GESTURE_WINDOW_MS) return false;
        if (!lastGestureTarget || !lastGestureTarget.closest) return false;
        return !!lastGestureTarget.closest(MEDIA_AREA_SELECTOR);
    }

    function onGesture(e) {
        lastGestureAt = Date.now();
        lastGestureTarget = e.target;
    }

    function applyToCarousels() {
        const carousels = document.querySelectorAll(CAROUSEL_SELECTORS);
        for (let i = 0; i < carousels.length; i++) {
            carousels[i].setAttribute('data-is-video-autoplayed-on-ready', 'false');
        }
    }

    function clearCarousels() {
        const carousels = document.querySelectorAll(CAROUSEL_SELECTORS);
        for (let i = 0; i < carousels.length; i++) {
            carousels[i].removeAttribute('data-is-video-autoplayed-on-ready');
        }
    }

    function onPlayCapture(e) {
        if (!enabled) return;
        const t = e.target;
        if (t && t.tagName === 'VIDEO' && !isManualPlay()) t.pause();
    }

    function pauseIframe(iframe) {
        try {
            iframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
                '*'
            );
        } catch (_) { }
    }

    function onWindowMessage(e) {
        if (!enabled) return;
        let data;
        try {
            data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        } catch (err) {
            return;
        }
        if (!data || typeof data !== 'object') return;
        const isPlaying =
            data.event === 'infoDelivery' &&
            data.info &&
            data.info.playerState === 1;
        if (!isPlaying) return;
        const iframes = document.querySelectorAll(YT_IFRAME_SELECTOR);
        let matched = false;
        for (let i = 0; i < iframes.length; i++) {
            if (iframes[i].contentWindow === e.source) {
                if (!trackedIframes.has(iframes[i])) {
                    pauseIframe(iframes[i]);
                    trackedIframes.add(iframes[i]);
                }
                matched = true;
                break;
            }
        }
        if (!matched) {
            for (let i = 0; i < iframes.length; i++) {
                if (!trackedIframes.has(iframes[i])) {
                    pauseIframe(iframes[i]);
                    trackedIframes.add(iframes[i]);
                }
            }
        }
    }

    function startObserver() {
        if (observer) return;
        const root = document.documentElement || document;
        observer = new MutationObserver(function () {
            applyToCarousels();
        });
        observer.observe(root, { childList: true, subtree: true });
        observerTimer = setTimeout(stopObserver, OBSERVER_TIMEOUT_MS);
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (observerTimer) {
            clearTimeout(observerTimer);
            observerTimer = null;
        }
    }

    function applyEnabled() {
        if (enabled) {
            applyToCarousels();
            startObserver();
        } else {
            stopObserver();
            clearCarousels();
        }
    }

    function refreshEnabled() {
        chrome.storage.sync.get(STORAGE_KEY, function (res) {
            enabled = res[STORAGE_KEY] === true;
            applyEnabled();
        });
    }

    refreshEnabled();

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync' || !changes[STORAGE_KEY]) return;
        refreshEnabled();
    });

    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    document.addEventListener('touchstart', onGesture, true);
    window.addEventListener('message', onWindowMessage);
    document.addEventListener('play', onPlayCapture, true);
})();
