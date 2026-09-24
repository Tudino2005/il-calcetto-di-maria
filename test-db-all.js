const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.player.count();
  const m = await prisma.match.count();
  console.log("Players:", p, "Matches:", m);
}
run();
