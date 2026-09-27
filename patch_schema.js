const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(
  'isBalancedDraw Boolean                  @default(false)',
  'isBalancedDraw Boolean                  @default(false)\n  avoidRepeatedPairs Boolean              @default(false)'
);

fs.writeFileSync('prisma/schema.prisma', code);
