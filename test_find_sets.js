const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const matches = await prisma.match.findMany({
    where: { tournamentId: null, winnerTeamId: { not: null } },
    orderBy: { playedAt: 'desc' }
  });
  console.log("Free matches found:", matches.length);
  if (matches.length > 0) {
    console.log("Sample setScores:", matches[0].setScores);
  }
}
run();
