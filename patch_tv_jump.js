const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  'const drawSlideIndex = slides.findIndex(s => s.type === "slot_machine");',
  'const drawSlideIndex = slides.findIndex(s => s.type === "slot_machine" || s.type === "matches_draw");'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
