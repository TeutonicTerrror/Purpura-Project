/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const archiver = require('archiver');
const terser = require('terser');

const ROOT = __dirname;
const SRC_DIR = path.join(ROOT, 'src');
const BUILD_DIR = path.join(ROOT, 'build');
const FLAT_DIR = path.join(BUILD_DIR, 'flat');
const PUBLIC_DIR = path.join(BUILD_DIR, 'sourcecode');
const ZIP_STAGE_DIR = path.join(BUILD_DIR, 'chromium');
const ZIP_PATH = path.join(BUILD_DIR, 'purpura_chromium.zip');
const SUMS_PATH = path.join(BUILD_DIR, 'checksums.txt');
const EPOCH = new Date(Date.UTC(1980, 0, 1));

const { fmtBytes, logHeader, beginStep, countFilesAndBytes } = require('./.github/scripts/log.js');

const DEBUG_LOG_PATTERNS = [
    '[Purpura Settings] Setting change blocked',
    '[Purpura Settings] Premium feature blocked',
    '[Purpura Settings] noFeatures:',
    '[Pinned Games]',
    'Game Launcher Widget: Launching',
    'Game Launcher Widget: Disabled',
];
const KEEP_LOG_PATTERNS = [
    '[Purpura] Settings menu item injected',
    '[Purpura Outfits] Tab injected successfully',
    'Failed to copy debug info',
    'Debug info copied',
    'Failed to copy to clipboard',
];

function isDebugLog(line) {
    const t = line.trim();
    if (!t.startsWith('console.log')) return false;
    for (const p of KEEP_LOG_PATTERNS) { if (t.includes(p)) return false; }
    for (const p of DEBUG_LOG_PATTERNS) { if (t.includes(p)) return true; }
    return false;
}

function extractCopyright(source) {
    const m = source.match(/\/\*[\s\S]*?Purpura Extension[\s\S]*?\*\//);
    if (m) return m[0];
    const fc = source.match(/^\s*\/\*[\s\S]*?\*\//);
    return fc ? fc[0] : null;
}

function removeDebugLogs(source) {
    const lines = source.split('\n');
    const result = [];
    let i = 0;
    while (i < lines.length) {
        if (isDebugLog(lines[i])) {
            if (lines[i].trim().endsWith(');')) { i++; continue; }
            while (i < lines.length && !lines[i].trim().endsWith(');')) i++;
            i++;
            continue;
        }
        result.push(lines[i]);
        i++;
    }
    return result.join('\n');
}

function compactWhitespace(source) {
    let lines = source.split('\n').map(l => l.trimStart());
    const result = [];
    let prevBlank = false;
    for (const line of lines) {
        const blank = line.trim() === '';
        if (blank) { if (!prevBlank) result.push(''); prevBlank = true; }
        else { result.push(line); prevBlank = false; }
    }
    return result.join('\n').trim();
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

function copyDir(src, dest, filter) {
    if (!fs.existsSync(src)) return;
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const e of entries) {
        const s = path.join(src, e.name);
        const d = path.join(dest, e.name);
        if (e.isDirectory()) { copyDir(s, d, filter); }
        else if (!filter || filter(e.name)) { copyFile(s, d); }
    }
}

async function terserProcessFile(srcPath, destPath) {
    let source = fs.readFileSync(srcPath, 'utf8');
    const copyright = extractCopyright(source);
    source = removeDebugLogs(source);

    try {
        const result = await terser.minify(source, {
            mangle: { toplevel: false },
            compress: false,
            output: { comments: false, beautify: true, indent_level: 0 },
        });
        if (result.error) throw result.error;
        source = result.code;
    } catch (e) {
        console.error(`  Terser error in ${srcPath}: ${e.message}`);
        return false;
    }

    source = compactWhitespace(source);
    if (copyright) source = copyright + '\n' + source;
    if (!source.endsWith('\n')) source += '\n';

    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, source);
    return true;
}

const SKIP_DIRS = new Set([
    'node_modules', 'build', '.git', 'backup', '_metadata',
    'keys', 'rovalra', 'roseal',
]);
const SKIP_FILES = new Set([
    'build.js',
    'vite.config.js',
]);

const VENDORED_PREFIX = 'src/content/feat/cust/aeditor/three';

const STANDALONE_CONTENT_FILES = [
    'src/content/core/ppa.js',
    'src/content/core/ssi.js',
    'src/content/feat/serv/sie.js',
    'src/content/core/sk-migrate.js',
];

function findJSFiles(dir, results) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        const rel = path.relative(ROOT, full).split('\\').join('/');
        if (e.isDirectory()) {
            if (!SKIP_DIRS.has(e.name) && !SKIP_DIRS.has(e.name.toLowerCase()) && !rel.startsWith('.')) findJSFiles(full, results);
        } else if (rel.startsWith(VENDORED_PREFIX + '/')) {
        } else if (e.name.endsWith('.js') && !SKIP_FILES.has(rel) && rel !== 'build.js' && rel !== 'vite.config.js') {
            results.push(rel);
        }
    }
    return results;
}

