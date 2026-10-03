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

if (window.location.pathname !== '/purpura-time') return;
if (document.getElementById('purpura-time-root')) return;

var STORAGE_KEY = 'purpura_playtime';
var DAILY_KEY = 'purpura_playtime_daily';
var SESSION_KEY = 'purpura_playtime_sessions';
var TRACKING_KEY = 'purpura_playtime_tracking';
var sessionTimerId = null;
var dashboardRefreshTimerId = null;
var dashboardPollInFlight = false;
var dashboardRefreshInFlight = false;

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

function formatElapsed(ms) {
    var seconds = Math.max(0, Math.floor(ms / 1000));
    if (seconds < 60) return seconds + 's';
    return formatTime(seconds / 60);
}

function formatDateShort(ts) {
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate();
}

function getDateKey(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function getTodayMinutes(sessions) {
    var today = getDateKey();
    var total = 0;
    for (var i = 0; i < sessions.length; i++) {
        if (getDateKey(sessions[i].startTime) === today) total += sessions[i].durationMinutes;
    }
    return total;
}

function getWeekMinutes(sessions) {
    var cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    var total = 0;
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].startTime >= cutoff) total += sessions[i].durationMinutes;
    }
    return total;
}

function getMonthMinutes(sessions) {
    var d = new Date();
    var cutoff = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    var total = 0;
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].startTime >= cutoff) total += sessions[i].durationMinutes;
    }
    return total;
}

function getTotalMinutes(data) {
    var total = 0;
    var games = data.games || {};
    for (var key in games) {
        if (games.hasOwnProperty(key) && games[key].name !== 'Unknown Game') total += games[key].totalMinutes;
    }
    return total;
}

function getTopGames(data, limit) {
    limit = limit || 10;
    var games = Object.values(data.games || {}).filter(function(g) { return g.name !== 'Unknown Game'; });
    games.sort(function(a, b) { return b.totalMinutes - a.totalMinutes; });
    return games.slice(0, limit);
}

