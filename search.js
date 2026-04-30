const fs = require('fs');
const path = require('path');

function search(dir, pattern) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const full = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...search(full, pattern));
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      if (pattern.test(content)) {
        const matches = [...content.matchAll(new RegExp(pattern.source, 'gi'))];
        results.push({ file: full.replace('D:\\FitCoach\\', ''), matches: matches.slice(0, 3) });
      }
    }
  }
  return results;
}

const results = search('D:\\FitCoach\\src', /logo|Logo|navbar|Navbar|XFITX|PEAKFIT|nav.*link/i);
results.forEach(r => console.log(r.file, r.matches.map(m => m[0].substring(0, 60))));
