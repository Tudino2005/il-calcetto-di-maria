import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Update slide generation
old_gen = """  // Slide for Player Advanced Stats (TOP 3 solo con podio finale)
  if (data.advancedPlayerStats && data.advancedPlayerStats.length > 0) {
    const playersOnPage = Math.min(3, data.advancedPlayerStats.length);
    // 6.3 seconds per player spotlight + 10 seconds for podium
    const slideDuration = playersOnPage * 6300 + 10000;
    slides.push({ type: "player_stats", duration: slideDuration, page: 0 });
  }"""

new_gen = """  // Slides for Player Advanced Stats (TOP 3 Podiums)
  if (data.advancedPlayerStats && data.advancedPlayerStats.length > 0) {
    // Global
    const globalCount = Math.min(3, data.advancedPlayerStats.length);
    slides.push({ type: "player_stats", duration: globalCount * 6300 + 10000, roleFilter: 'all' });
    
    // Defenders
    const defs = data.advancedPlayerStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
    if (defs.length > 0) {
      slides.push({ type: "player_stats", duration: Math.min(3, defs.length) * 6300 + 10000, roleFilter: 'defender' });
    }
    
    // Strikers
    const strks = data.advancedPlayerStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
    if (strks.length > 0) {
      slides.push({ type: "player_stats", duration: Math.min(3, strks.length) * 6300 + 10000, roleFilter: 'striker' });
    }
  }"""

content = content.replace(old_gen, new_gen)

# Update timer logic
old_timer = """  // Advance spotlight to next player every 6 seconds
  useEffect(() => {
    if (spotlightPlayerIdx === null) return;
    const slide = slides[currentIndex < slides.length ? currentIndex : 0];
    if (slide?.type !== 'player_stats') return;
    const playersOnPage = Math.min(3, data.advancedPlayerStats?.length || 0);
    const timer = setTimeout(() => {
      if (spotlightPlayerIdx < playersOnPage) {
        setSpotlightPlayerIdx(prev => prev !== null ? prev + 1 : null);
      }
    }, 6300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightPlayerIdx]);"""

new_timer = """  // Advance spotlight to next player every 6.3 seconds
  useEffect(() => {
    if (spotlightPlayerIdx === null) return;
    const slide = slides[currentIndex < slides.length ? currentIndex : 0];
    if (slide?.type !== 'player_stats') return;
    
    let filtered = data.advancedPlayerStats || [];
    if (slide.roleFilter === 'defender') {
      filtered = filtered.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
    } else if (slide.roleFilter === 'striker') {
      filtered = filtered.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
    }
    
    const playersOnPage = Math.min(3, filtered.length);
    const timer = setTimeout(() => {
      if (spotlightPlayerIdx < playersOnPage) {
        setSpotlightPlayerIdx(prev => prev !== null ? prev + 1 : null);
      }
    }, 6300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightPlayerIdx]);"""

content = content.replace(old_timer, new_timer)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched slide generation and timer")
