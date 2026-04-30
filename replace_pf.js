const fs = require('fs');

const svgLogo = `<svg width="44" height="44" viewBox="0 0 80 80" fill="none">
              <text x="0" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900" fill="#000">X</text>
              <text x="26" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="44" fontWeight="800" fill="#000">FIT</text>
              <text x="68" y="64" fontFamily="'Space Grotesk', sans-serif" fontSize="56" fontWeight="900" fill="#000">X</text>
            </svg>`;

const files = [
  'D:\\FitCoach\\src\\app\\analytics\\page.tsx',
  'D:\\FitCoach\\src\\app\\history\\page.tsx',
  'D:\\FitCoach\\src\\app\\summary\\page.tsx',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const oldText = `<div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-black"
            style={{ background: '#CCFF00', color: '#000' }}>PF</div>`;
  const newText = `<div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">${svgLogo}</div>`;
  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Updated: ${file.replace('D:\\FitCoach\\src\\app\\', '')}`);
  } else {
    console.log(`✗ Not found in: ${file.replace('D:\\FitCoach\\src\\app\\', '')}`);
  }
});
