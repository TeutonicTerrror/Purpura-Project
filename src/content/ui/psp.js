/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
function e(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
const t = new URLSearchParams(window.location.search);
if (!t.has("purpura")) {
return;
}
let n = t.get("purpura").toLowerCase();
if (n === "experiences") {
n = "games";
}
if (n === "miscellaneous") {
n = "miscellaneous";
}
const r = [ "info", "credits", "friends", "catalog", "profiles", "avatar", "games", "appearance", "security", "privacy", "experimental", "miscellanious" ];
if (!r.includes(n)) {
return;
}
const a = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
const o = {
valra: chrome.runtime.getURL("images/accreditted/Valra.png"),
cjiggy: chrome.runtime.getURL("images/accreditted/CJiggy.png"),
deluxis: chrome.runtime.getURL("images/accreditted/Deluxis.png")
};
const s = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`;
const i = (() => {
try {
return chrome.runtime.getManifest().version || "unknown";
} catch (e) {
return "unknown";
}
})();
let p = false;
let c = null;
let l = true;
let u = {};
let d = null;
let g = false;
let f = false;
const m = "slr";
const b = "slr-place-id";
const h = 95206881;
const v = "saveLotsRobux_placeId";
const x = new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]);
let y = "";
let w = "";
let k = false;
let E = false;
let _ = "dark";
let C = null;
async function L() {
try {
const e = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const t = e?.theme || "dark";
if (t !== _) {
_ = t;
D();
}
} catch (e) {}
}
async function $() {
if (C) return;
await L();
C = new MutationObserver(() => {
L();
});
const e = {
attributes: true,
attributeFilter: [ "class" ]
};
C.observe(document.documentElement, e);
if (document.body) C.observe(document.body, e);
}
async function S() {
try {
const e = chrome.runtime.getURL("data/default_settings.json");
const t = await fetch(e);
if (t.ok) {
u = await t.json();
return;
}
} catch (e) {}
try {
const e = await new Promise(e => chrome.storage.local.get([ "purpuraDefaultSettings" ], e));
if (e && e.purpuraDefaultSettings) {
u = e.purpuraDefaultSettings;
return;
}
} catch (e) {}
u = {};
}
function P(e, t) {
const n = u[e];
if (n === undefined) return undefined;
if (t) {
if (typeof n === "object" && n !== null && t in n) {
return n[t];
}
return undefined;
}
return n;
}
function T() {
for (const category of Object.values(A)) {
for (const setting of Object.values(category.settings)) {
const settingVal = P(setting.storageKey, setting.storagePath);
if (settingVal !== undefined) {
setting.default = settingVal;
}
if (setting.subSettings) {
for (const subSetting of Object.values(setting.subSettings)) {
const subVal = P(subSetting.storageKey, subSetting.storagePath);
if (subVal !== undefined) {
subSetting.default = subVal;
}
}
}
}
}
}
const M = {
default: {
name: "Default",
cursor: "auto"
},
purpura: {
name: "Purpura",
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cdefs%3E%3ClinearGradient id='ag' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f0e6ff'/%3E%3Cstop offset='100%25' stop-color='%23a78bfa'/%3E%3C/linearGradient%3E%3Cfilter id='gw' x='-40%25' y='-40%25' width='180%25' height='180%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='1.5' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23gw)'%3E%3Cpath d='M4 2L4 22L9 15L13 24L16 22L12 13L20 13Z' fill='url(%23ag)' stroke='%232d1060' stroke-width='1' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E\") 4 2, auto"
},
dot: {
name: "Dot",
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='4' fill='white' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E\") 8 8, auto"
},
bolt: {
name: "Bolt",
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='32' viewBox='0 0 22 32'%3E%3Cdefs%3E%3Cfilter id='gw' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3ClinearGradient id='blg' x1='0%25' y1='0%25' x2='50%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff'/%3E%3Cstop offset='35%25' stop-color='%237dd3fc'/%3E%3Cstop offset='100%25' stop-color='%23facc15'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M15 2L5 17H12L7 30L22 13H14Z' fill='%237dd3fc' opacity='0.5' filter='url(%23gw)'/%3E%3Cpath d='M15 2L5 17H12L7 30L22 13H14Z' fill='url(%23blg)' stroke='%23bfdbfe' stroke-width='0.75' stroke-linejoin='round'/%3E%3C/svg%3E\") 15 2, auto"
},
ghost: {
name: "Ghost",
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='28' viewBox='0 0 22 28'%3E%3Cpath d='M11 2C5.5 2 2 6.5 2 12v14l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5V12C20 6.5 16.5 2 11 2Z' fill='white' stroke='%23111' stroke-width='1.5'/%3E%3Ccircle cx='8' cy='12' r='1.5' fill='%23333'/%3E%3Ccircle cx='14' cy='12' r='1.5' fill='%23333'/%3E%3C/svg%3E\") 11 2, auto"
},
nova: {
name: "Nova",
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cdefs%3E%3ClinearGradient id='ng' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fef9c3'/%3E%3Cstop offset='100%25' stop-color='%23f59e0b'/%3E%3C/linearGradient%3E%3CradialGradient id='ngc' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' stop-color='%23fff7d6'/%3E%3Cstop offset='100%25' stop-color='%23fbbf24'/%3E%3C/radialGradient%3E%3Cfilter id='nf' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='14' cy='14' r='7' fill='%23fde68a' opacity='0.2'/%3E%3Cg stroke='url(%23ng)' stroke-linecap='round'%3E%3Cline x1='14' y1='3' x2='14' y2='10' stroke-width='2'/%3E%3Cline x1='14' y1='18' x2='14' y2='25' stroke-width='2'/%3E%3Cline x1='3' y1='14' x2='10' y2='14' stroke-width='2'/%3E%3Cline x1='18' y1='14' x2='25' y2='14' stroke-width='2'/%3E%3Cline x1='5.8' y1='5.8' x2='10.5' y2='10.5' stroke-width='1.5'/%3E%3Cline x1='17.5' y1='17.5' x2='22.2' y2='22.2' stroke-width='1.5'/%3E%3Cline x1='22.2' y1='5.8' x2='17.5' y2='10.5' stroke-width='1.5'/%3E%3Cline x1='5.8' y1='22.2' x2='10.5' y2='17.5' stroke-width='1.5'/%3E%3C/g%3E%3Ccircle cx='14' cy='14' r='3.5' fill='url(%23ngc)' filter='url(%23nf)'/%3E%3C/svg%3E\") 14 14, auto"
}
};
const A = {
Friends: {
title: e("settings_cat_friends"),
settings: {
friendsManager: {
label: e("settings_friendsManager_label"),
description: [ e("settings_friendsManager_desc") ],
type: "checkbox",
storageKey: "fm",
storageType: "sync",
default: false,
beta: true
},
chatEligibility: {
label: e("settings_chatEligibility_label"),
description: [ e("settings_chatEligibility_desc") ],
type: "checkbox",
storageKey: "ce",
storageType: "sync",
default: true
},        bulkUnfriend: {
            type: "checkbox",
            label: e("settings_bulkUnfriend_label"),
            description: [ e("settings_bulkUnfriend_desc") ],
            storageKey: "bf",
            storageType: "sync",
            default: true
        },
        mostPlayedTogether: {
            type: "checkbox",
            label: e("settings_mostPlayedTogether_label"),
            description: [ e("settings_mostPlayedTogether_desc") ],
            storageKey: "mpt",
            storageType: "sync",
            default: true
        },
        friendOrigin: {
label: e("settings_friendOrigin_label"),
description: [ e("settings_friendOrigin_desc") ],
type: "checkbox",
storageKey: "fo",
storageType: "sync",
default: true
}
}
},
Catalog: {
title: e("settings_cat_catalog"),
settings: {
noRent: {
label: e("settings_noRent_label"),
description: [ e("settings_noRent_desc") ],
type: "checkbox",
storageKey: "nr",
storageType: "sync",
default: true
},
robuxConversations: {
label: e("settings_robuxConversations_label"),
description: [ e("settings_robuxConversations_desc") ],
type: "checkbox",
storageKey: "rconv",
storageType: "sync",
default: true
},
bundleItemViewer: {
label: e("settings_bundleItemViewer_label"),
description: [ e("settings_bundleItemViewer_desc") ],
type: "checkbox",
storageKey: "biv",
storageType: "sync",
default: true
},
unpendingRobux: {
label: e("settings_unpendingRobux_label"),
description: [ e("settings_unpendingRobux_desc1"), e("settings_unpendingRobux_desc2") ],
type: "checkbox",
storageKey: "up",
storageType: "sync",
default: false,
experimental: true
},
totalSpent: {
label: e("settings_totalSpent_label"),
description: [ e("settings_totalSpent_desc") ],
type: "checkbox",
storageKey: "tse",
storageType: "sync",
default: true
},
itemExplorer: {
label: e("settings_itemExplorer_label"),
description: [ e("settings_itemExplorer_desc") ],
type: "checkbox",
storageKey: "explr",
storageType: "sync",
default: true
},
remainingRobux: {
label: e("settings_remainingRobux_label"),
description: [ e("settings_remainingRobux_desc") ],
type: "checkbox",
storageKey: "rr",
storageType: "sync",
default: true
},
priceFloor: {
label: e("settings_priceFloor_label"),
description: [ e("settings_priceFloor_desc") ],
type: "checkbox",
storageKey: "pfl",
storageType: "sync",
default: true
},
offsaleLegacyPrices: {
label: e("settings_offsaleLegacyPrices_label"),
description: [ e("settings_offsaleLegacyPrices_desc") ],
type: "checkbox",
storageKey: "oilp",
storageType: "sync",
default: true
}
}
},
Profiles: {
title: e("settings_cat_profiles"),
settings: {
ghostProfiles: {
label: e("settings_ghostProfiles_label"),
description: [ e("settings_ghostProfiles_desc") ],
type: "checkbox",
storageKey: "ghos",
storageType: "local",
storagePath: "enabled",
default: true,
beta: true,
subSettings: {
webRequestPermission: {
label: e("settings_ghostProfiles_webRequest"),
description: e("settings_ghostProfiles_webRequestDesc"),
storageKey: "ghos",
storagePath: "webRequestPermission",
default: false
}
}
},
lastOnline: {
label: e("settings_lastOnline_label"),
description: [ e("settings_lastOnline_desc") ],
type: "checkbox",
storageKey: "lo",
storageType: "sync",
default: true,
beta: true
}
}
},
Avatar: {
title: e("settings_cat_avatar"),
settings: {
avatarSearch: {
label: e("settings_avatarSearch_label"),
description: [ e("settings_avatarSearch_desc") ],
type: "checkbox",
storageKey: "as",
storageType: "sync",
storagePath: "enabled",
default: true,
subSettings: {
avatarFilters: {
label: e("settings_avatarSearch_filters"),
description: e("settings_avatarSearch_filtersDesc"),
storageKey: "as",
storagePath: "filters",
type: "checkbox",
default: true
}
}
},
infiniteAvatar: {
label: e("settings_infiniteAvatar_label"),
description: [ e("settings_infiniteAvatar_desc") ],
type: "checkbox",
storageKey: "ia",
storageType: "sync",
default: true
},
stickyAvatarPreview: {
label: "Sticky Avatar Preview",
description: [ "Forces the avatar preview to always stay in view while scrolling the avatar editor." ],
type: "checkbox",
storageKey: "sap",
storageType: "local",
default: true
},
r6WarningRemover: {
label: e("settings_r6WarningRemover_label"),
description: [ e("settings_r6WarningRemover_desc") ],
type: "checkbox",
storageKey: "r6w",
storageType: "sync",
default: true
},
avatarCycler: {
label: e("settings_avatarCycler_label"),
description: [ e("settings_avatarCycler_desc") ],
type: "checkbox",
storageKey: "ac",
storageType: "sync",
default: true
}
}
},
Games: {
title: e("settings_cat_games"),
settings: {
botDetector: {
label: e("settings_botDetector_label"),
description: [ e("settings_botDetector_desc") ],
type: "checkbox",
storageKey: "bd",
storageType: "sync",
storagePath: "enabled",
default: true,
subSettings: {
showDatabase: {
label: e("settings_botDetector_showDatabase"),
description: e("settings_botDetector_showDatabaseDesc"),
storageKey: "bd",
storagePath: "showDatabase",
default: true
},
roundToWholeNumbers: {
label: e("settings_botDetector_roundWhole"),
description: e("settings_botDetector_roundWholeDesc"),
storageKey: "bd",
storagePath: "roundToWholeNumbers",
default: true
}
}
},
playtime: {
label: e("settings_playtime_label"),
description: [ e("settings_playtime_desc") ],
type: "checkbox",
storageKey: "plt",
storageType: "sync",
default: true,
openTrackerAction: true
},
serverInfo: {
label: e("settings_serverInfo_label"),
description: [ e("settings_serverInfo_desc") ],
type: "serverinfo-picker",
storageKey: "si",
storageType: "sync",
storagePath: "enabled",
default: true
},
gameLauncherWidget: {
label: e("settings_gameLauncherWidget_label"),
description: [ e("settings_gameLauncherWidget_desc") ],
type: "checkbox",
storageKey: "glw",
storageType: "sync",
default: false
},
pinnedGames: {
label: e("settings_pinnedGames_label"),
description: [ e("settings_pinnedGames_desc") ],
type: "checkbox",
storageKey: "pg",
storageType: "sync",
default: false
},
gameOutfits: {
label: e("settings_gameOutfits_label"),
description: [ e("settings_gameOutfits_desc1"), e("settings_gameOutfits_desc2") ],
type: "checkbox",
storageKey: "go",
storageType: "sync",
storagePath: "enabled",
default: true
},
liveCounters: {
label: e("settings_liveCounters_label"),
description: [ e("settings_liveCounters_desc") ],
type: "checkbox",
storageKey: "lc",
storageType: "sync",
storagePath: "enabled",
default: true,
subSettings: {
likeDislike: {
label: e("settings_liveCounters_likeDislike"),
description: e("settings_liveCounters_likeDislikeDesc"),
type: "checkbox",
storageKey: "lc",
storagePath: "likeDislike",
default: true
},
players: {
label: e("settings_liveCounters_players"),
description: e("settings_liveCounters_playersDesc"),
type: "checkbox",
storageKey: "lc",
storagePath: "players",
default: true
},
visits: {
label: e("settings_liveCounters_visits"),
description: e("settings_liveCounters_visitsDesc"),
type: "checkbox",
storageKey: "lc",
storagePath: "visits",
default: true
}
}
},
shareServerLinks: {
label: e("settings_shareServerLinks_label"),
description: [ e("settings_shareServerLinks_desc") ],
type: "checkbox",
storageKey: "ssl",
storageType: "sync",
default: true
},
gameReviews: {
label: e("settings_gameReviews_label"),
description: [ e("settings_gameReviews_desc") ],
type: "checkbox",
storageKey: "grev",
storageType: "sync",
default: true
},
quickPlay: {
label: e("settings_quickPlay_label"),
description: [ e("settings_quickPlay_desc") ],
type: "checkbox",
storageKey: "qp",
storageType: "sync",
default: true
},
purpurasSelection: {
label: e("settings_purpurasSelection_label"),
description: [ e("settings_purpurasSelection_desc") ],
type: "checkbox",
storageKey: "ps",
storageType: "sync",
default: true
},
betterContinue: {
label: "Better Continue",
description: [ "Sorts Continue based on when you last played each game." ],
type: "checkbox",
storageKey: "bc",
storageType: "local",
default: true,
subSettings: {
autoRefresh: {
label: e("settings_betterContinue_autoRefresh_label"),
description: e("settings_betterContinue_autoRefresh_desc"),
type: "checkbox",
storageKey: "bcAutoRefresh",
storageType: "local",
default: true
}
}
}
}
},
Appearance: {
title: e("settings_cat_appearance"),
settings: {
reworkedSidebar: {
label: e("settings_reworkedSidebar_label"),
description: [ e("settings_reworkedSidebar_desc") ],
type: "checkbox",
storageKey: "sdbr",
storageType: "local",
storagePath: "enabled",
default: false,
subSettings: {
tradeButton: {
label: e("sdbr_tradeButton_label"),
description: e("sdbr_tradeButton_desc"),
storageKey: "sdbr",
storagePath: "tradeButton",
default: false
},
messagesButton: {
label: e("sdbr_messages_label"),
description: e("sdbr_messages_desc"),
storageKey: "sdbr",
storagePath: "messagesButton",
default: false
},
purpuraSettingsButton: {
label: e("sdbr_purpuraSettings_label"),
description: e("sdbr_purpuraSettings_desc"),
storageKey: "sdbr",
storagePath: "purpuraSettingsButton",
default: false
}
}
},
themeManager: {
label: "Theme Editor",
description: [ "Create, edit, share, and use custom themes on the Roblox website with a full color editor." ],
type: "theme-picker",
storageKey: "thmEnabled",
storageType: "local",
default: false
},
hideDownloadButton: {
label: e("settings_hideDownloadButton_label"),
description: [ e("settings_hideDownloadButton_desc") ],
type: "checkbox",
storageKey: "hdb",
storageType: "local",
default: true
},
homePageTweaks: {
label: e("settings_homePageTweaks_label"),
description: [ e("settings_homePageTweaks_desc") ],
type: "checkbox",
storageKey: "hpt",
storageType: "local",
storagePath: "enabled",
default: false,
editLayoutAction: true,
subSettings: {
homePageButton: {
label: e("settings_homePageTweaks_homePageButton"),
description: e("settings_homePageTweaks_homePageButtonDesc"),
storageKey: "hpt",
storagePath: "homePageButton",
default: false
}
}
},
greetings: {
label: e("settings_greetings_label"),
description: [ e("settings_greetings_desc") ],
type: "checkbox",
storageKey: "gr",
storageType: "local",
default: true,
helpIcon: {
title: e("settings_greetings_helpTitle"),
content: [ "**Common** - 82.9% chance", "**Epic** - 14% chance", "**Legendary** - 3% chance", "**Secret** - 0.1% chance" ]
}
},
uncorporatify: {
label: e("settings_uncorporatify_label"),
description: [ e("settings_uncorporatify_desc") ],
type: "uncorporatify-picker",
storageKey: "unc",
storageType: "local",
default: false
},
purpuraCursors: {
label: e("settings_purpuraCursors_label"),
description: [ e("settings_purpuraCursors_desc") ],
type: "cursor-picker",
storageKey: "pcr",
storageType: "local",
storagePath: "enabled",
default: false,
subSettings: {
trailEffects: {
label: e("settings_purpuraCursors_trailEffects"),
description: e("settings_purpuraCursors_trailEffectsDesc"),
storageKey: "pcr",
storagePath: "trailEffects",
default: true
}
}
},
purpuraTabs: {
label: e("settings_purpuraTabs_label"),
description: [ e("settings_purpuraTabs_desc1"), e("settings_purpuraTabs_desc2") ],
type: "tabs-picker",
storageKey: "pt",
storageType: "local",
storagePath: "enabled",
default: false
},
bloatwareRemover: {
label: e("settings_bloatwareRemover_label"),
description: [ e("settings_bloatwareRemover_desc"), "May cause issues for Roblox Plus subscribers." ],
type: "checkbox",
storageKey: "bwr",
storageType: "local",
storagePath: "enabled",
default: false
}
}
},
Security: {
title: "Security",
settings: {
loginBanner: {
label: "Login Security Banner",
description: [ "Adds a banner to the login page to verify you are on the official Roblox website.", "This helps prevent phishing by ensuring you know when you are on the real site." ],
type: "checkbox",
storageKey: "lb",
storageType: "local",
default: false
},
outboundTradeProtection: {
label: e("settings_outboundProtection_label"),
description: [ e("settings_outboundProtection_desc") ],
type: "checkbox",
storageKey: "otp",
storageType: "sync",
storagePath: "enabled",
default: false,
subSettings: {
threshold: {
label: e("settings_outboundProtection_threshold"),
description: e("settings_outboundProtection_thresholdDesc"),
type: "input",
storageKey: "otp",
storagePath: "threshold",
placeholder: "50",
default: "50"
}
}
},
projectedWarnings: {
label: e("settings_projectedWarnings_label"),
description: [ e("settings_projectedWarnings_desc") ],
type: "checkbox",
storageKey: "pwi",
storageType: "sync",
default: true
},
crowdServers: {
label: e("settings_crowdServers_label"),
description: [ e("settings_crowdServers_desc"), e("settings_crowdServers_recommended") ],
type: "checkbox",
storageKey: "cs",
storageType: "sync",
default: true
}
}
},
Privacy: {
title: e("settings_cat_privacy"),
settings: {
streamerMode: {
label: e("settings_streamerMode_label"),
description: [ e("settings_streamerMode_desc") ],
type: "checkbox",
storageKey: "stm",
storageType: "local",
default: false,
helpIcon: {
title: e("settings_streamerMode_helpTitle"),
content: [ "**Blurred on Page:**", "• Username & Display Name", "• Robux Balance & Icons", "• Email Address", "• Phone Number", "• Your name anywhere on the page", "", "**Hidden in API Responses:**", "• Email Address", "• Phone Number", "• Date of Birth", "• Country & Location", "• Previous Usernames", "• Age Verification", "• IP Addresses", "• Session Information", "• Device/OS Details" ]
},
},
quickStatusSwitcher: {
label: e("settings_quickStatusSwitcher_label"),
description: [ e("settings_quickStatusSwitcher_desc") ],
type: "checkbox",
storageKey: "qs",
storageType: "sync",
storagePath: "enabled",
default: true,
subSettings: {
themeIntegration: {
label: e("settings_quickStatusSwitcher_themeIntegration"),
description: e("settings_quickStatusSwitcher_themeIntegrationDesc"),
storageKey: "qs",
storagePath: "themeIntegration",
default: true
}
}
},
statusSpoofer: {
label: e("settings_statusSpoofer_label"),
description: [ e("settings_statusSpoofer_desc"), e("settings_statusSpoofer_note") ],
type: "checkbox",
storageKey: "spc",
storageType: "sync",
storagePath: "enabled",
default: false,
subSettings: {
mode: {
label: e("settings_statusSpoofer_mode"),
description: e("settings_statusSpoofer_modeDesc"),
type: "select",
options: [ "Offline", "In-Studio" ],
storageKey: "spc",
storagePath: "mode",
default: "offline"
}
}
},
blurSerialNumbers: {
label: e("settings_blurSerialNumbers_label"),
description: [ e("settings_blurSerialNumbers_desc") ],
type: "checkbox",
storageKey: "bsn",
storageType: "sync",
default: false
}
}
},
Experimental: {
title: e("settings_cat_experimental"),
settings: {
freeRobloxPlusThemes: {
label: e("settings_freeRobloxPlusThemes_label"),
description: [ e("settings_freeRobloxPlusThemes_desc") ],
type: "checkbox",
storageKey: "frpt",
storageType: "sync",
default: false,
experimental: true,
onChange: function(value) {
if (value) {
chrome.storage.local.set({ thmEnabled: false });
const chk = document.querySelector('[data-setting="themeManager"]');
if (chk) chk.checked = false;
const picker = document.querySelector(".purpura-theme-picker");
if (picker) picker.classList.add("disabled");
}
}
},
robloxAgeTheme: {
label: e("settings_robloxAgeTheme_label"),
description: [ e("settings_robloxAgeTheme_desc") ],
type: "checkbox",
storageKey: "rat",
storageType: "local",
storagePath: "enabled",
default: false,
experimental: true,
subSettings: {
theme: {
label: e("settings_robloxAgeTheme_theme"),
description: e("settings_robloxAgeTheme_themeDesc"),
type: "select",
options: [ "Normal Roblox", "Roblox Kids", "Roblox Select" ],
storageKey: "rat",
storagePath: "theme",
default: "Normal Roblox"
}
}
},
redesignedAvatarEditor: {
label: e("settings_redesignedAvatarEditor_label"),
description: [ e("settings_redesignedAvatarEditor_desc") ],
type: "checkbox",
storageKey: "rae",
storageType: "sync",
default: false,
deprecated: true
},
saveLotsRobux: {
label: e("settings_saveLotsRobux_label"),      description: [ e("settings_saveLotsRobux_desc1") ],
type: "checkbox",
storageKey: "slr",
storageType: "sync",
storagePath: "enabled",
default: false,
experimental: true,
setupGuideAction: true,
subSettings: {
placeId: {
label: e("settings_saveLotsRobux_placeId"),
description: e("settings_saveLotsRobux_placeIdDesc"),
type: "input",
placeholder: e("settings_saveLotsRobux_placeIdPlaceholder"),
storageKey: "slr",
storagePath: "placeId",
default: ""
}
}
}
}
},
Miscellanious: {
title: e("settings_cat_miscellanious"),
settings: {
pageBinds: {
label: e("settings_pageBinds_label"),
description: [ e("settings_pageBinds_desc1"), e("settings_pageBinds_desc2") ],
type: "pagebinds-picker",
storageKey: "pb",
storageType: "sync",
storagePath: "enabled",
default: false
},
legacyThemeSwitcher: {
label: "Legacy Theme Switcher Internals",
description: [ "Remembers your preferred Roblox theme so you don't have to switch it every time you log in on a new browser." ],
type: "checkbox",
storageKey: "lts",
storageType: "local",
default: false
},
enhancedSearch: {
label: e("settings_enhancedSearch_label"),
description: [ e("settings_enhancedSearch_desc") ],
type: "checkbox",
storageKey: "es",
storageType: "sync",
storagePath: "enabled",
default: true,
subSettings: {
userSearch: {
label: e("settings_enhancedSearch_userSearch"),
description: e("settings_enhancedSearch_userSearchDesc"),
storageKey: "es",
storagePath: "userSearch",
type: "checkbox",
default: true
},
gameSearch: {
label: e("settings_enhancedSearch_gameSearch"),
description: e("settings_enhancedSearch_gameSearchDesc"),
storageKey: "es",
storagePath: "gameSearch",
type: "checkbox",
default: true
},
friendSearch: {
label: e("settings_enhancedSearch_friendSearch"),
description: e("settings_enhancedSearch_friendSearchDesc"),
storageKey: "es",
storagePath: "friendSearch",
type: "checkbox",
default: true
},
focusKey: {
label: e("settings_enhancedSearch_focusKey"),
description: e("settings_enhancedSearch_focusKeyDesc"),
storageKey: "es",
storagePath: "focusKey",
type: "checkbox",
default: true
}
}
},
disableVideoAutoplay: {
label: e("settings_disableVideoAutoplay_label"),
description: [ e("settings_disableVideoAutoplay_desc") ],
type: "checkbox",
storageKey: "dva",
storageType: "sync",
default: false
}
}
}
};
const j = {
info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
credits: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
premium: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l4 3 5-6 5 6 4-3-2 12H5L3 7z"/><path d="M8 14h8"/></svg>`,
Friends: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
Catalog: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
Profiles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
Avatar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z"/><path d="M12 14c-7 0-10 3-10 5v1h20v-1c0-2-3-5-10-5z"/></svg>`,
Games: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h.01M18 11h.01"/></svg>`,
Appearance: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.7 3.3a1 1 0 0 0-1.4 0L8 14.6 9.4 16 20.7 4.7a1 1 0 0 0 0-1.4Z"/><path d="M8 14.6 4 17l1 3 3 1 2.4-4"/><path d="M14 8l2-2"/></svg>`,
Security: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
Privacy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
Experimental: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5h16l-5-5V3"/></svg>`,
Miscellanious: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`
};
const B = {
outboundTradeProtection: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7ZM8 12l3 3 5-6"/></svg>`,
projectedWarnings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 10 18H2ZM12 9v5m0 3v1"/></svg>`,
liveCounters: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 14l4-5 4 3 5-8"/></svg>`,
shareServerLinks: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/></svg>`,
gameReviews: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.3l-5.7 2.9 1.1-6.2L2.9 9.6l6.3-.9Z"/></svg>`,
friendsManager: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
chatEligibility: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>`,
friendOrigin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
noRent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
robuxConversations: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
bundleItemViewer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`,
itemExplorer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
saveLotsRobux: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 9h5a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h5"/></svg>`,
priceFloor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 9h5a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h5"/></svg>`,
offsaleLegacyPrices: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 3.9-3.6 8.5-7 13-3.4-4.5-7-9.1-7-13a7 7 0 0 1 7-7z"/><path d="M12 8v6"/><path d="M9 11h6"/></svg>`,
remainingRobux: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-4a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4H8"/><path d="M12 6v2"/><path d="M12 16v2"/></svg>`,
ghostProfiles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
mostPlayedTogether: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
bulkUnfriend: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>`,
lastOnline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
avatarSearch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
infiniteAvatar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/></svg>`,
redesignedAvatarEditor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
stickyAvatarPreview: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M9 3v18"/></svg>`,
r6WarningRemover: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7v3a2 2 0 0 0 1 2l1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1l1-1a2 2 0 0 0 1-2V9a7 7 0 0 0-7-7z"/><path d="M9 16h6"/><line x1="12" y1="12" x2="12" y2="8"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
avatarCycler: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.9-4M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14.9 4M20 19v-4h-4"/></svg>`,
botDetector: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
gameLauncherWidget: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
pinnedGames: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 3h6l-1 7 3 3H7l3-3-1-7Z"/></svg>`,
quickPlay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
pageBinds: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 1 0 6H6a3 3 0 0 1 0-6z"/><path d="M6 21a3 3 0 0 1 0-6h12a3 3 0 0 1 0 6z"/><path d="M15 6v12"/><path d="M9 6v12"/></svg>`,
homePageTweaks: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
reworkedSidebar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`,
betterContinue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
uncorporatify: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
streamerMode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
blurSerialNumbers: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
enhancedSearch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
disableVideoAutoplay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>`,
statusSpoofer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
quickStatusSwitcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
bloatwareRemover: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
greetings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
legacyThemeSwitcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
unpendingRobux: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 9h5a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h5"/></svg>`,
totalSpent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>`,
purpuraCursors: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-7 1-4 7-3-17z"/></svg>`,
purpuraTabs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
themeManager: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.477-1.125-.29-.289-.467-.683-.467-1.125a1.64 1.64 0 0 1 1.64-1.64h1.96c3.573 0 6.267-2.866 6.267-6.4 0-5.079-4.499-9.062-10-9.062z"/></svg>`,
freeRobloxPlusThemes: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>`,
crowdServers: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
gameOutfits: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>`,
playtime: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
purpurasSelection: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
robloxAgeTheme: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
hideDownloadButton: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
loginBanner: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`
};
function I(e) {
const t = B[e];
if (!t) return "";
return `<div class="p-setting-icon">${t}</div>`;
}
function D() {
const e = _ === "light";
const t = document.getElementById("purpura-settings-styles");
if (t) t.remove();
const n = document.createElement("style");
n.id = "purpura-settings-styles";
n.textContent = `\n        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');\n\n        [data-purpura-id="purpura-account-settings-h1"],\n        h1.settings-header,\n        .settings-header {\n            display: none !important;\n        }\n\n        \n        .purpura-settings-root,\n        .purpura-theme-modal {\n            ${e ? `\n            --p-text:        #111113;\n            --p-text-2:      #4b4b55;\n            --p-text-3:      #8a8a95;\n            --p-bg:          #f2f2f5;\n            --p-surface:     #ffffff;\n            --p-card:        #ffffff;\n            --p-card-hover:  #f8f8fb;\n            --p-accent:      #7c3aed;\n            --p-accent-dim:  #6d28d9;\n            --p-accent-glow: rgba(124, 58, 237, 0.10);\n            --p-accent-glow-strong: rgba(124, 58, 237, 0.20);\n            --p-border:      rgba(0, 0, 0, 0.07);\n            --p-border-2:    rgba(0, 0, 0, 0.13);\n\n            --p-beta:        #1d6fb8;\n            --p-danger:      #dc2626;\n            --p-success:     #16a34a;\n            ` : `\n            --p-text:        #f0eeff;\n            --p-text-2:      #a89ec4;\n            --p-text-3:      #6d6487;\n            --p-bg:          #0b0c10;\n            --p-surface:     #111219;\n            --p-card:        #161720;\n            --p-card-hover:  #1c1d28;\n            --p-accent:      #9b6dff;\n            --p-accent-dim:  #6b44c7;\n            --p-accent-glow: rgba(155, 109, 255, 0.10);\n            --p-accent-glow-strong: rgba(155, 109, 255, 0.20);\n            --p-border:      rgba(255,255,255,0.07);\n            --p-border-2:    rgba(255,255,255,0.12);\n\n            --p-beta:        #4da1f5;\n            --p-danger:      #f87171;\n            --p-success:     #4ade80;\n            `}\n            --p-radius-sm:   6px;\n            --p-radius:      10px;\n            --p-radius-lg:   14px;\n            --p-radius-xl:   18px;\n            --p-ease:        cubic-bezier(0.22, 1, 0.36, 1);\n            --p-ease-back:   cubic-bezier(0.34, 1.3, 0.64, 1);\n            --p-font:        'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n        }\n\n        .purpura-settings-root * { box-sizing: border-box; }\n\n        \n        .purpura-settings-root ::-webkit-scrollbar { width: 5px; }\n        .purpura-settings-root ::-webkit-scrollbar-track { background: transparent; }\n        .purpura-settings-root ::-webkit-scrollbar-thumb {\n            background: ${e ? "rgba(124, 58, 237, 0.20)" : "rgba(155,109,255,0.3)"};\n            border-radius: 99px;\n        }\n        .purpura-settings-root ::-webkit-scrollbar-thumb:hover {\n            background: ${e ? "rgba(124, 58, 237, 0.35)" : "rgba(155,109,255,0.5)"};\n        }\n\n        \n        .purpura-settings-root {\n            font-family: var(--p-font);\n            background: var(--color-surface-0, var(--p-bg));\n            color: var(--p-text);\n            padding: 28px 24px;\n            min-height: 600px;\n        }\n\n        .purpura-content {\n            width: 100%;\n            max-width: 1040px;\n            margin: 0 auto;\n        }\n\n        .purpura-page-content {\n            display: flex;\n            flex-direction: column;\n            width: 100%;\n        }\n\n        \n        .purpura-header {\n            display: flex;\n            align-items: center;\n            margin-bottom: 32px;\n            font-size: 22px;\n            font-weight: 700;\n            letter-spacing: -0.5px;\n            color: var(--p-text);\n        }\n\n        .purpura-header-logo {\n            width: 40px;\n            height: 40px;\n            margin-right: 14px;\n            border-radius: var(--p-radius);\n            object-fit: contain;\n            background: transparent;\n            box-shadow: none;\n            mix-blend-mode: normal;\n            image-rendering: auto;\n        }\n\n        .purpura-header-title-text {\n            background: linear-gradient(135deg, #c4a7ff 0%, #9b6dff 50%, #7c4dff 100%);\n            -webkit-background-clip: text;\n            -webkit-text-fill-color: transparent;\n            background-clip: text;\n        }\n\n        \n        .purpura-settings-footer {
            margin-top: 28px;
            padding: 12px 18px;
            background: var(--p-surface);
            border: 1px solid var(--p-border);
            border-radius: var(--p-radius-lg);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            color: var(--p-text-2);
            font-size: 13px;
            font-weight: 400;
        }

        #purpura-settings-container { display: block; width: 100%; }\n\n        #purpura-ui-container {\n            display: flex;\n            flex-direction: row;\n            gap: 20px;\n            align-items: flex-start;\n            width: 100%;\n        }\n\n        \n        .purpura-sidebar {\n            width: 196px;\n            flex-shrink: 0;\n            list-style: none;\n            padding: 10px;\n            margin: 0;\n            background: var(--p-surface);\n            border-radius: var(--p-radius-lg);\n            border: 1px solid var(--p-border);\n            position: sticky;\n            top: 20px;\n        }\n\n        .purpura-sidebar .purpura-menu-item {\n            list-style: none;\n            margin-bottom: 1px;\n            position: relative;\n        }\n\n        .purpura-sidebar .purpura-menu-link {\n            display: flex;\n            align-items: center;\n            gap: 9px;\n            padding: 9px 12px;\n            color: var(--p-text-2);\n            text-decoration: none;\n            font-size: 13px;\n            font-weight: 500;\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            transition: background 0.15s var(--p-ease), color 0.15s var(--p-ease), padding-left 0.2s var(--p-ease);\n            position: relative;\n        }\n\n        .purpura-sidebar .purpura-menu-link .p-nav-icon {\n            width: 16px;\n            height: 16px;\n            flex-shrink: 0;\n            opacity: 0.55;\n            transition: opacity 0.15s;\n        }\n\n        .purpura-sidebar .purpura-menu-link:hover {\n            background: rgba(155,109,255,0.08);\n            color: var(--p-text);\n        }\n\n        .purpura-sidebar .purpura-menu-link:hover .p-nav-icon { opacity: 0.8; }\n\n        .purpura-sidebar .purpura-menu-link.active {\n            background: rgba(155,109,255,0.10);\n            color: var(--p-text);\n            font-weight: 600;\n            padding-left: 14px;\n        }\n\n        .purpura-sidebar .purpura-menu-link.active .p-nav-icon { opacity: 1; }\n\n        .purpura-sidebar .purpura-menu-link.active::before {\n            content: '';\n            position: absolute;\n            left: 0;\n            top: 20%;\n            bottom: 20%;\n            width: 3px;\n            background: var(--p-accent);\n            border-radius: 0 3px 3px 0;\n            animation: p-bar-in 0.25s var(--p-ease-back) forwards;\n        }\n\n        @keyframes p-bar-in {\n            from { transform: scaleY(0); opacity: 0; }\n            to   { transform: scaleY(1); opacity: 1; }\n        }\n\n        .purpura-menu-separator {\n            height: 1px;\n            background: var(--p-border);\n            margin: 8px 4px;\n            list-style: none;\n        }\n\n        \n        .purpura-search-container {\n            margin-bottom: 8px;\n            padding: 0 2px;\n        }\n\n        #purpura-search-input {\n            width: 100%;\n            padding: 7px 8px 7px 28px;\n            border-radius: var(--p-radius);\n            font-size: 12px;\n            border: 1px solid var(--p-border);\n            background: var(--p-bg);\n            color: var(--p-text);\n            transition: border-color 0.2s, box-shadow 0.2s;\n            font-family: var(--p-font);\n            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236d6487' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");\n            background-repeat: no-repeat;\n            background-position: 8px center;\n            box-sizing: border-box;\n        }\n\n        #purpura-search-input:focus {\n            outline: none;\n            border-color: var(--p-accent);\n            box-shadow: 0 0 0 3px var(--p-accent-glow);\n        }\n\n        #purpura-search-input::placeholder { color: var(--p-text-3); }\n\n        \n        #purpura-content-area {\n            flex: 1;\n            min-width: 0;\n            min-height: 340px;\n            overflow: visible;\n            padding-right: 4px;\n            touch-action: pan-y;\n        }\n        #purpura-content-area::-webkit-scrollbar { width: 0px; }\n        #purpura-content-area::-webkit-scrollbar-track { background: transparent; }\n        #purpura-content-area::-webkit-scrollbar-thumb { background: transparent; }\n        #purpura-section-content { width: 100%; }\n\n        \n        @keyframes p-section-in {\n            from { opacity: 0; transform: translateY(8px); }\n            to   { opacity: 1; transform: translateY(0); }\n        }\n\n        #purpura-section-content > * {\n            animation: p-section-in 0.22s var(--p-ease) forwards;\n        }\n\n        \n        @keyframes p-card-in {\n            from { opacity: 0; transform: translateY(6px); }\n            to   { opacity: 1; transform: translateY(0); }\n        }\n\n        .purpura-setting-card {\n            opacity: 0;\n            animation: p-card-in 0.28s var(--p-ease) forwards;\n        }\n\n        .purpura-setting-card:nth-child(1)  { animation-delay: 0.00s; }\n        .purpura-setting-card:nth-child(2)  { animation-delay: 0.04s; }\n        .purpura-setting-card:nth-child(3)  { animation-delay: 0.08s; }\n        .purpura-setting-card:nth-child(4)  { animation-delay: 0.12s; }\n        .purpura-setting-card:nth-child(5)  { animation-delay: 0.16s; }\n        .purpura-setting-card:nth-child(6)  { animation-delay: 0.20s; }\n        .purpura-setting-card:nth-child(7)  { animation-delay: 0.24s; }\n        .purpura-setting-card:nth-child(8)  { animation-delay: 0.28s; }\n\n        \n        .purpura-setting-card {\n            display: flex;\n            flex-direction: column;\n            font-size: 14px;\n            margin: 0 0 10px 0;\n            background: var(--p-card);\n            color: var(--p-text);\n            border-radius: var(--p-radius-lg);\n            padding: 16px 18px;\n            border: 1px solid var(--p-border);\n            \n            box-shadow: ${e ? "0 1px 3px rgba(0, 0, 0, 0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)"};\n            transition: border-color 0.2s var(--p-ease), background 0.2s var(--p-ease), box-shadow 0.2s var(--p-ease);\n        }\n\n        .purpura-setting-card:hover {\n            border-color: ${e ? "rgba(124, 58, 237, 0.20)" : "rgba(155,109,255,0.18)"};\n            background: var(--p-card-hover);\n            box-shadow: ${e ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(155,109,255,0.06)"};\n        }\n\n        .purpura-setting-card.child-setting {\n            margin-left: 28px;\n            margin-top: 8px;\n            background: var(--p-surface);\n            border-left: 2px solid var(--p-accent);\n            opacity: 0.9;\n        }\n\n        .purpura-setting-card.child-setting.parent-disabled {\n            opacity: 0.38;\n            pointer-events: none;\n            filter: saturate(0.3);\n        }\n\n        .purpura-setting-header {\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            margin-bottom: 10px;\n            color: var(--p-text);\n        }\n\n        \n        .p-setting-icon {\n            width: 30px;\n            height: 30px;\n            border-radius: var(--p-radius-sm);\n            background: rgba(155,109,255,0.12);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            flex-shrink: 0;\n            margin-right: 4px;\n            transition: background 0.2s;\n        }\n\n        .p-setting-icon svg {\n            width: 15px;\n            height: 15px;\n            color: var(--p-accent);\n            stroke: currentColor;\n        }\n\n        .p-setting-icon img {\n            width: 20px;\n            height: 20px;\n            object-fit: contain;\n        }\n\n        .purpura-setting-card:hover .p-setting-icon {\n            background: rgba(155,109,255,0.2);\n        }\n\n        .purpura-setting-header > label:not(.purpura-toggle) {\n            color: var(--p-text);\n            font-weight: 600;\n            font-size: 14px;\n            flex: 1;\n        }\n\n        .purpura-setting-header > .purpura-toggle {\n            flex: 0 0 auto;\n        }\n\n        .purpura-setting-divider {\n            height: 1px;\n            background: var(--p-border);\n            margin-bottom: 10px;\n        }\n\n        .purpura-setting-desc {\n            color: var(--p-text-2);\n            font-size: 13px;\n            line-height: 1.65;\n            margin-bottom: 5px;\n        }\n\n        .purpura-setting-desc:last-child { margin-bottom: 0; }\n\n        .purpura-setting-desc strong {\n            font-weight: 600;\n            color: var(--p-text);\n        }\n\n        \n        .purpura-toggle {\n            position: relative;\n            display: inline-block;\n            width: 38px;\n            height: 22px;\n            flex-shrink: 0;\n            margin-left: auto;\n        }\n\n        .purpura-toggle input { opacity: 0; width: 0; height: 0; }\n\n        .purpura-toggle-slider {\n            position: absolute;\n            cursor: pointer;\n            inset: 0;\n            background: ${e ? "#c8c8d0" : "#2a2b36"};\n            transition: background 0.25s var(--p-ease);\n            border-radius: 99px;\n            border: 1px solid rgba(255,255,255,0.07);\n        }\n\n        .purpura-toggle-slider::before {\n            position: absolute;\n            content: '';\n            height: 16px;\n            width: 16px;\n            left: 3px;\n            bottom: 2px;\n            background: #fff;\n            transition: transform 0.3s var(--p-ease-back), box-shadow 0.2s;\n            border-radius: 50%;\n            box-shadow: ${e ? "0 1px 4px rgba(0, 0, 0, 0.25)" : "0 1px 3px rgba(0,0,0,0.4)"};\n        }\n\n        .purpura-toggle input:checked + .purpura-toggle-slider {\n            background: var(--p-accent);\n            border-color: transparent;\n        }\n\n        .purpura-toggle input:checked + .purpura-toggle-slider::before {\n            transform: translateX(16px);\n            box-shadow: 0 0 6px rgba(155,109,255,0.5);\n        }\n\n        .purpura-toggle input:disabled + .purpura-toggle-slider {\n            opacity: 0.4;\n            cursor: not-allowed;\n        }\n\n        \n        .purpura-toggle-slider::after {\n            content: '';\n            position: absolute;\n            inset: -4px;\n            border-radius: 99px;\n            background: var(--p-accent-glow);\n            opacity: 0;\n            transition: opacity 0.3s;\n        }\n\n        .purpura-toggle input:focus-visible + .purpura-toggle-slider::after { opacity: 1; }\n\n        \n        .purpura-pill {\n            display: inline-flex;\n            align-items: center;\n            gap: 5px;\n            padding: 4px 10px;\n            min-height: 22px;\n            border-radius: 99px;\n            font-size: 11px;\n            font-weight: 700;\n            line-height: 1;\n            cursor: default;\n            text-transform: uppercase;\n            letter-spacing: 0.5px;\n            position: relative;\n            overflow: hidden;\n        }\n\n        .purpura-pill::after {\n            content: '';\n            position: absolute;\n            inset: 0;\n            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);\n            transform: translateX(-100%);\n        }\n\n        .purpura-pill:hover::after {\n            animation: p-pill-shimmer 0.6s ease forwards;\n        }\n\n        @keyframes p-pill-shimmer {\n            to { transform: translateX(100%); }\n        }\n\n        .purpura-pill.premium {\n            background: rgba(240,180,41,0.15);\n            border: 1px solid rgba(240,180,41,0.35);\n            color: var(--p-premium);\n        }\n\n        .purpura-pill.coming-soon {\n            background: rgba(230,114,44,0.15);\n            border: 1px solid rgba(230,114,44,0.3);\n            color: #f09a5a;\n        }\n\n        .purpura-pill.beta {\n            background: rgba(77,161,245,0.15);\n            border: 1px solid rgba(77,161,245,0.3);\n            color: var(--p-beta);\n        }\n\n        .purpura-pill.experimental {\n            background: rgba(234,179,8,0.15);\n            border: 1px solid rgba(234,179,8,0.3);\n            color: #eab308;\n        }\n\n        .purpura-pill.deprecated {\n            background: rgba(220,38,38,0.15);\n            border: 1px solid rgba(220,38,38,0.32);\n            color: #dc2626;\n        }\n\n        .purpura-setting-card.is-deprecated {\n            opacity: 0.52;\n            pointer-events: none;\n            filter: saturate(0.35) grayscale(0.15);\n        }\n        .purpura-setting-card.is-deprecated .purpura-toggle input:checked + .purpura-toggle-slider {\n            background: #6b7280;\n            border-color: transparent;\n        }\n        .purpura-setting-card.is-deprecated .purpura-setting-desc {\n            opacity: 0.75;\n        }\n\n        \n        .purpura-help-icon {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            width: 18px;\n            height: 18px;\n            border-radius: 50%;\n            background: var(--p-surface);\n            border: 1px solid var(--p-border-2);\n            color: var(--p-text-2);\n            font-size: 10px;\n            font-weight: 700;\n            cursor: pointer;\n            transition: all 0.2s;\n            position: relative;\n        }\n\n        .purpura-help-icon:hover {\n            background: var(--p-accent);\n            border-color: var(--p-accent);\n            color: #fff;\n            transform: scale(1.1);\n        }\n\n        .purpura-help-tooltip {\n            display: none !important;\n        }\n\n        #purpura-floating-tooltip {\n            position: fixed;\n            background: ${e ? "#ffffff" : "#1e1f2e"};\n            border: 1px solid var(--p-border-2);\n            border-radius: var(--p-radius);\n            padding: 12px 14px;\n            min-width: 190px;\n            max-width: 300px;\n            max-height: 420px;\n            overflow-y: auto;\n            box-shadow: ${e ? "0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.08)" : "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(155,109,255,0.1)"};\n            color: var(--p-text);\n            z-index: 999999;\n            opacity: 0;\n            visibility: hidden;\n            scrollbar-width: none;\n        }\n\n        #purpura-floating-tooltip::-webkit-scrollbar { width: 0; height: 0; }\n\n        #purpura-floating-tooltip.visible {\n            pointer-events: none;\n            transition: opacity 0.15s, visibility 0.15s;\n        }\n\n        #purpura-floating-tooltip.visible {\n            opacity: 1;\n            visibility: visible;\n        }\n\n        #purpura-floating-tooltip::after {\n            content: '';\n            position: absolute;\n            left: var(--p-arrow-left, 50%);\n            transform: translateX(-50%);\n            border: 6px solid transparent;\n        }\n\n        #purpura-floating-tooltip.arrow-below::after {\n            top: 100%;\n            border-top-color: var(--p-border-2);\n        }\n\n        #purpura-floating-tooltip.arrow-above::after {\n            bottom: 100%;\n            border-bottom-color: var(--p-border-2);\n        }\n\n        #purpura-floating-tooltip.pill-beta-tip {\n            background: rgba(77,161,245,0.25);\n            backdrop-filter: blur(16px);\n            -webkit-backdrop-filter: blur(16px);\n            border-color: rgba(77,161,245,0.5);\n        }\n        #purpura-floating-tooltip.pill-beta-tip.arrow-below::after {\n            border-top-color: rgba(77,161,245,0.4);\n        }\n        #purpura-floating-tooltip.pill-beta-tip.arrow-above::after {\n            border-bottom-color: rgba(77,161,245,0.4);\n        }\n\n        #purpura-floating-tooltip.pill-experimental-tip {\n            background: rgba(234,179,8,0.25);\n            backdrop-filter: blur(16px);\n            -webkit-backdrop-filter: blur(16px);\n            border-color: rgba(234,179,8,0.5);\n        }\n        #purpura-floating-tooltip.pill-experimental-tip.arrow-below::after {\n            border-top-color: rgba(234,179,8,0.4);\n        }\n        #purpura-floating-tooltip.pill-experimental-tip.arrow-above::after {\n            border-bottom-color: rgba(234,179,8,0.4);\n        }\n\n        #purpura-floating-tooltip.pill-deprecated-tip {\n            background: rgba(220,38,38,0.22);\n            backdrop-filter: blur(16px);\n            -webkit-backdrop-filter: blur(16px);\n            border-color: rgba(220,38,38,0.45);\n        }\n        #purpura-floating-tooltip.pill-deprecated-tip.arrow-below::after {\n            border-top-color: rgba(220,38,38,0.40);\n        }\n        #purpura-floating-tooltip.pill-deprecated-tip.arrow-above::after {\n            border-bottom-color: rgba(220,38,38,0.40);\n        }\n\n        .purpura-help-tooltip-title {\n            font-size: 12px;\n            font-weight: 600;\n            color: var(--p-text);\n            margin-bottom: 8px;\n            border-bottom: 1px solid var(--p-border);\n            padding-bottom: 6px;\n        }\n\n        .purpura-help-tooltip-item {\n            font-size: 11px;\n            color: var(--p-text-2);\n            padding: 2px 0;\n        }\n\n        .purpura-help-tooltip-item strong { color: var(--p-text); }\n\n        \n        .purpura-sub-setting {\n            margin-top: 10px;\n            padding: 11px 13px;\n            background: ${e ? "#f5f5f7" : "var(--p-bg)"};\n            border-radius: var(--p-radius);\n            border-left: 2px solid ${e ? "rgba(124, 58, 237, 0.40)" : "rgba(107, 68, 199, 0.5)"};\n            animation: p-subsetting-in 0.2s var(--p-ease) forwards;\n        }\n\n        @keyframes p-subsetting-in {\n            from { opacity: 0; transform: translateX(-4px); }\n            to   { opacity: 1; transform: translateX(0); }\n        }\n\n        .purpura-sub-setting-row {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n        }\n\n        .purpura-sub-setting-row label:first-child {\n            font-size: 13px;\n            color: var(--p-text);\n            font-weight: 500;\n        }\n\n        .purpura-sub-setting-row input[type="text"] {\n            margin-left: 10px;\n            width: min(260px, 52%);\n            min-width: 172px;\n            padding: 8px 11px;\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border-2);\n            background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)) var(--p-surface);\n            color: var(--p-text);\n            font-family: var(--p-font);\n            font-size: 13px;\n            transition: border-color 0.15s, box-shadow 0.15s;\n        }\n\n        .purpura-sub-setting-row input[type="text"]::placeholder {\n            color: var(--p-text-3);\n        }\n\n        .purpura-sub-setting-row input[type="text"]:focus {\n            outline: none;\n            border-color: var(--p-accent);\n            box-shadow: 0 0 0 3px var(--p-accent-glow);\n        }\n\n        .purpura-sub-setting-desc {\n            font-size: 12px;\n            color: var(--p-text-3);\n            margin-top: 5px;\n        }\n\n        .purpura-sub-setting.disabled {\n            opacity: 0.38;\n            pointer-events: none;\n            filter: saturate(0.3);\n        }\n\n        \n        .purpura-native-select {\n            position: absolute !important;\n            width: 1px !important;\n            height: 1px !important;\n            padding: 0 !important;\n            margin: -1px !important;\n            overflow: hidden !important;\n            clip: rect(0 0 0 0) !important;\n            clip-path: inset(50%) !important;\n            border: 0 !important;\n            white-space: nowrap !important;\n            opacity: 0 !important;\n            pointer-events: none !important;\n        }\n\n        .purpura-custom-select {\n            position: relative;\n            margin-left: 10px;\n            min-width: 174px;\n            flex: 0 0 auto;\n            z-index: 2;\n        }\n\n        .purpura-setting-card:has(.purpura-custom-select.open),\n        .purpura-sub-setting:has(.purpura-custom-select.open) {\n            overflow: visible;\n        }\n\n        .purpura-sub-setting-row .purpura-custom-select {\n            min-width: 156px;\n        }\n\n        .purpura-custom-select-trigger {\n            width: 100%;\n            padding: 8px 34px 8px 11px;\n            font-size: 13px;\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border-2);\n            background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)) var(--p-surface);\n            color: var(--p-text);\n            font-family: var(--p-font);\n            text-align: left;\n            cursor: pointer;\n            position: relative;\n            transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;\n        }\n\n        .purpura-custom-select-trigger::after {\n            content: '';\n            position: absolute;\n            right: 12px;\n            top: 50%;\n            width: 10px;\n            height: 6px;\n            transform: translateY(-50%);\n            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236d6487' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");\n            background-repeat: no-repeat;\n            background-size: 10px 6px;\n            opacity: 0.9;\n            transition: transform 0.18s var(--p-ease), opacity 0.18s var(--p-ease);\n        }\n\n        .purpura-custom-select-trigger:hover {\n            border-color: var(--p-border);\n        }\n\n        .purpura-custom-select.open .purpura-custom-select-trigger,\n        .purpura-custom-select-trigger:focus-visible {\n            outline: none;\n            border-color: var(--p-accent);\n            box-shadow: 0 0 0 3px var(--p-accent-glow);\n        }\n\n        .purpura-custom-select.open .purpura-custom-select-trigger::after {\n            transform: translateY(-50%) rotate(180deg);\n        }\n\n        .purpura-custom-select.disabled .purpura-custom-select-trigger {\n            opacity: 0.42;\n            cursor: not-allowed;\n        }\n\n        .purpura-custom-select-menu {\n            position: absolute;\n            left: 0;\n            right: 0;\n            top: calc(100% + 6px);\n            padding: 6px;\n            border-radius: 10px;\n            border: 1px solid var(--p-border-2);\n            background: ${e ? "rgba(252, 252, 254, 0.98)" : "rgba(14, 15, 21, 0.98)"};\n            box-shadow: ${e ? "0 14px 28px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(0, 0, 0, 0.03)" : "0 14px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)"};\n            max-height: 230px;\n            overflow-y: auto;\n            opacity: 0;\n            transform: translateY(-6px) scale(0.98);\n            pointer-events: none;\n            transition: opacity 0.16s var(--p-ease), transform 0.16s var(--p-ease);\n            z-index: 999;\n        }\n\n        .purpura-custom-select.open .purpura-custom-select-menu,\n        .purpura-custom-select-menu.is-floating {\n            opacity: 1;\n            transform: translateY(0) scale(1);\n            pointer-events: auto;\n        }\n\n        .purpura-custom-select-menu.is-floating {\n            position: fixed;\n            z-index: 999999;\n        }\n\n        .purpura-custom-select-option {\n            width: 100%;\n            border: 0;\n            border-radius: 8px;\n            padding: 8px 10px;\n            background: transparent;\n            color: var(--p-text-2);\n            font-size: 12.5px;\n            font-family: var(--p-font);\n            text-align: left;\n            cursor: pointer;\n            transition: background 0.12s, color 0.12s;\n        }\n\n        .purpura-custom-select-option:hover,\n        .purpura-custom-select-option:focus-visible {\n            outline: none;\n            color: var(--p-text);\n            background: ${e ? "rgba(124, 58, 237, 0.10)" : "rgba(128, 95, 214, 0.22)"};\n        }\n\n        .purpura-custom-select-option.selected {\n            color: var(--p-text);\n            background: ${e ? "rgba(124, 58, 237, 0.14)" : "rgba(128, 95, 214, 0.32)"};\n            font-weight: 600;\n        }\n\n        .purpura-custom-select-option.disabled {\n            opacity: 0.35;\n            cursor: not-allowed;\n        }\n\n        .purpura-custom-select-menu::-webkit-scrollbar {\n            width: 6px;\n        }\n\n        .purpura-custom-select-menu::-webkit-scrollbar-thumb {\n            background: ${e ? "rgba(0, 0, 0, 0.15)" : "rgba(255,255,255,0.2)"};\n            border-radius: 6px;\n        }\n\n        @media (max-width: 768px) {\n            .purpura-custom-select {\n                min-width: 140px;\n                max-width: 58%;\n            }\n        }\n\n        \n        .purpura-info-wrapper {\n            position: relative;\n            overflow: hidden;\n            background: ${e ? `\n                radial-gradient(120% 100% at 0% 0%, rgba(124, 58, 237, 0.06) 0%, rgba(124, 58, 237, 0) 52%),\n                #ffffff;\n            ` : `\n                radial-gradient(120% 100% at 0% 0%, rgba(155,109,255,0.12) 0%, rgba(155,109,255,0) 52%),\n                linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)),\n                var(--p-card);\n            `};\n            padding: 26px;\n            border-radius: var(--p-radius-lg);\n            border: 1px solid var(--p-border-2);\n            box-shadow: ${e ? "0 1px 4px rgba(0, 0, 0, 0.06)" : "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 28px rgba(0,0,0,0.22)"};\n            animation: p-section-in 0.22s var(--p-ease) forwards;\n        }\n\n        .purpura-info-wrapper h2 {\n            margin: 0 0 12px 0;\n            color: var(--p-text);\n            font-size: 21px;\n            font-weight: 700;\n            letter-spacing: 0.01em;\n        }\n\n        .purpura-info-wrapper p {\n            color: var(--p-text-2);\n            margin: 0 0 11px 0;\n            line-height: 1.74;\n            font-size: 13.5px;\n            max-width: 70ch;\n        }\n\n        .purpura-info-wrapper a {\n            color: var(--p-accent);\n            text-decoration: none;\n        }\n\n        .purpura-info-wrapper a:hover { text-decoration: underline; }\n\n        .purpura-info-wrapper ul {\n            margin: 12px 0 0;\n            padding-left: 20px;\n            color: var(--p-text-2);\n            line-height: 2;\n        }\n\n        .purpura-info-wrapper li strong { color: var(--p-text); }\n\n        .purpura-credits-grid {\n            margin-top: 12px;\n            display: grid;\n            grid-template-columns: repeat(3, minmax(0, 1fr));\n            gap: 10px;\n            align-items: stretch;\n        }\n\n        .purpura-credit-card {\n            background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));\n            border: 1px solid var(--p-border-2);\n            border-radius: calc(var(--p-radius) + 2px);\n            padding: 10px;\n            display: grid;\n            grid-template-columns: 72px minmax(0, 1fr);\n            grid-template-areas:\n                'avatar head'\n                'reason reason'\n                'discord discord';\n            grid-template-rows: auto 1fr auto;\n            column-gap: 10px;\n            row-gap: 7px;\n            align-items: start;\n            min-height: 0;\n            height: 100%;\n            transition: border-color 0.18s var(--p-ease), background 0.18s var(--p-ease), transform 0.18s var(--p-ease);\n        }\n\n        .purpura-credit-card:hover {\n            border-color: rgba(155,109,255,0.26);\n            background: linear-gradient(180deg, rgba(155,109,255,0.10), rgba(155,109,255,0.04));\n            transform: translateY(-1px);\n        }\n\n        .purpura-credit-avatar-wrap {\n            grid-area: avatar;\n            width: 72px;\n            height: 72px;\n            border-radius: calc(var(--p-radius) + 2px);\n            overflow: hidden;\n            border: 1px solid var(--p-border);\n            background: #0d0e13;\n        }\n\n        .purpura-credit-avatar {\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n            display: block;\n        }\n\n        .purpura-credit-head {\n            grid-area: head;\n            min-width: 0;\n        }\n\n        .purpura-credit-name {\n            margin: 0;\n            color: var(--p-text);\n            font-size: 14px;\n            font-weight: 700;\n            line-height: 1.3;\n        }\n\n        .purpura-credit-reason {\n            grid-area: reason;\n            margin: 0;\n            color: var(--p-text-2);\n            font-size: 11.5px;\n            line-height: 1.48;\n        }\n\n        .purpura-credit-discord {\n            grid-area: discord;\n            display: flex;\n            align-items: center;\n            gap: 7px;\n            border: 1px solid ${e ? "rgba(124, 58, 237, 0.20)" : "rgba(155,109,255,0.30)"};\n            background: ${e ? "rgba(124, 58, 237, 0.12)" : "linear-gradient(180deg, rgba(124,77,255,0.22), rgba(124,77,255,0.14))"};\n            border-radius: 9px;\n            min-height: 30px;\n            padding: 0 9px;\n            width: 100%;\n            overflow: hidden;\n        }\n\n        .purpura-credit-discord svg {\n            width: 12px;\n            height: 12px;\n            color: ${e ? "var(--p-accent)" : "#cbb4ff"};\n            flex: 0 0 auto;\n        }\n\n        .purpura-credit-discord-label {\n            color: ${e ? "var(--p-accent-dim)" : "#d7c5ff"};\n            font-size: 11.2px;\n            font-weight: 700;\n            line-height: 1;\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n            min-width: 0;\n        }\n\n        .purpura-credits-wrapper .purpura-info-divider {\n            margin-top: 12px;\n            padding-top: 12px;\n        }\n\n        .purpura-credits-wrapper .purpura-info-divider p {\n            margin-bottom: 8px;\n        }\n\n        .purpura-premium-status {\n            margin-top: 12px;\n            display: flex;\n            align-items: center;\n            gap: 9px;\n            border-radius: calc(var(--p-radius) + 1px);\n            padding: 10px 12px;\n            border: 1px solid var(--p-border-2);\n            background: rgba(255,255,255,0.02);\n            font-size: 13px;\n            font-weight: 600;\n        }\n\n        .purpura-premium-status-dot {\n            width: 9px;\n            height: 9px;\n            border-radius: 50%;\n            flex: 0 0 auto;\n        }\n\n        .purpura-premium-status.active {\n            color: #f7e3a7;\n            border-color: rgba(240,180,41,0.34);\n            background: linear-gradient(180deg, rgba(240,180,41,0.14), rgba(240,180,41,0.07));\n        }\n\n        .purpura-premium-status.active .purpura-premium-status-dot {\n            background: #f0b429;\n            box-shadow: 0 0 8px rgba(240,180,41,0.45);\n        }\n\n        .purpura-premium-status.inactive {\n            color: var(--p-text-2);\n        }\n\n        .purpura-premium-status.inactive .purpura-premium-status-dot {\n            background: var(--p-text-3);\n        }\n\n        .purpura-premium-feature-grid {\n            margin-top: 12px;\n            display: grid;\n            grid-template-columns: repeat(2, minmax(0, 1fr));\n            gap: 9px;\n        }\n\n        .purpura-premium-feature-item {\n            border: 1px solid var(--p-border-2);\n            background: rgba(255,255,255,0.02);\n            border-radius: calc(var(--p-radius) + 1px);\n            padding: 9px 10px;\n            min-width: 0;\n        }\n\n        .purpura-premium-feature-item-title {\n            color: var(--p-text);\n            font-size: 13px;\n            font-weight: 700;\n            line-height: 1.35;\n            margin: 0;\n        }\n\n        .purpura-premium-feature-item-category {\n            color: var(--p-text-3);\n            font-size: 11px;\n            line-height: 1.2;\n            margin-top: 4px;\n            text-transform: uppercase;\n            letter-spacing: 0.06em;\n            font-weight: 700;\n        }\n\n        .purpura-premium-actions {\n            display: flex;\n            gap: 10px;\n            margin-top: 16px;\n            padding-top: 14px;\n            border-top: 1px solid var(--p-border);\n            flex-wrap: wrap;\n        }\n\n        @media (max-width: 760px) {\n            .purpura-premium-feature-grid {\n                grid-template-columns: 1fr;\n            }\n        }\n\n        @media (max-width: 1060px) {\n            .purpura-credits-grid {\n                grid-template-columns: repeat(2, minmax(0, 1fr));\n            }\n        }\n\n        @media (max-width: 720px) {\n            .purpura-credits-grid {\n                grid-template-columns: 1fr;\n            }\n\n            .purpura-credit-card {\n                grid-template-columns: 64px minmax(0, 1fr);\n                column-gap: 9px;\n            }\n\n            .purpura-credit-avatar-wrap {\n                width: 64px;\n                height: 64px;\n            }\n        }\n\n        .purpura-info-divider {\n            margin-top: 18px;\n            padding-top: 16px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-info-meta {\n            margin-top: 18px;\n            padding-top: 16px;\n            border-top: 1px solid var(--p-border);\n            display: grid;\n            grid-template-columns: repeat(2, minmax(0, 1fr));\n            gap: 10px;\n        }\n\n        .purpura-info-meta-card {\n            background: rgba(255,255,255,0.02);\n            border: 1px solid var(--p-border-2);\n            border-radius: calc(var(--p-radius) + 1px);\n            padding: 10px 12px;\n            min-height: 64px;\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            gap: 4px;\n        }\n\n        .purpura-info-meta-label {\n            color: var(--p-text-3);\n            font-size: 11px;\n            text-transform: uppercase;\n            letter-spacing: 0.08em;\n            font-weight: 700;\n        }\n\n        .purpura-info-meta-value {\n            color: var(--p-text);\n            font-size: 14px;\n            font-weight: 700;\n            line-height: 1.35;\n        }\n\n        @media (max-width: 640px) {\n            .purpura-info-meta {\n                grid-template-columns: 1fr;\n            }\n        }\n\n        \n        .purpura-import-export {\n            display: flex;\n            justify-content: center;\n            gap: 10px;\n            margin-top: 18px;\n            padding-top: 16px;\n            border-top: 1px solid var(--p-border);\n            flex-wrap: wrap;\n        }\n\n        .purpura-import-export-btn {\n            padding: 8px 18px;\n            background: var(--p-surface);\n            border: 1px solid var(--p-border-2);\n            border-radius: 10px;\n            color: var(--p-text);\n            font-size: 13px;\n            font-weight: 500;\n            cursor: pointer;\n            font-family: var(--p-font);\n            transition: background 0.15s, border-color 0.15s;\n        }\n\n        .purpura-import-export-btn:hover {\n            background: rgba(155,109,255,0.1);\n            border-color: rgba(155,109,255,0.4);\n        }\n\n        .purpura-import-export-btn.primary {\n            background: rgba(155, 109, 255, 0.18);\n            border: 1px solid rgba(155, 109, 255, 0.35);\n            color: var(--p-accent);\n        }\n\n        .purpura-import-export-btn.primary:hover {\n            background: rgba(155, 109, 255, 0.26);\n            border-color: rgba(155, 109, 255, 0.5);\n        }\n\n        \n        .purpura-ban-banner {\n            background: ${e ? "rgba(220, 38, 38, 0.06)" : "rgba(248,113,113,0.08)"};\n            border: 1px solid ${e ? "rgba(220, 38, 38, 0.25)" : "rgba(248,113,113,0.3)"};\n            border-radius: var(--p-radius-lg);\n            padding: 14px 18px;\n            margin-bottom: 18px;\n            display: flex;\n            align-items: center;\n            gap: 14px;\n        }\n\n        .purpura-ban-banner-icon { font-size: 26px; flex-shrink: 0; }\n\n        .purpura-ban-banner-title {\n            font-size: 14px;\n            font-weight: 700;\n            color: var(--p-danger);\n            margin-bottom: 3px;\n        }\n\n        .purpura-ban-banner-text {\n            font-size: 12.5px;\n            color: rgba(248,113,113,0.8);\n            line-height: 1.5;\n        }\n\n        \n        .purpura-features-disabled .purpura-setting-card {\n            opacity: 0.45;\n            pointer-events: none;\n            filter: saturate(0.2);\n        }\n\n        \n        .purpura-setting-card.premium-locked { position: relative; }\n\n        .purpura-setting-card.premium-locked .purpura-toggle input { pointer-events: none; }\n        .purpura-setting-card.premium-locked .purpura-toggle-slider {\n            opacity: 0.45;\n            cursor: not-allowed;\n        }\n\n        .purpura-setting-card.premium-locked .purpura-theme-picker,\n        .purpura-setting-card.premium-locked .purpura-cursor-picker {\n            opacity: 0.45;\n            pointer-events: none;\n        }\n\n        .purpura-premium-lock-notice {\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            padding: 8px 12px;\n            background: rgba(240,180,41,0.08);\n            border: 1px solid rgba(240,180,41,0.25);\n            border-radius: var(--p-radius);\n            margin-top: 10px;\n            font-size: 12px;\n            color: var(--p-premium);\n        }\n\n        .purpura-premium-lock-notice a {\n            color: var(--p-premium);\n            text-decoration: underline;\n            cursor: pointer;\n        }\n\n        \n        .purpura-wip {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            padding: 10px 14px;\n            border-radius: var(--p-radius);\n            background: rgba(240,180,41,0.08);\n            border: 1px solid rgba(240,180,41,0.25);\n            color: var(--p-premium);\n            font-weight: 600;\n            font-size: 13px;\n        }\n\n        \n        #purpura-mobile-menu {\n            display: none;\n            margin-bottom: 18px;\n        }\n\n        #purpura-mobile-menu select {\n            width: 100%;\n            padding: 11px;\n            font-size: 14px;\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border-2);\n            background: var(--p-surface);\n            color: var(--p-text);\n            font-family: var(--p-font);\n        }\n\n        @media (max-width: 768px) {\n            #purpura-ui-container { flex-direction: column; }\n            .purpura-sidebar { display: none; }\n            #purpura-mobile-menu { display: block; }\n            .purpura-settings-root { padding: 14px; }\n        }\n\n        \n        .purpura-reset-btn {\n            border: 1px solid var(--p-border-2);\n            background: transparent;\n            color: var(--p-text);\n            padding: 7px 13px;\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            font-weight: 600;\n            font-family: var(--p-font);\n            font-size: 13px;\n            transition: background 0.15s, transform 0.15s;\n        }\n\n        .purpura-reset-btn:hover { background: rgba(155,109,255,0.1); }\n        .purpura-reset-btn:active { transform: scale(0.97); }\n\n        \n        .purpura-cursor-picker {\n            display: flex;\n            flex-direction: column;\n            gap: 10px;\n            margin-top: 12px;\n            padding-top: 12px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-cursor-grid {\n            display: grid;\n            grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));\n            gap: 8px;\n        }\n\n        .purpura-cursor-option {\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            padding: 11px 8px;\n            background: var(--p-bg);\n            border: 1px solid var(--p-border);\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            transition: border-color 0.18s, background 0.18s, transform 0.18s var(--p-ease-back);\n        }\n\n        .purpura-cursor-option:hover {\n            border-color: var(--p-accent);\n            background: rgba(155,109,255,0.06);\n            transform: translateY(-2px);\n        }\n\n        .purpura-cursor-option:active { transform: scale(0.96); }\n\n        .purpura-cursor-option.active {\n            border-color: var(--p-accent);\n            background: rgba(155,109,255,0.10);\n            box-shadow: 0 0 0 2px var(--p-accent-glow);\n        }\n\n        .purpura-cursor-preview {\n            width: 28px; height: 28px;\n            margin-bottom: 6px;\n            display: flex; align-items: center; justify-content: center;\n        }\n\n        .purpura-cursor-preview svg { width: 24px; height: 24px; }\n\n        .purpura-cursor-name {\n            font-size: 11px;\n            color: var(--p-text-2);\n            text-align: center;\n        }\n\n        .purpura-cursor-option.active .purpura-cursor-name {\n            color: var(--p-text);\n            font-weight: 600;\n        }\n\n        .purpura-cursor-upload {\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            padding: 10px 8px;\n            background: var(--p-bg);\n            border: 1.5px dashed var(--p-border-2);\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            transition: border-color 0.18s, background 0.18s;\n        }\n\n        .purpura-cursor-upload:hover { border-color: var(--p-accent); }\n        .purpura-cursor-upload.active { border-color: var(--p-accent); border-style: solid; }\n\n        .purpura-cursor-upload-icon {\n            width: 28px; height: 28px;\n            display: flex; align-items: center; justify-content: center;\n            font-size: 18px;\n            color: var(--p-text-2);\n            margin-bottom: 4px;\n            overflow: hidden;\n        }\n\n        .purpura-cursor-upload-icon img {\n            width: 28px; height: 28px; object-fit: contain;\n        }\n\n        .purpura-cursor-picker.disabled { opacity: 0.38; pointer-events: none; }\n\n        \n        .purpura-theme-picker {\n            display: flex;\n            flex-direction: column;\n            gap: 8px;\n            margin-top: 12px;\n            padding-top: 12px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-theme-option {\n            display: flex;\n            align-items: center;\n            gap: 14px;\n            padding: 11px 13px;\n            background: var(--p-bg);\n            border: 1px solid var(--p-border);\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            transition: border-color 0.18s, background 0.18s, transform 0.18s var(--p-ease-back);\n            position: relative;\n        }\n\n        .purpura-theme-option:hover {\n            border-color: rgba(155,109,255,0.35);\n            background: rgba(155,109,255,0.05);\n            transform: translateX(2px);\n        }\n\n        .purpura-theme-option:active { transform: scale(0.99); }\n\n        .purpura-theme-option.active {\n            border-color: var(--p-accent);\n            background: rgba(155,109,255,0.1);\n        }\n\n        .purpura-theme-option.active::after {\n            content: '';\n            position: absolute;\n            right: 13px;\n            top: 50%;\n            transform: translateY(-50%);\n            width: 6px; height: 6px;\n            border-radius: 50%;\n            background: var(--p-accent);\n            box-shadow: 0 0 8px var(--p-accent-glow-strong);\n        }\n\n        .purpura-theme-preview {\n            width: 46px; height: 46px;\n            border-radius: var(--p-radius);\n            display: flex; align-items: center; justify-content: center;\n            flex-shrink: 0;\n        }\n\n        .purpura-theme-default    { background: linear-gradient(135deg, #2e2f3a, #1c1d26); }\n        .purpura-theme-purpura    { background: linear-gradient(135deg, #2e003e, #1a0025); }\n        .purpura-theme-custom     { background: linear-gradient(135deg, #1a1a2e, #16213e); }\n\n        .purpura-theme-info { display: flex; flex-direction: column; gap: 2px; }\n\n        .purpura-theme-name {\n            font-size: 13.5px;\n            font-weight: 600;\n            color: var(--p-text);\n        }\n\n        .purpura-theme-desc { font-size: 12px; color: var(--p-text-2); }\n        .purpura-theme-author { font-size: 11px; color: var(--p-text-3); font-style: italic; }\n\n        .purpura-theme-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }\n\n        .purpura-theme-tag {\n            font-size: 10px;\n            padding: 2px 7px;\n            background: rgba(155,109,255,0.2);\n            color: var(--p-accent);\n            border-radius: 99px;\n            font-weight: 600;\n        }\n\n        .purpura-theme-loading {\n            padding: 20px;\n            text-align: center;\n            color: var(--p-text-2);\n            font-size: 13px;\n        }\n\n        .purpura-theme-section-header {\n            font-size: 11px;\n            font-weight: 700;\n            color: var(--p-text-3);\n            text-transform: uppercase;\n            letter-spacing: 0.8px;\n            margin-top: 12px;\n            margin-bottom: 6px;\n        }\n\n        .purpura-theme-delete {\n            position: absolute;\n            top: 8px; right: 8px;\n            width: 22px; height: 22px;\n            border-radius: 50%;\n            background: rgba(248,113,113,0.12);\n            border: none;\n            color: var(--p-danger);\n            cursor: pointer;\n            display: flex; align-items: center; justify-content: center;\n            font-size: 14px;\n            opacity: 0;\n            transition: opacity 0.15s, background 0.15s;\n        }\n\n        .purpura-theme-option.custom-theme:hover .purpura-theme-delete { opacity: 1; }\n        .purpura-theme-delete:hover { background: rgba(248,113,113,0.25); }\n\n        .purpura-theme-add {\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            gap: 8px;\n            padding: 11px;\n            background: var(--p-bg);\n            border: 1.5px dashed var(--p-border-2);\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            color: var(--p-text-2);\n            transition: border-color 0.15s, color 0.15s, background 0.15s;\n            font-size: 13px;\n        }\n\n        .purpura-theme-add:hover {\n            border-color: var(--p-accent);\n            color: var(--p-accent);\n            background: rgba(155,109,255,0.05);\n        }\n\n        .purpura-theme-picker.disabled { opacity: 0.38; pointer-events: none; }\n\n        \n        .purpura-theme-modal {\n            position: fixed;\n            inset: 0;\n            background: ${e ? "rgba(17, 17, 19, 0.40)" : "rgba(0,0,0,0.65)"};\n            backdrop-filter: blur(6px);\n            -webkit-backdrop-filter: blur(6px);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            z-index: 10000;\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity 0.25s var(--p-ease);\n        }\n\n        .purpura-theme-modal.visible {\n            opacity: 1;\n            pointer-events: auto;\n        }\n\n        .purpura-theme-modal-content {\n            background: ${e ? "#ffffff" : "#1a1b26"};\n            border: 1px solid var(--p-border-2);\n            border-radius: var(--p-radius-xl);\n            padding: 24px;\n            width: 500px;\n            max-width: 90vw;\n            max-height: 80vh;\n            overflow-y: auto;\n            position: relative;\n            box-shadow: ${e ? "0 24px 64px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.10)" : "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,109,255,0.15)"};\n            transform: scale(0.92) translateY(16px);\n            opacity: 0;\n            transition: transform 0.25s var(--p-ease-back), opacity 0.25s var(--p-ease-back);\n        }\n\n        .purpura-theme-modal.visible .purpura-theme-modal-content {\n            transform: scale(1) translateY(0);\n            opacity: 1;\n        }\n\n        .purpura-theme-modal-header {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 16px;\n        }\n\n        .purpura-theme-modal-header h3 { margin: 0; color: var(--p-text); font-size: 17px; }\n\n        .purpura-theme-modal-close {\n            background: var(--p-surface);\n            border: 1px solid var(--p-border);\n            color: var(--p-text-2);\n            width: 28px; height: 28px;\n            border-radius: var(--p-radius-sm);\n            display: flex; align-items: center; justify-content: center;\n            font-size: 16px;\n            cursor: pointer;\n            transition: background 0.15s, color 0.15s;\n        }\n\n        .purpura-theme-modal-close:hover { background: rgba(248,113,113,0.12); color: var(--p-danger); }\n\n        .purpura-theme-modal textarea {\n            width: 100%;\n            min-height: 200px;\n            background: ${e ? "#f5f5f7" : "var(--p-bg)"};\n            border: 1px solid var(--p-border-2);\n            border-radius: var(--p-radius);\n            padding: 12px;\n            color: var(--p-text);\n            font-family: 'JetBrains Mono', 'Fira Code', monospace;\n            font-size: 12px;\n            resize: vertical;\n            margin-bottom: 12px;\n            transition: border-color 0.2s var(--p-ease), box-shadow 0.2s var(--p-ease);\n        }\n\n        .purpura-theme-modal textarea:focus {\n            outline: none;\n            border-color: var(--p-accent);\n            box-shadow: 0 0 0 3px var(--p-accent-glow), 0 0 24px var(--p-accent-glow);\n        }\n\n        .purpura-theme-manifest-example {\n            font-size: 11px;\n            color: var(--p-text-2);\n            background: var(--p-bg);\n            border: 1px solid var(--p-border);\n            padding: 10px;\n            border-radius: var(--p-radius);\n            margin-bottom: 14px;\n            font-family: monospace;\n            white-space: pre-wrap;\n        }\n\n        .purpura-theme-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }\n\n        .purpura-theme-modal-btn {\n            padding: 8px 16px;\n            border-radius: var(--p-radius);\n            font-size: 13px;\n            font-family: var(--p-font);\n            font-weight: 500;\n            cursor: pointer;\n            border: none;\n            transition: opacity 0.15s, transform 0.15s;\n        }\n\n        .purpura-theme-modal-btn:active { transform: scale(0.97); }\n\n        .purpura-theme-modal-btn.cancel {\n            background: var(--p-surface);\n            color: var(--p-text-2);\n            border: 1px solid var(--p-border);\n        }\n\n        .purpura-theme-modal-btn.cancel:hover { background: var(--p-card); }\n\n        .purpura-theme-modal-btn.save {\n            background: var(--p-accent);\n            color: #fff;\n            box-shadow: 0 2px 10px rgba(155,109,255,0.35);\n            font-weight: 600;\n        }\n\n        .purpura-theme-modal-btn.save:hover {\n            background: #8a5df0;\n            box-shadow: 0 4px 16px rgba(155,109,255,0.45);\n            transform: translateY(-1px);\n        }\n\n        .purpura-theme-modal-hint { font-size: 13px; color: var(--p-text-2); margin-bottom: 10px; }\n\n        .purpura-settings-dialog-content {\n            width: 470px;\n            max-width: 92vw;\n            border-radius: 14px;\n            border: 1px solid ${e ? "rgba(124, 58, 237, 0.20)" : "rgba(122, 90, 177, 0.38)"};\n            background: ${e ? "#ffffff" : "radial-gradient(140% 110% at 0% 0%, rgba(96, 53, 156, 0.22) 0%, rgba(17, 12, 28, 0.96) 42%, rgba(10, 8, 18, 0.98) 100%)"};\n            box-shadow: ${e ? "0 28px 58px rgba(0, 0, 0, 0.12)" : "0 28px 58px rgba(0, 0, 0, 0.58), 0 0 0 1px rgba(154, 104, 230, 0.1) inset"};\n        }\n\n        .purpura-settings-dialog-chip {\n            display: inline-flex;\n            align-items: center;\n            margin-bottom: 10px;\n            padding: 4px 9px;\n            border-radius: 999px;\n            font-size: 10px;\n            font-weight: 700;\n            letter-spacing: 0.06em;\n            text-transform: uppercase;\n            border: 1px solid rgba(130, 110, 170, 0.62);\n            color: rgba(234, 225, 255, 0.95);\n            background: rgba(53, 35, 76, 0.52);\n        }\n\n        .purpura-settings-dialog-chip.confirm {\n            border-color: rgba(164, 118, 230, 0.72);\n            background: rgba(82, 46, 128, 0.62);\n        }\n\n        .purpura-settings-dialog-chip.alert {\n            border-color: rgba(212, 166, 95, 0.72);\n            color: rgba(255, 242, 218, 0.96);\n            background: rgba(112, 84, 45, 0.58);\n        }\n\n        .purpura-settings-dialog-message {\n            white-space: pre-line;\n            line-height: 1.5;\n            color: rgba(221, 211, 245, 0.92);\n        }\n\n        .purpura-settings-dialog-field {\n            margin-top: 12px;\n        }\n\n        .purpura-settings-dialog-info {\n            margin-top: 8px;\n            color: rgba(186, 173, 214, 0.9);\n            font-size: 12px;\n            line-height: 1.4;\n        }\n\n        .purpura-settings-dialog-select {\n            width: 100%;\n            border-radius: 10px;\n            border: 1px solid var(--p-border-2);\n            background: ${e ? "#f5f5f7" : "linear-gradient(180deg, rgba(24, 18, 37, 0.95) 0%, rgba(17, 13, 29, 0.95) 100%)"};\n            color: var(--p-text);\n            padding: 10px 12px;\n            font-size: 14px;\n            outline: none;\n            transition: border-color 0.16s ease, box-shadow 0.16s ease;\n        }\n\n        .purpura-settings-dialog-select:focus {\n            border-color: rgba(175, 120, 255, 0.88);\n            box-shadow: 0 0 0 3px rgba(148, 99, 232, 0.26);\n        }\n\n        .purpura-settings-dialog-input {\n            margin: 8px 0 14px;\n            border-radius: 10px;\n            border: 1px solid var(--p-border-2);\n            background: ${e ? "#f5f5f7" : "linear-gradient(180deg, rgba(24, 18, 37, 0.95) 0%, rgba(17, 13, 29, 0.95) 100%)"};\n            color: var(--p-text);\n            transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;\n        }\n\n        .purpura-settings-dialog-input:focus {\n            border-color: rgba(175, 120, 255, 0.88);\n            background: linear-gradient(180deg, rgba(27, 20, 40, 0.98) 0%, rgba(19, 15, 32, 0.98) 100%);\n            box-shadow: 0 0 0 3px rgba(148, 99, 232, 0.26);\n        }\n\n        .purpura-settings-dialog-error {\n            margin-top: 8px;\n            color: #ff8c87;\n            font-size: 12px;\n            line-height: 1.35;\n            display: none;\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-header h3 {\n            font-size: 18px;\n            letter-spacing: 0;\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-actions {\n            gap: 9px;\n            margin-top: 18px;\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-btn {\n            border-radius: 10px;\n            min-width: 108px;\n            padding: 9px 14px;\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-btn.cancel {\n            border-color: rgba(127, 93, 182, 0.46);\n            background: rgba(35, 26, 55, 0.72);\n            color: rgba(220, 206, 245, 0.92);\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-btn.cancel:hover {\n            background: rgba(50, 35, 76, 0.76);\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-btn.save {\n            border: 1px solid rgba(179, 126, 255, 0.58);\n            background: linear-gradient(135deg, #7a44c0 0%, #5f318f 100%);\n            color: #f9f2ff;\n            box-shadow: 0 10px 24px rgba(58, 27, 95, 0.42);\n        }\n\n        .purpura-settings-dialog-content .purpura-theme-modal-btn.save:hover {\n            background: linear-gradient(135deg, #8750d0 0%, #6c3a9f 100%);\n        }\n\n        .purpura-settings-dialog-content.mode-alert .purpura-theme-modal-btn.save {\n            border-color: rgba(212, 166, 95, 0.78);\n            background: linear-gradient(135deg, #a16f2f 0%, #8b5f28 100%);\n            box-shadow: 0 8px 20px rgba(88, 61, 29, 0.32);\n        }\n\n        .purpura-settings-dialog-content.mode-alert .purpura-theme-modal-btn.save:hover {\n            background: linear-gradient(135deg, #ae7a35 0%, #96672c 100%);\n        }\n\n        \n        .purpura-tabs-picker {\n            display: flex;\n            flex-direction: column;\n            gap: 14px;\n            margin-top: 12px;\n            padding-top: 12px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-tabs-picker.disabled { opacity: 0.38; pointer-events: none; }\n\n        .purpura-tabs-section { display: flex; flex-direction: column; gap: 7px; }\n\n        .purpura-tabs-section-title {\n            font-size: 11px;\n            font-weight: 700;\n            color: var(--p-text-3);\n            text-transform: uppercase;\n            letter-spacing: 0.7px;\n        }\n\n        .purpura-tabs-seasonal-toggle {\n            display: flex;\n            align-items: center;\n            gap: 6px;\n            padding: 10px 12px;\n            margin-top: 10px;\n            background: var(--p-bg);\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border);\n            cursor: pointer;\n            font-size: 12.5px;\n            font-weight: 600;\n            color: var(--p-text-2);\n            transition: border-color 0.18s, background 0.18s;\n            user-select: none;\n        }\n\n        .purpura-tabs-seasonal-toggle:hover {\n            border-color: var(--p-accent);\n            background: rgba(155,109,255,0.06);\n            color: var(--p-text);\n        }\n\n        .purpura-tabs-seasonal-arrow {\n            font-size: 10px;\n            transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);\n        }\n\n        .purpura-tabs-seasonal-arrow.open {\n            transform: rotate(90deg);\n        }\n\n        .purpura-tabs-seasonal-grid {\n            display: none;\n            flex-wrap: wrap;\n            gap: 6px;\n            margin-top: 8px;\n            padding: 4px;\n        }\n\n        .purpura-tabs-seasonal-grid.open {\n            display: flex;\n        }\n\n        .purpura-tabs-title-input {\n            width: 100%;\n            padding: 9px 11px;\n            background: var(--p-bg);\n            border: 1px solid var(--p-border-2);\n            border-radius: var(--p-radius);\n            color: var(--p-text);\n            font-size: 13px;\n            font-family: var(--p-font);\n            transition: border-color 0.15s;\n        }\n\n        .purpura-tabs-title-input:focus {\n            outline: none;\n            border-color: var(--p-accent);\n            box-shadow: 0 0 0 3px var(--p-accent-glow);\n        }\n\n        .purpura-tabs-title-hint { font-size: 11px; color: var(--p-text-3); }\n\n        .purpura-tabs-icons { display: flex; flex-wrap: wrap; gap: 8px; }\n\n        .purpura-tabs-icon-option {\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            gap: 6px;\n            padding: 11px;\n            background: var(--p-bg);\n            border: 1px solid var(--p-border);\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            min-width: 76px;\n            transition: border-color 0.18s, background 0.18s, transform 0.18s var(--p-ease-back);\n        }\n\n        .purpura-tabs-icon-option:hover {\n            border-color: var(--p-accent);\n            background: rgba(155,109,255,0.06);\n            transform: translateY(-2px);\n        }\n\n        .purpura-tabs-icon-option.active {\n            border-color: var(--p-accent);\n            background: rgba(155,109,255,0.14);\n            box-shadow: 0 0 0 2px var(--p-accent-glow-strong);\n        }\n\n        .purpura-tabs-icon-preview img { width: 30px; height: 30px; object-fit: contain; }\n\n        .purpura-tabs-icon-name { font-size: 11px; color: var(--p-text-2); text-align: center; }\n\n        .purpura-tabs-upload {\n            display: flex; flex-direction: column;\n            align-items: center; justify-content: center;\n            gap: 6px;\n            padding: 11px;\n            background: var(--p-bg);\n            border: 1.5px dashed var(--p-border-2);\n            border-radius: var(--p-radius);\n            cursor: pointer;\n            min-width: 76px;\n            transition: border-color 0.15s, background 0.15s;\n        }\n\n        .purpura-tabs-upload:hover { border-color: var(--p-accent); background: rgba(155,109,255,0.05); }\n        .purpura-tabs-upload.active { border-color: var(--p-accent); border-style: solid; background: rgba(155,109,255,0.1); }\n        .purpura-tabs-upload-icon { font-size: 18px; color: var(--p-text-3); }\n\n        .purpura-tabs-preview {\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            padding: 9px 13px;\n            background: var(--p-bg);\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border);\n        }\n\n        .purpura-tabs-preview-favicon { width: 16px; height: 16px; }\n        .purpura-tabs-preview-title { font-size: 13px; color: var(--p-text); }\n\n        \n        .purpura-uncorporatify-picker {\n            display: flex; flex-direction: column; gap: 6px;\n            margin-top: 12px;\n            padding-top: 12px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-uncorporatify-picker.disabled { opacity: 0.38; pointer-events: none; }\n\n        .purpura-uncorporatify-item {\n            display: flex; align-items: center; justify-content: space-between;\n            padding: 10px 13px;\n            background: var(--p-bg);\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border);\n            transition: border-color 0.15s;\n        }\n\n        .purpura-uncorporatify-item:hover { border-color: var(--p-border-2); }\n\n        .purpura-uncorporatify-label { display: flex; align-items: center; gap: 8px; font-size: 13px; }\n        .purpura-uncorporatify-from { color: var(--p-text-3); text-decoration: line-through; }\n        .purpura-uncorporatify-arrow { color: var(--p-accent); }\n        .purpura-uncorporatify-to { color: var(--p-text); font-weight: 500; }\n\n        .purpura-uncorporatify-toggle {\n            position: relative; display: inline-block;\n            width: 36px; height: 20px; flex-shrink: 0;\n        }\n\n        .purpura-uncorporatify-toggle input { opacity: 0; width: 0; height: 0; }\n\n        .purpura-uncorporatify-toggle .slider {\n            position: absolute; cursor: pointer; inset: 0;\n            background: ${e ? "#c8c8d0" : "#2a2b36"};\n            transition: background 0.25s var(--p-ease);\n            border-radius: 99px;\n        }\n\n        .purpura-uncorporatify-toggle .slider::before {\n            position: absolute; content: '';\n            height: 14px; width: 14px;\n            left: 3px; bottom: 3px;\n            background: #fff;\n            transition: transform 0.3s var(--p-ease-back);\n            border-radius: 50%;\n            box-shadow: ${e ? "0 1px 4px rgba(0, 0, 0, 0.25)" : "none"};\n        }\n\n        .purpura-uncorporatify-toggle input:checked + .slider { background: var(--p-accent); }\n        .purpura-uncorporatify-toggle input:checked + .slider::before { transform: translateX(16px); }\n\n        \n        .purpura-serverinfo-picker {\n            display: flex; flex-direction: column; gap: 6px;\n            margin-top: 12px; padding-top: 12px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-serverinfo-picker.disabled { opacity: 0.38; pointer-events: none; }\n\n        .purpura-serverinfo-item {\n            display: flex; align-items: center; justify-content: space-between;\n            padding: 10px 13px;\n            background: var(--p-bg);\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border);\n            transition: border-color 0.15s;\n        }\n\n        .purpura-serverinfo-item:hover { border-color: var(--p-border-2); }\n\n        .purpura-serverinfo-label { display: flex; align-items: center; gap: 10px; font-size: 13px; }\n\n        .purpura-serverinfo-icon {\n            width: 28px; height: 28px;\n            display: flex; align-items: center; justify-content: center;\n            border-radius: var(--p-radius-sm); flex-shrink: 0;\n        }\n\n        .purpura-serverinfo-icon.ping    { background: rgba(59,130,246,0.12); color: #60a5fa; }\n        .purpura-serverinfo-icon.fps     { background: rgba(74,222,128,0.12); color: var(--p-success); }\n        .purpura-serverinfo-icon.region  { background: rgba(155,109,255,0.12); color: var(--p-accent); }\n        .purpura-serverinfo-icon.serverVersion,\n        .purpura-serverinfo-icon.serverId { background: rgba(148,163,184,0.08); color: var(--p-text-2); }\n\n        .purpura-serverinfo-label.dev-option { opacity: 0.65; }\n        .purpura-serverinfo-label.dev-option .purpura-serverinfo-name { font-size: 12px; }\n        .purpura-serverinfo-name { color: var(--p-text); font-weight: 500; }\n\n        .purpura-serverinfo-toggle {\n            position: relative; display: inline-block;\n            width: 36px; height: 20px; flex-shrink: 0;\n        }\n\n        .purpura-serverinfo-toggle input { opacity: 0; width: 0; height: 0; }\n\n        .purpura-serverinfo-toggle .slider {\n            position: absolute; cursor: pointer; inset: 0;\n            background: ${e ? "#c8c8d0" : "#2a2b36"};\n            transition: background 0.25s var(--p-ease);\n            border-radius: 99px;\n        }\n\n        .purpura-serverinfo-toggle .slider::before {\n            position: absolute; content: '';\n            height: 14px; width: 14px;\n            left: 3px; bottom: 3px;\n            background: #fff;\n            transition: transform 0.3s var(--p-ease-back);\n            border-radius: 50%;\n            box-shadow: ${e ? "0 1px 4px rgba(0, 0, 0, 0.25)" : "none"};\n        }\n\n        .purpura-serverinfo-toggle input:checked + .slider { background: var(--p-accent); }\n        .purpura-serverinfo-toggle input:checked + .slider::before { transform: translateX(16px); }\n\n        \n        .purpura-pagebinds-picker {\n            display: flex; flex-direction: column; gap: 8px;\n            margin-top: 12px; padding-top: 12px;\n            border-top: 1px solid var(--p-border);\n        }\n\n        .purpura-pagebinds-picker.disabled { opacity: 0.38; pointer-events: none; }\n\n        .purpura-pagebinds-list { display: flex; flex-direction: column; gap: 6px; }\n\n        .purpura-pagebinds-item {\n            display: flex; align-items: center; gap: 10px;\n            padding: 9px 12px;\n            background: var(--p-bg);\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border);\n            transition: border-color 0.15s;\n        }\n\n        .purpura-pagebinds-item:hover { border-color: var(--p-border-2); }\n\n        .purpura-pagebinds-key {\n            display: flex; align-items: center; justify-content: center;\n            min-width: 34px; height: 34px;\n            background: rgba(155,109,255,0.15);\n            border: 1px solid rgba(155,109,255,0.3);\n            color: var(--p-accent);\n            font-weight: 700; font-size: 13px;\n            border-radius: var(--p-radius-sm); flex-shrink: 0;\n        }\n\n        .purpura-pagebinds-info { flex: 1; min-width: 0; }\n\n        .purpura-pagebinds-name { font-size: 13px; font-weight: 500; color: var(--p-text); }\n\n        .purpura-pagebinds-url { font-size: 11px; color: var(--p-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n\n        .purpura-pagebinds-toggle {\n            position: relative; display: inline-block;\n            width: 36px; height: 20px; flex-shrink: 0;\n        }\n\n        .purpura-pagebinds-toggle input { opacity: 0; width: 0; height: 0; }\n\n        .purpura-pagebinds-toggle .slider {\n            position: absolute; cursor: pointer; inset: 0;\n            background: ${e ? "#c8c8d0" : "#2a2b36"}; transition: background 0.25s var(--p-ease); border-radius: 99px;\n        }\n\n        .purpura-pagebinds-toggle .slider::before {\n            position: absolute; content: '';\n            height: 14px; width: 14px; left: 3px; bottom: 3px;\n            background: #fff; transition: transform 0.3s var(--p-ease-back); border-radius: 50%;\n            box-shadow: ${e ? "0 1px 4px rgba(0, 0, 0, 0.25)" : "none"};\n        }\n\n        .purpura-pagebinds-toggle input:checked + .slider { background: var(--p-accent); }\n        .purpura-pagebinds-toggle input:checked + .slider::before { transform: translateX(16px); }\n\n        .purpura-pagebinds-hint {\n            font-size: 11px; color: var(--p-text-3);\n            padding: 7px 11px; background: var(--p-bg);\n            border-radius: var(--p-radius);\n            border: 1px solid var(--p-border);\n        }\n\n        .purpura-pagebinds-key-btn {\n            display: flex; align-items: center; justify-content: center;\n            min-width: 34px; height: 34px;\n            background: rgba(155,109,255,0.15);\n            border: 1px solid rgba(155,109,255,0.3);\n            color: var(--p-accent);\n            font-weight: 700; font-size: 13px;\n            border-radius: var(--p-radius-sm); flex-shrink: 0;\n            cursor: pointer;\n            transition: opacity 0.15s, background 0.15s;\n            padding: 0 8px; white-space: nowrap; font-family: var(--p-font);\n        }\n\n        .purpura-pagebinds-key-btn:hover { background: rgba(155,109,255,0.25); }\n\n        .purpura-pagebinds-key-btn.capturing {\n            background: rgba(230,114,44,0.15);\n            border-color: rgba(230,114,44,0.4);\n            color: #f09a5a;\n            font-size: 10px; min-width: 64px;\n            animation: p-key-pulse 0.85s ease-in-out infinite;\n        }\n\n        @keyframes p-key-pulse {\n            0%, 100% { opacity: 1; }\n            50% { opacity: 0.5; }\n        }\n\n        .purpura-pagebinds-actions { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }\n\n        .purpura-pagebinds-action-btn {\n            display: flex; align-items: center; justify-content: center;\n            width: 27px; height: 27px;\n            border-radius: var(--p-radius-sm); border: none;\n            cursor: pointer; font-size: 12px;\n            background: rgba(255,255,255,0.04);\n            color: var(--p-text-2);\n            transition: background 0.15s, color 0.15s;\n        }\n\n        .purpura-pagebinds-action-btn:hover { background: rgba(255,255,255,0.1); color: var(--p-text); }\n        .purpura-pagebinds-action-btn.delete:hover { background: rgba(248,113,113,0.12); color: var(--p-danger); }\n\n        .purpura-pagebinds-edit-form {\n            background: var(--p-bg);\n            border-radius: var(--p-radius);\n            padding: 11px;\n            display: flex; flex-direction: column; gap: 8px;\n            border: 1px solid var(--p-border-2);\n            animation: p-subsetting-in 0.18s var(--p-ease) forwards;\n        }\n\n        .purpura-pagebinds-form-row { display: flex; align-items: center; gap: 7px; }\n\n        .purpura-pagebinds-form-input {\n            flex: 1;\n            background: rgba(255,255,255,0.04);\n            border: 1px solid var(--p-border);\n            border-radius: var(--p-radius-sm);\n            padding: 6px 9px;\n            font-size: 12px; font-family: var(--p-font);\n            color: var(--p-text); outline: none;\n            transition: border-color 0.15s;\n            min-width: 0;\n        }\n\n        .purpura-pagebinds-form-input:focus { border-color: var(--p-accent); }\n        .purpura-pagebinds-form-url { flex: 2; }\n\n        .purpura-pagebinds-form-actions { display: flex; align-items: center; gap: 7px; justify-content: flex-end; }\n\n        .purpura-pagebinds-form-error { flex: 1; font-size: 11px; color: var(--p-danger); min-height: 14px; }\n\n        .purpura-pagebinds-btn-cancel,\n        .purpura-pagebinds-btn-save {\n            padding: 6px 13px; border-radius: var(--p-radius-sm);\n            font-size: 12px; font-weight: 500; font-family: var(--p-font);\n            border: none; cursor: pointer; transition: opacity 0.15s, transform 0.15s;\n        }\n\n        .purpura-pagebinds-btn-cancel:active,\n        .purpura-pagebinds-btn-save:active { transform: scale(0.97); }\n\n        .purpura-pagebinds-btn-cancel { background: rgba(255,255,255,0.06); color: var(--p-text-2); }\n        .purpura-pagebinds-btn-cancel:hover { opacity: 0.8; }\n\n        .purpura-pagebinds-btn-save { background: var(--p-accent); color: #fff; }\n        .purpura-pagebinds-btn-save:hover { background: #8a5df0; }\n\n        .purpura-pagebinds-add-btn {\n            display: flex; align-items: center; justify-content: center;\n            gap: 6px; width: 100%; padding: 9px;\n            background: rgba(155,109,255,0.07);\n            border: 1px dashed rgba(155,109,255,0.3);\n            border-radius: var(--p-radius); color: var(--p-accent);\n            font-size: 12px; font-weight: 500; font-family: var(--p-font);\n            cursor: pointer;\n            transition: background 0.15s, border-color 0.15s;\n        }\n\n        .purpura-pagebinds-add-btn:hover {\n            background: rgba(155,109,255,0.14);\n            border-color: rgba(155,109,255,0.5);\n        }; transition: background 0.25s var(--p-ease); border-radius: 99px;\n        }\n\n        \n        @keyframes p-search-result-in {\n            from { opacity: 0; transform: translateX(-6px); }\n            to   { opacity: 1; transform: translateX(0); }\n        }\n\n        .purpura-search-result-group {\n            animation: p-section-in 0.2s var(--p-ease) forwards;\n        }\n\n        .purpura-search-result-group .purpura-setting-card:nth-child(1) { animation-delay: 0.02s; }\n        .purpura-search-result-group .purpura-setting-card:nth-child(2) { animation-delay: 0.06s; }\n        .purpura-search-result-group .purpura-setting-card:nth-child(3) { animation-delay: 0.10s; }\n        .purpura-search-result-group .purpura-setting-card:nth-child(4) { animation-delay: 0.14s; }\n\n        .purpura-search-category-label {\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            margin: 0 0 10px;\n            color: var(--p-text-3);\n            font-size: 11px;\n            font-weight: 700;\n            text-transform: uppercase;\n            letter-spacing: 0.8px;\n        }\n\n        .purpura-search-category-label::after {\n            content: '';\n            flex: 1;\n            height: 1px;\n            background: var(--p-border);\n        }\n\n        \n        .p-search-match {\n            background: rgba(155,109,255,0.2);\n            color: var(--p-accent);\n            border-radius: 3px;\n            padding: 0 2px;\n        }\n    `;
document.head.appendChild(n);
}
function z(e) {
if (!e) return "";
return e.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/###\s*(.+)/g, "<strong>$1</strong>").replace(/^- /gm, "• ");
}
function q(e) {
const t = {
default: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 2L2 18L6 13L9 20L11 19L8 12L14 12Z" fill="white" stroke="#1a0a2e" stroke-width="1" stroke-linejoin="round"/></svg>',
purpura: '<svg width="22" height="22" viewBox="0 0 28 28" fill="none"><defs><linearGradient id="pag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f0e6ff"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient><filter id="pgw" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#pgw)"><path d="M4 2L4 22L9 15L13 24L16 22L12 13L20 13Z" fill="url(#pag)" stroke="#2d1060" stroke-width="1" stroke-linejoin="round"/></g></svg>',
dot: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="4" fill="white" stroke="black" stroke-width="1.5"/></svg>',
bolt: '<svg width="18" height="26" viewBox="0 0 22 32" fill="none"><defs><filter id="pbgw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="pblg" x1="0%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#facc15"/></linearGradient></defs><path d="M15 2L5 17H12L7 30L22 13H14Z" fill="#7dd3fc" opacity="0.5" filter="url(#pbgw)"/><path d="M15 2L5 17H12L7 30L22 13H14Z" fill="url(#pblg)" stroke="#bfdbfe" stroke-width="0.75" stroke-linejoin="round"/></svg>',
ghost: '<svg width="20" height="24" viewBox="0 0 22 28" fill="none"><path d="M11 2C5.5 2 2 6.5 2 12v14l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5V12C20 6.5 16.5 2 11 2Z" fill="white" stroke="#111" stroke-width="1.5"/><circle cx="8" cy="12" r="1.5" fill="#333"/><circle cx="14" cy="12" r="1.5" fill="#333"/></svg>',
nova: '<svg width="22" height="22" viewBox="0 0 28 28" fill="none"><defs><linearGradient id="png" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient><radialGradient id="pngc" cx="50%" cy="50%"><stop offset="0%" stop-color="#fff7d6"/><stop offset="100%" stop-color="#fbbf24"/></radialGradient><filter id="pnf" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="14" cy="14" r="7" fill="#fde68a" opacity="0.2"/><g stroke="url(#png)" stroke-linecap="round"><line x1="14" y1="3" x2="14" y2="10" stroke-width="2"/><line x1="14" y1="18" x2="14" y2="25" stroke-width="2"/><line x1="3" y1="14" x2="10" y2="14" stroke-width="2"/><line x1="18" y1="14" x2="25" y2="14" stroke-width="2"/><line x1="5.8" y1="5.8" x2="10.5" y2="10.5" stroke-width="1.5"/><line x1="17.5" y1="17.5" x2="22.2" y2="22.2" stroke-width="1.5"/><line x1="22.2" y1="5.8" x2="17.5" y2="10.5" stroke-width="1.5"/><line x1="5.8" y1="22.2" x2="10.5" y2="17.5" stroke-width="1.5"/></g><circle cx="14" cy="14" r="3.5" fill="url(#pngc)" filter="url(#pnf)"/></svg>'
};
let n = '<div class="purpura-cursor-picker" data-setting="' + e + '">';
n += '<div class="purpura-cursor-grid">';
for (const [e, r] of Object.entries(M)) {
n += `<div class="purpura-cursor-option" data-preset="${e}">\n                <div class="purpura-cursor-preview">${t[e] || ""}</div>\n                <span class="purpura-cursor-name">${r.name}</span>\n            </div>`;
}
n += `<div class="purpura-cursor-upload" id="purpura-cursor-upload">\n            <span class="purpura-cursor-upload-icon">+</span>\n            <span class="purpura-cursor-name">Custom</span>\n            <input type="file" id="purpura-cursor-file-input" accept="image/*" style="display: none;">\n        </div>`;
n += "</div>";
n += "</div>";
return n;
}
function R(e) {
return `<div class="purpura-theme-picker" data-setting="${e}">\n            <div class="purpura-theme-loading"><a href="https://www.roblox.com/purpura-themes" target="_blank" class="purpura-theme-manager-btn" style="display:inline-block;padding:10px 20px;margin:8px 0;background:var(--p-accent);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;text-align:center;transition:background 0.2s,transform 0.15s" onmouseover="this.style.background='var(--p-accent-dim)'" onmouseout="this.style.background='var(--p-accent)'">Open Theme Editor</a></div>\n        </div>`;
}
function N(e) {
const t = [ {
key: "charts",
from: "Charts",
to: "Games"
}, {
key: "marketplace",
from: "Marketplace",
to: "Catalog"
}, {
key: "create",
from: "Create",
to: "Studio"
}, {
key: "groups",
from: "Communities",
to: "Groups"
} ];
let n = `<div class="purpura-uncorporatify-picker" data-setting="${e}">`;
t.forEach(e => {
n += `<div class="purpura-uncorporatify-item">\n                <div class="purpura-uncorporatify-label">\n                    <span class="purpura-uncorporatify-from">${e.from}</span>\n                    <span class="purpura-uncorporatify-arrow">→</span>\n                    <span class="purpura-uncorporatify-to">${e.to}</span>\n                </div>\n                <label class="purpura-uncorporatify-toggle">\n                    <input type="checkbox" data-section="${e.key}">\n                    <span class="slider"></span>\n                </label>\n            </div>`;
});
n += `</div>`;
return n;
}
function K(e) {
const t = [ {
key: "region",
name: "Region",
icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
}, {
key: "ping",
name: "Ping",
icon: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M7 12.25c0.72 0 1.31-0.59 1.31-1.31S7.72 9.63 7 9.63s-1.31 0.59-1.31 1.31 0.59 1.31 1.31 1.31Z" stroke-width="1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M4.53 8c0.65-0.67 1.53-1.05 2.47-1.05s1.82 0.38 2.47 1.05" stroke-width="1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M2.36 6.31c1.22-1.22 2.87-1.93 4.64-1.93s3.42 0.71 4.64 1.93" stroke-width="1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M0.5 4.45c1.7-1.7 4.03-2.7 6.5-2.7s4.8 1 6.5 2.7" stroke-width="1"/></svg>`
}, {
key: "fps",
name: "FPS",
icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`
}, {
key: "serverVersion",
name: "Server Version",
icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
isDev: true
}, {
key: "serverId",
name: "Server ID",
icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
isDev: true
} ];
let n = `<div class="purpura-serverinfo-picker" data-setting="${e}">`;
t.forEach(e => {
n += `<div class="purpura-serverinfo-item">\n                <div class="purpura-serverinfo-label${e.isDev ? " dev-option" : ""}">\n                    <div class="purpura-serverinfo-icon ${e.key}">${e.icon}</div>\n                    <span class="purpura-serverinfo-name">${e.name}</span>\n                </div>\n                <label class="purpura-serverinfo-toggle">\n                    <input type="checkbox" data-info="${e.key}">\n                    <span class="slider"></span>\n                </label>\n            </div>`;
});
n += `</div>`;
return n;
}
function G(t) {
return `<div class="purpura-pagebinds-picker" data-setting="${t}">\n            <div class="purpura-pagebinds-list" id="purpura-pagebinds-list">\n                <div class="purpura-pagebinds-hint">${e("settings_pageBinds_loadingBinds")}</div>\n            </div>\n            <button class="purpura-pagebinds-add-btn" id="purpura-pagebinds-add-btn">${e("settings_pageBinds_addCustomBind")}</button>\n            <div class="purpura-pagebinds-edit-form" id="purpura-pagebinds-add-form" style="display:none;">\n                <div class="purpura-pagebinds-form-row">\n                    <button class="purpura-pagebinds-key-btn capturing" id="purpura-pagebinds-new-key-btn" data-key="">${e("settings_pageBinds_pressKey")}</button>\n                    <input class="purpura-pagebinds-form-input" id="purpura-pagebinds-new-name" placeholder="${e("settings_pageBinds_namePlaceholder")}" maxlength="30">\n                    <input class="purpura-pagebinds-form-input purpura-pagebinds-form-url" id="purpura-pagebinds-new-url" placeholder="${e("settings_pageBinds_urlPlaceholder")}">\n                </div>\n                <div class="purpura-pagebinds-form-actions">\n                    <span class="purpura-pagebinds-form-error" id="purpura-pagebinds-form-error"></span>\n                    <button class="purpura-pagebinds-btn-cancel" id="purpura-pagebinds-add-cancel">${e("common_cancel")}</button>\n                    <button class="purpura-pagebinds-btn-save" id="purpura-pagebinds-add-save">${e("settings_pageBinds_addBind")}</button>\n                </div>\n            </div>\n        </div>`;
}
function O(t) {
const n = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png");
const r = {
newYears: chrome.runtime.getURL("images/icons/newYears/Purpura_NewYears_Logo_48.png"),
lunarNewYear: chrome.runtime.getURL("images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_48.png"),
valentines: chrome.runtime.getURL("images/icons/valentines/Purpura_Valentines_Logo_48.png"),
blackHistory: chrome.runtime.getURL("images/icons/blackHistory/Purpura_BlackHistory_Logo_48.png"),
stPatricksDay: chrome.runtime.getURL("images/icons/stPatricksDay/Purpura_StPatricks_Logo_48.png"),
womensDay: chrome.runtime.getURL("images/icons/womensDay/Purpura_WomensDay_Logo_48.png"),
easter: chrome.runtime.getURL("images/icons/easter/Purpura_Easter_Logo_48.png"),
pride: chrome.runtime.getURL("images/icons/pride/Purpura_Pride_Logo_48.png"),
halloween: chrome.runtime.getURL("images/icons/halloween/Purpura_Halloween_Logo_48.png"),
diwali: chrome.runtime.getURL("images/icons/diwali/Purpura_Diwali_Logo_48.png"),
hanukkah: chrome.runtime.getURL("images/icons/hanukkah/Purpura_Hanukkah_Logo_48.png"),
christmas: chrome.runtime.getURL("images/icons/christmas/Purpura_Christmas_Logo_48.png")
};
return `<div class="purpura-tabs-picker" data-setting="${t}">\n            <div class="purpura-tabs-section">\n                <span class="purpura-tabs-section-title">${e("settings_tabs_titleFormat")}</span>\n                <input type="text" class="purpura-tabs-title-input" id="purpura-tabs-title-input" placeholder="{n} Purpura" value="">\n                <span class="purpura-tabs-title-hint">${e("settings_tabs_titleHint")}</span>\n            </div>\n            <div class="purpura-tabs-section">\n                <span class="purpura-tabs-section-title">${e("settings_tabs_tabIcon")}</span>\n                <div class="purpura-tabs-icons">\n                    <div class="purpura-tabs-icon-option" data-icon="default">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="https://www.roblox.com/favicon.ico" alt="Website Default" style="width: 32px; height: 32px;">\n                        </div>\n                        <span class="purpura-tabs-icon-name">${e("settings_tabs_website")}</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="purpura">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${n}" alt="Purpura">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Purpura</span>\n                    </div>\n                    <div class="purpura-tabs-upload" id="purpura-tabs-upload">\n                        <span class="purpura-tabs-upload-icon">+</span>\n                        <span class="purpura-tabs-icon-name">${e("settings_tabs_custom")}</span>\n                        <input type="file" id="purpura-tabs-file-input" accept="image/*" style="display: none;">\n                    </div>\n                </div>\n            </div>\n            <div class="purpura-tabs-section">\n                <div class="purpura-tabs-seasonal-toggle" id="purpura-tabs-seasonal-toggle">\n                    <span class="purpura-tabs-seasonal-arrow" id="purpura-tabs-seasonal-arrow">&#9654;</span>\n                    <span>Seasonal Icons (12)</span>\n                </div>\n                <div class="purpura-tabs-seasonal-grid" id="purpura-tabs-seasonal-grid">\n                    <div class="purpura-tabs-icon-option" data-icon="newYears">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.newYears}" alt="New Years">\n                        </div>\n                        <span class="purpura-tabs-icon-name">New Years</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="lunarNewYear">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.lunarNewYear}" alt="Lunar New Year">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Lunar New Year</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="valentines">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.valentines}" alt="Valentines">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Valentine's Day</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="blackHistory">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.blackHistory}" alt="Black History">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Black History</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="stPatricksDay">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.stPatricksDay}" alt="St Patricks">\n                        </div>\n                        <span class="purpura-tabs-icon-name">St. Patrick's Day</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="womensDay">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.womensDay}" alt="Womens Day">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Women's Day</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="easter">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.easter}" alt="Easter">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Easter</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="pride">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.pride}" alt="Pride">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Pride</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="halloween">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.halloween}" alt="Halloween">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Halloween</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="diwali">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.diwali}" alt="Diwali">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Diwali</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="hanukkah">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.hanukkah}" alt="Hanukkah">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Hanukkah</span>\n                    </div>\n                    <div class="purpura-tabs-icon-option" data-icon="christmas">\n                        <div class="purpura-tabs-icon-preview">\n                            <img src="${r.christmas}" alt="Christmas">\n                        </div>\n                        <span class="purpura-tabs-icon-name">Christmas</span>\n                    </div>\n                </div>\n            </div>\n            <div class="purpura-tabs-section">\n                <span class="purpura-tabs-section-title">${e("settings_tabs_preview")}</span>\n                <div class="purpura-tabs-preview">\n                    <img class="purpura-tabs-preview-favicon" id="purpura-tabs-preview-favicon" src="${n}" alt="">\n                    <span class="purpura-tabs-preview-title" id="purpura-tabs-preview-title">Home Purpura</span>\n                </div>\n            </div>\n        </div>`;
}
async function H() {
const t = document.querySelector(".purpura-theme-picker");
if (!t) return;
const n = t.dataset.setting;
const r = await chrome.storage.local.get([ "savedThemes", "thmEnabled", "selectedTheme" ]);
const a = P("savedThemes") || [];
const o = P("thmEnabled");
const s = P("selectedTheme");
const i = r.savedThemes ?? a;
const p = r.thmEnabled !== undefined ? r.thmEnabled : o ?? false;
const c = r.selectedTheme ?? (s ?? "none");
let l = "";
l += `<div class="purpura-theme-option${c === "none" || !p ? " active" : ""}" data-theme="none">\n            <div class="purpura-theme-preview purpura-theme-default">\n                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">\n                    <rect x="4" y="4" width="32" height="32" rx="4" fill="#393b3d"/>\n                    <rect x="8" y="8" width="10" height="6" rx="1" fill="#606162"/>\n                    <rect x="8" y="18" width="24" height="3" rx="1" fill="#606162"/>\n                    <rect x="8" y="24" width="18" height="3" rx="1" fill="#606162"/>\n                </svg>\n            </div>\n            <div class="purpura-theme-info">\n                <span class="purpura-theme-name">${e("settings_theme_defaultRoblox")}</span>\n                <span class="purpura-theme-desc">${e("settings_theme_noChanges")}</span>\n            </div>\n        </div>`;
if (i.length > 0) {
l += `<div class="purpura-theme-section-header">${e("settings_theme_customThemes")}</div>`;
i.forEach(e => {
const t = c === e.id;
l += `<div class="purpura-theme-option custom-theme${t ? " active" : ""}" data-theme="${e.id}">\n                    <div class="purpura-theme-preview purpura-theme-custom">\n                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">\n                            <rect x="4" y="4" width="32" height="32" rx="4" fill="#1a1a2e"/>\n                            <text x="20" y="24" text-anchor="middle" fill="#9b59b6" font-size="16" font-weight="bold">✦</text>\n                        </svg>\n                    </div>\n                    <div class="purpura-theme-info">\n                        <span class="purpura-theme-name">${e.title || e.name || "Custom Theme"}</span>\n                        <span class="purpura-theme-desc">${e.description || "User-created theme"}</span>\n                        ${e.author ? `<span class="purpura-theme-author">by ${e.author}</span>` : ""}\n                    </div>\n                    <button class="purpura-theme-delete" data-delete-theme="${e.id}" title="Delete theme">×</button>\n                </div>`;
});
}
l += `<div class="purpura-theme-add" id="purpura-add-custom-theme">\n            <span class="purpura-theme-add-icon">+</span>\n            <span class="purpura-theme-add-text">${e("settings_theme_addCustomTheme")}</span>\n        </div>`;
l += `<div class="purpura-theme-modal" id="purpura-theme-modal">\n            <div class="purpura-theme-modal-content">\n                <div class="purpura-theme-modal-header">\n                    <h3>${e("settings_theme_addCustomTheme")}</h3>\n                    <button class="purpura-theme-modal-close" id="purpura-close-theme-modal">×</button>\n                </div>\n                <div class="purpura-theme-modal-body">\n                    <p class="purpura-theme-modal-hint">${e("settings_theme_pasteHint")}</p>\n                    <pre class="purpura-theme-manifest-example">/*\n@name Your Theme Name\n@description A short description\n@author Your Name\n*/</pre>\n                    <textarea id="purpura-theme-css" placeholder="${e("settings_theme_pastePlaceholder")}"></textarea>\n                </div>\n                <div class="purpura-theme-modal-actions">\n                    <button class="purpura-theme-modal-btn cancel" id="purpura-cancel-theme">${e("common_cancel")}</button>\n                    <button class="purpura-theme-modal-btn save" id="purpura-save-theme">${e("settings_theme_saveTheme")}</button>\n                </div>\n            </div>\n        </div>`;
/* theme list injection disabled */
const u = document.querySelector(`[data-setting="${n}"]`);
if (u && !u.checked) {
t.classList.add("disabled");
}
}
function U(e, t) {
const n = (t.comingSoon || t.deprecated) ? "disabled" : "";
if (t.type === "checkbox") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "cursor-picker") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "theme-picker") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "tabs-picker") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "uncorporatify-picker") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "pagebinds-picker") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "serverinfo-picker") {
return `<label class="purpura-toggle"><input type="checkbox" data-setting="${e}" ${n}><span class="purpura-toggle-slider"></span></label>`;
} else if (t.type === "wip") {
const e = Array.isArray(t.description) ? t.description.join(" ") : t.description || "This section is under development.";
return `\n                <div class="purpura-wip">\n                    <span class="purpura-wip-icon" aria-hidden="true">⚠️</span>\n                    <span class="purpura-wip-text">${e}</span>\n                </div>\n            `;
} else if (t.type === "select") {
let r = (t.options || []).map(e => {
const n = e === t.default ? "selected" : "";
return `<option value="${e}" ${n}>${e}</option>`;
}).join("");
return `<select data-setting="${e}" ${n}>${r}</select>`;
} else if (t.type === "input") {
return `<input type="text" data-setting="${e}" placeholder="${t.placeholder || ""}" ${n}>`;
}
return "";
}
function V(t) {
const n = A[t];
if (!n) return "";
let r = "";
Object.entries(n.settings).forEach(([t, n]) => {
const a = n.parentSetting ? "child-setting" : "";
const o = "";
r += `<div class="purpura-setting-card ${a} ${o}${n.deprecated ? " is-deprecated" : ""}" data-setting-card="${t}">`;
r += `<div class="purpura-setting-header">`;
r += I(t);
r += `<label>${n.label}</label>`;
if (n.premium) {
r += `<span class="purpura-pill premium">${e("settings_pill_premium")}</span>`;
}
if (n.beta) {
r += `<span class="purpura-pill beta" data-tooltip="${e("settings_pill_beta_tooltip")}">${e("settings_pill_beta")}</span>`;
}
if (n.experimental) {
r += `<span class="purpura-pill experimental" data-tooltip="${e("settings_pill_experimental_tooltip")}">${e("settings_pill_experimental")}</span>`;
}
if (n.deprecated) {
r += `<span class="purpura-pill deprecated" data-tooltip="${e("settings_pill_deprecated_tooltip")}">${e("settings_pill_deprecated")}</span>`;
}
if (n.comingSoon) {
r += `<span class="purpura-pill coming-soon">${e("settings_pill_comingSoon")}</span>`;
}
if (n.helpIcon) {
r += `<span class="purpura-help-icon">?<div class="purpura-help-tooltip">`;
r += `<div class="purpura-help-tooltip-title">${n.helpIcon.title}</div>`;
n.helpIcon.content.forEach(e => {
r += `<div class="purpura-help-tooltip-item">${z(e)}</div>`;
});
r += `</div></span>`;
}
r += U(t, n);
if (t === "statusSpoofer" && n.subSettings && n.subSettings.mode) {
const e = n.subSettings.mode;
const a = [ `\n                    <option value="off" disabled>Off</option>\n                ` ].concat((e.options || []).map(t => {
const n = t === e.default ? "selected" : "";
return `<option value="${t}" ${n}>${t}</option>`;
})).join("");
r += `<select data-sub-setting-input="${t}_mode" data-storage-key="${e.storageKey}" data-storage-path="${e.storagePath}" data-storage-type="${n.storageType || "sync"}">${a}</select>`;
}
r += `</div>`;
r += `<div class="purpura-setting-divider"></div>`;
if (n.type !== "wip") {
const e = Array.isArray(n.description) ? n.description : [ n.description ];
e.forEach(e => {
if (e) r += `<div class="purpura-setting-desc">${z(e)}</div>`;
});
}
if (n.type === "cursor-picker") {
r += q(t);
}
if (n.type === "theme-picker") {
r += R(t);
}
if (n.type === "tabs-picker") {
r += O(t);
}
if (n.type === "uncorporatify-picker") {
r += N(t);
}
if (n.type === "pagebinds-picker") {
r += G(t);
}
if (n.type === "serverinfo-picker") {
r += K(t);
}
if (n.subSettings && t !== "statusSpoofer") {
Object.entries(n.subSettings).forEach(([e, a]) => {
const o = `${t}_${e}`;
r += `<div class="purpura-sub-setting" data-sub-setting="${o}" data-parent="${t}">`;
r += `<div class="purpura-sub-setting-row">`;
r += `<label>${a.label}</label>`;
if (a.type === "select") {
const e = (a.options || []).map(e => {
const t = e === a.default ? "selected" : "";
return `<option value="${e}" ${t}>${e}</option>`;
}).join("");
r += `<select data-sub-setting-input="${o}" data-storage-key="${a.storageKey}" data-storage-path="${a.storagePath}" data-storage-type="${n.storageType || "sync"}">${e}</select>`;
} else if (a.type === "input") {
r += `<input type="text" data-sub-setting-input="${o}" data-storage-key="${a.storageKey}" data-storage-path="${a.storagePath}" data-storage-type="${n.storageType || "sync"}" placeholder="${a.placeholder || ""}">`;
} else {
r += `<label class="purpura-toggle"><input type="checkbox" data-sub-setting-input="${o}" data-storage-key="${a.storageKey}" data-storage-path="${a.storagePath}" data-storage-type="${n.storageType || "sync"}"><span class="purpura-toggle-slider"></span></label>`;
}
r += `</div>`;
if (a.description) {
r += `<div class="purpura-sub-setting-desc">${a.description}</div>`;
}
r += `</div>`;
});
}
if (n.editLayoutAction) {
r += `<button type="button" class="purpura-reset-btn" id="purpura-edit-layout-btn" data-parent-setting="homePageTweaks" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">Edit Layout</button>`;
}
if (n.openTrackerAction) {
r += `<button type="button" class="purpura-reset-btn" id="purpura-open-tracker-btn" data-parent-setting="playtime" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">Open Tracker</button>`;
r += `<button type="button" class="purpura-reset-btn" id="purpura-import-ropro-btn" data-parent-setting="playtime" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">${e("settings_playtime_import_title")}</button>`;
}
if (n.setupGuideAction) {
r += `<button type="button" class="purpura-reset-btn" id="purpura-setup-guide-btn" data-parent-setting="saveLotsRobux" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">Setup Guide</button>`;
}
r += `</div>`;
});
return r;
}
function Y(t, n) {
let r = `<div class="purpura-setting-card${n.deprecated ? " is-deprecated" : ""}" data-setting-card="${t}">`;
r += `<div class="purpura-setting-header">`;
r += I(t);
r += `<label>${n.label}</label>`;
if (n.premium) {
r += `<span class="purpura-pill premium">Premium</span>`;
}
if (n.beta) {
r += `<span class="purpura-pill beta" data-tooltip="${e("settings_pill_beta_tooltip")}">Beta</span>`;
}
if (n.experimental) {
r += `<span class="purpura-pill experimental" data-tooltip="${e("settings_pill_experimental_tooltip")}">Experimental</span>`;
}
if (n.deprecated) {
r += `<span class="purpura-pill deprecated" data-tooltip="${e("settings_pill_deprecated_tooltip")}">${e("settings_pill_deprecated")}</span>`;
}
if (n.comingSoon) {
r += `<span class="purpura-pill coming-soon">Coming Soon</span>`;
}
if (n.helpIcon) {
r += `<span class="purpura-help-icon">?<div class="purpura-help-tooltip">`;
r += `<div class="purpura-help-tooltip-title">${n.helpIcon.title}</div>`;
n.helpIcon.content.forEach(e => {
r += `<div class="purpura-help-tooltip-item">${z(e)}</div>`;
});
r += `</div></span>`;
}
r += U(t, n);
if (t === "statusSpoofer" && n.subSettings && n.subSettings.mode) {
const e = n.subSettings.mode;
const a = [ `\n                <option value="off" disabled>Off</option>\n            ` ].concat((e.options || []).map(t => {
const n = t === e.default ? "selected" : "";
return `<option value="${t}" ${n}>${t}</option>`;
})).join("");
r += `<select data-sub-setting-input="${t}_mode" data-storage-key="${e.storageKey}" data-storage-path="${e.storagePath}" data-storage-type="${n.storageType || "sync"}">${a}</select>`;
}
r += `</div>`;
r += `<div class="purpura-setting-divider"></div>`;
const a = Array.isArray(n.description) ? n.description : [ n.description ];
a.forEach(e => {
if (e) r += `<div class="purpura-setting-desc">${z(e)}</div>`;
});
if (n.type === "cursor-picker") {
r += q(t);
}
if (n.type === "theme-picker") {
r += R(t);
}
if (n.type === "tabs-picker") {
r += O(t);
}
if (n.type === "uncorporatify-picker") {
r += N(t);
}
if (n.type === "pagebinds-picker") {
r += G(t);
}
if (n.type === "serverinfo-picker") {
r += K(t);
}
if (n.subSettings && t !== "statusSpoofer") {
Object.entries(n.subSettings).forEach(([e, a]) => {
const o = `${t}_${e}`;
r += `<div class="purpura-sub-setting" data-sub-setting="${o}" data-parent="${t}">`;
r += `<div class="purpura-sub-setting-row">`;
r += `<label>${a.label}</label>`;
if (a.type === "select") {
const e = (a.options || []).map(e => {
const t = e === a.default ? "selected" : "";
return `<option value="${e}" ${t}>${e}</option>`;
}).join("");
r += `<select data-sub-setting-input="${o}" data-storage-key="${a.storageKey}" data-storage-path="${a.storagePath}" data-storage-type="${n.storageType || "sync"}">${e}</select>`;
} else if (a.type === "input") {
r += `<input type="text" data-sub-setting-input="${o}" data-storage-key="${a.storageKey}" data-storage-path="${a.storagePath}" data-storage-type="${n.storageType || "sync"}" placeholder="${a.placeholder || ""}">`;
} else {
r += `<label class="purpura-toggle"><input type="checkbox" data-sub-setting-input="${o}" data-storage-key="${a.storageKey}" data-storage-path="${a.storagePath}" data-storage-type="${n.storageType || "sync"}"><span class="purpura-toggle-slider"></span></label>`;
}
r += `</div>`;
if (a.description) {
r += `<div class="purpura-sub-setting-desc">${a.description}</div>`;
}
r += `</div>`;
});
}
if (n.editLayoutAction) {
r += `<button type="button" class="purpura-reset-btn" id="purpura-edit-layout-btn" data-parent-setting="homePageTweaks" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">Edit Layout</button>`;
}
if (n.openTrackerAction) {
r += `<button type="button" class="purpura-reset-btn" id="purpura-open-tracker-btn" data-parent-setting="playtime" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">Open Tracker</button>`;
r += `<button type="button" class="purpura-reset-btn" id="purpura-import-ropro-btn" data-parent-setting="playtime" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">${e("settings_playtime_import_title")}</button>`;
}
if (n.setupGuideAction) {
r += `<button type="button" class="purpura-reset-btn" id="purpura-setup-guide-btn" data-parent-setting="saveLotsRobux" style="margin-top:10px;background:var(--p-accent-glow);border-color:var(--p-accent-glow-strong);color:var(--p-accent);">Setup Guide</button>`;
}
r += `</div>`;
return r;
}
const F = {
ghostProfiles_webRequestPermission: {
checkAction: "checkWebRequestPermission",
requestAction: "requestWebRequestPermission",
removeAction: "removeWebRequestPermission",
optOutPath: "webRequestPermissionOptOut"
}
};
function W(e) {
return F[e] || null;
}
function X(e, t) {
if (e && typeof e === "object") {
return e;
}
const n = P(t, "enabled");
const r = typeof e === "boolean" ? e : typeof n === "boolean" ? n : !!e;
return {
enabled: r
};
}
function Z(e, t) {
return new Promise(n => {
try {
e.get(t, e => {
n(e || {});
});
} catch {
n({});
}
});
}
function J(e, t) {
return new Promise(n => {
try {
e.set(t, () => {
n();
});
} catch {
n();
}
});
}
function Q(e) {
return new Promise(t => {
try {
chrome.runtime.sendMessage(e, e => {
if (chrome.runtime.lastError) {
t(null);
return;
}
t(e ?? null);
});
} catch {
t(null);
}
});
}
function ee(e, t = "GET") {
const n = String(t || "GET").trim().toUpperCase() || "GET";
const r = String(e || n).trim().toUpperCase();
return x.has(r) ? r : n;
}
async function te() {
try {
const e = await se("https://apis.roblox.com/creator-home-api/v1/groups", {
method: "GET"
});
if (!e.ok || !e.json || !Array.isArray(e.json.groups)) {
return [];
}
const t = new Set;
return e.json.groups.map(e => {
const n = ce(e && e.id);
if (!n || t.has(n)) return null;
t.add(n);
const r = String(e && e.name ? e.name : `Group ${n}`).trim() || `Group ${n}`;
return {
id: n,
name: r
};
}).filter(Boolean);
} catch {
return [];
}
}
function ce(e) {
const t = String(e || "").trim();
return /^\d+$/.test(t) ? t : "";
}
function le(e) {
if (e && typeof e === "object") {
return {
...e,
enabled: e.enabled === true,
placeId: ce(e.placeId)
};
}
return {
enabled: e === true,
placeId: ""
};
}
async function ue() {
const e = await Z(chrome.storage.sync, [ m ]);
const t = e[m];
const n = le(t);
let r = !!(t && typeof t === "object" && typeof t.placeId === "boolean");
if (!n.placeId) {
const e = await Z(chrome.storage.local, [ b ]);
const t = ce(e[b]);
if (t) {
n.placeId = t;
r = true;
}
}
if (r) {
await J(chrome.storage.sync, {
[m]: n
});
}
return n;
}
async function de(e) {
const t = await ue();
const n = {
...t,
...e
};
await J(chrome.storage.sync, {
[m]: n
});
}
function ge(e) {
const t = document.querySelector(`[data-sub-setting-input="${v}"]`);
if (!t || t.type !== "text") return;
t.value = ce(e);
}

