import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

pattern = r'(  const \{ playerStats, teamStats \} = await getLeaderboardData\(\);\n\n  const data = \{)'

replacement = """  const recentFreeMatches = await prisma.match.findMany({
    where: { tournamentId: null, winnerTeamId: { not: null } },
    orderBy: { playedAt: 'desc' },
    take: 6,
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } }
    }
  });

  const { playerStats, teamStats } = await getLeaderboardData();

  const data = {"""

content = re.sub(pattern, replacement, content)

# pass recentFreeMatches to data
content = content.replace(
    'completedTournaments,\n    playerStats,',
    'completedTournaments,\n    recentFreeMatches,\n    playerStats,'
)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
