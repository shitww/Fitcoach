const fs = require('fs');

let content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// ============ page.tsx ============

// SVG #1 — navbar (viewBox 0 0 56 32)
const old1 = `<svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 左侧 X */}
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>X</text>
              {/* FIT */}
              <text x="18" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="22" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              {/* 右侧 X — 旋转90° */}
              <text x="38" y="16" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}
                transform="rotate(90, 38, 16)">X</text>
            </svg>`;

const new1 = `<svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>`;

// SVG #2 — unauthenticated large (viewBox 0 0 100 80)
const old2 = `<svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
              <text x="26" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              <text x="46" y="20" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00" transform="rotate(90, 46, 20)">X</text>
            </svg>`;

const new2 = `<svg className="mx-auto mb-6" width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="62" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="44">FIT</tspan><tspan>X</tspan>
              </text>
            </svg>`;

// ============ auth pages ============
const oldAuth = `<svg width="110" height="56" viewBox="0 0 110 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 左侧 X */}
            <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}>X</text>
            {/* FIT */}
            <text x="32" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="40" fontWeight="800"
              fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
            {/* 右侧 X — 旋转90° */}
            <text x="58" y="28" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}
              transform="rotate(90, 58, 28)">X</text>
          </svg>`;

const newAuth = `<svg width="120" height="56" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}>
              <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="40">FIT</tspan><tspan>X</tspan>
            </text>
          </svg>`;

// ============ badge (analytics, history, summary) ============
const oldBadge = `<svg width="44" height="44" viewBox="0 0 60 60" fill="none">
              <text x="0" y="48" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="900" fill="#000">X</text>
              <text x="22" y="48" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="800" fill="#000">FIT</text>
              <text x="38" y="12" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="900" fill="#000"
                transform="rotate(90, 38, 12)">X</text>
            </svg>`;

const newBadge = `<svg width="44" height="44" viewBox="0 0 70 44" fill="none">
              <text x="0" y="36" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="900" fill="#000">
                <tspan>X</tspan><tspan fontWeight="800" fontSize="30">FIT</tspan><tspan>X</tspan>
              </text>
            </svg>`;

let changed = false;

// page.tsx
if (content.includes(old1)) { content = content.replace(old1, new1); console.log('✓ page.tsx SVG #1'); changed = true; }
else { console.log('✗ page.tsx SVG #1 not found'); }

if (content.includes(old2)) { content = content.replace(old2, new2); console.log('✓ page.tsx SVG #2'); changed = true; }
else { console.log('✗ page.tsx SVG #2 not found'); }

if (changed) { fs.writeFileSync('D:\\FitCoach\\src\\app\\page.tsx', content, 'utf8'); }

// auth pages
['D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx',
 'D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes(oldAuth)) {
    c = c.replace(oldAuth, newAuth);
    fs.writeFileSync(f, c, 'utf8');
    console.log(`✓ ${f.split('\\').pop()}`);
  } else {
    console.log(`✗ ${f.split('\\').pop()} not found`);
  }
});

// badge pages
['D:\\FitCoach\\src\\app\\analytics\\page.tsx',
 'D:\\FitCoach\\src\\app\\history\\page.tsx',
 'D:\\FitCoach\\src\\app\\summary\\page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes(oldBadge)) {
    c = c.replace(oldBadge, newBadge);
    fs.writeFileSync(f, c, 'utf8');
    console.log(`✓ ${f.split('\\').pop()}`);
  } else {
    console.log(`✗ ${f.split('\\').pop()} badge not found`);
  }
});
