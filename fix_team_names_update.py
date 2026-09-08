import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# Insert the generator call right after createdTeams is built.
# Let's find: `if (format === "gironi_eliminazione") {`
injection_point = 'if (format === "gironi_eliminazione") {'
content = content.replace(injection_point, "const teamNamesMap = generateTeamNames(createdTeams);\n\n  " + injection_point)

# Now inject teamNames: teamNamesMap into all three tournament updates inside startTournament.
update1_old = """    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { 
        status: type === "coppie_fisse" ? "in_progress" : "drawing",
        bracketData: JSON.stringify({ wbRounds: [createdMatchIds], lbRounds: [] }) 
      }
    });"""
update1_new = """    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { 
        status: type === "coppie_fisse" ? "in_progress" : "drawing",
        bracketData: JSON.stringify({ wbRounds: [createdMatchIds], lbRounds: [] }),
        teamNames: teamNamesMap
      }
    });"""
content = content.replace(update1_old, update1_new)

update2_old = """    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { 
        status: type === "coppie_fisse" ? "in_progress" : "drawing",
        bracketData: JSON.stringify({ rounds: [createdMatchIds] }) 
      }
    });"""
update2_new = """    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { 
        status: type === "coppie_fisse" ? "in_progress" : "drawing",
        bracketData: JSON.stringify({ rounds: [createdMatchIds] }),
        teamNames: teamNamesMap
      }
    });"""
content = content.replace(update2_old, update2_new)

update3_old = """  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: type === "coppie_fisse" ? "in_progress" : "drawing" }
  });"""
update3_new = """  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { 
      status: type === "coppie_fisse" ? "in_progress" : "drawing",
      teamNames: teamNamesMap 
    }
  });"""
content = content.replace(update3_old, update3_new)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
