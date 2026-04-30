const fs = require('fs');
let content = fs.readFileSync('D:\\FitCoach\\src\\app\\globals.css', 'utf8');

// Remove Google Fonts @import line
const gfontsLineStart = content.indexOf("@import url('https://fonts.googleapis.com");
if (gfontsLineStart >= 0) {
  const gfontsLineEnd = content.indexOf("');", gfontsLineStart) + 3;
  const removed = content.substring(gfontsLineStart, gfontsLineEnd);
  content = content.substring(0, gfontsLineStart) + content.substring(gfontsLineEnd);
  console.log('Removed:', removed.substring(0, 80));
} else {
  console.log('No Google Fonts import found');
}

// Replace PEAKFIT -> XFITX
content = content.replace(/PEAKFIT/g, 'XFITX');

fs.writeFileSync('D:\\FitCoach\\src\\app\\globals.css', content, 'utf8');
console.log('Done. Length:', content.length);
console.log('First 400:', content.substring(0, 400));
