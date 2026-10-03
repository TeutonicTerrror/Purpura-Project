/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
'use strict';

function msg(key, subs) {
    var s = chrome.i18n.getMessage(key, subs);
    return s || key;
}

var STORAGE_KEY = 'purpura_playtime';
var PT_MAX_IMPORT_GAMES = 500;
var riEscHandler = null;
var ROPRO_SCRIPT = "(async () => {\nconsole.group(\"%cRoPro Playtime Export\", \"color:#8b5cf6;font-weight:bold;\");\nconst userId = (await chrome.storage.sync.get(\"rpUserID\")).rpUserID;\nconst verification = Object.values(\n(await chrome.storage.sync.get(\"userVerification\")).userVerification\n)[0];\nconst headers = {\n\"ropro-id\": userId,\n\"ropro-verification\": verification\n};\nif (!headers[\"ropro-id\"]) {\nthrow new Error(\n\"Unable to access RoPro's authentication data.\\n\\n\" +\n\"Make sure RoPro is installed and you're running this script from the RoPro service worker.\"\n);\n}\nconst timeRanges = [7, 30, 365, 999];\nconst requests = timeRanges.map(async (time) => {\nconst response = await fetch(\n`https://api.ropro.io/getMostPlayedUniverse.php?time=${time}`,\n{\nmethod: \"POST\",\nheaders,\ncredentials: \"include\"\n}\n);\nif (!response.ok) {\nconst text = await response.text().catch(() => \"\");\nif (\ntext.includes(\"<!DOCTYPE\") ||\ntext.toLowerCase().includes(\"cloudflare\")\n) {\nthrow new Error(\n\"RoPro's API is currently unavailable or is being protected by Cloudflare. Please try again in a few minutes.\"\n);\n}\nthrow new Error(\n`Failed to fetch ${time}-day playtime data (HTTP ${response.status}).`\n);\n}\nconst text = await response.text();\nlet data;\ntry {\ndata = JSON.parse(text);\n} catch {\nif (\ntext.includes(\"<!DOCTYPE\") ||\ntext.toLowerCase().includes(\"cloudflare\")\n) {\nthrow new Error(\n\"RoPro's API is currently unavailable or is being protected by Cloudflare. Please try again in a few minutes.\"\n);\n}\nthrow new Error(\n`RoPro returned an unexpected response while fetching ${time}-day playtime data.`\n);\n}\nreturn { time, data };\n});\nconst results = await Promise.all(requests);\nconst games = {};\nfor (const { time, data } of results) {\nfor (const game of data) {\nif (!games[game.id]) {\ngames[game.id] = {\nid: game.id,\ntime_played: {\n7: 0,\n30: 0,\n365: 0,\n999: 0\n}\n};\n}\ngames[game.id].time_played[time] = game.time_played;\n}\n}\nconst gameList = Object.values(games);\nconsole.log(`✅ Export complete! Found ${gameList.length} games.`);\nconsole.log(\"📋 Right-click the array below and select 'Copy object' to export it.\");\nconsole.log(gameList);\nconsole.groupEnd();\n})().catch((error) => {\nconsole.groupEnd();\nconsole.error(\"❌ Export failed\");\nconsole.error(error.message);\n});";

function getStorage(key, fallback) {
    return new Promise(function(resolve) {
        chrome.storage.local.get([key], function(data) {
            resolve(data[key] !== undefined ? data[key] : fallback);
        });
    });
}

function setStorage(key, value) {
    return new Promise(function(resolve) {
        var obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, resolve);
    });
}

function formatTime(minutes) {
    if (!minutes || minutes < 1) return '0m';
    var h = Math.floor(minutes / 60);
    var m = Math.floor(minutes % 60);
    if (h > 0 && m > 0) return h + 'h ' + m + 'm';
    if (h > 0) return h + 'h';
    return m + 'm';
}

