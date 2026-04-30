const fs = require('fs');
// Read raw buffer
const buf = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx');
let lineNum = 0;
let pos = 0;
while (pos < buf.length && lineNum < 103) {
  if (buf[pos] === 10) lineNum++;
  pos++;
}
// We're now at start of line 103
// Find the style attribute area
let lineStart = pos;
while (lineStart > 0 && buf[lineStart-1] !== 10) lineStart--;

// Print hex of line 102 and 103
for (let line = 101; line <= 104; line++) {
  let p = lineStart;
  // advance to correct line
  let ln = 0;
  while (ln < line && p < buf.length) {
    if (buf[p] === 10) ln++;
    p++;
  }
  let start = p;
  while (p < buf.length && buf[p] !== 10 && buf[p] !== 13) p++;
  const lineBuf = buf.slice(start, p);
  console.log(`\n=== Line ${line+1} (${lineBuf.length} bytes) ===`);
  let hex = '';
  for (let i = 0; i < lineBuf.length; i++) {
    const b = lineBuf[i];
    if (b < 32 || b > 127) {
      hex += `[${b.toString(16)}]`;
    } else {
      hex += String.fromCharCode(b);
    }
    if ((i+1) % 30 === 0) hex += '\n';
  }
  console.log(hex);
}
