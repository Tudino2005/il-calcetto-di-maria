const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

code = code.replace(
  'const [maxMatchesPerDay, setMaxMatchesPerDay] = useState<number>(6);',
  'const [maxMatchesPerDay, setMaxMatchesPerDay] = useState<number>(6);\n  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);'
);

// We need to import Settings or ChevronDown for the toggle button.
// Let's check imports first.
fs.writeFileSync('src/components/TournamentForm.tsx', code);
