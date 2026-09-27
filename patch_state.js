const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

code = code.replace(
  'const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(false);',
  'const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(false);\n  const [avoidRepeatedPairs, setAvoidRepeatedPairs] = useState<boolean>(false);'
);

fs.writeFileSync('src/components/TournamentForm.tsx', code);
