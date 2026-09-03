import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

wipe_code = """
export async function wipeTournamentData(pin: string) {
  if (pin !== "MARIA2026") {
    throw new Error("PIN errato!");
  }
  
  // Wipe in correct order due to foreign keys
  await prisma.match.deleteMany({});
  await prisma.groupStanding.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.tournamentRegistration.deleteMany({});
  await prisma.tournament.deleteMany({});
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/tournaments");
}
"""

content += "\n" + wipe_code

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
