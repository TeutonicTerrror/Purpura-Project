/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
const e = () => {
try {
return window.top === window;
} catch (e) {
return false;
}
};
if (!e()) return;
if (window.purpuraRothemerApiInitialized) return;
window.purpuraRothemerApiInitialized = true;
let t = "unknown";
let r = false;
let n = null;
let o = null;
let u = null;
let s = new Map;
let i = null;
let c = null;
let a = null;
let d = false;
const l = () => {
const e = window.location.pathname.toLowerCase();
const t = window.location.hostname;
if (e === "/" || e === "/home") return "home";
if (e.includes("/games/") && e.includes("/")) return "game-details";
if (e.includes("/discover")) return "discover";
if (e.includes("/games")) return "games";
if (e.includes("/catalog")) return "catalog";
if (e.includes("/avatar")) return "avatar";
if (e.includes("/inventory")) return "inventory";
if (e.includes("/users/") && e.includes("/profile")) return "profile";
if (e.includes("/users/")) return "user-profile";
if (e.includes("/groups/")) return "group";
if (e.includes("/my/messages")) return "messages";
if (e.includes("/my/account")) return "account-settings";
if (e.includes("/transactions")) return "transactions";
if (e.includes("/robux")) return "robux";
if (e.includes("/premium")) return "premium";
if (e.includes("/upgrades/")) return "upgrades";
if (e.includes("/feeds")) return "feeds";
if (e.includes("/develop")) return "develop";
if (e.includes("/create")) return "create";
if (e.includes("/library")) return "library";
if (e.includes("/search/")) return "search";
if (e.includes("/friend")) return "friends";
if (t.includes("create.roblox.com")) return "creator-dashboard";
if (t.includes("devforum.roblox.com")) return "devforum";
if (t.includes("talent.roblox.com")) return "talent-hub";
return "unknown";
};
const p = () => window.location.pathname.toLowerCase().includes("/games/");
const f = () => window.location.pathname.toLowerCase().includes("/my/account");
const m = () => {
if (!document.body) return;
t = l();
document.body.setAttribute("data-purpura-page", t);
document.body.setAttribute("data-purpura-page-id", `purpura-page-${t}`);
};
const h = e => {
if (!e || e.nodeType !== 1) return;
if (e.hasAttribute("data-purpura-id")) return;
if (e === document.body || e === document.documentElement) return;
if (e.closest && e.closest("#purpura-aeditor-host")) return;
const r = [ `purpura-${t}` ];
r.push(e.tagName.toLowerCase());
if (e.className && typeof e.className === "string") {
const t = e.className.split(" ").filter(e => e.trim());
if (t.length > 0) {
const e = t[0].replace(/[^a-z0-9-_]/gi, "-").substring(0, 30);
if (e) r.push(e);
}
}
const n = e.getAttribute("role");
const o = e.getAttribute("aria-label");
if (n) {
r.push(n);
} else if (o) {
const e = o.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 20);
if (e) r.push(e);
}
if (e.matches("a[href]")) {
const t = e.getAttribute("href");
if (t && t.startsWith("/")) {
const e = t.split("/")[1] || "link";
r.push(e.replace(/[^a-z0-9-_]/gi, "-").substring(0, 15));
}
}
if (e.matches("button")) {
const t = e.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 20);
if (t) r.push(t);
}
if (e.matches("input")) {
const t = e.getAttribute("type") || "text";
const n = e.getAttribute("name");
r.push(t);
if (n) r.push(n.replace(/[^a-z0-9-_]/gi, "-").substring(0, 15));
}
if (e.matches("img")) {
const t = e.getAttribute("alt");
if (t) {
const e = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 20);
if (e) r.push(e);
}
}
const u = r.join("-").replace(/--+/g, "-").replace(/^-|-$/g, "");
const i = s.get(u) || 0;
s.set(u, i + 1);
e.setAttribute("data-purpura-id", i === 0 ? u : `${u}-${i}`);
};
const b = () => {
if (!document.body) return;
const e = document.querySelectorAll("*:not([data-purpura-id])");
e.forEach(e => {
try {
h(e);
} catch (e) {}
});
};
const g = e => {
if (!e || e.nodeType !== 1) return;
try {
h(e);
const t = e.querySelectorAll("*:not([data-purpura-id])");
t.forEach(e => {
try {
h(e);
} catch (e) {}
});
} catch (e) {}
};
const w = () => {
if (n) {
n.disconnect();
n = null;
}
if (o) {
clearTimeout(o);
o = null;
}
if (u) {
clearTimeout(u);
u = null;
}
};
const y = () => {
if (!document.body || n) return;
s = new Map;
b();
n = new MutationObserver(e => {
e.forEach(e => {
e.addedNodes.forEach(e => {
g(e);
});
});
});
n.observe(document.body, {
childList: true,
subtree: true
});
if (o) clearTimeout(o);
if (u) clearTimeout(u);
o = setTimeout(b, 1500);
u = setTimeout(b, 3500);
};
const v = e => {
if (!e || e.nodeType !== 1) return false;
const t = e.matches(".dropdown-menu") ? e : e.querySelector(".dropdown-menu");
if (!t) return false;
if (t.hasAttribute("data-purpura-processed-psdrop")) return false;
const r = t.querySelector('.rbx-private-server-configure, a[href*="private-server/configure"]');
if (!r) return false;
t.setAttribute("aria-label", "purpuraPrivServerdropdown");
t.classList.add("private-server-configure-menu");
t.setAttribute("data-purpura-processed-psdrop", "true");
return true;
};
const A = () => {
const e = document.getElementById("game-instance-dropdown-menu");
if (e) v(e);
const t = [ ".popover-content", ".dropdown-menu", '[role="menu"]' ];
t.forEach(e => {
const t = document.querySelectorAll(e);
t.forEach(e => {
if (!e.closest("[data-purpura-processed-psdrop]")) {
v(e);
}
});
});
};
const S = () => {
if (i) {
i.disconnect();
i = null;
}
if (c) {
clearTimeout(c);
c = null;
}
};
const L = () => {
if (!document.body || i || !p()) return;
A();
i = new MutationObserver(e => {
e.forEach(e => {
e.addedNodes.forEach(e => {
if (e.nodeType !== 1) return;
if (e.matches(".dropdown-menu, .popover-content")) {
v(e);
} else {
const t = e.querySelectorAll(".dropdown-menu:not([data-purpura-processed-psdrop]), .popover-content:not([data-purpura-processed-psdrop])");
t.forEach(v);
}
});
});
});
i.observe(document.body, {
childList: true,
subtree: true
});
if (c) clearTimeout(c);
c = setTimeout(A, 800);
};
const T = () => {
const e = document.querySelectorAll("button.acct-settings-btn");
e.forEach(e => {
if (e.textContent.trim() === "Log Out of All Other Sessions" && !e.id) {
e.id = "purpura-logout-sessions-btn";
}
});
};
const E = () => {
if (a) {
a.disconnect();
a = null;
}
};
const C = () => {
if (!document.body || a || !f()) return;
T();
a = new MutationObserver(T);
a.observe(document.body, {
childList: true,
subtree: true
});
};
const x = () => {
m();
if (r) {
y();
} else {
w();
}
if (p()) {
L();
} else {
S();
}
if (f()) {
C();
} else {
E();
}
};
const _ = () => {
if (d) return;
d = true;
let e = window.location.href;
const t = () => {
const t = window.location.href;
if (t === e) return;
e = t;
x();
};
const r = history.pushState.bind(history);
history.pushState = function(...e) {
const n = r(...e);
setTimeout(t, 0);
return n;
};
const n = history.replaceState.bind(history);
history.replaceState = function(...e) {
const r = n(...e);
setTimeout(t, 0);
return r;
};
window.addEventListener("popstate", () => {
setTimeout(t, 0);
});
};
const z = e => {
if (typeof e === "boolean") return e;
if (e && typeof e === "object") return e.enabled === true;
return false;
};
const q = () => {
m();
_();
window.__PurpuraSettings.ready.then(function() {
r = z(window.__PurpuraSettings.get("rothemerActive"));
x();
});
chrome.storage.onChanged.addListener((e, t) => {
if (t !== "local") return;
if (!e.rothemerActive) return;
r = z(window.__PurpuraSettings.get("rothemerActive"));
x();
});
x();
};
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", q, {
once: true
});
} else {
q();
}
})();
