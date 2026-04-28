/**
 * build.js — Netlify pre-deploy build script
 *
 * Reads header.fragment and footer.fragment, then copies every file to dist/
 * replacing the empty placeholder divs in HTML files with the baked-in fragments.
 * Netlify runs this before publishing, so visitors get fully pre-rendered pages
 * with no JS fetch and no flash of missing header/footer.
 *
 * Usage:  node build.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SRC  = __dirname;
const DIST = path.join(SRC, 'dist');

// ── Read fragments ────────────────────────────────────────────────────────────
const headerFragment = fs.readFileSync(path.join(SRC, 'header.fragment'), 'utf8').trim();
const footerFragment = fs.readFileSync(path.join(SRC, 'footer.fragment'), 'utf8').trim();

const HEADER_PLACEHOLDER = '<div id="site-header"></div>';
const FOOTER_PLACEHOLDER = '<div id="site-footer"></div>';

const HEADER_BAKED = `<div id="site-header">\n${headerFragment}\n</div>`;
const FOOTER_BAKED = `<div id="site-footer">\n${footerFragment}\n</div>`;

// Dirs/files to never copy into dist
const SKIP = new Set(['dist', 'node_modules', 'build.js', '.git']);

// ── Recursive copy ────────────────────────────────────────────────────────────
let htmlCount = 0;
let fileCount  = 0;

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src)) {
        if (SKIP.has(entry)) continue;

        const srcPath  = path.join(src, entry);
        const destPath = path.join(dest, entry);
        const stat     = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else if (entry.endsWith('.html')) {
            let content = fs.readFileSync(srcPath, 'utf8');
            content = content.replace(HEADER_PLACEHOLDER, HEADER_BAKED);
            content = content.replace(FOOTER_PLACEHOLDER, FOOTER_BAKED);
            fs.writeFileSync(destPath, content, 'utf8');
            htmlCount++;
        } else {
            fs.copyFileSync(srcPath, destPath);
            fileCount++;
        }
    }
}

// ── Run ───────────────────────────────────────────────────────────────────────
console.log('Building site into dist/ ...');
copyDir(SRC, DIST);
console.log(`Done — ${htmlCount} HTML files compiled, ${fileCount} other files copied.`);
