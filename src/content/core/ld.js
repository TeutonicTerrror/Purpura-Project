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
    var stored = r && r.stm;
    var enabled = stored === true || !!(stored && typeof stored === 'object' && stored.enabled === true);
    try {
        sessionStorage.setItem('purpura_streamermode', String(enabled));
        if (stored && typeof stored === 'object') {
            sessionStorage.setItem('purpura_streamer_items', JSON.stringify(stored));
        }
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
            'Pinned Games': syncData['pg'] ?? true,
            'Game Launcher Widget': syncData['glw'] ?? false,
            'Game Outfits': syncData['go']?.enabled ?? true,
            'Game Reviews': syncData['grev'] ?? true,
            'In-game Discounts': syncData['sho'] ?? true,
            'Share Server Links': syncData['ssl'] ?? true,
            'Recent Servers': syncData['rs'] ?? true,
            'Unsafe Trade Protection': syncData['otp']?.enabled ?? false,
            '  └ Threshold': syncData['otp']?.threshold ?? '50',
            'Projected Trade Value Warnings': syncData['pwi'] ?? true,
            'Live Counters': syncData['lc']?.enabled ?? true,
            '  └ Likes / Dislikes / Favorites': syncData['lc']?.likeDislike ?? true,
            '  └ Players': syncData['lc']?.players ?? true,
            '  └ Visits': syncData['lc']?.visits ?? true,
            "Purpura's Selection": syncData['ps'] ?? true,
            'Quick Play': syncData['qp'] ?? true,
            'Sidebar Tweaks': localData['sbt']?.enabled ?? true,
            '  └ Purpura-style Sidebar': localData['sdbr']?.enabled ?? false,
            '  └ Hover-to-Expand Mode': localData['sbt']?.hoverExpand ?? true,
            '  └ Layout Customization': localData['sbt']?.layout ?? false,
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
            '  └ Sponsored Content': localData['bwr']?.sponsored ?? true,
            '  └ Navigation Links': localData['bwr']?.navigation ?? true,
            '  └ Footer Links': localData['bwr']?.footer ?? true,
            '  └ Premium Promotions': localData['bwr']?.premium ?? true,
            '  └ FAQ Panels': localData['bwr']?.faq ?? true,
            '  └ Popularity Badges': localData['bwr']?.badges ?? true,
            '  └ Roblox Plus Advertising': localData['bwr']?.plusAds ?? true,
            '  └ Roblox Plus Assets': localData['bwr']?.plusAssets ?? true,
            'Site Fixes': localData['sfix'] ?? false,
            'View Roblox Chat Username Color': localData['ucp'] ?? false,
            'Thumbnail Background Disabler': localData['tbd'] ?? false,
            'Avatar Image Downloader': localData['dav'] ?? false,
            'Site Font': localData['sft']?.enabled ?? false,
            '  └ Font Link': localData['sft']?.fontUrl || 'Not set',
            'Custom Backdrop': localData['cbg']?.enabled ?? false,
            '  └ Image': localData['cbg']?.image ? (String(localData['cbg'].image).startsWith('data:') ? 'Uploaded image' : localData['cbg'].image) : 'Not set',
            'Greetings': localData['gr'] ?? true,
            'Friends Manager': syncData['fm'] ?? false,
            'No Rent': syncData['nr'] ?? true,
            'Robux Conversions': syncData['rconv']?.enabled ?? true,
            '  └ Rate type': syncData['rconv']?.rateType ?? 'Regular',
            '  └ Currency': syncData['rconv']?.currency ?? 'USD',
            'Robux Balance Precision': syncData['rbp'] ?? '2',
            'Choose Robux Bonus Item': syncData['rbon'] ?? true,
            'Bundle Item Viewer': syncData['biv'] ?? true,
            'Item Explorer': syncData['explr'] ?? true,
            'Ghost Profiles': localData['ghos']?.enabled ?? true,
            'Last Online': syncData['lo'] ?? true,
            'Rolimons Profile Values': syncData['rvp'] ?? true,
            'Avatar Search': syncData['as'] ?? true,
            'Infinite Avatar': syncData['ia'] ?? false,
            'Adjust Accessories': syncData['aa'] ?? true,
            'Extra Outfits': syncData['eo'] ?? true,
            'Redesigned Avatar Editor': syncData['rae']?.enabled ?? false,
            'Streamer Mode': (localData['stm'] === true ? true : localData['stm']?.enabled === true),
            'Status Spoofer': syncData['spc']?.enabled ?? false,
            'Unpending Robux': syncData['up']?.enabled ?? true,
            '  └ Show Pending Robux in Menu': syncData['up']?.showPending ?? true,
            'Save Lots Robux': syncData['slr']?.enabled ?? false,
            'Remaining Robux': syncData['rr'] ?? true,
            'Roblox Age Theme': localData['rat']?.enabled ?? false,
            'Hide Download Button': localData['hdb'] ?? true,
            'Legacy Theme Switcher': localData['lts'] ?? false,
            'Trusted Creator Status': localData['tcs'] ?? true,
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
    var _s = 'purpura-kofi-sidebar-style';

    function _styles() {
        if (document.getElementById(_s)) return;
        var style = document.createElement('style');
        style.id = _s;
        style.textContent = [
            '#purpura-kofi-abc{display:block!important;margin:10px 8px 6px!important;padding:0!important;list-style:none!important}',
            '#purpura-kofi-abc>a{display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;box-sizing:border-box!important;min-height:46px!important;padding:0 14px!important;border:1px solid var(--purpura-playButton,var(--color-action-primary-background,#1a8fc0))!important;border-radius:10px!important;background-color:var(--purpura-surface200,var(--color-surface-200,rgba(128,128,128,.12)))!important;color:var(--purpura-mainText,var(--color-content-emphasis,#191b1d))!important;font-family:inherit!important;font-size:15px!important;font-weight:700!important;line-height:20px!important;text-decoration:none!important;cursor:pointer!important;box-shadow:0 2px 8px rgba(0,0,0,.18)!important;transition:background-color .15s ease,border-color .15s ease,box-shadow .15s ease,transform .15s ease!important}',
            '#purpura-kofi-abc>a:hover{background-color:var(--purpura-surface300,var(--color-surface-300,rgba(128,128,128,.2)))!important;box-shadow:0 4px 14px rgba(0,0,0,.24)!important;transform:translateY(-1px)!important}',
            '#purpura-kofi-abc>a:active{transform:none!important;box-shadow:0 1px 4px rgba(0,0,0,.18)!important}',
            '#purpura-kofi-abc>a:focus-visible{outline:2px solid var(--purpura-playButton,var(--color-action-primary-background,#1a8fc0))!important;outline-offset:2px!important}',
            '#purpura-kofi-abc .purpura-kofi-icon{display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 24px!important;width:24px!important;height:24px!important;border-radius:7px!important;background-color:var(--purpura-playButton,var(--color-action-primary-background,#1a8fc0))!important;background-image:linear-gradient(rgba(0,0,0,.22),rgba(0,0,0,.22))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)!important;overflow:hidden!important}',
            '#purpura-kofi-abc .purpura-kofi-icon img{display:block!important;width:16px!important;height:auto!important;margin:0!important;padding:0!important;border:0!important;filter:none!important}',
            '#purpura-kofi-abc .purpura-kofi-label{flex:0 1 auto!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:inherit!important;font:inherit!important}',
            '@media (prefers-reduced-motion:reduce){#purpura-kofi-abc>a{transition:none!important}}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    function _fn4() {
        if (document.getElementById(_x1)) return null;
        _styles();
        var li = document.createElement('li');
        li.id = _x1;
        li.setAttribute('role', 'none');
        var a = document.createElement('a');
        a.href = _x2;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('role', 'menuitem');
        a.setAttribute('aria-label', 'Support Purpura on Ko-fi');
        a.setAttribute('title', 'Support Purpura on Ko-fi');
        var w = document.createElement('span');
        w.className = 'purpura-kofi-icon';
        var _i = document.createElement('img');
        _i.src = _x3;
        _i.alt = '';
        w.appendChild(_i);
        var l = document.createElement('span');
        l.className = 'purpura-kofi-label';
        l.textContent = 'Support Purpura';
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

    if (_fn6()) { _styles(); return; }

    var _mo = new MutationObserver(function() { if (_fn6()) { _mo.disconnect(); _styles(); } });
    _mo.observe(document.body || document.documentElement, { childList: true, subtree: true });

    function _fn8(el) {
        if (!el || !el.style) return;
        var s = el.style;
        s.setProperty('display', 'flex', 'important');
        s.setProperty('visibility', 'visible', 'important');
        s.setProperty('opacity', '1', 'important');
        s.setProperty('pointer-events', 'auto', 'important');
    }

    var _tm = setInterval(function() {
        var b = document.getElementById(_x1);
        if (!b) { _fn6(); return; }
        _styles();
        var a = b.querySelector('a');
        _fn8(a);
    }, 1000);
    setTimeout(function() { clearInterval(_tm); }, 120000);
})();
