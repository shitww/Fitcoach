const fs = require('fs');
const content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

let inStr = false;
let strType = null;
let line = 1;
let col = 0;
let problems = [];

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  if (ch === '\n') { line++; col = 0; continue; }
  col++;

  if (!inStr) {
    if (ch === '"' || ch === "'") {
      inStr = true;
      strType = ch;
    }
  } else {
    if (ch === '\\') {
      i++; // skip escaped char
      continue;
    }
    if (ch === strType) {
      inStr = false;
      strType = null;
    }
  }
}

if (inStr) {
  console.log(`String still open at EOF! Last string type: ${strType}`);
} else {
  console.log('All strings properly closed.');
}

// Also check for unclosed JSX expressions
let jsxDepth = 0;
line = 1; col = 0;
for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  if (ch === '\n') { line++; col = 0; continue; }
  col++;
  
  if (content[i] === '<' && content[i+1] === '!'); // comment skip
  if (content[i] === '<' && content.substring(i, i+7) === '<script') || content[i] === '<' && content.substring(i, i+9) === '</script') {
    // skip
  }
}

console.log('Done');