const ISO_START_ORDER = [
    'content/feat/cat/nr.js',
    'content/api/api.js',
    'content/core/settings.js',
    'content/core/fx.js',
    'content/core/sk-migrate.js',
    'content/core/ld.js',
    'content/core/spc.js',
    'content/feat/cust/tbd.js',
    'content/feat/cust/stm.js',
    'content/feat/cust/thm.js',
    'content/feat/cust/sfix.js',
    'content/core/bat.js',
    'content/feat/cust/frpt.js',
    'content/feat/cust/ia.js',
    'content/feat/misc/dva.js',
    'content/feat/soc/ghos.js',
    'content/feat/cust/sdbr.js',
    'content/feat/cust/rae.js',
    'content/feat/cust/hpt.js',
    'content/feat/game/pt-ropro-import.js',
    'content/ui/psp.js',
    'content/ui/pst.js',
    'content/feat/cust/themes-page.js',
    'content/feat/game/pt-dashboard.js',
    'content/feat/game/srm.js',
    'content/feat/game/gb.js',
];

const ISO_IDLE_ORDER = [
    'content/core/settings.js',
    'content/core/smi.js',
    'content/feat/cust/unc.js',
    'content/feat/cat/rconv.js',
    'content/feat/cat/rbp.js',
    'content/feat/cat/rbon.js',
    'content/feat/cat/biv.js',
    'content/feat/cat/slr.js',
    'content/feat/cat/rr.js',
    'content/feat/cat/oilp.js',
    'content/ui/pt.js',
    'content/ui/gr.js',
    'content/ui/pg.js',
    'content/feat/priv/qs.js',
    'content/feat/serv/crowd.js',
    'content/feat/serv/si.js',
    'content/feat/serv/share.js',
    'content/feat/serv/pf.js',
    'content/misc/rp.js',
    'content/feat/cust/bwr.js',
    'content/feat/cust/hdb.js',
    'content/feat/cust/sft.js',
    'content/feat/cust/cbg.js',
    'content/feat/misc/up.js',
    'content/feat/misc/tse.js',
    'content/feat/misc/rwr.js',
    'content/feat/misc/tcs.js',
    'content/feat/cust/pb.js',
    'content/feat/cust/pcr.js',
    'content/feat/soc/lo.js',
    'content/feat/soc/rvp.js',
    'content/feat/cust/bc.js',
    'content/feat/cust/sap.js',
    'content/feat/priv/lb.js',
    'content/feat/priv/bsn.js',
    'content/feat/priv/psc.js',
    'content/feat/cat/projected.js',
    'content/feat/misc/es.js',
    'content/feat/game/pt.js',
    'content/feat/game/mpl.js',
    'content/feat/game/glw.js',
    'content/feat/soc/as.js',
    'content/feat/cat/explr.js',
    'content/feat/cust/r6w.js',
    'content/feat/cust/ac.js',
    'content/feat/cust/aa.js',
    'content/feat/cust/eo.js',
    'content/feat/soc/cb.js',
    'content/feat/soc/ce.js',
    'content/feat/soc/fo.js',
    'content/feat/soc/mpt.js',
    'content/feat/soc/bff.js',
    'content/feat/soc/bf.js',
    'content/feat/soc/fm.js',
    'content/feat/serv/bd.js',
    'content/feat/game/go.js',
    'content/feat/game/reviews.js',
    'content/feat/game/sho.js',
    'content/feat/game/lc.js',
    'content/feat/game/qp.js',
    'content/feat/game/pgr.js',
    'content/feat/game/rs.js',
    'content/feat/misc/tour.js',
    'content/core/ob.js',
    'content/feat/game/ps.js',
    'content/feat/cust/lts.js',
    'content/feat/cust/rat.js',
    'content/feat/cust/ucp.js',
    'content/feat/cust/dav.js',
    'content/feat/cust/sbt.js',
    'content/feat/cust/vb.js',
];
const MAIN_ORDER = [
    'content/core/pcb.js',
    'content/core/ssc.js',
    'content/core/frpt-main.js',
    'content/core/bc-main.js',
    'content/core/ia-main.js',
    'content/core/eo-main.js',
    'content/core/hpt-main.js',
    'content/core/psc-main.js',
    'content/core/tbd-main.js',
];
function buildBundle(order) {
    const parts = [];
    for (const rel of order) {
        const srcPath = path.join(SRC_DIR, rel);
        if (!fs.existsSync(srcPath)) { console.warn('  missing bundle source: ' + rel); continue; }
        let source = fs.readFileSync(srcPath, 'utf8');
        const m = source.match(/\/\*[\s\S]*?Purpura Extension[\s\S]*?\*\//);
        if (m) source = source.slice(0, m.index) + source.slice(m.index + m[0].length);
        source = source.trim();
        if (source) parts.push(source);
    }
    return parts.join('\n\n');
}
async function terserBundle(source, label) {
    let s = removeDebugLogs(source);
    try {
        const result = await terser.minify(s, {
            mangle: { toplevel: false },
            compress: false,
            output: { comments: false, beautify: true, indent_level: 0 },
        });
        if (result.error) throw result.error;
        s = result.code;
    } catch (e) {
        console.error('  Terser error in ' + label + ': ' + e.message);
        throw e;
    }
    s = compactWhitespace(s);
    const header = '/*\n * Purpura Extension\n * Copyright \u00a9 2026 TeutonicTerror\n * Licensed under the GNU General Public License v3.0.\n */';
    s = header + '\n' + s.trim() + '\n';
    return s;
}
function buildFlatExtension() {
    const rootFiles = ['manifest.json', 'permissions.txt', 'LICENSE'];
    for (const a of rootFiles) {
        const src = path.join(ROOT, a);
        if (fs.existsSync(src)) copyFile(src, path.join(FLAT_DIR, a));
    }

    const popupHtml = [['src/popup/home.html', 'home.html'], ['src/popup/new.html', 'new.html']];
    for (const [srcRel, destRel] of popupHtml) {
        const src = path.join(ROOT, srcRel);
        if (fs.existsSync(src)) copyFile(src, path.join(FLAT_DIR, destRel));
    }

    copyDir(path.join(SRC_DIR, 'css'), path.join(FLAT_DIR, 'css'));
    copyDir(path.join(ROOT, 'assets', 'images'), path.join(FLAT_DIR, 'images'));
    copyDir(path.join(ROOT, 'assets', 'fonts'), path.join(FLAT_DIR, 'fonts'));
    copyDir(path.join(ROOT, 'assets', '_locales'), path.join(FLAT_DIR, '_locales'));
    copyDir(path.join(SRC_DIR, 'data'), path.join(FLAT_DIR, 'data'));

    const threeDir = path.join(SRC_DIR, 'content', 'feat', 'cust', 'aeditor', 'three');
    if (fs.existsSync(threeDir)) {
        copyDir(threeDir, path.join(FLAT_DIR, 'content', 'feat', 'cust', 'aeditor', 'three'));
    }
    const reactDir = path.join(SRC_DIR, 'content', 'feat', 'cust', 'aeditor', 'react');
    if (fs.existsSync(reactDir)) {
        copyDir(reactDir, path.join(FLAT_DIR, 'content', 'feat', 'cust', 'aeditor', 'react'));
    }
}

const PUBLIC_ROOT_FILES = [
    'manifest.json', 'vite.config.js', 'package.json', 'package-lock.json',
    'LICENSE', 'README.md', '.editorconfig', '.gitattributes',
];
const PUBLIC_SOURCE_DIRS = ['src', 'assets', '.vscode', '.agents', '.github'];
const PRIVATE_PATHS = ['.teutonicterror', 'node_modules'];

function assertNoPrivatePaths(dir, label) {
    for (const rel of PRIVATE_PATHS) {
        if (fs.existsSync(path.join(dir, rel))) {
            throw new Error(`Private path '${rel}' found in ${label}. Aborting to avoid publishing owner-only files.`);
        }
    }
}

function copyPublicSnapshot() {
    for (const rel of PUBLIC_ROOT_FILES) {
        const src = path.join(ROOT, rel);
        if (fs.existsSync(src)) copyFile(src, path.join(PUBLIC_DIR, rel));
    }
    for (const rel of PUBLIC_SOURCE_DIRS) {
        if (PRIVATE_PATHS.includes(rel.split(path.sep).join('/'))) continue;
        const src = path.join(ROOT, rel);
        if (fs.existsSync(src)) copyDir(src, path.join(PUBLIC_DIR, rel));
    }
    assertNoPrivatePaths(PUBLIC_DIR, 'build/sourcecode');
    const template = path.join(ROOT, '.teutonicterror', 'public-gitignore');
    const ignoreSrc = fs.existsSync(template) ? template : path.join(ROOT, '.gitignore');
    if (fs.existsSync(ignoreSrc)) copyFile(ignoreSrc, path.join(PUBLIC_DIR, '.gitignore'));
}

function walkFiles(dir, out) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walkFiles(full, out);
        else out.push(full);
    }
    return out;
}

