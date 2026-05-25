const fs = require('fs');
const path = require('path');

function walkDir(dir, exts, results) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      walkDir(full, exts, results);
    } else if (item.isFile() && exts.some(e => item.name.endsWith(e))) {
      results.push(full);
    }
  }
}

const files = [];
walkDir('D:/FitCoach/src', ['.ts', '.tsx'], files);

const targets = ['equipmentToType', 'EQUIPMENT_TYPE_MAP', 'equipment'];
for (const target of targets) {
  console.log(`\n=== ${target} ===`);
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes(target)) {
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes(target)) {
          console.log(`  ${f.replace('D:/FitCoach/src/', 'src/')}:${i+1}: ${line.trim()}`);
        }
      });
    }
  }
}
