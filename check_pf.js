const fs = require('fs');
const path = require('path');

function search(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const full = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...search(full));
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      if (/PF|PEAKFIT|peakfit/i.test(content)) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (/PF|PEAKFIT|peakfit/i.test(line)) {
            results.push(`${full.replace('D:\\FitCoach\\', '')}:${i+1} — ${line.trim().substring(0, 80)}`);
          }
        });
      }
    }
  }
  return results;
}

const results = search('D:\\FitCoach\\src');
if (results.length === 0) {
  console.log('No PF/PEAKFIT references found ✓');
} else {
  results.forEach(r => console.log(r));
}
