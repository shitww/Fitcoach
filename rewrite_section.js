const fs = require('fs');
const content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// Find and replace the navbar SVG section
const oldSection = `            {/* Logo Mark: X-FIT-X 核心设计 */}
            <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>

            {/* 分隔线 */}`;

const newSection = `            {/* Logo */}
            <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>

            {/* Divider */}`;

if (content.includes(oldSection)) {
  const newContent = content.replace(oldSection, newSection);
  fs.writeFileSync('D:\\FitCoach\\src\\app\\page.tsx', newContent, 'utf8');
  console.log('Replaced successfully');
} else {
  console.log('Exact match not found - checking partial match');
  // Try partial search
  if (content.includes("Logo Mark")) {
    console.log('Found "Logo Mark" in file');
  }
  if (content.includes('drop-shadow(0 0 6px')) {
    console.log('Found drop-shadow filter in file');
  }
}
