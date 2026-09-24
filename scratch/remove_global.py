import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_marker = '          {currentSlide.type === "leaderboard" && ('
end_marker = '          {currentSlide.type === "leaderboard_roles" && ('

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

global_code = content[start_idx:end_idx]

# We need to remove the IIFEs added to global_code
# 1. The topPlayers block:
# Original: `<div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>`
# Then an IIFE follows.
# We will use regex to remove the IIFE after {tp.name}</div>
global_code = re.sub(
    r'(<div className="text-3xl font-black text-white truncate leading-tight">\{tp\.name\}</div>)\s*\{\(\(\) => \{[^}]+\}\)\(\)\}',
    r'\1',
    global_code,
    flags=re.DOTALL
)

# Wait, the regex [^}]+ stops at the first }. We need a better way.
# Since it's a fixed string that we inserted:
to_remove_1 = """                              {(() => {
                                const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === tp.id);
                                const rStats = advStats?.roleStats;
                                const tSubiti = rStats?.gkGoalsConceded || 0;
                                const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                                return (
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tSubiti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mSubiti}</span>
                                    </div>
                                  </div>
                                );
                              })()}"""
global_code = global_code.replace(to_remove_1, '')

to_remove_2 = """                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === p.id);
                            const rStats = advStats?.roleStats;
                            const tSubiti = rStats?.gkGoalsConceded || 0;
                            const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                  <span className="text-base font-black text-white leading-none">{tSubiti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mSubiti}</span>
                                </div>
                              </div>
                            );
                          })()}"""
global_code = global_code.replace(to_remove_2, '')


# Same for Strikers in the global leaderboard (which was actually TOP COPPIE, but wait! Did I replace it there?)
to_remove_3 = """                              {(() => {
                                const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === tt.id);
                                const rStats = advStats?.roleStats;
                                const tFatti = rStats?.stGoalsScored || 0;
                                const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                                return (
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tFatti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mFatti}</span>
                                    </div>
                                  </div>
                                );
                              })()}"""
global_code = global_code.replace(to_remove_3, '')

to_remove_4 = """                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === t.id);
                            const rStats = advStats?.roleStats;
                            const tFatti = rStats?.stGoalsScored || 0;
                            const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                  <span className="text-base font-black text-white leading-none">{tFatti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mFatti}</span>
                                </div>
                              </div>
                            );
                          })()}"""
global_code = global_code.replace(to_remove_4, '')

# Also revert the width class for top players
global_code = global_code.replace('<div className="flex items-center justify-between gap-3 w-full">', '<div className="flex items-center gap-3">')

content = content[:start_idx] + global_code + content[end_idx:]

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Removed from global leaderboard")
