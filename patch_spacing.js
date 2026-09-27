const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentLobby.tsx', 'utf8');

// Replace first grid
code = code.replace(
  '<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">',
  '<div className="flex flex-wrap justify-center gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">'
);

// Replace second grid
code = code.replace(
  '<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-4">',
  '<div className="flex flex-wrap justify-center gap-4 mb-4">'
);

// Add w-28 to first grid items
code = code.replace(
  '"cursor-pointer transition-all duration-300 flex flex-col items-center justify-start gap-1 text-center select-none py-2",',
  '"cursor-pointer transition-all duration-300 flex flex-col items-center justify-start gap-1 text-center select-none py-2 w-28",'
);

// Check second grid items (we need to see how they are structured)
fs.writeFileSync('src/components/TournamentLobby.tsx', code);
