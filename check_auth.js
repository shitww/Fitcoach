const fs = require('fs');
['D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx',
 'D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const idx = content.indexOf('<svg');
  console.log(`\n=== ${f.split('\\').pop()} ===`);
  if (idx >= 0) {
    const end = content.indexOf('</svg>', idx);
    console.log(content.substring(idx, end + 6));
  }
});
