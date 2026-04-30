const fs = require('fs');
const buf = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx');

// Check for CR vs LF
let lf = 0, cr = 0, crlf = 0;
for (let i = 0; i < buf.length; i++) {
  if (buf[i] === 10) lf++;
  if (buf[i] === 13) cr++;
  if (buf[i] === 13 && buf[i+1] === 10) crlf++;
}

console.log(`LF (0x0A): ${lf}, CR (0x0D): ${cr}, CRLF pairs: ${crlf}`);
console.log(`File size: ${buf.length}`);

// Count actual logical lines
const text = buf.toString('utf8');
const lines = text.split('\n');
console.log(`Lines by split('\\n'): ${lines.length}`);
console.log(`Last line: "${lines[lines.length-1].substring(0,50)}"`);

// Check bytes around line 103 start
let lineStart = 0;
let lineNum = 0;
while (lineNum < 103) {
  if (buf[lineStart] === 10) lineNum++;
  lineStart++;
  if (lineStart >= buf.length) break;
}
console.log(`\nLine 103 starts at byte offset: ${lineStart}`);
console.log(`Bytes around line 103 (offset ${lineStart}-${lineStart+100}):`);
console.log(Buffer.from(buf.slice(lineStart, lineStart+100)).toString('hex'));
console.log(Buffer.from(buf.slice(lineStart, lineStart+100)).toString('ascii').replace(/[^\x20-\x7e]/g, '?'));
