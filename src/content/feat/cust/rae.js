/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    if (window.purpuraAeditorIntegrated) return;
    window.purpuraAeditorIntegrated = true;

    const STORAGE_KEY = "rae";
    const ASSET_ROOT = "content/feat/cust/aeditor";
    const APP_STYLE_ID = "purpura-aeditor-style";
    const APP_SCRIPT_ID = "purpura-aeditor-script";
    const APP_HOST_ID = "purpura-aeditor-host";

    let enabled = false;
    let bridgeBound = false;
    let scriptLoaded = false;
    let contentObserver = null;
    let htmlObserver = null;
    let bodyObserver = null;
    let bodyWaitObserver = null;
    let bootstrapPulseTimer = null;
    let pulseCount = 0;
    let bootedPath = "";

    function normalizePath(path) {
        return (path || "").replace(/\/+$/, "") || "/";
    }

    function currentPath() {
        return normalizePath(window.location.pathname);
    }

    function isAvatarPage() {
        return currentPath().startsWith("/my/avatar");
    }

    function themeMode() {
        return document.documentElement.classList.contains("dark-theme") || document.body?.classList.contains("dark-theme") ? "dark" : "light";
    }

    const HIDE_RULES_ID = "purpura-hide-rules";

    function injectHideRules() {
        if (document.getElementById(HIDE_RULES_ID)) return;
        const style = document.createElement("style");
        style.id = HIDE_RULES_ID;
        style.textContent = "#footer-container,#container-main{display:none!important}";
        document.head.appendChild(style);
    }

    function postTheme() {
        window.postMessage({ type: "PURPURA_THEME", theme: themeMode() }, "*");
    }

    function postThreeUrls() {
        window.postMessage({
            type: "PURPURA_THREE_URLS",
            threeUrl: chrome.runtime.getURL(`${ASSET_ROOT}/three/three.min.js`),
            gltfLoaderUrl: chrome.runtime.getURL(`${ASSET_ROOT}/three/GLTFLoader.js`),
            mtlLoaderUrl: chrome.runtime.getURL(`${ASSET_ROOT}/three/MTLLoader.js`),
            orbitControlsUrl: chrome.runtime.getURL(`${ASSET_ROOT}/three/OrbitControls.js`),
            objLoaderUrl: chrome.runtime.getURL(`${ASSET_ROOT}/three/OBJLoader.js`)
        }, "*");
    }

    function postAuthHeaders() {
        const found = [];
        const pushToken = (kind, value) => {
            if (typeof value === "string" && value.trim()) {
                found.push({ kind, value: value.trim() });
            }
        };

        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]')?.content;
            const boundMeta = document.querySelector('meta[name="x-bound-auth-token"], meta[name="bound-auth-token"]')?.content;
            pushToken("csrf", csrfMeta);
            pushToken("bound", boundMeta);
            ["rbxBoundAuthToken", "x-bound-auth-token", "boundAuthToken", "csrf-token", "x-csrf-token"].forEach((key) => {
                try {
                    const value = window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key);
                    if (key.toLowerCase().includes("csrf")) {
                        pushToken("csrf", value);
                    } else {
                        pushToken("bound", value);
                    }
                } catch (_error) {
                }
            });
        } catch (_error) {
        }

        let csrfToken = "";
        let boundAuthToken = "";
        found.forEach((token) => {
            if (!csrfToken && token.kind === "csrf") csrfToken = token.value;
            if (!boundAuthToken && token.kind === "bound") boundAuthToken = token.value;
        });

        window.postMessage({
            type: "PURPURA_AUTH_HEADERS",
            csrfToken,
            boundAuthToken
        }, "*");
    }

    function normalizeMethod(method, fallback = "GET") {
        const fallbackMethod = String(fallback || "GET").trim().toUpperCase() || "GET";
        const normalized = String(method || fallbackMethod).trim().toUpperCase();
        const allowed = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);
        return allowed.has(normalized) ? normalized : fallbackMethod;
    }

    function shouldUsePageFetch(url, requestedPageFetch) {
        return requestedPageFetch === true;
    }

    async function handleFetchResourceRequest(payload) {
        if (!payload || typeof payload.requestId !== "string" || typeof payload.url !== "string") return;

        const method = normalizeMethod(payload.method, "GET");
        const bodyText = typeof payload.body === "string" && payload.body.length > 0 ? payload.body : undefined;
        const requestBody = method === "GET" || method === "HEAD" ? undefined : bodyText;
        const usePageFetch = shouldUsePageFetch(payload.url, payload.usePageFetch);

        if (!usePageFetch) {
            try {
                const response = await chrome.runtime.sendMessage({
                    type: "PURPURA_FETCH_RESOURCE_REQUEST",
                    requestId: payload.requestId,
                    url: payload.url,
                    method,
                    body: typeof payload.body === "string" ? payload.body : "",
                    accept: payload.accept || "text/plain, application/json;q=0.9, */*;q=0.8",
                    csrfToken: typeof payload.csrfToken === "string" ? payload.csrfToken : "",
                    boundAuthToken: typeof payload.boundAuthToken === "string" ? payload.boundAuthToken : ""
                });
                window.postMessage({
                    type: "PURPURA_FETCH_RESOURCE_RESPONSE",
                    requestId: payload.requestId,
                    ok: Boolean(response?.ok),
                    status: Number(response?.status) || 0,
                    contentType: response?.contentType || "",
                    csrfToken: response?.csrfToken || "",
                    boundAuthToken: response?.boundAuthToken || "",
                    text: response?.text || ""
                }, "*");
            } catch (error) {
                window.postMessage({
                    type: "PURPURA_FETCH_RESOURCE_RESPONSE",
                    requestId: payload.requestId,
                    ok: false,
                    status: 0,
                    contentType: "",
                    text: error?.message || String(error)
                }, "*");
            }
            return;
        }

        try {
            const headers = new Headers();
            if (payload.accept) headers.set("Accept", String(payload.accept));
            if (typeof payload.csrfToken === "string" && payload.csrfToken) headers.set("x-csrf-token", payload.csrfToken);
            if (typeof payload.boundAuthToken === "string" && payload.boundAuthToken) headers.set("x-bound-auth-token", payload.boundAuthToken);
            if (typeof payload.contentType === "string" && payload.contentType) headers.set("Content-Type", payload.contentType);

            const response = await fetch(payload.url, {
                method,
                credentials: "include",
                mode: "cors",
                referrer: window.location.href,
                headers,
                body: requestBody
            });
            const text = await response.text();
            window.postMessage({
                type: "PURPURA_FETCH_RESOURCE_RESPONSE",
                requestId: payload.requestId,
                ok: response.ok,
                status: response.status,
                contentType: response.headers.get("content-type") || "",
                csrfToken: response.headers.get("x-csrf-token") || "",
                boundAuthToken: response.headers.get("x-bound-auth-token") || "",
                text
            }, "*");
        } catch (error) {
            window.postMessage({
                type: "PURPURA_FETCH_RESOURCE_RESPONSE",
                requestId: payload.requestId,
                ok: false,
                status: 0,
                contentType: "",
                text: error?.message || String(error)
            }, "*");
        }
    }

    function bindBridge() {
        if (bridgeBound) return;
        bridgeBound = true;
        window.addEventListener("message", (event) => {
            const payload = event.data;
            if (!payload || typeof payload.type !== "string") return;
            if (payload.type === "PURPURA_FETCH_RESOURCE_REQUEST") {
                handleFetchResourceRequest(payload);
            }
        });
    }

    function ensureAssetStyle() {
        if (document.getElementById(APP_STYLE_ID)) return;
        const link = document.createElement("link");
        link.id = APP_STYLE_ID;
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL(`${ASSET_ROOT}/react/index.css`);
        document.head.appendChild(link);
    }

    function ensureHost() {
        const content = document.getElementById("content") || document.getElementById("container") || document.querySelector(".main-content") || document.querySelector(".content") || document.querySelector("main");
        if (!content) return false;

        injectHideRules();

        if (!document.getElementById('purpura-rae-style')) {
            var raeStyle = document.createElement('style');
            raeStyle.id = 'purpura-rae-style';
            raeStyle.textContent = ':root{--purpura-rae-host-bg-dark:#121215;--purpura-rae-host-bg-light:#ffffff}';
            document.head.appendChild(raeStyle);
        }

        if (!document.getElementById(APP_HOST_ID)) {
            content.style.display = "none";
            const host = document.createElement("div");
            host.id = APP_HOST_ID;
            host.style.width = "100%";
            host.style.minHeight = "100vh";
            host.style.paddingTop = "64px";
            host.style.boxSizing = "border-box";
            host.style.position = "relative";
            host.style.zIndex = "1";
            host.style.backgroundColor = themeMode() === "dark" ? "var(--purpura-rae-host-bg-dark)" : "var(--purpura-rae-host-bg-light)";
            host.setAttribute("data-lpignore", "true");
            host.setAttribute("data-1p-ignore", "true");
            host.setAttribute("data-bwignore", "true");
            const app = document.createElement("div");
            app.id = "app";
            app.setAttribute("data-lpignore", "true");
            app.setAttribute("data-1p-ignore", "true");
            app.setAttribute("data-bwignore", "true");
            host.appendChild(app);
            (document.body || content.parentElement).appendChild(host);
        }

        const title = document.getElementsByTagName("title")[0];
        if (title) title.innerText = "Purpura Avatar Editor";
        return true;
    }

    function stopBootstrapPulse() {
        if (bootstrapPulseTimer) {
            clearInterval(bootstrapPulseTimer);
            bootstrapPulseTimer = null;
        }
    }

    function startBootstrapPulse() {
        stopBootstrapPulse();
        pulseCount = 0;
        const pulse = () => {
            postTheme();
            postThreeUrls();
            postAuthHeaders();
        };
        pulse();
        bootstrapPulseTimer = setInterval(() => {
            pulseCount += 1;
            pulse();
            if (pulseCount >= 4) {
                stopBootstrapPulse();
            }
        }, 350);
    }

    function ensureAssetScript() {
        const existing = document.getElementById(APP_SCRIPT_ID);
        if (existing) {
            if (existing.dataset.loaded === "1") {
                if (!scriptLoaded) {
                    scriptLoaded = true;
                    startBootstrapPulse();
                } else {
                    postTheme();
                }
                return;
            }
            existing.addEventListener("load", () => {
                existing.dataset.loaded = "1";
                scriptLoaded = true;
                startBootstrapPulse();
            }, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.id = APP_SCRIPT_ID;
        script.src = chrome.runtime.getURL(`${ASSET_ROOT}/react/index.js`);
        script.defer = true;
        script.addEventListener("load", () => {
            script.dataset.loaded = "1";
            scriptLoaded = true;
            startBootstrapPulse();
        }, { once: true });
        document.head.appendChild(script);
    }

    function startThemeObservers() {
        if (!htmlObserver) {
            htmlObserver = new MutationObserver(() => {
                postTheme();
            });
            htmlObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["class"],
                subtree: false
            });
        }

        if (document.body) {
            if (!bodyObserver) {
                bodyObserver = new MutationObserver(() => {
                    postTheme();
                });
            }
            bodyObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ["class"],
                subtree: false
            });
        } else if (!bodyWaitObserver) {
            bodyWaitObserver = new MutationObserver(() => {
                if (!document.body) return;
                if (!bodyObserver) {
                    bodyObserver = new MutationObserver(() => {
                        postTheme();
                    });
                }
                bodyObserver.observe(document.body, {
                    attributes: true,
                    attributeFilter: ["class"],
                    subtree: false
                });
                bodyWaitObserver.disconnect();
                bodyWaitObserver = null;
            });
            bodyWaitObserver.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    function stopObservers() {
        if (contentObserver) {
            contentObserver.disconnect();
            contentObserver = null;
        }
        if (htmlObserver) {
            htmlObserver.disconnect();
            htmlObserver = null;
        }
        if (bodyObserver) {
            bodyObserver.disconnect();
            bodyObserver = null;
        }
        if (bodyWaitObserver) {
            bodyWaitObserver.disconnect();
            bodyWaitObserver = null;
        }
        stopBootstrapPulse();
    }

    function mountIfReady() {
        if (!enabled || !isAvatarPage()) return;
        if (!ensureHost()) return;
        bindBridge();
        ensureAssetStyle();
        ensureAssetScript();
        startThemeObservers();
        if (contentObserver) {
            contentObserver.disconnect();
            contentObserver = null;
        }
        bootedPath = currentPath();
    }

    function startContentObserver() {
        if (contentObserver) return;
        contentObserver = new MutationObserver(() => {
            if (!enabled || !isAvatarPage()) return;
            if (bootedPath === currentPath() && document.getElementById(APP_HOST_ID)) return;
            mountIfReady();
        });
        contentObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function applyEnabledState(nextEnabled) {
        nextEnabled = false;
        const wasEnabled = enabled;
        enabled = nextEnabled;
        if (!enabled) {
            stopObservers();
            if (wasEnabled && isAvatarPage()) {
                window.location.reload();
            }
            return;
        }

        if (!isAvatarPage()) {
            stopObservers();
            return;
        }

        bindBridge();
        mountIfReady();
        if (!document.getElementById(APP_HOST_ID)) {
            startContentObserver();
        }
    }

    function onRouteChanged() {
        bootedPath = "";
        if (!isAvatarPage()) {
            const style = document.getElementById(HIDE_RULES_ID);
            if (style) style.remove();
        }
        if (enabled && isAvatarPage()) {
            mountIfReady();
            if (!document.getElementById(APP_HOST_ID)) {
                startContentObserver();
            }
        }
    }

    const nativePushState = history.pushState;
    history.pushState = function(...args) {
        const result = nativePushState.apply(this, args);
        onRouteChanged();
        return result;
    };

    const nativeReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        const result = nativeReplaceState.apply(this, args);
        onRouteChanged();
        return result;
    };

    window.addEventListener("popstate", onRouteChanged);

    window.__PurpuraSettings.ready.then(function() {
        applyEnabledState(false);
        try { if (window.__PurpuraSettings.get(STORAGE_KEY) === true) window.__PurpuraSettings.set(STORAGE_KEY, false); } catch (_) {}
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== "sync" && namespace !== "local") return;
        if (!changes[STORAGE_KEY]) return;
        if (window.__PurpuraSettings.get(STORAGE_KEY) === true) try { window.__PurpuraSettings.set(STORAGE_KEY, false); } catch (_) {}
        applyEnabledState(false);
    });
})();
