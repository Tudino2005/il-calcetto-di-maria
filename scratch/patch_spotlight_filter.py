import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_filter = """    const toAnimate = rounds.flat().filter(m => !m.winnerTeamId && m.scheduledAt).sort((a, b) => {
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });"""

new_filter = """    const toAnimate = rounds.flat().filter(m => !m.winnerTeamId);"""

if old_filter in content:
    content = content.replace(old_filter, new_filter)
    print("Patched BracketSpotlightManager filter!")
else:
    print("Could not find the filter logic!")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)
