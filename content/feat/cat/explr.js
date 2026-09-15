/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.top !== window.self) return;
const e = "__purpura_explr_loaded";
if (window[e]) return;
window[e] = 1;
const t = "explr";
const n = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)(?:\/|$)/i;
const r = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)(?:\/|$)/i;
const o = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?marketplace\/asset\/(\d+)(?:\/|$)/i;
const i = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?library\/(\d+)(?:\/|$)/i;
const a = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?store\/asset\/(\d+)(?:\/|$)/i;
const s = new Set([ 8, 41, 42, 43, 44, 45, 46, 47, 57, 58, 64, 65, 66, 67, 68, 69, 70, 71, 72 ]);
const l = new Set([ 17, 79 ]);
const c = new Set([ "name", "classname", "meshid", "meshidstring", "textureid", "texture", "assetid", "shirttemplate", "pantstemplate", "graphic", "image", "content", "position", "orientation", "rotation", "size", "cframe", "material", "color", "color3", "transparency", "cancollide", "anchored", "reflectance", "shapename", "source", "linkedsource" ]);
const p = {
e: true,
h: location.href,
c: null,
o: null,
p: null,
b: null,
bt: null,
po: null,
a: null,
n: null,
d1: null,
da: null,
ms: null,
fi: null,
lv: null,
pv: null,
v: false,
w: false,
oc: null,
kc: null,
i: null,
t: "",
mm: [],
mi: 0,
ft: "",
sid: null,
mo: null,
ov: null
};
const d = '<span class="pxe-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.75" y="1.75" width="7.5" height="7.5" rx="1.2" stroke="currentColor" stroke-width="1.5"/><circle cx="11.25" cy="11.25" r="2.75" stroke="currentColor" stroke-width="1.5"/><path d="M13.2 13.2L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>';
const u = '<span class="pxe-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.2V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5.6 6.8L8 9.2L10.4 6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="10.4" width="10" height="2.9" rx="1" stroke="currentColor" stroke-width="1.5"/></svg></span>';
const f = '<span class="pxe-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.2 2.2V6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 5.6L5.2 6.8L6.4 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.8 2.2V6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M9.6 5.6L10.8 6.8L12 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="2.6" y="10.4" width="10.8" height="2.9" rx="1" stroke="currentColor" stroke-width="1.4"/></svg></span>';
function x() {
const e = location.pathname || "";
let t = e.match(n);
if (t) {
const e = Number.parseInt(t[1], 10);
if (Number.isSafeInteger(e)) return {
k: "asset",
i: e
};
}
t = e.match(r);
if (t) {
const e = Number.parseInt(t[1], 10);
if (Number.isSafeInteger(e)) return {
k: "bundle",
i: e
};
}
t = e.match(o);
if (t) {
const e = Number.parseInt(t[1], 10);
if (Number.isSafeInteger(e)) return {
k: "asset",
i: e
};
}
t = e.match(i);
if (t) {
const e = Number.parseInt(t[1], 10);
if (Number.isSafeInteger(e)) return {
k: "asset",
i: e
};
}
t = e.match(a);
if (t) {
const e = Number.parseInt(t[1], 10);
if (Number.isSafeInteger(e)) return {
k: "asset",
i: e
};
}
return null;
}
function m() {
return window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.get(t);
if (typeof e === "boolean") return e;
return true;
}).catch(function() {
return true;
});
}
function h() {
let e = document.getElementById("pxe-s");
if (!e) {
e = document.createElement("style");
e.id = "pxe-s";
document.documentElement.appendChild(e);
}
e.textContent = `\n:root{\n  --p0:#121215;--p1:#191a1f;--p2:#202227;--p3:#272930;\n  --pc:#d5d7dd;--pe:#f7f7f8;--pm:#bcbec8;\n  --pd:rgba(208,217,251,.12);--ps:rgba(208,217,251,.16);--pq:rgba(208,217,251,.08);\n  --ph:rgba(208,217,251,.08);--pp:rgba(208,217,251,.12);\n  --pa:#335fff;--pf:#f7f7f8;--pb:rgba(51,95,255,.4);--pl:#ebf1ff;\n  --px:#335fff;--pz:rgba(0,0,0,.5);\n}\n:root.light-theme,body.light-theme,body:not(.dark-theme){\n  --p0:#e8e8ec;--p1:#f0f0f3;--p2:#fafafc;--p3:#ffffff;\n  --pc:#2c2e35;--pe:#0d0e12;--pm:#6b6f7a;\n  --pd:rgba(0,0,0,.08);--ps:rgba(0,0,0,.12);--pq:rgba(0,0,0,.05);\n  --ph:rgba(0,0,0,.04);--pp:rgba(0,0,0,.08);\n  --pa:#335fff;--pf:#ffffff;--pb:rgba(51,95,255,.25);--pl:#eef3ff;\n  --px:#335fff;--pz:rgba(0,0,0,.15);\n}\n#pxe-bc{position:relative;display:inline-flex;align-items:center;flex:0 0 auto}\n#pxe-bc .pxe-bt{display:inline-flex;align-items:center;justify-content:center;gap:0;min-width:34px;width:34px;height:34px;padding:0;border:1px solid var(--ps);border-radius:8px;background:var(--p2);color:var(--pe);font-size:13px;font-weight:600;cursor:pointer;line-height:1;transition:background .15s,border-color .15s}\n#pxe-bc .pxe-bt:hover{background:var(--p3);border-color:var(--ps)}\n#pxe-bc .pxe-bt .pxe-ic{width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 14px;color:var(--pa)}\n#pxe-bc .pxe-bt .pxe-ic svg{width:14px;height:14px;display:block}\n#pxe-bc .pxe-bt .pxe-ic:empty::before{content:"◻";font-size:11px;line-height:1;color:var(--pa)}\n#pxe-bc .pxe-bt:focus{outline:2px solid var(--px);outline-offset:2px}\n#pxe-bc .pxe-po{display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647}\n#pxe-bc .pxe-po.v{display:block}\n#pxe-ov{position:fixed;inset:0;z-index:2147483645;background:rgba(8,10,16,.26);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .14s ease}\n#pxe-ov.v{opacity:1;pointer-events:auto}\nhtml.pxe-ns,body.pxe-ns{overflow:hidden !important}\n#pxe-bc.pxe-fb{position:fixed;right:16px;bottom:16px;z-index:2147483646}\n#pxe-bc.pxe-fb .pxe-po{left:50%;top:50%;right:auto;bottom:auto;transform:translate(-50%,-50%)}\n.pxe-actions[data-pxe-slot='1']{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:8px}\n.pxe-actions[data-pxe-slot='1']>#pxe-bc{margin-left:0;transform:translate(-80px,5px)}\n.shopping-cart-btn-container + .pxe-actions[data-pxe-slot='1']{padding-top:0;margin-left:8px}\n.item-details-name-row.pxe-name-host{display:flex;align-items:center;gap:8px;min-width:0}\n.item-details-name-row.pxe-name-host > h1{min-width:0;margin:0}\n.pxe-name-slot{display:inline-flex;align-items:center;overflow:visible;position:relative;flex:0 0 auto}\n.pxe-name-slot>#pxe-bc{margin-left:0;transform:none}\n#pxe-p{width:min(92vw,590px);max-height:min(78vh,680px);overflow:hidden;border-radius:12px;border:1px solid var(--pd);background:var(--p1);box-shadow:0 20px 60px var(--pz),0 2px 8px rgba(0,0,0,.38);color:var(--pc);font-family:"Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column}\n#pxe-p *{box-sizing:border-box}\n#pxe-p .pxe-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:var(--p0);border-bottom:1px solid var(--pd);flex:0 0 auto}\n#pxe-p .pxe-head-left{display:flex;align-items:center;gap:8px;min-width:0}\n#pxe-p .pxe-head-copy{display:grid;gap:0;min-width:0}\n#pxe-p .pxe-logo{width:22px;height:22px;border-radius:6px;background:var(--pa);display:flex;align-items:center;justify-content:center;flex:0 0 22px}\n#pxe-p .pxe-logo svg{width:12px;height:12px;display:block;color:var(--pf)}\n#pxe-p .pxe-title{font-size:12px;font-weight:700;letter-spacing:.1px;color:var(--pe);line-height:1.05}\n#pxe-p .pxe-sub{font-size:10px;color:var(--pm);margin-top:0;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#pxe-p .pxe-cl{border:1px solid var(--pd);border-radius:6px;width:24px;height:24px;cursor:pointer;color:var(--pm);background:transparent;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s,border-color .12s;flex:0 0 24px}\n#pxe-p .pxe-cl:hover{background:var(--p2);border-color:var(--ps);color:var(--pe)}\n#pxe-p .pxe-body{padding:10px 11px;overflow-y:auto;flex:1 1 auto}\n#pxe-p .pxe-body::-webkit-scrollbar{width:4px}\n#pxe-p .pxe-body::-webkit-scrollbar-thumb{background:var(--pd);border-radius:2px}\n#pxe-p .pxe-meta{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-bottom:8px;padding:7px 9px;background:var(--p0);border-radius:9px;border:1px solid var(--pd)}\n#pxe-p .pxe-mrow{display:flex;flex-direction:column;gap:1px;min-width:0}\n#pxe-p .pxe-mlabel{font-size:10px;font-weight:600;letter-spacing:.4px;line-height:1;text-transform:uppercase;color:var(--pm)}\n#pxe-p .pxe-mval{font-size:11px;font-weight:600;line-height:1.12;color:var(--pe);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#pxe-p .pxe-toolbar{display:flex;align-items:center;gap:6px;margin-bottom:8px}\n#pxe-p .pxe-sel{flex:1;min-width:0;height:30px;border:1px solid var(--pd);border-radius:8px;background:var(--p2);color:var(--pc);padding:0 28px 0 8px;line-height:1.2;font-size:11px;font-family:inherit;cursor:pointer;transition:border-color .12s}\n#pxe-p .pxe-sel:hover{border-color:var(--ps)}\n#pxe-p .pxe-sel:focus{outline:2px solid var(--px);outline-offset:1px;border-color:var(--pa)}\n#pxe-p .pxe-icon-btn{border:1px solid var(--pd);border-radius:8px;background:var(--p2);color:var(--pm);cursor:pointer;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 30px;transition:background .12s,border-color .12s,color .12s}\n#pxe-p .pxe-icon-btn:hover{background:var(--p3);border-color:var(--ps);color:var(--pe)}\n#pxe-p .pxe-icon-btn:disabled{opacity:.35;cursor:not-allowed}\n#pxe-p .pxe-icon-btn .pxe-ic{width:13px;height:13px;display:inline-flex;align-items:center;justify-content:center}\n#pxe-p .pxe-icon-btn .pxe-ic svg{width:13px;height:13px;display:block}\n#pxe-p .pxe-filter{width:100%;border:1px solid var(--pd);border-radius:8px;background:var(--p2);color:var(--pc);padding:6px 8px;font-size:11px;font-family:inherit;margin-bottom:8px;transition:border-color .12s}\n#pxe-p .pxe-filter::placeholder{color:var(--pm)}\n#pxe-p .pxe-filter:hover{border-color:var(--ps)}\n#pxe-p .pxe-filter:focus{outline:2px solid var(--px);outline-offset:1px;border-color:var(--pa)}\n#pxe-p .pxe-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;margin-bottom:0}\n#pxe-p .pxe-col-head{font-size:10px;font-weight:600;letter-spacing:.35px;line-height:1;text-transform:uppercase;color:var(--pm);padding:0 0 3px 2px}\n#pxe-p .pxe-tree{border:1px solid var(--pd);border-radius:9px;background:var(--p0);min-height:180px;max-height:260px;overflow:auto;padding:3px}\n#pxe-p .pxe-props{border:1px solid var(--pd);border-radius:9px;background:var(--p0);min-height:180px;max-height:260px;overflow:auto;padding:8px}\n#pxe-p .pxe-tree::-webkit-scrollbar,#pxe-p .pxe-props::-webkit-scrollbar{width:4px}\n#pxe-p .pxe-tree::-webkit-scrollbar-thumb,#pxe-p .pxe-props::-webkit-scrollbar-thumb{background:var(--pd);border-radius:2px}\n#pxe-p .it{display:flex;align-items:center;gap:4px;height:24px;border-radius:6px;padding:0 5px;cursor:pointer;user-select:none;transition:background .1s}\n#pxe-p .it:hover{background:var(--ph)}\n#pxe-p .it.se{background:var(--pb)}\n#pxe-p .tw{width:16px;height:16px;border:0;border-radius:4px;background:transparent;color:var(--pm);cursor:pointer;padding:0;line-height:1;flex:0 0 16px;font-size:10px}\n#pxe-p .tw.nd{cursor:default;color:var(--pq)}\n#pxe-p .ic{display:inline-flex;align-items:center;height:16px;font-size:9px;font-weight:600;line-height:1;color:var(--pm);background:var(--p2);border:1px solid var(--pd);border-radius:999px;padding:0 8px;max-width:min(44%,130px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto}\n#pxe-p .it.se .ic{background:rgba(51,95,255,.25);border-color:rgba(51,95,255,.35);color:var(--pl)}\n#pxe-p .nm{font-size:11px;color:var(--pc);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}\n#pxe-p .it.se .nm{color:var(--pl)}\n#pxe-p .pxe-prop-name{font-size:12px;font-weight:700;line-height:1.08;color:var(--pe);margin-bottom:0;word-break:break-word}\n#pxe-p .pxe-prop-class{font-size:10px;line-height:1.1;color:var(--pm);margin-bottom:5px;display:flex;align-items:center;gap:4px}\n#pxe-p .pxe-prop-class::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--pa);flex:0 0 6px}\n#pxe-p .pxe-divider{height:1px;background:var(--pq);margin:5px 0}\n#pxe-p .prr{display:grid;grid-template-columns:minmax(0,100px) minmax(0,1fr) auto;align-items:center;gap:5px;padding:2px 0;border-radius:5px}\n#pxe-p .prr span{font-size:10px;line-height:1.1;color:var(--pm);word-break:break-word}\n#pxe-p .prr strong{font-size:10px;line-height:1.1;color:var(--pc);font-weight:500;word-break:break-word;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#pxe-p .pxe-dl-inline{border:1px solid var(--pd);border-radius:5px;background:transparent;color:var(--pm);cursor:pointer;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 20px;transition:background .1s,color .1s,border-color .1s}\n#pxe-p .pxe-dl-inline:hover{background:var(--p2);border-color:var(--ps);color:var(--pe)}\n#pxe-p .pxe-dl-inline .pxe-ic{width:11px;height:11px;display:inline-flex}\n#pxe-p .pxe-dl-inline .pxe-ic svg{width:11px;height:11px;display:block}\n#pxe-p .em{font-size:10px;color:var(--pm);font-style:italic;padding:6px 4px}\n@media (max-width:860px){\n  #pxe-p .pxe-cols{grid-template-columns:minmax(0,1fr)}\n  #pxe-p .pxe-tree,#pxe-p .pxe-props{max-height:200px}\n}\n`;
}
function b() {
if (p.p && document.body.contains(p.p)) return;
h();
if (!p.po || !document.body.contains(p.po)) return;
const e = document.createElement("section");
e.id = "pxe-p";
e.innerHTML = [ '<header class="pxe-head">', '  <div class="pxe-head-left">', '    <div class="pxe-logo"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.75" y="1.75" width="7.5" height="7.5" rx="1.2" stroke="currentColor" stroke-width="1.5"/><circle cx="11.25" cy="11.25" r="2.75" stroke="currentColor" stroke-width="1.5"/><path d="M13.2 13.2L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>', '    <div class="pxe-head-copy">', '      <div class="pxe-title">Explorer</div>', '      <div class="pxe-sub">View item assets.</div>', "    </div>", "  </div>", '  <button type="button" class="pxe-cl" title="Close" aria-label="Close Explorer">', '    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', "  </button>", "</header>", '<div class="pxe-body">', '  <div class="pxe-meta">', '    <div class="pxe-mrow"><div class="pxe-mlabel">Asset</div><div class="pxe-mval" id="pxe-a">—</div></div>', '    <div class="pxe-mrow"><div class="pxe-mlabel">Name</div><div class="pxe-mval" id="pxe-n">—</div></div>', "  </div>", '  <div class="pxe-toolbar">', '    <select class="pxe-sel" id="pxe-ms"></select>', '    <button type="button" class="pxe-icon-btn" id="pxe-d1" disabled aria-label="Download selected payload" title="Download selected payload"></button>', '    <button type="button" class="pxe-icon-btn" id="pxe-da" disabled aria-label="Download all payloads" title="Download all payloads"></button>', "  </div>", '  <input class="pxe-filter" id="pxe-fi" type="text" placeholder="Filter nodes…">', '  <div class="pxe-cols">', "    <div>", '      <div class="pxe-col-head">Asset Tree</div>', '      <div class="pxe-tree" id="pxe-lv"></div>', "    </div>", "    <div>", '      <div class="pxe-col-head">Properties</div>', '      <div class="pxe-props" id="pxe-pv"></div>', "    </div>", "  </div>", "</div>" ].join("");
p.po.replaceChildren(e);
p.p = e;
p.b = e.querySelector(".pxe-body");
p.a = e.querySelector("#pxe-a");
p.n = e.querySelector("#pxe-n");
p.d1 = e.querySelector("#pxe-d1");
p.da = e.querySelector("#pxe-da");
p.ms = e.querySelector("#pxe-ms");
p.fi = e.querySelector("#pxe-fi");
p.lv = e.querySelector("#pxe-lv");
p.pv = e.querySelector("#pxe-pv");
p.d1.innerHTML = u;
p.da.innerHTML = f;
e.querySelector(".pxe-cl").addEventListener("click", () => {
z();
});
p.d1.addEventListener("click", () => {
fe(ae()).catch(() => {});
});
p.da.addEventListener("click", () => {
xe().catch(() => {});
});
p.ms.addEventListener("change", () => {
const e = Number.parseInt(p.ms.value, 10);
if (!Number.isSafeInteger(e)) return;
if (e < 0 || e >= p.mm.length) return;
p.mi = e;
const t = ae();
p.sid = t && t.tr ? t.tr.t.id : null;
le();
pe();
v(true);
});
p.fi.addEventListener("input", () => {
p.ft = p.fi.value || "";
le();
});
p.lv.addEventListener("click", e => {
const t = e.target.closest(".it");
if (!t) return;
const n = Number.parseInt(t.dataset.id || "", 10);
if (!Number.isSafeInteger(n)) return;
const r = ae();
if (!r || !r.tr) return;
const o = ie(r.tr.t, n);
if (!o) return;
if (e.target.closest(".tw") && o.ch.length) {
r.ex[n] = r.ex[n] === false ? true : false;
le();
return;
}
p.sid = n;
le();
pe();
});
se();
le();
pe();
v(true);
}
function g(e, t) {
void e;
void t;
}
function v(e) {
const t = !e || p.w || p.mm.length === 0;
if (p.d1) p.d1.disabled = t;
if (p.da) p.da.disabled = t;
}
function w(e) {
if (!e || !(e instanceof Element)) return false;
if (!document.documentElement.contains(e)) return false;
const t = getComputedStyle(e);
if (!t || t.display === "none" || t.visibility === "hidden") return false;
const n = e.getBoundingClientRect();
return n.width > 0 && n.height > 0;
}
function y(e) {
if (!w(e)) return null;
let t = e.querySelector(":scope > .pxe-actions[data-pxe-slot='1']") || e.querySelector(":scope > .pxe-actions");
if (!t) {
t = document.createElement("div");
t.className = "pxe-actions";
t.dataset.pxeSlot = "1";
e.appendChild(t);
} else {
t.classList.add("pxe-actions");
if (!t.dataset.pxeSlot) t.dataset.pxeSlot = "1";
}
return t;
}
function k() {
const e = document.querySelector([ ".item-details-name-row", "[data-testid='item-details-name-row']", "[data-testid='item-name-row']" ].join(","));
if (!w(e)) return null;
e.classList.add("pxe-name-host");
const t = e.querySelector(":scope > h1") || e.querySelector("h1");
let n = e.querySelector(":scope > .pxe-name-slot");
if (!n) {
n = document.createElement("span");
n.className = "pxe-name-slot";
if (t && t.parentElement === e) {
t.insertAdjacentElement("afterend", n);
} else {
e.appendChild(n);
}
}
if (n.tagName !== "SPAN") {
const e = document.createElement("span");
e.className = "pxe-name-slot";
while (n.firstChild) e.appendChild(n.firstChild);
n.replaceWith(e);
n = e;
}
if (t && t.parentElement === e && n.previousElementSibling !== t) {
t.insertAdjacentElement("afterend", n);
} else if (n.parentElement !== e) {
e.appendChild(n);
}
return n;
}
function C() {
const e = k();
if (e) return e;
const t = document.querySelector([ "button[data-testid*='purchase']", "button[data-testid*='buy']", "button[data-testid*='item']", "a[data-testid*='purchase']", ".PurchaseButton", ".purchase-button", ".btn-growth-md", ".btn-primary-md" ].join(","));
if (t) {
const e = t.closest([ "[data-testid='item-details-action-button-group']", "[data-testid*='action-button-group']", "[data-testid*='item-details-action']", ".item-details-action-buttons", ".action-button-group", ".item-buttons", ".item-buttons-container" ].join(","));
if (w(e)) return e;
const n = t.closest([ "[data-testid='item-details-info-header']", ".item-details-info-header", "#item-details .item-details-info-header" ].join(","));
const r = y(n);
if (r) return r;
if (w(t.parentElement)) return t.parentElement;
}
const n = document.querySelector([ ".pxe-actions[data-pxe-slot='1']", ".pxe-actions", "[data-testid='item-details-action-button-group']", "[data-testid*='action-button-group']", "[data-testid*='item-details-action']", ".item-details-action-buttons", ".action-button-group", ".item-buttons", ".item-buttons-container" ].join(","));
if (w(n)) return n;
const r = document.querySelector([ "[data-testid='item-details-info-header']", ".item-details-info-header", "#item-details .item-details-info-header" ].join(","));
return y(r);
}
function E() {
const e = x();
if (!e) return;
const t = C();
if (p.o && document.body.contains(p.o) && p.bt && p.po) {
if (!p.bt.querySelector(".pxe-ic svg")) {
p.bt.innerHTML = d;
}
p.bt.classList.add("pxe-bt");
if (t) {
if (p.o.classList.contains("pxe-fb")) {
p.o.classList.remove("pxe-fb");
}
if (p.o.parentElement !== t) {
t.appendChild(p.o);
}
} else {
if (!p.o.classList.contains("pxe-fb")) {
p.o.classList.add("pxe-fb");
}
if (p.o.parentElement !== document.body) {
document.body.appendChild(p.o);
}
}
return;
}
const n = !t;
h();
const r = document.createElement("div");
r.id = "pxe-bc";
r.className = "pxe-bc-wrap";
if (n) r.classList.add("pxe-fb");
const o = document.createElement("a");
o.href = "#";
o.role = "button";
o.className = "pxe-bt";
o.setAttribute("aria-label", "Open Explorer");
o.setAttribute("title", "Open Explorer");
o.innerHTML = d;
const i = document.createElement("div");
i.className = "pxe-po";
r.appendChild(o);
r.appendChild(i);
if (t) {
t.appendChild(r);
} else {
document.body.appendChild(r);
}
p.o = r;
p.bt = o;
p.po = i;
o.addEventListener("click", e => {
e.preventDefault();
e.stopPropagation();
if (p.v) {
z();
} else {
N().catch(() => {});
}
});
if (!p.oc) {
p.oc = e => {
if (!p.v) return;
if (!p.o) return;
if (p.o.contains(e.target)) return;
z();
};
document.addEventListener("mousedown", p.oc, true);
}
if (!p.kc) {
p.kc = e => {
if (!p.v) return;
if (e.key === "Escape") {
z();
}
};
document.addEventListener("keydown", p.kc, true);
}
}
function S() {
if (!p.po || !p.v) return;
const e = p.po;
e.style.left = "50%";
e.style.top = "50%";
e.style.right = "auto";
e.style.bottom = "auto";
e.style.transform = "translate(-50%,-50%)";
const t = 8;
const n = e.getBoundingClientRect();
let r = 0;
let o = 0;
if (n.left < t) r = t - n.left;
if (n.right > window.innerWidth - t) r = window.innerWidth - t - n.right;
if (n.top < t) o = t - n.top;
if (n.bottom > window.innerHeight - t) o = window.innerHeight - t - n.bottom;
if (r || o) {
e.style.transform = `translate(calc(-50% + ${r}px), calc(-50% + ${o}px))`;
}
}
function L() {
if (p.ov && document.body.contains(p.ov)) return p.ov;
let e = document.getElementById("pxe-ov");
if (!e) {
e = document.createElement("div");
e.id = "pxe-ov";
document.body.appendChild(e);
}
p.ov = e;
return e;
}
function $(e) {
const t = document.documentElement;
const n = document.body;
if (!t || !n) return;
if (e) {
const e = L();
e.classList.add("v");
t.classList.add("pxe-ns");
n.classList.add("pxe-ns");
return;
}
if (p.ov) {
p.ov.classList.remove("v");
}
t.classList.remove("pxe-ns");
n.classList.remove("pxe-ns");
}
async function N() {
E();
if (!p.po || !p.bt) return;
b();
$(true);
p.po.classList.add("v");
p.v = true;
p.bt.setAttribute("aria-expanded", "true");
S();
const e = x();
if (!e) return;
const t = `${e.k}:${e.i}`;
const n = p.i ? `${p.i.k}:${p.i.i}` : "";
if (!p.mm.length || t !== n) {
await me(false);
}
}
function z() {
$(false);
if (!p.po || !p.bt) return;
p.po.classList.remove("v");
p.v = false;
p.bt.setAttribute("aria-expanded", "false");
}
function I() {
$(false);
if (p.ov && document.body.contains(p.ov)) {
p.ov.remove();
}
if (p.o && document.body.contains(p.o)) {
p.o.remove();
}
p.ov = null;
p.o = null;
p.bt = null;
p.po = null;
p.p = null;
p.b = null;
p.a = null;
p.n = null;
p.d1 = null;
p.da = null;
p.ms = null;
p.fi = null;
p.lv = null;
p.pv = null;
p.v = false;
}
async function A(e) {
const t = `https://economy.roblox.com/v2/assets/${e}/details`;
const n = await fetch(t, {
credentials: "include"
});
if (!n.ok) throw new Error(`Metadata failed (${n.status})`);
const r = await n.json();
const o = r && typeof r.Name === "string" && r.Name.trim() || `Asset ${e}`;
const i = Number(r.AssetTypeId || r.AssetType || 0);
return {
n: o,
t: Number.isFinite(i) ? i : 0
};
}
async function U(e) {
const t = `https://catalog.roblox.com/v1/bundles/${e}/details`;
const n = await fetch(t, {
credentials: "include"
});
if (!n.ok) throw new Error(`Bundle details failed (${n.status})`);
const r = await n.json();
const o = r && typeof r.name === "string" && r.name.trim() || `Bundle ${e}`;
const i = Array.isArray(r.items) ? r.items : [];
const a = [];
const s = new Set;
for (const e of i) {
const t = String(e?.type || "").toLowerCase();
if (t !== "asset") continue;
const n = Number.parseInt(String(e?.id || ""), 10);
if (!Number.isSafeInteger(n)) continue;
if (s.has(n)) continue;
s.add(n);
const r = typeof e?.name === "string" && e.name.trim() ? e.name.trim() : `Asset ${n}`;
a.push({
i: n,
n: r
});
}
if (!a.length) {
throw new Error("Bundle has no explorable assets");
}
return {
n: o,
a: a
};
}
function D(e) {
const t = [ {
f: null,
l: "Default"
} ];
if (s.has(e)) {
t[0].l = "SpecialMesh";
t.push({
f: "avatar_meshpart_accessory",
l: "MeshPart"
});
}
if (l.has(e)) {
t[0].l = "SpecialMesh";
t.push({
f: "avatar_meshpart_head",
l: "MeshPart"
});
}
return t;
}
async function M(e, t) {
const n = {};
if (t) n["Roblox-AssetFormat"] = t;
const r = `https://assetdelivery.roblox.com/v2/asset/?id=${e}`;
return j(r, n);
}
function j(e, t) {
return new Promise((n, r) => {
var o = false;
var i = setTimeout(function() {
if (!o) {
o = true;
r(new Error("bg fetch timeout"));
}
}, 8e3);
try {
chrome.runtime.sendMessage({
type: "PURPURA_FETCH_RESOURCE_REQUEST",
url: e,
method: "GET",
accept: "application/json",
headers: t
}, e => {
if (o) return;
o = true;
clearTimeout(i);
const t = chrome.runtime.lastError;
if (t || !e || !e.ok) {
r(new Error("bg fetch failed"));
return;
}
let a;
try {
a = e.text ? JSON.parse(e.text) : null;
} catch (e) {
r(new Error("invalid json"));
return;
}
const s = a && a.locations && a.locations[0] && a.locations[0].location;
if (!s) {
r(new Error("no location"));
return;
}
n({
u: s,
a: a.assetTypeId ?? null
});
});
} catch (e) {
if (!o) {
o = true;
clearTimeout(i);
r(new Error("network blocked"));
}
}
});
}
async function q(e, t) {
try {
return await M(e, t);
} catch (n) {
const r = [ `fmt: ${n.message || String(n)}` ];
if (t) {
try {
return await M(e, null);
} catch (e) {
r.push(`nofmt: ${e.message || String(e)}`);
}
}
throw new Error(r.join(" | "));
}
}
function T(e) {
const t = atob(String(e || ""));
const n = new Uint8Array(t.length);
for (let e = 0; e < t.length; e += 1) {
n[e] = t.charCodeAt(e);
}
return n.buffer;
}
function P(e) {
return new Promise((t, n) => {
try {
chrome.runtime.sendMessage({
type: "PURPURA_FETCH_RESOURCE_REQUEST",
url: e,
method: "GET",
accept: "application/octet-stream, */*;q=0.8",
responseType: "arraybuffer"
}, e => {
const r = chrome.runtime.lastError;
if (r) {
n(new Error(r.message || "Download failed"));
return;
}
if (!e || !e.ok) {
n(new Error(`Download failed (${e && Number.isFinite(e.status) ? e.status : 0})`));
return;
}
if (typeof e.base64 !== "string" || !e.base64.length) {
n(new Error("Download failed (empty body)"));
return;
}
try {
t(T(e.base64));
} catch (e) {
n(new Error("Download failed (invalid body)"));
}
});
} catch (e) {
n(new Error(e?.message || "Download failed"));
}
});
}
async function B(e) {
let t = null;
const n = /:\/\/assetdelivery\.roblox\.com\//i.test(String(e || ""));
if (n) {
try {
return await P(e);
} catch (e) {
t = e;
}
}
try {
const t = await fetch(e, {
credentials: "omit",
mode: "cors"
});
if (!t.ok) throw new Error(`Download failed (${t.status})`);
return await t.arrayBuffer();
} catch (e) {
t = e;
}
if (!n) {
try {
return await P(e);
} catch (e) {
t = e;
}
}
throw new Error(t?.message || "Download failed");
}
function O(e, t) {
const n = new Uint8Array(e);
if (n.length >= 8) {
if (n[0] === 137 && n[1] === 80 && n[2] === 78 && n[3] === 71) return "png";
if (n[0] === 255 && n[1] === 216) return "jpg";
if (n[0] === 71 && n[1] === 73 && n[2] === 70) return "gif";
if (n[0] === 82 && n[1] === 73 && n[2] === 70 && n[3] === 70) return "wav";
if (n[0] === 79 && n[1] === 103 && n[2] === 103 && n[3] === 83) return "ogg";
if (n[0] === 80 && n[1] === 75) return "zip";
if (n[0] === 60 && n[1] === 114 && n[2] === 111 && n[3] === 98 && n[4] === 108 && n[5] === 111 && n[6] === 120 && n[7] === 33) return "rbxm";
}
const r = V(e, 512).trim().toLowerCase();
if (r.startsWith("<?xml") || r.includes("<roblox")) return "rbxmx";
return t || "bin";
}
function R(e) {
if (e === "png") return "image/png";
if (e === "jpg") return "image/jpeg";
if (e === "gif") return "image/gif";
if (e === "webp") return "image/webp";
if (e === "ogg") return "audio/ogg";
if (e === "wav") return "audio/wav";
if (e === "mp3") return "audio/mpeg";
return "application/octet-stream";
}
function _(e, t) {
const n = new Uint8Array(e, 0, Math.min(e.byteLength, t));
try {
return new TextDecoder("utf-8", {
fatal: false
}).decode(n);
} catch (e) {
return "";
}
}
function F(e, t) {
const n = new Uint8Array(e, 0, Math.min(e.byteLength, t));
try {
return new TextDecoder("latin1", {
fatal: false
}).decode(n);
} catch (e) {
let t = "";
const r = 8192;
for (let e = 0; e < n.length; e += r) {
const o = n.subarray(e, e + r);
let i = "";
for (let e = 0; e < o.length; e++) i += String.fromCharCode(o[e]);
t += i;
}
return t;
}
}
function H(e) {
const t = document.createElement("textarea");
t.innerHTML = e;
return t.value;
}
function V(e, t) {
return _(e, t);
}
function W(e) {
if (!e || typeof e !== "string") return null;
let t = H(e.trim()).replace(/[\u0000-\u001F]+/g, "").replace(/[)\],;]+$/, "");
if (!t) return null;
if (/^rbxassetid:\/\/(\d+)$/i.test(t)) {
const e = Number.parseInt(t.replace(/^rbxassetid:\/\//i, ""), 10);
return {
u: `https://assetdelivery.roblox.com/v1/asset/?id=${e}`,
i: e
};
}
if (/^rbxhttp:\/\//i.test(t)) {
const e = t.replace(/^rbxhttp:\/\//i, "");
t = `https://www.roblox.com/${e}`;
}
if (/^\d+$/.test(t)) {
const e = Number.parseInt(t, 10);
return {
u: `https://assetdelivery.roblox.com/v1/asset/?id=${e}`,
i: e
};
}
if (!/^https?:\/\//i.test(t)) return null;
let n;
try {
n = new URL(t);
} catch (e) {
return null;
}
const r = n.hostname.toLowerCase();
const o = n.pathname.toLowerCase();
if (r.endsWith("w3.org")) return null;
if (r.endsWith("roblox.com") && o.endsWith("/roblox.xsd")) return null;
let i = null;
const a = n.searchParams.get("id");
if (a && /^\d+$/.test(a)) {
i = Number.parseInt(a, 10);
} else {
const e = o.match(/\/library\/(\d+)/i);
if (e) i = Number.parseInt(e[1], 10);
}
if (r.endsWith("roblox.com") && o === "/asset/" && Number.isSafeInteger(i)) {
return {
u: `https://assetdelivery.roblox.com/v1/asset/?id=${i}`,
i: i
};
}
n.hash = "";
return {
u: n.toString(),
i: Number.isSafeInteger(i) ? i : null
};
}
function G(e) {
const t = new Map;
const n = /(rbxassetid:\/\/\d+|rbxhttp:\/\/[^\s"'<>\x00]+|https?:\/\/[^\s"'<>\x00]+)/gi;
const r = _(e, 4e6);
if (r) {
for (const e of r.matchAll(n)) {
const n = W(e[0]);
if (!n) continue;
if (!t.has(n.u)) t.set(n.u, n);
}
}
if (!t.size) {
const r = F(e, 4e6);
if (r) {
for (const e of r.matchAll(n)) {
const n = W(e[0]);
if (!n) continue;
if (!t.has(n.u)) t.set(n.u, n);
}
}
}
return Array.from(t.values());
}
function Q(e, t, n) {
const r = R(n);
const o = new Blob([ e ], {
type: r
});
const i = URL.createObjectURL(o);
const a = document.createElement("a");
a.href = i;
a.download = t;
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(i);
}
function J(e) {
const t = String(e || "file").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
return t || "file";
}
function K(e) {
if (!Number.isFinite(e) || e <= 0) return "0 B";
const t = [ "B", "KB", "MB", "GB" ];
let n = e;
let r = 0;
while (n >= 1024 && r < t.length - 1) {
n /= 1024;
r += 1;
}
const o = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
return `${o} ${t[r]}`;
}
function Z(e) {
const t = _(e, 8e6);
if (!t) return null;
const n = t.slice(0, 600).toLowerCase();
if (!n.includes("<roblox") && !n.includes("<?xml")) return null;
let r;
try {
r = (new DOMParser).parseFromString(t, "application/xml");
} catch (e) {
return null;
}
if (!r || r.querySelector("parsererror")) return null;
const o = r.querySelector("roblox > Item") || r.querySelector("Item");
if (!o) return null;
let i = 1;
const a = e => {
const t = e.getAttribute("class") || "Item";
const n = e.querySelector(":scope > Properties");
const r = [];
let o = "";
if (n) {
for (const e of n.children) {
const t = e.getAttribute("name") || e.nodeName;
let n = "";
if (e.nodeName === "Content") {
const t = e.querySelector("url, uri");
n = ((t ? t.textContent : e.textContent) || "").trim();
} else {
n = (e.textContent || "").trim();
}
n = n.replace(/\s+/g, " ");
if (!n) continue;
if (t === "Name") {
o = n;
continue;
}
if (n.length > 240) n = `${n.slice(0, 237)}...`;
r.push({
k: t,
v: n
});
}
}
const s = [];
for (const t of e.querySelectorAll(":scope > Item")) {
s.push(a(t));
}
return {
id: i++,
c: t,
n: o || t,
p: r,
ch: s
};
};
const s = a(o);
const l = {};
const c = e => {
l[e.id] = true;
for (const t of e.ch) c(t);
};
c(s);
return {
t: s,
e: l
};
}
function X(e, t) {
if (t <= 0 || t > 64 * 1024 * 1024) return null;
const n = new Uint8Array(t);
let r = 0;
let o = 0;
while (o < t) {
const i = e[r++];
let a = i >> 4 & 15;
if (a === 15) {
let t;
do {
t = e[r++];
a += t;
} while (t === 255);
}
for (let t = 0; t < a; t++) n[o++] = e[r++];
if (o >= t) break;
const s = e[r] | e[r + 1] << 8;
r += 2;
let l = (i & 15) + 4;
if ((i & 15) === 15) {
let t;
do {
t = e[r++];
l += t;
} while (t === 255);
}
const c = o - s;
for (let e = 0; e < l; e++) n[o + e] = n[c + e];
o += l;
}
return n;
}
function Y(e, t, n, r) {
const o = n * r;
const i = new Uint8Array(o);
for (let o = 0; o < n; o++) {
for (let a = 0; a < r; a++) {
i[o * r + a] = e[t + a * n + o];
}
}
return i;
}
function ee(e) {
return e >>> 1 ^ -(e & 1);
}
function te(e, t) {
if (t + 4 > e.byteLength) return {
v: "",
n: 4
};
const n = e.getUint32(t, true);
if (n <= 0 || n > 10 * 1024 * 1024) return {
v: "",
n: 4
};
if (t + 4 + n > e.byteLength) return {
v: "",
n: 4
};
const r = new Uint8Array(e.buffer, e.byteOffset + t + 4, n);
try {
return {
v: new TextDecoder("utf-8", {
fatal: false
}).decode(r),
n: 4 + n
};
} catch (e) {
return {
v: "",
n: 4 + n
};
}
}
function ne(e) {
const t = new Uint8Array(e);
if (t.length < 32) return null;
const n = [ 60, 114, 111, 98, 108, 111, 120, 33, 137, 255, 13, 10, 26, 10 ];
for (let e = 0; e < n.length; e++) {
if (t[e] !== n[e]) return null;
}
const r = new DataView(e, 0, 32);
const o = r.getInt32(16, true);
const i = r.getInt32(20, true);
if (o < 0 || i < 0) return null;
if (o > 5e4 || i > 5e5) return null;
const a = {};
const s = new Array(i);
const l = new Array(i);
const p = new Array(i);
const d = new Array(i);
const u = new Array(i);
const f = new Int32Array(i).fill(-1);
const x = [];
for (let e = 0; e < i; e++) {
p[e] = [];
d[e] = "";
u[e] = [];
}
let m = 32;
while (m + 16 <= t.length) {
const n = String.fromCharCode(t[m], t[m + 1], t[m + 2], t[m + 3]);
const r = new DataView(e, m + 4, 12);
const o = r.getUint32(0, true);
const c = r.getUint32(4, true);
m += 16;
if (n === "END\0" || n === "END") break;
let h;
if (o === 0) {
h = t.slice(m, m + c);
m += c;
} else {
const e = t.subarray(m, m + o);
try {
if (e[0] === 40 && e[1] === 181 && e[2] === 47 && e[3] === 253) {
m += o;
continue;
}
h = X(e, c);
if (!h) {
m += o;
continue;
}
} catch (e) {
m += o;
continue;
}
m += o;
}
const b = new DataView(h.buffer, h.byteOffset, h.byteLength);
if (n === "INST") {
let e = 0;
const t = b.getUint32(e, true);
e += 4;
const n = te(b, e);
e += n.n;
const r = n.v;
const o = h[e];
e += 1;
const c = b.getUint32(e, true);
e += 4;
const p = Y(h, e, c, 4);
const u = new DataView(p.buffer, p.byteOffset, p.byteLength);
const f = [];
let x = 0;
for (let e = 0; e < c; e++) {
const t = u.getUint32(e * 4, false);
x += ee(t);
f.push(x);
}
a[t] = {
name: r,
referents: f,
count: c
};
for (let e = 0; e < c; e++) {
const t = f[e];
if (t >= 0 && t < i) {
s[t] = t;
l[t] = r;
d[t] = r;
}
}
}
if (n === "PROP") {
let e = 0;
const t = b.getUint32(e, true);
e += 4;
const n = te(b, e);
e += n.n;
const r = n.v;
const o = h[e];
e += 1;
const s = a[t];
if (!s) continue;
if (o === 1) {
for (let t = 0; t < s.count; t++) {
const n = te(b, e);
e += n.n;
const o = s.referents[t];
if (o >= 0 && o < i) {
if (r === "Name") {
d[o] = n.v;
}
if (n.v && n.v.length > 0 && n.v.length <= 240) {
p[o].push({
k: r,
v: n.v
});
}
}
}
} else if (o === 2) {
for (let t = 0; t < s.count; t++) {
const n = h[e];
e += 1;
const o = s.referents[t];
if (o >= 0 && o < i) {
p[o].push({
k: r,
v: n ? "true" : "false"
});
}
}
} else if (o === 3) {
const t = Y(h, e, s.count, 4);
const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
for (let e = 0; e < s.count; e++) {
const t = n.getUint32(e * 4, false);
const o = ee(t);
const a = s.referents[e];
if (a >= 0 && a < i) {
p[a].push({
k: r,
v: String(o)
});
}
}
e += s.count * 4;
} else if (o === 5) {
for (let t = 0; t < s.count; t++) {
const n = b.getFloat64(e, true);
e += 8;
const o = s.referents[t];
if (o >= 0 && o < i) {
p[o].push({
k: r,
v: String(n)
});
}
}
} else if (o === 6 || o === 18 || o === 19 || o === 20) {
for (let t = 0; t < s.count; t++) {
const n = te(b, e);
e += n.n;
const o = s.referents[t];
if (o >= 0 && o < i) {
if (n.v && n.v.length > 0 && n.v.length <= 240) {
p[o].push({
k: r,
v: n.v
});
}
}
}
}
}
if (n === "PRNT") {
let e = 0;
const t = h[e];
e += 1;
if (t !== 0) continue;
const n = b.getUint32(e, true);
e += 4;
const r = Y(h, e, n, 4);
e += n * 4;
const o = Y(h, e, n, 4);
const a = new DataView(r.buffer, r.byteOffset, r.byteLength);
const s = new DataView(o.buffer, o.byteOffset, o.byteLength);
let l = 0;
let c = 0;
for (let e = 0; e < n; e++) {
l += ee(a.getUint32(e * 4, false));
c += ee(s.getUint32(e * 4, false));
const t = l;
const n = c;
if (t >= 0 && t < i) {
if (n < 0 || n >= i) {
x.push(t);
} else {
f[t] = n;
u[n].push(t);
}
}
}
}
}
let h = 1;
const b = e => {
const t = h++;
const n = l[e] || "Unknown";
const r = d[e] || n;
const o = (p[e] || []).filter(e => c.has(String(e.k || "").toLowerCase()));
const i = [];
for (const t of u[e]) {
i.push(b(t));
}
return {
id: t,
c: n,
n: r,
p: o,
ch: i
};
};
if (x.length === 0) return null;
let g;
if (x.length === 1) {
g = b(x[0]);
} else {
const e = x.map(e => b(e));
g = {
id: h++,
c: "DataModel",
n: "DataModel",
p: [],
ch: e
};
}
const v = {};
const w = e => {
v[e.id] = true;
for (const t of e.ch) w(t);
};
w(g);
return {
t: g,
e: v
};
}
function re(e, t) {
if (!t) return true;
const n = t.toLowerCase();
if (`${e.n} ${e.c}`.toLowerCase().includes(n)) return true;
for (const t of e.p) {
if (`${t.k} ${t.v}`.toLowerCase().includes(n)) return true;
}
for (const t of e.ch) {
if (re(t, n)) return true;
}
return false;
}
function oe(e, t) {
if (!e) return null;
if (e.id === t) return e;
for (const n of e.ch) {
const e = oe(n, t);
if (e) return e;
}
return null;
}
const ie = oe;
function ae() {
if (!p.mm.length) return null;
if (p.mi < 0 || p.mi >= p.mm.length) return null;
return p.mm[p.mi];
}
function se() {
if (!p.ms) return;
p.ms.replaceChildren();
if (!p.mm.length) {
const e = document.createElement("option");
e.value = "";
e.textContent = "No payload";
p.ms.appendChild(e);
p.ms.disabled = true;
return;
}
p.ms.disabled = false;
p.mm.forEach((e, t) => {
const n = document.createElement("option");
n.value = String(t);
const r = String(e.x || "bin").toUpperCase();
const o = e.an ? `${e.an} - ${e.l}` : e.l;
n.textContent = `${o} (${r}, ${K(e.b.byteLength)})`;
if (t === p.mi) n.selected = true;
p.ms.appendChild(n);
});
}
function le() {
if (!p.lv) return;
p.lv.replaceChildren();
const e = ae();
if (!e) {
const e = document.createElement("div");
e.className = "em";
e.textContent = "Open Explorer to load payloads.";
p.lv.appendChild(e);
return;
}
if (!e.tr) {
const e = document.createElement("div");
e.className = "em";
e.textContent = "Tree view unavailable for this payload format.";
p.lv.appendChild(e);
return;
}
if (!Number.isSafeInteger(p.sid)) {
p.sid = e.tr.t.id;
}
const t = document.createDocumentFragment();
let n = 0;
const r = (p.ft || "").trim().toLowerCase();
const o = (i, a) => {
if (!re(i, r)) return;
n += 1;
const s = document.createElement("div");
s.className = `it${p.sid === i.id ? " se" : ""}`;
s.dataset.id = String(i.id);
s.style.paddingLeft = `${a * 14}px`;
const l = document.createElement("button");
l.type = "button";
l.className = "tw";
if (i.ch.length) {
l.textContent = e.ex[i.id] === false ? "▸" : "▾";
} else {
l.textContent = "·";
l.disabled = true;
l.classList.add("nd");
}
const c = document.createElement("span");
c.className = "ic";
c.textContent = i.c;
const d = document.createElement("span");
d.className = "nm";
d.textContent = i.n;
s.appendChild(l);
s.appendChild(c);
s.appendChild(d);
t.appendChild(s);
if (i.ch.length && e.ex[i.id] !== false) {
for (const e of i.ch) o(e, a + 1);
}
};
o(e.tr.t, 0);
if (!n) {
const e = document.createElement("div");
e.className = "em";
e.textContent = "No nodes matched the filter.";
p.lv.appendChild(e);
} else {
p.lv.appendChild(t);
}
}
function ce(e) {
return c.has(String(e || "").toLowerCase());
}
function pe() {
if (!p.pv) return;
p.pv.replaceChildren();
const e = ae();
if (!e) {
const e = document.createElement("div");
e.className = "em";
e.textContent = "Select a node to inspect.";
p.pv.appendChild(e);
return;
}
if (!e.tr) {
const e = document.createElement("div");
e.className = "em";
e.textContent = "Properties unavailable for this format.";
p.pv.appendChild(e);
return;
}
const t = oe(e.tr.t, Number.isSafeInteger(p.sid) ? p.sid : e.tr.t.id) || e.tr.t;
const n = document.createElement("div");
n.className = "pxe-prop-name";
n.textContent = t.n;
p.pv.appendChild(n);
const r = document.createElement("div");
r.className = "pxe-prop-class";
r.textContent = t.c;
p.pv.appendChild(r);
const o = document.createElement("div");
o.className = "pxe-divider";
p.pv.appendChild(o);
const i = (e, n, r) => {
const o = document.createElement("div");
o.className = "prr";
const i = document.createElement("span");
i.textContent = e;
const a = document.createElement("strong");
a.textContent = n;
o.appendChild(i);
o.appendChild(a);
if (r && typeof r.u === "string") {
const n = document.createElement("button");
n.type = "button";
n.className = "pxe-dl-inline";
n.innerHTML = u;
n.title = "Download";
n.setAttribute("aria-label", "Download linked asset");
n.addEventListener("click", n => {
n.preventDefault();
n.stopPropagation();
ue(r, `${t.n}-${e}`).catch(() => {});
});
o.appendChild(n);
}
p.pv.appendChild(o);
};
i("Payload:", `${e.l} (.${e.x})`);
i("Size:", K(e.b.byteLength));
for (const e of t.p) {
if (!ce(e.k)) continue;
i(e.k, e.v, W(e.v));
}
}
async function de(e, t, n, r) {
const o = D(n);
const i = [];
const a = [];
for (const s of o) {
try {
const o = await q(e, s.f);
const a = await B(o.u);
const l = O(a, "rbxm");
let c = (() => {
try {
return Z(a) || ne(a);
} catch (e) {
return null;
}
})();
if (!c) {
c = {
t: {
id: 1,
c: l.toUpperCase(),
n: t,
p: [ {
k: "Format",
v: l
}, {
k: "Size",
v: K(a.byteLength)
} ],
ch: []
},
e: {
1: true
}
};
}
i.push({
l: s.l,
f: s.f,
u: o.u,
a: o.a,
b: a,
x: l,
tr: c,
rf: G(a),
ex: {},
ai: e,
an: t,
at: n,
pp: r || ""
});
} catch (e) {
a.push(`${s.l}: ${e.message || String(e)}`);
}
}
if (!i.length) {
throw new Error(a.join(" | ") || "No payload variants resolved");
}
for (const e of i) {
if (e.tr && e.tr.e) {
e.ex = {
...e.tr.e
};
}
if (e.pp) {
e.l = `${e.pp} - ${e.l}`;
}
}
return i;
}
async function ue(e, t) {
if (!e || !e.u) return;
const n = await B(e.u);
const r = O(n, "bin");
const o = J(t || (Number.isSafeInteger(e.i) ? `asset-${e.i}` : `asset-${Date.now()}`));
Q(n, `${o}.${r}`, r);
}
async function fe(e) {
if (!e || !e.b) return;
v(false);
try {
const t = J(`${e.an || p.t || "asset"}-${e.l || "payload"}`);
Q(e.b, `${t}.${e.x}`, e.x);
const n = new Set;
for (const t of e.rf || []) {
if (!t || !t.u || n.has(t.u)) continue;
n.add(t.u);
await ue(t, `${e.an || p.t || "asset"}-${t.i || n.size}`);
}
} finally {
v(true);
}
}
async function xe() {
if (!p.mm.length) return;
v(false);
try {
const e = new Set;
for (const t of p.mm) {
const n = J(`${t.an || p.t || "asset"}-${t.l || "payload"}`);
Q(t.b, `${n}.${t.x}`, t.x);
for (const n of t.rf || []) {
if (!n || !n.u || e.has(n.u)) continue;
e.add(n.u);
await ue(n, `${t.an || p.t || "asset"}-${n.i || e.size}`);
}
}
} finally {
v(true);
}
}
async function me(e) {
const t = x();
if (!t) {
z();
return;
}
E();
b();
p.w = true;
v(false);
try {
p.i = t;
p.a.textContent = t.k === "bundle" ? `Bundle ${t.i}` : String(t.i);
p.n.textContent = "Loading…";
if (e || !p.mm.length) {
p.mm = [];
p.mi = 0;
p.sid = null;
p.ft = "";
if (p.fi) p.fi.value = "";
se();
le();
pe();
}
if (t.k === "asset") {
g("Loading item metadata...", "warn");
const e = await A(t.i);
p.t = e.n;
p.n.textContent = e.n;
g("Resolving payloads...", "warn");
const n = await de(t.i, e.n, e.t, "");
p.mm = n;
} else {
g("Loading bundle details...", "warn");
const e = await U(t.i);
p.t = e.n;
p.n.textContent = e.n;
const n = [];
for (let t = 0; t < e.a.length; t++) {
const r = e.a[t];
g(`Loading bundle asset ${t + 1}/${e.a.length}...`, "warn");
try {
const e = await A(r.i);
const t = await de(r.i, e.n, e.t, r.n || e.n);
n.push(...t);
} catch (e) {}
}
if (!n.length) {
throw new Error("No explorable assets resolved from this bundle");
}
p.mm = n;
}
let n = -1;
if (t.k === "asset") {
const e = Number(p.mm[0] && p.mm[0].at || 0);
if (s.has(e)) {
n = p.mm.findIndex(e => /specialmesh/i.test(String(e.l || "")));
}
}
if (n < 0) n = p.mm.findIndex(e => /meshpart/i.test(String(e.l || "")));
if (n < 0) n = 0;
p.mi = n;
const r = ae();
p.sid = r && r.tr ? r.tr.t.id : null;
se();
le();
pe();
} catch (e) {
p.mm = [];
p.mi = 0;
p.sid = null;
se();
le();
pe();
g(`Failed: ${e.message || String(e)}`, "error");
} finally {
p.w = false;
v(true);
}
}
let he = 0;
const be = 60;
function ge() {
if (!p.e) return;
const e = x();
if (!e) {
if (p.o) I();
return;
}
E();
if (p.o && !p.o.classList.contains("pxe-fb")) {
ve();
return;
}
he += 1;
if (he >= be) {
ve();
}
}
function ve() {
if (p.mo) {
p.mo.disconnect();
p.mo = null;
}
}
function we() {
if (p.mo) return;
he = 0;
p.mo = new MutationObserver(() => {
ge();
});
p.mo.observe(document.body || document.documentElement, {
childList: true,
subtree: true
});
ge();
}
function ye() {
const e = x();
if (!p.e || !e) {
I();
ve();
return;
}
ve();
we();
if (p.v) {
S();
const t = `${e.k}:${e.i}`;
const n = p.i ? `${p.i.k}:${p.i.i}` : "";
if (t !== n) {
me(false).catch(() => {});
}
}
}
function ke() {
if (p.c) return;
p.c = window.setInterval(() => {
if (location.href !== p.h) {
p.h = location.href;
ye();
return;
}
if (!p.e) return;
const e = x();
if (!e) {
if (p.o) I();
return;
}
E();
if (p.v) S();
}, 700);
}
function Ce() {
if (p.c) {
clearInterval(p.c);
p.c = null;
}
ve();
if (p.oc) {
document.removeEventListener("mousedown", p.oc, true);
p.oc = null;
}
if (p.kc) {
document.removeEventListener("keydown", p.kc, true);
p.kc = null;
}
I();
}
async function Ee() {
p.e = await m();
if (!p.e) {
Ce();
return;
}
ye();
ke();
}
function Se() {
try {
chrome.storage.onChanged.addListener((e, n) => {
if (n !== "sync") return;
if (!Object.prototype.hasOwnProperty.call(e, t)) return;
Ee().catch(() => {});
});
} catch (e) {}
}
function Le() {
const e = document.getElementById("pxe-ov");
if (!e) return;
const t = document.documentElement.classList.contains("dark-theme") || document.body && document.body.classList.contains("dark-theme") || document.body && !document.body.classList.contains("light-theme") && !document.documentElement.classList.contains("light-theme");
e.style.background = t ? "rgba(8,10,16,.26)" : "rgba(200,200,210,.4)";
}
function $e() {
Le();
const e = new MutationObserver(() => {
Le();
});
e.observe(document.documentElement, {
attributes: true,
attributeFilter: [ "class" ]
});
if (document.body) e.observe(document.body, {
attributes: true,
attributeFilter: [ "class" ]
});
}
function Ne() {
Se();
$e();
Ee().catch(() => {});
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", Ne, {
once: true
});
} else {
Ne();
}
})();
