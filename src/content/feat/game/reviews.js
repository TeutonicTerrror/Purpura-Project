/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    let enabled = true;
    let panel = null;
    let tab = null;
    let universeId = null;
    let generation = 0;
    let configuration = 0;
    let loading = false;
    let loaded = false;
    let page = 1;
    let sort = 'newest';
    let mine = null;
    let canWrite = false;
    let username = '';
    let reviews = [];
    let data = null;
    let observer = null;
    let timer = null;
    let busy = false;
    const text = (key, fallback) => chrome.i18n.getMessage(key) || fallback;
    const title = () => text('settings_gameReviews_label', 'Game Reviews');

    function element(tag, content, className) {
        const node = document.createElement(tag);
        if (content !== undefined) node.textContent = content;
        if (className) node.className = className;
        return node;
    }

    function button(label, action, parent) {
        const node = element('button', label, 'btn-control-xs');
        node.type = 'button';
        node.addEventListener('click', action);
        parent.appendChild(node);
        return node;
    }

    async function request(operation, extra = {}) {
        const result = await chrome.runtime.sendMessage({
            type: 'PURPURA_REVIEWS_REQUEST', operation, universeId, ...extra,
        });
        if (!result?.ok) throw new Error(result?.error || 'Reviews are temporarily unavailable.');
        return result;
    }

    function error(message) {
        if (!panel) return;
        let node = panel.querySelector('.purpura-reviews-error');
        if (!node) {
            node = element('p', '', 'purpura-reviews-error');
            node.setAttribute('role', 'alert');
            panel.prepend(node);
        }
        node.textContent = message;
    }

    function setBusy(value) {
        busy = value;
        if (panel) panel.querySelectorAll('button, select, textarea, input').forEach(node => { node.disabled = value; });
    }

    async function load(more = false) {
        if (loading || !panel || !enabled) return;
        const current = generation;
        loading = true;
        setBusy(true);
        try {
            const nextPage = more ? page + 1 : 1;
            const [list, own] = await Promise.all([
                request('list', { page: nextPage, sort }),
                more ? Promise.resolve(null) : request('mine').catch(exception => ({
                    review: null, canWrite: false, error: exception.message,
                })),
            ]);
            if (current !== generation || !panel || !enabled) return;
            data = list;
            page = nextPage;
            reviews = more ? reviews.concat(list.reviews) : list.reviews;
            if (own) { mine = own.review; canWrite = own.canWrite; username = own.username || ''; }
            loaded = true;
            render();
            if (own?.error) error(own.error);
        } catch (exception) {
            if (current === generation && panel) {
                error(exception.message);
                if (!loaded && !panel.querySelector('.purpura-reviews-retry')) {
                    button('Retry', () => load(), panel).classList.add('purpura-reviews-retry');
                }
            }
        } finally {
            if (current === generation) { loading = false; setBusy(false); }
        }
    }

    function ratingLabel(review) {
        return `★ ${review.rating}/5 · Gameplay ${review.subRatings.gameplay} · Creativity ${review.subRatings.creativity} · Polish ${review.subRatings.polish}`;
    }

    function renderForm(parent) {
        const form = element('form', undefined, 'purpura-review-form');
        form.appendChild(element('h3', mine ? 'Edit your review' : 'Write a review'));
        form.appendChild(element('p', 'Posting under a stable pseudonym (unverified). Pseudonyms are not proof of identity. Reviews and pseudonyms are public.'));
        const fields = {};
        for (const category of ['gameplay', 'creativity', 'polish']) {
            const label = element('label', category[0].toUpperCase() + category.slice(1));
            const select = element('select');
            select.required = true;
            select.name = category;
            select.appendChild(new Option('Choose 1–5 stars', ''));
            for (let rating = 1; rating <= 5; rating++) select.appendChild(new Option('★'.repeat(rating), String(rating)));
            select.value = String(mine?.subRatings[category] || '');
            label.appendChild(select);
            form.appendChild(label);
            fields[category] = select;
        }
        const label = element('label', 'Review text (optional; 10–1000 characters)');
        const textarea = element('textarea');
        textarea.maxLength = 1000;
        textarea.rows = 5;
        textarea.value = mine?.reviewText || '';
        label.appendChild(textarea);
        form.appendChild(label);
        form.appendChild(element('p', 'Profanity is filtered before publishing. Do not post personal information. Your review can only be managed from this installation and Roblox login; uninstalling or clearing extension data loses access.'));
        const actions = element('div', undefined, 'purpura-review-actions');
        const submit = button(mine ? 'Update review' : 'Publish review', () => {}, actions);
        submit.type = 'submit';
        button('Cancel', render, actions);
        form.appendChild(actions);
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (busy) return;
            const reviewText = textarea.value.trim();
            if (reviewText && reviewText.length < 10) { error('Review text must contain at least 10 characters.'); return; }
            const current = generation;
            setBusy(true);
            try {
                const result = await request('save', {
                    expectedUsername: username,
                    gameplay: Number(fields.gameplay.value), creativity: Number(fields.creativity.value),
                    polish: Number(fields.polish.value), reviewText,
                });
                if (current !== generation) return;
                mine = result.review;
                await load();
                if (result.filtered && current === generation) error('Your review was published with profanity filtered.');
            } catch (exception) { if (current === generation) error(exception.message); }
            finally { if (current === generation) setBusy(false); }
        });
        parent.appendChild(form);
    }

    async function deleteMine() {
        if (busy || !window.confirm('Delete your review permanently?')) return;
        const current = generation;
        setBusy(true);
        try {
            await request('delete', { expectedUsername: username });
            if (current !== generation) return;
            mine = null;
            await load();
        } catch (exception) { if (current === generation) error(exception.message); }
        finally { if (current === generation) setBusy(false); }
    }

    function render() {
        if (!panel || !data) return;
        panel.replaceChildren();
        const aggregate = data.aggregate;
        panel.appendChild(element('h2', title()));
        panel.appendChild(element('p', `${Number(aggregate.averageRating).toFixed(1)} / 5 · ${aggregate.totalReviews} reviews`));
        if (aggregate.totalReviews) {
            panel.appendChild(element('p', `Gameplay ${Number(aggregate.averageGameplay).toFixed(1)} · Creativity ${Number(aggregate.averageCreativity).toFixed(1)} · Polish ${Number(aggregate.averagePolish).toFixed(1)}`));
            const distribution = element('div', undefined, 'purpura-review-distribution');
            for (let rating = 5; rating >= 1; rating--) {
                const row = element('div', `${rating} ★ `);
                const meter = element('meter');
                meter.min = 0;
                meter.max = aggregate.totalReviews;
                meter.value = aggregate.distribution[rating - 1];
                meter.setAttribute('aria-label', `${rating} stars: ${meter.value} reviews`);
                row.append(meter, document.createTextNode(` ${meter.value}`));
                distribution.appendChild(row);
            }
            panel.appendChild(distribution);
        }
        const own = element('section', undefined, 'purpura-own-review');
        own.appendChild(element('h3', 'Your review'));
        if (!canWrite) own.appendChild(element('p', 'Log in to Roblox to write a review.'));
        else if (mine) {
            own.append(element('p', ratingLabel(mine)), element('p', mine.reviewText, 'purpura-review-text'));
            button('Edit', () => { own.replaceChildren(); renderForm(own); }, own);
            button('Delete', deleteMine, own);
        } else button('Write a review', () => { own.replaceChildren(); renderForm(own); }, own);
        panel.appendChild(own);
        const controls = element('div', undefined, 'purpura-review-actions');
        const label = element('label', 'Sort reviews ');
        const select = element('select');
        select.append(new Option('Newest', 'newest'), new Option('Oldest', 'oldest'));
        select.value = sort;
        select.addEventListener('change', () => { sort = select.value; load(); });
        label.appendChild(select);
        controls.appendChild(label);
        button('Refresh', () => load(), controls);
        panel.appendChild(controls);
        for (const review of reviews) {
            const card = element('article', undefined, 'purpura-review-card');
            card.append(element('h4', `${review.username} · Unverified`), element('p', ratingLabel(review)),
                element('p', review.reviewText, 'purpura-review-text'),
                element('p', new Date(review.createdAt).toLocaleDateString()));
            panel.appendChild(card);
        }
        if (!reviews.length) panel.appendChild(element('p', 'No reviews yet. Be the first to review!'));
        if (page * data.pagination.limit < data.pagination.total) button('Load more', () => load(true), panel);
    }

    function activate() {
        if (!panel || !tab) return;
        const tabs = tab.parentElement;
        tabs.querySelectorAll('.rbx-tab').forEach(node => node.classList.remove('active'));
        const content = panel.parentElement;
        content.querySelectorAll(':scope > .tab-pane, :scope > .purpura-outfits-panel').forEach(node => node.classList.remove('active', 'in'));
        tab.classList.add('active');
        panel.classList.add('active');
        history.replaceState(null, '', '#purpura-reviews');
        if (!loaded) load();
    }

    function inject() {
        if (!enabled || panel || !/^\/games\/\d+(?:\/|$)/.test(location.pathname)) return;
        const tabs = document.querySelector('#horizontal-tabs, .rbx-tabs-horizontal .nav-tabs');
        const content = document.querySelector('.tab-content, .rbx-tabs-content');
        const metadata = document.querySelector('#game-detail-page[data-universe-id], #game-detail-meta-data[data-universe-id]');
        const id = Number(metadata?.getAttribute('data-universe-id'));
        if (!tabs || !content || !Number.isSafeInteger(id) || id <= 0) return;
        universeId = id;
        panel = element('section', 'Open this tab to load reviews.', 'tab-pane purpura-reviews-panel');
        panel.id = 'purpura-reviews';
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tab-purpura-reviews-link');
        tab = element('li', undefined, 'rbx-tab');
        tab.id = 'tab-purpura-reviews';
        const link = element('a', text('gameReviews_tab', 'Reviews'), 'rbx-tab-heading');
        link.href = '#purpura-reviews';
        link.id = 'tab-purpura-reviews-link';
        link.addEventListener('click', event => { event.preventDefault(); activate(); });
        tab.appendChild(link);
        tabs.appendChild(tab);
        content.appendChild(panel);
        if (location.hash === '#purpura-reviews') activate();
    }

    function remove() {
        generation++;
        if (tab?.classList.contains('active')) document.querySelector('#tab-about .rbx-tab-heading')?.click();
        tab?.remove();
        panel?.remove();
        tab = panel = null;
        universeId = null;
        loaded = loading = busy = false;
        mine = data = null;
        reviews = [];
        page = 1;
    }

    async function configure() {
        const current = ++configuration;
        const [sync, local] = await Promise.all([chrome.storage.sync.get('grev'), chrome.storage.local.get('noFeatures')]);
        if (current !== configuration) return;
        enabled = sync.grev !== false && local.noFeatures !== true;
        observer?.disconnect();
        clearInterval(timer);
        remove();
        if (!enabled) return;
        inject();
        const deadline = Date.now() + 30000;
        observer = new MutationObserver(() => { if (!panel && Date.now() < deadline) inject(); });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        let previousPath = location.pathname;
        timer = setInterval(() => {
            if (location.pathname !== previousPath) {
                previousPath = location.pathname;
                configure();
            } else if (panel && !panel.isConnected) { remove(); inject(); }
            else if (!panel && /^\/games\/\d+/.test(location.pathname)) inject();
        }, 1000);
    }

    document.addEventListener('click', event => {
        const other = event.target.closest?.('.rbx-tab-heading');
        if (panel && other && !tab.contains(other)) { tab.classList.remove('active'); panel.classList.remove('active', 'in'); }
    });
    window.addEventListener('hashchange', () => { if (location.hash === '#purpura-reviews') activate(); });
    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes.grev) || (area === 'local' && changes.noFeatures)) configure();
    });
    const style = element('style');
    style.textContent = `
        .purpura-reviews-panel {
            --review-control-bg: #303238;
            --review-control-hover: #3f414a;
            --review-control-text: #f5f5f7;
            --review-control-border: #686b78;
            --review-accent: #c4b5fd;
            --review-control-scheme: dark;
            display: none; padding: 20px; color: var(--text-color, inherit);
        }
        :is(.light-theme, .theme-light, [data-theme="light"]) .purpura-reviews-panel {
            --review-control-bg: #ffffff;
            --review-control-hover: #f0edf7;
            --review-control-text: #202027;
            --review-control-border: #777383;
            --review-accent: #6d28d9;
            --review-control-scheme: light;
        }
        .purpura-reviews-panel.active { display: block; }
        .purpura-review-card, .purpura-own-review { padding: 16px 0; border-bottom: 1px solid rgba(128,128,128,.3); }
        .purpura-review-text { white-space: pre-wrap; overflow-wrap: anywhere; }
        .purpura-review-form { display: grid; gap: 12px; max-width: 700px; }
        .purpura-review-form label { display: grid; gap: 6px; }
        .purpura-reviews-panel button,
        .purpura-reviews-panel select,
        .purpura-reviews-panel textarea {
            box-sizing: border-box;
            min-height: 38px;
            padding: 9px 14px;
            border: 1px solid var(--review-control-border);
            border-radius: 8px;
            background: var(--review-control-bg);
            color: var(--review-control-text);
            font: inherit;
            line-height: 1.4;
            color-scheme: var(--review-control-scheme);
        }
        .purpura-reviews-panel button {
            font-weight: 600;
            cursor: pointer;
            transition: background-color .15s, border-color .15s;
        }
        .purpura-reviews-panel button:hover:not(:disabled),
        .purpura-reviews-panel select:hover:not(:disabled) {
            background: var(--review-control-hover);
            border-color: var(--review-accent);
            color: var(--review-control-text);
        }
        .purpura-reviews-panel button[type="submit"] {
            background: #6d28d9;
            border-color: #6d28d9;
            color: #ffffff;
        }
        .purpura-reviews-panel button[type="submit"]:hover:not(:disabled) {
            background: #5b21b6;
            border-color: #5b21b6;
            color: #ffffff;
        }
        .purpura-reviews-panel :is(button, select, textarea, input):focus-visible {
            outline: 2px solid var(--review-accent);
            outline-offset: 3px;
        }
        .purpura-reviews-panel select { cursor: pointer; }
        .purpura-reviews-panel select option {
            background: var(--review-control-bg);
            color: var(--review-control-text);
        }
        .purpura-reviews-panel textarea::placeholder { color: var(--review-control-text); opacity: .7; }
        .purpura-review-form textarea { width: 100%; resize: vertical; }
        .purpura-review-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 12px 0; }
        .purpura-own-review button { margin-right: 12px; }
        .purpura-review-distribution meter { width: min(260px, 65%); }
        .purpura-reviews-error { color: #d97706; }
        .purpura-reviews-panel :is(button, select, textarea, input):disabled { opacity: .6; cursor: wait; }
    `;
    document.head.appendChild(style);
    configure().catch(() => {});
})();
