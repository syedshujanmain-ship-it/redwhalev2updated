const fs = require('fs');
const path = require('path');

function jsEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function collectFiles(dir, baseDir, result = {}) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'supabase' || entry.name === 'tasks') continue;
      collectFiles(fullPath, baseDir, result);
    } else {
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.css', '.html', '.json', '.md', '.js', '.mjs'].includes(ext)) {
        try {
          result[relPath] = fs.readFileSync(fullPath, 'utf-8');
        } catch (e) { /* skip */ }
      }
    }
  }
  return result;
}

const files = collectFiles('/workspace/app-9wmtpvxmtm9t/src', '/workspace/app-9wmtpvxmtm9t');

const lines = [
  '// AUTO-GENERATED - DO NOT EDIT MANUALLY',
  '// Contains ALL source files embedded as strings for 100% working download & GitHub push',
  '',
  'export function getAllSourceFiles(): Record<string, string> {',
  '  const files: Record<string, string> = {};',
  '',
];

for (const [filePath, content] of Object.entries(files)) {
  lines.push(`  files['${filePath}'] = \`${jsEscape(content)}\`;`);
}

lines.push('');
lines.push('  return files;');
lines.push('}');
lines.push('');
lines.push('export function getFileCount(): number {');
lines.push('  return Object.keys(getAllSourceFiles()).length;');
lines.push('}');

fs.writeFileSync('/workspace/app-9wmtpvxmtm9t/src/utils/sourceFiles.ts', lines.join('\n'));
console.log(`Regenerated sourceFiles.ts with ${Object.keys(files).length} files`);
