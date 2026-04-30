const fs = require('fs');

let content = fs.readFileSync('D:\\FitCoach\\src\\app\\page.tsx', 'utf8');

// SVG #1 — navbar logo (width="80" height="32")
const old1 = `<svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 左侧 X */}
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>X</text>
              {/* FIT 居中 */}
              <text x="18" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="22" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              {/* 右侧 X */}
              <text x="66" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>X</text>
            </svg>`;

const new1 = `<svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// SVG #2 — unauthenticated large logo (class="mx-auto mb-6" width="64" height="64")
const old2 = `<svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
              <text x="26" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              <text x="68" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
            </svg>`;

const new2 = `<svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
              <text x="26" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              <text x="46" y="20" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00" transform="rotate(90, 46, 20)">X</text>
            </svg>`;

let changed = false;
if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('✓ SVG #1 (navbar) updated');
  changed = true;
} else {
  console.log('✗ SVG #1 (navbar) not found');
}

if (content.includes(old2)) {
  content = content.replace(old2, new2);
  console.log('✓ SVG #2 (unauthenticated) updated');
  changed = true;
} else {
  console.log('✗ SVG #2 (unauthenticated) not found');
}

if (changed) {
  fs.writeFileSync('D:\\FitCoach\\src\\app\\page.tsx', content, 'utf8');
  console.log('✓ page.tsx saved');
}
