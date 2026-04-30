# -*- coding: utf-8 -*-
content = open(r'D:\FitCoach\src\app\globals.css', 'r', encoding='utf-8').read()

# Find the Google Fonts import line
gfonts_marker = 'fonts.googleapis.com'
gfonts_start = content.find(gfonts_marker)
import_start = content.rfind('@import', 0, gfonts_start)
import_end = content.find(';', gfonts_start) + 1
gfonts_import = content[import_start:import_end]

print('Found Google Fonts import:', repr(gfonts_import[:80]))

# Remove from current location
content = content[:import_start] + content[import_end:]

# Insert Google Fonts before @import tailwindcss
tailwind_marker = '@import "tailwindcss"'
idx = content.find(tailwind_marker)
if idx >= 0:
    content = content[:idx] + gfonts_import + '\n' + content[idx:]
else:
    content = gfonts_import + '\n' + content

open(r'D:\FitCoach\src\app\globals.css', 'w', encoding='utf-8').write(content)
print('Done. First 400 chars:')
print(repr(content[:400]))