function rewriteManifestForZip(srcText) {
    const m = JSON.parse(srcText);
    const rewritePath = (p) => {
        if (p.startsWith('images/')) return 'assets/' + p;
        if (p === 'background.js') return 'scripts/background.js';
        if (p.startsWith('js/')) return 'scripts/' + p;
        if (p.startsWith('content/')) return 'scripts/' + p;
        return p;
    };
    const mapResources = (arr) => arr.map(rewritePath);
    if (m.background && m.background.service_worker) m.background.service_worker = rewritePath(m.background.service_worker);
    if (m.action && m.action.default_popup) m.action.default_popup = rewritePath(m.action.default_popup) || m.action.default_popup;
    ['16', '48', '128'].forEach((k) => {
        if (m.action && m.action.default_icon && m.action.default_icon[k]) m.action.default_icon[k] = rewritePath(m.action.default_icon[k]);
        if (m.icons && m.icons[k]) m.icons[k] = rewritePath(m.icons[k]);
    });
    if (m.declarative_net_request && Array.isArray(m.declarative_net_request.rule_resources)) {
        for (const r of m.declarative_net_request.rule_resources) if (r.path) r.path = rewritePath(r.path);
    }
    if (Array.isArray(m.web_accessible_resources)) {
        for (const e of m.web_accessible_resources) if (Array.isArray(e.resources)) e.resources = mapResources(e.resources);
    }
    if (Array.isArray(m.content_scripts)) {
        for (const e of m.content_scripts) {
            if (Array.isArray(e.js)) e.js = mapResources(e.js);
            if (Array.isArray(e.css)) e.css = mapResources(e.css);
        }
    }
    return JSON.stringify(m, null, 2) + '\n';
}

