const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.tournament.findMany({
    where: {
      status: {
        in: ['drawing', 'matches_drawing']
      }
    }
  });
  console.log("Stuck tournaments:", t.map(x => ({id: x.id, name: x.name, status: x.status})));
}
main().catch(console.error).finally(() => prisma.$disconnect());
