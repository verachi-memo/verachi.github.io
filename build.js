#!/usr/bin/env node
/**
 * build.js — Lightweight static-site partial injector for verachi.github.io
 *
 * Scans all root-level .html files in src/ and replaces
 * <!-- partial:filename --> comments with the contents of partials/filename.
 *
 * Usage:
 *   node build.js          # builds from src/ into root
 *   node build.js --watch  # rebuilds on file changes
 *
 * The source-of-truth HTML lives in src/.
 * Deployed HTML lives in the project root (what GitHub Pages serves).
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const PARTIALS = path.join(ROOT, 'partials');

/**
 * Replace all <!-- partial:filename --> markers with the file contents
 */
function injectPartials(html) {
  return html.replace(/<!--\s*partial:(\S+)\s*-->/g, (match, filename) => {
    const partialPath = path.join(PARTIALS, filename);
    if (!fs.existsSync(partialPath)) {
      console.warn(`  ⚠ Partial not found: ${filename}`);
      return match;
    }
    return fs.readFileSync(partialPath, 'utf-8').trim();
  });
}

function build() {
  if (!fs.existsSync(SRC)) {
    console.error('Error: src/ directory not found. Create it first.');
    process.exit(1);
  }

  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));

  if (files.length === 0) {
    console.warn('No .html files found in src/');
    return;
  }

  console.log(`Building ${files.length} pages…`);

  for (const file of files) {
    const srcPath = path.join(SRC, file);
    const destPath = path.join(ROOT, file);
    const srcHtml = fs.readFileSync(srcPath, 'utf-8');
    const builtHtml = injectPartials(srcHtml);
    fs.writeFileSync(destPath, builtHtml, 'utf-8');
    console.log(`  ✓ ${file}`);
  }

  console.log('Done.');
}

// Watch mode
if (process.argv.includes('--watch')) {
  build();

  const chokidar = (() => {
    try { return require('chokidar'); } catch { return null; }
  })();

  if (chokidar) {
    console.log('\nWatching for changes…');
    chokidar.watch([SRC, PARTIALS], { ignoreInitial: true })
      .on('all', (event, filePath) => {
        console.log(`\n${event}: ${path.relative(ROOT, filePath)}`);
        build();
      });
  } else {
    // Fallback: use fs.watch
    console.log('\nWatching for changes (install chokidar for better watching)…');
    const watchDirs = [SRC, PARTIALS].filter(d => fs.existsSync(d));
    for (const dir of watchDirs) {
      fs.watch(dir, { recursive: true }, () => {
        build();
      });
    }
  }
} else {
  build();
}
