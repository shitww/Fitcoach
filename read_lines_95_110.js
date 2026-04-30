const fs = require('fs');
const lines = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8').split('\n');
// Lines 96-110 (0-indexed: 95-109)
for (let i = 95; i < 110; i++) {
  console.log(`${i+1}| ${lines[i]}`);
}
