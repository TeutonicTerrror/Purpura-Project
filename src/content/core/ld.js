/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    var smScript = document.createElement('script');
    smScript.src = chrome.runtime.getURL('content/core/ssi.js');
    document.documentElement.appendChild(smScript);
    smScript.onload = function() { smScript.remove(); };
})();

chrome.storage.local.get('stm', function(r) {
    var enabled = !!(r && r.stm === true);
    try {
        sessionStorage.setItem('purpura_streamermode', String(enabled));
    } catch(e) {}
    document.dispatchEvent(new CustomEvent('purpura-streamer-mode', { detail: enabled }));
});

if (!window.purpuraLoadedLogged) {
    window.purpuraLoadedLogged = true;
    
    async function gatherDebugData() {
        const [localData, syncData] = await Promise.all([
            new Promise(resolve => chrome.storage.local.get(null, resolve)),
            new Promise(resolve => chrome.storage.sync.get(null, resolve))
        ]);
        
        const featureConfig = {
            'Bot Detector': syncData['bd']?.enabled ?? true,
            '  └ Database': syncData['bd']?.showDatabase ?? true,
            '  └ Round Numbers': syncData['bd']?.roundToWholeNumbers ?? true,
            'Server Info': syncData['si']?.enabled ?? true,
            'Pinned Games': syncData['pg'] ?? false,
            'Game Launcher Widget': syncData['glw'] ?? false,
            'Game Outfits': syncData['go']?.enabled ?? true,
            'Game Reviews': syncData['grev'] ?? true,
            'Share Server Links': syncData['ssl'] ?? true,
            'Unsafe Trade Protection': syncData['otp']?.enabled ?? false,
            '  └ Threshold': syncData['otp']?.threshold ?? '50',
            'Projected Trade Value Warnings': syncData['pwi'] ?? true,
            'Live Counters': syncData['lc']?.enabled ?? true,
            '  └ Likes / Dislikes / Favorites': syncData['lc']?.likeDislike ?? true,
            '  └ Players': syncData['lc']?.players ?? true,
            '  └ Visits': syncData['lc']?.visits ?? true,
            "Purpura's Selection": syncData['ps'] ?? true,
            'Quick Play': syncData['qp'] ?? true,
            'Reworked Sidebar': localData['sdbr']?.enabled ?? false,
            '  └ Trade Button': localData['sdbr']?.tradeButton ?? false,
            'Better Continue': localData['bc'] ?? false,
            'Page Binds': syncData['pb'] ? 'Configured' : 'None',
            'Home Page Tweaks': localData['hpt']?.enabled ?? false,
            'Uncorporatify': localData['unc'] ?? false,
            'Purpura Cursors': localData['pcr']?.enabled ?? false,
            '  └ Trail Effects': localData['pcr']?.trailEffects ?? true,
            'Purpura Tabs': localData['pt']?.enabled ?? false,
            'Theme Editor': localData['rothemerActive'] ?? false,
            'Free Roblox Plus Themes': syncData['frpt'] ?? false,
            'Bloatware Remover': localData['bwr']?.enabled ?? false,
            'Greetings': localData['gr'] ?? true,
            'Friends Manager': syncData['fm'] ?? false,
            'No Rent': syncData['nr'] ?? true,
            'Robux Conversations': syncData['rconv'] ?? true,
            'Bundle Item Viewer': syncData['biv'] ?? true,
            'Item Explorer': syncData['explr'] ?? true,
            'Ghost Profiles': localData['ghos']?.enabled ?? true,
            'Last Online': syncData['lo'] ?? true,
            'Avatar Search': syncData['as'] ?? true,
            'Infinite Avatar': syncData['ia'] ?? false,
            'Redesigned Avatar Editor': syncData['rae']?.enabled ?? false,
            'Streamer Mode': localData['stm'] ?? false,
            'Status Spoofer': syncData['spc']?.enabled ?? false,
            'Unpending Robux': syncData['up'] ?? false,
            'Save Lots Robux': syncData['slr']?.enabled ?? false,
            'Remaining Robux': syncData['rr'] ?? true,
            'Roblox Age Theme': localData['rat']?.enabled ?? false,
            'Hide Download Button': localData['hdb'] ?? true,
            'Legacy Theme Switcher': localData['lts'] ?? false,
            'Quick Status Switcher': syncData['qs'] ?? false,
            'Login Security Banner': localData['lb'] ?? false,
            'Sticky Avatar Preview': localData['sap'] ?? false,
        };
        
        const browserInfo = {
            'User ID': localData['robloxUserId'] || 'Not detected',
            'User Agent': navigator.userAgent,
            'Platform': navigator.platform,
            'Language': navigator.language,
            'Cookies': navigator.cookieEnabled ? 'Enabled' : 'Disabled',
            'Online': navigator.onLine ? 'Yes' : 'No',
            'Viewport': `${window.innerWidth}x${window.innerHeight}`
        };
        
        return { featureConfig, browserInfo };
    }
    
    document.addEventListener('purpura-copy-debug-request', async () => {
        try {
            const { featureConfig, browserInfo } = await gatherDebugData();
            
            const formatSection = (title, data) => {
                let text = `${title}\n${'─'.repeat(30)}\n`;
                for (const [key, value] of Object.entries(data)) {
                    text += `${key}: ${value}\n`;
                }
                return text;
            };
            
            const debugText = [
                '═══════════════════════════════════',
                '       PURPURA DEBUG INFO',
                '═══════════════════════════════════',
                '',
                formatSection('🔧 Feature Configuration', featureConfig),
                formatSection('🌐 Browser Info', browserInfo),
            ].join('\n');
            
            document.dispatchEvent(new CustomEvent('purpura-copy-debug-response', { detail: { debugText } }));
        } catch (error) {
            document.dispatchEvent(new CustomEvent('purpura-copy-debug-response', { detail: { error: true } }));
        }
    });
    
    const pageScript = document.createElement('script');
    pageScript.src = chrome.runtime.getURL('content/core/ppa.js');
    (document.head || document.documentElement).appendChild(pageScript);
    pageScript.onload = () => pageScript.remove();
    
    (async function logPurpuraDebugInfo() {
        try {
            const { featureConfig, browserInfo } = await gatherDebugData();
            console.groupCollapsed(
                "%cPurpura Extension Loaded",
                "color: #b388ff; font-weight: bold; font-size: 16px; background: #2e003e; padding: 6px 12px; border-radius: 8px;"
            );
            console.group("%c🔧 Feature Configuration", "color: #4caf50; font-weight: bold; font-size: 14px;");
            console.table(featureConfig);
            console.groupEnd();
            console.group("%c🌐 Browser Info", "color: #2196f3; font-weight: bold; font-size: 14px;");
            console.table(browserInfo);
            console.groupEnd();
            console.groupEnd();

        } catch (error) {
        }
    })();

    async function runStorageMigration() {
        if (!globalThis.PurpuraStorageMigrate || typeof globalThis.PurpuraStorageMigrate.migrateStorageKeys !== 'function') {
            return { migrated: 0, success: false, error: 'migration_unavailable' };
        }
        return globalThis.PurpuraStorageMigrate.migrateStorageKeys();
    }

    runStorageMigration().catch(() => {});

    document.addEventListener('purpura-migrate-keys', async () => {
        try {
            const result = await runStorageMigration();
            document.dispatchEvent(new CustomEvent('purpura-migrate-keys-response', { detail: result }));
        } catch (e) {
            document.dispatchEvent(new CustomEvent('purpura-migrate-keys-response', {
                detail: { error: e.message, success: false, migrated: 0 }
            }));
        }
    });

} 

