const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

// TOP DEFENDERS
code = code.replace(
  /\{defenderStats\[0\] && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
  ''
);

code = code.replace(
  /\{defenderStats\.slice\(defenderStats\.filter\(\(p: any\) => p\.winRate === defenderStats\[0\]\?\.winRate && p\.wins === defenderStats\[0\]\?\.wins && p\.played === defenderStats\[0\]\?\.played\)\.length\)\.map\(\(p: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ defenderStats\.filter\(\(ps: any\) => ps\.winRate === defenderStats\[0\]\?\.winRate && ps\.wins === defenderStats\[0\]\?\.wins && ps\.played === defenderStats\[0\]\?\.played\)\.length;/,
  '{defenderStats.map((p: any, i: number) => {\n                      const rank = i + 1;'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
