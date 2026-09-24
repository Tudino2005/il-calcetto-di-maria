import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'if \(r === \'portiere\' \|\| r === \'difensore\'\) return <img src=".*?defender_icon_gold\.png".*?>;',
    r'if (r === \'portiere\' || r === \'difensore\') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;',
    content
)

content = re.sub(
    r'if \(r === \'attaccante\'\) return <img src=".*?striker_icon_gold\.png".*?>;',
    r'if (r === \'attaccante\') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;',
    content
)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Fixed leaderboard icons")
