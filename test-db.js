const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const t = await prisma.tournament.findMany({ select: { id: true, name: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(t);
}
run();
