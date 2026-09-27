const fs = require('fs');
let code = fs.readFileSync('src/components/InwardBracket.tsx', 'utf8');

// Fix LeftNode double declaration
code = code.replace(
\`    let displayMatch = match;
    if (!displayMatch && (feeder1?.winnerTeamId || feeder2?.winnerTeamId)) {
       displayMatch = { id: 'mock', teamAId: feeder1?.winnerTeamId, teamBId: feeder2?.winnerTeamId };
    }

    let displayMatch = match;
    if (!displayMatch && (feeder1?.winnerTeamId || feeder2?.winnerTeamId)) {
       displayMatch = { id: 'mock', teamAId: feeder1?.winnerTeamId, teamBId: feeder2?.winnerTeamId };
    }\`,
\`    let displayMatch = match;
    if (!displayMatch && (feeder1?.winnerTeamId || feeder2?.winnerTeamId)) {
       displayMatch = { id: 'mock', teamAId: feeder1?.winnerTeamId, teamBId: feeder2?.winnerTeamId };
    }\`
);

// Fix RightNode missing displayMatch declaration
code = code.replace(
\`  const RightNode = ({ match, roundIndex, matchIndex }: { match: any, roundIndex: number, matchIndex: number }) => {
    if (roundIndex === 0) return renderSlimCard(match);
    const prevRound = rightRounds[roundIndex - 1];
    const feeder1 = prevRound ? prevRound[matchIndex * 2] : null;
    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;
    

    return (\`,
\`  const RightNode = ({ match, roundIndex, matchIndex }: { match: any, roundIndex: number, matchIndex: number }) => {
    if (roundIndex === 0) return renderSlimCard(match);
    const prevRound = rightRounds[roundIndex - 1];
    const feeder1 = prevRound ? prevRound[matchIndex * 2] : null;
    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;

    let displayMatch = match;
    if (!displayMatch && (feeder1?.winnerTeamId || feeder2?.winnerTeamId)) {
       displayMatch = { id: 'mock', teamAId: feeder1?.winnerTeamId, teamBId: feeder2?.winnerTeamId };
    }

    return (\`
);

fs.writeFileSync('src/components/InwardBracket.tsx', code);