function parseRoProImport(text) {
    var raw;
    try {
        raw = JSON.parse(text);
    } catch (e) {
        return { error: msg('settings_playtime_import_errInvalidJson') };
    }
    if (!Array.isArray(raw))        return { error: msg('settings_playtime_import_errNotArray') };
    if (raw.length === 0)        return { error: msg('settings_playtime_import_errNoGames') };
    var games = [];
    for (var i = 0; i < raw.length; i++) {
        var entry = raw[i];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            return { error: msg('settings_playtime_import_errEntry', [String(i)]) };
        }
        if (!('id' in entry) || !('time_played' in entry)) {
            return { error: msg('settings_playtime_import_errMissingFields', [String(i)]) };
        }
        var tp = entry.time_played;
        var minutes = null;
        if (typeof tp === 'number') {
            minutes = tp;
        } else if (tp && typeof tp === 'object' && !Array.isArray(tp)) {
            if (typeof tp[999] === 'number') {
                minutes = tp[999];
            } else {
                var best = -1;
                var keys = [365, 30, 7];
                for (var k = 0; k < keys.length; k++) {
                    if (typeof tp[keys[k]] === 'number' && tp[keys[k]] > best) best = tp[keys[k]];
                }
                if (best >= 0) minutes = best;
            }
        }
        if (minutes === null || minutes < 0 || !isFinite(minutes)) {
            return { error: msg('settings_playtime_import_errBadTime', [String(i)]) };
        }
        var idv = entry.id;
        var idOk = false;
        if (typeof idv === 'number' && isFinite(idv) && idv >= 0) idOk = true;
        else if (typeof idv === 'string' && /^\d+$/.test(idv)) idOk = true;
        if (!idOk) {
            return { error: msg('settings_playtime_import_errBadId', [String(i)]) };
        }
        if (minutes > 0 && minutes <= 1000000) {
            games.push({ id: String(idv), minutes: Math.round(minutes) });
            if (games.length >= PT_MAX_IMPORT_GAMES) break;
        }
    }
    if (games.length === 0) return { error: msg('settings_playtime_import_errNoPlaytime') };
    return { games: games };
}

async function fetchGameNames(ids) {
    var names = {};
    var unique = [];
    for (var i = 0; i < ids.length; i++) {
        if (unique.indexOf(ids[i]) === -1) unique.push(ids[i]);
    }
    for (var j = 0; j < unique.length; j += 50) {
        var chunk = unique.slice(j, j + 50);
        try {
            var resp = await fetch('https://games.roblox.com/v1/games?universeIds=' + chunk.join(','));
            if (resp.ok) {
                var data = await resp.json();
                if (data && data.data) {
                    for (var k = 0; k < data.data.length; k++) {
                        var g = data.data[k];
                        if (g && g.id && g.name) names[String(g.id)] = g.name;
                    }
                }
            }
        } catch (e) {}
    }
    return names;
}

async function importRoProGames(parsed) {
    var data = await getStorage(STORAGE_KEY, { games: {} });
    if (!data.games) data.games = {};
    var gamesImported = 0;
    var totalMinutesImported = 0;
    var needsName = {};
    for (var i = 0; i < parsed.games.length; i++) {
        var id = parsed.games[i].id;
        var minutes = parsed.games[i].minutes;
        var existing = data.games[id];
        if (existing) {
            if (minutes > (existing.totalMinutes || 0)) {
                existing.totalMinutes = minutes;
                gamesImported++;
                totalMinutesImported += minutes;
            }
            if (!existing.name || existing.name === 'Unknown Game' || /^Game \d+$/.test(existing.name)) {
                needsName[id] = existing;
            }
        } else {
            data.games[id] = {
                universeId: id,
                rootPlaceId: null,
                name: 'Game ' + id,
                totalMinutes: minutes,
                lastPlayed: 0,
                sessions: 0,
                firstPlayedAt: Date.now()
            };
            needsName[id] = data.games[id];
            gamesImported++;
            totalMinutesImported += minutes;
        }
    }
    var names = await fetchGameNames(Object.keys(needsName));
    for (var k in needsName) {
        if (names[k]) needsName[k].name = names[k];
    }
    await setStorage(STORAGE_KEY, data);
    return { gamesImported: gamesImported, totalMinutesImported: totalMinutesImported };
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            ta.style.pointerEvents = 'none';
            document.body.appendChild(ta);
            ta.select();
            var ok = document.execCommand('copy');
            ta.remove();
            return ok;
        } catch (e2) {
            return false;
        }
    }
}

