import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

ironic_names = """const IRONIC_NAMES = [
  "I Cinghiali Zoppi", "I Bradipi Sprint", "I Piedi Storti", "I Pali della Luce", 
  "I Ferri da Stiro", "I Pinguini Sudati", "Le Aquile Cecate", "I Cani Sciolti", 
  "Gli Imbucati", "I Bomber Mancati", "I Disperati", "I Fuoriclasse (a tavola)",
  "I Caciocavalli", "I Tritacarne", "Gli Scappati di Casa", "I Birraioli",
  "I Sempre Al Bar", "Quelli del Campetto", "I Panza e Presenza", "I Galattici (di periferia)",
  "I Tiratori Scelti (bendati)", "I Maghi del Liscio", "Gli Irriducibili (al bar)"
];

function generateTeamNames(teams: any[]) {
  const shuffledNames = [...IRONIC_NAMES].sort(() => Math.random() - 0.5);
  const map: Record<string, string> = {};
  teams.forEach((t, i) => {
    map[t.id] = shuffledNames[i % shuffledNames.length];
  });
  return map;
}"""

content = content.replace('export async function startTournament', ironic_names + '\n\nexport async function startTournament')

old_update = """  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: (type === "coppie_fisse" && format !== "sorteggio_ruoli") ? "in_progress" : "drawing" }
  });"""

new_update = """  const teamNamesMap = generateTeamNames(createdTeams);
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { 
      status: (type === "coppie_fisse" && format !== "sorteggio_ruoli") ? "in_progress" : "drawing",
      teamNames: teamNamesMap
    }
  });"""

content = content.replace(old_update, new_update)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
