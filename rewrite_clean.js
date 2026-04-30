const fs = require('fs');
let content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// Replace all SVG text logos with clean tspan versions (no filter style)
const patterns = [
  // Navbar SVG
  [
    /            <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http:\/\/www\.w3\.org\/2000\/SVG">\n              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"\n                fill="#CCFF00" style=\{\{ filter: 'drop-shadow\(0 0 6px rgba\(204,255,0,0\.6\)\) '\} \}">\n                <tspan>X<\/tspan><tspan fill="#FFFFFF" letterSpacing="0\.05em">FIT<\/tspan><tspan fill="#CCFF00">X<\/tspan>\n              <\/text>\n            <\/svg>/,
    `            <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="Space Grotesk, sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan>X</tspan>
              </text>
            </svg>`
  ],
];

// Simpler approach: just do string replacements
const old1 = `            {/* Logo Mark: X-FIT-X 核心设计 */}
            <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>`;

const new1 = `            {/* Logo */}
            <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="Space Grotesk, sans-serif" fontSize="28" fontWeight="900" fill="#CCFF00">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan>X</tspan>
              </text>
            </svg>`;

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('✓ Replaced navbar SVG');
} else {
  console.log('✗ Navbar SVG exact match not found');
  // Try to find what's actually there around line 97
  const lines = content.split('\n');
  console.log('Lines 97-107:');
  for (let i = 96; i < 107; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

fs.writeFileSync('D:\\FitCoach\\src\\app\\page.tsx', content, 'utf8');
console.log('Done');
