import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_filter_block = """            if (currentSlide.roleFilter === 'defender') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
            } else if (currentSlide.roleFilter === 'striker') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
            }"""

new_filter_block = """            if (currentSlide.roleFilter === 'defender') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
              filteredStats.sort((a: any, b: any) => {
                const wrA = a.roleStats?.gkMatches > 0 ? (a.roleStats.gkWins / a.roleStats.gkMatches) : 0;
                const wrB = b.roleStats?.gkMatches > 0 ? (b.roleStats.gkWins / b.roleStats.gkMatches) : 0;
                if (wrB !== wrA) return wrB - wrA;
                const winsA = a.roleStats?.gkWins || 0;
                const winsB = b.roleStats?.gkWins || 0;
                if (winsB !== winsA) return winsB - winsA;
                return (b.roleStats?.gkMatches || 0) - (a.roleStats?.gkMatches || 0);
              });
            } else if (currentSlide.roleFilter === 'striker') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
              filteredStats.sort((a: any, b: any) => {
                const wrA = a.roleStats?.stMatches > 0 ? (a.roleStats.stWins / a.roleStats.stMatches) : 0;
                const wrB = b.roleStats?.stMatches > 0 ? (b.roleStats.stWins / b.roleStats.stMatches) : 0;
                if (wrB !== wrA) return wrB - wrA;
                const winsA = a.roleStats?.stWins || 0;
                const winsB = b.roleStats?.stWins || 0;
                if (winsB !== winsA) return winsB - winsA;
                return (b.roleStats?.stMatches || 0) - (a.roleStats?.stMatches || 0);
              });
            }"""

content = content.replace(old_filter_block, new_filter_block)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched stats sorting")
