const fs = require('fs');
const lines = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8').split('\n');
// Print lines 97-115
for (let i = 96; i < 115; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
