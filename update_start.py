import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Replace all revalidatePath and return in startTournament
pattern = r'    revalidatePath\(`/tournaments/\$\{tournamentId\}`\);\n    return;'
replacement = """    if (type === "sorteggio_ruoli") {
      redirect(`/tournaments/${tournamentId}?draw=true`);
    } else {
      revalidatePath(`/tournaments/${tournamentId}`);
      redirect(`/tournaments/${tournamentId}`);
    }"""

content = re.sub(pattern, replacement, content)

# Replace the final ones
pattern2 = r'  revalidatePath\(`/tournaments/\$\{tournamentId\}`\);\n\}'
replacement2 = """  if (type === "sorteggio_ruoli") {
    redirect(`/tournaments/${tournamentId}?draw=true`);
  } else {
    revalidatePath(`/tournaments/${tournamentId}`);
    redirect(`/tournaments/${tournamentId}`);
  }
}"""
content = re.sub(pattern2, replacement2, content)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
