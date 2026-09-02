import re

with open("src/app/tournaments/[id]/page.tsx", "r") as f:
    content = f.read()

pattern = r'\) : tournament\.format === "doppia_eliminazione" \? \([\s\S]*?\) : \('
replacement = """) : tournament.format === "doppia_eliminazione" ? (
        <DoubleEliminationBracket tournament={tournament} />
      ) : ("""

content = re.sub(pattern, replacement, content)

with open("src/app/tournaments/[id]/page.tsx", "w") as f:
    f.write(content)
