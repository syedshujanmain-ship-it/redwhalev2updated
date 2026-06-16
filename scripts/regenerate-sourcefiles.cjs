#!/usr/bin/env node
/**
 * Auto-regenerate src/utils/sourceFiles.ts from current source code.
 * Run this before building/pushing to ensure GitHub push always has latest code.
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const OUT_FILE = path.join(BASE_DIR, 'src', 'utils', 'sourceFiles.ts');

const include = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.check.json',
  'tailwind.config.js',
  'postcss.config.js',
  '.gitignore',
  'vercel.json',
  '.env.example',
  'index.html',
  'README.md',
];

function walk(dir, files, skipDirs = new Set(['node_modules', 'dist', '.git', '.skills'])) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(BASE_DIR, full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (skipDirs.has(entry)) continue;
      walk(full, files, skipDirs);
    } else {
      if (rel.startsWith('src' + path.sep + 'utils' + path.sep + 'sourceFiles.ts')) continue;
      if (!rel.startsWith('src' + path.sep) && !include.includes(rel)) continue;
      files[rel] = fs.readFileSync(full, 'utf-8');
    }
  }
}

const files = {};
for (const f of include) {
  const p = path.join(BASE_DIR, f);
  if (fs.existsSync(p)) files[f] = fs.readFileSync(p, 'utf-8');
}
walk(path.join(BASE_DIR, 'src'), files);

function jsEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

const lines = [
  '// AUTO-GENERATED - DO NOT EDIT MANUALLY',
  '// Contains ALL source files embedded as strings for 100% working download & GitHub push',
  '',
  'export function getAllSourceFiles(): Record<string, string> {',
  '  const files: Record<string, string> = {};',
  '',
];

for (const [p, c] of Object.entries(files)) {
  if (!c) continue;
  lines.push(`  files['${p}'] = \`${jsEscape(c)}\`;`);
}

lines.push('');
lines.push('  return files;');
lines.push('}');
lines.push('');
lines.push('export function getFileCount(): number {');
lines.push('  return Object.keys(getAllSourceFiles()).length;');
lines.push('}');

const content = lines.join('\n');
fs.writeFileSync(OUT_FILE, content);
console.log('✅ Regenerated sourceFiles.ts');
console.log('   Files:', Object.keys(files).length);
console.log('   Size:', (content.length / 1024 / 1024).toFixed(2), 'MB');
