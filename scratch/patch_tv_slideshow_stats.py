import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace variables inside the map loop
old_map_start = """                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      
                      const mySpotlightStage = (pageStats.length - 1) - cardIdx;"""

new_map_start = """                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      
                      let displayRank = rank;
                      let displayPlayed = played;
                      let displayWins = wins;
                      let displayWinRate = winRate;
                      let showDefenderBox = true;
                      let showStrikerBox = true;

                      if (currentSlide.roleFilter === 'defender') {
                        displayRank = cardIdx + 1;
                        displayPlayed = roleStats?.gkMatches || 0;
                        displayWins = roleStats?.gkWins || 0;
                        displayWinRate = displayPlayed > 0 ? ((displayWins / displayPlayed) * 100).toFixed(1) : '0.0';
                        showStrikerBox = false;
                      } else if (currentSlide.roleFilter === 'striker') {
                        displayRank = cardIdx + 1;
                        displayPlayed = roleStats?.stMatches || 0;
                        displayWins = roleStats?.stWins || 0;
                        displayWinRate = displayPlayed > 0 ? ((displayWins / displayPlayed) * 100).toFixed(1) : '0.0';
                        showDefenderBox = false;
                      }

                      const mySpotlightStage = (pageStats.length - 1) - cardIdx;"""

content = content.replace(old_map_start, new_map_start)

# Replace `{rank === 1 &&` with `{displayRank === 1 &&`
content = content.replace("{rank === 1 &&", "{displayRank === 1 &&")

# Replace `{rank && <span` with `{displayRank && <span`
content = content.replace("{rank && <span", "{displayRank && <span")
content = content.replace(">{rank}°</span>", ">{displayRank}°</span>")

# Replace `{played}` with `{displayPlayed}`
content = content.replace('<span className="text-xl font-black text-white">{played}</span>', '<span className="text-xl font-black text-white">{displayPlayed}</span>')

# Replace `{wins}` with `{displayWins}`
content = content.replace('<span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{wins}</span>', '<span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{displayWins}</span>')

# Replace `{winRate}%` with `{displayWinRate}%`
content = content.replace('<span className="text-xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{winRate}%</span>', '<span className="text-xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{displayWinRate}%</span>')

# Replace role box rendering
content = content.replace("{roleStats.gkMatches > 0 && (", "{showDefenderBox && roleStats.gkMatches > 0 && (")
content = content.replace("{roleStats.stMatches > 0 && (", "{showStrikerBox && roleStats.stMatches > 0 && (")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched stats rendering")
