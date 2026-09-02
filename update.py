import re

with open("src/app/actions/matchActions.ts", "r") as f:
    content = f.read()

pattern = r'\} else if \(tournament\.format === "doppia_eliminazione"\) \{[\s\S]*?\} else \{'
replacement = """} else if (tournament.format === "doppia_eliminazione") {
    if (!tournament.bracketData) return;
    const bracket = JSON.parse(tournament.bracketData);
    await advanceDoubleElimination(tournament, matchId, winnerTeamId, bracket);
  } else {"""

content = re.sub(pattern, replacement, content)

with open("src/app/actions/matchActions.ts", "w") as f:
    f.write(content)
