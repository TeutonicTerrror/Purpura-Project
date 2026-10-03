/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
function n(n, r) {
return chrome.i18n.getMessage(n, r) || n;
}
let r = false;
let e = false;
let mb = false;
let psb = false;
let t = null;
let a = null;
let i = null;
let o = null;
let p = "dark";
let s = [];
let u = [];
const l = 44;
function c() {
const n = document.documentElement;
if (n.classList.contains("dark-theme") || n.getAttribute("data-theme") === "dark") return "dark";
if (n.classList.contains("light-theme") || n.getAttribute("data-theme") === "light") return "light";
if (document.body) {
if (document.body.classList.contains("dark-theme") || document.body.classList.contains("theme-dark")) return "dark";
if (document.body.classList.contains("light-theme") || document.body.classList.contains("theme-light")) return "light";
}
return "dark";
}
const d = [ {
id: "home",
icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
label: n("sdbr_home"),
url: "https://www.roblox.com/home",
pattern: "/home"
}, {
id: "charts",
icon: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
label: n("sdbr_charts"),
url: "https://www.roblox.com/charts",
pattern: "/charts"
}, {
id: "profile",
icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
label: "Profile",
url: null,
pattern: "/profile"
}, {
id: "friends",
icon: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M1 21v-1a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v1 M16 3.13a4 4 0 0 1 0 7.75 M22 21v-1a4 4 0 0 0-3-3.87",
label: n("sdbr_friends"),
url: null,
pattern: "/friends"
}, {
id: "avatar",
icon: "M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z",
label: n("sdbr_avatar"),
url: "https://www.roblox.com/my/avatar",
pattern: "/my/avatar"
}, {
id: "marketplace",
icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
label: n("sdbr_catalog"),
url: "https://www.roblox.com/catalog",
pattern: "/catalog"
}, {
id: "groups",
icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
label: n("sdbr_groups"),
url: "https://www.roblox.com/groups",
pattern: "/groups",
altPattern: "/communities"
}, {
id: "messages",
icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
label: "Messages",
url: "https://www.roblox.com/my/messages",
pattern: "/messages"
} ];
async function b() {
if (window.location.hostname === "create.roblox.com" || window.location.hostname === "devforum.roblox.com") return;
await window.__PurpuraSettings.ready;
const n = window.__PurpuraSettings.get("sdbr");
r = n?.enabled || false;
e = n?.tradeButton || false;
mb = n?.messagesButton || false;
psb = n?.purpuraSettingsButton || false;if (r) {
    m("html", () => {
        h();
        watchSPA();
    });
}
}
function m(n, r) {
if (document.querySelector(n)) {
r();
return;
}
const e = new MutationObserver(() => {
if (document.querySelector(n)) {
e.disconnect();
r();
}
});
e.observe(document.documentElement, {
childList: true,
subtree: true
});
}
chrome.storage.onChanged.addListener(n => {
if (n.sdbr) {
const n = r;
const t = window.__PurpuraSettings.get("sdbr");
r = t?.enabled || false;
e = t?.tradeButton || false;
mb = t?.messagesButton || false;
psb = t?.purpuraSettingsButton || false;
if (n !== r) {
if (r) h(); else v();
} else if (r) {
v();
h();
}
}
});
function h() {
p = c();
g(p);
$();
if (o) o.disconnect();
o = new MutationObserver(() => {
const n = c();
if (n !== p) {
p = n;
g(p);
}
});
const n = {
attributes: true,
attributeFilter: [ "class", "data-theme" ]
};
o.observe(document.documentElement, n);
if (document.body) {
o.observe(document.body, n);
f();
document.body.classList.add("purpura-custom-sidebar-active");
} else {
m("body", () => {
if (o) o.observe(document.body, n);
f();
document.body.classList.add("purpura-custom-sidebar-active");
});
}
}
function v() {
if (t) t.remove();
if (a) a.remove();
if (i) i.disconnect();
if (o) o.disconnect();
if (document.body) document.body.classList.remove("purpura-custom-sidebar-active");
t = null;
a = null;
i = null;
o = null;
}
function g(n = "dark") {
if (!t) {
t = document.createElement("style");
t.id = "purpura-sidebar-styles";
document.head.appendChild(t);
}
const r = n === "light";
t.textContent = `\n            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');\n\n            :root {\n                --purpura-sidebar-width: 80px;\n                --purpura-sidebar-expanded: 260px;\n                --purpura-primary: ${r ? "#7c6f8e" : "#a855f7"};\n                --purpura-secondary: ${r ? "#a08c9a" : "#ec4899"};\n                --purpura-bg: ${r ? "rgba(238, 236, 233, 0.82)" : "rgba(13, 10, 20, 0.85)"};\n                --purpura-border: ${r ? "rgba(140, 124, 160, 0.15)" : "rgba(168, 85, 247, 0.2)"};\n                --purpura-text: ${r ? "#2e2a35" : "#ffffff"};\n                --purpura-text-muted: ${r ? "rgba(62, 55, 72, 0.55)" : "rgba(255, 255, 255, 0.5)"};\n                --purpura-item-hover: ${r ? "rgba(124, 111, 142, 0.08)" : "rgba(255, 255, 255, 0.08)"};\n                --purpura-glass: blur(30px) saturate(${r ? "135%" : "180%"});\n                --purpura-bezier: cubic-bezier(0.16, 1, 0.3, 1);\n                --purpura-shadow: ${r ? "10px 0 40px rgba(80, 60, 100, 0.07)" : "4px 0 24px rgba(0, 0, 0, 0.3)"};\n                --purpura-title-grad: ${r ? "linear-gradient(135deg, #2e2a35 0%, #7c6f8e 100%)" : "linear-gradient(135deg, #fff 0%, #a855f7 100%)"};\n                --purpura-aura-opacity: ${r ? "0" : "0.1"};\n                --purpura-aura-hover: ${r ? "0" : "0.18"};\n                --purpura-exit-bg: ${r ? "rgba(0,0,0,0.01)" : "transparent"};\n                --purpura-tab-inactive: ${r ? "rgba(62, 55, 72, 0.45)" : "rgba(255, 255, 255, 0.4)"};\n                --purpura-logo-filter: none;\n            }\n\n            .purpura-custom-sidebar-active #left-navigation-container,\n            .purpura-custom-sidebar-active .icon-logo-r,\n            .purpura-custom-sidebar-active .icon-logo,\n            .purpura-custom-sidebar-active .groups-list-sidebar {\n                display: none !important;\n                visibility: hidden !important;\n                pointer-events: none !important;\n            }\n\n            .purpura-custom-sidebar-active .main-content,\n            .purpura-custom-sidebar-active .content,\n            .purpura-custom-sidebar-active .container-main,\n            .purpura-custom-sidebar-active .main-layout {\n                margin-left: var(--purpura-sidebar-width) !important;\n                transition: margin-left 0.6s var(--purpura-bezier) !important;\n                will-change: margin-left;\n            }\n\n            .purpura-sidebar-content-wrapper {\n                position: relative;\n                width: 100%;\n                flex-grow: 1;\n                min-height: 0;\n            }\n\n            #purpura-sidebar-nav .purpura-groups-section,\n            #purpura-sidebar-nav .purpura-nav-container {\n                position: absolute;\n                top: 0;\n                left: 0;\n                width: 100%;\n                height: 100%;\n                display: flex;\n                flex-direction: column;\n                gap: 8px;\n                opacity: 0;\n                transform: translateX(-15px);\n                pointer-events: none;\n                transition: opacity 0.5s cubic-bezier(0.3, 1, 0.3, 1), transform 0.5s cubic-bezier(0.3, 1, 0.3, 1);\n                will-change: opacity, transform;\n            }\n\n            #purpura-sidebar-nav .purpura-groups-section.active,\n            #purpura-sidebar-nav .purpura-nav-container.active {\n                opacity: 1;\n                transform: translateX(0);\n                pointer-events: auto;\n            }\n\n            .purpura-sidebar-tabs {\n                display: none;\n                width: 100%;\n                gap: 4px;\n                margin-bottom: 16px;\n                padding: 4px;\n                background: rgba(255, 255, 255, 0.03);\n                border-radius: 12px;\n                position: relative;\n                border: 1px solid rgba(255, 255, 255, 0.05);\n            }\n\n            #purpura-sidebar-nav:hover .purpura-sidebar-tabs {\n                display: flex;\n            }\n\n            .purpura-tab {\n                flex: 1;\n                height: 32px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                border-radius: 8px;\n                color: var(--purpura-tab-inactive);\n                cursor: pointer;\n                transition: all 0.4s cubic-bezier(0.3, 1, 0.3, 1);\n                position: relative;\n                z-index: 2;\n            }\n\n            .purpura-tab:hover {\n                color: ${r ? "rgba(62, 55, 72, 0.8)" : "rgba(255, 255, 255, 0.8)"};\n            }\n\n            .purpura-tab.active {\n                color: var(--purpura-text);\n            }\n\n            .purpura-tab-slider {\n                position: absolute;\n                top: 4px;\n                left: 4px;\n                width: calc(50% - 4px);\n                height: 32px;\n                background: ${r ? "rgba(124, 111, 142, 0.12)" : "rgba(168, 85, 247, 0.2)"};\n                border: 1px solid ${r ? "rgba(124, 111, 142, 0.2)" : "rgba(168, 85, 247, 0.3)"};\n                border-radius: 8px;\n                transition: transform 0.5s cubic-bezier(0.3, 1, 0.3, 1);\n                z-index: 1;\n                box-shadow: 0 4px 15px ${r ? "rgba(124, 111, 142, 0.08)" : "rgba(168, 85, 247, 0.1)"};\n            }\n\n            .purpura-tab-icon {\n                width: 18px;\n                height: 18px;\n                stroke: currentColor;\n                stroke-width: 2.5;\n                fill: none;\n                transition: all 0.4s ease;\n            }\n\n            .purpura-groups-title {\n                font-size: 11px;\n                font-weight: 700;\n                text-transform: uppercase;\n                letter-spacing: 0.05em;\n                color: ${r ? "rgba(62, 55, 72, 0.45)" : "rgba(255, 255, 255, 0.3)"};\n                margin-bottom: 4px;\n                padding-left: 4px;\n            }\n\n            #purpura-sidebar-nav .purpura-groups-search {\n                margin: 4px 8px 12px 0;\n                position: relative;\n            }\n\n            #purpura-sidebar-nav .purpura-groups-search input {\n                width: 100%;\n                background: var(--purpura-item-hover);\n                border: 1px solid var(--purpura-border);\n                border-radius: 10px;\n                padding: 8px 12px 8px 36px !important;\n                color: var(--purpura-text);\n                font-size: 12px;\n                outline: none;\n                transition: all 0.3s ease;\n                font-family: inherit;\n                box-sizing: border-box !important;\n            }\n\n            #purpura-sidebar-nav .purpura-groups-search input:focus {\n                border-color: var(--purpura-primary);\n                background: ${r ? "rgba(124, 111, 142, 0.06)" : "rgba(168, 85, 247, 0.05)"};\n                box-shadow: 0 0 15px ${r ? "rgba(124, 111, 142, 0.1)" : "rgba(168, 85, 247, 0.1)"};\n            }\n\n            #purpura-sidebar-nav .purpura-search-icon {\n                position: absolute !important;\n                left: 11px !important;\n                top: 50% !important;\n                transform: translateY(-50%) !important;\n                width: 14px !important;\n                height: 14px !important;\n                color: ${r ? "rgba(62, 55, 72, 0.3)" : "rgba(255, 255, 255, 0.25)"};\n                pointer-events: none;\n                transition: color 0.3s ease, transform 0.3s ease;\n            }\n\n            #purpura-sidebar-nav .purpura-groups-search input:focus ~ .purpura-search-icon {\n                color: var(--purpura-primary);\n                transform: translateY(-50%) scale(1.1) !important;\n            }\n\n            .purpura-groups-list {\n                display: block;\n                flex-grow: 1;\n                overflow-y: auto;\n                padding-right: 8px;\n                position: relative;\n            }\n\n            .purpura-groups-canvas {\n                position: relative;\n                width: 100%;\n            }\n\n            .purpura-groups-list::-webkit-scrollbar {\n                width: 6px;\n                display: block !important;\n            }\n\n            .purpura-groups-list::-webkit-scrollbar-thumb {\n                background: ${r ? "rgba(124, 111, 142, 0.2)" : "rgba(255, 255, 255, 0.2)"};\n                border-radius: 10px;\n            }\n\n            .purpura-groups-list::-webkit-scrollbar-track {\n                background: transparent;\n            }\n\n            .purpura-group-item {\n                display: flex;\n                align-items: center;\n                gap: 12px;\n                padding: 6px 8px;\n                border-radius: 10px;\n                cursor: pointer;\n                transition: background 0.2s ease, transform 0.2s ease;\n                height: 40px;\n                position: absolute;\n                left: 0;\n                width: 100%;\n                box-sizing: border-box;\n            }\n\n            .purpura-group-item:hover {\n                background: ${r ? "rgba(124, 111, 142, 0.07)" : "rgba(255, 255, 255, 0.05)"};\n                transform: translateX(4px);\n            }\n\n            .purpura-group-icon {\n                width: 28px;\n                height: 28px;\n                border-radius: 6px;\n                object-fit: cover;\n                background: ${r ? "rgba(124, 111, 142, 0.08)" : "rgba(255, 255, 255, 0.05)"};\n            }\n\n            .purpura-group-info {\n                display: flex;\n                flex-direction: column;\n                min-width: 0;\n            }\n\n            .purpura-group-name {\n                font-size: 13px;\n                font-weight: 600;\n                color: var(--purpura-text);\n                white-space: nowrap;\n                overflow: hidden;\n                text-overflow: ellipsis;\n            }\n\n            #purpura-sidebar-nav {\n                position: fixed;\n                left: 0;\n                top: 0;\n                height: 100vh;\n                width: var(--purpura-sidebar-width);\n                background: var(--purpura-bg);\n                backdrop-filter: var(--purpura-glass);\n                -webkit-backdrop-filter: var(--purpura-glass);\n                border-right: 1px solid var(--purpura-border);\n                box-shadow: var(--purpura-shadow);\n                z-index: 10000;\n                display: flex;\n                flex-direction: column;\n                align-items: center;\n                padding: 12px;\n                transition: width 0.6s var(--purpura-bezier), box-shadow 0.6s ease, padding 0.6s var(--purpura-bezier);\n                will-change: width, backdrop-filter;\n                transform: translateZ(0);\n                overflow: hidden;\n                font-family: 'Inter', sans-serif;\n                box-sizing: border-box;\n                color: var(--purpura-text);\n            }\n\n            #purpura-sidebar-nav:hover {\n                width: var(--purpura-sidebar-expanded);\n                box-shadow: ${r ? "20px 0 50px rgba(80, 60, 100, 0.1)" : "20px 0 50px rgba(0, 0, 0, 0.5)"};\n                align-items: flex-start;\n                padding-left: 12px;\n                padding-right: 12px;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-logo {\n                width: 100%;\n                margin-bottom: 8px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                text-decoration: none;\n                flex-shrink: 0;\n                transition: all 0.5s var(--purpura-bezier);\n                position: relative;\n                padding: 4px 0;\n            }\n\n            .purpura-logo-wrapper {\n                position: relative;\n                width: 64px;\n                height: 64px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                z-index: 2;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-logo img {\n                width: 52px;\n                height: 52px;\n                object-fit: contain;\n                transition: all 0.5s var(--purpura-bezier);\n                filter: var(--purpura-logo-filter);\n                mix-blend-mode: normal;\n                display: block;\n            }\n\n            .purpura-sidebar-logo-icon {\n                display: none;\n            }\n\n            .purpura-header-blob {\n                position: absolute;\n                width: 40px;\n                height: 40px;\n                border-radius: 50%;\n                z-index: 1;\n                filter: blur(30px);\n                transition: opacity 1.2s ease, transform 1.2s var(--purpura-bezier), left 0.2s ease-out, top 0.2s ease-out;\n                opacity: var(--purpura-aura-opacity);\n                pointer-events: none;\n            }\n\n            .purpura-blob-1 {\n                background: var(--purpura-primary);\n                top: 5px;\n                left: 15px;\n                animation: purpura-blob-top 8s infinite alternate ease-in-out;\n            }\n\n            .purpura-blob-2 {\n                background: ${r ? "#9d8fad" : "#4f46e5"};\n                bottom: 5px;\n                right: 15px;\n                animation: purpura-blob-bottom 8s infinite alternate ease-in-out 2s;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-logo:hover .purpura-header-blob {\n                opacity: var(--purpura-aura-hover);\n                animation: none;\n                left: var(--purpura-logo-mouse-x, 50%);\n                top: var(--purpura-logo-mouse-y, 50%);\n                transform: translate(-50%, -50%) scale(2.5);\n                width: 40px;\n                height: 40px;\n                border-radius: 50%;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-logo:hover .purpura-blob-1 {\n                transition-delay: 0s;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-logo:hover .purpura-blob-2 {\n                transition-delay: 0.1s;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-logo:hover img {\n                filter: ${r ? "brightness(0.95)" : "brightness(1.2)"};\n            }\n\n            @keyframes purpura-blob-top {\n                from { transform: translate(0, 0); }\n                to { transform: translate(15px, 25px); }\n            }\n\n            @keyframes purpura-blob-bottom {\n                from { transform: translate(0, 0); }\n                to { transform: translate(-15px, -25px); }\n            }\n\n            #purpura-sidebar-nav:hover .purpura-sidebar-logo {\n                padding-left: 12px;\n                justify-content: flex-start;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-title {\n                margin-left: 0;\n                font-size: 32px;\n                font-weight: 950;\n                background: var(--purpura-title-grad);\n                -webkit-background-clip: text;\n                -webkit-text-fill-color: transparent;\n                white-space: nowrap;\n                letter-spacing: -0.04em;\n                display: inline-block;\n                line-height: 1;\n                width: 0;\n                overflow: hidden;\n                flex-shrink: 0;\n                opacity: 0;\n                transform: translateY(8px);\n                clip-path: inset(0 100% 0 0);\n                transition: opacity 0.2s ease, transform 0.3s ease;\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-title.visible {\n                margin-left: 12px;\n                width: auto;\n                overflow: visible;\n                opacity: 1;\n                transform: translateY(0);\n                animation: purpura-type-in 0.5s steps(7, end) forwards;\n            }\n\n            @keyframes purpura-type-in {\n                from { clip-path: inset(0 100% 0 0); }\n                to { clip-path: inset(0 0 0 0); }\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-divider {\n                width: 40px;\n                height: 1px;\n                background: var(--purpura-border);\n                margin: 4px 0 12px 0;\n                flex-shrink: 0;\n                transition: width 0.5s cubic-bezier(0.3, 1, 0.3, 1);\n                will-change: width;\n            }\n\n            #purpura-sidebar-nav:hover .purpura-sidebar-divider {\n                width: 100%;\n                background: var(--purpura-border);\n            }\n\n            #purpura-sidebar-nav:hover .purpura-sidebar-logo {\n                width: 100%;\n                justify-content: flex-start;\n            }\n\n            #purpura-sidebar-nav .purpura-nav-item {\n                display: flex;\n                align-items: center;\n                width: 100%;\n                height: 52px;\n                border-radius: 14px;\n                color: var(--purpura-text-muted);\n                text-decoration: none;\n                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n                position: relative;\n                cursor: pointer;\n                overflow: hidden;\n            }\n\n            #purpura-sidebar-nav .purpura-nav-item:hover {\n                background: var(--purpura-item-hover);\n                color: var(--purpura-text);\n                transform: translateX(4px);\n            }\n\n            #purpura-sidebar-nav:hover .purpura-nav-item {\n                padding-left: 16px;\n            }\n\n            #purpura-sidebar-nav .purpura-nav-item.active {\n                background: ${r ? "rgba(124, 111, 142, 0.10)" : "rgba(124, 58, 237, 0.12)"};\n                color: var(--purpura-primary);\n                border: 1px solid ${r ? "rgba(124, 111, 142, 0.18)" : "rgba(124, 58, 237, 0.2)"};\n                font-weight: 700;\n            }\n\n            #purpura-sidebar-nav .purpura-nav-icon {\n                width: 100%;\n                min-width: 32px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                transition: width 0.5s cubic-bezier(0.3, 1, 0.3, 1), margin-right 0.5s cubic-bezier(0.3, 1, 0.3, 1);\n                will-change: width, margin-right;\n                flex-shrink: 0;\n            }\n\n            #purpura-sidebar-nav:hover .purpura-nav-icon {\n                width: 32px;\n                min-width: 32px;\n                margin-right: 20px;\n            }\n\n            #purpura-sidebar-nav .purpura-nav-icon svg {\n                width: 24px;\n                height: 24px;\n                stroke: currentColor;\n                stroke-width: 2;\n                stroke-linecap: round;\n                stroke-linejoin: round;\n                fill: none;\n            }\n\n            #purpura-sidebar-nav .purpura-nav-label {\n                font-size: 15px;\n                font-weight: 600;\n                white-space: nowrap;\n                opacity: 0;\n                transform: translateX(-10px);\n                transition: opacity 0.4s cubic-bezier(0.3, 1, 0.3, 1), transform 0.4s cubic-bezier(0.3, 1, 0.3, 1);\n                will-change: opacity, transform;\n            }\n\n            #purpura-sidebar-nav:hover .purpura-nav-label {\n                opacity: 1;\n                transform: translateX(0);\n            }\n\n            #purpura-sidebar-nav .purpura-sidebar-footer {\n                width: 100%;\n                padding-top: 20px;\n                border-top: 1px solid ${r ? "rgba(124, 111, 142, 0.12)" : "rgba(255, 255, 255, 0.05)"};\n                display: flex;\n                flex-direction: column;\n                align-items: center;\n                gap: 12px;\n            }\n\n            #purpura-sidebar-nav .purpura-support-btn {\n                width: 48px;\n                height: 48px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                background: #000000;\n                border-radius: 14px;\n                color: #fff;\n                text-decoration: none;\n                font-weight: 700;\n                font-size: 14px;\n                transition: all 0.5s var(--purpura-bezier);\n                overflow: hidden;\n                position: relative;\n                flex-shrink: 0;\n                gap: 12px;\n                box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.2);\n                font-family: 'Quicksand', Helvetica, Century Gothic, sans-serif;\n            }\n\n            #purpura-sidebar-nav:hover .purpura-support-btn {\n                width: 100%;\n                padding: 0 16px;\n                justify-content: flex-start;\n            }\n\n            #purpura-sidebar-nav .purpura-support-btn::after {\n                content: '';\n                position: absolute;\n                top: 0;\n                left: -100%;\n                width: 100%;\n                height: 100%;\n                background: linear-gradient(\n                    90deg,\n                    transparent,\n                    rgba(255, 255, 255, 0.2),\n                    transparent\n                );\n                transition: all 0.6s ease;\n                pointer-events: none;\n            }\n\n            .purpura-support-btn:hover {\n                opacity: .85;\n                transform: translateY(-2px) scale(1.02);\n            }\n\n            .purpura-support-btn:hover::after {\n                left: 100%;\n            }\n\n            /* Page Exit Animation */\n            body.purpura-nav-exit #purpura-sidebar-nav {\n                transform: translateX(-100%);\n                opacity: 0;\n                transition: all 0.4s var(--purpura-bezier);\n            }\n\n            body.purpura-nav-exit > :not(#purpura-sidebar-nav):not(script):not(style) {\n                opacity: 0;\n                filter: blur(15px);\n                transform: scale(0.98);\n                transition: all 0.45s ease-in-out;\n                pointer-events: none;\n            }\n\n            #skip-to-main-content {\n                display: none !important;\n                visibility: hidden !important;\n                pointer-events: none !important;\n            }\n\n            #purpura-sidebar-nav:hover .purpura-support-btn {\n                width: 100%;\n                justify-content: flex-start;\n                padding: 0 20px;\n                border-radius: 16px;\n            }\n\n            .purpura-support-label {\n                display: none;\n                font-size: 14px;\n                font-weight: 700;\n                white-space: nowrap;\n            }\n\n            #purpura-sidebar-nav:hover .purpura-support-label {\n                display: block;\n            }\n        `;
}
function f() {
if (a || !document.body) return;
a = document.createElement("nav");
a.id = "purpura-sidebar-nav";
const r = document.createElement("div");
r.className = "purpura-sidebar-logo";
r.style.cursor = "pointer";
r.addEventListener("click", () => {
document.body.classList.add("purpura-nav-exit");
setTimeout(() => {
window.location.href = "https://www.roblox.com/home";
}, 300);
});
const t = document.createElement("div");
t.className = "purpura-logo-wrapper";
const i = document.createElement("img");
i.src = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
t.appendChild(i);
const o = document.createElement("div");
o.className = "purpura-header-blob purpura-blob-1";
r.appendChild(o);
const p = document.createElement("div");
p.className = "purpura-header-blob purpura-blob-2";
r.appendChild(p);
r.appendChild(t);
r.addEventListener("mousemove", n => {
const e = r.getBoundingClientRect();
const t = n.clientX - e.left;
const a = n.clientY - e.top;
r.style.setProperty("--purpura-logo-mouse-x", `${t}px`);
r.style.setProperty("--purpura-logo-mouse-y", `${a}px`);
});
a.appendChild(r);
const l = document.createElement("div");
l.className = "purpura-sidebar-divider";
a.appendChild(l);
const c = document.createElement("span");
c.className = "purpura-sidebar-title";
c.textContent = "Purpura";
r.appendChild(c);
a.addEventListener("mouseenter", () => {
c.classList.add("visible");
});
const b = window.location.pathname.includes("/communities") || window.location.pathname.includes("/groups");
a.addEventListener("mouseleave", () => {
c.classList.remove("visible");
if (b) {
const n = a.querySelector("#purpura-tab-nav");
const r = a.querySelector("#purpura-tab-groups");
const e = a.querySelector(".purpura-nav-container");
const t = a.querySelector(".purpura-groups-section");
if (n && r && e && t) {
n.classList.add("active");
r.classList.remove("active");
e.classList.add("active");
t.classList.remove("active");
}
}
});
const m = document.createElement("div");
m.className = "purpura-sidebar-content-wrapper";
const h = document.createElement("div");
h.className = "purpura-nav-container active";
d.forEach(n => {
if (n.id === "messages" && !mb) return;
const r = document.createElement("div");
r.className = "purpura-nav-item";
r.style.cursor = "pointer";
if (n.url) r.setAttribute("data-url", n.url);
r.setAttribute("data-pattern", n.pattern);
if (n.altPattern) r.setAttribute("data-altpattern", n.altPattern);
if (n.id === "profile" || n.id === "friends") {
L(r, n.id);
}
if (window.location.pathname.includes(n.pattern) || n.altPattern && window.location.pathname.includes(n.altPattern)) {
r.classList.add("active");
}
let e;
r.addEventListener("mouseenter", () => {
const n = r.getAttribute("data-url");
if (n) {
e = setTimeout(() => {
const r = document.createElement("link");
r.rel = "prefetch";
r.href = n;
document.head.appendChild(r);
}, 150);
}
});
r.addEventListener("mouseleave", () => {
clearTimeout(e);
});
r.addEventListener("click", () => {
const n = r.getAttribute("data-url");
if (n) {
document.body.classList.add("purpura-nav-exit");
setTimeout(() => {
window.location.href = n;
}, 300);
}
});
r.innerHTML = `\n                <div class="purpura-nav-icon">\n                    <svg viewBox="0 0 24 24"><path d="${n.icon}"/></svg>\n                </div>\n                <span class="purpura-nav-label">${n.label}</span>\n            `;
h.appendChild(r);
});
if (e) {
const r = {
id: "trade",
icon: "M4 8h12M4 8l4-4M4 8l4 4M20 16H8M20 16l-4-4M20 16l-4 4",
label: n("sdbr_trade"),
url: "https://www.roblox.com/trades",
pattern: "/trades"
};
const e = document.createElement("div");
e.className = "purpura-nav-item";
e.style.cursor = "pointer";
e.setAttribute("data-url", r.url);
e.setAttribute("data-pattern", r.pattern);
if (window.location.pathname.includes(r.pattern)) {
e.classList.add("active");
}
let t;
e.addEventListener("mouseenter", () => {
const n = e.getAttribute("data-url");
if (n) {
t = setTimeout(() => {
const r = document.createElement("link");
r.rel = "prefetch";
r.href = n;
document.head.appendChild(r);
}, 150);
}
});
e.addEventListener("mouseleave", () => {
clearTimeout(t);
});
e.addEventListener("click", () => {
const n = e.getAttribute("data-url");
if (n) {
document.body.classList.add("purpura-nav-exit");
setTimeout(() => {
window.location.href = n;
}, 300);
}
});
e.innerHTML = `\n                <div class="purpura-nav-icon">\n                    <svg viewBox="0 0 24 24"><path d="${r.icon}"/></svg>\n                </div>\n                <span class="purpura-nav-label">${r.label}</span>\n            `;
h.appendChild(e);
}
if (psb) {
const r = {
id: "purpuraSettings",
icon: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
label: "Purpura Settings",
url: "https://www.roblox.com/my/account?purpura=info#!/info",
pattern: "?purpura="
};
const e = document.createElement("div");
e.className = "purpura-nav-item";
e.style.cursor = "pointer";
e.setAttribute("data-url", r.url);
e.setAttribute("data-pattern", r.pattern);
if (window.location.href.includes(r.pattern)) {
e.classList.add("active");
}
let t;
e.addEventListener("mouseenter", () => {
const n = e.getAttribute("data-url");
if (n) {
t = setTimeout(() => {
const r = document.createElement("link");
r.rel = "prefetch";
r.href = n;
document.head.appendChild(r);
}, 150);
}
});
e.addEventListener("mouseleave", () => {
clearTimeout(t);
});
e.addEventListener("click", () => {
const n = e.getAttribute("data-url");
if (n) {
window.location.href = n;
}
});
e.innerHTML = `
                <div class="purpura-nav-icon">
                    <svg viewBox="0 0 24 24"><path d="${r.icon}"/></svg>
                </div>
                <span class="purpura-nav-label">${r.label}</span>
            `;
h.appendChild(e);
}
m.appendChild(h);
if (b) {
const n = document.createElement("div");
n.className = "purpura-sidebar-tabs";
n.innerHTML = `\n                <div class="purpura-tab-slider"></div>\n                <div class="purpura-tab active" id="purpura-tab-nav" title="Navigation">\n                    <svg class="purpura-tab-icon" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>\n                </div>\n                <div class="purpura-tab" id="purpura-tab-groups" title="Communities">\n                    <svg class="purpura-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n                        <rect x="3" y="3" width="7" height="7" rx="1"/>\n                        <rect x="14" y="3" width="7" height="7" rx="1"/>\n                        <rect x="14" y="14" width="7" height="7" rx="1"/>\n                        <rect x="3" y="14" width="7" height="7" rx="1"/>\n                    </svg>\n                </div>\n            `;
const r = a.querySelector(".purpura-sidebar-divider");
a.insertBefore(n, r.nextSibling);
const e = document.createElement("div");
e.className = "purpura-groups-section";
e.innerHTML = `\n                <div class="purpura-groups-title">My Communities</div>\n                <div class="purpura-groups-search">\n                    <input type="text" placeholder="Search communities..." id="purpura-groups-filter" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\n                    <svg class="purpura-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>\n                </div>\n                <div class="purpura-groups-list"></div>\n            `;
m.appendChild(e);
const t = e.querySelector("#purpura-groups-filter");
const i = e.querySelector(".purpura-groups-list");
t.addEventListener("input", n => {
const r = n.target.value.toLowerCase();
u = s.filter(n => n.group.name.toLowerCase().includes(r));
w(i);
});
const o = n.querySelector("#purpura-tab-nav");
const p = n.querySelector("#purpura-tab-groups");
const l = n.querySelector(".purpura-tab-slider");
o.addEventListener("click", () => {
o.classList.add("active");
p.classList.remove("active");
h.classList.add("active");
e.classList.remove("active");
l.style.transform = "translateX(0)";
});
p.addEventListener("click", () => {
p.classList.add("active");
o.classList.remove("active");
h.classList.remove("active");
e.classList.add("active");
l.style.transform = "translateX(100%)";
const n = e.querySelector(".purpura-groups-list");
if (n.children.length === 0) {
x(n);
}
});
}
a.appendChild(m);
const v = document.createElement("div");
v.className = "purpura-sidebar-footer";
var g = document.createElement("div");
g.className = "purpura-support-btn";
g.style.cursor = "pointer";
g.addEventListener("click", function() {
window.location.href = "https://" + 'ko-fi' + ".com/teutonic";
});
g.innerHTML = '\n            <img src="https://storage.' + 'ko-fi' + '.com/cdn/cup-border.png" alt="" style="height:18px;width:auto;display:block;"/>\n            <span class="purpura-support-label" style="font-family:\'Quicksand\',Helvetica,Century Gothic,sans-serif;font-weight:700;">Support Purpura</span>\n        ';
v.appendChild(g);
a.appendChild(v);
a.addEventListener("mouseleave", () => {
const n = a.querySelector("#purpura-tab-nav");
const r = a.querySelector("#purpura-tab-groups");
const e = a.querySelector(".purpura-nav-container");
const t = a.querySelector(".purpura-groups-section");
const i = a.querySelector(".purpura-tab-slider");
if (n && r && e && t && i) {
n.classList.add("active");
r.classList.remove("active");
e.classList.add("active");
t.classList.remove("active");
i.style.transform = "translateX(0)";
}
});
document.body.appendChild(a);
requestAnimationFrame(() => {
a.style.transform = "translateZ(0.01px)";
requestAnimationFrame(() => {
a.style.transform = "";
});
});
}
async function x(n) {
const r = await E();
if (!r) return;
try {
const e = await y(r);
if (!e || e.length === 0) return;
s = e;
u = [ ...s ];
const t = s.map(n => n.group.id);
const a = await k(t);
s.forEach(n => {
n.thumb = (a || []).find(r => r.targetId === n.group.id)?.imageUrl || "";
});
n.innerHTML = '<div class="purpura-groups-canvas"></div>';
n.addEventListener("scroll", () => w(n));
w(n);
} catch (n) {}
}
function w(n) {
const r = n.querySelector(".purpura-groups-canvas");
if (!r) return;
const e = u.length * l;
r.style.height = `${e}px`;
const t = n.scrollTop;
const a = n.clientHeight;
const i = Math.max(0, Math.floor(t / l) - 2);
const o = Math.min(u.length - 1, Math.ceil((t + a) / l) + 2);
const p = u.slice(i, o + 1);
const s = r.querySelectorAll(".purpura-group-item");
const c = new Set(Array.from(s).map(n => n.dataset.id));
const d = new Set(p.map(n => n.group.id.toString()));
s.forEach(n => {
if (!d.has(n.dataset.id)) n.remove();
});
p.forEach((n, e) => {
const t = n.group;
const a = i + e;
const o = t.id.toString();
if (!c.has(o)) {
const e = document.createElement("div");
e.className = "purpura-group-item";
e.dataset.id = o;
e.style.top = `${a * l}px`;
e.addEventListener("click", () => {
window.location.href = `https://www.roblox.com/communities/${t.id}/${t.name.replace(/\s+/g, "-")}`;
});
e.innerHTML = `\n                    <img class="purpura-group-icon" src="${n.thumb || ""}" alt="">\n                    <div class="purpura-group-info">\n                        <span class="purpura-group-name">${t.name}</span>\n                    </div>\n                `;
r.appendChild(e);
} else {
const n = r.querySelector(`.purpura-group-item[data-id="${o}"]`);
if (n) n.style.top = `${a * l}px`;
}
});
}
async function y(n) {
try {
const r = await fetch(`https://groups.roblox.com/v2/users/${n}/groups/roles`, {
credentials: "include"
});
const e = await r.json();
return e.data;
} catch (n) {
return [];
}
}
async function k(n) {
if (!n || n.length === 0) return [];
const r = 30;
const e = [];
for (let t = 0; t < n.length; t += r) {
const a = n.slice(t, t + r);
try {
const n = await fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${a.join(",")}&size=150x150&format=Webp&isCircular=false`);
if (!n.ok) continue;
const r = await n.json();
if (r.data) e.push(...r.data);
} catch (n) {}
}
return e;
}
async function L(n, r) {
const e = await E();
if (!e) return;
if (r === "profile") {
n.setAttribute("data-url", `https://www.roblox.com/users/${e}/profile`);
} else if (r === "friends") {
n.setAttribute("data-url", `https://www.roblox.com/users/${e}/friends`);
}
}
async function E() {
return new Promise(n => {
chrome.runtime.sendMessage({
type: "GET_USER_ID"
}, r => {
n(r?.userId || null);
});
});
}
function $() {
if (i || !document.documentElement) return;
i = new MutationObserver(() => {
if (r) {
const n = document.getElementById("left-navigation-container");
if (n) {
if (!document.getElementById("purpura-sidebar-nav")) f();
const n = document.querySelector(".main-content, .content, .container-main, .main-layout");
if (n) {
n.style.setProperty("margin-left", "var(--purpura-sidebar-width)", "important");
}
}
}
});
i.observe(document.documentElement, {
childList: true,
subtree: true
});
}
b();

function watchSPA() {
    if (window.__purpuraNavWatcher) return;
    window.__purpuraNavWatcher = true;

    function updateActiveNav() {
        const path = window.location.pathname;
        const href = window.location.href;
        
        document.querySelectorAll('#purpura-sidebar-nav .purpura-nav-item').forEach(item => {
            item.classList.remove('active');
            const pattern = item.getAttribute('data-pattern');
            const altPattern = item.getAttribute('data-altpattern');
            
            if (pattern) {
                if (pattern === "?purpura=") {
                    if (href.includes(pattern)) item.classList.add('active');
                } else if (path.includes(pattern) || (altPattern && path.includes(altPattern))) {
                    item.classList.add('active');
                }
            }
        });
    }

    const originalPush = history.pushState;
    history.pushState = function() {
        originalPush.apply(this, arguments);
        updateActiveNav();
    };

    const originalReplace = history.replaceState;
    history.replaceState = function() {
        originalReplace.apply(this, arguments);
        updateActiveNav();
    };

    window.addEventListener('popstate', updateActiveNav);

    document.addEventListener('click', () => {
        const initialUrl = window.location.href;
        setTimeout(() => {
            if (window.location.href !== initialUrl) {
                updateActiveNav();
            }
        }, 200);
    }, true);
}
})();
