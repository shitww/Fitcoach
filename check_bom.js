const fs = require('fs');
// Read raw bytes
const buf = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx');
console.log('First 8 bytes (hex):', buf.slice(0, 8).toString('hex'));
console.log('File length:', buf.length);

// Find the line 103 area
let lineNum = 0;
let lineStart = 0;
for (let i = 0; i < buf.length; i++) {
  if (buf[i] === 10 || (buf[i] === 13 && buf[i+1] === 10)) {
    lineNum++;
    if (lineNum === 103) {
      lineStart = i + 1;
      break;
    }
  }
}

console.log(`Line 103 starts at byte offset: ${lineStart}`);
const chunk = buf.slice(lineStart, lineStart + 200);
console.log('Hex dump:');
let hex = '';
for (let i = 0; i < chunk.length; i++) {
  hex += chunk[i].toString(16).padStart(2, '0') + ' ';
  if ((i+1) % 20 === 0) {
    console.log(hex);
    hex = '';
  }
}
if (hex) console.log(hex);
