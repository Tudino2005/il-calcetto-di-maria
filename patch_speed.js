const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  /\(currentSlide\.duration \|\| 12000\) \/ 1000\}/g,
  '(currentSlide.duration || 12000) / 1000 * 0.6}'
);

code = code.replace(
  /\(currentSlide\.duration \|\| 15000\) \/ 1000\}/g,
  '(currentSlide.duration || 15000) / 1000 * 0.6}'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