function injectStyles() {
    if (document.getElementById('purpura-ri-styles')) return;
    var style = document.createElement('style');
    style.id = 'purpura-ri-styles';
    style.textContent = ''
        + '#purpura-ri-overlay{'
            + '--ri-bg:#0b0c12;'
            + '--ri-bg-2:#111219;'
            + '--ri-bg-3:#161720;'
            + '--ri-text:#f0eeff;'
            + '--ri-text-2:#a89ec4;'
            + '--ri-text-3:#6d6487;'
            + '--ri-accent:#9b6dff;'
            + '--ri-accent-hover:#b088ff;'
            + '--ri-accent-glow:rgba(155,109,255,0.15);'
            + '--ri-border:rgba(255,255,255,0.07);'
            + '--ri-border-2:rgba(255,255,255,0.12);'
            + '--ri-success:#4ade80;'
            + '--ri-ease:cubic-bezier(0.22,1,0.36,1);'
        + '}'
        + '#purpura-ri-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(5,4,10,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:var(--ri-text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;opacity:0;transition:opacity 0.18s ease}'
        + '#purpura-ri-overlay.ri-visible{opacity:1}'
        + '#purpura-ri-overlay *{box-sizing:border-box}'
        + '.ri-modal{position:relative;width:520px;max-width:100%;max-height:calc(100vh - 32px);overflow-y:auto;background:var(--ri-bg);border:1px solid var(--ri-border-2);border-radius:14px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,0.5);transform:translateY(14px) scale(0.97);transition:transform 0.22s var(--ri-ease)}'
        + '#purpura-ri-overlay.ri-visible .ri-modal{transform:none}'
        + '.ri-modal-close{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:7px;border:1px solid transparent;background:none;color:var(--ri-text-2);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}'
        + '.ri-gist-link{display:inline-block;margin-top:6px;font-size:11px;color:var(--ri-accent-hover);text-decoration:none;border-bottom:1px solid var(--ri-accent);transition:opacity 0.15s}'
        + '.ri-gist-link:hover{opacity:0.8}'
        + '.ri-modal-close:hover{background:var(--ri-bg-3);color:var(--ri-text);border-color:var(--ri-border)}'
        + '.ri-modal-title{font-size:17px;font-weight:700;margin:0 0 4px;letter-spacing:-0.3px}'
        + '.ri-modal-desc{font-size:12px;color:var(--ri-text-2);line-height:1.5;margin:0 0 14px}'
        + '.ri-steps{display:flex;flex-direction:column;gap:12px}'
        + '.ri-step{display:flex;gap:10px}'
        + '.ri-step-num{width:22px;height:22px;border-radius:50%;background:var(--ri-accent-glow);border:1px solid var(--ri-accent);color:var(--ri-accent-hover);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}'
        + '.ri-step-content{flex:1;min-width:0}'
        + '.ri-step-title{font-size:13px;font-weight:600;margin-bottom:3px}'
        + '.ri-step-desc{font-size:12px;color:var(--ri-text-2);line-height:1.5}'
        + '.ri-step-desc code{background:var(--ri-bg-3);border:1px solid var(--ri-border);padding:1px 5px;border-radius:4px;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
        + '.ri-step-desc strong{color:var(--ri-text)}'
        + '.ri-step-desc a{color:var(--ri-accent-hover);text-decoration:none;border-bottom:1px solid var(--ri-accent);transition:opacity 0.15s}'
        + '.ri-step-desc a:hover{opacity:0.8}'
        + '.ri-code-wrap{position:relative;margin-top:8px}'
        + '.ri-code{display:block;background:var(--ri-bg-3);border:1px solid var(--ri-border);border-radius:8px;padding:10px 10px 38px;font-size:10px;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ri-text-2);word-break:break-all;max-height:110px;overflow-y:auto;white-space:pre-wrap}'
        + '.ri-copy-btn{position:absolute;bottom:8px;right:8px;padding:5px 10px;border-radius:6px;border:1px solid var(--ri-border-2);background:var(--ri-bg);color:var(--ri-text);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s}'
        + '.ri-copy-btn:hover{border-color:var(--ri-accent);color:var(--ri-accent-hover)}'
        + '.ri-copy-btn.copied{border-color:var(--ri-success);color:var(--ri-success)}'
        + '.ri-textarea{width:100%;box-sizing:border-box;margin-top:8px;background:var(--ri-bg-3);border:1px solid var(--ri-border-2);border-radius:8px;padding:10px;color:var(--ri-text);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.5;resize:vertical;min-height:54px;transition:border-color 0.15s}'
        + '.ri-textarea:focus{outline:none;border-color:var(--ri-accent);box-shadow:0 0 0 3px var(--ri-accent-glow)}'
        + '.ri-textarea::placeholder{color:var(--ri-text-3)}'
        + '.ri-error{font-size:11px;color:#f87171;margin-top:6px;min-height:14px}'
        + '.ri-modal-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid var(--ri-border)}'
        + '.ri-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s;border:1px solid transparent}'
        + '.ri-btn-ghost{background:var(--ri-bg-3);border-color:var(--ri-border-2);color:var(--ri-text-2)}'
        + '.ri-btn-ghost:hover{color:var(--ri-text);border-color:var(--ri-border-2);transform:translateY(-1px)}'
        + '.ri-btn-primary{background:linear-gradient(135deg,var(--ri-accent),#7c4dff);color:#fff;box-shadow:0 4px 18px var(--ri-accent-glow)}'
        + '.ri-btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 8px 24px var(--ri-accent-glow)}'
        + '.ri-btn-primary:disabled{opacity:0.6;cursor:default;transform:none}'
        + '.ri-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483001;display:flex;align-items:center;gap:10px;background:var(--ri-bg);border:1px solid var(--ri-border-2);border-left:3px solid var(--ri-success);border-radius:12px;padding:12px 18px;font-size:13px;color:var(--ri-text);box-shadow:0 12px 40px rgba(0,0,0,0.4);animation:ri-toast-in 0.3s var(--ri-ease)}'
        + '@keyframes ri-toast-in{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}'
        + '@media(prefers-reduced-motion:reduce){#purpura-ri-overlay,.ri-modal,.ri-toast{animation:none;transition:none}}';
    document.head.appendChild(style);
}

