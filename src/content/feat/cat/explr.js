/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";

if (window.top !== window.self) return;

const xg = "__purpura_explr_loaded";
if (window[xg]) return;
window[xg] = 1;

const xk = "explr";
const xr1 = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)(?:\/|$)/i;
const xr2 = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)(?:\/|$)/i;
const xr3 = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?marketplace\/asset\/(\d+)(?:\/|$)/i;
const xr4 = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?library\/(\d+)(?:\/|$)/i;
const xr5 = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?store\/asset\/(\d+)(?:\/|$)/i;

const xa1 = new Set([8, 41, 42, 43, 44, 45, 46, 47, 57, 58, 64, 65, 66, 67, 68, 69, 70, 71, 72]);
const xa2 = new Set([17, 79]);

const xb1 = new Set([
  "name", "classname", "meshid", "meshidstring", "textureid", "texture", "assetid",
  "shirttemplate", "pantstemplate", "graphic", "image", "content",
  "position", "orientation", "rotation", "size", "cframe", "material", "color", "color3",
  "transparency", "cancollide", "anchored", "reflectance", "shapename", "source", "linkedsource"
]);

const xs = {
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

const xi1 = '<span class="pxe-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.75" y="1.75" width="7.5" height="7.5" rx="1.2" stroke="currentColor" stroke-width="1.5"/><circle cx="11.25" cy="11.25" r="2.75" stroke="currentColor" stroke-width="1.5"/><path d="M13.2 13.2L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>';
const xi2 = '<span class="pxe-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.2V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5.6 6.8L8 9.2L10.4 6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="10.4" width="10" height="2.9" rx="1" stroke="currentColor" stroke-width="1.5"/></svg></span>';
const xi3 = '<span class="pxe-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.2 2.2V6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 5.6L5.2 6.8L6.4 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.8 2.2V6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M9.6 5.6L10.8 6.8L12 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="2.6" y="10.4" width="10.8" height="2.9" rx="1" stroke="currentColor" stroke-width="1.4"/></svg></span>';

function xa() {
  const p = location.pathname || "";

  let m = p.match(xr1);
  if (m) {
    const i = Number.parseInt(m[1], 10);
    if (Number.isSafeInteger(i)) return { k: "asset", i };
  }

  m = p.match(xr2);
  if (m) {
    const i = Number.parseInt(m[1], 10);
    if (Number.isSafeInteger(i)) return { k: "bundle", i };
  }

  m = p.match(xr3);
  if (m) {
    const i = Number.parseInt(m[1], 10);
    if (Number.isSafeInteger(i)) return { k: "asset", i };
  }

  m = p.match(xr4);
  if (m) {
    const i = Number.parseInt(m[1], 10);
    if (Number.isSafeInteger(i)) return { k: "asset", i };
  }

  m = p.match(xr5);
  if (m) {
    const i = Number.parseInt(m[1], 10);
    if (Number.isSafeInteger(i)) return { k: "asset", i };
  }

  return null;
}

function xb() {
  return window.__PurpuraSettings.ready.then(function() {
    var v = window.__PurpuraSettings.get(xk);
    if (typeof v === "boolean") return v;
    return true;
  }).catch(function() { return true; });
}

function xc() {
  let y = document.getElementById("pxe-s");
  if (!y) {
    y = document.createElement("style");
    y.id = "pxe-s";
    document.documentElement.appendChild(y);
  }
  y.textContent = `
:root{
  --p0:#121215;--p1:#191a1f;--p2:#202227;--p3:#272930;
  --pc:#d5d7dd;--pe:#f7f7f8;--pm:#bcbec8;
  --pd:rgba(208,217,251,.12);--ps:rgba(208,217,251,.16);--pq:rgba(208,217,251,.08);
  --ph:rgba(208,217,251,.08);--pp:rgba(208,217,251,.12);
  --pa:#335fff;--pf:#f7f7f8;--pb:rgba(51,95,255,.4);--pl:#ebf1ff;
  --px:#335fff;--pz:rgba(0,0,0,.5);
}
:root.light-theme,body.light-theme,body:not(.dark-theme){
  --p0:#e8e8ec;--p1:#f0f0f3;--p2:#fafafc;--p3:#ffffff;
  --pc:#2c2e35;--pe:#0d0e12;--pm:#6b6f7a;
  --pd:rgba(0,0,0,.08);--ps:rgba(0,0,0,.12);--pq:rgba(0,0,0,.05);
  --ph:rgba(0,0,0,.04);--pp:rgba(0,0,0,.08);
  --pa:#335fff;--pf:#ffffff;--pb:rgba(51,95,255,.25);--pl:#eef3ff;
  --px:#335fff;--pz:rgba(0,0,0,.15);
}
#pxe-bc{position:relative;display:inline-flex;align-items:center;flex:0 0 auto}
#pxe-bc .pxe-bt{display:inline-flex;align-items:center;justify-content:center;gap:0;min-width:34px;width:34px;height:34px;padding:0;border:1px solid var(--ps);border-radius:8px;background:var(--p2);color:var(--pe);font-size:13px;font-weight:600;cursor:pointer;line-height:1;transition:background .15s,border-color .15s}
#pxe-bc .pxe-bt:hover{background:var(--p3);border-color:var(--ps)}
#pxe-bc .pxe-bt .pxe-ic{width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 14px;color:var(--pa)}
#pxe-bc .pxe-bt .pxe-ic svg{width:14px;height:14px;display:block}
#pxe-bc .pxe-bt .pxe-ic:empty::before{content:"◻";font-size:11px;line-height:1;color:var(--pa)}
#pxe-bc .pxe-bt:focus{outline:2px solid var(--px);outline-offset:2px}
#pxe-bc .pxe-po{display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647}
#pxe-bc .pxe-po.v{display:block}
#pxe-ov{position:fixed;inset:0;z-index:2147483645;background:rgba(8,10,16,.26);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .14s ease}
#pxe-ov.v{opacity:1;pointer-events:auto}
html.pxe-ns,body.pxe-ns{overflow:hidden !important}
#pxe-bc.pxe-fb{position:fixed;right:16px;bottom:16px;z-index:2147483646}
#pxe-bc.pxe-fb .pxe-po{left:50%;top:50%;right:auto;bottom:auto;transform:translate(-50%,-50%)}
.pxe-actions[data-pxe-slot='1']{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:8px}
.pxe-actions[data-pxe-slot='1']>#pxe-bc{margin-left:0;transform:translate(-80px,5px)}
.shopping-cart-btn-container + .pxe-actions[data-pxe-slot='1']{padding-top:0;margin-left:8px}
.item-details-name-row.pxe-name-host{display:flex;align-items:center;gap:8px;min-width:0}
.item-details-name-row.pxe-name-host > h1{min-width:0;margin:0}
.pxe-name-slot{display:inline-flex;align-items:center;overflow:visible;position:relative;flex:0 0 auto}
.pxe-name-slot>#pxe-bc{margin-left:0;transform:none}
#pxe-p{width:min(92vw,590px);max-height:min(78vh,680px);overflow:hidden;border-radius:12px;border:1px solid var(--pd);background:var(--p1);box-shadow:0 20px 60px var(--pz),0 2px 8px rgba(0,0,0,.38);color:var(--pc);font-family:"Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column}
#pxe-p *{box-sizing:border-box}
#pxe-p .pxe-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:var(--p0);border-bottom:1px solid var(--pd);flex:0 0 auto}
#pxe-p .pxe-head-left{display:flex;align-items:center;gap:8px;min-width:0}
#pxe-p .pxe-head-copy{display:grid;gap:0;min-width:0}
#pxe-p .pxe-logo{width:22px;height:22px;border-radius:6px;background:var(--pa);display:flex;align-items:center;justify-content:center;flex:0 0 22px}
#pxe-p .pxe-logo svg{width:12px;height:12px;display:block;color:var(--pf)}
#pxe-p .pxe-title{font-size:12px;font-weight:700;letter-spacing:.1px;color:var(--pe);line-height:1.05}
#pxe-p .pxe-sub{font-size:10px;color:var(--pm);margin-top:0;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pxe-p .pxe-cl{border:1px solid var(--pd);border-radius:6px;width:24px;height:24px;cursor:pointer;color:var(--pm);background:transparent;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s,border-color .12s;flex:0 0 24px}
#pxe-p .pxe-cl:hover{background:var(--p2);border-color:var(--ps);color:var(--pe)}
#pxe-p .pxe-body{padding:10px 11px;overflow-y:auto;flex:1 1 auto}
#pxe-p .pxe-body::-webkit-scrollbar{width:4px}
#pxe-p .pxe-body::-webkit-scrollbar-thumb{background:var(--pd);border-radius:2px}
#pxe-p .pxe-meta{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-bottom:8px;padding:7px 9px;background:var(--p0);border-radius:9px;border:1px solid var(--pd)}
#pxe-p .pxe-mrow{display:flex;flex-direction:column;gap:1px;min-width:0}
#pxe-p .pxe-mlabel{font-size:10px;font-weight:600;letter-spacing:.4px;line-height:1;text-transform:uppercase;color:var(--pm)}
#pxe-p .pxe-mval{font-size:11px;font-weight:600;line-height:1.12;color:var(--pe);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pxe-p .pxe-toolbar{display:flex;align-items:center;gap:6px;margin-bottom:8px}
#pxe-p .pxe-sel{flex:1;min-width:0;height:30px;border:1px solid var(--pd);border-radius:8px;background:var(--p2);color:var(--pc);padding:0 28px 0 8px;line-height:1.2;font-size:11px;font-family:inherit;cursor:pointer;transition:border-color .12s}
#pxe-p .pxe-sel:hover{border-color:var(--ps)}
#pxe-p .pxe-sel:focus{outline:2px solid var(--px);outline-offset:1px;border-color:var(--pa)}
#pxe-p .pxe-icon-btn{border:1px solid var(--pd);border-radius:8px;background:var(--p2);color:var(--pm);cursor:pointer;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 30px;transition:background .12s,border-color .12s,color .12s}
#pxe-p .pxe-icon-btn:hover{background:var(--p3);border-color:var(--ps);color:var(--pe)}
#pxe-p .pxe-icon-btn:disabled{opacity:.35;cursor:not-allowed}
#pxe-p .pxe-icon-btn .pxe-ic{width:13px;height:13px;display:inline-flex;align-items:center;justify-content:center}
#pxe-p .pxe-icon-btn .pxe-ic svg{width:13px;height:13px;display:block}
#pxe-p .pxe-filter{width:100%;border:1px solid var(--pd);border-radius:8px;background:var(--p2);color:var(--pc);padding:6px 8px;font-size:11px;font-family:inherit;margin-bottom:8px;transition:border-color .12s}
#pxe-p .pxe-filter::placeholder{color:var(--pm)}
#pxe-p .pxe-filter:hover{border-color:var(--ps)}
#pxe-p .pxe-filter:focus{outline:2px solid var(--px);outline-offset:1px;border-color:var(--pa)}
#pxe-p .pxe-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;margin-bottom:0}
#pxe-p .pxe-col-head{font-size:10px;font-weight:600;letter-spacing:.35px;line-height:1;text-transform:uppercase;color:var(--pm);padding:0 0 3px 2px}
#pxe-p .pxe-tree{border:1px solid var(--pd);border-radius:9px;background:var(--p0);min-height:180px;max-height:260px;overflow:auto;padding:3px}
#pxe-p .pxe-props{border:1px solid var(--pd);border-radius:9px;background:var(--p0);min-height:180px;max-height:260px;overflow:auto;padding:8px}
#pxe-p .pxe-tree::-webkit-scrollbar,#pxe-p .pxe-props::-webkit-scrollbar{width:4px}
#pxe-p .pxe-tree::-webkit-scrollbar-thumb,#pxe-p .pxe-props::-webkit-scrollbar-thumb{background:var(--pd);border-radius:2px}
#pxe-p .it{display:flex;align-items:center;gap:4px;height:24px;border-radius:6px;padding:0 5px;cursor:pointer;user-select:none;transition:background .1s}
#pxe-p .it:hover{background:var(--ph)}
#pxe-p .it.se{background:var(--pb)}
#pxe-p .tw{width:16px;height:16px;border:0;border-radius:4px;background:transparent;color:var(--pm);cursor:pointer;padding:0;line-height:1;flex:0 0 16px;font-size:10px}
#pxe-p .tw.nd{cursor:default;color:var(--pq)}
#pxe-p .ic{display:inline-flex;align-items:center;height:16px;font-size:9px;font-weight:600;line-height:1;color:var(--pm);background:var(--p2);border:1px solid var(--pd);border-radius:999px;padding:0 8px;max-width:min(44%,130px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto}
#pxe-p .it.se .ic{background:rgba(51,95,255,.25);border-color:rgba(51,95,255,.35);color:var(--pl)}
#pxe-p .nm{font-size:11px;color:var(--pc);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}
#pxe-p .it.se .nm{color:var(--pl)}
#pxe-p .pxe-prop-name{font-size:12px;font-weight:700;line-height:1.08;color:var(--pe);margin-bottom:0;word-break:break-word}
#pxe-p .pxe-prop-class{font-size:10px;line-height:1.1;color:var(--pm);margin-bottom:5px;display:flex;align-items:center;gap:4px}
#pxe-p .pxe-prop-class::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--pa);flex:0 0 6px}
#pxe-p .pxe-divider{height:1px;background:var(--pq);margin:5px 0}
#pxe-p .prr{display:grid;grid-template-columns:minmax(0,100px) minmax(0,1fr) auto;align-items:center;gap:5px;padding:2px 0;border-radius:5px}
#pxe-p .prr span{font-size:10px;line-height:1.1;color:var(--pm);word-break:break-word}
#pxe-p .prr strong{font-size:10px;line-height:1.1;color:var(--pc);font-weight:500;word-break:break-word;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pxe-p .pxe-dl-inline{border:1px solid var(--pd);border-radius:5px;background:transparent;color:var(--pm);cursor:pointer;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 20px;transition:background .1s,color .1s,border-color .1s}
#pxe-p .pxe-dl-inline:hover{background:var(--p2);border-color:var(--ps);color:var(--pe)}
#pxe-p .pxe-dl-inline .pxe-ic{width:11px;height:11px;display:inline-flex}
#pxe-p .pxe-dl-inline .pxe-ic svg{width:11px;height:11px;display:block}
#pxe-p .em{font-size:10px;color:var(--pm);font-style:italic;padding:6px 4px}
@media (max-width:860px){
  #pxe-p .pxe-cols{grid-template-columns:minmax(0,1fr)}
  #pxe-p .pxe-tree,#pxe-p .pxe-props{max-height:200px}
}
`;
}

function xd() {
  if (xs.p && document.body.contains(xs.p)) return;

  xc();

  if (!xs.po || !document.body.contains(xs.po)) return;

  const y = document.createElement("section");
  y.id = "pxe-p";
  y.innerHTML = [
    '<header class="pxe-head">',
    '  <div class="pxe-head-left">',
    '    <div class="pxe-logo"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.75" y="1.75" width="7.5" height="7.5" rx="1.2" stroke="currentColor" stroke-width="1.5"/><circle cx="11.25" cy="11.25" r="2.75" stroke="currentColor" stroke-width="1.5"/><path d="M13.2 13.2L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>',
    '    <div class="pxe-head-copy">',
    '      <div class="pxe-title">Explorer</div>',
    '      <div class="pxe-sub">View item assets.</div>',
    '    </div>',
    '  </div>',
    '  <button type="button" class="pxe-cl" title="Close" aria-label="Close Explorer">',
    '    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    '  </button>',
    '</header>',
    '<div class="pxe-body">',
    '  <div class="pxe-meta">',
    '    <div class="pxe-mrow"><div class="pxe-mlabel">Asset</div><div class="pxe-mval" id="pxe-a">\u2014</div></div>',
    '    <div class="pxe-mrow"><div class="pxe-mlabel">Name</div><div class="pxe-mval" id="pxe-n">\u2014</div></div>',
    '  </div>',
    '  <div class="pxe-toolbar">',
    '    <select class="pxe-sel" id="pxe-ms"></select>',
    '    <button type="button" class="pxe-icon-btn" id="pxe-d1" disabled aria-label="Download selected payload" title="Download selected payload"></button>',
    '    <button type="button" class="pxe-icon-btn" id="pxe-da" disabled aria-label="Download all payloads" title="Download all payloads"></button>',
    '  </div>',
    '  <input class="pxe-filter" id="pxe-fi" type="text" placeholder="Filter nodes\u2026">',
    '  <div class="pxe-cols">',
    '    <div>',
    '      <div class="pxe-col-head">Asset Tree</div>',
    '      <div class="pxe-tree" id="pxe-lv"></div>',
    '    </div>',
    '    <div>',
    '      <div class="pxe-col-head">Properties</div>',
    '      <div class="pxe-props" id="pxe-pv"></div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join("");

  xs.po.replaceChildren(y);

  xs.p = y;
  xs.b = y.querySelector(".pxe-body");
  xs.a = y.querySelector("#pxe-a");
  xs.n = y.querySelector("#pxe-n");
  xs.d1 = y.querySelector("#pxe-d1");
  xs.da = y.querySelector("#pxe-da");
  xs.ms = y.querySelector("#pxe-ms");
  xs.fi = y.querySelector("#pxe-fi");
  xs.lv = y.querySelector("#pxe-lv");
  xs.pv = y.querySelector("#pxe-pv");

  xs.d1.innerHTML = xi2;
  xs.da.innerHTML = xi3;

  y.querySelector(".pxe-cl").addEventListener("click", () => {
    xz4();
  });

  xs.d1.addEventListener("click", () => {
    x16(xw3()).catch(() => {});
  });

  xs.da.addEventListener("click", () => {
    x17().catch(() => {});
  });

  xs.ms.addEventListener("change", () => {
    const i = Number.parseInt(xs.ms.value, 10);
    if (!Number.isSafeInteger(i)) return;
    if (i < 0 || i >= xs.mm.length) return;
    xs.mi = i;
    const m = xw3();
    xs.sid = m && m.tr ? m.tr.t.id : null;
    xy3();
    xz3();
    xf(true);
  });

  xs.fi.addEventListener("input", () => {
    xs.ft = xs.fi.value || "";
    xy3();
  });

  xs.lv.addEventListener("click", e => {
    const r = e.target.closest(".it");
    if (!r) return;

    const i = Number.parseInt(r.dataset.id || "", 10);
    if (!Number.isSafeInteger(i)) return;

    const m = xw3();
    if (!m || !m.tr) return;

    const n = xv3(m.tr.t, i);
    if (!n) return;

    if (e.target.closest(".tw") && n.ch.length) {
      m.ex[i] = m.ex[i] === false ? true : false;
      xy3();
      return;
    }

    xs.sid = i;
    xy3();
    xz3();
  });

  xx3();
  xy3();
  xz3();
  xf(true);
}

function xe(t, k) {
  void t; void k;
}

function xf(v) {
  const dis = !v || xs.w || xs.mm.length === 0;
  if (xs.d1) xs.d1.disabled = dis;
  if (xs.da) xs.da.disabled = dis;
}

function xh0(e) {
  if (!e || !(e instanceof Element)) return false;
  if (!document.documentElement.contains(e)) return false;

  const s = getComputedStyle(e);
  if (!s || s.display === "none" || s.visibility === "hidden") return false;

  const r = e.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function xh1(h) {
  if (!xh0(h)) return null;

  let b = h.querySelector(":scope > .pxe-actions[data-pxe-slot='1']")
    || h.querySelector(":scope > .pxe-actions");
  if (!b) {
    b = document.createElement("div");
    b.className = "pxe-actions";
    b.dataset.pxeSlot = "1";
    h.appendChild(b);
  } else {
    b.classList.add("pxe-actions");
    if (!b.dataset.pxeSlot) b.dataset.pxeSlot = "1";
  }

  return b;
}

function xh2() {
  const row = document.querySelector([
    ".item-details-name-row",
    "[data-testid='item-details-name-row']",
    "[data-testid='item-name-row']"
  ].join(","));

  if (!xh0(row)) return null;

  row.classList.add("pxe-name-host");

  const h1 = row.querySelector(":scope > h1") || row.querySelector("h1");
  let s = row.querySelector(":scope > .pxe-name-slot");

  if (!s) {
    s = document.createElement("span");
    s.className = "pxe-name-slot";
    if (h1 && h1.parentElement === row) {
      h1.insertAdjacentElement("afterend", s);
    } else {
      row.appendChild(s);
    }
  }

  if (s.tagName !== "SPAN") {
    const s2 = document.createElement("span");
    s2.className = "pxe-name-slot";
    while (s.firstChild) s2.appendChild(s.firstChild);
    s.replaceWith(s2);
    s = s2;
  }

  if (h1 && h1.parentElement === row && s.previousElementSibling !== h1) {
    h1.insertAdjacentElement("afterend", s);
  } else if (s.parentElement !== row) {
    row.appendChild(s);
  }

  return s;
}

function xh() {
  const nameSlot = xh2();
  if (nameSlot) return nameSlot;

  const anchor = document.querySelector([
    "button[data-testid*='purchase']",
    "button[data-testid*='buy']",
    "button[data-testid*='item']",
    "a[data-testid*='purchase']",
    ".PurchaseButton",
    ".purchase-button",
    ".btn-growth-md",
    ".btn-primary-md"
  ].join(","));

  if (anchor) {
    const group = anchor.closest([
      "[data-testid='item-details-action-button-group']",
      "[data-testid*='action-button-group']",
      "[data-testid*='item-details-action']",
      ".item-details-action-buttons",
      ".action-button-group",
      ".item-buttons",
      ".item-buttons-container"
    ].join(","));

    if (xh0(group)) return group;

    const header = anchor.closest([
      "[data-testid='item-details-info-header']",
      ".item-details-info-header",
      "#item-details .item-details-info-header"
    ].join(","));

    const slot = xh1(header);
    if (slot) return slot;

    if (xh0(anchor.parentElement)) return anchor.parentElement;
  }

  const directGroup = document.querySelector([
    ".pxe-actions[data-pxe-slot='1']",
    ".pxe-actions",
    "[data-testid='item-details-action-button-group']",
    "[data-testid*='action-button-group']",
    "[data-testid*='item-details-action']",
    ".item-details-action-buttons",
    ".action-button-group",
    ".item-buttons",
    ".item-buttons-container"
  ].join(","));

  if (xh0(directGroup)) return directGroup;

  const header = document.querySelector([
    "[data-testid='item-details-info-header']",
    ".item-details-info-header",
    "#item-details .item-details-info-header"
  ].join(","));

  return xh1(header);
}

function xi() {
  const rt = xa();
  if (!rt) return;

  const host = xh();

  if (xs.o && document.body.contains(xs.o) && xs.bt && xs.po) {
    if (!xs.bt.querySelector(".pxe-ic svg")) {
      xs.bt.innerHTML = xi1;
    }
    xs.bt.classList.add("pxe-bt");

    if (host) {
      if (xs.o.classList.contains("pxe-fb")) {
        xs.o.classList.remove("pxe-fb");
      }
      if (xs.o.parentElement !== host) {
        host.appendChild(xs.o);
      }
    } else {
      if (!xs.o.classList.contains("pxe-fb")) {
        xs.o.classList.add("pxe-fb");
      }
      if (xs.o.parentElement !== document.body) {
        document.body.appendChild(xs.o);
      }
    }
    return;
  }

  const floating = !host;

  xc();

  const c = document.createElement("div");
  c.id = "pxe-bc";
  c.className = "pxe-bc-wrap";
  if (floating) c.classList.add("pxe-fb");

  const b = document.createElement("a");
  b.href = "#";
  b.role = "button";
  b.className = "pxe-bt";
  b.setAttribute("aria-label", "Open Explorer");
  b.setAttribute("title", "Open Explorer");
  b.innerHTML = xi1;

  const p = document.createElement("div");
  p.className = "pxe-po";

  c.appendChild(b);
  c.appendChild(p);

  if (host) {
    host.appendChild(c);
  } else {
    document.body.appendChild(c);
  }

  xs.o = c;
  xs.bt = b;
  xs.po = p;

  b.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    if (xs.v) {
      xz4();
    } else {
      xa4().catch(() => {});
    }
  });

  if (!xs.oc) {
    xs.oc = ev => {
      if (!xs.v) return;
      if (!xs.o) return;
      if (xs.o.contains(ev.target)) return;
      xz4();
    };
    document.addEventListener("mousedown", xs.oc, true);
  }

  if (!xs.kc) {
    xs.kc = ev => {
      if (!xs.v) return;
      if (ev.key === "Escape") {
        xz4();
      }
    };
    document.addEventListener("keydown", xs.kc, true);
  }
}

function xj() {
  if (!xs.po || !xs.v) return;

  const p = xs.po;
  p.style.left = "50%";
  p.style.top = "50%";
  p.style.right = "auto";
  p.style.bottom = "auto";
  p.style.transform = "translate(-50%,-50%)";

  const m = 8;
  const r = p.getBoundingClientRect();
  let dx = 0;
  let dy = 0;

  if (r.left < m) dx = m - r.left;
  if (r.right > window.innerWidth - m) dx = (window.innerWidth - m) - r.right;
  if (r.top < m) dy = m - r.top;
  if (r.bottom > window.innerHeight - m) dy = (window.innerHeight - m) - r.bottom;

  if (dx || dy) {
    p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }
}

function x24() {
  if (xs.ov && document.body.contains(xs.ov)) return xs.ov;

  let o = document.getElementById("pxe-ov");
  if (!o) {
    o = document.createElement("div");
    o.id = "pxe-ov";
    document.body.appendChild(o);
  }

  xs.ov = o;
  return o;
}

function x25(v) {
  const d = document.documentElement;
  const b = document.body;
  if (!d || !b) return;

  if (v) {
    const o = x24();
    o.classList.add("v");
    d.classList.add("pxe-ns");
    b.classList.add("pxe-ns");
    return;
  }

  if (xs.ov) {
    xs.ov.classList.remove("v");
  }
  d.classList.remove("pxe-ns");
  b.classList.remove("pxe-ns");
}

async function xa4() {
  xi();
  if (!xs.po || !xs.bt) return;

  xd();
  x25(true);

  xs.po.classList.add("v");
  xs.v = true;
  xs.bt.setAttribute("aria-expanded", "true");

  xj();

  const rt = xa();
  if (!rt) return;

  const k = `${rt.k}:${rt.i}`;
  const lk = xs.i ? `${xs.i.k}:${xs.i.i}` : "";

  if (!xs.mm.length || k !== lk) {
    await xw(false);
  }
}

function xz4() {
  x25(false);
  if (!xs.po || !xs.bt) return;
  xs.po.classList.remove("v");
  xs.v = false;
  xs.bt.setAttribute("aria-expanded", "false");
}

function xk3() {
  x25(false);

  if (xs.ov && document.body.contains(xs.ov)) {
    xs.ov.remove();
  }

  if (xs.o && document.body.contains(xs.o)) {
    xs.o.remove();
  }
  xs.ov = null;
  xs.o = null;
  xs.bt = null;
  xs.po = null;
  xs.p = null;
  xs.b = null;
  xs.a = null;
  xs.n = null;
  xs.d1 = null;
  xs.da = null;
  xs.ms = null;
  xs.fi = null;
  xs.lv = null;
  xs.pv = null;
  xs.v = false;
}

async function xl(i) {
  const u = `https://economy.roblox.com/v2/assets/${i}/details`;
  const r = await fetch(u, { credentials: "include" });
  if (!r.ok) throw new Error(`Metadata failed (${r.status})`);
  const j = await r.json();
  const n = (j && typeof j.Name === "string" && j.Name.trim()) || `Asset ${i}`;
  const t = Number(j.AssetTypeId || j.AssetType || 0);
  return { n, t: Number.isFinite(t) ? t : 0 };
}

async function xm(i) {
  const u = `https://catalog.roblox.com/v1/bundles/${i}/details`;
  const r = await fetch(u, { credentials: "include" });
  if (!r.ok) throw new Error(`Bundle details failed (${r.status})`);

  const j = await r.json();
  const n = (j && typeof j.name === "string" && j.name.trim()) || `Bundle ${i}`;

  const m = Array.isArray(j.items) ? j.items : [];
  const o = [];
  const s = new Set();

  for (const it of m) {
    const k = String(it?.type || "").toLowerCase();
    if (k !== "asset") continue;

    const id = Number.parseInt(String(it?.id || ""), 10);
    if (!Number.isSafeInteger(id)) continue;
    if (s.has(id)) continue;
    s.add(id);

    const an = (typeof it?.name === "string" && it.name.trim()) ? it.name.trim() : `Asset ${id}`;
    o.push({ i: id, n: an });
  }

  if (!o.length) {
    throw new Error("Bundle has no explorable assets");
  }

  return { n, a: o };
}

function xn(t) {
  const p = [{ f: null, l: "Default" }];

  if (xa1.has(t)) {
    p[0].l = "SpecialMesh";
    p.push({ f: "avatar_meshpart_accessory", l: "MeshPart" });
  }

  if (xa2.has(t)) {
    p[0].l = "SpecialMesh";
    p.push({ f: "avatar_meshpart_head", l: "MeshPart" });
  }

  return p;
}

async function xo(i, f) {
  const h = {};
  if (f) h["Roblox-AssetFormat"] = f;
  // Roblox-Browser-Asset-Request is never sent from page context - it triggers
  // CORS preflight that the Roblox server rejects. The header is not needed
  // for the asset delivery API to return correct data.

  const url = `https://assetdelivery.roblox.com/v2/asset/?id=${i}`;

  // Always route through background script to bypass Roblox's service worker
  // which intercepts and modifies fetch requests from page context, adding
  // headers that trigger CORS preflight failures.
  return xo_bg(url, h);
}

function xo_bg(url, h) {
  return new Promise((resolve, reject) => {
    var settled = false;
    var timer = setTimeout(function() {
      if (!settled) {
        settled = true;
        reject(new Error("bg fetch timeout"));
      }
    }, 8000);

    try {
      chrome.runtime.sendMessage({
        type: "PURPURA_FETCH_RESOURCE_REQUEST",
        url: url,
        method: "GET",
        accept: "application/json",
        headers: h
      }, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const le = chrome.runtime.lastError;
        if (le || !response || !response.ok) {
          reject(new Error("bg fetch failed"));
          return;
        }
        let j;
        try {
          j = response.text ? JSON.parse(response.text) : null;
        } catch (e) {
          reject(new Error("invalid json"));
          return;
        }
        const u = j && j.locations && j.locations[0] && j.locations[0].location;
        if (!u) {
          reject(new Error("no location"));
          return;
        }
        resolve({ u, a: j.assetTypeId ?? null });
      });
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error("network blocked"));
      }
    }
  });
}

