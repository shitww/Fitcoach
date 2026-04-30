const fs = require('fs');

const oldLogo = `<svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
              <text x="26" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              <text x="68" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
            </svg>`;

const newLogo = `<svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">X</text>
              <text x="22" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800"
                fill="#FFFFFF" letterSpacing="0.05em">FIT</text>
              <text x="46" y="20" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00" transform="rotate(90, 46, 20)">X</text>
            </svg>`;

const files = [
  'D:\\FitCoach\\src\\app\\page.tsx',
  'D:\\FitCoach\\src\\app\\auth\\signin\\page.tsx',
  'D:\\FitCoach\\src\\app\\auth\\signup\\page.tsx',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(oldLogo)) {
    content = content.replace(oldLogo, newLogo);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ ${file.split('\\').pop()}`);
  } else {
    console.log(`✗ not found: ${file.split('\\').pop()}`);
  }
});
