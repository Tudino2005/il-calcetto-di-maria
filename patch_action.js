const fs = require('fs');
let code = fs.readFileSync('src/app/actions/tournamentActions.ts', 'utf8');

const oldCode = `export async function finishMatchesDrawAnimation(tournamentId: string) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(\`/tournaments/\${tournamentId}\`);
  } catch (error) {
    console.warn("finishMatchesDrawAnimation: Impossibile aggiornare il torneo", error);
  }
}`;

const newCode = `export async function finishMatchesDrawAnimation(tournamentId: string) {
  try {
    console.log("[SERVER ACTION] finishMatchesDrawAnimation called for:", tournamentId);
    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "in_progress" }
    });
    console.log("[SERVER ACTION] Database updated to in_progress successfully:", updated.id);
    revalidatePath("/");
    revalidatePath("/tournaments");
    revalidatePath(\`/tournaments/\${tournamentId}\`);
  } catch (error) {
    console.error("[SERVER ACTION ERROR] finishMatchesDrawAnimation: Impossibile aggiornare il torneo", error);
  }
}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/app/actions/tournamentActions.ts', code);
