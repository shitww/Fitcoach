const fs = require('fs');

// Read page.tsx
let content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// Replace the SVG navbar logo with div-based logo
const oldNavbar = `<svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>`;

const newNavbar = `<div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 900, lineHeight: '32px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#CCFF00', textShadow: '0 0 8px rgba(204,255,0,0.6)' }}>X</span>
              <span style={{ color: '#FFFFFF', letterSpacing: '0.05em', fontWeight: 800 }}>FIT</span>
              <span style={{ color: '#CCFF00', textShadow: '0 0 8px rgba(204,255,0,0.6)' }}>X</span>
            </div>`;

if (content.includes(oldNavbar)) {
  content = content.replace(oldNavbar, newNavbar);
  console.log('✓ Navbar logo replaced with div');
} else {
  console.log('✗ Navbar SVG not found. Searching...');
  // Search for the drop-shadow filter
  const idx = content.indexOf("drop-shadow(0 0 6px");
  if (idx >= 0) {
    const start = Math.max(0, idx - 200);
    const end = Math.min(content.length, idx + 200);
    console.log('Context around drop-shadow:', JSON.stringify(content.substring(start, end)));
  }
}

// Replace the large unauthenticated logo SVG
const oldLarge = `<svg width="120" height="56" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}>
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="40">FIT</tspan><tspan>X</tspan>
              </text>
            </svg>`;

const newLarge = `<div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, lineHeight: '56px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#CCFF00', fontSize: 48, textShadow: '0 0 12px rgba(204,255,0,0.6)' }}>X</span>
              <span style={{ color: '#FFFFFF', fontSize: 40, fontWeight: 800, letterSpacing: '0.05em' }}>FIT</span>
              <span style={{ color: '#CCFF00', fontSize: 48, textShadow: '0 0 12px rgba(204,255,0,0.6)' }}>X</span>
            </div>`;

if (content.includes(oldLarge)) {
  content = content.replace(oldLarge, newLarge);
  console.log('✓ Large logo replaced with div');
} else {
  console.log('✗ Large SVG not found');
}

fs.writeFileSync('D:\\FitCoach\\src\\app\\page.tsx', content, 'utf8');
console.log('Done');
