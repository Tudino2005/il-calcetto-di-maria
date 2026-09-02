const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all tournament matches...');
  const deletedMatches = await prisma.match.deleteMany({
    where: {
      tournamentId: { not: null }
    }
  });
  console.log(`Deleted ${deletedMatches.count} matches.`);

  console.log('Deleting all tournaments...');
  const deletedTournaments = await prisma.tournament.deleteMany({});
  console.log(`Deleted ${deletedTournaments.count} tournaments.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
