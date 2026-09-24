import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace the player_stats generation
old_gen = """  // Slide for Player Advanced Stats
  if (data.advancedPlayerStats && data.advancedPlayerStats.length > 0) {
    const playersPerPage = 8;
    const pages = Math.ceil(data.advancedPlayerStats.length / playersPerPage);
    for (let p = 0; p < pages; p++) {
      const playersOnPage = Math.min(playersPerPage, data.advancedPlayerStats.length - p * playersPerPage);
      // Give each player 6.3 seconds, plus a small buffer
      const slideDuration = playersOnPage * 6300 + 1000;
      slides.push({ type: "player_stats", duration: slideDuration, page: p });
    }
  }"""

new_gen = """  // Slide for Player Advanced Stats (TOP 3 solo con podio finale)
  if (data.advancedPlayerStats && data.advancedPlayerStats.length > 0) {
    const playersOnPage = Math.min(3, data.advancedPlayerStats.length);
    // 6.3 seconds per player spotlight + 10 seconds for podium
    const slideDuration = playersOnPage * 6300 + 10000;
    slides.push({ type: "player_stats", duration: slideDuration, page: 0 });
  }"""

content = content.replace(old_gen, new_gen)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched slide generation")
