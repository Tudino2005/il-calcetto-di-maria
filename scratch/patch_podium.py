import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace pageStats logic
content = content.replace(
    'const page = currentSlide.page || 0;\n            const playersPerPage = 8;\n            const pageStats = data.advancedPlayerStats?.slice(page * playersPerPage, (page + 1) * playersPerPage) || [];',
    'const pageStats = data.advancedPlayerStats?.slice(0, 3) || [];\n            const isPodium = spotlightPlayerIdx !== null && spotlightPlayerIdx >= pageStats.length;'
)

# Replace the title text (remove Pag. X)
content = re.sub(
    r'Fascicolo Giocatori \{data\.advancedPlayerStats\?\.length > playersPerPage && <span className="text-2xl text-slate-500 font-bold ml-2">Pag\. \{page \+ 1\}</span>\}',
    'Fascicolo Giocatori (TOP 3)',
    content
)

# Replace the grid container with a flex container
content = content.replace(
    '<div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">',
    '<div className={`w-full flex justify-center gap-6 transition-all duration-1000 ${isPodium ? "items-end h-[600px] pb-10" : "items-center"}`}>'
)

# Replace the card rendering logic
old_card_logic = """                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      const isSpotlighted = spotlightPlayerIdx === cardIdx;
                      const isDimmed = spotlightPlayerIdx !== null && !isSpotlighted;
                      return (
                        <div
                          key={player.id}
                          className="bg-slate-900 border-2 border-slate-700/80 p-3 rounded-2xl shadow-xl flex flex-col gap-2.5 relative overflow-hidden transition-all duration-500"
                          style={{
                            opacity: isDimmed ? 0.2 : 1,
                            transform: isSpotlighted ? 'scale(1.04)' : 'scale(1)',
                            borderColor: isSpotlighted ? 'rgba(99,102,241,0.8)' : undefined,
                            boxShadow: isSpotlighted ? '0 0 30px rgba(99,102,241,0.3)' : undefined,
                          }}
                        >"""

new_card_logic = """                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      const isSpotlighted = !isPodium && spotlightPlayerIdx === cardIdx;
                      const isDimmed = !isPodium && spotlightPlayerIdx !== null && !isSpotlighted;
                      
                      const podiumOrder = cardIdx === 0 ? 'order-2' : cardIdx === 1 ? 'order-1' : 'order-3';
                      const podiumTransform = cardIdx === 0 ? 'scale(1.15) translateY(-30px)' : cardIdx === 1 ? 'scale(0.95)' : 'scale(0.9) translateY(30px)';
                      const podiumZIndex = cardIdx === 0 ? 30 : cardIdx === 1 ? 20 : 10;
                      
                      return (
                        <div
                          key={player.id}
                          className={`bg-slate-900 border-2 p-3 rounded-2xl flex flex-col gap-2.5 relative overflow-hidden transition-all duration-1000 ${isPodium ? podiumOrder : ''} w-[320px] max-w-full`}
                          style={{
                            opacity: isDimmed ? 0.2 : 1,
                            transform: isPodium ? podiumTransform : (isSpotlighted ? 'scale(1.04)' : 'scale(1)'),
                            borderColor: isPodium ? (cardIdx === 0 ? 'rgba(234,179,8,0.8)' : cardIdx === 1 ? 'rgba(203,213,225,0.8)' : 'rgba(249,115,22,0.8)') : (isSpotlighted ? 'rgba(99,102,241,0.8)' : 'rgba(51,65,85,0.8)'),
                            boxShadow: isPodium && cardIdx === 0 ? '0 0 40px rgba(234,179,8,0.3)' : (isSpotlighted ? '0 0 30px rgba(99,102,241,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.5)'),
                            zIndex: isPodium ? podiumZIndex : 1,
                          }}
                        >"""

content = content.replace(old_card_logic, new_card_logic)

# Replace the spotlight overlay so it doesn't render when isPodium is true
content = content.replace(
    '{spotlightPlayerIdx !== null && pageStats[spotlightPlayerIdx] && (() => {',
    '{!isPodium && spotlightPlayerIdx !== null && pageStats[spotlightPlayerIdx] && (() => {'
)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched podium render logic")
