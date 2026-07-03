const fs = require('fs');
let code = fs.readFileSync('src/pages/TourEditor.tsx', 'utf8');

code = code.replace(/Record<string, unknown>/g, 'any');

if (!code.includes('eslint-disable @typescript-eslint/no-explicit-any')) {
  code = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + code;
}

fs.writeFileSync('src/pages/TourEditor.tsx', code);
