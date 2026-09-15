/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
function n(n, e) {
return chrome.i18n.getMessage(n, e) || n;
}
if (window.purpuraStoreInjected) return;
window.purpuraStoreInjected = true;
const e = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
function t() {
if (document.getElementById("purpura-store-styles")) return;
const n = document.createElement("style");
n.id = "purpura-store-styles";
n.textContent = `\n            .game-store-section-header,\n            .btr-store-header,\n            ul.breadcrumb,\n            .store-header,\n            .container-header h3 {\n                display: none !important;\n            }\n\n            .store-cards {\n                display: none !important;\n            }\n\n            .content {\n                border-radius: 16px;\n                padding: 40px 32px 48px !important;\n                position: relative;\n                overflow: visible !important;\n            }\n\n            .content::before {\n                content: '';\n                position: absolute;\n                inset: 0;\n                background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(139,92,246,0.13) 0%, transparent 65%);\n                pointer-events: none;\n                z-index: 0;\n                border-radius: inherit;\n            }\n\n            .purpura-store-banner {\n                display: flex;\n                flex-direction: column;\n                align-items: center;\n                text-align: center;\n                padding: 40px 20px 32px;\n                position: relative;\n                z-index: 1;\n                animation: purpuraFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;\n            }\n\n            .purpura-store-logo {\n                width: 140px;\n                height: 140px;\n                margin-bottom: 24px;\n                display: block;\n                filter: drop-shadow(0 0 24px rgba(168, 85, 247, 0.4));\n                animation: purpuraFloat 6s ease-in-out infinite;\n            }\n\n            .purpura-store-title {\n                font-family: 'Inter', sans-serif, system-ui;\n                font-size: 48px;\n                font-weight: 700;\n                color: #f5f3ff;\n                -webkit-text-fill-color: #f5f3ff;\n                letter-spacing: -1px;\n                margin: 0 0 12px;\n                line-height: 1.15;\n            }\n\n            .purpura-store-subtitle {\n                font-family: 'Inter', sans-serif, system-ui;\n                font-size: 18px;\n                color: #6b7280;\n                max-width: 500px;\n                line-height: 1.65;\n                margin: 0;\n            }\n\n            .purpura-checkout-hub {\n                display: flex;\n                flex-direction: column;\n                align-items: center;\n                gap: 16px;\n                position: relative;\n                z-index: 1;\n                width: 100%;\n                max-width: 550px;\n                margin: 0 auto;\n                animation: purpuraFadeIn 0.7s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;\n            }\n\n            .purpura-select-wrapper {\n                position: relative;\n                width: 100%;\n                z-index: 2;\n            }\n\n            .purpura-donation-select {\n                appearance: none;\n                -webkit-appearance: none;\n                width: 100%;\n                background: rgba(255,255,255,0.04);\n                border: 1px solid rgba(255,255,255,0.08);\n                border-radius: 16px;\n                padding: 20px 52px 20px 24px;\n                color: #ede9fe;\n                font-size: 20px;\n                font-family: 'Inter', sans-serif;\n                font-weight: 600;\n                cursor: pointer;\n                transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;\n                text-align: left;\n                display: flex;\n                align-items: center;\n                box-sizing: border-box;\n            }\n\n            .purpura-donation-select:hover {\n                border-color: rgba(139,92,246,0.4);\n                background: rgba(139,92,246,0.07);\n            }\n\n            .purpura-donation-select:focus, .purpura-select-wrapper.is-open .purpura-donation-select {\n                outline: none;\n                border-color: #8b5cf6;\n                box-shadow: 0 0 0 3px rgba(139,92,246,0.18);\n            }\n\n            .purpura-options-list {\n                position: absolute;\n                bottom: calc(100% + 8px);\n                left: 0;\n                width: 100%;\n                background: rgba(18, 12, 28, 0.95);\n                backdrop-filter: blur(12px);\n                -webkit-backdrop-filter: blur(12px);\n                border: 1px solid rgba(139,92,246,0.3);\n                border-radius: 16px;\n                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);\n                opacity: 0;\n                visibility: hidden;\n                transform: translateY(10px);\n                transition: opacity 0.2s, transform 0.2s, visibility 0.2s;\n                z-index: 100;\n                max-height: 280px;\n                overflow-y: auto;\n                padding: 8px;\n                box-sizing: border-box;\n            }\n\n            .purpura-select-wrapper.is-open .purpura-options-list {\n                opacity: 1;\n                visibility: visible;\n                transform: translateY(0);\n            }\n\n            .purpura-select-wrapper.is-open .purpura-select-arrow svg {\n                transform: rotate(180deg);\n            }\n\n            .purpura-select-arrow svg {\n                transition: transform 0.2s;\n            }\n\n            .purpura-option {\n                padding: 14px 18px;\n                color: #ede9fe;\n                font-family: 'Inter', sans-serif;\n                font-size: 18px;\n                font-weight: 500;\n                border-radius: 10px;\n                cursor: pointer;\n                transition: background 0.15s, color 0.15s;\n                text-align: left;\n            }\n\n            .purpura-option:hover {\n                background: rgba(139,92,246,0.2);\n                color: #fff;\n            }\n\n            .purpura-option.selected {\n                background: rgba(139,92,246,0.35);\n                color: #fff;\n                font-weight: 600;\n            }\n\n            .purpura-options-list::-webkit-scrollbar {\n                width: 6px;\n            }\n            .purpura-options-list::-webkit-scrollbar-track {\n                background: transparent;\n            }\n            .purpura-options-list::-webkit-scrollbar-thumb {\n                background: rgba(139,92,246,0.3);\n                border-radius: 10px;\n            }\n            .purpura-options-list::-webkit-scrollbar-thumb:hover {\n                background: rgba(139,92,246,0.5);\n            }\n\n            .purpura-select-arrow {\n                position: absolute;\n                right: 24px;\n                top: 50%;\n                transform: translateY(-50%);\n                pointer-events: none;\n                color: #a78bfa;\n                display: flex;\n                align-items: center;\n            }\n\n            .purpura-checkout-btn {\n                width: 100%;\n                background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;\n                color: #fff !important;\n                border: none !important;\n                border-radius: 16px !important;\n                padding: 18px 24px !important;\n                font-size: 20px !important;\n                font-family: 'Inter', sans-serif !important;\n                font-weight: 700 !important;\n                letter-spacing: 0.2px !important;\n                cursor: pointer !important;\n                box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 16px rgba(109,40,217,0.35) !important;\n                transition: opacity 0.15s, transform 0.15s !important;\n                display: flex !important;\n                align-items: center !important;\n                justify-content: center !important;\n                gap: 12px !important;\n                height: auto !important;\n                line-height: normal !important;\n            }\n\n            .purpura-checkout-btn:hover {\n                opacity: 0.88 !important;\n                transform: scale(1.015) !important;\n            }\n\n            .purpura-checkout-btn:active {\n                transform: scale(0.98) !important;\n            }\n\n            .purpura-checkout-btn.is-owned {\n                opacity: 0.4 !important;\n                cursor: not-allowed !important;\n            }\n\n            @keyframes purpuraFadeIn {\n                from { opacity: 0; transform: translateY(10px); }\n                to { opacity: 1; transform: translateY(0); }\n            }\n\n            @keyframes purpuraFloat {\n                0%, 100% { transform: translateY(0); }\n                50% { transform: translateY(-6px); }\n            }\n        `;
document.head.appendChild(n);
}
function r(t) {
if (document.getElementById("purpura-store-banner-container")) return;
const r = document.createElement("div");
r.id = "purpura-store-banner-container";
r.className = "purpura-store-banner";
const o = document.createElement("img");
o.src = e;
o.className = "purpura-store-logo";
o.alt = "Purpura";
const a = document.createElement("h1");
a.className = "purpura-store-title";
a.textContent = n("store_supportTitle");
const i = document.createElement("p");
i.className = "purpura-store-subtitle";
i.textContent = n("store_supportDesc");
r.appendChild(o);
r.appendChild(a);
r.appendChild(i);
t.parentElement.insertBefore(r, t);
}
function o(n) {
const e = n.querySelector("a.gear-passes-asset");
if (!e) return null;
const t = e.getAttribute("href").match(/\/game-pass\/(\d+)\//);
return t ? parseInt(t[1], 10) : null;
}
function a(e) {
const t = e.querySelectorAll(".list-item.real-game-pass:not(.rbx-gear-passes-item-add)");
if (!t.length) return false;
const r = [];
t.forEach(n => {
const e = n.querySelector(".text-robux");
const t = n.querySelector(".store-card-name");
const a = o(n);
const i = !!n.querySelector(".store-card-footer h5");
if (e && a) {
const n = e.textContent.trim();
const o = parseInt(n.replace(/,/g, ""), 10);
const s = t ? t.getAttribute("title") || t.textContent.trim() : `Donate ${n}`;
if (!isNaN(o)) {
r.push({
price: o,
rawText: n,
name: s,
passId: a,
isOwned: i
});
}
}
});
if (!r.length) return false;
const a = document.getElementById("purpura-checkout-hub");
if (a && a.dataset.passCount === r.length.toString()) return true;
if (a) a.remove();
r.sort((n, e) => n.price - e.price);
const i = document.createElement("div");
i.id = "purpura-checkout-hub";
i.className = "purpura-checkout-hub";
i.dataset.passCount = r.length.toString();
const s = document.createElement("div");
s.className = "purpura-select-wrapper";
const p = document.createElement("div");
p.className = "purpura-donation-select";
p.tabIndex = 0;
const c = document.createElement("div");
c.className = "purpura-options-list";
let u = 0;
r.forEach((e, t) => {
const r = document.createElement("div");
r.className = "purpura-option";
if (t === 0) r.classList.add("selected");
r.textContent = n("store_donateAmount", [ e.rawText ]);
r.addEventListener("click", n => {
n.stopPropagation();
u = t;
f();
g();
});
c.appendChild(r);
});
const l = document.createElement("div");
l.className = "purpura-select-arrow";
l.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
p.appendChild(document.createTextNode(""));
p.appendChild(l);
s.appendChild(p);
s.appendChild(c);
const d = document.createElement("button");
d.className = "purpura-checkout-btn";
function m() {
const e = r[u];
if (!e) return;
if (e.isOwned) {
d.textContent = n("store_alreadyDonated");
} else {
d.textContent = n("store_donateAmount", [ e.rawText ]);
}
d.classList.toggle("is-owned", e.isOwned);
}
function f() {
const e = r[u];
if (!e) return;
p.childNodes[0].nodeValue = n("store_donateAmount", [ e.rawText ]);
Array.from(c.children).forEach((n, e) => {
n.classList.toggle("selected", e === u);
});
m();
}
function b() {
s.classList.toggle("is-open");
}
function g() {
s.classList.remove("is-open");
}
p.addEventListener("click", b);
document.addEventListener("click", n => {
if (!s.contains(n.target)) g();
});
f();
d.addEventListener("click", () => {
const n = r[u];
if (!n || n.isOwned) return;
if (window.RobloxItemPurchase && window.RobloxItemPurchase.startGamepassPurchaseFlow) {
window.RobloxItemPurchase.startGamepassPurchaseFlow({
productId: n.passId,
assetName: n.name,
sellerName: "",
expectedSellerId: 0,
expectedPrice: n.price,
imageUrl: "",
iconAssetId: n.passId,
discountInformation: null
});
} else {
const t = e.querySelector(`.list-item.real-game-pass a[href*="/game-pass/${n.passId}/"] ~ .store-card-caption .PurchaseButton, ` + `.list-item.real-game-pass:has(a[href*="/game-pass/${n.passId}/"]) .PurchaseButton`);
if (t) t.click();
}
});
i.appendChild(s);
i.appendChild(d);
e.parentElement.insertBefore(i, e);
return true;
}
function i() {
const n = document.querySelector("#rbx-passes-container") || document.querySelector(".store-cards") || document.querySelector(".game-store-section-content");
if (!n) return false;
r(n);
return a(n);
}
function s() {
t();
let n = i();
let e;
const r = new MutationObserver(() => {
if (!n) {
n = i();
if (n) return;
}
clearTimeout(e);
e = setTimeout(() => {
n = i() || n;
}, 100);
});
r.observe(document.body, {
childList: true,
subtree: true
});
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", s);
} else {
s();
}
})();
