const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const regex = /(\{\/\* ─── SEZIONE OPZIONI \(CALENDARIO AUTOMATICO\) ──────────────────────────────── \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>)/;

const match = code.match(regex);
if (match) {
  const section = match[1];
  // Rename
  let newSection = section.replace('Opzioni Calendario', 'Opzioni');
  newSection = newSection.replace('Parametri per la generazione automatica degli orari', 'Impostazioni avanzate del torneo');
  
  // Remove from old location
  code = code.replace(regex, '');
  
  // Insert at top of form
  code = code.replace(
    '<form onSubmit={handleSubmit} className="flex flex-col gap-8">',
    '<form onSubmit={handleSubmit} className="flex flex-col gap-8">\n      ' + newSection + '\n'
  );
  
  fs.writeFileSync('src/components/TournamentForm.tsx', code);
  console.log("Moved successfully.");
} else {
  console.log("Regex not found.");
}
