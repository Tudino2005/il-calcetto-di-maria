const fs = require('fs');
let code = fs.readFileSync('src/components/InwardBracket.tsx', 'utf8');

// Replace renderSlimCard to handle TBD gracefully instead of throwing
code = code.replace(
  `              <span className="truncate pr-2">{m.teamAId && tournament.teamNames ? tournament.teamNames[m.teamAId] : (m.teamA ? m.teamA.player1.name : "TBD")}</span>`,
  `              <span className="truncate pr-2 text-slate-400">{m.teamAId && tournament.teamNames ? tournament.teamNames[m.teamAId] : (m.teamA ? m.teamA.player1.name : "IN ATTESA...")}</span>`
);
code = code.replace(
  `              <span className="truncate pr-2">{m.teamBId && tournament.teamNames ? tournament.teamNames[m.teamBId] : (m.teamB ? m.teamB.player1.name : "TBD")}</span>`,
  `              <span className="truncate pr-2 text-slate-400">{m.teamBId && tournament.teamNames ? tournament.teamNames[m.teamBId] : (m.teamB ? m.teamB.player1.name : "IN ATTESA...")}</span>`
);

// Inject mock match creation in LeftNode
code = code.replace(
  `    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;`,
  `    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;

    let displayMatch = match;
    if (!displayMatch && (feeder1?.winnerTeamId || feeder2?.winnerTeamId)) {
       displayMatch = { id: 'mock', teamAId: feeder1?.winnerTeamId, teamBId: feeder2?.winnerTeamId };
    }`
);

// Replace renderSlimCard(match) with renderSlimCard(displayMatch) in LeftNode
code = code.replace(
  `          {renderSlimCard(match)}`,
  `          {renderSlimCard(displayMatch)}`
);

// Do the same for RightNode
code = code.replace(
  `    const feeder1 = prevRound ? prevRound[matchIndex * 2] : null;
    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;`,
  `    const feeder1 = prevRound ? prevRound[matchIndex * 2] : null;
    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;

    let displayMatch = match;
    if (!displayMatch && (feeder1?.winnerTeamId || feeder2?.winnerTeamId)) {
       displayMatch = { id: 'mock', teamAId: feeder1?.winnerTeamId, teamBId: feeder2?.winnerTeamId };
    }`
);
code = code.replace(
  `          {renderSlimCard(match)}`,
  `          {renderSlimCard(displayMatch)}`
);

// Do the same for finalMatch
code = code.replace(
  `  const finalRound = paddedRounds[paddedRounds.length - 1];
  const finalMatch = finalRound ? finalRound[0] : null;`,
  `  const finalRound = paddedRounds[paddedRounds.length - 1];
  let finalMatch = finalRound ? finalRound[0] : null;
  
  if (!finalMatch && paddedRounds.length > 1) {
     const leftFeeder = leftRounds[leftRounds.length - 1]?.[0];
     const rightFeeder = rightRounds[rightRounds.length - 1]?.[0];
     if (leftFeeder?.winnerTeamId || rightFeeder?.winnerTeamId) {
        finalMatch = { id: 'mock', teamAId: leftFeeder?.winnerTeamId, teamBId: rightFeeder?.winnerTeamId };
     }
  }`
);

fs.writeFileSync('src/components/InwardBracket.tsx', code);
