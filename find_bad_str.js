const fs = require('fs');
const content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// Simple approach: count unmatched quotes in string literals
// JSX doesn't use single-quoted strings normally, so single quotes in JSX context are suspicious
let inTemplate = false;
let in_jsx_str = false;
let in_dquote = false;
let in_squote = false;
let line = 1, col = 0;
let problems = [];

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  if (ch === '\n') { line++; col = 0; continue; }
  col++;

  if (ch === '`') {
    in_template = !in_template;
    continue;
  }
  
  if (in_template) continue; // skip template literals
  
  if (ch === '"') {
    if (!in_squote) {
      in_dquote = !in_dquote;
    }
  } else if (ch === "'") {
    if (!in_dquote) {
      in_squote = !in_squote;
      if (in_squote) {
        problems.push({ line, col, char: ch, context: content.substring(Math.max(0,i-20), i+30) });
      }
    }
  }
}

console.log(`Single-quote toggle events (${problems.length} total):`);
problems.forEach(p => {
  console.log(`  Line ${p.line}, col ${p.col}: ...${p.context}...`);
});
