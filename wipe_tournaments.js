const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning tournaments...");
  
  // Delete all matches that belong to a tournament
  await prisma.match.deleteMany({
    where: { tournamentId: { not: null } }
  });
  
  // Delete all group standings (they only exist inside tournaments)
  await prisma.groupStanding.deleteMany();
  
  // Delete all tournament registrations
  await prisma.tournamentRegistration.deleteMany();
  
  // Delete all tournaments
  const deleted = await prisma.tournament.deleteMany();
  
  console.log(`Deleted ${deleted.count} tournaments successfully.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
