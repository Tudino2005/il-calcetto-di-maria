const fs = require('fs');
let code = fs.readFileSync('src/app/actions/tournamentActions.ts', 'utf8');

const queryCode = `
  let historicalPairCounts = new Map<string, number>();
  if (tournament.avoidRepeatedPairs) {
    const allTeams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            matchesAsTeamA: true,
            matchesAsTeamB: true
          }
        }
      }
    });
    allTeams.forEach(t => {
      const totalMatches = t._count.matchesAsTeamA + t._count.matchesAsTeamB;
      historicalPairCounts.set(t.uniqueTeamKey, totalMatches);
    });
  }
`;

code = code.replace(
  '  let createdTeams: any[] = [];',
  queryCode + '\n  let createdTeams: any[] = [];'
);

code = code.replace(/drawTeamsRandomBalanced\(players, statMap\)/g, 'drawTeamsRandomBalanced(players, statMap, historicalPairCounts)');
code = code.replace(/drawTeamsRandom\(players\)/g, 'drawTeamsRandom(players, historicalPairCounts)');
code = code.replace(/drawTeamsBalanced\(players, statMap\)/g, 'drawTeamsBalanced(players, statMap, historicalPairCounts)');
code = code.replace(/drawTeams\(players\)/g, 'drawTeams(players, historicalPairCounts)');

fs.writeFileSync('src/app/actions/tournamentActions.ts', code);