function rewriteHtmlForZip(srcText) {
    let s = srcText;
    s = s.replace(/\bhref="css\//g, 'href="css/');
    s = s.replace(/\bsrc="js\//g, 'src="scripts/js/');
    s = s.replace(/\bsrc="images\//g, 'src="assets/images/');
    s = s.replace(/\bhref="images\//g, 'href="assets/images/');
    s = s.replace(/url\((['"])fonts\//g, 'url($1assets/fonts/');
    return s;
}

function rewriteJsRuntimeUrlsForZip(srcText) {
    let s = srcText;
    s = s.replace(/chrome\.runtime\.getURL\(\s*'images\//g, "chrome.runtime.getURL('assets/images/");
    s = s.replace(/chrome\.runtime\.getURL\(\s*"images\//g, 'chrome.runtime.getURL("assets/images/');
    s = s.replace(/chrome\.runtime\.getURL\(\s*`images\//g, 'chrome.runtime.getURL(`assets/images/');
    s = s.replace(/chrome\.runtime\.getURL\(\s*'content\//g, "chrome.runtime.getURL('scripts/content/");
    s = s.replace(/chrome\.runtime\.getURL\(\s*"content\//g, 'chrome.runtime.getURL("scripts/content/');
    s = s.replace(/chrome\.runtime\.getURL\(\s*`content\//g, 'chrome.runtime.getURL(`scripts/content/');
    s = s.replace(/chrome\.runtime\.getURL\(\s*'js\//g, "chrome.runtime.getURL('scripts/js/");
    s = s.replace(/chrome\.runtime\.getURL\(\s*"js\//g, 'chrome.runtime.getURL("scripts/js/');
    s = s.replace(/chrome\.runtime\.getURL\(\s*`js\//g, 'chrome.runtime.getURL(`scripts/js/');
    s = s.replace(/(['"`])content\//g, '$1scripts/content/');
    s = s.replace(/(['"`])images\//g, '$1assets/images/');
    return s;
}

function isVendoredThreeFile(rel) {
    return rel.includes('/aeditor/three/');
}

function buildZipStageFromFlat() {
    fs.rmSync(ZIP_STAGE_DIR, { recursive: true, force: true });
    ensureDir(ZIP_STAGE_DIR);
    const files = [];
    walkFiles(FLAT_DIR, files);
    for (const abs of files) {
        const rel = path.relative(FLAT_DIR, abs).split(path.sep).join('/');
        let destRel;
        if (rel === 'manifest.json') {
            const rewritten = rewriteManifestForZip(fs.readFileSync(abs, 'utf8'));
            destRel = 'manifest.json';
            ensureDir(path.dirname(path.join(ZIP_STAGE_DIR, destRel)));
            fs.writeFileSync(path.join(ZIP_STAGE_DIR, destRel), rewritten, 'utf8');
            continue;
        }
        if (rel === 'home.html' || rel === 'new.html') {
            const rewritten = rewriteHtmlForZip(fs.readFileSync(abs, 'utf8'));
            destRel = rel;
            ensureDir(path.dirname(path.join(ZIP_STAGE_DIR, destRel)));
            fs.writeFileSync(path.join(ZIP_STAGE_DIR, destRel), rewritten, 'utf8');
            continue;
        }
        if (rel.startsWith('images/')) destRel = 'assets/' + rel;
        else if (rel.startsWith('fonts/')) destRel = 'assets/' + rel;
        else if (rel === 'background.js') destRel = 'scripts/background.js';
        else if (rel.startsWith('js/')) destRel = 'scripts/' + rel;
        else if (rel.startsWith('content/')) destRel = 'scripts/' + rel;
        else if (rel.startsWith('css/') || rel.startsWith('data/') || rel.startsWith('_locales/')) destRel = rel;
        else if (rel === 'permissions.txt' || rel === 'LICENSE') destRel = rel;
        else continue;
        const destAbs = path.join(ZIP_STAGE_DIR, destRel);
        ensureDir(path.dirname(destAbs));
        const vendored = isVendoredThreeFile(rel) || isVendoredThreeFile(destRel);
        if (destRel.endsWith('.js') && !vendored) {
            const src = fs.readFileSync(abs, 'utf8');
            fs.writeFileSync(destAbs, rewriteJsRuntimeUrlsForZip(src), 'utf8');
        } else {
            fs.copyFileSync(abs, destAbs);
        }
    }
    const stageFiles = [];
    walkFiles(ZIP_STAGE_DIR, stageFiles);
    return stageFiles;
}

function addEntriesTo(archive, files, baseDir) {
    const sorted = [...files].sort();
    for (const abs of sorted) {
        archive.append(fs.readFileSync(abs), {
            name: path.relative(baseDir, abs).split(path.sep).join('/'),
            date: EPOCH,
        });
    }
}

async function writeZipFromStage(stageFiles) {
    await fs.promises.rm(ZIP_PATH, { force: true });
    const archive = archiver('zip', { store: true });
    const ws = fs.createWriteStream(ZIP_PATH);
    const done = new Promise((resolve, reject) => {
        ws.once('close', resolve);
        ws.once('error', reject);
        archive.once('error', reject);
    });
    archive.pipe(ws);
    addEntriesTo(archive, stageFiles, ZIP_STAGE_DIR);
    await archive.finalize();
    await done;
}

function sha256File(file) {
    const h = crypto.createHash('sha256');
    h.update(fs.readFileSync(file));
    return h.digest('hex');
}

function writeChecksums() {
    const zipHash = sha256File(ZIP_PATH);
    const body = `${zipHash}  purpura_chromium.zip\n`;
    fs.writeFileSync(SUMS_PATH, body, 'utf8');
    return body;
}

function resetBuildDirs() {
    ensureDir(BUILD_DIR);
    const keep = new Set(['sourcecode', 'chromium', 'purpura_chromium.zip', 'checksums.txt', '.vite']);
    if (fs.existsSync(BUILD_DIR)) {
        for (const name of fs.readdirSync(BUILD_DIR)) {
            if (!keep.has(name)) fs.rmSync(path.join(BUILD_DIR, name), { recursive: true, force: true });
        }
    }
    fs.rmSync(FLAT_DIR, { recursive: true, force: true });
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    fs.rmSync(ZIP_STAGE_DIR, { recursive: true, force: true });
    ensureDir(FLAT_DIR);
    ensureDir(PUBLIC_DIR);
}

function virtualEntryPlugin() {
    const id = 'purpura-vite-entry';
    return {
        name: 'purpura-virtual-entry',
        resolveId(src) { if (src === id) return '\0' + id; },
        load(resolved) { if (resolved === '\0' + id) return 'export default null;'; },
    };
}

module.exports = () => {

    return {
        root: ROOT,
        clearScreen: false,
        logLevel: 'warn',
        publicDir: false,
        build: {
            outDir: 'build',
            emptyOutDir: false,
            write: true,
            minify: false,
            sourcemap: false,
            cssCodeSplit: false,
            reportCompressedSize: false,
            rollupOptions: {
                input: { 'purpura-vite-entry': 'purpura-vite-entry' },
                output: { entryFileNames: '.vite/[name].js', chunkFileNames: '.vite/[name].js', assetFileNames: '.vite/[name][extname]' },
            },
        },
        plugins: [
            virtualEntryPlugin(),
            {
                name: 'purpura-build-pipeline',
                closeBundle: {
                    order: 'post',
                    async handler() {
                        let version = '';
                        try { version = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8')).version; } catch (_) {}
                        logHeader(version);

                        resetBuildDirs();

                        let s = beginStep('Build Extension');
                        buildFlatExtension();
                        assertNoPrivatePaths(FLAT_DIR, 'the extension output');
                        {
                            const preFiles = [];
                            try { walkFiles(FLAT_DIR, preFiles); } catch (_) {}
                            const pre = countFilesAndBytes(preFiles);
                            s.ok(pre.n + ' files  \u00b7  ' + fmtBytes(pre.bytes));
                        }

                        s = beginStep('Bundled Content Scripts');
                        const isoSrc = buildBundle(ISO_START_ORDER);
                        const idleSrc = buildBundle(ISO_IDLE_ORDER);
                        const mainSrc = buildBundle(MAIN_ORDER);
                        const isoOut = await terserBundle(isoSrc, 'content/content_iso.js');
                        const idleOut = await terserBundle(idleSrc, 'content/content_iso_idle.js');
                        const mainOut = await terserBundle(mainSrc, 'content/content_main.js');
                        ensureDir(path.join(FLAT_DIR, 'content'));
                        fs.writeFileSync(path.join(FLAT_DIR, 'content', 'content_iso.js'), isoOut);
                        fs.writeFileSync(path.join(FLAT_DIR, 'content', 'content_iso_idle.js'), idleOut);
                        fs.writeFileSync(path.join(FLAT_DIR, 'content', 'content_main.js'), mainOut);
                        s.ok();
                        const terserStep = beginStep('Minify extension scripts', { silent: true });
                        const extraFiles = [
                            ['src/background/background.js', 'background.js'],
                            ['src/background/trading.js', 'js/trading.js'],
                            ['src/background/rs.js', 'js/rs.js'],
                            ['src/popup/home.js', 'js/home.js'],
                            ['src/popup/new.js', 'js/new.js'],
                            ['src/popup/changes.js', 'js/changes.js'],
                        ];
                        let ok = 0, fail = 0;
                        for (const [srcRel, destRel] of extraFiles) {
                            const srcP = path.join(ROOT, srcRel);
                            const destP = path.join(FLAT_DIR, destRel);
                            if (!fs.existsSync(srcP)) { console.warn('  missing: ' + srcRel); continue; }
                            const success = await terserProcessFile(srcP, destP);
                            if (success) ok++; else fail++;
                        }
                        for (const rel of STANDALONE_CONTENT_FILES) {
                            const srcP = path.join(ROOT, rel);
                            const destP = path.join(FLAT_DIR, rel.replace(/^src\//, ''));
                            if (fs.existsSync(srcP)) copyFile(srcP, destP);
                        }
                        if (fail > 0) { terserStep.fail(fail + ' file(s) failed'); throw new Error(fail + ' JS file(s) failed to minify'); }
                        terserStep.skip();

                        s = beginStep('Write public snapshot', { silent: true });
                        copyPublicSnapshot();
                        {
                            const pubFiles = [];
                            try { walkFiles(PUBLIC_DIR, pubFiles); } catch (_) {}
                            const pub = countFilesAndBytes(pubFiles);
                            s.skip();
                        }

                        s = beginStep('Stage chromium package', { silent: true });
                        const stageFiles = buildZipStageFromFlat();
                        {
                            const staged = countFilesAndBytes(stageFiles);
                            s.skip();
                        }

                        s = beginStep('Pack purpura_chromium.zip');
                        await writeZipFromStage(stageFiles);
                        {
                            const zipBytes = fs.statSync(ZIP_PATH).size;
                            s.ok(fmtBytes(zipBytes));
                        }

                        s = beginStep('Write checksums.txt');
                        const sums = writeChecksums();
                        s.ok('SHA-256');

                        fs.rmSync(path.join(BUILD_DIR, '.vite'), { recursive: true, force: true });
                        fs.rmSync(FLAT_DIR, { recursive: true, force: true });

                    },
                },
            },
        ],
    };
};
