const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

// Replace format titles
code = code.replace(
  'clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "eliminazione_diretta" ? "text-emerald-400" : "text-slate-300 group-hover:text-white")',
  '"text-sm font-bold tracking-wider block text-right transition-colors text-emerald-400"'
);
code = code.replace(
  'clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "doppia_eliminazione" ? "text-amber-400" : "text-slate-300 group-hover:text-white")',
  '"text-sm font-bold tracking-wider block text-right transition-colors text-amber-400"'
);
code = code.replace(
  'clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "gironi_eliminazione" ? "text-blue-400" : "text-slate-300 group-hover:text-white")',
  '"text-sm font-bold tracking-wider block text-right transition-colors text-blue-400"'
);

// Replace composition titles
code = code.replace(
  'clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "sorteggio_ruoli" ? "text-emerald-400" : "text-slate-300 group-hover:text-white")',
  '"text-sm font-bold tracking-wider block text-right transition-colors text-emerald-400"'
);
code = code.replace(
  'clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "sorteggio_integrale" ? "text-amber-400" : "text-slate-300 group-hover:text-white")',
  '"text-sm font-bold tracking-wider block text-right transition-colors text-amber-400"'
);
code = code.replace(
  'clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "coppie_fisse" ? "text-blue-400" : "text-slate-300 group-hover:text-white")',
  '"text-sm font-bold tracking-wider block text-right transition-colors text-blue-400"'
);

fs.writeFileSync('src/components/TournamentForm.tsx', code);
