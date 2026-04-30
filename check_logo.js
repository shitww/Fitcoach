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
  console.log(`\n=== ${f.split('\\').pop()} ===`);
  if (idx >= 0) {
    console.log(content.substring(idx, idx + 400));
  }
});
