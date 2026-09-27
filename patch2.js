const fs = require('fs');
let code = fs.readFileSync('src/components/InwardBracket.tsx', 'utf8');

code = code.replace(
  `              <span className="truncate pr-2 text-slate-400">{m.teamAId && tournament.teamNames ? tournament.teamNames[m.teamAId] : (m.teamA ? m.teamA.player1.name : "IN ATTESA...")}</span>`,
  `              <span className={\`truncate pr-2 \${!m.teamAId && !m.teamA ? 'text-slate-500 italic' : 'text-slate-200'}\`}>{m.teamAId && tournament.teamNames ? tournament.teamNames[m.teamAId] : (m.teamA ? m.teamA.player1.name : "IN ATTESA...")}</span>`
);
code = code.replace(
  `              <span className="truncate pr-2 text-slate-400">{m.teamBId && tournament.teamNames ? tournament.teamNames[m.teamBId] : (m.teamB ? m.teamB.player1.name : "IN ATTESA...")}</span>`,
  `              <span className={\`truncate pr-2 \${!m.teamBId && !m.teamB ? 'text-slate-500 italic' : 'text-slate-200'}\`}>{m.teamBId && tournament.teamNames ? tournament.teamNames[m.teamBId] : (m.teamB ? m.teamB.player1.name : "IN ATTESA...")}</span>`
);

fs.writeFileSync('src/components/InwardBracket.tsx', code);
