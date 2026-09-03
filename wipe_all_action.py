import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

wipe_all_code = """
export async function wipeAllData(pin: string) {
  if (pin !== "MARIA2026") {
    throw new Error("PIN errato!");
  }
  
  // Wipe in correct order due to foreign keys
  await prisma.match.deleteMany({});
  await prisma.groupStanding.deleteMany({});
  await prisma.tournamentGroup.deleteMany({});
  await prisma.tournamentRegistration.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.player.deleteMany({});
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/tournaments");
  revalidatePath("/players");
  revalidatePath("/match");
}
"""

content += "\n" + wipe_all_code

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
