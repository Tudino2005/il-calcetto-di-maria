import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.tournament.findFirst({
    where: { format: 'doppia_eliminazione' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(t?.bracketData);
}
main();
