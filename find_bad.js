const fs = require('fs');
const content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');
const lines = content.split('\n');

// Find any line with unusual chars
lines.forEach((line, i) => {
  for (let j = 0; j < line.length; j++) {
    const code = line.charCodeAt(j);
    if (code > 127 || (code < 32 && code !== 10 && code !== 13 && code !== 9)) {
      console.log(`Line ${i+1} pos ${j}: code=${code} hex=${code.toString(16)} char="${line[j]}"`);
    }
  }
});
console.log('Done scanning for unusual chars');
