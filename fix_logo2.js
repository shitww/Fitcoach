const fs = require('fs');

// ============================================================
// 1. Navbar logo (page.tsx, width=80 height=32)
// ============================================================
const navbarOld = `<svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 左侧 X */}
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>X</text>
              {/* FIT 居中 */}
              <text x="18" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="22" fontWeight="800"
                fill="#FFFFFF">FIT</text>
              {/* 右侧 X */}
              <text x="62" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>X</text>
            </svg>`;

const navbarNew = `<svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 左侧 X */}
              <text x="0" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>X</text>
              {/* FIT */}
              <text x="18" y="26" fontFamily="'Space Grotesk', sans-serif" fontSize="22" fontWeight="800"
                fill="#FFFFFF">FIT</text>
              {/* 右侧 X — 旋转90° */}
              <text x="38" y="16" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}
                transform="rotate(90, 38, 16)">X</text>
            </svg>`;

// ============================================================
// 2. Unauth large logo (page.tsx, auth pages — width=160 height=56)
// ============================================================
const unauthOld = `<svg width="160" height="56" viewBox="0 0 160 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 左侧 X */}
            <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}>X</text>
            {/* FIT */}
            <text x="32" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="40" fontWeight="800"
              fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
            {/* 右侧 X */}
            <text x="118" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ dropShadow: '0 0 8px rgba(204,255,0,0.6)' }}>X</text>
          </svg>`;

const unauthNew = `<svg width="110" height="56" viewBox="0 0 110 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// ============================================================
// 3. Badge logo (analytics, history, summary — width=44 height=44)
// ============================================================
const badgeOld = `<svg width="44" height="44" viewBox="0 0 80 80" fill="none">
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900" fill="#000">X</text>
              <text x="26" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800" fill="#000">FIT</text>
              <text x="68" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900" fill="#000">X</text>
            </svg>`;

const badgeNew = `<svg width="44" height="44" viewBox="0 0 60 60" fill="none">
              <text x="0" y="48" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="900" fill="#000">X</text>
              <text x="22" y="48" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="800" fill="#000">FIT</text>
              <text x="38" y="12" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="900" fill="#000"
                transform="rotate(90, 38, 12)">X</text>
            </svg>`;

// ============================================================
// Apply
// ============================================================
const replacements = [
  ['D:\\FitCoach\\src\\app\\page.tsx', [navbarOld, navbarNew]],
  ['D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx', [unauthOld, unauthNew]],
  ['D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx', [unauthOld, unauthNew]],
  ['D:\\FitCoach\\src\\app\\analytics\\page.tsx', [badgeOld, badgeNew]],
  ['D:\\FitCoach\\src\\app\\history\\page.tsx', [badgeOld, badgeNew]],
  ['D:\\FitCoach\\src\\app\\summary\\page.tsx', [badgeOld, badgeNew]],
];

replacements.forEach(([file, [oldText, newText]]) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ ${file.split('\\').pop()}`);
  } else {
    console.log(`✗ not found: ${file.split('\\').pop()}`);
  }
});
