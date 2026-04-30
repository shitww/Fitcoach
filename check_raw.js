const fs = require('fs');
const content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx');
const lines = content.toString('utf8').split('\n');

// Find lines containing "drop-shadow" and print hex around the quote
lines.forEach((line, i) => {
  if (line.includes('drop-shadow')) {
    const pos = line.indexOf("'drop-shadow");
    console.log(`\nLine ${i+1}:`);
    // Print chars around the quote
    const start = Math.max(0, pos - 2);
    const end = Math.min(line.length, pos + 60);
    for (let j = start; j < end; j++) {
      const c = line[j];
      const code = line.charCodeAt(j);
      if (code > 127 || code < 32) {
        console.log(`  [${j}] charCode=${code} HEX=${code.toString(16)} "${c}"`);
      }
    }
    console.log(`  TEXT: "${line.substring(start, end)}"`);
    console.log(`  QUOTE CONTEXT: "${line.substring(pos-1, pos+55)}"`);
  }
});
