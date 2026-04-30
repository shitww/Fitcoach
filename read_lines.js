const fs = require('fs');
['D:\\FitCoach\\src\\app\\analytics\\page.tsx',
 'D:\\FitCoach\\src\\app\\history\\page.tsx',
 'D:\\FitCoach\\src\\app\\summary\\page.tsx'].forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  console.log(`\n=== ${f.replace('D:\\FitCoach\\src\\app\\', '')} ===`);
  lines.forEach((l, i) => {
    if (/PF/i.test(l)) {
      for (let j = Math.max(0, i-2); j <= Math.min(lines.length-1, i+2); j++) {
        console.log(`L${j+1}: ${lines[j]}`);
      }
      console.log('---');
    }
  });
});
