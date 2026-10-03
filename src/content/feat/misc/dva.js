/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    const STORAGE_KEY = 'dva';
    // Carousel containers that Roblox's video player may consult for autoplay
    // (RoPlus approach) and the areas where users interact with media.
    const CAROUSEL_SELECTORS =
        '#carousel-game-details, [data-testid="game-carousel"], .game-carousel';
    const MEDIA_AREA_SELECTOR =
        'video, .video-preview-wrapper, [data-testid="video-preview-wrapper"], ' +
        '.carousel-video, .game-preview-video-container, ' +
        'iframe[src*="youtube-nocookie.com/embed"], iframe[src*="youtube.com/embed"]';
    const YT_IFRAME_SELECTOR =
        'iframe[src*="youtube-nocookie.com/embed"], iframe[src*="youtube.com/embed"]';
    // A play that happens within this window after a user gesture on the media
    // area counts as manual playback and is allowed.
    const GESTURE_WINDOW_MS = 4000;
    const OBSERVER_TIMEOUT_MS = 60000;

    let enabled = false;
    let observer = null;
    let observerTimer = null;
    let lastGestureAt = 0;
    let lastGestureTarget = null;
    const trackedIframes = new WeakSet();

    // Only allow playback that follows a user gesture on/near the media area.
    function isManualPlay() {
        if (Date.now() - lastGestureAt > GESTURE_WINDOW_MS) return false;
        if (!lastGestureTarget || !lastGestureTarget.closest) return false;
        return !!lastGestureTarget.closest(MEDIA_AREA_SELECTOR);
    }

    function onGesture(e) {
        lastGestureAt = Date.now();
        lastGestureTarget = e.target;
    }

    // RoPlus attribute approach, kept as belt-and-suspenders: harmless if Roblox
    // no longer reads the attribute, and effective on pages that still do.
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

    // Native HTML5 video: pause any playback that did not follow a user gesture
    // on the media area, so clicking play still works.
    function onPlayCapture(e) {
        if (!enabled) return;
        const t = e.target;
        if (t && t.tagName === 'VIDEO' && !isManualPlay()) t.pause();
    }

    // YouTube embeds: block the initial autoplay, then release the embed so
    // manual playback (clicking inside the iframe) is never blocked.
    function pauseIframe(iframe) {
        try {
            iframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
                '*'
            );
        } catch (e) {
            /* ignore */
        }
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
        // Block only actual playback (YouTube's onReady fires before playback and
        // must not consume the single block slot).
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

    // Registered once at document_start; all handlers are gated by `enabled`.
    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    document.addEventListener('touchstart', onGesture, true);
    window.addEventListener('message', onWindowMessage);
    document.addEventListener('play', onPlayCapture, true);
})();
