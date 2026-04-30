const fs = require('fs');
const files = [
  'D:\\FitCoach\\src\\app\\page.tsx',
  'D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx',
  'D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx',
  'D:\\FitCoach\\src\\app\\analytics\\page.tsx',
  'D:\\FitCoach\\src\\app\\history\\page.tsx',
  'D:\\FitCoach\\src\\app\\summary\\page.tsx',
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const idx = content.indexOf('<svg');
  const end = content.indexOf('</svg>', idx);
  const block = content.substring(idx, end + 6);
  const lines = block.split('\n');
  console.log(`\n=== ${f.split('\\').pop()} ===`);
  lines.forEach(l => console.log(l.trim()));
});
