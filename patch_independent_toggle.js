const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const regex = /\{isBalancedDraw && \(\s*<div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700\/50">([\s\S]*?)<\/div>\s*\)\}/;

const match = code.match(regex);
if (match) {
  const innerDiv = '<div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50">' + match[1] + '</div>';
  code = code.replace(regex, innerDiv);
  fs.writeFileSync('src/components/TournamentForm.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Regex not found");
}