async function xp(i, f) {
  // All assetdelivery fetches go through background script (bypasses Roblox service worker CORS)
  try {
    return await xo(i, f);
  } catch (x) {
    const e = [`fmt: ${x.message || String(x)}`];
    // If format header was set, try without it as a fallback
    if (f) {
      try {
        return await xo(i, null);
      } catch (x2) {
        e.push(`nofmt: ${x2.message || String(x2)}`);
      }
    }
    throw new Error(e.join(" | "));
  }
}

function x14(v) {
  const s = atob(String(v || ""));
  const y = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) {
    y[i] = s.charCodeAt(i);
  }
  return y.buffer;
}

function x15(u) {
  return new Promise((ok, no) => {
    try {
      chrome.runtime.sendMessage({
        type: "PURPURA_FETCH_RESOURCE_REQUEST",
        url: u,
        method: "GET",
        accept: "application/octet-stream, */*;q=0.8",
        responseType: "arraybuffer"
      }, r => {
        const le = chrome.runtime.lastError;
        if (le) {
          no(new Error(le.message || "Download failed"));
          return;
        }
        if (!r || !r.ok) {
          no(new Error(`Download failed (${(r && Number.isFinite(r.status)) ? r.status : 0})`));
          return;
        }
        if (typeof r.base64 !== "string" || !r.base64.length) {
          no(new Error("Download failed (empty body)"));
          return;
        }
        try {
          ok(x14(r.base64));
        } catch (e) {
          no(new Error("Download failed (invalid body)"));
        }
      });
    } catch (e) {
      no(new Error(e?.message || "Download failed"));
    }
  });
}

