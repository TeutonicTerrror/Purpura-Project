/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const archiver = require('archiver');
const { fmtBytes, beginStep } = require('./log.js');

const ROOT = path.join(__dirname, '..', '..');
const CHROME_DIR = path.join(ROOT, 'build', 'chromium');
const FIREFOX_DIR = path.join(ROOT, 'build', 'firefox');
const FIREFOX_ZIP = path.join(ROOT, 'build', 'purpura_firefox.zip');
const SUMS_PATH = path.join(ROOT, 'build', 'checksums.txt');
const FIREFOX_SOURCE_DIR = path.join(ROOT, 'src', 'firefox');
const EPOCH = new Date(Date.UTC(1980, 0, 1));

const FIREFOX_ID = 'purpura@purpura.page';
const FIREFOX_MIN_VERSION = '140.0';

const DATA_COLLECTION_REQUIRED = ['authenticationInfo', 'websiteContent'];

function assertFile(file, label) {
    if (!fs.existsSync(file)) {
        throw new Error(`Missing ${label}: ${path.relative(ROOT, file)}`);
    }
}

function copyFile(source, target) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
}

function walkFiles(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walkFiles(fullPath, files);
        else files.push(fullPath);
    }
    return files;
}

function stripImportScripts(source) {
    const stripped = source
        .split('\n')
        .filter((line) => !/^\s*importScripts\(/.test(line))
        .join('\n');

    if (/\bimportScripts\s*\(/.test(stripped)) {
        throw new Error('A multi-line importScripts() call needs manual handling.');
    }

    return stripped;
}

function prependContentCompat(bundlePath, compatSource) {
    assertFile(bundlePath, 'content bundle');

    const bundle = fs.readFileSync(bundlePath, 'utf8');
    const headerMatch = bundle.match(/^\/\*[\s\S]*?\*\/\r?\n/);

    if (headerMatch) {
        fs.writeFileSync(
            bundlePath,
            `${headerMatch[0]}${compatSource}\n\n${bundle.slice(headerMatch[0].length)}`,
            'utf8'
        );
    } else {
        fs.writeFileSync(bundlePath, `${compatSource}\n\n${bundle}`, 'utf8');
    }
}

function buildManifest() {
    const manifestPath = path.join(FIREFOX_DIR, 'manifest.json');
    assertFile(manifestPath, 'Chromium manifest');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    delete manifest.minimum_chrome_version;

    const backgroundScripts = [
        'scripts/firefox-background-compat.js',
        'scripts/js/trading.js',
        'scripts/js/rs.js',
        'scripts/content/core/sk-migrate.js',
        'scripts/background.js'
    ];

    for (const relativePath of backgroundScripts) {
        assertFile(path.join(FIREFOX_DIR, relativePath), 'background script');
    }

    manifest.background = { scripts: backgroundScripts };
    manifest.browser_specific_settings = {
        gecko: {
            id: FIREFOX_ID,
            strict_min_version: FIREFOX_MIN_VERSION,
            data_collection_permissions: {
                required: DATA_COLLECTION_REQUIRED
            }
        },
        gecko_android: {
            strict_min_version: '142.0'
        }
    };

    fs.writeFileSync(
        manifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        'utf8'
    );
}

function installFirefoxRuntime() {
    const backgroundSource = path.join(FIREFOX_SOURCE_DIR, 'backgroundCompat.js');
    const permissionHtml = path.join(FIREFOX_SOURCE_DIR, 'permissionRequest.html');
    const permissionScript = path.join(FIREFOX_SOURCE_DIR, 'permissionRequest.js');

    assertFile(backgroundSource, 'Firefox background compatibility script');
    assertFile(permissionHtml, 'Firefox permission request page');
    assertFile(permissionScript, 'Firefox permission request script');

    copyFile(
        backgroundSource,
        path.join(FIREFOX_DIR, 'scripts', 'firefox-background-compat.js')
    );
    copyFile(
        permissionHtml,
        path.join(FIREFOX_DIR, 'firefox-permission-request.html')
    );
    copyFile(
        permissionScript,
        path.join(FIREFOX_DIR, 'firefox-permission-request.js')
    );
}

function writeFirefoxChecksum() {
    const hash = crypto
        .createHash('sha256')
        .update(fs.readFileSync(FIREFOX_ZIP))
        .digest('hex');

    const lines = fs.existsSync(SUMS_PATH)
        ? fs
              .readFileSync(SUMS_PATH, 'utf8')
              .split(/\r?\n/)
              .filter(Boolean)
              .filter((line) => !/\bpurpura_firefox\.zip$/.test(line))
        : [];

    lines.push(`${hash}  purpura_firefox.zip`);
    fs.writeFileSync(SUMS_PATH, `${lines.join('\n')}\n`, 'utf8');
}

async function writeFirefoxZip() {
    await fs.promises.rm(FIREFOX_ZIP, { force: true });

    const output = fs.createWriteStream(FIREFOX_ZIP);
    const archive = archiver('zip', { store: true });
    const files = walkFiles(FIREFOX_DIR).sort();

    const completed = new Promise((resolve, reject) => {
        output.once('close', resolve);
        output.once('error', reject);
        archive.once('error', reject);
    });

    archive.pipe(output);

    for (const file of files) {
        archive.append(fs.readFileSync(file), {
            name: path.relative(FIREFOX_DIR, file).split(path.sep).join('/'),
            date: EPOCH
        });
    }

    await archive.finalize();
    await completed;
}

async function main() {
    assertFile(
        path.join(CHROME_DIR, 'manifest.json'),
        'Chromium build (run `npm run build:chrome` first)'
    );

    fs.rmSync(FIREFOX_DIR, { recursive: true, force: true });
    fs.cpSync(CHROME_DIR, FIREFOX_DIR, { recursive: true });

    const backgroundPath = path.join(FIREFOX_DIR, 'scripts', 'background.js');
    assertFile(backgroundPath, 'background script');

    fs.writeFileSync(
        backgroundPath,
        stripImportScripts(fs.readFileSync(backgroundPath, 'utf8')),
        'utf8'
    );

    installFirefoxRuntime();
    buildManifest();

    const compatSource = fs
        .readFileSync(path.join(FIREFOX_SOURCE_DIR, 'contentCompat.js'), 'utf8')
        .replace(/^\/\*[\s\S]*?\*\/\s*/, '')
        .trim();

    prependContentCompat(
        path.join(FIREFOX_DIR, 'scripts', 'content', 'content_iso.js'),
        compatSource
    );
    prependContentCompat(
        path.join(FIREFOX_DIR, 'scripts', 'content', 'content_iso_idle.js'),
        compatSource
    );

    let step = beginStep('Pack purpura_firefox.zip');
    try {
        await writeFirefoxZip();
        step.ok(fmtBytes(fs.statSync(FIREFOX_ZIP).size));
    } catch (error) {
        step.fail(error.message);
        throw error;
    }

    step = beginStep('Update checksums.txt');
    writeFirefoxChecksum();
    step.ok('SHA-256');
    console.log('');
}

main().catch((error) => {
    console.error(`Firefox build failed: ${error.message}`);
    process.exitCode = 1;
});
