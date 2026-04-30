const fs = require('fs');
let content = fs.readFileSync('D:\\FitCoach\\src\\app\\globals.css', 'utf8');

// 1. Move Google Fonts @import to the top
const gfontsLineStart = content.indexOf("@import url('https://fonts.googleapis.com");
const gfontsLineEnd = content.indexOf("');", gfontsLineStart) + 3;
const gfontsImport = content.substring(gfontsLineStart, gfontsLineEnd);
const withoutGfonts = content.substring(0, gfontsLineStart) + content.substring(gfontsLineEnd);
content = gfontsImport + '\n' + withoutGfonts;

// 2. Replace PEAKFIT -> XFITX
content = content.replace(/PEAKFIT/g, 'XFITX');

// 3. Add XFITX theme variables after @import "tailwindcss"
const tailwindImport = '@import "tailwindcss";';
const xfitxTheme = `
/* =====================================================
   XFITX — Global Theme
   Dark · Neon Green #CCFF00 · #000000 Background
   ===================================================== */

:root {
  --background: #000000;
  --surface: #0a0a0a;
  --surface-2: #111111;
  --border: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.45);
  --text-muted: rgba(255,255,255,0.25);
  --accent: #CCFF00;
  --accent-dim: rgba(204,255,0,0.12);
  --accent-glow: rgba(204,255,0,0.25);
  --danger: #ef4444;
  --success: #22c55e;
  --warning: #f59e0b;
}

/* Glow utilities */
@layer utilities {
  .glow-lime {
    box-shadow: 0 0 20px rgba(204,255,0,0.3), 0 0 60px rgba(204,255,0,0.1);
  }
  .text-glow {
    text-shadow: 0 0 20px rgba(204,255,0,0.5), 0 0 40px rgba(204,255,0,0.2);
  }
  .border-glow {
    box-shadow: inset 0 0 0 1px rgba(204,255,0,0.3), 0 0 20px rgba(204,255,0,0.1);
  }
}

/* Card base style */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 1rem;
}

/* Bottom nav XFITX style */
.bottom-nav {
  background: rgba(0,0,0,0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
}
`;

content = content.replace(tailwindImport, tailwindImport + '\n' + xfitxTheme);

fs.writeFileSync('D:\\FitCoach\\src\\app\\globals.css', content, 'utf8');
console.log('Done. File length:', content.length);
console.log('First 500 chars:', content.substring(0, 500));
