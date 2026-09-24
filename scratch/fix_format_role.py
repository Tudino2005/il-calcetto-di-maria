import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace renderRoleBadge with formatRole
content = re.sub(
    r'const renderRoleBadge = \(role: string\) => \{.*?return <span.*?;\n\s*\};',
    '''const formatRole = (role: string) => {
              if (!role) return "";
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return 'Defender';
              if (r === 'attaccante') return 'Striker';
              if (r === 'entrambi') return 'Both';
              return role;
            };''',
    content,
    flags=re.DOTALL
)

# Fix the nested divs in the JSX
content = re.sub(
    r'<div className="text-\[17px\] font-black text-slate-400 uppercase tracking-widest"><div className="text-\[17px\] font-black text-slate-400 uppercase tracking-widest">\{formatRole\(player\.preferredRole\)\}</div></div>',
    r'<div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>',
    content
)

# And in case there's still `{renderRoleBadge...}` somewhere
content = re.sub(
    r'\{renderRoleBadge\(player\.preferredRole\)\}',
    r'<div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>',
    content
)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Fixed formatRole")
