import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Replace all occurrences of status: "in_progress" with status: type === "coppie_fisse" ? "in_progress" : "drawing"
# Wait, let's just do it cleanly using regex

content = re.sub(
    r'status:\s*"in_progress"', 
    'status: type === "coppie_fisse" ? "in_progress" : "drawing"',
    content
)

# Add finishDrawAnimation action
if "export async function finishDrawAnimation" not in content:
    content += """

export async function finishDrawAnimation(tournamentId: string) {
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "in_progress" }
  });
}
"""

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
