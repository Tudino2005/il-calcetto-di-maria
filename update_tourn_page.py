import re

with open("src/app/tournaments/[id]/page.tsx", "r") as f:
    content = f.read()

# Add import for TournamentLobby
content = content.replace(
    'import DoubleEliminationBracket from "@/components/DoubleEliminationBracket";',
    'import DoubleEliminationBracket from "@/components/DoubleEliminationBracket";\nimport TournamentLobby from "@/components/TournamentLobby";\nimport { prisma } from "@/lib/prisma";'
)

# Render Lobby if status === "setup"
pattern = r'  if \(!tournament\) \{\n    notFound\(\);\n  \}'
replacement = """  if (!tournament) {
    notFound();
  }

  if (tournament.status === "setup") {
    const allPlayers = await prisma.player.findMany({ orderBy: { name: "asc" } });
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-screen">
        <TournamentLobby tournament={tournament} allPlayers={allPlayers} />
      </main>
    );
  }"""

content = re.sub(pattern, replacement, content)

with open("src/app/tournaments/[id]/page.tsx", "w") as f:
    f.write(content)
