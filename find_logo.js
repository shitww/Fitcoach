const fs = require('fs');

const files = [
  'D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx',
  'D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`\n=== ${file.replace('D:\\FitCoach\\', '')} ===`);
  lines.forEach((line, i) => {
    if (/PF|logo|Logo|XFI|TX/i.test(line)) {
      console.log(`L${i+1}: ${line.trim().substring(0, 120)}`);
    }
  });
}
