import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace the text badges with images
old_defender = '<span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>'
new_defender = '<img src="/DefenderIco.jpeg" alt="Defender" className="h-6 w-auto rounded object-contain shadow-sm border border-slate-700/50" />'

old_striker = '<span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>'
new_striker = '<img src="/FoosballStriker.jpeg" alt="Striker" className="h-6 w-auto rounded object-contain shadow-sm border border-slate-700/50" />'

content = content.replace(old_defender, new_defender)
content = content.replace(old_striker, new_striker)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched badges")
