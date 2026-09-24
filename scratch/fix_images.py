import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Fix leaderboard broken images and improve styling
content = content.replace(
    '<img src="/DefenderIco.jpeg" alt="Defender" className="h-6 w-auto rounded object-contain shadow-sm border border-slate-700/50" />',
    '<img src="/images/DefenderIco.jpeg" alt="Defender" className="h-7 w-12 rounded-md object-cover shadow-sm border border-slate-600" />'
)
content = content.replace(
    '<img src="/FoosballStriker.jpeg" alt="Striker" className="h-6 w-auto rounded object-contain shadow-sm border border-slate-700/50" />',
    '<img src="/images/FoosballStriker.jpeg" alt="Striker" className="h-7 w-12 rounded-md object-cover shadow-sm border border-slate-600" />'
)

# Fix player_stats slide
old_format_role = """            const formatRole = (role: string) => {
              if (!role) return "";
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return 'Defender';
              if (r === 'attaccante') return 'Striker';
              if (r === 'entrambi') return 'Both';
              return role;
            };"""

new_format_role = """            const renderRoleBadge = (role: string) => {
              if (!role) return null;
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return <img src="/images/DefenderIco.jpeg" alt="Defender" className="h-8 w-14 rounded-md object-cover shadow-md border-2 border-slate-600" />;
              if (r === 'attaccante') return <img src="/images/FoosballStriker.jpeg" alt="Striker" className="h-8 w-14 rounded-md object-cover shadow-md border-2 border-slate-600" />;
              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[12px] uppercase shadow-sm">Jolly</span>;
              return <span className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{role}</span>;
            };"""

content = content.replace(old_format_role, new_format_role)
content = content.replace('{formatRole(player.preferredRole)}', '{renderRoleBadge(player.preferredRole)}')

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Fixed images")