async function xq(u) {
  let e = null;
  const b = /:\/\/assetdelivery\.roblox\.com\//i.test(String(u || ""));

  if (b) {
    try {
      return await x15(u);
    } catch (x) {
      e = x;
    }
  }

  try {
    const r = await fetch(u, { credentials: "omit", mode: "cors" });
    if (!r.ok) throw new Error(`Download failed (${r.status})`);
    return await r.arrayBuffer();
  } catch (x) {
    e = x;
  }

  if (!b) {
    try {
      return await x15(u);
    } catch (x) {
      e = x;
    }
  }

  throw new Error(e?.message || "Download failed");
}

function xr(b, f) {
  const x = new Uint8Array(b);
  if (x.length >= 8) {
    if (x[0] === 0x89 && x[1] === 0x50 && x[2] === 0x4e && x[3] === 0x47) return "png";
    if (x[0] === 0xff && x[1] === 0xd8) return "jpg";
    if (x[0] === 0x47 && x[1] === 0x49 && x[2] === 0x46) return "gif";
    if (x[0] === 0x52 && x[1] === 0x49 && x[2] === 0x46 && x[3] === 0x46) return "wav";
    if (x[0] === 0x4f && x[1] === 0x67 && x[2] === 0x67 && x[3] === 0x53) return "ogg";
    if (x[0] === 0x50 && x[1] === 0x4b) return "zip";
    if (x[0] === 0x3c && x[1] === 0x72 && x[2] === 0x6f && x[3] === 0x62
        && x[4] === 0x6c && x[5] === 0x6f && x[6] === 0x78 && x[7] === 0x21) return "rbxm";
  }

  const t = xs5(b, 512).trim().toLowerCase();
  if (t.startsWith("<?xml") || t.includes("<roblox")) return "rbxmx";
  return f || "bin";
}

