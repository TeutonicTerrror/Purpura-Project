/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraShopOffersInitialized) {
    window.purpuraShopOffersInitialized = true;
    (function () {
        'use strict';
        function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

        const STORAGE_KEY = 'sho';
        const OFFERS_URL = 'https://apis.roblox.com/checkout/v1/offers?featureKeys=ROBLOX_SHOP';
        const STYLE_ID = 'purpura-shop-offer-styles';
        const CONTAINER_CLASS = 'purpura-shop-offers';
        const HEADER_SELECTOR = '#rbx-game-passes > .container-header, #roseal-game-passes > .container-header';

        let enabled = false;
        let offersPromise = null;
        let scanTimer = null;
        let observer = null;

        function injectStyles() {
            if (document.getElementById(STYLE_ID)) return;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = `
                .${CONTAINER_CLASS} {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin: 0 0 12px;
                }
                .${CONTAINER_CLASS} .purpura-shop-offer {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .${CONTAINER_CLASS} .purpura-shop-offer-pills {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .${CONTAINER_CLASS} .purpura-shop-offer-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 600;
                    line-height: 16px;
                    white-space: nowrap;
                }
                .${CONTAINER_CLASS} .purpura-shop-offer-pill.is-offer {
                    background: #7c5cff;
                    color: #ffffff;
                }
                .${CONTAINER_CLASS} .purpura-shop-offer-pill.is-expiry {
                    background: rgba(127, 127, 127, 0.18);
                    color: var(--purpura-mainText, inherit);
                    font-weight: 500;
                }
                .${CONTAINER_CLASS} .purpura-shop-offer-note {
                    color: var(--purpura-secondaryText, #a3a3a3);
                    font-size: 13px;
                }
            `;
            (document.head || document.documentElement).appendChild(style);
        }

        function fetchOffers() {
            return fetch(OFFERS_URL, {
                credentials: 'include',
                headers: { accept: 'application/json' }
            }).then(function (response) {
                if (!response.ok) throw new Error('shop offers request failed: ' + response.status);
                return response.json();
            }).then(function (data) {
                const now = Date.now();
                return (Array.isArray(data && data.offers) ? data.offers : []).filter(function (offer) {
                    if (!offer || offer.offerStatus !== 'AVAILABLE') return false;
                    if (!offer.expirationTimeInUTC) return true;
                    const expiresAt = Date.parse(offer.expirationTimeInUTC);
                    return !Number.isFinite(expiresAt) || expiresAt > now;
                });
            });
        }

        function getOffers() {
            if (!offersPromise) {
                offersPromise = fetchOffers().catch(function (error) {
                    offersPromise = null;
                    throw error;
                });
            }
            return offersPromise;
        }

        function presentation(offer, type) {
            const list = Array.isArray(offer.presentationData) ? offer.presentationData : [];
            return list.find(function (entry) { return entry && entry.type === type; }) || null;
        }

        function createPill(text, extraClass, tooltip) {
            const pill = document.createElement('span');
            pill.className = 'purpura-shop-offer-pill ' + extraClass;
            pill.textContent = text;
            if (tooltip) pill.title = tooltip;
            return pill;
        }

        function createOfferRow(offer) {
            const banner = presentation(offer, 'BANNER');
            const badge = presentation(offer, 'MENU_BADGE');
            const title = (banner && banner.banner && banner.banner.title) ||
                (badge && badge.menuBadge && badge.menuBadge.title);
            if (!title) return null;

            const row = document.createElement('div');
            row.className = 'purpura-shop-offer';

            const pills = document.createElement('div');
            pills.className = 'purpura-shop-offer-pills';

            const body = banner && banner.banner && banner.banner.modal && banner.banner.modal.body;
            pills.appendChild(createPill(title, 'is-offer', body || null));

            if (offer.expirationTimeInUTC) {
                const expiresAt = new Date(offer.expirationTimeInUTC);
                if (!Number.isNaN(expiresAt.getTime())) {
                    pills.appendChild(createPill(
                        t('shopOffers_expires') + ' ' + expiresAt.toLocaleString(),
                        'is-expiry'
                    ));
                }
            }

            const note = document.createElement('span');
            note.className = 'purpura-shop-offer-note';
            note.textContent = t('shopOffers_inGameOnly');

            row.appendChild(pills);
            row.appendChild(note);
            return row;
        }

        function clearOffers() {
            document.querySelectorAll('.' + CONTAINER_CLASS).forEach(function (node) { node.remove(); });
            document.querySelectorAll('[data-purpura-shop-offers]').forEach(function (header) {
                delete header.dataset.purpuraShopOffers;
            });
        }

        async function render(header) {
            if (!enabled || !header || header.dataset.purpuraShopOffers === 'true') return;
            header.dataset.purpuraShopOffers = 'true';

            let offers;
            try {
                offers = await getOffers();
            } catch (error) {
                delete header.dataset.purpuraShopOffers;
                return;
            }

            const rows = offers.map(createOfferRow).filter(Boolean);
            if (!enabled || rows.length === 0 || !header.isConnected) return;

            const existing = header.parentElement &&
                header.parentElement.querySelector(':scope > .' + CONTAINER_CLASS);
            if (existing) existing.remove();

            const container = document.createElement('div');
            container.className = CONTAINER_CLASS;
            container.append.apply(container, rows);
            header.insertAdjacentElement('afterend', container);
        }

        function scan() {
            if (!enabled) return;
            document.querySelectorAll(HEADER_SELECTOR).forEach(function (header) {
                render(header);
            });
        }

        function scheduleScan() {
            if (scanTimer || !enabled) return;
            scanTimer = setTimeout(function () {
                scanTimer = null;
                scan();
            }, 150);
        }

        function observe() {
            if (observer || !document.body) return;
            observer = new MutationObserver(scheduleScan);
            observer.observe(document.body, { childList: true, subtree: true });
        }

        async function configure() {
            const [sync, local] = await Promise.all([
                chrome.storage.sync.get(STORAGE_KEY),
                chrome.storage.local.get('noFeatures')
            ]);
            const next = sync[STORAGE_KEY] !== false && local.noFeatures !== true;
            if (!next) {
                enabled = false;
                clearOffers();
                return;
            }
            if (!enabled) {
                enabled = true;
                injectStyles();
                observe();
            }
            scheduleScan();
        }

        function init() {
            if (!/^\/games\/\d+/.test(window.location.pathname)) return;
            configure().catch(function () {});
            chrome.storage.onChanged.addListener(function (changes, area) {
                if ((area === 'sync' && changes[STORAGE_KEY]) ||
                    (area === 'local' && changes.noFeatures)) {
                    configure().catch(function () {});
                }
            });
        }

        init();
    })();
}
