/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    'use strict';

    if (window.__purpuraServerIdExtractorLoaded) return;
    window.__purpuraServerIdExtractorLoaded = true;

    const serverIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    function normalizeServerId(value) {
        if (value === null || value === undefined) return null;
        const id = String(value).trim();
        if (!id) return null;
        return serverIdRegex.test(id) ? id : null;
    }

    function readCandidateFromObject(obj) {
        if (!obj || typeof obj !== 'object') return null;

        const candidates = [
            obj,
            obj.server,
            obj.serverData,
            obj.instance,
            obj.item,
            obj.props,
            obj.children && obj.children.props,
            obj.details
        ];

        for (const candidate of candidates) {
            if (!candidate || typeof candidate !== 'object') continue;

            const serverId = normalizeServerId(
                candidate.id ||
                candidate.gameId ||
                candidate.gameInstanceId ||
                candidate.jobId ||
                candidate.serverId ||
                candidate.uuid
            );

            const accessCode = candidate.accessCode || candidate.accesscode || null;
            const privateServerId = candidate.vipServerId || candidate.privateServerId || candidate.vipserverid || null;

            if (serverId || accessCode || privateServerId) {
                return { serverId, accessCode, privateServerId };
            }
        }

        return null;
    }

    function extractFromFiberNode(fiberNode) {
        if (!fiberNode) return null;

        const visited = new Set();
        const queue = [fiberNode];
        let accessCode = null;
        let privateServerId = null;
        let safety = 0;

        while (queue.length && safety < 120) {
            safety += 1;
            const node = queue.shift();
            if (!node || visited.has(node)) continue;
            visited.add(node);

            const sources = [node.memoizedProps, node.pendingProps, node.stateNode && node.stateNode.props];
            for (const source of sources) {
                const result = readCandidateFromObject(source);
                if (!result) continue;

                if (!accessCode && result.accessCode) accessCode = result.accessCode;
                if (!privateServerId && result.privateServerId) privateServerId = result.privateServerId;

                if (result.serverId) {
                    return { serverId: result.serverId, accessCode, privateServerId };
                }
            }

            if (node.return) queue.push(node.return);
            if (node.child) queue.push(node.child);
            if (node.sibling) queue.push(node.sibling);
            if (node.alternate) queue.push(node.alternate);
        }

        if (accessCode || privateServerId) {
            return { serverId: null, accessCode, privateServerId };
        }

        return null;
    }

    function getReactFiberFromElement(element) {
        let current = element;
        let depth = 0;

        while (current && depth < 5) {
            const keys = Object.keys(current);

            for (const key of keys) {
                if (key.indexOf('__reactFiber$') === 0 || key.indexOf('__reactInternalInstance$') === 0) {
                    const fiber = current[key];
                    if (fiber) return fiber;
                }

                if (key.indexOf('__reactContainer$') === 0) {
                    const container = current[key];
                    if (container && container.current) return container.current;
                }
            }

            current = current.parentElement;
            depth += 1;
        }

        return null;
    }

    window.addEventListener('purpura-extract-serverid-request', function(event) {
        const extractionId = event && event.detail && event.detail.extractionId;
        if (!extractionId) return;

        try {
            const element = document.querySelector('[data-purpura-extraction-id="' + extractionId + '"]');
            if (!element) {
                window.dispatchEvent(new CustomEvent('purpura-serverid-extracted', {
                    detail: { extractionId, serverId: null, error: 'element_not_found' }
                }));
                return;
            }

            const fiber = getReactFiberFromElement(element);
            const extracted = extractFromFiberNode(fiber);

            window.dispatchEvent(new CustomEvent('purpura-serverid-extracted', {
                detail: {
                    extractionId,
                    serverId: extracted && extracted.serverId ? extracted.serverId : null,
                    accessCode: extracted && extracted.accessCode ? extracted.accessCode : null,
                    privateServerId: extracted && extracted.privateServerId ? extracted.privateServerId : null
                }
            }));
        } catch (error) {
            window.dispatchEvent(new CustomEvent('purpura-serverid-extracted', {
                detail: {
                    extractionId,
                    serverId: null,
                    error: error && error.message ? error.message : String(error)
                }
            }));
        }
    });
})();