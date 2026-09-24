import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Update the pageStats data source based on roleFilter
old_render_start = """          {/* PLAYER STATS SLIDE */}
          {currentSlide.type === "player_stats" && (() => {
            const pageStats = data.advancedPlayerStats?.slice(0, 3) || [];"""

new_render_start = """          {/* PLAYER STATS SLIDE */}
          {currentSlide.type === "player_stats" && (() => {
            let filteredStats = data.advancedPlayerStats || [];
            if (currentSlide.roleFilter === 'defender') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
            } else if (currentSlide.roleFilter === 'striker') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
            }
            const pageStats = filteredStats.slice(0, 3);
            
            const titleText = currentSlide.roleFilter === 'defender' ? 'TOP 3 DEFENDER' : currentSlide.roleFilter === 'striker' ? 'TOP 3 STRIKER' : 'TOP 3';
            """

content = content.replace(old_render_start, new_render_start)

# Update the Title to use `titleText`
old_title = """                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center">
                    TOP 3
                  </h2>"""

new_title = """                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center">
                    {titleText}
                  </h2>"""

content = content.replace(old_title, new_title)

# Update mySpotlightStage based on actual pageStats length!
# If length is < 3, the stages need to be adjusted!
# Wait! If pageStats.length == 2, cardIdx goes 0, 1.
# 1st place (0) should appear at stage 1.
# 2nd place (1) should appear at stage 0.
# So mySpotlightStage = (pageStats.length - 1) - cardIdx;
old_spotlight_stage = "const mySpotlightStage = 2 - cardIdx;"
new_spotlight_stage = "const mySpotlightStage = (pageStats.length - 1) - cardIdx;"

content = content.replace(old_spotlight_stage, new_spotlight_stage)

# Also update the podium positions to handle fewer than 3 players (just center them or leave them at 1/2)
old_offsets = """                      const podiumOffsets = [
                        { x: '0px', y: '0px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: '-460px', y: '100px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '160px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];"""

new_offsets = """                      const podiumOffsets = [
                        { x: '0px', y: '0px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: pageStats.length === 2 ? '460px' : '-460px', y: '100px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '160px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];
                      if (pageStats.length === 2 && cardIdx === 1) podiumOffsets[1].x = '-300px';
                      if (pageStats.length === 2 && cardIdx === 0) podiumOffsets[0].x = '300px';
                      // just a slight adjustment if there are only 2 players so they are side by side"""

# Actually, let's keep it simple.
new_offsets = """                      const podiumOffsets = [
                        { x: '0px', y: '0px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: '-460px', y: '100px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '160px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];
                      if (pageStats.length === 2) {
                        podiumOffsets[0].x = '230px';
                        podiumOffsets[1].x = '-230px';
                      }
                      """

content = content.replace(old_offsets, new_offsets)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched render logic")
