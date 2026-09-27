const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  /<div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`\$\{\(currentSlide\.duration \|\| 12000\) \/ 1000 \* 0\.6\}s\` }}>\n\s*\{teamStats\.map/g,
  '<div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`${(currentSlide.duration || 12000) / 1000 * 0.6 * (teamStats.length / Math.max(1, playerStats.length))}s\` }}>\n                    {teamStats.map'
);

code = code.replace(
  /<div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`\$\{\(currentSlide\.duration \|\| 12000\) \/ 1000 \* 0\.6\}s\` }}>\n\s*\{defenderStats\.map/g,
  '<div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`${(currentSlide.duration || 12000) / 1000 * 0.6 * (defenderStats.length / Math.max(1, playerStats.length))}s\` }}>\n                    {defenderStats.map'
);

code = code.replace(
  /<div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`\$\{\(currentSlide\.duration \|\| 12000\) \/ 1000 \* 0\.6\}s\` }}>\n\s*\{strikerStats\.map/g,
  '<div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: \`${(currentSlide.duration || 12000) / 1000 * 0.6 * (strikerStats.length / Math.max(1, playerStats.length))}s\` }}>\n                    {strikerStats.map'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