function be(e, t, n, r, a, o) {
n[r] = o;
if (a) {
n[a] = !o;
}
e.set({
[t]: n
});
}
function he(e, t) {
const n = W(t);
if (!n) return;
chrome.runtime.sendMessage({
action: n.checkAction
}, t => {
if (t && typeof t.has === "boolean") {
e.checked = t.has;
}
});
}
function ve(e) {
for (const t of Object.values(A)) {
if (!t.settings) continue;
if (t.settings[e]) {
return t.settings[e];
}
}
return null;
}
function xe(e, t) {
Me(e, t);
document.querySelectorAll(`[data-parent="${e}"]`).forEach(e => {
e.querySelectorAll("[data-sub-setting-input]").forEach(e => {
e.disabled = !t;
});
if (t) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
});
document.querySelectorAll(`[data-sub-setting-input^="${e}_"]`).forEach(e => {
e.disabled = !t;
});
}
function ye(e, t) {
const n = ve(e);
if (!n || n.type !== "checkbox" || !n.storageKey) return;
const r = n.storageType === "sync" ? chrome.storage.sync : chrome.storage.local;
if (n.storagePath) {
r.get([ n.storageKey ], e => {
const a = X(e[n.storageKey], n.storageKey);
a[n.storagePath] = !!t;
r.set({
[n.storageKey]: a
});
});
} else {
r.set({
[n.storageKey]: !!t
});
}
const a = document.querySelector(`[data-setting="${e}"]`);
if (a && a.type === "checkbox") {
a.checked = !!t;
}
xe(e, !!t);
}
function we() {
for (let e in A) {
const t = A[e];
for (let [e, n] of Object.entries(t.settings)) {
if (n.type === "theme-picker" || n.type === "cursor-picker" || n.type === "tabs-picker" || n.type === "uncorporatify-picker" || n.type === "pagebinds-picker" || n.type === "serverinfo-picker") {
continue;
}
if (!n.storageKey || typeof n.storageKey !== "string") {
continue;
}
const t = n.storageType === "sync" ? chrome.storage.sync : chrome.storage.local;
t.get([ n.storageKey ], t => {
const r = document.querySelector(`[data-setting="${e}"]`);
if (!r) return;
let a;
if (n.storagePath) {
a = t[n.storageKey]?.[n.storagePath];
} else {
a = t[n.storageKey];
}
if (n.storageKey === "pb" && Array.isArray(t[n.storageKey])) {
a = true;
}
if (a === undefined) {
const e = P(n.storageKey, n.storagePath);
a = e !== undefined ? e : n.default;
}
if (n.type === "checkbox") {
r.checked = !!a;
} else {
r.value = a;
if (r.tagName === "SELECT") {
nt(r);
}
}
if (e === "statusSpoofer") {
const e = document.querySelector('[data-sub-setting-input="statusSpoofer_mode"]');
if (e) {
e.disabled = !r.checked;
if (!r.checked) {
e.value = "off";
}
nt(e);
}
}
if (n.subSettings) {
document.querySelectorAll(`[data-parent="${e}"]`).forEach(e => {
e.querySelectorAll("[data-sub-setting-input]").forEach(e => {
e.disabled = !r.checked;
});
if (r.checked) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
});
document.querySelectorAll(`[data-sub-setting-input^="${e}_"]`).forEach(e => {
e.disabled = !r.checked;
});
}
if (n.subSettings) {
Object.entries(n.subSettings).forEach(([r, a]) => {
const o = `${e}_${r}`;
const s = document.querySelector(`[data-sub-setting-input="${o}"]`);
if (s) {
const e = t[a.storageKey]?.[a.storagePath];
const r = P(a.storageKey, a.storagePath);
const i = e !== undefined ? e : r !== undefined ? r : a.default;
if (s.type === "checkbox") {
s.checked = !!i;
} else if (s.type === "text") {
const e = typeof i === "string" ? i : i === null || i === undefined || typeof i === "boolean" ? "" : String(i);
s.value = e;
if (typeof i === "boolean" && a.storagePath) {
const e = a.storageType || n.storageType || "sync";
const t = e === "local" ? chrome.storage.local : chrome.storage.sync;
t.get([ a.storageKey ], e => {
const n = X(e[a.storageKey], a.storageKey);
if (n[a.storagePath] === i) {
n[a.storagePath] = "";
t.set({
[a.storageKey]: n
});
}
});
}
} else {
s.value = i;
if (s.tagName === "SELECT") {
nt(s);
}
}
he(s, o);
}
});
}
});
}
}
}
function ke() {
document.querySelectorAll("[data-sub-setting-input]").forEach(e => {
e.addEventListener("change", function(e) {
if (p) return;
const t = this.dataset.storageKey;
const n = this.dataset.storagePath;
const r = this.dataset.storageType || "sync";
const a = this.type === "checkbox" ? this.checked : this.value;
const o = this.dataset.subSettingInput;
const s = o ? o.split("_")[0] : null;
const i = r === "local" ? chrome.storage.local : chrome.storage.sync;
const c = W(o);
if (c) {
if (a) {
chrome.runtime.sendMessage({
action: c.requestAction
}, e => {
const r = !!(e && e.granted);
this.checked = r;
i.get([ t ], e => {
const a = X(e[t], t);
a[n] = r;
if (c.optOutPath) a[c.optOutPath] = !r;
i.set({
[t]: a
});
});
if (!r && s) {
ye(s, false);
}
});
} else {
chrome.runtime.sendMessage({
action: c.removeAction
}, () => {});
i.get([ t ], e => {
const r = X(e[t], t);
r[n] = false;
if (c.optOutPath) r[c.optOutPath] = true;
i.set({
[t]: r
});
});
if (s) {
ye(s, false);
}
}
return;
}
i.get([ t ], e => {
let r = X(e[t], t);
r[n] = a;
i.set({
[t]: r
});
});
});
});
}
function Ee() {
document.querySelectorAll("[data-setting]").forEach(e => {
e.addEventListener("change", function(e) {
if (p) {
return;
}
const t = this.dataset.setting;
let n = null;
let r = null;
for (let e in A) {
if (A[e].settings[t]) {
n = A[e].settings[t];
r = e;
break;
}
}
if (!n) return;
if (n.premium && !l) {
if (n.type === "checkbox") {
this.checked = false;
}
e.preventDefault();
e.stopPropagation();
return;
}
if (n.type === "theme-picker" || n.type === "cursor-picker" || n.type === "tabs-picker" || n.type === "uncorporatify-picker" || n.type === "pagebinds-picker" || n.type === "serverinfo-picker") {
return;
}
if (!n.storageKey || typeof n.storageKey !== "string") {
return;
}
const a = n.storageType === "sync" ? chrome.storage.sync : chrome.storage.local;
const o = n.type === "checkbox" ? this.checked : this.value;
if (n.storagePath) {
a.get([ n.storageKey ], e => {
let t = X(e[n.storageKey], n.storageKey);
t[n.storagePath] = o;
a.set({
[n.storageKey]: t
});
});
} else {
a.set({
[n.storageKey]: o
});
}
if (typeof n.onChange === "function") {
n.onChange(o);
}

if (n.type === "checkbox" && this.checked && n.subSettings) {
Object.entries(n.subSettings).forEach(([e, r]) => {
const a = `${t}_${e}`;
const o = W(a);
if (!o) return;
chrome.runtime.sendMessage({
action: o.checkAction
}, e => {
const s = !!(e && e.has);
if (s) {
const e = r.storageType || n.storageType || "sync";
const t = e === "local" ? chrome.storage.local : chrome.storage.sync;
t.get([ r.storageKey ], e => {
const n = X(e[r.storageKey], r.storageKey);
n.enabled = true;
n[r.storagePath] = true;
if (o.optOutPath) n[o.optOutPath] = false;
t.set({
[r.storageKey]: n
});
});
const s = document.querySelector(`[data-sub-setting-input="${a}"]`);
if (s && s.type === "checkbox") s.checked = true;
return;
}
chrome.runtime.sendMessage({
action: o.requestAction
}, e => {
const s = !!(e && e.granted);
const i = r.storageType || n.storageType || "sync";
const p = i === "local" ? chrome.storage.local : chrome.storage.sync;
p.get([ r.storageKey ], e => {
const t = X(e[r.storageKey], r.storageKey);
t.enabled = s;
t[r.storagePath] = s;
if (o.optOutPath) t[o.optOutPath] = !s;
p.set({
[r.storageKey]: t
});
});
const c = document.querySelector(`[data-sub-setting-input="${a}"]`);
if (c && c.type === "checkbox") c.checked = s;
if (!s) ye(t, false);
});
});
});
}
Me(t, this.checked);
document.querySelectorAll(`[data-parent="${t}"]`).forEach(e => {
e.querySelectorAll("[data-sub-setting-input]").forEach(e => {
e.disabled = !this.checked;
});
if (this.checked) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
});
document.querySelectorAll(`[data-sub-setting-input^="${t}_"]`).forEach(e => {
e.disabled = !this.checked;
});
if (t === "statusSpoofer") {
const e = document.querySelector('[data-sub-setting-input="statusSpoofer_mode"]');
if (e) {
if (!this.checked) {
e.value = "off";
nt(e);
} else {
chrome.storage.sync.get([ "spc" ], t => {
const n = t["spc"];
if (n && typeof n === "object" && n.mode) {
if (n.mode === "studio") {
e.value = "In-Studio";
} else {
e.value = "Offline";
}
} else {
e.value = "Offline";
}
nt(e);
});
}
}
}
});
});
}
let _e = false;
function Ce() {
if (_e) return;
_e = true;
document.addEventListener("click", function(e) {
const t = e.target.closest && e.target.closest("#purpura-edit-layout-btn") || null;
if (t && !t.disabled) {
Te();
}
});

document.addEventListener("click", function(e) {
const t = e.target.closest && e.target.closest("#purpura-open-tracker-btn") || null;
if (t && !t.disabled) {
window.location.href = 'https://www.roblox.com/purpura-time';
}
});
document.addEventListener("click", function(e) {
const t = e.target.closest && e.target.closest("#purpura-import-ropro-btn") || null;
if (t && !t.disabled && window.__PurpuraRoProImport) {
window.__PurpuraRoProImport.open();
}
});
document.addEventListener("click", function(e) {
const t = e.target.closest("#purpura-setup-guide-btn");
if (t && !t.disabled) {
showRobuxSaverSetupGuide();
}
});
}
function copySlrGuideText(text) {
return new Promise(function(resolve) {
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).then(function() { resolve(true); }, function() { resolve(false); });
} else {
try {
var ta = document.createElement("textarea");
ta.value = text;
ta.style.position = "fixed";
ta.style.opacity = "0";
ta.style.pointerEvents = "none";
document.body.appendChild(ta);
ta.select();
var ok = document.execCommand("copy");
ta.remove();
resolve(ok);
} catch (e2) { resolve(false); }
}
});
}
function showRobuxSaverSetupGuide() {
var existing = document.getElementById("purpura-slr-setup-overlay");
if (existing) { existing.remove(); return; }
var luaCode = '-- PurpuraPurchaseHandler (Server Script)\n-- Place in ServerScriptService\nlocal MarketplaceService = game:GetService("MarketplaceService")\n\nMarketplaceService.ProcessReceipt = function(receiptInfo)\n\treturn Enum.ProductPurchaseDecision.PurchaseGranted\nend';
if (!document.getElementById("purpura-slr-guide-styles")) {
var st = document.createElement("style");
st.id = "purpura-slr-guide-styles";
st.textContent = `#purpura-slr-setup-overlay{--slg-bg:#0b0c12;--slg-bg-3:#161720;--slg-text:#f0eeff;--slg-text-2:#a89ec4;--slg-text-3:#6d6487;--slg-accent:#9b6dff;--slg-accent-hover:#b088ff;--slg-accent-glow:rgba(155,109,255,0.15);--slg-border:rgba(255,255,255,0.07);--slg-border-2:rgba(255,255,255,0.12);--slg-success:#4ade80;--slg-ease:cubic-bezier(0.22,1,0.36,1)}
#purpura-slr-setup-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,4,10,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:var(--slg-text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;opacity:0;transition:opacity 0.18s ease}
#purpura-slr-setup-overlay.slg-visible{opacity:1}
#purpura-slr-setup-overlay *{box-sizing:border-box}
.slg-modal{position:relative;width:460px;max-width:100%;max-height:calc(100vh - 24px);overflow-y:auto;background:var(--slg-bg);border:1px solid var(--slg-border-2);border-radius:12px;padding:14px;box-shadow:0 24px 80px rgba(0,0,0,0.5);transform:translateY(14px) scale(0.97);transition:transform 0.22s var(--slg-ease)}
#purpura-slr-setup-overlay.slg-visible .slg-modal{transform:none}
.slg-modal-close{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:6px;border:1px solid transparent;background:none;color:var(--slg-text-2);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
.slg-modal-close:hover{background:var(--slg-bg-3);color:var(--slg-text);border-color:var(--slg-border)}
.slg-modal-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-right:24px}
.slg-modal-title{font-size:14px;font-weight:700;margin:0;letter-spacing:-0.3px;color:var(--slg-text)}
.slg-alert{border-radius:8px;padding:8px 10px;margin-bottom:10px;font-size:11px;line-height:1.4}
.slg-alert strong{display:block;margin-bottom:2px}
.slg-alert-warn{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25)}
.slg-alert-warn strong{color:#f87171}
.slg-alert-note{background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2)}
.slg-alert-note strong{color:#facc15}
.slg-steps{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.slg-step{display:flex;gap:8px}
.slg-step-num{width:19px;height:19px;border-radius:50%;background:var(--slg-accent-glow);border:1px solid var(--slg-accent);color:var(--slg-accent-hover);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;margin-top:0}
.slg-step-content{flex:1;min-width:0}
.slg-step-title{font-size:12px;font-weight:600;margin-bottom:2px;color:var(--slg-text)}
.slg-step-desc{font-size:11px;color:var(--slg-text-2);line-height:1.4}
.slg-step-desc strong{color:var(--slg-text)}
.slg-code-wrap{position:relative;margin-top:6px}
.slg-code{display:block;background:var(--slg-bg-3);border:1px solid var(--slg-border);border-radius:6px;padding:8px 8px 34px;font-size:9px;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--slg-text-2);word-break:break-all;max-height:78px;overflow-y:auto;white-space:pre-wrap}
.slg-copy-btn{position:absolute;bottom:6px;right:6px;padding:4px 8px;border-radius:6px;border:1px solid var(--slg-border-2);background:var(--slg-bg);color:var(--slg-text);font-size:10px;font-weight:600;cursor:pointer;transition:all 0.15s}
.slg-copy-btn:hover{border-color:var(--slg-accent);color:var(--slg-accent-hover)}
.slg-copy-btn.copied{border-color:var(--slg-success);color:var(--slg-success)}
.slg-modal-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--slg-border)}
.slg-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.18s;border:1px solid transparent;color:var(--slg-text)}
.slg-btn-ghost{background:var(--slg-bg-3);border-color:var(--slg-border-2);color:var(--slg-text-2)}
.slg-btn-ghost:hover{color:var(--slg-text);border-color:var(--slg-border-2);transform:translateY(-1px)}
.slg-btn-primary{background:linear-gradient(135deg,var(--slg-accent),#7c4dff);color:#fff;box-shadow:0 4px 18px var(--slg-accent-glow)}
.slg-btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 8px 24px var(--slg-accent-glow)}
@media(prefers-reduced-motion:reduce){#purpura-slr-setup-overlay,.slg-modal{animation:none;transition:none}}`;
document.head.appendChild(st);
}
function stepHtml(num, titleKey, descKey, extra) {
return '<div class="slg-step"><span class="slg-step-num">' + num + '</span><div class="slg-step-content"><div class="slg-step-title">' + e(titleKey) + '</div><div class="slg-step-desc">' + e(descKey) + '</div>' + (extra || '') + '</div></div>';
}
var overlay = document.createElement("div");
overlay.id = "purpura-slr-setup-overlay";
overlay.innerHTML = '<div class="slg-modal">' +
'<button type="button" class="slg-modal-close" id="purpura-slr-guide-close" aria-label="Close">✕</button>' +
'<div class="slg-modal-head"><h2 class="slg-modal-title">' + e("slr_setup_title") + '</h2></div>' +
'<div class="slg-alert slg-alert-warn"><strong>' + e("slr_setup_warning_label") + '</strong>' + e("slr_setup_warning_text") + '</div>' +
'<div class="slg-steps">' +
stepHtml(1, "slr_setup_step1Title", "slr_setup_step1") +
stepHtml(2, "slr_setup_step2Title", "slr_setup_step2") +
stepHtml(3, "slr_setup_step3Title", "slr_setup_step3") +
stepHtml(4, "slr_setup_step4Title", "slr_setup_step4", '<div class="slg-code-wrap"><code class="slg-code" id="purpura-slr-guide-code"></code><button type="button" class="slg-copy-btn" id="purpura-slr-guide-copy">' + e("slr_setup_copy") + '</button></div>') +
stepHtml(5, "slr_setup_step5Title", "slr_setup_step5") +
stepHtml(6, "slr_setup_step6Title", "slr_setup_step6") +
stepHtml(7, "slr_setup_step7Title", "slr_setup_step7") +
'</div>' +
'<div class="slg-alert slg-alert-note"><strong>' + e("slr_setup_payouts_label") + '</strong>' + e("slr_setup_payouts_text") + '<strong>' + e("slr_setup_pending_label") + '</strong>' + e("slr_setup_pending_text") + '</div>' +
'<div class="slg-modal-footer">' +
'<button type="button" class="slg-btn slg-btn-ghost" id="purpura-slr-guide-cancel">' + e("slr_setup_close") + '</button>' +
'<button type="button" class="slg-btn slg-btn-primary" id="purpura-slr-guide-gotit">' + e("slr_setup_gotit") + '</button>' +
'</div>' +
'</div>';
document.body.appendChild(overlay);
var codeEl = overlay.querySelector("#purpura-slr-guide-code");
if (codeEl) codeEl.textContent = luaCode;
requestAnimationFrame(function() { overlay.classList.add("slg-visible"); });
function close() {
document.removeEventListener("keydown", escHandler);
if (!overlay.parentNode) return;
overlay.classList.remove("slg-visible");
setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 180);
}
var escHandler = function(ev) { if (ev.key === "Escape") close(); };
document.addEventListener("keydown", escHandler);
overlay.addEventListener("click", function(e2) { if (e2.target === overlay) close(); });
var closeBtn = overlay.querySelector("#purpura-slr-guide-close");
if (closeBtn) closeBtn.addEventListener("click", close);
var cancelBtn = overlay.querySelector("#purpura-slr-guide-cancel");
if (cancelBtn) cancelBtn.addEventListener("click", close);
var gotitBtn = overlay.querySelector("#purpura-slr-guide-gotit");
if (gotitBtn) gotitBtn.addEventListener("click", close);
var copyBtn = overlay.querySelector("#purpura-slr-guide-copy");
if (copyBtn) copyBtn.addEventListener("click", function() {
copySlrGuideText(luaCode).then(function(ok) {
copyBtn.textContent = ok ? e("slr_setup_copied") : e("slr_setup_copy");
copyBtn.classList.add("copied");
setTimeout(function() { copyBtn.textContent = e("slr_setup_copy"); copyBtn.classList.remove("copied"); }, 2000);
});
});
}
let Le = false;
function $e() {
const e = document.getElementById("purpura-edit-layout-btn");
if (!e) return;
const t = document.querySelector('[data-setting="homePageTweaks"]');
if (!t) return;
const n = t.checked;
e.disabled = !n;
e.style.opacity = n ? "1" : "0.45";
e.style.cursor = n ? "pointer" : "not-allowed";
}
function Se() {
if (Le) return;
Le = true;
document.addEventListener("change", function(e) {
if (e.target && e.target.getAttribute && e.target.getAttribute("data-setting") === "homePageTweaks") {
const t = document.getElementById("purpura-edit-layout-btn");
if (t) {
const n = e.target.checked;
t.disabled = !n;
t.style.opacity = n ? "1" : "0.45";
t.style.cursor = n ? "pointer" : "not-allowed";
}
}
});
setTimeout($e, 600);
}
let Pe = false;function Te() {
const e = document.getElementById("purpura-layout-editor-modal");
if (e) {
e.remove();
}
if (Pe) return;
Pe = true;
chrome.storage.local.get([ "hpt" ], e => {
chrome.storage.sync.get([ "pg" ], t => {
const n = e.hpt || {};
const r = t.pg === true;
let a = n.homeLayout;
if (typeof a === "string") {
try {
a = JSON.parse(a);
} catch (e) {
a = null;
}
}
const o = Array.isArray(a) ? a : [ "friends", "pinnedGames", "continuePlaying", "recommendedGames", "favoriteGames", "todaysGamePicks", "standoutGames" ];
if (!r) {
const e = o.indexOf("pinnedGames");
if (e >= 0) o.splice(e, 1);
}
if (!o.includes("favoriteGames")) {
const e = o.indexOf("recommendedGames");
if (e >= 0) {
o.splice(e + 1, 0, "favoriteGames");
} else {
o.push("favoriteGames");
}
n.homeLayout = o;
chrome.storage.local.set({
hpt: n
});
}
const s = {
continuePlaying: "Continue Playing",
todaysGamePicks: "Today's Picks",
recommendedGames: "Recommended For You",
favoriteGames: "Favorite Games",
standoutGames: "Standout Games",
friends: "Friends",
pinnedGames: "Pinned Games",
gamesMissing: "Games You're Missing",
peopleYouMayKnow: "People You May Know",
underratedGames: "Underrated Games"
};
const isLight = _ === "light";
const colors = isLight ? {
bg: '#ffffff', border: 'rgba(0,0,0,0.12)', text: '#111113', text2: '#4b4b55', text3: '#8a8a95',
card: 'rgba(0,0,0,0.03)', cardBorder: 'rgba(0,0,0,0.08)', accent: '#7c3aed',
sliderOff: '#c8c8d0', btnBg: 'rgba(0,0,0,0.04)', btnBorder: 'rgba(0,0,0,0.1)', btnText: '#4b4b55',
overlay: 'rgba(17,17,19,0.40)', shadow: '0 24px 64px rgba(0,0,0,0.15)', danger: '#dc2626'
} : {
bg: '#1a1b26', border: 'rgba(255,255,255,0.12)', text: '#f0eeff', text2: '#a89ec4', text3: '#6d6487',
card: 'rgba(255,255,255,0.04)', cardBorder: 'rgba(255,255,255,0.08)', accent: '#9b6dff',
sliderOff: '#2a2b36', btnBg: 'rgba(255,255,255,0.06)', btnBorder: 'rgba(255,255,255,0.1)', btnText: '#a89ec4',
overlay: 'rgba(0,0,0,0.6)', shadow: '0 24px 64px rgba(0,0,0,0.6)', danger: '#ef4444'
};
const i = document.createElement("div");
i.id = "purpura-layout-editor-modal";
i.style.cssText = "position:fixed;inset:0;z-index:100000;background:" + colors.overlay + ";display:flex;align-items:center;justify-content:center;";
const p = document.createElement("div");
p.style.cssText = "background:" + colors.bg + ";border:1px solid " + colors.border + ";border-radius:18px;padding:24px;width:420px;max-width:92vw;max-height:85vh;overflow-y:auto;color:" + colors.text + ";font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:" + colors.shadow + ";";
const c = document.createElement("div");
c.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;";
const titleH3 = document.createElement("h3");
titleH3.textContent = "Edit Home Layout";
titleH3.style.cssText = "margin:0;font-size:18px;font-weight:700;color:" + colors.text + ";";
const l = document.createElement("button");
l.textContent = "×";
l.style.cssText = "background:" + colors.card + ";border:1px solid " + colors.cardBorder + ";color:" + colors.text2 + ";width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;";
l.addEventListener("click", () => {
i.remove();
Pe = false;
});
c.appendChild(titleH3);
c.appendChild(l);
p.appendChild(c);
const u = document.createElement("p");
u.textContent = "Drag to reorder. Toggle to show or hide sections.";
u.style.cssText = "font-size:12px;color:" + colors.text3 + ";margin:0 0 12px 0;";
p.appendChild(u);
const d = document.createElement("ul");
d.style.cssText = "list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;";
let g = null;
o.forEach(e => {
const t = s[e] || e;
const r = n[e] === true;
const a = document.createElement("li");
a.draggable = true;
a.dataset.type = e;
a.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:" + colors.card + ";border:1px solid " + colors.cardBorder + ";border-radius:10px;cursor:grab;transition:border-color 0.15s,background 0.15s;";
if (r) a.style.opacity = "0.45";
const o = document.createElement("span");
o.textContent = "≡";
o.style.cssText = "color:" + colors.text3 + ";font-size:18px;cursor:grab;user-select:none;flex-shrink:0;";
const ii = document.createElement("span");
ii.textContent = t;
ii.style.cssText = "flex:1;font-size:14px;font-weight:500;color:" + colors.text + ";";
const toggle = document.createElement("label");
toggle.style.cssText = "position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0;cursor:pointer;";
const input = document.createElement("input");
input.type = "checkbox";
input.checked = !r;
input.style.cssText = "opacity:0;width:0;height:0;";
const slider = document.createElement("span");
slider.style.cssText = "position:absolute;inset:0;background:" + (input.checked ? colors.accent : colors.sliderOff) + ";border-radius:99px;transition:background 0.25s;";
const knob = document.createElement("span");
knob.style.cssText = "position:absolute;height:14px;width:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform 0.3s;";
if (input.checked) knob.style.transform = "translateX(16px)";
input.addEventListener("change", function() {
n[e] = !this.checked;
a.style.opacity = this.checked ? "1" : "0.45";
slider.style.background = this.checked ? colors.accent : colors.sliderOff;
knob.style.transform = this.checked ? "translateX(16px)" : "";
});
toggle.appendChild(input);
toggle.appendChild(slider);
slider.appendChild(knob);
a.appendChild(o);
a.appendChild(ii);
a.appendChild(toggle);
a.addEventListener("dragstart", function(e) {
g = this;
this.style.opacity = "0.5";
});
a.addEventListener("dragend", function() {
const e = n[this.dataset.type] === true;
this.style.opacity = e ? "0.45" : "1";
g = null;
});
a.addEventListener("dragover", function(e) {
e.preventDefault();
});
a.addEventListener("dragenter", function(e) {
e.preventDefault();
if (this !== g) this.style.borderTop = "2px solid " + colors.accent;
});
a.addEventListener("dragleave", function() {
this.style.borderTop = "";
});
a.addEventListener("drop", function(e) {
e.stopPropagation();
this.style.borderTop = "";
if (g && g !== this) {
if (Array.from(d.children).indexOf(g) < Array.from(d.children).indexOf(this)) {
this.parentNode.insertBefore(g, this.nextSibling);
} else {
this.parentNode.insertBefore(g, this);
}
}
});
d.appendChild(a);
});
p.appendChild(d);
const f = document.createElement("div");
f.style.cssText = "display:flex;gap:8px;margin-top:18px;";
const m = document.createElement("button");
m.textContent = "Reset to Default";
m.style.cssText = "flex:1;padding:10px 16px;background:transparent;border:1px solid " + colors.danger + ";color:" + colors.danger + ";border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s,color 0.15s;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";
m.addEventListener("mouseenter", () => {
m.style.background = colors.danger;
m.style.color = "#fff";
});
m.addEventListener("mouseleave", () => {
m.style.background = "transparent";
m.style.color = colors.danger;
});
m.addEventListener("click", () => {
const e = [ "friends", "pinnedGames", "continuePlaying", "recommendedGames", "favoriteGames", "todaysGamePicks", "standoutGames" ];
n.homeLayout = e;
n.todaysGamePicks = false;
n.continuePlaying = false;
n.recommendedGames = false;
n.favoriteGames = false;
n.friends = false;
n.standoutGames = false;
n.pinnedGames = false;
chrome.storage.local.set({
hpt: n
}, () => {
i.remove();
Pe = false;
});
});
const b = document.createElement("button");
b.textContent = "Save";
b.style.cssText = "flex:1;padding:10px 16px;background:" + colors.accent + ";border:1px solid " + colors.accent + ";color:#fff;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity 0.15s;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";
b.addEventListener("click", () => {
const e = Array.from(d.querySelectorAll("li")).map(e => e.dataset.type);
n.homeLayout = e;
chrome.storage.local.set({
hpt: n
}, () => {
i.remove();
Pe = false;
});
});
f.appendChild(m);
f.appendChild(b);
p.appendChild(f);
i.appendChild(p);
i.addEventListener("keydown", function(e) {
if (e.key === "Escape") {
i.remove();
Pe = false;
}
});
i.addEventListener("click", function(e) {
if (e.target === i) {
i.remove();
Pe = false;
}
});
document.body.appendChild(i);
i.setAttribute("tabindex", "-1");
i.focus();
});
});
}
function Me(e, t) {
for (const n of Object.values(A)) {
if (!n.settings) continue;
Object.entries(n.settings).forEach(([n, r]) => {
if (r.parentSetting === e) {
const e = document.querySelector(`[data-setting-card="${n}"]`);
if (e) {
if (t) {
e.classList.remove("parent-disabled");
} else {
e.classList.add("parent-disabled");
}
}
}
});
}
}
function Ae() {
const e = document.querySelector(".purpura-pagebinds-picker");
if (!e) return;
const t = e.dataset.setting;
const n = document.querySelector(`[data-setting="${t}"]`);
const r = document.getElementById("purpura-pagebinds-list");
const a = document.getElementById("purpura-pagebinds-add-btn");
const o = document.getElementById("purpura-pagebinds-add-form");
const s = document.getElementById("purpura-pagebinds-new-key-btn");
const i = P("pb");
const p = Array.isArray(i) ? i : i?.binds || [ {
key: "G",
name: "Groups",
url: "https://www.roblox.com/communities/",
enabled: true,
isDefault: true
}, {
key: "I",
name: "Inventory",
url: "https://www.roblox.com/users/{userID}/inventory",
enabled: true,
isDefault: true
}, {
key: "C",
name: "Catalog",
url: "https://www.roblox.com/catalog",
enabled: true,
isDefault: true
}, {
key: "E",
name: "Avatar Editor",
url: "https://www.roblox.com/my/avatar",
enabled: true,
isDefault: true
}, {
key: "F",
name: "Friends",
url: "https://www.roblox.com/users/friends",
enabled: true,
isDefault: true
}, {
key: "S",
name: "Studio",
url: "https://create.roblox.com/",
enabled: true,
isDefault: true
}, {
key: "R",
name: "Games",
url: "https://www.roblox.com/charts",
enabled: true,
isDefault: true
}, {
key: "P",
name: "Purpura Settings",
url: "https://www.roblox.com/my/account?purpura=info#!/info",
enabled: true,
isDefault: true
} ];
function c(e) {
if (Array.isArray(e)) return {
enabled: true,
binds: e
};
if (e && typeof e === "object" && Array.isArray(e.binds)) return {
enabled: e.enabled === true,
binds: e.binds
};
return {
enabled: false,
binds: p.map(e => Object.assign({}, e))
};
}
let l = null;
function u(e) {
try {
const t = new URL(e);
if (t.protocol !== "https:" && t.protocol !== "http:") return false;
const n = t.hostname;
return /(?:^|\.)roblox\.[a-z]+$/.test(n) || /(?:^|\.)rolimons\.[a-z]+$/.test(n);
} catch {
return false;
}
}
function d(e, t, n) {
if (l) {
document.removeEventListener("keydown", l, true);
l = null;
}
document._purpuraCapturingKey = true;
e.textContent = "Press key...";
e.classList.add("capturing");
l = function(r) {
if (r.key === "Escape") {
r.preventDefault();
r.stopPropagation();
r.stopImmediatePropagation();
e.textContent = t || "?";
e.classList.remove("capturing");
e.dataset.key = t || "";
document.removeEventListener("keydown", l, true);
l = null;
document._purpuraCapturingKey = false;
return;
}
if (r.key.length !== 1) return;
r.preventDefault();
r.stopPropagation();
r.stopImmediatePropagation();
const a = r.key.toUpperCase();
e.textContent = a;
e.classList.remove("capturing");
e.dataset.key = a;
document.removeEventListener("keydown", l, true);
l = null;
document._purpuraCapturingKey = false;
if (n) n(a);
};
document.addEventListener("keydown", l, true);
}
function g(e, t, n) {
e.textContent = n;
e.style.background = "linear-gradient(135deg, #c0392b, #96281b)";
e.style.fontSize = "9px";
e.style.minWidth = "64px";
setTimeout(() => {
e.textContent = t;
e.style.background = "";
e.style.fontSize = "";
e.style.minWidth = "";
}, 2500);
}
function f(e, t) {
if (!t) return e;
return e.replace(/\{userID\}/g, t);
}
function m(e, t) {
let n = "";
e.forEach((e, r) => {
const a = e.isDefault === true;
const o = f(e.url, t);
n += `<div class="purpura-pagebinds-item" data-index="${r}">\n                    <button class="purpura-pagebinds-key-btn" data-keybind-key-btn="${r}" title="Click to change key">${e.key.toUpperCase()}</button>\n                    <div class="purpura-pagebinds-info">\n                        <div class="purpura-pagebinds-name">${e.name}</div>\n                        <div class="purpura-pagebinds-url">${o}</div>\n                    </div>\n                    <div class="purpura-pagebinds-actions">\n                        ${!a ? `<button class="purpura-pagebinds-action-btn" data-keybind-edit="${r}" title="Edit">✏️</button>` : ""}\n                        ${!a ? `<button class="purpura-pagebinds-action-btn delete" data-keybind-delete="${r}" title="Delete">🗑️</button>` : ""}\n                        <label class="purpura-pagebinds-toggle">\n                            <input type="checkbox" data-keybind-index="${r}" ${e.enabled ? "checked" : ""}>\n                            <span class="slider"></span>\n                        </label>\n                    </div>\n                </div>`;
});
r.innerHTML = n;
b(e);
}
function b(e) {
r.querySelectorAll("[data-keybind-index]").forEach(e => {
e.addEventListener("change", function() {
const e = parseInt(this.dataset.keybindIndex);
const t = this.checked;
chrome.storage.sync.get([ "pb" ], n => {
const r = c(n["pb"]);
if (r.binds[e]) {
r.binds[e].enabled = t;
chrome.storage.sync.set({
pb: r
});
}
});
});
});
r.querySelectorAll("[data-keybind-key-btn]").forEach(t => {
t.addEventListener("click", function() {
const t = parseInt(this.dataset.keybindKeyBtn);
const n = e[t].key.toUpperCase();
const r = this;
d(this, n, e => {
chrome.storage.sync.get([ "pb" ], a => {
const o = c(a["pb"]);
const s = o.binds.findIndex((n, r) => r !== t && n.key.toUpperCase() === e);
if (s !== -1) {
g(r, n, "In use!");
return;
}
o.binds[t].key = e;
chrome.storage.sync.set({
pb: o
}, x);
});
});
});
});
r.querySelectorAll("[data-keybind-edit]").forEach(t => {
t.addEventListener("click", function() {
const t = parseInt(this.dataset.keybindEdit);
v(t, e[t]);
});
});
r.querySelectorAll("[data-keybind-delete]").forEach(e => {
e.addEventListener("click", function() {
const e = parseInt(this.dataset.keybindDelete);
chrome.storage.sync.get([ "pb" ], t => {
const n = c(t["pb"]);
n.binds.splice(e, 1);
chrome.storage.sync.set({
pb: n
}, x);
});
});
});
}
function h(e) {
const t = document.getElementById("purpura-pagebinds-form-error");
if (t) t.textContent = e;
}
function v(e, t) {
r.querySelectorAll(".purpura-pagebinds-edit-form").forEach(e => e.remove());
const n = document.createElement("div");
n.className = "purpura-pagebinds-edit-form";
const a = `edit-${e}`;
n.innerHTML = `\n                <div class="purpura-pagebinds-form-row">\n                    <button class="purpura-pagebinds-key-btn" id="pb-key-${a}" data-key="${t.key.toUpperCase()}">${t.key.toUpperCase()}</button>\n                    <input class="purpura-pagebinds-form-input" id="pb-name-${a}" value="${t.name}" placeholder="Name" maxlength="30">\n                    <input class="purpura-pagebinds-form-input purpura-pagebinds-form-url" id="pb-url-${a}" value="${t.url}" placeholder="URL">\n                </div>\n                <div class="purpura-pagebinds-form-actions">\n                    <span class="purpura-pagebinds-form-error" id="pb-err-${a}"></span>\n                    <button class="purpura-pagebinds-btn-cancel" id="pb-cancel-${a}">Cancel</button>\n                    <button class="purpura-pagebinds-btn-save" id="pb-save-${a}">Save</button>\n                </div>`;
const o = r.querySelector(`[data-index="${e}"]`);
o.after(n);
const s = document.getElementById(`pb-key-${a}`);
s.addEventListener("click", () => d(s, t.key.toUpperCase(), () => {}));
document.getElementById(`pb-cancel-${a}`).addEventListener("click", () => n.remove());
document.getElementById(`pb-save-${a}`).addEventListener("click", () => {
const t = (s.dataset.key || "").toUpperCase();
const n = document.getElementById(`pb-name-${a}`).value.trim();
const r = document.getElementById(`pb-url-${a}`).value.trim();
const o = document.getElementById(`pb-err-${a}`);
if (!t) {
o.textContent = "Set a key first.";
return;
}
if (!n) {
o.textContent = "Name is required.";
return;
}
if (!u(r)) {
o.textContent = "URL must be a Roblox or Rolimons address.";
return;
}
chrome.storage.sync.get([ "pb" ], a => {
const s = c(a["pb"]);
const i = s.binds.findIndex((n, r) => r !== e && n.key.toUpperCase() === t);
if (i !== -1) {
o.textContent = `Key "${t}" already used by "${s.binds[i].name}".`;
return;
}
s.binds[e] = Object.assign({}, s.binds[e], {
key: t,
name: n,
url: r
});
chrome.storage.sync.set({
pb: s
}, x);
});
});
}
function x() {
chrome.storage.sync.get([ "pb" ], e => {
chrome.storage.local.get([ "robloxUserId" ], t => {
const n = t.robloxUserId;
const r = e["pb"];
let a = [];
if (Array.isArray(r)) {
a = r;
} else if (r && Array.isArray(r.binds)) {
a = r.binds;
} else {
a = p;
}
m(a, n);
});
});
}
x();
a.addEventListener("click", () => {
const e = o.style.display !== "none";
if (e) {
o.style.display = "none";
if (l) {
document.removeEventListener("keydown", l, true);
l = null;
}
return;
}
o.style.display = "flex";
o.style.flexDirection = "column";
s.textContent = "Press key...";
s.dataset.key = "";
s.classList.add("capturing");
document.getElementById("purpura-pagebinds-new-name").value = "";
document.getElementById("purpura-pagebinds-new-url").value = "";
document.getElementById("purpura-pagebinds-form-error").textContent = "";
d(s, "", () => {});
});
s.addEventListener("click", () => d(s, s.dataset.key || "", () => {}));
document.getElementById("purpura-pagebinds-add-cancel").addEventListener("click", () => {
o.style.display = "none";
if (l) {
document.removeEventListener("keydown", l, true);
l = null;
}
});
document.getElementById("purpura-pagebinds-add-save").addEventListener("click", () => {
const e = (s.dataset.key || "").toUpperCase();
const t = document.getElementById("purpura-pagebinds-new-name").value.trim();
const n = document.getElementById("purpura-pagebinds-new-url").value.trim();
const r = document.getElementById("purpura-pagebinds-form-error");
if (!e) {
r.textContent = "Press a key first.";
return;
}
if (!t) {
r.textContent = "Name is required.";
return;
}
if (!u(n)) {
r.textContent = "URL must be a Roblox or Rolimons address.";
return;
}
chrome.storage.sync.get([ "pb" ], a => {
const s = c(a["pb"]);
const i = s.binds.find(t => t.key.toUpperCase() === e);
if (i) {
r.textContent = `Key "${e}" is already used by "${i.name}".`;
return;
}
s.binds.push({
key: e,
name: t,
url: n,
enabled: true,
isDefault: false
});
chrome.storage.sync.set({
pb: s
}, () => {
o.style.display = "none";
x();
});
});
});
chrome.storage.sync.get([ "pb" ], t => {
const r = c(t["pb"]);
if (n) n.checked = r.enabled;
if (!r.enabled) e.classList.add("disabled");
});
if (n) {
n.addEventListener("change", function() {
const t = this.checked;
e.classList.toggle("disabled", !t);
chrome.storage.sync.get([ "pb" ], e => {
const n = c(e["pb"]);
n.enabled = t;
chrome.storage.sync.set({
pb: n
});
});
});
}
}
function je() {
const e = document.querySelector(".purpura-uncorporatify-picker");
if (!e) return;
const t = e.dataset.setting;
const n = document.querySelector(`[data-setting="${t}"]`);
const r = P("uncConfig") || {
enabled: false,
sections: {
charts: true,
marketplace: true,
create: true,
groups: true
}
};
chrome.storage.local.get([ "unc", "uncConfig", "purpuraDefaultSettings" ], t => {
let a;
if (t.unc !== undefined) {
a = t.unc === true;
} else {
const e = t.purpuraDefaultSettings || {};
a = e.unc !== undefined ? !!e.unc : true;
chrome.storage.local.set({
unc: a
});
}
const o = t.uncConfig || r;
if (n) {
n.checked = a;
}
if (!a) {
e.classList.add("disabled");
}
Object.keys(o.sections).forEach(t => {
const n = e.querySelector(`[data-section="${t}"]`);
if (n) {
n.checked = o.sections[t];
}
});
});
if (n) {
n.addEventListener("change", function() {
const t = this.checked;
if (t) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
chrome.storage.local.get([ "uncConfig" ], e => {
const n = e.uncConfig || {
sections: {
charts: true,
marketplace: true,
create: true,
groups: true
}
};
n.enabled = t;
chrome.storage.local.set({
unc: t,
uncConfig: n
});
});
});
}
e.querySelectorAll("[data-section]").forEach(t => {
t.addEventListener("change", function() {
if (e.classList.contains("disabled")) return;
const t = this.dataset.section;
const n = this.checked;
chrome.storage.local.get([ "uncConfig" ], e => {
const r = e.uncConfig || {
enabled: true,
sections: {
charts: true,
marketplace: true,
create: true,
groups: true
}
};
r.sections[t] = n;
chrome.storage.local.set({
uncConfig: r
});
});
});
});
}
function Be() {
const e = document.querySelector(".purpura-serverinfo-picker");
if (!e) return;
const t = e.dataset.setting;
const n = document.querySelector(`[data-setting="${t}"]`);
const r = P("si") || {
enabled: true,
info: {
region: true,
ping: true,
fps: true,
serverVersion: false,
serverId: false
}
};
chrome.storage.sync.get([ "si" ], t => {
const a = t["si"];
let o;
let s;
if (typeof a === "boolean") {
o = a;
s = {
...r.info
};
} else if (typeof a === "object" && a !== null) {
o = a.enabled !== false;
s = {
region: a.info?.region !== undefined ? a.info.region : r.info.region,
ping: a.info?.ping !== undefined ? a.info.ping : r.info.ping,
fps: a.info?.fps !== undefined ? a.info.fps : r.info.fps,
serverVersion: a.info?.serverVersion !== undefined ? a.info.serverVersion : r.info.serverVersion,
serverId: a.info?.serverId !== undefined ? a.info.serverId : r.info.serverId
};
} else {
o = r.enabled;
s = {
...r.info
};
}
if (n) {
n.checked = o;
}
if (!o) {
e.classList.add("disabled");
} else {
e.classList.remove("disabled");
}
[ "region", "ping", "fps", "serverVersion", "serverId" ].forEach(t => {
const n = e.querySelector(`[data-info="${t}"]`);
if (n) {
n.checked = s[t];
}
});
});
if (n) {
n.addEventListener("change", function() {
const t = this.checked;
if (t) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
chrome.storage.sync.get([ "si" ], e => {
const n = e["si"];
let r;
if (typeof n === "object" && n !== null) {
r = n.info || {
region: true,
ping: true,
fps: true,
serverVersion: false,
serverId: false
};
} else {
r = {
region: true,
ping: true,
fps: true,
serverVersion: false,
serverId: false
};
}
chrome.storage.sync.set({
si: {
enabled: t,
info: r
}
});
});
});
}
e.querySelectorAll("[data-info]").forEach(t => {
t.addEventListener("change", function() {
if (e.classList.contains("disabled")) return;
const t = this.dataset.info;
const n = this.checked;
chrome.storage.sync.get([ "si" ], e => {
const r = e["si"];
let a;
if (typeof r === "object" && r !== null && r.info) {
a = {
region: r.info.region !== false,
ping: r.info.ping !== false,
fps: r.info.fps !== false,
serverVersion: r.info.serverVersion === true,
serverId: r.info.serverId === true
};
} else {
a = {
region: true,
ping: true,
fps: true,
serverVersion: false,
serverId: false
};
}
a[t] = n;
chrome.storage.sync.set({
si: {
enabled: true,
info: a
}
});
});
});
});
}
function Ie() {
const e = document.querySelector(".purpura-cursor-picker");
if (!e) return;
const t = e.dataset.setting;
const n = document.querySelector(`[data-setting="${t}"]`);
const r = P("pcr") || {
enabled: false,
preset: "default",
cursor: "auto",
name: "Default",
type: "preset"
};
chrome.storage.local.get([ "pcr" ], t => {
const a = t.pcr || r;
const o = a.preset || "default";
const s = a.enabled === true;
if (n) {
n.checked = s;
}
if (!s) {
e.classList.add("disabled");
}
const i = document.querySelector('[data-sub-setting-input="purpuraCursors_trailEffects"]');
if (i) {
i.checked = a.trailEffects !== false;
}
document.querySelectorAll('[data-parent="purpuraCursors"]').forEach(e => {
if (s) e.classList.remove("disabled"); else e.classList.add("disabled");
});
e.querySelectorAll(".purpura-cursor-option").forEach(e => {
e.classList.remove("active");
if (e.dataset.preset === o) {
e.classList.add("active");
}
});
});
if (n) {
n.addEventListener("change", function() {
const t = this.checked;
if (t) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
document.querySelectorAll('[data-parent="purpuraCursors"]').forEach(e => {
if (t) e.classList.remove("disabled"); else e.classList.add("disabled");
});
chrome.storage.local.get([ "pcr" ], e => {
const n = e.pcr || r;
chrome.storage.local.set({
pcr: {
...n,
enabled: t
}
});
});
});
}
e.querySelectorAll(".purpura-cursor-option").forEach(t => {
t.addEventListener("click", () => {
if (e.classList.contains("disabled")) return;
const n = t.dataset.preset;
const a = M[n];
if (!a) return;
e.querySelectorAll(".purpura-cursor-option").forEach(e => e.classList.remove("active"));
const o = e.querySelector(".purpura-cursor-upload");
if (o) o.classList.remove("active");
t.classList.add("active");
chrome.storage.local.get([ "pcr" ], e => {
const t = e.pcr || r;
chrome.storage.local.set({
pcr: {
...t,
preset: n,
cursor: a.cursor,
name: a.name,
type: "preset"
}
});
});
});
});
const a = document.getElementById("purpura-cursor-upload");
const o = document.getElementById("purpura-cursor-file-input");
if (a && o) {
a.addEventListener("click", () => {
if (e.classList.contains("disabled")) return;
o.click();
});
o.addEventListener("change", t => {
const n = t.target.files[0];
if (!n) return;
const o = new FileReader;
function s(e, t) {
const n = 128;
const r = new Image;
r.onload = function() {
if (r.width <= n && r.height <= n) {
t(e);
return;
}
const a = Math.min(n / r.width, n / r.height);
const o = Math.round(r.width * a);
const s = Math.round(r.height * a);
const i = document.createElement("canvas");
i.width = o;
i.height = s;
const p = i.getContext("2d");
p.drawImage(r, 0, 0, o, s);
t(i.toDataURL("image/png"));
};
r.onerror = function() {
t(e);
};
r.src = e;
}
o.onload = t => {
const n = t.target.result;
s(n, t => {
e.querySelectorAll(".purpura-cursor-option").forEach(e => e.classList.remove("active"));
a.classList.add("active");
a.querySelector(".purpura-cursor-upload-icon").innerHTML = `<img src="${t}" alt="Custom cursor" width="28" height="28" style="width:28px;height:28px;object-fit:contain;max-width:28px;max-height:28px">`;
chrome.storage.local.get([ "pcr" ], e => {
const n = e.pcr || r;
chrome.storage.local.set({
pcr: {
...n,
preset: "custom",
cursor: `url(${t}), auto`,
name: "Custom",
type: "custom",
customData: t
}
});
});
});
};
o.readAsDataURL(n);
});
chrome.storage.local.get([ "pcr" ], t => {
const n = t.pcr || r;
if (n.type === "custom" && n.customData) {
e.querySelectorAll(".purpura-cursor-option").forEach(e => e.classList.remove("active"));
a.classList.add("active");
a.querySelector(".purpura-cursor-upload-icon").innerHTML = `<img src="${n.customData}" alt="Custom cursor" width="28" height="28" style="width:28px;height:28px;object-fit:contain;max-width:28px;max-height:28px">`;
}
});
}
}
function De() {
const e = document.querySelector(".purpura-tabs-picker");
if (!e) return;
const t = e.dataset.setting;
const n = document.querySelector(`[data-setting="${t}"]`);
const r = document.getElementById("purpura-tabs-title-input");
const a = document.getElementById("purpura-tabs-preview-title");
const o = document.getElementById("purpura-tabs-preview-favicon");
const s = document.getElementById("purpura-tabs-file-input");
const i = document.getElementById("purpura-tabs-upload");
const p = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png");
const c = {
default: "",
purpura: p,
newYears: chrome.runtime.getURL("images/icons/newYears/Purpura_NewYears_Logo_48.png"),
lunarNewYear: chrome.runtime.getURL("images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_48.png"),
valentines: chrome.runtime.getURL("images/icons/valentines/Purpura_Valentines_Logo_48.png"),
blackHistory: chrome.runtime.getURL("images/icons/blackHistory/Purpura_BlackHistory_Logo_48.png"),
stPatricksDay: chrome.runtime.getURL("images/icons/stPatricksDay/Purpura_StPatricks_Logo_48.png"),
womensDay: chrome.runtime.getURL("images/icons/womensDay/Purpura_WomensDay_Logo_48.png"),
easter: chrome.runtime.getURL("images/icons/easter/Purpura_Easter_Logo_48.png"),
pride: chrome.runtime.getURL("images/icons/pride/Purpura_Pride_Logo_48.png"),
halloween: chrome.runtime.getURL("images/icons/halloween/Purpura_Halloween_Logo_48.png"),
diwali: chrome.runtime.getURL("images/icons/diwali/Purpura_Diwali_Logo_48.png"),
hanukkah: chrome.runtime.getURL("images/icons/hanukkah/Purpura_Hanukkah_Logo_48.png"),
christmas: chrome.runtime.getURL("images/icons/christmas/Purpura_Christmas_Logo_48.png")
};
const l = P("pt") || {
enabled: false,
favicon: {
type: "purpura"
},
titleFormat: "{n} Purpura"
};
chrome.storage.local.get([ "pt" ], t => {
const a = t.pt || l;
if (n) {
n.checked = a.enabled === true;
}
if (!a.enabled) {
e.classList.add("disabled");
}
if (r) {
r.value = a.titleFormat || "{n} Purpura";
}
const s = a.favicon?.type || "purpura";
e.querySelectorAll(".purpura-tabs-icon-option").forEach(e => {
e.classList.remove("active");
if (e.dataset.icon === s) {
e.classList.add("active");
}
});
if (s === "custom" && a.favicon?.data) {
i.classList.add("active");
o.src = a.favicon.data;
} else {
o.src = c[s] || p;
}
u(a.titleFormat || "{n} Purpura");
});
function u(e) {
const t = "Home";
a.textContent = e.replace(/{title}/g, t).replace(/{n}/g, "( ✦ )");
}
function d(e) {
chrome.storage.local.get([ "pt" ], t => {
const n = t.pt || l;
const r = {
...n,
...e
};
chrome.storage.local.set({
pt: r
});
});
}
if (n) {
n.addEventListener("change", function() {
const t = this.checked;
if (t) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
d({
enabled: t
});
});
}
if (r) {
r.addEventListener("input", function() {
u(this.value);
d({
titleFormat: this.value
});
});
}
e.querySelectorAll(".purpura-tabs-icon-option").forEach(t => {
t.addEventListener("click", () => {
if (e.classList.contains("disabled")) return;
const n = t.dataset.icon;
e.querySelectorAll(".purpura-tabs-icon-option").forEach(e => e.classList.remove("active"));
i.classList.remove("active");
t.classList.add("active");
if (n === "default") {
o.src = "/favicon.ico";
} else {
o.src = c[n] || p;
}
d({
favicon: {
type: n,
url: n === "default" ? "/favicon.ico" : c[n] || "",
data: null
}
});
});
});
i.addEventListener("click", () => {
if (e.classList.contains("disabled")) return;
s.click();
});
s.addEventListener("change", t => {
const n = t.target.files[0];
if (!n || !n.type.startsWith("image/")) return;
if (n.size > 2 * 1024 * 1024) {
alert("Image size must be less than 2MB");
return;
}
const r = new FileReader;
r.onload = function(t) {
const n = t.target.result;
e.querySelectorAll(".purpura-tabs-icon-option").forEach(e => e.classList.remove("active"));
i.classList.add("active");
o.src = n;
d({
favicon: {
type: "custom",
url: n,
data: n
}
});
};
r.readAsDataURL(n);
});
const g = document.getElementById("purpura-tabs-seasonal-toggle");
const f = document.getElementById("purpura-tabs-seasonal-grid");
const m = document.getElementById("purpura-tabs-seasonal-arrow");
if (g && f && m) {
g.addEventListener("click", () => {
f.classList.toggle("open");
m.classList.toggle("open");
});
}
}
async function ze() {
const e = document.querySelector(".purpura-theme-picker");
if (!e) return;
const t = e.dataset.setting;
const n = document.querySelector(`[data-setting="${t}"]`);
await H();
chrome.storage.local.get([ "thmEnabled" ], t => {
const r = t.thmEnabled === true;
if (n) {
n.checked = r;
}
if (r) {
e.classList.remove("disabled");
} else {
e.classList.add("disabled");
}
// Theme Editor and Free Roblox Plus Themes are mutually exclusive;
// if a theme is active (e.g. enabled from the /purpura-themes page),
// keep the frpt toggle in sync so the UI never shows both on.
if (r) {
chrome.storage.sync.get([ "frpt" ], s => {
if (s.frpt === true) {
chrome.storage.sync.set({ frpt: false });
const frptChk = document.querySelector('[data-setting="freeRobloxPlusThemes"]');
if (frptChk) frptChk.checked = false;
}
});
}
});
if (n) {
n.addEventListener("change", async function(t) {
const n = this.checked;
if (n) {
await chrome.storage.sync.set({ frpt: false });
const frptChk = document.querySelector('[data-setting="freeRobloxPlusThemes"]');
if (frptChk) frptChk.checked = false;
e.classList.remove("disabled");
const t = await chrome.storage.local.get([ "selectedTheme" ]);
const n = t.selectedTheme || "none";
if (!n || n === "none") {
chrome.storage.local.set({
thmEnabled: true,
selectedTheme: "purpura-theme"
});
e.querySelectorAll(".purpura-theme-option").forEach(e => e.classList.remove("active"));
const t = e.querySelector('[data-theme="purpura-theme"]');
if (t) t.classList.add("active");
} else {
chrome.storage.local.set({
thmEnabled: true
});
}
} else {
e.classList.add("disabled");
chrome.storage.local.set({
thmEnabled: false
});
}
});
}
if (d) {
document.removeEventListener("click", d);
}
d = async t => {
const r = t.target.closest(".purpura-theme-option");
const a = t.target.closest(".purpura-theme-delete");
const o = t.target.closest("#purpura-add-custom-theme");
const s = t.target.closest("#purpura-close-theme-modal, #purpura-cancel-theme");
const i = t.target.closest("#purpura-save-theme");
const p = t.target.closest(".purpura-theme-modal");
if (a) {
t.stopPropagation();
const r = a.dataset.deleteTheme;
if (confirm("Delete this custom theme?")) {
const t = await chrome.storage.local.get([ "savedThemes", "selectedTheme" ]);
const a = (t.savedThemes || []).filter(e => e.id !== r);
if (t.selectedTheme === r) {
await chrome.storage.local.set({
savedThemes: a,
selectedTheme: "none",
thmEnabled: false
});
if (n) n.checked = false;
} else {
await chrome.storage.local.set({
savedThemes: a
});
}
await H();
qe(e, n);
}
return;
}
if (o) {
const e = document.getElementById("purpura-theme-modal");
if (e) {
document.body.appendChild(e);
e.classList.add("visible");
}
return;
}
if (s) {
const e = document.getElementById("purpura-theme-modal");
if (e) {
e.classList.remove("visible");
document.getElementById("purpura-theme-css").value = "";
}
return;
}
if (i) {
const t = document.getElementById("purpura-theme-css").value.trim();
if (!t) {
alert("Please paste your theme CSS");
return;
}
const r = t.match(/\/\*([\s\S]*?)\*\//);
let a = {};
if (r) {
const e = r[1].split(/\r?\n/);
for (const t of e) {
const e = t.match(/@name\s+(.*)/);
if (e) a.name = e[1].trim();
const n = t.match(/@description\s+(.*)/);
if (n) a.description = n[1].trim();
const r = t.match(/@author\s+(.*)/);
if (r) a.author = r[1].trim();
}
}
if (!a.name) {
alert("Theme must have a @name in the manifest comment");
return;
}
const o = {
id: "custom-" + Date.now(),
title: a.name,
description: a.description || "Custom theme",
author: a.author || "",
css: t,
permissions: a.permissions || [ "roblox" ]
};
const s = await chrome.storage.local.get([ "savedThemes" ]);
const i = s.savedThemes || [];
i.push(o);
await chrome.storage.local.set({
savedThemes: i
});
const p = document.getElementById("purpura-theme-modal");
if (p) {
p.classList.remove("visible");
document.getElementById("purpura-theme-css").value = "";
}
await H();
qe(e, n);
return;
}
if (p && t.target === p) {
p.classList.remove("visible");
document.getElementById("purpura-theme-css").value = "";
return;
}
if (r && !e.classList.contains("disabled")) {
const t = r.dataset.theme;
e.querySelectorAll(".purpura-theme-option").forEach(e => e.classList.remove("active"));
r.classList.add("active");
if (t === "none") {
if (n) n.checked = false;
e.classList.add("disabled");
await chrome.storage.local.set({
thmEnabled: false,
selectedTheme: "none"
});
setTimeout(() => window.location.reload(), 300);
} else {
await chrome.storage.local.set({
thmEnabled: true,
selectedTheme: t
});
await chrome.storage.sync.set({ frpt: false });
const frptChk = document.querySelector('[data-setting="freeRobloxPlusThemes"]');
if (frptChk) frptChk.checked = false;
if (n && !n.checked) {
n.checked = true;
e.classList.remove("disabled");
}
setTimeout(() => window.location.reload(), 300);
}
}
};
document.addEventListener("click", d);
}
function qe(e, t) {}
function Re() {
const e = document.getElementById("purpura-export-settings");
const t = document.getElementById("purpura-import-settings");
const n = document.getElementById("purpura-import-file");
if (e) {
e.addEventListener("click", async () => {
try {
const [e, t] = await Promise.all([ new Promise(e => chrome.storage.local.get(null, e)), new Promise(e => chrome.storage.sync.get(null, e)) ]);
const n = {
local: [ "sessionKey", "sessionExpiry", "purpuraReviewCredentials" ],
sync: []
};
n.local.forEach(t => delete e[t]);
n.sync.forEach(e => delete t[e]);
const r = {
version: i,
exportDate: (new Date).toISOString(),
local: e,
sync: t
};
const a = new Blob([ JSON.stringify(r, null, 2) ], {
type: "application/json"
});
const o = URL.createObjectURL(a);
const s = document.createElement("a");
s.href = o;
s.download = `purpura-settings-${(new Date).toISOString().split("T")[0]}.purpura`;
s.click();
URL.revokeObjectURL(o);
alert("Settings exported successfully!");
} catch (e) {
alert("Failed to export settings. Please try again.");
}
});
}
if (t && n) {
t.addEventListener("click", () => {
n.click();
});
n.addEventListener("change", async e => {
const t = e.target.files[0];
if (!t) return;
try {
const e = await t.text();
const n = JSON.parse(e);
if (!n.local && !n.sync) {
throw new Error("Invalid settings file format");
}
const r = confirm("This will overwrite your current settings. Are you sure you want to continue?");
if (!r) return;
const a = {
local: [ "sessionKey", "sessionExpiry", "purpuraReviewCredentials" ],
sync: []
};
const o = async (e, t, n) => {
const r = await new Promise(t => e.get(null, t));
const o = Object.keys(r).filter(e => !a[t].includes(e) && !(n && e in n));
if (o.length) {
await new Promise(t => e.remove(o, t));
}
if (n && Object.keys(n).length > 0) {
await new Promise(t => e.set(n, t));
}
};
if (n.local) {
a.local.forEach(e => {
delete n.local[e];
});
}
if (n.sync) {
a.sync.forEach(e => {
delete n.sync[e];
});
}
await o(chrome.storage.local, "local", n.local);
await o(chrome.storage.sync, "sync", n.sync);
alert("Settings imported successfully! The page will now reload.");
window.location.reload();
} catch (e) {
alert("Failed to import settings. Please make sure the file is a valid Purpura settings export (.purpura file).");
}
n.value = "";
});
}
}
function Ne(t, r = true) {
n = t.toLowerCase();
document.querySelectorAll(".purpura-sidebar .purpura-menu-link").forEach(e => {
e.classList.remove("active");
});
const a = document.querySelector(`#purpura-${n}-tab .purpura-menu-link`);
if (a) a.classList.add("active");
const p = document.getElementById("purpura-mobile-select");
if (p) p.value = t;
if (r) {
const e = `?purpura=${t.toLowerCase()}`;
if (window.location.search !== e) {
window.history.replaceState({}, "", window.location.pathname + e);
}
}
const c = document.getElementById("purpura-section-content");
const u = t.toLowerCase();
if (u === "info") {
c.innerHTML = `\n                <div class="purpura-info-wrapper">\n                    <h2>Welcome to Purpura Settings</h2>\n                    <p>Purpura is a feature-rich Roblox enhancement suite that aims to be your all-in-one extension.</p>\n                    <p>Use the sidebar to the left to navigate through different settings.</p>\n                    <div class="purpura-info-meta">\n                        <div class="purpura-info-meta-card">\n                            <span class="purpura-info-meta-label">Version</span>\n                            <span class="purpura-info-meta-value">${i}</span>\n                        </div>\n                        <div class="purpura-info-meta-card">\n                            <span class="purpura-info-meta-label">Developer</span>\n                            <span class="purpura-info-meta-value">TeutonicTerror</span>\n                        </div>\n                    </div>\n                    <div class="purpura-import-export">\n                        <button class="purpura-import-export-btn primary" id="purpura-export-settings">\n                            Export Settings\n                        </button>\n                        <button class="purpura-import-export-btn" id="purpura-import-settings">\n                            Import Settings\n                        </button>\n                        <button class="purpura-import-export-btn" id="purpura-reset-settings">\n                            Reset to Defaults\n                        </button>\n                        <input type="file" id="purpura-import-file" accept=".purpura" style="display: none;">\n                    </div>\n                    <div style="margin-top: 24px; padding: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; text-align: center;">\n                        <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--p-text-2);">If you enjoy Purpura, consider supporting development on Ko-Fi!</p>\n                        <a title="Support me on ko-fi.com" class="kofi-button" style="background:var(--p-accent);display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:14px;color:#fff;font-family:'Quicksand',Helvetica,Century Gothic,sans-serif;font-weight:700;font-size:14px;text-decoration:none;box-shadow:var(--p-card-shadow, 0 1px 3px rgba(0,0,0,0.2));cursor:pointer;" href="https://ko-fi.com/N0Q220I61C" target="_blank">\n                            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" style="height:18px;width:auto;display:inline-block;vertical-align:middle;"/>\n                            <span>Support Purpura</span>\n                        </a>\n                    </div>\n                </div>\n            `;
Re();
Ce();
Se();
} else if (u === "credits") {
c.innerHTML = `\n                <div class="purpura-info-wrapper purpura-credits-wrapper">\n                    <h2>${e("settings_credits_title")}</h2>\n                    <p>${e("settings_credits_subtitle")}</p>\n                    <div class="purpura-credits-grid">\n                        <article class="purpura-credit-card">\n                            <div class="purpura-credit-avatar-wrap">\n                                <img class="purpura-credit-avatar" src="${o.cjiggy}" alt="CJiggy">\n                            </div>\n                            <div class="purpura-credit-head">\n                                <h3 class="purpura-credit-name">CJiggy</h3>\n                            </div>\n                            <p class="purpura-credit-reason">${e("settings_credit_cjiggy")}</p>\n                            <div class="purpura-credit-discord">\n                                ${s}\n                                <span class="purpura-credit-discord-label">@black_noir_the_boys</span>\n                            </div>\n                        </article>\n                        <article class="purpura-credit-card">\n                            <div class="purpura-credit-avatar-wrap">\n                                <img class="purpura-credit-avatar" src="${o.deluxis}" alt="Deluxis">\n                            </div>\n                            <div class="purpura-credit-head">\n                                <h3 class="purpura-credit-name">Deluxis</h3>\n                            </div>\n                            <p class="purpura-credit-reason">${e("settings_credit_deluxis")}</p>\n                            <div class="purpura-credit-discord">\n                                ${s}\n                                <span class="purpura-credit-discord-label">@Deluxis</span>\n                            </div>\n                        </article>\n                        <article class="purpura-credit-card">\n                            <div class="purpura-credit-avatar-wrap">\n                                <img class="purpura-credit-avatar" src="${o.valra}" alt="Valra">\n                            </div>\n                            <div class="purpura-credit-head">\n                                <h3 class="purpura-credit-name">Valra</h3>\n                            </div>\n                            <p class="purpura-credit-reason">${e("settings_credit_valra")}</p>\n                            <div class="purpura-credit-discord">\n                                ${s}\n                                <span class="purpura-credit-discord-label">@Valra</span>\n                            </div>\n                        </article>\n                    </div>\n                    <div class="purpura-info-divider">\n                        <p>${e("settings_credits_footer")} <a href="https://discord.gg/TT4sgtEkNV" target="_blank">${e("settings_credits_discord")}</a>.</p>\n                    </div>\n                </div>\n            `;
} else if (u === "premium") {
if (!l) {
Ne("info", true);
return;
}
const e = {};
Object.entries(A).forEach(([t, n]) => {
Object.entries(n.settings || {}).forEach(([r, a]) => {
if (!a || !a.premium) return;
const o = n.title || t;
e[o] = e[o] || [];
e[o].push({
name: r,
config: a
});
});
});
let t = "";
const n = Object.entries(e);
if (!n.length) {
t += `\n                    <div class="purpura-info-wrapper" style="text-align:center;padding:30px 20px;">\n                        <p style="margin:0;">No premium features are currently available.</p>\n                    </div>\n                `;
} else {
n.forEach(([e, n]) => {
t += `<div class="purpura-search-result-group" style="margin-bottom:22px;">`;
t += `<div class="purpura-search-category-label">${e}</div>`;
n.forEach(e => {
t += Y(e.name, e.config);
});
t += `</div>`;
});
}
c.innerHTML = t;
we();
Ee();
ke();
je();
Be();
Ae();
Ie();
ze();
De();
rt(c);
We(c);
} else {
const e = Object.keys(A).find(e => e.toLowerCase() === u);
if (e) {
c.innerHTML = V(e);
we();
setTimeout($e, 50);
Ce();
Se();
Ee();
ke();
je();
Be();
Ae();
Ie();
ze();
De();
rt(c);
We(c);
}
}
}
function Ke(e) {
for (const t of Object.values(A)) {
for (const n of Object.values(t.settings)) {
if (n.storageKey === e) return n;
}
}
return null;
}
async function Ge() {
return new Promise(e => {
const t = document.createElement("div");
t.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:100000;display:flex;align-items:center;justify-content:center;";
const n = document.createElement("div");
n.style.cssText = "background:linear-gradient(145deg,#0f0a1a,#1a0d2e);border:1px solid rgba(139,92,246,0.25);border-radius:14px;padding:24px;width:340px;color:#fff;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);";
n.innerHTML = `\n                <div style="font-size:32px;margin-bottom:12px;">⚠️</div>\n                <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;">Reset All Settings</h3>\n                <p style="margin:0 0 20px;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.5;">Are you sure you want to reset all settings to their defaults? This will overwrite your current preferences.</p>\n                <div style="display:flex;gap:10px;">\n                    <button id="purpura-reset-cancel" style="flex:1;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.7);cursor:pointer;font-weight:600;font-size:13px;">Cancel</button>\n                    <button id="purpura-reset-confirm" style="flex:1;padding:10px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:700;font-size:13px;">Reset</button>\n                </div>\n            `;
t.appendChild(n);
document.body.appendChild(t);
n.querySelector("#purpura-reset-cancel").addEventListener("click", () => {
t.remove();
e(false);
});
n.querySelector("#purpura-reset-confirm").addEventListener("click", () => {
t.remove();
e(true);
});
t.addEventListener("click", n => {
if (n.target === t) {
t.remove();
e(false);
}
});
});
}
async function Oe() {
if (p) return;
const e = await Ge();
if (!e) return;
await S();
if (!u || Object.keys(u).length === 0) {
console.error("[Purpura] Reset failed: could not load default settings");
try {
const e = chrome.runtime.getURL("data/default_settings.json");
const t = await fetch(e);
if (t.ok) {
u = await t.json();
}
} catch (e) {
console.error("[Purpura] Fallback fetch also failed:", e);
return;
}
if (!u || Object.keys(u).length === 0) {
return;
}
}
const t = {
local: [ "sessionKey", "sessionExpiry", "purpuraReviewCredentials" ],
sync: []
};
const r = new Set(Object.keys(u));
const a = async (e, n) => {
const a = await new Promise(t => e.get(null, t));
const o = Object.keys(a).filter(e => !t[n].includes(e) && !r.has(e));
if (o.length) {
await new Promise(t => e.remove(o, t));
}
const s = {};
for (const [e, t] of Object.entries(u)) {
s[e] = t;
}
await new Promise(t => e.set(s, t));
const i = await new Promise(t => e.get(null, t));
};
await Promise.all([ a(chrome.storage.sync, "sync"), a(chrome.storage.local, "local") ]).catch(() => {});
T();
Ne(n, false);
}
function He(e) {
e = e.toLowerCase().trim();
const t = document.getElementById("purpura-section-content");
if (e.length < 2) {
Ne(n, false);
return;
}
document.querySelectorAll(".purpura-sidebar .purpura-menu-link").forEach(e => {
e.classList.remove("active");
});
let r = [];
for (let t in A) {
const n = A[t];
for (let [a, o] of Object.entries(n.settings)) {
const s = o.label || "";
const i = Array.isArray(o.description) ? o.description.join(" ") : o.description || "";
const p = n.title || t;
const c = Array.isArray(o.tags) ? o.tags : o.tags ? [ o.tags ] : [];
const l = [];
if (o.premium) l.push("premium");
if (o.beta) l.push("beta");
const u = o.subSettings ? Object.entries(o.subSettings).map(([e, t]) => {
const n = t.label || "";
const r = Array.isArray(t.description) ? t.description.join(" ") : t.description || "";
const a = Array.isArray(t.tags) ? t.tags.join(" ") : t.tags || "";
return `${e} ${n} ${r} ${a}`;
}).join(" ") : "";
const d = o.helpIcon ? `${o.helpIcon.title || ""} ${Array.isArray(o.helpIcon.content) ? o.helpIcon.content.join(" ") : ""}` : "";
const g = [ a, s, i, t, p, c.join(" "), l.join(" "), u, d ].join(" ").toLowerCase();
if (g.includes(e)) {
r.push({
category: n.title,
categoryKey: t,
name: a,
config: o
});
}
}
}
if (r.length === 0) {
t.innerHTML = `\n            <div class="purpura-info-wrapper" style="text-align:center;padding:48px 24px 40px;">\n                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:0 auto 16px;display:block;opacity:0.28;">\n                    <circle cx="21" cy="21" r="13" stroke="var(--p-text-2)" stroke-width="2.5" stroke-linecap="round"/>\n                    <path d="M30.5 30.5L40 40" stroke="var(--p-text-2)" stroke-width="2.5" stroke-linecap="round"/>\n                    <path d="M16 21h10M21 16v10" stroke="var(--p-text-2)" stroke-width="2" stroke-linecap="round"/>\n                    <circle cx="21" cy="21" r="6" stroke="var(--p-text-3)" stroke-width="1.2" stroke-dasharray="2 2"/>\n                </svg>\n                <p style="color:var(--p-text-2);font-size:14px;margin:0 auto 4px;max-width:none;text-align:center;">No results for <strong style="color:var(--p-text)">"${e}"</strong></p>\n                <p style="color:var(--p-text-3);font-size:12px;margin:0 auto;max-width:none;text-align:center;">Try a different keyword or browse the sidebar</p>\n            </div>`;
return;
}
const a = r.reduce((e, t) => {
e[t.category] = e[t.category] || [];
e[t.category].push(t);
return e;
}, {});
let o = "";
for (let e in a) {
o += `<div class="purpura-search-result-group" style="margin-bottom:24px;">`;
o += `<div class="purpura-search-category-label">${e}</div>`;
a[e].forEach(e => {
o += Y(e.name, e.config);
});
o += `</div>`;
}
t.innerHTML = o;
we();
Ee();
ke();
je();
Be();
Ae();
Ie();
ze();
De();
rt(t);
We(t);
}
function Ue(e, t, n, r, a) {
const o = document.createElement("li");
o.id = `purpura-${n.toLowerCase()}-tab`;
o.className = "purpura-menu-item";
const s = j[n] || j[n.toLowerCase()] || "";
const i = document.createElement("a");
i.className = "purpura-menu-link" + (a ? " active" : "");
i.href = "#";
i.innerHTML = s ? `<span class="p-nav-icon">${s}</span>${r}` : r;
i.addEventListener("click", e => {
e.preventDefault();
Ne(n);
});
o.appendChild(i);
e.appendChild(o);
const p = document.createElement("option");
p.value = n;
p.textContent = r;
if (a) p.selected = true;
t.appendChild(p);
}
function Ve(t) {
const n = document.getElementById("purpura-sidebar");
const r = document.getElementById("purpura-mobile-select");
n.innerHTML = "";
r.innerHTML = "";
const a = document.createElement("li");
a.className = "purpura-menu-item purpura-search-container";
a.innerHTML = `<input type="search" id="purpura-search-input" placeholder="${e("settings_search_placeholder")}">`;
n.appendChild(a);
const o = t === "info";
const s = t === "credits";
const i = t === "premium";
Ue(n, r, "info", "Info", o);
Ue(n, r, "credits", "Credits", s);
const p = document.createElement("li");
p.className = "purpura-menu-separator";
n.appendChild(p);
Object.keys(A).forEach(e => {
const a = t === e.toLowerCase();
Ue(n, r, e, A[e].title, a);
});
document.getElementById("purpura-search-input").addEventListener("input", e => {
He(e.target.value);
});
}
function Ye(e, t = 5e3) {
return new Promise((n, r) => {
const a = document.querySelector(e);
if (a) {
n(a);
return;
}
const o = new MutationObserver((t, r) => {
const a = document.querySelector(e);
if (a) {
r.disconnect();
n(a);
}
});
o.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
o.disconnect();
r(new Error("Element not found: " + e));
}, t);
});
}
function Fe() {
const e = document.querySelector(".purpura-settings-root");
const t = document.getElementById("purpura-content-area");
if (!e || !t || e.dataset.purpuraScrollCapture === "1") return;
const n = e => {
if (!(e instanceof Element)) return false;
return !!e.closest('textarea, input[type="text"], input[type="search"], select, .purpura-theme-modal-content');
};
const r = t => {
if (!e.contains(t.target)) return;
if (n(t.target)) return;
const r = document.getElementById("purpura-content-area");
if (!r || r.scrollHeight <= r.clientHeight) return;
const a = t.target instanceof Element && !!t.target.closest("#purpura-content-area");
if (a) return;
r.scrollTop += t.deltaY;
t.preventDefault();
};
e.addEventListener("wheel", r, {
passive: false
});
e.dataset.purpuraScrollCapture = "1";
}
function We(e = document) {
const t = e && typeof e.querySelectorAll === "function" ? e : document;
const n = t.querySelectorAll(".purpura-help-icon");
let r = document.getElementById("purpura-floating-tooltip");
if (!r) {
r = document.createElement("div");
r.id = "purpura-floating-tooltip";
const e = document.querySelector(".purpura-settings-root");
if (e) {
e.appendChild(r);
} else {
document.body.appendChild(r);
}
}
n.forEach(e => {
const t = e.querySelector(".purpura-help-tooltip");
if (!t || e.dataset.purpuraHelpTooltipBound) return;
e.addEventListener("mouseenter", () => {
r.innerHTML = t.innerHTML;
r.classList.remove("visible", "arrow-above", "arrow-below");
r.style.top = "0px";
r.style.left = "-9999px";
r.style.opacity = "0";
r.style.visibility = "hidden";
r.classList.add("visible");
requestAnimationFrame(() => {
const t = e.getBoundingClientRect();
const n = r.offsetWidth;
const a = r.offsetHeight;
const o = 10;
const s = 8;
const i = window.innerWidth;
const p = t.top - o - a >= s;
const c = !p;
let l;
if (c) {
l = t.bottom + o;
r.classList.add("arrow-above");
} else {
l = t.top - o - a;
r.classList.add("arrow-below");
}
let u = t.left + t.width / 2 - n / 2;
if (u < s) u = s;
if (u + n > i - s) u = i - s - n;
const d = t.left + t.width / 2 - u;
r.style.setProperty("--p-arrow-left", `${Math.round(d)}px`);
r.style.top = `${Math.round(l)}px`;
r.style.left = `${Math.round(u)}px`;
r.style.opacity = "";
r.style.visibility = "";
});
});
e.addEventListener("mouseleave", () => {
r.classList.remove("visible", "arrow-above", "arrow-below");
});
e.dataset.purpuraHelpTooltipBound = "1";
});
const a = t.querySelectorAll(".purpura-pill.beta, .purpura-pill.experimental, .purpura-pill.deprecated");
a.forEach(e => {
if (e.dataset.purpuraPillTooltipBound) return;
e.addEventListener("mouseenter", () => {
const t = e.getAttribute("data-tooltip");
if (!t) return;
const n = e.classList.contains("beta");
const s = e.classList.contains("deprecated");
r.classList.remove("pill-beta-tip", "pill-experimental-tip", "pill-deprecated-tip");
r.classList.add(s ? "pill-deprecated-tip" : n ? "pill-beta-tip" : "pill-experimental-tip");
r.innerHTML = '<div style="padding:4px 0;font-size:12px;line-height:1.5;color:var(--p-text);">' + t + "</div>";
r.classList.remove("visible", "arrow-above", "arrow-below");
r.style.top = "0px";
r.style.left = "-9999px";
r.style.opacity = "0";
r.style.visibility = "hidden";
r.classList.add("visible");
requestAnimationFrame(() => {
const t = e.getBoundingClientRect();
const n = r.offsetWidth;
const a = r.offsetHeight;
const o = 10;
const s = 8;
const i = window.innerWidth;
const p = t.top - o - a >= s;
const c = !p;
let l;
if (c) {
l = t.bottom + o;
r.classList.add("arrow-above");
} else {
l = t.top - o - a;
r.classList.add("arrow-below");
}
let u = t.left + t.width / 2 - n / 2;
if (u < s) u = s;
if (u + n > i - s) u = i - s - n;
const d = t.left + t.width / 2 - u;
r.style.setProperty("--p-arrow-left", String(Math.round(d)) + "px");
r.style.top = String(Math.round(l)) + "px";
r.style.left = String(Math.round(u)) + "px";
r.style.opacity = "";
r.style.visibility = "";
});
});
e.addEventListener("mouseleave", () => {
r.classList.remove("visible", "arrow-above", "arrow-below", "pill-beta-tip", "pill-experimental-tip", "pill-deprecated-tip");
});
e.dataset.purpuraPillTooltipBound = "1";
});
}
function Xe(e) {
if (!e) return null;
return e._purpuraFloatingMenu || e.querySelector(".purpura-custom-select-menu");
}
function Ze(e) {
const t = e.querySelector(".purpura-custom-select-trigger");
const n = Xe(e);
if (!t || !n || !n.classList.contains("is-floating")) return;
const r = t.getBoundingClientRect();
n.style.left = `${Math.round(r.left)}px`;
n.style.width = `${Math.round(r.width)}px`;
n.style.right = "auto";
const a = n.offsetHeight || n.scrollHeight;
const o = 6;
const s = window.innerHeight - r.bottom - o;
const i = r.top - o;
if (a > s && i > s) {
n.style.top = `${Math.round(r.top - a - o)}px`;
} else {
n.style.top = `${Math.round(r.bottom + o)}px`;
}
}
function Je(e) {
const t = e.querySelector(".purpura-custom-select-menu");
if (!t || t.classList.contains("is-floating")) return;
t.classList.add("is-floating");
document.body.appendChild(t);
e._purpuraFloatingMenu = t;
Ze(e);
requestAnimationFrame(() => Ze(e));
et();
}
function Qe(e) {
const t = e._purpuraFloatingMenu || e.querySelector(".purpura-custom-select-menu");
if (!t) return;
t.classList.remove("is-floating");
t.style.left = "";
t.style.top = "";
t.style.width = "";
t.style.right = "";
e.appendChild(t);
delete e._purpuraFloatingMenu;
}
function et() {
if (f) return;
f = true;
const e = () => {
document.querySelectorAll(".purpura-custom-select.open").forEach(Ze);
};
window.addEventListener("resize", e);
document.addEventListener("scroll", e, true);
}
function tt(e = null) {
document.querySelectorAll(".purpura-custom-select.open").forEach(t => {
if (e && t === e) return;
t.classList.remove("open");
Qe(t);
const n = t.querySelector(".purpura-custom-select-trigger");
if (n) {
n.setAttribute("aria-expanded", "false");
}
});
}
function nt(e, t = false) {
if (!e || !e._purpuraCustomWrapper) return;
const n = e._purpuraCustomWrapper;
const r = n.querySelector(".purpura-custom-select-trigger");
const a = Xe(n);
if (!r || !a) return;
const o = e.options[e.selectedIndex] || e.options[0];
r.textContent = o ? o.textContent : "Select";
r.disabled = !!e.disabled;
n.classList.toggle("disabled", !!e.disabled);
if (t || a.childElementCount !== e.options.length) {
a.innerHTML = "";
Array.from(e.options).forEach((e, t) => {
const n = document.createElement("button");
n.type = "button";
n.className = "purpura-custom-select-option";
n.dataset.optionIndex = String(t);
n.dataset.value = e.value;
n.textContent = e.textContent;
n.setAttribute("role", "option");
a.appendChild(n);
});
}
a.querySelectorAll(".purpura-custom-select-option").forEach((t, n) => {
const r = e.options[n];
if (!r) return;
t.textContent = r.textContent;
t.dataset.value = r.value;
t.disabled = !!r.disabled;
t.classList.toggle("disabled", !!r.disabled);
t.classList.toggle("selected", !!r.selected);
t.setAttribute("aria-selected", r.selected ? "true" : "false");
});
}
function rt(e = document) {
const t = e && typeof e.querySelectorAll === "function" ? e : document;
const n = t.querySelectorAll("select[data-setting], select[data-sub-setting-input]");
if (!g) {
document.addEventListener("click", e => {
if (!(e.target instanceof Element)) {
tt();
return;
}
if (!e.target.closest(".purpura-custom-select") && !e.target.closest(".purpura-custom-select-menu.is-floating")) {
tt();
}
});
document.addEventListener("keydown", e => {
if (e.key === "Escape") {
tt();
}
});
g = true;
}
n.forEach(e => {
if (e.id === "purpura-mobile-select") return;
e.classList.add("purpura-native-select");
let t = e._purpuraCustomWrapper;
if (!t || !t.isConnected) {
t = document.createElement("div");
t.className = "purpura-custom-select";
const n = document.createElement("button");
n.type = "button";
n.className = "purpura-custom-select-trigger";
n.setAttribute("aria-haspopup", "listbox");
n.setAttribute("aria-expanded", "false");
const r = document.createElement("div");
r.className = "purpura-custom-select-menu";
r.setAttribute("role", "listbox");
t.appendChild(n);
t.appendChild(r);
e.insertAdjacentElement("afterend", t);
e._purpuraCustomWrapper = t;
n.addEventListener("click", r => {
r.preventDefault();
if (e.disabled) return;
const a = !t.classList.contains("open");
tt(t);
t.classList.toggle("open", a);
n.setAttribute("aria-expanded", a ? "true" : "false");
if (a) {
Je(t);
const e = Xe(t);
const n = e.querySelector(".purpura-custom-select-option.selected:not(.disabled)") || e.querySelector(".purpura-custom-select-option:not(.disabled)");
if (n) {
n.focus();
}
} else {
Qe(t);
}
});
n.addEventListener("keydown", e => {
if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
e.preventDefault();
n.click();
}
});
r.addEventListener("click", t => {
const r = t.target instanceof Element ? t.target.closest(".purpura-custom-select-option") : null;
if (!r || r.classList.contains("disabled") || e.disabled) return;
const a = Number(r.dataset.optionIndex);
const o = e.options[a];
if (!o || o.disabled) return;
if (e.value !== o.value) {
e.value = o.value;
e.dispatchEvent(new Event("change", {
bubbles: true
}));
}
nt(e);
tt();
n.focus();
});
r.addEventListener("keydown", e => {
const t = Array.from(r.querySelectorAll(".purpura-custom-select-option:not(.disabled)"));
if (!t.length) return;
const a = document.activeElement;
const o = t.indexOf(a);
if (e.key === "ArrowDown") {
e.preventDefault();
const n = o >= 0 ? (o + 1) % t.length : 0;
t[n].focus();
} else if (e.key === "ArrowUp") {
e.preventDefault();
const n = o >= 0 ? (o - 1 + t.length) % t.length : t.length - 1;
t[n].focus();
} else if (e.key === "Home") {
e.preventDefault();
t[0].focus();
} else if (e.key === "End") {
e.preventDefault();
t[t.length - 1].focus();
} else if (e.key === "Enter" || e.key === " ") {
e.preventDefault();
if (a && a.classList.contains("purpura-custom-select-option")) {
a.click();
}
} else if (e.key === "Escape") {
e.preventDefault();
tt();
n.focus();
}
});
e.addEventListener("change", () => {
nt(e);
});
const a = new MutationObserver(() => {
nt(e, true);
});
a.observe(e, {
attributes: true,
attributeFilter: [ "disabled" ],
childList: true,
subtree: true
});
}
nt(e, true);
});
}
async function at() {
await $();
D();
await S();
T();
try {
const e = await chrome.storage.local.get([ "noFeatures", "noFeaturesReason" ]);
p = e.noFeatures === true;
c = e.noFeaturesReason || "You have been banned from using Purpura.";
} catch (e) {
p = false;
}
let e = null;
const t = [ "#settings-container", ".settings-container", ".content-inner", "#content-inner", ".rbx-body-content", "#rbx-body", ".content" ];
for (const n of t) {
try {
e = await Ye(n, 2e3);
if (e) break;
} catch (e) {}
}
if (!e) {
e = document.querySelector(".content") || document.querySelector("main") || document.body;
}
e.innerHTML = "";
e.style.overflow = "visible";
const r = document.querySelector("h1") || document.querySelector('.page-header h1, .section-header h1, [class*="header"] h1');
if (r && r.textContent.trim() === "Settings") {
r.textContent = "Purpura Settings";
}
const a = p ? `\n            <div class="purpura-ban-banner">\n                <span class="purpura-ban-banner-icon">🚫</span>\n                <div class="purpura-ban-banner-content">\n                    <div class="purpura-ban-banner-title">Features Disabled</div>\n                    <div class="purpura-ban-banner-text">Toggling features will not work for you because you are banned. ${c ? `Reason: ${c}` : ""}</div>\n                </div>\n            </div>\n        ` : "";
const o = document.createElement("div");
o.className = "purpura-settings-root";
o.innerHTML = `\n            <div class="purpura-content">\n                <div class="purpura-page-content">\n                    ${a}\n                    <div id="purpura-settings-container"${p ? ' class="purpura-features-disabled"' : ""}>\n                        <div id="purpura-mobile-menu">\n                            <select id="purpura-mobile-select"></select>\n                        </div>\n                        <div id="purpura-ui-container">\n                            <ul id="purpura-sidebar" class="purpura-sidebar" role="tablist"></ul>\n                            <div id="purpura-content-area">\n                                <div id="purpura-section-content"></div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class="purpura-settings-footer">
                        <span>Refresh Roblox for changes to take effect.</span>

                    </div>\n                </div>\n            </div>\n        `;
e.appendChild(o);
document.getElementById("purpura-mobile-select").addEventListener("change", function() {
Ne(this.value);
});
Fe();
Ve(n);
Ne(n, false);
Object.values(F).forEach(e => {
if (!e.optOutPath) return;
const t = new Set;
for (const e of Object.values(A)) {
for (const n of Object.values(e.settings)) {
if (n.subSettings) {
for (const e of Object.values(n.subSettings)) {
t.add(e.storageKey);
}
}
}
}
t.forEach(t => {
chrome.storage.local.get([ t ], n => {
if (!n[t] || typeof n[t] !== "object") return;
if (n[t][e.optOutPath] === true) {
const r = {
...n[t]
};
delete r[e.optOutPath];
chrome.storage.local.set({
[t]: r
});
}
});
chrome.storage.sync.get([ t ], n => {
if (!n[t] || typeof n[t] !== "object") return;
if (n[t][e.optOutPath] === true) {
const r = {
...n[t]
};
delete r[e.optOutPath];
chrome.storage.sync.set({
[t]: r
});
}
});
});
});
const s = document.getElementById("purpura-reset-settings");
if (s) {
s.addEventListener("click", () => {
Oe().catch(() => {});
});
}
document.addEventListener("click", e => {
const t = e.target.closest("#purpura-reset-settings");
if (!t) return;
Oe().catch(() => {});
});
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", at);
} else {
at();
}
(function(){var h=document.head||document.documentElement;if(h){var s=document.createElement("style");s.textContent=".purpura-info-meta-card:first-child{cursor:pointer;transition:border-color 0.2s var(--p-ease),background 0.2s var(--p-ease)}.purpura-info-meta-card:first-child:hover{border-color:var(--p-accent);background:rgba(155,109,255,0.08)}";h.appendChild(s)}document.addEventListener("click",function(e){var t=e.target.closest(".purpura-info-meta-card");if(!t)return;var v=t.querySelector(".purpura-info-meta-value");if(!v||!/\d/.test(v.textContent))return;chrome.runtime.sendMessage({action:"openChangelog"})})})();
})();