function getActiveSession(tracking) {
    if (tracking && tracking.sessionStart) {
        return {
            startTime: tracking.sessionStart,
            gameName: tracking.gameName || 'Unknown Game',
            universeId: tracking.universeId,
            rootPlaceId: tracking.rootPlaceId
        };
    }
    return null;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildDashboard(data, sessions, tracking) {
    var topGames = getTopGames(data, 10);
    var totalMinutes = getTotalMinutes(data);
    var todayMinutes = getTodayMinutes(sessions);
    var weekMinutes = getWeekMinutes(sessions);
    var monthMinutes = getMonthMinutes(sessions);
    var activeSession = getActiveSession(tracking);
    var gameCount = Object.values(data.games || {}).filter(function(g) { return g.name !== 'Unknown Game'; }).length;
    var avgSession = sessions.length > 0 ? Math.round(sessions.reduce(function(s, ses) { return s + ses.durationMinutes; }, 0) / sessions.length) : 0;

    var h = '';

    h += '<div class="pt-hero-stats">';
    h += '<div class="pt-stat-card">';
    h += '<span class="pt-stat-value">' + formatTime(todayMinutes) + '</span>';
    h += '<span class="pt-stat-label">Today</span>';
    h += '</div>';
    h += '<div class="pt-stat-card">';
    h += '<span class="pt-stat-value">' + formatTime(weekMinutes) + '</span>';
    h += '<span class="pt-stat-label">This Week</span>';
    h += '</div>';
    h += '<div class="pt-stat-card">';
    h += '<span class="pt-stat-value">' + formatTime(monthMinutes) + '</span>';
    h += '<span class="pt-stat-label">This Month</span>';
    h += '</div>';
    h += '<div class="pt-stat-card">';
    h += '<span class="pt-stat-value">' + formatTime(totalMinutes) + '</span>';
    h += '<span class="pt-stat-label">All Time</span>';
    h += '</div>';
    h += '<div class="pt-stat-card">';
    h += '<span class="pt-stat-value">' + gameCount + '</span>';
    h += '<span class="pt-stat-label">Games Played</span>';
    h += '</div>';
    h += '</div>';

    if (activeSession) {
        var elapsed = Date.now() - activeSession.startTime;
        h += '<div class="pt-session-banner" id="pt-session-banner">';
        h += '<div class="pt-session-indicator"></div>';
        h += '<span class="pt-session-text">Playing <strong>' + escapeHtml(activeSession.gameName) + '</strong> -- <strong id="pt-session-elapsed">' + formatElapsed(elapsed) + '</strong> this session</span>';
        h += '</div>';
    }

    h += '<div class="pt-content-grid">';

    h += '<div class="pt-section">';
    h += '<h2 class="pt-section-title">Top Games</h2>';
    if (topGames.length > 0) {
        var maxMins = topGames[0].totalMinutes;
        h += '<div class="pt-games-table">';
        h += '<div class="pt-games-header">';
        h += '<span class="pt-games-col-rank">#</span>';
        h += '<span class="pt-games-col-name">Game</span>';
        h += '<span class="pt-games-col-time">Time</span>';
        h += '<span class="pt-games-col-sessions">Sessions</span>';
        h += '</div>';
        for (var i = 0; i < topGames.length; i++) {
            var g = topGames[i];
            var pct = maxMins > 0 ? (g.totalMinutes / maxMins * 100) : 0;
            h += '<div class="pt-game-row">';
            h += '<span class="pt-games-col-rank">' + (i + 1) + '</span>';
            h += '<span class="pt-games-col-name">';
            h += '<span class="pt-game-name-text">' + escapeHtml(g.name || 'Unknown Game') + '</span>';
            h += '<span class="pt-game-bar"><span class="pt-game-bar-fill" style="width:' + pct + '%"></span></span>';
            h += '</span>';
            h += '<span class="pt-games-col-time">' + formatTime(g.totalMinutes) + '</span>';
            h += '<span class="pt-games-col-sessions">' + (g.sessions || '—') + '</span>';
            h += '</div>';
        }
        h += '</div>';
    } else {
        h += '<div class="pt-empty">';
        h += '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        h += '<p>No playtime data yet.</p><p class="pt-empty-sub">Start playing a game and your playtime will appear here.</p>';
        h += '</div>';
    }
    h += '</div>';

    h += '<div class="pt-sidebar">';

    h += '<div class="pt-section pt-section-sm">';
    h += '<h3 class="pt-section-title">Quick Stats</h3>';
    h += '<div class="pt-quick-stats">';
    h += '<div class="pt-quick-stat"><span class="pt-qs-label">Total Sessions</span><span class="pt-qs-value">' + sessions.length + '</span></div>';
    h += '<div class="pt-quick-stat"><span class="pt-qs-label">Avg Session</span><span class="pt-qs-value">' + formatTime(avgSession) + '</span></div>';
    h += '<div class="pt-quick-stat"><span class="pt-qs-label">Games Played</span><span class="pt-qs-value">' + gameCount + '</span></div>';
    if (topGames.length > 0) {
        h += '<div class="pt-quick-stat"><span class="pt-qs-label">Most Played</span><span class="pt-qs-value pt-qs-truncate" title="' + escapeHtml(topGames[0].name) + '">' + escapeHtml(topGames[0].name) + '</span></div>';
    }
    h += '</div>';
    h += '</div>';

    h += '<div class="pt-section pt-section-sm">';
    h += '<h3 class="pt-section-title">Recent Sessions</h3>';
    if (sessions.length > 0) {
        h += '<div class="pt-session-list">';
        var shown = Math.min(sessions.length, 8);
        for (var j = 0; j < shown; j++) {
            var s = sessions[j];
            h += '<div class="pt-session-row">';
            h += '<span class="pt-session-game">' + escapeHtml(s.gameName || 'Unknown Game') + '</span>';
            h += '<span class="pt-session-meta">' + formatDateShort(s.startTime) + ' -- ' + formatTime(s.durationMinutes) + '</span>';
            h += '</div>';
        }
        if (sessions.length > 8) {
            h += '<div class="pt-session-more">+ ' + (sessions.length - 8) + ' more sessions</div>';
        }
        h += '</div>';
    } else {
        h += '<div class="pt-empty pt-empty-sm"><p>No sessions recorded yet.</p></div>';
    }
    h += '</div>';

    h += '</div>';
    h += '</div>';

    return h;
}

function injectStyles() {
    if (document.getElementById('purpura-pt-dash-styles')) return;
    var style = document.createElement('style');
    style.id = 'purpura-pt-dash-styles';
    style.textContent = ''
        + '#purpura-time-root{'
            + '--t-surface:var(--color-surface-0,#0b0c12);'
            + '--t-surface-2:var(--color-surface-100,#111219);'
            + '--t-surface-3:var(--color-surface-200,#161720);'
            + '--t-text:var(--color-content-default,#f0eeff);'
            + '--t-text-2:var(--color-content-muted,#a89ec4);'
            + '--t-text-3:var(--color-content-tertiary,#6d6487);'
            + '--t-accent:#9b6dff;'
            + '--t-accent-hover:#b088ff;'
            + '--t-accent-glow:rgba(155,109,255,0.15);'
            + '--t-border:var(--color-divider,rgba(255,255,255,0.07));'
            + '--t-border-2:rgba(255,255,255,0.12);'
            + '--t-success:#4ade80;'
            + '--t-radius:12px;'
            + '--t-ease:cubic-bezier(0.22,1,0.36,1);'
            + 'display:block;position:relative;z-index:1;width:100%;min-height:100vh;'
            + 'color:var(--t-text);'
            + 'font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;'
        + '}'
        + '#purpura-time-root *{box-sizing:border-box}'
        + '.pt-container{max-width:1100px;margin:0 auto;padding:32px 24px 60px}'
        + '.pt-header{display:flex;align-items:center;gap:16px;margin-bottom:36px;padding-bottom:24px;border-bottom:1px solid var(--t-border)}'
        + '.pt-logo{width:44px;height:44px;border-radius:10px;flex-shrink:0}'
        + '.pt-header-info h1{font-size:28px;font-weight:700;letter-spacing:-0.5px;margin:0 0 2px;background:linear-gradient(135deg,#c4a7ff,#9b6dff 50%,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}'
        + '.pt-header-info p{color:var(--t-text-2);font-size:14px;margin:0}'
        + '.pt-hero-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px}'
        + '.pt-stat-card{background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:20px 24px;text-align:center;transition:border-color 0.2s,transform 0.15s}'
        + '.pt-stat-card:hover{border-color:var(--t-accent-glow);transform:translateY(-1px)}'
        + '.pt-stat-value{display:block;font-size:28px;font-weight:700;color:var(--t-text);margin-bottom:4px}'
        + '.pt-stat-label{display:block;font-size:12px;font-weight:500;color:var(--t-text-2);text-transform:uppercase;letter-spacing:0.5px}'
        + '.pt-session-banner{display:flex;align-items:center;gap:10px;background:var(--t-surface-2);border:1px solid var(--t-border);border-left:3px solid var(--t-success);border-radius:var(--t-radius);padding:14px 20px;margin-bottom:24px}'
        + '.pt-session-indicator{width:10px;height:10px;border-radius:50%;background:var(--t-success);animation:pt-pulse 2s infinite;flex-shrink:0}'
        + '@keyframes pt-pulse{0%,100%{opacity:1}50%{opacity:0.4}}'
        + '.pt-session-text{font-size:14px;color:var(--t-text)}'
        + '.pt-content-grid{display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start}'
        + '.pt-section{background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:24px}'
        + '.pt-section-sm{padding:20px}'
        + '.pt-section-title{font-size:16px;font-weight:600;color:var(--t-text);margin:0 0 16px}'
        + '.pt-games-table{width:100%}'
        + '.pt-games-header{display:grid;grid-template-columns:36px 1fr 80px 80px;gap:12px;padding:0 0 12px;border-bottom:1px solid var(--t-border);font-size:11px;font-weight:600;color:var(--t-text-3);text-transform:uppercase;letter-spacing:0.5px}'
        + '.pt-game-row{display:grid;grid-template-columns:36px 1fr 80px 80px;gap:12px;padding:10px 0;border-bottom:1px solid var(--t-border);align-items:center;font-size:14px;transition:background 0.15s}'
        + '.pt-game-row:last-child{border-bottom:none}'
        + '.pt-game-row:hover{background:rgba(255,255,255,0.02)}'
        + '.pt-games-col-rank{font-weight:700;color:var(--t-text-2);text-align:center}'
        + '.pt-game-name-text{display:block;color:var(--t-text);font-weight:500;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
        + '.pt-game-bar{display:block;height:4px;background:var(--t-border-2);border-radius:2px;overflow:hidden}'
        + '.pt-game-bar-fill{display:block;height:100%;background:linear-gradient(90deg,var(--t-accent),var(--t-accent-hover));border-radius:2px;transition:width 0.6s var(--t-ease)}'
        + '.pt-games-col-time{font-weight:600;color:var(--t-text);text-align:right}'
        + '.pt-games-col-sessions{color:var(--t-text-2);text-align:right}'
        + '.pt-sidebar{display:flex;flex-direction:column;gap:16px}'
        + '.pt-quick-stats{display:flex;flex-direction:column;gap:10px}'
        + '.pt-quick-stat{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--t-border)}'
        + '.pt-quick-stat:last-child{border-bottom:none}'
        + '.pt-qs-label{font-size:13px;color:var(--t-text-2)}'
        + '.pt-qs-value{font-size:13px;font-weight:600;color:var(--t-text);text-align:right}'
        + '.pt-qs-truncate{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
        + '.pt-session-list{display:flex;flex-direction:column;gap:0}'
        + '.pt-session-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--t-border);gap:12px}'
        + '.pt-session-row:last-child{border-bottom:none}'
        + '.pt-session-game{font-size:13px;font-weight:500;color:var(--t-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}'
        + '.pt-session-meta{font-size:12px;color:var(--t-text-3);white-space:nowrap;flex-shrink:0}'
        + '.pt-session-more{font-size:12px;color:var(--t-text-3);text-align:center;padding-top:8px}'
        + '.pt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;color:var(--t-text-2);text-align:center;gap:12px}'
        + '.pt-empty-sm{padding:20px}'
        + '.pt-empty p{font-size:15px;font-weight:500;margin:0}'
        + '.pt-empty-sub{font-size:13px;color:var(--t-text-3);margin:0}'
        + '.pt-empty svg{opacity:0.3}'
        + '.pt-footer{display:flex;justify-content:center;align-items:center;gap:24px;margin-top:32px;padding-top:20px;border-top:1px solid var(--t-border)}'
        + '.pt-footer-link{font-size:13px;color:var(--t-text-3);text-decoration:none;transition:color 0.15s}'
        + '.pt-footer-link:hover{color:var(--t-accent)}'
        + '.pt-header-actions{margin-left:auto;display:flex;align-items:center;gap:10px}'
        + '.pt-import-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;border:1px solid var(--t-border-2);background:var(--t-surface-3);color:var(--t-text);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:border-color 0.2s,background 0.2s,transform 0.15s,box-shadow 0.2s}'
        + '.pt-import-btn:hover{border-color:var(--t-accent);background:var(--t-accent-glow);color:var(--t-accent-hover);transform:translateY(-1px);box-shadow:0 4px 16px var(--t-accent-glow)}'
        + '.pt-import-btn:active{transform:translateY(0)}'
        + '@media(max-width:768px){.pt-hero-stats{grid-template-columns:repeat(3,1fr)}.pt-content-grid{grid-template-columns:1fr}.pt-games-header,.pt-game-row{grid-template-columns:28px 1fr 60px 60px;gap:8px}.pt-header{flex-wrap:wrap}.pt-header-actions{margin-left:0}}';

    document.head.appendChild(style);
}

function startSessionTimer(startTime) {
    if (sessionTimerId) { clearInterval(sessionTimerId); sessionTimerId = null; }
    if (!startTime) return;
    var el = document.getElementById('pt-session-elapsed');
    if (!el) return;
    function update() {
        el.textContent = formatElapsed(Date.now() - startTime);
    }
    update();
    sessionTimerId = setInterval(update, 1000);
}

async function cleanupUnknownGames(data, sessions, dailyStats) {
    var changed = false;
    for (var k in data.games) {
        if (data.games.hasOwnProperty(k) && (!data.games[k].name || data.games[k].name === 'Unknown Game' || !data.games[k].totalMinutes)) {
            delete data.games[k];
            changed = true;
        }
    }
    var cleanSessions = sessions.filter(function(s) { return s.gameName && s.gameName !== 'Unknown Game' && s.startTime && s.durationMinutes > 0; });
    if (cleanSessions.length !== sessions.length) {
        sessions = cleanSessions;
        changed = true;
    }
    if (changed) {
        await Promise.all([
            setStorage(STORAGE_KEY, data),
            setStorage(SESSION_KEY, sessions),
            setStorage(DAILY_KEY, dailyStats)
        ]);
    }
    return { data: data, sessions: sessions };
}

async function init() {
    injectStyles();

    var logoUrl = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_128.png');

    var shell = ''
        + '<div id="purpura-time-root">'
        + '<div class="pt-container">'
        + '<header class="pt-header">'
        + '<img class="pt-logo" src="' + logoUrl + '" alt="Purpura">'
        + '<div class="pt-header-info">'
        + '<h1>Play Time Tracker</h1>'
        + '<p>Your Roblox playtime, tracked locally.</p>'
        + '</div>'
        + '<div class="pt-header-actions">'
        + '<button type="button" class="pt-import-btn" id="pt-import-btn" title="' + msg('settings_playtime_import_btnTitle') + '">'
        + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
        + msg('settings_playtime_import_title')
        + '</button>'
        + '</div>'
        + '</header>'
        + '<div id="pt-dashboard-content">'
        + '<div class="pt-empty"><p>Loading your stats...</p></div>'
        + '</div>'
        + '</div>'
        + '</div>';

    var container = document.querySelector('.content');
    if (container) {
        container.innerHTML = shell;
    } else {
        document.body.innerHTML = shell;
    }

    await refreshPlaytimePresence();

    var data = await getStorage(STORAGE_KEY, { games: {} });
    var dailyStats = await getStorage(DAILY_KEY, []);
    var sessions = await getStorage(SESSION_KEY, []);
    var tracking = await getStorage(TRACKING_KEY, {});

    var cleaned = await cleanupUnknownGames(data, sessions, dailyStats);
    data = cleaned.data;
    sessions = cleaned.sessions;

    sessions.sort(function(a, b) { return b.startTime - a.startTime; });

    var content = document.getElementById('pt-dashboard-content');
    content.innerHTML = buildDashboard(data, sessions, tracking);

    var activeSession = getActiveSession(tracking);
    startSessionTimer(activeSession ? activeSession.startTime : null);

    var importBtn = document.getElementById('pt-import-btn');
    if (importBtn) importBtn.addEventListener('click', function() {
        if (window.__PurpuraRoProImport) window.__PurpuraRoProImport.open();
    });

    window.addEventListener('purpura:playtime-imported', function() {
        renderDashboard();
    });

    if ((window.location.search || '').indexOf('ropro-import=1') !== -1 && window.__PurpuraRoProImport) {
        setTimeout(function() { window.__PurpuraRoProImport.open(); }, 400);
    }

    if (dashboardRefreshTimerId) clearInterval(dashboardRefreshTimerId);
    dashboardRefreshTimerId = setInterval(refreshDashboard, 10000);
}

async function refreshPlaytimePresence() {
    if (dashboardPollInFlight || !chrome.runtime || !chrome.runtime.sendMessage) return;
    dashboardPollInFlight = true;
    try {
        await new Promise(function(resolve) {
            chrome.runtime.sendMessage({ action: 'refreshPlaytimePresence' }, function() {
                resolve();
            });
        });
    } catch (e) {
    } finally {
        dashboardPollInFlight = false;
    }
}

async function renderDashboard() {
    var data = await getStorage(STORAGE_KEY, { games: {} });
    var ses = await getStorage(SESSION_KEY, []);
    ses.sort(function(a, b) { return b.startTime - a.startTime; });
    var trk = await getStorage(TRACKING_KEY, {});
    var c = document.getElementById('pt-dashboard-content');
    if (c) c.innerHTML = buildDashboard(data, ses, trk);
    var as = getActiveSession(trk);
    startSessionTimer(as ? as.startTime : null);
}

async function refreshDashboard() {
    if (!document.getElementById('pt-dashboard-content') || dashboardRefreshInFlight) return;
    dashboardRefreshInFlight = true;
    try {
        await refreshPlaytimePresence();
        await renderDashboard();
    } finally {
        dashboardRefreshInFlight = false;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