function buildModalHtml() {
    return ''
        + '<div class="ri-modal">'
        + '<button type="button" class="ri-modal-close" id="purpura-ri-close" aria-label="Close">✕</button>'
        + '<h2 class="ri-modal-title">' + msg('settings_playtime_import_title') + '</h2>'
        + '<p class="ri-modal-desc">' + msg('settings_playtime_import_desc') + '</p>'
        + '<div class="ri-steps">'
        + '<div class="ri-step">'
        + '<span class="ri-step-num">1</span>'
        + '<div class="ri-step-content">'
        + '<div class="ri-step-title">' + msg('settings_playtime_import_step1Title') + '</div>'
        + '<div class="ri-step-desc">' + msg('settings_playtime_import_step1Desc') + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="ri-step">'
        + '<span class="ri-step-num">2</span>'
        + '<div class="ri-step-content">'
        + '<div class="ri-step-title">' + msg('settings_playtime_import_step2Title') + '</div>'
        + '<div class="ri-step-desc">' + msg('settings_playtime_import_step2Desc') + '</div>'
        + '<div class="ri-code-wrap">'
        + '<code class="ri-code" id="purpura-ri-script-code"></code>'
        + '<button type="button" class="ri-copy-btn" id="purpura-ri-copy">' + msg('settings_playtime_import_copy') + '</button>'
        + '</div>'
        + '<a class="ri-gist-link" href="https://gist.github.com/TeutonicTerrror/6a666e571e7562df35dd6539728c1178" target="_blank" rel="noopener noreferrer">' + msg('settings_playtime_import_gist') + '</a>'
        + '</div>'
        + '</div>'
        + '<div class="ri-step">'
        + '<span class="ri-step-num">3</span>'
        + '<div class="ri-step-content">'
        + '<div class="ri-step-title">' + msg('settings_playtime_import_step3Title') + '</div>'
        + '<div class="ri-step-desc">' + msg('settings_playtime_import_step3Desc') + '</div>'
        + '<textarea id="purpura-ri-data" class="ri-textarea" rows="3" placeholder=\'[{"id":"123","time_played":{"999":120}},...]\'></textarea>'
        + '<div class="ri-error" id="purpura-ri-error"></div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="ri-modal-footer">'
        + '<button type="button" class="ri-btn ri-btn-ghost" id="purpura-ri-cancel">' + msg('settings_playtime_import_cancel') + '</button>'
        + '<button type="button" class="ri-btn ri-btn-primary" id="purpura-ri-submit">' + msg('settings_playtime_import_submit') + '</button>'
        + '</div>'
        + '</div>';
}

