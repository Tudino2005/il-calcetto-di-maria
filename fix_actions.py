import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

# 1. Update startTournament signature
content = content.replace(
    'export async function startTournament(tournamentId: string, config?: { teamsPerGroup?: number }) {',
    'export async function startTournament(tournamentId: string, config?: { teamsPerGroup?: number, fixedPairs?: string[][] }) {'
)

# 2. Update logic for coppie_fisse in startTournament
old_logic = """  if (type === "coppie_fisse") {
    // For fixed pairs, we assume players were added in pairs logically, but actually they are just a pool of players.
    // Wait, if it's fixed pairs, they need to select which two players form a team.
    // In our simplified lobby, if they use coppie fisse, they add players and we randomly pair them?
    // The prompt requested a simple logic for now, we'll draw them randomly if they chose coppie fisse but used the lobby to add players.
    // Ideally we should have a UI for pairing, but to unblock we use drawTeamsRandom.
    const teamsToInsert = drawTeamsRandom(players);"""

new_logic = """  if (type === "coppie_fisse") {
    let teamsToInsert: any[] = [];
    if (config?.fixedPairs && config.fixedPairs.length > 0) {
      teamsToInsert = config.fixedPairs.map(pair => {
        return {
          player1: players.find((p: any) => p.id === pair[0]),
          player2: players.find((p: any) => p.id === pair[1])
        };
      });
    } else {
      teamsToInsert = drawTeamsRandom(players);
    }"""
content = content.replace(old_logic, new_logic)

# 3. Update createQuickTournament
old_quick = """  // 3. Generate Bracket & Start
  await startTournament(tournament.id);"""

new_quick = """  const fixedPairsStr = formData.get("fixedPairs") as string;
  let fixedPairs = undefined;
  if (fixedPairsStr) {
    try { fixedPairs = JSON.parse(fixedPairsStr); } catch(e) {}
  }

  // 3. Generate Bracket & Start
  await startTournament(tournament.id, { fixedPairs });"""
content = content.replace(old_quick, new_quick)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
