const fs = require('fs');
const lines = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8').split('\n');
for (let i = 97; i < 145; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