function xs1(e) {
  if (e === "png") return "image/png";
  if (e === "jpg") return "image/jpeg";
  if (e === "gif") return "image/gif";
  if (e === "webp") return "image/webp";
  if (e === "ogg") return "audio/ogg";
  if (e === "wav") return "audio/wav";
  if (e === "mp3") return "audio/mpeg";
  return "application/octet-stream";
}

function xs2(b, m) {
  const x = new Uint8Array(b, 0, Math.min(b.byteLength, m));
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(x);
  } catch (e) {
    return "";
  }
}

function xs3(b, m) {
  const x = new Uint8Array(b, 0, Math.min(b.byteLength, m));
  try {
    return new TextDecoder("latin1", { fatal: false }).decode(x);
  } catch (e) {
    let y = "";
    const c = 8192;
    for (let i = 0; i < x.length; i += c) {
      const z = x.subarray(i, i + c);
      let w = "";
      for (let j = 0; j < z.length; j++) w += String.fromCharCode(z[j]);
      y += w;
    }
    return y;
  }
}

function xs4(v) {
  const t = document.createElement("textarea");
  t.innerHTML = v;
  return t.value;
}

function xs5(v, m) {
  return xs2(v, m);
}

function xt(v) {
  if (!v || typeof v !== "string") return null;

  let u = xs4(v.trim())
    .replace(/[\u0000-\u001F]+/g, "")
    .replace(/[)\],;]+$/, "");
  if (!u) return null;

  if (/^rbxassetid:\/\/(\d+)$/i.test(u)) {
    const i = Number.parseInt(u.replace(/^rbxassetid:\/\//i, ""), 10);
    return { u: `https://assetdelivery.roblox.com/v1/asset/?id=${i}`, i };
  }

  if (/^rbxhttp:\/\//i.test(u)) {
    const p = u.replace(/^rbxhttp:\/\//i, "");
    u = `https://www.roblox.com/${p}`;
  }

  if (/^\d+$/.test(u)) {
    const i = Number.parseInt(u, 10);
    return { u: `https://assetdelivery.roblox.com/v1/asset/?id=${i}`, i };
  }

  if (!/^https?:\/\//i.test(u)) return null;

  let o;
  try {
    o = new URL(u);
  } catch (e) {
    return null;
  }

  const h = o.hostname.toLowerCase();
  const p = o.pathname.toLowerCase();

  if (h.endsWith("w3.org")) return null;
  if (h.endsWith("roblox.com") && p.endsWith("/roblox.xsd")) return null;

  let i = null;
  const q = o.searchParams.get("id");
  if (q && /^\d+$/.test(q)) {
    i = Number.parseInt(q, 10);
  } else {
    const l = p.match(/\/library\/(\d+)/i);
    if (l) i = Number.parseInt(l[1], 10);
  }

  if (h.endsWith("roblox.com") && p === "/asset/" && Number.isSafeInteger(i)) {
    return { u: `https://assetdelivery.roblox.com/v1/asset/?id=${i}`, i };
  }

  o.hash = "";
  return {
    u: o.toString(),
    i: Number.isSafeInteger(i) ? i : null
  };
}

function xu(b) {
  const m = new Map();
  const r = /(rbxassetid:\/\/\d+|rbxhttp:\/\/[^\s"'<>\x00]+|https?:\/\/[^\s"'<>\x00]+)/gi;

  const t = xs2(b, 4_000_000);
  if (t) {
    for (const k of t.matchAll(r)) {
      const n = xt(k[0]);
      if (!n) continue;
      if (!m.has(n.u)) m.set(n.u, n);
    }
  }

  if (!m.size) {
    const y = xs3(b, 4_000_000);
    if (y) {
      for (const k of y.matchAll(r)) {
        const n = xt(k[0]);
        if (!n) continue;
        if (!m.has(n.u)) m.set(n.u, n);
      }
    }
  }

  return Array.from(m.values());
}

function xv(b, n, t) {
  const m = xs1(t);
  const o = new Blob([b], { type: m });
  const u = URL.createObjectURL(o);
  const a = document.createElement("a");
  a.href = u;
  a.download = n;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
}

function xw2(v) {
  const y = String(v || "file")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return y || "file";
}

function xx(b) {
  if (!Number.isFinite(b) || b <= 0) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  let v = b;
  let i = 0;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return `${s} ${u[i]}`;
}

function xy(b) {
  const t = xs2(b, 8_000_000);
  if (!t) return null;

  const h = t.slice(0, 600).toLowerCase();
  if (!h.includes("<roblox") && !h.includes("<?xml")) return null;

  let d;
  try {
    d = new DOMParser().parseFromString(t, "application/xml");
  } catch (e) {
    return null;
  }

  if (!d || d.querySelector("parsererror")) return null;

  const r = d.querySelector("roblox > Item") || d.querySelector("Item");
  if (!r) return null;

  let i = 1;

  const p = n => {
    const c = n.getAttribute("class") || "Item";
    const s = n.querySelector(":scope > Properties");
    const q = [];
    let nm = "";

    if (s) {
      for (const z of s.children) {
        const k = z.getAttribute("name") || z.nodeName;

        let v = "";
        if (z.nodeName === "Content") {
          const u = z.querySelector("url, uri");
          v = ((u ? u.textContent : z.textContent) || "").trim();
        } else {
          v = (z.textContent || "").trim();
        }

        v = v.replace(/\s+/g, " ");
        if (!v) continue;

        if (k === "Name") {
          nm = v;
          continue;
        }

        if (v.length > 240) v = `${v.slice(0, 237)}...`;
        q.push({ k, v });
      }
    }

    const ch = [];
    for (const a of n.querySelectorAll(":scope > Item")) {
      ch.push(p(a));
    }

    return {
      id: i++,
      c,
      n: nm || c,
      p: q,
      ch
    };
  };

  const tr = p(r);
  const ex = {};

  const w = n => {
    ex[n.id] = true;
    for (const c of n.ch) w(c);
  };

  w(tr);
  return { t: tr, e: ex };
}

function xybm_lz4(src, uncompLen) {
  if (uncompLen <= 0 || uncompLen > 64 * 1024 * 1024) return null;
  const out = new Uint8Array(uncompLen);
  let si = 0;
  let di = 0;
  while (di < uncompLen) {
    const tk = src[si++];
    let litLen = (tk >> 4) & 0x0f;
    if (litLen === 15) {
      let extra;
      do { extra = src[si++]; litLen += extra; } while (extra === 255);
    }
    for (let j = 0; j < litLen; j++) out[di++] = src[si++];
    if (di >= uncompLen) break;
    const off = src[si] | (src[si + 1] << 8); si += 2;
    let matchLen = (tk & 0x0f) + 4;
    if ((tk & 0x0f) === 15) {
      let extra;
      do { extra = src[si++]; matchLen += extra; } while (extra === 255);
    }
    const ref = di - off;
    for (let j = 0; j < matchLen; j++) out[di + j] = out[ref + j];
    di += matchLen;
  }
  return out;
}

function xybm_deinterleave(data, off, count, stride) {
  const total = count * stride;
  const out = new Uint8Array(total);
  for (let i = 0; i < count; i++) {
    for (let b = 0; b < stride; b++) {
      out[i * stride + b] = data[off + b * count + i];
    }
  }
  return out;
}

function xybm_untransform_i32(v) {
  return (v >>> 1) ^ (-(v & 1));
}

function xybm_read_string(dv, off) {
  if (off + 4 > dv.byteLength) return { v: '', n: 4 };
  const len = dv.getUint32(off, true);
  if (len <= 0 || len > 10 * 1024 * 1024) return { v: '', n: 4 };
  if (off + 4 + len > dv.byteLength) return { v: '', n: 4 };
  const bytes = new Uint8Array(dv.buffer, dv.byteOffset + off + 4, len);
  try {
    return { v: new TextDecoder('utf-8', { fatal: false }).decode(bytes), n: 4 + len };
  } catch (e) {
    return { v: '', n: 4 + len };
  }
}

function xybm(buf) {
  const bytes = new Uint8Array(buf);
  if (bytes.length < 32) return null;
  const magic = [0x3c, 0x72, 0x6f, 0x62, 0x6c, 0x6f, 0x78, 0x21, 0x89, 0xff, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < magic.length; i++) {
    if (bytes[i] !== magic[i]) return null;
  }

  const hdv = new DataView(buf, 0, 32);
  const numTypes = hdv.getInt32(16, true);
  const numInstances = hdv.getInt32(20, true);    if (numTypes < 0 || numInstances < 0) return null;
    if (numTypes > 50000 || numInstances > 500000) return null;

  const classMap = {};
  const instRefs = new Array(numInstances);
  const instClass = new Array(numInstances);
  const instProps = new Array(numInstances);
  const instNames = new Array(numInstances);
  const instChildren = new Array(numInstances);
  const instParent = new Int32Array(numInstances).fill(-1);
  const rootInstances = [];

  for (let i = 0; i < numInstances; i++) {
    instProps[i] = [];
    instNames[i] = '';
    instChildren[i] = [];
  }

  let pos = 32;

  while (pos + 16 <= bytes.length) {
    const chunkName = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
    const cdv = new DataView(buf, pos + 4, 12);
    const compLen = cdv.getUint32(0, true);
    const uncompLen = cdv.getUint32(4, true);
    pos += 16;

    if (chunkName === 'END\0' || chunkName === 'END') break;

    let chunkData;
    if (compLen === 0) {
      chunkData = bytes.slice(pos, pos + uncompLen);
      pos += uncompLen;
    } else {
      const compressed = bytes.subarray(pos, pos + compLen);        try {
          if (compressed[0] === 0x28 && compressed[1] === 0xb5 && compressed[2] === 0x2f && compressed[3] === 0xfd) {
            pos += compLen;
            continue;
          }
          chunkData = xybm_lz4(compressed, uncompLen);
          if (!chunkData) { pos += compLen; continue; }
        } catch (e) {
          pos += compLen;
          continue;
        }
      pos += compLen;
    }

    const chDv = new DataView(chunkData.buffer, chunkData.byteOffset, chunkData.byteLength);

    if (chunkName === 'INST') {
      let off = 0;
      const classId = chDv.getUint32(off, true); off += 4;
      const classNameR = xybm_read_string(chDv, off); off += classNameR.n;
      const className = classNameR.v;
      const objFormat = chunkData[off]; off += 1;
      const instCount = chDv.getUint32(off, true); off += 4;

      const refBytes = xybm_deinterleave(chunkData, off, instCount, 4);
      const refDv = new DataView(refBytes.buffer, refBytes.byteOffset, refBytes.byteLength);
      const referents = [];
      let accumRef = 0;
      for (let i = 0; i < instCount; i++) {
        const raw = refDv.getUint32(i * 4, false);
        accumRef += xybm_untransform_i32(raw);
        referents.push(accumRef);
      }

      classMap[classId] = { name: className, referents, count: instCount };

      for (let i = 0; i < instCount; i++) {
        const ref = referents[i];
        if (ref >= 0 && ref < numInstances) {
          instRefs[ref] = ref;
          instClass[ref] = className;
          instNames[ref] = className;
        }
      }
    }

    if (chunkName === 'PROP') {
      let off = 0;
      const classId = chDv.getUint32(off, true); off += 4;
      const propNameR = xybm_read_string(chDv, off); off += propNameR.n;
      const propName = propNameR.v;
      const typeId = chunkData[off]; off += 1;

      const cls = classMap[classId];
      if (!cls) continue;

      if (typeId === 0x01) {
        for (let i = 0; i < cls.count; i++) {
          const sr = xybm_read_string(chDv, off); off += sr.n;
          const ref = cls.referents[i];
          if (ref >= 0 && ref < numInstances) {
            if (propName === 'Name') {
              instNames[ref] = sr.v;
            }
            if (sr.v && sr.v.length > 0 && sr.v.length <= 240) {
              instProps[ref].push({ k: propName, v: sr.v });
            }
          }
        }
      } else if (typeId === 0x02) {
        for (let i = 0; i < cls.count; i++) {
          const val = chunkData[off]; off += 1;
          const ref = cls.referents[i];
          if (ref >= 0 && ref < numInstances) {
            instProps[ref].push({ k: propName, v: val ? 'true' : 'false' });
          }
        }
      } else if (typeId === 0x03) {
        const ib = xybm_deinterleave(chunkData, off, cls.count, 4);
        const idv = new DataView(ib.buffer, ib.byteOffset, ib.byteLength);
        for (let i = 0; i < cls.count; i++) {
          const raw = idv.getUint32(i * 4, false);
          const val = xybm_untransform_i32(raw);
          const ref = cls.referents[i];
          if (ref >= 0 && ref < numInstances) {
            instProps[ref].push({ k: propName, v: String(val) });
          }
        }
        off += cls.count * 4;
      } else if (typeId === 0x05) {
        for (let i = 0; i < cls.count; i++) {
          const val = chDv.getFloat64(off, true); off += 8;
          const ref = cls.referents[i];
          if (ref >= 0 && ref < numInstances) {
            instProps[ref].push({ k: propName, v: String(val) });
          }
        }
      } else if (typeId === 0x06 || typeId === 0x12 || typeId === 0x13 || typeId === 0x14) {
        for (let i = 0; i < cls.count; i++) {
          const sr = xybm_read_string(chDv, off); off += sr.n;
          const ref = cls.referents[i];
          if (ref >= 0 && ref < numInstances) {
            if (sr.v && sr.v.length > 0 && sr.v.length <= 240) {
              instProps[ref].push({ k: propName, v: sr.v });
            }
          }
        }
      }
    }

    if (chunkName === 'PRNT') {
      let off = 0;
      const version = chunkData[off]; off += 1;
      if (version !== 0) continue;
      const count = chDv.getUint32(off, true); off += 4;

      const childBytes = xybm_deinterleave(chunkData, off, count, 4);
      off += count * 4;
      const parentBytes = xybm_deinterleave(chunkData, off, count, 4);

      const childDv = new DataView(childBytes.buffer, childBytes.byteOffset, childBytes.byteLength);
      const parentDv = new DataView(parentBytes.buffer, parentBytes.byteOffset, parentBytes.byteLength);

      let accumChild = 0;
      let accumParent = 0;

      for (let i = 0; i < count; i++) {
        accumChild += xybm_untransform_i32(childDv.getUint32(i * 4, false));
        accumParent += xybm_untransform_i32(parentDv.getUint32(i * 4, false));

        const childRef = accumChild;
        const parentRef = accumParent;

        if (childRef >= 0 && childRef < numInstances) {
          if (parentRef < 0 || parentRef >= numInstances) {
            rootInstances.push(childRef);
          } else {
            instParent[childRef] = parentRef;
            instChildren[parentRef].push(childRef);
          }
        }
      }
    }
  }

  let nodeId = 1;

  const buildNode = (ref) => {
    const id = nodeId++;
    const c = instClass[ref] || 'Unknown';
    const n = instNames[ref] || c;
    const p = (instProps[ref] || []).filter(pr => xb1.has(String(pr.k || '').toLowerCase()));
    const ch = [];
    for (const cr of instChildren[ref]) {
      ch.push(buildNode(cr));
    }
    return { id, c, n, p, ch };
  };

  if (rootInstances.length === 0) return null;

  let topNode;
  if (rootInstances.length === 1) {
    topNode = buildNode(rootInstances[0]);
  } else {
    const ch = rootInstances.map(r => buildNode(r));
    topNode = { id: nodeId++, c: 'DataModel', n: 'DataModel', p: [], ch };
  }

  const ex = {};
  const walk = (nd) => { ex[nd.id] = true; for (const c of nd.ch) walk(c); };
  walk(topNode);

  return { t: topNode, e: ex };
}

function xz(n, t) {
  if (!t) return true;

  const q = t.toLowerCase();
  if (`${n.n} ${n.c}`.toLowerCase().includes(q)) return true;

  for (const p of n.p) {
    if (`${p.k} ${p.v}`.toLowerCase().includes(q)) return true;
  }

  for (const c of n.ch) {
    if (xz(c, q)) return true;
  }

  return false;
}

function x10(n, i) {
  if (!n) return null;
  if (n.id === i) return n;
  for (const c of n.ch) {
    const r = x10(c, i);
    if (r) return r;
  }
  return null;
}

const xv3 = x10;

function xw3() {
  if (!xs.mm.length) return null;
  if (xs.mi < 0 || xs.mi >= xs.mm.length) return null;
  return xs.mm[xs.mi];
}

function xx3() {
  if (!xs.ms) return;

  xs.ms.replaceChildren();

  if (!xs.mm.length) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = "No payload";
    xs.ms.appendChild(o);
    xs.ms.disabled = true;
    return;
  }

  xs.ms.disabled = false;

  xs.mm.forEach((m, i) => {
    const o = document.createElement("option");
    o.value = String(i);

    const x = String(m.x || "bin").toUpperCase();
    const p = m.an ? `${m.an} - ${m.l}` : m.l;
    o.textContent = `${p} (${x}, ${xx(m.b.byteLength)})`;

    if (i === xs.mi) o.selected = true;
    xs.ms.appendChild(o);
  });
}

function xy3() {
  if (!xs.lv) return;

  xs.lv.replaceChildren();

  const m = xw3();
  if (!m) {
    const e = document.createElement("div");
    e.className = "em";
    e.textContent = "Open Explorer to load payloads.";
    xs.lv.appendChild(e);
    return;
  }

  if (!m.tr) {
    const e = document.createElement("div");
    e.className = "em";
    e.textContent = "Tree view unavailable for this payload format.";
    xs.lv.appendChild(e);
    return;
  }

  if (!Number.isSafeInteger(xs.sid)) {
    xs.sid = m.tr.t.id;
  }

  const f = document.createDocumentFragment();
  let cnt = 0;
  const t = (xs.ft || "").trim().toLowerCase();

  const renderNode = (n, d) => {
    if (!xz(n, t)) return;

    cnt += 1;

    const it = document.createElement("div");
    it.className = `it${xs.sid === n.id ? " se" : ""}`;
    it.dataset.id = String(n.id);
    it.style.paddingLeft = `${d * 14}px`;

    const tw = document.createElement("button");
    tw.type = "button";
    tw.className = "tw";

    if (n.ch.length) {
      tw.textContent = m.ex[n.id] === false ? "\u25b8" : "\u25be";
    } else {
      tw.textContent = "\u00b7";
      tw.disabled = true;
      tw.classList.add("nd");
    }

    const ic = document.createElement("span");
    ic.className = "ic";
    ic.textContent = n.c;

    const nm = document.createElement("span");
    nm.className = "nm";
    nm.textContent = n.n;

    it.appendChild(tw);
    it.appendChild(ic);
    it.appendChild(nm);
    f.appendChild(it);

    if (n.ch.length && m.ex[n.id] !== false) {
      for (const z2 of n.ch) renderNode(z2, d + 1);
    }
  };

  renderNode(m.tr.t, 0);

  if (!cnt) {
    const e = document.createElement("div");
    e.className = "em";
    e.textContent = "No nodes matched the filter.";
    xs.lv.appendChild(e);
  } else {
    xs.lv.appendChild(f);
  }
}

function x11(k) {
  return xb1.has(String(k || "").toLowerCase());
}

function xz3() {
  if (!xs.pv) return;

  xs.pv.replaceChildren();

  const m = xw3();
  if (!m) {
    const e = document.createElement("div");
    e.className = "em";
    e.textContent = "Select a node to inspect.";
    xs.pv.appendChild(e);
    return;
  }

  if (!m.tr) {
    const e = document.createElement("div");
    e.className = "em";
    e.textContent = "Properties unavailable for this format.";
    xs.pv.appendChild(e);
    return;
  }

  const n = x10(m.tr.t, Number.isSafeInteger(xs.sid) ? xs.sid : m.tr.t.id) || m.tr.t;

  const h = document.createElement("div");
  h.className = "pxe-prop-name";
  h.textContent = n.n;
  xs.pv.appendChild(h);

  const sv = document.createElement("div");
  sv.className = "pxe-prop-class";
  sv.textContent = n.c;
  xs.pv.appendChild(sv);

  const div = document.createElement("div");
  div.className = "pxe-divider";
  xs.pv.appendChild(div);

  const mk = (k, v, r) => {
    const row = document.createElement("div");
    row.className = "prr";

    const a = document.createElement("span");
    a.textContent = k;

    const bv = document.createElement("strong");
    bv.textContent = v;

    row.appendChild(a);
    row.appendChild(bv);

    if (r && typeof r.u === "string") {
      const dl = document.createElement("button");
      dl.type = "button";
      dl.className = "pxe-dl-inline";
      dl.innerHTML = xi2;
      dl.title = "Download";
      dl.setAttribute("aria-label", "Download linked asset");
      dl.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        x13(r, `${n.n}-${k}`).catch(() => {});
      });
      row.appendChild(dl);
    }

    xs.pv.appendChild(row);
  };

  mk("Payload:", `${m.l} (.${m.x})`);
  mk("Size:", xx(m.b.byteLength));

  for (const prop of n.p) {
    if (!x11(prop.k)) continue;
    mk(prop.k, prop.v, xt(prop.v));
  }
}

async function x12(i, n0, t0, p0) {
  const va = xn(t0);
  const out = [];
  const er = [];

  for (const v of va) {
    try {
      const rr = await xp(i, v.f);
      const b = await xq(rr.u);
      const x = xr(b, "rbxm");

      let tr = (() => { try { return xy(b) || xybm(b); } catch (e) { return null; } })();
      if (!tr) {
        tr = {
          t: { id: 1, c: x.toUpperCase(), n: n0, p: [
            { k: 'Format', v: x },
            { k: 'Size', v: xx(b.byteLength) }
          ], ch: [] },
          e: { 1: true }
        };
      }

      out.push({
        l: v.l,
        f: v.f,
        u: rr.u,
        a: rr.a,
        b,
        x,
        tr,
        rf: xu(b),
        ex: {},
        ai: i,
        an: n0,
        at: t0,
        pp: p0 || ""
      });
    } catch (e) {
      er.push(`${v.l}: ${e.message || String(e)}`);
    }
  }

  if (!out.length) {
    throw new Error(er.join(" | ") || "No payload variants resolved");
  }

  for (const m of out) {
    if (m.tr && m.tr.e) {
      m.ex = { ...m.tr.e };
    }

    if (m.pp) {
      m.l = `${m.pp} - ${m.l}`;
    }
  }

  return out;
}

async function x13(r, h) {
  if (!r || !r.u) return;

  const b = await xq(r.u);
  const e = xr(b, "bin");
  const n = xw2(h || (Number.isSafeInteger(r.i) ? `asset-${r.i}` : `asset-${Date.now()}`));
  xv(b, `${n}.${e}`, e);
}

async function x16(m) {
  if (!m || !m.b) return;

  xf(false);
  try {
    const n = xw2(`${m.an || xs.t || "asset"}-${m.l || "payload"}`);
    xv(m.b, `${n}.${m.x}`, m.x);

    const su = new Set();
    for (const r of (m.rf || [])) {
      if (!r || !r.u || su.has(r.u)) continue;
      su.add(r.u);
      await x13(r, `${m.an || xs.t || "asset"}-${r.i || su.size}`);
    }
  } finally {
    xf(true);
  }
}

async function x17() {
  if (!xs.mm.length) return;

  xf(false);
  try {
    const su = new Set();
    for (const m of xs.mm) {
      const n = xw2(`${m.an || xs.t || "asset"}-${m.l || "payload"}`);
      xv(m.b, `${n}.${m.x}`, m.x);

      for (const r of (m.rf || [])) {
        if (!r || !r.u || su.has(r.u)) continue;
        su.add(r.u);
        await x13(r, `${m.an || xs.t || "asset"}-${r.i || su.size}`);
      }
    }
  } finally {
    xf(true);
  }
}

async function xw(f) {
  const rt = xa();
  if (!rt) {
    xz4();
    return;
  }

  xi();
  xd();

  xs.w = true;
  xf(false);

  try {
    xs.i = rt;
    xs.a.textContent = rt.k === "bundle" ? `Bundle ${rt.i}` : String(rt.i);
    xs.n.textContent = "Loading\u2026";

    if (f || !xs.mm.length) {
      xs.mm = [];
      xs.mi = 0;
      xs.sid = null;
      xs.ft = "";
      if (xs.fi) xs.fi.value = "";
      xx3();
      xy3();
      xz3();
    }

    if (rt.k === "asset") {
      xe("Loading item metadata...", "warn");
      const d = await xl(rt.i);
      xs.t = d.n;
      xs.n.textContent = d.n;

      xe("Resolving payloads...", "warn");
      const mm = await x12(rt.i, d.n, d.t, "");

      xs.mm = mm;
    } else {
      xe("Loading bundle details...", "warn");
      const b = await xm(rt.i);
      xs.t = b.n;
      xs.n.textContent = b.n;

      const mm = [];

      for (let i = 0; i < b.a.length; i++) {
        const a = b.a[i];
        xe(`Loading bundle asset ${i + 1}/${b.a.length}...`, "warn");

        try {
          const d = await xl(a.i);
          const pv = await x12(a.i, d.n, d.t, a.n || d.n);
          mm.push(...pv);
        } catch (e) {
        }
      }

      if (!mm.length) {
        throw new Error("No explorable assets resolved from this bundle");
      }

      xs.mm = mm;
    }

    let prefI = -1;
    if (rt.k === "asset") {
      const at = Number((xs.mm[0] && xs.mm[0].at) || 0);
      if (xa1.has(at)) {
        prefI = xs.mm.findIndex(m => /specialmesh/i.test(String(m.l || "")));
      }
    }
    if (prefI < 0) prefI = xs.mm.findIndex(m => /meshpart/i.test(String(m.l || "")));
    if (prefI < 0) prefI = 0;
    xs.mi = prefI;

    const cm = xw3();
    xs.sid = cm && cm.tr ? cm.tr.t.id : null;

    xx3();
    xy3();
    xz3();
  } catch (e) {
    xs.mm = [];
    xs.mi = 0;
    xs.sid = null;

    xx3();
    xy3();
    xz3();

    xe(`Failed: ${e.message || String(e)}`, "error");
  } finally {
    xs.w = false;
    xf(true);
  }
}

let xMoRetries = 0;
const XMO_MAX = 60;

function xMoTick() {
  if (!xs.e) return;

  const rt = xa();
  if (!rt) {
    if (xs.o) xk3();
    return;
  }

  xi();

  if (xs.o && !xs.o.classList.contains("pxe-fb")) {
    xMoStop();
    return;
  }

  xMoRetries += 1;
  if (xMoRetries >= XMO_MAX) {
    xMoStop();
  }
}

function xMoStop() {
  if (xs.mo) {
    xs.mo.disconnect();
    xs.mo = null;
  }
}

function xMoStart() {
  if (xs.mo) return;

  xMoRetries = 0;

  xs.mo = new MutationObserver(() => {
    xMoTick();
  });

  xs.mo.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  xMoTick();
}

function x18() {
  const rt = xa();

  if (!xs.e || !rt) {
    xk3();
    xMoStop();
    return;
  }

  xMoStop();
  xMoStart();

  if (xs.v) {
    xj();

    const k = `${rt.k}:${rt.i}`;
    const lk = xs.i ? `${xs.i.k}:${xs.i.i}` : "";
    if (k !== lk) {
      xw(false).catch(() => {});
    }
  }
}

function x19() {
  if (xs.c) return;

  xs.c = window.setInterval(() => {
    if (location.href !== xs.h) {
      xs.h = location.href;
      x18();
      return;
    }

    if (!xs.e) return;

    const rt = xa();
    if (!rt) {
      if (xs.o) xk3();
      return;
    }

    xi();
    if (xs.v) xj();
  }, 700);
}

function x20() {
  if (xs.c) {
    clearInterval(xs.c);
    xs.c = null;
  }

  xMoStop();

  if (xs.oc) {
    document.removeEventListener("mousedown", xs.oc, true);
    xs.oc = null;
  }

  if (xs.kc) {
    document.removeEventListener("keydown", xs.kc, true);
    xs.kc = null;
  }

  xk3();
}

async function x21() {
  xs.e = await xb();
  if (!xs.e) {
    x20();
    return;
  }

  x18();
  x19();
}

function x22() {
  try {
    chrome.storage.onChanged.addListener((c, a) => {
      if (a !== "sync") return;
      if (!Object.prototype.hasOwnProperty.call(c, xk)) return;
      x21().catch(() => {});
    });
  } catch (e) {
  }
}

function xq3_ov() {
  const e = document.getElementById('pxe-ov');
  if (!e) return;
  const d = document.documentElement.classList.contains('dark-theme') || (document.body && document.body.classList.contains('dark-theme')) || (document.body && !document.body.classList.contains('light-theme') && !document.documentElement.classList.contains('light-theme'));
  e.style.background = d ? 'rgba(8,10,16,.26)' : 'rgba(200,200,210,.4)';
}
function xr3_obs() {
  xq3_ov();
  const o = new MutationObserver(() => { xq3_ov(); });
  o.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if (document.body) o.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
function x23() {
  x22();
  xr3_obs();
  x21().catch(() => {});
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", x23, { once: true });
} else {
  x23();
}
})();