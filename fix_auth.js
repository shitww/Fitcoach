const fs = require('fs');

['D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx',
 'D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  const oldSvg = `<svg width="160" height="56" viewBox="0 0 160 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 左侧 X */}
            <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}>X</text>
            {/* FIT */}
            <text x="32" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="40" fontWeight="800"
              fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
            {/* 右侧 X */}
            <text x="118" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 8px rgba(204,255,0,0.6))' }}>X</text>
          </svg>`;

  const newSvg = `<svg width="110" height="56" viewBox="0 0 110 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  if (content.includes(oldSvg)) {
    content = content.replace(oldSvg, newSvg);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`✓ ${f.split('\\').pop()}`);
  } else {
    console.log(`✗ not found: ${f.split('\\').pop()}`);
  }
});
