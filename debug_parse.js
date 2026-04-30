const fs = require('fs');
const content = fs.readFileSync('D:/FitCoach/src/app/page.tsx', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Total chars:', content.length);

// Find lines with { that might contain strings with < or > inside
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Check for unclosed braces in strings
  if (line.includes('{') && line.includes('<')) {
    // Count braces outside of strings
    let inString = false;
    let braceDepth = 0;
    let escaped = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"' || ch === "'" || ch === '`') inString = !inString;
      if (!inString) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
    }
    if (braceDepth !== 0) {
      console.log('Line ' + (i+1) + ': brace depth off (' + braceDepth + '):', line.substring(0, 120));
    }
  }
}

// Also check for JSX comments that might have broken syntax
const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*'));
console.log('\nComment lines:', commentLines.length);

// Look for multiline comments that might have issues
let inBlockComment = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!inBlockComment && line.includes('/*')) inBlockComment = true;
  if (inBlockComment && line.includes('*/')) inBlockComment = false;
}
if (inBlockComment) console.log('WARNING: Unclosed block comment detected');

// Look for lines with Chinese chars inside JSX expressions that might have encoding issues
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('{') && /[\u4e00-\u9fa5]/.test(line)) {
    const contentInBraces = line.match(/\{([^}]*)\}/g);
    if (contentInBraces) {
      for (const brace of contentInBraces) {
        if (/[\u4e00-\u9fa5]/.test(brace) && brace.includes('<')) {
          console.log('Line ' + (i+1) + ' has Chinese in JSX braces with <:', line.substring(0, 150));
        }
      }
    }
  }
}

console.log('\nDone');
