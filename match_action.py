import re

with open("src/app/actions/matchActions.ts", "r") as f:
    content = f.read()

action = """
export async function startFreeMatch(pairs: string[][]) {
  if (pairs.length !== 2 || pairs[0].length !== 2 || pairs[1].length !== 2) {
    throw new Error("Devi formare esattamente 2 squadre da 2 giocatori.");
  }
  
  const teamA = await createTeam(pairs[0][0], pairs[0][1]);
  const teamB = await createTeam(pairs[1][0], pairs[1][1]);
  
  const match = await createMatch(teamA.id, teamB.id);
  
  return match.id;
}
"""
content += "\n" + action

with open("src/app/actions/matchActions.ts", "w") as f:
    f.write(content)
