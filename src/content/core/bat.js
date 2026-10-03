/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.PurpuraHBAClient) return;

    const TOKEN_HEADER_NAME = 'x-bound-auth-token';
    const FETCH_TOKEN_METADATA_SELECTOR = 'meta[name="hardware-backed-authentication-data"]';
    const FETCH_USER_DATA_SELECTOR = 'meta[name="user-data"]';
    const FETCH_TOKEN_METADATA_REGEX = /name="hardware-backed-authentication-data"(\s|.)+?data-is-secure-authentication-intent-enabled="(.+?)"(\s|.)+?data-is-bound-auth-token-enabled="(.+?)"(\s|.)+?data-bound-auth-token-whitelist="(.+?)"(\s|.)+?data-bound-auth-token-exemptlist="(.+?)"(\s|.)+?data-hba-indexed-db-name="(.+?)"(\s|.)+?data-hba-indexed-db-obj-store-name="(.+?)"(\s|.)+?data-hba-indexed-db-key-name="(.+?)"(\s|.)+?data-hba-indexed-db-version="(.+?)"/;
    const FETCH_USER_DATA_REGEX = /<meta[^name=]name="user-data"/;
    const DEFAULT_FETCH_TOKEN_METADATA_URL = 'https://www.roblox.com/charts';
    const DEFAULT_MATCH_ROBLOX_URL_BASE = '.roblox.com';
    const DEFAULT_FORCE_BAT_URLS = ['/account-switcher/v1/switch'];
    const TOKEN_SIGNATURE_ALGORITHM = { name: 'ECDSA', hash: { name: 'SHA-256' } };

    function decodeEntities(encodedString) {
        const translateRe = /&(nbsp|amp|quot|lt|gt);/g;
        const translate = {
            nbsp: ' ',
            amp: '&',
            quot: '"',
            lt: '<',
            gt: '>'
        };
        return encodedString
            .replace(translateRe, function (_match, entity) {
                return translate[entity];
            })
            .replace(/&#(\d+);/gi, function (_match, numStr) {
                const num = parseInt(numStr, 10);
                return String.fromCharCode(num);
            });
    }

    async function hashStringSha256(str) {
        const uint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest(TOKEN_SIGNATURE_ALGORITHM.hash.name, uint8);
        return arrayBufferToBase64String(hashBuffer);
    }

    function arrayBufferToBase64String(arrayBuffer) {
        let res = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.byteLength; i++) res += String.fromCharCode(bytes[i]);
        return btoa(res);
    }

    async function signWithKey(privateKey, data) {
        const bufferResult = await crypto.subtle.sign(TOKEN_SIGNATURE_ALGORITHM, privateKey, new TextEncoder().encode(data));
        return arrayBufferToBase64String(bufferResult);
    }

    function doesDatabaseExist(dbName) {
        return new Promise(resolve => {
            const db = indexedDB.open(dbName);
            db.onsuccess = () => {
                db.result.close();
                resolve(true);
            };
            db.onupgradeneeded = evt => {
                evt.target?.transaction?.abort();
                resolve(false);
            };
        });
    }

    async function getCryptoKeyPairFromDB(dbName, dbObjectName, dbObjectChildId) {
        let targetVersion = 1;
        if ('databases' in indexedDB) {
            const database = (await indexedDB.databases()).find(db => db.name === dbName);
            if (!database) return null;
            database?.version && (targetVersion = database.version);
        } else if (!await doesDatabaseExist(dbName)) {
            return null;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, targetVersion);
            request.onsuccess = () => {
                try {
                    const db = request.result;
                    const transaction = db.transaction(dbObjectName, 'readonly');
                    const get = transaction.objectStore(dbObjectName).get(dbObjectChildId);
                    get.onsuccess = () => {
                        resolve(get.result);
                    };
                    get.onerror = () => {
                        reject(request.error);
                    };
                    transaction.oncomplete = () => {
                        db.close();
                    };
                } catch (err) {
                    reject(err);
                }
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    function filterObject(obj) {
        const newObj = {};
        for (const key in obj) {
            const value = obj[key];
            value != null && (newObj[key] = value);
        }
        return newObj;
    }

    class HBAClient {
        fetch(url, params) {
            const headers = new Headers(filterObject(this.headers));
            if (params?.headers) {
                const headerParams = new Headers(params.headers);
                for (const [key, value] of headerParams) headers.set(key, value);
            }
            this.cookie && headers.set('cookie', this.cookie);
            const init = { ...params, headers };
            this.onSite && (init.credentials = 'include');
            return (this._fetchFn ?? fetch)(url, init);
        }

        async generateBaseHeadersFromUnsignedBAT(requestUrl, includeCredentials, data) {
            if (!await this.isUrlIncludedInWhitelist(requestUrl, includeCredentials)) return {};
            const token = await this.signBATData(data);
            return token ? { [TOKEN_HEADER_NAME]: token } : {};
        }

        async generateBaseHeaders(requestUrl, requestMethod, includeCredentials, body) {
            if (!await this.isUrlIncludedInWhitelist(requestUrl, includeCredentials)) return {};
            const token = await this.generateBAT(requestUrl.toString(), requestMethod, body);
            return token ? { [TOKEN_HEADER_NAME]: token } : {};
        }

        async generateSAIObject(serverNonce) {
            const pair = await this.getCryptoKeyPair();
            if (!pair?.privateKey) return null;
            const exportedPublicKey = arrayBufferToBase64String(await crypto.subtle.exportKey('spki', pair.publicKey));
            const timestamp = Math.floor(Date.now() / 1e3);
            const payload = [exportedPublicKey, timestamp, serverNonce].join('|');
            const signature = await signWithKey(pair.privateKey, payload);
            return {
                clientPublicKey: exportedPublicKey,
                clientEpochTimestamp: timestamp,
                saiSignature: signature,
                serverNonce
            };
        }

        async getTokenMetadata(uncached) {
            if (!uncached && await this.cachedTokenMetadata) return this.cachedTokenMetadata;
            const promise = (async () => {
                let isSecureAuthenticationIntentEnabled;
                let isBoundAuthTokenEnabledForAllUrls;
                let boundAuthTokenWhitelist;
                let boundAuthTokenExemptlist;
                let hbaIndexedDbName;
                let hbaIndexedDbObjStoreName;
                let hbaIndexedDbKeyName;
                let hbaIndexedDbVersion;
                let isAuthenticated;
                let doc;
                const canUseDoc = 'DOMParser' in globalThis && 'document' in globalThis;

                if (uncached || !canUseDoc || !document.querySelector?.(FETCH_TOKEN_METADATA_SELECTOR) || (!document.querySelector?.(FETCH_USER_DATA_SELECTOR) && document?.readyState === 'loading')) {
                    const text = await this.fetch(this.urls.fetchTokenMetadataUrl).then(res => res.text()).catch(() => {});
                    if (!text) return null;
                    if (canUseDoc) {
                        doc = new DOMParser().parseFromString(text, 'text/html');
                    } else {
                        const match = text.match(FETCH_TOKEN_METADATA_REGEX);
                        if (!match) return null;
                        try {
                            isAuthenticated = FETCH_USER_DATA_REGEX.test(text);
                            isSecureAuthenticationIntentEnabled = match[2] === 'true';
                            isBoundAuthTokenEnabledForAllUrls = match[4] === 'true';
                            try {
                                boundAuthTokenWhitelist = JSON.parse(decodeEntities(match[6]))?.Whitelist?.map(item => ({ ...item, sampleRate: Number(item.sampleRate) }));
                            } catch (error) {
                                boundAuthTokenWhitelist = [];
                            }
                            try {
                                boundAuthTokenExemptlist = JSON.parse(decodeEntities(match[8]))?.Exemptlist;
                            } catch (error) {
                                boundAuthTokenExemptlist = [];
                            }
                            hbaIndexedDbName = match[10];
                            hbaIndexedDbObjStoreName = match[12];
                            hbaIndexedDbKeyName = match[14];
                            hbaIndexedDbVersion = parseInt(match[16], 10) || 1;
                        } catch (error) {
                            return (this.cachedTokenMetadata = undefined), null;
                        }
                    }
                } else {
                    doc = document;
                }

                if (doc) {
                    const el = doc.querySelector?.(FETCH_TOKEN_METADATA_SELECTOR);
                    if (!el) return null;
                    try {
                        isAuthenticated = !!doc.querySelector?.(FETCH_USER_DATA_SELECTOR);
                        isSecureAuthenticationIntentEnabled = el.getAttribute('data-is-secure-authentication-intent-enabled') === 'true';
                        isBoundAuthTokenEnabledForAllUrls = el.getAttribute('data-is-bound-auth-token-enabled') === 'true';
                        try {
                            boundAuthTokenWhitelist = JSON.parse(el.getAttribute('data-bound-auth-token-whitelist'))?.Whitelist?.map(item => ({ ...item, sampleRate: Number(item.sampleRate) }));
                        } catch (error) {
                            boundAuthTokenWhitelist = [];
                        }
                        try {
                            boundAuthTokenExemptlist = JSON.parse(el.getAttribute('data-bound-auth-token-exemptlist'))?.Exemptlist;
                        } catch (error) {
                            boundAuthTokenExemptlist = [];
                        }
                        hbaIndexedDbName = el.getAttribute('data-hba-indexed-db-name');
                        hbaIndexedDbObjStoreName = el.getAttribute('data-hba-indexed-db-obj-store-name');
                        hbaIndexedDbKeyName = el.getAttribute('data-hba-indexed-db-key-name');
                        hbaIndexedDbVersion = parseInt(el.getAttribute('data-hba-indexed-db-version'), 10) || 1;
                    } catch (error) {
                        return (this.cachedTokenMetadata = undefined), null;
                    }
                }

                const tokenMetadata = {
                    isSecureAuthenticationIntentEnabled,
                    isBoundAuthTokenEnabledForAllUrls,
                    boundAuthTokenWhitelist,
                    boundAuthTokenExemptlist,
                    hbaIndexedDbName,
                    hbaIndexedDbObjStoreName,
                    hbaIndexedDbKeyName,
                    hbaIndexedDbVersion,
                    isAuthenticated
                };
                return (this.cachedTokenMetadata = tokenMetadata), tokenMetadata;
            })();
            return (this.cachedTokenMetadata = promise), promise;
        }

        async getCryptoKeyPair(uncached) {
            if (this.suppliedCryptoKeyPair) return this.suppliedCryptoKeyPair;
            if (!uncached && await this.cryptoKeyPair) return this.cryptoKeyPair;
            if (!('indexedDB' in globalThis)) return null;
            const promise = (async () => {
                const metadata = await this.getTokenMetadata(uncached);
                if (!metadata) return null;
                try {
                    const pair = await getCryptoKeyPairFromDB(metadata.hbaIndexedDbName, metadata.hbaIndexedDbObjStoreName, metadata.hbaIndexedDbKeyName);
                    return (this.cryptoKeyPair = pair ?? undefined), pair;
                } catch (error) {
                    return (this.cryptoKeyPair = undefined), null;
                }
            })();
            return (this.cryptoKeyPair = promise), promise;
        }

        async signBATData([hashedBody, timestamp, payload1, payload2]) {
            const pair = await this.getCryptoKeyPair();
            if (!pair?.privateKey) return null;
            const signatures = await Promise.all([
                signWithKey(pair.privateKey, payload1),
                signWithKey(pair.privateKey, payload2)
            ]);
            return ['v1', hashedBody, timestamp, signatures[0], signatures[1]].join('|');
        }

        async generateUnsignedBAT(requestUrl, requestMethod = 'GET', body) {
            const timestamp = Math.floor(Date.now() / 1e3).toString();
            let strBody;
            if (typeof body === 'object') strBody = JSON.stringify(body);
            else if (typeof body === 'string') strBody = body;
            const hashedBody = await hashStringSha256(strBody);
            const payload1 = [hashedBody, timestamp, requestUrl.toString(), requestMethod.toUpperCase()].join('|');
            const payload2 = ['', timestamp, requestUrl.toString(), requestMethod.toUpperCase()].join('|');
            return [hashedBody, timestamp, payload1, payload2];
        }

        async generateBAT(requestUrl, requestMethod = 'GET', body) {
            return (await this.getCryptoKeyPair())?.privateKey
                ? await this.signBATData(await this.generateUnsignedBAT(requestUrl, requestMethod, body))
                : null;
        }

        async isUrlIncludedInWhitelist(tryUrl, includeCredentials) {
            const url = tryUrl.toString();
            if (!url.toString().includes(this.urls.matchRobloxBaseUrl)) return false;
            if (this.onSite && this.urls.currentUrl) {
                try {
                    if (!new URL(url, this.urls.currentUrl).href.includes(this.urls.matchRobloxBaseUrl)) return false;
                } catch (error) { /* ignore */ }
            }
            if (this.urls.forceBATUrls.some(url2 => url.includes(url2))) return true;
            const metadata = await this.getTokenMetadata();
            return !includeCredentials || !(metadata?.isAuthenticated || this.isAuthenticated)
                ? false
                : !!metadata &&
                    (metadata.isBoundAuthTokenEnabledForAllUrls ||
                        !!metadata.boundAuthTokenWhitelist?.some(item => url.includes(item.apiSite) && Math.floor(Math.random() * 100) < item.sampleRate)) &&
                    !metadata.boundAuthTokenExemptlist?.some(item => url.includes(item.apiSite));
        }

        constructor({ fetch: fetchFn, headers, onSite, keys, urls, cookie } = {}) {
            this._fetchFn = undefined;
            this.cachedTokenMetadata = undefined;
            this.headers = {};
            this.cryptoKeyPair = undefined;
            this.onSite = false;
            this.suppliedCryptoKeyPair = undefined;
            this.cookie = undefined;
            this.isAuthenticated = undefined;
            this.urls = {
                fetchTokenMetadataUrl: DEFAULT_FETCH_TOKEN_METADATA_URL,
                matchRobloxBaseUrl: DEFAULT_MATCH_ROBLOX_URL_BASE,
                forceBATUrls: DEFAULT_FORCE_BAT_URLS
            };
            if (fetchFn) this._fetchFn = fetchFn;
            if (headers) this.headers = headers instanceof Headers ? Object.fromEntries(headers) : headers;
            if (urls) {
                for (const key in urls) this.urls[key] = urls[key];
            }
            if (onSite) {
                this.onSite = onSite;
                if (globalThis?.location?.href && !urls?.currentUrl) this.urls.currentUrl = globalThis.location.href;
            }
            if (keys) this.suppliedCryptoKeyPair = keys;
            if (cookie) this.cookie = cookie;
        }
    }

    window.PurpuraHBAClient = HBAClient;
})();
