const fs = require('fs');
const path = require('path');

function walk(dir, exts, results) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      walk(full, exts, results);
    } else if (item.isFile() && exts.some(e => item.name.endsWith(e))) {
      results.push(full);
    }
  }
}

const files = [];
walk('D:/FitCoach/src', ['.ts', '.tsx'], files);

const term = 'heatmap';
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.toLowerCase().includes(term)) {
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.toLowerCase().includes(term)) {
        console.log(f.replace('D:/FitCoach/src/', '') + ':' + (i + 1) + ': ' + l.trim().substring(0, 120));
      }
    });
  }
}
console.log('Total files searched:', files.length);
