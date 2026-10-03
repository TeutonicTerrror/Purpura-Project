/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
  'use strict';
  if (window.__purpuraBridgeLoaded) return;
  window.__purpuraBridgeLoaded = true;

  async function doFetch(url, options) {
    const fetchOpts = {
      method: (options && options.method) || 'GET',
      headers: (options && options.headers) || {},
      credentials: 'include',
      referrer: (options && options.referrer) || undefined
    };
    if (options && options.body !== undefined) fetchOpts.body = options.body;

    const resp = await fetch(url, fetchOpts);
    const headers = {};
    resp.headers.forEach((v, k) => headers[k] = v);
    const text = await resp.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
    return { status: resp.status, ok: resp.ok, statusText: resp.statusText, headers, bodyText: text, bodyJson: json };
  }

  document.addEventListener('purpura-fetch-request', async (event) => {
    const { callbackId, url, options } = event.detail || {};

    try {
      const attempt1 = await doFetch(url, options || {});
      if (attempt1.status === 403 && attempt1.headers && attempt1.headers['x-csrf-token']) {
        const token = attempt1.headers['x-csrf-token'];
        const retryOptions = Object.assign({}, options || {});
        retryOptions.headers = Object.assign({}, retryOptions.headers || {}, { 'X-Csrf-Token': token });
        const attempt2 = await doFetch(url, retryOptions);

        document.dispatchEvent(new CustomEvent('purpura-fetch-response', {
          detail: {
            callbackId,
            response: {
              attempts: [attempt1, attempt2],
              final: attempt2
            }
          }
        }));
        return;
      }

      document.dispatchEvent(new CustomEvent('purpura-fetch-response', {
        detail: {
          callbackId,
          response: {
            attempts: [attempt1],
            final: attempt1
          }
        }
      }));
    } catch (err) {
      document.dispatchEvent(new CustomEvent('purpura-fetch-response', {
        detail: { callbackId, error: (err && err.message) || String(err) }
      }));
    }
  });
})();