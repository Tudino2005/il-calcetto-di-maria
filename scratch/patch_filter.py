import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_start = """  const { playerStats, teamStats, promoTournaments, inProgressTournaments, completedTournaments } = data;
  
  // Build slides array"""

new_start = """  const { playerStats, teamStats, promoTournaments, inProgressTournaments, completedTournaments } = data;
  
  // Filter out players with 0 wins from Sfide Libere
  if (data.freeMatchesStats) {
    data.freeMatchesStats = data.freeMatchesStats.filter((p: any) => p.v > 0);
  }
  
  // Build slides array"""

content = content.replace(old_start, new_start)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched filter")
