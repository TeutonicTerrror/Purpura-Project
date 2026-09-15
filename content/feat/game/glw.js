/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.gameLauncherWidgetInitialized) {
function t(e, n) {
return chrome.i18n.getMessage(e, n) || e;
}
window.gameLauncherWidgetInitialized = true;
let e = false;
let n = null;
let r = {
x: 20,
y: 20
};
let a = false;
let o = new Map;
let i = [];
let s = false;
let p = {
x: 0,
y: 0
};
let u = -1;
let l = 0;
let c = [];
let d = "players-desc";
const g = 5 * 60 * 1e3;
const m = 5;
const h = 300;
const w = [ "players-desc", "players-asc", "name-asc", "name-desc" ];
initializeGameLauncherWidget();
async function initializeGameLauncherWidget() {
await window.__PurpuraSettings.ready;
const t = {
glw: window.__PurpuraSettings.get("glw")
};
if (!t["glw"]) return;
const a = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const o = a?.theme === "light";
if (n) n.disconnect();
n = new MutationObserver(async () => {
const e = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const n = e?.theme === "light";
const t = document.getElementById("purpura-game-launcher-widget");
if (t) {
t.classList.toggle("light-mode", n);
t.classList.toggle("dark-mode", !n);
}
});
const s = {
attributes: true,
attributeFilter: [ "class" ]
};
n.observe(document.documentElement, s);
if (document.body) n.observe(document.body, s);
const p = await chrome.storage.local.get([ "widgetPosition", "recentGames", "widgetSortMode" ]);
r = p.widgetPosition || {
x: (window.innerWidth - 80) / window.innerWidth,
y: (window.innerHeight - 80) / window.innerHeight
};
if (Math.abs(r.x) > 1 || Math.abs(r.y) > 1) {
r = {
x: r.x / window.innerWidth,
y: r.y / window.innerHeight
};
chrome.storage.local.set({
widgetPosition: r
});
}
i = p.recentGames || [];
d = w.includes(p.widgetSortMode) ? p.widgetSortMode : "players-desc";
e = true;
createWidget(o);
}
function createWidget(e) {
if (document.getElementById("purpura-game-launcher-widget")) return;
const n = document.createElement("div");
n.id = "purpura-game-launcher-widget";
n.className = `purpura-widget collapsed ${e ? "light-mode" : "dark-mode"}`;
n.style.left = `${r.x * window.innerWidth}px`;
n.style.top = `${r.y * window.innerHeight}px`;
n.style.position = "fixed";
n.innerHTML = `\n            <div class="purpura-widget-button" id="purpuraWidgetButton">\n                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>\n                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>\n                </svg>\n            </div>\n\n            <div class="purpura-widget-panel" id="purpuraWidgetPanel">\n                <div class="purpura-widget-header">\n                    <div class="purpura-widget-title">\n                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">\n                            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>\n                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>\n                        </svg>\n                        ${t("gameLauncher_title")}\n                    </div>\n                    <button class="purpura-widget-close" id="purpuraWidgetClose">\n                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">\n                            <path d="M18 6L6 18M6 6l12 12"/>\n                        </svg>\n                    </button>\n                </div>\n\n                <div class="purpura-widget-search">\n                    <svg class="purpura-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">\n                        <circle cx="11" cy="11" r="8"/>\n                        <path d="M21 21l-4.35-4.35"/>\n                    </svg>\n                    <input \n                        type="text" \n                        id="purpuraGameSearch" \n                        placeholder="${t("gameLauncher_searchPlaceholder")}"\n                        autocomplete="off"\n                        spellcheck="false"\n                    >\n                    <button class="purpura-clear-search" id="purpuraClearSearch" style="display: none;">\n                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">\n                            <path d="M18 6L6 18M6 6l12 12"/>\n                        </svg>\n                    </button>\n                </div>\n\n                <div class="purpura-widget-content" id="purpuraWidgetContent">\n                    <div class="purpura-recent-games" id="purpuraRecentGames" style="display: none;">\n                        <div class="purpura-section-title">${t("gameLauncher_recentGames")}</div>\n                        <div class="purpura-recent-list" id="purpuraRecentList"></div>\n                    </div>\n                    \n                    <div class="purpura-search-results" id="purpuraSearchResults" style="display: none;">\n                        <div class="purpura-results-header">\n                            <div class="purpura-section-title">${t("gameLauncher_searchResults")}</div>\n                            <select id="purpuraSortSelect" class="purpura-sort-select" aria-label="Sort search results">\n                                <option value="players-desc">${t("gameLauncher_sortPlayersDesc")}</option>\n                                <option value="players-asc">${t("gameLauncher_sortPlayersAsc")}</option>\n                                <option value="name-asc">${t("gameLauncher_sortNameAsc")}</option>\n                                <option value="name-desc">${t("gameLauncher_sortNameDesc")}</option>\n                            </select>\n                        </div>\n                        <div class="purpura-results-list" id="purpuraResultsList"></div>\n                    </div>\n\n                    <div class="purpura-empty-state" id="purpuraEmptyState">\n                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">\n                            <circle cx="11" cy="11" r="8"/>\n                            <path d="M21 21l-4.35-4.35"/>\n                        </svg>\n                        <p>${t("gameLauncher_emptyTitle")}</p>\n                        <span>${t("gameLauncher_emptySubtitle")}</span>\n                    </div>\n\n                    <div class="purpura-loading-state" id="purpuraLoadingState" style="display: none;">\n                        <div class="purpura-spinner"></div>\n                        <p>${t("gameLauncher_searching")}</p>\n                    </div>\n                </div>\n            </div>\n        `;
document.body.appendChild(n);
injectWidgetStyles();
attachEventListeners();
ensureWidgetOnScreen();
if (i.length > 0) {
displayRecentGames();
}
}
function ensureGlwStyles() {
if (document.getElementById("purpura-glw-vars")) return;
var e = document.createElement("style");
e.id = "purpura-glw-vars";
e.textContent = ":root{" + "--purpura-glw-search-bg:#F1F5F9;--purpura-glw-search-border:#E2E8F0;" + "--purpura-glw-search-bg-focus:#FFFFFF;--purpura-glw-item-border:#F1F5F9;" + "--purpura-glw-item-bg-hover:#FFFFFF;--purpura-glw-option-bg:#1e1e2e;" + "--purpura-glw-option-color:white;--purpura-glw-svg-stroke:rgba(138,43,226,0.5)}";
document.head.appendChild(e);
}
function injectWidgetStyles() {
ensureGlwStyles();
if (document.getElementById("purpura-widget-styles")) return;
const e = document.createElement("style");
e.id = "purpura-widget-styles";
e.textContent = `\n            .purpura-widget {\n                all: initial;\n                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;\n                --pw-accent: #A855F7;\n                --pw-accent-dark: #7E22CE;\n                --pw-bg: rgba(15, 15, 20, 0.85);\n                --pw-border: rgba(168, 85, 247, 0.25);\n                --pw-text: #F8FAFC;\n                --pw-muted: rgba(248, 250, 252, 0.5);\n                --pw-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);\n                --pw-card-bg: rgba(168, 85, 247, 0.05);\n                --pw-item-hover: rgba(168, 85, 247, 0.12);\n                --pw-input-bg: rgba(0, 0, 0, 0.4);\n                touch-action: none;\n                will-change: left, top;\n                width: 64px;\n                height: 64px;\n                pointer-events: none;\n                z-index: 2147483600;\n            }\n\n            .purpura-widget.light-mode {\n                --pw-bg: rgba(255, 255, 255, 0.7);\n                --pw-border: rgba(168, 85, 247, 0.2);\n                --pw-text: #0F172A;\n                --pw-muted: #475569;\n                --pw-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);\n                --pw-card-bg: rgba(255, 255, 255, 0.3);\n                --pw-item-hover: rgba(255, 255, 255, 0.8);\n                --pw-input-bg: rgba(255, 255, 255, 0.5);\n            }\n\n            .purpura-widget.expanded {\n                width: 350px;\n                height: 480px;\n            }\n\n            .purpura-widget * {\n                box-sizing: border-box;\n                margin: 0;\n                padding: 0;\n            }\n\n            .purpura-widget-button {\n                width: 60px;\n                height: 60px;\n                background: var(--pw-bg);\n                backdrop-filter: blur(16px);\n                -webkit-backdrop-filter: blur(16px);\n                border-radius: 50%;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                cursor: move;\n                box-shadow: var(--pw-shadow);\n                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;\n                border: 1.5px solid var(--pw-border);\n                position: relative;\n                pointer-events: auto;\n            }\n\n            .purpura-widget-button:hover {\n                transform: scale(1.08) translateY(-2px);\n                border-color: var(--pw-accent);\n                box-shadow: 0 12px 30px rgba(168, 85, 247, 0.25);\n            }\n\n            .purpura-widget-button svg {\n                stroke: var(--pw-accent);\n                transition: transform 0.3s ease;\n            }\n\n            .purpura-widget.expanded .purpura-widget-button {\n                opacity: 0;\n                transform: scale(0.5);\n                pointer-events: none;\n            }\n\n            .purpura-widget-panel {\n                width: 340px;\n                background: var(--pw-bg);\n                backdrop-filter: blur(32px);\n                -webkit-backdrop-filter: blur(32px);\n                border-radius: 24px;\n                box-shadow: var(--pw-shadow), inset 0 0 0 1px rgba(255, 255, 255, 0.2);\n                border: 1px solid var(--pw-border);\n                overflow: hidden;\n                position: absolute;\n                top: 0;\n                left: 0;\n                opacity: 0;\n                visibility: hidden;\n                pointer-events: none;\n                transform: translateY(24px) scale(0.96);\n                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);\n            }\n\n            .purpura-widget.expanded .purpura-widget-panel {\n                opacity: 1;\n                visibility: visible;\n                pointer-events: auto;\n                transform: translateY(0) scale(1);\n            }\n\n            .purpura-widget.light-mode .purpura-widget-panel {\n                border-top: 5px solid var(--pw-accent);\n                backdrop-filter: blur(45px) saturate(210%);\n                -webkit-backdrop-filter: blur(45px) saturate(210%);\n                box-shadow: var(--pw-shadow), inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);\n            }\n\n            .purpura-widget-header {\n                padding: 16px 20px;\n                display: flex;\n                align-items: center;\n                justify-content: space-between;\n                border-bottom: 1px solid var(--pw-border);\n                cursor: move;\n                user-select: none;\n            }\n\n            .purpura-widget-title {\n                display: flex;\n                align-items: center;\n                gap: 10px;\n                font-size: 16px;\n                font-weight: 800;\n                color: var(--pw-text);\n                letter-spacing: -0.3px;\n            }\n\n            .purpura-widget-title svg {\n                stroke: var(--pw-accent);\n                width: 22px;\n                height: 22px;\n            }\n\n            .purpura-widget-close {\n                background: rgba(168, 85, 247, 0.1);\n                border: none;\n                color: var(--pw-text);\n                cursor: pointer;\n                padding: 8px;\n                border-radius: 12px;\n                transition: all 0.2s ease;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n            }\n\n            .purpura-widget-close:hover {\n                background: rgba(168, 85, 247, 0.2);\n                transform: scale(1.1);\n            }\n\n            .purpura-widget-search {\n                padding: 14px 18px;\n                border-bottom: 1px solid var(--pw-border);\n                position: relative;\n                display: flex;\n                align-items: center;\n            }\n\n            .purpura-search-icon {\n                position: absolute;\n                left: 32px;\n                color: var(--pw-accent);\n                opacity: 0.6;\n                pointer-events: none;\n                z-index: 2;\n            }\n\n            #purpuraGameSearch {\n                width: 100%;\n                background: var(--pw-input-bg);\n                border: 1px solid var(--pw-border);\n                border-radius: 14px;\n                padding: 12px 16px 12px 42px;\n                color: var(--pw-text);\n                font-size: 14px;\n                font-weight: 600;\n                outline: none;\n                transition: all 0.3s ease;\n            }\n\n            #purpuraGameSearch:focus {\n                border-color: var(--pw-accent);\n                background: var(--pw-bg);\n                box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);\n            }\n\n            .purpura-widget.light-mode #purpuraGameSearch {\n                background: var(--purpura-glw-search-bg);\n                border-color: var(--purpura-glw-search-border);\n            }\n\n            .purpura-widget.light-mode #purpuraGameSearch:focus {\n                background: var(--purpura-glw-search-bg-focus);\n                border-color: var(--pw-accent);\n            }\n\n            .purpura-clear-search {\n                position: absolute;\n                right: 32px;\n                background: transparent;\n                border: none;\n                color: var(--pw-muted);\n                cursor: pointer;\n                padding: 4px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                transition: color 0.2s;\n            }\n\n            .purpura-clear-search:hover {\n                color: var(--pw-text);\n            }\n\n            .purpura-widget-content {\n                height: 380px;\n                overflow-y: auto;\n                padding: 16px;\n            }\n\n            .purpura-widget-content::-webkit-scrollbar {\n                width: 5px;\n            }\n\n            .purpura-widget-content::-webkit-scrollbar-thumb {\n                background: var(--pw-accent);\n                border-radius: 10px;\n            }\n\n            .purpura-section-title {\n                font-size: 11px;\n                font-weight: 800;\n                color: var(--pw-muted);\n                text-transform: uppercase;\n                letter-spacing: 1.2px;\n                margin-bottom: 16px;\n                padding-left: 4px;\n            }\n\n            .purpura-game-item {\n                display: flex;\n                align-items: center;\n                gap: 12px;\n                padding: 12px;\n                background: var(--pw-card-bg);\n                border: 1px solid var(--pw-border);\n                border-radius: 18px;\n                margin-bottom: 10px;\n                cursor: pointer;\n                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n            }\n\n            .purpura-widget.light-mode .purpura-game-item {\n                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);\n                border-color: var(--purpura-glw-item-border);\n            }\n\n            .purpura-game-item:hover {\n                background: var(--pw-item-hover);\n                border-color: var(--pw-accent);\n                transform: translateY(-3px);\n                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);\n            }\n\n            .purpura-widget.light-mode .purpura-game-item:hover {\n                background: var(--purpura-glw-item-bg-hover);\n                border-color: var(--pw-accent);\n                box-shadow: 0 15px 35px rgba(168, 85, 247, 0.1);\n            }\n\n            @keyframes purpuraFadeUp {\n                from {\n                    opacity: 0;\n                    transform: translateY(16px);\n                }\n                to {\n                    opacity: 1;\n                    transform: translateY(0);\n                }\n            }\n\n            .purpura-game-item {\n                animation: purpuraFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;\n            }\n\n            .purpura-empty-state, .purpura-loading-state, .purpura-no-results {\n                animation: purpuraFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;\n            }\n                box-shadow: 0 15px 35px rgba(168, 85, 247, 0.1);\n            }\n\n            .purpura-game-item.is-active {\n                background: var(--pw-item-hover);\n                border-color: var(--pw-accent);\n                box-shadow: 0 0 0 1px var(--pw-accent) inset;\n            }\n\n            .purpura-game-thumbnail {\n                width: 56px;\n                height: 56px;\n                border-radius: 14px;\n                object-fit: cover;\n                box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n            }\n\n            .purpura-game-info {\n                flex: 1;\n                min-width: 0;\n            }\n\n            .purpura-game-name {\n                font-size: 15px;\n                font-weight: 700;\n                color: var(--pw-text);\n                margin-bottom: 4px;\n                white-space: nowrap;\n                overflow: hidden;\n                text-overflow: ellipsis;\n            }\n\n            .purpura-game-stats {\n                font-size: 12px;\n                font-weight: 600;\n                color: var(--pw-muted);\n            }\n\n            .purpura-game-actions {\n                display: flex;\n                gap: 8px;\n            }\n\n            .purpura-play-button, .purpura-smallest-button {\n                width: 38px;\n                height: 38px;\n                background: var(--pw-accent);\n                border: none;\n                color: white;\n                border-radius: 12px;\n                cursor: pointer;\n                transition: all 0.2s ease;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);\n            }\n\n            .purpura-play-button:hover, .purpura-smallest-button:hover {\n                transform: scale(1.1);\n                background: var(--pw-accent-dark);\n            }\n\n            .purpura-smallest-button {\n                background: rgba(168, 85, 247, 0.15);\n                color: var(--pw-accent);\n                box-shadow: none;\n                border: 1px solid var(--pw-border);\n            }\n\n            .purpura-smallest-button:hover {\n                background: rgba(168, 85, 247, 0.25);\n            }\n\n            .purpura-empty-state, .purpura-loading-state, .purpura-no-results {\n                display: flex;\n                flex-direction: column;\n                align-items: center;\n                justify-content: center;\n                padding: 60px 20px;\n                text-align: center;\n            }\n\n            .purpura-empty-state svg, .purpura-no-results svg {\n                margin-bottom: 20px;\n                opacity: 0.4;\n                color: var(--pw-accent);\n            }\n\n            .purpura-empty-state p, .purpura-loading-state p, .purpura-no-results p {\n                font-size: 15px;\n                font-weight: 700;\n                color: var(--pw-text);\n                margin-bottom: 6px;\n            }\n\n            .purpura-empty-state span, .purpura-no-results span {\n                font-size: 13px;\n                color: var(--pw-muted);\n            }\n\n            .purpura-spinner {\n                width: 36px;\n                height: 36px;\n                border: 3px solid var(--pw-border);\n                border-top-color: var(--pw-accent);\n                border-radius: 50%;\n                animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;\n                margin-bottom: 16px;\n            }\n\n            .purpura-results-header {\n                display: flex;\n                align-items: center;\n                justify-content: space-between;\n                margin-bottom: 20px;\n            }\n\n            .purpura-sort-select {\n                background: var(--pw-input-bg);\n                color: var(--pw-text);\n                border: 1px solid var(--pw-border);\n                border-radius: 10px;\n                font-size: 12px;\n                font-weight: 700;\n                padding: 6px 12px;\n                outline: none;\n                cursor: pointer;\n            }\n\n            .purpura-sort-select option {\n                background: var(--purpura-glw-option-bg);\n                color: var(--purpura-glw-option-color);\n            }\n\n            @keyframes spin {\n                to { transform: rotate(360deg); }\n            }\n        `;
document.head.appendChild(e);
}
function attachEventListeners() {
const e = document.getElementById("purpuraWidgetButton");
const n = document.getElementById("purpuraWidgetClose");
const t = document.getElementById("purpuraGameSearch");
const r = document.getElementById("purpuraClearSearch");
const o = document.querySelector(".purpura-widget-header");
const i = document.getElementById("purpuraSortSelect");
e.addEventListener("click", e => {
if (!s) {
toggleWidget();
}
});
n.addEventListener("click", () => toggleWidget());
let p;
t.addEventListener("input", e => {
const n = e.target.value.trim();
u = -1;
if (n.length === 0) {
r.style.display = "none";
showRecentGames();
} else {
r.style.display = "block";
clearTimeout(p);
p = setTimeout(() => searchGames(n), h);
}
});
r.addEventListener("click", () => {
t.value = "";
r.style.display = "none";
u = -1;
c = [];
showRecentGames();
t.focus();
});
i.value = d;
i.addEventListener("change", e => {
d = e.target.value;
u = -1;
chrome.storage.local.set({
widgetSortMode: d
});
renderSortedSearchResults();
});
document.addEventListener("keydown", e => {
if (e.key !== "/") {
return;
}
if (!a) {
return;
}
const n = e.target;
const r = n?.tagName;
if (r === "INPUT" || r === "TEXTAREA" || r === "SELECT" || n?.isContentEditable) {
return;
}
e.preventDefault();
t.focus();
t.select();
});
t.addEventListener("keydown", e => {
const n = document.getElementById("purpuraSearchResults").style.display === "block";
if (!n) {
return;
}
if (e.key === "ArrowDown") {
e.preventDefault();
moveActiveSearchItem(1);
return;
}
if (e.key === "ArrowUp") {
e.preventDefault();
moveActiveSearchItem(-1);
return;
}
if (e.key === "Enter") {
const n = getActiveSearchItem();
if (!n) {
return;
}
e.preventDefault();
if (e.shiftKey) {
n.querySelector(".purpura-smallest-button")?.click();
} else {
n.querySelector(".purpura-play-button")?.click();
}
return;
}
if (e.key === "Escape") {
u = -1;
updateActiveSearchItem();
}
});
setupDragging(e);
setupDragging(o);
}
function setupDragging(e) {
e.addEventListener("pointerdown", n);
function n(n) {
if (n.button !== 0) {
return;
}
if (n.target.closest(".purpura-widget-close, .purpura-play-button, .purpura-smallest-button, .purpura-clear-search, #purpuraGameSearch")) {
return;
}
s = false;
const t = document.getElementById("purpura-game-launcher-widget");
const o = document.getElementById("purpuraWidgetPanel");
const i = t.getBoundingClientRect();
t.classList.add("dragging");
e.setPointerCapture(n.pointerId);
document.body.style.userSelect = "none";
document.body.style.webkitUserSelect = "none";
const u = 56;
const c = 56;
const d = o ? o.getBoundingClientRect() : null;
const g = a ? Math.ceil(d?.width || 380) : u;
const m = a ? Math.ceil(d?.height || 450) : c;
p = {
x: n.clientX - i.left,
y: n.clientY - i.top
};
let h = false;
let w = i.left;
let b = i.top;
function y() {
l = 0;
t.style.left = w + "px";
t.style.top = b + "px";
r = {
x: w / window.innerWidth,
y: b / window.innerHeight
};
}
function v(e) {
if (!h) {
h = true;
s = true;
}
const n = Math.max(0, Math.min(window.innerWidth - g, e.clientX - p.x));
const t = Math.max(0, Math.min(window.innerHeight - m, e.clientY - p.y));
w = n;
b = t;
if (!l) {
l = requestAnimationFrame(y);
}
}
function f() {
document.removeEventListener("pointermove", v);
document.removeEventListener("pointerup", f);
document.removeEventListener("pointercancel", f);
if (l) {
cancelAnimationFrame(l);
l = 0;
y();
}
if (h) {
chrome.storage.local.set({
widgetPosition: r
});
}
document.body.style.userSelect = "";
document.body.style.webkitUserSelect = "";
t.classList.remove("dragging");
setTimeout(() => {
s = false;
}, 100);
}
document.addEventListener("pointermove", v);
document.addEventListener("pointerup", f);
document.addEventListener("pointercancel", f);
}
}
function toggleWidget() {
const e = document.getElementById("purpura-game-launcher-widget");
const n = document.getElementById("purpuraGameSearch");
a = !a;
if (a) {
const t = e.getBoundingClientRect();
const r = 380;
const a = 450;
e.setAttribute("data-original-x", t.left);
e.setAttribute("data-original-y", t.top);
let o = t.left;
let i = t.top;
if (o + r > window.innerWidth) {
o = window.innerWidth - r - 20;
}
if (i + a > window.innerHeight) {
i = window.innerHeight - a - 20;
}
o = Math.max(20, o);
i = Math.max(20, i);
e.style.left = o + "px";
e.style.top = i + "px";
e.classList.add("expanded");
showRecentGames();
setTimeout(() => n.focus(), 72);
} else {
const t = e.getAttribute("data-original-x");
const r = e.getAttribute("data-original-y");
if (t !== null && r !== null) {
e.style.left = t + "px";
e.style.top = r + "px";
}
e.classList.remove("expanded");
n.value = "";
document.getElementById("purpuraClearSearch").style.display = "none";
u = -1;
c = [];
updateActiveSearchItem();
}
}
async function searchGames(e) {
const n = document.getElementById("purpuraSearchResults");
const t = document.getElementById("purpuraResultsList");
const r = document.getElementById("purpuraLoadingState");
const a = document.getElementById("purpuraEmptyState");
const i = document.getElementById("purpuraRecentGames");
a.style.display = "none";
i.style.display = "none";
n.style.display = "none";
r.style.display = "flex";
try {
const n = e.toLowerCase();
const t = o.get(n);
if (t && Date.now() - t.timestamp < g) {
displaySearchResults(t.results);
return;
}
const r = await chrome.runtime.sendMessage({
action: "searchGames",
query: e
});
if (!r || r.error) {
throw new Error(r?.error || "Search failed");
}
const a = r.results || [];
o.set(n, {
results: a,
timestamp: Date.now()
});
displaySearchResults(a);
} catch (e) {
r.style.display = "none";
displayNoResults();
}
}
function displaySearchResults(e) {
const n = document.getElementById("purpuraSearchResults");
const t = document.getElementById("purpuraLoadingState");
t.style.display = "none";
u = -1;
c = Array.isArray(e) ? e : [];
if (c.length === 0) {
displayNoResults();
return;
}
n.style.display = "block";
renderSortedSearchResults();
}
function displayNoResults() {
const e = document.getElementById("purpuraResultsList");
u = -1;
c = [];
e.innerHTML = `\n            <div class="purpura-no-results">\n                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"                stroke="var(--purpura-glw-svg-stroke)" stroke-width="2">\n                    <circle cx="11" cy="11" r="8"/>\n                    <path d="M21 21l-4.35-4.35"/>\n                </svg>\n                <p>${t("gameLauncher_noResults")}</p>\n            </div>\n        `;
document.getElementById("purpuraSearchResults").style.display = "block";
document.getElementById("purpuraLoadingState").style.display = "none";
}
function createGameItem(e, n = 0) {
const r = document.createElement("div");
r.className = "purpura-game-item";
r.dataset.gameId = String(e.id);
r.style.animationDelay = `${n * .05}s`;
r.innerHTML = `\n            <img class="purpura-game-thumbnail" src="${e.thumbnail}" alt="${e.name}">\n            <div class="purpura-game-info">\n                <div class="purpura-game-name" title="${e.name}">${e.name}</div>\n                <div class="purpura-game-stats">\n                    <span class="purpura-stat">\n                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle;opacity:0.7;">\n                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>\n                            <circle cx="9" cy="7" r="4"/>\n                        </svg>\n                        ${formatPlayerCount(e.playerCount)}\n                    </span>\n                </div>\n            </div>\n            <div class="purpura-game-actions">\n                <button class="purpura-play-button" data-game-id="${e.id}" title="${t("gameLauncher_play")}" aria-label="Play ${escapeAttribute(e.name)}">\n                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">\n                        <path d="M8 5.14v14l11-7z"/>\n                    </svg>\n                </button>\n                <button class="purpura-smallest-button" data-game-id="${e.id}" title="${t("gameLauncher_joinSmallest")}" aria-label="Join smallest server in ${escapeAttribute(e.name)}">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">\n                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>\n                        <circle cx="9" cy="7" r="4"/>\n                        <path d="M19 13l2-2-2-2m2 2h-6"/>\n                    </svg>\n                </button>\n            </div>\n        `;
r.addEventListener("click", () => {
launchGame(e);
});
r.querySelector(".purpura-play-button").addEventListener("click", n => {
n.stopPropagation();
launchGame(e);
});
r.querySelector(".purpura-smallest-button").addEventListener("click", n => {
n.stopPropagation();
launchSmallestServer(e.id);
});
return r;
}
function showRecentGames() {
const e = document.getElementById("purpuraEmptyState");
const n = document.getElementById("purpuraRecentGames");
const t = document.getElementById("purpuraSearchResults");
const r = document.getElementById("purpuraLoadingState");
u = -1;
c = [];
t.style.display = "none";
r.style.display = "none";
if (i.length === 0) {
e.style.display = "flex";
n.style.display = "none";
} else {
e.style.display = "none";
displayRecentGames();
}
}
function displayRecentGames() {
const e = document.getElementById("purpuraRecentGames");
const n = document.getElementById("purpuraRecentList");
u = -1;
e.style.display = "block";
n.innerHTML = "";
i.forEach((e, t) => {
const r = createGameItem(e, t);
n.appendChild(r);
});
}
function launchGame(e) {
addToRecentGames(e);
window.location.href = `roblox://placeid=${e.id}`;
}
async function launchSmallestServer(e) {
try {
const n = await fetch(`https://games.roblox.com/v1/games/${e}/servers/Public?sortOrder=Asc&limit=100`);
if (!n.ok) {
window.location.href = `roblox://placeid=${e}`;
return;
}
const t = await n.json();
if (!t.data || t.data.length === 0) {
window.location.href = `roblox://placeid=${e}`;
return;
}
let r = t.data.reduce((e, n) => {
if (n.playing > 0 && n.playing < e.playing) {
return n;
}
return e;
}, t.data[0]);
window.location.href = `roblox://placeid=${e}&gameinstanceid=${r.id}`;
} catch (n) {
window.location.href = `roblox://placeid=${e}`;
}
}
function addToRecentGames(e) {
i = i.filter(n => n.id !== e.id);
i.unshift(e);
i = i.slice(0, m);
chrome.storage.local.set({
recentGames: i
});
}
function formatPlayerCount(e) {
if (typeof e !== "number") return "0";
return e.toLocaleString("en-US");
}
function renderSortedSearchResults() {
const e = document.getElementById("purpuraSearchResults");
const n = document.getElementById("purpuraResultsList");
if (!c.length) {
displayNoResults();
return;
}
const t = sortGames(c, d);
e.style.display = "block";
n.innerHTML = "";
t.forEach((e, t) => {
const r = createGameItem(e, t);
n.appendChild(r);
});
updateActiveSearchItem();
}
function sortGames(e, n) {
const t = [ ...e ];
if (n === "players-asc") {
t.sort((e, n) => toPlayerCount(e.playerCount) - toPlayerCount(n.playerCount));
return t;
}
if (n === "name-asc") {
t.sort((e, n) => String(e.name || "").localeCompare(String(n.name || ""), undefined, {
sensitivity: "base"
}));
return t;
}
if (n === "name-desc") {
t.sort((e, n) => String(n.name || "").localeCompare(String(e.name || ""), undefined, {
sensitivity: "base"
}));
return t;
}
t.sort((e, n) => toPlayerCount(n.playerCount) - toPlayerCount(e.playerCount));
return t;
}
function toPlayerCount(e) {
return typeof e === "number" && Number.isFinite(e) ? e : 0;
}
function escapeAttribute(e) {
return String(e).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function getSearchItems() {
return Array.from(document.querySelectorAll("#purpuraResultsList .purpura-game-item"));
}
function getActiveSearchItem() {
const e = getSearchItems();
if (!e.length || u < 0 || u >= e.length) {
return null;
}
return e[u];
}
function moveActiveSearchItem(e) {
const n = getSearchItems();
if (!n.length) {
return;
}
if (u === -1) {
u = e > 0 ? 0 : n.length - 1;
} else {
u = (u + e + n.length) % n.length;
}
updateActiveSearchItem();
}
function updateActiveSearchItem() {
const e = getSearchItems();
e.forEach((e, n) => {
e.classList.toggle("is-active", n === u);
});
const n = getActiveSearchItem();
if (n) {
n.scrollIntoView({
block: "nearest"
});
}
}
function ensureWidgetOnScreen() {
const e = document.getElementById("purpura-game-launcher-widget");
if (!e) return;
const n = 60;
const t = window.innerWidth - n;
const a = window.innerHeight - n;
if (r.x < 0) r.x = 0;
if (r.x > 1) r.x = 1;
if (r.y < 0) r.y = 0;
if (r.y > 1) r.y = 1;
let o = r.x * window.innerWidth;
let i = r.y * window.innerHeight;
if (o < 0) o = 20; else if (o > t) o = t - 20;
if (i < 0) i = 20; else if (i > a) i = a - 20;
e.style.left = `${o}px`;
e.style.top = `${i}px`;
}
window.addEventListener("resize", ensureWidgetOnScreen);
window.addEventListener("load", ensureWidgetOnScreen);
chrome.storage.onChanged.addListener((e, n) => {
if (n === "sync" && e["glw"]) {
const n = window.__PurpuraSettings ? window.__PurpuraSettings.get("glw") : e["glw"].newValue;
const t = document.getElementById("purpura-game-launcher-widget");
if (n && !t) {
initializeGameLauncherWidget();
} else if (!n && t) {
t.remove();
const e = document.getElementById("purpura-widget-styles");
if (e) e.remove();
}
}
});
}
