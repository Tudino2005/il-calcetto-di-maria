const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

code = code.replace(
  '{type !== "coppie_fisse" && (\\n                <>',
  '{type !== "coppie_fisse" && (\\n                <div className="w-full max-w-[250px] flex flex-col items-center">'
);

// I will just do it properly
