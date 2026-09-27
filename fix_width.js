const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

code = code.replace(
  '{type !== "coppie_fisse" && (\\n                <>',
  '{type !== "coppie_fisse" && (\\n                <div className="w-full max-w-[250px] flex flex-col items-center">'
);

code = code.replace(
  '                  <div className="flex items-center justify-between w-full max-w-[250px]">',
  '                  <div className="flex items-center justify-between w-full">'
);

code = code.replace(
  '                </>\\n              )}',
  '                </div>\\n              )}'
);

fs.writeFileSync('src/components/TournamentForm.tsx', code);
