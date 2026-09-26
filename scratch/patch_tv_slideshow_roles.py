import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# The first block to remove is in the #1 position
block1 = """                                                            {tp.preferredRole && (() => {
                              const r = tp.preferredRole.toLowerCase();
                              if (r === 'portiere' || r === 'difensore') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;
                              if (r === 'attaccante') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;
                              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Jolly</span>;
                              return null;
                            })()}"""

# The second block to remove is in the scrolled list
block2 = """                              {p.preferredRole && (() => {
                              const r = p.preferredRole.toLowerCase();
                              if (r === 'portiere' || r === 'difensore') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;
                              if (r === 'attaccante') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;
                              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Jolly</span>;
                              return null;
                            })()}"""


if block1 in content:
    content = content.replace(block1, '')
else:
    print("Block 1 not found!")

if block2 in content:
    content = content.replace(block2, '')
else:
    print("Block 2 not found!")


with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched!")
