const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  /\{teamStats\.slice\(teamStats\.filter\(\(t: any\) => t\.points === teamStats\[0\]\?\.points && t\.wins === teamStats\[0\]\?\.wins && t\.winRate === teamStats\[0\]\?\.winRate\)\.length\)\.map\(\(t: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ teamStats\.filter\(\(ts: any\) => ts\.points === teamStats\[0\]\?\.points && ts\.wins === teamStats\[0\]\?\.wins && ts\.winRate === teamStats\[0\]\?\.winRate\)\.length;/,
  '{teamStats.map((t: any, i: number) => {\n                      const rank = i + 1;'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
