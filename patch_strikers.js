const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

// TOP STRIKERS
code = code.replace(
  /\{strikerStats\[0\] && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
  ''
);

code = code.replace(
  /\{strikerStats\.slice\(strikerStats\.filter\(\(s: any\) => s\.winRate === strikerStats\[0\]\?\.winRate && s\.wins === strikerStats\[0\]\?\.wins && s\.played === strikerStats\[0\]\?\.played\)\.length\)\.map\(\(p: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ strikerStats\.filter\(\(s: any\) => s\.winRate === strikerStats\[0\]\?\.winRate && s\.wins === strikerStats\[0\]\?\.wins && s\.played === strikerStats\[0\]\?\.played\)\.length;/,
  '{strikerStats.map((p: any, i: number) => {\n                      const rank = i + 1;'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
