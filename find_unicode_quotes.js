const fs = require('fs');
const buf = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx');
let problems = [];
for (let i = 0; i < buf.length; i++) {
  const b = buf[i];
  // Check for curly quotes and other problematic chars
  if (b === 0xE2 && buf[i+1] === 0x80 && (buf[i+2] === 0x99 || buf[i+2] === 0x98)) {
    problems.push({ pos: i, char: buf.slice(i, i+3).toString('utf8'), hex: buf.slice(i, i+3).toString('hex') });
  }
  // Also check for \r alone (without following \n)
  if (b === 0x0D && buf[i+1] !== 0x0A) {
    problems.push({ pos: i, char: 'CR', hex: '0d' });
  }
}
if (problems.length) {
  problems.slice(0, 20).forEach(p => console.log(`Pos ${p.pos}: char="${p.char}" hex=${p.hex}`));
} else {
  console.log('No curly quotes or bare CR found.');
}
console.log(`File size: ${buf.length}`);
