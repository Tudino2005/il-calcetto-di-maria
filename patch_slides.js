const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

// 1. TOP SINGOLI
code = code.replace(
  /\{playerStats\[0\] && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
  ''
);
code = code.replace(
  /\{playerStats\.slice\(playerStats\.filter\(\(p: any\) => p\.points === playerStats\[0\]\?\.points && p\.wins === playerStats\[0\]\?\.wins && p\.winRate === playerStats\[0\]\?\.winRate\)\.length\)\.map\(\(p: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ playerStats\.filter\(\(ps: any\) => ps\.points === playerStats\[0\]\?\.points && ps\.wins === playerStats\[0\]\?\.wins && ps\.winRate === playerStats\[0\]\?\.winRate\)\.length;/,
  '{playerStats.map((p: any, i: number) => {\n                      const rank = i + 1;'
);

// 2. TOP SQUADRE
code = code.replace(
  /\{teamStats\[0\] && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
  ''
);
code = code.replace(
  /\{teamStats\.slice\(teamStats\.filter\(\(t: any\) => t\.points === teamStats\[0\]\?\.points && t\.wins === teamStats\[0\]\?\.wins && t\.winRate === teamStats\[0\]\?\.winRate\)\.length\)\.map\(\(ts: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ teamStats\.filter\(\(t: any\) => t\.points === teamStats\[0\]\?\.points && t\.wins === teamStats\[0\]\?\.wins && t\.winRate === teamStats\[0\]\?\.winRate\)\.length;/,
  '{teamStats.map((ts: any, i: number) => {\n                      const rank = i + 1;'
);

// 3. TOP DEFENDERS
code = code.replace(
  /\{defenders\[0\] && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
  ''
);
code = code.replace(
  /\{defenders\.slice\(defenders\.filter\(\(d: any\) => d\.roleStats\.dfWins === defenders\[0\]\?\.roleStats\.dfWins && \(d\.roleStats\.dfWins \/ d\.roleStats\.dfMatches\) === \(defenders\[0\]\?\.roleStats\.dfWins \/ defenders\[0\]\?\.roleStats\.dfMatches\)\)\.length\)\.map\(\(p: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ defenders\.filter\(\(d: any\) => d\.roleStats\.dfWins === defenders\[0\]\?\.roleStats\.dfWins && \(d\.roleStats\.dfWins \/ d\.roleStats\.dfMatches\) === \(defenders\[0\]\?\.roleStats\.dfWins \/ defenders\[0\]\?\.roleStats\.dfMatches\)\)\.length;/,
  '{defenders.map((p: any, i: number) => {\n                      const rank = i + 1;'
);

// 4. TOP STRIKERS
code = code.replace(
  /\{strikers\[0\] && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
  ''
);
code = code.replace(
  /\{strikers\.slice\(strikers\.filter\(\(s: any\) => s\.roleStats\.stWins === strikers\[0\]\?\.roleStats\.stWins && \(s\.roleStats\.stWins \/ s\.roleStats\.stMatches\) === \(strikers\[0\]\?\.roleStats\.stWins \/ strikers\[0\]\?\.roleStats\.stMatches\)\)\.length\)\.map\(\(p: any, i: number\) => \{[\s\S]*?const rank = i \+ 1 \+ strikers\.filter\(\(s: any\) => s\.roleStats\.stWins === strikers\[0\]\?\.roleStats\.stWins && \(s\.roleStats\.stWins \/ s\.roleStats\.stMatches\) === \(strikers\[0\]\?\.roleStats\.stWins \/ strikers\[0\]\?\.roleStats\.stMatches\)\)\.length;/,
  '{strikers.map((p: any, i: number) => {\n                      const rank = i + 1;'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
