const fs = require('fs');
const buf = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx');
let lineNum = 0;
let pos = 0;
while (pos < buf.length) {
  if (buf[pos] === 10) { lineNum++; if (lineNum === 103) break; }
  pos++;
}
const lineStart = pos + 1;
// Find line end
let lineEnd = lineStart;
while (lineEnd < buf.length && buf[lineEnd] !== 10) lineEnd++;
const line = buf.slice(lineStart, lineEnd);
console.log(`Line 103 (bytes ${lineStart}-${lineEnd}, len=${line.length}):`);
let hex = '';
for (let i = 0; i < line.length; i++) {
  hex += line[i].toString(16).padStart(2,'0') + ' ';
  if ((i+1) % 16 === 0) { console.log(hex); hex = ''; }
}
if (hex) console.log(hex);
console.log('\nAs string:');
console.log(line.toString('utf8'));
