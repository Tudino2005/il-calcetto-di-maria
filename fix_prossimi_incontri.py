import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

old_code = """                    {currentSlide.tournament.matches
                      ?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId)
                      .slice(0, 4)"""

new_code = """                    {currentSlide.tournament.matches
                      ?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId)
                      .sort((a: any, b: any) => new Date(a.playedAt || a.createdAt).getTime() - new Date(b.playedAt || b.createdAt).getTime())
                      .slice(0, 4)"""

content = content.replace(old_code, new_code)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

