const fs = require('fs');
let code = fs.readFileSync('src/app/actions/tournamentActions.ts', 'utf8');

code = code.replace(
  'isBalancedDraw,',
  'isBalancedDraw,\n      avoidRepeatedPairs,'
);

fs.writeFileSync('src/app/actions/tournamentActions.ts', code);
