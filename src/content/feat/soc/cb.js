/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
  if (window.__purpuraContributorBadgeLoaded) return;
  window.__purpuraContributorBadgeLoaded = true;

  var CONTRIBUTOR_URL = chrome.runtime.getURL('images/pBadges/purpura_contributor_badge.svg');
  var TESTER_URL = chrome.runtime.getURL('images/pBadges/purpura_tester_badge.svg');
  var CONTRIBUTORS_URL = chrome.runtime.getURL('data/contributors.json');
  var TESTERS_URL = chrome.runtime.getURL('data/testers.json');

  var BADGE_CFG = {
    contributor: { url: CONTRIBUTOR_URL, text: 'Purpura Contributor', color: '#A855F7', border: 'rgba(168,85,247,0.35)', bg: '#1a1b1f' },
    tester: { url: TESTER_URL, text: 'Purpura Tester', color: '#3FC7E8', border: 'rgba(14,165,196,0.35)', bg: '#111a1f' }
  };

  var BADGE_CLASS = 'purpura-contributor-badge';
  var TESTER_CLASS = 'purpura-tester-badge';
  var WRAP_ATTR = 'data-purpura-badges';
  var BADGE_ATTR = 'data-purpura-cb';
  var USER_ATTR = 'data-purpura-cb-user';
  var NAME_SELECTOR = '#profile-header-title-container-name';
  var OBSERVED_ATTR = 'data-purpura-cb-observed';
  var STYLE_ID = 'purpura-cb-style';
  var SHINE_STYLE_ID = 'purpura-cb-shine-style';
  var TOOLTIP_CLASS = 'purpura-cb-tooltip';

  var contributorIds = null;
  var testerIds = null;
  var cPromise = null;
  var tPromise = null;
  var confettiLocked = false;

  function loadContributors() {
    if (contributorIds) return Promise.resolve(contributorIds);
    if (cPromise) return cPromise;
    cPromise = fetch(CONTRIBUTORS_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (arr) {
        var set = new Set();
        (Array.isArray(arr) ? arr : []).forEach(function (v) { var s = String(v).trim(); if (s) set.add(s); });
        contributorIds = set;
        return set;
      })
      .catch(function () { contributorIds = new Set(); return contributorIds; });
    return cPromise;
  }

  function loadTesters() {
    if (testerIds) return Promise.resolve(testerIds);
    if (tPromise) return tPromise;
    tPromise = fetch(TESTERS_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (arr) {
        var set = new Set();
        (Array.isArray(arr) ? arr : []).forEach(function (v) { var s = String(v).trim(); if (s) set.add(s); });
        testerIds = set;
        return set;
      })
      .catch(function () { testerIds = new Set(); return testerIds; });
    return tPromise;
  }

  function loadAll() {
    return Promise.all([loadContributors(), loadTesters()]);
  }

  function getUserIdFromUrl(url) {
    try {
      var u = url || window.location.href;
      var m = u.match(/\/users\/(\d+)(?:\/|$|\?|#)/i);
      return m ? m[1] : null;
    } catch (_) { return null; }
  }

  function getNeededTypes(uid) {
    var out = [];
    if (contributorIds && contributorIds.has(String(uid))) out.push('contributor');
    if (testerIds && testerIds.has(String(uid))) out.push('tester');
    return out;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    // Per-badge masks in stylesheet so the mask image starts loading before
    // any badge is injected -- avoids a 1-frame unmasked shine flash.
    var contribMask = 'url(\"' + CONTRIBUTOR_URL.replace(/\"/g, '\\\"') + '\") center/contain no-repeat';
    var testerMask = 'url(\"' + TESTER_URL.replace(/\"/g, '\\\"') + '\") center/contain no-repeat';
    s.textContent = [
      '.' + BADGE_CLASS + '{position:relative;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;cursor:pointer;flex-shrink:0;}',
      '.' + TESTER_CLASS + '{position:relative;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;cursor:pointer;flex-shrink:0;}',
      '.' + BADGE_CLASS + '-icon,.' + TESTER_CLASS + '-icon{width:33px;height:33px;display:block;object-fit:contain;pointer-events:none;}',
      '.' + BADGE_CLASS + '-wrap,.' + TESTER_CLASS + '-wrap{position:relative;display:inline-flex;align-items:center;overflow:visible;}',
      '.purpura-badges{display:inline-flex;align-items:center;gap:16px;margin-left:8px;vertical-align:middle;}',
      '.purpura-cb-shine{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2;}',
      '.' + BADGE_CLASS + ' .purpura-cb-shine{-webkit-mask:' + contribMask + ';mask:' + contribMask + ';}',
      '.' + TESTER_CLASS + ' .purpura-cb-shine{-webkit-mask:' + testerMask + ';mask:' + testerMask + ';}',
      '.purpura-cb-shine-bar{position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,0.85),transparent);transform:skewX(-25deg);animation:purpura-cb-shine 5s infinite;}',
      '.' + TESTER_CLASS + ' .purpura-cb-shine-bar{animation-delay:-2.5s;}',
      '.' + TOOLTIP_CLASS + '{position:fixed;z-index:99999;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;line-height:1.2;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;box-shadow:0 8px 24px rgba(0,0,0,0.4);transform:translateX(-50%);}',
      '.' + TOOLTIP_CLASS + '.visible{opacity:1;}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureShineKeyframes() {
    if (document.getElementById(SHINE_STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = SHINE_STYLE_ID;
    s.textContent = [
      '@keyframes purpura-cb-shine{0%{left:-100%}40%{left:200%}100%{left:200%}}',
      '@keyframes purpura-cb-sparkle{0%,100%{opacity:0;transform:scale(0.35) rotate(45deg)}35%{opacity:1;transform:scale(1) rotate(45deg)}65%{opacity:0.85;transform:scale(0.8) rotate(45deg)}}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function randomizeSparkle(sparkle, avoidEdge) {
    sparkle.style.top = '';
    sparkle.style.right = '';
    sparkle.style.bottom = '';
    sparkle.style.left = '';
    var sideOffset = Math.round(Math.random() * 64 + 18) + '%';
    var horiz = Math.round(Math.random() * 76 + 12) + '%';
    var sideEdge = (Math.round(Math.random() * 4) - 7) + 'px';
    var vertEdge = (Math.round(Math.random() * 4) - 3) + 'px';
    var pick = Math.floor(Math.random() * 4);
    // When stacked, fully exclude the gap-facing side so halos never crowd the middle.
    if (avoidEdge === 'right' && pick === 1) pick = [0, 2, 3][Math.floor(Math.random() * 3)];
    if (avoidEdge === 'left' && pick === 3) pick = [0, 1, 2][Math.floor(Math.random() * 3)];
    switch (pick) {
      case 0: sparkle.style.top = vertEdge; sparkle.style.left = horiz; break;
      case 1: sparkle.style.right = sideEdge; sparkle.style.top = sideOffset; break;
      case 2: sparkle.style.bottom = vertEdge; sparkle.style.left = horiz; break;
      default: sparkle.style.left = sideEdge; sparkle.style.top = sideOffset; break;
    }
  }

  function addSparkles(wrap, color, delayOffset, avoidEdge) {
    ensureShineKeyframes();
    delayOffset = delayOffset || 0;
    [
      { size: '4px', delay: 0 },
      { size: '3px', delay: 0.55 },
      { size: '3px', delay: 1.1 },
      { size: '4px', delay: 1.65 },
    ].forEach(function (cfg) {
      var sp = document.createElement('span');
      sp.style.position = 'absolute';
      sp.style.width = cfg.size;
      sp.style.height = cfg.size;
      sp.style.background = 'currentColor';
      sp.style.border = '1px solid color-mix(in srgb, currentColor 55%, white)';
      sp.style.boxShadow = '0 0 5px currentColor';
      sp.style.pointerEvents = 'none';
      sp.style.zIndex = '3';
      var phase = (cfg.delay + delayOffset) % 2.2;
      // Negative delay starts the sparkle mid-cycle so neither badge
      // has a 0.5-1s blank window on first paint; all 8 particles are
      // already distributed around the 2.2s cycle at mount.
      sp.style.animation = 'purpura-cb-sparkle 2.2s ease-in-out 0s infinite';
      sp.style.animationDelay = '-' + phase.toFixed(2) + 's';
      wrap.style.color = color;
      randomizeSparkle(sp, avoidEdge);
      sp.addEventListener('animationiteration', function () { randomizeSparkle(sp, avoidEdge); });
      wrap.appendChild(sp);
    });
  }

  function confetti(target, url) {
    if (confettiLocked) return;
    confettiLocked = true;
    setTimeout(function () { confettiLocked = false; }, 1800);
    try {
      var rect = target.getBoundingClientRect();
      var c = document.createElement('div');
      Object.assign(c.style, {
        position: 'fixed',
        left: (rect.left + rect.width / 2) + 'px',
        top: (rect.top + rect.height / 2) + 'px',
        width: '1px',
        height: '1px',
        zIndex: '10000',
        pointerEvents: 'none',
      });
      document.body.appendChild(c);
      for (var i = 0; i < 36; i++) {
        var p = document.createElement('img');
        p.src = url;
        Object.assign(p.style, { position: 'absolute', width: '14px', height: '14px', opacity: '0' });
        var ang = Math.random() * 2 * Math.PI;
        var dist = Math.random() * 90 + 40;
        var dur = Math.random() * 1200 + 900;
        p.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + (Math.cos(ang) * dist) + 'px), calc(-50% + ' + (Math.sin(ang) * dist) + 'px)) rotate(720deg)', opacity: 0 },
        ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
        c.appendChild(p);
      }
      setTimeout(function () { c.parentNode && c.parentNode.removeChild(c); }, 3000);
    } catch (_) {}
  }

  var tooltipEl = null;
  var tooltipTimer = null;

  function showTooltip(anchor, text, border, bg) {
    ensureStyle();
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = TOOLTIP_CLASS;
      document.body.appendChild(tooltipEl);
    }
    tooltipEl.textContent = text;
    tooltipEl.style.background = bg;
    tooltipEl.style.color = '#e8e0ff';
    tooltipEl.style.border = '1px solid ' + border;
    var r = anchor.getBoundingClientRect();
    tooltipEl.style.left = (r.left + r.width / 2) + 'px';
    tooltipEl.style.top = (r.top - 8) + 'px';
    tooltipEl.style.transform = 'translate(-50%, -100%)';
    requestAnimationFrame(function () { tooltipEl.classList.add('visible'); });
  }

  function hideTooltip() {
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    if (tooltipEl) tooltipEl.classList.remove('visible');
  }

  function attachTooltip(badgeWrap, cfg) {
    badgeWrap.addEventListener('mouseenter', function () {
      if (tooltipTimer) clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(function () { showTooltip(badgeWrap, cfg.text, cfg.border, cfg.bg); }, 120);
    });
    badgeWrap.addEventListener('mouseleave', hideTooltip);
    badgeWrap.addEventListener('click', hideTooltip);
  }

  function createBadgeElement(type, isStacked) {
    var cfg = BADGE_CFG[type];
    ensureStyle();
    ensureShineKeyframes();
    var isTester = type === 'tester';
    var wrapClass = isTester ? TESTER_CLASS : BADGE_CLASS;
    var wrap = document.createElement('span');
    wrap.className = wrapClass + '-wrap';
    wrap.setAttribute(BADGE_ATTR, type);

    var badge = document.createElement('img');
    badge.className = wrapClass + '-icon';
    badge.src = cfg.url;
    badge.alt = cfg.text;
    badge.setAttribute('aria-label', cfg.text);
    badge.draggable = false;
    wrap.appendChild(badge);

    var shine = document.createElement('span');
    shine.className = 'purpura-cb-shine';
    shine.setAttribute('aria-hidden', 'true');
    // Mask is set via stylesheet class (BADGE_CLASS/TESTER_CLASS .purpura-cb-shine)
    // so the browser pre-resolves the image -- no per-element style thrash.
    var bar = document.createElement('span');
    bar.className = 'purpura-cb-shine-bar';
    shine.appendChild(bar);
    wrap.appendChild(shine);

    // 0.275s = half the 0.55s intra-badge spacing -> 8 even phases. isStacked
    // widens to 16px gap (stylesheet) and each halo excludes its gap side.
    var avoid = !isStacked ? null : (isTester ? 'left' : 'right');
    addSparkles(wrap, cfg.color, isTester ? 0.275 : 0, avoid);
    attachTooltip(wrap, cfg);
    badge.addEventListener('click', function (e) { e.stopPropagation(); confetti(badge, cfg.url); });
    wrap.addEventListener('click', function (e) { if (e.target === wrap) { e.stopPropagation(); confetti(badge, cfg.url); } });

    wrap.classList.add(isTester ? TESTER_CLASS : BADGE_CLASS);
    return wrap;
  }

  function injectForContainer(nameEl, needed) {
    if (!nameEl || !nameEl.parentElement) return false;
    var parent = nameEl.parentElement;
    var existing = parent.querySelector('[' + WRAP_ATTR + ']');
    var existingTypes = existing ? Array.from(existing.querySelectorAll('[' + BADGE_ATTR + ']')).map(function (el) { return el.getAttribute(BADGE_ATTR); }).sort().join(',') : '';
    var neededKey = needed.slice().sort().join(',');
    if (existing && existingTypes === neededKey) return true;
    if (existing) existing.remove();
    // Also remove any orphan single badges (legacy from previous build)
    parent.querySelectorAll('[' + BADGE_ATTR + ']').forEach(function (el) { if (!el.closest('[' + WRAP_ATTR + ']')) el.remove(); });
    var container = document.createElement('span');
    container.className = 'purpura-badges';
    container.setAttribute(WRAP_ATTR, '1');
    var isStacked = needed.length > 1;
    needed.forEach(function (t) { container.appendChild(createBadgeElement(t, isStacked)); });
    nameEl.after(container);
    parent.setAttribute(USER_ATTR, getUserIdFromUrl() || '');
    return true;
  }

  async function tryInject() {
    await loadAll();
    var uid = getUserIdFromUrl();
    var needed = uid ? getNeededTypes(uid) : [];
    if (!needed.length) {
      document.querySelectorAll('[' + WRAP_ATTR + ']').forEach(function (el) { el.remove(); });
      // legacy singletons
      document.querySelectorAll('[' + BADGE_ATTR + ']').forEach(function (el) { el.remove(); });
      document.querySelectorAll('[' + OBSERVED_ATTR + ']').forEach(function (el) {
        el.removeAttribute(OBSERVED_ATTR);
        el.removeAttribute(USER_ATTR);
      });
      return;
    }
    var nameEl = document.querySelector(NAME_SELECTOR);
    if (!nameEl) return;
    var parent = nameEl.parentElement;
    if (!parent) return;
    var observed = parent.getAttribute(OBSERVED_ATTR) === '1';
    var lastUser = parent.getAttribute(USER_ATTR) || '';
    var hasWrap = !!parent.querySelector('[' + WRAP_ATTR + ']');
    if (observed && lastUser === String(uid) && hasWrap) {
      // Verify the wrap still holds the correct types, else re-inject
      var existingTypes = Array.from(parent.querySelector('[' + WRAP_ATTR + ']').querySelectorAll('[' + BADGE_ATTR + ']')).map(function (el) { return el.getAttribute(BADGE_ATTR); }).sort().join(',');
      if (existingTypes === needed.slice().sort().join(',')) return;
    }
    injectForContainer(nameEl, needed);
    parent.setAttribute(OBSERVED_ATTR, '1');
    parent.setAttribute(USER_ATTR, String(uid));
  }

  var mo = null;
  var debounce = null;

  function schedule() {
    if (debounce) return;
    debounce = setTimeout(function () { debounce = null; tryInject(); }, 120);
  }

  function start() {
    if (mo) return;
    mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    var lastHref = location.href;
    setInterval(function () {
      if (location.href !== lastHref) { lastHref = location.href; schedule(); }
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { start(); tryInject(); }, { once: true });
  } else {
    start();
    tryInject();
  }
  loadAll().then(function () { schedule(); });
})();
