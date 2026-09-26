import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

old_finish = """export async function finishMatchesDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
  } catch (error) {
    console.warn("finishMatchesDrawAnimation: Impossibile aggiornare il torneo", error);
  }
}"""

new_finish = """export async function finishMatchesDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${tournamentId}`);
  } catch (error) {
    console.warn("finishMatchesDrawAnimation: Impossibile aggiornare il torneo", error);
  }
}"""

if old_finish in content:
    content = content.replace(old_finish, new_finish)
    print("Patched finishMatchesDrawAnimation")
else:
    print("Could not find finishMatchesDrawAnimation")

old_finish_draw = """export async function finishDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "matches_drawing" }
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
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${tournamentId}`);
  } catch (error) {
    console.warn("finishDrawAnimation: Impossibile aggiornare il torneo (forse è stato eliminato nel frattempo?)", error);
  }
}"""

if old_finish_draw in content:
    content = content.replace(old_finish_draw, new_finish_draw)
    print("Patched finishDrawAnimation")
else:
    print("Could not find finishDrawAnimation")

with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)
