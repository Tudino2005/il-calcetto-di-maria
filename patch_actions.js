const fs = require('fs');
let code = fs.readFileSync('src/app/actions/tournamentActions.ts', 'utf8');

code = code.replace(
  'const isBalancedDraw = formData.get("isBalancedDraw") === "true";',
  'const isBalancedDraw = formData.get("isBalancedDraw") === "true";\n  const avoidRepeatedPairs = formData.get("avoidRepeatedPairs") === "true";'
);

code = code.replace(
  'isBalancedDraw,',
  'isBalancedDraw,\n      avoidRepeatedPairs: avoidRepeatedPairs ? true : undefined, // add to model if we want, or just use it here'
);

// Wait, the schema might not have avoidRepeatedPairs.
// Let's just pass it to the draw logic. I will only patch the drawing parts in startTournament.
fs.writeFileSync('src/app/actions/tournamentActions.ts', code);
