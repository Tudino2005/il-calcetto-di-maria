import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_timer = """  // Advance spotlight to next player every 6 seconds
  useEffect(() => {
    if (spotlightPlayerIdx === null) return;
    const slide = slides[currentIndex < slides.length ? currentIndex : 0];
    if (slide?.type !== 'player_stats') return;
    const page = (slide as any)?.page || 0;
    const pageStats = data.advancedPlayerStats?.slice(page * 8, (page + 1) * 8) || [];
    const timer = setTimeout(() => {
      if (spotlightPlayerIdx < pageStats.length - 1) {
        setSpotlightPlayerIdx(prev => prev !== null ? prev + 1 : null);
      } else {
        setSpotlightPlayerIdx(null);
      }
    }, 6300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightPlayerIdx]);"""

new_timer = """  // Advance spotlight to next player every 6 seconds
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

content = content.replace(old_timer, new_timer)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched timer logic")
