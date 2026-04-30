const fs = require('fs');
const content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// Find SVG #1 and #2 full content
let idx = 0;
let count = 0;
while ((idx = content.indexOf('<svg', idx)) !== -1 && count < 10) {
  const end = content.indexOf('</svg>', idx);
  const block = content.substring(idx, end + 6);
  if (block.includes('width="80"') || block.includes('width="64"') || block.includes('width="160"')) {
    console.log(`\n=== SVG #${count + 1} (pos ${idx}) ===`);
    console.log(block);
    console.log('=== END ===');
  }
  idx = end + 6;
  count++;
}
