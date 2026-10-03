/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    'use strict';
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    let isServerInfoEnabled = true;
    let infoConfig = { region: true, ping: true, fps: true };
    let periodicCheckInterval = null;
    let lastLogTime = 0;
    let lastUpdateTime = 0;
    const LOG_THROTTLE_MS = 5000; 
    const UPDATE_THROTTLE_MS = 1000; 
    const SERVER_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const SERVER_ID_EXTRACTOR_SCRIPT_ID = 'purpura-serverid-extractor-script';
    const PERIODIC_CHECK_MS = 5000;
    const FAST_SCAN_DELAYS_MS = [0, 180, 500, 1000, 1800, 3000];
    let periodicBootstrapTimeout = null;
    let fastScanTimeouts = [];
    let serverObserverInitialized = false;

    function shouldDisplayServerInfo() {
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        
        if (!pathname.includes('/games/')) {
            return false;
        }
        
        return hash.includes('#!/game-instances') || hash.includes('#!game-instances');
    }

    function checkAndInitialize() {
        if (shouldDisplayServerInfo() && isServerInfoEnabled) {
            initializeServerInfo();
            if (!periodicCheckInterval) {
                startPeriodicCheck();
            }
        } else if (!shouldDisplayServerInfo()) {
            removeServerInfo();
            stopPeriodicCheck();
        }
    }

    function startPeriodicCheck() {
        if (periodicCheckInterval) {
            clearInterval(periodicCheckInterval);
        }
        if (periodicBootstrapTimeout) {
            clearTimeout(periodicBootstrapTimeout);
            periodicBootstrapTimeout = null;
        }
        
        periodicCheckInterval = setInterval(() => {
            checkAndInitialize();
        }, PERIODIC_CHECK_MS);

        periodicBootstrapTimeout = setTimeout(() => {
            periodicBootstrapTimeout = null;
            checkAndInitialize();
            scheduleFastServerScan();
        }, 600);
    }

    function stopPeriodicCheck() {
        if (periodicCheckInterval) {
            clearInterval(periodicCheckInterval);
            periodicCheckInterval = null;
        }
        if (periodicBootstrapTimeout) {
            clearTimeout(periodicBootstrapTimeout);
            periodicBootstrapTimeout = null;
        }
        clearFastServerScans();
    }

    function parseServerInfoData(data) {
        if (typeof data === 'boolean') {
            return { enabled: data, info: { region: true, ping: true, fps: true, serverVersion: true, serverId: true } };
        } else if (typeof data === 'object' && data !== null) {
            return { 
                enabled: data.enabled !== false, 
                info: {
                    region: data.info?.region !== false,
                    ping: data.info?.ping !== false,
                    fps: data.info?.fps !== false,
                    serverVersion: data.info?.serverVersion !== false,
                    serverId: data.info?.serverId !== false
                }
            };
        }
        return { enabled: true, info: { region: true, ping: true, fps: true, serverVersion: true, serverId: true } };
    }

    chrome.storage.sync.get(['si'], (result) => {
        const siVal = window.__PurpuraSettings ? window.__PurpuraSettings.get('si') : result['si'];
        const parsed = parseServerInfoData(siVal);
        isServerInfoEnabled = parsed.enabled;
        infoConfig = parsed.info;
        if (isServerInfoEnabled) {
            checkAndInitialize();
            startPeriodicCheck();
        }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes['si']) {
            const parsed = parseServerInfoData(window.__PurpuraSettings ? window.__PurpuraSettings.get('si') : changes['si'].newValue);
            isServerInfoEnabled = parsed.enabled;
            infoConfig = parsed.info;
            if (isServerInfoEnabled) {
                removeServerInfo();
                checkAndInitialize();
                startPeriodicCheck();
            } else {
                removeServerInfo();
                stopPeriodicCheck();
            }
        }
    });

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                if (isServerInfoEnabled) {
                    checkAndInitialize();
                    scheduleFastServerScan();
                }
            }, 1000);
        }
    }).observe(document, { subtree: true, childList: true });

    window.addEventListener('hashchange', () => {
        if (!isServerInfoEnabled) return;
        checkAndInitialize();
        scheduleFastServerScan();
    });

    window.addEventListener('popstate', () => {
        if (!isServerInfoEnabled) return;
        checkAndInitialize();
        scheduleFastServerScan();
    });

    function initializeServerInfo() {
        injectPageContextScript();
        addServerRegions();
        setupServerObserver();
        scheduleFastServerScan();
    }

    function removeServerInfo() {
        const regionElements = document.querySelectorAll('.purpura-server-region');
        regionElements.forEach(element => element.remove());
        
        clearFastServerScans();
    }
    


    function clearFastServerScans() {
        if (!fastScanTimeouts.length) return;
        fastScanTimeouts.forEach((handle) => clearTimeout(handle));
        fastScanTimeouts = [];
    }

    function scheduleFastServerScan() {
        clearFastServerScans();
        if (!isServerInfoEnabled || !shouldDisplayServerInfo()) return;

        FAST_SCAN_DELAYS_MS.forEach((delay) => {
            const timeoutHandle = setTimeout(() => {
                if (!isServerInfoEnabled || !shouldDisplayServerInfo()) return;
                addServerRegions();
                if (document.querySelector('[data-purpura-pending="true"]')) {
                    processAllServers();
                }
            }, delay);

            fastScanTimeouts.push(timeoutHandle);
        });
    }

    function addServerRegions() {
        const now = Date.now();
        if (now - lastUpdateTime < UPDATE_THROTTLE_MS) {
            return;
        }
        lastUpdateTime = now;

        const serverElements = document.querySelectorAll(
            '.rbx-public-game-server-item, li.rbx-public-game-server-item'
        );
        
        let newElementsAdded = false;
        
        serverElements.forEach((serverElement, index) => {
            if (serverElement.querySelector('.purpura-server-region')) {
                return;
            }

            let playerGauge = serverElement.querySelector('.server-player-count-gauge');
            
            if (!playerGauge) {
                playerGauge = serverElement.querySelector('.gauge, .server-gauge, .player-count-gauge');
            }
            
            if (!playerGauge) {
                playerGauge = serverElement.querySelector('[class*="gauge"]');
            }
            
            if (playerGauge) {
                addRegionInfo(serverElement, playerGauge);
                newElementsAdded = true;
            }
        });
        
        if (newElementsAdded || document.querySelector('[data-purpura-pending="true"]')) {
            setTimeout(() => {
                processAllServers();
            }, 500);
        }
    }

    let serverDataCache = {};
    let serverRegionCache = {};
    let placeLatestVersionCache = {};
    let placeLatestVersionState = {};
    let isProcessingServers = false;
    let lastApiCall = 0;
    let datacenterState = 'idle';
    let serverIpMap = {};
    function buildDatacenterMap(list) {
        const map = {};
        if (Array.isArray(list)) {
            list.forEach(dc => {
                if (dc.dataCenterIds && Array.isArray(dc.dataCenterIds) && dc.location) {
                    dc.dataCenterIds.forEach(id => {
                        map[id] = dc.location;
                    });
                } else if (dc.dataCenterId && dc.location) {
                    map[dc.dataCenterId] = dc.location;
                }
            });
        }
        return map;
    }

    function requestDatacenterList() {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({ action: 'GET_DATACENTER_LIST' }, function (response) {
                    if (chrome.runtime.lastError || !response) {
                        resolve(null);
                        return;
                    }
                    const list = response.list;
                    resolve(Array.isArray(list) && list.length > 0 ? list : null);
                });
            } catch (e) {
                resolve(null);
            }
        });
    }

    async function loadDatacenterMap() {
        if (datacenterState === 'complete') return serverIpMap;
        if (datacenterState === 'loading') {
            return new Promise((resolve) => {
                const i = setInterval(() => {
                    if (datacenterState === 'complete' || datacenterState === 'failed') {
                        clearInterval(i);
                        resolve(serverIpMap);
                    }
                }, 100);
            });
        }

        datacenterState = 'loading';

        try {
            const apiList = await requestDatacenterList();
            if (apiList) {
                serverIpMap = buildDatacenterMap(apiList);
            } else {
                const fallbackUrl = chrome.runtime.getURL('data/ServerList.json');
                const fallbackResp = await fetch(fallbackUrl);
                if (fallbackResp.ok) {
                    serverIpMap = buildDatacenterMap(await fallbackResp.json());
                }
            }
        } catch (e) {
        }

        datacenterState = 'complete';
        return serverIpMap;
    }

    function createUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let _csrfToken = null;
    async function getCsrfToken() {
        if (_csrfToken) return _csrfToken;
        
        try {
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta) {
                const c = meta.getAttribute('content') || meta.getAttribute('data-token');
                if (c) {
                    _csrfToken = c;
                    return _csrfToken;
                }
            }
        } catch (e) {}

        try {
            const resp = await fetch('https://auth.roblox.com/v2/logout', { 
                method: 'POST', 
                credentials: 'include' 
            });
            const header = resp.headers.get('x-csrf-token');
            if (header) {
                _csrfToken = header;
                return header;
            }
        } catch (e) {}

        return null;
    }

    function getCachedLatestPlaceVersion(placeId) {
        if (!placeId) return undefined;
        return Object.prototype.hasOwnProperty.call(placeLatestVersionCache, placeId)
            ? placeLatestVersionCache[placeId]
            : undefined;
    }

    function queueVisibleServersForVersionRefresh() {
        const cards = document.querySelectorAll('.rbx-public-game-server-item, li.rbx-public-game-server-item');
        let markedAny = false;

        cards.forEach((card) => {
            if (!card.querySelector('.purpura-server-region')) return;
            card.setAttribute('data-purpura-pending', 'true');
            markedAny = true;
        });

        if (markedAny) {
            setTimeout(() => processAllServers(), 50);
        }
    }

    async function fetchLatestPlaceVersion(placeId) {
        if (!placeId) return null;

        if (Object.prototype.hasOwnProperty.call(placeLatestVersionCache, placeId)) {
            return placeLatestVersionCache[placeId];
        }

        if (placeLatestVersionState[placeId] === 'loading') {
            return undefined;
        }

        placeLatestVersionState[placeId] = 'loading';

        try {
            const csrfToken = await getCsrfToken();
            const result = await fetchFromPageContext('https://develop.roblox.com/v1/assets/latest-versions', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Csrf-Token': csrfToken || ''
                },
                body: JSON.stringify({
                    assetIds: [parseInt(placeId, 10)],
                    versionStatus: 'Published'
                }),
                referrer: 'https://www.roblox.com/',
                timeout: 8000
            });

            const final = result && result.final;
            if (!final || !final.ok) {
                placeLatestVersionCache[placeId] = null;
                placeLatestVersionState[placeId] = 'complete';
                return null;
            }

            const payload = final.bodyJson || {};
            let version = null;

            if (Array.isArray(payload.results) && payload.results.length > 0) {
                const first = payload.results[0] || {};
                version = first.versionNumber || first.version || first.assetVersionNumber || null;
            }

            if (!version && Array.isArray(payload.data) && payload.data.length > 0) {
                const first = payload.data[0] || {};
                version = first.versionNumber || first.version || first.assetVersionNumber || null;
            }

            if (!version && Array.isArray(payload.assetVersionNumbers) && payload.assetVersionNumbers.length > 0) {
                const first = payload.assetVersionNumbers[0];
                version = typeof first === 'object'
                    ? (first.versionNumber || first.version || first.assetVersionNumber || null)
                    : first;
            }

            if (!version && payload.versionNumber) {
                version = payload.versionNumber;
            }

            placeLatestVersionCache[placeId] = version ? String(version) : null;
            placeLatestVersionState[placeId] = 'complete';
            reportVersionToCrowd(placeId, version);
            return placeLatestVersionCache[placeId];
        } catch (e) {
            placeLatestVersionCache[placeId] = null;
            placeLatestVersionState[placeId] = 'complete';
            return null;
        }
    }

    function warmLatestPlaceVersion(placeId) {
        if (!placeId) return;
        if (Object.prototype.hasOwnProperty.call(placeLatestVersionCache, placeId)) return;
        if (placeLatestVersionState[placeId] === 'loading') return;

        fetchLatestPlaceVersion(placeId).then(() => {
            queueVisibleServersForVersionRefresh();
        }).catch(() => {
            queueVisibleServersForVersionRefresh();
        });
    }

    function buildRegionCodeFromLocation(loc) {
        if (!loc) return null;
        const country = loc.country || null;
        const city = loc.city || null;
        const stateName = loc.region || null;

        if (country === 'US' && stateName && city) {
            const stateCode = getStateCodeFromRegion(stateName);
            const cityCode = String(city).replace(/\s+/g, '').toUpperCase();
            return `US-${stateCode}-${cityCode}`;
        } else if (country === 'US' && stateName) {
            const stateCode = getStateCodeFromRegion(stateName);
            return `US-${stateCode}`;
        }

        return String(country).toUpperCase();
    }

    const flagDataUrlCache = new Map();
    const flagPendingRequests = new Map();
    const flagFailedAt = new Map();
    const FLAG_RETRY_MS = 30000;

    function getCountryFlagUrl(countryCode) {
        const code = String(countryCode || '').trim().toLowerCase();
        if (!/^[a-z]{2}$/.test(code)) return Promise.resolve(null);
        if (flagDataUrlCache.has(code)) return Promise.resolve(flagDataUrlCache.get(code));
        if (flagPendingRequests.has(code)) return flagPendingRequests.get(code);
        const failedAt = flagFailedAt.get(code);
        if (failedAt !== undefined) {
            if (Date.now() - failedAt < FLAG_RETRY_MS) return Promise.resolve(null);
            flagFailedAt.delete(code);
        }

        const pending = new Promise((resolve) => {
            let settled = false;
            const finish = (value) => {
                if (settled) return;
                settled = true;
                flagPendingRequests.delete(code);
                if (value) {
                    flagDataUrlCache.set(code, value);
                } else {
                    flagFailedAt.set(code, Date.now());
                }
                resolve(value);
            };
            try {
                chrome.runtime.sendMessage({
                    type: 'PURPURA_FETCH_RESOURCE_REQUEST',
                    url: `https://flagcdn.com/w40/${code}.png`,
                    method: 'GET',
                    accept: 'image/png',
                    responseType: 'arraybuffer'
                }, (response) => {
                    const lastError = chrome.runtime.lastError;
                    if (lastError || !response || !response.ok || typeof response.base64 !== 'string' || !response.base64.length) {
                        finish(null);
                        return;
                    }
                    const contentType = response.contentType && response.contentType.startsWith('image/') ? response.contentType : 'image/png';
                    const dataUrl = `data:${contentType};base64,${response.base64}`;
                    finish(dataUrl);
                });
            } catch (_) {
                finish(null);
            }
        });

        flagPendingRequests.set(code, pending);
        return pending;
    }

    function buildRegionNameFromLocation(loc) {
        if (!loc) return t('serverInfo_unknown');
        const country = loc.country || null;
        const city = loc.city || null;
        const stateName = loc.region || null;

        if (country === 'US' && city && stateName) {
            return `${city}, ${stateName}`;
        } else if (country === 'US' && stateName) {
            return `${stateName}, USA`;
        }

        const countryNames = {
            'SG': 'Singapore',
            'DE': 'Germany',
            'FR': 'France',
            'JP': 'Japan',
            'BR': 'Brazil',
            'NL': 'Netherlands',
            'AU': 'Australia',
            'GB': 'United Kingdom',
            'IN': 'India',
            'KR': 'South Korea',
            'HK': 'Hong Kong',
            'CA': 'Canada',
            'MX': 'Mexico',
            'AR': 'Argentina',
            'CL': 'Chile',
            'CO': 'Colombia',
            'PE': 'Peru',
            'ES': 'Spain',
            'IT': 'Italy',
            'PL': 'Poland',
            'RU': 'Russia',
            'TR': 'Turkey',
            'ZA': 'South Africa',
            'EG': 'Egypt',
            'AE': 'United Arab Emirates',
            'SA': 'Saudi Arabia',
            'IL': 'Israel',
            'SE': 'Sweden',
            'NO': 'Norway',
            'FI': 'Finland',
            'DK': 'Denmark',
            'BE': 'Belgium',
            'AT': 'Austria',
            'CH': 'Switzerland',
            'CZ': 'Czech Republic',
            'PT': 'Portugal',
            'GR': 'Greece',
            'RO': 'Romania',
            'HU': 'Hungary',
            'BG': 'Bulgaria',
            'HR': 'Croatia',
            'SK': 'Slovakia',
            'SI': 'Slovenia',
            'LT': 'Lithuania',
            'LV': 'Latvia',
            'EE': 'Estonia',
            'IE': 'Ireland',
            'NZ': 'New Zealand',
            'TH': 'Thailand',
            'VN': 'Vietnam',
            'MY': 'Malaysia',
            'PH': 'Philippines',
            'ID': 'Indonesia',
            'PK': 'Pakistan',
            'BD': 'Bangladesh',
            'UA': 'Ukraine'
        };

        return countryNames[country] || country || t('serverInfo_unknown');
    }

    function getStateCodeFromRegion(regionName) {
        const stateMap = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
            'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
            'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
            'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA',
            'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT',
            'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
            'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
            'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
            'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
            'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };
        if (!regionName) return '';
        return stateMap[regionName] || String(regionName).substring(0, 2).toUpperCase();
    }

    function normalizeServerId(value) {
        if (value === null || value === undefined) return null;
        const id = String(value).trim();
        if (!id) return null;
        return SERVER_ID_REGEX.test(id) ? id : null;
    }

    function getServerIdFromElement(serverElement) {
        if (!serverElement) return null;

        const directAttributes = [
            'data-purpura-serverid',
            'data-gameid',
            'data-game-id',
            'data-gameinstanceid',
            'data-game-instance-id',

        ];

        for (const attr of directAttributes) {
            const id = normalizeServerId(serverElement.getAttribute(attr));
            if (id) return id;
        }

        const joinSelectors = [
            '[data-gameinstanceid]',
            '[data-game-instance-id]',
            '[data-placeid][data-gameinstanceid]',
            '.game-server-join-btn[data-gameinstanceid]'
        ];

        for (const selector of joinSelectors) {
            const joinElement = serverElement.querySelector(selector);
            if (!joinElement) continue;
            const id = normalizeServerId(joinElement.getAttribute('data-gameinstanceid') || joinElement.getAttribute('data-game-instance-id'));
            if (id) return id;
        }

        return null;
    }

    function extractServerIdFromFiber(serverElement, timeoutMs = 1200) {
        return new Promise((resolve) => {
            if (!serverElement) {
                resolve(null);
                return;
            }

            injectPageContextScript();

            const extractionId = `purpura_extract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            serverElement.setAttribute('data-purpura-extraction-id', extractionId);

            let finished = false;
            let timeoutHandle = null;

            const cleanup = () => {
                if (finished) return;
                finished = true;
                window.removeEventListener('purpura-serverid-extracted', handleExtracted);
                serverElement.removeAttribute('data-purpura-extraction-id');
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
            };

            const handleExtracted = (event) => {
                const detail = event && event.detail;
                if (!detail || detail.extractionId !== extractionId) return;

                cleanup();

                const extractedId = normalizeServerId(detail.serverId);
                if (extractedId) {
                    serverElement.setAttribute('data-purpura-serverid', extractedId);
                    resolve(extractedId);
                    return;
                }

                resolve(getServerIdFromElement(serverElement));
            };

            window.addEventListener('purpura-serverid-extracted', handleExtracted);
            window.dispatchEvent(new CustomEvent('purpura-extract-serverid-request', {
                detail: { extractionId }
            }));

            timeoutHandle = setTimeout(() => {
                cleanup();
                resolve(getServerIdFromElement(serverElement));
            }, timeoutMs);
        });
    }

    window.__PurpuraServerCardIds = {
        get: getServerIdFromElement,
        extract: extractServerIdFromFiber,
    };

    function fetchFromPageContext(url, options) {
        return new Promise((resolve, reject) => {
            const callbackId = 'purpura_fetch_' + Math.random().toString(36).substr(2, 9);
            
            const handleResponse = (event) => {
                const detail = event.detail;
                if (detail && detail.callbackId === callbackId) {
                    document.removeEventListener('purpura-fetch-response', handleResponse);
                    clearTimeout(timeoutHandle);
                    if (detail.error) {
                        reject(new Error(detail.error));
                    } else {
                        resolve(detail.response);
                    }
                }
            };
            document.addEventListener('purpura-fetch-response', handleResponse);

            const event = new CustomEvent('purpura-fetch-request', {
                detail: {
                    callbackId: callbackId,
                    url: url,
                    options: options
                }
            });
            document.dispatchEvent(event);

            const timeoutHandle = setTimeout(() => {
                document.removeEventListener('purpura-fetch-response', handleResponse);
                reject(new Error('timeout'));
            }, options.timeout || 8000);
        });
    }

    function injectPageContextScript() {
        if (document.getElementById(SERVER_ID_EXTRACTOR_SCRIPT_ID)) {
            return;
        }

        const parent = document.head || document.documentElement;
        if (!parent) {
            return;
        }

        const script = document.createElement('script');
        script.id = SERVER_ID_EXTRACTOR_SCRIPT_ID;
        script.src = chrome.runtime.getURL('content/feat/serv/sie.js');
        script.async = false;
        parent.appendChild(script);
    }

    async function resolveRegionFromCrowd(placeId, serverId, gameId, placeVersion) {
        const crowd = window.__PurpuraCrowd;
        if (!crowd || typeof crowd.lookup !== 'function') return null;

        let hit = null;
        try {
            hit = await crowd.lookup(String(placeId), serverId);
        } catch (error) {
            return null;
        }

        if (!hit || !hit.location) return null;

        return {
            regionCode: buildRegionCodeFromLocation(hit.location),
            regionName: buildRegionNameFromLocation(hit.location),
            location: hit.location,
            dataCenterId: hit.dataCenterId,
            gameId: gameId || serverId,
            placeVersion: placeVersion || hit.placeVersion,
            fromCrowd: true
        };
    }

    async function resolveRegionsFromCrowd(placeId, serverIds) {
        const crowd = window.__PurpuraCrowd;
        if (!crowd || typeof crowd.serverDetails !== 'function') return null;
        if (!Array.isArray(serverIds) || serverIds.length === 0) return null;

        try {
            return await crowd.serverDetails(String(placeId), serverIds);
        } catch (error) {
            return null;
        }
    }

    async function ledgerEntryFor(ledgerPromise, serverId) {
        if (!ledgerPromise) return null;

        let ledger = null;
        try {
            ledger = await ledgerPromise;
        } catch (error) {
            return null;
        }

        return ledger && ledger[serverId] ? ledger[serverId] : null;
    }

    function crowdEntryToRegion(entry, serverId, placeVersion) {
        if (!entry || !entry.location || !entry.location.country) return null;

        return {
            regionCode: buildRegionCodeFromLocation(entry.location),
            regionName: buildRegionNameFromLocation(entry.location),
            location: entry.location,
            dataCenterId: entry.dataCenterId || null,
            gameId: serverId,
            placeVersion: entry.placeVersion || placeVersion || null,
            fromCrowd: true
        };
    }

    function isRegionResolved(result) {
        if (!result || !result.regionCode) return false;
        return result.regionCode !== 'N/A';
    }

    function reportSightingToCrowd(placeId, serverId, dataCenterId, placeVersion, serverIp) {
        const crowd = window.__PurpuraCrowd;
        if (!crowd || typeof crowd.report !== 'function') return;
        try {
            crowd.report(String(placeId), serverId, dataCenterId || null, placeVersion || null, serverIp || null);
        } catch (error) {}
    }

    function reportVersionToCrowd(placeId, version) {
        if (!version) return;
        const crowd = window.__PurpuraCrowd;
        if (!crowd || typeof crowd.reportVersion !== 'function') return;
        try {
            crowd.reportVersion(String(placeId), version);
        } catch (error) {}
    }

    function isCrowdReportingEnabled() {
        const crowd = window.__PurpuraCrowd;
        return !!(crowd && typeof crowd.isEnabled === 'function' && crowd.isEnabled());
    }

    function refreshUnresolvedRegions() {
        let cleared = 0;
        Object.keys(serverRegionCache).forEach((serverId) => {
            const entry = serverRegionCache[serverId];
            if (!entry) return;
            if (entry.region === 'Full' || entry.region === 'N/A') {
                delete serverRegionCache[serverId];
                cleared += 1;
            }
        });

        if (!cleared) return;

        document.querySelectorAll('.rbx-public-game-server-item, li.rbx-public-game-server-item').forEach((card) => {
            if (card.querySelector('.purpura-server-region')) {
                card.setAttribute('data-purpura-pending', 'true');
            }
        });

        setTimeout(() => processAllServers(), 50);
    }

    window.__PurpuraServerInfoRefresh = refreshUnresolvedRegions;

    async function getServerRegion(serverId, placeId, timeoutMs = 8000) {
        if (!serverId || !placeId) return { regionCode: 'N/A', reason: 'missing_params' };
        await loadDatacenterMap();
        try {
            const csrfToken = await getCsrfToken();
            const result = await fetchFromPageContext('https://gamejoin.roblox.com/v1/join-game-instance', {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Csrf-Token': csrfToken || ''
                },
                body: JSON.stringify({ 
                    placeId: parseInt(placeId, 10), 
                    gameId: serverId, 
                    gameJoinAttemptId: createUUID() 
                }),
                referrer: 'https://www.roblox.com/',
                timeout: timeoutMs
            });

            if (result && result.final) {
                const final = result.final;
                if (!final.ok) return { regionCode: 'N/A', reason: `HTTP ${final.status}` };
                const data = final.bodyJson || final.bodyText;
                let joinScript = data && data.joinScript;
                if (typeof joinScript === 'string') {
                    try { joinScript = JSON.parse(joinScript); } catch (e) { joinScript = null; }
                }

                const gameId = joinScript?.GameId || joinScript?.gameId || serverId;
                const placeVersion = joinScript?.PlaceVersion || joinScript?.placeVersion;
                const dataCenterId = joinScript?.DataCenterId || joinScript?.dataCenterId || joinScript?.DataCenterID;
                const serverIp = joinScript?.UdmuxEndpoints?.[0]?.Address || joinScript?.MachineAddress || null;

                if (data && data.status) {
                    if (data.status === 5) return { regionCode: 'Inactive', regionName: t('serverInfo_inactive'), reason: 'inactive', gameId, placeVersion };
                    if (data.status === 12) return { regionCode: 'Private', regionName: t('serverInfo_private'), reason: 'private_purchase', gameId, placeVersion };
                    if (data.status === 22 && !dataCenterId) {
                        const crowdFull = await resolveRegionFromCrowd(placeId, serverId, gameId, placeVersion);
                        if (crowdFull) return crowdFull;
                        reportSightingToCrowd(placeId, serverId, null, placeVersion, serverIp);
                        return { regionCode: 'Full', regionName: t('serverInfo_full'), reason: 'full_server', isQueued: true, gameId, placeVersion };
                    }
                }

                if (!dataCenterId) {
                    const crowdUnknown = await resolveRegionFromCrowd(placeId, serverId, gameId, placeVersion);
                    if (crowdUnknown) return crowdUnknown;
                    reportSightingToCrowd(placeId, serverId, null, placeVersion, serverIp);
                    return { regionCode: 'N/A', reason: 'no_dataCenterId', gameId, placeVersion };
                }

                const loc = serverIpMap[dataCenterId] || null;
                if (!loc) {
                    reportSightingToCrowd(placeId, serverId, dataCenterId, placeVersion, serverIp);
                    return { regionCode: 'N/A', reason: `dcid_${dataCenterId}_not_found`, gameId, placeVersion };
                }

                reportSightingToCrowd(placeId, serverId, dataCenterId, placeVersion, serverIp);

                return { 
                    regionCode: buildRegionCodeFromLocation(loc), 
                    regionName: buildRegionNameFromLocation(loc), 
                    location: loc, 
                    dataCenterId, 
                    gameId, 
                    placeVersion 
                };
            }
            return { regionCode: 'N/A', reason: 'no_response' };
        } catch (error) {
            return { regionCode: 'N/A', reason: error.message };
        }
    }

    async function fetchServerData(placeId, retryCount = 0) {
        const now = Date.now();
        
        if (now - lastApiCall < 2000) {
            await new Promise(res => setTimeout(res, 2000 - (now - lastApiCall)));
        }
        
        lastApiCall = Date.now();
        
        try {
            let url = `https://games.roblox.com/v1/games/${placeId}/servers/Public?limit=100&excludeFullGames=false`;
            let response = await fetch(url);
            
            if (response.status === 429) {
                if (retryCount < 2) {
                    await new Promise(res => setTimeout(res, 5000 + (retryCount * 2000)));
                    return fetchServerData(placeId, retryCount + 1);
                }
                return null;
            }
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.data && data.data.length > 0) {
                    return data.data;
                }
            }
        } catch (error) {
        }
        
        return null;
    }

    async function fetchAllServerRegions(placeId, visibleServerIds) {
        const regionMap = {};
        
        const uncachedServerIds = visibleServerIds.filter(id => !serverRegionCache[id]);
        
        if (uncachedServerIds.length === 0) {
            const cachedMap = {};
            visibleServerIds.forEach(id => {
                if (serverRegionCache[id]) {
                    cachedMap[id] = serverRegionCache[id];
                }
            });
            return cachedMap;
        }

        const ledgerPromise = resolveRegionsFromCrowd(placeId, uncachedServerIds);

        const batchSize = 12;
        
        for (let i = 0; i < uncachedServerIds.length; i += batchSize) {
            const batch = uncachedServerIds.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (serverId) => {
                try {
                    const live = await getServerRegion(serverId, placeId);
                    const result = isRegionResolved(live)
                        ? live
                        : (crowdEntryToRegion(await ledgerEntryFor(ledgerPromise, serverId), serverId, live && live.placeVersion) || live || { regionCode: 'N/A' });
                    return { 
                        serverId, 
                        regionCode: result.regionCode || 'N/A',
                        regionName: result.regionName || 'N/A',
                        isQueued: result.isQueued || false,
                        fromCrowd: result.fromCrowd === true,
                        gameId: result.gameId,
                        placeVersion: result.placeVersion
                    };
                } catch (error) {
                    const fallback = crowdEntryToRegion(await ledgerEntryFor(ledgerPromise, serverId), serverId);
                    if (!fallback) return { serverId, regionCode: 'N/A', regionName: 'N/A', isQueued: false };
                    return {
                        serverId,
                        regionCode: fallback.regionCode || 'N/A',
                        regionName: fallback.regionName || 'N/A',
                        isQueued: false,
                        fromCrowd: true,
                        gameId: fallback.gameId,
                        placeVersion: fallback.placeVersion
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            
            batchResults.forEach(({ serverId, regionCode, regionName, isQueued, fromCrowd, gameId, placeVersion }) => {
                const regionData = {
                    region: regionCode,
                    regionName: regionName,
                    isQueued: isQueued,
                    fromCrowd: fromCrowd === true,
                    gameId: gameId || serverId,
                    placeVersion: placeVersion
                };
                regionMap[serverId] = regionData;
                serverRegionCache[serverId] = regionData;
            });

            if (i + batchSize < uncachedServerIds.length) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        visibleServerIds.forEach(id => {
            if (serverRegionCache[id] && !regionMap[id]) {
                regionMap[id] = serverRegionCache[id];
            }
        });

        return regionMap;
    }

    function addRegionInfo(serverElement, playerGauge) {
        if (!isServerInfoEnabled) {
            return;
        }
        
        if (serverElement.querySelector('.purpura-server-region')) {
            return;
        }

        const showRegion = infoConfig.region !== false;
        const showPing = infoConfig.ping !== false;
        const showFps = infoConfig.fps !== false;
        const showServerVersion = infoConfig.serverVersion === true;
        const showServerId = infoConfig.serverId === true;
        
        if (!showRegion && !showPing && !showFps && !showServerVersion && !showServerId) {
            return;
        }

        let badge = document.createElement('div');
        badge.className = 'purpura-server-region';
        badge.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 5px !important;
            margin: 6px 0 3px 0 !important;
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            font-family: 'Segoe UI', Tahoma, sans-serif !important;
            position: relative !important;
            z-index: 10 !important;
            width: 100% !important;
        `;
        const unknownFlagUrl = chrome.runtime.getURL('images/flags/unknown.png');
        
        let innerHTML = '';
        
        if (showRegion) {
            innerHTML += `
            <div class="purpura-region-container" style="
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                padding: 6px 10px !important;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%) !important;
                border-left: 3px solid #8b5cf6 !important;
                border-radius: 5px !important;
                transition: all 0.2s ease !important;
                backdrop-filter: blur(8px) !important;
            ">
                <img class='purpura-region-flag' src='${unknownFlagUrl}' alt='Unknown' style="
                    width: 22px !important;
                    height: 16px !important;
                    border-radius: 2px !important;
                    object-fit: cover !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.25) !important;
                    display: block !important;
                    flex-shrink: 0 !important;
                ">
                <span class='purpura-region' style="
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: #a78bfa !important;
                    letter-spacing: 0.2px !important;
                    flex: 1 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                ">${t('serverInfo_na')}</span>
            </div>`;
        }
        
        if (showPing || showFps) {
            const gridCols = (showPing && showFps) ? '1fr 1fr' : '1fr';
            
            innerHTML += `
            <div style="
                display: grid !important;
                grid-template-columns: ${gridCols} !important;
                gap: 5px !important;
            ">`;
            
            if (showPing) {
                innerHTML += `
                <div style="
                    display: flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                    padding: 5px 8px !important;
                    background: rgba(59, 130, 246, 0.08) !important;
                    border-radius: 4px !important;
                    transition: all 0.2s ease !important;
                ">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style="flex-shrink: 0;">
                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M7 12.2499c0.7235 0 1.31 -0.5865 1.31 -1.31S7.7235 9.62988 7 9.62988c-0.72349 0 -1.31 0.58652 -1.31 1.31002 0 0.7235 0.58651 1.31 1.31 1.31Z" stroke-width="1"></path>
                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M4.53 7.99989c0.32517 -0.33383 0.71392 -0.59916 1.14329 -0.78032 0.42937 -0.18117 0.89068 -0.2745 1.35671 -0.2745 0.46603 0 0.92734 0.09333 1.35671 0.2745 0.42937 0.18116 0.81811 0.44649 1.14329 0.78032" stroke-width="1"></path>
                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M2.35999 6.31011c0.60871 -0.61226 1.33246 -1.09814 2.12962 -1.4297 0.79716 -0.33155 1.65201 -0.50224 2.51538 -0.50224 0.86336 0 1.71821 0.17069 2.51537 0.50224 0.79714 0.33156 1.52094 0.81744 2.12964 1.4297" stroke-width="1"></path>
                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M0.5 4.44997c0.85343 -0.85388 1.86674 -1.53123 2.98204 -1.99337C4.59733 1.99446 5.79275 1.75659 7 1.75659c1.20725 0 2.40267 0.23787 3.518 0.70001 1.1153 0.46214 2.1286 1.13949 2.982 1.99337" stroke-width="1"></path>
                    </svg>
                    <span class='purpura-ping' style="
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        color: #60a5fa !important;
                        white-space: nowrap !important;
                    ">${t('serverInfo_na')}</span>
                </div>`;
            }
            
            if (showFps) {
                innerHTML += `
                <div style="
                    display: flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                    padding: 5px 8px !important;
                    background: rgba(34, 197, 94, 0.08) !important;
                    border-radius: 4px !important;
                    transition: all 0.2s ease !important;
                ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">
                        <rect x="4" y="4" width="6" height="6" fill="#22c55e" rx="1"/>
                        <rect x="14" y="4" width="6" height="6" fill="#22c55e" rx="1"/>
                        <rect x="4" y="14" width="6" height="6" fill="#22c55e" rx="1"/>
                        <rect x="14" y="14" width="6" height="6" fill="#22c55e" rx="1"/>
                    </svg>
                    <span class='purpura-fps' style="
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        color: #22c55e !important;
                        white-space: nowrap !important;
                    ">${t('serverInfo_na')}</span>
                </div>`;
            }
            
            innerHTML += `</div>`;
        }
        
        if (showServerVersion || showServerId) {
            const devGridCols = (showServerVersion && showServerId) ? '1fr 1fr' : '1fr';
            
            innerHTML += `
            <div style="
                display: grid !important;
                grid-template-columns: ${devGridCols} !important;
                gap: 4px !important;
                margin-top: 3px !important;
            ">`;
            
            if (showServerVersion) {
                innerHTML += `
                <div style="
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                    padding: 3px 6px !important;
                    background: rgba(148, 163, 184, 0.06) !important;
                    border-radius: 3px !important;
                    transition: all 0.2s ease !important;
                ">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class='purpura-server-version' style="
                        font-size: 10px !important;
                        font-weight: 500 !important;
                        color: #94a3b8 !important;
                        white-space: nowrap !important;
                        opacity: 0.8 !important;
                    ">${t('serverInfo_na')}</span>
                </div>`;
            }
            
            if (showServerId) {
                innerHTML += `
                <div style="
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                    padding: 3px 6px !important;
                    background: rgba(148, 163, 184, 0.06) !important;
                    border-radius: 3px !important;
                    transition: all 0.2s ease !important;
                ">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="9" y1="9" x2="15" y2="9" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                        <line x1="9" y1="15" x2="15" y2="15" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span class='purpura-server-id' style="
                        font-size: 10px !important;
                        font-weight: 500 !important;
                        color: #94a3b8 !important;
                        white-space: nowrap !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        opacity: 0.8 !important;
                        cursor: pointer !important;
                        transition: opacity 0.15s ease !important;
                    ">${t('serverInfo_na')}</span>
                </div>`;
            }
            
            innerHTML += `</div>`;
        }
        
        badge.innerHTML = innerHTML;

        if (playerGauge.nextSibling) {
            playerGauge.parentNode.insertBefore(badge, playerGauge.nextSibling);
        } else if (playerGauge.parentNode) {
            playerGauge.parentNode.appendChild(badge);
        } else {
            serverElement.appendChild(badge);
        }

        const joinButton = serverElement.querySelector('.game-server-join-btn, .btn-full-width.game-server-join-btn, .btn-common-play-game-lg');
        if (joinButton) {
            joinButton.style.setProperty('margin-top', '4px', 'important');
        }

        serverElement.setAttribute('data-purpura-pending', 'true');
    }


    async function processAllServers() {
        if (isProcessingServers) {
            return;
        }
        isProcessingServers = true;

        try {
            const placeId = (window.location.href.match(/roblox\.com\/games\/(\d+)/) || [])[1];
            
            if (!placeId) {
                isProcessingServers = false;
                return;
            }

            if (!serverDataCache[placeId]) {
                const serverData = await fetchServerData(placeId);
                if (serverData) {
                    serverDataCache[placeId] = serverData;
                }
            }

            const showServerVersion = infoConfig.serverVersion === true;
            const cachedPlaceVersion = getCachedLatestPlaceVersion(placeId);
            const latestPlaceVersion = showServerVersion ? cachedPlaceVersion : null;
            if (cachedPlaceVersion === undefined && (showServerVersion || isCrowdReportingEnabled())) {
                warmLatestPlaceVersion(placeId);
            }

            const pendingElements = Array.from(document.querySelectorAll('[data-purpura-pending="true"]'));
            const serverDataForPlace = Array.isArray(serverDataCache[placeId]) ? serverDataCache[placeId] : [];
            const serverDataById = new Map();

            serverDataForPlace.forEach((entry) => {
                const id = normalizeServerId(entry && entry.id);
                if (id) {
                    serverDataById.set(id, entry);
                }
            });
            
            const visibleServerIds = [];
            const serverElementMap = new Map();
            const resolvedServers = await Promise.all(pendingElements.map(async (serverElement, index) => {
                let serverId = getServerIdFromElement(serverElement);

                if (!serverId) {
                    serverId = await extractServerIdFromFiber(serverElement);
                }

                if (!serverId && serverDataForPlace[index]) {
                    serverId = normalizeServerId(serverDataForPlace[index].id);
                }

                if (!serverId) {
                    const attempts = (parseInt(serverElement.getAttribute('data-purpura-id-attempts') || '0', 10) || 0) + 1;
                    serverElement.setAttribute('data-purpura-id-attempts', String(attempts));
                    if (attempts >= 4) {
                        serverElement.removeAttribute('data-purpura-pending');
                    }
                    return null;
                }

                serverElement.setAttribute('data-purpura-serverid', serverId);
                serverElement.removeAttribute('data-purpura-id-attempts');

                return {
                    serverId,
                    serverElement,
                    index,
                    serverData: serverDataById.get(serverId) || serverDataForPlace[index] || null
                };
            }));

            resolvedServers.forEach((resolved) => {
                if (!resolved || !resolved.serverId) {
                    return;
                }

                if (!serverElementMap.has(resolved.serverId)) {
                    serverElementMap.set(resolved.serverId, {
                        element: resolved.serverElement,
                        index: resolved.index,
                        serverData: resolved.serverData
                    });
                }

                if (!serverRegionCache[resolved.serverId] && !visibleServerIds.includes(resolved.serverId)) {
                    visibleServerIds.push(resolved.serverId);
                }
            });

            const regionMap = visibleServerIds.length > 0 ? 
                await fetchAllServerRegions(placeId, visibleServerIds) : {};
            
            for (const [serverId, { element: serverElement, index, serverData: mappedServerData }] of serverElementMap) {
                const badge = serverElement.querySelector('.purpura-server-region');
                
                if (badge) {
                    const regionData = regionMap[serverId] || serverRegionCache[serverId];
                    const cachedServerData = mappedServerData || (serverDataCache[placeId] && serverDataCache[placeId][index]) || null;
                    const regionSpan = badge.querySelector('.purpura-region');
                    const regionFlag = badge.querySelector('.purpura-region-flag');
                    const regionContainer = badge.querySelector('.purpura-region-container');
                    
                    if (regionSpan && regionData) {
                        const regionCode = regionData.region || "";
                        const isSpecialStatus = regionCode === 'Full' || regionCode === 'Inactive' || regionCode === 'Private' || regionCode === 'N/A';
                        const displayName = regionData.regionName || regionData.region || t('serverInfo_na');

                        regionSpan.textContent = displayName;

                        if (isSpecialStatus) {
                            regionSpan.title = regionCode === 'Full' ? t('serverInfo_fullTooltip') : (regionCode === 'Inactive' ? t('serverInfo_inactiveTooltip') : (regionCode === 'Private' ? t('serverInfo_privateTooltip') : t('serverInfo_naTooltip')));
                            if (regionFlag) {
                                regionFlag.src = chrome.runtime.getURL('images/flags/unknown.png');
                                regionFlag.style.display = 'block';
                                regionFlag.alt = 'Unknown';
                                regionFlag.removeAttribute('data-purpura-flag-code');
                            }
                        } else {
                            regionSpan.title = regionData.fromCrowd
                                ? `${t('serverInfo_crowdSource')}\nServer ID: ${serverId}`
                                : `Server ID: ${serverId}`;
                            const countryCode = regionCode.includes('-') ? regionCode.split('-')[0] : regionCode;
                            if (regionFlag) {
                                regionFlag.src = chrome.runtime.getURL('images/flags/unknown.png');
                                regionFlag.style.display = 'block';
                                regionFlag.alt = 'Unknown';
                                regionFlag.setAttribute('data-purpura-flag-code', countryCode);
                                getCountryFlagUrl(countryCode).then((flagUrl) => {
                                    if (flagUrl && regionFlag.isConnected && regionFlag.getAttribute('data-purpura-flag-code') === countryCode) {
                                        regionFlag.src = flagUrl;
                                        regionFlag.alt = countryCode;
                                    }
                                });
                            }
                        }

                        if (regionContainer) regionContainer.style.display = "flex";
                    } else {
                        if (regionSpan) {
                            regionSpan.textContent = "N/A";
                            regionSpan.title = "Region unavailable";
                        }
                        if (regionFlag) {
                            regionFlag.src = chrome.runtime.getURL('images/flags/unknown.png');
                            regionFlag.style.display = 'block';
                            regionFlag.alt = 'Unknown';
                            regionFlag.removeAttribute('data-purpura-flag-code');
                        }
                        if (regionContainer) regionContainer.style.display = "flex";
                    }
                    
                    const pingSpan = badge.querySelector('.purpura-ping');
                    const fpsSpan = badge.querySelector('.purpura-fps');
                    const serverVersionSpan = badge.querySelector('.purpura-server-version');
                    const serverIdSpan = badge.querySelector('.purpura-server-id');
                    
                    if (regionData) {
                        if (serverVersionSpan) {
                            const placeVersionValue = regionData.placeVersion || (cachedServerData && (cachedServerData.placeVersion || cachedServerData.place_version)) || latestPlaceVersion;

                            if (placeVersionValue) {
                                serverVersionSpan.textContent = `v${placeVersionValue}`;
                                serverVersionSpan.title = `Place Version: ${placeVersionValue}`;
                            } else if (latestPlaceVersion === undefined && regionData.region !== 'Full') {
                                serverVersionSpan.textContent = '…';
                                serverVersionSpan.title = 'Fetching version...';
                            } else {
                                serverVersionSpan.textContent = 'N/A';
                                serverVersionSpan.title = regionData.region === 'Full' ? 'Version unavailable for full server' : 'Version unavailable';
                            }
                        }
                        
                        if (serverIdSpan) {
                            const resolvedGameId = normalizeServerId(regionData.gameId) || serverId;

                            if (resolvedGameId) {
                                const shortId = resolvedGameId.length > 12 ? resolvedGameId.substring(0, 12) + '...' : resolvedGameId;
                                const previousCopyTimeout = parseInt(serverIdSpan.getAttribute('data-purpura-copy-timeout') || '', 10);
                                if (previousCopyTimeout) {
                                    clearTimeout(previousCopyTimeout);
                                    serverIdSpan.removeAttribute('data-purpura-copy-timeout');
                                }

                                serverIdSpan.setAttribute('data-purpura-copy-text', shortId);
                                serverIdSpan.textContent = shortId;
                                serverIdSpan.title = `Server ID: ${resolvedGameId} (Click to copy)`;
                                
                                serverIdSpan.style.cursor = 'pointer';
                                serverIdSpan.onclick = async (e) => {
                                    e.stopPropagation();
                                    try {
                                        await navigator.clipboard.writeText(`Server ID: ${resolvedGameId}`);

                                        const activeTimeout = parseInt(serverIdSpan.getAttribute('data-purpura-copy-timeout') || '', 10);
                                        if (activeTimeout) {
                                            clearTimeout(activeTimeout);
                                        }

                                        const restoreText = serverIdSpan.getAttribute('data-purpura-copy-text') || shortId;
                                        serverIdSpan.textContent = 'Copied!';
                                        serverIdSpan.style.color = '#22c55e';
                                        const timeoutId = window.setTimeout(() => {
                                            if (!serverIdSpan.isConnected) return;
                                            serverIdSpan.textContent = serverIdSpan.getAttribute('data-purpura-copy-text') || restoreText;
                                            serverIdSpan.style.color = '#94a3b8';
                                            serverIdSpan.removeAttribute('data-purpura-copy-timeout');
                                        }, 1500);
                                        serverIdSpan.setAttribute('data-purpura-copy-timeout', String(timeoutId));
                                    } catch (err) {
                                    }
                                };
                            } else {
                                serverIdSpan.textContent = 'N/A';
                                serverIdSpan.title = 'Server ID unavailable';
                                serverIdSpan.style.cursor = 'default';
                                const pendingTimeout = parseInt(serverIdSpan.getAttribute('data-purpura-copy-timeout') || '', 10);
                                if (pendingTimeout) {
                                    clearTimeout(pendingTimeout);
                                    serverIdSpan.removeAttribute('data-purpura-copy-timeout');
                                }
                                serverIdSpan.onclick = null;
                            }
                        }
                    }
                    
                    if (cachedServerData) {
                        const serverData = cachedServerData;
                        const ping = typeof serverData.ping === 'number' ? Math.floor(serverData.ping * 100) / 100 : null;
                        const fps = typeof serverData.fps === 'number' ? Math.floor(serverData.fps * 100) / 100 : null;

                        if (pingSpan) {
                            if (ping !== null) {
                                pingSpan.textContent = `${Math.round(ping)}ms`;
                                let pingQuality = t('serverInfo_excellent');
                                if (ping >= 180) pingQuality = t('serverInfo_poor');
                                else if (ping >= 120) pingQuality = t('serverInfo_average');
                                else if (ping >= 60) pingQuality = t('serverInfo_good');
                                pingSpan.title = t('serverInfo_pingQualityTooltip', [pingQuality]);
                            } else {
                                pingSpan.textContent = t('serverInfo_na');
                                pingSpan.title = t('serverInfo_pingUnavailableTooltip');
                            }
                        }
                        
                        if (fpsSpan) {
                            if (fps !== null) {
                                fpsSpan.textContent = `${Math.round(fps)} FPS`;
                                let fpsQuality = t('serverInfo_excellent');
                                if (fps < 30) fpsQuality = t('serverInfo_poor');
                                else if (fps < 45) fpsQuality = t('serverInfo_average');
                                else if (fps < 60) fpsQuality = t('serverInfo_good');
                                fpsSpan.title = t('serverInfo_performanceTooltip', [fpsQuality]);
                            } else {
                                fpsSpan.textContent = t('serverInfo_na');
                                fpsSpan.title = t('serverInfo_fpsUnavailableTooltip');
                            }
                        }
                    } else {
                        if (pingSpan) {
                            pingSpan.textContent = t('serverInfo_na');
                            pingSpan.title = t('serverInfo_pingUnavailableTooltip');
                        }
                        if (fpsSpan) {
                            fpsSpan.textContent = t('serverInfo_na');
                            fpsSpan.title = t('serverInfo_fpsUnavailableTooltip');
                        }
                    }
                }
                serverElement.removeAttribute('data-purpura-pending');
            }

        } catch (error) {
        } finally {
            isProcessingServers = false;
        }
    }

    function setupServerObserver() {
        if (serverObserverInitialized) {
            return;
        }
        serverObserverInitialized = true;

        const observeTargets = [
            document.querySelector('#game-instances-container'),
            document.querySelector('.rbx-game-server-item-container'),
            document.querySelector('.game-instances-container'),
            document.querySelector('.tab-content'),
            document.body 
        ].filter(target => target !== null);
        
        if (observeTargets.length === 0) {
            observeTargets.push(document.body);
        }
        
        observeTargets.forEach((target, index) => {
            const observer = new MutationObserver((mutations) => {
                let shouldUpdate = false;
                
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            if (node.classList && (
                                node.classList.contains('rbx-public-game-server-item')
                            )) {
                                shouldUpdate = true;
                            }
                            else if (node.querySelector && node.querySelector('.rbx-public-game-server-item')) {
                                shouldUpdate = true;
                            }
                            else if (node.querySelector && node.querySelector('[class*="gauge"]')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                    
                    if (mutation.type === 'attributes' && mutation.target.classList && (
                        mutation.target.classList.contains('rbx-public-game-server-item')
                    )) {
                        shouldUpdate = true;
                    }
                });
                
                if (shouldUpdate) {
                    setTimeout(() => addServerRegions(), 150);
                }
            });

            observer.observe(target, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        });
    }

    function initOnPageLoad() {
        if (!isServerInfoEnabled) {
            return;
        }

        checkAndInitialize();
        scheduleFastServerScan();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initOnPageLoad();
        });
    } else {
        initOnPageLoad();
    }

})();
