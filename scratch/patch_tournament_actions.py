import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

# Replace finishDrawAnimation to set "matches_drawing" instead of "in_progress"
old_finish_draw = """export async function finishDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
  } catch (error) {
    console.warn("finishDrawAnimation: Impossibile aggiornare il torneo (forse è stato eliminato nel frattempo?)", error);
  }
}"""

new_finish_draw = """export async function finishDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "matches_drawing" }
    });
  } catch (error) {
    console.warn("finishDrawAnimation: Impossibile aggiornare il torneo (forse è stato eliminato nel frattempo?)", error);
  }
}

export async function finishMatchesDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
  } catch (error) {
    console.warn("finishMatchesDrawAnimation: Impossibile aggiornare il torneo", error);
  }
}"""

content = content.replace(old_finish_draw, new_finish_draw)

with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)

print("Patched tournamentActions!")