function openRoProImportModal() {
    if (document.getElementById('purpura-ri-overlay')) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'purpura-ri-overlay';
    overlay.className = 'ri-overlay';
    overlay.innerHTML = buildModalHtml();
    var codeEl = overlay.querySelector('#purpura-ri-script-code');
    if (codeEl) codeEl.textContent = ROPRO_SCRIPT;
    document.body.appendChild(overlay);
    requestAnimationFrame(function() { overlay.classList.add('ri-visible'); });

    function esc(e) {
        if (e.key === 'Escape') close();
    }

    function close() {
        if (overlay.getAttribute('data-importing') === 'true') return;
        if (riEscHandler === esc) {
            document.removeEventListener('keydown', esc);
            riEscHandler = null;
        }
        overlay.classList.remove('ri-visible');
        setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
    }

    riEscHandler = esc;
    document.addEventListener('keydown', esc);

    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    var closeBtn = overlay.querySelector('#purpura-ri-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    var cancelBtn = overlay.querySelector('#purpura-ri-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    var copyBtn = overlay.querySelector('#purpura-ri-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            copyText(ROPRO_SCRIPT).then(function(ok) {
                copyBtn.textContent = ok ? msg('settings_playtime_import_copied') : msg('settings_playtime_import_copyFailed');
                copyBtn.classList.add('copied');
                setTimeout(function() {
                    copyBtn.textContent = msg('settings_playtime_import_copy');
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    var submitBtn = overlay.querySelector('#purpura-ri-submit');
    if (submitBtn) submitBtn.addEventListener('click', runRoProImport);
}

async function runRoProImport() {
    var ta = document.getElementById('purpura-ri-data');
    var errEl = document.getElementById('purpura-ri-error');
    var submitBtn = document.getElementById('purpura-ri-submit');
    if (!ta || !errEl || !submitBtn) return;
    var text = (ta.value || '').trim();
    if (!text) { errEl.textContent = msg('settings_playtime_import_errEmpty'); return; }
    var parsed = parseRoProImport(text);
    if (parsed.error) { errEl.textContent = parsed.error; return; }
    errEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = msg('settings_playtime_import_importing');
    var overlay = document.getElementById('purpura-ri-overlay');
    if (overlay) overlay.setAttribute('data-importing', 'true');
    try {
        var result = await importRoProGames(parsed);
        if (riEscHandler) {
            document.removeEventListener('keydown', riEscHandler);
            riEscHandler = null;
        }
        if (overlay) {
            overlay.classList.remove('ri-visible');
            setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
        }
        try {
            window.dispatchEvent(new CustomEvent('purpura:playtime-imported', {
                detail: { games: result.gamesImported, minutes: result.totalMinutesImported }
            }));
        } catch (e) {}
        showImportToast(result.gamesImported, result.totalMinutesImported);
    } catch (e) {
        if (overlay) overlay.removeAttribute('data-importing');
        errEl.textContent = msg('settings_playtime_import_errFailed');
        submitBtn.disabled = false;
        submitBtn.textContent = msg('settings_playtime_import_submit');
    }
}

function showImportToast(games, minutes) {
    var existing = document.getElementById('purpura-ri-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'purpura-ri-toast';
    toast.className = 'ri-toast';
    toast.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ri-success);flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>'
        + '<span>' + msg('settings_playtime_import_toast', [String(games), formatTime(minutes)]) + '</span>';
    document.body.appendChild(toast);
    setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 8000);
}

window.__PurpuraRoProImport = { open: openRoProImportModal };

})();
