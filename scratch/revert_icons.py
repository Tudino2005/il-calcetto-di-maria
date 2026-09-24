import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# 1. Global Leaderboard - Revert to text badges
old_leaderboard_badge_1 = """                              if (r === 'portiere' || r === 'difensore') return <img src="/images/DefenderIco.jpeg" alt="Defender" className="h-7 w-12 rounded-md object-cover shadow-sm border border-slate-600" />;
                              if (r === 'attaccante') return <img src="/images/FoosballStriker.jpeg" alt="Striker" className="h-7 w-12 rounded-md object-cover shadow-sm border border-slate-600" />;"""

new_leaderboard_badge_1 = """                              if (r === 'portiere' || r === 'difensore') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;
                              if (r === 'attaccante') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;"""

content = content.replace(old_leaderboard_badge_1, new_leaderboard_badge_1)

# 2. Player Stats - Revert renderRoleBadge back to formatRole
old_render_role_badge = """            const renderRoleBadge = (role: string) => {
              if (!role) return null;
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return <img src="/images/DefenderIco.jpeg" alt="Defender" className="h-8 w-14 rounded-md object-cover shadow-md border-2 border-slate-600" />;
              if (r === 'attaccante') return <img src="/images/FoosballStriker.jpeg" alt="Striker" className="h-8 w-14 rounded-md object-cover shadow-md border-2 border-slate-600" />;
              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[12px] uppercase shadow-sm">Jolly</span>;
              return <span className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{role}</span>;
            };"""

new_format_role = """            const formatRole = (role: string) => {
              if (!role) return "";
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return 'Defender';
              if (r === 'attaccante') return 'Striker';
              if (r === 'entrambi') return 'Both';
              return role;
            };"""

content = content.replace(old_render_role_badge, new_format_role)

# 3. Player Stats - Revert the JSX usage
content = content.replace(
    '<div className="min-w-0 flex-1">\n                              <div className="flex items-center gap-2">\n                                <h3 className="text-2xl font-black text-white truncate">{player.name}</h3>\n                                {rank && <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex-shrink-0">{rank}°</span>}\n                              </div>\n                              {renderRoleBadge(player.preferredRole)}\n                            </div>',
    '<div className="min-w-0 flex-1">\n                              <div className="flex items-center gap-2">\n                                <h3 className="text-2xl font-black text-white truncate">{player.name}</h3>\n                                {rank && <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex-shrink-0">{rank}°</span>}\n                              </div>\n                              <div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>\n                            </div>'
)

# Alternative regex if exact match fails
import re
content = re.sub(r'\{renderRoleBadge\(player\.preferredRole\)\}', r'<div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>', content)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Reverted icons to text")
