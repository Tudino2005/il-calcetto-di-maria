const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

code = code.replace(
  'formData.append("isBalancedDraw", type === "coppie_fisse" ? "false" : isBalancedDraw.toString());',
  'formData.append("isBalancedDraw", type === "coppie_fisse" ? "false" : isBalancedDraw.toString());\n    formData.append("avoidRepeatedPairs", avoidRepeatedPairs.toString());'
);

fs.writeFileSync('src/components/TournamentForm.tsx', code);
