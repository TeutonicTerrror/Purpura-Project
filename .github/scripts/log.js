/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */

const fs = require('node:fs');

const USE_COLOR = Boolean(process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== 'dumb' && !process.env.CI);
const ANSI = {
    reset: USE_COLOR ? '\x1b[0m' : '',
    bold: USE_COLOR ? '\x1b[1m' : '',
    dim: USE_COLOR ? '\x1b[2m' : '',
    purple: USE_COLOR ? '\x1b[38;2;155;109;255m' : '',
    green: USE_COLOR ? '\x1b[32m' : '',
    cyan: USE_COLOR ? '\x1b[36m' : '',
    gray: USE_COLOR ? '\x1b[90m' : '',
    yellow: USE_COLOR ? '\x1b[33m' : '',
    red: USE_COLOR ? '\x1b[31m' : '',
};
function paint(s, ...codes) { return USE_COLOR ? codes.join('') + s + ANSI.reset : s; }
function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' kB';
    return (n / 1048576).toFixed(2) + ' MB';
}
function fmtMs(ms) { return ms < 1000 ? ms + 'ms' : (ms / 1000).toFixed(2) + 's'; }
function hr() { return paint('\u2500'.repeat(52), ANSI.dim); }
function logHeader(version) {
    const w = 52;
    const top = '\u256d' + '\u2500'.repeat(w) + '\u256e';
    const bot = '\u2570' + '\u2500'.repeat(w) + '\u256f';
    const label = `\u2726 Purpura v${version || '?.?.?'}`;
    const pad = Math.max(0, w - 2 - label.length);
    console.log('');
    console.log(paint(top, ANSI.purple));
    console.log(paint('\u2502', ANSI.purple) + '  ' + paint(label, ANSI.bold) + ' '.repeat(pad) + paint('\u2502', ANSI.purple));
    console.log(paint(bot, ANSI.purple));
    console.log('');
}
function beginStep(label, opts) {
    const silent = Boolean(opts && opts.silent);
    const t0 = Date.now();
    const frames = ['\u280b', '\u2819', '\u2839', '\u2838', '\u283c', '\u2834', '\u2826', '\u2827', '\u2807', '\u280f'];
    let frame = 0;
    let done = false;
    const active = Boolean(!silent && USE_COLOR && process.stdout.isTTY && !process.env.CI);
    let timer = null;
    const clear = () => { if (active) process.stdout.write('\r' + ' '.repeat(72) + '\r'); };
    if (active) {
        timer = setInterval(() => {
            if (done) return;
            const dot = paint(frames[frame++ % frames.length], ANSI.purple);
            process.stdout.write('\r  ' + dot + '  ' + paint(label + '\u2026', ANSI.dim) + '     ');
        }, 70);
    }
    return {
        ok(extra) {
            done = true;
            if (timer) clearInterval(timer);
            const ms = fmtMs(Date.now() - t0);
            if (active) {
                clear();
                console.log('  ' + paint('\u2714', ANSI.green, ANSI.bold) + '  ' + paint(label, ANSI.bold) + (extra ? '  ' + paint(extra + '  \u00b7  ' + ms, ANSI.dim) : '  ' + paint(ms, ANSI.dim)));
            } else {
                console.log('  \u2714 ' + label + (extra ? ' \u2014 ' + extra : '') + '  (' + ms + ')');
            }
        },
        skip() {
            done = true;
            if (timer) clearInterval(timer);
            if (active) clear();
        },
        fail(msg) {
            done = true;
            if (timer) clearInterval(timer);
            if (active) clear();
            console.log('  ' + paint('\u2718', ANSI.red, ANSI.bold) + '  ' + paint(label, ANSI.bold) + '  ' + paint(msg || 'failed', ANSI.red));
        },
        _t0: t0,
    };
}
function countFilesAndBytes(files) {
    let bytes = 0;
    for (const f of files) { try { bytes += fs.statSync(f).size; } catch (_) {} }
    return { n: files.length, bytes };
}

module.exports = { ANSI, paint, fmtBytes, fmtMs, hr, logHeader, beginStep, countFilesAndBytes };
