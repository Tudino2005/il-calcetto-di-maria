const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  /\{strikerStats\.slice\(strikerStats\.filter\(\(t: any\) => t\.winRate === strikerStats\[0\]\?\.winRate && t\.wins === strikerStats\[0\]\?\.wins && t\.played === strikerStats\[0\]\?\.played\)\.length\)\.map\(\(t: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ strikerStats\.filter\(\(ts: any\) => ts\.winRate === strikerStats\[0\]\?\.winRate && ts\.wins === strikerStats\[0\]\?\.wins && ts\.played === strikerStats\[0\]\?\.played\)\.length;/,
  '{strikerStats.map((t: any, i: number) => {\n                      const rank = i + 1;'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