(function() {
    var _x1 = 'purpura-kofi-abc';
    var _x2 = 'https://ko-fi.com/teutonic';
    var _x3 = 'https://storage.ko-fi.com/cdn/cup-border.png';

    function _fn1() {
        var r = document.documentElement;
        if (r.classList.contains('dark-theme') || r.getAttribute('data-theme') === 'dark') return 'dark';
        if (r.classList.contains('light-theme') || r.getAttribute('data-theme') === 'light') return 'light';
        if (document.body) {
            if (document.body.classList.contains('dark-theme') || document.body.classList.contains('theme-dark')) return 'dark';
            if (document.body.classList.contains('light-theme') || document.body.classList.contains('theme-light')) return 'light';
        }
        return 'dark';
    }

    var _t = {
        dark: { a: 'linear-gradient(135deg,#1a1a2e 0%,#2d1b3d 50%,#1a1a2e 100%)', b: 'linear-gradient(135deg,#2d1b3d 0%,#3d2950 50%,#2d1b3d 100%)', c: 'rgba(179,136,255,0.2)', d: 'rgba(179,136,255,0.4)', e: '#f0e6ff', f: '#ffffff', g: '0 1px 3px rgba(0,0,0,0.3)', h: '0 2px 8px rgba(179,136,255,0.15)', i: 'rgba(179,136,255,0.08)' },
        light: { a: 'linear-gradient(135deg,#f5f0ff 0%,#ede4f7 50%,#f5f0ff 100%)', b: 'linear-gradient(135deg,#ede4f7 0%,#e0d4ef 50%,#ede4f7 100%)', c: 'rgba(179,136,255,0.3)', d: 'rgba(179,136,255,0.5)', e: '#3d2950', f: '#1a1a2e', g: '0 1px 3px rgba(0,0,0,0.1)', h: '0 2px 8px rgba(179,136,255,0.2)', i: 'rgba(179,136,255,0.12)' }
    };

    var _ct = 'dark', _el1 = null, _el2 = null, _ob = null;

    function _fn2(r, h) {
        var t = _t[r] || _t.dark;
        if (!_el1) return;
        if (h) {
            _el1.style.setProperty('background', t.b, 'important');
            _el1.style.setProperty('border-color', t.d, 'important');
            _el1.style.setProperty('box-shadow', t.h, 'important');
            _el1.style.setProperty('color', t.f, 'important');
            _el1.style.setProperty('transform', 'translateY(-1px)', 'important');
            if (_el2) { _el2.style.setProperty('background', 'linear-gradient(90deg,transparent 0%,' + t.i + ' 50%,transparent 100%)', 'important'); _el2.style.setProperty('opacity', '1', 'important'); }
        } else {
            _el1.style.setProperty('background', t.a, 'important');
            _el1.style.setProperty('border-color', t.c, 'important');
            _el1.style.setProperty('box-shadow', t.g, 'important');
            _el1.style.setProperty('color', t.e, 'important');
            _el1.style.setProperty('transform', 'translateY(0)', 'important');
            if (_el2) { _el2.style.setProperty('background', 'linear-gradient(90deg,transparent 0%,' + t.i + ' 50%,transparent 100%)', 'important'); _el2.style.setProperty('opacity', '0', 'important'); }
        }
    }

    function _fn3(t) { _ct = t || _fn1(); _fn2(_ct, false); }

    function _fn4() {
        if (document.getElementById(_x1)) return null;
        var li = document.createElement('li');
        li.id = _x1;
        li.setAttribute('role', 'none');
        var a = document.createElement('a');
        a.href = _x2; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('role', 'menuitem');
        a.setAttribute('style', 'display:flex !important;align-items:center !important;gap:10px !important;padding:10px 16px !important;border-radius:10px !important;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif !important;font-size:14px !important;font-weight:600 !important;line-height:20px !important;text-decoration:none !important;cursor:pointer !important;transition:all 0.25s ease !important;margin:6px 8px !important;opacity:1 !important;visibility:visible !important;position:relative !important;z-index:2147483647 !important;pointer-events:auto !important;user-select:none !important;overflow:hidden !important');
        _el1 = a;
        var _g = document.createElement('div');
        _g.setAttribute('style', 'position:absolute !important;inset:0 !important;pointer-events:none !important;transition:opacity 0.3s ease !important;opacity:0 !important');
        _el2 = _g;
        a.insertBefore(_g, a.firstChild);
        a.onmouseenter = function() { _fn2(_ct, true); };
        a.onmouseleave = function() { _fn2(_ct, false); };
        var w = document.createElement('span');
        w.setAttribute('style', 'display:flex !important;align-items:center !important;justify-content:center !important;width:20px !important;height:20px !important;flex-shrink:0 !important;');
        var _i = document.createElement('img');
        _i.src = _x3;
        _i.alt = '';
        _i.setAttribute('style', 'height:18px !important;width:auto !important;display:block !important;flex-shrink:0 !important;filter:brightness(1.2) !important');
        w.appendChild(_i);
        var l = document.createElement('span');
        l.textContent = 'Support Purpura';
        l.setAttribute('style', 'flex:1 !important;font-weight:600 !important;font-size:14px !important;line-height:20px !important;color:inherit !important');
        a.appendChild(w);
        a.appendChild(l);
        li.appendChild(a);
        return li;
    }

    function _fn5(t) {
        var u = t.tagName === 'UL' ? t : t.querySelector('ul');
        if (!u) return false;
        if (document.getElementById(_x1)) return true;
        var b = _fn4();
        if (!b) return true;
        var e = u.lastElementChild;
        if (e && e.tagName === 'LI') u.insertBefore(b, e.nextSibling); else u.appendChild(b);
        return true;
    }

    function _fn6() {
        var n = document.getElementById('left-navigation-container');
        if (n && _fn5(n)) return true;
        var c = document.querySelector('#left-navigation-container ul, .left-nav ul');
        if (c && _fn5(c.parentElement || c)) return true;
        return false;
    }

    if (_fn6()) { _fn7(); return; }

    var _mo = new MutationObserver(function() { if (_fn6()) { _mo.disconnect(); _fn7(); } });
    _mo.observe(document.body || document.documentElement, { childList: true, subtree: true });

    function _fn7() {
        _fn3(_fn1());
        if (_ob) _ob.disconnect();
        _ob = new MutationObserver(function() { _fn3(_fn1()); });
        var o = { attributes: true, attributeFilter: ['class', 'data-theme'] };
        _ob.observe(document.documentElement, o);
        if (document.body) _ob.observe(document.body, o);
    }

    function _fn8(el) {
        if (!el || !el.style) return;
        var s = el.style;
        s.setProperty('display', 'flex', 'important');
        s.setProperty('visibility', 'visible', 'important');
        s.setProperty('opacity', '1', 'important');
        s.setProperty('filter', 'none', 'important');
        s.setProperty('clipPath', 'none', 'important');
        s.setProperty('transform', 'none', 'important');
        s.setProperty('overflow', 'visible', 'important');
        s.setProperty('maxHeight', 'none', 'important');
        s.setProperty('maxWidth', 'none', 'important');
        s.setProperty('height', 'auto', 'important');
        s.setProperty('width', 'auto', 'important');
        s.setProperty('position', 'relative', 'important');
        s.setProperty('left', 'auto', 'important');
        s.setProperty('top', 'auto', 'important');
        s.setProperty('pointerEvents', 'auto', 'important');
        s.setProperty('zIndex', '2147483647', 'important');
        s.setProperty('contentVisibility', 'visible', 'important');
        s.setProperty('isolation', 'auto', 'important');
        s.setProperty('scale', '1', 'important');
        s.setProperty('translate', 'none', 'important');
        s.setProperty('rotate', 'none', 'important');
    }

    var _tm = setInterval(function() {
        var b = document.getElementById(_x1);
        if (!b) { _fn6(); return; }
        var a = b.querySelector('a');
        if (getComputedStyle(b).display === 'none' || b.offsetHeight === 0) { b.removeAttribute('style'); b.setAttribute('style', 'display:block !important'); }
        _fn8(a);
        var c = getComputedStyle(a);
        if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) < 0.5 || parseFloat(c.height || '0') < 5 || parseFloat(c.width || '0') < 5) {
            _fn8(a);
            a.style.setProperty('display', 'flex', 'important');
            a.style.setProperty('visibility', 'visible', 'important');
            a.style.setProperty('opacity', '1', 'important');
        }
    }, 1000);
    setTimeout(function() { clearInterval(_tm); }, 120000);
})();