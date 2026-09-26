import re

with open('src/app/players/[id]/page.tsx', 'r') as f:
    content = f.read()

# 1. Add import for PlayerHistoryView at the top
if 'import PlayerHistoryView from "@/components/PlayerHistoryView";' not in content:
    content = content.replace('import DeleteButton from "@/components/DeleteButton";', 'import DeleteButton from "@/components/DeleteButton";\nimport PlayerHistoryView from "@/components/PlayerHistoryView";')


# 2. Add partnerRank and teamRank mapping to partnerStats
old_partnerStats = """  const partnerStats = Array.from(partnerMap.values())
    .map(p => ({
      ...p,
      winRate: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0"
    }))
    .sort((a, b) => {"""

new_partnerStats = """  const partnerStats = Array.from(partnerMap.values())
    .map(p => {
      const partnerRank = playerRankMap.get(p.partner.id) || null;
      const teamRank = teamRankMap.get(p.teamId) || null;
      return {
        ...p,
        partnerRank,
        teamRank,
        winRate: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0"
      };
    })
    .sort((a, b) => {"""

content = content.replace(old_partnerStats, new_partnerStats)


# 3. Replace the entire bottom half with <PlayerHistoryView />
section_start = '{/* RIEPILOGO PER COMPAGNO */}'
section_end = '</main>'

if section_start in content:
    idx_start = content.find(section_start)
    idx_end = content.rfind(section_end)
    
    new_bottom = """      <PlayerHistoryView 
        playerId={id} 
        partnerStats={partnerStats} 
        allMatches={allMatches} 
      />
    """
    content = content[:idx_start] + new_bottom + content[idx_end:]


with open('src/app/players/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Patched server component!")
