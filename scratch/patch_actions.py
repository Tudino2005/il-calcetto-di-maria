import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

# Replace all occurrences of `status: type === "coppie_fisse" ? "in_progress" : "drawing"` with `status: "drawing"`
content = content.replace('status: type === "coppie_fisse" ? "in_progress" : "drawing",', 'status: "drawing",')
content = content.replace('status: type === "coppie_fisse" ? "in_progress" : "drawing"', 'status: "drawing"')

# Replace the redirect blocks:
old_redirect = """    if (type === "sorteggio_ruoli") {
      redirect(`/tournaments/${tournamentId}?draw=true`);
    } else {
      revalidatePath(`/tournaments/${tournamentId}`);
      redirect(`/tournaments/${tournamentId}`);
    }"""

new_redirect = """    redirect(`/tournaments/${tournamentId}?draw=true`);"""

content = content.replace(old_redirect, new_redirect)

# One more case at the bottom:
old_redirect2 = """  if (type === "sorteggio_ruoli") {
    redirect(`/tournaments/${tournamentId}?draw=true`);
  } else {
    revalidatePath(`/tournaments/${tournamentId}`);
    redirect(`/tournaments/${tournamentId}`);
  }"""
  
new_redirect2 = """  redirect(`/tournaments/${tournamentId}?draw=true`);"""
content = content.replace(old_redirect2, new_redirect2)


with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)

print("Patched actions!")
