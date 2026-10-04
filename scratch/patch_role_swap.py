import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# Fix Inversione Ruoli
content = content.replace(
    '<div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 max-w-[250px]">',
    '<div className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50">'
)

content = content.replace(
    '<div className="flex flex-col items-end pl-4">',
    '<div className="flex flex-col items-start">'
)

content = content.replace(
    'text-sm font-bold tracking-wider text-slate-300 block text-right',
    'text-sm font-bold tracking-wider text-slate-300 block text-left'
)

content = content.replace(
    'text-[10px] text-slate-400 text-right leading-tight mt-0.5',
    'text-[10px] text-slate-400 text-left leading-tight mt-0.5'
)


with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
